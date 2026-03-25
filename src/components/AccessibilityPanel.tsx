/**
 * AccessibilityPanel Component - User accessibility settings
 */

import React, { useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useTranslation } from '../hooks/useTranslation';
import { COLORBLINDNESS_FILTERS, type ColorBlindnessType } from '../types/accessibility.types';
import styles from './AccessibilityPanel.module.css';

export interface AccessibilityPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

/**
 * Accessibility panel for managing user accessibility preferences
 * Includes color blindness filter and TTS
 */
export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isVisible,
  onClose,
}) => {
  const { settings, updateSettings } = useAccessibility();
  const { t } = useTranslation();
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
          <h2 className={styles.title}>{t('accessibility_settings')}</h2>
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('close')}
              title={t('close')}
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
                {t('color_blindness_filter')}
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.has('daltonism') ? '▼' : '▶'}
              </span>
            </button>

            {expandedSections.has('daltonism') && (
              <div id="daltonism-content" className={styles.sectionContent}>
                <label htmlFor="colorblindness-select" className={styles.label}>
                  {t('vision_type')}
                </label>
                <select
                  id="colorblindness-select"
                  value={settings.colorBlindnessType}
                  onChange={(e) =>
                    updateSettings({ colorBlindnessType: e.target.value as ColorBlindnessType })
                  }
                  className={styles.select}
                  aria-label={'Color blindness filter type'}
                >
                  {Object.entries(COLORBLINDNESS_FILTERS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <div className={styles.preview}>
                  <p className={styles.previewLabel}>{t('preview')}:</p>
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
                {t('text_to_speech')}
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
                    aria-label={t('enable_tts')}
                  />
                  <span>{t('enable_tts')}</span>
                </label>

                {settings.ttsEnabled && (
                  <div className={styles.subOptions}>
                    <label htmlFor="tts-rate" className={styles.label}>
                      {t('voice_rate')} {settings.ttsRate.toFixed(1)}x
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
                      aria-label={t('voice_rate')}
                    />
                  </div>
                )}
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
