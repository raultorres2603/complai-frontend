/**
 * ChatWindow Component Tests
 * Tests for the simplified message list display component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { ChatWindow } from '../ChatWindow';

// Mock MessageList component
vi.mock('../MessageList', () => ({
  MessageList: ({ messages, loading }: any) => (
    <div data-testid="message-list-mock" data-message-count={messages.length} data-loading={loading}>
      {messages.map((msg: any) => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.content}
        </div>
      ))}
    </div>
  ),
}));

describe('ChatWindow Component', () => {
  const defaultMessages = [
    {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'assistant' as const,
      content: 'Hi there',
      timestamp: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the ChatWindow component', () => {
    render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    expect(screen.getByTestId('message-list-mock')).toBeInTheDocument();
  });

  it('should render MessageList with messages prop', () => {
    render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    const messageList = screen.getByTestId('message-list-mock');
    expect(messageList).toHaveAttribute('data-message-count', '2');
  });

  it('should pass isLoading state to MessageList', () => {
    const { rerender } = render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    let messageList = screen.getByTestId('message-list-mock');
    expect(messageList).toHaveAttribute('data-loading', 'false');

    rerender(<ChatWindow messages={defaultMessages} isLoading={true} />);

    messageList = screen.getByTestId('message-list-mock');
    expect(messageList).toHaveAttribute('data-loading', 'true');
  });

  it('should render empty message list when no messages', () => {
    render(<ChatWindow messages={[]} isLoading={false} />);

    const messageList = screen.getByTestId('message-list-mock');
    expect(messageList).toHaveAttribute('data-message-count', '0');
  });

  it('should be a pure display component without controls', () => {
    const { container: _container } = render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    // Should NOT render input, send button, or other control elements
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textarea')).not.toBeInTheDocument();
  });

  it('should NOT render error alert', () => {
    const { container } = render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    // Error-related elements should not exist
    expect(container.querySelector('[class*="errorAlert"]')).not.toBeInTheDocument();
  });

  it('should NOT render footer with clear history button', () => {
    const { container } = render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    // Footer should not exist
    expect(container.querySelector('[class*="footer"]')).not.toBeInTheDocument();
  });

  it('should only have basic container structure', () => {
    const { container } = render(<ChatWindow messages={defaultMessages} isLoading={false} />);

    const containerDiv = container.querySelector('[class*="container"]');
    expect(containerDiv).toBeInTheDocument();
  });
});
