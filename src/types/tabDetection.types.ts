/**
 * Tab Detection & Closure Message Types
 * Defines types for tab communication, closure acknowledgments, and state tracking
 */

/**
 * Tab message types for inter-tab communication via BroadcastChannel
 * [REVISED] Uses const-as-const pattern instead of enum for erasableSyntaxOnly compatibility
 */
export const TabMessageType = {
  TAB_ACTIVE: 'TAB_ACTIVE',
  TAB_CLOSE_SELF: 'TAB_CLOSE_SELF',
  TAB_CLOSED: 'TAB_CLOSED',
  TAB_CLOSURE_ACK: 'TAB_CLOSURE_ACK',
  TAB_CLOSE_REQUEST: 'TAB_CLOSE_REQUEST',
} as const;

export type TabMessageType = typeof TabMessageType[keyof typeof TabMessageType];

/**
 * Base tab message structure
 */
export interface TabMessage {
  type: string;
  tabId: string;
  timestamp: number;
  messageId?: string;
}

/**
 * Tab closure acknowledgment message sent by a tab being closed
 * Sent from closing tab back to requesting tab to confirm closure attempt
 */
export interface TabClosureAckMessage extends TabMessage {
  type: 'TAB_CLOSURE_ACK';
  closureSuccess: boolean; // true if window.close() succeeded, false if page was hidden
  error?: string; // Optional error details for debugging
}

/**
 * Track closure state during tab closure operation
 * Tracks progress of closing multiple tabs
 */
export interface TabClosureState {
  closingTabCount: number; // Total number of tabs attempting to close
  closedTabCount: number; // Number that confirmed closure (sent ACK)
  pendingClosureTabs: Set<string>; // Specific tab IDs still awaiting response
  closureFailureMessage: string | null; // Message about remaining open tabs
  closureStartTime: number | null; // When closure operation started
}

/**
 * Closure status update sent to components subscribing to closure progress
 */
export interface ClosureStatusUpdate {
  totalClosingTabs: number; // How many tabs we're trying to close
  closedTabs: number; // How many confirmed closure
  closureTimeoutReached: boolean; // True if 3-second timeout exceeded
  remainingTabIds?: string[]; // List of tab IDs still open
}

/**
 * Return value from forceTabActive() indicating closure feedback
 */
export interface ClosureFeedback {
  success: boolean; // Always false for closure, as we're hiding not closing
  closedCount: number; // Number of tabs that confirmed closure
  pendingCount: number; // Number still awaiting response
  timedOut: boolean; // True if timeout reached before all responded
}

/**
 * Modal closure state - represents the UI state during closure operation
 * Sequence: idle → requesting → closing → (complete_success OR closing_timeout)
 */
export type ModalClosureState = 
  | 'idle' // Initial state, waiting for user interaction
  | 'requesting' // User clicked button, preparing closure
  | 'closing' // Closure in progress, waiting for acknowledgments
  | 'closing_timeout' // Some tabs didn't respond within timeout
  | 'partial_success' // Some but not all tabs closed
  | 'complete_success' // All tabs confirmed closed
  | 'error'; // Error occurred during closure
