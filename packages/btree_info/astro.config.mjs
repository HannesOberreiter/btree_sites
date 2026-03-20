import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({

  redirects: {
    '/cv': {
      destination: 'https://www.oberreiter.or.at/hannes',
      status: 301,
    },
    '/de/cv': {
      destination: 'https://www.oberreiter.or.at/hannes',
      status: 301,
    },
    '/science': {
      destination: 'https://www.oberreiter.or.at/forschung',
      status: 301,
    },
    '/de/science': {
      destination: 'https://www.oberreiter.or.at/forschung',
      status: 301,
    },
    '/projects': {
      destination: 'https://www.oberreiter.or.at/projekte',
      status: 301,
    },
    '/de/projects': {
      destination: 'https://www.oberreiter.or.at/projekte',
      status: 301,
    },
    '/impressum': {
      destination: '/imprint',
      status: 301,
    },
    '/de/impressum': {
      destination: '/de/imprint',
      status: 301,
    },
    '/datenschutz': {
      destination: '/data-privacy',
      status: 301,
    },
    '/de/datenschutz': {
      destination: '/de/data-privacy',
      status: 301,
    },
  },

  integrations: [
    vue(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          de: 'de-DE',
        },
      },
    }),
  ],

  site: `https://www.btree.at/`,

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
    fallback: {
      de: 'en',
    },
  },

  markdown: {
    remarkPlugins: [
      // Add a Remark plugin that you want to enable for your project.
      // If you need to provide options for the plugin, you can use an array and put the options as the second item.
      // ['remark-autolink-headings', { behavior: 'prepend'}],
      // remarkGFM,
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
