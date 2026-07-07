import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE ON DEPLOYMENT:
// For a normal domain or "Add to Home Screen" from the site root, keep base: '/'.
// If you deploy to GitHub Pages under https://<user>.github.io/protocol-1000/,
// set base to '/protocol-1000/' AND update the service worker + manifest scopes
// (see README "Deploying to a sub-path").
export default defineConfig({
  base: '/protocol-1000/',
  plugins: [react()],
  build: {
    target: 'es2018', // safe for older iOS Safari WebKit
    outDir: 'dist',
    sourcemap: false,
  },
});
