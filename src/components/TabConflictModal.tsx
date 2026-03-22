/**
 * TabConflictModal Component - Displays warning when multiple tabs detected
 */

import React, { useState } from 'react';
import styles from './TabConflictModal.module.css';

interface TabConflictModalProps {
  isVisible: boolean;
  onContinueThisTab: () => void;
}

export const TabConflictModal: React.FC<TabConflictModalProps> = ({
  isVisible,
  onContinueThisTab,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleContinue = () => {
    setIsClosing(true);
    onContinueThisTab();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚠️ Multiple Tabs Detected</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>
            For security reasons, ComplAI only allows one active session per device.
          </p>
          <p className={styles.submessage}>
            Other tabs of this app will be automatically closed.
          </p>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.primaryButton}
            onClick={handleContinue}
            disabled={isClosing}
          >
            {isClosing ? 'Closing other tabs...' : 'Continue with this tab'}
          </button>
        </div>
      </div>
    </div>
  );
};
