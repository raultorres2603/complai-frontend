/**
 * Error Service Tests - Unit tests for parseOpenRouterError
 */

import { describe, it, expect } from 'vitest';
import { parseOpenRouterError } from '../errorService';
import { ErrorCode } from '../../types/api.types';

describe('parseOpenRouterError', () => {
  // Rate Limiting & Quotas Tests
  describe('Rate Limiting & Quotas', () => {
    it('should parse HTTP 429 as RATE_LIMIT', () => {
      const error = { status: 429, message: 'Too many requests' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.RATE_LIMIT);
      expect(parsed.isRetryable).toBe(true);
      expect(parsed.message).toContain('too many requests');
    });

    it('should parse rate_limit_exceeded error code', () => {
      const error = { error: 'rate_limit_exceeded', metadata: { reset_in: 60 } };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.RATE_LIMIT);
      expect(parsed.isRetryable).toBe(true);
      expect(parsed.details?.resetIn).toBe(60);
    });

    it('should parse quota_exceeded error code', () => {
      const error = { error: 'quota_exceeded', message: 'API quota exhausted' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.RATE_LIMIT);
      expect(parsed.isRetryable).toBe(true);
    });
  });

  // Authentication & Authorization Tests
  describe('Authentication & Authorization', () => {
    it('should parse HTTP 401 as AUTHENTICATION_FAILED', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.AUTHENTICATION_FAILED);
      expect(parsed.isRetryable).toBe(false);
      expect(parsed.message).toContain('Authentication required');
    });

    it('should parse HTTP 401 with expired token message', () => {
      const error = { status: 401, message: 'Token expired' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.AUTHENTICATION_FAILED);
      expect(parsed.isRetryable).toBe(false);
      expect(parsed.message).toContain('expired');
    });

    it('should parse HTTP 403 as FORBIDDEN', () => {
      const error = { status: 403, message: 'Forbidden' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.FORBIDDEN);
      expect(parsed.isRetryable).toBe(false);
      expect(parsed.message).toContain('permission');
    });

    it('should parse unauthorized error code', () => {
      const error = { error: 'unauthorized', message: 'Invalid credentials' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.AUTHENTICATION_FAILED);
      expect(parsed.isRetryable).toBe(false);
    });
  });

  // Request Validation Tests
  describe('Request Validation', () => {
    it('should parse HTTP 400 as VALIDATION', () => {
      const error = { status: 400, message: 'Bad request' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.VALIDATION);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse context_length_exceeded error', () => {
      const error = { status: 400, message: 'Context length exceeded' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.CONTEXT_LENGTH_EXCEEDED);
      expect(parsed.message).toContain('too long');
    });

    it('should parse invalid_request error code', () => {
      const error = { error: 'invalid_request', message: 'Unknown parameter' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.INVALID_REQUEST);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse bad_request error code', () => {
      const error = { error: 'bad_request', message: 'Malformed JSON' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.INVALID_REQUEST);
      expect(parsed.isRetryable).toBe(true);
    });
  });

  // Service & Model Availability Tests
  describe('Service & Model Availability', () => {
    it('should parse HTTP 502 as SERVICE_UNAVAILABLE', () => {
      const error = { status: 502, message: 'Bad Gateway' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse HTTP 503 as SERVICE_UNAVAILABLE', () => {
      const error = { status: 503, message: 'Service Unavailable' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse HTTP 504 as SERVICE_UNAVAILABLE', () => {
      const error = { status: 504, message: 'Gateway Timeout' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse model_unavailable error code', () => {
      const error = { error: 'model_unavailable', message: 'Model not available' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.MODEL_UNAVAILABLE);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse model_not_found error code', () => {
      const error = { error: 'model_not_found', message: 'Model not found' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.MODEL_UNAVAILABLE);
    });

    it('should parse model_overload error code', () => {
      const error = { error: 'model_overload', message: 'Model overloaded' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.MODEL_UNAVAILABLE);
      expect(parsed.message).toContain('overload');
    });

    it('should parse service_unavailable error code', () => {
      const error = { error: 'service_unavailable', message: 'Service temporarily down' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse bad_gateway error code', () => {
      const error = { error: 'bad_gateway', message: 'Bad gateway' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
    });
  });

  // Timeout Tests
  describe('Timeouts & Processing', () => {
    it('should parse HTTP 408 as TIMEOUT', () => {
      const error = { status: 408, message: 'Request Timeout' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.TIMEOUT);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse timeout in Error message', () => {
      const error = new Error('Request timeout after 30s');
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.TIMEOUT);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse timeout error code', () => {
      const error = { error: 'timeout', message: 'Request timed out' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.TIMEOUT);
      expect(parsed.isRetryable).toBe(true);
    });
  });

  // Error Object Tests
  describe('Error Object Handling', () => {
    it('should parse Error objects with network message', () => {
      const error = new Error('Failed to fetch: network error');
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.message).toContain('Network');
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse Error objects with abort message', () => {
      const error = new Error('AbortError: request cancelled');
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.TIMEOUT);
      expect(parsed.message).toContain('cancelled');
    });

    it('should handle generic Error objects', () => {
      const error = new Error('Something went wrong');
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.isRetryable).toBe(true);
    });
  });

  // Generic & Fallback Tests
  describe('Generic & Fallback', () => {
    it('should handle null error', () => {
      const parsed = parseOpenRouterError(null);
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.isRetryable).toBe(true);
      expect(parsed.message).toContain('unexpected error');
    });

    it('should handle undefined error', () => {
      const parsed = parseOpenRouterError(undefined);
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should handle string error', () => {
      const parsed = parseOpenRouterError('Something failed');
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should handle number error', () => {
      const parsed = parseOpenRouterError(500);
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.isRetryable).toBe(true);
    });

    it('should parse generic 500 error', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.INTERNAL);
      expect(parsed.isRetryable).toBe(true);
    });
  });

  // Metadata Extraction Tests
  describe('Metadata Extraction', () => {
    it('should extract retry info from rate limit error', () => {
      const error = {
        status: 429,
        body: {
          metadata: {
            reset_in: 60,
            remaining_requests: 0,
          },
        },
      };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.details).toBeDefined();
      expect(parsed.details?.resetIn).toBe(60);
      expect(parsed.details?.remainingRequests).toBe(0);
    });

    it('should preserve originalError in parsed response', () => {
      const originalError = { status: 400, message: 'Bad Request' };
      const parsed = parseOpenRouterError(originalError);
      
      expect(parsed.originalError).toBeDefined();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle deeply nested error objects', () => {
      const error = { body: { body: { error: 'Invalid Request' } } };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBeDefined();
      expect(parsed.message).toBeDefined();
    });

    it('should normalize error codes to lowercase', () => {
      const error = { error: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.RATE_LIMIT);
    });

    it('should handle errors with message but no error code', () => {
      const error = { message: 'Something went wrong' };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.UNKNOWN);
      expect(parsed.message).toBe('Something went wrong');
    });

    it('should handle errors with status 422 (REFUSAL)', () => {
      const error = { status: 422, message: 'Request refused' };
      const parsed = parseOpenRouterError(error);
      
      // Note: status 422 maps to generic error, parser focuses on current values
      expect(parsed.code).toBeDefined();
    });

    it('should not expose sensitive data', () => {
      const error = {
        status: 401,
        apiKey: 'very-secret-token-xyz',
        message: 'Authentication failed',
      };
      const parsed = parseOpenRouterError(error);
      
      // The message should not contain the API key
      expect(parsed.message).not.toContain('very-secret-token');
    });
  });

  // Comprehensive Error Scenarios
  describe('Comprehensive Error Scenarios', () => {
    it('should handle complete ApiError-like object', () => {
      const error = {
        status: 429,
        errorCode: 6,
        message: 'Rate limit exceeded',
        body: {
          success: false,
          error: 'rate_limit_exceeded',
          message: null,
          errorCode: 6,
          sources: [],
          metadata: { reset_in: 120 },
        },
      };
      const parsed = parseOpenRouterError(error);
      
      expect(parsed.code).toBe(ErrorCode.RATE_LIMIT);
      expect(parsed.isRetryable).toBe(true);
      expect(parsed.details?.resetIn).toBe(120);
    });

    it('should handle network errors reliably', () => {
      const errors = [
        new Error('Network request failed'),
        new Error('Failed to fetch'),
        new Error('CORS error'),
      ];
      
      errors.forEach((error) => {
        const parsed = parseOpenRouterError(error);
        expect(parsed.isRetryable).toBe(true);
        expect(parsed.code).toBeDefined();
      });
    });

    it('should provide consistent messages for same error type', () => {
      const error1 = { status: 429 };
      const error2 = { error: 'rate_limit_exceeded' };
      
      const parsed1 = parseOpenRouterError(error1);
      const parsed2 = parseOpenRouterError(error2);
      
      expect(parsed1.code).toBe(parsed2.code);
      expect(parsed1.isRetryable).toBe(parsed2.isRetryable);
    });
  });
});
