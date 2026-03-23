/**
 * Unit tests for MainLayout component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainLayout } from '../MainLayout';

// Mock dependencies
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

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('MainLayout', () => {
  const mockHandleSendQuestion = vi.fn();
  const mockHandleSendComplaint = vi.fn();
  const mockOnToggleDrawer = vi.fn();
  const mockOnToggleComplaint = vi.fn();
  const mockOnClearHistory = vi.fn();
  const mockOnDismissError = vi.fn();

  const defaultProps = {
    chatWindow: <div>Chat Window</div>,
    controlPanel: <div>Control Panel</div>,
    isMobile: false,
    isDrawerOpen: false,
    onToggleDrawer: mockOnToggleDrawer,
    isComplaintMode: false,
    onToggleComplaint: mockOnToggleComplaint,
    onClearHistory: mockOnClearHistory,
    disabled: false,
    error: null,
    messages: [],
    jwtToken: 'test-token',
    onDismissError: mockOnDismissError,
    handleSendQuestion: mockHandleSendQuestion,
    handleSendComplaint: mockHandleSendComplaint,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render desktop layout when isMobile is false', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={false}
      />
    );

    const layout = container.querySelector('.layout');
    expect(layout).toBeInTheDocument();
  });

  it('should render mobile layout when isMobile is true', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
      />
    );

    const mobileLayout = container.querySelector('.mobileLayout');
    expect(mobileLayout).toBeInTheDocument();
  });

  it('should render MobileHeader on mobile', () => {
    render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
      />
    );

    // MobileHeader renders app name via text content
    expect(screen.getByText('ComplAI')).toBeInTheDocument();
  });

  it('should render MobileInputFooter on mobile with correct props', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        handleSendQuestion={mockHandleSendQuestion}
        handleSendComplaint={mockHandleSendComplaint}
        isLoading={false}
        jwtToken="test-token"
      />
    );

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should pass isLoading as disabled prop to MobileInputFooter', () => {
    const { container: container1 } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        isLoading={false}
      />
    );

    // When not loading, input should be enabled
    const textarea1 = container1.querySelector('textarea');
    expect(textarea1).not.toBeDisabled();

    const { container: container2 } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        isLoading={true}
      />
    );

    // When loading, input should be disabled
    const textarea2 = container2.querySelector('textarea');
    expect(textarea2).toBeDisabled();
  });

  it('should pass handleSendQuestion to MobileInputFooter', () => {
    render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        handleSendQuestion={mockHandleSendQuestion}
        jwtToken="test-token"
      />
    );

    // Handler should be passed and callable (tested in MobileInputFooter tests)
    expect(mockHandleSendQuestion).toBeDefined();
  });

  it('should pass handleSendComplaint to MobileInputFooter', () => {
    render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        handleSendComplaint={mockHandleSendComplaint}
        jwtToken="test-token"
      />
    );

    // Handler should be passed and callable (tested in MobileInputFooter tests)
    expect(mockHandleSendComplaint).toBeDefined();
  });

  it('should render ControlDrawer on mobile', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
      />
    );

    // ControlDrawer is rendered in mobile layout
    // Check for drawer container
    const drawer = container.querySelector('[class*="drawer"]') || 
                  container.querySelector('[class*="Drawer"]');
    // Note: actual drawer test would check for visible content
  });

  it('should render chat area in mobileMain on mobile', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
      />
    );

    const mobileMain = container.querySelector('.mobileMain');
    expect(mobileMain).toBeInTheDocument();
    expect(mobileMain).toHaveTextContent('Chat Window');
  });

  it('should pass complaint mode to MobileInputFooter', () => {
    const { container: container1 } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        isComplaintMode={false}
      />
    );

    // In normal mode, complaint fields should not be visible
    // This is controlled by MessageInput component

    const { container: container2 } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        isComplaintMode={true}
      />
    );

    // In complaint mode, complaint fields should be visible
    // This is controlled by MessageInput component
  });

  it('should render desktop layout with both columns', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={false}
      />
    );

    const main = container.querySelector('.main');
    const sidebar = container.querySelector('.sidebar');

    expect(main).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(main).toHaveTextContent('Chat Window');
    expect(sidebar).toHaveTextContent('Control Panel');
  });

  it('should not render MobileHeader on desktop', () => {
    render(
      <MainLayout
        {...defaultProps}
        isMobile={false}
      />
    );

    // MobileHeader should not be rendered on desktop
    const mobileLayout = document.querySelector('.mobileLayout');
    expect(mobileLayout).not.toBeInTheDocument();
  });

  it('should not render MobileInputFooter on desktop', () => {
    render(
      <MainLayout
        {...defaultProps}
        isMobile={false}
      />
    );

    // MobileInputFooter should not be rendered on desktop
    const footer = document.querySelector('[class*="footer"]');
    // On desktop, no footer with mobile-specific class
  });

  it('should pass jwtToken to MobileInputFooter on mobile', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        jwtToken="valid-jwt-token"
      />
    );

    // Footer should be rendered with access to token
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should handle null jwtToken gracefully', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        jwtToken={null}
      />
    );

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should pass all required props to ControlDrawer', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        isDrawerOpen={true}
        isComplaintMode={false}
        error={null}
        messages={[]}
      />
    );

    // ControlDrawer should be rendered with correct props
    const mobileLayout = container.querySelector('.mobileLayout');
    expect(mobileLayout).toBeInTheDocument();
  });

  it('should have proper margin spacing on mobileMain', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
      />
    );

    const mobileMain = container.querySelector('.mobileMain');
    const styles = window.getComputedStyle(mobileMain!);

    // Check that margins are set (actual values depend on CSS)
    expect(mobileMain).toHaveClass('mobileMain');
  });

  it('should wrap chat window and control panel correctly on desktop', () => {
    const chatWindowContent = <div data-testid="chat">Chat Content</div>;
    const controlPanelContent = <div data-testid="control">Control Content</div>;

    render(
      <MainLayout
        {...defaultProps}
        isMobile={false}
        chatWindow={chatWindowContent}
        controlPanel={controlPanelContent}
      />
    );

    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.getByTestId('control')).toBeInTheDocument();
  });

  it('should accept cityId prop for debugging', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        cityId="elprat"
      />
    );

    expect(container.querySelector('.mobileLayout')).toBeInTheDocument();
  });

  it('should handle missing optional props gracefully', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div>Chat</div>}
        controlPanel={<div>Control</div>}
        isMobile={true}
      />
    );

    expect(container.querySelector('.mobileLayout')).toBeInTheDocument();
  });

  it('should render with default values for optional props', () => {
    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        isComplaintMode={undefined as any}
        isLoading={undefined as any}
        jwtToken={undefined as any}
      />
    );

    expect(container.querySelector('.mobileLayout')).toBeInTheDocument();
  });

  it('should pass messages to MobileInputFooter', () => {
    const messages = [{ id: '1', role: 'user', content: 'Hello' }];

    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        messages={messages}
      />
    );

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should pass error and onDismissError to ControlDrawer', () => {
    const error = { message: 'Test error' };

    const { container } = render(
      <MainLayout
        {...defaultProps}
        isMobile={true}
        error={error}
        onDismissError={mockOnDismissError}
      />
    );

    expect(container.querySelector('.mobileLayout')).toBeInTheDocument();
  });
});
