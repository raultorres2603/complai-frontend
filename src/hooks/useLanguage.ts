/**
 * useLanguage Hook - Manages language selection
 * Provides current language, language setter, locale, and available language options
 */

import { useAccessibility } from './useAccessibility';
import type { Language, LanguageOption } from '../types/accessibility.types';
import { AVAILABLE_LANGUAGES } from '../types/accessibility.types';

export interface UseLanguageReturn {
  /** Current language code (e.g., 'es', 'en', 'ca') */
  currentLanguage: Language;
  /** Function to change language */
  setLanguage: (language: Language) => void;
  /** Locale string for use in API calls (e.g., 'es-ES', 'en-US') */
  locale: string;
  /** List of all available language options */
  availableLanguages: LanguageOption[];
}

/**
 * Custom hook for managing language selection
 * Wraps useAccessibility and provides language-specific utilities
 *
 * @returns Language state, setter, locale, and available options
 */
export function useLanguage(): UseLanguageReturn {
  const { settings, setLanguage: setAccessibilityLanguage } = useAccessibility();

  return {
    currentLanguage: settings.language,
    setLanguage: setAccessibilityLanguage,
    locale: AVAILABLE_LANGUAGES[settings.language].locale,
    availableLanguages: Object.values(AVAILABLE_LANGUAGES),
  };
}
