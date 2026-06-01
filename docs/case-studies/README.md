# Case Studies

These case studies show `repo-knowledge-kit` running against public repositories with different maintainer surfaces.

Scanned on 2026-06-01 using the local CLI from this repository.

## Summary

| Repository | Markdown Files | Headings | Maintainer Signals |
| --- | ---: | ---: | --- |
| `openai/openai-node` | 21 | 1121 | README, license, changelog, contributing, issue templates, PR template, security policy |
| `openai/openai-python` | 11 | 1071 | README, license, changelog, contributing, issue templates, PR template, security policy |
| `CrotRest/repo-knowledge-kit` | 16 | 73 | README, license, changelog, contributing, code of conduct, issue templates, PR template, AGENTS.md, security policy |

## openai/openai-node

Command:

```bash
node ./bin/rkk.js audit /tmp/openai-openai-node --json
```

Observed output:

```json
{
  "totals": {
    "markdownFiles": 21,
    "bytes": 424184,
    "headings": 1121
  },
  "topFolders": ["src", ".", ".github", "ecosystem-tests"],
  "signals": {
    "hasReadme": true,
    "hasLicense": true,
    "hasChangelog": true,
    "hasContributing": true,
    "hasIssueTemplates": true,
    "hasPullRequestTemplate": true,
    "hasSecurityPolicy": true
  }
}
```

Maintainer takeaway: SDK repositories often have substantial generated or reference Markdown under source folders. The audit makes that documentation surface visible before generating review and release workflows.

## openai/openai-python

Command:

```bash
node ./bin/rkk.js audit /tmp/openai-openai-python --json
```

Observed output:

```json
{
  "totals": {
    "markdownFiles": 11,
    "bytes": 372809,
    "headings": 1071
  },
  "topFolders": [".", "src", ".github"],
  "signals": {
    "hasReadme": true,
    "hasLicense": true,
    "hasChangelog": true,
    "hasContributing": true,
    "hasIssueTemplates": true,
    "hasPullRequestTemplate": true,
    "hasSecurityPolicy": true
  }
}
```

Maintainer takeaway: the project detects the core maintenance surface of a public SDK repo without requiring API calls or repository-specific configuration.

## CrotRest/repo-knowledge-kit

Command:

```bash
node ./bin/rkk.js audit /tmp/CrotRest-repo-knowledge-kit --json
```

Observed output:

```json
{
  "totals": {
    "markdownFiles": 16,
    "bytes": 12747,
    "headings": 73
  },
  "topFolders": [".", "examples", ".github", "docs"],
  "signals": {
    "hasReadme": true,
    "hasLicense": true,
    "hasChangelog": true,
    "hasContributing": true,
    "hasCodeOfConduct": true,
    "hasIssueTemplates": true,
    "hasPullRequestTemplate": true,
    "hasAgentsFile": true,
    "hasSecurityPolicy": true
  }
}
```

Maintainer takeaway: this repository dogfoods its own generated `AGENTS.md` and `.codex/workflows/` files while excluding generated `.codex` files from future audits.
