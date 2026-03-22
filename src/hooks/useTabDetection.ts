/**
 * useTabDetection Hook - Detects and manages multiple browser tabs
 * Enforces single-tab security policy per device
 */

import { useEffect, useState, useRef } from 'react';

const TAB_ID_KEY = 'complai_tab_id';
const TAB_ACTIVE_KEY = 'complai_tab_active';
const CHANNEL_NAME = 'complai_tab_channel';

interface TabDetectionState {
  isMultipleTabsDetected: boolean;
  currentTabId: string;
  isCurrentTabActive: boolean;
  error: string | null;
}

/**
 * Hook to detect and manage single-tab enforcement
 * Returns state and allows forcing current tab to be active
 */
export function useTabDetection() {
  const [state, setState] = useState<TabDetectionState>({
    isMultipleTabsDetected: false,
    currentTabId: '',
    isCurrentTabActive: true,
    error: null,
  });

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string>('');

  // Initialize tab detection on mount
  useEffect(() => {
    // Generate unique tab ID if not exists
    let tabId = sessionStorage.getItem(TAB_ID_KEY);
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(TAB_ID_KEY, tabId);
    }
    tabIdRef.current = tabId;

    setState((prev) => ({
      ...prev,
      currentTabId: tabId,
      isCurrentTabActive: true,
    }));

    // Try to use BroadcastChannel (preferred modern API)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        broadcastChannelRef.current = channel;

        // Announce this tab is active
        channel.postMessage({
          type: 'TAB_ACTIVE',
          tabId: tabId,
          timestamp: Date.now(),
        });

        // Listen for messages from other tabs
        channel.onmessage = (event) => {
          const { type, tabId: otherTabId, timestamp } = event.data;

          if (type === 'TAB_ACTIVE') {
            // Another tab is trying to be active
            if (otherTabId !== tabId) {
              // Another tab exists - mark as multiple tabs detected
              setState((prev) => ({
                ...prev,
                isMultipleTabsDetected: true,
              }));
            }
          } else if (type === 'TAB_CLOSED') {
            // Another tab was closed - check if we're the only one left
            // Re-announce this tab as active
            channel.postMessage({
              type: 'TAB_ACTIVE',
              tabId: tabId,
              timestamp: Date.now(),
            });
          }
        };

        return () => {
          // Announce this tab is closing
          channel.postMessage({
            type: 'TAB_CLOSED',
            tabId: tabId,
            timestamp: Date.now(),
          });
          channel.close();
          broadcastChannelRef.current = null;
        };
      } catch (error) {
        console.warn('BroadcastChannel not available, falling back to storage events', error);
        setState((prev) => ({
          ...prev,
          error: 'BroadcastChannel initialization warning',
        }));
      }
    } else {
      // Fallback: use storage events for older browsers
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === TAB_ACTIVE_KEY) {
          const otherTabId = e.newValue;
          if (otherTabId && otherTabId !== tabId) {
            setState((prev) => ({
              ...prev,
              isMultipleTabsDetected: true,
            }));
          }
        }
      };

      // Mark this tab as active periodically
      const heartbeatInterval = setInterval(() => {
        sessionStorage.setItem(TAB_ACTIVE_KEY, tabId);
      }, 1000);

      window.addEventListener('storage', handleStorageChange);

      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('storage', handleStorageChange);
        sessionStorage.removeItem(TAB_ACTIVE_KEY);
      };
    }
  }, []);

  /**
   * Force this tab to be the active one (requires user interaction)
   */
  const forceTabActive = () => {
    setState((prev) => ({
      ...prev,
      isCurrentTabActive: true,
      isMultipleTabsDetected: false,
    }));

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'TAB_FORCE_ACTIVE',
        tabId: tabIdRef.current,
        timestamp: Date.now(),
      });
    } else {
      sessionStorage.setItem(TAB_ACTIVE_KEY, tabIdRef.current);
    }
  };

  /**
   * Close other tabs (request only - tabs decide to close)
   */
  const requestOtherTabsClose = () => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'TAB_CLOSE_REQUEST',
        tabId: tabIdRef.current,
        timestamp: Date.now(),
      });
    }
  };

  return {
    ...state,
    forceTabActive,
    requestOtherTabsClose,
  };
}
