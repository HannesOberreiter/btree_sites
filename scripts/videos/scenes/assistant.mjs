// An AI assistant for the videos: add b.tree as a connector (MCP server).
// It is a simple drawing of the steps in an AI client, without the design of
// a product.
// Use: await ui.scene(assistantScene(lang)), then fill #mcp-url and click
// #mcp-connect.

const TEXTS = {
  de: {
    title: 'KI-Assistent',
    nav: ['Neuer Chat', 'Verlauf', 'Konnektoren', 'Einstellungen'],
    heading: 'Konnektoren',
    hint: 'Konnektoren geben dem Assistenten Zugriff auf deine Programme.',
    add: 'Eigenen Konnektor hinzufügen',
    name: 'Name',
    url: 'URL des MCP-Servers',
    connect: 'Verbinden',
  },
  en: {
    title: 'AI assistant',
    nav: ['New chat', 'History', 'Connectors', 'Settings'],
    heading: 'Connectors',
    hint: 'Connectors give the assistant access to your programs.',
    add: 'Add a custom connector',
    name: 'Name',
    url: 'URL of the MCP server',
    connect: 'Connect',
  },
};

// Position of the open page in the navigation.
const ACTIVE = 2;

const STYLE = `
  :host { font-family: Roboto, -apple-system, sans-serif; color: #263238; }
  * { box-sizing: border-box; }
  .app { position: absolute; inset: 0; display: flex; background: #f7f7f5; }
  nav { width: 250px; padding: 26px 18px; background: #2f3437; color: #cfd8dc; }
  nav h1 { margin: 0 0 30px; font-size: 22px; color: #fff; }
  nav div { padding: 11px 14px; border-radius: 8px; font-size: 16px; }
  nav div.active { background: #454c50; color: #fff; }
  main { flex: 1; padding: 46px 70px; }
  main h2 { margin: 0; font-size: 32px; }
  main p { margin: 8px 0 34px; font-size: 17px; color: #607d8b; }
  .card { width: 720px; padding: 30px; border-radius: 14px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.1); }
  .card h3 { margin: 0 0 22px; font-size: 21px; }
  label { display: block; margin-bottom: 6px; font-size: 14px; color: #607d8b; }
  input { width: 100%; margin-bottom: 20px; padding: 12px 14px; border: 1px solid #b0bec5; border-radius: 8px; font: inherit; font-size: 17px; }
  input:focus { outline: 2px solid #2b957a; border-color: transparent; }
  button { padding: 12px 26px; border: 0; border-radius: 8px; background: #2f3437; color: #fff; font: inherit; font-size: 17px; cursor: pointer; }
`;

export function assistantScene(lang) {
  const t = TEXTS[lang];
  const html = `<style>${STYLE}</style>
    <div class="app">
      <nav>
        <h1>${t.title}</h1>
        ${t.nav.map((entry, index) => `<div${index === ACTIVE ? ' class="active"' : ''}>${entry}</div>`).join('')}
      </nav>
      <main>
        <h2>${t.heading}</h2>
        <p>${t.hint}</p>
        <div class="card">
          <h3>${t.add}</h3>
          <label>${t.name}</label>
          <input value="b.tree" readonly>
          <label>${t.url}</label>
          <input id="mcp-url">
          <button id="mcp-connect">${t.connect}</button>
        </div>
      </main>
    </div>`;
  return { html, setup: () => {} };
}
