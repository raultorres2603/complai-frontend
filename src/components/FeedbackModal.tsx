/**
 * FeedbackModal Component - Fullscreen overlay dialog for submitting user feedback
 */

import React, { useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { useTranslation } from '../hooks/useTranslation';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  jwtToken: string | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, jwtToken }) => {
  const [message, setMessage] = useState('');
  const { isLoading, error, success, submitFeedback, resetState } = useFeedback(jwtToken);
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    await submitFeedback(message.trim());
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 id="feedback-modal-title" className={styles.title}>
          {t('feedback_modal_title')}
        </h2>

        {success ? (
          <>
            <p className={styles.successMessage}>{t('feedback_success')}</p>
            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={handleClose}>
                {t('close')}
              </button>
            </div>
          </>
        ) : (
          <>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback_message_placeholder')}
              disabled={isLoading}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.actions}>
              <button
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isLoading}
              >
                {t('feedback_cancel')}
              </button>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={message.trim() === '' || isLoading}
              >
                {t('feedback_submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
