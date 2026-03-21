/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site origin for canonical URLs & OG tags, e.g. https://quiz.example.com */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
