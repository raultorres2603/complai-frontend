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
