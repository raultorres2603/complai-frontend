# ComplAI Frontend - Tab Closing Fix & Accessibility Features

## Issue 1: Tab Closing Not Working

### Current Status & Recommended Next Steps

**Hook Implementation**: ✅ COMPLETE (Phase 1 done, Step 1.1-1.5 all implemented)
- `useTabDetection.ts` fully implemented with BroadcastChannel, message queue, fallback chain, localStorage detection
- All TypeScript compilation passes ✅
- Logic is sound and production-ready

**Test Infrastructure**: ✅ COMPLETE (Phase 3.0 - Test Setup)
- Created `src/__tests__/setup.ts` with DOM container initialization and mocks
- Created `src/__tests__/test-utils.tsx` with custom `render` and `renderHook` functions
- Updated `vitest.config.ts` with setupFiles configuration
- Tests now run without timing out ✅

**Hook Tests**: ✅ COMPLETE (Phase 3.1)
- All 16 useTabDetection tests passing ✅
- BroadcastChannel listener, message queue, fallbacks, localStorage all verified
- Tests use proper test infrastructure setup from test-utils

**UI Component Tests**: ✅ COMPLETE (Phase 3.2)
- 8 TabConflictModal simple tests passing ✅
- Button rendering, callback execution, state transitions all verified
- Accessibility attributes confirmed

**TypeScript Compilation**: ✅ COMPLETE (Phase 3.2)
- `npm run type-check` passes with zero errors ✅
- All types properly defined and strict mode enabled

**UI Component**: ✅ COMPLETE (Phase 2)
- TabConflictModal.tsx includes UX improvements (loading states, error handling)
- Button text progression: "Continue with this tab" → "Closing other tabs..." → "Other tabs closed"
- Accessibility attributes present (aria-label, aria-busy)
- Non-dismissible during closure
- Error state with retry functionality already implemented

**Recommended Priority**:
1. **✓ DONE** (5-10 min): Complete Phase 3.0 (test setup)
2. **✓ DONE** (15-20 min): Phase 3.1 & 3.2 tests (all core tests passing)
3. **✓ DONE** (10-15 min): Phase 2 (TabConflictModal UX already implemented)
4. **NEXT** (5-15 min): Phase 4 (manual testing verification)

### 1. Requirements

- [x] BroadcastChannel listener must be established before messages are sent
- [x] Handle race conditions in message send/receive lifecycle
- [x] Implement fallback mechanism for browsers without BroadcastChannel
- [x] Verify window.close() can execute successfully
- [x] Ensure localStorage-based tab closure detection works as fallback
- [x] Add comprehensive error handling and logging

### 2. Architecture & Design

#### Root Cause Analysis
The current implementation has several potential issues:
1. **Listener Registration Race Condition**: BroadcastChannel listener is set on `channel.onmessage` after the channel is created, but if other tabs send messages immediately, they may be lost.
2. **No Message Queue**: If TAB_CLOSE_SELF message arrives before listener is ready, it's never received.
3. **window.close() Security**: window.close() only works when the window was opened by JavaScript (not user-initiated). Need detection and fallback.
4. **localStorage Fallback Incomplete**: The localStorage heartbeat detects multiple tabs but doesn't enforce closure in the receiving tab.
5. **No Unload Safeguard**: Tabs might not properly unregister when closed via other means.

#### Solution Architecture
- **Listener Safety**: Add message queue buffer; store early messages in state
- **Graceful Degradation**: If window.close() fails, trigger navigation to about:blank or localStorage-based detection
- **localStorage Sync**: Add storage event listener as additional fallback mechanism
- **Message Acknowledgment**: Implement acknowledgment protocol to confirm closure
- **Debug Logging**: Add detailed logging for troubleshooting tab closure lifecycle

#### Communication Flow (BroadcastChannel)
```
Tab A (user selects "Continue") → sends TAB_CLOSE_SELF message
    ↓
Tab B,C,D receive TAB_CLOSE_SELF → window.close() OR fallback
    ↓
Fallback: Set localStorage key 'complai_should_close' = true
    ↓
Each tab monitors this key via storage event → close if detected
    ↓
Timeout safety: If tab doesn't close in 3s, force about:blank navigation
```

### 3. Execution Steps

#### Phase 1: Enhance useTabDetection Hook

- [x] **Step 1.1: Refactor BroadcastChannel setup** ✅ COMPLETE
  - Listener setup using useEffect immediately after channel creation
  - Message queue to buffer early messages (messageQueueRef)
  - Message type constants (TAB_ACTIVE, TAB_CLOSE_SELF, TAB_CLOSED, TAB_CLOSE_REQUEST)
  - Message protocol documented in hook comments

- [x] **Step 1.2: Add window.close() fallback mechanism** ✅ COMPLETE
  - Detects if window.close() fails (try-catch in attemptWindowClose)
  - Fallback 1: Set localStorage key `complai_force_close` = tabId
  - Fallback 2: Navigate to about:blank
  - Fallback 3: Set innerHTML to empty and opacity to 0
  - Logs which fallback is being used (logError function)

- [x] **Step 1.3: Implement localStorage-based closure detection** ✅ COMPLETE
  - Storage event listener for `complai_force_close` key
  - Triggers window.close() when other tab sets it
  - Removes closed tab from registry immediately
  - beforeunload event cleanup implemented

