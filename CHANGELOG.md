# Changelog

All notable changes to `@whi/http-errors` will be documented in this file.
Releases up to 0.2.0 predate it; see the git tags.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- `new HttpError(status, message, null, headers)`, the README's way to set
  headers without details, compiles in TypeScript; previously the type
  rejected `null`. `error.details` is `undefined` in that case, the same as
  when the argument is left out (it used to be `null` at runtime).
