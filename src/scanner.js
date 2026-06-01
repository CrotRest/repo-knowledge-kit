const fs = require("node:fs");
const path = require("node:path");
const { readTextFile } = require("./fs-utils");

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  ".rkk",
  "dist",
  "build",
  "coverage"
]);

const MAX_FILE_BYTES = 256 * 1024;

function scanRepository(root) {
  const absoluteRoot = path.resolve(root);
  const files = walkMarkdownFiles(absoluteRoot);
  const pages = files.map((file) => inspectMarkdownFile(absoluteRoot, file));
  const folders = summarizeFolders(pages);
  const signals = detectMaintainerSignals(absoluteRoot, pages);

  return {
    root: absoluteRoot,
    totals: {
      markdownFiles: pages.length,
      bytes: pages.reduce((sum, page) => sum + page.bytes, 0),
      headings: pages.reduce((sum, page) => sum + page.headings.length, 0)
    },
    folders,
    signals,
    pages
  };
}

function walkMarkdownFiles(root) {
  const results = [];
  walk(root, results);
  return results.sort();
}

function walk(dir, results) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name), results);
      }
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      const file = path.join(dir, entry.name);
      const stat = fs.statSync(file);
      if (stat.size <= MAX_FILE_BYTES) {
        results.push(file);
      }
    }
  }
}

function inspectMarkdownFile(root, file) {
  const text = readTextFile(file);
  const relativePath = path.relative(root, file);
  const frontmatter = parseFrontmatter(text);
  const headings = [];
  const links = [];
  const tags = new Set();

  for (const line of text.split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      headings.push({
        level: heading[1].length,
        text: heading[2].trim()
      });
    }

    for (const match of line.matchAll(/\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)/g)) {
      links.push(match[1] || match[3]);
    }

    for (const match of line.matchAll(/(^|\s)#([A-Za-z0-9/_-]+)/g)) {
      tags.add(match[2]);
    }
  }

  for (const value of Object.values(frontmatter)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") tags.add(item.replace(/^#/, ""));
      });
    }
  }

  return {
    path: relativePath,
    title: frontmatter.title || inferTitle(relativePath, headings),
    category: frontmatter.category || inferCategory(relativePath),
    summary: frontmatter.summary || inferSummary(text),
    bytes: Buffer.byteLength(text),
    headings,
    links: unique(links).slice(0, 50),
    tags: Array.from(tags).sort()
  };
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};

  const block = text.slice(4, end);
  const result = {};

  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;

    const key = match[1];
    const raw = match[2].trim();
    if (raw.startsWith("[") && raw.endsWith("]")) {
      result[key] = raw
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      result[key] = raw.replace(/^["']|["']$/g, "");
    }
  }

  return result;
}

function inferTitle(relativePath, headings) {
  if (headings.length > 0) return headings[0].text;
  return path.basename(relativePath, ".md").replace(/[-_]/g, " ");
}

function inferCategory(relativePath) {
  const first = relativePath.split(path.sep)[0];
  if (!first || first.endsWith(".md")) return "docs";
  return first;
}

function inferSummary(text) {
  const paragraph = text
    .replace(/^---[\s\S]*?---/, "")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.replace(/^#+\s+.*$/gm, "").trim())
    .find(Boolean);

  if (!paragraph) return "";
  return paragraph.replace(/\s+/g, " ").slice(0, 240);
}

function summarizeFolders(pages) {
  const folders = new Map();

  for (const page of pages) {
    const folder = page.path.includes(path.sep) ? page.path.split(path.sep)[0] : ".";
    const current = folders.get(folder) || {
      folder,
      files: 0,
      categories: new Set(),
      tags: new Set()
    };
    current.files += 1;
    current.categories.add(page.category);
    page.tags.forEach((tag) => current.tags.add(tag));
    folders.set(folder, current);
  }

  return Array.from(folders.values())
    .map((folder) => ({
      folder: folder.folder,
      files: folder.files,
      categories: Array.from(folder.categories).sort(),
      tags: Array.from(folder.tags).sort().slice(0, 20)
    }))
    .sort((a, b) => b.files - a.files || a.folder.localeCompare(b.folder));
}

function detectMaintainerSignals(root, pages) {
  const rootFiles = new Set(fs.readdirSync(root));
  const paths = new Set(pages.map((page) => page.path.replaceAll("\\", "/").toLowerCase()));

  return {
    hasReadme: rootFiles.has("README.md"),
    hasLicense: rootFiles.has("LICENSE") || rootFiles.has("LICENSE.md"),
    hasChangelog: rootFiles.has("CHANGELOG.md") || paths.has("changelog.md"),
    hasContributing: rootFiles.has("CONTRIBUTING.md") || paths.has("contributing.md"),
    hasCodeOfConduct: rootFiles.has("CODE_OF_CONDUCT.md") || paths.has("code_of_conduct.md"),
    hasIssueTemplates: fs.existsSync(path.join(root, ".github", "ISSUE_TEMPLATE")),
    hasPullRequestTemplate: fs.existsSync(path.join(root, ".github", "PULL_REQUEST_TEMPLATE.md")),
    hasAgentsFile: rootFiles.has("AGENTS.md"),
    hasSecurityPolicy: rootFiles.has("SECURITY.md") || paths.has("security.md")
  };
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

module.exports = {
  scanRepository,
  parseFrontmatter,
  inferSummary
};
