/**
 * FeedbackButton Component - Small icon button that opens the FeedbackModal
 */

import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import { useTranslation } from '../hooks/useTranslation';
import styles from './FeedbackButton.module.css';

interface FeedbackButtonProps {
  apiKey: string | null;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ apiKey }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        className={styles.button}
        onClick={() => setIsModalOpen(true)}
        aria-label={t('feedback_button_label')}
        title={t('feedback_button_label')}
        data-tour="feedback-button"
      >
        {t('feedback_button_label')}
      </button>
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
      />
    </>
  );
};

export default FeedbackButton;
