import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isGitHubPages = Boolean(process.env.GITHUB_PAGES || process.env.GITHUB_ACTIONS);

// https://vitejs.dev/config/
export default defineConfig({
  base: isGitHubPages ? '/pet-society-reborn/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
