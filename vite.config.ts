import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

function instagramFeedDevPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '')

  const handler = async (
    _req: unknown,
    res: {
      statusCode: number
      setHeader: (name: string, value: string) => void
      end: (body: string) => void
    },
  ) => {
    const userId = env.VITE_INSTAGRAM_GRAPH_USER_ID?.trim()
    const accessToken = env.VITE_INSTAGRAM_ACCESS_TOKEN?.trim()

    if (!userId || !accessToken) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'Instagram feed is not configured.' }))
      return
    }

    try {
      const upstreamUrl = new URL(`https://graph.facebook.com/v23.0/${userId}/media`)
      upstreamUrl.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp')
      upstreamUrl.searchParams.set('limit', '9')
      upstreamUrl.searchParams.set('access_token', accessToken)

      const upstream = await fetch(upstreamUrl, { headers: { accept: 'application/json' } })
      const payload = await upstream.text()

      res.statusCode = upstream.status
      res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json; charset=utf-8')
      res.end(payload)
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Instagram feed unavailable',
        }),
      )
    }
  }

  return {
    name: 'instagram-feed-dev-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/instagram-feed', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/instagram-feed', handler)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), instagramFeedDevPlugin(mode)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
}))
