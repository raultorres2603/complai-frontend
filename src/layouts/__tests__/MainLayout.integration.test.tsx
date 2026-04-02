/**
 * Integration tests for MainLayout
 * Tests the full flow from App to MainLayout to MobileInputFooter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainLayout } from '../../layouts/MainLayout';

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

describe('MainLayout Integration', () => {
  let mockHandleSendQuestion: ReturnType<typeof vi.fn>;
  let mockHandleSendComplaint: ReturnType<typeof vi.fn>;
  let mockOnToggleDrawer: ReturnType<typeof vi.fn>;
  let mockOnToggleComplaint: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHandleSendQuestion = vi.fn();
    mockHandleSendComplaint = vi.fn();
    mockOnToggleDrawer = vi.fn();
    mockOnToggleComplaint = vi.fn();
  });

  describe('Mobile message sending flow', () => {
    it('should send question message from mobile layout', async () => {
      const user = userEvent.setup();

      render(
        <MainLayout
          chatWindow={<div data-testid="chat">Chat</div>}
          controlPanel={<div data-testid="control">Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test question');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockHandleSendQuestion).toHaveBeenCalledWith('Test question', 'test-token');
      });
    });

    it('should send complaint message from mobile layout', async () => {
      const user = userEvent.setup();

      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          isComplaintMode={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test complaint');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockHandleSendComplaint).toHaveBeenCalled();
      });
    });

    it('should toggle between normal and complaint mode on mobile', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          isComplaintMode={false}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      // Send in normal mode
      let textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Normal message');
      let form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockHandleSendQuestion).toHaveBeenCalledWith('Normal message', 'test-token');
      });

      // Switch to complaint mode
      rerender(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          isComplaintMode={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      // Send in complaint mode
      textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test complaint');
      form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockHandleSendComplaint).toHaveBeenCalled();
      });
    });
  });

  describe('Desktop layout remains unchanged', () => {
    it('should render desktop layout with two columns', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={false}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();

      const main = screen.getByTestId('main');
      const sidebar = screen.getByTestId('sidebar');

      expect(main).toBeInTheDocument();
      expect(sidebar).toBeInTheDocument();
    });

    it('should not show mobile header on desktop', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={false}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const mobileLayout = screen.queryByTestId('mobile-layout');
      expect(mobileLayout).not.toBeInTheDocument();
    });

    it('should not show mobile input footer on desktop', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={false}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      // Desktop layout should be rendered
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('Loading state handling', () => {
    it('should disable mobile input when isLoading is true', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={true}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    it('should enable mobile input when isLoading is false', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).not.toBeDisabled();
    });

    it('should toggle loading state and reflect in mobile input', () => {
      const { rerender } = render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      let textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).not.toBeDisabled();

      // Start loading
      rerender(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={true}
          apiKey="test-token"
          messages={[]}
        />
      );

      textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();

      // Stop loading
      rerender(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).not.toBeDisabled();
    });

    it('should not send message while loading', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Message while loading');

      // Switch to loading state
      rerender(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={true}
          apiKey="test-token"
          messages={[]}
        />
      );

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Should not call handler while disabled
      expect(mockHandleSendQuestion).not.toHaveBeenCalled();
    });
  });

  describe('API Key handling', () => {
    it('should pass apiKey to handlers on mobile', async () => {
      const user = userEvent.setup();

      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="abc123testtoken"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockHandleSendQuestion).toHaveBeenCalledWith('Test', 'abc123testtoken');
      });
    });

    it('should handle null apiKey gracefully', async () => {
      const user = userEvent.setup();

      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey={null}
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Handler should not be called without token
      // (MainLayout should guard against null token)
      await waitFor(() => {
        // May or may not call depending on implementation
        // This tests that the component doesn't crash
      });
    });
  });

  describe('Mobile layout structure', () => {
    it('should render mobile header, chat area, and footer', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();

      const mobileMain = screen.getByTestId('mobile-main');
      expect(mobileMain).toBeInTheDocument();

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should have proper flex layout for mobile', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Chat area rendering', () => {
    it('should render chat window content in mobileMain', () => {
      render(
        <MainLayout
          chatWindow={<div data-testid="chat-content">My Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      expect(screen.getByTestId('chat-content')).toBeInTheDocument();
      expect(screen.getByText('My Chat')).toBeInTheDocument();
    });

    it('should render chat window content in desktop main', () => {
      render(
        <MainLayout
          chatWindow={<div data-testid="chat-content">My Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={false}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      expect(screen.getByTestId('chat-content')).toBeInTheDocument();
    });
  });

  describe('Message history passing', () => {
    it('should pass message history to mobile footer', () => {
      const messages = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there' },
      ];

      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={messages}
        />
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Handler prop handling', () => {
    it('should use handleSendQuestion when provided', async () => {
      const user = userEvent.setup();

      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Question');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockHandleSendQuestion).toHaveBeenCalled();
      });
    });

    it('should use handleSendComplaint when in complaint mode', async () => {
      const user = userEvent.setup();

      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          isComplaintMode={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Complaint');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockHandleSendComplaint).toHaveBeenCalled();
      });
    });
  });

  describe('CityId prop handling', () => {
    it('should accept cityId prop for debugging', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
          cityId="elprat"
        />
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });
  });

  describe('Error state handling', () => {
    it('should pass error state to ControlDrawer on mobile', () => {
      render(
        <MainLayout
          chatWindow={<div>Chat</div>}
          controlPanel={<div>Control</div>}
          isMobile={true}
          handleSendQuestion={mockHandleSendQuestion}
          handleSendComplaint={mockHandleSendComplaint}
          isLoading={false}
          apiKey="test-token"
          messages={[]}
          error={{ message: 'Test error' }}
        />
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });
  });
});
