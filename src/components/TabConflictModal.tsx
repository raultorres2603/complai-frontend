/**
 * TabConflictModal Component - Displays warning when multiple tabs detected
 * Features:
 * - Button text progression during closure
 * - Visual feedback with spinner
 * - Non-dismissible during closure
 * - Timeout to re-enable if closure stalls
 * - Error handling with retry option
 */

import React, { useState, useEffect } from 'react';
import styles from './TabConflictModal.module.css';
import { LoadingSpinner } from './LoadingSpinner';

interface TabConflictModalProps {
  isVisible: boolean;
  onContinueThisTab: () => void;
}

type ClosureState = 'idle' | 'closing' | 'closed' | 'error';

export const TabConflictModal: React.FC<TabConflictModalProps> = ({
  isVisible,
  onContinueThisTab,
}) => {
  const [closureState, setClosureState] = useState<ClosureState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [closureTimeoutReached, setClosureTimeoutReached] = useState(false);

  // Reset state when modal becomes hidden
  useEffect(() => {
    if (!isVisible) {
      setClosureState('idle');
      setErrorMessage(null);
      setClosureTimeoutReached(false);
    }
  }, [isVisible]);

  // Set timeout for closure
  useEffect(() => {
    if (closureState === 'closing') {
      const timeoutId = setTimeout(() => {
        console.warn('Tab closure timeout - other tabs did not close within 5 seconds');
        setClosureTimeoutReached(true);
        setClosureState('error');
        setErrorMessage('Other tabs did not close. Retrying...');
      }, 5000); // 5 second timeout

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [closureState]);

  const handleContinue = () => {
    setClosureState('closing');
    setErrorMessage(null);
    setClosureTimeoutReached(false);
    onContinueThisTab();
  };

  const handleRetry = () => {
    setClosureState('idle');
    setErrorMessage(null);
    setClosureTimeoutReached(false);
  };

  const isDisabled = closureState === 'closing' && !closureTimeoutReached;

  // Determine button text based on closure state
  const getButtonText = () => {
    switch (closureState) {
      case 'closing':
        return 'Closing other tabs...';
      case 'closed':
        return 'Other tabs closed';
      case 'error':
        return 'Retry';
      default:
        return 'Continue with this tab';
    }
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

          {closureState === 'closing' && (
            <div className={styles.spinnerContainer}>
              <LoadingSpinner />
              <p className={styles.closingText}>Closing tabs...</p>
            </div>
          )}

          {errorMessage && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>⚠️ {errorMessage}</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.primaryButton}
            onClick={closureState === 'error' ? handleRetry : handleContinue}
            disabled={isDisabled}
            aria-label={getButtonText()}
          >
            {closureState === 'closing' && <LoadingSpinner size="small" />}
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
