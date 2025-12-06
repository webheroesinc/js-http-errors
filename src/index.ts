/**
 * HttpError class for throwing HTTP-like errors from worker path handlers.
 * These errors can be caught and transformed into appropriate HTTP responses.
 */
export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly details?: Record<string, any>,
        public readonly headers?: Record<string, string>
    ) {
        super(message);
        this.name = this.constructor.name;
    }

    toResponse(): Response {
        const body = {
            error: this.message,
            ...(this.details || {}),
        };
        return new Response(JSON.stringify(body), {
            status: this.status,
            headers: {
                'content-type': 'application/json',
                ...(this.headers || {}),
            },
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
    constructor(fieldName: string, headers?: Record<string, string>) {
        super(400, `Missing required field: ${fieldName}`, { field: fieldName }, headers);
    }
}
