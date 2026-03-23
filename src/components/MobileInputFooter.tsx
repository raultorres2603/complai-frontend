/**
 * MobileInputFooter Component - Fixed footer with input and compact speech controls
 * 
 * Responsibility: Display MessageInput and compact SpeechControls at bottom of mobile screen
 * 
 * Props:
 * - onSend: Callback when message is sent
 * - onSendComplaint: Callback when complaint is sent
 * - disabled: Whether input is disabled
 * - isComplaintMode: Whether in complaint mode
 * - onComplaintInfoChange: Callback for complaint info changes
 * - messages: Chat message history
 * - ttsEnabled: Whether text-to-speech is enabled
 * - jwtToken: JWT token for API requests (passed through to handlers)
 * 
 * Features:
 * - Fixed at bottom of viewport
 * - 64px height with flexible content
 * - Safe area support for notches
 * - Compact MessageInput (single-line, minimal padding)
 * - Compact SpeechControls (icon-only, horizontal)
 * - Proper z-index layering
 * - Complaint info extraction and handler dispatch
 */

import React, { useRef, useState } from 'react';
import type { OutputFormat } from '../types/api.types';
import { OutputFormat as OutputFormatEnum } from '../types/api.types';
import { MessageInput } from './MessageInput';
import { SpeechControls } from './SpeechControls';
import styles from './MobileInputFooter.module.css';

interface MobileInputFooterProps {
  /** Callback when message is sent (normal mode) */
  onSend: (text: string, format?: OutputFormat) => void;
  /** Callback when complaint is sent */
  onSendComplaint: (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined
  ) => void;
  /** Whether input is disabled (loading state) */
  disabled: boolean;
  /** Whether in complaint mode */
  isComplaintMode?: boolean;
  /** Callback for complaint information changes */
  onComplaintInfoChange?: (info: {
    name?: string;
    surname?: string;
    idNumber?: string;
  }) => void;
  /** Chat message history */
  messages: any[];
  /** Whether text-to-speech is enabled */
  ttsEnabled?: boolean;
  /** JWT token for API requests */
  jwtToken: string | null;
}

/**
 * Fixed footer component for mobile chat input
 * Contains compact MessageInput and SpeechControls
 * Fixed at bottom with safe area support
 */
export const MobileInputFooter: React.FC<MobileInputFooterProps> = ({
  onSend,
  onSendComplaint,
  disabled,
  isComplaintMode = false,
  onComplaintInfoChange,
  messages,
  ttsEnabled = true,
  jwtToken,
}) => {
  const [complaintInfo, setComplaintInfo] = useState<{
    name?: string;
    surname?: string;
    idNumber?: string;
  }>({
    name: '',
    surname: '',
    idNumber: '',
  });
  const [format, setFormat] = useState<OutputFormat>(OutputFormatEnum.AUTO);
  const messageInputRef = useRef<any>(null);

  const handleSendMessage = (text: string, messageFormat?: OutputFormat) => {
    if (disabled || !text.trim()) {
      return;
    }

    if (isComplaintMode) {
      // In complaint mode, call onSendComplaint with extracted info
      const complaintFormat = messageFormat || format || OutputFormatEnum.AUTO;
      onSendComplaint(
        text,
        complaintFormat,
        complaintInfo.name || undefined,
        complaintInfo.surname || undefined,
        complaintInfo.idNumber || undefined
      );
      // Reset complaint info after sending
      setComplaintInfo({ name: '', surname: '', idNumber: '' });
    } else {
      // In normal mode, call onSend
      onSend(text, messageFormat);
    }

    setFormat(OutputFormatEnum.AUTO);
  };

  const handleComplaintInfoChange = (info: {
    name?: string;
    surname?: string;
    idNumber?: string;
  }) => {
    setComplaintInfo(info);
    onComplaintInfoChange?.(info);
  };

  return (
    <footer className={styles.footer} data-testid="mobile-input-footer">
      {/* Compact SpeechControls - only show play/stop/voice select */}
      {ttsEnabled && (
        <div className={styles.speechControls}>
          <SpeechControls messages={messages} ttsEnabled={ttsEnabled} />
        </div>
      )}

      {/* Compact MessageInput */}
      <div className={styles.input}>
        <MessageInput
          onSend={handleSendMessage}
          disabled={disabled}
          isComplaintMode={isComplaintMode}
          onComplaintInfoChange={handleComplaintInfoChange}
          isCompact={true}
        />
      </div>
    </footer>
  );
};

export default MobileInputFooter;
