/**
 * useTextToSpeech Hook - Text-to-Speech functionality using Web Speech API
 * Provides voice synthesis with voice selection, rate control, and playback management
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import type { TextToSpeechState } from '../types/accessibility.types';

export interface UseTextToSpeechReturn {
  state: TextToSpeechState;
  readText: (text: string, messageId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  selectVoice: (voiceUri: string) => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [state, setState] = useState<TextToSpeechState>({
    isPlaying: false,
    isPaused: false,
    currentMessageId: null,
    currentText: '',
    currentRate: 1.0,
    availableVoices: [],
    selectedVoiceUri: undefined,
    error: null,
  });

  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setState((prev) => ({
          ...prev,
          availableVoices: voices,
          // Set first voice as default if not already set
          selectedVoiceUri: prev.selectedVoiceUri || (voices[0]?.voiceURI || undefined),
        }));
      };

      // Voices might load asynchronously
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const readText = useCallback((text: string, messageId: string) => {
    if (!synthesisRef.current) {
      setState((prev) => ({
        ...prev,
        error: 'Speech Synthesis not supported in this browser',
      }));
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      if (state.selectedVoiceUri && state.availableVoices.length > 0) {
        const selectedVoice = state.availableVoices.find(
          (v) => v.voiceURI === state.selectedVoiceUri
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Set rate and other properties
      utterance.rate = state.currentRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onstart = () => {
        setState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          currentMessageId: messageId,
          currentText: text,
          error: null,
        }));
      };

      utterance.onpause = () => {
        setState((prev) => ({
          ...prev,
          isPaused: true,
          isPlaying: false,
        }));
      };

      utterance.onresume = () => {
        setState((prev) => ({
          ...prev,
          isPaused: false,
          isPlaying: true,
        }));
      };

      utterance.onend = () => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentMessageId: null,
          currentText: '',
        }));
      };

      utterance.onerror = (event) => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          error: `Speech synthesis error: ${event.error}`,
        }));
      };

      utteranceRef.current = utterance;
      synthesisRef.current.speak(utterance);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: `Error creating utterance: ${err instanceof Error ? err.message : String(err)}`,
      }));
    }
  }, [state.selectedVoiceUri, state.currentRate, state.availableVoices]);

  const pause = useCallback(() => {
    if (synthesisRef.current && synthesisRef.current.speaking && !synthesisRef.current.paused) {
      synthesisRef.current.pause();
      setState((prev) => ({
        ...prev,
        isPaused: true,
        isPlaying: false,
      }));
    }
  }, []);

  const resume = useCallback(() => {
    if (synthesisRef.current && synthesisRef.current.paused) {
      synthesisRef.current.resume();
      setState((prev) => ({
        ...prev,
        isPaused: false,
        isPlaying: true,
      }));
    }
  }, []);

  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentMessageId: null,
        currentText: '',
      }));
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.0, rate));
    setState((prev) => ({
      ...prev,
      currentRate: clampedRate,
    }));

    // Update current utterance if playing
    if (utteranceRef.current && synthesisRef.current?.speaking) {
      utteranceRef.current.rate = clampedRate;
    }
  }, []);

  const selectVoice = useCallback((voiceUri: string) => {
    setState((prev) => ({
      ...prev,
      selectedVoiceUri: voiceUri,
    }));
  }, []);

  return {
    state,
    readText,
    pause,
    resume,
    stop,
    setRate,
    selectVoice,
  };
}
