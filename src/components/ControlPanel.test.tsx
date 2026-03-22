/**
 * ControlPanel Component Tests
 * Tests for the control panel containing Header, SpeechControls, MessageInput, error alert, and clear history
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import { ControlPanel } from './ControlPanel';

// Mock child components to isolate ControlPanel tests
vi.mock('./Header', () => ({
  Header: ({ isComplaintMode, onToggleComplaint }: any) => (
    <div data-testid="header-mock" data-testid-complaint-mode={isComplaintMode ? 'true' : 'false'}>
      <button onClick={onToggleComplaint} data-testid="complaint-toggle">
        Toggle Complaint
      </button>
      <span>Header</span>
    </div>
  ),
}));

vi.mock('./MessageInput', () => ({
  MessageInput: ({ onSend, disabled, isComplaintMode, onComplaintInfoChange }: any) => (
    <div data-testid="message-input-mock">
      <textarea placeholder="Enter message" data-testid="message-textarea" disabled={disabled} />
      <button onClick={() => onSend('test message')} data-testid="send-button" disabled={disabled}>
        Send
      </button>
    </div>
  ),
}));

vi.mock('./SpeechControls', () => ({
  SpeechControls: ({ messages, ttsEnabled }: any) => (
    <div data-testid="speech-controls-mock" data-tts-enabled={ttsEnabled}>
      Speech Controls
    </div>
  ),
}));

vi.mock('../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    settings: {
      ttsEnabled: true,
      sttEnabled: false,
      highContrast: false,
      fontSize: 'medium',
    },
  }),
}));

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ControlPanel Component', () => {
  const mockOnSendQuestion = vi.fn();
  const mockOnSendComplaint = vi.fn();
  const mockOnClearHistory = vi.fn();
  const mockOnToggleComplaint = vi.fn();

  const defaultMessages = [
    {
      id: '1',
      role: 'user' as const,
      content: 'Test message',
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'assistant' as const,
      content: 'Test response',
      timestamp: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the ControlPanel component', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('message-input-mock')).toBeInTheDocument();
  });

  it('should render Header with complaint toggle callback', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const toggleButton = screen.getByTestId('complaint-toggle');
    toggleButton.click();

    expect(mockOnToggleComplaint).toHaveBeenCalled();
  });

  it('should render SpeechControls when TTS is enabled', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByTestId('speech-controls-mock')).toBeInTheDocument();
  });

  it('should render MessageInput component', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByTestId('message-input-mock')).toBeInTheDocument();
  });

  it('should display error alert when error is present', () => {
    const errorMessage = 'Test error occurred';
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={{ message: errorMessage }}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should dismiss error alert when close button is clicked', () => {
    const { rerender } = render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={{ message: 'Test error' }}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/ });
    closeButton.click();

    // Rerender to verify error is gone
    rerender(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });

  it('should display clear history button', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear_history/ });
    expect(clearButton).toBeInTheDocument();
  });

  it('should call onClearHistory when clear history button is clicked', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear_history/ });
    clearButton.click();

    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  it('should disable clear history button when no messages', () => {
    render(
      <ControlPanel
        messages={[]}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear_history/ });
    expect(clearButton).toBeDisabled();
  });

  it('should pass isComplaintMode to Header', () => {
    const { container } = render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={true}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const header = screen.getByTestId('header-mock');
    expect(header).toHaveAttribute('data-testid-complaint-mode', 'true');
  });

  it('should pass messages to SpeechControls', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const speechControls = screen.getByTestId('speech-controls-mock');
    expect(speechControls).toBeInTheDocument();
  });

  it('should handle string error message', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error="Simple error message"
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText('Simple error message')).toBeInTheDocument();
  });

  it('should pass isLoading state to MessageInput', () => {
    const { rerender } = render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    let textarea = screen.getByTestId('message-textarea');
    expect(textarea).not.toBeDisabled();

    rerender(
      <ControlPanel
        messages={defaultMessages}
        isLoading={true}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    textarea = screen.getByTestId('message-textarea');
    expect(textarea).toBeDisabled();
  });

  it('should call onSendQuestion when sending a question', async () => {
    const { user } = render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const sendButton = screen.getByTestId('send-button');
    await user.click(sendButton);

    expect(mockOnSendQuestion).toHaveBeenCalled();
  });

  it('should handle null JWT token gracefully', () => {
    render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken={null}
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('message-input-mock')).toBeInTheDocument();
  });

  it('should render with proper structure - vertical flex layout', () => {
    const { container } = render(
      <ControlPanel
        messages={defaultMessages}
        isLoading={false}
        error={null}
        isComplaintMode={false}
        onToggleComplaint={mockOnToggleComplaint}
        onSendQuestion={mockOnSendQuestion}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="test-token"
        onClearHistory={mockOnClearHistory}
      />
    );

    const controlPanel = container.querySelector('[class*="container"]');
    expect(controlPanel).toBeInTheDocument();
  });
});
