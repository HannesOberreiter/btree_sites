// Demo data and browser login for the screenshot and video scripts.
//
// The app must run with the demo seed: scripts/screenshots/start-app.sh <btree checkout>.
// openDemo() creates one demo company per language with its apiaries, hives and tasks.
// newAppContext() opens a browser context that is logged in to that company.
import { execFileSync } from 'node:child_process';

import { devices, request } from 'playwright';

export const APP_URL = process.env.SHOTS_APP_URL ?? 'http://localhost:9000';
export const API_URL =
  process.env.SHOTS_API_URL ?? 'http://localhost:8112/api/v1/';
// Public demo account of the seed data.
const EMAIL = process.env.SHOTS_EMAIL ?? 'demo_en@btree.at';
export const PASSWORD = process.env.SHOTS_PASSWORD ?? 'demo_en';
const DB_CONTAINER = process.env.SHOTS_DB_CONTAINER ?? 'shots-mariadb';

// Run an SQL statement in the database of the demo app.
export function sql(statement) {
  execFileSync('docker', [
    'exec',
    DB_CONTAINER,
    'mariadb',
    '-uroot',
    '-proot',
    'ci_test',
    '-e',
    statement,
  ]);
}

export const SIZES = {
  desktop: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    // The app detects a phone from the user agent, not from the viewport.
    userAgent: devices['Pixel 7'].userAgent,
  },
};

// Texts of the demo data per language. Type names are the defaults that b.tree
// creates for a new company in that language.
export const DEMO = {
  en: {
    company: 'Demo Beekeeping',
    apiaries: ['Forest Apiary', 'Meadow Apiary'],
    checkup: 'Checkup',
    feed: '3:2 Sugarwater',
    treatment: 'Formic Acid',
    disease: 'Varroa',
    harvest: ['Rapeseed', 'Honeydew'],
    waxOrigins: ['Cappings wax', 'Old combs'],
    waxProducts: ['Wax block', 'Foundation'],
    waxProcessor: 'Wax Processing Ltd.',
    sugar: 'Feed-Sugar',
    sugarSearch: 'Sugar',
    formic: 'Formic acid 60 %',
    honey: 'Honey, raw',
    mating: 'Mating Place',
    colours: ['blue', 'white', 'yellow', 'red', 'green'],
    notes: {
      spring: 'Strong colony, added a honey super.',
      queen: 'Queen seen, brood pattern compact.',
      swarm: 'Removed two swarm cells.',
      sugar: 'Sugar delivery',
      formic: 'Formic acid, organic approved',
    },
  },
  de: {
    company: 'Demo Imkerei',
    apiaries: ['Waldstand', 'Wiesenstand'],
    checkup: 'Kontrolle',
    feed: '3:2 Zuckerwasser',
    treatment: 'Ameisensäure',
    disease: 'Varroa',
    harvest: ['Raps', 'Waldhonig'],
    waxOrigins: ['Deckelwachs', 'Altwaben'],
    waxProducts: ['Wachsblock', 'Mittelwände'],
    waxProcessor: 'Wachsverarbeitung Muster',
    sugar: 'Futter - Zucker',
    sugarSearch: 'Zucker',
    formic: 'Ameisensäure 60 %',
    honey: 'Rohhonig',
    mating: 'Belegstelle',
    colours: ['blau', 'weiß', 'gelb', 'rot', 'grün'],
    notes: {
      spring: 'Starkes Volk, Honigraum aufgesetzt.',
      queen: 'Königin gesehen, Brutnest geschlossen.',
      swarm: 'Zwei Schwarmzellen gebrochen.',
      sugar: 'Zuckerlieferung',
      formic: 'Ameisensäure, Bio zugelassen',
    },
  },
};

const FIELD_SETTINGS = {
  checkup: {
    ratings: {
      brood: false,
      calm_comb: true,
      comb: false,
      pollen: false,
      swarm: true,
      temper: true,
      max: 5,
    },
    checkboxes: {
      queen: true,
      queencells: true,
      capped_brood: true,
      eggs: true,
    },
    frame: {
      broodframes: true,
      honeyframes: true,
      foundation: false,
      emptyframes: false,
    },
    strength: true,
    weight: false,
    temperature: false,
    varroa: true,
  },
  harvest: { water: true, frames: true },
  treatment: { wait: true, vet: false, temperature: false },
  charge: { price: true, bestbefore: true },
  general: { url: false },
};

