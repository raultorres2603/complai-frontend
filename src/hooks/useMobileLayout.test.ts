/**
 * Tests for useMobileLayout Hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMobileLayout } from './useMobileLayout';

describe('useMobileLayout Hook', () => {
  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return isMobile: false when viewport is desktop (>= 768px)', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.isMobile).toBe(false);
  });

  it('should return isMobile: true when viewport is mobile (< 768px)', () => {
    window.innerWidth = 480;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.isMobile).toBe(true);
  });

  it('should return isSuperSmall: true when viewport is < 375px', () => {
    window.innerWidth = 320;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.isSuperSmall).toBe(true);
  });

  it('should return isSuperSmall: false when viewport is >= 375px', () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.isSuperSmall).toBe(false);
  });

  it('should return correct viewportWidth', () => {
    window.innerWidth = 425;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.viewportWidth).toBe(425);
  });

  it('should initialize drawer as closed', () => {
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.isDrawerOpen).toBe(false);
  });

  it('should open drawer when openDrawer is called', () => {
    // Set to mobile viewport so drawer can stay open
    window.innerWidth = 375;
    const { result } = renderHook(() => useMobileLayout());

    act(() => {
      result.current.openDrawer();
    });

    expect(result.current.isDrawerOpen).toBe(true);
  });

  it('should close drawer when closeDrawer is called', () => {
    // Set to mobile viewport
    window.innerWidth = 375;
    const { result } = renderHook(() => useMobileLayout());

    // First open it
    act(() => {
      result.current.openDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(true);

    // Then close it
    act(() => {
      result.current.closeDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(false);
  });

  it('should toggle drawer state when toggleDrawer is called', () => {
    // Set to mobile viewport
    window.innerWidth = 375;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.isDrawerOpen).toBe(false);

    act(() => {
      result.current.toggleDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(true);

    act(() => {
      result.current.toggleDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(false);
  });

  it('should update viewport width on window resize', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useMobileLayout());

    expect(result.current.viewportWidth).toBe(1024);
    expect(result.current.isMobile).toBe(false);

    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 480;
      window.dispatchEvent(new Event('resize'));
    });

    // Give debounce time to execute
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(result.current.viewportWidth).toBe(480);
        expect(result.current.isMobile).toBe(true);
        resolve(null);
      }, 150);
    });
  });

  it('should close drawer automatically when switching to desktop', () => {
    window.innerWidth = 480; // Start mobile
    const { result, rerender } = renderHook(() => useMobileLayout());

    // Open drawer on mobile
    act(() => {
      result.current.openDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(true);
    expect(result.current.isMobile).toBe(true);

    // Simulate resize to desktop
    act(() => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for debounce and re-render
    return new Promise((resolve) => {
      setTimeout(() => {
        rerender();
        // Drawer should be closed when switching to desktop
        expect(result.current.isMobile).toBe(false);
        resolve(null);
      }, 150);
    });
  });

  it('should test multiple breakpoints: 320px, 375px, 425px, 480px', () => {
    const breakpoints = [320, 375, 425, 480, 768, 1024];

    breakpoints.forEach((width) => {
      window.innerWidth = width;
      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.viewportWidth).toBe(width);
      expect(result.current.isMobile).toBe(width < 768);
      expect(result.current.isSuperSmall).toBe(width < 375);
    });
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMobileLayout());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
