// AutomatedPersonSearch/frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 🚨 THIS IS THE CONNECTION POINT (The Proxy) 🚨
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Points to the Flask server
        changeOrigin: true,             // Required for proxying
        secure: false,                  // Set to false for local HTTP connection
      },
      // Also proxy static content like cropped images
      '/static': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
});