// Statistics: the evaluations of the Premium membership.
import { DEMO, call, day, withApi } from '../../screenshots/demo.mjs';

// The note that marks the data of the episode. The demo data has one season
// only, so the episode adds two older seasons and Varroa counts for the last
// three months, and removes them after the recording.
const MARK = 'video-statistics';
const ONCE = { done: true, interval: 0, repeat: 0 };

// Texts of the app that the actions look for.
const APP = {
  de: { statistics: 'Statistiken', checkup: 'Kontrolle' },
  en: { statistics: 'Statistics', checkup: 'Checkup' },
};
// Positions of the tabs of a task statistic.
const TAB = { apiary: 1, type: 2, average: 4, water: 5 };

export default {
  name: 'statistics',
  route: () => '/',
  // A run that failed can leave its data, so remove it first too.
  before: async (demo) => {
    await removeNewData();
    await addData(demo);
  },
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'Du trägst das ganze Jahr Daten ein. Mit Premium wertet b.tree sie für dich aus: Ernte, Fütterung, Behandlung, Varroa und die Zahl deiner Völker.',
        en: 'You enter data all year. With Premium, b.tree evaluates the data for you: harvest, feeding, treatment, Varroa and the number of your colonies.',
      },
    },
    {
      text: {
        de: 'Öffne im Menü die Statistiken und dann die Ernte Statistik. Sie vergleicht deine Jahre. In Klammer steht die Zahl der Völker.',
        en: 'In the menu, open Statistics and then the harvest statistic. It compares your years. The number in brackets is the number of colonies.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].statistics, { exact: true }),
        );
        await ui.tap(drawer(page, 'stats_harvest'));
        await ui.wait(2500);
        await ui.point(page.locator('canvas').first());
      },
    },
    {
      text: {
        de: 'Der Durchschnitt zeigt den Ertrag pro Volk. So siehst du, ob ein Jahr wirklich besser war. Auch den Wassergehalt kannst du vergleichen.',
        en: 'The average shows the yield for each colony. So you see if a year was really better. You can also compare the water content.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('.q-tab').nth(TAB.average));
        await ui.wait(4500);
        await ui.tap(page.locator('.q-tab').nth(TAB.water));
      },
    },
    {
      text: {
        de: 'Unter Stände vergleichst du deine Bienenstände, unter Typen deine Honigsorten. Mit Minus und Plus wechselst du das Jahr.',
        en: 'Under Apiaries, you compare your apiaries, and under Types your kinds of honey. With minus and plus, you change the year.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('.q-tab').nth(TAB.apiary));
        await ui.wait(1800);
        await ui.tap(page.locator('.q-tab').nth(TAB.type));
        await ui.wait(1200);
        await ui.tap(page.getByRole('button', { name: '-', exact: true }));
        await ui.wait(1200);
        await ui.tap(page.getByRole('button', { name: '+', exact: true }));
      },
    },
    {
      text: {
        de: 'Der Filter schränkt die Auswertung ein, zum Beispiel auf einen Typ, einen Stand oder einzelne Völker.',
        en: 'The filter limits the evaluation, for example to one type, one apiary or some colonies.',
      },
      action: async (page, { ui }) => {
        // The icon of the button changes when a filter is active.
        await ui.tap(
          page.locator('button:has(.fa-filter, .fa-filter-circle-xmark)'),
        );
        await ui.wait(4000);
        await ui.tap(
          page.locator('.q-dialog button:has(.fa-times, .fa-xmark)').first(),
        );
      },
    },
    {
      text: {
        de: 'Die Tabelle Ernte Stock zeigt die Summen pro Volk und Jahr. Sortiere nach der Menge, und du findest deine besten Völker.',
        en: 'The table Harvest Hive shows the totals for each colony and year. Sort by the amount, and you find your best colonies.',
      },
      action: async (page, { ui }) => {
        await ui.tap(drawer(page, 'table_harvest'));
        await ui.wait(1500);
        // The first click sorts from small to large, the second from large to small.
        await ui.tap(page.locator('thead th').nth(3));
        await ui.tap(page.locator('thead th').nth(3));
      },
    },
    {
      text: {
        de: 'Für Fütterung und Behandlung gibt es die gleichen Auswertungen.',
        en: 'Feeding and treatment have the same evaluations.',
      },
      action: async (page, { ui }) => {
        await ui.tap(drawer(page, 'stats_feed'));
        await ui.wait(1500);
        await ui.tap(drawer(page, 'stats_treatment'));
      },
    },
    {
      text: {
        de: 'Die Varroa Statistik nimmt den Milbenfall aus deinen Kontrollen. Wähle einen Stand. Du siehst Minimum, Maximum und Durchschnitt pro Volk, und darunter den Verlauf.',
        en: 'The Varroa statistic uses the mite counts from your checkups. Select an apiary. You see the minimum, the maximum and the average for each colony, and below them the trend.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(drawer(page, 'stats_varroa'));
        await ui.tap(page.locator('.q-page-container .q-select').first());
        await ui.tap(
          page.locator('.q-menu .q-item', {
            hasText: DEMO[demo.lang].apiaries[0],
          }),
        );
        await ui.wait(3500);
        await ui.point(page.locator('canvas').first());
      },
    },
    {
      text: {
        de: 'Und Anzahl Völker zeigt, wie viele Völker an jedem Stand stehen und wie sich dein Bestand entwickelt.',
        en: 'And Hive count shows how many colonies are at each apiary and how the number of your colonies changes.',
      },
      action: async (page, { ui }) => {
        await ui.tap(drawer(page, 'hive_count'));
        await ui.wait(3000);
        await ui.point(page.locator('canvas').nth(1));
      },
    },
    {
      text: {
        de: 'Jedes Diagramm kannst du als Bild speichern. So hast du die Zahlen deiner Imkerei immer zur Hand.',
        en: 'You can save each chart as an image. So you always have the numbers of your apiary business at hand.',
      },
    },
  ],
};

