const path = require("node:path");

function buildAuditMarkdown(report) {
  const signalRows = Object.entries(report.signals)
    .map(([key, value]) => `| ${key} | ${value ? "yes" : "no"} |`)
    .join("\n");

  const folderRows = report.folders
    .map((folder) => {
      const categories = folder.categories.join(", ") || "-";
      const tags = folder.tags.slice(0, 8).join(", ") || "-";
      return `| ${folder.folder} | ${folder.files} | ${categories} | ${tags} |`;
    })
    .join("\n");

  const topPages = report.pages
    .slice()
    .sort((a, b) => b.links.length - a.links.length || b.headings.length - a.headings.length)
    .slice(0, 12)
    .map((page) => `- \`${page.path}\`: ${page.summary || page.title}`)
    .join("\n");

  return `# Repository Knowledge Audit

Root: \`${report.root}\`

## Totals

- Markdown files: ${report.totals.markdownFiles}
- Headings: ${report.totals.headings}
- Bytes scanned: ${report.totals.bytes}

## Maintainer Signals

| Signal | Present |
| --- | --- |
${signalRows}

## Knowledge Areas

| Folder | Files | Categories | Tags |
| --- | ---: | --- | --- |
${folderRows || "| - | 0 | - | - |"}

## High-Context Pages

${topPages || "- No Markdown pages found."}
`;
}

function buildAgentsMarkdown(report) {
  const areas = report.folders
    .slice(0, 10)
    .map((folder) => `- \`${folder.folder}/\`: ${folder.files} Markdown files`)
    .join("\n");

  const sourcePages = report.pages
    .filter((page) => /readme|contributing|security|schema|index|hot|roadmap/i.test(page.path))
    .slice(0, 12)
    .map((page) => `- \`${page.path}\``)
    .join("\n");

  return `# AGENTS.md

## Project Context

This repository contains a Markdown-heavy open-source project. Agents should use repository documents as the source of truth before changing behavior, documentation, release notes, or maintenance workflows.

## Important Knowledge Areas

${areas || "- No knowledge areas detected yet."}

## Read First

${sourcePages || "- \`README.md\` if present."}

## Maintenance Rules

- Prefer small, reviewable changes.
- Preserve existing public behavior unless the task explicitly changes it.
- Read nearby documentation before editing generated workflows or maintainer guidance.
- Keep release, triage, review, and security outputs evidence-linked to repository files.
- Do not invent project policy when documentation is missing; create a clear TODO instead.

## Codex Workflows

- For issue triage, use \`.codex/workflows/issue-triage.md\`.
- For pull request review, use \`.codex/workflows/pr-review.md\`.
- For release preparation, use \`.codex/workflows/release-prep.md\`.
- For security and quality checks, use \`.codex/workflows/security-quality.md\`.
`;
}

function buildWorkflowFiles(report) {
  return {
    ".codex/workflows/issue-triage.md": issueTriageWorkflow(report),
    ".codex/workflows/pr-review.md": prReviewWorkflow(report),
    ".codex/workflows/release-prep.md": releasePrepWorkflow(report),
    ".codex/workflows/security-quality.md": securityQualityWorkflow(report),
    ".rkk/audit.md": buildAuditMarkdown(report),
    ".rkk/report.json": `${JSON.stringify(report, null, 2)}\n`
  };
}

function issueTriageWorkflow(report) {
  return `# Issue Triage Workflow

Use this workflow to turn a new issue into an actionable maintainer decision.

## Inputs

- Issue title and body
- Related logs, screenshots, or reproduction steps
- Relevant docs from this repository

## Steps

1. Classify the issue as bug, feature request, documentation, question, security, or maintenance.
2. Search the repository knowledge areas before asking for more context.
3. Identify the likely owner surface: ${folderList(report)}.
4. Ask for missing reproduction details only when they block progress.
5. Produce one of: accept, needs reproduction, duplicate candidate, out of scope, or security escalation.

## Output Template

\`\`\`md
Classification:
Affected area:
Evidence checked:
Maintainer action:
User-facing reply:
\`\`\`
`;
}

function prReviewWorkflow(report) {
  return `# Pull Request Review Workflow

Use this workflow for first-pass review and maintainer load reduction.

## Review Order

1. Confirm the PR changes match the stated intent.
2. Check behavior risks before style issues.
3. Verify tests or documentation for changed user-facing behavior.
4. Compare changed areas against repository docs and maintainer rules.
5. Leave findings with file and line references when possible.

## Repository Context

- Markdown files scanned: ${report.totals.markdownFiles}
- Main knowledge areas: ${folderList(report)}

## Review Output

\`\`\`md
Findings:
Open questions:
Suggested tests:
Release note impact:
\`\`\`
`;
}

function releasePrepWorkflow(report) {
  return `# Release Preparation Workflow

Use this workflow before tagging or publishing a release.

For deterministic local context, run:

\`\`\`bash
rkk release-prep .
\`\`\`

## Checklist

- Summarize merged changes since the last release.
- Check whether README, CHANGELOG, migration notes, and examples need updates.
- Identify breaking changes, deprecations, security fixes, and new maintainer tasks.
- Draft release notes with links to PRs or commits.
- Run the project test command and include the result.

## Missing Signals

${missingSignals(report)
  .map((signal) => `- ${signal}`)
  .join("\n") || "- No obvious release metadata gaps detected."}
`;
}

function securityQualityWorkflow(report) {
  return `# Security And Quality Workflow

Use this workflow for lightweight maintainer security and quality audits.

## Checks

- Look for unsafe parsing, shell execution, path traversal, credential exposure, and network calls.
- Confirm generated files do not overwrite user policy without an explicit command.
- Check whether SECURITY.md exists and whether vulnerability reports have a route.
- Prefer actionable, reproducible findings over broad warnings.

## Current Repository Signals

${Object.entries(report.signals)
  .map(([key, value]) => `- ${key}: ${value ? "present" : "missing"}`)
  .join("\n")}
`;
}

function missingSignals(report) {
  return Object.entries(report.signals)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

function folderList(report) {
  const folders = report.folders
    .slice(0, 8)
    .map((folder) => `\`${folder.folder}${folder.folder === "." ? "" : path.sep}\``);
  return folders.join(", ") || "unknown";
}

module.exports = {
  buildAgentsMarkdown,
  buildAuditMarkdown,
  buildWorkflowFiles
};
