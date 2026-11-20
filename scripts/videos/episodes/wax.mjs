// Wax cycle: the wax ledger with lots, operations and the export.
import { DEMO, call, withApi } from '../../screenshots/demo.mjs';

// Kilograms of foundation that the episode books into the hives.
const AMOUNT = '2';
// Position of "use wax" in the list of the operation types.
const USE = 4;

// Texts of the app that the actions look for.
const APP = {
  de: { storage: 'Lager' },
  en: { storage: 'Storage' },
};

export default {
  name: 'wax',
  route: () => '/',
  // A run that failed can leave its data, so remove it first too.
  before: removeNewData,
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'Woher kommt das Wachs in deinen Mittelwänden? Der Wachskreislauf in b.tree gibt die Antwort. Er führt dein Wachs in Losen, von der Herkunft bis zurück in die Völker.',
        en: 'Where does the wax in your foundation come from? The wax cycle in b.tree gives the answer. It keeps your wax in lots, from the origin back into the hives.',
      },
    },
    {
      text: {
        de: 'Du findest ihn im Menü unter Lager. Die Produktübersicht zeigt den Bestand pro Wachsprodukt.',
        en: 'You find it in the menu under Storage. The product summary shows the stock of each wax product.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].storage, { exact: true }),
        );
        await ui.tap(page.locator('.q-drawer a[href="/table/wax"]').first());
        await ui.tap(cy(page, 'wax-summary-tab'));
        await ui.point(cy(page, 'wax-summary-table').locator('tbody tr'));
      },
    },
    {
      text: {
        de: 'Unter Bestand und Lose hat jedes Los seine Nummer. Mit dem Schalter siehst du auch die Lose, die schon leer sind.',
        en: 'Under Stock and lots, each lot has its number. With the switch, you also see the lots that are empty.',
      },
      action: async (page, { ui }) => {
        await ui.tap(cy(page, 'wax-lots-tab'));
        await ui.wait(1500);
        await ui.tap(cy(page, 'wax-show-empty'));
      },
    },
    {
      text: {
        de: 'Die Arbeitsgänge sind dein Wachsjournal. Hier wurde zuerst Deckelwachs eingelagert, dann Wachs aus Altwaben, jeweils mit den Völkern, von denen es stammt.',
        en: 'The operations are your wax journal. Here, wax from cappings was stored first, then wax from old combs, each with the hives that it comes from.',
      },
      action: async (page, { ui }) => {
        await ui.tap(cy(page, 'wax-operations-tab'));
        const rows = cy(page, 'wax-operations-table').locator('tbody tr');
        // Each operation has two rows. The oldest operation is the last one.
        await ui.point(rows.nth(4).locator('td').nth(1));
        await ui.wait(2500);
        await ui.point(rows.nth(2).locator('td').nth(1));
      },
    },
    {
      text: {
        de: 'Danach ging das Wachs zur Lohnverarbeitung. Aus 7,8 Kilo Wachsblock wurden 7,4 Kilo Mittelwände. b.tree berechnet die Differenz als Verarbeitungsverlust.',
        en: 'Then the wax went to contract processing. 7.8 kilograms of wax block became 7.4 kilograms of foundation. b.tree calculates the difference as the processing loss.',
      },
      action: async (page, { ui }) => {
        const row = cy(page, 'wax-operations-table').locator('tbody tr');
        await ui.point(row.first().locator('td').nth(1));
        await ui.wait(4000);
        await ui.point(row.first().locator('td').nth(4));
      },
    },
    {
      text: {
        de: 'Eine neue Bewegung trägst du mit Wachs buchen ein. Es gibt sieben Arbeitsgänge, vom Einlagern über Zukauf und Verarbeitung bis zum Verkauf.',
        en: 'You enter a new movement with Book wax. There are seven operations, from storing through purchase and processing to the sale.',
      },
      action: async (page, { ui }) => {
        await ui.tap(cy(page, 'wax-book-operation'));
        await ui.tap(cy(page, 'wax-operation-type'));
        await ui.wait(4000);
        await ui.tap(page.locator('.q-menu .q-item').nth(USE));
      },
    },
    {
      text: {
        de: 'Hier kommen Mittelwände in die Völker. Wähle den Stand, das Los und die Menge, und speichere.',
        en: 'Here, foundation goes into the hives. Select the apiary, the lot and the quantity, and save.',
      },
      action: async (page, { demo, ui }) => {
        const dialog = cy(page, 'wax-operation-dialog');
        // The first select of the dialog is the operation type.
        await ui.tap(dialog.locator('.q-select').nth(1));
        await ui.tap(
          page.locator('.q-menu .q-item', {
            hasText: DEMO[demo.lang].apiaries[0],
          }),
        );
        await ui.tap(cy(page, 'wax-input-lot'));
        await ui.tap(page.locator('.q-menu .q-item').first());
        await ui.paste(cy(page, 'wax-input-quantity'), AMOUNT);
        await ui.tap(cy(page, 'wax-save'));
      },
    },
    {
      text: {
        de: 'Der Arbeitsgang steht jetzt im Journal, mit den Völkern. Und der Bestand des Loses ist kleiner.',
        en: 'The operation is in the journal now, with the hives. And the stock of the lot is smaller.',
      },
      action: async (page, { ui }) => {
        const rows = cy(page, 'wax-operations-table').locator('tbody tr');
        // The second row of an operation has its lots and hives.
        await ui.point(rows.nth(1).locator('td').first(), { x: 300, y: 12 });
        await ui.wait(2500);
        await ui.tap(cy(page, 'wax-lots-tab'));
        await ui.point(cy(page, 'wax-lots-table').locator('tbody tr').last());
      },
    },
    {
      text: {
        de: 'Einen Fehler korrigierst du mit dem Storno. Es bucht eine Gegenbuchung, und das Journal bleibt vollständig. Mit Export bekommst du alles als Datei, zum Beispiel für deine Bio-Dokumentation.',
        en: 'You correct an error with the reversal. It books a counter-entry, and the journal stays complete. With Export, you get all data as a file, for example for your organic records.',
      },
      action: async (page, { ui }) => {
        await ui.tap(cy(page, 'wax-operations-tab'));
        // The German table is wider than the page, and the buttons are at
        // its right end.
        await cy(page, 'wax-operations-table')
          .locator('.q-table__middle')
          .evaluate((el) => {
            el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
          });
        await ui.wait(700);
        await ui.point(
          cy(page, 'wax-operations-table')
            .locator('button:has(.fa-rotate-left)')
            .first(),
        );
        await ui.wait(5000);
        await ui.point(page.locator('button:has(.fa-download)').first());
      },
    },
  ],
};

// Remove the operation that the episode books.
function removeNewData() {
  return withApi(async (api) => {
    const operations = (await call(api, 'GET', 'wax/operations')).results;
    for (const operation of operations.filter((o) => o.type === 'use')) {
      await call(api, 'DELETE', `wax/operations/${operation.id}`);
    }
  });
}

function cy(page, name) {
  return page.locator(`[data-cy="${name}"]`);
}