- [x] **Step 1.4: Add message acknowledgment protocol** ✅ COMPLETE
  - Receives TAB_CLOSE_SELF, sends back TAB_CLOSED after delay
  - Clears closing tabs based on TAB_CLOSED acknowledgments
  - 2s timeout for acknowledgment (MESSAGE_ACK_TIMEOUT)

- [x] **Step 1.5: Add comprehensive error handling and logging** ✅ COMPLETE
  - Error logging with context (tabId, operation, error details)
  - Tracks closure attempts, successes, fallback usage
  - Message send/receive logging
  - DEBUG flag for verbose logging (set DEBUG = true/false)

#### Phase 2: Update TabConflictModal Component ✅ COMPLETE

**Implementation Status** - All features already implemented in TabConflictModal.tsx

- [x] **Step 2.1: Improve UX during closure** ✅ COMPLETE
  - Button text progression implemented: ✓
    - Initial: "Continue with this tab" ✓
    - After click: "Closing other tabs..." (with spinner) ✓
    - After timeout: "Other tabs closed" (shown briefly) ✓
  - Visual feedback with LoadingSpinner component ✓
  - Modal non-dismissible during closure (no close button, backdrop click disabled) ✓
  - 5s timeout triggers error message display ✓
  - States properly managed with React hooks ✓

- [x] **Step 2.2: Add error handling** ✅ COMPLETE
  - Error handling for closure failures ✓
  - Shows error message after 5s timeout: "Other tabs did not close. Retrying..." ✓
  - Provides "Retry" button that resets state ✓
  - Error state properly transitions back to idle on retry ✓
  - Log error details in console with timestamp ✓
  - Tests verify error state display and retry behavior ✓

#### Phase 3: Fix Test Infrastructure & Add Tests

**IMPORTANT: Test Strategy Explanation**

The builder encountered test failures due to improper DOM setup, not due to hook logic issues. The hook implementation is solid. There are two approaches to testing:

**Approach A (Recommended): Component Tests with renderHook**
- Uses React Testing Library's `renderHook` to test hooks in a React environment
- Requires proper DOM container (fixed in Phase 3.5)
- Tests hook state changes, side effects, and integration with React lifecycle
- More realistic testing but slightly more setup required
- This is what the existing test file attempted to do

**Approach B (Alternative): Simple Unit Tests without renderHook**
- Tests hook logic directly without React DOM
- Calls hook functions manually, tests returned values
- No DOM container needed, simpler setup
- Good for testing business logic independent of React
- Faster and easier to understand
- May miss React-specific issues (e.g., useEffect ordering)

**Recommendation**: Use Approach A (renderHook) since it's already partially implemented. Phase 3.5 provides the missing setup code. If builder finds Approach A too complex, can switch to Approach B.

**Which tests are essential vs. nice-to-have**:
- **ESSENTIAL** (must pass before Phase 4):
  - BroadcastChannel message listener readiness (listener exists before messages sent)
  - Multiple tab detection (isMultipleTabsDetected state)
  - forceTabActive method sends correct message
  - Cleanup on unmount
  
- **NICE-TO-HAVE** (good to have but not blocking):
  - Message queue buffering details
  - All fallback chain scenarios (3 fallbacks × 2-3 scenarios each)
  - Acknowledgment protocol edge cases
  - Timer cleanup edge cases

**Current Status**: All hook tests exist in `src/hooks/useTabDetection.test.ts` but fail due to missing DOM. Phase 3.5 fixes this. Then just update imports from `@testing-library/react` to `@/__tests__/test-utils`.

**Next Steps for Builder**:
1. Apply code from Phase 3.5 to setup.ts and test-utils.tsx
2. Update test file imports to use test-utils
3. Run `npm test -- src/hooks/useTabDetection.test.ts`
4. If tests still fail, check that imports are from test-utils, not directly from @testing-library/react

---

**NOTE**: The hook implementation (Phase 1) is complete and type-checks correctly. Phase 3 is BLOCKED on test infrastructure setup. Complete these setup steps first, then tests will pass.

- [x] **Step 3.0: [REVISED] Fix Vitest & React Testing Library DOM Setup** ✅ COMPLETE
  - **Updated `src/__tests__/setup.ts`**: Added DOM container initialization
    - Import `beforeEach`, `afterEach` from `vitest` ✓
    - Created `<div id="root"></div>` container before tests ✓
    - Cleanup container after each test ✓
    - Imported and setup `@testing-library/jest-dom` ✓
    - Setup `jsdom` with proper localStorage and BroadcastChannel mocks ✓
  - **Vitest config** (jsdom environment + setupFiles path) ✓
  - **Added test utility file** (`src/__tests__/test-utils.tsx`):
    - Created custom `render` and `renderHook` wrappers ensuring DOM container exists ✓
    - Exported rendering utilities for consistent test setup ✓

- [x] **Step 3.1: [REVISED] Create useTabDetection advanced tests** ✅ COMPLETE
  - All 16 tests pass using test utility from `src/__tests__/test-utils.tsx` ✓
  - BroadcastChannel message listener ready before messages sent ✓
  - Message queue buffering during setup ✓
  - window.close() fallback chain (all three fallbacks) ✓
  - localStorage-based closure detection ✓
  - Message acknowledgment protocol ✓
  - BroadcastChannel, window.close, localStorage, storage events mocked ✓
  - Cleanup on unmount ✓
  - **File**: `src/hooks/useTabDetection.test.ts` ✓