// Add harvests of two older seasons, a harvest of the second apiary in the
// demo season and three Varroa counts in the last three months.
function addData(demo) {
  const t = DEMO[demo.lang];
  return withApi(async (api) => {
    const hives = (
      await call(api, 'GET', 'hive?limit=50&order=name&direction=asc')
    ).results;
    const forest = hives.filter((h) => h.name.startsWith('A')).map((h) => h.id);
    const meadow = hives.filter((h) => h.name.startsWith('B')).map((h) => h.id);
    const harvestTypes = await optionIds(api, 'harvest_types');
    const season = Number(day('01-01').slice(0, 4));
    const harvest = (ids, date, type, amount, water) =>
      call(api, 'POST', 'harvest', {
        ...ONCE,
        hive_ids: ids,
        date,
        enddate: date,
        type_id: harvestTypes[t.harvest[type]],
        amount,
        frames: Math.round(amount / 2),
        water,
        note: MARK,
      });
    await harvest(forest, `${season - 2}-06-05`, 0, 8, 17.9);
    await harvest(meadow, `${season - 2}-07-25`, 1, 12, 17.6);
    await harvest(forest, `${season - 1}-06-03`, 0, 11, 17.5);
    await harvest(forest, `${season - 1}-07-20`, 1, 13, 17.1);
    await harvest(meadow, `${season - 1}-07-22`, 1, 9, 17.3);
    await harvest(meadow, day('07-26'), 1, 10, 16.9);

    const checkupTypes = await optionIds(api, 'checkup_types');
    const counts = [
      [80, 3.4],
      [50, 1.8],
      [20, 0.6],
    ];
    for (const [daysAgo, varroa] of counts) {
      const date = new Date(Date.now() - daysAgo * 86_400_000)
        .toISOString()
        .slice(0, 10);
      for (const [i, hiveId] of forest.entries()) {
        await call(api, 'POST', 'checkup', {
          ...ONCE,
          hive_ids: [hiveId],
          date,
          enddate: date,
          type_id: checkupTypes[APP[demo.lang].checkup],
          // The counts differ a little from hive to hive.
          varroa: Math.round(varroa * (1 + ((i % 3) - 1) * 0.25) * 10) / 10,
          note: MARK,
        });
      }
    }
  });
}

// Remove the data that the episode adds.
function removeNewData() {
  return withApi(async (api) => {
    for (const table of ['harvest', 'checkup']) {
      const ids = (await call(api, 'GET', `${table}?limit=500`)).results
        .filter((row) => row.note === MARK)
        .map((row) => row.id);
      if (ids.length > 0) {
        await call(api, 'PATCH', `${table}/batchDelete?hard=true`, { ids });
      }
    }
  });
}

// The ids of an option table by name.
async function optionIds(api, table) {
  const rows = await call(api, 'GET', `option/${table}`);
  return Object.fromEntries(rows.map((row) => [row.name, row.id]));
}

// The menu entry of a statistic page.
function drawer(page, name) {
  return page.locator(`.q-drawer a[href="/statistic/${name}"]`).first();
}
