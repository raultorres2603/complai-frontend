/**
 * API Client - Handles HTTP requests with JWT authentication
 */

import type { Language } from '../types/accessibility.types';
import type { OpenRouterPublicDto, RedactAsyncResponse, AskRequest, RedactRequest, FeedbackRequest, SSECallbacks, SSEEvent } from '../types/api.types';
import { ErrorCode } from '../types/api.types';
import { parseOpenRouterError } from './errorService';
import { parseSSELines } from './sseParser';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface WrappedStreamResponse {
  statusCode?: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
  isBase64Encoded?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  return isRecord(value)
    && Object.values(value).every(
      (entry) => Array.isArray(entry) && entry.every((item) => typeof item === 'string')
    );
}

function isWrappedStreamResponse(payload: unknown): payload is WrappedStreamResponse {
  if (!isRecord(payload) || typeof payload.body !== 'string') {
    return false;
  }

  if ('statusCode' in payload && typeof payload.statusCode !== 'number') {
    return false;
  }

  if ('headers' in payload && payload.headers !== undefined && !isStringRecord(payload.headers)) {
    return false;
  }

  if (
    'multiValueHeaders' in payload
    && payload.multiValueHeaders !== undefined
    && !isStringArrayRecord(payload.multiValueHeaders)
  ) {
    return false;
  }

  if (
    'isBase64Encoded' in payload
    && payload.isBase64Encoded !== undefined
    && typeof payload.isBase64Encoded !== 'boolean'
  ) {
    return false;
  }

  return 'statusCode' in payload
    || 'headers' in payload
    || 'multiValueHeaders' in payload
    || 'isBase64Encoded' in payload;
}

function normalizeHeaders(
  headers?: Record<string, string>,
  multiValueHeaders?: Record<string, string[]>
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers || {})) {
    normalized[key.toLowerCase()] = value;
  }

  for (const [key, values] of Object.entries(multiValueHeaders || {})) {
    if (values.length > 0) {
      normalized[key.toLowerCase()] = values.join(', ');
    }
  }

  return normalized;
}

function decodeBase64Body(value: string): string {
  if (typeof globalThis.atob !== 'function') {
    throw new Error('Base64 decoding is not available in this environment');
  }

  return globalThis.atob(value);
}

function unwrapWrappedResponseBody(payload: unknown): { contentType: string; bodyText: string } | null {
  if (!isWrappedStreamResponse(payload)) {
    return null;
  }

  const bodyText = payload.isBase64Encoded ? decodeBase64Body(payload.body) : payload.body;
  const normalizedHeaders = normalizeHeaders(payload.headers, payload.multiValueHeaders);

  return {
    contentType: normalizedHeaders['content-type'] || '',
    bodyText,
  };
}

function isOpenRouterPublicDto(payload: unknown): payload is OpenRouterPublicDto {
  return isRecord(payload)
    && typeof payload.success === 'boolean'
    && (typeof payload.message === 'string' || payload.message === null)
    && (typeof payload.error === 'string' || payload.error === null)
    && typeof payload.errorCode === 'number'
    && Array.isArray(payload.sources);
}

function looksLikeSSEPayload(bodyText: string): boolean {
  return /^\s*(event:[^\n]*\n)?data:/m.test(bodyText);
}

function dispatchSSEEvents(events: SSEEvent[], callbacks: SSECallbacks): boolean {
  for (const event of events) {
    switch (event.type) {
      case 'chunk':
        callbacks.onChunk(event.content);
        break;
      case 'sources':
        callbacks.onSources?.(event.sources);
        break;
      case 'done':
        callbacks.onDone(event.conversationId);
        return true;
      case 'error':
        callbacks.onError(event.error, event.errorCode);
        return true;
    }
  }

  return false;
}

function handleWrappedSSEBody(bodyText: string, callbacks: SSECallbacks): void {
  if (!bodyText.trim()) {
    callbacks.onError('Wrapped SSE response body was empty');
    return;
  }

  const normalizedBuffer = bodyText.endsWith('\n\n') ? bodyText : `${bodyText}\n\n`;
  const { events } = parseSSELines(normalizedBuffer);

  if (events.length === 0) {
    callbacks.onError('Wrapped SSE response body did not contain valid SSE events');
    return;
  }

  dispatchSSEEvents(events, callbacks);
}

/**
 * API client with JWT token injection and error handling
 */
