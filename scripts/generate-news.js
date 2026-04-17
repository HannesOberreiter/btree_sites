#!/usr/bin/env node

/**
 * generate-news.js
 *
 * Fetches GitHub releases from btree_vue and btree_server,
 * calls Mistral LLM to rewrite technical release notes into
 * user-friendly news (EN), then translates to DE.
 * Each release becomes its own entry (no grouping by date).
 *
 * Outputs: packages/btree_info/public/news.json
 *
 * Environment variables:
 *   GITHUB_TOKEN       – GitHub PAT with read access to both repos
 *   MISTRAL_API_KEY    – Mistral API key
 *   GITHUB_OWNER       – GitHub org/user
 *
 * Usage:
 *   node scripts/generate-news.js
 */

const OWNER = process.env.GITHUB_OWNER;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const REPOS = [
  { name: "btree_vue", tagPrefix: "btree-client-v" },
  { name: "btree_server", tagPrefix: "btree-server-v" },
];
const OUTPUT_PATH = "packages/btree_info/public/news.json";
const CHANGELOG_PATH = "packages/btree_info/public/changelog.json";

async function fetchAllReleases(repo, tagPrefix) {
  const releases = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${OWNER}/${repo}/releases?per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) {
      console.error(
        `Failed to fetch releases for ${repo}: ${res.status} ${res.statusText}`,
      );
      break;
    }
    const data = await res.json();
    if (data.length === 0) break;
    releases.push(...data);
    page++;
  }
  return releases;
}

function extractVersion(tagName, tagPrefix) {
  // e.g. "client/v7.1.0" -> "client/7.1.0", "server/v7.0.1" -> "server/7.0.1"
  if (tagName.startsWith(tagPrefix)) {
    const label = tagPrefix.replace(/v$/, ""); // "client/v" -> "client/"
    const semver = tagName.slice(tagPrefix.length);
    return `${label}${semver}`;
  }
  // Fallback for tags without expected prefix
  return tagName.replace(/^v/, "");
}

