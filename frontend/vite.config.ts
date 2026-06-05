import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const env = loadEnv(mode, process.cwd(), '');
  const FRONTEND_PORT = env.VITE_FRONTEND_PORT || 8080;
  const BACKEND_BASE_URL = 'http://localhost:3000';

  return {
    server: {
      port: Number(FRONTEND_PORT),
      proxy: {
        '/api': BACKEND_BASE_URL,
        '/usercontent': BACKEND_BASE_URL,
        '/sitemap.xml': BACKEND_BASE_URL,
        '/robots.txt': BACKEND_BASE_URL
      }
    },
    plugins: [
      react(),
      mkcert()
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../shared/src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('node_modules/react/') ||        // trailing slash = exact package
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router/') ||
              id.includes('node_modules/scheduler/')        // react-dom peer dep
            ) {
              return 'vendor-react';
            }

            if (id.includes('node_modules/react-hook-form')) {
              return 'vendor-rhf';
            }

            if (id.includes('@mui/') || id.includes('@emotion/')) {
              return 'vendor-mui';
            }
          }
        }
      },
      reportCompressedSize: true,
      sourcemap: isDev
    }
  }
});