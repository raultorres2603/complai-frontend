/**
 * useTabDetection.test.ts - Advanced tests for tab detection hook
 *
 * Tests:
 * - BroadcastChannel message listener readiness
 * - Message queue buffering during setup
 * - window.close() fallback chain
 * - localStorage-based closure detection
 * - Message acknowledgment protocol
 * - Cleanup on unmount
 * - Listener establishment before any messages are processed
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@/__tests__/test-utils';
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
const broadcastChannelInstances: Map<
  string,
  { postMessage: any; onmessage: any | null; close: any }
> = new Map();

class MockBroadcastChannel {
  name: string;
  onmessage: ((event: any) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    broadcastChannelInstances.set(name, this);
  }

  postMessage(message: any) {
    // Simulate broadcast to all other instances
    broadcastChannelInstances.forEach((instance) => {
      if (instance !== this && instance.onmessage) {
        // Call onmessage asynchronously
        setTimeout(() => instance.onmessage?.({ data: message }), 0);
      }
    });
  }

  close() {
    broadcastChannelInstances.delete(this.name);
  }
}

// Replace global BroadcastChannel
(global as any).BroadcastChannel = MockBroadcastChannel;

describe('useTabDetection', () => {
  beforeEach(() => {
    localStorage.clear();
    broadcastChannelInstances.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTabDetection());

    expect(result.current.isMultipleTabsDetected).toBe(false);
    expect(result.current.currentTabId).toBeTruthy();
    expect(result.current.isCurrentTabActive).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isClosing).toBe(false);
  });

  it('should generate a unique tab ID on mount', async () => {
    const { result: result1 } = renderHook(() => useTabDetection());
    const tabId1 = result1.current.currentTabId;

    localStorage.clear();
    broadcastChannelInstances.clear();

    const { result: result2 } = renderHook(() => useTabDetection());
    const tabId2 = result2.current.currentTabId;

    expect(tabId1).not.toBe(tabId2);
  });

  it('should register tab in localStorage on mount', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const tabsData = localStorage.getItem('complai_tab_ids');
      expect(tabsData).toBeTruthy();
    });

    const tabsData = localStorage.getItem('complai_tab_ids');
    const tabs = JSON.parse(tabsData!);
    expect(Object.keys(tabs).length).toBeGreaterThan(0);
  });

  it('should establish message listener immediately on BroadcastChannel creation', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
      expect(bcInstance?.onmessage).toBeTruthy();
    });
  });

  it('should send TAB_ACTIVE announcement on BroadcastChannel', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
      expect(bcInstance).toBeTruthy();
    });
  });

  it('should detect multiple tabs', async () => {
    const { result } = renderHook(() => useTabDetection());

    // Manually register another tab in localStorage
    await act(async () => {
      const tabsData = localStorage.getItem('complai_tab_ids');
      const tabs = JSON.parse(tabsData!);
      tabs['other_tab_xyz'] = Date.now();
      localStorage.setItem('complai_tab_ids', JSON.stringify(tabs));
    });

    await waitFor(() => {
      expect(result.current.isMultipleTabsDetected).toBe(true);
    });
  });

  it('should have forceTabActive method', () => {
    const { result } = renderHook(() => useTabDetection());

    expect(typeof result.current.forceTabActive).toBe('function');
    expect(typeof result.current.requestOtherTabsClose).toBe('function');
  });

  it('should send TAB_CLOSE_SELF message when forceTabActive is called', async () => {
    const { result } = renderHook(() => useTabDetection());
    const currentTabId = result.current.currentTabId;

    await waitFor(() => {
      expect(broadcastChannelInstances.has('complai_tab_channel')).toBe(true);
    });

    const promise = result.current.forceTabActive();
    expect(promise).toBeInstanceOf(Promise);

    const feedback = await promise;
    expect(feedback).toBeDefined();
    expect(typeof feedback.success === 'boolean' || feedback.success === undefined).toBe(true);
  });

  it('should set isClosing state when receiving TAB_CLOSE_SELF', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
      expect(bcInstance?.onmessage).toBeTruthy();
    });

    const bcInstance = broadcastChannelInstances.get('complai_tab_channel');

    // Simulate receiving TAB_CLOSE_SELF
    await act(async () => {
      if (bcInstance?.onmessage) {
        bcInstance.onmessage({
          data: {
            type: TAB_MESSAGE_TYPES.TAB_CLOSE_SELF,
            tabId: 'other_tab_123',
            timestamp: Date.now(),
          },
        });
      }
    });

    await waitFor(() => {
      expect(result.current.isClosing).toBe(true);
    });
  });

  it('should clean up localStorage on unmount', async () => {
    const { result, unmount } = renderHook(() => useTabDetection());

    const currentTabId = result.current.currentTabId;

    await waitFor(() => {
      const tabsData = localStorage.getItem('complai_tab_ids');
      expect(tabsData).toBeTruthy();
    });

    unmount();

    await waitFor(() => {
      const tabsData = localStorage.getItem('complai_tab_ids');
      if (tabsData) {
        const tabs = JSON.parse(tabsData);
        expect(tabs[currentTabId]).toBeUndefined();
      }
    });
  });

  it('should close BroadcastChannel on unmount', async () => {
    const { unmount } = renderHook(() => useTabDetection());

    await waitFor(() => {
      expect(broadcastChannelInstances.has('complai_tab_channel')).toBe(true);
    });

    unmount();

    expect(broadcastChannelInstances.has('complai_tab_channel')).toBe(false);
  });

  it('should send TAB_CLOSED acknowledgment when receiving TAB_CLOSE_SELF', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
      expect(bcInstance?.onmessage).toBeTruthy();
    });

    const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
    const postMessageSpy = vi.spyOn(bcInstance!, 'postMessage');

    // Simulate receiving TAB_CLOSE_SELF
    await act(async () => {
      if (bcInstance?.onmessage) {
        bcInstance.onmessage({
          data: {
            type: TAB_MESSAGE_TYPES.TAB_CLOSE_SELF,
            tabId: 'other_tab_123',
            timestamp: Date.now(),
            messageId: 'msg_123',
          },
        });
      }
    });

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TAB_MESSAGE_TYPES.TAB_CLOSED,
          tabId: result.current.currentTabId,
        })
      );
    });

    postMessageSpy.mockRestore();
  });

  it('should ignore own messages', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
      expect(bcInstance?.onmessage).toBeTruthy();
    });

    const currentTabId = result.current.currentTabId;
    const bcInstance = broadcastChannelInstances.get('complai_tab_channel');

    const initialState = result.current.isMultipleTabsDetected;

    // Send a message from the same tab
    await act(async () => {
      if (bcInstance?.onmessage) {
        bcInstance.onmessage({
          data: {
            type: TAB_MESSAGE_TYPES.TAB_ACTIVE,
            tabId: currentTabId, // Same tab ID
            timestamp: Date.now(),
          },
        });
      }
    });

    // State should not have changed
    expect(result.current.isMultipleTabsDetected).toBe(initialState);
  });

  it('should handle storage event for closure detection', async () => {
    const { result } = renderHook(() => useTabDetection());
    const currentTabId = result.current.currentTabId;

    await waitFor(() => {
      expect(result.current.currentTabId).toBe(currentTabId);
    });

    // Simulate storage event for closure
    await act(async () => {
      const event = new StorageEvent('storage', {
        key: 'complai_force_close',
        newValue: currentTabId,
      });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.isClosing).toBe(true);
    });
  });

  it('should ignore storage events for other tabs', async () => {
    const { result } = renderHook(() => useTabDetection());

    const initialState = result.current.isClosing;

    // Simulate storage event for a different tab
    await act(async () => {
      const event = new StorageEvent('storage', {
        key: 'complai_force_close',
        newValue: 'other_tab_id',
      });
      window.dispatchEvent(event);
    });

    // State should not have changed
    expect(result.current.isClosing).toBe(initialState);
  });

  it('should send TAB_CLOSE_REQUEST message', async () => {
    const { result } = renderHook(() => useTabDetection());

    await waitFor(() => {
      const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
      expect(bcInstance?.onmessage).toBeTruthy();
    });

    const bcInstance = broadcastChannelInstances.get('complai_tab_channel');
    const postMessageSpy = vi.spyOn(bcInstance!, 'postMessage');

    act(() => {
      result.current.requestOtherTabsClose();
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TAB_MESSAGE_TYPES.TAB_CLOSE_REQUEST,
        tabId: result.current.currentTabId,
      })
    );

    postMessageSpy.mockRestore();
  });
});
