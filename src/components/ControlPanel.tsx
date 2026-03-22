/**
 * ControlPanel Component - Container for all user controls
 * 
 * Responsibility: Displays Header, SpeechControls, MessageInput, error alert, and clear history button in a vertical column
 * 
 * Props:
 * - messages: Message history (for SpeechControls)
 * - isLoading: Loading state from chat
 * - error: Current error state (for error alert)
 * - isComplaintMode: Whether in complaint mode
 * - onToggleComplaint: Callback to toggle complaint mode
 * - onSendQuestion: Handler for sending regular questions
 * - onSendComplaint: Handler for sending complaints
 * - jwtToken: JWT token for API calls
 * - onClearHistory: Callback to clear message history
 */

import { useState } from 'react';
import type { OutputFormat } from '../types/api.types';
import { Header } from './Header';
import { MessageInput } from './MessageInput';
import { SpeechControls } from './SpeechControls';
import { useAccessibility } from '../hooks/useAccessibility';
import { useTranslation } from '../hooks/useTranslation';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  messages: any[];
  isLoading: boolean;
  error: any | null;
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
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
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  messages,
  isLoading,
  error,
  isComplaintMode = false,
  onToggleComplaint,
  onSendQuestion,
  onSendComplaint,
  jwtToken,
  onClearHistory,
}) => {
  const { settings } = useAccessibility();
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState<any | null>(error);
  const [complaintInfo, setComplaintInfo] = useState<{
    name?: string;
    surname?: string;
    idNumber?: string;
  }>({
    name: undefined,
    surname: undefined,
    idNumber: undefined,
  });

  // Update display error when error prop changes
  if (error && error !== displayError) {
    setDisplayError(error);
  }

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
    <div className={styles.container}>
      {/* Header with language, accessibility, and complaint mode controls */}
      <div className={styles.header}>
        <Header isComplaintMode={isComplaintMode} onToggleComplaint={onToggleComplaint} />
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className={styles.errorAlert}>
          <p className={styles.errorText}>
            {typeof displayError === 'string' ? displayError : displayError?.message || 'An error occurred'}
          </p>
          <button
            className={styles.closeError}
            onClick={() => setDisplayError(null)}
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Text-to-Speech Controls */}
      {settings.ttsEnabled && (
        <div className={styles.controls}>
          <SpeechControls messages={messages} ttsEnabled={settings.ttsEnabled} />
        </div>
      )}

      {/* Message Input */}
      <div className={styles.input}>
        <MessageInput
          onSend={handleSend}
          disabled={isLoading}
          isComplaintMode={isComplaintMode}
          onComplaintInfoChange={(info) => setComplaintInfo(info)}
        />
      </div>

      {/* Footer with clear history button */}
      <div className={styles.footer}>
        <button className={styles.clearButton} onClick={onClearHistory} disabled={messages.length === 0}>
          🗑️ {t('clear_history')}
        </button>
      </div>
    </div>
  );
};
