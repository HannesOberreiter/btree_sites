// Introduction: the first steps in b.tree, from the calendar to the first hives.
import { call, withApi } from '../../screenshots/demo.mjs';

// Month of the demo season that the calendar shows: August, the month with
// treatments and feedings.
const CALENDAR_MONTH = 7;
// Name and number of the new hives: C01, C02, C03.
const HIVES = { name: 'C0', count: 3 };

// Texts of the app that the actions look for, and the name of the new apiary.
const APP = {
  de: {
    previousMonth: 'Vorheriger Monat',
    hives: 'Völker',
    settings: 'Einstellungen',
    name: 'Name',
    newApiary: 'Bergstand',
  },
  en: {
    previousMonth: 'Previous month',
    hives: 'Colonies',
    settings: 'Settings',
    name: 'Name',
    newApiary: 'Mountain Apiary',
  },
};

export default {
  name: 'intro',
  route: () => '/',
  // A run that failed can leave its apiary and hives, so remove them first too.
  before: removeNewData,
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'b.tree ist deine digitale Stockkarte. Dieses Video zeigt dir die ersten Schritte.',
        en: 'b.tree is your digital hive record. This video shows you the first steps.',
      },
    },
    {
      text: {
        de: 'Die Startseite ist der Kalender. Er zeigt alle Aufgaben, die erledigten und die geplanten. Mit den Pfeilen blätterst du durch die Monate.',
        en: 'The start page is the calendar. It shows all tasks, the done ones and the planned ones. With the arrows, you move through the months.',
      },
      action: async (page, { demo, ui }) => {
        const previous = page.getByRole('button', {
          name: APP[demo.lang].previousMonth,
        });
        await ui.wait(3000);
        for (let i = 0; i < monthsBack(); i++) {
          await ui.tap(previous);
        }
      },
    },
    {
      text: {
        de: 'Links ist das Menü mit allen Bereichen. Oben ist die Suche. Sie bringt dich schnell zu einem Volk oder zu einem Stand.',
        en: 'On the left is the menu with all areas. At the top is the search. It takes you quickly to a hive or to an apiary.',
      },
      action: async (page, { ui }) => {
        await ui.point(drawer(page, '/new/quicktool/checkup'));
        await ui.wait(1500);
        await ui.type(
          page.locator('[data-cy="select-search-hive-apiary"]'),
          'A01',
        );
        await ui.tap(page.locator('.q-menu .q-item').first());
      },
    },
    {
      text: {
        de: 'Beim Volk siehst du alles, was du in einem Jahr gemacht hast: Kontrollen, Fütterungen, Behandlungen und Ernten.',
        en: 'At the hive, you see all the work of one year: checkups, feedings, treatments and harvests.',
      },
      action: async (page, { ui }) => {
        await ui.point(page.locator('.q-page-container .q-item').nth(3));
      },
    },
    {
      text: {
        de: 'Jedes Volk steht auf einem Stand. Lege deshalb zuerst einen Stand an. Öffne dazu im Menü Völker und dann die Standkarte.',
        en: 'Each hive stands on an apiary. So create an apiary first. In the menu, open Colonies and then the Apiary Map.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].hives, { exact: true }),
        );
        await ui.tap(drawer(page, '/map/apiary'));
      },
    },
    {
      text: {
        de: 'Ein Doppelklick auf die Karte legt den Stand an dieser Stelle an. Gib ihm einen Namen und speichere.',
        en: 'A double click on the map creates the apiary at this place. Give it a name and save.',
      },
      action: async (page, { demo, ui }) => {
        await ui.doubleTap(page.locator('.leaflet-container'), {
          x: 720,
          y: 300,
        });
        await ui.type(
          page.locator('.q-dialog').getByLabel(APP[demo.lang].name, {
            exact: true,
          }),
          APP[demo.lang].newApiary,
        );
        await ui.tap(page.locator('.q-dialog [data-cy="btn-form-save"]'));
      },
    },
    {
      text: {
        de: 'Jetzt kommen die Völker. Mit dem Symbol neben dem Namen legst du mehrere Völker auf einmal an. b.tree nummeriert sie für dich.',
        en: 'Now add the hives. With the symbol next to the name, you create more than one hive at once. b.tree numbers them for you.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(drawer(page, '/new/hive'));
        const form = page.locator('.q-page-container');
        await ui.type(
          form.getByLabel(APP[demo.lang].name, { exact: true }),
          HIVES.name,
        );
        await ui.tap(form.locator('[data-cy="btn-repeat"]'));
        await ui.tap(plus(form, 'input-start'));
        for (let i = 0; i < HIVES.count; i++) {
          await ui.tap(plus(form, 'input-numberHives'));
        }
      },
    },
    {
      text: {
        de: 'Wähle den Stand. Das Datum der Wanderung sagt, seit wann die Völker dort stehen. Es muss vor deiner ersten Aufgabe liegen.',
        en: 'Select the apiary. The movement date tells since when the hives stand there. It must be before your first task.',
      },
      action: async (page, { demo, ui }) => {
        const form = page.locator('.q-page-container');
        await ui.tap(form.locator('[data-cy="dropdown-apiary"]'));
        await ui.tap(
          page.locator('.q-menu .q-item', {
            hasText: APP[demo.lang].newApiary,
          }),
        );
        await ui.point(form.locator('.fa-calendar').first());
        await ui.wait(3500);
        await ui.tap(form.locator('[data-cy="btn-form-save"]'));
      },
    },
    {
      text: {
        de: 'Aufgaben trägst du am schnellsten im Quicktool ein: für ein Volk oder gleich für den ganzen Stand.',
        en: 'The Quicktool is the fastest way to record tasks: for one hive or for the full apiary at once.',
      },
      action: async (page, { ui }) => {
        await ui.tap(drawer(page, '/new/quicktool/checkup'));
        // The task type is the first select of the page, above the form.
        await ui.tap(page.locator('.q-page-container .q-select').first());
        await ui.wait(2500);
        await page.keyboard.press('Escape');
        await ui.tap(
          page.locator('[data-cy="form-quicktool"] .q-select').first(),
        );
        await ui.wait(2000);
        await page.keyboard.press('Escape');
      },
    },
    {
      text: {
        de: 'In den Einstellungen passt du b.tree an deine Betriebsweise an. Bei den Feldern blendest du ein, was du brauchst.',
        en: 'In the settings, you adapt b.tree to your way of beekeeping. In Fields, you show the fields that you need.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].settings, { exact: true }),
        );
        await ui.tap(drawer(page, '/setting/field'));
        await ui.tap(page.locator('.q-page-container .q-toggle').first());
      },
    },
    {
      text: {
        de: 'In den Optionen legst du eigene Typen an, zum Beispiel für Kontrollen, Behandlungen und Futter.',
        en: 'In Options, you create your own types, for example for checkups, treatments and feed.',
      },
      action: async (page, { ui }) => {
        await ui.tap(drawer(page, '/setting/option/checkup_types'));
        await ui.tap(page.locator('.q-page-container .q-select').first());
        await ui.wait(3000);
        await page.keyboard.press('Escape');
      },
    },
    {
      text: {
        de: 'Das Fragezeichen unten zeigt dir zu jeder Seite eine kurze Hilfe.',
        en: 'The question mark at the bottom shows a short help text for each page.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('.q-footer .q-btn:has(.fa-circle-question)'));
      },
    },
    {
      text: {
        de: 'Das waren die ersten Schritte. Die anderen Videos zeigen dir die einzelnen Bereiche genauer.',
        en: 'These were the first steps. The other videos show you each area in more detail.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('.q-dialog button', { hasText: 'Ok' }));
      },
    },
  ],
};

