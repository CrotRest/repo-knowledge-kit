const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { fileExists, readTextFile } = require("./fs-utils");

function buildReleasePrep(root) {
  const absoluteRoot = path.resolve(root);
  const changelogPath = path.join(absoluteRoot, "CHANGELOG.md");
  const packagePath = path.join(absoluteRoot, "package.json");
  const latestTag = gitMaybe(absoluteRoot, ["describe", "--tags", "--abbrev=0"]);
  const range = latestTag ? `${latestTag}..HEAD` : "HEAD";
  const commits = gitLines(absoluteRoot, ["log", "--oneline", range]).slice(0, 30);
  const changedFiles = gitLines(absoluteRoot, ["diff", "--name-only", range]).slice(0, 100);
  const changelog = fileExists(changelogPath) ? parseChangelog(readTextFile(changelogPath)) : null;

  return {
    root: absoluteRoot,
    packageVersion: readPackageVersion(packagePath),
    hasChangelog: Boolean(changelog),
    latestTag,
    range,
    commits,
    changedFiles,
    candidateNotes: changelog ? changelog.topSection.items : [],
    changelogTopSection: changelog ? changelog.topSection.title : null,
    checks: [
      "Run tests before tagging.",
      "Confirm README and examples still match CLI behavior.",
      "Confirm CHANGELOG.md has notes for user-visible changes.",
      "Confirm generated workflows do not overwrite user policy unexpectedly."
    ]
  };
}

function buildReleasePrepMarkdown(report) {
  const candidateNotes = report.candidateNotes.length
    ? report.candidateNotes.map((item) => `- ${item}`).join("\n")
    : "- No candidate changelog notes found.";
  const commits = report.commits.length
    ? report.commits.map((commit) => `- ${commit}`).join("\n")
    : "- No commits detected for this range.";
  const changedFiles = report.changedFiles.length
    ? report.changedFiles.map((file) => `- \`${file}\``).join("\n")
    : "- No changed files detected for this range.";
  const checks = report.checks.map((check) => `- [ ] ${check}`).join("\n");

  return `# Release Prep Report

Root: \`${report.root}\`

## Version

- package version: ${report.packageVersion || "not detected"}
- latest git tag: ${report.latestTag || "not detected"}
- comparison range: \`${report.range}\`
- changelog section: ${report.changelogTopSection || "not detected"}

## Candidate Notes

${candidateNotes}

## Commits

${commits}

## Changed Files

${changedFiles}

## Maintainer Checklist

${checks}
`;
}

function parseChangelog(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = { title: heading[1], items: [] };
      sections.push(current);
      continue;
    }

    if (current) {
      const item = /^-\s+(.+?)\s*$/.exec(line);
      if (item) current.items.push(item[1]);
    }
  }

  return {
    sections,
    topSection: sections[0] || { title: null, items: [] }
  };
}

function readPackageVersion(packagePath) {
  if (!fileExists(packagePath)) return null;
  try {
    return JSON.parse(readTextFile(packagePath)).version || null;
  } catch {
    return null;
  }
}

function gitMaybe(root, args) {
  try {
    return execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim() || null;
  } catch {
    return null;
  }
}

function gitLines(root, args) {
  const output = gitMaybe(root, args);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

module.exports = {
  buildReleasePrep,
  buildReleasePrepMarkdown,
  parseChangelog,
  readPackageVersion
};
