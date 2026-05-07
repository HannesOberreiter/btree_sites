#!/usr/bin/env node

/**
 * generate-news.mjs
 *
 * Fetches GitHub releases from btree_vue and btree_server,
 * calls Mistral LLM to rewrite technical release notes into
 * user-friendly news (EN), then translates to DE.
 * Each release becomes its own entry (no grouping by date).
 *
 * Outputs: packages/btree_info/public/news.json
 *
 * Environment variables:
 *   GITHUB_TOKEN              – GitHub PAT with read access to both repos
 *   MISTRAL_API_KEY           – Mistral API key
 *   GITHUB_OWNER              – GitHub org/user
 *   NEWS_PUBLISH_ISSUE_TOKEN  – GitHub token with issues:write (optional)
 *   NEWS_PUBLISH_SITE_URL     – public updates URL (default: https://btree.at/updates/)
 *
 * Usage:
 *   node scripts/generate-news.mjs
 */

import fs from "node:fs";
import path from "node:path";

const OWNER = process.env.GITHUB_OWNER;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const NEWS_PUBLISH_ISSUE_TOKEN = process.env.NEWS_PUBLISH_ISSUE_TOKEN || GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const NEWS_PUBLISH_SITE_URL = process.env.NEWS_PUBLISH_SITE_URL || "https://btree.at/updates/";

const REPOS = [
  { name: "btree_vue", tagPrefix: "btree-client-v" },
  { name: "btree_server", tagPrefix: "btree-server-v" },
];
const OUTPUT_PATH = "packages/btree_info/public/news.json";
const CHANGELOG_PATH = "packages/btree_info/public/changelog.json";
const MAX_COMMITS_IN_CONTEXT = 20;
const MAX_FILES_IN_CONTEXT = 40;
const MIN_FALLBACK_LINE_LENGTH = 6;
const MAX_FALLBACK_ITEMS = 6;
const MAX_FALLBACK_DESCRIPTION_LENGTH = 240;

function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return "invalid-url";
  }
}

function truncateAtWordBoundary(text, maxLength) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const chunk = clean.slice(0, maxLength + 1);
  const lastSpace = chunk.lastIndexOf(" ");
  if (lastSpace > 0) return `${chunk.slice(0, lastSpace)}…`;
  return `${clean.slice(0, maxLength)}…`;
}

async function fetchGitHubJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn(
      `GitHub API request failed (${res.status} ${res.statusText}): ${sanitizeUrl(url)}\n${text.slice(0, 400)}`,
    );
    return null;
  }
  return res.json();
}

