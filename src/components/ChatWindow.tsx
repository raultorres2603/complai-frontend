/**
 * ChatWindow Component - Main chat container
 */

import { useState } from 'react';
import type { OutputFormat } from '../types/api.types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  messages: any[];
  isLoading: boolean;
  error: any | null;
  onSendQuestion: (text: string, jwtToken: string) => void;
  onSendComplaint: (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined,
    jwtToken: string
  ) => void;
  jwtToken: string | null;
  onClearHistory: () => void;
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  error,
  onSendQuestion,
  onSendComplaint,
  jwtToken,
  onClearHistory,
  isComplaintMode = false,
  onToggleComplaint,
}) => {
  const [complaintInfo, setComplaintInfo] = useState<{
    name?: string;
    surname?: string;
    idNumber?: string;
  }>({
    name: undefined,
    surname: undefined,
    idNumber: undefined,
  });

  const handleSend = (text: string, format?: OutputFormat) => {
    if (isComplaintMode && format) {
      onSendComplaint(
        text,
        format,
        complaintInfo.name,
        complaintInfo.surname,
        complaintInfo.idNumber,
        jwtToken || ''
      );
    } else {
      onSendQuestion(text, jwtToken || '');
    }
  };

  return (
    <div className={`${styles.container} ${isComplaintMode ? styles.complaintMode : ''}`}>
      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <p className={styles.errorText}>
            {typeof error === 'string' ? error : error?.message || 'An error occurred'}
          </p>
          <button
            className={styles.closeError}
            onClick={() => {
              // Error will be cleared by parent component
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Message List */}
      <MessageList messages={messages} loading={isLoading} />

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        disabled={isLoading}
        isComplaintMode={isComplaintMode}
        onComplaintInfoChange={(info) => setComplaintInfo(info)}
      />

      {/* Footer Actions */}
      <div className={styles.footer}>
        <button className={styles.clearButton} onClick={onClearHistory} disabled={messages.length === 0}>
          🗑️ Clear History
        </button>
      </div>
    </div>
  );
};
