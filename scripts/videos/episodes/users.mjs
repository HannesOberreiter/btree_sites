// Companies and users: a second company, invite a user, access rights.
import { DEMO, call, withApi } from '../../screenshots/demo.mjs';

const EMAIL = 'maria@btree.at';

// Texts of the app that the actions look for, and the name of the new company.
const APP = {
  de: {
    settings: 'Einstellungen',
    company: 'Imkerei',
    users: 'Benutzer',
    addUser: 'Hinzufügen Benutzer',
    newCompany: 'Gemeinschaftsstand',
  },
  en: {
    settings: 'Settings',
    company: 'Company',
    users: 'Users',
    addUser: 'Add User',
    newCompany: 'Club apiary',
  },
};

export default {
  name: 'users',
  route: () => '/',
  // The demo account also has the companies of the seed and the demo company
  // of the other language. The list of companies does not show them.
  hidden: (demo) => [
    'BasicCompany',
    'PremiumCompany',
    DEMO[demo.lang === 'de' ? 'en' : 'de'].company,
  ],
  // Remove the companies and the user that an earlier run of the episode made.
  before: (demo) =>
    withApi(async (api, user) => {
      const names = new Set(Object.values(APP).map((t) => t.newCompany));
      for (const company of user.company) {
        if (names.has(company.name)) {
          await call(api, 'DELETE', `company/${company.id}`);
        }
      }
      // The server changes the active company when it deletes a company.
      await call(api, 'PATCH', 'user/company', {
        saved_company: demo.company.id,
      });
      for (const member of await call(api, 'GET', 'company_user/user')) {
        if (member.user.email === EMAIL) {
          await call(
            api,
            'DELETE',
            `company_user/remove_user/${member.bee_id}`,
          );
        }
      }
    }),
  scenes: [
    {
      text: {
        de: 'In b.tree kannst du mehrere Imkereien führen und andere Imker in deine Imkerei einladen.',
        en: 'In b.tree, you can run more than one company and invite other beekeepers to your company.',
      },
    },
    {
      text: {
        de: 'Öffne die Einstellungen und dann Imkerei. Hier siehst du deine aktive Imkerei und ihren Status.',
        en: 'Open Settings, then Company. Here you see your active company and its status.',
      },
      action: async (page, { demo, ui }) => {
        const drawer = page.locator('.q-drawer');
        await ui.tap(
          drawer.getByText(APP[demo.lang].settings, { exact: true }),
        );
        await ui.tap(drawer.getByText(APP[demo.lang].company, { exact: true }));
      },
    },
    {
      text: {
        de: 'Für einen Gemeinschaftsstand oder einen zweiten Betrieb legst du eine neue Imkerei an.',
        en: 'For a club apiary or a second business, create a new company.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(page.locator('[data-cy="btn-company-new"]'));
        await ui.type(
          page.locator('.q-dialog input'),
          APP[demo.lang].newCompany,
        );
        await ui.tap(page.locator('.q-dialog button', { hasText: 'OK' }));
      },
    },
    {
      text: {
        de: 'Die neue Imkerei ist leer und hat eigene Einstellungen. Premium gilt pro Imkerei, nicht pro Benutzer. Hier wechselst du zwischen deinen Imkereien.',
        en: 'The new company is empty and has its own settings. Premium applies per company, not per user. Here you switch between your companies.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('[data-cy="select-company"]'));
        await ui.wait(7000);
        await page.keyboard.press('Escape');
      },
    },
    {
      text: {
        de: 'Im Reiter Benutzer lädst du andere ein. Gib die E-Mail-Adresse ein. Wer noch kein Konto hat, bekommt eine E-Mail und legt ein Passwort fest.',
        en: 'On the Users tab, you invite others. Enter the e-mail address. A person without an account gets an e-mail and sets a password.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page.getByRole('tab', { name: APP[demo.lang].users, exact: true }),
        );
        await ui.tap(
          page.getByRole('button', { name: APP[demo.lang].addUser }),
        );
        await ui.type(page.locator('.q-dialog input'), EMAIL);
        await ui.tap(page.locator('.q-dialog button', { hasText: 'OK' }));
      },
    },
    {
      text: {
        de: 'Ein neuer Benutzer darf nur lesen.',
        en: 'A new user can only read.',
      },
      action: async (page, { ui }) => {
        await ui.point(rank(page));
      },
    },
    {
      text: {
        de: 'Mit einem Klick änderst du das Recht. Ein User trägt Aufgaben ein, legt aber keine Völker und Stände an.',
        en: 'One click changes the access right. A User records tasks, but cannot create hives and apiaries.',
      },
      action: async (page, { ui }) => {
        await ui.tap(rank(page));
      },
    },
    {
      text: {
        de: 'Ein Admin darf alles und verwaltet auch die Benutzer.',
        en: 'An Admin can do everything and also manages the users.',
      },
      action: async (page, { ui }) => {
        await ui.tap(rank(page));
      },
    },
    {
      text: {
        de: 'Arbeitet jemand nicht mehr mit, dann gib ihm besser nur Lesezugriff, statt ihn zu entfernen. So bleibt sein Name bei seinen Aufgaben.',
        en: 'When a person stops working with you, give read-only access instead of removing the user. Then the name stays on the tasks of that person.',
      },
      action: async (page, { ui }) => {
        await ui.tap(rank(page));
        await ui.wait(2500);
        await ui.point(row(page).locator('.q-btn:has(.fa-user-minus)'));
      },
    },
    {
      text: {
        de: 'Als Admin lädst du alle Daten der Imkerei herunter. Mach das, bevor du eine Imkerei löschst. Gelöschte Daten kann niemand wiederherstellen.',
        en: 'As an Admin, you can download all data of the company. Do this before you delete a company. Nobody can restore deleted data.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page.getByRole('tab', { name: APP[demo.lang].company, exact: true }),
        );
        await ui.point(page.locator('[data-cy="btn-company-download"]'));
        await ui.wait(2500);
        await ui.point(page.locator('[data-cy="btn-company-delete"]'));
      },
    },
    {
      text: {
        de: 'Jeder Benutzer sieht die ganze Imkerei. Für getrennte Bereiche legst du mehrere Imkereien an.',
        en: 'Each user sees the full company. For separate areas, create more than one company.',
      },
    },
  ],
};

// The row of the invited user and the button that shows and changes the right.
function row(page) {
  return page.locator('.q-item').filter({ hasText: EMAIL });
}
function rank(page) {
  return row(page).locator('.q-btn:has(.fa-user-shield)');
}
