/**
 * useAuth Hook - JWT token management and authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { storageService, STORAGE_KEYS } from '../services/storageService';

export function useAuth() {
  const [jwtToken, setJwtTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from environment variable or localStorage on mount
  useEffect(() => {
    // First, try to load from environment variable
    const envToken = import.meta.env.VITE_JWT_TOKEN;
    
    if (envToken) {
      setJwtTokenState(envToken);
      // Save to localStorage for persistence
      storageService.set(STORAGE_KEYS.JWT_TOKEN, envToken);
    } else {
      // Fall back to localStorage
      const savedToken = storageService.get<string>(STORAGE_KEYS.JWT_TOKEN);
      setJwtTokenState(savedToken);
    }
    
    setIsInitialized(true);
    setIsLoading(false);
  }, []);

  /**
   * Set JWT token and persist to localStorage
   */
  const setJwtToken = useCallback((token: string | null) => {
    if (token) {
      storageService.set(STORAGE_KEYS.JWT_TOKEN, token);
    } else {
      storageService.remove(STORAGE_KEYS.JWT_TOKEN);
    }
    setJwtTokenState(token);
  }, []);

  /**
   * Decode JWT token (simple, does not validate signature)
   */
  const decodeToken = useCallback((token: string): Record<string, unknown> | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }, []);

  /**
   * Extract city from JWT token
   */
  const getCityFromToken = useCallback(
    (token?: string): string | null => {
      const tokenToUse = token || jwtToken;
      if (!tokenToUse) return null;

      const decoded = decodeToken(tokenToUse);
      if (!decoded) return null;

      return (decoded.city as string) || (decoded.sub as string) || null;
    },
    [jwtToken, decodeToken]
  );

  /**
   * Check if token is valid (not expired)
   */
  const isTokenValid = useCallback(
    (token?: string): boolean => {
      const tokenToUse = token || jwtToken;
      if (!tokenToUse) return false;

      const decoded = decodeToken(tokenToUse);
      if (!decoded) return false;

      if (decoded.exp && typeof decoded.exp === 'number') {
        return decoded.exp * 1000 > Date.now(); // exp is in seconds, Date.now() is in ms
      }

      return true; // No expiry, assume valid
    },
    [jwtToken, decodeToken]
  );

  /**
   * Clear JWT token
   */
  const clearToken = useCallback(() => {
    setJwtToken(null);
  }, [setJwtToken]);

  /**
   * Paste token from clipboard (for development)
   */
  const pasteTokenFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.includes('.')) {
        setJwtToken(text);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      return false;
    }
  }, [setJwtToken]);

  return {
    jwtToken,
    setJwtToken,
    isLoading,
    isInitialized,
    isTokenValid,
    decodeToken,
    getCityFromToken,
    clearToken,
    pasteTokenFromClipboard,
  };
}
