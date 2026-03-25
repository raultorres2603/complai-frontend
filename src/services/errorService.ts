/**
 * Error Service - Parse OpenRouter errors and provide user-friendly messages
 */

import type { ParsedError, ErrorCode } from '../types/api.types';
import { ErrorCode as ErrorCodeEnum } from '../types/api.types';

/**
 * Parse an error from OpenRouter API or network layer
 * Returns a structured error with user-friendly message and retry information
 */
export function parseOpenRouterError(error: unknown): ParsedError {
  try {
    // Handle plain JSON responses with 'error' field first
    if (typeof error === 'object' && error !== null && !isErrorInstance(error)) {
      const obj = error as Record<string, unknown>;
      // If it has an 'error' field and is not an ApiError-like object with status/errorCode,
      // treat it as a JSON error response
      if (typeof obj.error === 'string' && typeof obj.status === 'undefined' && typeof obj.errorCode === 'undefined') {
        return parseJsonError(obj);
      }
    }

    // Handle ApiError-like objects (with status and errorCode)
    if (isApiErrorLike(error)) {
      return parseApiError(error);
    }

    // Handle Error objects
    if (error instanceof Error) {
      return parseErrorObject(error);
    }

    // Handle plain JSON responses
    if (typeof error === 'object' && error !== null) {
      return parseJsonError(error as Record<string, unknown>);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: ErrorCodeEnum.UNKNOWN,
        message: 'An unexpected error occurred. Please try again.',
        isRetryable: true,
        originalError: error,
      };
    }

    // Fallback for unknown error types
    return getGenericError();
  } catch {
    // If parsing itself fails, return generic error
    return getGenericError();
  }
}

/**
 * Type guard: Check if error is an Error instance
 */
