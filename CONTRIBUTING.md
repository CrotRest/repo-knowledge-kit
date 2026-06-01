# Contributing

Thanks for helping improve `repo-knowledge-kit`.

## Development

```bash
npm test
npm run smoke
```

The core CLI should stay deterministic and dependency-free unless a dependency removes substantial complexity.

## Pull Requests

- Keep changes small enough to review.
- Add or update tests for scanner, generator, or CLI behavior.
- Include example output when changing generated workflows.
- Avoid network calls in the core CLI.

## Maintainer Workflow

Maintainers review behavior changes first, then output wording, then style. Generated files should be stable enough to commit and diff in pull requests.
