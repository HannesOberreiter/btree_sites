// Take the screenshots for the feature pages from a local b.tree app.
//
// 1. Start the app with demo data: scripts/screenshots/start-app.sh <path to btree checkout>
// 2. Run: node scripts/screenshots/take.mjs [name ...]
// 3. Stop the app: scripts/screenshots/stop-app.sh
//
// The script creates one demo company per language (English and German) with its own
// apiaries, hives and tasks, then takes each screenshot in both languages at desktop
// and mobile size. Without names it takes all screenshots.
// Images go to packages/btree_info/src/images/features/<name>-<lang>-<size>.png.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { APP_URL, DEMO, SIZES, day, newAppContext, openDemo } from './demo.mjs';

const OUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/btree_info/src/images/features',
);

// Screenshots: name, route and an optional step before the screenshot.
// ctx has the ids from setupDemo.
const SHOTS = [
  {
    name: 'hive-record',
    route: (ctx) => `/detail/hive/${ctx.hive.id}`,
    // Open one inspection to show its details.
    prepare: (page) =>
      page
        .locator('.q-expansion-item .q-item')
        .filter({ hasText: day('06-14') })
        .first()
        .click(),
  },
  { name: 'stock', route: () => '/table/charge-stock', sizes: ['desktop'] },
  {
    name: 'stock-movements',
    route: () => '/table/charge',
    sizes: ['desktop'],
    storage: {
      'table-length-charge': 20,
      'table-visible-charge': [
        'date',
        'kind',
        'type.name',
        'name',
        'amount',
        'charge',
        'bestbefore',
        'source',
      ],
    },
    // Only sugar: the delivery and the feedings that book it out.
    prepare: async (page, ctx) => {
      const loaded = page.waitForResponse((r) => r.url().includes('/charge?'));
      await page
        .locator(
          '.q-table__container input[type="search"], .q-table__container input',
        )
        .first()
        .fill(DEMO[ctx.lang].sugarSearch);
      await loaded;
      await page.waitForTimeout(300);
    },
  },
  {
    name: 'wax',
    route: () => '/table/wax',
    sizes: ['desktop'],
    // The operations tab shows the way from the comb to the foundation.
    prepare: (page) => page.locator('.q-tab').nth(2).click(),
  },
  {
    name: 'quicktool',
    route: () => '/new/quicktool/checkup',
    // Select all hives of the first apiary and write a note.
    prepare: async (page, ctx) => {
      await page
        .locator('.q-field')
        .filter({ has: page.locator('.fa-location-dot') })
        .click();
      await page
        .locator('.q-menu .q-item, .q-dialog .q-item')
        .filter({ hasText: DEMO[ctx.lang].apiaries[0] })
        .click();
      await page.keyboard.press('Escape');
      // Queen and eggs seen.
      await page.locator('.q-checkbox').nth(0).click();
      await page.locator('.q-checkbox').nth(2).click();
      await page.locator('textarea').fill(DEMO[ctx.lang].notes.queen);
      await page.locator('textarea').blur();
      await page.evaluate(() => window.scrollTo(0, 0));
    },
  },
  {
    name: 'checkup-table',
    route: () => '/table/checkup',
    sizes: ['desktop'],
    // Table settings the app keeps in localStorage: newest first, 20 rows, more columns.
    storage: {
      'table-sort-direction-checkup': true,
      'table-length-checkup': 20,
      'table-visible-checkup': [
        'date',
        'type.name',
        'hive.name',
        'queen',
        'eggs',
        'broodframes',
        'honeyframes',
        'strong',
        'varroa',
        'done',
      ],
    },
  },
];

async function takeShot(browser, shot, lang, size, demo) {
  const context = await newAppContext(browser, demo, SIZES[size], shot.storage);
  const page = await context.newPage();
  await page.goto(APP_URL + shot.route(demo));
  await page.waitForLoadState('networkidle');
  if (shot.prepare) {
    await shot.prepare(page, demo);
  }
  await page.waitForTimeout(500);
  const file = path.join(OUT_DIR, `${shot.name}-${lang}-${size}.png`);
  await page.screenshot({ path: file });
  await context.close();
  return file;
}

const wanted = process.argv.slice(2);
const shots = wanted.length
  ? SHOTS.filter((s) => wanted.includes(s.name))
  : SHOTS;
mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
for (const lang of ['en', 'de']) {
  const demo = await openDemo(lang);
  for (const shot of shots) {
    for (const size of shot.sizes ?? Object.keys(SIZES)) {
      console.log(
        path.relative(
          process.cwd(),
          await takeShot(browser, shot, lang, size, demo),
        ),
      );
    }
  }
}
await browser.close();
