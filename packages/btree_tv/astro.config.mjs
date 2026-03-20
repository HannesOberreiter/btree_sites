import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://btree.tv',
  output: 'static',
  integrations: [sitemap()],
});
