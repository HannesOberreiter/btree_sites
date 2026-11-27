// Uploads the videos of videos/out to Bunny Stream and writes the data that the
// website btree.tv needs into packages/btree_tv:
// - src/videos.json: the id, the length and the upload time of each video
// - src/transcripts.json: the text of the subtitles, one paragraph per scene
// - public/thumbnails/<episode>-<lang>.jpg: the picture for search engines
//
// Usage:
//   node scripts/videos/upload.mjs [episode ...]   Upload. Default: all episodes.
//   node scripts/videos/upload.mjs --prune         Delete the unused videos.
//   node scripts/videos/upload.mjs --metatags      Set the Open Graph tags of
//                                                  the videos in videos.json.
//
// An episode needs an entry in videos.json before the upload. Each upload makes
// a new Bunny video, so the website shows the old video until its deploy.
// After the deploy, --prune deletes all videos of the library that videos.json
// does not use. A deleted video cannot be restored.
// Needs BUNNY_API_KEY in the environment or in the root .env.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'videos/out');
const SITE_DIR = path.join(ROOT, 'packages/btree_tv');
const DATA_FILE = path.join(SITE_DIR, 'src/videos.json');
const TRANSCRIPT_FILE = path.join(SITE_DIR, 'src/transcripts.json');
const THUMBNAIL_DIR = path.join(SITE_DIR, 'public/thumbnails');
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

// The player page exposes the video metaTags as Open Graph tags, and search
// engines read them there. metaTags replace all tags of the video.
function setMetaTags(library, key, guid, video, lang) {
  return post(`${library}/videos/${guid}`, key, {
    metaTags: [
      { property: 'og:title', value: video.title[lang] },
      { property: 'og:description', value: video.description[lang] },
    ],
  });
}

function seconds(file) {
  return Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      file,
    ]).toString(),
  );
}

// Bunny serves its own thumbnail only to the player. Search engines need a
// file on btree.tv, so save the same frame there.
function saveThumbnail(file, name, time) {
  mkdirSync(THUMBNAIL_DIR, { recursive: true });
  execFileSync('ffmpeg', [
    '-loglevel',
    'error',
    '-y',
    '-ss',
    String(time),
    '-i',
    file,
    '-frames:v',
    '1',
    '-vf',
    'scale=1280:-2',
    '-q:v',
    '4',
    path.join(THUMBNAIL_DIR, `${name}.jpg`),
  ]);
}

// The texts of an SRT file, one per subtitle.
function paragraphs(srt) {
  return srt
    .trim()
    .split(/\r?\n\r?\n/)
    .map((block) => block.split(/\r?\n/).slice(2).join(' ').trim())
    .filter((text) => text !== '');
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
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

// Uploads one video and returns its data for the website.
async function upload(library, key, video, lang) {
  const name = `${video.episode}-${lang}`;
  const file = path.join(OUT_DIR, `${name}.mp4`);
  const captions = path.join(OUT_DIR, `${name}.srt`);
  for (const needed of [file, captions]) {
    if (!existsSync(needed)) {
      throw new Error(`${needed} is missing. Run record.mjs first.`);
    }
  }
  const length = seconds(file);
  const thumbnailTime = length * THUMBNAIL_PART;
  const srt = readFileSync(captions, 'utf8');
  const { guid } = await post(`${library}/videos`, key, {
    title: `b.tree - Tutorial - ${video.title[lang]} - ${LANGS[lang]}`,
    thumbnailTime: Math.round(thumbnailTime * 1000),
  });
  await setMetaTags(library, key, guid, video, lang);
  await request(`${library}/videos/${guid}`, key, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: readFileSync(file),
  });
  await post(`${library}/videos/${guid}/captions/${lang}`, key, {
    label: LANGS[lang],
    captionsFile: Buffer.from(srt).toString('base64'),
  });
  saveThumbnail(file, name, thumbnailTime);
  console.log(`${name}: uploaded as ${guid}`);
  return {
    id: guid,
    seconds: Math.round(length),
    uploaded: new Date().toISOString(),
    transcript: paragraphs(srt),
  };
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
const transcripts = JSON.parse(readFileSync(TRANSCRIPT_FILE, 'utf8'));
const library = `${STREAM_URL}/${data.libraryId}`;
const key = await libraryKey(data.libraryId);
const names = process.argv.slice(2);
if (names.includes('--prune')) {
  await prune(library, key, data);
} else if (names.includes('--metatags')) {
  for (const video of data.videos) {
    for (const lang of Object.keys(LANGS)) {
      await setMetaTags(library, key, video.ids[lang], video, lang);
      console.log(
        `${video.episode}-${lang}: metaTags set (${video.ids[lang]})`,
      );
    }
  }
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
      const uploaded = await upload(library, key, video, lang);
      video.ids[lang] = uploaded.id;
      video.seconds[lang] = uploaded.seconds;
      video.uploaded[lang] = uploaded.uploaded;
      transcripts[video.episode] = {
        ...transcripts[video.episode],
        [lang]: uploaded.transcript,
      };
      ids.push(uploaded.id);
      // Write after each upload, so that a later error loses no id.
      writeJson(DATA_FILE, data);
      writeJson(TRANSCRIPT_FILE, transcripts);
    }
  }
  await waitUntilFinished(library, key, ids);
}
