import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiRouter } from './server/api.js';

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Port./' : '/',
  plugins: [react(), {
    name: 'port-news-api',
    configureServer(server) { server.middlewares.use(apiRouter); },
    configurePreviewServer(server) { server.middlewares.use(apiRouter); },
  }],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
}));
