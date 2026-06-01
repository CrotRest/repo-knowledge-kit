const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildIssueTriagePrompt,
  buildLocalIssueTriage,
  buildIssueTriageMarkdown
} = require("../src/issue-triage");

test("buildLocalIssueTriage classifies likely bugs and asks for missing details", () => {
  const result = buildLocalIssueTriage("The CLI crashes with an error when I run rkk audit.");

  assert.equal(result.classification, "bug");
  assert.ok(result.missingInformation.includes("minimal reproduction"));
  assert.match(result.suggestedAction, /missing information/);
});

test("buildLocalIssueTriage escalates likely security reports", () => {
  const result = buildLocalIssueTriage("I found a token leak vulnerability.");

  assert.equal(result.classification, "security");
  assert.match(result.suggestedAction, /SECURITY\.md/);
});

test("buildIssueTriagePrompt includes repository context and issue text", () => {
  const prompt = buildIssueTriagePrompt("Bug body", {
    repositoryContext: "Signals: hasReadme=true"
  });

  assert.match(prompt, /Signals: hasReadme=true/);
  assert.match(prompt, /Bug body/);
  assert.match(prompt, /Classification/);
});

test("buildIssueTriageMarkdown renders local triage output", () => {
  const markdown = buildIssueTriageMarkdown({
    classification: "docs",
    affectedArea: "docs",
    missingInformation: [],
    suggestedAction: "Update README.",
    userFacingReply: "Thanks."
  });

  assert.match(markdown, /Classification/);
  assert.match(markdown, /Update README/);
});
