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
  const [idUser, setIdUser] = useState('');
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const { isLoading, error, success, submitFeedback, resetState } = useFeedback(jwtToken);
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setIdUser('');
    setUserName('');
    setMessage('');
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    await submitFeedback(idUser.trim(), userName.trim(), message.trim());
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
            <div className={styles.privacyNotice}>
              <h3 className={styles.privacyNoticeTitle}>
                {t('feedback_privacy_notice_title')}
              </h3>
              <p className={styles.privacyNoticeDescription}>
                {t('feedback_privacy_notice_description')}
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="feedback-iduser" className={styles.label}>
                {t('feedback_label_id')}
              </label>
              <input
                id="feedback-iduser"
                type="text"
                className={styles.input}
                value={idUser}
                onChange={(e) => setIdUser(e.target.value)}
                placeholder={t('feedback_placeholder_id')}
                disabled={isLoading}
                aria-describedby="feedback-iduser-helper"
              />
              <div id="feedback-iduser-helper" className={styles.helperText}>
                {t('feedback_id_helper_text')}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="feedback-username" className={styles.label}>
                {t('feedback_label_name')}
              </label>
              <input
                id="feedback-username"
                type="text"
                className={styles.input}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t('feedback_placeholder_name')}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <textarea
                className={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('feedback_message_placeholder')}
                disabled={isLoading}
              />
            </div>
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
                disabled={idUser.trim() === '' || userName.trim() === '' || message.trim() === '' || isLoading}
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
