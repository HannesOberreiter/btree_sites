#!/usr/bin/env node

/**
 * generate-news.mjs
 *
 * Fetches GitHub releases from btree (and the archived btree_vue),
 * calls Mistral LLM to rewrite technical release notes into
 * user-friendly news (EN), then translates to DE.
 * All releases of one day become one entry.
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

import { buildCompareContext, scopeCompareToPath } from "./news-context.mjs";
import {
  buildDayLabel,
  buildFallbackItems,
  entryVersions,
  responseText,
  sortNewsEntries,
} from "./news-format.mjs";
import {
  SYSTEM_PROMPT_EN,
  SYSTEM_PROMPT_SOCIAL,
  SYSTEM_PROMPT_TRANSLATE,
} from "./news-prompts.mjs";
import { generateSocialPost } from "./news-social.mjs";
import {
  parseJsonResponse,
  translateGermanNewsItems,
} from "./news-translation.mjs";

const OWNER = process.env.GITHUB_OWNER;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const NEWS_PUBLISH_ISSUE_TOKEN = process.env.NEWS_PUBLISH_ISSUE_TOKEN || GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const NEWS_PUBLISH_SITE_URL = process.env.NEWS_PUBLISH_SITE_URL || "https://btree.at/updates/";

// btree contains the server and the web app. The web app releases up to
// btree-client-v7.10.1 stay in the archived btree_vue repository.
const REPOS = [
  { name: "btree_vue", tagPrefix: "btree-client-v" },
  { name: "btree", tagPrefix: "btree-client-v", path: "apps/web" },
  { name: "btree", tagPrefix: "btree-server-v", path: "apps/server" },
];
const OUTPUT_PATH = "packages/btree_info/public/news.json";
const CHANGELOG_PATH = "packages/btree_info/public/changelog.json";

function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return "invalid-url";
  }
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
    releases.push(
      ...data.filter((release) => release.tag_name?.startsWith(tagPrefix)),
    );
    page++;
  }
  return releases;
}

async function fetchCompareContext(repo, baseTag, headTag, componentPath) {
  // Empty string means "no compare context available" to callers.
  if (!baseTag || !headTag) return "";
  const base = encodeURIComponent(baseTag);
  const head = encodeURIComponent(headTag);
  const url = `https://api.github.com/repos/${OWNER}/${repo}/compare/${base}...${head}`;
  const data = await fetchGitHubJson(url);
  if (!data) return "";
  if (!componentPath) return buildCompareContext(data);

  // The compare returns its commits in pages.
  const commits = [];
  for (let page = 1; commits.length < data.total_commits && page <= 30; page++) {
    const next = await fetchGitHubJson(`${url}?per_page=100&page=${page}`);
    if (!next?.commits?.length) break;
    commits.push(...next.commits);
  }
  const commitsUrl = `https://api.github.com/repos/${OWNER}/${repo}/commits?sha=${head}&path=${encodeURIComponent(componentPath)}&per_page=100`;
  const pathCommits = (await fetchGitHubJson(commitsUrl)) || [];
  return buildCompareContext(
    scopeCompareToPath({ ...data, commits }, componentPath, pathCommits),
  );
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
        componentPath: release._path,
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
      model: "mistral-large-4-0",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
      // The model always reasons; "none" is not supported.
      reasoning_effort: "low",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mistral API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return responseText(data.choices[0].message.content);
}

// All releases of one day become one news entry. Both apps often release
// the same change, and a feature can reach the server and the web app in two
// release runs of one day.
async function rewriteDay(date, releases) {
  const notes = releases
    .map((release) => `Release ${release.version}:\n${release.notes.join("\n\n")}`)
    .join("\n\n");
  if (!notes.trim()) return { en: [], de: [] };

  const contexts = [];
  for (const release of releases) {
    const context = await fetchCompareContext(
      release.repo,
      release.previousTag,
      release.tagName,
      release.componentPath,
    );
    if (context) {
      contexts.push(
        `Code changes between ${release.previousTag} and ${release.tagName}:\n${context}`,
      );
    }
  }

  const fallbackItems = buildFallbackItems(
    releases.map((release) => release.notes.join("\n\n")).join("\n\n"),
  );

  const enRaw = await callMistral(
    SYSTEM_PROMPT_EN,
    [
      `Rewrite the release notes of all b.tree releases on ${date} into one list of news items.`,
      "The releases are parts of one update of the web app and the server. Write each change only once, also when several releases mention it.",
      "",
      "Release notes:",
      notes,
      "",
      contexts.length > 0
        ? contexts.join("\n\n")
        : "No compare context available for these releases.",
    ].join("\n"),
  );

  let enItems;
  try {
    enItems = parseJsonResponse(enRaw);
  } catch (e) {
    console.error(`Failed to parse EN response for ${date}: ${e.message}`);
    console.error("Raw:", enRaw);
    enItems = [];
  }

  if (!Array.isArray(enItems) || enItems.length === 0) {
    enItems = fallbackItems;
  }

  if (enItems.length === 0) {
    return { en: [], de: [] };
  }

  const deItems = await translateGermanNewsItems({
    englishItems: enItems,
    version: buildDayLabel(releases.map((release) => release.version)),
    requestTranslation: (prompt) =>
      callMistral(SYSTEM_PROMPT_TRANSLATE, prompt),
  });

  return { en: enItems, de: deItems };
}

function formatIssueItems(items = []) {
  return items.map((item) => `- ${item.title}: ${item.description}`).join("\n");
}

function publishIssueMarker(date) {
  return `<!-- news-day:${date} -->`;
}

function buildPublishIssueBody(entry) {
  const parts = [`## ${entry.en.version} (${entry.date})`];

  if (entry.en.items.length > 0) {
    parts.push(`### English\n${formatIssueItems(entry.en.items)}`);
  }

  if (entry.de.items.length > 0) {
    parts.push(`### Deutsch\n${formatIssueItems(entry.de.items)}`);
  }

  parts.push(`Updates: ${NEWS_PUBLISH_SITE_URL}`);

  if (entry.social) {
    parts.push(
      `## Facebook post\n\n\`\`\`text\n${entry.social}\n\`\`\``,
    );
  } else {
    parts.push(
      "## Facebook post\n\nNo draft: the day has only technical changes, or the draft failed. See the workflow log.",
    );
  }

  return `${publishIssueMarker(entry.date)}
# News to publish

These news items were generated by scripts/generate-news.mjs. A later release on the same day updates this issue. Please publish them on the relevant channels, then close this issue.

- [ ] Publish news
- [ ] Verify published content

${parts.join("\n\n")}
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

// One open issue per day. A later release on the same day updates it.
async function upsertPublishIssue(entry) {
  if (!NEWS_PUBLISH_ISSUE_TOKEN) {
    throw new Error("NEWS_PUBLISH_ISSUE_TOKEN is required to create news publishing issue");
  }

  if (!GITHUB_REPOSITORY) {
    throw new Error("GITHUB_REPOSITORY is required to create news publishing issue");
  }

  const title = `News to publish: ${entry.date}`;
  const body = buildPublishIssueBody(entry);
  const existingIssue = await findExistingPublishIssue(publishIssueMarker(entry.date));

  if (existingIssue) {
    await githubApi(`/repos/${GITHUB_REPOSITORY}/issues/${existingIssue.number}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    console.log(`Updated news publishing issue: ${existingIssue.html_url}`);
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
    ...existingNews.en.flatMap(entryVersions),
    ...existingNews.de.flatMap(entryVersions),
  ]);

  // Fetch GitHub releases
  console.log("Fetching releases from GitHub...");
  const allReleases = [];
  for (const { name: repo, tagPrefix, path: componentPath } of REPOS) {
    const releases = await fetchAllReleases(repo, tagPrefix);
    console.log(`  ${repo} (${tagPrefix}): ${releases.length} releases`);
    for (const r of releases) {
      r._repo = repo;
      r._tagPrefix = tagPrefix;
      r._path = componentPath;
    }
    allReleases.push(...releases);
  }

  // The previous tag of a component can be in another repository, so link
  // the releases of each tag prefix across all repositories. btree has all
  // btree-client tags, so the compare also works for its first release.
  for (const tagPrefix of new Set(REPOS.map((r) => r.tagPrefix))) {
    const releases = allReleases
      .filter((r) => r._tagPrefix === tagPrefix)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    for (let i = 0; i < releases.length; i++) {
      releases[i]._previousTag = releases[i + 1]?.tag_name || "";
    }
  }

  const entries = toEntries(allReleases);
  const publishedAtByVersion = new Map(
    allReleases.map((release) => [
      extractVersion(release.tag_name || "unknown", release._tagPrefix),
      release.published_at || release.created_at || "",
    ]),
  );

  // Filter out already processed versions
  const toProcess = entries.filter((e) => !existingVersions.has(e.version));

  if (toProcess.length === 0) {
    console.log("No new releases to process.");
    return;
  }

  const days = [...new Set(toProcess.map((entry) => entry.date))];
  console.log(`Processing ${toProcess.length} new release(s) on ${days.length} day(s) with Mistral...`);

  let newEnEntries = [...existingNews.en];
  let newDeEntries = [...existingNews.de];
  const publishEntries = [];

  for (const date of days) {
    // Already published releases of the day are generated again with the
    // new ones, so the day keeps one entry.
    const dayReleases = entries
      .filter((entry) => entry.date === date)
      .sort((a, b) =>
        (publishedAtByVersion.get(a.version) || "").localeCompare(
          publishedAtByVersion.get(b.version) || "",
        ),
      );
    const versions = dayReleases.map((entry) => entry.version);
    console.log(`  Rewriting ${date}: ${versions.join(", ")}...`);
    try {
      // Intentionally sequential to stay within API rate limits.
      const { en, de } = await rewriteDay(date, dayReleases);

      if (en.length > 0) {
        const inDay = (entry) =>
          entryVersions(entry).some((version) => versions.includes(version));
        newEnEntries = newEnEntries.filter((entry) => !inDay(entry));
        newDeEntries = newDeEntries.filter((entry) => !inDay(entry));

        const enEntry = { version: buildDayLabel(versions, "en"), versions, date, items: en };
        const deEntry = { version: buildDayLabel(versions, "de"), versions, date, items: de };
        newEnEntries.push(enEntry);
        newDeEntries.push(deEntry);
        const social = await generateSocialPost({
          date,
          englishItems: en,
          updatesUrl: NEWS_PUBLISH_SITE_URL,
          requestPost: (prompt) => callMistral(SYSTEM_PROMPT_SOCIAL, prompt),
        });
        publishEntries.push({ date, en: enEntry, de: deEntry, social });
      }

      // Rate limit: ~1 req/sec to be safe with Mistral
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  Error processing ${date}: ${e.message}`);
    }
  }

  sortNewsEntries(newEnEntries, publishedAtByVersion);
  sortNewsEntries(newDeEntries, publishedAtByVersion);

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
    sortNewsEntries(changelog, publishedAtByVersion);
    fs.writeFileSync(changelogFile, JSON.stringify(changelog, null, 2) + "\n");
    console.log(`Added ${changelogAdded} entries to ${CHANGELOG_PATH}`);
  }

  for (const entry of publishEntries) {
    await upsertPublishIssue(entry);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
