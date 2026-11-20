# Contributing to @whi/http-errors

## Development Setup

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Typecheck (src and tests) and check formatting, as CI does
npm run check
```

Tests import directly from `src/` so coverage reflects the source.

## Code Style

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

We use Prettier for code formatting. Run `npm run format` before committing. `npm install`
points git at `.githooks/`, whose `pre-push` runs `npm run check`.

## Documentation

API documentation is generated from the TypeScript source and its JSDoc comments using TypeDoc.

- Documentation is deployed to GitHub Pages when a release is published (see Branches and Releases)
- View live docs at: https://webheroesinc.github.io/js-http-errors/
- Generate locally: `npm run docs`

When adding or modifying public APIs, add JSDoc comments with `@param`, `@returns` and
`@example` tags, and run `npm run docs` to check the output.

## Branches and Releases

Work goes in pull requests to `develop`. CI runs format, typecheck and tests,
and they must pass to merge. A release is a pull request from `develop` to
`master`; CI fails it if `version` in `package.json` already has a
`v<version>` tag. Bump it with `npm version <x.y.z> --no-git-tag-version`: the
publish workflow creates the tag, and a tag made locally would make it skip
the release.

To merge `develop` into `master` without releasing, for example to get
tooling or Dependabot config changes onto `master` (Dependabot reads its
config from there), add the `release:none` label to the PR instead of
bumping. CI then requires the version to be unchanged from `master` and
already tagged, so the merge stages nothing on npm.

Merging to `master` runs `.github/workflows/publish.yml`, which stages the
release on npm with trusted publishing, tags it and redeploys the docs.
Nothing is live until a maintainer approves the staged release with 2FA
(`npm stage approve`, or on npmjs.com). Prereleases (`1.0.0-alpha.1`) go out
under the `next` dist-tag. Record each release in `CHANGELOG.md`.

## Submitting Changes

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Add JSDoc comments for any new public APIs
5. Run `npm run check` and `npm test`
6. Add an entry under `[Unreleased]` in `CHANGELOG.md` for user-visible changes
7. Commit with clear messages
8. Submit a pull request to `develop`

## Questions?

Open an issue on GitHub for questions or discussion about contributing.
