/**
 * ChatWindow Component - Message list display
 * 
 * Responsibility: Pure display component for message history
 * 
 * Props:
 * - messages: Array of message objects to display
 * - isLoading: Loading state (shows loading indicator)
 */

import { MessageList } from './MessageList';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  messages: any[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
}) => {
  return (
    <div className={styles.container} data-tour="chat-window">
      {/* Message List */}
      <MessageList messages={messages} loading={isLoading} />
    </div>
  );
};
