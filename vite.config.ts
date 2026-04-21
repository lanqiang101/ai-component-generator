
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    hmr: {
      // 强制启用热更新
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // 优化热更新性能
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})