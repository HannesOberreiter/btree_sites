// QR codes: print a code for each hive and scan it at the apiary.
import { call, withApi } from '../../screenshots/demo.mjs';
import {
  hiveScene,
  phoneGoto,
  phoneLayout,
  phoneScan,
  sceneState,
} from '../scenes/hive.mjs';

// Texts of the app that the actions look for.
const APP = {
  de: { hives: 'Völker', print: 'Drucken QR', path: 'Pfad' },
  en: { hives: 'Colonies', print: 'Print QR', path: 'Path' },
};

// Ids of the first hives, in the order of their names. Set by before().
let hiveIds = [];

export default {
  name: 'qr',
  route: () => '/',
  init: [phoneLayout],
  before: () =>
    withApi(async (api) => {
      hiveIds = (
        await call(api, 'GET', 'hive?limit=50&order=name&direction=asc')
      ).results.map((hive) => hive.id);
    }),
  scenes: [
    {
      text: {
        de: 'Ein QR-Code am Stock bringt dich mit einem Scan zur richtigen Stockkarte. b.tree erstellt die Codes für dich.',
        en: 'A QR code on the hive brings you to the correct hive card with one scan. b.tree makes the codes for you.',
      },
    },
    {
      text: {
        de: 'Öffne die Tabelle deiner Völker und markiere die Völker, für die du einen Code brauchst.',
        en: 'Open the table of your colonies and mark the colonies that need a code.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].hives, { exact: true }),
        );
        await ui.tap(page.locator('.q-drawer a[href="/table/hive"]').first());
        await ui.wait(800);
        await ui.tap(page.locator('thead .q-checkbox').first());
      },
    },
    {
      text: {
        de: 'Im Menü mit den drei Punkten wählst du Drucken QR. b.tree zeigt für jedes Volk einen Code mit seinem Namen.',
        en: 'In the menu with the three dots, select Print QR. b.tree shows a code with the name for each colony.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(page.locator('[data-cy="btn-table-dropdown"]'));
        await ui.tap(
          page.locator('.q-menu .q-item', { hasText: APP[demo.lang].print }),
        );
      },
    },
    {
      text: {
        de: 'Drucke die Codes, am besten auf wetterfeste Etiketten, und klebe einen auf jeden Stock.',
        en: 'Print the codes, best on weatherproof labels, and put one on each hive.',
      },
      action: async (page, { ui }) => {
        const dialog = page.locator('[data-cy="dialog-print-qr"]');
        await ui.point(dialog.locator('button:has(.fa-print)'));
        await ui.wait(4000);
        await ui.tap(dialog.locator('[data-cy="btn-close-dialog"]'));
      },
    },
    {
      text: {
        de: 'Am Stand scannst du den Code mit der Kamera deines Handys.',
        en: 'At the apiary, you scan the code with the camera of your phone.',
      },
      action: async (page, { ui }) => {
        await ui.scene(hiveScene({ tag: 'qr', url: '/' }));
        await ui.wait(1200);
        await sceneState(page, 'is-camera');
      },
    },
    {
      text: {
        de: 'Dein Handy öffnet die Stockkarte von genau diesem Volk. Du siehst die letzten Einträge und kannst gleich weiterarbeiten.',
        en: 'Your phone opens the hive card of exactly this colony. You see the last entries and can continue your work immediately.',
      },
      action: async (page, { demo }) => {
        await phoneGoto(page, `/detail/hive/${demo.hive.id}`);
        await sceneState(page, 'is-camera', false);
      },
    },
    {
      text: {
        de: 'b.tree hat auch einen eigenen QR-Scanner. Du schaltest ihn in den Einstellungen unter Felder und Lokal ein. Im Quicktool wählt dann jeder Scan ein Volk aus.',
        en: 'b.tree also has its own QR scanner. You switch it on in the settings under Fields and Local. In the Quicktool, each scan then selects a colony.',
      },
      action: async (page, { ui }) => {
        await phoneGoto(page, '/new/quicktool/checkup');
        await ui.wait(2500);
        for (const id of hiveIds.slice(0, 3)) {
          await sceneState(page, 'is-camera');
          await ui.wait(1100);
          await sceneState(page, 'is-camera', false);
          await phoneScan(page, id);
          await ui.wait(900);
        }
      },
    },
    {
      text: {
        de: 'So trägst du eine Kontrolle für mehrere Völker ein, ohne ihre Namen zu tippen.',
        en: 'So you enter a checkup for many colonies and do not type their names.',
      },
    },
  ],
};
