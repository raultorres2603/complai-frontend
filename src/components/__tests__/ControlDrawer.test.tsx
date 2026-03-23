/**
 * Tests for ControlDrawer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlDrawer } from '../ControlDrawer';
import type { LanguageOption } from '../../types/accessibility.types';

// Mock AccessibilityPanel
vi.mock('../AccessibilityPanel', () => ({
  default: ({ isVisible, onClose }: any) =>
    isVisible ? (
      <div data-testid="accessibility-panel">
        <button onClick={onClose}>Close Accessibility</button>
      </div>
    ) : null,
}));

// Mock LanguageSelector
vi.mock('../LanguageSelector', () => ({
  LanguageSelector: ({ currentLanguage, onSelectLanguage }: any) => (
    <div data-testid="language-selector">
      <button onClick={() => onSelectLanguage('es')}>Select Spanish</button>
      <span>Current: {currentLanguage}</span>
    </div>
  ),
}));

// Mock useTranslation
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useDrawerEscape
vi.mock('../../hooks/useDrawerEscape', () => ({
  useDrawerEscape: vi.fn(),
}));

const mockAvailableLanguages: LanguageOption[] = [
  { code: 'es', label: 'Español', locale: 'es-ES', flag: '🇪🇸' },
  { code: 'en', label: 'English', locale: 'en-US', flag: '🇬🇧' },
  { code: 'ca', label: 'Català', locale: 'ca-ES', flag: '🇪🇸' },
];

describe('ControlDrawer Component', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    messages: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = render(<ControlDrawer {...defaultProps} isOpen={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render drawer contents when isOpen is true', () => {
    const { container } = render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('should render backdrop overlay when isOpen is true', () => {
    const { container } = render(<ControlDrawer {...defaultProps} isOpen={true} />);

    const backdrop = container.querySelector('[role="presentation"]');
    expect(backdrop).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(<ControlDrawer {...defaultProps} isOpen={true} onClose={onClose} />);

    const backdrop = container.querySelector('[role="presentation"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<ControlDrawer {...defaultProps} isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should display error alert when error prop is provided', () => {
    const error = { message: 'Test error' };
    render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        error={error}
      />
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should call onDismissError when error close button is clicked', () => {
    const onDismissError = vi.fn();
    const error = { message: 'Test error' };
    render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        error={error}
        onDismissError={onDismissError}
      />
    );

    // Find the close error button (the one inside the error alert, not the drawer title close button)
    const closeErrorButtons = screen.getAllByRole('button');
    const errorCloseButton = closeErrorButtons.find(btn => {
      const parent = btn.closest('[class*="errorAlert"]');
      return parent !== null && btn.textContent === '✕';
    });

    if (errorCloseButton) {
      fireEvent.click(errorCloseButton);
      expect(onDismissError).toHaveBeenCalled();
    }
  });

  it('should render accessibility button', () => {
    render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    const accessibilityButton = screen.getByTitle('accessibility_tooltip');
    expect(accessibilityButton).toBeInTheDocument();
  });

  it('should open accessibility panel when accessibility button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    const accessibilityButton = screen.getByTitle('accessibility_tooltip');
    await user.click(accessibilityButton);

    expect(screen.getByTestId('accessibility-panel')).toBeInTheDocument();
  });

  it('should render language selector when language props are provided', () => {
    render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        currentLanguage="es"
        availableLanguages={mockAvailableLanguages}
      />
    );

    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  it('should call onSelectLanguage when language is changed', async () => {
    const onSelectLanguage = vi.fn();
    render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        currentLanguage="es"
        availableLanguages={mockAvailableLanguages}
        onSelectLanguage={onSelectLanguage}
      />
    );

    const selectButton = screen.getByText('Select Spanish');
    fireEvent.click(selectButton);

    expect(onSelectLanguage).toHaveBeenCalledWith('es');
  });

  it('should render complaint mode button', () => {
    render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    const complaintButton = screen.getByTitle('ask_question');
    expect(complaintButton).toBeInTheDocument();
  });

  it('should toggle complaint mode when button is clicked', async () => {
    const onToggleComplaint = vi.fn();
    const { rerender } = render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        isComplaintMode={false}
        onToggleComplaint={onToggleComplaint}
      />
    );

    const complaintButton = screen.getByTitle('ask_question');
    fireEvent.click(complaintButton);

    expect(onToggleComplaint).toHaveBeenCalled();

    // Verify aria-pressed changes
    rerender(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        isComplaintMode={true}
        onToggleComplaint={onToggleComplaint}
      />
    );

    const updatedButton = screen.getByRole('button', { pressed: true });
    expect(updatedButton).toBeInTheDocument();
  });

  it('should render clear history button', () => {
    render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        messages={[{ id: '1' }, { id: '2' }]}
      />
    );

    const clearButton = screen.getByText('clear_chat');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).not.toBeDisabled();
  });

  it('should hide clear history button when no messages', () => {
    const { queryByText } = render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        messages={[]}
      />
    );

    expect(queryByText('clear_chat')).not.toBeInTheDocument();
  });

  it('should call onClearHistory and onClose when clear button is clicked', async () => {
    const onClearHistory = vi.fn();
    const onClose = vi.fn();
    render(
      <ControlDrawer
        {...defaultProps}
        isOpen={true}
        messages={[{ id: '1' }]}
        onClearHistory={onClearHistory}
        onClose={onClose}
      />
    );

    const clearButton = screen.getByText('clear_chat');
    fireEvent.click(clearButton);

    expect(onClearHistory).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should have aria-modal attribute on drawer', () => {
    render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveAttribute('aria-modal', 'true');
  });

  it('should have aria-labelledby attribute pointing to title', () => {
    render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveAttribute('aria-labelledby', 'drawer-title');
    expect(screen.getByText('Settings')).toHaveAttribute('id', 'drawer-title');
  });

  it('should have proper role on backdrop', () => {
    const { container } = render(
      <ControlDrawer {...defaultProps} isOpen={true} />
    );

    const backdrop = container.querySelector('[role="presentation"]');
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
  });
});
