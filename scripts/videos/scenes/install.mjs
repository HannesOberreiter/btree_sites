// A phone with a browser, for the installation of b.tree as an app (PWA).
// The browser and the home screen are simple drawings of Chrome on Android
// and Safari on iOS, without their designs. The page in the browser is the
// real app in an iframe.
// Use: await ui.scene(installScene(lang)), then tap the parts with
// installPart(page, name) and set the state with installState(page, state).
// States: one platform (android, ios), one view (browser, menu, confirm, home,
// app) and one step (step-1 to step-3).
// Give phoneLayout of hive.mjs to the init of the episode.

const TEXTS = {
  de: {
    android: {
      title: 'Android',
      browser: 'Chrome',
      steps: [
        'Menü mit den drei Punkten',
        'Zum Startbildschirm hinzufügen',
        'Installieren',
      ],
      menu: [
        'Neuer Tab',
        'Verlauf',
        'Downloads',
        'Lesezeichen',
        'Zum Startbildschirm hinzufügen',
        'Desktopwebsite',
        'Einstellungen',
      ],
      confirmTitle: 'App installieren',
      cancel: 'Abbrechen',
      confirm: 'Installieren',
    },
    ios: {
      title: 'iPhone',
      browser: 'Safari',
      steps: ['Teilen', 'Zum Home-Bildschirm', 'Hinzufügen'],
      menu: [
        'Kopieren',
        'Zur Leseliste hinzufügen',
        'Lesezeichen hinzufügen',
        'Zum Home-Bildschirm',
        'Auf der Seite suchen',
      ],
      confirmTitle: 'Zum Home-Bildschirm',
      cancel: 'Abbrechen',
      confirm: 'Hinzufügen',
    },
  },
  en: {
    android: {
      title: 'Android',
      browser: 'Chrome',
      steps: ['Menu with the three dots', 'Add to Home screen', 'Install'],
      menu: [
        'New tab',
        'History',
        'Downloads',
        'Bookmarks',
        'Add to Home screen',
        'Desktop site',
        'Settings',
      ],
      confirmTitle: 'Install app',
      cancel: 'Cancel',
      confirm: 'Install',
    },
    ios: {
      title: 'iPhone',
      browser: 'Safari',
      steps: ['Share', 'Add to Home Screen', 'Add'],
      menu: [
        'Copy',
        'Add to Reading List',
        'Add Bookmark',
        'Add to Home Screen',
        'Find on Page',
      ],
      confirmTitle: 'Add to Home Screen',
      cancel: 'Cancel',
      confirm: 'Add',
    },
  },
};

// Position of the menu entry that installs the app, per platform.
const INSTALL_ENTRY = { android: 4, ios: 3 };

const HOST = 'app.btree.at';
const ICON = '/icons/apple-icon-180x180.png';
// Size of the screen of the phone, and the scale that it shows the app with.
const SCREEN = { width: 304, height: 658, scale: 0.78 };
// Heights of the bars of the browser around the page.
const BARS = { status: 26, android: 46, ios: 92 };

const frame = (top, bottom) =>
  `top: ${top}px; height: ${((SCREEN.height - top - bottom) / SCREEN.scale).toFixed(1)}px;`;

