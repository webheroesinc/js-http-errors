# @whi/http-errors

[![npm version](https://img.shields.io/npm/v/@whi/http-errors.svg?style=flat-square)](https://www.npmjs.com/package/@whi/http-errors)

TypeScript HTTP error classes with Web Response API conversion utilities for modern JavaScript runtimes.

## Installation

```bash
npm install @whi/http-errors
```

## Usage

### HttpError

Base error class for HTTP-like errors with built-in Response conversion.

```typescript
import { HttpError } from '@whi/http-errors';

// Create an HTTP error
const error = new HttpError(404, 'Resource not found');

// Convert to Response object
const response = error.toResponse();
// Response: { status: 404, body: { "error": "Resource not found" } }

// With additional details
const detailedError = new HttpError(500, 'Database error', {
    code: 'DB_CONNECTION_FAILED',
    retry: true
});

const response2 = detailedError.toResponse();
// Response body: { "error": "Database error", "code": "DB_CONNECTION_FAILED", "retry": true }

// With custom response headers
const authError = new HttpError(401, 'Session expired', null, {
    'Set-Cookie': 'session_id=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
});

const response3 = authError.toResponse();
// Response includes Set-Cookie header to clear the session

// To send a header more than once (e.g. clear two cookies), pass name-value pairs
// or a Headers object
const signOutError = new HttpError(401, 'Signed out', null, [
    ['Set-Cookie', 'session_id=; Max-Age=0; Path=/'],
    ['Set-Cookie', 'refresh_token=; Max-Age=0; Path=/']
]);
// Response includes both Set-Cookie headers
```

### MissingFieldError

Specialized error for missing required fields (returns 400 Bad Request).

```typescript
import { MissingFieldError } from '@whi/http-errors';

const error = new MissingFieldError('email');
// Status: 400
// Message: "Missing required field: email"
// Details: { field: "email" }
```

### Creating HttpError from Response

Convert error responses back into HttpError objects.

```typescript
import { HttpError } from '@whi/http-errors';

// From JSON error response
const response = await fetch('/api/endpoint');
if (!response.ok) {
    const error = await HttpError.fromResponse(response);
    console.log(error.status);   // 404
    console.log(error.message);  // "Not found"
    console.log(error.details);  // { ... }
}
```

## API

### `HttpError`

**Constructor:**
```typescript
new HttpError(status: number, message: string, details?: Record<string, any> | null, headers?: HeadersInit)
```

**Properties:**
- `status: number` - HTTP status code
- `message: string` - Error message
- `details?: Record<string, any>` - Additional error details (`undefined` when none were given, including when `null` was passed)
- `headers?: HeadersInit` - Custom response headers, as given (a record, an array of name-value pairs, or a `Headers` object)

**Methods:**
- `toResponse(): Response` - Converts error to a JSON Response object
- `static fromResponse(response: Response): Promise<HttpError>` - Creates HttpError from a Response

### `MissingFieldError`

**Constructor:**
```typescript
new MissingFieldError(fieldName: string, headers?: HeadersInit)
```

Extends `HttpError` with status 400 and pre-formatted message.

## Use Cases

Perfect for:
- **Cloudflare Workers** - Throw and catch errors that convert to proper HTTP responses
- **Edge Functions** - Deno, Bun, or any runtime with Web APIs
- **API Routes** - Standardized error handling for fetch-based applications
- **Service Workers** - Consistent error responses in PWAs

## Documentation

**https://webheroesinc.github.io/js-http-errors/**

API documentation is generated from the source using TypeDoc and published with each release.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and the release process.

## License

LGPL-3.0

## Author

Matthew Brisebois

## Repository

[github.com/webheroesinc/js-http-errors](https://github.com/webheroesinc/js-http-errors)
