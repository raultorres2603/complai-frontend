/**
 * TabConflictModal.test.tsx - Component tests for tab conflict modal
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabConflictModal } from './TabConflictModal';

describe('TabConflictModal', () => {
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

  it('should call onContinueThisTab when button is clicked', async () => {
    const user = await userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const button = screen.getByText(/Continue with this tab/i);
    await user.click(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continue with this tab/i);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('primaryButton');
  });
});
