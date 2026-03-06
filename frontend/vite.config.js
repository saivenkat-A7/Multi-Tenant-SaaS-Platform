import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      "multi-tenant-saas-platform-2-jg8g.onrender.com"
    ],
    watch: {
      usePolling: true
    }
  }
})
