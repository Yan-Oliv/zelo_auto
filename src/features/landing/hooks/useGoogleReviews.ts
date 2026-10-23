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
  if (data.total === 0 ? data.average !== null || data.reviews.length !== 0 : data.reviews.length < 1 || data.reviews.length > 3 || data.reviews.length > data.total) return null
  const reviews = data.reviews.flatMap((value): VerifiedGoogleReview[] => {
    if (!value || typeof value !== 'object') return []
    const review = value as Record<string, unknown>
    if (typeof review.id !== 'string' || !review.id || typeof review.author !== 'string' || !review.author.trim() ||
      typeof review.rating !== 'number' || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 ||
      typeof review.comment !== 'string' || typeof review.dateLabel !== 'string' || !googleUrl(review.sourceUrl)) return []
    return [{ id: review.id, author: review.author, rating: review.rating, comment: review.comment,
      dateLabel: review.dateLabel, sourceUrl: review.sourceUrl, ...(googleUrl(review.authorUrl, false, true) ? { authorUrl: review.authorUrl } : {}) }]
  }).slice(0, 3)
  if (reviews.length !== data.reviews.length) return null
  return { source: 'google_business_profile', average: data.average as number | null, total: data.total, reviews,
    sourceUrl: data.sourceUrl, ...(googleUrl(data.reviewActionUrl, true) ? { reviewActionUrl: data.reviewActionUrl } : {}) }
}

// Deduplicate StrictMode mounts and repeat visits without storing customer data on disk.
let request: Promise<VerifiedGoogleReviews | null> | undefined
function loadReviews() {
  request ??= (async () => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('/api/google-reviews', { signal: controller.signal, headers: { accept: 'application/json' } })
      return response.ok ? normalizeGoogleReviews(await response.json()) : null
    } catch { return null } finally { window.clearTimeout(timeout) }
  })()
  return request
}

export function useGoogleReviews(enabled = true) {
  const ref = useRef<HTMLElement>(null)
  const [data, setData] = useState<VerifiedGoogleReviews | null>(null)
  const [status, setStatus] = useState<GoogleReviewsStatus>('loading')
  useEffect(() => {
    if (!enabled) return
    let active = true
    let started = false
    const load = () => {
      if (started) return
      started = true
      void loadReviews().then(result => {
        if (!active) return
        setData(result)
        setStatus(!result ? 'unavailable' : result.total === 0 ? 'empty' : 'verified')
      })
    }
    if (!('IntersectionObserver' in window)) load()
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); load() }
    }, { rootMargin: '400px 0px' }) : null
    if (ref.current) observer?.observe(ref.current)
    return () => { active = false; observer?.disconnect() }
  }, [enabled])
  return { ref, data, status }
}
