# npm Publishing Checklist

The package name `repo-knowledge-kit` was checked on 2026-06-01 and was not published on npm at that time.

## Before Publishing

Run:

```bash
npm test
npm run smoke
npm pack --dry-run
```

Expected checks:

- all tests pass
- smoke command prints a JSON audit for `examples/oss-maintainer-wiki`
- dry-run tarball includes `bin/`, `src/`, `README.md`, `LICENSE`, and `CHANGELOG.md`

## Login

```bash
npm adduser
npm whoami
```

## Publish

```bash
npm publish --access public
```

## After Publishing

```bash
npm view repo-knowledge-kit version
npm view repo-knowledge-kit dist-tags
```

Then confirm the README install command works:

```bash
npm install -g repo-knowledge-kit
rkk --help
```
