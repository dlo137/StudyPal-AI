// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/StudyPal-AI/',
  server: {
    proxy: {
      '/api': 'http://localhost:4000'   // <── this is the key line
    }
  }
});
