// iCal subscription: show the b.tree tasks in an external calendar.
import { PASSWORD, call, withApi } from '../../screenshots/demo.mjs';
import { calendarScene } from '../scenes/calendar.mjs';

// Texts of the app that the actions look for.
const APP = {
  de: {
    activate: 'Aktivieren',
    unlock: 'API-Details freischalten',
    source: 'iCal-Quelle',
    todo: 'ToDo',
  },
  en: {
    activate: 'Activate',
    unlock: 'Unlock API Details',
    source: 'iCal source',
    todo: 'ToDo',
  },
};

export default {
  name: 'ical',
  route: () => '/setting/profile/user',
  // The episode shows the activation, so the API is off at the start.
  before: () =>
    withApi((api) =>
      call(api, 'PATCH', 'company', { password: PASSWORD, api_active: false }),
    ),
  scenes: [
    {
      text: {
        de: 'Mit der iCal-URL siehst du deine b.tree Termine in deinem eigenen Kalender, zum Beispiel in Google Kalender oder am Handy.',
        en: 'With the iCal URL, you see your b.tree tasks in your own calendar, for example in Google Calendar or on your phone.',
      },
    },
    {
      text: {
        de: 'Öffne im Profil den Reiter API. Gib dein Passwort ein und klicke auf Aktivieren. Das gilt dann für alle Benutzer deiner Imkerei.',
        en: 'In your profile, open the API tab. Enter your password and click Activate. This then applies to all users of your company.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(page.getByRole('tab', { name: 'API', exact: true }));
        await ui.type(page.locator('input[name="password"]'), PASSWORD);
        await ui.tap(
          page.getByRole('button', {
            name: APP[demo.lang].activate,
            exact: true,
          }),
        );
      },
    },
    {
      text: {
        de: 'Klicke auf API-Details freischalten. Jetzt siehst du deine Links.',
        en: 'Now click the button Unlock API Details. It shows your iCal links.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(page.getByRole('button', { name: APP[demo.lang].unlock }));
      },
    },
    {
      text: {
        de: 'Wähle aus, welche Einträge du im Kalender haben willst, zum Beispiel deine ToDos.',
        en: 'Choose which entries you want in your calendar, for example your todos.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page.locator('.q-select').filter({ hasText: APP[demo.lang].source }),
        );
        await ui.tap(
          page
            .locator('.q-menu .q-item')
            .filter({ hasText: APP[demo.lang].todo }),
        );
      },
    },
    {
      text: {
        de: 'Kopiere den Link. Der Download daneben ist nur eine einmalige Datei und wird nicht aktualisiert.',
        en: 'Copy the link. The download next to it is a one-time file that does not update.',
      },
      action: async (page, { ui }) => {
        await ui.tap(
          page
            .locator('.q-field')
            .filter({ hasText: /iCal.URL/ })
            .locator('.q-btn:has(.fa-copy)'),
        );
        await ui.wait(1200);
        await ui.point(page.locator('.q-btn:has(.fa-archive)'));
      },
    },
    {
      text: {
        de: 'Öffne jetzt deinen Kalender, zum Beispiel Google Kalender.',
        en: 'Now open your calendar, for example Google Calendar.',
      },
      action: async (page, { demo, ui }) => {
        await ui.scene(calendarScene(demo.lang));
      },
    },
    {
      text: {
        de: 'Klicke bei Weitere Kalender auf das Plus, wähle Per URL und füge den Link ein.',
        en: 'Next to Other calendars, click the plus, choose From URL, and paste the link.',
      },
      action: async (page, { ui }) => {
        // The value of the iCal field in the app, which the scene covers.
        const url = await page
          .locator('.q-field')
          .filter({ hasText: /iCal.URL/ })
          .locator('input')
          .inputValue();
        await ui.tap(page.locator('#cal-add'));
        await ui.tap(page.locator('#cal-from-url'));
        await ui.paste(page.locator('#cal-url'), url);
      },
    },
    {
      text: {
        de: 'Deine b.tree Termine sind jetzt in deinem Kalender. Er gleicht sie regelmäßig ab. Dort kannst du sie nur lesen, nicht ändern.',
        en: 'Your b.tree tasks are now in your calendar. It syncs them regularly. There, you can only read them, not change them.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('#cal-submit'));
      },
    },
  ],
};