const STYLE = `
  :host { font-family: Roboto, -apple-system, sans-serif; color: #263238; }
  * { box-sizing: border-box; }
  .stage { position: absolute; inset: 0; overflow: clip; background: linear-gradient(135deg, #d9efe8, #f3faf7 55%, #cfe6d5); }

  .guide { position: absolute; left: 90px; top: 110px; width: 620px; }
  .guide > div { position: absolute; inset: 0 auto auto 0; width: 100%; opacity: 0; transition: opacity .5s; }
  .stage.android .guide .for-android, .stage.ios .guide .for-ios { opacity: 1; }
  .guide h1 { margin: 0; font-size: 58px; font-weight: 700; color: #1d6f5b; }
  .guide h2 { margin: 4px 0 44px; font-size: 26px; font-weight: 400; color: #546e7a; }
  .guide ol { margin: 0; padding: 0; list-style: none; counter-reset: step; }
  .guide li { counter-increment: step; display: flex; align-items: center; gap: 22px; margin-bottom: 26px; font-size: 30px; opacity: .35; transition: opacity .4s, transform .4s; }
  .guide li::before { content: counter(step); flex: none; width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: #2b957a; color: #fff; font-weight: 700; }
  .stage.step-1 .guide li:nth-child(1), .stage.step-2 .guide li:nth-child(2), .stage.step-3 .guide li:nth-child(3) { opacity: 1; transform: translateX(14px); }
  .stage.done .guide li { opacity: 1; }

  .phone { position: absolute; right: 150px; top: 14px; width: ${SCREEN.width + 24}px; height: ${SCREEN.height + 24}px; padding: 12px; border-radius: 40px; background: #1c2529; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
  .screen { position: relative; width: 100%; height: 100%; border-radius: 28px; overflow: clip; background: #fff; }
  .screen > * { position: absolute; left: 0; width: 100%; }
  .status { top: 0; height: ${BARS.status}px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; background: #fff; z-index: 2; }
  .status span:last-child { display: flex; gap: 5px; align-items: center; }
  .status i { display: block; background: currentColor; border-radius: 2px; }
  .stage.app .status, .stage.home .status { background: transparent; color: #fff; }
  .stage.app .status { background: #2b957a; }

  .screen > iframe { border: 0; width: ${(SCREEN.width / SCREEN.scale).toFixed(1)}px; transform: scale(${SCREEN.scale}); transform-origin: 0 0; ${frame(BARS.status + BARS.android, 0)} }
  .stage.ios .screen > iframe { ${frame(BARS.status, BARS.ios)} }
  .stage.app .screen > iframe { ${frame(BARS.status, 0)} }

  .bar { display: none; background: #f1f3f4; align-items: center; gap: 10px; padding: 0 10px; z-index: 2; }
  .address { flex: 1; height: 32px; border-radius: 16px; background: #fff; display: flex; align-items: center; gap: 6px; padding: 0 12px; font-size: 13px; color: #37474f; }
  .address svg { width: 11px; height: 11px; fill: #607d8b; }
  .tabs { width: 20px; height: 20px; border: 2px solid #455a64; border-radius: 5px; font-size: 10px; font-weight: 700; display: grid; place-items: center; }
  .part { cursor: pointer; }
  .dots { width: 30px; height: 34px; display: grid; place-items: center; }
  .dots svg { width: 5px; height: 20px; fill: #455a64; }
  .bar.android { top: ${BARS.status}px; height: ${BARS.android}px; }
  .stage.android:not(.app):not(.home) .bar.android { display: flex; }
  .bar.ios { bottom: 0; height: ${BARS.ios}px; flex-direction: column; justify-content: center; gap: 8px; background: #f7f7f7; border-top: 1px solid #ddd; }
  .stage.ios:not(.app):not(.home) .bar.ios { display: flex; }
  .bar.ios .address { flex: none; width: 100%; justify-content: center; background: #e9e9eb; border-radius: 10px; }
  .tools { width: 100%; display: flex; justify-content: space-around; align-items: center; }
  .tools svg { width: 24px; height: 24px; fill: none; stroke: #007aff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  .shade { top: 0; height: 100%; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .3s; z-index: 3; }
  .stage.menu .shade, .stage.confirm .shade { opacity: 1; }

  .sheet { display: none; z-index: 4; background: #fff; font-size: 14px; }
  .sheet .entry { padding: 11px 16px; display: flex; align-items: center; gap: 12px; }
  .sheet .entry svg { width: 18px; height: 18px; fill: none; stroke: #455a64; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .sheet .entry.install { font-weight: 700; color: #1d6f5b; background: #e3f4ee; }
  .sheet .entry.install svg { stroke: #1d6f5b; }
  .sheet.android { left: auto; right: 8px; top: ${BARS.status + 6}px; width: 250px; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,.35); padding: 6px 0; transform-origin: 100% 0; animation: pop .25s ease-out; }
  .stage.android.menu .sheet.android { display: block; }
  .sheet.ios { bottom: 0; border-radius: 16px 16px 0 0; padding: 14px 12px 22px; background: #f2f2f7; animation: rise .3s ease-out; }
  .stage.ios.menu .sheet.ios { display: block; }
  .sheet.ios .page { display: flex; align-items: center; gap: 10px; padding: 0 4px 12px; font-size: 13px; }
  .sheet.ios .page img { width: 36px; height: 36px; border-radius: 8px; }
  .sheet.ios .people { display: flex; gap: 14px; padding: 4px 4px 14px; }
  .sheet.ios .people i { width: 46px; height: 46px; border-radius: 12px; background: #d1d1d6; }
  .sheet.ios .list { background: #fff; border-radius: 12px; overflow: hidden; }
  .sheet.ios .entry { justify-content: space-between; border-bottom: 1px solid #e5e5ea; }
  .sheet.ios .entry svg { stroke: #1c1c1e; }

  .dialog { display: none; z-index: 5; background: #fff; }
  .dialog img { border-radius: 14px; }
  .dialog .name { font-weight: 700; }
  .dialog .host { font-size: 12px; color: #78909c; }
  .dialog.android { left: 22px; width: calc(100% - 44px); top: 210px; border-radius: 22px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,.4); animation: pop .25s ease-out; }
  .stage.android.confirm .dialog.android { display: block; }
  .dialog.android h3 { margin: 0 0 16px; font-size: 18px; font-weight: 500; }
  .dialog.android .app { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
  .dialog.android img { width: 48px; height: 48px; }
  .dialog.android .buttons { display: flex; justify-content: flex-end; gap: 8px; font-size: 14px; font-weight: 700; color: #1d6f5b; }
  .dialog.android .buttons span { padding: 9px 16px; border-radius: 18px; }
  .dialog.android .buttons .yes { background: #2b957a; color: #fff; }
  .dialog.ios { top: ${BARS.status + 30}px; bottom: 0; border-radius: 16px 16px 0 0; background: #f2f2f7; animation: rise .3s ease-out; }
  .stage.ios.confirm .dialog.ios { display: block; }
  .dialog.ios .top { display: flex; justify-content: space-between; align-items: center; padding: 14px 10px; font-size: 12px; white-space: nowrap; color: #007aff; }
  .dialog.ios .top b { color: #1c1c1e; }
  .dialog.ios .top .yes { font-weight: 700; }
  .dialog.ios .app { display: flex; gap: 12px; align-items: center; margin: 6px 14px; padding: 12px; background: #fff; border-radius: 12px; }
  .dialog.ios img { width: 52px; height: 52px; }

  .homescreen { display: none; top: 0; height: 100%; z-index: 1; padding: ${BARS.status + 26}px 20px 0; background: linear-gradient(160deg, #1d6f5b, #2b957a 45%, #f0b429); }
  .stage.home .homescreen { display: block; }
  .apps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px 14px; }
  .apps i, .apps img { display: block; width: 52px; height: 52px; border-radius: 14px; margin: 0 auto 5px; }
  .apps i { background: rgba(255,255,255,.3); }
  .apps div { font-size: 11px; color: #fff; text-align: center; height: 74px; }
  .apps .btree { animation: appear .6s ease-out; }
  .apps .btree img { box-shadow: 0 0 0 3px #fff, 0 6px 18px rgba(0,0,0,.4); }

  @keyframes pop { from { transform: scale(.85); opacity: 0; } }
  @keyframes rise { from { transform: translateY(60%); opacity: 0; } }
  @keyframes appear { 0% { transform: scale(0); } 70% { transform: scale(1.25); } }
`;

