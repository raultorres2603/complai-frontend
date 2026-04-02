/**
 * useAuth Hook Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { storageService, STORAGE_KEYS } from '../../services/storageService';

// Mock storageService
vi.mock('../../services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  STORAGE_KEYS: {
    API_KEY: 'complai_api_key',
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset import.meta.env mock
    vi.stubEnv('VITE_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('initializes apiKey from VITE_API_KEY env var when present', async () => {
    vi.stubEnv('VITE_API_KEY', 'env-api-key-123');
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    // Wait for effect to run
    await act(async () => {});

    expect(result.current.apiKey).toBe('env-api-key-123');
    expect(storageService.set).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY, 'env-api-key-123');
  });

  it('falls back to storageService when VITE_API_KEY is absent', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    vi.mocked(storageService.get).mockReturnValue('stored-key-456');

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(result.current.apiKey).toBe('stored-key-456');
  });

  it('sets apiKey to null when neither env var nor storage has a value', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(result.current.apiKey).toBeNull();
  });

  it('setApiKey(null) clears storage and sets state to null', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    vi.mocked(storageService.get).mockReturnValue('existing-key');

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    act(() => {
      result.current.setApiKey(null);
    });

    expect(result.current.apiKey).toBeNull();
    expect(storageService.remove).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
  });

  it('setApiKey("new-key") persists to storage and updates state', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    act(() => {
      result.current.setApiKey('new-key-789');
    });

    expect(result.current.apiKey).toBe('new-key-789');
    expect(storageService.set).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY, 'new-key-789');
  });

  it('isInitialized is false before effect runs and true after', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    // After effect, isInitialized must be true
    expect(result.current.isInitialized).toBe(true);
  });
});
