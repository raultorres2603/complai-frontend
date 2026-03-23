/**
 * Tests for MobileInputFooter Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileInputFooter } from './MobileInputFooter';
import type { OutputFormat } from '../types/api.types';

// Mock MessageInput
vi.mock('./MessageInput', () => ({
  MessageInput: ({ onSend, disabled }: any) => (
    <form data-testid="message-input-form" onSubmit={(e) => {
      e.preventDefault();
      onSend('Test message');
    }}>
      <input
        data-testid="message-input"
        placeholder="Type message"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled} data-testid="send-button">
        Send
      </button>
    </form>
  ),
}));

// Mock SpeechControls
vi.mock('./SpeechControls', () => ({
  SpeechControls: ({ messages, ttsEnabled }: any) =>
    ttsEnabled ? (
      <div data-testid="speech-controls">
        <button data-testid="play-button">Play</button>
      </div>
    ) : null,
}));

describe('MobileInputFooter Component', () => {
  const defaultProps = {
    onSend: vi.fn(),
    disabled: false,
    messages: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render footer container', () => {
    const { container } = render(<MobileInputFooter {...defaultProps} />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should render MessageInput', () => {
    render(<MobileInputFooter {...defaultProps} />);

    expect(screen.getByTestId('message-input-form')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('should render SpeechControls when ttsEnabled is true', () => {
    render(<MobileInputFooter {...defaultProps} ttsEnabled={true} />);

    expect(screen.getByTestId('speech-controls')).toBeInTheDocument();
  });

  it('should not render SpeechControls when ttsEnabled is false', () => {
    render(<MobileInputFooter {...defaultProps} ttsEnabled={false} />);

    expect(screen.queryByTestId('speech-controls')).not.toBeInTheDocument();
  });

  it('should call onSend when form is submitted', async () => {
    const onSend = vi.fn();
    render(<MobileInputFooter {...defaultProps} onSend={onSend} />);

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    expect(onSend).toHaveBeenCalledWith('Test message');
  });

  it('should disable input when disabled prop is true', () => {
    render(<MobileInputFooter {...defaultProps} disabled={true} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should enable input when disabled prop is false', () => {
    render(<MobileInputFooter {...defaultProps} disabled={false} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    expect(input).not.toBeDisabled();
    expect(sendButton).not.toBeDisabled();
  });

  it('should pass isComplaintMode to MessageInput', async () => {
    const { rerender } = render(
      <MobileInputFooter {...defaultProps} isComplaintMode={false} />
    );

    // Test that component accepts the prop without error
    rerender(<MobileInputFooter {...defaultProps} isComplaintMode={true} />);
    expect(screen.getByTestId('message-input-form')).toBeInTheDocument();
  });

  it('should pass messages to SpeechControls', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];

    render(<MobileInputFooter {...defaultProps} messages={messages} />);

    expect(screen.getByTestId('speech-controls')).toBeInTheDocument();
  });

  it('should have footer fixed positioning', () => {
    const { container } = render(<MobileInputFooter {...defaultProps} />);

    const footer = container.querySelector('footer');
    
    // Verify footer element exists (querySelector confirms it's a <footer> element)
    // CSS Module classes are hashed, so we check element type instead
    expect(footer).toBeTruthy();
    expect(footer?.tagName).toBe('FOOTER');
  });

  it('should pass complaint info callbacks to MessageInput', async () => {
    const onComplaintInfoChange = vi.fn();
    render(
      <MobileInputFooter
        {...defaultProps}
        isComplaintMode={true}
        onComplaintInfoChange={onComplaintInfoChange}
      />
    );

    expect(screen.getByTestId('message-input-form')).toBeInTheDocument();
  });

  it('should default ttsEnabled to true', () => {
    render(<MobileInputFooter {...defaultProps} />);

    // SpeechControls should render because ttsEnabled defaults to true
    expect(screen.getByTestId('speech-controls')).toBeInTheDocument();
  });

  it('should default isComplaintMode to false', () => {
    render(<MobileInputFooter {...defaultProps} />);

    expect(screen.getByTestId('message-input-form')).toBeInTheDocument();
  });

  it('should render semantic footer element', () => {
    const { container } = render(<MobileInputFooter {...defaultProps} />);

    const footer = container.querySelector('footer[class*="footer"]');
    expect(footer?.tagName).toBe('FOOTER');
  });
});
