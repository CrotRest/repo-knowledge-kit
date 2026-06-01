const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  buildReleasePrep,
  buildReleasePrepMarkdown,
  parseChangelog
} = require("../src/release-prep");

test("parseChangelog extracts the top section and bullet notes", () => {
  const changelog = parseChangelog(`# Changelog

## Unreleased

- Add release prep command.
- Improve docs.

## 0.1.0

- Initial release.
`);

  assert.equal(changelog.topSection.title, "Unreleased");
  assert.deepEqual(changelog.topSection.items, [
    "Add release prep command.",
    "Improve docs."
  ]);
});

test("buildReleasePrep works without a git repository", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rkk-"));
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version: "1.2.3" }), "utf8");
  fs.writeFileSync(path.join(dir, "CHANGELOG.md"), "## Unreleased\n\n- Local note.\n", "utf8");

  const report = buildReleasePrep(dir);

  assert.equal(report.packageVersion, "1.2.3");
  assert.equal(report.latestTag, null);
  assert.deepEqual(report.candidateNotes, ["Local note."]);
});

test("buildReleasePrepMarkdown includes version, notes, and checklist", () => {
  const markdown = buildReleasePrepMarkdown({
    root: "/tmp/repo",
    packageVersion: "1.2.3",
    latestTag: "v1.2.2",
    range: "v1.2.2..HEAD",
    changelogTopSection: "Unreleased",
    candidateNotes: ["Add release prep command."],
    commits: ["abc123 Add feature"],
    changedFiles: ["src/release-prep.js"],
    checks: ["Run tests before tagging."]
  });

  assert.match(markdown, /package version: 1\.2\.3/);
  assert.match(markdown, /Add release prep command/);
  assert.match(markdown, /src\/release-prep\.js/);
  assert.match(markdown, /Run tests before tagging/);
});
