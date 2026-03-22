/**
 * Header Component - Minimal brand header
 */

import React, { useState } from 'react';
import AccessibilityPanel from './AccessibilityPanel';
import styles from './Header.module.css';

interface HeaderProps {
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isComplaintMode = false, onToggleComplaint }) => {
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Brand/Logo */}
          <div className={styles.brand}>
            <h1 className={styles.title}>ComplAI</h1>
            <p className={styles.subtitle}>Citizen Support Chatbot</p>
          </div>

          {/* Right controls - toggle complaint mode and accessibility */}
          <div className={styles.controls}>
            <button
              className={styles.accessibilityButton}
              onClick={() => setIsAccessibilityPanelOpen(true)}
              aria-label="Open accessibility settings"
              title="Accessibility Settings"
            >
              ♿
            </button>
            <button
              className={`${styles.modeButton} ${isComplaintMode ? styles.on : ''}`}
              onClick={() => onToggleComplaint?.()}
              aria-pressed={isComplaintMode}
            >
              {isComplaintMode ? 'Complaint mode' : 'Ask a question'}
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
