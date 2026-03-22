/**
 * useTranslation Hook - Provides translated strings based on current language
 */

import { useAccessibility } from './useAccessibility';
import { getTranslation, type TranslationKey } from '../translations/languages';

export interface UseTranslationReturn {
  t: (key: TranslationKey) => string;
  locale: string;
}

/**
 * Custom hook for accessing translated strings
 * Uses the current language from useAccessibility
 *
 * @returns Translation function and current locale
 */
export function useTranslation(): UseTranslationReturn {
  const { settings } = useAccessibility();

  const t = (key: TranslationKey): string => {
    return getTranslation(settings.language, key);
  };

  return {
    t,
    locale: settings.language,
  };
}
