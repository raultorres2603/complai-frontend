/**
 * Header Component - Minimal brand header with accessibility and language controls
 * Desktop-only component; returns null on mobile (MobileHeader handles mobile)
 */

import React, { useState } from 'react';
import AccessibilityPanel from './AccessibilityPanel';
import { LanguageSelector } from './LanguageSelector';
import FeedbackButton from './FeedbackButton';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslation } from '../hooks/useTranslation';
import styles from './Header.module.css';

interface HeaderProps {
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
  isMobile?: boolean;
  apiKey?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ isComplaintMode = false, onToggleComplaint, isMobile = false, apiKey = null }) => {
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const appName = import.meta.env.VITE_APP_NAME || 'ComplAI';

  // Return null on mobile; MobileHeader handles mobile header
  if (isMobile) {
    return null;
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Brand/Logo row with collapse toggle */}
          <div className={styles.brand}>
            <div className={styles.brandRow}>
              <div>
                <h1 className={styles.title}>{appName}</h1>
                <p className={styles.subtitle}>Citizen Support Chatbot</p>
              </div>
              <button
                className={styles.collapseToggle}
                onClick={() => setIsCollapsed((v) => !v)}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? 'Expand controls' : 'Collapse controls'}
                title={isCollapsed ? 'Expand controls' : 'Collapse controls'}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
                >
                  <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls - accessibility, language, feedback and mode toggle */}
          <div className={`${styles.controls} ${isCollapsed ? styles.controlsCollapsed : ''}`}>
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

            <FeedbackButton apiKey={apiKey} />

            <button
              className={`${styles.modeButton} ${isComplaintMode ? styles.on : ''}`}
              onClick={() => onToggleComplaint?.()}
              aria-pressed={isComplaintMode}
              data-tour="complaint-toggle"
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
