// Uploads the videos of videos/out to Bunny Stream and writes their ids to
// packages/btree_tv/src/videos.json. The website btree.tv reads this file.
//
// Usage:
//   node scripts/videos/upload.mjs [episode ...]   Upload. Default: all episodes.
//   node scripts/videos/upload.mjs --prune         Delete the unused videos.
//
// An episode needs an entry in videos.json before the upload. Each upload makes
// a new Bunny video, so the website shows the old video until its deploy.
// After the deploy, --prune deletes all videos of the library that videos.json
// does not use. A deleted video cannot be restored.
// Needs BUNNY_API_KEY in the environment or in the root .env.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'videos/out');
const DATA_FILE = path.join(ROOT, 'packages/btree_tv/src/videos.json');
const STREAM_URL = 'https://video.bunnycdn.com/library';
const LANGS = { de: 'Deutsch', en: 'English' };
// Video states of the Bunny Stream API.
const FINISHED = 4;
const FAILED = new Set([5, 6]);
// The picture of the video before it plays is the frame at this part of the
// video. All videos start on the same page, so an early frame shows no topic.
const THUMBNAIL_PART = 0.45;

async function request(url, key, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { AccessKey: key, ...options.headers },
  });
  if (!response.ok) {
    throw new Error(
      `${options.method ?? 'GET'} ${url}: ${response.status} ${await response.text()}`,
    );
  }
  return response.json();
}

function post(url, key, body) {
  return request(url, key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function milliseconds(file) {
  const seconds = execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    file,
  ]).toString();
  return Number(seconds) * 1000;
}

// The library has its own key. The account key reads it.
async function libraryKey(libraryId) {
  const accountKey = process.env.BUNNY_API_KEY;
  if (!accountKey) {
    throw new Error('Set BUNNY_API_KEY in the environment or in .env');
  }
  const library = await request(
    `https://api.bunny.net/videolibrary/${libraryId}`,
    accountKey,
  );
  return library.ApiKey;
}

async function upload(library, key, video, lang) {
  const name = `${video.episode}-${lang}`;
  const file = path.join(OUT_DIR, `${name}.mp4`);
  const captions = path.join(OUT_DIR, `${name}.srt`);
  for (const needed of [file, captions]) {
    if (!existsSync(needed)) {
      throw new Error(`${needed} is missing. Run record.mjs first.`);
    }
  }
  const { guid } = await post(`${library}/videos`, key, {
    title: `b.tree - Tutorial - ${video.title[lang]} - ${LANGS[lang]}`,
    thumbnailTime: Math.round(milliseconds(file) * THUMBNAIL_PART),
  });
  await request(`${library}/videos/${guid}`, key, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: readFileSync(file),
  });
  await post(`${library}/videos/${guid}/captions/${lang}`, key, {
    label: LANGS[lang],
    captionsFile: readFileSync(captions).toString('base64'),
  });
  console.log(`${name}: uploaded as ${guid}`);
  return guid;
}

// Bunny encodes a video after the upload. Wait until all videos can play.
async function waitUntilFinished(library, key, ids) {
  let open = [...ids];
  while (open.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const next = [];
    for (const id of open) {
      const { status, title } = await request(`${library}/videos/${id}`, key);
      if (FAILED.has(status)) {
        throw new Error(`Bunny could not encode ${title} (${id})`);
      }
      if (status !== FINISHED) {
        next.push(id);
      }
    }
    open = next;
    console.log(`${ids.length - open.length} of ${ids.length} videos finished`);
  }
}

async function allVideos(library, key) {
  const videos = [];
  for (let page = 1; ; page++) {
    const { items, totalItems } = await request(
      `${library}/videos?page=${page}&itemsPerPage=100`,
      key,
    );
    videos.push(...items);
    if (items.length === 0 || videos.length >= totalItems) {
      return videos;
    }
  }
}

async function prune(library, key, data) {
  const used = new Set(
    data.videos.flatMap((video) => Object.values(video.ids)),
  );
  const existing = await allVideos(library, key);
  const guids = new Set(existing.map((item) => item.guid));
  const missing = [...used].filter((id) => !guids.has(id));
  if (missing.length > 0) {
    throw new Error(
      `videos.json has ids that are not in the library: ${JSON.stringify(missing)}`,
    );
  }
  for (const item of existing.filter(({ guid }) => !used.has(guid))) {
    await request(`${library}/videos/${item.guid}`, key, { method: 'DELETE' });
    console.log(`Deleted ${item.title} (${item.guid})`);
  }
}

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // No .env file: use the environment only.
}
const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
const library = `${STREAM_URL}/${data.libraryId}`;
const key = await libraryKey(data.libraryId);
const names = process.argv.slice(2);
if (names.includes('--prune')) {
  await prune(library, key, data);
} else {
  const unknown = names.filter(
    (name) => !data.videos.some((video) => video.episode === name),
  );
  if (unknown.length > 0) {
    throw new Error(`No entry in videos.json for: ${unknown.join(', ')}`);
  }
  const ids = [];
  for (const video of data.videos) {
    if (names.length > 0 && !names.includes(video.episode)) {
      continue;
    }
    for (const lang of Object.keys(LANGS)) {
      video.ids[lang] = await upload(library, key, video, lang);
      ids.push(video.ids[lang]);
      // Write after each upload, so that a later error loses no id.
      writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
    }
  }
  await waitUntilFinished(library, key, ids);
}
