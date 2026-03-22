/**
 * useTabDetection Hook - Detects and manages multiple browser tabs
 * Enforces single-tab security policy per device
 *
 * Features:
 * - BroadcastChannel-based communication with listener safety
 * - Message queue to handle early messages
 * - window.close() with fallback chain (localStorage, about:blank, hide)
 * - localStorage-based closure detection
 * - Message acknowledgment protocol
 * - Comprehensive error handling and logging
 */

import { useEffect, useState, useRef, useCallback } from 'react';

// Message types for tab communication
export const TAB_MESSAGE_TYPES = {
  TAB_ACTIVE: 'TAB_ACTIVE',
  TAB_CLOSE_SELF: 'TAB_CLOSE_SELF',
  TAB_CLOSED: 'TAB_CLOSED',
  TAB_CLOSE_REQUEST: 'TAB_CLOSE_REQUEST',
} as const;

// localStorage keys
const TAB_ID_KEY = 'complai_tab_ids';
const FORCE_CLOSE_KEY = 'complai_force_close';
const CLOSING_TABS_KEY = 'complai_closing_tabs';

// Channel name for BroadcastChannel
const CHANNEL_NAME = 'complai_tab_channel';

// Timing constants
const HEARTBEAT_INTERVAL = 500; // Check every 500ms for other tabs
const TAB_EXPIRY_TIME = 2000; // Consider tab dead after 2 seconds without heartbeat
const MESSAGE_ACK_TIMEOUT = 2000; // Timeout for message acknowledgment
const CLOSURE_TIMEOUT = 3000; // Force closure after 3 seconds
const DEBUG = false; // Set to true for verbose logging

interface TabDetectionState {
  isMultipleTabsDetected: boolean;
  currentTabId: string;
  isCurrentTabActive: boolean;
  error: string | null;
  isClosing: boolean;
}

