import { defineConfig } from 'vite';

/**
 * A relative base keeps the build portable: it works when served from a
 * GitHub Pages project subpath (/repo/), from a user/org root domain, and
 * from the local filesystem, with no extra configuration.
 */
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    assetsInlineLimit: 8192,
    reportCompressedSize: false,
    terserOptions: {
      compress: { passes: 2, drop_console: true, drop_debugger: true },
      format: { comments: false },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
