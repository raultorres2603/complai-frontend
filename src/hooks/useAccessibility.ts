/**
 * useAccessibility Hook - Manages accessibility settings and color blindness filters
 */

import { useState, useCallback, useEffect } from 'react';
import type { AccessibilitySettings, ColorBlindnessType } from '../types/accessibility.types';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '../types/accessibility.types';

const STORAGE_KEY = 'complai_accessibility';

export interface UseAccessibilityReturn {
  settings: AccessibilitySettings;
  updateSettings: (partial: Partial<AccessibilitySettings>) => void;
  applyColorFilter: (type: ColorBlindnessType) => void;
  isLocalStorageAvailable: boolean;
}

/**
 * Custom hook for managing accessibility settings
 * Loads settings from localStorage on mount and persists changes
 * Applies color blindness filters to the document
 *
 * @returns Accessibility settings and update functions
 */
export function useAccessibility(): UseAccessibilityReturn {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored) as Partial<AccessibilitySettings>;
        setSettings((prev) => ({ ...prev, ...parsedSettings }));
      }
      setIsLocalStorageAvailable(true);
    } catch (error) {
      // localStorage not available (private mode, disabled, etc.)
      console.warn('[Accessibility] localStorage not available, using in-memory fallback', error);
      setIsLocalStorageAvailable(false);
    }
    setIsInitialized(true);
  }, []);

  // Apply color filter when settings change
  useEffect(() => {
    if (isInitialized) {
      applyColorFilter(settings.colorBlindnessType);
    }
  }, [settings.colorBlindnessType, isInitialized]);

  /**
   * Update accessibility settings and persist to localStorage
   */
  const updateSettings = useCallback((partial: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };

      // Persist to localStorage if available
      if (isLocalStorageAvailable) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('[Accessibility] Failed to save settings to localStorage', error);
        }
      }

      return updated;
    });
  }, [isLocalStorageAvailable]);

  /**
   * Apply color blindness filter to document
   * Adds CSS class to document.body
   */
  const applyColorFilter = useCallback((type: ColorBlindnessType) => {
    if (typeof document === 'undefined') return;

    // Remove all filter classes
    document.body.classList.remove('filter-normal', 'filter-deuteranopia', 'filter-protanopia', 'filter-tritanopia');

    // Add the appropriate filter class
    const filterClass = `filter-${type}`;
    document.body.classList.add(filterClass);
  }, []);

  return {
    settings,
    updateSettings,
    applyColorFilter,
    isLocalStorageAvailable,
  };
}
