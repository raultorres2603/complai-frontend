/**
 * useAccessibility Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@/__tests__/test-utils';
import { useAccessibility } from '../useAccessibility';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '../types/accessibility.types';

describe('useAccessibility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    localStorage.clear();
    document.body.className = '';
  });

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.settings).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
  });

  it('should load settings from localStorage on mount', () => {
    const savedSettings = {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      colorBlindnessType: 'deuteranopia' as const,
      ttsEnabled: true,
    };

    localStorage.setItem('complai_accessibility', JSON.stringify(savedSettings));

    const { result } = renderHook(() => useAccessibility());

    // May need to wait a tick for state to update
    expect(result.current.settings.colorBlindnessType).toBe('deuteranopia');
    expect(result.current.settings.ttsEnabled).toBe(true);
  });

  it('should persist settings to localStorage when updateSettings is called', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.updateSettings({ colorBlindnessType: 'protanopia' });
    });

    const stored = localStorage.getItem('complai_accessibility');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.colorBlindnessType).toBe('protanopia');
  });

  it('should update multiple settings at once', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.updateSettings({
        colorBlindnessType: 'tritanopia',
        ttsEnabled: true,
        ttsRate: 1.5,
      });
    });

    expect(result.current.settings.colorBlindnessType).toBe('tritanopia');
    expect(result.current.settings.ttsEnabled).toBe(true);
    expect(result.current.settings.ttsRate).toBe(1.5);
  });

  it('should apply color filter class to document.body', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.applyColorFilter('deuteranopia');
    });

    expect(document.body.classList.contains('filter-deuteranopia')).toBe(true);
    expect(document.body.classList.contains('filter-normal')).toBe(false);
  });

  it('should apply normal filter (no filter) when setting normal', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.applyColorFilter('deuteranopia');
    });

    expect(document.body.classList.contains('filter-deuteranopia')).toBe(true);

    act(() => {
      result.current.applyColorFilter('normal');
    });

    expect(document.body.classList.contains('filter-normal')).toBe(true);
    expect(document.body.classList.contains('filter-deuteranopia')).toBe(false);
  });

  it('should remove old filter classes when applying a new one', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.applyColorFilter('deuteranopia');
    });

    expect(document.body.classList.contains('filter-deuteranopia')).toBe(true);

    act(() => {
      result.current.applyColorFilter('protanopia');
    });

    expect(document.body.classList.contains('filter-protanopia')).toBe(true);
    expect(document.body.classList.contains('filter-deuteranopia')).toBe(false);
  });

  it('should handle localStorage unavailable gracefully', () => {
    // Mock localStorage to throw error
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(() => {
          throw new Error('localStorage disabled');
        }),
        setItem: vi.fn(() => {
          throw new Error('localStorage disabled');
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    const { result } = renderHook(() => useAccessibility());

    // Should still initialize with defaults
    expect(result.current.settings).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
    expect(result.current.isLocalStorageAvailable).toBe(false);

    // Restore localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('should apply color filter on settings change', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.updateSettings({ colorBlindnessType: 'tritanopia' });
    });

    // Filter should be applied automatically
    expect(document.body.classList.contains('filter-tritanopia')).toBe(true);
  });

  it('should support all color blindness types', () => {
    const { result } = renderHook(() => useAccessibility());
    const types = ['normal', 'deuteranopia', 'protanopia', 'tritanopia'] as const;

    types.forEach((type) => {
      act(() => {
        result.current.applyColorFilter(type);
      });

      expect(document.body.classList.contains(`filter-${type}`)).toBe(true);
    });
  });
});