const ICONS = {
  lock: '<svg viewBox="0 0 12 12"><path d="M3 5V3.5a3 3 0 0 1 6 0V5h1v6H2V5zm1.5 0h3V3.5a1.5 1.5 0 0 0-3 0z"/></svg>',
  dots: '<svg viewBox="0 0 5 20"><circle cx="2.5" cy="2.5" r="2.5"/><circle cx="2.5" cy="10" r="2.5"/><circle cx="2.5" cy="17.5" r="2.5"/></svg>',
  share:
    '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4M6 11H5v10h14V11h-1"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  forward: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M12 6c-2-2-5-2-8-1v13c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1zM12 6v13"/></svg>',
  pages:
    '<svg viewBox="0 0 24 24"><rect x="8" y="4" width="12" height="12" rx="2"/><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2"/></svg>',
  add: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  item: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
};

function guide(texts, platform) {
  return `<div class="for-${platform}">
    <h1>${texts.title}</h1>
    <h2>${texts.browser} · ${HOST}</h2>
    <ol>${texts.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
  </div>`;
}

function entries(texts, platform) {
  return texts.menu
    .map((text, index) => {
      const install = index === INSTALL_ENTRY[platform];
      const icon = install ? ICONS.add : ICONS.item;
      return platform === 'android'
        ? `<div class="entry${install ? ' install part' : ''}"${install ? ' data-part="install"' : ''}>${icon}${text}</div>`
        : `<div class="entry${install ? ' install part' : ''}"${install ? ' data-part="install"' : ''}>${text}${icon}</div>`;
    })
    .join('');
}

