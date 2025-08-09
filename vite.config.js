import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root deployment for Cloudflare Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Copy public files to dist during build
    copyPublicDir: true
  },
  server: {
    port: 3000,
    host: true
  }
})
