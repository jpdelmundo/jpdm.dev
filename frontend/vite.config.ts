import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert()
  ],
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
  },
  // server: {
  //   //allowedHosts: ['jp-pc.home.arpa'],
  //   host: 'jp-pc.home.arpa',
  //   // https: {
  //   //   key: fs.readFileSync('./certs/jp-pc.home.arpa+3-key.pem'),
  //   //   cert: fs.readFileSync('./certs/jp-pc.home.arpa+3.pem'),
  //   // },
  //   // hmr: {
  //   //   //protocol: 'wss',
  //   //   host: 'jp-pc.home.arpa',
  //   //   port: 5173
  //   // }
  // }
});