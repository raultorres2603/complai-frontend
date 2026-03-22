import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_DEPLOYMENT_ENV === 'production' ? '/' : '/complai-frontend-dev/',
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    open: true,
    proxy: {
      '/complai': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
  },
  preview: {
    port: 4173,
    host: 'localhost',
  },
})
