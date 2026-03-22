/**
 * useTabDetection.test.ts - Unit tests for tab detection hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabDetection } from './useTabDetection';

describe('useTabDetection', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
    // Mock BroadcastChannel if not available
    if (typeof BroadcastChannel === 'undefined') {
      (global as any).BroadcastChannel = vi.fn(() => ({
        postMessage: vi.fn(),
        close: vi.fn(),
        onmessage: null,
      }));
    }
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should initialize with no multiple tabs detected', () => {
    const { result } = renderHook(() => useTabDetection());

    expect(result.current.isMultipleTabsDetected).toBe(false);
    expect(result.current.currentTabId).toBeTruthy();
  });

  it('should generate a unique tab ID on mount', () => {
    const { result: result1 } = renderHook(() => useTabDetection());
    sessionStorage.clear(); // Clear to simulate new tab
    const { result: result2 } = renderHook(() => useTabDetection());

    expect(result1.current.currentTabId).not.toBe(result2.current.currentTabId);
  });

  it('should reuse same tab ID if existing in session storage', () => {
    const { result: result1 } = renderHook(() => useTabDetection());
    const tabId1 = result1.current.currentTabId;

    // Don't clear sessionStorage, simulate same tab
    const { result: result2 } = renderHook(() => useTabDetection());
    const tabId2 = result2.current.currentTabId;

    expect(tabId1).toBe(tabId2);
  });

  it('should provide forceTabActive method', () => {
    const { result } = renderHook(() => useTabDetection());

    expect(typeof result.current.forceTabActive).toBe('function');
    expect(typeof result.current.requestOtherTabsClose).toBe('function');
  });

  it('should handle multiple tab detection via storage events fallback', () => {
    const { result } = renderHook(() => useTabDetection());

    // Simulate storage change from another tab
    const event = new StorageEvent('storage', {
      key: 'complai_tab_active',
      newValue: 'different_tab_id',
      oldValue: null,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isMultipleTabsDetected).toBe(true);
  });
});
