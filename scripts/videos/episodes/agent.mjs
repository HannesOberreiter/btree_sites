// Connect an own AI assistant with b.tree: MCP (OAuth) and Agent Keys.
import { createHash, randomBytes } from 'node:crypto';

import {
  API_URL,
  APP_URL,
  call,
  sql,
  withApi,
} from '../../screenshots/demo.mjs';
import { assistantScene } from '../scenes/assistant.mjs';

// Texts of the app that the actions look for.
const APP = {
  de: {
    settings: 'Einstellungen',
    create: 'Agent Key erstellen',
    close: 'Schließen',
    allow: 'Erlauben',
  },
  en: {
    settings: 'Settings',
    create: 'Create Agent Key',
    close: 'Close',
    allow: 'Allow',
  },
};
// Names that the video gives to the AI client and to the key.
const NAMES = {
  de: { client: 'KI-Assistent', key: 'Mein Agent' },
  en: { client: 'AI assistant', key: 'My agent' },
};
const MCP_URL = new URL('mcp', API_URL).toString();
// The address that the video shows in place of the local one.
const SHOWN_MCP_URL = MCP_URL.replace(
  new URL(API_URL).origin,
  'https://api.btree.at',
);
const AUTHORIZE_URL = new URL('mcp/oauth/authorize', API_URL).toString();
// The address that the AI client gets the answer of b.tree on. The episode
// catches the answer; no request goes to this address.
const CLIENT_REDIRECT = 'https://assistant.example/callback';
const PROFILE = '/setting/profile';

// Remove the MCP connections, the AI clients and the keys of the video.
function removeNewData() {
  return withApi(async (api) => {
    await call(api, 'DELETE', 'mcp/connections');
    for (const key of await call(api, 'GET', 'agent_key')) {
      if (Object.values(NAMES).some((names) => names.key === key.label)) {
        await call(api, 'DELETE', `agent_key/${key.id}`);
      }
    }
    const clients = Object.values(NAMES)
      .map((names) => `'${names.client}'`)
      .join(', ');
    sql(`delete from agent_oauth_clients where client_name in (${clients})`);
  });
}

// Put the AI client of the video into the database. An AI client registers
// itself with a request, but the server permits only 10 of them per hour.
const clientId = (lang) => `btree_mcp_client_video_${lang}`;
async function addClient(demo) {
  await removeNewData();
  sql(
    `insert into agent_oauth_clients (client_id, client_name, redirect_uris, token_endpoint_auth_method) values ('${clientId(demo.lang)}', '${NAMES[demo.lang].client}', '["${CLIENT_REDIRECT}"]', 'none')`,
  );
}

// The AI client asks b.tree for access, as a real MCP client does (OAuth with
// PKCE). The browser then shows the page of b.tree that asks for the consent.
// When the user allows the access, the episode gets the token in place of the
// AI client and sends the browser back to the profile.
async function requestAccess(page, demo) {
  const api = page.context().request;
  const client = clientId(demo.lang);
  const verifier = randomBytes(40).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');

  await page.route(AUTHORIZE_URL, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const answer = await route.fetch({ maxRedirects: 0 });
    const code = new URL(answer.headers().location).searchParams.get('code');
    await api.post(new URL('mcp/oauth/token', API_URL).toString(), {
      form: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: CLIENT_REDIRECT,
        client_id: client,
        code_verifier: verifier,
        resource: MCP_URL,
      },
    });
    // The page of b.tree permits a redirect only to the AI client. Open the
    // profile with a script instead.
    await route.fulfill({
      contentType: 'text/html',
      body: `<script>location.replace('${APP_URL}${PROFILE}/mcp')</script>`,
    });
  });

  const query = new URLSearchParams({
    response_type: 'code',
    client_id: client,
    redirect_uri: CLIENT_REDIRECT,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'video',
    scope: 'mcp',
    resource: MCP_URL,
  });
  await page.goto(`${AUTHORIZE_URL}?${query}`);
  // The page is small on a desktop screen. Make it bigger for the video.
  await page.evaluate(() => {
    document.querySelector('main').style.transform = 'scale(1.35)';
  });
}

