// Connect a Dropbox account and add a photo to a checkup.
//
// The episode does not use a real Dropbox account, see scenes/dropbox.mjs. It
// saves nothing: the connection lives only in the recording, and openDemo sets
// the field settings again before each recording.
import { fakeDropbox } from '../scenes/dropbox.mjs';

// Texts of the app that the actions look for.
const APP = {
  de: {
    settings: 'Einstellungen',
    connect: 'Verbinde dein Dropbox-Konto',
    newFolder: 'Neuer Ordner',
    upload: 'Hochladen',
    select: 'Auswählen',
    close: 'Schließen',
    remove: 'Zugriff löschen',
  },
  en: {
    settings: 'Settings',
    connect: 'Connect your Dropbox account',
    newFolder: 'New Folder',
    upload: 'Upload',
    select: 'Select',
    close: 'Close',
    remove: 'Delete access',
  },
};
// Names of the folders and the files of the video.
const NAMES = {
  de: {
    folder: 'Stockkarten',
    photo: 'Bienen A01.jpg',
    other: 'Wabe B02.jpg',
    newFolder: 'Rechnungen',
  },
  en: {
    folder: 'Hive cards',
    photo: 'Bees A01.jpg',
    other: 'Comb B02.jpg',
    newFolder: 'Invoices',
  },
};
const EMAIL = 'demo@btree.at';
const DROPBOX = '/setting/dropbox';

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Open a page of the Settings group in the drawer.
async function openSetting(page, ui, demo, href) {
  const link = page.locator(`.q-drawer a[href="${href}"]`);
  if (!(await link.isVisible())) {
    await ui.tap(
      page
        .locator('.q-drawer')
        .getByText(APP[demo.lang].settings, { exact: true }),
    );
  }
  await ui.tap(link);
}

const urlField = (page) =>
  page.locator('label').filter({ has: page.locator('.fa-dropbox') });

