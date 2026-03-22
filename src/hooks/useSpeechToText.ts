/**
 * useSpeechToText Hook - Speech-to-Text functionality using Web Speech API
 * Converts spoken input to text with real-time transcript display
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import type { SpeechToTextState } from '../types/accessibility.types';
import { SUPPORTED_STT_LANGUAGES } from '../types/accessibility.types';

export interface UseSpeechToTextReturn {
  state: SpeechToTextState;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
  setLanguage: (language: string) => void;
  resetTranscript: () => void;
}

// Get SpeechRecognition API (with webkit prefix fallback)
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSpeechToText(): UseSpeechToTextReturn {
  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    alternatives: [],
    error: null,
    language: 'en-US',
    supportedLanguages: SUPPORTED_STT_LANGUAGES,
  });

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  // Initialize Speech Recognition
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setState((prev) => ({
        ...prev,
        error: 'Speech Recognition not supported in this browser',
      }));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    // Set up recognition properties
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = state.language;

    // Event handlers
    recognition.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
      }));
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let maxConfidence = 0;
      let bestAlternative = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
          maxConfidence = Math.max(maxConfidence, confidence);
          if (confidence > 0.8 && !bestAlternative) {
            bestAlternative = transcript;
          }
        } else {
          interimTranscript += transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: finalTranscriptRef.current,
        interimTranscript,
        confidence: maxConfidence,
        alternatives: bestAlternative ? [bestAlternative] : [],
      }));
    };

    recognition.onerror = (event: any) => {
      let errorMessage = `Speech recognition error: ${event.error}`;
      if (event.error === 'network') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission denied.';
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setState((prev) => ({
        ...prev,
        error: 'Speech Recognition not supported',
      }));
      return;
    }

    finalTranscriptRef.current = '';
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));

    try {
      recognitionRef.current.language = state.language;
      recognitionRef.current.start();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: `Error starting listening: ${err instanceof Error ? err.message : String(err)}`,
      }));
    }
  }, [state.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
      setState((prev) => ({
        ...prev,
        isListening: false,
      }));
    }
  }, [state.isListening]);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      finalTranscriptRef.current = '';
      setState((prev) => ({
        ...prev,
        isListening: false,
        transcript: '',
        interimTranscript: '',
        confidence: 0,
      }));
    }
  }, []);

  const setLanguage = useCallback((language: string) => {
    setState((prev) => ({
      ...prev,
      language,
    }));
    if (recognitionRef.current) {
      recognitionRef.current.language = language;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
    }));
  }, []);

  return {
    state,
    startListening,
    stopListening,
    cancelListening,
    setLanguage,
    resetTranscript,
  };
}
