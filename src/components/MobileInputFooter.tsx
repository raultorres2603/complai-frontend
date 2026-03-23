/**
 * MobileInputFooter Component - Fixed footer with input and compact speech controls
 * 
 * Responsibility: Display MessageInput and compact SpeechControls at bottom of mobile screen
 * 
 * Props:
 * - onSend: Callback when message is sent
 * - disabled: Whether input is disabled
 * - isComplaintMode: Whether in complaint mode
 * - onComplaintInfoChange: Callback for complaint info changes
 * - messages: Chat message history
 * - ttsEnabled: Whether text-to-speech is enabled
 * 
 * Features:
 * - Fixed at bottom of viewport
 * - 64px height with flexible content
 * - Safe area support for notches
 * - Compact MessageInput (single-line, minimal padding)
 * - Compact SpeechControls (icon-only, horizontal)
 * - Proper z-index layering
 */

import React from 'react';
import type { OutputFormat } from '../types/api.types';
import { MessageInput } from './MessageInput';
import { SpeechControls } from './SpeechControls';
import styles from './MobileInputFooter.module.css';

interface MobileInputFooterProps {
  /** Callback when message is sent */
  onSend: (text: string, format?: OutputFormat) => void;
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
}

/**
 * Fixed footer component for mobile chat input
 * Contains compact MessageInput and SpeechControls
 * Fixed at bottom with safe area support
 */
export const MobileInputFooter: React.FC<MobileInputFooterProps> = ({
  onSend,
  disabled,
  isComplaintMode = false,
  onComplaintInfoChange,
  messages,
  ttsEnabled = true,
}) => {
  return (
    <footer className={styles.footer}>
      {/* Compact SpeechControls - only show play/stop/voice select */}
      {ttsEnabled && (
        <div className={styles.speechControls}>
          <SpeechControls messages={messages} ttsEnabled={ttsEnabled} />
        </div>
      )}

      {/* Compact MessageInput */}
      <div className={styles.input}>
        <MessageInput
          onSend={onSend}
          disabled={disabled}
          isComplaintMode={isComplaintMode}
          onComplaintInfoChange={onComplaintInfoChange}
        />
      </div>
    </footer>
  );
};

export default MobileInputFooter;
