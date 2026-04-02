/**
 * useFeedback Hook - Manages feedback submission state and API call
 */

import { useState, useCallback } from 'react';
import { useTranslation } from './useTranslation';
import { complaiService, ApiError } from '../services/apiService';
import { parseOpenRouterError } from '../services/errorService';

export function useFeedback(apiKey: string | null): {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  submitFeedback: (idUser: string, userName: string, message: string) => Promise<void>;
  resetState: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { t } = useTranslation();

  const submitFeedback = useCallback(
    async (idUser: string, userName: string, message: string) => {
      if (apiKey === null) {
        setError(t('feedback_error_unauthorized'));
        return;
      }

      // Validate all fields are non-empty
      if (!idUser.trim() || !userName.trim() || !message.trim()) {
        setError(t('feedback_error_validation'));
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await complaiService.sendFeedback(userName, idUser, message, apiKey);
        setSuccess(true);
        setIsLoading(false);
      } catch (err) {
        // Use error service to get parsed error
        const parsedError = parseOpenRouterError(err);
        
        // Use the parsed error message which is now user-friendly
        setError(parsedError.message);
        setIsLoading(false);
      }
    },
    [apiKey, t]
  );

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return { isLoading, error, success, submitFeedback, resetState };
}
