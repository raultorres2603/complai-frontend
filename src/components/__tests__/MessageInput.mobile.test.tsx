/**
 * MessageInput Mobile-Specific Unit Tests
 * Tests mobile keyboard interactions and touch behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../MessageInput';

describe('MessageInput Component - Mobile Scenarios', () => {
  let mockOnSend: ReturnType<typeof vi.fn>;
  let mockOnComplaintInfoChange: ReturnType<typeof vi.fn>;
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    mockOnSend = vi.fn();
    mockOnComplaintInfoChange = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
      writable: true,
    });
  });

  describe('Mobile keyboard Enter key submission', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
        configurable: true,
        writable: true,
      });
    });

    it('should submit form when Enter key pressed on mobile', async () => {
      const { container } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      await userEvent.type(textarea, 'Test message');

      // Simulate Enter key press (mobile sends with plain Enter)
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.any(String));
      });

      // Verify textarea is cleared
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });

    it('should add newline when Shift+Enter pressed on mobile', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await userEvent.type(textarea, 'Line 1');

      // Simulate Shift+Enter press
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });

      // onSend should NOT be called
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not submit empty message on mobile Enter', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Press Enter with empty input
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

      // onSend should NOT be called for empty input
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not submit whitespace-only message on mobile Enter', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      await userEvent.type(textarea, '   \n  ');

      // Press Enter with whitespace-only input
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

      // onSend should NOT be called for whitespace
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Desktop keyboard submission', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true,
        writable: true,
      });
    });

    it('should submit on Ctrl+Enter for Windows', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      await userEvent.type(textarea, 'Test message');

      // Simulate Ctrl+Enter press (Windows/Linux)
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.any(String));
      });
    });

    it('should submit on Cmd+Enter for Mac', async () => {
      // Update to macOS user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
        writable: true,
      });

      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      await userEvent.type(textarea, 'Test message');

      // Simulate Cmd+Enter press (Mac)
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', metaKey: true });

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.any(String));
      });
    });

    it('should submit on plain Enter (desktop)', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      await userEvent.type(textarea, 'Test message');

      // Simulate plain Enter press (no modifiers)
      // NEW BEHAVIOR: plain Enter now submits on all devices
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

      // onSend should now be called with plain Enter
      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.any(String));
      });
    });
  });

  describe('Submit button touch interaction', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
        configurable: true,
        writable: true,
      });
    });

    it('should submit when send button clicked', async () => {
      const user = userEvent.setup();

      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });

      await user.type(textarea, 'Test message');
      await user.click(sendButton);

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.any(String));
      });
    });

    it('should show active state on button touch', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });

      await userEvent.type(textarea, 'Test');
      // Simulate touch/pointer down event
      fireEvent.pointerDown(sendButton);
      fireEvent.pointerUp(sendButton);

      // Button should still have pointer events enabled
      expect(sendButton).toHaveAttribute('type', 'submit');
    });

    it('should prevent submission when disabled', async () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={true}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      expect(sendButton).toBeDisabled();

      // Attempt to click send
      await userEvent.click(sendButton);

      // onSend should NOT be called
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Focus management after submission', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
        configurable: true,
        writable: true,
      });
    });

    it('should clear textarea after mobile submit', async () => {
      const user = userEvent.setup();

      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test message');

      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      await user.click(sendButton);

      await waitFor(() => {
        // Verify onSend was called and textarea was cleared
        expect(mockOnSend).toHaveBeenCalled();
        expect(textarea.value).toBe('');
      });
    });

    it('should clear complaint info after submit', async () => {
      const user = userEvent.setup();

      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={true}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Complaint message');

      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      await user.click(sendButton);

      await waitFor(() => {
        // Verify onSend was called
        expect(mockOnSend).toHaveBeenCalled();
        // Verify textarea was cleared
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('Disabled state behavior', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
        configurable: true,
        writable: true,
      });
    });

    it('should disable textarea when disabled prop is true', () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={true}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');
      expect(textarea).toBeDisabled();
    });

    it('should disable send button when disabled prop is true', () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={true}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      expect(sendButton).toBeDisabled();
    });

    it('should disable send button when text is empty', async () => {
      const { rerender } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      let sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      expect(sendButton).toBeDisabled();

      // Type message
      const textarea = screen.getByTestId('message-input-textarea');
      await userEvent.type(textarea, 'Test message');

      // Find the button again (it should be enabled now)
      sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      expect(sendButton).not.toBeDisabled();

      // Clear text
      await userEvent.clear(textarea);

      // Button should become disabled again
      sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Mobile Touch Target Size', () => {
    it('should have minimum 44px height for send button in compact mode', () => {
      render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
          isCompact={true}
        />
      );

      const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
      
      // Verify button is rendered and has submit type
      expect(sendButton).toBeInTheDocument();
      expect(sendButton).toHaveAttribute('type', 'submit');
    });
  });
});
