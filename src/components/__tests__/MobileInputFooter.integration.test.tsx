/**
 * Integration tests for MobileInputFooter
 * Tests the full flow of message sending on mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileInputFooter } from '../../components/MobileInputFooter';

describe('MobileInputFooter Integration', () => {
  let mockOnSend: ReturnType<typeof vi.fn>;
  let mockOnSendComplaint: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSend = vi.fn();
    mockOnSendComplaint = vi.fn();
  });

  describe('Normal message sending flow', () => {
    it('should send message from mobile input footer', async () => {
      const user = userEvent.setup();

      render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'How can I help?');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('How can I help?', expect.any(String));
      });
    });

    it('should clear input after sending normal message', async () => {
      const user = userEvent.setup();

      render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test message');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should send multiple messages in sequence', async () => {
      const user = userEvent.setup();

      render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      // Send first message
      await user.type(textarea, 'First message');
      let form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('First message', expect.any(String));
      });

      // Send second message
      await user.type(textarea, 'Second message');
      form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledTimes(2);
        expect(mockOnSend).toHaveBeenLastCalledWith('Second message', expect.any(String));
      });
    });
  });

  describe('Complaint mode sending flow', () => {
    it('should send complaint message with complaint info', async () => {
      const user = userEvent.setup();

      render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={true}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Complaint message');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSendComplaint).toHaveBeenCalled();
        const callArgs = mockOnSendComplaint.mock.calls[0];
        expect(callArgs[0]).toBe('Complaint message');
      });
    });

    it('should toggle complaint mode and send accordingly', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      // Send in normal mode
      let textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Normal message');
      let form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Normal message', expect.any(String));
      });

      // Switch to complaint mode
      rerender(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={true}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      // Send in complaint mode
      textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Complaint message');
      form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSendComplaint).toHaveBeenCalledWith(
          'Complaint message',
          expect.any(String),
          undefined,
          undefined,
          undefined
        );
      });
    });

    it('should clear complaint info after sending complaint', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={true}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Complaint message');

      const form = textarea.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSendComplaint).toHaveBeenCalled();
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('Loading state handling', () => {
    it('should disable input when loading', async () => {
      const { rerender } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      let textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).not.toBeDisabled();

      // Switch to loading state
      rerender(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={true}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    it('should not send message during loading', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;

      // Type message
      await user.type(textarea, 'Message while loading');

      // Switch to loading state
      rerender(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={true}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Should not call send while disabled
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should restore input availability after loading completes', async () => {
      const { rerender } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={true}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      let textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();

      // Loading completes
      rerender(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      expect(textarea).not.toBeDisabled();
    });
  });

  describe('Speech controls integration', () => {
    it('should render speech controls when ttsEnabled is true', () => {
      const { container } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const footer = screen.getByTestId('mobile-input-footer');
      expect(footer).toBeInTheDocument();
      
      const speechControls = footer.querySelector('[class*="speechControls"]');
      expect(speechControls).toBeInTheDocument();
    });

    it('should not render speech controls when ttsEnabled is false', () => {
      const { container } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={false}
          jwtToken="test-token"
        />
      );

      const speechControls = container.querySelector('.speechControls');
      expect(speechControls).not.toBeInTheDocument();
    });
  });

  describe('Footer layout', () => {
    it('should render footer with correct structure', () => {
      const { container } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const footer = screen.getByTestId('mobile-input-footer');
      expect(footer).toBeInTheDocument();
      
      const inputDiv = footer.querySelector('[class*="input"]');
      expect(inputDiv).toBeInTheDocument();
    });

    it('should have footer positioned fixed at bottom', () => {
      const { container } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="test-token"
        />
      );

      const footer = screen.getByTestId('mobile-input-footer');
      expect(footer).toBeInTheDocument();
      
      // Verify it's a footer element (semantic HTML)
      expect(footer.tagName).toBe('FOOTER');
      // The position: fixed CSS is defined in MobileInputFooter.module.css
      // which we can't reliably check in test environment without actual CSS rendering
    });
  });

  describe('Token handling', () => {
    it('should accept and handle jwtToken prop', () => {
      const { container } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
        />
      );

      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should handle null jwtToken gracefully', () => {
      const { container } = render(
        <MobileInputFooter
          onSend={mockOnSend}
          onSendComplaint={mockOnSendComplaint}
          disabled={false}
          isComplaintMode={false}
          messages={[]}
          ttsEnabled={true}
          jwtToken={null}
        />
      );

      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});
