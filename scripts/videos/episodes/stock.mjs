// Stock use: connect a feeding type with a stock item, so that a feeding
// books the sugar out of the stock.
import { DEMO, call, withApi } from '../../screenshots/demo.mjs';

// The feeding type that the episode connects. The demo data connects only the
// 3:2 sugar water.
const TYPE = '1:1';
// Litres of sugar water per hive in the feeding of the episode.
const AMOUNT = '5';

// Texts of the app that the actions look for.
const APP = {
  de: { storage: 'Lager', settings: 'Einstellungen', feeding: 'Fütterung' },
  en: { storage: 'Storage', settings: 'Settings', feeding: 'Feeding' },
};
// Position of "feeding types" in the list of the option tables.
const FEED_TYPES = 3;

export default {
  name: 'stock',
  route: () => '/',
  // A run that failed can leave its data, so remove it first too.
  before: removeNewData,
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'b.tree führt dein Lager mit. Wenn du fütterst, bucht die App den Zucker automatisch aus. Dafür verbindest du einmal den Fütterungstyp mit einem Lagerartikel.',
        en: 'b.tree keeps your stock up to date. When you feed, the app books the sugar out automatically. For this, you connect the feeding type with a stock item once.',
      },
    },
    {
      text: {
        de: 'Im Lagerbestand siehst du, wie viel von jedem Artikel da ist. Hier sind es knapp 460 Kilo Zucker.',
        en: 'The stock page shows the quantity of each item. Here it is almost 460 kilograms of sugar.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(group(page, APP[demo.lang].storage));
        await ui.tap(drawer(page, '/table/charge-stock'));
        await ui.point(sugarRow(page, demo));
      },
    },
    {
      text: {
        de: 'Öffne die Einstellungen und dann Optionen. Wähle oben die Fütterungstypen. Die Spalte Lagerverbrauch zeigt, welcher Typ schon verbunden ist.',
        en: 'Open Settings and then Options. At the top, select the feeding types. The column Stock use shows which type is connected.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(group(page, APP[demo.lang].settings));
        await ui.tap(drawer(page, '/setting/option/checkup_types'));
        await ui.tap(page.locator('.q-page-container .q-select').first());
        await ui.tap(page.locator('.q-menu .q-item').nth(FEED_TYPES));
        await ui.point(page.locator('thead th').nth(2));
      },
    },
    {
      text: {
        de: 'Markiere einen Typ und öffne Bearbeiten. Mit Produkt hinzufügen wählst du den Lagerartikel.',
        en: 'Mark a type and open Edit. With Add product, you select the stock item.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page.locator('tbody tr', { hasText: TYPE }).locator('.q-checkbox'),
        );
        await ui.tap(page.locator('[data-cy="btn-table-edit"]'));
        const dialog = page.locator('.q-dialog');
        await ui.tap(dialog.locator('button:has(.fa-plus)'));
        // The first select of the dialog is the list of the marked types.
        await ui.tap(dialog.locator('.q-select').nth(1));
        await ui.tap(
          page.locator('.q-menu .q-item', { hasText: DEMO[demo.lang].sugar }),
        );
      },
    },
    {
      text: {
        de: 'Dann kommt die Menge pro Einheit. Der Zuckerwasser-Rechner hilft dir: Ein Liter Zuckerwasser eins zu eins enthält 0,63 Kilo Zucker. Speichere mit Aktualisieren.',
        en: 'Then enter the quantity per unit. The sugar water calculator helps you: one litre of sugar water one to one contains 0.63 kilograms of sugar. Save with Update.',
      },
      action: async (page, { ui }) => {
        const dialog = page.locator('.q-dialog');
        await ui.tap(dialog.locator('button:has(.fa-calculator)'));
        await ui.wait(1500);
        // The first entry of the calculator is the 1:1 sugar water.
        await ui.tap(page.locator('.q-menu .q-item').first());
        await ui.wait(3000);
        await ui.tap(dialog.locator('[data-cy="btn-form-update"]'));
      },
    },
    {
      text: {
        de: 'Jetzt fütterst du wie immer. Im Quicktool wählst du Fütterung, den Stand, den Typ und die Menge. Hier sind es 5 Liter pro Volk.',
        en: 'Now you feed as usual. In the Quicktool, select Feeding, the apiary, the type and the quantity. Here it is 5 litres for each hive.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(drawer(page, '/new/quicktool/checkup'));
        // The task type is the first select of the page, above the form.
        await ui.tap(page.locator('.q-page-container .q-select').first());
        await ui.tap(
          page.locator('.q-menu .q-item', {
            hasText: APP[demo.lang].feeding,
          }),
        );
        const form = page.locator('[data-cy="form-quicktool"]');
        await ui.tap(form.locator('.q-select').first());
        await ui.tap(
          page.locator('.q-menu .q-item', {
            hasText: DEMO[demo.lang].apiaries[1],
          }),
        );
        await ui.tap(form.locator('[data-cy="dropdown-feed_types"]'));
        await ui.tap(page.locator('.q-menu .q-item', { hasText: TYPE }));
        await ui.paste(form.locator('[data-cy="input-amount"]'), AMOUNT);
      },
    },
    {
      text: {
        de: 'Beim Speichern meldet b.tree, wie viel Zucker aus dem Lager geht.',
        en: 'When you save, b.tree tells you how much sugar leaves the stock.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('[data-cy="btn-form-save"]'));
      },
    },
    {
      text: {
        de: 'Bei den Lagerbuchungen zeigt jede Buchung, von welcher Fütterung sie kommt.',
        en: 'In the stock movements, each movement shows the feeding that it comes from.',
      },
      action: async (page, { demo, ui }) => {
        // The menu shows one open group only, and that is Settings now.
        await ui.tap(group(page, APP[demo.lang].storage));
        await ui.tap(drawer(page, '/table/charge'));
        await ui.point(page.locator('tbody tr').first().locator('a'));
      },
    },
    {
      text: {
        de: 'Und der Lagerbestand ist um diesen Zucker kleiner.',
        en: 'And the stock is smaller by this sugar.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(drawer(page, '/table/charge-stock'));
        await ui.point(sugarRow(page, demo));
      },
    },
    {
      text: {
        de: 'Das geht auch bei Behandlungen. Bei der Ernte läuft es umgekehrt: Sie bucht den Honig ins Lager ein.',
        en: 'This works for treatments too. For a harvest, it works the other way: the harvest books the honey into the stock.',
      },
    },
  ],
};

// Remove the feedings and the connection that the episode makes. The server
// removes the stock movements of a feeding together with the feeding.
function removeNewData() {
  return withApi(async (api) => {
    const type = (await call(api, 'GET', 'option/feed_types')).find((t) =>
      t.name.startsWith(TYPE),
    );
    const ids = (await call(api, 'GET', 'feed?limit=100')).results
      .filter((feed) => feed.type_id === type.id)
      .map((feed) => feed.id);
    if (ids.length > 0) {
      await call(api, 'PATCH', 'feed/batchDelete?hard=true', { ids });
    }
    await call(api, 'PATCH', `option/feed_types/${type.id}/recipe`, {
      lines: [],
    });
  });
}

// The menu group with this text, and the menu entry that opens the route.
function group(page, text) {
  return page.locator('.q-drawer').getByText(text, { exact: true });
}
function drawer(page, route) {
  return page.locator(`.q-drawer a[href="${route}"]`).first();
}

// The row of the sugar in the stock table.
function sugarRow(page, demo) {
  return page.locator('tbody tr', { hasText: DEMO[demo.lang].sugar });
}
