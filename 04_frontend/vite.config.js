import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/leaflet')) {
            return 'vendor-maps';
          }
          if (id.includes('src/pages/admin/') || id.includes('AdminPortal')) {
            return 'chunk-admin';
          }
          if (id.includes('src/pages/employer/') || id.includes('EmployerPortal')) {
            return 'chunk-employer';
          }
        },
      },
    },
  },
  // Cổng cố định: Vite dev = 5173, Docker frontend = 8080, backend = 5000.
  // strictPort: báo lỗi nếu cổng bận thay vì tự nhảy sang cổng khác (8081, 8082...).
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
})
