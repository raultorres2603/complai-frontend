/**
 * TabConflictModal Component - Displays warning when multiple tabs detected
 * Features:
 * - Real-time closure progress tracking
 * - Multiple state transitions (idle → requesting → closing → success/timeout)
 * - Visual feedback with spinner and progress count
 * - Manual closure guidance when auto-close fails
 * - Non-dismissible during closure
 * - Error handling with retry option
 */

import React, { useState, useEffect } from 'react';
import styles from './TabConflictModal.module.css';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from '../hooks/useTranslation';
import type { ModalClosureState } from '../types/tabDetection.types';

interface TabConflictModalProps {
  isVisible: boolean;
  onContinueThisTab: () => void;
  closingTabCount?: number;
  closedTabCount?: number;
  closureFailureMessage?: string | null;
}

export const TabConflictModal: React.FC<TabConflictModalProps> = ({
  isVisible,
  onContinueThisTab,
  closingTabCount = 0,
  closedTabCount = 0,
  closureFailureMessage = null,
}) => {
  const { t } = useTranslation();
  const [closureState, setClosureState] = useState<ModalClosureState>('idle');
  const [closureTimeoutReached, setClosureTimeoutReached] = useState(false);

  // Reset state when modal becomes hidden
  useEffect(() => {
    if (!isVisible) {
      setClosureState('idle');
      setClosureTimeoutReached(false);
    }
  }, [isVisible]);

  // Track real closure progress from hook props
  useEffect(() => {
    // Handle state transitions based on closure progress
    if (closingTabCount > 0) {
      // We're in a closure operation
      if (closedTabCount === closingTabCount) {
        // All tabs closed
        setClosureState('complete_success');
      } else if (closedTabCount > 0) {
        // Some but not all closed
        setClosureState('partial_success');
      } else if (closureState === 'idle') {
        // Do nothing - waiting for user action
      } else if (closureState === 'requesting' || closureState === 'closing' || closureState === 'closing_timeout') {
        // Continue in current state or transition to closing
        if (closureState === 'requesting') {
          setClosureState('closing');
        }
      } else {
        // Other states - just started
        setClosureState('closing');
      }
    } else if (closingTabCount === 0 && closureState !== 'idle' && closureState !== 'requesting') {
      // Reset if closingTabCount becomes 0
      setClosureState('idle');
    }
  }, [closingTabCount, closedTabCount, closureState]);

  // Set timeout for closure to detect when tabs won't close
  useEffect(() => {
    if (closureState === 'closing' && closingTabCount > 0) {
      const timeoutId = setTimeout(() => {
        console.warn('Tab closure timeout - not all tabs closed within 3 seconds');
        setClosureTimeoutReached(true);
        setClosureState('closing_timeout');
      }, 3000); // 3 second timeout to match hook timeout

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [closureState, closingTabCount]);

  const handleContinue = () => {
    setClosureState('requesting');
    setClosureTimeoutReached(false);
    onContinueThisTab();
  };

  const handleRetry = () => {
    setClosureState('idle');
    setClosureTimeoutReached(false);
  };

  const isDisabled = 
    (closureState === 'closing' && !closureTimeoutReached) ||
    closureState === 'requesting' ||
    closureState === 'complete_success' ||
    (closureState === 'closing_timeout' && closingTabCount > 0);

  // Determine button text based on closure state
  const getButtonText = (): string => {
    switch (closureState) {
      case 'requesting':
        return t('preparing_to_close');
      case 'closing':
        return closingTabCount > 0 
          ? t('closing_tabs_status') 
          : t('closing_other_tabs');
      case 'complete_success':
        return t('other_tabs_closed');
      case 'closing_timeout':
      case 'partial_success':
      case 'error':
        return t('retry_button');
      default:
        return t('continue_this_tab');
    }
  };

  // Get progress text for closing state
  const getProgressText = (): string => {
    if (closingTabCount > 0 && (closureState === 'closing' || closureState === 'partial_success')) {
      // Use the closing_tabs_progress template from translations  return t('closing_tabs_progress').replace('{{closed}}', String(closedTabCount)).replace('{{total}}', String(closingTabCount));
    }
    return '';
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('multiple_tabs_detected_title')}</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>
            {t('multiple_tabs_security_message')}
          </p>
          <p className={styles.submessage}>
            {t('multiple_tabs_auto_close_message')}
          </p>

          {(closureState === 'closing' || closureState === 'requesting') && (
            <div className={styles.spinnerContainer}>
              <LoadingSpinner />
              {closureState === 'closing' && closingTabCount > 0 && (
                <p className={styles.closingText}>
                  {getProgressText()}
                </p>
              )}
              {closureState === 'requesting' && (
                <p className={styles.closingText}>{t('preparing_to_close')}</p>
              )}
            </div>
          )}

          {closureState === 'closing_timeout' && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>⚠️ {t('other_tabs_close_failed')}</p>
              {closureFailureMessage && (
                <p className={styles.errorDetails}>{closureFailureMessage}</p>
              )}
              <p className={styles.guidanceText}>
                {t('manual_closure_guidance')}
              </p>
            </div>
          )}

          {closureState === 'partial_success' && (
            <div className={styles.warningBox}>
              <p className={styles.warningText}>
                {closedTabCount} of {closingTabCount} tabs closed
              </p>
              {closureFailureMessage && (
                <p className={styles.guidanceText}>{closureFailureMessage}</p>
              )}
            </div>
          )}

          {closureState === 'complete_success' && (
            <div className={styles.successBox}>
              <p className={styles.successText}>✓ {t('other_tabs_closed')}</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.primaryButton}
            onClick={
              closureState === 'closing_timeout' || 
              closureState === 'partial_success' ||
              closureState === 'error'
                ? handleRetry 
                : handleContinue
            }
            disabled={isDisabled}
            aria-label={getButtonText()}
          >
            {(closureState === 'closing' || closureState === 'requesting') && (
              <LoadingSpinner size="small" />
            )}
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
