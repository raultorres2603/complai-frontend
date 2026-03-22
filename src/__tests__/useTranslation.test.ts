/**
 * useTranslation Hook Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTranslation } from '../hooks/useTranslation';

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns Spanish translations by default', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('accessibility_settings')).toBe('Configuración de Accesibilidad');
    expect(result.current.t('color_blindness_filter')).toBe('Filtro de Daltonismo');
  });

  it('returns English translations when language is English', () => {
    // Set English language in localStorage before rendering
    const settings = {
      colorBlindnessType: 'normal' as const,
      language: 'en' as const,
      ttsEnabled: false,
      ttsRate: 1.0,
      ttsPitch: 1.0,
      sttEnabled: false,
      sttLanguage: 'en-US',
      sttAutoSendConfidence: 0.8,
    };
    localStorage.setItem('complai_accessibility', JSON.stringify(settings));

    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('accessibility_settings')).toBe('Accessibility Settings');
    expect(result.current.t('color_blindness_filter')).toBe('Color Blindness Filter');
  });

  it('returns Catalan translations when language is Catalan', () => {
    // Set Catalan language in localStorage before rendering
    const settings = {
      colorBlindnessType: 'normal' as const,
      language: 'ca' as const,
      ttsEnabled: false,
      ttsRate: 1.0,
      ttsPitch: 1.0,
      sttEnabled: false,
      sttLanguage: 'en-US',
      sttAutoSendConfidence: 0.8,
    };
    localStorage.setItem('complai_accessibility', JSON.stringify(settings));

    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('accessibility_settings')).toBe('Configuració d\'Accessibilitat');
    expect(result.current.t('text_to_speech')).toBe('Text a Veu');
  });

  it('provides current locale', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.locale).toMatch(/^(es|en|ca)$/);
  });

  it('returns key as fallback if translation missing', () => {
    const { result } = renderHook(() => useTranslation());
    const key = 'nonexistent_key' as any;
    expect(result.current.t(key)).toBeTruthy();
  });
});
