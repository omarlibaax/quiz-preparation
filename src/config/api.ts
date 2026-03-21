/**
 * In dev, default to same-origin `/api` so Vite can proxy to the API (see `vite.config.ts`).
 * Set `VITE_API_BASE_URL` to override (e.g. `http://localhost:4000` or a deployed API).
 */
const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
export const API_BASE_URL =
  envUrl != null && envUrl !== ''
    ? envUrl
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:4000'