export default {
  name: 'dropbox',
  route: () => '/',
  prepare: (page, demo) =>
    fakeDropbox(page, {
      lang: demo.lang,
      email: EMAIL,
      entries: [
        { name: NAMES[demo.lang].folder, folder: true, modified: daysAgo(120) },
        { name: NAMES[demo.lang].photo, modified: daysAgo(3) },
        { name: NAMES[demo.lang].other, modified: daysAgo(40) },
      ],
    }),
  scenes: [
    {
      text: {
        de: 'Fotos und Dokumente brauchen viel Platz. b.tree speichert sie deshalb nicht selbst. Du verbindest dein Dropbox-Konto, und b.tree merkt sich nur, welche Datei zu welcher Arbeit gehört.',
        en: 'Photos and documents need a lot of space. So b.tree does not store them itself. You connect your Dropbox account, and b.tree only remembers which file belongs to which task.',
      },
      action: async (page, { demo, ui }) => {
        await ui.wait(6000);
        await openSetting(page, ui, demo, DROPBOX);
      },
    },
    {
      text: {
        de: 'Du findest die Seite unter Einstellungen, Dropbox. Pro Imkerei verbindest du ein Konto. Klicke auf den grünen Knopf.',
        en: 'You find the page under Settings, Dropbox. You connect one account per company. Click the green button.',
      },
      action: async (page, { demo, ui }) => {
        const connect = page.getByRole('button', {
          name: APP[demo.lang].connect,
        });
        await ui.point(connect);
        await ui.wait(4500);
        await ui.tap(connect);
        await page.waitForURL(/dropbox\.com/);
      },
    },
    {
      text: {
        de: 'Dropbox fragt jetzt, ob b.tree zugreifen darf. b.tree bekommt einen eigenen Ordner. Deine anderen Dateien sieht b.tree nicht.',
        en: 'Dropbox now asks if b.tree may have access. b.tree gets its own folder. It does not see your other files.',
      },
      action: async (page, { ui }) => {
        await ui.wait(5500);
        await ui.tap(page.locator('#allow'));
        await page.waitForURL(/setting\/dropbox/);
      },
    },
    {
      text: {
        de: 'Jetzt siehst du hier deine Dateien. Alle Benutzer deiner Imkerei können sie öffnen. Du legst neue Ordner an und lädst Dateien hoch.',
        en: 'Now you see your files here. All users of your company can open them. You create new folders and upload files.',
      },
      action: async (page, { demo, ui }) => {
        const names = NAMES[demo.lang];
        await ui.point(page.getByRole('button', { name: names.folder }));
        await ui.wait(3500);
        await ui.tap(
          page.getByRole('button', { name: APP[demo.lang].newFolder }),
        );
        await ui.type(page.locator('.q-dialog input'), names.newFolder);
        await ui.tap(
          page.locator('.q-dialog').getByRole('button', { name: 'OK' }),
        );
        await ui.wait(1200);
        await ui.point(
          page.getByRole('button', { name: APP[demo.lang].upload }),
        );
      },
    },
    {
      text: {
        de: 'Ein Klick auf eine Datei zeigt dir die Vorschau.',
        en: 'A click on a file shows you the preview.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page.getByRole('button', { name: NAMES[demo.lang].photo }),
        );
        await ui.wait(3000);
        await ui.tap(
          page
            .locator('.q-dialog')
            .getByRole('button', { name: APP[demo.lang].close }),
        );
      },
    },
    {
      text: {
        de: 'Damit du eine Datei an eine Arbeit hängen kannst, schaltest du ein Feld ein. Es steht unter Einstellungen, Felder, ganz unten bei Allgemein.',
        en: 'To attach a file to a task, you switch on one field. You find it under Settings, Fields, at the very bottom under General.',
      },
      action: async (page, { demo, ui }) => {
        await openSetting(page, ui, demo, '/setting/field');
        await ui.wait(1500);
        await ui.tap(
          page.locator('[data-cy="page-setting-field"] .q-toggle').last(),
        );
      },
    },
    {
      text: {
        de: 'Das Quicktool hat jetzt das Feld URL. Mit dem Pfeil lädst du ein neues Foto hoch, zum Beispiel vom Handy direkt am Stand. Mit dem Dropbox-Symbol wählst du eine vorhandene Datei aus.',
        en: 'The Quicktool now has the URL field. With the arrow, you upload a new photo, for example from your phone at the apiary. With the Dropbox icon, you select a file that is already there.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page.locator('.q-drawer a[href="/new/quicktool/checkup"]'),
        );
        await ui.wait(1200);
        const field = urlField(page);
        await ui.point(field.locator('.fa-upload'));
        await ui.wait(4500);
        await ui.tap(field.locator('.fa-dropbox'));
        await ui.wait(1500);
        await ui.tap(
          page
            .locator('.q-dialog .q-table__grid-content .q-card')
            .filter({ hasText: NAMES[demo.lang].photo })
            .getByRole('button', { name: APP[demo.lang].select }),
        );
      },
    },
    {
      text: {
        de: 'Wenn du speicherst, gehört das Foto zu dieser Kontrolle. Ein Klick auf das Feld zeigt es dir wieder.',
        en: 'When you save, the photo belongs to this checkup. A click on the field shows it again.',
      },
      action: async (page, { demo, ui }) => {
        await ui.wait(2500);
        await ui.tap(urlField(page).locator('input'));
        await ui.wait(3000);
        await ui.tap(
          page
            .locator('.q-dialog')
            .getByRole('button', { name: APP[demo.lang].close }),
        );
      },
    },
    {
      text: {
        de: 'Das Feld gibt es auch bei Ständen, Königinnen und ToDos. Die Verbindung beendest du jederzeit mit Zugriff löschen. Deine Dateien bleiben in deiner Dropbox.',
        en: 'The field is also there for apiaries, queens and todos. You can end the connection at any time with Delete access. Your files stay in your Dropbox.',
      },
      action: async (page, { demo, ui }) => {
        await openSetting(page, ui, demo, DROPBOX);
        await ui.wait(2500);
        await ui.point(
          page.getByRole('button', { name: APP[demo.lang].remove }),
        );
      },
    },
  ],
};
