import { useEffect, useState } from 'react'
import { siteConfig } from '../data/site'

export type InstagramFeedPost = {
  id: string
  image: string
  alt: string
  postUrl: string
  className: string
}

type RawInstagramPost = {
  id?: string
  caption?: string
  media_url?: string
  mediaUrl?: string
  thumbnail_url?: string
  thumbnailUrl?: string
  permalink?: string
  postUrl?: string
  media_type?: string
  mediaType?: string
}

function normalizePosts(payload: unknown): InstagramFeedPost[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && 'data' in payload
      ? (payload as { data?: unknown }).data
      : []

  if (!Array.isArray(rawItems)) {
    return []
  }

  return rawItems
    .map((item, index) => {
      const post = item as RawInstagramPost
      const image =
        post.media_url ??
        post.mediaUrl ??
        post.thumbnail_url ??
        post.thumbnailUrl ??
        ''

      if (!image) {
        return null
      }

      return {
        id: post.id ?? `instagram-post-${index}`,
        image,
        alt: post.caption?.slice(0, 140) ?? `Post ${index + 1} da Zelo no Instagram.`,
        postUrl: post.permalink ?? post.postUrl ?? siteConfig.instagramLink,
        className: post.media_type === 'VIDEO' || post.mediaType === 'VIDEO' ? 'object-center' : '',
      }
    })
    .filter((post): post is InstagramFeedPost => post !== null)
    .slice(0, 9)
}

function buildGraphUrl() {
  if (!siteConfig.instagramGraphUserId || !siteConfig.instagramAccessToken) {
    return ''
  }

  const url = new URL(`https://graph.facebook.com/v23.0/${siteConfig.instagramGraphUserId}/media`)
  url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp')
  url.searchParams.set('limit', '9')
  url.searchParams.set('access_token', siteConfig.instagramAccessToken)
  return url.toString()
}

export function useInstagramFeed() {
  const [posts, setPosts] = useState<InstagramFeedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const feedUrl = siteConfig.instagramFeedEndpoint || buildGraphUrl()

    if (!feedUrl) {
      return
    }

    const controller = new AbortController()

    async function loadFeed() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(feedUrl, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Instagram feed returned ${response.status}`)
        }

        const payload = await response.json()
        setPosts(normalizePosts(payload))
      } catch (feedError) {
        if (!controller.signal.aborted) {
          setError(feedError instanceof Error ? feedError.message : 'Instagram feed unavailable')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadFeed()

    return () => {
      controller.abort()
    }
  }, [])

  return {
    posts,
    loading,
    error,
    configured: Boolean(siteConfig.instagramFeedEndpoint || buildGraphUrl()),
  }
}
