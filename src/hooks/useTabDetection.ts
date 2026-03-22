/**
 * useTabDetection Hook - Detects and manages multiple browser tabs
 * Enforces single-tab security policy per device
 */

import { useEffect, useState, useRef } from 'react';

const TAB_ID_KEY = 'complai_tab_ids'; // localStorage key storing all active tab IDs
const CHANNEL_NAME = 'complai_tab_channel';
const HEARTBEAT_INTERVAL = 500; // Check every 500ms for other tabs
const TAB_EXPIRY_TIME = 2000; // Consider tab dead after 2 seconds without heartbeat

interface TabDetectionState {
  isMultipleTabsDetected: boolean;
  currentTabId: string;
  isCurrentTabActive: boolean;
  error: string | null;
}

interface TabEntry {
  id: string;
  timestamp: number;
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
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tab detection on mount
  useEffect(() => {
    // Generate unique tab ID
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    tabIdRef.current = tabId;

    setState((prev) => ({
      ...prev,
      currentTabId: tabId,
      isCurrentTabActive: true,
    }));

    // Register this tab in localStorage
    const registerTab = () => {
      try {
        const tabsData = localStorage.getItem(TAB_ID_KEY);
        const tabs: Record<string, number> = tabsData ? JSON.parse(tabsData) : {};
        
        // Add/update this tab
        tabs[tabId] = Date.now();
        
        // Remove expired tabs (no heartbeat for TAB_EXPIRY_TIME)
        const now = Date.now();
        Object.keys(tabs).forEach((id) => {
          if (now - tabs[id] > TAB_EXPIRY_TIME) {
            delete tabs[id];
          }
        });

        localStorage.setItem(TAB_ID_KEY, JSON.stringify(tabs));
        
        // Check if other tabs exist
        const otherTabs = Object.keys(tabs).filter((id) => id !== tabId);
        if (otherTabs.length > 0) {
          setState((prev) => ({
            ...prev,
            isMultipleTabsDetected: true,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isMultipleTabsDetected: false,
          }));
        }
      } catch (e) {
        console.warn('Failed to register tab in localStorage:', e);
      }
    };

    // Heartbeat: Register this tab every 500ms
    heartbeatIntervalRef.current = setInterval(registerTab, HEARTBEAT_INTERVAL);
    registerTab(); // Initial registration

    // Try to use BroadcastChannel as well (preferred modern API)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        broadcastChannelRef.current = channel;

        // Announce this tab
        channel.postMessage({
          type: 'TAB_ACTIVE',
          tabId: tabId,
          timestamp: Date.now(),
        });

        // Listen for messages from other tabs
        channel.onmessage = (event) => {
          const { type, tabId: otherTabId } = event.data;

          if (type === 'TAB_ACTIVE' && otherTabId !== tabId) {
            // Another tab announced itself
            setState((prev) => ({
              ...prev,
              isMultipleTabsDetected: true,
            }));
          } else if (type === 'TAB_CLOSE_SELF') {
            // This tab was requested to close itself
            console.log('Closing tab due to another tab taking over');
            // Give a brief moment for state updates, then close
            setTimeout(() => {
              window.close();
            }, 100);
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
        console.warn('BroadcastChannel not available, using localStorage fallback:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Close BroadcastChannel if open
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }

      // Remove this tab from localStorage
      try {
        const tabsData = localStorage.getItem(TAB_ID_KEY);
        if (tabsData) {
          const tabs: Record<string, number> = JSON.parse(tabsData);
          delete tabs[tabId];
          if (Object.keys(tabs).length > 0) {
            localStorage.setItem(TAB_ID_KEY, JSON.stringify(tabs));
          } else {
            localStorage.removeItem(TAB_ID_KEY);
          }
        }
      } catch (e) {
        console.warn('Failed to clean up tab from localStorage:', e);
      }
    };
  }, []);

  /**
   * Force this tab to be the active one and close all other tabs of this app
   */
  const forceTabActive = () => {
    setState((prev) => ({
      ...prev,
      isCurrentTabActive: true,
      isMultipleTabsDetected: false,
    }));

    try {
      // Clear other tabs' registrations, keep only this one
      const tabId = tabIdRef.current;
      localStorage.setItem(TAB_ID_KEY, JSON.stringify({ [tabId]: Date.now() }));
    } catch (e) {
      console.warn('Failed to force tab active:', e);
    }

    // Send close message to all other tabs of the same app
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'TAB_CLOSE_SELF',
        tabId: tabIdRef.current,
        timestamp: Date.now(),
      });
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
