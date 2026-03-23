/**
 * Tests for useDrawerEscape Hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDrawerEscape } from '../useDrawerEscape';

describe('useDrawerEscape Hook', () => {
  let onCloseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCloseMock = vi.fn();
  });

  it('should call onClose when Escape key is pressed and isOpen is true', () => {
    renderHook(() => useDrawerEscape(onCloseMock, true));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when other keys are pressed', () => {
    renderHook(() => useDrawerEscape(onCloseMock, true));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onCloseMock).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('should not call onClose when isOpen is false', () => {
    renderHook(() => useDrawerEscape(onCloseMock, false));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('should call onClose when Escape is pressed after drawer opens', () => {
    const { rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) => useDrawerEscape(onCloseMock, isOpen),
      { initialProps: { isOpen: false } }
    );

    // Drawer is closed, Escape should not trigger
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onCloseMock).not.toHaveBeenCalled();

    // Open drawer
    rerender({ isOpen: true });

    // Now Escape should trigger
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDrawerEscape(onCloseMock, true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should handle multiple Escape key presses', () => {
    renderHook(() => useDrawerEscape(onCloseMock, true));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it('should default isOpen to true when not provided', () => {
    renderHook(() => useDrawerEscape(onCloseMock));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
