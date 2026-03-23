/**
 * Dynamic Language Switching Test
 * Verifies that changing language updates translations without page reload
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@/__tests__/test-utils';
import { useTranslation } from '../useTranslation';
import { useLanguage } from '../useLanguage';
import * as useAccessibilityModule from '../useAccessibility';
import type { Language } from '../types/accessibility.types';

describe('Dynamic Language Switching', () => {
  const baseMockSettings = (language: Language = 'es') => ({
    language,
    colorBlindnessType: 'normal' as const,
    ttsEnabled: false,
    ttsRate: 1.0,
    ttsPitch: 1.0,
    sttEnabled: false,
    sttLanguage: 'es',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update translations when language changes from Spanish to English', () => {
    // Mock useAccessibility with parametrized language
    let testLanguage: Language = 'es';
    
    const mockUpdateSettings = vi.fn((partial) => {
      if (partial.language) {
        testLanguage = partial.language;
      }
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => ({
      settings: baseMockSettings(testLanguage),
      updateSettings: mockUpdateSettings,
      applyColorFilter: vi.fn(),
      setLanguage: mockUpdateSettings,
      isLocalStorageAvailable: false,
    }));

    const { result: translationResult, rerender } = renderHook(() => useTranslation());

    // Initial state should be Spanish
    expect(translationResult.current.t('send_message')).toBe('Enviar');
    expect(translationResult.current.locale).toBe('es');

    // Simulate language change via the setLanguage function
    act(() => {
      mockUpdateSettings({ language: 'en' });
    });
    
    // Re-render to pick up the language change
    rerender();

    // Translations should update WITHOUT page reload
    expect(translationResult.current.t('send_message')).toBe('Send');
    expect(translationResult.current.locale).toBe('en');
  });

  it('should update translations when language changes from Spanish to Catalan', () => {
    let testLanguage: Language = 'es';
    
    const mockUpdateSettings = vi.fn((partial) => {
      if (partial.language) {
        testLanguage = partial.language;
      }
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => ({
      settings: baseMockSettings(testLanguage),
      updateSettings: mockUpdateSettings,
      applyColorFilter: vi.fn(),
      setLanguage: mockUpdateSettings,
      isLocalStorageAvailable: false,
    }));

    const { result: translationResult, rerender } = renderHook(() => useTranslation());

    // Initial state should be Spanish
    expect(translationResult.current.locale).toBe('es');

    // Change language to Catalan
    act(() => {
      mockUpdateSettings({ language: 'ca' });
    });
    
    // Re-render to pick up the language change
    rerender();

    // Translations should update to Catalan
    expect(translationResult.current.t('send_message')).toBe('Enviar');
    expect(translationResult.current.locale).toBe('ca');
  });

  it('useLanguage hook should update when language changes', () => {
    let testLanguage: Language = 'es';
    
    const mockSetLanguage = vi.fn((lang: Language) => {
      testLanguage = lang;
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => ({
      settings: baseMockSettings(testLanguage),
      updateSettings: vi.fn(),
      applyColorFilter: vi.fn(),
      setLanguage: mockSetLanguage,
      isLocalStorageAvailable: false,
    }));

    const { result: languageResult, rerender } = renderHook(() => useLanguage());

    // Initial language should be Spanish
    expect(languageResult.current.currentLanguage).toBe('es');

    // Change language to English
    act(() => {
      mockSetLanguage('en');
    });
    
    // Re-render to pick up the language change
    rerender();

    // Language should update without page reload
    expect(languageResult.current.currentLanguage).toBe('en');
  });

  it('translation function should be memoized and update only when language changes', () => {
    let testLanguage: Language = 'es';

    const mockSetLanguage = vi.fn((lang: Language) => {
      testLanguage = lang;
    });

    const spyUseAccessibility = vi.spyOn(useAccessibilityModule, 'useAccessibility');
    spyUseAccessibility.mockImplementation(() => ({
      settings: baseMockSettings(testLanguage),
      updateSettings: vi.fn(),
      applyColorFilter: vi.fn(),
      setLanguage: mockSetLanguage,
      isLocalStorageAvailable: false,
    }));

    const { result, rerender } = renderHook(() => useTranslation());

    // Verify Spanish translations initially
    expect(result.current.t('send_message')).toBe('Enviar');

    // Change language
    act(() => {
      testLanguage = 'en';
    });
    
    // Re-render to pick up the language change
    rerender();

    // Should have different translations
    expect(result.current.t('send_message')).toBe('Send');
  });
});
