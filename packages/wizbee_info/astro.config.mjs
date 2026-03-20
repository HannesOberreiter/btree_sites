// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://wiz-bee.com',
  output: 'static',
  integrations: [sitemap()],
});