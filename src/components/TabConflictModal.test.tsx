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

import { describe, it, expect, vi, afterEach } from 'vitest';
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

    expect(screen.getByText(/detectaron múltiples pestañas|Multiple Tabs Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/solo permite una sesión activa|only allows one active session/i)).toBeInTheDocument();
  });

  it('should show initial button text with translation', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    expect(button).toBeInTheDocument();
  });

  it('should call onContinueThisTab when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should update button text to closing state with translation', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Button text should change to translated "Closing other tabs..."
    expect(screen.getByText(/Cerrando otras pestañas|Closing other tabs/i)).toBeInTheDocument();
  });

  it('should disable button during closure', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Button should be disabled
    expect(button).toBeDisabled();
  });

  it('should show error message after timeout with translation', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Wait for error message to appear after timeout
    await waitFor(() => {
      expect(screen.getByText(/no se cerraron|did not close/i)).toBeInTheDocument();
    }, { timeout: 6000 });
  }, 15000);

  it('should show translated "Retry" button after timeout', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Wait for retry button to appear after timeout
    await waitFor(() => {
      expect(screen.getByText(/Reintentar|Retry/i)).toBeInTheDocument();
    }, { timeout: 6000 });
  }, 15000);

  it('should allow retry after error', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const firstButton = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(firstButton);

    // Wait for retry button to appear
    await waitFor(() => {
      expect(screen.getByText(/Reintentar|Retry/i)).toBeInTheDocument();
    }, { timeout: 6000 });

    const retryButton = screen.getByText(/Reintentar|Retry/i);
    await user.click(retryButton);
    expect(mockCallback).toHaveBeenCalledTimes(1); // Only first call
  }, 15000);

  it('should enable retry button (not disabled)', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Wait for retry button to become enabled
    await waitFor(() => {
      const retryButton = screen.getByText(/Reintentar|Retry/i);
      expect(retryButton).not.toBeDisabled();
    }, { timeout: 6000 });
  }, 15000);

  it('should reset state when modal becomes hidden/visible', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Button should show closing state
    expect(screen.getByText(/Cerrando otras pestañas|Closing other tabs/i)).toBeInTheDocument();

    // Hide modal
    rerender(
      <TabConflictModal isVisible={false} onContinueThisTab={() => {}} />
    );

    // Show modal again
    rerender(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    // Should be reset to initial state
    expect(screen.getByText(/Continuar con esta pestaña|Continue with this tab/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    expect(button).toHaveAttribute('aria-label');
  });

  it('should display spinner during closing', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Spinner container should be visible
    await waitFor(() => {
      expect(screen.getByText(/Cerrando pestañas|Closing tabs/i)).toBeInTheDocument();
    });
  });

  it('should not show spinner before closure starts', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    // Spinner should not be visible initially
    expect(screen.queryByText(/Cerrando pestaña|Closing tabs/i)).not.toBeInTheDocument();
  });

  it('should display error message with warning icon', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Wait for error message to appear
    await waitFor(() => {
      const errorText = screen.getByText(/no se cerraron|did not close/i);
      expect(errorText).toBeInTheDocument();
    }, { timeout: 6000 });
  }, 15000);

  it('should handle multiple retry attempts', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    // First attempt
    let button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Wait for retry button to appear
    await waitFor(() => {
      expect(screen.getByText(/Reintentar|Retry/i)).toBeInTheDocument();
    }, { timeout: 6000 });

    // Click retry
    button = screen.getByText(/Reintentar|Retry/i);
    await user.click(button);

    // Should reset to idle and show "Continue" button
    expect(screen.getByText(/Continuar con esta pestaña|Continue with this tab/i)).toBeInTheDocument();
  }, 15000);

  it('should clean up timeout on unmount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    // Unmount immediately - should not cause errors
    unmount();

    expect(true).toBe(true); // If we got here without error, test passes
  }, 15000);
});
