const path = require("node:path");
const { scanRepository } = require("./scanner");
const { buildAgentsMarkdown, buildAuditMarkdown, buildWorkflowFiles } = require("./generators");
const { buildReleasePrep, buildReleasePrepMarkdown } = require("./release-prep");
const {
  buildIssueTriageMarkdown,
  buildIssueTriagePrompt,
  buildLocalIssueTriage,
  readIssueInput,
  runOpenAIIssueTriage
} = require("./issue-triage");
const { fileExists, writeTextFile } = require("./fs-utils");

function usage() {
  return `repo-knowledge-kit

Usage:
  rkk audit [root] [--json]
  rkk issue-triage <issue.md> [--root <root>] [--json] [--prompt] [--api] [--model <model>]
  rkk release-prep [root] [--json]
  rkk init [root] [--force]
  rkk make-agents [root] [--force]

Commands:
  audit        Print a repository knowledge audit.
  issue-triage Classify and summarize an issue locally, as a prompt, or through opt-in OpenAI API.
  release-prep Print a changelog-aware release preparation report.
  init         Generate Codex maintainer workflows under .codex/workflows and .rkk.
  make-agents  Generate an AGENTS.md draft from repository knowledge.
`;
}

async function run(args) {
  const command = args[0];
  if (!command || command === "--help" || command === "-h") {
    console.log(usage());
    return;
  }

  const force = args.includes("--force");
  const json = args.includes("--json");

  if (command === "audit") {
    const root = resolveRootArg(args, command);
    const report = scanRepository(root);
    console.log(json ? JSON.stringify(report, null, 2) : buildAuditMarkdown(report));
    return;
  }

  if (command === "release-prep") {
    const root = resolveRootArg(args, command);
    const report = buildReleasePrep(root);
    console.log(json ? JSON.stringify(report, null, 2) : buildReleasePrepMarkdown(report));
    return;
  }

  if (command === "issue-triage") {
    const issueFile = args.find((arg) => !arg.startsWith("-") && arg !== command);
    if (!issueFile) throw new Error("issue-triage requires an issue markdown file.");
    const root = path.resolve(getOption(args, "--root") || ".");
    const issueText = readIssueInput(issueFile);
    const report = scanRepository(root);
    const repositoryContext = summarizeRepositoryForTriage(report);

    if (args.includes("--prompt")) {
      const prompt = buildIssueTriagePrompt(issueText, { repositoryContext });
      console.log(json ? JSON.stringify({ prompt }, null, 2) : prompt);
      return;
    }

    if (args.includes("--api")) {
      const model = getOption(args, "--model");
      const result = await runOpenAIIssueTriage(issueText, { model, repositoryContext });
      console.log(json ? JSON.stringify(result, null, 2) : buildIssueTriageMarkdown(result));
      return;
    }

    const result = buildLocalIssueTriage(issueText, {
      knownAreas: report.folders.map((folder) => folder.folder)
    });
    console.log(json ? JSON.stringify(result, null, 2) : buildIssueTriageMarkdown(result));
    return;
  }

  if (command === "init") {
    const root = resolveRootArg(args, command);
    const report = scanRepository(root);
    const files = buildWorkflowFiles(report);
    writeGeneratedFiles(root, files, force);
    console.log(`Generated ${Object.keys(files).length} maintainer workflow files in ${root}`);
    return;
  }

  if (command === "make-agents") {
    const root = resolveRootArg(args, command);
    const report = scanRepository(root);
    const target = path.join(root, "AGENTS.md");
    writeGeneratedFiles(root, { "AGENTS.md": buildAgentsMarkdown(report) }, force);
    console.log(`Generated ${target}`);
    return;
  }

  throw new Error(`Unknown command: ${command}\n\n${usage()}`);
}

function writeGeneratedFiles(root, files, force) {
  const absoluteRoot = path.resolve(root);

  for (const [relativePath, text] of Object.entries(files)) {
    const target = path.resolve(absoluteRoot, relativePath);
    if (!isPathInside(absoluteRoot, target)) {
      throw new Error(`Refusing to write outside repository root: ${relativePath}`);
    }
    if (!force && fileExists(target)) {
      throw new Error(`Refusing to overwrite ${target}. Re-run with --force to replace it.`);
    }
    writeTextFile(target, text);
  }
}

function isPathInside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function getOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function resolveRootArg(args, command) {
  return path.resolve(getOption(args, "--root") || args.find((arg) => !arg.startsWith("-") && arg !== command) || ".");
}

function summarizeRepositoryForTriage(report) {
  const areas = report.folders
    .slice(0, 8)
    .map((folder) => `${folder.folder}: ${folder.files} markdown files`)
    .join("; ");
  return `Signals: ${JSON.stringify(report.signals)}\nAreas: ${areas || "none detected"}`;
}

module.exports = {
  getOption,
  resolveRootArg,
  summarizeRepositoryForTriage,
  run,
  usage,
  writeGeneratedFiles,
  isPathInside
};
