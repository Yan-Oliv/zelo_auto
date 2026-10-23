import assert from 'node:assert/strict'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const { handleInstagramFeed } = await import(
  pathToFileURL(`${process.cwd()}/functions/api/_instagram-feed.ts`)
)

const env = {
  INSTAGRAM_API_MODE: 'instagram-login',
  INSTAGRAM_GRAPH_USER_ID: '123456',
  INSTAGRAM_ACCESS_TOKEN: 'TEST_TOKEN',
}

test('Instagram feed fails closed and returns sanitized, cached media with retry guidance', async () => {
  const originalFetch = globalThis.fetch
  try {
    let fetchCalled = false
    globalThis.fetch = async () => {
      fetchCalled = true
      throw new Error('fetch must not run without explicit mode')
    }
    const unconfigured = await handleInstagramFeed({ ...env, INSTAGRAM_API_MODE: undefined })
    assert.equal(unconfigured.status, 503)
    assert.equal(unconfigured.headers.get('cache-control'), 'private, no-store, max-age=0')
    assert.equal(unconfigured.headers.has('cloudflare-cdn-cache-control'), false)
    assert.equal(fetchCalled, false)

    let requestedUrl
    let requestHeaders
    globalThis.fetch = async (url, init) => {
      requestedUrl = new URL(url)
      requestHeaders = new Headers(init.headers)
      return Response.json({
        data: [
          { id: 'invalid', media_type: 'IMAGE', media_url: 'http://unsafe.example/a.jpg', permalink: 'https://instagram.com/p/NOPE/' },
          { id: 'post-1', media_type: 'IMAGE', media_url: 'https://cdn.example/photo.jpg?access_token=LEAK#secret', permalink: 'https://instagram.com/p/ABC123/', caption: 'caption', secret_field: 'omit' },
          { id: 'post-2', media_type: 'CAROUSEL_ALBUM', permalink: 'https://www.instagram.com/p/ALBUM/', children: { data: [{ media_type: 'IMAGE', media_url: 'https://cdn.example/cover.jpg' }, { media_type: 'VIDEO', thumbnail_url: 'https://cdn.example/video-cover.jpg' }] } },
          { id: 'post-3', media_type: 'VIDEO', media_url: 'https://cdn.example/video.mp4', thumbnail_url: 'https://cdn.example/video.jpg', permalink: 'https://www.instagram.com/reel/VID123/' },
          ...Array.from({ length: 6 }, (_, index) => ({ id: `post-${index + 4}`, media_type: 'IMAGE', media_url: `https://cdn.example/${index}.jpg`, permalink: `https://www.instagram.com/p/POST${index}/` })),
        ],
      })
    }
    const success = await handleInstagramFeed(env)
    const body = await success.json()
    assert.equal(success.status, 200)
    assert.equal(success.headers.get('cache-control'), 'private, no-store, max-age=0')
    assert.equal(success.headers.get('cloudflare-cdn-cache-control'), 'public, max-age=900, stale-while-revalidate=3600, stale-if-error=3600')
    assert.equal(requestedUrl.hostname, 'graph.instagram.com')
    assert.equal(requestedUrl.searchParams.get('limit'), '9')
    assert.equal(requestedUrl.searchParams.has('access_token'), false)
    assert.equal(requestHeaders.get('authorization'), 'Bearer TEST_TOKEN')
    assert.equal(body.data.length, 6)
    assert.deepEqual(Object.keys(body.data[0]).sort(), ['caption', 'id', 'media_type', 'media_url', 'permalink'])
    assert.equal(body.data[0].permalink, 'https://www.instagram.com/p/ABC123/')
    assert.equal(new URL(body.data[0].media_url).search, '')
    assert.equal(new URL(body.data[0].media_url).hash, '')
    assert.equal(body.data[1].media_type, 'CAROUSEL_ALBUM')
    assert.equal(body.data[1].media_url, 'https://cdn.example/cover.jpg')
    assert.equal(body.data[2].media_url, 'https://cdn.example/video.jpg')
    assert.equal(body.data[2].thumbnail_url, 'https://cdn.example/video.jpg')

    globalThis.fetch = async () => Response.json(
      { error: { code: 190, message: 'TEST_TOKEN must not leak' } },
      { status: 400 },
    )
    const auth = await handleInstagramFeed(env)
    const authBody = await auth.text()
    assert.equal(auth.status, 502)
    assert.equal(auth.headers.get('cache-control'), 'private, no-store, max-age=0')
    assert.equal(auth.headers.has('cloudflare-cdn-cache-control'), false)
    assert.match(authBody, /authentication/)
    assert.doesNotMatch(authBody, /TEST_TOKEN|must not leak/)

    globalThis.fetch = async () => Response.json({}, { status: 429, headers: { 'retry-after': '17' } })
    const limited = await handleInstagramFeed(env)
    assert.equal(limited.status, 429)
    assert.equal(limited.headers.get('retry-after'), '17')
    assert.equal(limited.headers.get('cache-control'), 'private, no-store, max-age=0')
    assert.equal(limited.headers.has('cloudflare-cdn-cache-control'), false)
  } finally {
    globalThis.fetch = originalFetch
  }
})
