import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * FIX: Original vite.config.js had no proxy config.
 *
 * Without this, fetch('/api/v1/corridors') hits localhost:5173/api/v1/corridors
 * which returns a 404 from Vite — Spring Boot never sees the request.
 *
 * With the proxy:
 *   Frontend calls /api/v1/... → Vite forwards to http://localhost:8080/api/v1/...
 *   Frontend calls /ws/...    → Vite forwards WebSocket to ws://localhost:8080/ws/...
 *
 * No CORS needed between browser and backend when using this proxy.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All API calls
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // WebSocket connections for live heatmap updates
      '/ws': {
        target: 'ws://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})