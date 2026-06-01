const path = require("node:path");
const { scanRepository } = require("./scanner");
const { buildAgentsMarkdown, buildAuditMarkdown, buildWorkflowFiles } = require("./generators");
const { buildReleasePrep, buildReleasePrepMarkdown } = require("./release-prep");
const { fileExists, writeTextFile } = require("./fs-utils");

function usage() {
  return `repo-knowledge-kit

Usage:
  rkk audit [root] [--json]
  rkk release-prep [root] [--json]
  rkk init [root] [--force]
  rkk make-agents [root] [--force]

Commands:
  audit        Print a repository knowledge audit.
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

  const root = path.resolve(args.find((arg) => !arg.startsWith("-") && arg !== command) || ".");
  const force = args.includes("--force");
  const json = args.includes("--json");

  if (command === "audit") {
    const report = scanRepository(root);
    console.log(json ? JSON.stringify(report, null, 2) : buildAuditMarkdown(report));
    return;
  }

  if (command === "release-prep") {
    const report = buildReleasePrep(root);
    console.log(json ? JSON.stringify(report, null, 2) : buildReleasePrepMarkdown(report));
    return;
  }

  if (command === "init") {
    const report = scanRepository(root);
    const files = buildWorkflowFiles(report);
    writeGeneratedFiles(root, files, force);
    console.log(`Generated ${Object.keys(files).length} maintainer workflow files in ${root}`);
    return;
  }

  if (command === "make-agents") {
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

module.exports = {
  run,
  usage,
  writeGeneratedFiles,
  isPathInside
};
