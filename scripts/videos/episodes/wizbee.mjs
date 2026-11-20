// WizBee, the AI assistant inside b.tree.
//
// The recording asks the real WizBee, so the server of the demo needs
// MISTRAL_API_KEY. The answers come from the language model: they are not the
// same in each recording, and each recording costs about 0.20 EUR per language.
// Look at the video after each recording.
import { call, sql, withApi } from '../../screenshots/demo.mjs';

// Texts of the app that the actions look for.
const APP = {
  de: {
    tools: 'Werkzeuge',
    example: 'Wie viele Völker und Bienenstände habe ich?',
  },
  en: {
    tools: 'Tools',
    example: 'How many colonies and apiaries do I have?',
  },
};
// What the video writes to WizBee.
const CHAT = {
  de: {
    task: 'Trage für Volk A03 heute eine Kontrolle ein: Königin gesehen, Notiz: sehr sanftmütig.',
    yes: 'Ja',
  },
  en: {
    task: 'Record a checkup for colony A03 today: queen seen, note: very gentle.',
    yes: 'Yes',
  },
};
// WizBee needs some seconds for an answer, sometimes more.
const ANSWER_TIMEOUT = 90_000;

// Remove the checkup that WizBee saves, and the costs of the questions.
// The demo data has no other checkup with the date of today.
function removeNewData() {
  return withApi(async (api) => {
    const today = new Date().toISOString().slice(0, 10);
    const checkups = await call(
      api,
      'GET',
      'checkup?limit=50&order=date&direction=desc',
    );
    const ids = checkups.results
      .filter((checkup) => checkup.date.slice(0, 10) === today)
      .map((checkup) => checkup.id);
    if (ids.length > 0) {
      await call(api, 'PATCH', 'checkup/batchDelete?hard=true', { ids });
    }
    sql('delete from wizbee_requests');
  });
}

const input = (page) => page.locator('.wizbee-chat__input input');

async function send(page, ui, text) {
  await ui.type(input(page), text);
  await ui.wait(600);
  await input(page).press('Enter');
}

// Wait until WizBee has finished its answer: the stop button goes away.
async function answer(page) {
  await page.waitForTimeout(1000);
  await page
    .locator('.wizbee-chat__input .fa-stop')
    .waitFor({ state: 'detached', timeout: ANSWER_TIMEOUT });
}

export default {
  name: 'wizbee',
  route: () => '/',
  // A run that failed can leave its data, so remove it first too.
  before: removeNewData,
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'WizBee ist der KI-Assistent in b.tree. Er kennt deine Völker, deine Arbeiten und die Anleitung von b.tree. WizBee gehört zu Premium. Du findest ihn im Menü unter Werkzeuge.',
        en: 'WizBee is the AI assistant in b.tree. It knows your colonies, your tasks and the b.tree manual. WizBee is part of Premium. You find it in the menu under Tools.',
      },
      action: async (page, { demo, ui }) => {
        await ui.wait(8000);
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].tools, { exact: true }),
        );
        await ui.tap(page.locator('.q-drawer a[href="/wizbee"]'));
      },
    },
    {
      text: {
        de: 'Stell deine Frage in normalen Worten, oder klick auf ein Beispiel. Wir fragen, wie viele Völker und Stände wir haben.',
        en: 'Ask your question in plain words, or click an example. We ask how many colonies and apiaries we have.',
      },
      action: async (page, { demo, ui }) => {
        const example = page.getByRole('button', {
          name: APP[demo.lang].example,
        });
        await ui.point(example);
        await ui.wait(5000);
        await ui.tap(example);
      },
    },
    {
      text: {
        de: 'WizBee liest jetzt deine Daten. Die grauen Zeilen zeigen, was er nachschaut. Nach ein paar Sekunden steht die Antwort da.',
        en: 'WizBee now reads your data. The grey lines show what it looks up. After a few seconds, the answer is there.',
      },
      action: async (page, { ui }) => {
        await answer(page);
        await ui.wait(2500);
      },
    },
    {
      text: {
        de: 'WizBee trägt auch Arbeiten für dich ein. Schreib einfach, was du gemacht hast.',
        en: 'WizBee also records tasks for you. Simply write what you did.',
      },
      action: async (page, { demo, ui }) => {
        await ui.wait(1500);
        await send(page, ui, CHAT[demo.lang].task);
      },
    },
    {
      text: {
        de: 'Vor dem Speichern zeigt WizBee, was er eintragen will, und fragt nach. Erst wenn du zustimmst, speichert er.',
        en: 'Before it saves, WizBee shows what it wants to record and asks you. It saves only after you agree.',
      },
      action: async (page, { demo, ui }) => {
        await answer(page);
        await ui.wait(3500);
        await send(page, ui, CHAT[demo.lang].yes);
      },
    },
    {
      text: {
        de: 'Jetzt ist die Kontrolle gespeichert, wie jede andere Arbeit in b.tree.',
        en: 'Now the checkup is saved, like every other task in b.tree.',
      },
      action: async (page, { ui }) => {
        await answer(page);
        await ui.wait(2500);
      },
    },
    {
      text: {
        de: 'Mit dem Mikrofon sprichst du deine Frage, statt zu tippen. Unter dem Chat steht das Budget deiner Imkerei für diesen Monat. Deine Fragen und Daten gehen zur Verarbeitung an Mistral AI.',
        en: 'With the microphone, you speak your question in place of typing. Below the chat, you see the budget of your company for this month. Your questions and data go to Mistral AI for processing.',
      },
      action: async (page, { ui }) => {
        await ui.point(page.locator('.wizbee-chat__input .fa-microphone'));
        await ui.wait(3500);
        await ui.point(page.locator('.wizbee-chat__status .text-caption'));
        await ui.wait(4000);
        await ui.point(page.locator('a[href="https://mistral.ai/"]'));
      },
    },
    {
      text: {
        de: 'Mit dem Symbol oben rechts öffnest du WizBee auf jeder Seite. Prüfe wichtige Antworten selbst nach, denn eine KI kann sich irren.',
        en: 'With the icon at the top right, you open WizBee on every page. Check important answers yourself, because an AI can be wrong.',
      },
      action: async (page, { ui }) => {
        await ui.tap(
          page.locator('.q-header button').filter({
            has: page.locator('img[alt="WizBee"]'),
          }),
        );
      },
    },
  ],
};
