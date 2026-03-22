/**
 * SpeechControls Component - Text-to-Speech controls
 * Provides voice playback controls, voice selection, and speed adjustment
 * Only renders when TTS is enabled
 */

import React from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useAccessibility } from '../hooks/useAccessibility';
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
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  messages,
  ttsEnabled = true,
}) => {
  const { settings } = useAccessibility();
  // Pass enabled parameter to dynamically control TTS initialization
  const { state, readText, stop, setRate, selectVoice } = useTextToSpeech(settings.ttsEnabled);

  // Early return: don't render if TTS is disabled
  if (!ttsEnabled || !settings.ttsEnabled) {
    return null;
  }

  const assistantMessages = messages.filter((msg) => msg.role === 'assistant');

  const handleReadMessage = (messageId: string) => {
    const message = assistantMessages.find((m) => m.id === messageId);
    if (message) {
      readText(message.content, messageId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔊 Text-to-Speech</h3>
        {state.isPlaying && (
          <button
            className={styles.stopBtn}
            onClick={stop}
            title="Stop speaking"
          >
            Stop
          </button>
        )}
      </div>

      <div className={styles.controls}>
        {/* Speed Control */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>Speed:</label>
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
            <label className={styles.label}>Voice:</label>
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
