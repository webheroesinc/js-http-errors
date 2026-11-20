/**
 * HttpError class for throwing HTTP-like errors from worker path handlers.
 * These errors can be caught and transformed into appropriate HTTP responses.
 */
export class HttpError extends Error {
    public readonly details?: Record<string, any>;

    /**
     * @param details - Extra fields merged into the JSON body. Pass `null` or `undefined`
     *   to send only `error`, e.g. when setting headers without details.
     * @param headers - Response headers, in any form `fetch` accepts. Use an array of
     *   name-value pairs or a `Headers` object to send a header more than once:
     *
     * @example
     * ```ts
     * new HttpError(401, 'Session expired', null, [
     *     ['Set-Cookie', 'session=; Max-Age=0; Path=/'],
     *     ['Set-Cookie', 'refresh=; Max-Age=0; Path=/'],
     * ]);
     * ```
     */
    constructor(
        public readonly status: number,
        message: string,
        details?: Record<string, any> | null,
        public readonly headers?: HeadersInit
    ) {
        super(message);
        this.name = this.constructor.name;
        // Normalize so `details` reads the same however "no details" was passed
        this.details = details ?? undefined;
    }

    toResponse(): Response {
        const body = {
            error: this.message,
            ...(this.details || {}),
        };
        const headers = new Headers({ 'content-type': 'application/json' });
        // The first value for a name replaces any default (so content-type can be
        // overridden); repeats are appended, so every Set-Cookie is sent.
        const seen = new Set<string>();
        for (const [name, value] of headerPairs(this.headers)) {
            const key = name.toLowerCase();
            if (seen.has(key)) {
                headers.append(name, value);
            } else {
                headers.set(name, value);
                seen.add(key);
            }
        }
        return new Response(JSON.stringify(body), {
            status: this.status,
            headers,
        });
    }

    static async fromResponse(response: Response): Promise<HttpError> {
        const status = response.status;
        if (status >= 200 && status < 300) {
            throw new Error(
                `Cannot create HttpError from a successful response (status: ${status})`
            );
        }
        let message = response.statusText || 'Unknown Error';
        let details: Record<string, any> | undefined;

        // Clone the response so we can try multiple body reading methods
        const responseClone = response.clone();

        // First try to parse as JSON
        try {
            const body = await response.json();
            if (body && typeof body === 'object') {
                if ('error' in body && typeof body.error === 'string') {
                    message = body.error;
                }
                details = body;
            }
        } catch (e) {
            // If JSON parsing fails, fall back to text using the cloned response
            try {
                const text = await responseClone.text();
                if (text) {
                    message = text;
                }
            } catch (textError) {
                console.error('Failed to parse response body:', textError);
            }
        }

        return new HttpError(status, message, details);
    }
}

/**
 * MissingFieldError subclass for handling missing fields in POST body requests.
 */
export class MissingFieldError extends HttpError {
    constructor(fieldName: string, headers?: HeadersInit) {
        super(400, `Missing required field: ${fieldName}`, { field: fieldName }, headers);
    }
}

/**
 * Flatten any HeadersInit into name-value pairs, keeping each Set-Cookie separate.
 * Iterating a Headers object directly would join repeated values into one.
 */
function headerPairs(init?: HeadersInit): [string, string][] {
    if (!init) {
        return [];
    }
    if (init instanceof Headers) {
        const pairs: [string, string][] = [];
        init.forEach((value, name) => {
            if (name !== 'set-cookie') {
                pairs.push([name, value]);
            }
        });
        for (const cookie of init.getSetCookie()) {
            pairs.push(['set-cookie', cookie]);
        }
        return pairs;
    }
    if (Array.isArray(init)) {
        return init.map(([name, value]) => [name, value]);
    }
    return Object.entries(init);
}
