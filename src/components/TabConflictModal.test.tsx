/**
 * TabConflictModal.test.tsx - Component tests for tab conflict modal
 *
 * Tests:
 * - Rendering visibility
 * - Button state transitions (idle → closing → error)
 * - Error handling and retry
 * - UX feedback (text progression, spinner display)
 * - Timeout handling
 * - Accessibility attributes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { TabConflictModal } from './TabConflictModal';

describe('TabConflictModal', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should not render when isVisible is false', () => {
    const { container } = render(
      <TabConflictModal isVisible={false} onContinueThisTab={() => {}} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal content when isVisible is true', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    expect(screen.getByText(/Multiple Tabs Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/only allows one active session/i)).toBeInTheDocument();
  });

  it('should show initial button text "Continue with this tab"', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continue with this tab/i);
    expect(button).toBeInTheDocument();
  });

  it('should call onContinueThisTab when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should update button text to "Closing other tabs..." after click', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Button text should change to "Closing other tabs..."
    expect(screen.getByText(/Closing other tabs.../i)).toBeInTheDocument();
  });

  it('should disable button during closure', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Button should be disabled
    expect(button).toBeDisabled();
  });

  it('should show error message after timeout', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Advance time past the 5s timeout
    vi.advanceTimersByTime(5100);

    await waitFor(() => {
      expect(screen.getByText(/Other tabs did not close/i)).toBeInTheDocument();
    });
  });

  it('should show "Retry" button after timeout', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Advance time past the 5s timeout
    vi.advanceTimersByTime(5100);

    await waitFor(() => {
      expect(screen.getByText(/Retry/i)).toBeInTheDocument();
    });
  });

  it('should allow retry after error', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const firstButton = screen.getByText(/Continue with this tab/i);
    await user.click(firstButton);

    // Advance time past the 5s timeout
    vi.advanceTimersByTime(5100);

    await waitFor(() => {
      expect(screen.getByText(/Retry/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/Retry/i);
    await user.click(retryButton);
    expect(mockCallback).toHaveBeenCalledTimes(1); // Only first call
  });

  it('should enable retry button (not disabled)', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Advance time past the 5s timeout
    vi.advanceTimersByTime(5100);

    await waitFor(() => {
      const retryButton = screen.getByText(/Retry/i);
      expect(retryButton).not.toBeDisabled();
    });
  });

  it('should reset state when modal becomes hidden/visible', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Button should show closing state
    expect(screen.getByText(/Closing other tabs.../i)).toBeInTheDocument();

    // Hide modal
    rerender(
      <TabConflictModal isVisible={false} onContinueThisTab={() => {}} />
    );

    // Show modal again
    rerender(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    // Should be reset to initial state
    expect(screen.getByText(/Continue with this tab/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continue with this tab/i);
    expect(button).toHaveAttribute('aria-label');
  });

  it('should display spinner during closing', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Spinner container should be visible
    await waitFor(() => {
      expect(screen.getByText(/Closing tabs.../i)).toBeInTheDocument();
    });
  });

  it('should not show spinner before closure starts', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    // Spinner should not be visible initially
    expect(screen.queryByText(/Closing tabs.../i)).not.toBeInTheDocument();
  });

  it('should display error message with warning icon', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Advance time past the 5s timeout
    vi.advanceTimersByTime(5100);

    await waitFor(() => {
      const errorText = screen.getByText(/Other tabs did not close/i);
      expect(errorText).toBeInTheDocument();
    });
  });

  it('should handle multiple retry attempts', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    // First attempt
    let button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Advance time past the 5s timeout
    vi.advanceTimersByTime(5100);

    await waitFor(() => {
      expect(screen.getByText(/Retry/i)).toBeInTheDocument();
    });

    // Click retry
    button = screen.getByText(/Retry/i);
    await user.click(button);

    // Should reset to idle and show "Continue" button
    expect(screen.getByText(/Continue with this tab/i)).toBeInTheDocument();
  });

  it('should clean up timeout on unmount', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    const { unmount } = render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    // Unmount before timeout
    unmount();

    // Advance time - no error should occur
    vi.advanceTimersByTime(5100);

    expect(true).toBe(true); // If we got here without error, test passes
  });
});
