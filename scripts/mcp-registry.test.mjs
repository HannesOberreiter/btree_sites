import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

const server = await readJson('../mcp-registry/server.json');
const catalog = await readJson(
  '../packages/btree_info/public/.well-known/ai-catalog.json',
);

test('MCP Server Card in the AI Catalog matches the MCP Registry server.json', () => {
  const card = catalog.entries.find(
    (entry) => entry.type === 'application/mcp-server-card+json',
  )?.data;
  assert.ok(card, 'ai-catalog.json has no inline MCP Server Card');

  for (const field of [
    'name',
    'title',
    'description',
    'version',
    'websiteUrl',
    'icons',
    'remotes',
  ]) {
    assert.deepEqual(card[field], server[field], `field "${field}" differs`);
  }
});

test('server.json description fits the MCP Registry limit', () => {
  assert.ok(server.description.length <= 100);
});
