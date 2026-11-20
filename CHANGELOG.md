# Changelog

All notable changes to `@whi/http-errors` will be documented in this file.
Releases up to 0.2.0 predate it; see the git tags.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- `headers` on `HttpError` and `MissingFieldError` accepts any `HeadersInit`:
  the existing record, an array of name-value pairs, or a `Headers` object.
  Pass pairs or a `Headers` object to send a header more than once, such as
  two `Set-Cookie` headers to clear two cookies; previously only one could be
  sent. `error.headers` is typed `HeadersInit` to match, so code that reads
  it as a record (`error.headers['X-Foo']`) needs a cast or a
  `new Headers(error.headers)`. ([#2](https://github.com/webheroesinc/js-http-errors/issues/2))

### Fixed

- `new HttpError(status, message, null, headers)`, the README's way to set
  headers without details, compiles in TypeScript; previously the type
  rejected `null`. `error.details` is `undefined` in that case, the same as
  when the argument is left out (it used to be `null` at runtime).