- [x] **Step 3.2: Create TabConflictModal integration tests** ✅ COMPLETE
  - Modal rendering and visibility ✓
  - Button state transitions (idle → closing → error) ✓
  - Error state display and retry behavior ✓
  - Accessibility attributes (aria-label, aria-busy) ✓
  - All 8 simple tests passing ✓
  - **Files**: `src/components/TabConflictModal.simple.test.tsx` ✓

#### Phase 3.5: Test Infrastructure Code Setup

**Add this code to `src/__tests__/setup.ts`**:
```typescript
/**
 * Test setup file for Vitest + React Testing Library
 * Initializes jsdom, DOM container, and common mocks
 */

import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// ===== DOM Container Setup =====
let container: HTMLDivElement;

beforeEach(() => {
  // Create and append container for React rendering
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
});

afterEach(() => {
  // Cleanup container after each test
  if (container && document.body.contains(container)) {
    document.body.removeChild(container);
  }
});

// ===== localStorage Mock =====
// vitest + jsdom provide localStorage, but reset it between tests
beforeEach(() => {
  localStorage.clear();
});

// ===== BroadcastChannel Mock =====
// If not available in jsdom, provide a mock implementation
if (typeof BroadcastChannel === 'undefined') {
  const broadcastChannelInstances = new Map<
    string,
    { onmessage: ((event: any) => void) | null; listeners: Set<BroadcastChannel> }
  >();

  (global as any).BroadcastChannel = class MockBroadcastChannel {
    private name: string;
    public onmessage: ((event: any) => void) | null = null;

    constructor(name: string) {
      this.name = name;
      if (!broadcastChannelInstances.has(name)) {
        broadcastChannelInstances.set(name, {
          onmessage: null,
          listeners: new Set(),
        });
      }
      broadcastChannelInstances.get(name)!.listeners.add(this);
    }

    postMessage(message: any) {
      const instances = broadcastChannelInstances.get(this.name);
      if (instances) {
        instances.listeners.forEach((listener) => {
          if (listener !== this && listener.onmessage) {
            // Broadcast to other instances asynchronously
            setTimeout(() => {
              listener.onmessage?.({ data: message });
            }, 0);
          }
        });
      }
    }

    close() {
      const instances = broadcastChannelInstances.get(this.name);
      if (instances) {
        instances.listeners.delete(this);
      }
    }
  };
}

// ===== window.close() Mock =====
// Mock window.close() to track calls without actually closing the window
beforeEach(() => {
  vi.spyOn(window, 'close').mockImplementation(() => {
    // Do nothing - prevent actual window close in tests
  });
});

// ===== window.location.href Mock =====
// Mock navigation to avoid changing test page location
beforeEach(() => {
  delete (window as any).location;
  window.location = {
    href: '',
    // Add other location properties as needed
  } as any;
});

// ===== Suppress console output in tests =====
// Optionally suppress logs/errors to reduce test noise
// Comment out if you want to see logs for debugging
// global.console = {
//   ...console,
//   log: vi.fn(),
//   warn: vi.fn(),
//   error: vi.fn(),
// };
```

**Create new file `src/__tests__/test-utils.tsx`** (test utilities):
```typescript
/**
 * Test utilities for React Testing Library + Vitest
 * Provides custom render and renderHook functions with proper setup
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react';

/**
 * Custom render function that ensures DOM container is available
 * Use this instead of render() from React Testing Library
 */
export function renderWithDOM(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Ensure root container exists
  let container = document.getElementById('root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  return render(ui, { ...options });
}

/**
 * Custom renderHook that ensures DOM container is available
 * Use this instead of renderHook() from React Testing Library
 */
export function renderHook<TProps, TResult>(
  hook: (initialProps?: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) {
  // Ensure root container exists
  let container = document.getElementById('root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  return rtlRenderHook(hook, options);
}

// Re-export common testing utilities
export { screen, waitFor, act } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
```

**Key Points**:
- `beforeEach` creates `<div id="root">` container before each test
- `afterEach` cleans up the container after each test
- BroadcastChannel mock tracks instances and broadcasts messages between them
- `window.close()` is mocked to prevent actual window closure
- `window.location.href` is mocked to prevent navigation
- localStorage is cleared before each test (jsdom provides real localStorage)

**Usage in Test Files**:
```typescript
// Old way (will fail):
import { renderHook, waitFor } from '@testing-library/react';

// New way (will work):
import { renderHook, waitFor } from '@/__tests__/test-utils';

describe('useTabDetection', () => {
  it('should work', async () => {
    const { result } = renderHook(() => useTabDetection());
    await waitFor(() => {
      expect(result.current.isMultipleTabsDetected).toBe(false);
    });
  });
});
```

#### Phase 4: Manual Testing & Verification

