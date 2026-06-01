# Security Policy

## Supported Versions

The latest published version receives security fixes.

## Reporting A Vulnerability

Please open a private security advisory on GitHub when the repository is public. If private advisories are unavailable, contact the maintainer directly before posting exploit details in a public issue.

## Security Model

`repo-knowledge-kit` scans local Markdown files and writes local workflow files. The core CLI does not send repository content to external services.

Security-sensitive areas:

- path handling for generated output
- accidental overwrite protection
- parsing untrusted Markdown content
- future optional API integrations
