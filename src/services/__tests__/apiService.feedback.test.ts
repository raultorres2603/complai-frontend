/**
 * Service Tests - complaiService.sendFeedback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { complaiService, ApiError } from '../apiService';

const mockFetch = vi.fn();

describe('complaiService.sendFeedback', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends correct POST request with Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, message: null, error: null, errorCode: 0, sources: [] }),
    });

    await complaiService.sendFeedback('Alice', 'user-123', 'Great app', 'jwt-token');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toContain('/complai/feedback');
    expect(options.method).toBe('POST');
    expect(options.headers['Authorization']).toBe('Bearer jwt-token');
    expect(options.body).toBe(
      JSON.stringify({ userName: 'Alice', idUser: 'user-123', message: 'Great app' })
    );
  });

  it('throws ApiError with status 400 on bad request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, error: 'Bad Request', errorCode: 2, message: null, sources: [] }),
    });

    await expect(
      complaiService.sendFeedback('Alice', 'user-123', 'test', 'jwt-token')
    ).rejects.toSatisfy((err: unknown) => err instanceof ApiError && (err as ApiError).status === 400);
  });

  it('throws ApiError with status 401 on unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, error: 'Unauthorized', errorCode: 4, message: null, sources: [] }),
    });

    await expect(
      complaiService.sendFeedback('Alice', 'user-123', 'test', 'jwt-token')
    ).rejects.toSatisfy((err: unknown) => err instanceof ApiError && (err as ApiError).status === 401);
  });

  it('throws ApiError with status 500 on server error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, error: 'Internal Server Error', errorCode: 4, message: null, sources: [] }),
    });

    await expect(
      complaiService.sendFeedback('Alice', 'user-123', 'test', 'jwt-token')
    ).rejects.toSatisfy((err: unknown) => err instanceof ApiError && (err as ApiError).status === 500);
  });
});
