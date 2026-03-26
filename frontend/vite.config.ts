import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
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
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../shared/src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')
            ) {
              return 'vendor-react';
            }

            if (id.includes('node_modules/react-hook-form')) {
              return 'vendor-rhf';
            }

            if (id.includes('@mui/x-data-grid')) {
              return 'vendor-mui-datagrid';
            }

            if (id.includes('@mui/x-date-pickers')) {
              return 'vendor-mui-datepickers';
            }

            if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@mui/base')) {
              return 'vendor-mui-core';
            }

            if (id.includes('@mui')) {
              return 'vendor-mui-misc';
            }

            if (id.includes('@emotion')) {
              return 'vendor-emotion';
            }
          }
        }
      },
      reportCompressedSize: true,
      sourcemap: isDev
    }
  }
});