import { describe, it, expect } from 'vitest';
import { HttpError, MissingFieldError } from '../src/index.js';

describe('HttpError', () => {
    describe('constructor', () => {
        it('should create an error with status and message', () => {
            const error = new HttpError(404, 'Not found');

            expect(error.status).toBe(404);
            expect(error.message).toBe('Not found');
            expect(error.name).toBe('HttpError');
            expect(error.details).toBeUndefined();
        });

        it('should create an error with details', () => {
            const details = { resource: 'user', id: 123 };
            const error = new HttpError(404, 'Not found', details);

            expect(error.status).toBe(404);
            expect(error.message).toBe('Not found');
            expect(error.details).toEqual(details);
        });
    });

    describe('toResponse', () => {
        it('should convert error to Response object', async () => {
            const error = new HttpError(500, 'Internal server error');
            const response = error.toResponse();

            expect(response.status).toBe(500);
            expect(response.headers.get('content-type')).toBe(
                'application/json'
            );

            const body = await response.json();
            expect(body).toEqual({ error: 'Internal server error' });
        });

        it('should include details in response body', async () => {
            const details = { code: 'AUTH_FAILED', retry: false };
            const error = new HttpError(401, 'Unauthorized', details);
            const response = error.toResponse();

            const body = await response.json();
            expect(body).toEqual({
                error: 'Unauthorized',
                code: 'AUTH_FAILED',
                retry: false,
            });
        });

        it('should include custom headers in response', async () => {
            const error = new HttpError(401, 'Session expired', null, {
                'Set-Cookie': 'session_id=; Max-Age=0; Path=/',
            });
            const response = error.toResponse();

            expect(response.headers.get('content-type')).toBe('application/json');
            expect(response.headers.get('Set-Cookie')).toBe(
                'session_id=; Max-Age=0; Path=/'
            );
        });

        it('should allow custom headers to override content-type', async () => {
            const error = new HttpError(400, 'Bad request', null, {
                'content-type': 'text/plain',
            });
            const response = error.toResponse();

            expect(response.headers.get('content-type')).toBe('text/plain');
        });
    });

    describe('fromResponse', () => {
        it('should throw error for successful response', async () => {
            const response = new Response(JSON.stringify({ ok: true }), {
                status: 200,
            });

            await expect(HttpError.fromResponse(response)).rejects.toThrow(
                'Cannot create HttpError from a successful response (status: 200)'
            );
        });

        it('should create HttpError from JSON error response', async () => {
            const response = new Response(
                JSON.stringify({ error: 'Bad request', field: 'email' }),
                {
                    status: 400,
                    headers: { 'content-type': 'application/json' },
                }
            );

            const error = await HttpError.fromResponse(response);

            expect(error.status).toBe(400);
            expect(error.message).toBe('Bad request');
            expect(error.details).toEqual({
                error: 'Bad request',
                field: 'email',
            });
        });

        it('should create HttpError from text response', async () => {
            const response = new Response('Something went wrong', {
                status: 500,
            });

            const error = await HttpError.fromResponse(response);

            expect(error.status).toBe(500);
            expect(error.message).toBe('Something went wrong');
        });

        it('should use statusText as fallback message', async () => {
            const response = new Response(null, {
                status: 404,
                statusText: 'Not Found',
            });

            const error = await HttpError.fromResponse(response);

            expect(error.status).toBe(404);
            expect(error.message).toBe('Not Found');
        });

        it('should handle response without error field in JSON', async () => {
            const response = new Response(
                JSON.stringify({ code: 'INVALID', details: 'foo' }),
                {
                    status: 422,
                    statusText: 'Unprocessable Entity',
                }
            );

            const error = await HttpError.fromResponse(response);

            expect(error.status).toBe(422);
            expect(error.message).toBe('Unprocessable Entity');
            expect(error.details).toEqual({ code: 'INVALID', details: 'foo' });
        });
    });
});

describe('MissingFieldError', () => {
    it('should create a 400 error with field name', () => {
        const error = new MissingFieldError('email');

        expect(error.status).toBe(400);
        expect(error.message).toBe('Missing required field: email');
        expect(error.name).toBe('MissingFieldError');
        expect(error.details).toEqual({ field: 'email' });
    });

    it('should convert to Response correctly', async () => {
        const error = new MissingFieldError('username');
        const response = error.toResponse();

        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body).toEqual({
            error: 'Missing required field: username',
            field: 'username',
        });
    });

    it('should support custom headers', async () => {
        const error = new MissingFieldError('session_token', {
            'Set-Cookie': 'session_id=; Max-Age=0; Path=/',
        });
        const response = error.toResponse();

        expect(response.status).toBe(400);
        expect(response.headers.get('Set-Cookie')).toBe(
            'session_id=; Max-Age=0; Path=/'
        );
    });
});
