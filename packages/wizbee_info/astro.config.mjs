import sitemap from '@astrojs/sitemap';
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.wiz-bee.com',
  output: 'static',
  integrations: [sitemap()],
});
