// Record the btree.tv tutorial videos from a local b.tree app.
//
// 1. Start the app with demo data: scripts/screenshots/start-app.sh <path to btree checkout>
// 2. Set MISTRAL_API_KEY in the environment or in the root .env.
// 3. Run: node scripts/videos/record.mjs <episode> [lang ...]
// 4. Stop the app: scripts/screenshots/stop-app.sh
// 5. Put the videos on btree.tv: see scripts/videos/upload.mjs
//
// An episode is a module in scripts/videos/episodes/, listed in episodes/index.mjs. It has a route and a list of
// scenes. Each scene has a narration text per language and an optional action.
// An optional before(demo) runs before the browser opens, an optional
// prepare(page, demo, ui) after the page load and before the recording, an
// optional after(demo) after the recording. An optional init is a list of
// functions that run in each page and frame before the app starts.
// An optional hidden(demo) gives texts; dropdown entries with these texts do not show.
// An optional hints gives pronunciation hints per language, see tts.mjs.
// E-mail addresses that a video shows must end with @btree.at.
// The size is 'desktop' (default) or 'mobile'. A mobile episode shows the phone in
// the middle of the 16:9 video.
// The script makes the speech of each scene first, then plays the actions in the
// browser and waits until the speech of the scene ends. ffmpeg puts the browser
// recording and the speech together.
// Output: videos/out/<episode>-<lang>.mp4 and .srt (the videos/ folder is not in Git).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import {
  API_URL,
  APP_URL,
  SIZES,
  newAppContext,
  openDemo,
} from '../screenshots/demo.mjs';
import { EPISODES } from './episodes/index.mjs';
import { speech } from './tts.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const OUT_DIR = path.join(ROOT, 'videos/out');
const WORK_DIR = path.join(os.tmpdir(), 'btree-videos');
const TTS_DIR = path.join(WORK_DIR, 'tts');

// Browser sizes. The recording has the size of the viewport in device pixels.
const VIDEO_SIZES = {
  desktop: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 },
  mobile: SIZES.mobile,
};
// The final video is 16:9. A phone recording stands in the middle.
const FRAME = {
  width: 1920,
  height: 1080,
  phoneHeight: 1000,
  colour: '0x2b957a',
};
// Addresses of the local app and the production addresses that the video shows.
const PUBLIC_URLS = [
  [new URL(APP_URL).origin, 'https://app.btree.at'],
  [new URL(API_URL).origin, 'https://api.btree.at'],
];
// Seconds of silence after each scene and at the end.
const PAUSE = 0.5;
const END = 1.5;

// Show a short circle where the page gets a tap or a click.
function tapIndicator() {
  window.addEventListener(
    'pointerdown',
    (event) => {
      const dot = document.createElement('div');
      Object.assign(dot.style, {
        position: 'fixed',
        left: `${event.clientX - 22}px`,
        top: `${event.clientY - 22}px`,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'rgba(43, 149, 122, 0.35)',
        border: '3px solid rgba(43, 149, 122, 0.9)',
        pointerEvents: 'none',
        zIndex: '2147483647',
        transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
      });
      document.body.append(dot);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          dot.style.transform = 'scale(1.8)';
          dot.style.opacity = '0';
        }),
      );
      setTimeout(() => dot.remove(), 700);
    },
    true,
  );
}

// Show a mouse pointer on desktop. Playwright moves the real mouse in one jump,
// so window.__videoCursor(x, y) moves this pointer with an animation first.
function mousePointer() {
  window.__videoCursor = (x, y) => {
    let cursor = document.getElementById('video-cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'video-cursor';
      cursor.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 2l16 11-7 1.5L9.5 21z" fill="#111" stroke="#fff" stroke-width="1.5"/></svg>';
      Object.assign(cursor.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        transform: `translate(${innerWidth / 2}px, ${innerHeight / 2}px)`,
        pointerEvents: 'none',
        zIndex: '2147483647',
        transition: 'transform 0.6s ease-in-out',
      });
      document.body.append(cursor);
      cursor.getBoundingClientRect();
    }
    cursor.style.transform = `translate(${x - 4}px, ${y - 2}px)`;
  };
}

// The app runs on localhost. Show the production addresses in input fields
// and in the texts of the page instead.
// Display only: the app keeps the real values in its state.
function publicUrls(pairs) {
  const fix = (text) =>
    pairs.reduce((result, [from, to]) => result.replaceAll(from, to), text);
  for (const proto of [
    HTMLInputElement.prototype,
    HTMLTextAreaElement.prototype,
  ]) {
    const value = Object.getOwnPropertyDescriptor(proto, 'value');
    Object.defineProperty(proto, 'value', {
      ...value,
      set(text) {
        value.set.call(this, typeof text === 'string' ? fix(text) : text);
      },
    });
  }
  const fixNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Not the text of a script: the page must use the real addresses.
      if (node.parentElement?.closest('script, style')) {
        return;
      }
      const text = fix(node.data);
      if (text !== node.data) {
        node.data = text;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        fixNode(walker.currentNode);
      }
    }
  };
  new MutationObserver((records) => {
    for (const change of records) {
      if (change.type === 'characterData') {
        fixNode(change.target);
      }
      for (const node of change.addedNodes) {
        fixNode(node);
      }
    }
  }).observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// Hide the entries of dropdown lists that have one of the texts, for example