- [ ] **Step 4.1: Manual test tab closure**
  - Open ComplAI in multiple browser tabs (recommend 2-3 tabs)
  - In one tab, click the button that triggers TabConflictModal (or trigger the conversation flow that activates it)
  - In that tab, click "Continue with this tab"
  - Verify:
    - Button text changes to "Closing other tabs..." with spinner
    - Modal becomes non-dismissible (no close button, can't click outside)
    - Other tabs should close automatically (or navigate to about:blank if close fails)
    - Original tab shows "Other tabs closed" briefly, then modal closes
    - All other tabs are actually closed (check browser tab bar)
  - Browser console should show no errors
  - Check logs at `[TabDetection]` prefix for detailed closure steps if DEBUG enabled

- [ ] **Step 4.2: Manual test edge cases**
  - **Test rapid switching**: Close and open multiple tabs quickly, verify tab registry updates correctly
  - **Test closure failover**: Use browser DevTools to disable window.close (or simulate by mocking), verify fallback to localStorage/about:blank works
  - **Test network disconnection**: Simulate network disconnection in DevTools, verify tabs still close via localStorage fallback
  - **Test with localStorage disabled**: In DevTools, disable localStorage (cookies/site data), verify basic BroadcastChannel still works
  - **Test browser without BroadcastChannel support** (Firefox): Verify localStorage fallback works
  - **Test on different browsers**: Chrome/Edge (BroadcastChannel), Firefox (fallback), Safari (if available)

- [ ] **Step 4.3: Verification checklist**
  - Run `npm test -- src/hooks/useTabDetection.test.ts --run` → all tests pass ✓
  - Run `npm test -- src/components/TabConflictModal.test.tsx --run` → all tests pass ✓
  - Run `npm run type-check` → no TypeScript errors ✓
  - Manual test: Multiple tabs, click continue, verify closure ✓
  - Manual test: Check browser console, no errors/warnings ✓
  - Manual test: localStorage is cleaned up after closure ✓
  - Code review: Builder confirms modal UX is improved (loading states, error handling) ✓
  - Verify all Issue 1 is checkboxes marked as [x] ✓

---

## Summary: Issue 1 - Tab Closing Fix

### What's Complete ✅
- **Phase 1**: useTabDetection.ts fully implemented (all 5 steps)
  - BroadcastChannel listener safety with message queue
  - window.close() fallback chain (localStorage, about:blank, hide)
  - localStorage closure detection with storage event listener
  - Message acknowledgment protocol
  - Comprehensive logging and error handling
  - TypeScript compilation: ✅ No errors

### What's Blocked ❌ (Depends on test setup fix)
- **Phase 3**: Test Infrastructure & Tests
  - Root cause: DOM container missing in setup.ts
  - Impact: renderHook fails with "container is undefined"
  - Fix provided: Code blocks in Phase 3.5 for setup.ts and test-utils.tsx
  - Time to fix: ~5-10 minutes
  - Once fixed: Tests should pass without other changes

### What Remains ⏳
- **Phase 2**: TabConflictModal UX improvements (can do in parallel with Phase 3)
  - Add loading states, error handling, retry logic
  - Time: ~15-20 minutes
  
- **Phase 4**: Manual testing & verification
  - Time: ~10-15 minutes (includes multiple browser tests)

### Recommended Timeline
- **Now**: Complete Phase 3.0 (test setup fix) - 5-10 min
  - Add code from Phase 3.5 to setup.ts and create test-utils.tsx
  - Run `npm test` to verify tests now pass
  
- **In parallel**: Complete Phase 2 (TabConflictModal improvements) - 15-20 min
  - Can be done while Phase 3 tests are running
  
- **Then**: Run Phase 3.1 & 3.2 (existing tests should now pass) - 2-5 min
  - Update test imports if needed
  - Run `npm test -- src/` to verify all tests pass
  
- **Finally**: Phase 4 (manual testing) - 10-15 min

**Total Estimated Time**: ~40-60 minutes from this point to complete Issue 1

---

## Issue 2: Add Accessibility Features

**Status**: 🚫 NOT STARTED (depends on Issue 1 completion)

**Recommended Start**: After Issue 1 is complete (Phase 1-4)

**Estimated Timeline**: ~2-3 hours
- Phase 1 (Types): ~15 min
- Phase 2 (Daltonism): ~30 min
- Phase 3 (TTS): ~45 min
- Phase 4 (STT): ~45 min
- Phase 5 (Integration): ~30 min

### 1. Requirements

#### 1.1 Daltonism Support
- [ ] Support 3 types of color blindness: Deuteranopia, Protanopia, Tritanopia
- [ ] Implement as CSS filter overlays (not color remapping)
- [ ] Add settings UI toggle in AccessibilityPanel component
- [ ] Apply filter globally to the app
- [ ] Store user preference in localStorage
- [ ] Load preference on app startup

#### 1.2 Text-to-Speech (TTS)
- [ ] Read chat messages aloud using Web Speech API
- [ ] Add play/pause/stop controls in SpeechControls component
- [ ] Support voice selection (if available)
- [ ] Implement speed adjustment (0.5x to 2x)
- [ ] Allow reading individual messages
- [ ] Support browsing history (read previous/next message)
- [ ] Show current playback state and progress

#### 1.3 Speech-to-Text (STT)
- [ ] Convert spoken input to text using Web Speech API
- [ ] Add microphone button in MessageInput component
- [ ] Show real-time transcript as user is speaking
- [ ] Allow send on voice end or manual confirmation
- [ ] Support voice language selection
- [ ] Show confidence levels and alternatives
- [ ] Error handling for permission denied

### 2. Architecture & Design

#### TypeScript Types
**File**: `src/types/accessibility.types.ts` (new)
```typescript
// Color blindness types
export type ColorBlindnessType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';

// TTS configuration
export interface TextToSpeechConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;           // 0.5 to 2
  pitch: number;          // 0.5 to 2
  volume: number;         // 0 to 1
}

export interface TextToSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  currentMessageId: string | null;
  currentText: string;
  currentRate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceUri?: string;
  error: string | null;
}

// STT configuration
export interface SpeechToTextConfig {
  language: string;       // BCP 47 language tag, e.g., 'en-US'
  continuous: boolean;    // true = allow multiple words
  interimResults: boolean; // true = show partial results
}

export interface SpeechToTextState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  alternatives: string[];
  error: string | null;
  supportedLanguages: Array<{ code: string; name: string }>;
}

// Accessibility settings (user preferences)
export interface AccessibilitySettings {
  colorBlindnessType: ColorBlindnessType;
  ttsEnabled: boolean;
  ttsRate: number;
  ttsVoiceUri?: string;
  sttEnabled: boolean;
  sttLanguage: string;
}
```

#### Custom Hooks

**1. useAccessibility Hook**
**File**: `src/hooks/useAccessibility.ts`
```typescript
// Returns accessibility settings and update function
// Loads from localStorage on init, syncs on change
export interface UseAccessibilityReturn {
  settings: AccessibilitySettings;
  updateSettings: (partial: Partial<AccessibilitySettings>) => void;
  applyColorFilter: (type: ColorBlindnessType) => void;
}
```

**2. useTextToSpeech Hook**
**File**: `src/hooks/useTextToSpeech.ts`
```typescript
// Manages TTS state, voice selection, playback
export interface UseTextToSpeechReturn {
  state: TextToSpeechState;
  readText: (text: string, messageId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  selectVoice: (voiceUri: string) => void;
  readNext: (messages: ChatMessage[]) => void;
  readPrevious: (messages: ChatMessage[]) => void;
}
```

**3. useSpeechToText Hook**
**File**: `src/hooks/useSpeechToText.ts`
```typescript
// Manages STT state, recognition, transcript
export interface UseSpeechToTextReturn {
  state: SpeechToTextState;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
  setLanguage: (language: string) => void;
  sendTranscript: (text: string) => void; // For manual confirmation
}
```

#### React Components

**1. AccessibilityPanel Component**
**File**: `src/components/AccessibilityPanel.tsx`
- Toggle for Daltonism (dropdown: Normal, Deuteranopia, Protanopia, Tritanopia)
- Toggle for TTS (enable/disable)
- Toggle for STT (enable/disable)
- Collapsible accordion or modal
- Integrated into Header or as floating button
- CSS Module: `AccessibilityPanel.module.css`

**2. SpeechControls Component**
**File**: `src/components/SpeechControls.tsx`
- TTS controls: play/pause/stop buttons
- Speed slider (0.5x to 2x)
- Voice selection dropdown
- Message navigation (previous/next)
- Current message display
- CSS Module: `SpeechControls.module.css`
- Only visible when TTS is active

**3. MicrophoneButton Component**
**File**: `src/components/MicrophoneButton.tsx`
- Microphone icon button in MessageInput
- Shows listening state (animated)
- Displays transcript in real-time
- Confidence indicator
- Toggle between recording/idle
- CSS Module: `MicrophoneButton.module.css`

**4. SpeechTranscriptDisplay Component**
**File**: `src/components/SpeechTranscriptDisplay.tsx`
- Shows interim + final transcript
- Displays confidence level
- Shows language being used
- Interactive confirmation or send button
- CSS Module: `SpeechTranscriptDisplay.module.css`

#### Services

**No new services required** - All logic encapsulated in hooks and components using Web Speech API directly.

#### City Scoping & Multi-City Support
- Daltonism filter applies app-wide, independent of city
- TTS/STT settings stored per-user (localStorage), not city-scoped
- All hooks accept optional `cityId` but don't require it for accessibility features

#### Security & Permissions
- **Microphone**: Request permission via useSpeechToText; handle permission denied gracefully
- **localStorage**: Detect if disabled; provide in-memory fallback
- **Web Speech API**: Check browser support; show fallback UI if unavailable
- **HTTPS Only**: Web Speech API over HTTPS only (enforce in deployment)
- **User Control**: All features optional, can be disabled
- **No External APIs**: Use native Web Speech API (no third-party services)

#### Error Handling
- Browser doesn't support Web Speech API → Show "not supported" message
- Microphone permission denied → Show permission request UI
- Recording interrupted → Show error and allow retry
- TTS error (voice unavailable) → Fallback to system default voice

#### Testing Strategy

**Unit Tests**:
- `useAccessibility.test.ts`: Settings persistence, defaults, updates
- `useTextToSpeech.test.ts`: Playback control, voice selection, message navigation
- `useSpeechToText.test.ts`: Listening states, transcript updates, language switching

**Component Tests**:
- `AccessibilityPanel.test.tsx`: Toggle controls, settings persistence
- `SpeechControls.test.tsx`: Playback controls, speed adjustment
- `MicrophoneButton.test.tsx`: Recording states, transcript display
- `SpeechTranscriptDisplay.test.tsx`: Transcript display, confirmation buttons

**Integration Tests**:
- Test TTS with real ChatMessage list
- Test STT → MessageInput flow
- Test Daltonism filter applied to app
- Test settings persist across page reload

### 3. Execution Steps

#### Phase 1: Type Definitions & Setup

- [ ] **Step 1.1: Create accessibility.types.ts**
  - Define ColorBlindnessType, TextToSpeechConfig/State, SpeechToTextConfig/State
  - Define AccessibilitySettings interface
  - Document all types with JSDoc comments
  - Include default values

#### Phase 2: Daltonism Support (Color Blindness Filter)

- [ ] **Step 2.1: Create useAccessibility hook**
  - Load settings from localStorage on mount (key: 'complai_accessibility')
  - Return `{ settings, updateSettings, applyColorFilter }`
  - `applyColorFilter(type)` applies CSS filter to document.body
  - Save settings to localStorage on every update
  - Handle localStorage unavailable (fallback to in-memory state)

- [ ] **Step 2.2: Add CSS filters to App.css**
  - Create CSS classes for each color blindness type:
    - `.filter-normal` (no filter, default)
    - `.filter-deuteranopia` (CSS filter for red-green blindness)
    - `.filter-protanopia` (CSS filter for red color blindness)
    - `.filter-tritanopia` (CSS filter for blue-yellow blindness)
  - Use CSS filter property with appropriate Color Matrix or similar
  - Apply to body/root element
  - Reference:
    - Deuteranopia: `saturate(0.95) hue-rotate(40deg)`
    - Protanopia: `saturate(0.95) hue-rotate(-40deg)`
    - Tritanopia: `saturate(0.9) hue-rotate(180deg)`
    - (Adjust values for best visual result)

- [ ] **Step 2.3: Create AccessibilityPanel component**
  - Props: `{ isVisible: boolean; onClose?: () => void }`
  - Use `useAccessibility` hook
  - Dropdown for color blindness selection (4 options)
  - Preview of selected filter
  - Store selection on change
  - CSS Module for styling (accordion/modal appearance)

- [ ] **Step 2.4: Integrate AccessibilityPanel into Header**
  - Add accessibility icon/button to Header
  - Toggle panel visibility
  - Position as modal or drawer
  - Ensure keyboard accessibility (Esc to close, Tab navigation)

- [ ] **Step 2.5: Test Daltonism**
  - Unit test: useAccessibility saves/loads from localStorage
  - Component test: AccessibilityPanel toggles color filter
  - Manual test: Apply each filter type, verify colors change appropriately
  - Verify filter persists on page reload

#### Phase 3: Text-to-Speech (TTS)

- [ ] **Step 3.1: Create useTextToSpeech hook**
  - Initialize SpeechSynthesis API
  - Expose `readText(text, messageId)`, `pause()`, `resume()`, `stop()`
  - Implement voice selection (populate availableVoices on mount)
  - Implement speed control (0.5 to 2.0)
  - Track current playback state (isPlaying, isPaused, currentMessageId)
  - Handle errors (voice unavailable, synthesis fails)
  - Cleanup on unmount

- [ ] **Step 3.2: Create SpeechControls component**
  - Props: `{ messages: ChatMessage[]; settings: AccessibilitySettings }`
  - Show only if TTS enabled
  - Buttons: play/pause/stop, previous/next message
  - Slider: speed adjustment (0.5x to 2x, 0.1 increment)
  - Dropdown: voice selection (populate from hook)
  - Display: current message text being read
  - Visual state: highlight current message in chat
  - Accessibility: keyboard navigation, ARIA labels

- [ ] **Step 3.3: Integrate SpeechControls into Chat**
  - Add SpeechControls to MainLayout or ChatWindow
  - Show/hide based on TTS enabled
  - Pass current messages list to controls
  - Sync playback state across message list

- [ ] **Step 3.4: Add TTS button to Message component (optional)**
  - Small speaker icon on each message
  - Click to read only that message
  - Show "now playing" state
  - Use `readText()` from useTextToSpeech

- [ ] **Step 3.5: Test TTS**
  - Unit test: Voice selection, playback control, speed changes
  - Unit test: Message navigation (next/previous)
  - Component test: SpeechControls UI updates on state change
  - Integration test: TTS with actual ChatMessage list
  - Manual test: Read messages, change voice/speed, navigate messages

#### Phase 4: Speech-to-Text (STT)

- [ ] **Step 4.1: Create useSpeechToText hook**
  - Initialize SpeechRecognition API (with webkit prefix fallback)
  - Expose `startListening()`, `stopListening()`, `cancelListening()`, `setLanguage()`
  - Track state: isListening, transcript, interimTranscript, confidence
  - Support interim results (partial transcript while speaking)
  - Support language selection (populate availableLanguages on mount)
  - Handle errors: permission denied, network error, abuse
  - Cleanup on unmount

- [ ] **Step 4.2: Create MicrophoneButton component**
  - Props: `{ onTranscript: (text: string) => void; settings: AccessibilitySettings }`
  - Show only if STT enabled
  - Microphone icon button
  - Visual state: idle (gray), listening (red/animated), processing (blue)
  - Integrated into MessageInput
  - Use `useSpeechToText` hook
  - Accessibility: ARIA label, keyboard activation

- [ ] **Step 4.3: Create SpeechTranscriptDisplay component**
  - Props: `{ transcript: string; interimTranscript: string; confidence: number; language: string }`
  - Show only during STT active
  - Display both interim (lighter) and final (bold) transcript
  - Show confidence level as percentage or indicator
  - Language display
  - Buttons: Send Transcript, Clear, Cancel
  - CSS Module for styling

- [ ] **Step 4.4: Integrate STT into MessageInput**
  - Add MicrophoneButton next to text input
  - Show SpeechTranscriptDisplay when listening
  - On transcript ready, offer option to:
    - Auto-send (if confidence > threshold)
    - Manual confirmation (append to input, let user edit before send)
    - Clear and re-record
  - Request microphone permission on first use

- [ ] **Step 4.5: Test STT**
  - Unit test: Recording states, transcript updates
  - Unit test: Language switching
  - Component test: MicrophoneButton state transitions
  - Component test: SpeechTranscriptDisplay rendering
  - Integration test: STT → MessageInput → send message flow
  - Manual test: Speak, see transcript, send message
  - Manual test: Permission denied handling
  - Manual test: Different language recognition

#### Phase 5: Integration & Polish

- [ ] **Step 5.1: Update App.tsx**
  - Initialize useAccessibility hook in App or Main context
  - Apply color filter on mount and when settings change
  - Ensure accessibility settings persist

- [ ] **Step 5.2: Add accessibility settings to Header/AccessibilityPanel**
  - Ensure AccessibilityPanel accessible from main UI
  - Style consistently with existing design
  - Ensure settings persist across page reload

- [ ] **Step 5.3: Browser compatibility**
  - Detect Web Speech API support (check `window.SpeechSynthesis`, `window.SpeechRecognition`)
  - Show graceful fallback message if not supported
  - Test on Chrome, Firefox, Safari, Edge
  - Handle webkit prefix for SpeechRecognition

- [ ] **Step 5.4: Mobile responsiveness**
  - Ensure microphone button responsive on mobile
  - Speech controls fit on small screens
  - Accessibility panel modal-sized appropriately
  - Test on iOS and Android

- [ ] **Step 5.5: Run all tests**
  - `npm test` - All unit and component tests pass
  - `npm run type-check` - No TypeScript errors
  - Verify no console warnings

#### Phase 6: Manual Testing & Documentation

- [ ] **Step 6.1: Manual end-to-end testing**
  - Test Daltonism filter on full chat interface
  - Test TTS reading entire conversation
  - Test STT input through full message send flow
  - Test all 3 features simultaneously
  - Test on multiple browsers and devices

- [ ] **Step 6.2: Accessibility audit**
  - Run axe DevTools or similar accessibility checker
  - Verify keyboard navigation (Tab, Enter, Esc)
  - Verify screen reader compatibility (ARIA labels)
  - Test with keyboard only (no mouse)

- [ ] **Step 6.3: Performance check**
  - TTS/STT should not block chat interaction
  - Large message lists should not slow down TTS navigation
  - Web Speech API latency acceptable (< 1s startup)

- [ ] **Step 6.4: Create README or documentation**
  - Document how to enable each accessibility feature
  - Document browser requirements (Chrome 25+, Firefox 25+, Safari 14.1+, Edge 15+)
  - Troubleshooting section (permission denied, no microphone, etc.)
  - User guide for each feature

---

## Implementation Order & Dependencies

### Recommended Sequence

1. **Tab Closing Fix** (Issue 1) - **3-4 days**
   - Phase 1-4 above (Steps 1.1-1.5, 2.1-2.2, 3.1-3.2, 4.1-4.3)
   - Can be completed and deployed independently
   - Resolves immediate blocking issue

2. **Daltonism Support** (Issue 2a) - **2-3 days**
   - Phase 1, 2 (Steps 1.1, 2.1-2.5)
   - Simplest accessibility feature
   - No external APIs required
   - Good foundation for other features

3. **Text-to-Speech** (Issue 2b) - **3-4 days**
   - Phase 1, 3 (Steps 1.1, 3.1-3.5)
   - Depends on accessibility types
   - More complex hook implementation
   - Requires hook and component tests

4. **Speech-to-Text** (Issue 2c) - **3-4 days**
   - Phase 1, 4 (Steps 1.1, 4.1-4.5)
   - Depends on accessibility types
   - Requires microphone permission handling
   - Integration with MessageInput component

5. **Final Integration & Testing** (Issue 2 only) - **2-3 days**
   - Phase 5-6 (Steps 5.1-5.5, 6.1-6.4)
   - Cross-feature integration
   - Browser compatibility
   - Performance optimization

### Subtotal Effort Estimate
- **Issue 1 (Tab Closing)**: ~15-18 days (including testing and fixes)
- **Issue 2 (Accessibility)**: ~13-17 days (can be parallelized across features)
- **Total**: ~28-35 days (with some parallelization possible)

---

## Testing Checklist

### Issue 1: Tab Closing

- [ ] Unit tests pass (useTabDetection)
- [ ] Integration tests pass (TabConflictModal)
- [ ] Manual test: Multiple tabs close correctly
- [ ] Manual test: Fallback mechanisms work (no BroadcastChannel, window.close() disabled)
- [ ] Manual test: localStorage cleanup verified
- [ ] Console clear of errors/warnings
- [ ] TypeScript strict mode passes

### Issue 2: Accessibility

- [ ] All unit tests pass (useAccessibility, useTextToSpeech, useSpeechToText)
- [ ] All component tests pass (AccessibilityPanel, SpeechControls, MicrophoneButton, SpeechTranscriptDisplay)
- [ ] Daltonism filter applies and persists
- [ ] TTS reads messages, voice/speed controls work
- [ ] STT transcribes speech, language selection works
- [ ] Settings persist across reload
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness tested
- [ ] Keyboard navigation works for all features
- [ ] Screen reader compatible
- [ ] TypeScript strict mode passes
- [ ] No performance regressions

---

## Files to Create/Modify

### Issue 1: Tab Closing

**Modified Files:**
- `src/hooks/useTabDetection.ts` (refactor + enhanced error handling)
- `src/components/TabConflictModal.tsx` (improved UX)

**New Files:**
- `src/hooks/useTabDetection.test.ts` (new comprehensive tests)
- Tests require updates to vitest config if needed

### Issue 2: Accessibility

**New Type Files:**
- `src/types/accessibility.types.ts`

**New Hook Files:**
- `src/hooks/useAccessibility.ts`
- `src/hooks/useTextToSpeech.ts`
- `src/hooks/useSpeechToText.ts`

**New Component Files:**
- `src/components/AccessibilityPanel.tsx`
- `src/components/AccessibilityPanel.module.css`
- `src/components/SpeechControls.tsx`
- `src/components/SpeechControls.module.css`
- `src/components/MicrophoneButton.tsx`
- `src/components/MicrophoneButton.module.css`
- `src/components/SpeechTranscriptDisplay.tsx`
- `src/components/SpeechTranscriptDisplay.module.css`

**Modified Files:**
- `src/App.tsx` (initialize useAccessibility, apply filter)
- `src/App.css` (add color blindness filter classes)
- `src/components/Header.tsx` (add accessibility button)
- `src/components/MessageInput.tsx` (add microphone button)
- `src/layouts/MainLayout.tsx` (integrate SpeechControls)

**New Test Files:**
- `src/hooks/useAccessibility.test.ts`
- `src/hooks/useTextToSpeech.test.ts`
- `src/hooks/useSpeechToText.test.ts`
- `src/components/AccessibilityPanel.test.tsx`
- `src/components/SpeechControls.test.tsx`
- `src/components/MicrophoneButton.test.tsx`
- `src/components/SpeechTranscriptDisplay.test.tsx`

---

## Key Technical Decisions

### Issue 1: Tab Closing

1. **Message Queue Buffer**: Essential for race condition safety
2. **window.close() Fallback Strategy**: Three-tiered (localStorage, about:blank, DOM hiding)
3. **Message Acknowledgment**: Confirms closure before removing from registry
4. **Verbose Logging**: For debugging tab closure issues in production

### Issue 2: Accessibility

1. **No Third-Party Libraries**: Use native Web Speech API only (avoid external TTS/STT services)
2. **CSS Filters for Daltonism**: Simpler, faster than color remapping algorithms
3. **localStorage for Settings**: Simple persistence, works with multi-city setup
4. **Separate Hooks**: Each feature (useAccessibility, useTextToSpeech, useSpeechToText) independent
5. **Graceful Degradation**: Clear fallback messages if browsers don't support Web Speech API
6. **No City Scoping for Accessibility**: Settings are user-level, not city-level

---

## Security Considerations

### Issue 1: Tab Closing

- ✅ window.close() only works on windows opened by script (safe)
- ✅ localStorage keys namespaced (`complai_*`) to avoid conflicts
- ✅ BroadcastChannel scoped to same origin (safe)
- ⚠️ about:blank navigation is graceful, not a security issue

### Issue 2: Accessibility

- ✅ Microphone access requires explicit user permission (browser enforces)
- ✅ HTTPS only (Web Speech API requirement in modern browsers)
- ✅ No external API calls (all local processing)
- ✅ localStorage key namespaced (`complai_accessibility`) to avoid conflicts
- ✅ CSS filters are read-only, no data exposed
- ⚠️ Speech recognition sends audio to browser's speech engine (Google/OS-level)
- ⚠️ Users should be informed that voice data may be sent to OS-level service

---

## Dependencies & Browser Support

### Issue 1
- Requires: BroadcastChannel API (Chrome 54+, Firefox 38+, Safari 15.4+, Edge 79+)
- Fallback: localStorage-based detection (all browsers)
- Requires: window.close() (all browsers, may be blocked)

### Issue 2
- Daltonism: CSS filters (all modern browsers)
- TTS: SpeechSynthesis API (Chrome 25+, Firefox 49+, Safari 14.1+, Edge 15+)
- STT: SpeechRecognition API (Chrome 25+, Firefox 43+, Safari 14.1+, Edge 79+)
- Fallback: Show "not supported" UI message

---

## Monitoring & Logging

### Issue 1: Tab Detection
Consider adding:
- Analytics: Track tab closure successes/failures
- Error reporting: Capture closure failures with context
- Debug logs: exportable logs for troubleshooting
- Metrics: Track window.close() fallback usage

### Issue 2: Accessibility
Consider adding:
- Feature usage: Track which accessibility features are enabled
- Errors: TTS/STT recognition failures
- Performance: Voice synthesis latency, speech recognition latency
- Adoption: Percentage of users using each feature
