/**
 * Storage Service - localStorage abstraction
 */

export const storageService = {
  /**
   * Store a value in localStorage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
    }
  },

  /**
   * Retrieve a value from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a value from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  API_KEY: 'complai_api_key',
  CITY_ID: 'complai_city_id',
  CONVERSATION_ID: 'complai_conversation_id',
  CONVERSATIONS: 'complai_conversations',
  LANGUAGE: 'complai_language',
  DARK_MODE: 'complai_dark_mode',
  BACKEND_URL: 'complai_backend_url',
};
