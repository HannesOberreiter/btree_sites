import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import {
  buildDayLabel,
  entryVersions,
  newsAnchor,
} from '../../../scripts/news-format.mjs';
import newsData from '../public/news.json';

interface NewsEntry {
  version: string;
  versions?: string[];
  date: string;
  items: { title: string; description: string }[];
}

export const FEEDS = {
  en: {
    title: 'b.tree updates',
    description: 'New features and fixes in the b.tree beekeeping app.',
    updatesPath: '/updates/',
    feedPath: '/updates/rss.xml',
  },
  de: {
    title: 'b.tree Neuerungen',
    description: 'Neue Funktionen und Korrekturen in der b.tree Imkerei-App.',
    updatesPath: '/de/updates/',
    feedPath: '/de/updates/rss.xml',
  },
} as const;

// The feed holds the entries of the first updates page (page size 10), so
// every item link points to the page that shows the entry.
const FEED_SIZE = 10;

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function newsFeed(context: APIContext, lang: 'en' | 'de') {
  const feed = FEEDS[lang];
  const entries = (newsData[lang] as NewsEntry[]).slice(0, FEED_SIZE);
  const site = context.site ?? new URL('https://www.btree.at/');

  return rss({
    title: feed.title,
    description: feed.description,
    site,
    customData: `<language>${lang}</language>`,
    items: entries.map((entry) => ({
      title: `${entry.date}: ${buildDayLabel(entryVersions(entry), lang)}`,
      // An absolute link, because @astrojs/rss adds a slash after the
      // anchor of a relative link.
      link: new URL(`${feed.updatesPath}#${newsAnchor(entry)}`, site).href,
      pubDate: new Date(`${entry.date}T00:00:00Z`),
      description: entry.items.map((item) => item.title).join(', '),
      content: `<ul>${entry.items
        .map(
          (item) =>
            `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.description)}</li>`,
        )
        .join('')}</ul>`,
    })),
  });
}
