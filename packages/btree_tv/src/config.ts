import data from './videos.json';

export type Lang = 'en' | 'de';

// One tutorial, with one Bunny Stream video per language.
// scripts/videos/upload.mjs writes the ids into videos.json.
export interface Video {
  episode: string;
  slug: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  ids: Record<Lang, string>;
}

export const BUNNY_LIBRARY_ID = data.libraryId;
export const videos: Video[] = data.videos;
