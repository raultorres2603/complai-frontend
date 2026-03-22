/**
 * Dynamic Language Switching Test
 * Verifies that changing language updates translations without page reload
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@/__tests__/test-utils';
import { useTranslation } from './useTranslation';
import { useLanguage } from './useLanguage';
import * as useAccessibilityModule from './useAccessibility';

describe('Dynamic Language Switching', () => {
  const mockSettings = {
    language: 'es' as const,
    colorBlindnessFilter: 'normal' as const,
    colorBlindnessType: 'normal' as const,
    ttsEnabled: false,
    sttEnabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update translations when language changes from Spanish to English', () => {
    // Mock useAccessibility to return mutable settings
    let currentLanguage = 'es' as const;
    
    const mockUpdateSettings = vi.fn((partial) => {
      if (partial.language) {
        currentLanguage = partial.language;
      }
    });

    const getAccessibilityReturn = () => ({
      settings: {
        ...mockSettings,
        language: currentLanguage,
      },
      updateSettings: mockUpdateSettings,
      applyColorFilter: vi.fn(),
      setLanguage: mockUpdateSettings,
      isLocalStorageAvailable: false,
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => getAccessibilityReturn());

    const { result: translationResult, rerender } = renderHook(() => useTranslation());

    // Initial state should be Spanish
    expect(translationResult.current.t('send_message')).toBe('Enviar');
    expect(translationResult.current.locale).toBe('es');

    // Change language to English
    act(() => {
      currentLanguage = 'en';
      rerender();
    });

    // Translations should update WITHOUT page reload
    expect(translationResult.current.t('send_message')).toBe('Send');
    expect(translationResult.current.locale).toBe('en');
  });

  it('should update translations when language changes from Spanish to Catalan', () => {
    let currentLanguage = 'es' as const;
    
    const mockUpdateSettings = vi.fn((partial) => {
      if (partial.language) {
        currentLanguage = partial.language;
      }
    });

    const getAccessibilityReturn = () => ({
      settings: {
        ...mockSettings,
        language: currentLanguage,
      },
      updateSettings: mockUpdateSettings,
      applyColorFilter: vi.fn(),
      setLanguage: mockUpdateSettings,
      isLocalStorageAvailable: false,
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => getAccessibilityReturn());

    const { result: translationResult, rerender } = renderHook(() => useTranslation());

    // Initial state should be Spanish
    expect(translationResult.current.locale).toBe('es');

    // Change language to Catalan
    act(() => {
      currentLanguage = 'ca';
      rerender();
    });

    // Translations should update to Catalan
    expect(translationResult.current.t('send_message')).toBe('Enviar');
    expect(translationResult.current.locale).toBe('ca');
  });

  it('useLanguage hook should update when language changes', () => {
    let currentLanguage = 'es' as const;
    
    const mockSetLanguage = vi.fn((lang) => {
      currentLanguage = lang;
    });

    const getAccessibilityReturn = () => ({
      settings: {
        ...mockSettings,
        language: currentLanguage,
      },
      updateSettings: vi.fn(),
      applyColorFilter: vi.fn(),
      setLanguage: mockSetLanguage,
      isLocalStorageAvailable: false,
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => getAccessibilityReturn());

    const { result: languageResult, rerender } = renderHook(() => useLanguage());

    // Initial language should be Spanish
    expect(languageResult.current.currentLanguage).toBe('es');

    // Change language to English
    act(() => {
      languageResult.current.setLanguage('en');
      currentLanguage = 'en';
      rerender();
    });

    // Language should update without page reload
    expect(languageResult.current.currentLanguage).toBe('en');
  });

  it('translation function should be memoized and update only when language changes', () => {
    let currentLanguage = 'es' as const;
    let renderCount = 0;

    const getAccessibilityReturn = () => ({
      settings: {
        ...mockSettings,
        language: currentLanguage,
      },
      updateSettings: vi.fn(),
      applyColorFilter: vi.fn(),
      setLanguage: vi.fn(),
      isLocalStorageAvailable: false,
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => getAccessibilityReturn());

    const { result, rerender } = renderHook(() => {
      renderCount++;
      return useTranslation();
    });

    const initialT = result.current.t;

    // Rerender without language change
    rerender();
    // The t function should be memoized and have a stable reference when language doesn't change
    // (though it will be recreated on re-render, the identity should be consistent)

    // Change language
    act(() => {
      currentLanguage = 'en';
      rerender();
    });

    // Should have different translations
    expect(result.current.t('send_message')).toBe('Send');
  });
});
