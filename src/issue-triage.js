const path = require("node:path");
const { readTextFile } = require("./fs-utils");

const DEFAULT_TRIAGE_MODEL = "gpt-5-mini";

function buildIssueTriagePrompt(issueText, options = {}) {
  const repositoryContext = options.repositoryContext || "No repository context provided.";

  return `You are helping an open-source maintainer triage an issue.

Repository context:
${repositoryContext}

Issue:
${issueText}

Return a concise triage note with:
- Classification: bug, feature, docs, question, security, maintenance, or unclear
- Affected area
- Missing information
- Suggested maintainer action
- User-facing reply`;
}

function buildLocalIssueTriage(issueText, options = {}) {
  const lower = issueText.toLowerCase();
  const classification = classifyIssue(lower);
  const missing = [];

  if (!/repro|reproduction|steps|minimal|example/.test(lower)) {
    missing.push("minimal reproduction");
  }
  if (!/expected|should/.test(lower)) {
    missing.push("expected behavior");
  }
  if (!/actual|instead|error|failed|fails|broken/.test(lower)) {
    missing.push("actual behavior or error output");
  }

  return {
    classification,
    affectedArea: inferAffectedArea(lower, options.knownAreas || []),
    missingInformation: missing,
    suggestedAction: suggestAction(classification, missing),
    userFacingReply: buildUserFacingReply(classification, missing)
  };
}

async function runOpenAIIssueTriage(issueText, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when using --api.");
  }

  const model = options.model || process.env.RKK_OPENAI_MODEL || DEFAULT_TRIAGE_MODEL;
  const prompt = buildIssueTriagePrompt(issueText, options);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: "You produce practical, concise open-source issue triage notes.",
      input: prompt
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI Responses API request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  return {
    model,
    outputText: extractOutputText(data),
    raw: data
  };
}

function buildIssueTriageMarkdown(result) {
  if (result.outputText) {
    return `# Issue Triage

Model: ${result.model}

${result.outputText}
`;
  }

  const missing = result.missingInformation.length
    ? result.missingInformation.map((item) => `- ${item}`).join("\n")
    : "- None detected by local heuristics.";

  return `# Issue Triage

## Classification

${result.classification}

## Affected Area

${result.affectedArea}

## Missing Information

${missing}

## Suggested Maintainer Action

${result.suggestedAction}

## User-Facing Reply

${result.userFacingReply}
`;
}

function readIssueInput(file) {
  const absolute = path.resolve(file);
  return readTextFile(absolute);
}

function classifyIssue(lower) {
  if (/security|vulnerability|cve|exploit|xss|injection|secret|token/.test(lower)) return "security";
  if (/bug|error|failed|fails|broken|crash|exception|regression/.test(lower)) return "bug";
  if (/feature|request|support|add|enhancement/.test(lower)) return "feature";
  if (/docs|documentation|readme|typo|example/.test(lower)) return "docs";
  if (/release|publish|version|changelog/.test(lower)) return "maintenance";
  if (/\?|how do i|question/.test(lower)) return "question";
  return "unclear";
}

function inferAffectedArea(lower, knownAreas) {
  const matched = knownAreas.find((area) => area !== "." && lower.includes(area.toLowerCase()));
  if (matched) return matched;
  if (/readme|docs|documentation/.test(lower)) return "docs";
  if (/release|changelog|version|publish/.test(lower)) return "release";
  if (/security|vulnerability|token|secret/.test(lower)) return "security";
  return "unknown";
}

function suggestAction(classification, missing) {
  if (classification === "security") return "Escalate privately using SECURITY.md before public discussion.";
  if (missing.length > 0) return "Ask for the missing information before implementation.";
  if (classification === "bug") return "Accept for reproduction and link affected files or tests.";
  if (classification === "feature") return "Clarify scope and decide whether it fits the maintainer roadmap.";
  return "Leave a concise maintainer reply and label for follow-up.";
}

function buildUserFacingReply(classification, missing) {
  if (classification === "security") {
    return "Thanks for the report. Please follow the project's security reporting process so details can be handled privately.";
  }
  if (missing.length > 0) {
    return `Thanks for opening this. Could you add ${missing.join(", ")} so maintainers can triage it accurately?`;
  }
  return "Thanks for the clear report. This has enough information for maintainer review.";
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

module.exports = {
  DEFAULT_TRIAGE_MODEL,
  buildIssueTriageMarkdown,
  buildIssueTriagePrompt,
  buildLocalIssueTriage,
  readIssueInput,
  runOpenAIIssueTriage
};
