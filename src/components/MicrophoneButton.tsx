/**
 * MicrophoneButton Component - Speech-to-Text microphone button
 * Allows users to speak and have their speech converted to text in the message input
 */

import React, { useEffect } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTranslation } from '../hooks/useTranslation';
import styles from './MicrophoneButton.module.css';

  interface MicrophoneButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  /**
   * @deprecated STT is now always enabled. This prop is kept for backward compatibility but is ignored.
   */
  sttEnabled?: boolean;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onTranscript,
  disabled = false,
  sttEnabled = true,
}) => {
  const { state, startListening, stopListening, cancelListening, resetTranscript } =
    useSpeechToText();
  const { t } = useTranslation();

  // Auto-send transcript when complete
  useEffect(() => {
    if (
      !state.isListening &&
      state.transcript &&
      state.transcript.trim() &&
      !state.error
    ) {
      // Delay slightly to allow for final transcript update
      const timer = setTimeout(() => {
        onTranscript(state.transcript.trim());
        resetTranscript();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state.isListening, state.transcript, state.error, onTranscript, resetTranscript]);

  const handleClick = () => {
    if (state.isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // STT is now always enabled - microphone button always renders

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.button} ${state.isListening ? styles.listening : ''}`}
        onClick={handleClick}
        disabled={disabled}
        title={state.isListening ? t('stop_listening') : t('start_listening')}
        aria-label={state.isListening ? t('stop_listening') : t('start_listening')}
        data-tour="microphone-button"
      >
        <span className={styles.icon}>🎤</span>
      </button>

      {state.error && (
        <div className={styles.error}>
          <p>{state.error}</p>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => cancelListening()}
          >
            ✕
          </button>
        </div>
      )}

      {state.isListening && (
        <div className={styles.transcript}>
          {state.interimTranscript && (
            <p className={styles.interim}>{state.interimTranscript}</p>
          )}
          {state.transcript && (
            <p className={styles.final}>{state.transcript}</p>
          )}
          {!state.transcript && !state.interimTranscript && (
            <p className={styles.listening}>{t('listening_status')}</p>
          )}
        </div>
      )}
    </div>
  );
};
