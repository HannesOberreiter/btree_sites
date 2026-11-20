// A calendar app for the videos: subscribe to a calendar by URL.
// It is a simple copy of the steps in Google Calendar, without its design.
// Use: await ui.scene(calendarScene(lang)), then click #cal-add, #cal-from-url,
// fill #cal-url and click #cal-submit. The b.tree entries then show in the month.

const TEXTS = {
  de: {
    locale: 'de-AT',
    title: 'Kalender',
    mine: 'Meine Kalender',
    own: ['Privat', 'Geburtstage'],
    other: 'Weitere Kalender',
    menu: ['Kalender abonnieren', 'Neuen Kalender erstellen', 'Importieren'],
    fromUrl: 'Per URL',
    urlLabel: 'URL des Kalenders',
    submit: 'Kalender hinzufügen',
    days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    private: ['Zahnarzt', 'Geburtstag Anna'],
    // Examples of todos, not the data of the demo company.
    btree: [
      'Gläser bestellen',
      'Varroa kontrollieren',
      'Rähmchen drahten',
      'Material reinigen',
    ],
  },
  en: {
    locale: 'en-GB',
    title: 'Calendar',
    mine: 'My calendars',
    own: ['Private', 'Birthdays'],
    other: 'Other calendars',
    menu: ['Subscribe to calendar', 'Create new calendar', 'Import'],
    fromUrl: 'From URL',
    urlLabel: 'URL of calendar',
    submit: 'Add calendar',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    private: ['Dentist', "Anna's birthday"],
    btree: ['Order jars', 'Check Varroa', 'Wire frames', 'Clean tools'],
  },
};

// Days of the month that get an entry.
const PRIVATE_DAYS = [9, 24];
const BTREE_DAYS = [5, 12, 13, 21];

const STYLE = `
  :host { font-family: Roboto, -apple-system, sans-serif; color: #263238; }
  * { box-sizing: border-box; }
  .cal { position: absolute; inset: 0; display: flex; flex-direction: column; background: #fff; }
  .top { display: flex; align-items: center; gap: 16px; height: 64px; padding: 0 24px; border-bottom: 1px solid #e0e0e0; }
  .logo { width: 36px; height: 36px; border-radius: 8px; background: #1e88e5; color: #fff; font-weight: 700; display: grid; place-items: center; }
  .top .name { font-size: 26px; color: #546e7a; }
  .top .month { font-size: 26px; margin-left: 130px; text-transform: capitalize; }
  .body { flex: 1; display: flex; min-height: 0; }
  .side { width: 300px; padding: 20px 16px; border-right: 1px solid #e0e0e0; font-size: 18px; }
  .side h4 { display: flex; align-items: center; justify-content: space-between; margin: 0 0 4px; height: 40px; font-size: 18px; font-weight: 500; }
  .side .entry { display: flex; align-items: center; gap: 12px; height: 38px; }
  .box { width: 18px; height: 18px; border-radius: 3px; }
  .group { margin-bottom: 20px; position: relative; }
  #cal-add { width: 34px; height: 34px; border: 0; border-radius: 50%; background: #eceff1; font-size: 22px; line-height: 1; cursor: pointer; color: #263238; }
  #cal-menu { position: absolute; left: 170px; top: 44px; width: 290px; padding: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,.25); opacity: 0; transform: translateY(-8px); pointer-events: none; transition: opacity .2s, transform .2s; z-index: 2; }
  #cal-menu.open { opacity: 1; transform: none; pointer-events: auto; }
  #cal-menu div { padding: 12px 22px; cursor: pointer; }
  #cal-sub { display: none; }
  .subscribed #cal-sub { display: flex; animation: appear .5s; }
  .grid { flex: 1; display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: 32px; grid-auto-rows: 1fr; }
  .grid .head { display: grid; place-items: center; font-size: 15px; color: #78909c; border-bottom: 1px solid #e0e0e0; }
  .day { border-right: 1px solid #eceff1; border-bottom: 1px solid #eceff1; padding: 6px; font-size: 15px; min-width: 0; }
  .day .num { color: #546e7a; margin-bottom: 4px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; }
  .day .num.today { background: #1e88e5; color: #fff; }
  .event { padding: 4px 8px; border-radius: 4px; color: #fff; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .event.private { background: #1e88e5; }
  .event.btree { background: #2b957a; opacity: 0; transform: scale(.6); transition: opacity .4s, transform .4s; transition-delay: calc(var(--i) * .25s + .3s); }
  .subscribed .event.btree { opacity: 1; transform: none; }
  #cal-dialog { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(38,50,56,.45); opacity: 0; pointer-events: none; transition: opacity .25s; z-index: 3; }
  #cal-dialog.open { opacity: 1; pointer-events: auto; }
  .panel { width: 720px; padding: 32px 36px; background: #fff; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.3); }
  .panel h3 { margin: 0 0 20px; font-size: 24px; font-weight: 500; }
  .panel label { display: block; font-size: 15px; color: #78909c; margin-bottom: 6px; }
  #cal-url { width: 100%; height: 48px; padding: 0 12px; border: 0; border-bottom: 2px solid #1e88e5; background: #f1f3f4; font: inherit; font-size: 17px; outline: none; }
  #cal-submit { margin-top: 24px; height: 44px; padding: 0 24px; border: 0; border-radius: 22px; background: #1e88e5; color: #fff; font: inherit; font-size: 17px; font-weight: 500; cursor: pointer; }
  @keyframes appear { from { opacity: 0; } }
`;

