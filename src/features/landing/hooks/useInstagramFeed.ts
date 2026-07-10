import { useEffect, useState } from 'react'
import { instagramPosts, siteConfig } from '../data/site'

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
  children?: {
    data?: RawInstagramChild[]
  }
}

type RawInstagramChild = {
  id?: string
  media_url?: string
  mediaUrl?: string
  thumbnail_url?: string
  thumbnailUrl?: string
  media_type?: string
  mediaType?: string
}

type FeedResponse = {
  data?: unknown
  error?: {
    message?: string
  }
}

function normalizePosts(payload: unknown): InstagramFeedPost[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && 'data' in payload
      ? (payload as FeedResponse).data
      : []

  if (!Array.isArray(rawItems)) {
    return []
  }

  return rawItems
    .flatMap((item, index) => {
      const post = item as RawInstagramPost
      const postUrl = post.permalink ?? post.postUrl ?? siteConfig.instagramLink
      const alt = post.caption?.slice(0, 140) ?? `Post ${index + 1} da Zelo no Instagram.`
      const parentImage =
        post.media_url ??
        post.mediaUrl ??
        post.thumbnail_url ??
        post.thumbnailUrl ??
        ''
      const parentMediaType = post.media_type ?? post.mediaType
      const children = post.children?.data ?? []
      const childTiles = children
        .map((childPost, childIndex) => {
          const childImage =
            childPost.media_url ?? childPost.mediaUrl ?? childPost.thumbnail_url ?? childPost.thumbnailUrl ?? ''

          if (!childImage) {
            return null
          }

          return {
            id: `${post.id ?? `instagram-post-${index}`}-${childPost.id ?? childIndex}`,
            image: childImage,
            alt,
            postUrl,
            className: (childPost.media_type ?? childPost.mediaType) === 'VIDEO' ? 'object-center' : '',
          }
        })
        .filter((childPost): childPost is InstagramFeedPost => childPost !== null)

      if (parentMediaType === 'CAROUSEL_ALBUM' && childTiles.length > 0) {
        return childTiles
      }

      if (!parentImage) {
        return childTiles
      }

      return {
        id: post.id ?? `instagram-post-${index}`,
        image: parentImage,
        alt,
        postUrl,
        className: parentMediaType === 'VIDEO' ? 'object-center' : '',
      }
    })
    .slice(0, 9)
}

export function useInstagramFeed() {
  const feedUrl = siteConfig.instagramFeedEndpoint
  const [posts, setPosts] = useState<InstagramFeedPost[]>(instagramPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!feedUrl) {
      setPosts(instagramPosts)
      setLoading(false)
      setError(null)
      return
    }

    const currentFeedUrl = feedUrl
    const controller = new AbortController()

    async function loadFeed() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(currentFeedUrl, { signal: controller.signal })
        const payload = (await response.json()) as FeedResponse

        if (!response.ok) {
          throw new Error(payload.error?.message ?? `Instagram feed returned ${response.status}`)
        }

        const normalizedPosts = normalizePosts(payload)
        setPosts(normalizedPosts.length > 0 ? normalizedPosts : instagramPosts)
      } catch (feedError) {
        if (!controller.signal.aborted) {
          setPosts(instagramPosts)
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
  }, [feedUrl])

  return {
    posts,
    loading,
    error,
    configured: Boolean(feedUrl),
  }
}
