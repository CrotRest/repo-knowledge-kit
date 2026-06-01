# repo-knowledge-kit

Compile repository docs and wiki notes into Codex-ready maintainer workflows.

Many open-source projects keep critical maintainer knowledge in README files, issue templates, Obsidian-style notes, release checklists, and scattered Markdown docs. Agents can help, but only when they can see stable project rules and evidence. `repo-knowledge-kit` scans that knowledge and generates reviewable workflow files for issue triage, pull request review, release preparation, and security or quality audits.

## Why Maintainers Use It

- Generate a repository knowledge audit from Markdown docs.
- Draft an `AGENTS.md` file for Codex and other coding agents.
- Create `.codex/workflows/` prompts for common maintainer work.
- Keep outputs deterministic and reviewable in pull requests.
- Run locally without sending repository content to network services.

## Install

```bash
npm install -g repo-knowledge-kit
```

Or run from a checkout:

```bash
node ./bin/rkk.js --help
```

## Quick Start

```bash
rkk audit .
rkk make-agents .
rkk init .
```

Generated files:

- `AGENTS.md`
- `.codex/workflows/issue-triage.md`
- `.codex/workflows/pr-review.md`
- `.codex/workflows/release-prep.md`
- `.codex/workflows/security-quality.md`
- `.rkk/audit.md`
- `.rkk/report.json`

The CLI refuses to overwrite existing files unless `--force` is passed.

## Example

```bash
node ./bin/rkk.js audit ./examples/oss-maintainer-wiki
node ./bin/rkk.js init ./examples/oss-maintainer-wiki --force
```

## Commands

### `rkk audit [root] [--json]`

Scans Markdown files and prints a repository knowledge audit.

### `rkk make-agents [root] [--force]`

Generates an `AGENTS.md` draft from repository knowledge.

### `rkk init [root] [--force]`

Generates Codex maintainer workflows and an audit report.

## What It Detects

- Markdown file count, headings, summaries, tags, and links
- knowledge-heavy folders
- maintainer signals such as README, LICENSE, CHANGELOG, CONTRIBUTING, SECURITY, issue templates, pull request templates, and existing `AGENTS.md`

## Project Status

This is an early maintainer-focused MVP. The core CLI is dependency-free and designed for deterministic output. Next useful milestones are GitHub Actions integration, richer issue template detection, changelog-aware release notes, and optional API-powered summaries.

## License

MIT