export default {
  name: 'agent',
  route: () => '/',
  before: addClient,
  after: removeNewData,
  scenes: [
    {
      text: {
        de: 'Du kannst deinen eigenen KI-Assistenten mit b.tree verbinden, zum Beispiel Claude, ChatGPT oder Le Chat. Er liest deine Daten und trägt Arbeiten für dich ein. Dafür gibt es zwei Wege.',
        en: 'You can connect your own AI assistant with b.tree, for example Claude, ChatGPT or Le Chat. It reads your data and records your work for you. There are two ways to do this.',
      },
      action: async (page, { demo, ui }) => {
        await ui.wait(5000);
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].settings, { exact: true }),
        );
        await ui.tap(page.locator(`.q-drawer a[href="${PROFILE}"]`));
      },
    },
    {
      text: {
        de: 'Der erste Weg ist MCP. Im Profil auf dem Tab MCP steht die Adresse des b.tree Servers. Kopiere sie.',
        en: 'The first way is MCP. In the profile, the MCP tab shows the address of the b.tree server. Copy it.',
      },
      action: async (page, { ui }) => {
        await ui.tap(page.locator('.q-tab', { hasText: 'MCP' }));
        await ui.wait(1500);
        const settings = page.locator('[data-cy="mcp-settings"]');
        await ui.point(settings.locator('[data-cy="mcp-server-url"]'));
        await ui.wait(1200);
        await ui.tap(settings.locator('button:has(.fa-copy)'));
      },
    },
    {
      text: {
        de: 'In deinem KI-Programm fügst du diese Adresse als neuen Konnektor ein und klickst auf Verbinden.',
        en: 'In your AI program, you paste this address as a new connector and click Connect.',
      },
      action: async (page, { demo, ui }) => {
        await ui.scene(assistantScene(demo.lang));
        await ui.wait(800);
        await ui.paste(page.locator('#mcp-url'), SHOWN_MCP_URL);
        await ui.wait(1500);
        await ui.tap(page.locator('#mcp-connect'));
        await requestAccess(page, demo);
      },
    },
    {
      text: {
        de: 'Jetzt öffnet sich b.tree und fragt, ob das Programm auf deine Daten zugreifen darf. Du meldest dich an und erlaubst den Zugriff. Du gibst kein Passwort und keinen Schlüssel weiter.',
        en: 'Now b.tree opens and asks if the program may use your data. You sign in and allow the access. You do not give a password or a key to the program.',
      },
      action: async (page, { demo, ui }) => {
        await ui.wait(7000);
        await ui.tap(page.getByRole('button', { name: APP[demo.lang].allow }));
        await page.locator('[data-cy="mcp-settings"]').waitFor();
      },
    },
    {
      text: {
        de: 'Die Verbindung steht jetzt in deinem Profil. Hier kannst du sie jederzeit widerrufen.',
        en: 'The connection is now in your profile. You can revoke it here at any time.',
      },
      action: async (page, { ui }) => {
        await ui.wait(1500);
        await ui.point(
          page.locator('[data-cy="mcp-settings"] .q-list button').first(),
        );
      },
    },
    {
      text: {
        de: 'Der zweite Weg ist ein Agent Key, für eigene Agenten und Automationen. Gib dem Schlüssel einen Namen und erstelle ihn.',
        en: 'The second way is an Agent Key, for your own agents and automations. Give the key a name and create it.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(page.locator('.q-tab', { hasText: 'Agent Keys' }));
        await ui.wait(800);
        const create = APP[demo.lang].create;
        await ui.tap(page.getByRole('button', { name: create }));
        const dialog = page
          .locator('.q-dialog')
          .filter({ has: page.locator('input[type="date"]') });
        await ui.type(dialog.locator('input').first(), NAMES[demo.lang].key);
        await ui.tap(dialog.getByRole('button', { name: create }));
        await ui.wait(1500);
        // The app asks for a confirmation.
        await ui.tap(
          page.locator('.q-dialog').getByRole('button', { name: 'OK' }),
        );
      },
    },
    {
      text: {
        de: 'b.tree zeigt den Schlüssel nur dieses eine Mal. Kopiere ihn sofort und bewahre ihn sicher auf.',
        en: 'b.tree shows the key only this one time. Copy it immediately and keep it safe.',
      },
      action: async (page, { demo, ui }) => {
        const dialog = page
          .locator('.q-dialog')
          .filter({ has: page.locator('textarea') });
        await ui.tap(dialog.locator('button:has(.fa-copy)'));
        await ui.wait(3000);
        await ui.tap(
          dialog.getByRole('button', { name: APP[demo.lang].close }),
        );
      },
    },
    {
      text: {
        de: 'Darunter steht ein fertiger Prompt. Er erklärt deinem Agenten, wie er die b.tree API verwendet.',
        en: 'Below is a ready prompt. It tells your agent how to use the b.tree API.',
      },
      action: async (page, { ui }) => {
        await ui.point(
          page.locator('.q-tab-panel > div button:has(.fa-copy)').last(),
        );
      },
    },
    {
      text: {
        de: 'Beide Wege gehören zu Premium. Über MCP arbeitet der Assistent mit deinen Rechten: Wer nur lesen darf, kann auch über den Assistenten nichts ändern.',
        en: 'Both ways are part of Premium. With MCP, the assistant works with your rights: a read-only user cannot change data through the assistant.',
      },
    },
  ],
};
