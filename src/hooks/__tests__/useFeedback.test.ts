/**
 * useFeedback Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@/__tests__/test-utils';
import { useFeedback } from '../useFeedback';

vi.mock('../../services/apiService', () => ({
  complaiService: { sendFeedback: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    errorCode: number;
    constructor(status: number, errorCode: number, message: string) {
      super(message);
      this.status = status;
      this.errorCode = errorCode;
    }
  },
}));

vi.mock('../useAuth', () => ({
  useAuth: () => ({
    jwtToken: 'mock-token',
    decodeToken: (_token: string) => ({ sub: 'user-123', name: 'Alice' }),
  }),
}));

vi.mock('../useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Import mocked modules for assertions
import { complaiService, ApiError } from '../../services/apiService';

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets success=true on resolved sendFeedback', async () => {
    vi.mocked(complaiService.sendFeedback).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('hello');
    });

    expect(result.current.success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('isLoading is true during async call', async () => {
    let resolvePromise!: () => void;
    const deferred = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(complaiService.sendFeedback).mockReturnValueOnce(deferred);

    const { result } = renderHook(() => useFeedback('test-token'));

    act(() => {
      result.current.submitFeedback('hello');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise();
      await deferred;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('maps status 400 to feedback_error_validation message', async () => {
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(
      new ApiError(400, 2, 'Bad Request')
    );

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('hello');
    });

    expect(result.current.error).toBe('feedback_error_validation');
    expect(result.current.success).toBe(false);
  });

  it('maps status 401 to feedback_error_unauthorized message', async () => {
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(
      new ApiError(401, 4, 'Unauthorized')
    );

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('hello');
    });

    expect(result.current.error).toBe('feedback_error_unauthorized');
    expect(result.current.success).toBe(false);
  });

  it('maps status 500 to feedback_error_server message', async () => {
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(
      new ApiError(500, 4, 'Server Error')
    );

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('hello');
    });

    expect(result.current.error).toBe('feedback_error_server');
    expect(result.current.success).toBe(false);
  });

  it('returns feedback_error_unauthorized when jwtToken is null', async () => {
    const { result } = renderHook(() => useFeedback(null));

    await act(async () => {
      await result.current.submitFeedback('test');
    });

    expect(result.current.error).toBe('feedback_error_unauthorized');
    expect(complaiService.sendFeedback).not.toHaveBeenCalled();
  });

  it('resetState clears all state', async () => {
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(
      new ApiError(500, 4, 'Server Error')
    );

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('hello');
    });

    expect(result.current.error).toBe('feedback_error_server');

    act(() => {
      result.current.resetState();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