class ApiClient {
  private backendUrl: string;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Make an authenticated HTTP request
   */
  async request<T = OpenRouterPublicDto>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: {
      body?: Record<string, unknown>;
      apiKey?: string;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const { body, apiKey, timeout = DEFAULT_TIMEOUT } = options;

    const url = `${this.backendUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Parse response body
      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        throw this.createApiError(response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError(
          0,
          ErrorCode.INTERNAL,
          'Network error: Unable to reach backend. Check your connection and VITE_BACKEND_URL.'
        );
      }
      if (error instanceof Error && error.name === 'AbortError') {
        // Improved timeout error handling
        const isTimeoutError = error.message.includes('signal timed out') || error.message.includes('timeout');
        throw new ApiError(
          408,
          ErrorCode.INTERNAL,
          isTimeoutError 
            ? `Request timeout after ${timeout / 1000}s: Backend is processing. Try increasing timeout or check server performance.`
            : 'Request was cancelled. Please try again.'
        );
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, ErrorCode.INTERNAL, `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  /**
   * Create a typed API error
   */
  private createApiError(status: number, data: unknown): ApiError {
    const apiResponse = typeof data === 'object' && data !== null ? (data as OpenRouterPublicDto) : null;

    // Parse the error using error service to get user-friendly message
    const parsedError = parseOpenRouterError({ status, body: apiResponse, message: data });

    return new ApiError(
      status,
      parsedError.code,
      parsedError.message,
      apiResponse || undefined,
      parsedError.isRetryable
    );
  }

  /**
   * Update backend URL (for runtime configuration)
   */
  setBackendUrl(url: string): void {
    this.backendUrl = url.replace(/\/$/, '');
  }
}

// Singleton instance
let apiClient: ApiClient | null = null;

/**
 * Get or initialize API client
 */
function getApiClient(backendUrl?: string): ApiClient {
  if (!apiClient) {
    const url = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    apiClient = new ApiClient(url);
  }
  return apiClient;
}

/**
 * ComplAI API service - All business logic for API calls
 */
export const complaiService = {
  /**
   * Ask a question to the ComplAI chatbot
   * POST /complai/ask
   * 
   * @param text - The question text
   * @param conversationId - Optional conversation ID for multi-turn context
   * @param apiKey - API Key for authentication
   * @param language - Language code (es, en, ca) for API communication
   * @param timeout - Optional request timeout in milliseconds
   */
  async askQuestion(
    text: string,
    conversationId: string | undefined,
    apiKey: string,
    language: Language = 'es',
    timeout?: number
  ): Promise<OpenRouterPublicDto> {
    const client = getApiClient();

    const request: AskRequest = {
      text,
      language, // Include language in request
      ...(conversationId && { conversationId }),
    };

    return client.request<OpenRouterPublicDto>('POST', '/complai/ask', {
      body: request as unknown as Record<string, unknown>,
      apiKey,
      timeout,
    });
  },

  /**
   * Ask a question using SSE streaming
   * POST /complai/ask with Accept: text/event-stream
   */
  async askQuestionStream(
    text: string,
    conversationId: string | undefined,
    apiKey: string,
    language: Language = 'es',
    callbacks: SSECallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const url = getApiClient()['backendUrl'] + '/complai/ask';

    const request: AskRequest = {
      text,
      language,
      ...(conversationId && { conversationId }),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorCode: number | undefined;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorBody.message || errorMessage;
          errorCode = errorBody.errorCode;
        } catch {
          // ignore parse failure
        }
        callbacks.onError(errorMessage, errorCode);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const payload = await response.json() as unknown;
        const wrappedBody = unwrapWrappedResponseBody(payload);

        if (wrappedBody) {
          if (wrappedBody.contentType.includes('text/event-stream') || looksLikeSSEPayload(wrappedBody.bodyText)) {
            handleWrappedSSEBody(wrappedBody.bodyText, callbacks);
            return;
          }

          callbacks.onError('Wrapped response body did not contain an SSE payload');
          return;
        }

        if (!isOpenRouterPublicDto(payload)) {
          callbacks.onError('Unexpected response payload from /complai/ask');
          return;
        }

        const data = payload;
        callbacks.onChunk(data.message || '');
        callbacks.onDone();
        return;
      }

      if (!response.body) {
        callbacks.onError('Streaming response body was missing');
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Peek at the first chunk: real SSE never starts with '{'.
      // If the body starts with '{', the backend returned a Lambda/API Gateway
      // JSON wrapper despite advertising text/event-stream — unwrap it instead.
      const firstRead = await reader.read();
      if (!firstRead.done && firstRead.value) {
        const firstChunk = decoder.decode(firstRead.value, { stream: true });
        if (firstChunk.trimStart().startsWith('{')) {
          // Accumulate the full body
          let fullBody = firstChunk;
          let next = await reader.read();
          while (!next.done) {
            fullBody += decoder.decode(next.value, { stream: true });
            next = await reader.read();
          }
          // Try to parse as Lambda wrapper
          let parsed: unknown;
          try {
            parsed = JSON.parse(fullBody);
          } catch {
            callbacks.onError('Received text/event-stream with unparseable JSON body');
            return;
          }
          const wrappedBody = unwrapWrappedResponseBody(parsed);
          if (wrappedBody) {
            handleWrappedSSEBody(wrappedBody.bodyText, callbacks);
            return;
          }
          if (isOpenRouterPublicDto(parsed)) {
            callbacks.onChunk(parsed.message || '');
            callbacks.onDone();
            return;
          }
          callbacks.onError('Received text/event-stream with unrecognized JSON body');
          return;
        }
        // Normal SSE — seed the buffer with the first chunk
        buffer = firstChunk;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Parse any remaining buffer
          if (buffer.trim()) {
            const { events } = parseSSELines(buffer + '\n\n');
            if (dispatchSSEEvents(events, callbacks)) {
              return;
            }
          }
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const { events, remaining } = parseSSELines(buffer);
        buffer = remaining;
        if (dispatchSSEEvents(events, callbacks)) {
          return;
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // User-initiated cancel
      }
      callbacks.onError(error instanceof Error ? error.message : 'Stream interrupted');
    }
  },

  /**
   * Redact a complaint letter
   * POST /complai/redact
   * Returns 200 with response or 202 Accepted with pdfUrl
   * 
   * @param text - The complaint text to redact
   * @param format - Output format (PDF, etc.)
   * @param conversationId - Optional conversation ID
   * @param requesterName - Optional requester first name
   * @param requesterSurname - Optional requester last name
   * @param requesterIdNumber - Optional requester ID number
   * @param apiKey - API Key for authentication
   * @param language - Language code (es, en, ca) for API communication
   * @param timeout - Optional request timeout in milliseconds
   */
  async redactComplaint(
    text: string,
    format: string,
    conversationId: string | undefined,
    requesterName: string | undefined,
    requesterSurname: string | undefined,
    requesterIdNumber: string | undefined,
    apiKey: string,
    language: Language = 'es',
    timeout?: number
  ): Promise<RedactAsyncResponse> {
    const client = getApiClient();

    const request: RedactRequest = {
      text,
      format: format as any,
      language, // Include language in request
      ...(conversationId && { conversationId }),
      ...(requesterName && { requesterName }),
      ...(requesterSurname && { requesterSurname }),
      ...(requesterIdNumber && { requesterIdNumber }),
    };

    return client.request<RedactAsyncResponse>('POST', '/complai/redact', {
      body: request as unknown as Record<string, unknown>,
      apiKey,
      timeout,
    });
  },

  /**
   * Submit user feedback
   * POST /complai/feedback
   *
   * @param userName - Display name
   * @param idUser   - User ID
   * @param message  - Feedback text
   * @param apiKey - API Key for authentication
   */
  async sendFeedback(
    userName: string,
    idUser: string,
    message: string,
    apiKey: string
  ): Promise<void> {
    const client = getApiClient();
    const request: FeedbackRequest = { userName, idUser, message };
    await client.request<OpenRouterPublicDto>('POST', '/complai/feedback', {
      body: request as unknown as Record<string, unknown>,
      apiKey,
    });
  },

  /**
   * Poll a presigned S3 URL to check if PDF is ready
   * GET request to S3 presigned URL
   */
  async pollS3PdfUrl(presignedUrl: string, timeout?: number): Promise<Blob> {
    try {
      const response = await fetch(presignedUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(timeout || DEFAULT_TIMEOUT),
      });

      if (response.ok || response.status === 416) {
        // 416 Requested Range Not Satisfiable means file exists
        const blobResponse = await fetch(presignedUrl, {
          signal: AbortSignal.timeout(timeout || DEFAULT_TIMEOUT),
        });
        return blobResponse.blob();
      }

      throw new Error(`S3 returned status ${response.status}`);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, ErrorCode.INTERNAL, 'S3 poll timeout');
      }
      throw error;
    }
  },

  /**
   * Update backend URL dynamically
   */
  setBackendUrl(url: string): void {
    getApiClient().setBackendUrl(url);
  },

  /**
   * Get current backend URL
   */
  getBackendUrl(): string {
    return getApiClient()['backendUrl'];
  },
};

/**
 * Custom API Error class
 */
export class ApiError extends Error implements Error {
  status: number;
  errorCode: ErrorCode | number;
  body?: OpenRouterPublicDto;
  isRetryable?: boolean;

  constructor(
    status: number,
    errorCode: ErrorCode | number,
    message: string,
    body?: OpenRouterPublicDto,
    isRetryable?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.body = body;
    this.isRetryable = isRetryable;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export { getApiClient };
