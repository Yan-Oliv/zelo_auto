import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { handleInstagramFeed, type InstagramFeedEnv } from './functions/api/_instagram-feed.js'
import { handleGoogleReviews, type GoogleReviewsEnv } from './functions/api/google-reviews.js'
import type { IncomingMessage, ServerResponse } from 'node:http'

function googleReviewsDevPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '') as GoogleReviewsEnv
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }); res.end(); return }
    const abort = new AbortController()
    res.on('close', () => abort.abort())
    const headers = new Headers()
    for (const [name, value] of Object.entries(req.headers)) {
      if (value) headers.set(name, Array.isArray(value) ? value.join(', ') : value)
    }
    const request = new Request(`http://${req.headers.host ?? 'localhost'}/api/google-reviews`, { headers, signal: abort.signal })
    const response = await handleGoogleReviews(env, request)
    res.statusCode = response.status
    response.headers.forEach((value, name) => res.setHeader(name, value))
    res.end(await response.text())
  }
  return {
    name: 'google-reviews-dev-endpoint',
    configureServer(server) { server.middlewares.use('/api/google-reviews', handler) },
    configurePreviewServer(server) { server.middlewares.use('/api/google-reviews', handler) },
  }
}

function instagramFeedDevPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '') as InstagramFeedEnv

  const handler = async (
    _req: unknown,
    res: {
      statusCode: number
      setHeader: (name: string, value: string) => void
      end: (body: string) => void
    },
  ) => {
    const response = await handleInstagramFeed(env)
    res.statusCode = response.status
    response.headers.forEach((value, name) => res.setHeader(name, value))
    res.end(await response.text())
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
  plugins: [react(), instagramFeedDevPlugin(mode), googleReviewsDevPlugin(mode)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    modulePreload: { polyfill: false },
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Keep React's shared runtime out of the deferred motion/3D chunks.
          // Recursive capture previously made the initial entry import motion.
          includeDependenciesRecursively: false,
          groups: [
            { name: 'react', test: /node_modules[\\/](?:react|react-dom|scheduler)(?:[\\/]|$)/, priority: 30 },
            { name: 'motion', test: /node_modules[\\/](?:framer-motion|motion-dom|motion-utils)(?:[\\/]|$)/, priority: 20 },
            { name: 'three', test: /node_modules[\\/](?:three|@react-three)(?:[\\/]|$)/, priority: 10 },
          ],
        },
      },
    },
  },
}))
