import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 🔥 ESTA ES LA MAGIA DEL PROXY PARA DESARROLLO LOCAL
  server: {
    proxy: {
      '/api': {
        target: 'https://wonderful-victory-production-af78.up.railway.app', // Tu backend real
        changeOrigin: true,
        secure: true,
      },
    },
  },
});