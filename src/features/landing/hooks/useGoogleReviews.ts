import { useEffect, useRef, useState } from 'react'

export type VerifiedGoogleReview = {
  id: string
  author: string
  rating: number
  comment: string
  dateLabel: string
  sourceUrl: string
  authorUrl?: string
}
export type VerifiedGoogleReviews = {
  source: 'google_business_profile'
  average: number | null
  total: number
  reviews: VerifiedGoogleReview[]
  sourceUrl: string
  reviewActionUrl?: string
}
export type GoogleReviewsStatus = 'loading' | 'verified' | 'empty' | 'unavailable'

function googleUrl(value: unknown, action = false, author = false): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    if ([...url.searchParams.keys()].some(key => /token|secret|auth|key|url|continue/i.test(key))) return false
    const maps = ['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname) && /^\/maps(?:\/|$)/.test(url.pathname)
    const write = ['search.google.com', 'www.google.com'].includes(url.hostname) && url.pathname === '/local/writereview' && !!url.searchParams.get('placeid')
    const shortWrite = url.hostname === 'g.page' && /^\/r\/[A-Za-z0-9_-]+\/review\/?$/.test(url.pathname)
    return author ? maps : action ? write || shortWrite : maps
  } catch { return false }
}

export function normalizeGoogleReviews(value: unknown): VerifiedGoogleReviews | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  if (data.source !== 'google_business_profile' || !googleUrl(data.sourceUrl) || !Array.isArray(data.reviews) ||
    typeof data.total !== 'number' || !Number.isSafeInteger(data.total) || data.total < 0 ||
    !(data.average === null && data.total === 0 || typeof data.average === 'number' && Number.isFinite(data.average) && data.average >= 1 && data.average <= 5)) return null
  if (data.total === 0 ? data.average !== null || data.reviews.length !== 0 : data.reviews.length > 3 || data.reviews.length > data.total) return null
  const reviews = data.reviews.flatMap((value): VerifiedGoogleReview[] => {
    if (!value || typeof value !== 'object') return []
    const review = value as Record<string, unknown>
    if (typeof review.id !== 'string' || !review.id || review.id.length > 256 || typeof review.author !== 'string' || !review.author.trim() || review.author.length > 512 ||
      typeof review.rating !== 'number' || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 ||
      typeof review.comment !== 'string' || review.comment.length > 50000 || typeof review.dateLabel !== 'string' || !review.dateLabel.trim() || review.dateLabel.length > 100 || !googleUrl(review.sourceUrl)) return []
    return [{ id: review.id, author: review.author, rating: review.rating, comment: review.comment,
      dateLabel: review.dateLabel, sourceUrl: review.sourceUrl, ...(googleUrl(review.authorUrl, false, true) ? { authorUrl: review.authorUrl } : {}) }]
  }).slice(0, 3)
  if (reviews.length !== data.reviews.length || new Set(reviews.map(review => review.id)).size !== reviews.length) return null
  return { source: 'google_business_profile', average: data.average as number | null, total: data.total, reviews,
    sourceUrl: data.sourceUrl, ...(googleUrl(data.reviewActionUrl, true) ? { reviewActionUrl: data.reviewActionUrl } : {}) }
}

// Page-memory store: share only the active query, never persist customer content.
type Snapshot = { data: VerifiedGoogleReviews | null; status: GoogleReviewsStatus; retryAt: number; retryable: boolean }
let snapshot: Snapshot = { data: null, status: 'loading', retryAt: 0, retryable: true }
let request: Promise<void> | undefined
let controller: AbortController | undefined
let failures = 0
let abandonTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<(value: Snapshot) => void>()
const publish = (value: Snapshot) => { snapshot = value; listeners.forEach(listener => listener(value)) }
const permanent = new Set(['configuration', 'authentication', 'permission', 'identity', 'verification', 'location', 'origin'])

async function boundedJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('invalid_response')
  let size = 0
  let body = ''
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 262144) throw new Error('invalid_response')
      body += decoder.decode(value, { stream: true })
    }
    return JSON.parse(body + decoder.decode()) as unknown
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

function loadReviews() {
  if (request || !snapshot.retryable || Date.now() < snapshot.retryAt) return
  publish({ ...snapshot, status: 'loading' })
  const current = new AbortController()
  controller = current
  request = (async () => {
    const timeout = setTimeout(() => current.abort(), 10000)
    let retryable = true
    let delay = Math.min(60000, 2000 * 2 ** Math.min(failures, 5))
    try {
      const response = await fetch('/api/google-reviews', { signal: current.signal, cache: 'no-store', redirect: 'error', headers: { accept: 'application/json' } })
      retryable = ![400, 401, 403, 404].includes(response.status)
      if (!response.ok) {
        if (response.status === 429) {
          const header = response.headers.get('retry-after')
          const seconds = header && /^\d+$/.test(header) ? Number(header) * 1000 : header ? Date.parse(header) - Date.now() : 0
          delay = Math.max(60000, Number.isFinite(seconds) ? seconds : 0)
        }
      }
      const raw = await boundedJson(response)
      if (current.signal.aborted) return
      if (response.ok) {
        const data = normalizeGoogleReviews(raw)
        if (data) { failures = 0; publish({ data, status: data.total === 0 ? 'empty' : 'verified', retryAt: 0, retryable: true }); return }
      } else {
        const category = (raw as { error?: { category?: string } } | null)?.error?.category
        retryable = retryable && !permanent.has(category ?? '')
      }
    } catch { /* Never log upstream bodies, credentials or customer content. */ }
    finally { clearTimeout(timeout) }
    if (controller !== current) return
    failures++
    publish({ data: null, status: 'unavailable', retryable, retryAt: Date.now() + delay })
  })().finally(() => { if (controller === current) { request = undefined; controller = undefined } })
}

export function useGoogleReviews(enabled = true) {
  const ref = useRef<HTMLElement>(null)
  const [value, setValue] = useState(snapshot)
  const [clock, setClock] = useState(Date.now())
  useEffect(() => {
    if (!enabled) return
    clearTimeout(abandonTimer)
    let started = false
    const listener = (next: Snapshot) => setValue(next)
    listeners.add(listener)
    setValue(snapshot)
    const load = () => {
      if (started) return
      started = true
      if (snapshot.status === 'loading') loadReviews()
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); load() }
    }, { rootMargin: '400px 0px' }) : null
    if (observer && ref.current) observer.observe(ref.current)
    else load()
    return () => {
      observer?.disconnect(); listeners.delete(listener)
      // Deferred cancellation survives StrictMode's immediate remount.
      abandonTimer = setTimeout(() => {
        if (!listeners.size && controller) {
          controller.abort(); controller = undefined; request = undefined
          snapshot = { data: null, status: 'loading', retryAt: 0, retryable: true }
        }
      }, 0)
    }
  }, [enabled])
  useEffect(() => {
    if (!enabled || value.status !== 'unavailable' || !value.retryable || Date.now() >= value.retryAt) return
    const timer = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [enabled, value.status, value.retryable, value.retryAt, clock])
  const retry = () => { if (enabled && snapshot.status === 'unavailable') loadReviews() }
  return { ref, ...value, retry, retrySeconds: Math.max(0, Math.ceil((value.retryAt - clock) / 1000)) }
}
