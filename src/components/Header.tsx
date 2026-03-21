/**
 * Header Component - Minimal brand header
 */

import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isComplaintMode = false, onToggleComplaint }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand/Logo */}
        <div className={styles.brand}>
          <h1 className={styles.title}>ComplAI</h1>
          <p className={styles.subtitle}>Citizen Support Chatbot</p>
        </div>

        {/* Right controls - toggle complaint mode (text button) */}
        <div className={styles.controls}>
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
  );
};
