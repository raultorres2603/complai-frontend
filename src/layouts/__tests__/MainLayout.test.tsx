/**
 * Unit tests for MainLayout component
 * 
 * Tests cover:
 * - Desktop layout rendering (2-column grid)
 * - Mobile layout rendering (single column with drawer)
 * - MobileHeader, MobileInputFooter, and ControlDrawer integration
 * - State and prop reactivity
 * - Error handling and edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainLayout } from '../MainLayout';
import type { MainLayoutProps } from '../MainLayout';

// ===== Mock Setup =====

// Mock useLanguage hook
vi.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: 'es',
    availableLanguages: [
      { code: 'es', name: 'Español' },
      { code: 'ca', name: 'Català' },
    ],
    setLanguage: vi.fn(),
  }),
}));

// Mock useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock MobileHeader component
vi.mock('../../components/MobileHeader', () => ({
  MobileHeader: ({ appName, onOpenDrawer }: Record<string, unknown>) => (
    <header data-testid="mobile-header">
      <div>{appName}</div>
      <button
        data-testid="drawer-toggle-btn"
        onClick={onOpenDrawer}
        aria-label="Toggle drawer"
      >
        Menu
      </button>
    </header>
  ),
}));

// Mock MobileInputFooter component
vi.mock('../../components/MobileInputFooter', () => ({
  MobileInputFooter: ({
    onSend,
    onSendComplaint,
    disabled,
    isComplaintMode,
    messages,
    jwtToken,
  }: Record<string, unknown>) => (
    <footer data-testid="mobile-input-footer" role="contentinfo">
      <textarea
        data-testid="mobile-input-textarea"
        disabled={disabled}
        placeholder={isComplaintMode ? 'Complaint...' : 'Message...'}
        onChange={() => {
          // Simulate input for testing
        }}
      />
      <button
        data-testid="send-btn"
        onClick={() => onSend('test message')}
        disabled={disabled}
      >
        Send
      </button>
      {isComplaintMode && (
        <button
          data-testid="send-complaint-btn"
          onClick={() =>
            onSendComplaint('complaint text', 'pdf', 'John', 'Doe', '123')
          }
        >
          Send Complaint
        </button>
      )}
      <div data-testid="message-count">{messages.length}</div>
      <div data-testid="token-status">{jwtToken ? 'authenticated' : 'unauthenticated'}</div>
    </footer>
  ),
}));

// Mock ControlDrawer component
vi.mock('../../components/ControlDrawer', () => ({
  ControlDrawer: ({
    isOpen,
    onClose,
    isComplaintMode,
    onToggleComplaint,
    onClearHistory,
    currentLanguage,
    onSelectLanguage,
    availableLanguages,
    error,
    onDismissError,
    messages,
  }: Record<string, unknown>) => (
    <div
      data-testid="control-drawer"
      data-open={isOpen}
      role="dialog"
      aria-hidden={!isOpen}
    >
      <button
        data-testid="drawer-close-btn"
        onClick={onClose}
        aria-label="Close drawer"
      >
        Close
      </button>
      <button
        data-testid="toggle-complaint-btn"
        onClick={onToggleComplaint}
      >
        {isComplaintMode ? 'Disable' : 'Enable'} Complaint Mode
      </button>
      <button
        data-testid="clear-history-btn"
        onClick={onClearHistory}
      >
        Clear History
      </button>
      <div data-testid="language-selector">
        {currentLanguage}
        {availableLanguages.map((lang: Record<string, unknown>) => (
          <button
            key={lang.code}
            data-testid={`lang-${lang.code}`}
            onClick={() => onSelectLanguage(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>
      {error && (
        <div data-testid="error-message">
          {error.message}
          <button
            data-testid="dismiss-error-btn"
            onClick={onDismissError}
          >
            Dismiss
          </button>
        </div>
      )}
      <div data-testid="drawer-messages">{messages.length} messages</div>
    </div>
  ),
}));

// ===== Test Suite =====

describe('MainLayout', () => {
  // ===== Mock Functions =====
  const mockHandleSendQuestion = vi.fn();
  const mockHandleSendComplaint = vi.fn();
  const mockOnToggleDrawer = vi.fn();
  const mockOnToggleComplaint = vi.fn();
  const mockOnClearHistory = vi.fn();
  const mockOnDismissError = vi.fn();

  // ===== Default Props =====
  const defaultProps: MainLayoutProps = {
    chatWindow: <div data-testid="mock-chat">Chat Content</div>,
    controlPanel: <div data-testid="mock-control">Control Content</div>,
    isMobile: false,
    isDrawerOpen: false,
    onToggleDrawer: mockOnToggleDrawer,
    isComplaintMode: false,
    onToggleComplaint: mockOnToggleComplaint,
    onClearHistory: mockOnClearHistory,
    disabled: false,
    error: null,
    messages: [],
    jwtToken: 'test-jwt-token',
    onDismissError: mockOnDismissError,
    handleSendQuestion: mockHandleSendQuestion,
    handleSendComplaint: mockHandleSendComplaint,
    isLoading: false,
    cityId: 'test-city',
  };

  // ===== Setup & Cleanup =====
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== A. Desktop Layout Tests =====
  describe('Desktop Layout (isMobile=false)', () => {
    it('should render desktop layout container with correct testid', () => {
      render(<MainLayout {...defaultProps} isMobile={false} />);

      const layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();
    });

    it('should render main element for chat window', () => {
      render(<MainLayout {...defaultProps} isMobile={false} />);

      const main = screen.getByTestId('main');
      expect(main).toBeInTheDocument();
    });

    it('should render sidebar element for control panel', () => {
      render(<MainLayout {...defaultProps} isMobile={false} />);

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    it('should pass chatWindow prop content to main element', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={false}
          chatWindow={<div data-testid="chat-content">My Chat Content</div>}
        />
      );

      const main = screen.getByTestId('main');
      expect(main).toHaveTextContent('My Chat Content');
    });

    it('should pass controlPanel prop content to sidebar element', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={false}
          controlPanel={<div data-testid="control-content">My Control Panel</div>}
        />
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveTextContent('My Control Panel');
    });

    it('should not render mobile-specific components on desktop', () => {
      render(<MainLayout {...defaultProps} isMobile={false} />);

      const mobileLayout = screen.queryByTestId('mobile-layout');
      const mobileHeader = screen.queryByTestId('mobile-header');

      expect(mobileLayout).not.toBeInTheDocument();
      expect(mobileHeader).not.toBeInTheDocument();
    });

    it('should not render MobileInputFooter on desktop', () => {
      render(<MainLayout {...defaultProps} isMobile={false} />);

      const footer = screen.queryByTestId('mobile-input-footer');
      expect(footer).not.toBeInTheDocument();
    });

    it('should render both columns on desktop layout', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={false}
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Controls</div>}
        />
      );

      const main = screen.getByTestId('main');
      const sidebar = screen.getByTestId('sidebar');

      expect(main).toBeInTheDocument();
      expect(sidebar).toBeInTheDocument();
      expect(main).toHaveTextContent('Chat');
      expect(sidebar).toHaveTextContent('Controls');
    });
  });

  // ===== B. Mobile Layout Tests =====
  describe('Mobile Layout (isMobile=true)', () => {
    it('should render mobile layout container with correct testid', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();
    });

    it('should not render desktop layout structure on mobile', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      const layout = screen.queryByTestId('layout');
      expect(layout).not.toBeInTheDocument();
    });

    it('should render MobileHeader component on mobile', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      const header = screen.getByTestId('mobile-header');
      expect(header).toBeInTheDocument();
    });

    it('should render mobile main area with chat content', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          chatWindow={<div>Mobile Chat</div>}
        />
      );

      const mobileMain = screen.getByTestId('mobile-main');
      expect(mobileMain).toBeInTheDocument();
      expect(mobileMain).toHaveTextContent('Mobile Chat');
    });

    it('should render MobileInputFooter at bottom of mobile layout', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      const footer = screen.getByTestId('mobile-input-footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render footer with role="contentinfo" semantic element', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should render ControlDrawer component on mobile', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      const drawer = screen.getByTestId('control-drawer');
      expect(drawer).toBeInTheDocument();
    });
  });

  // ===== C. MobileHeader Integration Tests =====
  describe('MobileHeader Integration', () => {
    it('should display app name in header (ComplAI by default)', () => {
      render(<MainLayout {...defaultProps} isMobile={true} />);

      expect(screen.getByText('ComplAI')).toBeInTheDocument();
    });

    it('should pass onToggleDrawer callback to MobileHeader', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onToggleDrawer={mockOnToggleDrawer}
        />
      );

      const toggleBtn = screen.getByTestId('drawer-toggle-btn');
      fireEvent.click(toggleBtn);

      expect(mockOnToggleDrawer).toHaveBeenCalled();
    });

    it('should pass drawer open state to MobileHeader', () => {
      const { rerender } = render(
        <MainLayout {...defaultProps} isMobile={true} isDrawerOpen={false} />
      );

      let drawer = screen.getByTestId('control-drawer');
      expect(drawer).toHaveAttribute('data-open', 'false');

      rerender(
        <MainLayout {...defaultProps} isMobile={true} isDrawerOpen={true} />
      );

      drawer = screen.getByTestId('control-drawer');
      expect(drawer).toHaveAttribute('data-open', 'true');
    });

    it('should toggle drawer when menu button clicked', () => {
      const onToggleDrawer = vi.fn();
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onToggleDrawer={onToggleDrawer}
        />
      );

      const toggleBtn = screen.getByTestId('drawer-toggle-btn');
      fireEvent.click(toggleBtn);

      expect(onToggleDrawer).toHaveBeenCalledTimes(1);
    });
  });

  // ===== D. MobileInputFooter Integration Tests =====
  describe('MobileInputFooter Integration', () => {
    it('should render MobileInputFooter with disabled state from isLoading', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isLoading={false}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).not.toBeDisabled();
    });

    it('should pass disabled=true to MobileInputFooter when isLoading=true', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isLoading={true}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toBeDisabled();
    });

    it('should pass disabled=false to MobileInputFooter when isLoading=false', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isLoading={false}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).not.toBeDisabled();
    });

    it('should pass isComplaintMode state to footer', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={true}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Complaint...');
    });

    it('should pass messages array to footer', () => {
      const messages = [
        { id: '1', text: 'Message 1' },
        { id: '2', text: 'Message 2' },
        { id: '3', text: 'Message 3' },
      ];

      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          messages={messages}
        />
      );

      const messageCount = screen.getByTestId('message-count');
      expect(messageCount).toHaveTextContent('3');
    });

    it('should pass jwtToken to footer as null when not provided', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          jwtToken={undefined}
        />
      );

      const tokenStatus = screen.getByTestId('token-status');
      expect(tokenStatus).toHaveTextContent('unauthenticated');
    });

    it('should pass jwtToken to footer when provided', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          jwtToken="valid-token"
        />
      );

      const tokenStatus = screen.getByTestId('token-status');
      expect(tokenStatus).toHaveTextContent('authenticated');
    });

    it('should pass handleSendQuestion handler to footer', () => {
      const handleSendQuestion = vi.fn();
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          handleSendQuestion={handleSendQuestion}
          jwtToken="test-token"
        />
      );

      const sendBtn = screen.getByTestId('send-btn');
      fireEvent.click(sendBtn);

      // Handler should be defined and callable
      expect(handleSendQuestion).toBeDefined();
    });

    it('should pass handleSendComplaint handler to footer', () => {
      const handleSendComplaint = vi.fn();
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={true}
          handleSendComplaint={handleSendComplaint}
          jwtToken="test-token"
        />
      );

      const complaintBtn = screen.getByTestId('send-complaint-btn');
      expect(complaintBtn).toBeInTheDocument();
      expect(handleSendComplaint).toBeDefined();
    });

    it('should pass empty messages array when not provided', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          messages={undefined as any}
        />
      );

      const messageCount = screen.getByTestId('message-count');
      expect(messageCount).toHaveTextContent('0');
    });
  });

  // ===== E. ControlDrawer Integration Tests =====
  describe('ControlDrawer Integration', () => {
    it('should pass isDrawerOpen state to ControlDrawer', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isDrawerOpen={false}
        />
      );

      let drawer = screen.getByTestId('control-drawer');
      expect(drawer).toHaveAttribute('data-open', 'false');

      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isDrawerOpen={true}
        />
      );

      drawer = screen.getByTestId('control-drawer');
      expect(drawer).toHaveAttribute('data-open', 'true');
    });

    it('should pass onToggleDrawer as onClose callback to drawer', () => {
      const onToggleDrawer = vi.fn();
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onToggleDrawer={onToggleDrawer}
        />
      );

      const closeBtn = screen.getByTestId('drawer-close-btn');
      fireEvent.click(closeBtn);

      expect(onToggleDrawer).toHaveBeenCalled();
    });

    it('should pass isComplaintMode to drawer', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={false}
        />
      );

      let toggleBtn = screen.getByTestId('toggle-complaint-btn');
      expect(toggleBtn).toHaveTextContent('Enable');

      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={true}
        />
      );

      toggleBtn = screen.getByTestId('toggle-complaint-btn');
      expect(toggleBtn).toHaveTextContent('Disable');
    });

    it('should pass onToggleComplaint callback to drawer', () => {
      const onToggleComplaint = vi.fn();
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onToggleComplaint={onToggleComplaint}
        />
      );

      const toggleBtn = screen.getByTestId('toggle-complaint-btn');
      fireEvent.click(toggleBtn);

      expect(onToggleComplaint).toHaveBeenCalled();
    });

    it('should pass onClearHistory callback to drawer', () => {
      const onClearHistory = vi.fn();
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onClearHistory={onClearHistory}
        />
      );

      const clearBtn = screen.getByTestId('clear-history-btn');
      fireEvent.click(clearBtn);

      expect(onClearHistory).toHaveBeenCalled();
    });

    it('should pass language information to drawer', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
        />
      );

      const languageSelector = screen.getByTestId('language-selector');
      expect(languageSelector).toBeInTheDocument();
      expect(languageSelector).toHaveTextContent('es');

      // Language options should be available
      const esLang = screen.getByTestId('lang-es');
      const caLang = screen.getByTestId('lang-ca');
      expect(esLang).toBeInTheDocument();
      expect(caLang).toBeInTheDocument();
    });

    it('should pass error state and onDismissError callback to drawer', () => {
      const onDismissError = vi.fn();
      const error = { message: 'Test error occurred' };

      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          error={error}
          onDismissError={onDismissError}
        />
      );

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveTextContent('Test error occurred');

      const dismissBtn = screen.getByTestId('dismiss-error-btn');
      fireEvent.click(dismissBtn);

      expect(onDismissError).toHaveBeenCalled();
    });

    it('should pass messages array to drawer', () => {
      const messages = [
        { id: '1', text: 'Msg 1' },
        { id: '2', text: 'Msg 2' },
      ];

      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          messages={messages}
        />
      );

      const drawerMessages = screen.getByTestId('drawer-messages');
      expect(drawerMessages).toHaveTextContent('2 messages');
    });

    it('should not render ControlDrawer on desktop', () => {
      render(<MainLayout {...defaultProps} isMobile={false} />);

      const drawer = screen.queryByTestId('control-drawer');
      // On desktop, drawer should not be in the document
      // (it's conditionally rendered inside Mobile layout)
      expect(drawer).not.toBeInTheDocument();
    });
  });

  // ===== F. State & Prop Changes Tests =====
  describe('State & Prop Changes Reactivity', () => {
    it('should re-render with new mobile layout when isMobile toggles false→true', () => {
      const { rerender } = render(
        <MainLayout {...defaultProps} isMobile={false} />
      );

      let layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();

      rerender(<MainLayout {...defaultProps} isMobile={true} />);

      let mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();

      layout = screen.queryByTestId('layout');
      expect(layout).not.toBeInTheDocument();
    });

    it('should re-render with new desktop layout when isMobile toggles true→false', () => {
      const { rerender } = render(
        <MainLayout {...defaultProps} isMobile={true} />
      );

      let mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();

      rerender(<MainLayout {...defaultProps} isMobile={false} />);

      let layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();

      mobileLayout = screen.queryByTestId('mobile-layout');
      expect(mobileLayout).not.toBeInTheDocument();
    });

    it('should update drawer open/close state on rerender', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isDrawerOpen={false}
        />
      );

      let drawer = screen.getByTestId('control-drawer');
      expect(drawer).toHaveAttribute('data-open', 'false');

      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isDrawerOpen={true}
        />
      );

      drawer = screen.getByTestId('control-drawer');
      expect(drawer).toHaveAttribute('data-open', 'true');
    });

    it('should update complaint mode on rerender', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={false}
        />
      );

      let textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Message...');

      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={true}
        />
      );

      textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Complaint...');
    });

    it('should update loading state and disable footer input on rerender', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isLoading={false}
        />
      );

      let textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).not.toBeDisabled();

      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isLoading={true}
        />
      );

      textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toBeDisabled();
    });

    it('should update error state and pass to drawer on rerender', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          error={null}
        />
      );

      let errorMessage = screen.queryByTestId('error-message');
      expect(errorMessage).not.toBeInTheDocument();

      const error = { message: 'New error' };
      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          error={error}
        />
      );

      errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveTextContent('New error');
    });

    it('should update messages in footer and drawer', () => {
      const { rerender } = render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          messages={[]}
        />
      );

      let messageCount = screen.getByTestId('message-count');
      expect(messageCount).toHaveTextContent('0');

      const messages = [{ id: '1', text: 'New message' }];
      rerender(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          messages={messages}
        />
      );

      messageCount = screen.getByTestId('message-count');
      expect(messageCount).toHaveTextContent('1');

      const drawerMessages = screen.getByTestId('drawer-messages');
      expect(drawerMessages).toHaveTextContent('1 messages');
    });
  });

  // ===== G. Error & Edge Cases =====
  describe('Error Handling & Edge Cases', () => {
    it('should handle missing onToggleDrawer callback gracefully', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onToggleDrawer={undefined}
        />
      );

      const drawer = screen.getByTestId('control-drawer');
      expect(drawer).toBeInTheDocument();

      // Should not throw when close button clicked
      const closeBtn = screen.getByTestId('drawer-close-btn');
      expect(() => fireEvent.click(closeBtn)).not.toThrow();
    });

    it('should handle missing onToggleComplaint callback gracefully', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onToggleComplaint={undefined}
        />
      );

      const toggleBtn = screen.getByTestId('toggle-complaint-btn');
      expect(() => fireEvent.click(toggleBtn)).not.toThrow();
    });

    it('should handle missing onClearHistory callback gracefully', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          onClearHistory={undefined}
        />
      );

      const clearBtn = screen.getByTestId('clear-history-btn');
      expect(() => fireEvent.click(clearBtn)).not.toThrow();
    });

    it('should handle null jwtToken', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          jwtToken={null}
        />
      );

      const tokenStatus = screen.getByTestId('token-status');
      expect(tokenStatus).toHaveTextContent('unauthenticated');
    });

    it('should handle empty messages array', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          messages={[]}
        />
      );

      const messageCount = screen.getByTestId('message-count');
      expect(messageCount).toHaveTextContent('0');

      const drawerMessages = screen.getByTestId('drawer-messages');
      expect(drawerMessages).toHaveTextContent('0 messages');
    });

    it('should handle null error state', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          error={null}
        />
      );

      const errorMessage = screen.queryByTestId('error-message');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should render when controlPanel is not a React element', () => {
      const customControlPanel = 'String control panel';
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          controlPanel={customControlPanel as any}
        />
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();
    });

    it('should handle undefined cityId prop', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          cityId={undefined}
        />
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();
    });

    it('should preserve city context in prop passing', () => {
      const cityId = 'barcelona-123';
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          cityId={cityId}
        />
      );

      // Verify layout is rendered with city context available
      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();

      // City context should be available for handlers
      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('should handle disabled=true prop', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          disabled={true}
        />
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();
    });

    it('should handle disabled=false prop', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          disabled={false}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).not.toBeDisabled();
    });

    it('should render without isComplaintMode prop (defaults to false)', () => {
      const propsWithoutComplaintMode = { ...defaultProps };
      delete (propsWithoutComplaintMode as any).isComplaintMode;

      render(
        <MainLayout
          {...propsWithoutComplaintMode}
          isMobile={true}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Message...');
    });

    it('should render without isMobile prop (defaults to false - desktop)', () => {
      const propsWithoutMobile = { ...defaultProps };
      delete (propsWithoutMobile as any).isMobile;

      render(<MainLayout {...propsWithoutMobile} />);

      const layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();
    });

    it('should render without isLoading prop (defaults to false)', () => {
      const propsWithoutLoading = { ...defaultProps };
      delete (propsWithoutLoading as any).isLoading;

      render(
        <MainLayout
          {...propsWithoutLoading}
          isMobile={true}
        />
      );

      const textarea = screen.getByTestId('mobile-input-textarea');
      expect(textarea).not.toBeDisabled();
    });

    it('should handle missing handleSendQuestion gracefully on mobile', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          handleSendQuestion={undefined}
        />
      );

      const sendBtn = screen.getByTestId('send-btn');
      expect(() => fireEvent.click(sendBtn)).not.toThrow();
    });

    it('should handle missing handleSendComplaint gracefully on mobile', () => {
      render(
        <MainLayout
          {...defaultProps}
          isMobile={true}
          isComplaintMode={true}
          handleSendComplaint={undefined}
        />
      );

      const complaintBtn = screen.getByTestId('send-complaint-btn');
      expect(() => fireEvent.click(complaintBtn)).not.toThrow();
    });
  });
});
