/** Owner-authorized Google Business Profile only. No Places billing or content cache. */
export type GoogleReviewsEnv = {
  GOOGLE_BUSINESS_ACCOUNT_ID?: string
  GOOGLE_BUSINESS_LOCATION_ID?: string
  GOOGLE_BUSINESS_CLIENT_ID?: string
  GOOGLE_BUSINESS_CLIENT_SECRET?: string
  GOOGLE_BUSINESS_REFRESH_TOKEN?: string
  GOOGLE_BUSINESS_REVIEWS_URL?: string
  GOOGLE_BUSINESS_REVIEW_ACTION_URL?: string
}

type Json = Record<string, unknown>
const object = (value: unknown): Json => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Json : {}
const text = (value: unknown) => typeof value === 'string' ? value : ''
const normalized = (value: unknown) => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const stars: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

function json(body: unknown, status = 200, retryAfter?: string) {
  return Response.json(body, { status, headers: {
    'cache-control': 'private, no-store, max-age=0',
    'cdn-cache-control': 'no-store',
    'cloudflare-cdn-cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...(retryAfter ? { 'retry-after': retryAfter } : {}),
  } })
}

class UpstreamError extends Error {
  status: number
  category: string
  retryAfter?: string
  constructor(status: number, category: string, retryAfter?: string) {
    super(category)
    this.status = status
    this.category = category
    this.retryAfter = retryAfter
  }
}

/** Full Google Maps URLs only; arbitrary Google redirect/search links are rejected. */
function googleUrl(value: unknown, action = false): string | undefined {
  if (!text(value) || text(value).length > 2048) return undefined
  try {
    const url = new URL(text(value))
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined
    const maps = ['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname) && /^\/maps(?:\/|$)/.test(url.pathname)
    const write = ['search.google.com', 'www.google.com'].includes(url.hostname) && url.pathname === '/local/writereview' && !!url.searchParams.get('placeid')
    const shortWrite = url.hostname === 'g.page' && /^\/r\/[A-Za-z0-9_-]+\/review\/?$/.test(url.pathname)
    if (action ? !write && !shortWrite : !maps) return undefined
    if ([...url.searchParams.keys()].some(key => /token|secret|auth|key|url|continue/i.test(key))) return undefined
    url.hash = ''
    return url.href
  } catch { return undefined }
}

async function readJson(response: Response): Promise<Json> {
  // Bound untrusted upstream bodies rather than buffering arbitrarily large content.
  const reader = response.body?.getReader()
  if (!reader) throw new UpstreamError(502, 'invalid_response')
  const decoder = new TextDecoder()
  let body = '', size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 262144) throw new UpstreamError(502, 'invalid_response')
      body += decoder.decode(value, { stream: true })
    }
    body += decoder.decode()
    const value: unknown = JSON.parse(body)
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('shape')
    return value as Json
  } catch (error) {
    if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) throw error
    throw new UpstreamError(502, 'invalid_response')
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

async function upstream(url: string, init: RequestInit): Promise<Json> {
  const response = await fetch(url, { ...init, redirect: 'error' })
  if (!response.ok) {
    await response.body?.cancel()
    throw new UpstreamError(response.status === 429 ? 429 : 502,
      response.status === 429 ? 'rate_limited' : [400, 401].includes(response.status) ? 'authentication' : response.status === 403 ? 'permission' : response.status === 404 ? 'location' : 'upstream', response.status === 429 ? response.headers.get('retry-after') || '60' : undefined)
  }
  return readJson(response)
}

