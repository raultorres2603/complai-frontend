/**
 * ControlDrawer Component - Slide-up drawer with secondary controls for mobile
 * 
 * Responsibility: Render slide-up drawer with secondary controls (accessibility, language, complaints, clear history)
 * 
 * Props:
 * - isOpen: Whether drawer is currently open
 * - onClose: Callback to close drawer
 * - isComplaintMode: Whether in complaint mode
 * - onToggleComplaint: Callback to toggle complaint mode
 * - onClearHistory: Callback to clear chat history
 * - currentLanguage: Current language code
 * - onSelectLanguage: Callback when language is selected
 * - availableLanguages: List of available languages
 * - error: Current error to display
 * - onDismissError: Callback to dismiss error
 * - messages: Chat messages (for context)
 * 
 * Features:
 * - Slide-up animation from bottom
 * - Semi-transparent backdrop overlay
 * - Close button and Escape key support
 * - Touch-friendly buttons (44px minimum)
 * - Accessibility panel, language selector, complaint toggle
 * - Error alert display
 * - Safe area support for notches
 */

import React, { useState } from 'react';
import { useDrawerEscape } from '../hooks/useDrawerEscape';
import AccessibilityPanel from './AccessibilityPanel';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import type { Language, LanguageOption } from '../types/accessibility.types';
import styles from './ControlDrawer.module.css';

interface ControlDrawerProps {
  /** Whether drawer is open */
  isOpen: boolean;
  /** Callback to close drawer */
  onClose: () => void;
  /** Whether in complaint mode */
  isComplaintMode?: boolean;
  /** Callback to toggle complaint mode */
  onToggleComplaint?: () => void;
  /** Callback to clear chat history */
  onClearHistory?: () => void;
  /** Current language code */
  currentLanguage?: Language;
  /** Callback when language is selected */
  onSelectLanguage?: (language: Language) => void;
  /** Available language options */
  availableLanguages?: LanguageOption[];
  /** Current error state */
  error?: any | null;
  /** Callback to dismiss error */
  onDismissError?: () => void;
  /** Chat messages (for context like clear history button) */
  messages?: any[];
}

/**
 * Mobile drawer component for secondary controls
 * Renders accessibility panel, language selector, complaint mode toggle, and clear history
 * Features slide-up animation, backdrop overlay, and Escape key support
 */
export const ControlDrawer: React.FC<ControlDrawerProps> = ({
  isOpen,
  onClose,
  isComplaintMode = false,
  onToggleComplaint,
  onClearHistory,
  currentLanguage,
  onSelectLanguage,
  availableLanguages = [],
  error,
  onDismissError,
  messages = [],
}) => {
  const { t } = useTranslation();
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);

  // Close drawer on Escape key
  useDrawerEscape(onClose, isOpen);

  if (!isOpen) {
    return null;
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Drawer container */}
      <div
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer header with title and close button */}
        <div className={styles.header}>
          <h2 id="drawer-title" className={styles.title}>
            Settings
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('close')}
            title={t('close')}
          >
            ✕
          </button>
        </div>

        {/* Drawer content */}
        <div className={styles.content}>
          {/* Error Alert Section */}
          {error && (
            <div className={styles.errorSection}>
              <div className={styles.errorAlert}>
                <p className={styles.errorText}>
                  {typeof error === 'string' ? error : error?.message || 'An error occurred'}
                </p>
                <button
                  className={styles.closeErrorButton}
                  onClick={onDismissError || (() => {})}
                  aria-label={t('close')}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Accessibility Panel Section */}
          <section className={styles.section}>
            <button
              className={styles.sectionButton}
              onClick={() => setIsAccessibilityPanelOpen(true)}
              title={t('accessibility_tooltip')}
            >
              <span className={styles.icon}>♿</span>
              <span>{t('accessibility_settings')}</span>
            </button>
          </section>

          {/* Language Selector Section */}
          {currentLanguage && availableLanguages.length > 0 && (
            <section className={styles.section}>
              <div className={styles.languageSection}>
                <h3 className={styles.sectionTitle}>{t('select_language')}</h3>
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onSelectLanguage={(lang) => {
                    if (onSelectLanguage) {
                      onSelectLanguage(lang);
                    }
                  }}
                  availableLanguages={availableLanguages}
                />
              </div>
            </section>
          )}

          {/* Complaint Mode Toggle Section */}
          <section className={styles.section}>
            <button
              className={`${styles.modeButton} ${isComplaintMode ? styles.on : ''}`}
              onClick={() => onToggleComplaint?.()}
              aria-pressed={isComplaintMode}
              title={
                isComplaintMode ? t('complaint_mode') : t('ask_question')
              }
            >
              <span className={styles.icon}>
                {isComplaintMode ? '📋' : '❓'}
              </span>
              <span>
                {isComplaintMode ? t('complaint_mode') : t('ask_question')}
              </span>
            </button>
          </section>

          {/* Clear History Section */}
          {hasMessages && (
            <section className={styles.section}>
              <button
                className={styles.clearButton}
                onClick={() => {
                  onClearHistory?.();
                  onClose();
                }}
                title={t('clear_chat')}
              >
                <span className={styles.icon}>🗑️</span>
                <span>{t('clear_chat')}</span>
              </button>
            </section>
          )}
        </div>
      </div>

      {/* Accessibility Panel Modal */}
      <AccessibilityPanel
        isVisible={isAccessibilityPanelOpen}
        onClose={() => setIsAccessibilityPanelOpen(false)}
      />
    </>
  );
};

export default ControlDrawer;
