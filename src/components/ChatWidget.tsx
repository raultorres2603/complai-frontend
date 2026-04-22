import React, { useState } from 'react';
import type { ReactNode } from 'react';
import TourButton from './TourButton';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  layout: ReactNode;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ layout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── Expandable chat panel ─────────────────────────────────── */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : styles.panelClosed}`}
        role="dialog"
        aria-modal="true"
        aria-label="Assistent Virtual ComplAI"
      >
        <header className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <span className={styles.panelTitleDot} aria-hidden="true" />
            Assistent Virtual · Ajuntament del Prat de Llobregat
          </div>
          <button
            className={styles.panelClose}
            onClick={() => setIsOpen(false)}
            aria-label="Tancar l'assistent"
            title="Tancar"
          >
            ×
          </button>
        </header>

        <div className={styles.panelBody}>
          {layout}
          <TourButton />
        </div>
      </div>

      {/* ── Trigger button ────────────────────────────────────────── */}
      <button
        className={`${styles.trigger} ${isOpen ? styles.triggerHidden : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Tancar l\'assistent virtual' : 'Obrir l\'assistent virtual'}
      >
        {/* Chat bubble icon */}
        <svg
          className={styles.triggerIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.2512 2.75545 16.3265 4.02952 17.9978L2.5 21.5L6.15674 20.2837C7.83818 21.3653 9.84428 22 12 22Z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="8.5" cy="12" r="1.25" fill="#1d4e8b" />
          <circle cx="12" cy="12" r="1.25" fill="#1d4e8b" />
          <circle cx="15.5" cy="12" r="1.25" fill="#1d4e8b" />
        </svg>
        Pregunti'm
      </button>
    </>
  );
};
