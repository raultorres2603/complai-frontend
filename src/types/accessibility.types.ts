/**
 * Accessibility Feature Types - Daltonism, Text-to-Speech, Speech-to-Text, Language
 */

/**
 * Language type for UI and API communication
 * - es: Spanish (Español)
 * - en: English
 * - ca: Catalan (Català)
 */
export type Language = 'es' | 'en' | 'ca';

/**
 * Language option with metadata (label, flag icon, locale)
 */
export interface LanguageOption {
  code: Language;
  label: string;
  flag: string; // Flag emoji: 🇪🇸, 🇬🇧, 🇪🇸
  locale: string; // BCP 47 locale: es-ES, en-US, ca-ES
}

/**
 * Available language options
 */
export const AVAILABLE_LANGUAGES: Record<Language, LanguageOption> = {
  es: { code: 'es', label: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  en: { code: 'en', label: 'English', flag: '🇬🇧', locale: 'en-US' },
  ca: { code: 'ca', label: 'Català', flag: '🇪🇸', locale: 'ca-ES' },
};

/**
 * Color blindness type for Daltonism support
 * - normal: No filter
 * - deuteranopia: Red-green color blindness (most common, ~1% of males)
 * - protanopia: Red color blindness (~0.5% of males)
 * - tritanopia: Blue-yellow color blindness (rarest, ~0.001% of population)
 */
export type ColorBlindnessType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';

/**
 * Text-to-Speech configuration
 */
export interface TextToSpeechConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;          // 0.5 to 2.0, default 1.0
  pitch: number;         // 0.5 to 2.0, default 1.0
  volume: number;        // 0 to 1, default 1.0
}

/**
 * Text-to-Speech playback state
 */
export interface TextToSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  currentMessageId: string | null;
  currentText: string;
  currentRate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceUri?: string;
  error: string | null;
}

/**
 * Speech-to-Text configuration
 */
export interface SpeechToTextConfig {
  language: string;           // BCP 47 language tag, e.g., 'en-US'
  continuous: boolean;        // true = allow multiple words; false = single phrase
  interimResults: boolean;    // true = show partial transcript while speaking
}

/**
 * Speech-to-Text recognition state
 */
export interface SpeechToTextState {
  isListening: boolean;
  transcript: string;         // Final, confirmed transcript
  interimTranscript: string;  // Partial transcript while speaking
  confidence: number;         // 0 to 1, confidence level of current transcript
  alternatives: string[];     // Alternative transcripts
  error: string | null;
  language: string;           // Current language code
  supportedLanguages: Array<{ code: string; name: string }>;
}

/**
 * User accessibility settings (persisted in localStorage)
 */
export interface AccessibilitySettings {
  colorBlindnessType: ColorBlindnessType;
  language: Language; // Current language selection
  ttsEnabled: boolean;
  ttsRate: number;           // 0.5 to 2.0
  ttsVoiceUri?: string;
  ttsPitch: number;          // 0.5 to 2.0
  /**
   * @deprecated STT is now always enabled. This field is kept for backward compatibility.
   */
  sttEnabled: boolean;
  sttLanguage: string;       // e.g., 'en-US'
  sttAutoSendConfidence?: number; // Auto-send if confidence > this threshold
}

/**
 * Default accessibility settings
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  colorBlindnessType: 'normal',
  language: 'ca', // Default to Catalan
  ttsEnabled: false,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  sttEnabled: true, // STT is now always enabled
  sttLanguage: 'en-US',
  sttAutoSendConfidence: 0.8,
};

/**
 * Available language options for STT
 */
export const SUPPORTED_STT_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'ca-ES', name: 'Catalan' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
];

/**
 * Color blindness filter descriptions
 */
export const COLORBLINDNESS_FILTERS = {
  normal: 'Normal Vision',
  deuteranopia: 'Deuteranopia (Red-Green Blindness)',
  protanopia: 'Protanopia (Red Blindness)',
  tritanopia: 'Tritanopia (Blue-Yellow Blindness)',
} as const;
