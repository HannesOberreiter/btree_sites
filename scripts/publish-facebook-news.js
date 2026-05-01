#!/usr/bin/env node

/**
 * publish-facebook-news.js
 *
 * Publishes newly generated b.tree news entries to a Facebook Page.
 * New entries are detected by comparing current news.json with the previous
 * git revision (HEAD^ by default, after the workflow committed news updates).
 *
 * Environment variables:
 *   FACEBOOK_PAGE_ACCESS_TOKEN – Facebook Page access token with pages_manage_posts
 *   FACEBOOK_PAGE_ID           – Facebook Page ID (defaults to b.tree page)
 *   FACEBOOK_NEWS_BASE         – git ref for previous news.json (default: HEAD^)
 *   FACEBOOK_NEWS_LOCALE       – en, de, or both (default: both)
 *   FACEBOOK_GRAPH_VERSION     – Graph API version (default: v24.0)
 */

const { execFileSync } = await import("node:child_process");
const fs = await import("node:fs");
const path = await import("node:path");

const NEWS_PATH = "packages/btree_info/public/news.json";

const PAGE_ID = process.env.FACEBOOK_PAGE_ID || "1104938619368277";
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const BASE_REF = process.env.FACEBOOK_NEWS_BASE || "HEAD^";
const LOCALE = process.env.FACEBOOK_NEWS_LOCALE || "both";
const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || "v24.0";

if (!ACCESS_TOKEN) {
  console.error("FACEBOOK_PAGE_ACCESS_TOKEN is required");
  process.exit(1);
}

function readCurrentNews() {
  return JSON.parse(fs.readFileSync(path.resolve(NEWS_PATH), "utf-8"));
}

function readPreviousNews() {
  try {
    const previous = execFileSync("git", ["show", `${BASE_REF}:${NEWS_PATH}`], {
      encoding: "utf-8",
    });
    return JSON.parse(previous);
  } catch (error) {
    console.warn(
      `Could not read previous news from ${BASE_REF}; assuming none exists.`,
    );
    return { en: [], de: [] };
  }
}

function entryKey(entry) {
  return `${entry.version}|${entry.date}`;
}

function collectEntries(currentNews, shouldInclude) {
  const locales = LOCALE === "both" ? ["en", "de"] : [LOCALE];
  const byKey = new Map();

  for (const locale of locales) {
    for (const entry of currentNews[locale] || []) {
      const key = entryKey(entry);
      if (!shouldInclude(entry, key)) continue;
      const existing = byKey.get(key) || {
        version: entry.version,
        date: entry.date,
      };
      existing[locale] = entry;
      byKey.set(key, existing);
    }
  }

  return [...byKey.values()];
}

function findNewEntries(previousNews, currentNews) {
  const previousKeys = new Set([
    ...(previousNews.en || []).map(entryKey),
    ...(previousNews.de || []).map(entryKey),
  ]);

  return collectEntries(
    currentNews,
    (_entry, key) => !previousKeys.has(key),
  ).sort((a, b) => a.date.localeCompare(b.date));
}

function formatItems(items = []) {
  return items.map((item) => `${item.title}: ${item.description}`).join("\n");
}

function formatMessage(entry) {
  const parts = [`🐝 b.tree update ${entry.version} (${entry.date})`];

  if (entry.en) {
    parts.push(`🇬🇧 English\n${formatItems(entry.en.items)}`);
  }

  if (entry.de) {
    parts.push(`🇦🇹 Deutsch\n${formatItems(entry.de.items)}`);
  }

  const message = parts.filter(Boolean).join("\n\n");
  return message.length > 60000 ? `${message.slice(0, 59900)}…` : message;
}

async function postToFacebook(message) {
  const body = new URLSearchParams({
    message,
    access_token: ACCESS_TOKEN,
  });

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/feed`,
      {
        method: "POST",
        body,
      },
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `Facebook API error: ${res.status} ${JSON.stringify(data)}`,
      );
    }
    return data;
  } catch (error) {
    console.error("Failed to post to Facebook:", error);
    return false;
  }
}

const currentNews = readCurrentNews();
const newEntries = findNewEntries(readPreviousNews(), currentNews);

if (newEntries.length === 0) {
  console.log("No Facebook news entries to publish.");
  process.exit(0);
}

console.log(`Publishing ${newEntries.length} Facebook post(s)...`);

for (const entry of newEntries) {
  const message = formatMessage(entry);
  const result = await postToFacebook(message);
  if (!result) {
    console.error(`Failed to publish ${entry.version}`);
  } else {
    console.log(`Published ${entry.version}: ${result.id}`);
  }
  if (newEntries.length > 1) {
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
}
