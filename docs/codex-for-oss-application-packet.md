# Codex For Open Source Application Packet

Use this file when filling the OpenAI Codex for Open Source form.

## Repository

https://github.com/CrotRest/repo-knowledge-kit

## Role

Primary maintainer.

## Current Evidence

- Public GitHub repository.
- MIT license.
- Security policy, code of conduct, contributing guide, issue templates, and pull request template.
- GitHub Actions CI workflow.
- Latest release: `v0.1.4`.
- Merged pull requests: 7.
- Issues: 4 closed, 1 open roadmap issue.
- Public case studies: `openai/openai-node`, `openai/openai-python`, and `CrotRest/repo-knowledge-kit`.
- Dogfoods generated `AGENTS.md` and `.codex/workflows/`.
- Deterministic local commands: `audit`, `make-agents`, `init`, and `release-prep`.
- Verified locally with `npm test`, `npm run smoke`, `node ./bin/rkk.js release-prep .`, and `npm pack --dry-run`.

## Qualification Answer

repo-knowledge-kit is a maintainer automation CLI for Markdown-heavy OSS projects. It converts README, docs, issue templates, release notes, and wiki knowledge into Codex-ready workflows for PR review, issue triage, release prep, and security/quality checks. It dogfoods generated AGENTS.md/.codex workflows and has public issues, PRs, CI, releases, MIT licensing, and case studies on OpenAI SDK repos.

## API Credits Answer

API credits will power optional OSS maintainer automation: summarizing and classifying issues, drafting PR review checklists, generating release notes from repository history, compiling Markdown docs into repository knowledge maps, and producing security/quality audit prompts. Core scanning remains local and deterministic; API use will be opt-in for workflows where maintainers need synthesis.

## Anything Else

The core CLI intentionally avoids network calls and produces deterministic files that can be reviewed in pull requests. The project is designed to reduce maintainer load by making repository context explicit before Codex performs triage, review, release, or security work.

## Remaining Signal To Add

Publish to npm after npm account authentication is available:

```bash
npm login
npm publish --access public
```
