import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    cors: true,
    headers: {
      // Allow iframe embedding from any origin
      'X-Frame-Options': 'ALLOWALL',
      'Access-Control-Allow-Origin': '*'
    }
  }
})
