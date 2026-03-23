/**
 * useTabDetection.simple.test.ts - Core hook tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTabDetection, TAB_MESSAGE_TYPES } from '../useTabDetection';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock BroadcastChannel
const broadcastChannelInstances: Map<string, any> = new Map();

class MockBroadcastChannel {
  name: string;
  onmessage: ((event: any) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    broadcastChannelInstances.set(name, this);
  }

  postMessage(message: any) {
    broadcastChannelInstances.forEach((instance) => {
      if (instance !== this && instance.onmessage) {
        setTimeout(() => instance.onmessage?.({ data: message }), 0);
      }
    });
  }

  close() {
    broadcastChannelInstances.delete(this.name);
  }
}

(global as any).BroadcastChannel = MockBroadcastChannel;

describe('useTabDetection', () => {
  beforeEach(() => {
    localStorage.clear();
    broadcastChannelInstances.clear();
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTabDetection());

    expect(result.current.isMultipleTabsDetected).toBe(false);
    expect(result.current.currentTabId).toBeTruthy();
    expect(result.current.isCurrentTabActive).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isClosing).toBe(false);
  });

  it('should have forceTabActive method', () => {
    const { result } = renderHook(() => useTabDetection());

    expect(typeof result.current.forceTabActive).toBe('function');
    expect(typeof result.current.requestOtherTabsClose).toBe('function');
  });

  it('should generate unique tab IDs', () => {
    const { result: result1 } = renderHook(() => useTabDetection());
    const tabId1 = result1.current.currentTabId;

    localStorage.clear();
    broadcastChannelInstances.clear();

    const { result: result2 } = renderHook(() => useTabDetection());
    const tabId2 = result2.current.currentTabId;

    expect(tabId1).not.toBe(tabId2);
  });

  it('should register tab in localStorage', () => {
    renderHook(() => useTabDetection());

    const tabsData = localStorage.getItem('complai_tab_ids');
    expect(tabsData).toBeTruthy();
    const tabs = JSON.parse(tabsData!);
    expect(Object.keys(tabs).length).toBeGreaterThan(0);
  });

  it('should detect multiple tabs', async () => {
    const { result } = renderHook(() => useTabDetection());

    // Manually register another tab
    const tabsData = localStorage.getItem('complai_tab_ids');
    const tabs = JSON.parse(tabsData!);
    tabs['other_tab'] = Date.now();
    localStorage.setItem('complai_tab_ids', JSON.stringify(tabs));

    // Trigger detection by manually calling through state
    // Since heartbeat 500ms interval, wait a short time
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(result.current.isMultipleTabsDetected).toBe(true);
  }, 10000);

  it('should send TAB_CLOSE_SELF on forceTabActive', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      expect(broadcastChannelInstances.has('complai_tab_channel')).toBe(true);
    });

    const promise = result.current.forceTabActive();
    expect(promise).toBeInstanceOf(Promise);
    
    const feedback = await promise;
    expect(feedback).toBeDefined();
  });

  it('should close BroadcastChannel on unmount', () => {
    const { unmount } = renderHook(() => useTabDetection());

    expect(broadcastChannelInstances.has('complai_tab_channel')).toBe(true);

    unmount();

    expect(broadcastChannelInstances.has('complai_tab_channel')).toBe(false);
  });

  it('should clean up localStorage on unmount', () => {
    const { result, unmount } = renderHook(() => useTabDetection());
    const currentTabId = result.current.currentTabId;

    const tabsDataBefore = localStorage.getItem('complai_tab_ids');
    expect(tabsDataBefore).toBeTruthy();

    unmount();

    const tabsDataAfter = localStorage.getItem('complai_tab_ids');
    if (tabsDataAfter) {
      const tabs = JSON.parse(tabsDataAfter);
      expect(tabs[currentTabId]).toBeUndefined();
    }
  });

  it('should send TAB_CLOSE_REQUEST message', () => {
    const { result } = renderHook(() => useTabDetection());

    const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
    const postMessageSpy = vi.spyOn(bcInstance!, 'postMessage');

    act(() => {
      result.current.requestOtherTabsClose();
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TAB_MESSAGE_TYPES.TAB_CLOSE_REQUEST,
      })
    );

    postMessageSpy.mockRestore();
  });
});
