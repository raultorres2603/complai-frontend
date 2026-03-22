/**
 * MessageInput Component Tests - Tests for translation of placeholders and labels
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { MessageInput } from './MessageInput';

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
    const textarea = screen.getByPlaceholderText(/Haz una pregunta|Ask a question/i);
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

    const textarea = screen.getByPlaceholderText(/Haz una pregunta|Ask a question/i);
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

    const textarea = screen.getByPlaceholderText(/Describe tu reclamación|Describe your complaint/i);
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
    expect(screen.getByText(/Información del Solicitante|Requester Information/i)).toBeInTheDocument();
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

    expect(placeholders.toLowerCase()).toMatch(/nombre|name/i);
  });

  it('should display translated "Output Format:" label in complaint mode', () => {
    render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={true}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    expect(screen.getByText(/Formato de Salida|Output Format/i)).toBeInTheDocument();
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

  it('should call onSend when message is submitted', async () => {
    const { container, user } = render(
      <MessageInput
        onSend={mockOnSend}
        disabled={false}
        isComplaintMode={false}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    const textarea = screen.getByPlaceholderText(/Haz una pregunta|Ask a question/i);
    const sendButton = screen.getByRole('button', { name: /Enviar|Send/i });

    // Type message using user event
    await user.type(textarea, 'Test message');

    // Click send
    await user.click(sendButton);

    // onSend should be called
    expect(mockOnSend).toHaveBeenCalled();
  });
});
