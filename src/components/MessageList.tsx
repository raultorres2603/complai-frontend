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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={styles.container}>
      {messages.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {loading && <LoadingSpinner message="Waiting for response..." size="small" />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
