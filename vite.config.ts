/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Pages base path — THE #1 THING THAT BREAKS ON A DOMAIN SWITCH.
//
//   • Project Pages (https://USER.github.io/REPO_NAME/) → '/REPO_NAME/'
//   • Custom domain at the root  (https://example.com/)  → '/'
//
// Change ONLY this constant when you switch hosting. The router reads the same
// value automatically via `import.meta.env.BASE_URL`, so routing stays in sync.
// If you move to a custom domain, ALSO set `pathSegmentsToKeep = 0` in
// public/404.html (the SPA deep-link shim). See README → "Deployment".
// ─────────────────────────────────────────────────────────────────────────────
const BASE_PATH = '/mimir/';

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
});
