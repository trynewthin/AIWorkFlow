import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 设置为相对路径，确保file://协议下能正确加载资源
  server: {
    port: 8080,
    strictPort: true, // 确保使用指定的端口
    host: 'localhost'
  }
})
