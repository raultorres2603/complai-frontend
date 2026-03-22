/**
 * Header Component - Minimal brand header with accessibility and language controls
 */

import React, { useState } from 'react';
import AccessibilityPanel from './AccessibilityPanel';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslation } from '../hooks/useTranslation';
import styles from './Header.module.css';

interface HeaderProps {
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isComplaintMode = false, onToggleComplaint }) => {
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Brand/Logo */}
          <div className={styles.brand}>
            <h1 className={styles.title}>ComplAI</h1>
            <p className={styles.subtitle}>Citizen Support Chatbot</p>
          </div>

          {/* Right controls - accessibility, language, and complaint mode */}
          <div className={styles.controls}>
            <button
              className={styles.accessibilityButton}
              onClick={() => setIsAccessibilityPanelOpen(true)}
              aria-label={t('accessibility_tooltip')}
              title={t('accessibility_tooltip')}
            >
              ♿
            </button>

            <LanguageSelector
              currentLanguage={currentLanguage}
              onSelectLanguage={setLanguage}
              availableLanguages={availableLanguages}
            />

            <button
              className={`${styles.modeButton} ${isComplaintMode ? styles.on : ''}`}
              onClick={() => onToggleComplaint?.()}
              aria-pressed={isComplaintMode}
            >
              {isComplaintMode ? t('complaint_mode') : t('ask_question')}
            </button>
          </div>
        </div>
      </header>

      {/* Accessibility Panel Modal */}
      <AccessibilityPanel
        isVisible={isAccessibilityPanelOpen}
        onClose={() => setIsAccessibilityPanelOpen(false)}
      />
    </>
  );
};
