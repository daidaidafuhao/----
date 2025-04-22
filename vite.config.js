import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  build: {
    // 指定xlsx为外部依赖
    rollupOptions: {
      external: ['xlsx']
    }
  },
  resolve: {
    // 别名配置，方便导入
    alias: {
      '@': '/src'
    }
  },
  // 针对xlsx的特殊处理
  optimizeDeps: {
    include: ['xlsx']
  }
}); 