import sitemap from '@astrojs/sitemap';
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.btree.tv',
  output: 'static',
  integrations: [sitemap()],
});
