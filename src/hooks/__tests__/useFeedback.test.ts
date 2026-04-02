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

vi.mock('../useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../services/errorService', () => ({
  parseOpenRouterError: vi.fn((error) => ({
    code: (error as any).errorCode || 5,
    message: (error as any).message || 'An error occurred',
    isRetryable: true,
    originalError: error,
  })),
}));

// Import mocked modules for assertions
import { complaiService, ApiError } from '../../services/apiService';
import { parseOpenRouterError } from '../../services/errorService';

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets success=true on resolved sendFeedback', async () => {
    vi.mocked(complaiService.sendFeedback).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(complaiService.sendFeedback).toHaveBeenCalledWith('Alice', 'user-123', 'hello', 'test-token');
  });

  it('isLoading is true during async call', async () => {
    let resolvePromise!: () => void;
    const deferred = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(complaiService.sendFeedback).mockReturnValueOnce(deferred);

    const { result } = renderHook(() => useFeedback('test-token'));

    act(() => {
      result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise();
      await deferred;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('sets error when idUser is empty', async () => {
    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('', 'Alice', 'hello');
    });

    expect(result.current.error).toBe('feedback_error_validation');
    expect(complaiService.sendFeedback).not.toHaveBeenCalled();
  });

  it('sets error when userName is empty', async () => {
    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', '', 'hello');
    });

    expect(result.current.error).toBe('feedback_error_validation');
    expect(complaiService.sendFeedback).not.toHaveBeenCalled();
  });

  it('sets error when message is empty', async () => {
    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', '');
    });

    expect(result.current.error).toBe('feedback_error_validation');
    expect(complaiService.sendFeedback).not.toHaveBeenCalled();
  });

  it('uses parseOpenRouterError to parse errors', async () => {
    const mockError = new ApiError(400, 2, 'Bad Request');
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(parseOpenRouterError).toHaveBeenCalledWith(mockError);
  });

  it('sets error message from parseOpenRouterError result', async () => {
    const mockError = new ApiError(400, 2, 'Bad Request');
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(mockError);
    vi.mocked(parseOpenRouterError).mockReturnValueOnce({
      code: 2,
      message: 'Your request could not be processed. Please check your input and try again.',
      isRetryable: true,
      originalError: mockError,
    });

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.error).toBe('Your request could not be processed. Please check your input and try again.');
    expect(result.current.success).toBe(false);
  });

  it('handles rate limit errors via error service', async () => {
    const mockError = new ApiError(429, 6, 'Rate limit exceeded');
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(mockError);
    vi.mocked(parseOpenRouterError).mockReturnValueOnce({
      code: 6,
      message: 'You\'ve sent too many requests. Please wait a moment before trying again.',
      isRetryable: true,
      originalError: mockError,
    });

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.error).toBe('You\'ve sent too many requests. Please wait a moment before trying again.');
  });

  it('handles authentication errors via error service', async () => {
    const mockError = new ApiError(401, 8, 'Unauthorized');
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(mockError);
    vi.mocked(parseOpenRouterError).mockReturnValueOnce({
      code: 8,
      message: 'Authentication required. Please log in.',
      isRetryable: false,
      originalError: mockError,
    });

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.error).toBe('Authentication required. Please log in.');
  });

  it('handles service unavailable errors via error service', async () => {
    const mockError = new ApiError(503, 10, 'Service Unavailable');
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(mockError);
    vi.mocked(parseOpenRouterError).mockReturnValueOnce({
      code: 10,
      message: 'The service is temporarily unavailable. Please try again in a few moments.',
      isRetryable: true,
      originalError: mockError,
    });

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.error).toBe('The service is temporarily unavailable. Please try again in a few moments.');
  });

  it('returns error when apiKey is null', async () => {
    const { result } = renderHook(() => useFeedback(null));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.error).toBe('feedback_error_unauthorized');
    expect(complaiService.sendFeedback).not.toHaveBeenCalled();
  });

  it('resetState clears all state', async () => {
    const mockError = new ApiError(500, 4, 'Server Error');
    vi.mocked(complaiService.sendFeedback).mockRejectedValueOnce(mockError);
    vi.mocked(parseOpenRouterError).mockReturnValueOnce({
      code: 4,
      message: 'An unexpected error occurred.',
      isRetryable: true,
      originalError: mockError,
    });

    const { result } = renderHook(() => useFeedback('test-token'));

    await act(async () => {
      await result.current.submitFeedback('user-123', 'Alice', 'hello');
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.resetState();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
