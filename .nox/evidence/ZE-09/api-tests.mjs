// Deterministic fixtures only: these tests do NOT establish live Google authorization.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleGoogleReviews } from '../../../functions/api/google-reviews.ts'

const env = {
  GOOGLE_BUSINESS_ACCOUNT_ID: '123', GOOGLE_BUSINESS_LOCATION_ID: '456',
  GOOGLE_BUSINESS_CLIENT_ID: 'TEST_CLIENT', GOOGLE_BUSINESS_CLIENT_SECRET: 'TEST_SECRET',
  GOOGLE_BUSINESS_REFRESH_TOKEN: 'TEST_REFRESH',
}
const sourceUrl = 'https://www.google.com/maps?cid=123'
const reviewActionUrl = 'https://search.google.com/local/writereview?placeid=TEST_PLACE'
const profile = {
  name: 'locations/456', title: 'Zelo Estética Automotiva',
  storefrontAddress: { locality: 'Catalão', administrativeArea: 'GO', addressLines: ['Rua Antônio Horácio Pereira'] },
  phoneNumbers: { primaryPhone: '+55 64 99616-1968' },
  metadata: { mapsUri: sourceUrl, newReviewUri: reviewActionUrl, hasVoiceOfMerchant: true },
}
const review = { reviewId: 'test-review', reviewer: { displayName: 'TEST_AUTHOR' }, starRating: 'THREE', comment: '<script>alert(1)</script> — ótimo & real', updateTime: '2026-10-01T12:00:00Z' }
const payload = { averageRating: 4.2, totalReviewCount: 12, reviews: [review] }
const request = (headers = {}) => new Request('https://zelo.example/api/google-reviews', { headers })

async function run({ configuration = env, location = profile, data = payload, failAt, status = 500, raw, failFetch, headers } = {}) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    assert.equal(init.redirect, 'error')
    assert.ok(init.signal)
    if (failFetch) throw failFetch
    if (calls.length === failAt) return new Response(raw ?? 'TEST_SECRET TEST_REFRESH', { status })
    if (calls.length === 1) return Response.json({ access_token: 'TEST_ACCESS' })
    if (calls.length === 2) return Response.json(location)
    return raw !== undefined ? new Response(raw) : Response.json(data)
  }
  try {
    const response = await handleGoogleReviews(configuration, request(headers))
    const body = await response.json()
    const serialized = JSON.stringify(body)
    assert.doesNotMatch(serialized, /TEST_SECRET|TEST_REFRESH|TEST_ACCESS|TEST_CLIENT/)
    assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0')
    assert.equal(response.headers.get('cloudflare-cdn-cache-control'), 'no-store')
    assert.equal(response.headers.has('access-control-allow-origin'), false)
    return { response, body, calls }
  } finally { globalThis.fetch = original }
}

test('missing/invalid server configuration and origin fail closed without outbound calls', async () => {
  for (const configuration of [{}, { ...env, GOOGLE_BUSINESS_ACCOUNT_ID: '../attack' }, { ...env, GOOGLE_BUSINESS_REFRESH_TOKEN: '' }, { ...env, GOOGLE_BUSINESS_REVIEW_ACTION_URL: 'https://evil.example/review' }, { ...env, GOOGLE_BUSINESS_REVIEWS_URL: 'https://google.com/url?url=https://evil.example' }]) {
    const { response, calls } = await run({ configuration })
    assert.equal(response.status, 503); assert.equal(calls.length, 0)
  }
  const { response, calls } = await run({ headers: { origin: 'https://evil.example' } })
  assert.equal(response.status, 403); assert.equal(calls.length, 0)
})

test('OAuth refresh + authenticated profile + verified reviews, official order and safe projection', async () => {
  const { response, body, calls } = await run()
  assert.equal(response.status, 200); assert.equal(calls.length, 3)
  assert.equal(calls[0].url, 'https://oauth2.googleapis.com/token')
  assert.equal(calls[0].init.body.get('grant_type'), 'refresh_token')
  assert.equal(calls[1].init.headers.authorization, 'Bearer TEST_ACCESS')
  assert.match(calls[2].url, /accounts\/123\/locations\/456\/reviews\?pageSize=3&orderBy=updateTime%20desc/)
  assert.equal(body.source, 'google_business_profile'); assert.equal(body.average, 4.2); assert.equal(body.total, 12)
  assert.equal(body.sourceUrl, sourceUrl); assert.equal(body.reviewActionUrl, reviewActionUrl)
  assert.equal(body.reviews[0].rating, 3); assert.equal(body.reviews[0].comment, review.comment)
  assert.equal(body.reviews[0].sourceUrl, sourceUrl)
})