// Remove the apiary and the hives that the episode makes.
function removeNewData() {
  return withApi(async (api) => {
    const names = new Set(Object.values(APP).map((t) => t.newApiary));
    const hives = (await call(api, 'GET', 'hive?limit=50')).results
      .filter((hive) => hive.name.startsWith(HIVES.name))
      .map((hive) => hive.id);
    if (hives.length > 0) {
      await call(api, 'PATCH', 'hive/batchDelete?hard=true', { ids: hives });
    }
    const apiaries = (await call(api, 'GET', 'apiary')).results
      .filter((apiary) => names.has(apiary.name))
      .map((apiary) => apiary.id);
    if (apiaries.length > 0) {
      await call(api, 'PATCH', 'apiary/batchDelete?hard=true', {
        ids: apiaries,
      });
    }
  });
}

// Number of months from the current month back to the calendar month of the
// demo season. The season is this year from October on, else the last year.
function monthsBack() {
  const now = new Date();
  const season =
    now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  return (now.getFullYear() - season) * 12 + now.getMonth() - CALENDAR_MONTH;
}

// The menu entry that opens the route.
function drawer(page, route) {
  return page.locator(`.q-drawer a[href="${route}"]`).first();
}

// The plus button of a number field.
function plus(form, field) {
  return form
    .locator('.q-field', { has: form.page().locator(`[data-cy="${field}"]`) })
    .locator('.q-btn:has(.fa-plus)');
}
