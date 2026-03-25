/**
 * SpeechControls Component - Text-to-Speech controls
 * Provides voice playback controls, voice selection, and speed adjustment
 * Only renders when TTS is enabled
 * 
 * NOTE: Fully reactive - TTS widget appears/disappears instantly when toggled
 * No page reload needed
 */

import React, { useMemo } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useAccessibility } from '../hooks/useAccessibility';
import { useTranslation } from '../hooks/useTranslation';
import styles from './SpeechControls.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  files?: Array<{ id: string; name: string; url: string; type: string }>;
}

interface SpeechControlsProps {
  messages: ChatMessage[];
  ttsEnabled?: boolean;
  isCompact?: boolean;
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  messages,
  ttsEnabled = true,
  isCompact = false,
}) => {
  const { settings } = useAccessibility();
  const { t } = useTranslation();
  
  // Determine if TTS is actually enabled
  const isEnabled = useMemo(() => ttsEnabled && settings.ttsEnabled, [ttsEnabled, settings.ttsEnabled]);
  
  // Pass enabled parameter to dynamically control TTS initialization
  // This hook properly handles the dynamic enable/disable without page reload
  const { state, readText, stop, setRate, selectVoice } = useTextToSpeech(isEnabled);

  // Memoize filtered messages to prevent unnecessary recalculations
  // NOTE: Must be called before early return to maintain consistent hook count
  const assistantMessages = useMemo(
    () => messages.filter((msg) => msg.role === 'assistant'),
    [messages]
  );

  // Early return: don't render if TTS is disabled
  if (!isEnabled) {
    return null;
  }

  const handleReadMessage = (messageId: string) => {
    const message = assistantMessages.find((m) => m.id === messageId);
    if (message) {
      readText(message.content, messageId);
    }
  };
  // Compact mode: horizontal layout with play/stop/voice select only
  if (isCompact) {
    return (
      <div className={`${styles.container} ${styles.compact}`} data-tour="speech-controls">
        <div className={styles.compactControls}>
          {state.isPlaying && (
            <button
              className={styles.stopBtn}
              onClick={stop}
              title={t('stop')}
              aria-label={t('stop')}
            >
              ⏹️
            </button>
          )}

          {assistantMessages.length > 0 && !state.isPlaying && (
            <button
              className={styles.playBtn}
              onClick={() => handleReadMessage(assistantMessages[assistantMessages.length - 1].id)}
              title={t('listen')}
              aria-label={t('listen')}
            >
              ▶️
            </button>
          )}

          {state.availableVoices.length > 0 && (
            <select
              value={state.selectedVoiceUri || ''}
              onChange={(e) => selectVoice(e.target.value)}
              className={styles.voiceSelect}
              title={t('voice_label')}
              aria-label={t('voice_label')}
            >
              {state.availableVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  }

  // Desktop mode: full layout
  return (
    <div className={styles.container} data-tour="speech-controls">
      <div className={styles.header}>
        <h3 className={styles.title}>🔊 Text-to-Speech</h3>
        {state.isPlaying && (
          <button
            className={styles.stopBtn}
            onClick={stop}
            title={t('stop_speaking')}
          >
            {t('stop_speaking')}
          </button>
        )}
      </div>

      <div className={styles.controls}>
        {/* Speed Control */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>{t('speed_label')}</label>
          <div className={styles.speedControl}>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={state.currentRate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.speedValue}>{state.currentRate.toFixed(1)}x</span>
          </div>
        </div>

        {/* Voice Selection */}
        {state.availableVoices.length > 0 && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>{t('voice_label')}</label>
            <select
              value={state.selectedVoiceUri || ''}
              onChange={(e) => selectVoice(e.target.value)}
              className={styles.select}
            >
              {state.availableVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages List */}
      {assistantMessages.length > 0 && (
        <div className={styles.messagesList}>
          <p className={styles.listLabel}>Read Message:</p>
          <div className={styles.messagesContainer}>
            {assistantMessages.map((message) => (
              <button
                key={message.id}
                className={`${styles.messageButton} ${
                  state.currentMessageId === message.id ? styles.active : ''
                }`}
                onClick={() => handleReadMessage(message.id)}
              >
                <span className={styles.icon}>
                  {state.currentMessageId === message.id
                    ? state.isPlaying
                      ? '▶️'
                      : '⏸️'
                    : '🔊'}
                </span>
                <span className={styles.text}>
                  {message.content.substring(0, 50)}
                  {message.content.length > 50 ? '...' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {state.error && (
        <div className={styles.error}>
          <p>{state.error}</p>
        </div>
      )}
    </div>
  );
};
