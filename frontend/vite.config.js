import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 设置为相对路径，确保file://协议下能正确加载资源
  server: {
    port: 8080,
    strictPort: true, // 确保使用指定的端口
    host: 'localhost',
    // 防止 CORS 错误
    proxy: {
      '/api': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})

