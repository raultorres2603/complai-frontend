/**
 * MessageInput Component - User input form
 */

import { useState, useRef } from 'react';
import type { OutputFormat } from '../types/api.types';
import { OutputFormat as OutputFormatEnum } from '../types/api.types';
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
}

const MAX_MESSAGE_LENGTH = 5000;

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled,
  isComplaintMode = false,
  onComplaintInfoChange,
}) => {
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

    onSend(text.trim(), isComplaintMode ? format : undefined);
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

  const isSubmitDisabled = disabled || !text.trim();

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={`${styles.complaintSection} ${isComplaintMode ? styles.visible : styles.hidden}`}>
        <h3 className={styles.sectionTitle}>Requester Information (Optional)</h3>
        <div className={styles.complaintFields}>
          <input
            type="text"
            placeholder="Name"
            value={complaintInfo.name}
            onChange={(e) => handleComplaintInfoChange('name', e.target.value)}
            disabled={disabled}
            className={styles.complaintInput}
          />
          <input
            type="text"
            placeholder="Surname"
            value={complaintInfo.surname}
            onChange={(e) => handleComplaintInfoChange('surname', e.target.value)}
            disabled={disabled}
            className={styles.complaintInput}
          />
          <input
            type="text"
            placeholder="ID Number (DNI/NIF)"
            value={complaintInfo.idNumber}
            onChange={(e) => handleComplaintInfoChange('idNumber', e.target.value)}
            disabled={disabled}
            className={styles.complaintInput}
          />
        </div>

        <div className={styles.formatSection}>
          <label className={styles.label}>Output Format:</label>
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
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={isComplaintMode ? 'Describe your complaint...' : 'Ask a question...'}
          disabled={disabled}
          className={styles.textarea}
          rows={3}
        />
        <div className={styles.footer}>
          <span className={styles.charCount}>
            {text.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={styles.sendButton}
            title="Send message (Ctrl+Enter)"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
};
