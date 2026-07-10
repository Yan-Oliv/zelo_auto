/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSTAGRAM_FEED_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
