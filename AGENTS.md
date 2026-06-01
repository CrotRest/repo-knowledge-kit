# AGENTS.md

## Project Context

This repository contains a Markdown-heavy open-source project. Agents should use repository documents as the source of truth before changing behavior, documentation, release notes, or maintenance workflows.

## Important Knowledge Areas

- `./`: 7 Markdown files
- `docs/`: 4 Markdown files
- `examples/`: 4 Markdown files
- `.github/`: 3 Markdown files

## Read First

- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `docs/case-studies/README.md`
- `examples/oss-maintainer-wiki/README.md`

## Maintenance Rules

- Prefer small, reviewable changes.
- Preserve existing public behavior unless the task explicitly changes it.
- Read nearby documentation before editing generated workflows or maintainer guidance.
- Keep release, triage, review, and security outputs evidence-linked to repository files.
- Do not invent project policy when documentation is missing; create a clear TODO instead.

## Codex Workflows

- For issue triage, use `.codex/workflows/issue-triage.md`.
- For pull request review, use `.codex/workflows/pr-review.md`.
- For release preparation, use `.codex/workflows/release-prep.md`.
- For security and quality checks, use `.codex/workflows/security-quality.md`.
