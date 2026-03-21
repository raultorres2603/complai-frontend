/**
 * usePdfPolling Hook - Polling for presigned S3 PDF URLs
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface PdfPollingState {
  isPolling: boolean;
  isDownloaded: boolean;
  progress: number; // 0-100
  error: string | null;
  retryCount: number;
}

const DEFAULT_POLL_INTERVAL = 2000; // 2 seconds
const DEFAULT_MAX_RETRIES = 30; // 60 seconds total
const DEFAULT_TIMEOUT = 10000; // 10 seconds per poll

export function usePdfPolling() {
  const [pollingState, setPollingState] = useState<PdfPollingState>({
    isPolling: false,
    isDownloaded: false,
    progress: 0,
    error: null,
    retryCount: 0,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Poll a presigned S3 URL until PDF is available
   */
  const pollPdfUrl = useCallback(async (
    presignedUrl: string,
    options: {
      pollInterval?: number;
      maxRetries?: number;
      timeout?: number;
      onSuccess?: (blob: Blob) => void;
      onError?: (error: string) => void;
    } = {}
  ) => {
    const {
      pollInterval = DEFAULT_POLL_INTERVAL,
      maxRetries = DEFAULT_MAX_RETRIES,
      timeout = DEFAULT_TIMEOUT,
      onSuccess,
      onError,
    } = options;

    setPollingState({
      isPolling: true,
      isDownloaded: false,
      progress: 0,
      error: null,
      retryCount: 0,
    });

    abortControllerRef.current = new AbortController();

    let retryCount = 0;

    const poll = async () => {
      try {
        retryCount++;
        const progress = Math.min(100, (retryCount / maxRetries) * 100);

        setPollingState((prev) => ({
          ...prev,
          progress,
          retryCount,
        }));

        const response = await fetch(presignedUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(timeout),
        });

        if (response.ok || response.status === 416) {
          // File is ready
          const blobResponse = await fetch(presignedUrl, {
            signal: AbortSignal.timeout(timeout),
          });

          if (!blobResponse.ok) {
            throw new Error(`Failed to download PDF: ${blobResponse.status}`);
          }

          const blob = await blobResponse.blob();

          setPollingState((prev) => ({
            ...prev,
            isPolling: false,
            isDownloaded: true,
            progress: 100,
            error: null,
          }));

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          onSuccess?.(blob);
          return;
        }

        // Not ready yet, continue polling
        if (retryCount >= maxRetries) {
          throw new Error('PDF generation timeout: exceeded maximum retry attempts');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Timeout on this poll attempt, continue
          if (retryCount >= maxRetries) {
            const errorMsg = 'PDF polling timeout';
            setPollingState((prev) => ({
              ...prev,
              isPolling: false,
              error: errorMsg,
            }));
            onError?.(errorMsg);

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
          return;
        }

        const errorMsg = error instanceof Error ? error.message : 'Unknown error during PDF polling';

        setPollingState((prev) => ({
          ...prev,
          isPolling: false,
          error: errorMsg,
        }));

        onError?.(errorMsg);

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start initial poll immediately, then at intervals
    await poll();

    if (pollingState.isPolling) {
      pollingIntervalRef.current = setInterval(poll, pollInterval);
    }
  }, []);

  /**
   * Cancel polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setPollingState((prev) => ({
      ...prev,
      isPolling: false,
    }));
  }, []);

  /**
   * Reset polling state
   */
  const reset = useCallback(() => {
    stopPolling();
    setPollingState({
      isPolling: false,
      isDownloaded: false,
      progress: 0,
      error: null,
      retryCount: 0,
    });
  }, [stopPolling]);

  /**
   * Download PDF directly from presigned URL
   */
  const downloadPdf = useCallback(async (presignedUrl: string, filename: string) => {
    try {
      const response = await fetch(presignedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    pollingState,
    pollPdfUrl,
    stopPolling,
    reset,
    downloadPdf,
  };
}
