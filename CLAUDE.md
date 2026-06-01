# repo-knowledge-kit

This project is a small public open-source CLI for maintainers of Markdown-heavy repositories.

## Rules

- Keep the CLI dependency-free unless a dependency removes substantial complexity.
- Prefer deterministic output that can be reviewed in pull requests.
- Do not send repository content to network services from the core CLI.
- Generated maintainer workflows should be practical for issue triage, pull request review, releases, and security checks.
- Tests should use temporary directories and avoid modifying checked-in examples.
