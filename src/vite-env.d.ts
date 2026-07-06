/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSTAGRAM_FEED_ENDPOINT?: string
  readonly VITE_INSTAGRAM_GRAPH_USER_ID?: string
  readonly VITE_INSTAGRAM_ACCESS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