export async function handleGoogleReviews(env: GoogleReviewsEnv, request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: { category: 'origin', message: 'Solicitação não permitida.' } }, 403)
  const account = env.GOOGLE_BUSINESS_ACCOUNT_ID?.trim()
  const location = env.GOOGLE_BUSINESS_LOCATION_ID?.trim()
  const clientId = env.GOOGLE_BUSINESS_CLIENT_ID?.trim()
  const clientSecret = env.GOOGLE_BUSINESS_CLIENT_SECRET?.trim()
  const refreshToken = env.GOOGLE_BUSINESS_REFRESH_TOKEN?.trim()
  if (!account || !/^\d{1,32}$/.test(account) || !location || !/^\d{1,32}$/.test(location) || !clientId || !clientSecret || !refreshToken) return json({ error: { category: 'configuration', message: 'Avaliações indisponíveis no momento.' } }, 503)
  if ((env.GOOGLE_BUSINESS_REVIEWS_URL && !googleUrl(env.GOOGLE_BUSINESS_REVIEWS_URL)) || (env.GOOGLE_BUSINESS_REVIEW_ACTION_URL && !googleUrl(env.GOOGLE_BUSINESS_REVIEW_ACTION_URL, true))) return json({ error: { category: 'configuration', message: 'Avaliações indisponíveis no momento.' } }, 503)
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(8000)])
  try {
    const token = await upstream('https://oauth2.googleapis.com/token', {
      method: 'POST', signal,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
    })
    if (!text(token.access_token) || /[\r\n]/.test(text(token.access_token))) throw new UpstreamError(502, 'authentication')
    const headers = { authorization: `Bearer ${token.access_token}`, accept: 'application/json' }
    const profile = await upstream(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${location}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,metadata`, { headers, signal })
    const address = object(profile.storefrontAddress)
    const phone = text(object(profile.phoneNumbers).primaryPhone).replace(/\D/g, '')
    const streetMatches = Array.isArray(address.addressLines) && address.addressLines.some(line => /antonio\s+horacio\s+pereira/.test(normalized(line)))
    const websiteMatches = /^https:\/\/zelo\.omnyatech\.com\.br\/?$/.test(text(profile.websiteUri))
    // Fail closed for similarly named businesses. Divergent business facts need owner reconciliation.
    if (profile.name !== `locations/${location}` || !/\bzelo\b/.test(normalized(profile.title)) || normalized(address.locality) !== 'catalao' || address.administrativeArea !== 'GO' || !['64996161968', '5564996161968'].includes(phone) || !streetMatches && !websiteMatches) throw new UpstreamError(502, 'identity')
    const metadata = object(profile.metadata)
    if (metadata.hasVoiceOfMerchant !== true) throw new UpstreamError(502, 'verification')
    const sourceUrl = googleUrl(metadata.mapsUri)
    const reviewActionUrl = googleUrl(metadata.newReviewUri, true)
    // Use Google's authenticated resource links, never trust an unrelated configured destination.
    if (!sourceUrl || (env.GOOGLE_BUSINESS_REVIEWS_URL && googleUrl(env.GOOGLE_BUSINESS_REVIEWS_URL) !== sourceUrl) || (env.GOOGLE_BUSINESS_REVIEW_ACTION_URL && googleUrl(env.GOOGLE_BUSINESS_REVIEW_ACTION_URL, true) !== reviewActionUrl)) throw new UpstreamError(502, 'identity')
    const body = await upstream(`https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews?pageSize=3&orderBy=updateTime%20desc`, { headers, signal })
    const total = body.totalReviewCount ?? 0
    if (!Number.isSafeInteger(total) || Number(total) < 0 || (body.reviews !== undefined && !Array.isArray(body.reviews))) throw new UpstreamError(502, 'invalid_response')
    const average = Number(total) === 0 ? null : body.averageRating
    if (Number(total) > 0 && (typeof average !== 'number' || !Number.isFinite(average) || average < 1 || average > 5)) throw new UpstreamError(502, 'invalid_response')
    const reviews = (Array.isArray(body.reviews) ? body.reviews : []).slice(0, 3).map((value: unknown) => {
      const review = object(value), reviewer = object(review.reviewer)
      const id = text(review.reviewId), rating = stars[text(review.starRating)]
      const date = text(review.updateTime) || text(review.createTime)
      if (!id || id.length > 256 || text(reviewer.displayName).length > 512 || text(review.comment).length > 50000 || !rating || !date || Number.isNaN(Date.parse(date)) || typeof review.comment !== 'undefined' && typeof review.comment !== 'string') throw new UpstreamError(502, 'invalid_response')
      return {
        id, author: text(reviewer.displayName) || 'Usuário do Google', rating,
        comment: text(review.comment),
        dateLabel: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date)),
        sourceUrl,
      }
    })
    if (reviews.length > Number(total) || new Set(reviews.map(review => review.id)).size !== reviews.length) throw new UpstreamError(502, 'invalid_response')
    return json({ source: 'google_business_profile', average, total, reviews, sourceUrl, ...(reviewActionUrl ? { reviewActionUrl } : {}) })
  } catch (error) {
    const timeout = signal.aborted && !request.signal.aborted
    return json({ error: { category: timeout ? 'timeout' : error instanceof UpstreamError ? error.category : 'unavailable', message: 'Avaliações indisponíveis no momento.' } }, timeout ? 504 : error instanceof UpstreamError ? error.status : 502, error instanceof UpstreamError ? error.retryAfter : undefined)
  }
}

export const onRequestGet = ({ env, request }: { env: GoogleReviewsEnv; request: Request }) => handleGoogleReviews(env, request)
