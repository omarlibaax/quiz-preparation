import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev: call `/api/*` on the same origin (5173); Vite forwards to the Express API.
    // Avoids CORS issues and wrong API URL when using localhost vs 127.0.0.1.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
