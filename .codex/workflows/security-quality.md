# Security And Quality Workflow

Use this workflow for lightweight maintainer security and quality audits.

## Checks

- Look for unsafe parsing, shell execution, path traversal, credential exposure, and network calls.
- Confirm generated files do not overwrite user policy without an explicit command.
- Check whether SECURITY.md exists and whether vulnerability reports have a route.
- Prefer actionable, reproducible findings over broad warnings.

## Current Repository Signals

- hasReadme: present
- hasLicense: present
- hasChangelog: present
- hasContributing: present
- hasCodeOfConduct: present
- hasIssueTemplates: present
- hasPullRequestTemplate: present
- hasAgentsFile: present
- hasSecurityPolicy: present
