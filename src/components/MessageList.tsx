/**
 * MessageList Component - Scrollable message history
 */

import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/domain.types';
import { Message } from './Message';
import { LoadingSpinner } from './LoadingSpinner';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  // IMPORTANT: Only scroll the internal list container, NOT the window
  useEffect(() => {
    if (listRef.current) {
      // Scroll only the message list container to the bottom
      // This prevents the entire page from scrolling
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className={styles.container}>
      {messages.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <div ref={listRef} className={styles.list}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {loading && !(messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].loading === true) && (
            <LoadingSpinner message="Waiting for response..." size="small" />
          )}
        </div>
      )}
    </div>
  );
};
