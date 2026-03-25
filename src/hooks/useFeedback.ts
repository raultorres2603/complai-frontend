/**
 * useFeedback Hook - Manages feedback submission state and API call
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTranslation } from './useTranslation';
import { complaiService, ApiError } from '../services/apiService';
import { parseOpenRouterError } from '../services/errorService';

export function useFeedback(jwtToken: string | null): {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  submitFeedback: (message: string) => Promise<void>;
  resetState: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { decodeToken } = useAuth();
  const { t } = useTranslation();

  const submitFeedback = useCallback(
    async (message: string) => {
      if (jwtToken === null) {
        setError(t('feedback_error_unauthorized'));
        return;
      }

      const claims = decodeToken(jwtToken);
      const idUser = (claims?.sub as string) ?? '';
      const userName = (claims?.name as string) ?? (claims?.userName as string) ?? idUser;

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await complaiService.sendFeedback(userName, idUser, message, jwtToken);
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
    [jwtToken, decodeToken, t]
  );

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return { isLoading, error, success, submitFeedback, resetState };
}
