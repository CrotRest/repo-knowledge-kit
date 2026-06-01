# Demo

This demo shows the intended maintainer workflow on the checked-in example repository.

## Audit

```bash
node ./bin/rkk.js audit ./examples/oss-maintainer-wiki
```

Expected output includes:

```md
# Repository Knowledge Audit

## Maintainer Signals

| Signal | Present |
| --- | --- |
| hasReadme | yes |
| hasIssueTemplates | yes |

## Knowledge Areas

| Folder | Files | Categories | Tags |
| --- | ---: | --- | --- |
| docs | 2 | maintenance | changelog, codex, issues, release, triage |
```

## Generate Maintainer Workflows

```bash
node ./bin/rkk.js init ./examples/oss-maintainer-wiki --force
```

The command generates:

- `.codex/workflows/issue-triage.md`
- `.codex/workflows/pr-review.md`
- `.codex/workflows/release-prep.md`
- `.codex/workflows/security-quality.md`
- `.rkk/audit.md`
- `.rkk/report.json`

## Dogfood

This repository uses its own generated `AGENTS.md` and `.codex/workflows/` files. That keeps project maintenance policy visible to both humans and coding agents.

## Release Prep

```bash
node ./bin/rkk.js release-prep .
```

The command reads local release context and prints a maintainer checklist with candidate changelog notes, commits since the latest tag, and changed files.