// test data of the seed. Display only.
function hideEntries(texts) {
  new MutationObserver(() => {
    for (const item of document.querySelectorAll('.q-menu .q-item')) {
      const hide = texts.some((text) => item.textContent.includes(text));
      item.style.display = hide ? 'none' : '';
    }
  }).observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// Helpers for the scene actions. They move slowly, so a viewer can follow.
function helpers(page, desktop) {
  const scrollTo = async (locator) => {
    const moved = await locator.evaluate((el) => {
      const box = el.getBoundingClientRect();
      if (box.top >= 0 && box.bottom <= innerHeight) {
        return false;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    });
    if (moved) {
      await page.waitForTimeout(700);
    }
  };
  // position is { x, y } inside the element. The default is its middle.
  const pointTo = async (locator, position) => {
    await scrollTo(locator);
    if (desktop) {
      const box = await locator.boundingBox();
      await page.evaluate(
        ([x, y]) => window.__videoCursor(x, y),
        [
          box.x + (position?.x ?? box.width / 2),
          box.y + (position?.y ?? box.height / 2),
        ],
      );
      await page.waitForTimeout(700);
    }
  };
  return {
    wait: (ms) => page.waitForTimeout(ms),
    scrollTo,
    point: pointTo,
    tap: async (locator) => {
      await pointTo(locator);
      await locator.click();
      await page.waitForTimeout(400);
    },
    doubleTap: async (locator, position) => {
      await pointTo(locator, position);
      await locator.dblclick({ position });
      await page.waitForTimeout(400);
    },
    // Drag the element by the offset { x, y }. The mouse moves in small steps,
    // so that the page and the pointer of the video move together.
    drag: async (locator, offset) => {
      await pointTo(locator);
      const box = await locator.boundingBox();
      const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.waitForTimeout(200);
      if (desktop) {
        await page.evaluate(
          ([x, y]) => window.__videoCursor(x, y),
          [from.x + offset.x, from.y + offset.y],
        );
      }
      const steps = 15;
      for (let step = 1; step <= steps; step++) {
        await page.mouse.move(
          from.x + (offset.x * step) / steps,
          from.y + (offset.y * step) / steps,
        );
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(400);
      await page.mouse.up();
      await page.waitForTimeout(400);
    },
    type: async (locator, text) => {
      await pointTo(locator);
      await locator.click();
      await locator.pressSequentially(text, { delay: 60 });
      await page.waitForTimeout(300);
    },
    // Put a text into a field in one step, as a paste does.
    paste: async (locator, text) => {
      await pointTo(locator);
      await locator.click();
      await locator.fill(text);
      // Show the start of a long text, not its end.
      await locator.evaluate((el) => {
        el.scrollLeft = 0;
      });
      await page.waitForTimeout(400);
    },
    // Show an own HTML scene over the page, for steps outside b.tree. The scene
    // is in a shadow root, so the styles of the app and of the scene do not mix.
    // setup(host) runs in the page and adds the behaviour of the scene. The
    // actions can then use the elements of the scene like the elements of the app.
    scene: async ({ html, setup }) => {
      await page.evaluate((markup) => {
        const host = document.createElement('div');
        host.id = 'video-scene';
        Object.assign(host.style, {
          position: 'fixed',
          inset: '0',
          // One below the mouse pointer.
          zIndex: '2147483646',
          opacity: '0',
          transition: 'opacity 0.5s',
        });
        host.attachShadow({ mode: 'open' }).innerHTML = markup;
        document.body.append(host);
        host.getBoundingClientRect();
        host.style.opacity = '1';
      }, html);
      await page.locator('#video-scene').evaluate(setup);
      await page.waitForTimeout(600);
    },
  };
}

// Headless Chrome sends screencast frames only in CSS pixels, so a phone recording
// gets blurry. Screenshots have the full device resolution and still reach about
// 30 frames per second. Each frame keeps its time in seconds since the start.
function startCapture(page, dir) {
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;
  const frames = [];
  const state = { running: true };
  const loop = (async () => {
    while (state.running) {
      const t = now();
      const file = path.join(
        dir,
        `${String(frames.length).padStart(6, '0')}.jpg`,
      );
      try {
        await page.screenshot({
          path: file,
          type: 'jpeg',
          quality: 90,
          caret: 'initial',
          timeout: 1500,
        });
        frames.push({ file, t });
      } catch (error) {
        // A screenshot can fail or get no answer while the browser opens
        // another page. The video then shows the frame before for a longer
        // time.
        const text = String(error);
        if (
          !text.includes('Unable to capture screenshot') &&
          !text.includes('Timeout')
        ) {
          throw error;
        }
      }
    }
  })();
  return {
    now,
    stop: async () => {
      state.running = false;
      await loop;
      return frames;
    },
  };
}

function duration(file) {
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

function srtTime(seconds) {
  const ms = Math.round(seconds * 1000);
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(
    Math.floor(ms / 1000) % 60,
  )},${pad(ms % 1000, 3)}`;
}

async function record(browser, episode, lang) {
  const demo = await openDemo(lang);
  const scenes = [];
  for (const scene of episode.scenes) {
    const file = await speech(
      scene.text[lang],
      lang,
      TTS_DIR,
      episode.hints?.[lang],
    );
    scenes.push({
      ...scene,
      text: scene.text[lang],
      file,
      length: duration(file),
    });
  }

  const name = `${episode.name}-${lang}`;
  const frameDir = path.join(WORK_DIR, 'frames', name);
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });
  // Bring the demo data into the state the episode starts from.
  if (episode.before) {
    await episode.before(demo);
  }
  const context = await newAppContext(
    browser,
    demo,
    VIDEO_SIZES[episode.size ?? 'desktop'],
    episode.storage,
  );
  const desktop = (episode.size ?? 'desktop') === 'desktop';
  await context.addInitScript(tapIndicator);
  await context.addInitScript(publicUrls, PUBLIC_URLS);
  if (episode.hidden) {
    await context.addInitScript(hideEntries, episode.hidden(demo));
  }
  if (desktop) {
    await context.addInitScript(mousePointer);
  }
  for (const script of episode.init ?? []) {
    await context.addInitScript(script);
  }
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: APP_URL,
  });
  const page = await context.newPage();
  await page.goto(APP_URL + episode.route(demo));
  await page.waitForLoadState('networkidle');
  const ui = helpers(page, desktop);
  if (episode.prepare) {
    await episode.prepare(page, demo, ui);
  }
  await page.waitForTimeout(500);

  // The recording starts after the page load.
  const capture = startCapture(page, frameDir);
  const now = capture.now;
  for (const scene of scenes) {
    scene.start = now();
    if (scene.action) {
      await page.waitForTimeout(300);
      await scene.action(page, { demo, ui });
    }
    const rest = scene.start + scene.length + PAUSE - now();
    if (rest > 0) {
      await page.waitForTimeout(rest * 1000);
    }
  }
  await page.waitForTimeout(END * 1000);
  const end = now();
  const frames = await capture.stop();
  await context.close();
  // Remove the demo data that the episode made, so that it does not show in
  // the other videos and in the screenshots.
  if (episode.after) {
    await episode.after(demo);
  }

  // The frames come at irregular times. The concat list gives each frame its
  // duration; the last file comes twice, or ffmpeg ignores its duration.
  const list = path.join(frameDir, 'frames.txt');
  await writeFile(
    list,
    frames
      .map((f, i) => {
        const next = frames[i + 1]?.t ?? end;
        return `file '${f.file}'\nduration ${(next - f.t).toFixed(4)}\n`;
      })
      .join('') + `file '${frames.at(-1).file}'\n`,
  );

  mkdirSync(OUT_DIR, { recursive: true });
  const srt = scenes
    .map(
      (s, i) =>
        `${i + 1}\n${srtTime(s.start)} --> ${srtTime(s.start + s.length)}\n${s.text}\n`,
    )
    .join('\n');
  await writeFile(path.join(OUT_DIR, `${name}.srt`), srt);

  const video16x9 =
    episode.size === 'mobile'
      ? `scale=-2:${FRAME.phoneHeight}:flags=lanczos,pad=${FRAME.width}:${FRAME.height}:(ow-iw)/2:(oh-ih)/2:color=${FRAME.colour}`
      : `scale=${FRAME.width}:${FRAME.height}:flags=lanczos`;
  const delays = scenes.map(
    (s, i) => `[${i + 1}:a]adelay=${Math.round(s.start * 1000)}:all=1[a${i}]`,
  );
  const mix = `${scenes.map((_, i) => `[a${i}]`).join('')}amix=inputs=${scenes.length}:normalize=0[a]`;
  const file = path.join(OUT_DIR, `${name}.mp4`);
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      list,
      ...scenes.flatMap((s) => ['-i', s.file]),
      '-filter_complex',
      [`[0:v]fps=30,${video16x9},format=yuv420p[v]`, ...delays, mix].join(';'),
      '-map',
      '[v]',
      '-map',
      '[a]',
      '-t',
      end.toFixed(3),
      '-c:v',
      'libx264',
      '-crf',
      '18',
      '-preset',
      'slow',
      '-c:a',
      'aac',
      '-b:a',
      '160k',
      '-movflags',
      '+faststart',
      file,
    ],
    { stdio: 'inherit' },
  );
  return file;
}

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // No .env file: use the environment only.
}
const [name, ...langs] = process.argv.slice(2);
const episode = EPISODES.find((e) => e.name === name);
if (!episode) {
  throw new Error(
    `Usage: node scripts/videos/record.mjs <episode> [lang ...]. Episodes: ${EPISODES.map((e) => e.name).join(', ')}`,
  );
}
const browser = await chromium.launch();
for (const lang of langs.length ? langs : ['de', 'en']) {
  console.log(
    path.relative(process.cwd(), await record(browser, episode, lang)),
  );
}
await browser.close();
