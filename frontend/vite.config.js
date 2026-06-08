import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    WindiCSS()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://backend:80',
        changeOrigin: true
      }
    }
  }
})