async function fetchAllReleases(repo, tagPrefix) {
  const releases = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${OWNER}/${repo}/releases?per_page=100&page=${page}`;
    const data = await fetchGitHubJson(url);
    if (!data) {
      console.error(
        `Failed to fetch releases for ${repo}`,
      );
      break;
    }
    if (data.length === 0) break;
    releases.push(...data);
    page++;
  }
  return releases;
}

async function fetchCompareContext(repo, baseTag, headTag) {
  // Empty string means "no compare context available" to callers.
  if (!baseTag || !headTag) return "";
  const base = encodeURIComponent(baseTag);
  const head = encodeURIComponent(headTag);
  const url = `https://api.github.com/repos/${OWNER}/${repo}/compare/${base}...${head}`;
  const data = await fetchGitHubJson(url);
  if (!data) return "";

  const commitLines = (data.commits || [])
    .slice(0, MAX_COMMITS_IN_CONTEXT)
    .map((c) => {
      const sha = (c.sha || "").slice(0, 7);
      const message = (c.commit?.message || "").split("\n")[0].trim();
      return `- ${sha}: ${message}`;
    })
    .filter(Boolean);

  const fileLines = (data.files || [])
    .slice(0, MAX_FILES_IN_CONTEXT)
    .map((f) => {
      const status = f.status || "modified";
      const filename = f.filename || "unknown";
      const additions = Number.isFinite(f.additions) ? f.additions : 0;
      const deletions = Number.isFinite(f.deletions) ? f.deletions : 0;
      return `- ${status}: ${filename} (+${additions}/-${deletions})`;
    })
    .filter(Boolean);

  const sections = [];
  if (commitLines.length > 0) {
    sections.push(`Commit subjects:\n${commitLines.join("\n")}`);
  }
  if (fileLines.length > 0) {
    sections.push(`Changed files:\n${fileLines.join("\n")}`);
  }
  return sections.join("\n\n");
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
      return {
        date,
        version,
        notes: body ? [body] : [],
        repo: release._repo,
        tagName: release.tag_name || "",
        previousTag: release._previousTag || "",
      };
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

const SYSTEM_PROMPT_EN = `You are a release note editor for b.tree, a beekeeping management web application.
Your job is to rewrite technical release notes into clear, concise news items while staying strictly faithful to the provided changelog and change context.

Rules:
- Each news item has a "title" (2-4 words, category-like: "Feature", "Fix", "Improvement", "Technical Change") and a "description" (1-2 sentences).
- Base every statement only on the provided release notes and code-change context.
- If impact is not explicit, keep wording technical and close to the original changelog text.
- Do not invent benefits, user impact, or motivations that are not clearly stated.
- Combine related items only when they describe the same change.
- Do NOT mention repository names, code, APIs (unless it's the user-facing hive scale API), or internal tooling.
- Output ONLY a valid JSON array of objects with "title" and "description" fields. No markdown, no explanation.
- If there are no user-facing changes, return an empty array [].`;

const SYSTEM_PROMPT_TRANSLATE = `You are a professional translator. Translate the following JSON array of news items from English to German.
Keep the same JSON structure with "title" and "description" fields.
Use natural, friendly German suitable for Austrian/German beekeepers.
Output ONLY the translated JSON array. No markdown, no explanation.`;

function buildFallbackItems(combinedNotes) {
  const items = combinedNotes
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*]\s*/, "")
        .replace(/^#+\s*/, "")
        .replace(/\(#[0-9]+\)/g, "")
        .trim(),
    )
    .filter((line) => line.length > MIN_FALLBACK_LINE_LENGTH)
    .slice(0, MAX_FALLBACK_ITEMS)
    .map((line) => ({
      title: "Technical Change",
      description: truncateAtWordBoundary(
        line,
        MAX_FALLBACK_DESCRIPTION_LENGTH,
      ),
    }));

  if (items.length > 0) return items;
  return [
    {
      title: "Technical Change",
      description: truncateAtWordBoundary(
        combinedNotes,
        MAX_FALLBACK_DESCRIPTION_LENGTH,
      ),
    },
  ];
}

async function rewriteRelease(entry) {
  const combinedNotes = entry.notes.join("\n\n");
  const compareContext = await fetchCompareContext(
    entry.repo,
    entry.previousTag,
    entry.tagName,
  );

  if (!combinedNotes.trim()) {
    return { en: [], de: [] };
  }

  const fallbackTechnicalItems = buildFallbackItems(combinedNotes);

  // Generate EN news
  const enRaw = await callMistral(
    SYSTEM_PROMPT_EN,
    [
      `Rewrite these release notes for version ${entry.version} (${entry.date}).`,
      "",
      "Release notes:",
      combinedNotes,
      "",
      compareContext
        ? `Code changes between ${entry.previousTag} and ${entry.tagName}:`
        : "No compare context available for this release.",
      compareContext || "",
    ].join("\n"),
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
    // Keep output technical and close to original release text.
    return {
      en: fallbackTechnicalItems,
      de: fallbackTechnicalItems,
    };
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

function issueEntryKey(entry) {
  return `${entry.version}|${entry.date}`;
}

function formatIssueItems(items = []) {
  return items.map((item) => `- ${item.title}: ${item.description}`).join("\n");
}

function formatIssueDraft(entry) {
  const parts = [`## ${entry.version} (${entry.date})`];

  if (entry.en?.items?.length > 0) {
    parts.push(`### English\n${formatIssueItems(entry.en.items)}`);
  }

  if (entry.de?.items?.length > 0) {
    parts.push(`### Deutsch\n${formatIssueItems(entry.de.items)}`);
  }

  parts.push(`Updates: ${NEWS_PUBLISH_SITE_URL}`);

  return parts.join("\n\n");
}

function buildPublishIssueTitle(entries) {
  if (entries.length === 1) return `News to publish: ${entries[0].version}`;

  const dates = [...new Set(entries.map((entry) => entry.date))];
  const suffix = dates.length === 1 ? dates[0] : `${entries.length} releases`;
  return `News to publish: ${suffix}`;
}

function buildPublishIssueBody(entries) {
  const marker = `<!-- news-to-publish:${entries.map(issueEntryKey).join(",")} -->`;
  const drafts = entries.map(formatIssueDraft).join("\n\n---\n\n");

  return `${marker}
# News to publish

These news items were generated by scripts/generate-news.mjs. Please publish them on the relevant channels, then close this issue.

- [ ] Publish news
- [ ] Verify published content

${drafts}
`;
}

async function githubApi(pathname, options = {}) {
  const res = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${NEWS_PUBLISH_ISSUE_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function findExistingPublishIssue(marker) {
  const issues = await githubApi(
    `/repos/${GITHUB_REPOSITORY}/issues?state=open&per_page=100`,
  );
  return issues.find((issue) => issue.body && issue.body.includes(marker));
}

async function createPublishIssue(entries) {
  if (entries.length === 0) return;

  if (!NEWS_PUBLISH_ISSUE_TOKEN) {
    throw new Error("NEWS_PUBLISH_ISSUE_TOKEN is required to create news publishing issue");
  }

  if (!GITHUB_REPOSITORY) {
    throw new Error("GITHUB_REPOSITORY is required to create news publishing issue");
  }

  const title = buildPublishIssueTitle(entries);
  const body = buildPublishIssueBody(entries);
  const marker = body.match(/<!-- news-to-publish:[^>]+ -->/)[0];
  const existingIssue = await findExistingPublishIssue(marker);

  if (existingIssue) {
    console.log(`News publishing issue already exists: ${existingIssue.html_url}`);
    return;
  }

  const issue = await githubApi(`/repos/${GITHUB_REPOSITORY}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });

  console.log(`Created news publishing issue: ${issue.html_url}`);
}

async function main() {
  if (!MISTRAL_API_KEY) {
    console.error("MISTRAL_API_KEY is required");
    process.exit(1);
  }
  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN is not set, GitHub API calls may be rate-limited.");
  }

  // Load existing news.json if it exists (to avoid re-processing)
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
    for (let i = 0; i < releases.length; i++) {
      releases[i]._previousTag = releases[i + 1]?.tag_name || "";
    }
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
  const generatedPublishEntries = [];

  for (const entry of toProcess) {
    console.log(`  Rewriting ${entry.version} (${entry.date})...`);
    try {
      // Intentionally sequential to stay within API rate limits.
      const { en, de } = await rewriteRelease(entry);

      if (en.length > 0) {
        const enEntry = {
          version: entry.version,
          date: entry.date,
          items: en,
        };
        const deEntry = {
          version: entry.version,
          date: entry.date,
          items: de,
        };
        newEnEntries.push(enEntry);
        newDeEntries.push(deEntry);
        generatedPublishEntries.push({
          version: entry.version,
          date: entry.date,
          en: enEntry,
          de: deEntry,
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

  await createPublishIssue(generatedPublishEntries);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
