import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const componentPath = new URL('../packages/btree_info/src/components/SelectLanguage.astro', import.meta.url);
const componentSource = await readFile(componentPath, 'utf8');
const scriptSource = componentSource.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(scriptSource, 'SelectLanguage script not found');

function createLanguageSwitcher(pathname) {
  const listeners = new Map();
  const buttons = ['en', 'de'].map(lang => ({
    dataset: { lang },
    addEventListener: (event, callback) => listeners.set(`${lang}:${event}`, callback),
  }));
  const storage = new Map();
  const context = {
    document: {
      querySelectorAll: () => buttons,
    },
    localStorage: {
      setItem: (key, value) => storage.set(key, value),
    },
    window: {
      location: { pathname },
    },
  };

  vm.runInNewContext(stripTypeScriptTypes(scriptSource), context);

  return {
    click: lang => listeners.get(`${lang}:click`)(),
    get pathname() {
      return context.window.location.pathname;
    },
  };
}

test('repeated German selections do not duplicate the locale prefix', () => {
  const switcher = createLanguageSwitcher('/features/');

  switcher.click('de');
  switcher.click('de');
  switcher.click('de');

  assert.equal(switcher.pathname, '/de/features/');
});

test('repeated English selections preserve the page path', () => {
  const switcher = createLanguageSwitcher('/features/');

  switcher.click('en');
  switcher.click('en');

  assert.equal(switcher.pathname, '/features/');
});

test('switching languages replaces only the locale prefix', () => {
  const switcher = createLanguageSwitcher('/de/features/');

  switcher.click('en');
  assert.equal(switcher.pathname, '/features/');

  switcher.click('de');
  assert.equal(switcher.pathname, '/de/features/');
});
