export type InstagramFeedEnv = {
  INSTAGRAM_API_MODE?: string
  INSTAGRAM_GRAPH_USER_ID?: string
  INSTAGRAM_ACCESS_TOKEN?: string
}

type InstagramMedia = {
  id?: unknown
  caption?: unknown
  media_type?: unknown
  media_url?: unknown
  thumbnail_url?: unknown
  permalink?: unknown
  timestamp?: unknown
  children?: { data?: unknown }
}

const NO_STORE = 'private, no-store, max-age=0'
const SUCCESS_CACHE = 'public, max-age=900, stale-while-revalidate=3600, stale-if-error=3600'
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}'
const REQUEST_TIMEOUT_MS = 8_000

function json(body: unknown, status: number, cacheControl = NO_STORE, extraHeaders?: Record<string, string>) {
  const headers = new Headers(extraHeaders)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', cacheControl)
  return new Response(JSON.stringify(body), { status, headers })
}

function safeHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 4_096) return undefined
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return undefined
    for (const key of [...url.searchParams.keys()]) {
      if (/(?:access.?token|token|auth|secret)/i.test(key)) url.searchParams.delete(key)
    }
    url.hash = ''
    return url.toString()
  } catch {
    return undefined
  }
}

function safePermalink(value: unknown): string | undefined {
  const safe = safeHttpsUrl(value)
  if (!safe) return undefined
  const url = new URL(safe)
  if (!['instagram.com', 'www.instagram.com'].includes(url.hostname)) return undefined
  if (!/^\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return undefined
  return `https://www.instagram.com${url.pathname}`
}

function normalizePost(item: unknown) {
  if (typeof item !== 'object' || item === null) return null
  const post = item as InstagramMedia
  const id = typeof post.id === 'string' && post.id.length <= 128 ? post.id : ''
  const mediaType = typeof post.media_type === 'string' ? post.media_type.toUpperCase() : ''
  const permalink = safePermalink(post.permalink)
  if (!id || !permalink || !['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(mediaType)) return null

  const image = mediaType === 'VIDEO'
    ? safeHttpsUrl(post.thumbnail_url)
    : safeHttpsUrl(post.media_url) ?? safeHttpsUrl(post.thumbnail_url) ?? firstChildImage(post.children)
  if (!image) return null

  const caption = typeof post.caption === 'string' ? post.caption.slice(0, 500) : undefined
  const timestamp = typeof post.timestamp === 'string' && !Number.isNaN(Date.parse(post.timestamp))
    ? new Date(post.timestamp).toISOString()
    : undefined
  return {
    id,
    media_type: mediaType,
    media_url: image,
    ...(mediaType === 'VIDEO' ? { thumbnail_url: image } : {}),
    permalink,
    ...(caption ? { caption } : {}),
    ...(timestamp ? { timestamp } : {}),
  }
}

function firstChildImage(children: InstagramMedia['children']): string | undefined {
  const data = children?.data
  if (!Array.isArray(data)) return undefined
  for (const child of data) {
    if (typeof child !== 'object' || child === null) continue
    const media = child as InstagramMedia
    const type = typeof media.media_type === 'string' ? media.media_type.toUpperCase() : ''
    const image = type === 'VIDEO'
      ? safeHttpsUrl(media.thumbnail_url)
      : safeHttpsUrl(media.media_url) ?? safeHttpsUrl(media.thumbnail_url)
    if (image) return image
  }
  return undefined
}

function retryAfterSeconds(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isInteger(seconds) && seconds >= 0) return Math.min(seconds, 86_400)
  const date = Date.parse(value)
  if (Number.isNaN(date)) return undefined
  return Math.max(0, Math.min(Math.ceil((date - Date.now()) / 1_000), 86_400))
}

export async function handleInstagramFeed(env: InstagramFeedEnv, signal?: AbortSignal): Promise<Response> {
  if (env.INSTAGRAM_API_MODE?.trim() !== 'instagram-login') {
    return json({ error: { category: 'configuration', message: 'Instagram feed is unavailable.' } }, 503)
  }

  const userId = env.INSTAGRAM_GRAPH_USER_ID?.trim()
  const accessToken = env.INSTAGRAM_ACCESS_TOKEN?.trim()
  if (!userId || !/^\d{1,32}$/.test(userId) || !accessToken) {
    return json({ error: { category: 'configuration', message: 'Instagram feed is unavailable.' } }, 503)
  }

  const upstreamUrl = new URL(`https://graph.instagram.com/${userId}/media`)
  upstreamUrl.searchParams.set('fields', FIELDS)
  upstreamUrl.searchParams.set('limit', '9')
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { accept: 'application/json', authorization: `Bearer ${accessToken}` },
      signal: requestSignal,
    })

    if (upstream.status === 429) {
      const retry = retryAfterSeconds(upstream.headers.get('retry-after'))
      return json(
        { error: { category: 'rate_limited', message: 'Instagram feed is temporarily unavailable.', ...(retry !== undefined ? { retryAfterSeconds: retry } : {}) } },
        429,
        NO_STORE,
        retry !== undefined ? { 'retry-after': String(retry) } : undefined,
      )
    }

    if (!upstream.ok) {
      let category = 'upstream'
      if (upstream.status === 401 || upstream.status === 403) category = 'authentication'
      else if (upstream.status === 400) {
        try {
          const body = await upstream.json() as { error?: { code?: unknown } }
          if (body.error?.code === 190 || body.error?.code === '190') category = 'authentication'
        } catch { /* Return a sanitized category when the upstream body is malformed. */ }
      }
      return json({ error: { category, message: 'Instagram feed is temporarily unavailable.' } }, 502)
    }

    let body: { data?: unknown }
    try {
      body = await upstream.json() as { data?: unknown }
    } catch {
      return json({ error: { category: 'upstream', message: 'Instagram feed is temporarily unavailable.' } }, 502)
    }
    const data = Array.isArray(body.data)
      ? body.data.map(normalizePost).filter((post) => post !== null).slice(0, 6)
      : []
    return json({ data }, 200, NO_STORE, { 'cloudflare-cdn-cache-control': SUCCESS_CACHE })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    return json({ error: { category: timedOut ? 'timeout' : 'unavailable', message: 'Instagram feed is temporarily unavailable.' } }, timedOut ? 504 : 502)
  }
}
