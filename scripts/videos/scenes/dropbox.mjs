// A stand-in for Dropbox. A recording cannot sign in to a real Dropbox
// account, so the episode answers the requests of the web app itself: the
// requests to the b.tree server for the connection, and the requests to the
// Dropbox servers for the files. No request leaves the computer.
//
// The consent page is a generic drawing, not a copy of the Dropbox page.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { API_URL, APP_URL } from '../../screenshots/demo.mjs';

const CONSENT_URL = 'https://www.dropbox.com/oauth2/authorize';
const RPC = 'https://api.dropboxapi.com/2/';
const CONTENT = 'https://content.dropboxapi.com/2/';
const PHOTO = fileURLToPath(
  new URL('../../../packages/btree_info/src/images/bees.jpg', import.meta.url),
);

const PHOTO_SIZE = 2_400_000;

const TEXTS = {
  de: {
    title: 'Dropbox',
    account: 'Angemeldet als',
    question:
      'b.tree möchte auf einen eigenen Ordner in deiner Dropbox zugreifen:',
    note: 'b.tree sieht nur diesen Ordner, nicht deine anderen Dateien.',
    cancel: 'Abbrechen',
    allow: 'Zulassen',
  },
  en: {
    title: 'Dropbox',
    account: 'Signed in as',
    question: 'b.tree would like access to its own folder in your Dropbox:',
    note: 'b.tree sees only this folder, not your other files.',
    cancel: 'Cancel',
    allow: 'Allow',
  },
};

export const APP_FOLDER = '/Apps/btree - Beekeeping';

const consentPage = (lang, email) => {
  const t = TEXTS[lang];
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8">
<title>${t.title}</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f7f5f2; font-family: Roboto, Helvetica, Arial, sans-serif; color: #1e1919; }
  main { width: 620px; padding: 44px 48px; background: #fff; border-radius: 14px; box-shadow: 0 10px 36px rgba(0,0,0,.14); }
  h1 { margin: 0 0 6px; font-size: 30px; font-weight: 600; }
  .account { margin: 0 0 30px; font-size: 16px; color: #736c64; }
  p { margin: 0 0 14px; font-size: 20px; line-height: 1.4; }
  .folder { margin: 0 0 14px; padding: 14px 18px; background: #f1f3f4; border-radius: 8px; font: 500 19px ui-monospace, Menlo, monospace; }
  .note { font-size: 16px; color: #736c64; }
  .buttons { display: flex; justify-content: flex-end; gap: 14px; margin-top: 34px; }
  button { height: 48px; padding: 0 28px; border: 1px solid #bbb5ae; border-radius: 8px; background: #fff; font: inherit; font-size: 18px; cursor: pointer; }
  #allow { border-color: #0061fe; background: #0061fe; color: #fff; }
</style>
<main>
  <h1>${t.title}</h1>
  <div class="account">${t.account} ${email}</div>
  <p>${t.question}</p>
  <div class="folder">${APP_FOLDER}</div>
  <p class="note">${t.note}</p>
  <div class="buttons">
    <button id="deny">${t.cancel}</button>
    <button id="allow">${t.allow}</button>
  </div>
</main>
<script>
  document.getElementById('allow').addEventListener('click', () => {
    location.replace('${APP_URL}/setting/dropbox?code=video');
  });
</script></html>`;
};

// Answer all Dropbox requests of the page. `entries` has the folders and the
// files: { name, folder?, modified }. Each file shows the same photo.
export async function fakeDropbox(page, { lang, email, entries }) {
  let connected = false;
  const photo = readFileSync(PHOTO);
  // The web app sends its cookies to the b.tree server, so the answer must
  // name the origin of the web app.
  const cors = {
    'access-control-allow-origin': APP_URL,
    'access-control-allow-credentials': 'true',
    'access-control-expose-headers': 'dropbox-api-result',
  };
  const item = (name, folder, modified, i) => ({
    '.tag': folder ? 'folder' : 'file',
    id: `id:bTreeVideo${i}AAAAAAAAAAQ`,
    name,
    path_lower: `/${name.toLowerCase()}`,
    path_display: `/${name}`,
    client_modified: modified,
    // The size of a photo from a phone, not of the small photo of the video.
    size: folder ? 0 : PHOTO_SIZE,
  });
  const list = entries.map((entry, i) =>
    item(entry.name, entry.folder, entry.modified, i),
  );
  const json = (route, body, status = 200) =>
    route.fulfill({
      status,
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });

  const server = (path) => new URL(path, API_URL).toString();
  await page.route(server('dropbox'), (route) =>
    json(route, { url: CONSENT_URL }),
  );
  await page.route(server('dropbox/auth/*'), (route) => {
    connected = true;
    return json(route, { token: 'video' });
  });
  await page.route(server('dropbox/token'), (route) =>
    json(route, connected ? { token: 'video' } : {}),
  );
  await page.route(server('dropbox/0'), (route) => {
    connected = false;
    return json(route, 1);
  });
  await page.route(`${CONSENT_URL}**`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: consentPage(lang, email),
    }),
  );

  await page.route(`${RPC}**`, (route) => {
    const request = route.request();
    const name = request.url().slice(RPC.length);
    const args = request.postDataJSON() ?? {};
    if (!connected) {
      return json(route, { error_summary: 'invalid_access_token/' }, 401);
    }
    if (name === 'users/get_current_account') {
      return json(route, { email, name: { display_name: email } });
    }
    if (name === 'files/list_folder') {
      // The folders of the video are empty.
      return json(route, {
        entries: args.path === '' ? list : [],
        has_more: false,
      });
    }
    if (name === 'files/create_folder_v2') {
      const folder = args.path.split('/').pop();
      list.push(item(folder, true, new Date().toISOString(), list.length));
      return json(route, { metadata: list.at(-1) });
    }
    if (name === 'files/get_metadata') {
      const entry = list.find((file) => file.id === args.path);
      return entry
        ? json(route, entry)
        : json(route, { error_summary: 'path/not_found/' }, 409);
    }
    return json(route, { error_summary: 'video/not_supported/' }, 409);
  });

  await page.route(`${CONTENT}**`, (route) => {
    const args = JSON.parse(route.request().headers()['dropbox-api-arg']);
    const entry = list.find((file) => file.id === args.path);
    return route.fulfill({
      headers: { ...cors, 'dropbox-api-result': JSON.stringify(entry) },
      contentType: 'application/octet-stream',
      body: photo,
    });
  });
}
