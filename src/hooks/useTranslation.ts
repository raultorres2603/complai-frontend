/**
 * useTranslation Hook - Provides translated strings based on current language
 * Properly memoizes the translation function to avoid unnecessary re-renders
 */

import { useCallback, useMemo } from 'react';
import { useAccessibility } from './useAccessibility';
import { getTranslation, type TranslationKey } from '../translations/languages';

export interface UseTranslationReturn {
  t: (key: TranslationKey) => string;
  locale: string;
}

/**
 * Custom hook for accessing translated strings
 * Uses the current language from useAccessibility
 * Properly memoizes the translation function and locale to ensure dynamic language switching works
 *
 * @returns Memoized translation function and current locale
 */
export function useTranslation(): UseTranslationReturn {
  const { settings } = useAccessibility();

  // Memoize translation function - changes only when language changes
  const t = useCallback((key: TranslationKey): string => {
    return getTranslation(settings.language, key);
  }, [settings.language]);

  // Memoize return object to ensure stable reference
  return useMemo(
    () => ({
      t,
      locale: settings.language,
    }),
    [t, settings.language]
  );
}
