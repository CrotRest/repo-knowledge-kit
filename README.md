# repo-knowledge-kit

[![CI](https://github.com/CrotRest/repo-knowledge-kit/actions/workflows/test.yml/badge.svg)](https://github.com/CrotRest/repo-knowledge-kit/actions/workflows/test.yml)
[![Release](https://img.shields.io/github/v/release/CrotRest/repo-knowledge-kit)](https://github.com/CrotRest/repo-knowledge-kit/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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
rkk issue-triage ./issue.md
rkk release-prep .
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

## Demo

Run the included example:

```bash
node ./bin/rkk.js audit ./examples/oss-maintainer-wiki
node ./bin/rkk.js init ./examples/oss-maintainer-wiki --force
```

See [docs/demo.md](docs/demo.md) for sample output.

## Public Case Studies

The CLI has been run against public repositories to verify the audit shape on real maintainer surfaces:

- [openai/openai-node](docs/case-studies/README.md#openaiopenai-node)
- [openai/openai-python](docs/case-studies/README.md#openaiopenai-python)
- [CrotRest/repo-knowledge-kit](docs/case-studies/README.md#crotrestrepo-knowledge-kit)

## Publishing

The package is ready for npm publication once maintainer npm credentials are available. See [docs/npm-publishing.md](docs/npm-publishing.md).

## Dogfood

This repository uses `repo-knowledge-kit` on itself. The generated files are committed so maintainers and agents can inspect the project rules directly:

- [AGENTS.md](AGENTS.md)
- [.codex/workflows/issue-triage.md](.codex/workflows/issue-triage.md)
- [.codex/workflows/pr-review.md](.codex/workflows/pr-review.md)
- [.codex/workflows/release-prep.md](.codex/workflows/release-prep.md)
- [.codex/workflows/security-quality.md](.codex/workflows/security-quality.md)

## Example

```bash
node ./bin/rkk.js audit ./examples/oss-maintainer-wiki
node ./bin/rkk.js init ./examples/oss-maintainer-wiki --force
```

## Commands

### `rkk audit [root] [--json]`

Scans Markdown files and prints a repository knowledge audit.

### `rkk issue-triage <issue.md> [--root <root>] [--json] [--prompt] [--api]`

Classifies an issue and suggests a maintainer action. By default this uses deterministic local heuristics and makes no network calls.

Use `--prompt` to print the exact prompt for review. Use `--api` to opt into the OpenAI Responses API with `OPENAI_API_KEY`; no repository or issue content is sent unless this flag is explicitly passed.

### `rkk release-prep [root] [--json]`

Reads `CHANGELOG.md`, `package.json`, the latest git tag, commits, and changed files to print a deterministic release preparation report.

### `rkk make-agents [root] [--force]`

Generates an `AGENTS.md` draft from repository knowledge.

### `rkk init [root] [--force]`

Generates Codex maintainer workflows and an audit report.

## What It Detects

- Markdown file count, headings, summaries, tags, and links
- knowledge-heavy folders
- maintainer signals such as README, LICENSE, CHANGELOG, CONTRIBUTING, SECURITY, issue templates, pull request templates, and existing `AGENTS.md`

## Project Status

This is an early maintainer-focused MVP. The core CLI is dependency-free and designed for deterministic output. Next useful milestones are richer issue template detection, changelog-aware release notes, multi-repository case studies, and optional API-powered summaries.

## Open Source Readiness

- Public GitHub repository
- MIT license
- Security policy and code of conduct
- Issue and pull request templates
- CI workflow
- Versioned release
- Dogfooded `AGENTS.md` and Codex workflow files
- Public case studies against real repositories
- Codex for OSS application packet in [docs/codex-for-oss-application-packet.md](docs/codex-for-oss-application-packet.md)

## License

MIT
