// A beekeeper at a hive with a phone, for the steps at the hive that a screen
// recording cannot show: scan a QR code or an NFC tag.
// The big phone on the right shows the real app in an iframe.
// Use: await ui.scene(hiveScene({ tag, url })), then use the app with
// phoneFrame(page), and switch the states with sceneState(page, name, on):
// - is-camera: the phone shows its camera with the QR code of the hive.
// - is-scanning: waves between the phone of the beekeeper and the tag.
// Give phoneLayout to the init of the episode, so that the app in the phone
// has the layout of a phone.

// Size of the app in the phone, and the scale that the scene shows it with.
const APP = { width: 390, height: 844, scale: 0.78 };

const STYLE = `
  :host { font-family: Roboto, -apple-system, sans-serif; color: #263238; }
  * { box-sizing: border-box; }
  .stage { position: absolute; inset: 0; overflow: clip; background: linear-gradient(#d9efe8 0%, #f3faf7 62%, #cfe6d5 62%, #b9dcc4 100%); }
  .picture { position: absolute; inset: 0; width: 100%; height: 100%; }
  .phone { position: absolute; right: 70px; top: 14px; width: ${APP.width * APP.scale + 24}px; height: ${APP.height * APP.scale + 24}px; padding: 12px; border-radius: 40px; background: #1c2529; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
  .screen { position: relative; width: 100%; height: 100%; border-radius: 28px; overflow: clip; background: #fff; }
  /* The iframe has its full size in the layout. overflow: clip prevents that a scroll to an element of the app moves it. */
  iframe { width: ${APP.width}px; height: ${APP.height}px; border: 0; transform: scale(${APP.scale}); transform-origin: 0 0; }
  .camera { position: absolute; inset: 0; display: grid; place-items: center; background: #37474f; opacity: 0; pointer-events: none; transition: opacity .4s; }
  .stage.is-camera .camera { opacity: 1; }
  .camera .wood { width: 100%; height: 100%; background: repeating-linear-gradient(90deg, #dcae63 0 46px, #d5a559 46px 48px); display: grid; place-items: center; }
  .camera .sticker { width: 190px; height: 190px; padding: 14px; background: #fff; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,.3); }
  .camera .finder { position: absolute; width: 236px; height: 236px; border-radius: 18px; box-shadow: 0 0 0 600px rgba(0,0,0,.45); }
  .camera .finder::before { content: ''; position: absolute; inset: -3px; border: 5px solid #fff; border-radius: 20px; clip-path: polygon(0 0, 30% 0, 30% 12%, 70% 12%, 70% 0, 100% 0, 100% 30%, 88% 30%, 88% 70%, 100% 70%, 100% 100%, 70% 100%, 70% 88%, 30% 88%, 30% 100%, 0 100%, 0 70%, 12% 70%, 12% 30%, 0 30%); }
  .camera .line { position: absolute; width: 220px; height: 3px; background: #7be0c3; box-shadow: 0 0 10px #7be0c3; animation: sweep 1.6s ease-in-out infinite alternate; }
  .wave { fill: none; stroke: #2b957a; stroke-width: 5; stroke-linecap: round; opacity: 0; }
  .stage.is-scanning .wave { animation: wave 1.2s ease-out infinite; animation-delay: calc(var(--i) * .2s); }
  .bee { animation: fly 5s ease-in-out infinite alternate; }
  .bee.b2 { animation-duration: 7s; animation-delay: -2s; }
  .bee.b3 { animation-duration: 6s; animation-delay: -4s; }
  @keyframes sweep { from { transform: translateY(-96px); } to { transform: translateY(96px); } }
  @keyframes wave { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes fly { 0% { transform: translate(0, 0); } 35% { transform: translate(26px, -18px); } 70% { transform: translate(-14px, -30px); } 100% { transform: translate(18px, 8px); } }
`;