function isErrorInstance(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard: Check if object looks like an ApiError
 */
function isApiErrorLike(error: unknown): error is {
  status?: number;
  errorCode?: number | string;
  message?: string;
  body?: Record<string, unknown>;
  statusCode?: number;
} {
  if (typeof error !== 'object' || error === null) return false;
  const obj = error as Record<string, unknown>;
  return (
    typeof obj.status === 'number' ||
    typeof obj.statusCode === 'number' ||
    typeof obj.errorCode === 'number' ||
    typeof obj.errorCode === 'string'
  );
}

/**
 * Parse an ApiError-like object
 */
function parseApiError(error: {
  status?: number;
  errorCode?: number | string;
  message?: string;
  body?: Record<string, unknown>;
  statusCode?: number;
}): ParsedError {
  const status = error.status ?? (error as any).statusCode ?? 500;
  const errorCode = error.errorCode ?? error.message ?? 'unknown';

  // Map HTTP status codes to ErrorCode values
  if (status === 429) {
    return {
      code: ErrorCodeEnum.RATE_LIMIT,
      message: 'You\'ve sent too many requests. Please wait a moment before trying again.',
      isRetryable: true,
      details: extractRetryInfo(error),
      originalError: error,
    };
  }

  if (status === 401 || status === 403) {
    const isAuth = status === 401;
    if (typeof errorCode === 'string' && errorCode.includes('expired')) {
      return {
        code: ErrorCodeEnum.AUTHENTICATION_FAILED,
        message: 'Your session has expired. Please log in again.',
        isRetryable: false,
        originalError: error,
      };
    }
    return {
      code: isAuth ? ErrorCodeEnum.AUTHENTICATION_FAILED : ErrorCodeEnum.FORBIDDEN,
      message: isAuth
        ? 'Authentication required. Please log in.'
        : 'You do not have permission to perform this action.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (status === 400) {
    // Check for specific validation errors
    if (typeof errorCode === 'string') {
      if (errorCode.includes('length') || errorCode.includes('context')) {
        return {
          code: ErrorCodeEnum.CONTEXT_LENGTH_EXCEEDED,
          message: 'Your request is too long. Please shorten your message and try again.',
          isRetryable: true,
          originalError: error,
        };
      }
      if (errorCode.includes('field') || errorCode.includes('required')) {
        return {
          code: ErrorCodeEnum.INVALID_REQUEST,
          message: 'Invalid request. Please check your input and try again.',
          isRetryable: true,
          originalError: error,
        };
      }
    }
    return {
      code: ErrorCodeEnum.VALIDATION,
      message: 'Your request could not be processed. Please check your input and try again.',
      isRetryable: true,
      originalError: error,
    };
  }

  if (status === 408) {
    return {
      code: ErrorCodeEnum.TIMEOUT,
      message: 'Your request took too long. Please try again with a shorter message.',
      isRetryable: true,
      originalError: error,
    };
  }

  if (status === 502 || status === 503 || status === 504) {
    return {
      code: ErrorCodeEnum.SERVICE_UNAVAILABLE,
      message: 'The service is temporarily unavailable. Please try again in a few moments.',
      isRetryable: true,
      originalError: error,
    };
  }

  // Handle specific OpenRouter error codes
  if (typeof errorCode === 'string') {
    const lowerCode = errorCode.toLowerCase();

    if (lowerCode.includes('rate_limit') || lowerCode.includes('quota')) {
      return {
        code: ErrorCodeEnum.RATE_LIMIT,
        message: 'You\'ve reached your usage limit. Please try again later.',
        isRetryable: true,
        originalError: error,
      };
    }

    if ((lowerCode.includes('model') && lowerCode.includes('available')) || lowerCode.includes('overload')) {
      return {
        code: ErrorCodeEnum.MODEL_UNAVAILABLE,
        message: lowerCode.includes('overload')
          ? 'The AI model is overloaded. Please try again in a moment.'
          : 'The AI model is currently unavailable. Please try again later.',
        isRetryable: true,
        originalError: error,
      };
    }

    if (lowerCode.includes('timeout')) {
      return {
        code: ErrorCodeEnum.TIMEOUT,
        message: 'The request took too long. Please try again.',
        isRetryable: true,
        originalError: error,
      };
    }
  }

  // Generic server error
  if (status >= 500) {
    return {
      code: ErrorCodeEnum.INTERNAL,
      message: 'Server error. Please try again later.',
      isRetryable: true,
      originalError: error,
    };
  }

  // Fallback for unmapped errors
  return getGenericError();
}

/**
 * Parse a standard Error object
 */
function parseErrorObject(error: Error): ParsedError {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('failed to fetch')) {
    return {
      code: ErrorCodeEnum.UNKNOWN,
      message: 'Network connection error. Please check your internet and try again.',
      isRetryable: true,
      originalError: error,
    };
  }

  if (message.includes('timeout')) {
    return {
      code: ErrorCodeEnum.TIMEOUT,
      message: 'Your request took too long. Please try again.',
      isRetryable: true,
      originalError: error,
    };
  }

  if (message.includes('abort')) {
    return {
      code: ErrorCodeEnum.TIMEOUT,
      message: 'The request was cancelled. Please try again.',
      isRetryable: true,
      originalError: error,
    };
  }

  return {
    code: ErrorCodeEnum.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    isRetryable: true,
    originalError: error,
  };
}

/**
 * Parse a JSON error response
 */
function parseJsonError(data: Record<string, unknown>): ParsedError {
  const error = data.error as string | undefined;
  const message = data.message as string | undefined;
  const normalizedError = error?.toLowerCase() ?? '';

  // Check for service/gateway issues first (before 'bad' check)
  if (normalizedError.includes('service') || normalizedError.includes('gateway')) {
    return {
      code: ErrorCodeEnum.SERVICE_UNAVAILABLE,
      message: 'The service is temporarily unavailable. Please try again in a few moments.',
      isRetryable: true,
      originalError: data,
    };
  }

  if (normalizedError.includes('timeout')) {
    return {
      code: ErrorCodeEnum.TIMEOUT,
      message: 'The request took too long. Please try again.',
      isRetryable: true,
      originalError: data,
    };
  }

  if (normalizedError.includes('rate_limit') || normalizedError.includes('quota')) {
    return {
      code: ErrorCodeEnum.RATE_LIMIT,
      message: 'You\'ve reached your usage limit. Please try again later.',
      isRetryable: true,
      details: extractMetadata(data),
      originalError: data,
    };
  }

  if (normalizedError.includes('model') && (normalizedError.includes('unavailable') || normalizedError.includes('not_found') || normalizedError.includes('overload'))) {
    return {
      code: ErrorCodeEnum.MODEL_UNAVAILABLE,
      message: normalizedError.includes('overload')
        ? 'The AI model is overloaded. Please try again in a moment.'
        : 'The AI model is currently unavailable. Please try again later.',
      isRetryable: true,
      originalError: data,
    };
  }

  if (normalizedError.includes('invalid_request') || normalizedError.includes('bad_request')) {
    return {
      code: ErrorCodeEnum.INVALID_REQUEST,
      message: 'Your request could not be processed. Please check your input and try again.',
      isRetryable: true,
      originalError: data,
    };
  }

  if (normalizedError.includes('context') && normalizedError.includes('length')) {
    return {
      code: ErrorCodeEnum.CONTEXT_LENGTH_EXCEEDED,
      message: 'Your request is too long. Please shorten your message and try again.',
      isRetryable: true,
      originalError: data,
    };
  }

  if (normalizedError.includes('unauthorized') || normalizedError.includes('authentication')) {
    return {
      code: ErrorCodeEnum.AUTHENTICATION_FAILED,
      message: 'Authentication failed. Please log in again.',
      isRetryable: false,
      originalError: data,
    };
  }

  if (message) {
    return {
      code: ErrorCodeEnum.UNKNOWN,
      message: typeof message === 'string' ? message : 'An error occurred.',
      isRetryable: true,
      originalError: data,
    };
  }

  return getGenericError();
}

/**
 * Extract retry information from error response
 */
function extractRetryInfo(
  error: Record<string, unknown>
): Record<string, unknown> | undefined {
  const details: Record<string, unknown> = {};
  const body = error.body as Record<string, unknown> | undefined;

  // Extract retry-after header or metadata from body
  if (body && typeof body === 'object') {
    const metadata = body.metadata as Record<string, unknown> | undefined;
    if (metadata && typeof metadata === 'object') {
      if (typeof metadata.reset_in === 'number') {
        details.resetIn = metadata.reset_in;
      }
      if (typeof metadata.remaining_requests === 'number') {
        details.remainingRequests = metadata.remaining_requests;
      }
    }
  }

  // Also check for metadata directly on the error object
  const directMetadata = error.metadata as Record<string, unknown> | undefined;
  if (directMetadata && typeof directMetadata === 'object') {
    if (typeof directMetadata.reset_in === 'number') {
      details.resetIn = directMetadata.reset_in;
    }
    if (typeof directMetadata.remaining_requests === 'number') {
      details.remainingRequests = directMetadata.remaining_requests;
    }
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

/**
 * Extract metadata from error response
 */
function extractMetadata(data: Record<string, unknown>): Record<string, unknown> | undefined {
  const details: Record<string, unknown> = {};
  const metadata = data.metadata as Record<string, unknown> | undefined;

  if (metadata) {
    if (metadata.reset_in) {
      details.resetIn = metadata.reset_in;
    }
    if (metadata.remaining_requests) {
      details.remainingRequests = metadata.remaining_requests;
    }
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

/**
 * Get a generic error response
 */
function getGenericError(): ParsedError {
  return {
    code: ErrorCodeEnum.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    isRetryable: true,
  };
}

export { getGenericError };