test('wrong location, phone, locality, title and verification are blocked before reviews', async () => {
  for (const location of [
    { ...profile, name: 'locations/999' }, { ...profile, title: 'Other company' },
    { ...profile, phoneNumbers: { primaryPhone: '1234' } },
    { ...profile, storefrontAddress: { locality: 'Other', administrativeArea: 'GO' } },
    { ...profile, metadata: { ...profile.metadata, hasVoiceOfMerchant: false } },
    { ...profile, metadata: { ...profile.metadata, mapsUri: 'https://evil.example/maps' } },
  ]) {
    const { response, calls } = await run({ location })
    assert.equal(response.status, 502); assert.equal(calls.length, 2)
  }
})

test('mismatched configured review/action URLs cannot redirect to another business', async () => {
  const { response } = await run({ configuration: { ...env, GOOGLE_BUSINESS_REVIEW_ACTION_URL: 'https://search.google.com/local/writereview?placeid=OTHER' } })
  assert.equal(response.status, 502)
})

test('empty official response has no invented score/reviews, absent action remains absent', async () => {
  const { response, body } = await run({ data: { totalReviewCount: 0 }, location: { ...profile, metadata: { ...profile.metadata, newReviewUri: undefined } } })
  assert.equal(response.status, 200); assert.equal(body.average, null); assert.deepEqual(body.reviews, []); assert.equal(body.reviewActionUrl, undefined)
})

test('optional author/comment/avatar absence and long special text remain text', async () => {
  for (const item of [{ ...review, reviewer: {}, comment: undefined }, { ...review, comment: 'á & <b>texto</b>'.repeat(1000) }]) {
    const { response, body } = await run({ data: { ...payload, reviews: [item] } })
    assert.equal(response.status, 200); assert.equal(body.reviews[0].comment, item.comment ?? '')
  }
})

test('invalid ratings/count/date/comment payload and malformed JSON fail closed', async () => {
  for (const data of [
    { ...payload, averageRating: 0 }, { ...payload, averageRating: 6 }, { ...payload, totalReviewCount: -1 },
    { ...payload, totalReviewCount: 1.2 }, { ...payload, reviews: 'invalid' },
    { ...payload, reviews: [{ ...review, updateTime: 'not-a-date' }] },
    { ...payload, reviews: [{ ...review, starRating: 'ZERO' }] },
    { ...payload, reviews: [{ ...review, comment: {} }] }, { ...payload, reviews: [] },
  ]) { assert.equal((await run({ data })).response.status, 502) }
  for (const raw of ['not json', '[]', 'null', 'x'.repeat(262145)]) assert.equal((await run({ raw })).response.status, 502)
})

test('Google 400/401/403/404/429/500 at every stage are sanitized and uncached', async () => {
  for (const status of [400, 401, 403, 404, 429, 500]) for (const failAt of [1, 2, 3]) {
    const { response } = await run({ failAt, status })
    assert.equal(response.status, status === 429 ? 429 : 502)
  }
})

test('network and abort failures are sanitized', async () => {
  for (const failFetch of [new Error('TEST_SECRET'), new DOMException('TEST_REFRESH', 'AbortError')]) {
    assert.equal((await run({ failFetch })).response.status, 502)
  }
})

test('actual overall deadline aborts upstream and returns HTTP504 without leaking errors', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
  })
  // AbortSignal.timeout is unref'ed in Node; keep the test runner alive for its real deadline.
  const keepAlive = setInterval(() => {}, 1000)
  try {
    const response = await handleGoogleReviews(env, request())
    assert.equal(response.status, 504)
    assert.equal((await response.json()).error.category, 'timeout')
  } finally { clearInterval(keepAlive); globalThis.fetch = original }
})
