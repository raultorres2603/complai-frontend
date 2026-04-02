/**
 * useAuth Hook - API Key authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { storageService, STORAGE_KEYS } from '../services/storageService';

export function useAuth() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from environment variable or localStorage on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_API_KEY;

    if (envKey) {
      setApiKeyState(envKey);
      storageService.set(STORAGE_KEYS.API_KEY, envKey);
    } else {
      const savedKey = storageService.get<string>(STORAGE_KEYS.API_KEY);
      setApiKeyState(savedKey);
    }

    setIsInitialized(true);
    setIsLoading(false);
  }, []);

  /**
   * Set API key and persist to localStorage
   */
  const setApiKey = useCallback((key: string | null) => {
    if (key) {
      storageService.set(STORAGE_KEYS.API_KEY, key);
    } else {
      storageService.remove(STORAGE_KEYS.API_KEY);
    }
    setApiKeyState(key);
  }, []);

  return {
    apiKey,
    setApiKey,
    isLoading,
    isInitialized,
  };
}
