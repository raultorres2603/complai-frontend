/**
 * useTranslation Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from '../hooks/useTranslation';
import { useAccessibility } from '../hooks/useAccessibility';

describe('useTranslation', () => {
  it('returns Spanish translations by default', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('accessibility_settings')).toBe('Configuración de Accesibilidad');
    expect(result.current.t('color_blindness_filter')).toBe('Filtro de Daltonismo');
  });

  it('returns English translations when language is English', () => {
    const { result: a11yResult } = renderHook(() => useAccessibility());
    const { result: transResult } = renderHook(() => useTranslation());

    act(() => {
      a11yResult.current.setLanguage('en');
    });

    expect(transResult.current.t('accessibility_settings')).toBe('Accessibility Settings');
    expect(transResult.current.t('color_blindness_filter')).toBe('Color Blindness Filter');
  });

  it('returns Catalan translations when language is Catalan', () => {
    const { result: a11yResult } = renderHook(() => useAccessibility());
    const { result: transResult } = renderHook(() => useTranslation());

    act(() => {
      a11yResult.current.setLanguage('ca');
    });

    expect(transResult.current.t('accessibility_settings')).toBe('Configuració d\'Accessibilitat');
    expect(transResult.current.t('text_to_speech')).toBe('Text a Veu');
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
