// Test episode: one checkup for all hives of an apiary with the Quicktool, on a phone.
import { DEMO, call, day, withApi } from '../../screenshots/demo.mjs';

export default {
  name: 'quick-checkup',
  size: 'mobile',
  route: () => '/new/quicktool/checkup',
  // A run that failed can leave its data, so remove it first too.
  before: removeNewData,
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'Mit dem Quicktool trägst du eine Kontrolle für viele Völker auf einmal ein.',
        en: 'With the Quicktool, you add one checkup for many hives at once.',
      },
    },
    {
      text: {
        de: 'Wähle zuerst deinen Stand. b.tree wählt dann alle Völker auf diesem Stand aus.',
        en: 'First, pick your apiary. b.tree then selects all hives on this apiary.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-field')
            .filter({ has: page.locator('.fa-location-dot') }),
        );
        await ui.tap(
          page
            .locator('.q-menu .q-item, .q-dialog .q-item')
            .filter({ hasText: DEMO[demo.lang].apiaries[0] }),
        );
        await page.keyboard.press('Escape');
      },
    },
    {
      text: {
        de: 'Hake an, was du gesehen hast, zum Beispiel Königin und Stifte.',
        en: 'Tick what you saw, for example the queen and eggs.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('.q-checkbox').nth(0));
        await ui.tap(page.locator('.q-checkbox').nth(2));
      },
    },
    {
      text: {
        de: 'Eine Notiz kannst du auch dazuschreiben.',
        en: 'You can also add a note.',
      },
      action: async (page, { demo, ui }) => {
        await ui.type(page.locator('textarea'), DEMO[demo.lang].notes.queen);
      },
    },
    {
      text: {
        de: 'Speichern, und jedes Volk hat seine Kontrolle.',
        en: 'Save, and every hive has its checkup.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('[data-cy="btn-form-save-mobile"]'));
      },
    },
  ],
};

// Remove the checkups that the episode saves. The demo data has one checkup
// with the same note, on a fixed day of the season.
function removeNewData(demo) {
  return withApi(async (api) => {
    const ids = (await call(api, 'GET', 'checkup?limit=500')).results
      .filter(
        (checkup) =>
          checkup.note === DEMO[demo.lang].notes.queen &&
          !checkup.date.startsWith(day('06-14')),
      )
      .map((checkup) => checkup.id);
    if (ids.length > 0) {
      await call(api, 'PATCH', 'checkup/batchDelete?hard=true', { ids });
    }
  });
}