// A QR code look, not a real code: three finder squares and a fixed pattern.
function qrPattern(size) {
  const n = 21;
  const cell = size / n;
  const finder = (x, y) => x < 7 && y < 7;
  const dark = (x, y) => {
    for (const [fx, fy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      if (finder(x - fx, y - fy) && x >= fx && y >= fy) {
        const dx = x - fx;
        const dy = y - fy;
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring !== 2;
      }
    }
    // A fixed pattern that looks random.
    return (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0;
  };
  let rects = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (dark(x, y)) {
        rects += `<rect x="${(x * cell).toFixed(2)}" y="${(y * cell).toFixed(2)}" width="${(cell + 0.3).toFixed(2)}" height="${(cell + 0.3).toFixed(2)}"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" fill="#111">${rects}</svg>`;
}

const BEE = `<g>
  <ellipse cx="0" cy="0" rx="9" ry="6" fill="#f5b800"/>
  <path d="M-3 -6v12M2 -6v12" stroke="#3e2f1c" stroke-width="2.4"/>
  <ellipse cx="-2" cy="-8" rx="6" ry="3.5" fill="#fff" opacity=".85"/>
  <ellipse cx="5" cy="-8" rx="5" ry="3" fill="#fff" opacity=".85"/>
</g>`;

// The tag on the hive, with its middle at 0, 0.
const TAGS = {
  qr: `<rect x="-27" y="-27" width="54" height="54" rx="3" fill="#fff" stroke="#b98a3e"/>
    <g transform="translate(-22 -22)"><svg width="44" height="44">${qrPattern(44)}</svg></g>`,
  nfc: `<circle r="24" fill="#fff" stroke="#90a4ae" stroke-width="2"/>
    <path d="M-9 -9a13 13 0 0 1 0 18M-2 -13a19 19 0 0 1 0 26M5 -5a7 7 0 0 1 0 10" fill="none" stroke="#2b957a" stroke-width="3.2" stroke-linecap="round" transform="translate(-1 0)"/>`,
};

function picture(tag) {
  return `<svg class="picture" viewBox="0 0 1280 720">
    <circle cx="700" cy="110" r="46" fill="#ffe082"/>
    <ellipse cx="170" cy="150" rx="90" ry="26" fill="#fff" opacity=".8"/>
    <ellipse cx="240" cy="132" rx="60" ry="22" fill="#fff" opacity=".8"/>
    <path d="M0 470q160-40 330-10t950-24v40H0z" fill="#c3e0cc"/>

    <!-- hive: stand, two boxes, roof -->
    <ellipse cx="270" cy="640" rx="190" ry="22" fill="#9ccbae"/>
    <rect x="140" y="590" width="22" height="50" fill="#8d6e63"/>
    <rect x="378" y="590" width="22" height="50" fill="#8d6e63"/>
    <rect x="120" y="574" width="300" height="20" rx="3" fill="#a1887f"/>
    <rect x="130" y="424" width="280" height="150" rx="4" fill="#e3b565" stroke="#b98a3e" stroke-width="4"/>
    <rect x="130" y="290" width="280" height="134" rx="4" fill="#ebc47c" stroke="#b98a3e" stroke-width="4"/>
    <rect x="212" y="548" width="116" height="12" rx="4" fill="#5d4037"/>
    <rect x="196" y="570" width="148" height="10" rx="3" fill="#c9974a"/>
    <path d="M112 262h316l14 30H98z" fill="#90a4ae" stroke="#607d8b" stroke-width="4" stroke-linejoin="round"/>
    <rect x="150" y="318" width="60" height="26" rx="3" fill="#fff" stroke="#b98a3e" stroke-width="2"/>
    <text x="180" y="338" text-anchor="middle" font-size="20" font-weight="700" fill="#37474f">A01</text>
    <g transform="translate(322 362)">${TAGS[tag]}</g>

    <!-- beekeeper: legs, body, the arm with the phone, head with hat and veil -->
    <ellipse cx="560" cy="648" rx="110" ry="16" fill="#9ccbae"/>
    <path d="M520 500h38v126h-38zM566 500h38v126h-38z" fill="#fafafa" stroke="#b0bec5" stroke-width="3"/>
    <path d="M510 624h52v22h-60q-6-14 8-22zM562 624h52q14 8 8 22h-60z" fill="#5d4037"/>
    <rect x="504" y="330" width="116" height="190" rx="34" fill="#fafafa" stroke="#b0bec5" stroke-width="3"/>
    <path d="M562 340v170" stroke="#cfd8dc" stroke-width="3"/>
    <path d="M600 372q44 40 30 104" fill="none" stroke="#b0bec5" stroke-width="33" stroke-linecap="round"/>
    <path d="M600 372q44 40 30 104" fill="none" stroke="#fafafa" stroke-width="27" stroke-linecap="round"/>
    <circle cx="630" cy="482" r="15" fill="#ffcc80"/>
    <path d="M524 366q-60-2-100 0" fill="none" stroke="#b0bec5" stroke-width="33" stroke-linecap="round"/>
    <path d="M524 366q-60-2-100 0" fill="none" stroke="#fafafa" stroke-width="27" stroke-linecap="round"/>
    <circle cx="420" cy="366" r="15" fill="#ffcc80"/>
    <rect x="386" y="334" width="24" height="56" rx="5" fill="#263238"/>
    <rect x="389" y="339" width="18" height="44" rx="2" fill="#7be0c3"/>
    <circle cx="562" cy="282" r="40" fill="#ffcc80"/>
    <circle cx="548" cy="278" r="4" fill="#3e2f1c"/><circle cx="574" cy="278" r="4" fill="#3e2f1c"/>
    <path d="M546 296q16 12 32 0" fill="none" stroke="#3e2f1c" stroke-width="3" stroke-linecap="round"/>
    <path d="M508 246h108v74q-54 34-108 0z" fill="#cfd8dc" opacity=".45" stroke="#90a4ae" stroke-width="2"/>
    <ellipse cx="562" cy="244" rx="78" ry="16" fill="#e6c789" stroke="#b98a3e" stroke-width="3"/>
    <path d="M522 240q4-46 40-46t40 46z" fill="#e6c789" stroke="#b98a3e" stroke-width="3"/>

    <!-- waves between the phone of the beekeeper and the tag -->
    <g transform="translate(376 362)">
      <path class="wave" style="--i: 0" d="M0 -10a14 14 0 0 0 0 20"/>
      <path class="wave" style="--i: 1" d="M-9 -17a24 24 0 0 0 0 34"/>
      <path class="wave" style="--i: 2" d="M-18 -24a34 34 0 0 0 0 48"/>
    </g>

    <g transform="translate(250 220)"><g class="bee">${BEE}</g></g>
    <g transform="translate(90 400)"><g class="bee b2">${BEE}</g></g>
    <g transform="translate(470 180)"><g class="bee b3">${BEE}</g></g>
  </svg>`;
}

// tag is 'qr' or 'nfc', url is the page of the app that the phone shows first.
export function hiveScene({ tag, url }) {
  const html = `<style>${STYLE}</style>
    <div class="stage">
      ${picture(tag)}
      <div class="phone">
        <div class="screen">
          <iframe src="${url}"></iframe>
          <div class="camera">
            <div class="wood"><div class="sticker">${qrPattern(162)}</div></div>
            <div class="finder"></div>
            <div class="line"></div>
          </div>
        </div>
      </div>
    </div>`;
  return {
    html,
    // The phone has no mouse. Remove the pointer of the video.
    setup: () => {
      document.getElementById('video-cursor')?.remove();
      window.__videoCursor = () => {};
    },
  };
}

// Init script: the app detects a phone from the user agent. Give the app in
// the phone of the scene the user agent of a phone.
export function phoneLayout() {
  if (window.top !== window) {
    Object.defineProperty(navigator, 'userAgent', {
      get: () =>
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    });
  }
}

// Init script: Web NFC exists only in Chrome on Android. Give the app in the
// phone of the scene an NFC reader that the episode controls with nfcTag and
// nfcWritten.
export function fakeNfc() {
  if (window.top === window) {
    return;
  }
  const readers = [];
  let written = () => {};
  window.NDEFReader = class extends EventTarget {
    constructor() {
      super();
      readers.push(this);
    }
    scan() {
      return Promise.resolve();
    }
    write() {
      return new Promise((resolve) => {
        written = resolve;
      });
    }
  };
  const query = navigator.permissions.query.bind(navigator.permissions);
  navigator.permissions.query = (descriptor) =>
    descriptor.name === 'nfc'
      ? Promise.resolve({ state: 'granted' })
      : query(descriptor);
  window.__nfcWritten = () => written();
  window.__nfcTag = (id) => {
    for (const reader of readers) {
      const event = new Event('reading');
      event.message = { records: [{ recordType: 'url', id }] };
      reader.dispatchEvent(event);
    }
  };
}

// The NFC tag takes the data that the app writes.
export function nfcWritten(page) {
  return phoneFrame(page)
    .locator('body')
    .evaluate(() => window.__nfcWritten());
}

// The phone reads an NFC tag that has the path of the app as its id.
export function nfcTag(page, id) {
  return phoneFrame(page)
    .locator('body')
    .evaluate((_body, path) => window.__nfcTag(path), id);
}

// The app in the phone of the scene.
export function phoneFrame(page) {
  return page.frameLocator('#video-scene iframe');
}

// Open a page of the app in the phone of the scene.
export async function phoneGoto(page, url) {
  await page.locator('#video-scene').evaluate((host, src) => {
    host.shadowRoot.querySelector('iframe').src = src;
  }, url);
  await phoneFrame(page).locator('.q-layout').waitFor();
}

// A scan in the phone of the scene: give the URL of a hive to the scanner of
// the app, as the QR scanner and the NFC reader of the app do. An open form
// with a hive field then adds the hive.
export function phoneScan(page, hiveId) {
  return phoneFrame(page)
    .locator('#q-app')
    .evaluate((app, id) => {
      const pinia = app.__vue_app__.config.globalProperties.$pinia;
      pinia._s.get('scanning').extractUrl(`/detail/hive/${id}`);
    }, hiveId);
}

// Switch a state of the scene on or off.
export function sceneState(page, name, on = true) {
  return page.locator('#video-scene').evaluate(
    (host, [state, add]) => {
      host.shadowRoot.querySelector('.stage').classList.toggle(state, add);
    },
    [name, on],
  );
}
