// src/vite-env.d.ts
// Typed environment variables — add every VITE_* variable you use here.
// TypeScript will error if you access an undeclared env var.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  // Add more VITE_* vars here as your app grows
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
