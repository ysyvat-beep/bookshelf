import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 서버(5173)에서 /api 호출을 Express(3000)로 프록시합니다.
// 운영(도커)에서는 Nginx가 같은 역할을 하므로 프론트 코드는 그대로 /api 만 호출하면 됩니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 빌드 결과를 proxy 컨테이너가 서빙할 위치로 내보냅니다.
    outDir: '../proxy/static/dist',
    emptyOutDir: true,
  },
});