// The demo data uses the last complete season, so that no task lies in the future.
const now = new Date();
const SEASON = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
export const day = (monthDay) => `${SEASON}-${monthDay}`;
// Task fields for a done task without repetition.
const ONCE = { done: true, interval: 0, repeat: 0 };

async function login(api) {
  const response = await api.post('auth/login', {
    data: { email: EMAIL, password: PASSWORD },
  });
  if (!response.ok()) {
    throw new Error(
      `Login failed: ${response.status()} ${await response.text()}`,
    );
  }
  return (await response.json()).data;
}

export async function call(api, method, url, data) {
  const response = await api.fetch(url, { method, data });
  if (!response.ok()) {
    throw new Error(
      `${method} ${url}: ${response.status()} ${await response.text()}`,
    );
  }
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

async function optionIds(api, table) {
  const rows = await call(api, 'GET', `option/${table}`);
  return Object.fromEntries(rows.map((row) => [row.name, row.id]));
}

// Create the demo company of one language with its data. Returns the ids the
// screenshots need. Reuses the company when it exists, so a second run does not
// create duplicates. Restart the app to load fresh data.
async function setupDemo(api, lang) {
  const t = DEMO[lang];
  await call(api, 'PATCH', 'user', { lang });
  let user = await login(api);
  let company = user.company.find((c) => c.name === t.company);
  if (!company) {
    company = await call(api, 'POST', 'company', { name: t.company });
  }
  await call(api, 'PATCH', 'user/company', { saved_company: company.id });
  // Premium hides the upgrade hints and lifts the hive limit of the free plan.
  sql(
    `update companies set paid = '2100-01-01' where id = ${Number(company.id)}`,
  );
  user = await login(api);
  // Show the optional checkup and harvest fields in the forms.
  await call(api, 'PATCH', 'field_setting', { settings: FIELD_SETTINGS });

  let hives = (await call(api, 'GET', 'hive?limit=50&order=name&direction=asc'))
    .results;
  if (!hives.some((h) => h.name === 'A01')) {
    await createData(api, t);
    hives = (await call(api, 'GET', 'hive?limit=50&order=name&direction=asc'))
      .results;
  }
  return { lang, user, company, hive: hives.find((h) => h.name === 'A01') };
}

async function createData(api, t) {
  const apiaries =
    (await call(api, 'GET', 'apiary')).results ??
    (await call(api, 'GET', 'apiary'));
  const sample = apiaries[0];
  await call(api, 'PATCH', 'apiary', {
    ids: [sample.id],
    data: { name: t.apiaries[0] },
  });
  const meadow = await call(api, 'POST', 'apiary', {
    name: t.apiaries[1],
    latitude: 47.08,
    longitude: 12.71,
  });

  const hiveDate = day('03-20');
  await call(api, 'POST', 'hive', {
    name: 'A0',
    start: 1,
    repeat: 6,
    apiary_id: sample.id,
    date: hiveDate,
  });
  await call(api, 'POST', 'hive', {
    name: 'B0',
    start: 1,
    repeat: 4,
    apiary_id: meadow.id,
    date: hiveDate,
  });
  const hives = (
    await call(api, 'GET', 'hive?limit=50&order=name&direction=asc')
  ).results;
  const forest = hives.filter((h) => h.name.startsWith('A')).map((h) => h.id);
  const all = hives.map((h) => h.id);

  const checkupTypes = await optionIds(api, 'checkup_types');
  const feedTypes = await optionIds(api, 'feed_types');
  const treatmentTypes = await optionIds(api, 'treatment_types');
  const diseases = await optionIds(api, 'treatment_diseases');
  const vets = await optionIds(api, 'treatment_vets');
  const harvestTypes = await optionIds(api, 'harvest_types');
  // Favorites come first in the forms.
  await call(api, 'PATCH', 'option/checkup_types/favorite', {
    ids: [checkupTypes[t.checkup]],
  });

  // Stock. Feedings and treatments book their material out through recipes:
  // 0.79 kg sugar per liter of 3:2 sugar water, 0.2 l formic acid per hive.
  // Harvests book their raw honey in, 1 kg per kg harvested.
  await call(api, 'POST', 'option/charge_types', { name: t.formic, unit: 'l' });
  await call(api, 'POST', 'option/charge_types', { name: t.honey, unit: 'kg' });
  const stockTypes = await optionIds(api, 'charge_types');
  const recipe = (table, typeId, chargeType, mode, factor, kind = 'out') =>
    call(api, 'PATCH', `option/${table}/${typeId}/recipe`, {
      lines: [{ charge_type_id: stockTypes[chargeType], kind, mode, factor }],
    });
  await recipe('feed_types', feedTypes[t.feed], t.sugar, 'per_amount', 0.79);
  await recipe(
    'treatment_types',
    treatmentTypes[t.treatment],
    t.formic,
    'per_hive',
    0.2,
  );
  for (const harvest of t.harvest) {
    await recipe(
      'harvest_types',
      harvestTypes[harvest],
      t.honey,
      'per_amount',
      1,
      'in',
    );
  }
  const stockIn = (date, type, amount, price, name, charge, bestbefore) =>
    call(api, 'POST', 'charge', {
      kind: 'in',
      date: day(date),
      type_id: stockTypes[type],
      amount,
      price,
      name,
      charge,
      bestbefore,
    });
  await stockIn(
    '07-20',
    t.sugar,
    600,
    540,
    t.notes.sugar,
    `R-${SEASON}-0715`,
    `${SEASON + 2}-07-31`,
  );
  await stockIn(
    '07-22',
    t.formic,
    5,
    62.5,
    t.notes.formic,
    `AS-${String(SEASON).slice(2)}-3381`,
    `${SEASON + 1}-12-31`,
  );

  // Queen of the previous year, marked with the international year colour.
  const races = await optionIds(api, 'queen_races');
  const matings = await optionIds(api, 'queen_matings');
  await call(api, 'POST', 'queen', {
    name: `Q-${String(SEASON - 1).slice(2)}-07`,
    hive_id: hives.find((h) => h.name === 'A01').id,
    date: `${SEASON - 1}-06-10`,
    move_date: `${SEASON - 1}-06-24`,
    mark_colour: t.colours[(SEASON - 1) % 5],
    race_id: races['A.m.Mellifera'],
    mating_id: matings[t.mating],
    modus: true,
  });

  // One checkup per hive. Values vary a little from hive to hive, the note goes to the
  // first hive only.
  const VARY = [0, 1, -1, 0, -1, 1, 1, 0, -1, 0];
  const checkup = async (date, hiveIds, { note, varroa, ...values }) => {
    for (const [i, hiveId] of hiveIds.entries()) {
      const v = VARY[i % VARY.length];
      await call(api, 'POST', 'checkup', {
        hive_ids: [hiveId],
        date,
        enddate: date,
        type_id: checkupTypes[t.checkup],
        ...ONCE,
        queen: v >= 0,
        eggs: true,
        capped_brood: true,
        ...values,
        broodframes: values.broodframes + v,
        honeyframes: Math.max(values.honeyframes + v, 0),
        strong: Math.min(Math.max(values.strong + v, 1), 5),
        ...(varroa !== undefined && {
          varroa: Math.round((varroa + v * varroa * 0.3) * 10) / 10,
        }),
        ...(i === 0 && note && { note }),
      });
    }
  };
  await checkup(day('04-12'), all, {
    broodframes: 5,
    honeyframes: 2,
    strong: 3,
    temper: 4,
    calm_comb: 4,
  });
  await checkup(day('05-03'), forest, {
    broodframes: 7,
    honeyframes: 3,
    strong: 4,
    temper: 4,
    calm_comb: 4,
    note: t.notes.spring,
  });
  await checkup(day('05-24'), forest, {
    broodframes: 8,
    honeyframes: 5,
    strong: 4,
    temper: 3,
    calm_comb: 4,
    queencells: true,
    swarm: 2,
    note: t.notes.swarm,
  });
  await checkup(day('06-14'), forest, {
    broodframes: 8,
    honeyframes: 6,
    strong: 4,
    temper: 4,
    calm_comb: 5,
    note: t.notes.queen,
  });
  await checkup(day('07-05'), all, {
    broodframes: 7,
    honeyframes: 7,
    strong: 4,
    temper: 4,
    calm_comb: 5,
  });
  await checkup(day('07-28'), all, {
    broodframes: 6,
    honeyframes: 2,
    strong: 4,
    temper: 4,
    calm_comb: 5,
    varroa: 4.5,
  });

  const task = (table, body) => call(api, 'POST', table, { ...ONCE, ...body });
  await task('harvest', {
    hive_ids: forest,
    date: day('06-01'),
    enddate: day('06-01'),
    type_id: harvestTypes[t.harvest[0]],
    amount: 14,
    frames: 8,
    water: 17.2,
  });
  await task('harvest', {
    hive_ids: forest,
    date: day('07-24'),
    enddate: day('07-24'),
    type_id: harvestTypes[t.harvest[1]],
    amount: 18,
    frames: 9,
    water: 16.8,
  });
  await task('treatment', {
    hive_ids: all,
    date: day('07-30'),
    enddate: day('08-06'),
    type_id: treatmentTypes[t.treatment],
    disease_id: diseases[t.disease],
    vet_id: Object.values(vets)[0],
    amount: 2,
    wait: 0,
  });
  await task('feed', {
    hive_ids: all,
    date: day('08-02'),
    enddate: day('08-02'),
    type_id: feedTypes[t.feed],
    amount: 10,
  });
  await task('feed', {
    hive_ids: all,
    date: day('08-23'),
    enddate: day('08-23'),
    type_id: feedTypes[t.feed],
    amount: 8,
  });
  await checkup(day('09-15'), all, {
    broodframes: 5,
    honeyframes: 3,
    strong: 4,
    temper: 4,
    calm_comb: 5,
    varroa: 0.8,
  });

  // Wax cycle: own wax from cappings and old combs, processed into foundation.
  const waxOrigins = await optionIds(api, 'wax_origin_types');
  const waxProducts = await optionIds(api, 'wax_products');
  const lot = (code, product, kg) => ({
    code,
    product_id: waxProducts[product],
    quantity_kg: kg,
  });
  await call(api, 'POST', 'wax/operations', {
    date: day('07-24'),
    type: 'production',
    origin_type_id: waxOrigins[t.waxOrigins[0]],
    hive_ids: forest,
    outputs: [lot(`W-${SEASON}-01`, t.waxProducts[0], 3.2)],
  });
  await call(api, 'POST', 'wax/operations', {
    date: day('08-28'),
    type: 'production',
    origin_type_id: waxOrigins[t.waxOrigins[1]],
    hive_ids: all,
    outputs: [lot(`W-${SEASON}-02`, t.waxProducts[0], 4.6)],
  });
  const lots = Object.fromEntries(
    (await call(api, 'GET', 'wax/lots')).results.map((l) => [l.code, l.id]),
  );
  await call(api, 'POST', 'wax/operations', {
    date: day('09-25'),
    type: 'contract_processing',
    counterparty: t.waxProcessor,
    reference: `${SEASON}-118`,
    inputs: [
      { lot_id: lots[`W-${SEASON}-01`], quantity_kg: 3.2 },
      { lot_id: lots[`W-${SEASON}-02`], quantity_kg: 4.6 },
    ],
    outputs: [lot(`MW-${SEASON}-01`, t.waxProducts[1], 7.4)],
  });
}

// Create or reuse the demo company of one language. Returns the ids that the
// screenshots and videos need: { lang, user, company, hive }.
export function openDemo(lang) {
  return withApi((api) => setupDemo(api, lang));
}

// Run fn(api, user) with an API request context that is logged in to the demo
// account. user is the login response with the companies of the account.
// Use call(api, method, url, data) for the requests.
export async function withApi(fn) {
  const api = await request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { origin: APP_URL },
  });
  try {
    return await fn(api, await login(api));
  } finally {
    await api.dispose();
  }
}

// Open a browser context that is logged in to the demo company.
// options go to browser.newContext(), storage goes to localStorage as JSON.
export async function newAppContext(browser, demo, options, storage = {}) {
  const context = await browser.newContext({
    locale: demo.lang === 'de' ? 'de-AT' : 'en-US',
    ...options,
  });
  // Share the session cookie of the API login with the browser.
  const response = await context.request.post(
    new URL('auth/login', API_URL).toString(),
    {
      headers: { origin: APP_URL },
      data: { email: EMAIL, password: PASSWORD },
    },
  );
  const user = (await response.json()).data;
  const company = user.company.find((c) => c.id === demo.company.id);
  await context.addInitScript(
    ({ u, c, s }) => {
      if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('company', JSON.stringify(c));
        for (const [key, value] of Object.entries(s)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    },
    { u: user, c: company, s: storage },
  );
  return context;
}
