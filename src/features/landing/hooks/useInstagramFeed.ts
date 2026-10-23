import { useEffect, useState } from 'react'

export type InstagramFeedPost = {
  id: string
  image: string
  alt: string
  postUrl: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  className: string
}

export type InstagramFeedStatus = 'loading' | 'official' | 'empty' | 'unavailable'

type FeedResponse = {
  data?: unknown
  error?: { category?: string; message?: string }
}

function normalizePosts(payload: unknown): InstagramFeedPost[] {
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) return []
  const data = (payload as FeedResponse).data
  if (!Array.isArray(data)) return []

  return data.flatMap((value): InstagramFeedPost[] => {
    if (typeof value !== 'object' || value === null) return []
    const post = value as Record<string, unknown>
    const id = typeof post.id === 'string' ? post.id : ''
    const mediaType = typeof post.media_type === 'string' ? post.media_type.toUpperCase() : ''
    const image = typeof post.media_url === 'string' ? post.media_url : ''
    const postUrl = typeof post.permalink === 'string' ? post.permalink : ''
    if (!id || !image || !['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(mediaType)) return []

    try {
      const mediaUrl = new URL(image)
      const permalink = new URL(postUrl)
      if (mediaUrl.protocol !== 'https:' || mediaUrl.username || mediaUrl.password) return []
      if (permalink.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(permalink.hostname)) return []
    } catch {
      return []
    }

    const caption = typeof post.caption === 'string' ? post.caption.trim() : ''
    return [{
      id,
      image,
      alt: caption ? caption.slice(0, 140) : `Publicação da Zelo no Instagram (${mediaType.toLowerCase()}).`,
      postUrl,
      mediaType: mediaType as InstagramFeedPost['mediaType'],
      className: mediaType === 'VIDEO' ? 'object-center' : '',
    }]
  }).slice(0, 6)
}

export function useInstagramFeed() {
  const [posts, setPosts] = useState<InstagramFeedPost[]>([])
  const [status, setStatus] = useState<InstagramFeedStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadFeed() {
      setStatus('loading')
      setError(null)
      try {
        const response = await fetch('/api/instagram-feed', { signal: controller.signal, headers: { accept: 'application/json' } })
        const payload = await response.json() as FeedResponse
        if (!response.ok) throw new Error(payload.error?.message ?? 'Publicações indisponíveis no momento.')
        const normalizedPosts = normalizePosts(payload)
        setPosts(normalizedPosts)
        setStatus(normalizedPosts.length > 0 ? 'official' : 'empty')
      } catch (feedError) {
        if (!controller.signal.aborted) {
          setPosts([])
          setStatus('unavailable')
          setError(feedError instanceof Error ? feedError.message : 'Publicações indisponíveis no momento.')
        }
      }
    }

    void loadFeed()
    return () => controller.abort()
  }, [])

  return { posts, status, error, source: 'instagram-login' as const }
}
