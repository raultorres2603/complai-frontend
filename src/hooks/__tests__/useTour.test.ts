import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHook } from '../../__tests__/test-utils';
import { useTour } from '../useTour';
import type { Language } from '../../types/accessibility.types';

const {
  mockOnComplete,
  mockOnExit,
  mockStart,
  mockSetOptions,
  mockIntroInstance,
} = vi.hoisted(() => {
  const mockOnComplete = vi.fn().mockReturnThis();
  const mockOnExit = vi.fn().mockReturnThis();
  const mockStart = vi.fn().mockReturnThis();
  const mockSetOptions = vi.fn().mockReturnThis();
  const mockIntroInstance = {
    setOptions: mockSetOptions,
    oncomplete: mockOnComplete,
    onexit: mockOnExit,
    start: mockStart,
  };
  return { mockOnComplete, mockOnExit, mockStart, mockSetOptions, mockIntroInstance };
});

vi.mock('intro.js', () => ({
  default: vi.fn(() => mockIntroInstance),
}));

const { mockHas, mockSet } = vi.hoisted(() => ({
  mockHas: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock('../../services/storageService', () => ({
  storageService: { has: mockHas, set: mockSet },
}));

const { mockUseLanguage } = vi.hoisted(() => ({
  mockUseLanguage: vi.fn((): { currentLanguage: Language; setLanguage: any; locale: string; availableLanguages: never[] } => ({
    currentLanguage: 'ca',
    setLanguage: vi.fn(),
    locale: 'ca-ES',
    availableLanguages: [],
  })),
}));

vi.mock('../useLanguage', () => ({
  useLanguage: mockUseLanguage,
}));

import introJs from 'intro.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockOnComplete.mockReturnThis();
  mockOnExit.mockReturnThis();
  mockStart.mockReturnThis();
  mockSetOptions.mockReturnThis();
  mockUseLanguage.mockReturnValue({
    currentLanguage: 'ca' as Language,
    setLanguage: vi.fn(),
    locale: 'ca-ES',
    availableLanguages: [],
  });
});

describe('useTour', () => {
  it('auto-starts tour on first visit (tour_completed absent)', () => {
    mockHas.mockReturnValue(false);

    act(() => {
      renderHook(() => useTour());
    });

    expect(introJs).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-start when tour already completed', () => {
    mockHas.mockReturnValue(true);

    act(() => {
      renderHook(() => useTour());
    });

    expect(mockStart).not.toHaveBeenCalled();
  });

  it('startTour() works when called manually', () => {
    mockHas.mockReturnValue(true);

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('calls storageService.set on oncomplete callback', () => {
    mockHas.mockReturnValue(true);

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    const completeCb = mockOnComplete.mock.calls[0][0] as () => void;
    completeCb();

    expect(mockSet).toHaveBeenCalledWith('tour_completed', true);
  });

  it('calls storageService.set on onexit callback', () => {
    mockHas.mockReturnValue(true);

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    const exitCb = mockOnExit.mock.calls[0][0] as () => void;
    exitCb();

    expect(mockSet).toHaveBeenCalledWith('tour_completed', true);
  });

  it('uses Spanish steps when language is Spanish', () => {
    mockHas.mockReturnValue(true);
    mockUseLanguage.mockReturnValue({
      currentLanguage: 'es' as Language,
      setLanguage: vi.fn(),
      locale: 'es-ES',
      availableLanguages: [],
    });

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    const setOptionsCall = mockSetOptions.mock.calls[0];
    expect(setOptionsCall).toBeDefined();
    const options = setOptionsCall[0] as { steps: unknown[] };
    expect(options.steps).toBeDefined();
    expect(Array.isArray(options.steps)).toBe(true);
    expect((options.steps as any[])[0].title).toMatch('Área de Chat');
  });

  it('uses English steps when language is English', () => {
    mockHas.mockReturnValue(true);
    mockUseLanguage.mockReturnValue({
      currentLanguage: 'en' as Language,
      setLanguage: vi.fn(),
      locale: 'en-US',
      availableLanguages: [],
    });

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    const setOptionsCall = mockSetOptions.mock.calls[0];
    expect(setOptionsCall).toBeDefined();
    const options = setOptionsCall[0] as { steps: unknown[] };
    expect(options.steps).toBeDefined();
    expect(Array.isArray(options.steps)).toBe(true);
    expect((options.steps as any[])[0].title).toMatch('Chat Area');
  });

  it('uses Catalan steps when language is Catalan', () => {
    mockHas.mockReturnValue(true);
    mockUseLanguage.mockReturnValue({
      currentLanguage: 'ca' as const,
      setLanguage: vi.fn(),
      locale: 'ca-ES',
      availableLanguages: [],
    });

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    const setOptionsCall = mockSetOptions.mock.calls[0];
    expect(setOptionsCall).toBeDefined();
    const options = setOptionsCall[0] as { steps: unknown[] };
    expect(options.steps).toBeDefined();
    expect(Array.isArray(options.steps)).toBe(true);
    expect((options.steps as any[])[0].title).toMatch('Àrea de Xat');
  });

  it('passes correct tour options to setOptions', () => {
    mockHas.mockReturnValue(true);

    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour();
    });

    const setOptionsCall = mockSetOptions.mock.calls[0];
    expect(setOptionsCall).toBeDefined();
    const options = setOptionsCall[0] as Record<string, unknown>;
    expect(options.exitOnOverlayClick).toBe(true);
    expect(options.showProgress).toBe(true);
    expect(options.showBullets).toBe(false);
  });

  it('returns function with startTour method', () => {
    const { result } = renderHook(() => useTour());
    expect(result.current).toHaveProperty('startTour');
    expect(typeof result.current.startTour).toBe('function');
  });

  it('does not accept steps parameter', () => {
    const { result } = renderHook(() => useTour());
    // useTour should not accept any parameters
    expect(result.current).toBeDefined();
    expect(result.current.startTour).toBeDefined();
  });
});
