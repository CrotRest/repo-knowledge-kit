const assert = require("node:assert/strict");
const test = require("node:test");
const { buildAgentsMarkdown, buildWorkflowFiles } = require("../src/generators");

const report = {
  root: "/tmp/demo",
  totals: { markdownFiles: 2, headings: 3, bytes: 120 },
  signals: {
    hasReadme: true,
    hasLicense: false,
    hasChangelog: false
  },
  folders: [
    { folder: "docs", files: 2, categories: ["concept"], tags: ["maintenance"] }
  ],
  pages: [
    {
      path: "README.md",
      title: "Demo",
      summary: "A demo repository.",
      headings: [],
      links: [],
      tags: []
    }
  ]
};

test("buildAgentsMarkdown emits Codex maintainer workflow references", () => {
  const markdown = buildAgentsMarkdown(report);

  assert.match(markdown, /AGENTS\.md/);
  assert.match(markdown, /\.codex\/workflows\/issue-triage\.md/);
});

test("buildWorkflowFiles includes audit and workflow outputs", () => {
  const files = buildWorkflowFiles(report);

  assert.ok(files[".codex/workflows/pr-review.md"]);
  assert.ok(files[".rkk/audit.md"]);
  assert.ok(files[".rkk/report.json"]);
});
