// NFC tags: write a tag for a hive and read it at the apiary.
// Web NFC exists only on Android, so the app runs in the phone of the hive
// scene with an NFC reader that the episode controls.
import { call, withApi } from '../../screenshots/demo.mjs';
import {
  fakeNfc,
  hiveScene,
  nfcTag,
  nfcWritten,
  phoneFrame,
  phoneLayout,
  sceneState,
} from '../scenes/hive.mjs';

// Texts of the app that the actions look for.
const APP = {
  de: { write: 'Schreiben' },
  en: { write: 'Write' },
};

// Ids of the first hives, in the order of their names. Set by before().
let hiveIds = [];

// Open a page of the app with the menu of the phone.
async function openFromMenu(page, ui, href) {
  const phone = phoneFrame(page);
  await ui.tap(phone.locator('[data-cy="btn-drawer"]'));
  await ui.tap(phone.locator(`.q-drawer a[href="${href}"]`).first());
}

// The beekeeper holds the phone to the tag; in the middle of this time the
// phone does read() or write().
async function holdToTag(page, ui, transfer) {
  await sceneState(page, 'is-scanning');
  await ui.wait(1300);
  await transfer();
  await ui.wait(700);
  await sceneState(page, 'is-scanning', false);
}

export default {
  name: 'nfc',
  route: () => '/',
  init: [phoneLayout, fakeNfc],
  // Without the hints the German voice says "Tag" like the word for day.
  hints: {
    de: { Tag: ['t', 'æ', 'g'], Tags: ['t', 'æ', 'g', 'z'] },
  },
  before: () =>
    withApi(async (api) => {
      hiveIds = (
        await call(api, 'GET', 'hive?limit=50&order=name&direction=asc')
      ).results.map((hive) => hive.id);
    }),
  prepare: async (page, demo, ui) => {
    await ui.scene(
      hiveScene({ tag: 'nfc', url: `/detail/hive/${hiveIds[0]}` }),
    );
    await phoneFrame(page).locator('.q-layout').waitFor();
    await page.waitForLoadState('networkidle');
  },
  scenes: [
    {
      text: {
        de: 'Mit einem NFC-Tag am Stock öffnest du die Stockkarte, indem du dein Handy an den Tag hältst. Ohne Kamera und ohne Tippen.',
        en: 'With an NFC tag on the hive, you open the hive card when you hold your phone to the tag. No camera and no typing.',
      },
      action: async (page, { ui }) => {
        await ui.wait(1500);
        await sceneState(page, 'is-scanning');
        await ui.wait(3000);
        await sceneState(page, 'is-scanning', false);
      },
    },
    {
      text: {
        de: 'Die Tags brauchen keine Batterie. Tags aus Kunststoff sind wetterfest, und du bekommst sie günstig im Internet.',
        en: 'The tags need no battery. Plastic tags are weatherproof, and you can buy them cheaply online.',
      },
    },
    {
      text: {
        de: 'Die Funktion läuft auf Android-Handys mit dem Browser Chrome. iPhones unterstützen sie im Browser nicht.',
        en: 'The function works on Android phones with the Chrome browser. iPhones do not support it in the browser.',
      },
    },
    {
      text: {
        de: 'Zuerst beschreibst du den Tag. Öffne die Stockkarte und tippe unten rechts auf Teilen.',
        en: 'First, you write the tag. Open the hive card and tap Share at the bottom right.',
      },
      action: async (page, { ui }) => {
        await ui.wait(2500);
        await ui.tap(phoneFrame(page).locator('[data-cy="btn-share"]'));
      },
    },
    {
      text: {
        de: 'Tippe auf Schreiben und halte dein Handy an den Tag. b.tree speichert die Adresse dieser Stockkarte auf dem Tag.',
        en: 'Tap Write and hold your phone to the tag. b.tree stores the address of this hive card on the tag.',
      },
      action: async (page, { demo, ui }) => {
        const dialog = phoneFrame(page).locator('[data-cy="dialog-share"]');
        await ui.tap(
          dialog.getByRole('button', {
            name: APP[demo.lang].write,
            exact: true,
          }),
        );
        await ui.wait(1500);
        await holdToTag(page, ui, () => nfcWritten(page));
      },
    },
    {
      text: {
        de: 'Zum Lesen schaltest du den NFC-Leser ein. Tippe dafür auf das NFC-Symbol in der Fußzeile. Das Symbol wird grün.',
        en: 'To read tags, you switch on the NFC reader. Tap the NFC symbol in the footer. The symbol becomes green.',
      },
      action: async (page, { ui }) => {
        const phone = phoneFrame(page);
        await ui.tap(
          phone.locator(
            '[data-cy="dialog-share"] [data-cy="btn-close-dialog"]',
          ),
        );
        await openFromMenu(page, ui, '/');
        await ui.wait(800);
        await ui.tap(phone.locator('.q-footer button[aria-label="NFC"]'));
      },
    },
    {
      text: {
        de: 'Halte jetzt dein Handy an einen Tag. b.tree öffnet sofort die Stockkarte von diesem Volk.',
        en: 'Now hold your phone to a tag. b.tree immediately opens the hive card of this colony.',
      },
      action: async (page, { ui }) => {
        await ui.wait(1000);
        await holdToTag(page, ui, () =>
          nfcTag(page, `/detail/hive/${hiveIds[0]}`),
        );
      },
    },
    {
      text: {
        de: 'Im Quicktool wählt jeder Tag ein Volk aus. Du gehst von Stock zu Stock und hältst nur dein Handy hin.',
        en: 'In the Quicktool, each tag selects a colony. You go from hive to hive and only hold your phone to the tags.',
      },
      action: async (page, { ui }) => {
        await openFromMenu(page, ui, '/new/quicktool/checkup');
        await ui.wait(1000);
        for (const id of hiveIds.slice(0, 3)) {
          await holdToTag(page, ui, () => nfcTag(page, `/detail/hive/${id}`));
          await ui.wait(300);
        }
      },
    },
    {
      text: {
        de: 'Der Leser bleibt aktiv, bis du wieder auf das Symbol tippst. Einen Tag kannst du jederzeit leeren und neu beschreiben.',
        en: 'The reader stays active until you tap the symbol again. You can clear a tag and write it again at any time.',
      },
    },
  ],
};
