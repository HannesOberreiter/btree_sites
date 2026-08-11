const MAX_COMMITS = 20;
const MAX_FILES = 40;
const MAX_PATCH_FILES = 12;
const MAX_PATCH_CHARS_PER_FILE = 2500;
const MAX_PATCH_CHARS_TOTAL = 16000;

function isUsefulPatchFile(filename) {
  return !(
    /(?:^|\/)(?:dist|generated|vendor)\//.test(filename) ||
    /(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(filename) ||
    /(?:^|\/)(?:CHANGELOG\.md|\.release-please-manifest\.json|release-please-config\.json)$/i.test(
      filename,
    ) ||
    /\.d\.ts$/.test(filename)
  );
}

function truncatePatch(patch) {
  if (patch.length <= MAX_PATCH_CHARS_PER_FILE) return patch;
  return `${patch.slice(0, MAX_PATCH_CHARS_PER_FILE)}\n... [patch excerpt truncated]`;
}

export function buildCompareContext(data) {
  const commits = Array.isArray(data?.commits) ? data.commits : [];
  const files = Array.isArray(data?.files) ? data.files : [];

  const commitLines = commits
    .slice(0, MAX_COMMITS)
    .map((commit) => {
      const sha = (commit.sha || "").slice(0, 7);
      const message = (commit.commit?.message || "").split("\n")[0].trim();
      return message ? `- ${sha}: ${message}` : "";
    })
    .filter(Boolean);

  const fileLines = files
    .slice(0, MAX_FILES)
    .map((file) => {
      const status = file.status || "modified";
      const filename = file.filename || "unknown";
      const additions = Number.isFinite(file.additions) ? file.additions : 0;
      const deletions = Number.isFinite(file.deletions) ? file.deletions : 0;
      return `- ${status}: ${filename} (+${additions}/-${deletions})`;
    });

  const patchExcerpts = [];
  let patchChars = 0;
  for (const file of files) {
    if (patchExcerpts.length === MAX_PATCH_FILES) break;
    if (typeof file.patch !== "string" || !file.patch.trim()) continue;
    const filename = file.filename || "unknown";
    if (!isUsefulPatchFile(filename)) continue;

    const excerpt = `--- ${filename}\n${truncatePatch(file.patch.trim())}`;
    if (patchChars + excerpt.length > MAX_PATCH_CHARS_TOTAL) continue;
    patchExcerpts.push(excerpt);
    patchChars += excerpt.length;
  }

  const sections = [];
  if (commitLines.length > 0) {
    sections.push(`Commit subjects:\n${commitLines.join("\n")}`);
  }
  if (fileLines.length > 0) {
    sections.push(`Changed files:\n${fileLines.join("\n")}`);
  }
  if (patchExcerpts.length > 0) {
    sections.push(
      `Patch excerpts (source evidence; excerpts may be incomplete):\n${patchExcerpts.join("\n\n")}`,
    );
  }
  return sections.join("\n\n");
}
