import { describe, it, expect, vi } from 'vitest';
import { render, screen } from './test-utils';
import { Message } from '../components/Message';
import type { ChatMessage } from '../types/domain.types';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

function makeMessage(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: 'msg-1',
    role: 'assistant',
    content: 'test content',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('Message streaming cursor', () => {
  it('shows streaming cursor when assistant message is loading', () => {
    const message = makeMessage({ content: 'partial text', loading: true, role: 'assistant' });
    render(<Message message={message} />);
    expect(screen.getByText('▌')).toBeInTheDocument();
  });

  it('does not show streaming cursor when assistant message is not loading', () => {
    const message = makeMessage({ content: 'full text', loading: false, role: 'assistant' });
    render(<Message message={message} />);
    expect(screen.queryByText('▌')).not.toBeInTheDocument();
  });

  it('shows streaming cursor when assistant message has empty content and is loading', () => {
    const message = makeMessage({ content: '', loading: true, role: 'assistant' });
    render(<Message message={message} />);
    expect(screen.getByText('▌')).toBeInTheDocument();
  });

  it('does not show streaming cursor for user messages even when loading', () => {
    const message = makeMessage({ content: 'text', loading: true, role: 'user' });
    render(<Message message={message} />);
    expect(screen.queryByText('▌')).not.toBeInTheDocument();
  });
});
