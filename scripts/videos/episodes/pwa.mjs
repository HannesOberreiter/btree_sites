// Install b.tree as an app (PWA) on Android and on the iPhone.
// The steps are in the browser and on the home screen of the phone, which a
// recording of the app cannot show. A drawn phone shows them.
import { phoneLayout } from '../scenes/hive.mjs';
import { installPart, installScene, installState } from '../scenes/install.mjs';

// Tap a part of the drawn phone, then show the next state.
async function tapPart(page, ui, part, state) {
  await ui.tap(installPart(page, part));
  await installState(page, state);
}

export default {
  name: 'pwa',
  route: () => '/',
  init: [phoneLayout],
  prepare: async (page, demo, ui) => {
    await ui.scene(installScene(demo.lang));
    await page
      .frameLocator('#video-scene iframe')
      .locator('.q-layout')
      .waitFor();
    await page.waitForTimeout(2000);
  },
  scenes: [
    {
      text: {
        de: 'b.tree ist eine Web-App. Du installierst sie direkt aus dem Browser auf dein Handy. Danach startet sie wie jede andere App vom Startbildschirm.',
        en: 'b.tree is a web app. You install it on your phone directly from the browser. Then it starts from the home screen like any other app.',
      },
    },
    {
      text: {
        de: 'Auf Android öffnest du app.btree.at im Browser Chrome. Tippe oben rechts auf die drei Punkte.',
        en: 'On Android, open app.btree.at in the Chrome browser. Tap the three dots at the top right.',
      },
      action: async (page, { ui }) => {
        await installState(page, 'android browser step-1');
        await ui.wait(4500);
        await tapPart(page, ui, 'open', 'android menu step-2');
      },
    },
    {
      text: {
        de: 'Wähle Zum Startbildschirm hinzufügen. In manchen Versionen heißt der Eintrag App installieren. Bestätige dann mit Installieren.',
        en: 'Select Add to Home screen. In some versions, the name of the entry is Install app. Then confirm with Install.',
      },
      action: async (page, { ui }) => {
        await ui.wait(2500);
        await tapPart(page, ui, 'install', 'android confirm step-3');
        await ui.wait(3500);
        await tapPart(page, ui, 'confirm', 'android home done');
      },
    },
    {
      text: {
        de: 'Das Symbol von b.tree liegt jetzt auf deinem Startbildschirm. Die App öffnet sich im Vollbild, ohne Adressleiste.',
        en: 'The b.tree icon is now on your home screen. The app opens in full screen, with no address bar.',
      },
      action: async (page, { ui }) => {
        await ui.wait(3000);
        await tapPart(page, ui, 'icon', 'android app done');
      },
    },
    {
      text: {
        de: 'Auf dem iPhone öffnest du app.btree.at in Safari. Tippe auf das Teilen-Symbol. In neuen Versionen von iOS findest du es hinter den drei Punkten.',
        en: 'On the iPhone, open app.btree.at in Safari. Tap the Share symbol. In new versions of iOS, you find it behind the three dots.',
      },
      action: async (page, { ui }) => {
        await installState(page, 'ios browser step-1');
        await ui.wait(5000);
        await tapPart(page, ui, 'open', 'ios menu step-2');
      },
    },
    {
      text: {
        de: 'Wische in der Liste nach unten und wähle Zum Home-Bildschirm. Tippe dann auf Hinzufügen.',
        en: 'Move down in the list and select Add to Home Screen. Then tap Add.',
      },
      action: async (page, { ui }) => {
        await ui.wait(2500);
        await tapPart(page, ui, 'install', 'ios confirm step-3');
        await ui.wait(1800);
        await tapPart(page, ui, 'confirm', 'ios home done');
      },
    },
    {
      text: {
        de: 'Auch hier startet b.tree jetzt als eigene App. Wenn die App nach dem Login fragt, melde dich noch einmal an.',
        en: 'Here too, b.tree now starts as its own app. If the app asks for the login, sign in again.',
      },
      action: async (page, { ui }) => {
        await ui.wait(1500);
        await tapPart(page, ui, 'icon', 'ios app done');
      },
    },
    {
      text: {
        de: 'Neue Versionen von b.tree bekommst du automatisch. Du musst nichts neu installieren.',
        en: 'You get new versions of b.tree automatically. It is not necessary to install them.',
      },
    },
  ],
};
