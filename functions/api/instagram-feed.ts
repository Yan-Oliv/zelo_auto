type Env = {
  INSTAGRAM_GRAPH_USER_ID?: string
  INSTAGRAM_ACCESS_TOKEN?: string
  VITE_INSTAGRAM_GRAPH_USER_ID?: string
  VITE_INSTAGRAM_ACCESS_TOKEN?: string
}

const INSTAGRAM_FIELDS =
  'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const userId = (env.INSTAGRAM_GRAPH_USER_ID ?? env.VITE_INSTAGRAM_GRAPH_USER_ID)?.trim()
  const accessToken = (env.INSTAGRAM_ACCESS_TOKEN ?? env.VITE_INSTAGRAM_ACCESS_TOKEN)?.trim()

  if (!accessToken) {
    return json({ error: 'Instagram feed is not configured.' }, 500)
  }

  const upstreamUrl = new URL(`https://graph.instagram.com/${userId ? `${userId}/media` : 'me/media'}`)
  upstreamUrl.searchParams.set('fields', INSTAGRAM_FIELDS)
  upstreamUrl.searchParams.set('limit', '9')
  upstreamUrl.searchParams.set('access_token', accessToken)

  const upstream = await fetch(upstreamUrl, {
    headers: {
      accept: 'application/json',
      'user-agent': request.headers.get('user-agent') ?? 'zelo-auto-feed',
    },
  })

  const payload = await upstream.text()

  return new Response(payload, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
      'cache-control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}
