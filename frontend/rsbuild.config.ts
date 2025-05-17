import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/app.tsx',
    },
    alias: {
      '@': './src',
    },
  },
  html: {
    title: 'AIWorkFlow 工作流编辑器',
  },
  server: {
    port: 8080,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7001',
        changeOrigin: true,
      },
    },
  },
  output: {
    assetPrefix: './',
    // 如果 Electronegg 期望前端构建产物放在项目根目录的 public 文件夹下
    // 取消注释下面的配置并调整路径
    // distPath: {
    //   root: '../public/dist',
    // },
  },
});
