import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { handleInstagramFeed, type InstagramFeedEnv } from './functions/api/_instagram-feed.js'

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
  plugins: [react(), instagramFeedDevPlugin(mode)],
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
          return undefined
        },
      },
    },
  },
}))
