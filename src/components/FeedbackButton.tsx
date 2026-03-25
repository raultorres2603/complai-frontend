/**
 * FeedbackButton Component - Small icon button that opens the FeedbackModal
 */

import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import { useTranslation } from '../hooks/useTranslation';
import styles from './FeedbackButton.module.css';

interface FeedbackButtonProps {
  jwtToken: string | null;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ jwtToken }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        className={styles.button}
        onClick={() => setIsModalOpen(true)}
        aria-label={t('feedback_button_label')}
        title={t('feedback_button_label')}
      >
        {t('feedback_button_label')}
      </button>
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jwtToken={jwtToken}
      />
    </>
  );
};

export default FeedbackButton;
