import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_ORIGIN || undefined,
  base: process.env.SITE_BASE_PATH || '/',
  outDir: process.env.INCLUDE_DRAFTS === '1' ? './outputs/review' : './dist',
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false }
});
