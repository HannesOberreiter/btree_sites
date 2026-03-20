// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.btree.tv',
  output: 'static',
  integrations: [sitemap()],
});
