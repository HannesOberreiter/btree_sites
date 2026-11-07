import type { APIContext } from 'astro';

import { newsFeed } from '../../../news-feed';

export function GET(context: APIContext) {
  return newsFeed(context, 'de');
}
