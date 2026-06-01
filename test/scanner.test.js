const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { scanRepository, parseFrontmatter, inferSummary } = require("../src/scanner");

test("parseFrontmatter reads scalar and array metadata", () => {
  const meta = parseFrontmatter(`---
title: "Agent Skills"
tags: [agent, maintainer]
category: concept
---
# Body
`);

  assert.equal(meta.title, "Agent Skills");
  assert.deepEqual(meta.tags, ["agent", "maintainer"]);
  assert.equal(meta.category, "concept");
});

test("inferSummary returns the first useful paragraph", () => {
  const summary = inferSummary(`# Title

This is the first paragraph.

This is later.
`);

  assert.equal(summary, "This is the first paragraph.");
});

test("scanRepository summarizes markdown knowledge and maintainer signals", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rkk-"));
  fs.mkdirSync(path.join(dir, "docs"));
  fs.writeFileSync(path.join(dir, "README.md"), "# Demo\n\nRoot docs.", "utf8");
  fs.writeFileSync(
    path.join(dir, "docs", "triage.md"),
    `---
title: Triage
tags: [maintenance, issues]
---
# Triage

Use [[README]] for context.
`,
    "utf8"
  );

  const report = scanRepository(dir);

  assert.equal(report.totals.markdownFiles, 2);
  assert.equal(report.signals.hasReadme, true);
  assert.equal(report.folders.some((folder) => folder.folder === "docs"), true);
  assert.equal(report.pages.find((page) => page.path === "docs/triage.md").title, "Triage");
});
