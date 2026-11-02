import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Makes http://localhost:5173/admin open the admin panel (instead of the website's router)
const adminRoute = () => ({
  name: 'admin-route',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url || '').split('?')[0];
      if (path === '/admin' || path === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url || '').split('?')[0];
      if (path === '/admin' || path === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
});

// In development the backend runs on :3001 (npm run dev:all) and Vite forwards /api to it.
export default defineConfig({
  plugins: [adminRoute(), react()],
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
});