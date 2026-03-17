import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    watch: {
      // Ignore Replit's internal state dirs, DB files, and logs so Vite
      // doesn't trigger page reloads every time the agent writes its state.
      ignored: [
        '**/.local/**',
        '**/.git/**',
        '**/node_modules/**',
        '**/*.db',
        '**/*.db-wal',
        '**/*.db-shm',
      ],
    },
  },
});
