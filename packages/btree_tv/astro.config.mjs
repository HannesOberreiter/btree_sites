import sitemap from '@astrojs/sitemap';
// @ts-check
import { defineConfig } from 'astro/config';

// Old watch slugs. Their tutorials are now under another slug.
const MOVED = {
  'nfc-de': 'nfc',
  'qr-code-de': 'qr-code',
  'pwa-android': 'pwa',
  'pwa-android-de': 'pwa',
  'pwa-ios': 'pwa',
  'pwa-ios-de': 'pwa',
};

export default defineConfig({
  site: 'https://www.btree.tv',
  output: 'static',
  redirects: Object.fromEntries(
    Object.entries(MOVED).flatMap(([from, to]) =>
      ['', '/de'].map((prefix) => [
        `${prefix}/watch/${from}`,
        `${prefix}/watch/${to}/`,
      ]),
    ),
  ),
  integrations: [sitemap()],
});
