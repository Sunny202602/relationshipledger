import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/relationshipledger/',  // ← 添加这一行，注意斜杠
  server: {
    host: true, // This enables access from local network (iPhone)
    port: 5173
  },
  build: {
    outDir: 'dist',
  }
});
