/**
 * ControlPanel Component - Container for all user controls
 * Desktop-only component that displays Header, SpeechControls, MessageInput, error alert, and clear history
 * On mobile, this component is minimized; drawer handles secondary controls
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
 * - isMobile: Whether rendering on mobile (when true, only shows minimal controls)
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
  onSendQuestion: (text: string, apiKey: string) => void;
  onSendComplaint: (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined,
    apiKey: string
  ) => void;
  apiKey: string | null;
  onClearHistory: () => void;
  isMobile?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  messages,
  isLoading,
  error,
  isComplaintMode = false,
  onToggleComplaint,
  onSendQuestion,
  onSendComplaint,
  apiKey,
  onClearHistory,
  isMobile = false,
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
        apiKey || ''
      );
    } else {
      onSendQuestion(text, apiKey || '');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header - hidden on mobile (MobileHeader and drawer handle mobile header) */}
      {!isMobile && (
        <div className={styles.header}>
          <Header isComplaintMode={isComplaintMode} onToggleComplaint={onToggleComplaint} isMobile={isMobile} apiKey={apiKey} />
        </div>
      )}

      {/* Error Alert - hidden on mobile (shown in drawer instead) */}
      {!isMobile && displayError && (
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

      {/* Text-to-Speech Controls - compact mode on mobile */}
      {settings.ttsEnabled && (
        <div className={styles.controls}>
          <SpeechControls messages={messages} ttsEnabled={settings.ttsEnabled} isCompact={isMobile} />
        </div>
      )}

      {/* Message Input - compact mode on mobile */}
      <div className={styles.input}>
        <MessageInput
          onSend={handleSend}
          disabled={isLoading}
          isComplaintMode={isComplaintMode && !isMobile}
          onComplaintInfoChange={(info) => setComplaintInfo(info)}
          isCompact={isMobile}
        />
      </div>

      {/* Footer with clear history button - hidden on mobile (shown in drawer instead) */}
      {!isMobile && (
        <div className={styles.footer}>
          <button className={styles.clearButton} onClick={onClearHistory} disabled={messages.length === 0}>
            🗑️ {t('clear_chat')}
          </button>
        </div>
      )}
    </div>
  );
};