const app = `<div class="app"><img src="${ICON}" alt=""><div><div class="name">btree</div><div class="host">${HOST}</div></div></div>`;

// url is the page of the app that the browser shows.
export function installScene(lang, url = '/') {
  const { android, ios } = TEXTS[lang];
  const html = `<style>${STYLE}</style>
    <div class="stage android browser">
      <div class="guide">${guide(android, 'android')}${guide(ios, 'ios')}</div>
      <div class="phone"><div class="screen">
        <iframe src="${url}"></iframe>
        <div class="homescreen"><div class="apps">
          ${'<div><i></i></div>'.repeat(9)}
          <div class="btree part" data-part="icon"><img src="${ICON}" alt="">btree</div>
        </div></div>
        <div class="status"><span>9:41</span><span><i style="width:14px;height:9px"></i><i style="width:20px;height:10px"></i></span></div>

        <div class="bar android">
          <div class="address">${ICONS.lock}${HOST}</div>
          <div class="tabs">1</div>
          <div class="dots part" data-part="open">${ICONS.dots}</div>
        </div>
        <div class="bar ios">
          <div class="address">${ICONS.lock}${HOST}</div>
          <div class="tools">${ICONS.back}${ICONS.forward}<span class="part" data-part="open">${ICONS.share}</span>${ICONS.book}${ICONS.pages}</div>
        </div>

        <div class="shade"></div>
        <div class="sheet android">${entries(android, 'android')}</div>
        <div class="sheet ios">
          <div class="page"><img src="${ICON}" alt=""><div><b>b.tree</b><br>${HOST}</div></div>
          <div class="people"><i></i><i></i><i></i><i></i><i></i></div>
          <div class="list">${entries(ios, 'ios')}</div>
        </div>
        <div class="dialog android">
          <h3>${android.confirmTitle}</h3>${app}
          <div class="buttons"><span>${android.cancel}</span><span class="yes part" data-part="confirm">${android.confirm}</span></div>
        </div>
        <div class="dialog ios">
          <div class="top"><span>${ios.cancel}</span><b>${ios.confirmTitle}</b><span class="yes part" data-part="confirm">${ios.confirm}</span></div>
          ${app}
        </div>
      </div></div>
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

// A part of the phone that the video taps: open (the menu or the share
// button), install (the menu entry), confirm (the button) or icon (the app on
// the home screen). Only the part of the current platform and view shows.
export function installPart(page, name) {
  return page.locator(`#video-scene [data-part="${name}"]:visible`);
}

// Set the state of the scene, for example 'ios menu step-2'.
export function installState(page, state) {
  return page.locator('#video-scene').evaluate((host, names) => {
    host.shadowRoot.querySelector('.stage').className = `stage ${names}`;
  }, state);
}
