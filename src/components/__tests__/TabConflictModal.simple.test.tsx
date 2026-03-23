/**
 * TabConflictModal.test.tsx - Core component tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabConflictModal } from '../TabConflictModal';

describe('TabConflictModal', () => {
  it('should not render when isVisible is false', () => {
    const { container } = render(
      <TabConflictModal isVisible={false} onContinueThisTab={() => {}} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal content when isVisible is true', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    expect(screen.getByText(/Se detectaron múltiples pestañas|Multiple Tabs Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/solo permite una sesión activa|only allows one active session/i)).toBeInTheDocument();
  });

  it('should show initial button text', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    expect(button).toBeInTheDocument();
  });

  it('should call callback when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should update button text after click', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    const { rerender } = render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} closingTabCount={0} closedTabCount={0} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    rerender(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} closingTabCount={1} closedTabCount={0} />
    );

    expect(mockCallback).toHaveBeenCalledTimes(1);
    // When closingTabCount > 0, button shows "Cerrando pestañas..." (without "otras")
    expect(screen.getByText(/Cerrando pestañas|Closing tabs/i)).toBeInTheDocument();
  });

  it('should disable button during closure', async () => {
    const user = userEvent.setup();

    render(
      <TabConflictModal isVisible={true} onContinueThisTab={() => {}} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    expect(button).toBeDisabled();
  });

  it('should have accessibility attributes', () => {
    render(<TabConflictModal isVisible={true} onContinueThisTab={() => {}} />);

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    expect(button).toHaveAttribute('aria-label');
  });

  it('should reset state when visibility toggles', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    const { rerender } = render(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} closingTabCount={0} closedTabCount={0} />
    );

    const button = screen.getByText(/Continuar con esta pestaña|Continue with this tab/i);
    await user.click(button);

    rerender(
      <TabConflictModal isVisible={false} onContinueThisTab={mockCallback} closingTabCount={0} closedTabCount={0} />
    );

    rerender(
      <TabConflictModal isVisible={true} onContinueThisTab={mockCallback} closingTabCount={0} closedTabCount={0} />
    );

    expect(screen.getByText(/Continuar con esta pestaña|Continue with this tab/i)).toBeInTheDocument();
  });
});
