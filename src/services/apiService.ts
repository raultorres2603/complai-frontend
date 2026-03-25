/**
 * API Client - Handles HTTP requests with JWT authentication
 */

import type { Language } from '../types/accessibility.types';
import type { OpenRouterPublicDto, RedactAsyncResponse, AskRequest, RedactRequest, FeedbackRequest } from '../types/api.types';
import { ErrorCode } from '../types/api.types';
import { parseOpenRouterError } from './errorService';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

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
      jwtToken?: string;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const { body, jwtToken, timeout = DEFAULT_TIMEOUT } = options;

    const url = `${this.backendUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add JWT token if provided
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
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
   * @param jwtToken - JWT authentication token
   * @param language - Language code (es, en, ca) for API communication
   * @param timeout - Optional request timeout in milliseconds
   */
  async askQuestion(
    text: string,
    conversationId: string | undefined,
    jwtToken: string,
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
      jwtToken,
      timeout,
    });
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
   * @param jwtToken - JWT authentication token
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
    jwtToken: string,
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
      jwtToken,
      timeout,
    });
  },

  /**
   * Submit user feedback
   * POST /complai/feedback
   *
   * @param userName - Display name extracted from JWT claims
   * @param idUser   - User ID (JWT `sub` claim)
   * @param message  - Feedback text
   * @param jwtToken - JWT authentication token
   */
  async sendFeedback(
    userName: string,
    idUser: string,
    message: string,
    jwtToken: string
  ): Promise<void> {
    const client = getApiClient();
    const request: FeedbackRequest = { userName, idUser, message };
    await client.request<OpenRouterPublicDto>('POST', '/complai/feedback', {
      body: request as unknown as Record<string, unknown>,
      jwtToken,
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