// Adds the behaviour. Runs in the page with the host element of the scene.
function setup(host) {
  const root = host.shadowRoot;
  const menu = root.getElementById('cal-menu');
  const dialog = root.getElementById('cal-dialog');
  root
    .getElementById('cal-add')
    .addEventListener('click', () => menu.classList.add('open'));
  root.getElementById('cal-from-url').addEventListener('click', () => {
    menu.classList.remove('open');
    dialog.classList.add('open');
  });
  root.getElementById('cal-submit').addEventListener('click', () => {
    dialog.classList.remove('open');
    root.querySelector('.cal').classList.add('subscribed');
  });
}

const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');

export function calendarScene(lang, today = new Date()) {
  const t = TEXTS[lang];
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Empty cells before day 1, the week starts on Monday.
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const event = (kind, text, i) =>
    `<div class="event ${kind}" style="--i: ${i}">${escape(text)}</div>`;
  const days = Array.from({ length: cells }, (_, cell) => {
    const day = cell - offset + 1;
    if (day < 1 || day > daysInMonth) {
      return '<div class="day"></div>';
    }
    const p = PRIVATE_DAYS.indexOf(day);
    const b = BTREE_DAYS.indexOf(day);
    return `<div class="day"><div class="num${day === today.getDate() ? ' today' : ''}">${day}</div>${
      p >= 0 ? event('private', t.private[p], 0) : ''
    }${b >= 0 ? event('btree', t.btree[b], b) : ''}</div>`;
  }).join('');
  const entry = (colour, text, id = '') =>
    `<div class="entry"${id}><span class="box" style="background: ${colour}"></span>${escape(text)}</div>`;
  const html = `<style>${STYLE}</style>
    <div class="cal">
      <div class="top">
        <div class="logo">${today.getDate()}</div>
        <div class="name">${t.title}</div>
        <div class="month">${escape(
          today.toLocaleDateString(t.locale, {
            month: 'long',
            year: 'numeric',
          }),
        )}</div>
      </div>
      <div class="body">
        <div class="side">
          <div class="group">
            <h4>${t.mine}</h4>
            ${entry('#1e88e5', t.own[0])}${entry('#8e24aa', t.own[1])}
          </div>
          <div class="group">
            <h4>${t.other}<button id="cal-add">+</button></h4>
            ${entry('#2b957a', 'b.tree ToDo', ' id="cal-sub"')}
            <div id="cal-menu">
              <div>${t.menu[0]}</div>
              <div>${t.menu[1]}</div>
              <div id="cal-from-url">${t.fromUrl}</div>
              <div>${t.menu[2]}</div>
            </div>
          </div>
        </div>
        <div class="grid">
          ${t.days.map((d) => `<div class="head">${d}</div>`).join('')}
          ${days}
        </div>
      </div>
      <div id="cal-dialog">
        <div class="panel">
          <h3>${t.fromUrl}</h3>
          <label>${t.urlLabel}</label>
          <input id="cal-url" type="text">
          <div><button id="cal-submit">${t.submit}</button></div>
        </div>
      </div>
    </div>`;
  return { html, setup };
}
