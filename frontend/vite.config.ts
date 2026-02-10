import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      react(),
      isDev && mkcert()
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../shared/src')
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor';
            }
          }
        }
      }
    }
  }
});