interface TabMessage {
  type: string;
  tabId: string;
  timestamp: number;
  messageId?: string;
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
    isClosing: false,
  });

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string>('');
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<TabMessage[]>([]);
  const messageListenerReadyRef = useRef<boolean>(false);
  const closingTabsRef = useRef<Set<string>>(new Set());

  /**
   * Log function with conditional debug output
   */
  const log = useCallback((message: string, data?: unknown) => {
    const prefix = `[TabDetection:${tabIdRef.current.substring(0, 8)}]`;
    if (DEBUG) {
      console.log(prefix, message, data);
    }
  }, []);

  /**
   * Error logging function
   */
  const logError = useCallback((operation: string, error: unknown) => {
    const prefix = `[TabDetection:${tabIdRef.current.substring(0, 8)}]`;
    console.error(`${prefix} ${operation}:`, error);
  }, []);

  /**
   * Attempt to close the window with fallback chain
   */
  const attemptWindowClose = useCallback(async (): Promise<boolean> => {
    const tabId = tabIdRef.current;
    log('Attempting window.close()');

    // Fallback 1: Try window.close()
    try {
      window.close();
      log('window.close() succeeded');
      return true;
    } catch (e) {
      logError('window.close() failed', e);
    }

    // Fallback 2: Set localStorage flag for storage event listener
    try {
      localStorage.setItem(FORCE_CLOSE_KEY, tabId);
      log('Set localStorage fallback flag');
      // Small delay to allow listener to pick it up
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (e) {
      logError('localStorage fallback failed', e);
    }

    // Fallback 3: Navigate to about:blank
    try {
      window.location.href = 'about:blank';
      log('Navigated to about:blank');
      return true;
    } catch (e) {
      logError('Navigation to about:blank failed', e);
    }

    // Fallback 4: Hide the page
    try {
      if (document.body) {
        document.body.innerHTML = '';
        document.body.style.opacity = '0';
        document.body.style.visibility = 'hidden';
      }
      log('Hidden page content');
      return true;
    } catch (e) {
      logError('Page hiding failed', e);
    }

    return false;
  }, [log, logError]);

  /**
   * Process message queue when listener is ready
   */
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) {
      return;
    }

    log(`Processing ${messageQueueRef.current.length} buffered messages`);
    const queue = [...messageQueueRef.current];
    messageQueueRef.current = [];

    queue.forEach((message) => {
      log('Processing queued message', { type: message.type, tabId: message.tabId });
      handleTabMessage(message);
    });
  }, [log]);

  /**
   * Handle incoming tab messages
   */
  const handleTabMessage = useCallback(
    (message: TabMessage) => {
      const { type, tabId: otherTabId } = message;

      if (otherTabId === tabIdRef.current) {
        return; // Ignore own messages
      }

      log('Received message', { type, fromTabId: otherTabId.substring(0, 8) });

      if (type === TAB_MESSAGE_TYPES.TAB_ACTIVE && otherTabId !== tabIdRef.current) {
        // Another tab announced itself
        setState((prev) => ({
          ...prev,
          isMultipleTabsDetected: true,
        }));
      } else if (type === TAB_MESSAGE_TYPES.TAB_CLOSE_SELF) {
        // This tab was requested to close itself
        log('Received TAB_CLOSE_SELF, initiating closure');
        setState((prev) => ({
          ...prev,
          isClosing: true,
        }));

        // Try to close the window
        attemptWindowClose().then((success) => {
          if (success) {
            log('Window close initiated successfully');
          } else {
            logError('attemptWindowClose', 'All fallbacks exhausted, tab still open');
          }
        });

        // Send acknowledgment back to the requesting tab
        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({
              type: TAB_MESSAGE_TYPES.TAB_CLOSED,
              tabId: tabIdRef.current,
              timestamp: Date.now(),
              messageId: message.messageId,
            });
            log('Sent TAB_CLOSED acknowledgment');
          } catch (e) {
            logError('Failed to send TAB_CLOSED acknowledgment', e);
          }
        }
      } else if (type === TAB_MESSAGE_TYPES.TAB_CLOSED) {
        // Tab acknowledged closure
        log('Received TAB_CLOSED acknowledgment', { fromTabId: otherTabId.substring(0, 8) });
        closingTabsRef.current.delete(otherTabId);
      }
    },
    [log, logError, attemptWindowClose]
  );

  /**
   * Setup BroadcastChannel with message queue safety
   */
  const setupBroadcastChannel = useCallback(() => {
    if (typeof BroadcastChannel === 'undefined') {
      logError('setupBroadcastChannel', 'BroadcastChannel not available');
      return false;
    }

    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannelRef.current = channel;
      log('BroadcastChannel created');

      // CRITICAL: Set up listener IMMEDIATELY before any messages are processed
      channel.onmessage = (event) => {
        if (!messageListenerReadyRef.current) {
          // Buffer early messages
          log('Buffering early message before listener ready');
          messageQueueRef.current.push(event.data);
        } else {
          // Process message immediately
          handleTabMessage(event.data);
        }
      };

      // Mark listener as ready
      messageListenerReadyRef.current = true;
      log('Message listener established');

      // Process any buffered messages
      processMessageQueue();

      // Announce this tab
      try {
        channel.postMessage({
          type: TAB_MESSAGE_TYPES.TAB_ACTIVE,
          tabId: tabIdRef.current,
          timestamp: Date.now(),
        });
        log('Announced TAB_ACTIVE');
      } catch (e) {
        logError('Failed to announce TAB_ACTIVE', e);
      }

      return true;
    } catch (error) {
      logError('setupBroadcastChannel', error);
      return false;
    }
  }, [log, logError, handleTabMessage, processMessageQueue]);

  /**
   * Setup localStorage fallback closure detection
   */
  const setupStorageListener = useCallback(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === FORCE_CLOSE_KEY && event.newValue !== null) {
        // Another tab set the force close flag
        log('Storage change detected for FORCE_CLOSE_KEY', { value: event.newValue });
        if (event.newValue !== tabIdRef.current) {
          // This is for a different tab, not us
          return;
        }

        log('Closing due to storage event');
        setState((prev) => ({
          ...prev,
          isClosing: true,
        }));

        attemptWindowClose().then((success) => {
          if (success) {
            log('Window closed via storage fallback');
          }
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    log('Storage event listener attached');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      log('Storage event listener removed');
    };
  }, [log, attemptWindowClose]);

  /**
   * Setup beforeunload cleanup
   */
  const setupBeforeUnload = useCallback(() => {
    const handleBeforeUnload = () => {
      // Clean up localStorage
      try {
        const tabsData = localStorage.getItem(TAB_ID_KEY);
        if (tabsData) {
          const tabs: Record<string, number> = JSON.parse(tabsData);
          delete tabs[tabIdRef.current];
          if (Object.keys(tabs).length > 0) {
            localStorage.setItem(TAB_ID_KEY, JSON.stringify(tabs));
          } else {
            localStorage.removeItem(TAB_ID_KEY);
          }
        }

        // Clean up force close flag
        const forceClose = localStorage.getItem(FORCE_CLOSE_KEY);
        if (forceClose === tabIdRef.current) {
          localStorage.removeItem(FORCE_CLOSE_KEY);
        }

        log('Cleaned up localStorage on beforeunload');
      } catch (e) {
        logError('beforeunload cleanup', e);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    log('beforeunload listener attached');

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [log, logError]);

  // Initialize tab detection on mount
  useEffect(() => {
    // Generate unique tab ID
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    tabIdRef.current = tabId;

    log('Tab initialized', { tabId });

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
            log('Removed expired tab', { tabId: id });
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
          log('Multiple tabs detected', { count: otherTabs.length });
        } else {
          setState((prev) => ({
            ...prev,
            isMultipleTabsDetected: false,
          }));
        }
      } catch (e) {
        logError('registerTab', e);
      }
    };

    // Heartbeat: Register this tab every 500ms
    heartbeatIntervalRef.current = setInterval(registerTab, HEARTBEAT_INTERVAL);
    registerTab(); // Initial registration

    // Setup BroadcastChannel
    setupBroadcastChannel();

    // Setup storage listener for fallback
    const removeStorageListener = setupStorageListener();

    // Setup beforeunload cleanup
    const removeBeforeUnloadListener = setupBeforeUnload();

    // Cleanup on unmount
    return () => {
      log('Unmounting useTabDetection');

      // Clear close timeout if pending
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Close BroadcastChannel if open
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.close();
          broadcastChannelRef.current = null;
        } catch (e) {
          logError('BroadcastChannel.close()', e);
        }
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
        logError('localStorage cleanup', e);
      }

      // Remove storage listener
      removeStorageListener();

      // Remove beforeunload listener
      removeBeforeUnloadListener();
    };
  }, [setupBroadcastChannel, setupStorageListener, setupBeforeUnload, log, logError]);

  /**
   * Force this tab to be the active one and close all other tabs of this app
   */
  const forceTabActive = useCallback(() => {
    const tabId = tabIdRef.current;
    log('forceTabActive called');

    setState((prev) => ({
      ...prev,
      isCurrentTabActive: true,
      isMultipleTabsDetected: false,
    }));

    try {
      // Clear other tabs' registrations, keep only this one
      localStorage.setItem(TAB_ID_KEY, JSON.stringify({ [tabId]: Date.now() }));
      log('Cleared other tabs from localStorage');
    } catch (e) {
      logError('localStorage update in forceTabActive', e);
    }

    // Send close message to all other tabs of the same app
    if (broadcastChannelRef.current) {
      const messageId = `msg_${Date.now()}`;
      try {
        broadcastChannelRef.current.postMessage({
          type: TAB_MESSAGE_TYPES.TAB_CLOSE_SELF,
          tabId: tabId,
          timestamp: Date.now(),
          messageId: messageId,
        });
        log('Sent TAB_CLOSE_SELF message', { messageId });
        closingTabsRef.current.add(messageId);

        // Set timeout to forcefully clean up if acknowledgments don't arrive
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = setTimeout(() => {
          log('Message acknowledgment timeout, clearing closing tabs');
          closingTabsRef.current.clear();
        }, MESSAGE_ACK_TIMEOUT);
      } catch (e) {
        logError('Failed to send TAB_CLOSE_SELF message', e);
      }
    }
  }, [log, logError]);

  /**
   * Request other tabs to close (non-forceful)
   */
  const requestOtherTabsClose = useCallback(() => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: TAB_MESSAGE_TYPES.TAB_CLOSE_REQUEST,
          tabId: tabIdRef.current,
          timestamp: Date.now(),
        });
        log('Sent TAB_CLOSE_REQUEST');
      } catch (e) {
        logError('Failed to send TAB_CLOSE_REQUEST', e);
      }
    }
  }, [log, logError]);

  return {
    ...state,
    forceTabActive,
    requestOtherTabsClose,
  };
}
