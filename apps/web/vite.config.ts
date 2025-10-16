import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      // application source
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // shared UI package
      '@form-app/ui': fileURLToPath(new URL('../../packages/ui', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
