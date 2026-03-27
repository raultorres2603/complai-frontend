import { describe, it, expect, vi } from 'vitest';
import { render, screen } from './test-utils';
import { MessageList } from '../components/MessageList';
import type { ChatMessage } from '../types/domain.types';

// Mock DOMPurify (used by Message component)
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

function makeMessage(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: 'msg-1',
    role: 'assistant',
    content: 'some content',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('MessageList spinner suppression during streaming', () => {
  it('suppresses LoadingSpinner when last message is a streaming assistant message', () => {
    const messages: ChatMessage[] = [
      makeMessage({ id: 'msg-1', role: 'user', content: 'question' }),
      makeMessage({ id: 'msg-2', role: 'assistant', content: 'partial...', loading: true }),
    ];

    render(<MessageList messages={messages} loading={true} />);
    expect(screen.queryByText('Waiting for response...')).not.toBeInTheDocument();
  });

  it('shows LoadingSpinner when last message is a non-streaming assistant message', () => {
    const messages: ChatMessage[] = [
      makeMessage({ id: 'msg-1', role: 'user', content: 'question' }),
      makeMessage({ id: 'msg-2', role: 'assistant', content: 'done', loading: false }),
    ];

    render(<MessageList messages={messages} loading={true} />);
    expect(screen.getByText('Waiting for response...')).toBeInTheDocument();
  });

  it('does not show LoadingSpinner when loading=true but messages is empty', () => {
    render(<MessageList messages={[]} loading={true} />);
    // Empty state shown, no spinner
    expect(screen.queryByText('Waiting for response...')).not.toBeInTheDocument();
  });
});
