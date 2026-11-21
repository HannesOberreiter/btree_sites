import transcriptData from './transcripts.json';
import data from './videos.json';

export type Lang = 'en' | 'de';

// One tutorial, with one Bunny Stream video per language.
// scripts/videos/upload.mjs writes ids, seconds and uploaded into videos.json,
// the texts into transcripts.json and the pictures into public/thumbnails.
export interface Video {
  episode: string;
  slug: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  ids: Record<Lang, string>;
  seconds: Record<Lang, number>;
  uploaded: Record<Lang, string>;
}

export const BUNNY_LIBRARY_ID = data.libraryId;
export const videos: Video[] = data.videos;

const transcripts: Record<string, Record<Lang, string[]>> = transcriptData;

// The spoken text of the video, one paragraph per scene.
export function transcript(video: Video, lang: Lang): string[] {
  return transcripts[video.episode][lang];
}

export function thumbnailUrl(video: Video, lang: Lang): string {
  return `https://www.btree.tv/thumbnails/${video.episode}-${lang}.jpg`;
}

// The schema.org properties of one tutorial video.
function videoObjectNode(video: Video, lang: Lang) {
  return {
    '@type': 'VideoObject' as const,
    name: video.title[lang],
    description: video.description[lang],
    thumbnailUrl: thumbnailUrl(video, lang),
    uploadDate: video.uploaded[lang],
    duration: `PT${video.seconds[lang]}S`,
    embedUrl: `https://player.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${video.ids[lang]}`,
    inLanguage: lang,
    transcript: transcript(video, lang).join(' '),
  };
}

// The schema.org data that makes the video eligible for video search results.
export function videoObject(video: Video, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    ...videoObjectNode(video, lang),
  };
}

// The schema.org data for the index pages: one VideoObject per embedded
// tutorial, each pointing to its watch page. Search Console reads this to
// get the name and description of every video on the page.
export function videoGraph(lang: Lang) {
  const watchPrefix = lang === 'de' ? '/de' : '';
  return {
    '@context': 'https://schema.org',
    '@graph': videos.map((video) =>
      Object.assign(videoObjectNode(video, lang), {
        url: `https://www.btree.tv${watchPrefix}/watch/${video.slug}/`,
      }),
    ),
  };
}
