/**
 * MessageInput Component - User input form
 * Supports both desktop and compact mobile mode
 */

import { useState, useRef } from 'react';
import type { OutputFormat } from '../types/api.types';
import { OutputFormat as OutputFormatEnum } from '../types/api.types';
import { useAccessibility } from '../hooks/useAccessibility';
import { useTranslation } from '../hooks/useTranslation';
import { MicrophoneButton } from './MicrophoneButton';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSend: (text: string, format?: OutputFormat) => void;
  disabled: boolean;
  isComplaintMode?: boolean;
  onComplaintInfoChange?: (info: {
    name?: string;
    surname?: string;
    idNumber?: string;
  }) => void;
  isCompact?: boolean;
}

const MAX_MESSAGE_LENGTH = 5000;

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled,
  isComplaintMode = false,
  onComplaintInfoChange,
  isCompact = false,
}) => {
  const { settings } = useAccessibility();
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [format, setFormat] = useState<OutputFormat>(OutputFormatEnum.AUTO);
  const [complaintInfo, setComplaintInfo] = useState({
    name: '',
    surname: '',
    idNumber: '',
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    onSend(text.trim(), format);
    setText('');
    setComplaintInfo({ name: '', surname: '', idNumber: '' });

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setText(value);
    }
  };

  const handleComplaintInfoChange = (field: string, value: string) => {
    const updated = { ...complaintInfo, [field]: value };
    setComplaintInfo(updated);
    onComplaintInfoChange?.(updated);
  };

  const handleTranscript = (transcript: string) => {
    if (textareaRef.current) {
      const newText = text ? `${text} ${transcript}` : transcript;
      if (newText.length <= MAX_MESSAGE_LENGTH) {
        setText(newText);
        textareaRef.current.focus();
      }
    }
  };

  const isSubmitDisabled = disabled || !text.trim();

  return (
    <form className={`${styles.form} ${isCompact ? styles.compact : ''}`} onSubmit={handleSubmit}>
      {/* Complaint section - hidden in compact mode */}
      <div className={`${styles.complaintSection} ${isComplaintMode ? styles.visible : styles.hidden}`}>
        <h3 className={styles.sectionTitle}>{t('requester_information')} {t('optional')}</h3>
        <div className={styles.complaintFields}>
          <input
            type="text"
            placeholder={t('name_field')}
            value={complaintInfo.name}
            onChange={(e) => handleComplaintInfoChange('name', e.target.value)}
            disabled={disabled}
            className={styles.complaintInput}
          />
          <input
            type="text"
            placeholder={t('surname_field')}
            value={complaintInfo.surname}
            onChange={(e) => handleComplaintInfoChange('surname', e.target.value)}
            disabled={disabled}
            className={styles.complaintInput}
          />
          <input
            type="text"
            placeholder={t('id_number_field')}
            value={complaintInfo.idNumber}
            onChange={(e) => handleComplaintInfoChange('idNumber', e.target.value)}
            disabled={disabled}
            className={styles.complaintInput}
          />
        </div>

        <div className={styles.formatSection}>
          <label className={styles.label}>{t('output_format_label')}</label>
          <div className={styles.formatButtons}>
            {Object.values(OutputFormatEnum).map((fmt) => (
              <button
                key={fmt as string}
                type="button"
                className={`${styles.formatButton} ${format === fmt ? styles.active : ''}`}
                onClick={() => setFormat(fmt)}
                disabled={disabled}
              >
                {fmt as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}            data-testid="message-input-textarea"            value={text}
            onChange={handleTextChange}
            placeholder={isComplaintMode ? t('describe_complaint_placeholder') : t('ask_question_placeholder')}
            disabled={disabled}
            className={styles.textarea}
            rows={isCompact ? 1 : 3}
          />
          <MicrophoneButton
            onTranscript={handleTranscript}
            disabled={disabled}
            sttEnabled={settings.sttEnabled}
          />
        </div>
        <div className={styles.footer}>
          {!isCompact && (
            <span className={styles.charCount}>
              {text.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={styles.sendButton}
            title={t('send_message_tooltip')}
          >
            {t('send_message')}
          </button>
        </div>
      </div>
    </form>
  );
};
