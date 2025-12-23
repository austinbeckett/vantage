import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Health Canada DPD API requests to avoid CORS issues
      '/api/drug': {
        target: 'https://health-products.canada.ca',
        changeOrigin: true,
        secure: true,
      },
      // Proxy Health Canada NOC API requests
      '/api/notice-of-compliance': {
        target: 'https://health-products.canada.ca',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
