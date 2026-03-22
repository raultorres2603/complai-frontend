/**
 * AccessibilityPanel Component - User accessibility settings
 */

import React, { useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useLanguage } from '../hooks/useLanguage';
import { COLORBLINDNESS_FILTERS, type ColorBlindnessType } from '../types/accessibility.types';
import { LanguageSelector } from './LanguageSelector';
import styles from './AccessibilityPanel.module.css';

export interface AccessibilityPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

/**
 * Accessibility panel for managing user accessibility preferences
 * Includes color blindness filter, TTS, STT, and language selection
 */
export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isVisible,
  onClose,
}) => {
  const { settings, updateSettings } = useAccessibility();
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['daltonism']));

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose} aria-label="Close accessibility settings">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Accessibility Settings</h2>
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
              title="Close accessibility panel"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.content}>
          {/* Color Blindness Filter Section */}
          <div className={styles.section} data-section="colorblindness">
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('daltonism')}
              aria-expanded={expandedSections.has('daltonism')}
              aria-controls="daltonism-content"
            >
              <span className={styles.sectionTitle}>
                <span className={styles.icon}>♿</span>
                Color Blindness Filter
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.has('daltonism') ? '▼' : '▶'}
              </span>
            </button>

            {expandedSections.has('daltonism') && (
              <div id="daltonism-content" className={styles.sectionContent}>
                <label htmlFor="colorblindness-select" className={styles.label}>
                  Vision Type:
                </label>
                <select
                  id="colorblindness-select"
                  value={settings.colorBlindnessType}
                  onChange={(e) =>
                    updateSettings({ colorBlindnessType: e.target.value as ColorBlindnessType })
                  }
                  className={styles.select}
                  aria-label="Color blindness filter type"
                >
                  {Object.entries(COLORBLINDNESS_FILTERS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <div className={styles.preview}>
                  <p className={styles.previewLabel}>Preview:</p>
                  <div
                    className={styles.previewBox}
                    style={{
                      filter:
                        settings.colorBlindnessType === 'normal'
                          ? 'none'
                          : settings.colorBlindnessType === 'deuteranopia'
                            ? 'saturate(0.95) hue-rotate(40deg)'
                            : settings.colorBlindnessType === 'protanopia'
                              ? 'saturate(0.95) hue-rotate(-40deg)'
                              : 'saturate(0.9) hue-rotate(180deg)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', backgroundColor: '#ff0000' }} />
                      <div style={{ width: '30px', height: '30px', backgroundColor: '#00ff00' }} />
                      <div style={{ width: '30px', height: '30px', backgroundColor: '#0000ff' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text-to-Speech Section */}
          <div className={styles.section} data-section="tts">
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('tts')}
              aria-expanded={expandedSections.has('tts')}
              aria-controls="tts-content"
            >
              <span className={styles.sectionTitle}>
                <span className={styles.icon}>🔊</span>
                Text-to-Speech
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.has('tts') ? '▼' : '▶'}
              </span>
            </button>

            {expandedSections.has('tts') && (
              <div id="tts-content" className={styles.sectionContent}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.ttsEnabled}
                    onChange={(e) => updateSettings({ ttsEnabled: e.target.checked })}
                    aria-label="Enable text-to-speech"
                  />
                  <span>Enable Text-to-Speech</span>
                </label>

                {settings.ttsEnabled && (
                  <div className={styles.subOptions}>
                    <label htmlFor="tts-rate" className={styles.label}>
                      Speed: {settings.ttsRate.toFixed(1)}x
                    </label>
                    <input
                      id="tts-rate"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.ttsRate}
                      onChange={(e) => updateSettings({ ttsRate: parseFloat(e.target.value) })}
                      className={styles.slider}
                      aria-label="Text-to-speech speed"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Speech-to-Text Section */}
          <div className={styles.section} data-section="stt">
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('stt')}
              aria-expanded={expandedSections.has('stt')}
              aria-controls="stt-content"
            >
              <span className={styles.sectionTitle}>
                <span className={styles.icon}>🎤</span>
                Speech-to-Text
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.has('stt') ? '▼' : '▶'}
              </span>
            </button>

            {expandedSections.has('stt') && (
              <div id="stt-content" className={styles.sectionContent}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.sttEnabled}
                    onChange={(e) => updateSettings({ sttEnabled: e.target.checked })}
                    aria-label="Enable speech-to-text"
                  />
                  <span>Enable Speech-to-Text</span>
                </label>

                {settings.sttEnabled && (
                  <div className={styles.subOptions}>
                    <label htmlFor="stt-language" className={styles.label}>
                      Language:
                    </label>
                    <select
                      id="stt-language"
                      value={settings.sttLanguage}
                      onChange={(e) => updateSettings({ sttLanguage: e.target.value })}
                      className={styles.select}
                      aria-label="Speech-to-text language"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="ca-ES">Catalan</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="it-IT">Italian</option>
                      <option value="pt-BR">Portuguese (Brazil)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Selection Section */}
          <div className={styles.section} data-section="language">
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('language')}
              aria-expanded={expandedSections.has('language')}
              aria-controls="language-content"
            >
              <span className={styles.sectionTitle}>
                <span className={styles.icon}>🌐</span>
                Language
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.has('language') ? '▼' : '▶'}
              </span>
            </button>

            {expandedSections.has('language') && (
              <div id="language-content" className={styles.sectionContent}>
                <label htmlFor="language-selector" className={styles.label}>
                  Interface Language:
                </label>
                <div className={styles.languageSelectorWrapper}>
                  <LanguageSelector
                    currentLanguage={currentLanguage}
                    onSelectLanguage={setLanguage}
                    availableLanguages={availableLanguages}
                  />
                </div>
                <p className={styles.description}>
                  Changes the language of the interface and API requests.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            Settings are automatically saved and will persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;
