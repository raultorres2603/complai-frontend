/**
 * useLanguage Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '../useLanguage';

describe('useLanguage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns current language from accessibility settings', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.currentLanguage).toMatch(/^(es|en|ca)$/);
  });

  it('changes language when setLanguage is called', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.setLanguage('en');
    });
    
    expect(result.current.currentLanguage).toBe('en');
  });

  it('persists language change to localStorage', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.setLanguage('ca');
    });
    
    // Check localStorage
    const stored = localStorage.getItem('complai_accessibility');
    expect(stored).toBeDefined();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.language).toBe('ca');
    }
  });

  it('returns all available languages', () => {
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.availableLanguages).toHaveLength(3);
    expect(result.current.availableLanguages.map((l) => l.code)).toEqual(
      expect.arrayContaining(['es', 'en', 'ca'])
    );
  });

  it('returns correct locale for current language', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.setLanguage('en');
    });
    
    expect(result.current.locale).toBe('en-US');
  });

  it('handles language codes with corresponding metadata', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.setLanguage('es');
    });
    
    const esOption = result.current.availableLanguages.find((l) => l.code === 'es');
    expect(esOption).toBeDefined();
    expect(esOption?.label).toBe('Español');
    expect(esOption?.flag).toBeDefined();
    expect(esOption?.locale).toBe('es-ES');
  });
});