function toEntries(allReleases) {
  return allReleases
    .map((release) => {
      const date =
        release.published_at?.split("T")[0] || release.created_at?.split("T")[0];
      const version = extractVersion(
        release.tag_name || "unknown",
        release._tagPrefix,
      );
      const body = (release.body || "").trim();
      return { date, version, notes: body ? [body] : [] };
    })
    .filter((e) => e.notes.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

async function callMistral(systemPrompt, userPrompt, maxTokens = 4096) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mistral API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

const SYSTEM_PROMPT_EN = `You are a friendly copywriter for b.tree, a beekeeping management web application.
Your job is to rewrite technical release notes into clear, concise news items for beekeepers (non-technical end users).

Rules:
- Each news item has a "title" (2-4 words, like a category: "New Feature", "Bug Fix", "Improvement", etc.) and a "description" (1-2 sentences, plain language).
- Skip purely technical items (dependency updates, CI changes, refactors) unless they affect the user experience.
- Combine related items if they describe the same feature.
- Keep it warm and helpful. Beekeepers should understand what changed and why it matters.
- Do NOT mention repository names, code, APIs (unless it's the user-facing hive scale API), or internal tooling.
- Output ONLY a valid JSON array of objects with "title" and "description" fields. No markdown, no explanation.
- If there are no user-facing changes, return an empty array [].`;

const SYSTEM_PROMPT_TRANSLATE = `You are a professional translator. Translate the following JSON array of news items from English to German.
Keep the same JSON structure with "title" and "description" fields.
Use natural, friendly German suitable for Austrian/German beekeepers.
Output ONLY the translated JSON array. No markdown, no explanation.`;

async function rewriteRelease(entry) {
  const combinedNotes = entry.notes.join("\n\n");

  if (!combinedNotes.trim()) {
    return { en: [], de: [] };
  }

  // Generate EN news
  const enRaw = await callMistral(
    SYSTEM_PROMPT_EN,
    `Rewrite these release notes for version ${entry.version} (${entry.date}):\n\n${combinedNotes}`,
  );

  let enItems;
  try {
    enItems = JSON.parse(
      enRaw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim(),
    );
  } catch (e) {
    console.error(
      `Failed to parse EN response for ${entry.version}: ${e.message}`,
    );
    console.error("Raw:", enRaw);
    enItems = [];
  }

  if (!Array.isArray(enItems) || enItems.length === 0) {
    return { en: [], de: [] };
  }

  // Translate to DE
  const deRaw = await callMistral(
    SYSTEM_PROMPT_TRANSLATE,
    JSON.stringify(enItems, null, 2),
  );

  let deItems;
  try {
    deItems = JSON.parse(
      deRaw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim(),
    );
  } catch (e) {
    console.error(
      `Failed to parse DE response for ${entry.version}: ${e.message}`,
    );
    deItems = enItems; // fallback to EN
  }

  return { en: enItems, de: deItems };
}

async function main() {
  if (!MISTRAL_API_KEY) {
    console.error("MISTRAL_API_KEY is required");
    process.exit(1);
  }

  // Load existing news.json if it exists (to avoid re-processing)
  const fs = await import("node:fs");
  const path = await import("node:path");
  let existingNews = { en: [], de: [] };
  const outputFile = path.resolve(OUTPUT_PATH);

  if (fs.existsSync(outputFile)) {
    try {
      existingNews = JSON.parse(fs.readFileSync(outputFile, "utf-8"));
    } catch (e) {
      console.warn("Could not parse existing news.json, starting fresh");
    }
  }

  const existingVersions = new Set([
    ...existingNews.en.map((e) => e.version),
    ...existingNews.de.map((e) => e.version),
  ]);

  // Fetch GitHub releases
  console.log("Fetching releases from GitHub...");
  const allReleases = [];
  for (const { name: repo, tagPrefix } of REPOS) {
    const releases = await fetchAllReleases(repo, tagPrefix);
    console.log(`  ${repo}: ${releases.length} releases`);
    for (const r of releases) {
      r._repo = repo;
      r._tagPrefix = tagPrefix;
    }
    allReleases.push(...releases);
  }

  const entries = toEntries(allReleases);

  // Filter out already processed versions
  const toProcess = entries.filter((e) => !existingVersions.has(e.version));

  if (toProcess.length === 0) {
    console.log("No new releases to process.");
    return;
  }

  console.log(`Processing ${toProcess.length} new release(s) with Mistral...`);

  const newEnEntries = [...existingNews.en];
  const newDeEntries = [...existingNews.de];

  for (const entry of toProcess) {
    console.log(`  Rewriting ${entry.version} (${entry.date})...`);
    try {
      const { en, de } = await rewriteRelease(entry);

      if (en.length > 0) {
        newEnEntries.push({
          version: entry.version,
          date: entry.date,
          items: en,
        });
        newDeEntries.push({
          version: entry.version,
          date: entry.date,
          items: de,
        });
      }

      // Rate limit: ~1 req/sec to be safe with Mistral
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  Error processing ${entry.version}: ${e.message}`);
    }
  }

  // Sort by date descending
  newEnEntries.sort((a, b) => b.date.localeCompare(a.date));
  newDeEntries.sort((a, b) => b.date.localeCompare(a.date));

  const output = {
    en: newEnEntries,
    de: newDeEntries,
  };

  // Write news.json
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2) + "\n");
  console.log(`Written ${newEnEntries.length} entries to ${OUTPUT_PATH}`);

  // Append raw release notes to changelog.json
  const changelogFile = path.resolve(CHANGELOG_PATH);
  let changelog = [];
  if (fs.existsSync(changelogFile)) {
    try {
      changelog = JSON.parse(fs.readFileSync(changelogFile, "utf-8"));
    } catch (e) {
      console.warn("Could not parse existing changelog.json, starting fresh");
    }
  }

  const changelogVersions = new Set(changelog.map((e) => e.version));
  let changelogAdded = 0;

  for (const entry of toProcess) {
    if (changelogVersions.has(entry.version)) continue;
    const notes = entry.notes.map((n) => n.trim()).filter(Boolean);
    if (notes.length === 0) continue;
    changelog.push({
      version: entry.version,
      date: entry.date,
      notes,
    });
    changelogAdded++;
  }

  if (changelogAdded > 0) {
    changelog.sort((a, b) => b.date.localeCompare(a.date));
    fs.writeFileSync(changelogFile, JSON.stringify(changelog, null, 2) + "\n");
    console.log(`Added ${changelogAdded} entries to ${CHANGELOG_PATH}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
