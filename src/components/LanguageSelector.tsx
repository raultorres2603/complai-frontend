/**
 * LanguageSelector Component - Language dropdown selector
 * Displays current language with flag and allows selection from available languages
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Language, LanguageOption } from '../types/accessibility.types';
import styles from './LanguageSelector.module.css';

export interface LanguageSelectorProps {
  /** Current selected language */
  currentLanguage: Language;
  /** Callback when language is selected */
  onSelectLanguage: (language: Language) => void;
  /** List of available languages to choose from */
  availableLanguages: LanguageOption[];
}

/**
 * Language selector dropdown component
 * Features:
 * - Dropdown with flag icons and language names
 * - Keyboard navigation (Arrow Up/Down, Enter, Esc)
 * - Closes on selection or outside click
 * - Accessible with ARIA labels and roles
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  availableLanguages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const currentOption = availableLanguages.find((lang) => lang.code === currentLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(availableLanguages.findIndex((lang) => lang.code === currentLanguage));
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % availableLanguages.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + availableLanguages.length) % availableLanguages.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (availableLanguages[focusedIndex]) {
          onSelectLanguage(availableLanguages[focusedIndex].code);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const handleSelectLanguage = (language: Language) => {
    onSelectLanguage(language);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(availableLanguages.findIndex((lang) => lang.code === currentLanguage));
    }
  };

  return (
    <div className={styles.container} data-tour="language-selector">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current: ${currentOption?.label || 'Unknown'}`}
        title="Select language"
      >
        <span className={styles.flag}>{currentOption?.flag}</span>
        <span className={styles.label}>{currentOption?.label}</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={styles.menu}
          role="listbox"
          aria-label="Available languages"
        >
          {availableLanguages.map((language, index) => (
            <button
              key={language.code}
              className={`${styles.menuItem} ${
                language.code === currentLanguage ? styles.selected : ''
              } ${index === focusedIndex ? styles.focused : ''}`}
              onClick={() => handleSelectLanguage(language.code)}
              onKeyDown={handleKeyDown}
              role="option"
              aria-selected={language.code === currentLanguage}
            >
              <span className={styles.itemFlag}>{language.flag}</span>
              <span className={styles.itemLabel}>{language.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
