/**
 * MessageInput Component Tests - Tests for translation of placeholders and labels
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { MessageInput } from '../MessageInput';

describe('MessageInput Component Translation', () => {
  const mockOnSend = vi.fn();
  const mockOnComplaintInfoChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={false}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    // Should render textarea with question mode placeholder
    const textarea = screen.getByPlaceholderText(/Haz una pregunta|Ask a question|Fes una pregunta/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should display "Ask a question..." placeholder in question mode', async () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={false}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    const textarea = screen.getByPlaceholderText(/Haz una pregunta|Ask a question|Fes una pregunta/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder');
  });

  it('should display "Describe your complaint..." placeholder in complaint mode', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={true}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    const textarea = screen.getByPlaceholderText(/Describe tu reclamaci[oó]n|Describe your complaint|Descriu la teva reclamació/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should display translated "Send" button', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={false}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('should display complaint section when in complaint mode', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={true}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    // Should display Requester Information section
    expect(screen.getByText(/Informaci[oó]n del Solicitante|Requester Information|Informació del Solicitant/i)).toBeInTheDocument();
  });

  it('should display translated input field labels in complaint mode', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={true}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    // Check for translated placeholders
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);

    // Should have name, surname, and IDNumber inputs
    const placeholders = inputs
      .map(input => input.getAttribute('placeholder'))
      .join('|');

    expect(placeholders.toLowerCase()).toMatch(/nombre|name|nom/i);
  });

  it('should have translated send button tooltip', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={false}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });
    const title = sendButton.getAttribute('title');
    expect(title).toMatch(/mensaje|message|Ctrl/i);
  });

  it('should call onSend when message is submitted via button click', async () => {
    const { container, user } = render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={false}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    const textarea = screen.getByPlaceholderText(/Haz una pregunta|Ask a question|Fes una pregunta/i);
    const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });

    // Type message using user event
    await user.type(textarea, 'Test message');

    // Click send
    await user.click(sendButton);

    // onSend should be called
    expect(mockOnSend).toHaveBeenCalled();
  });

  describe('Enter key behavior', () => {
    it('should send message when Enter key is pressed', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Type message
      await user.type(textarea, 'Test message');

      // Press Enter
      await user.type(textarea, '{Enter}');

      // onSend should be called
      expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.anything());
    });

    it('should create a new line when Shift+Enter is pressed', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Type first line
      await user.type(textarea, 'First line');

      // Press Shift+Enter to create new line
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      // Type second line
      await user.type(textarea, 'Second line');

      // onSend should NOT be called yet
      expect(mockOnSend).not.toHaveBeenCalled();

      // Textarea should contain both lines
      expect(textarea).toHaveValue('First line\nSecond line');
    });

    it('should send message when Ctrl+Enter is pressed (backward compatibility)', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Type message
      await user.type(textarea, 'Test message');

      // Press Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}');

      // onSend should be called
      expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.anything());
    });

    it('should not send when Enter is pressed with disabled=true', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={true}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Type message
      await user.type(textarea, 'Test message');

      // Press Enter
      await user.type(textarea, '{Enter}');

      // onSend should NOT be called
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not send when Enter is pressed with empty message', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Press Enter without typing anything
      await user.type(textarea, '{Enter}');

      // onSend should NOT be called
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not send when Enter is pressed with only whitespace', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Type only spaces
      await user.type(textarea, '   ');

      // Press Enter
      await user.type(textarea, '{Enter}');

      // onSend should NOT be called
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should clear textarea after sending via Enter', async () => {
      const { user } = render(
        <MessageInput
          onSend={mockOnSend}
          disabled={false}
          isComplaintMode={false}
          onComplaintInfoChange={mockOnComplaintInfoChange}
        />
      );

      const textarea = screen.getByTestId('message-input-textarea');

      // Type message
      await user.type(textarea, 'Test message');

      // Press Enter
      await user.type(textarea, '{Enter}');

      // Textarea should be cleared
      expect(textarea).toHaveValue('');
    });
  });
});
