/**
 * API Types - Mirror backend ComplAI API response DTOs
 * These types represent the exact structure of backend API responses
 */

import type { Language } from './accessibility.types';

/**
 * Error codes from backend OpenRouterErrorCode enum
 */
export const ErrorCode = {
  SUCCESS: 0,
  REFUSAL: 1,      // Question refused by AI (off-topic or sensitive)
  VALIDATION: 2,   // Invalid input parameters
  UPSTREAM: 3,     // Upstream service unavailable (OpenRouter)
  INTERNAL: 4,     // Internal server error
  UNKNOWN: 5,      // Unknown error
  RATE_LIMIT: 6,   // HTTP 429 - Rate limit exceeded
  INVALID_REQUEST: 7,   // Malformed request body, unknown parameters
  AUTHENTICATION_FAILED: 8,  // JWT invalid/expired
  FORBIDDEN: 9,    // Insufficient permissions
  SERVICE_UNAVAILABLE: 10,   // 502, 503, 504 or OpenRouter service down
  MODEL_UNAVAILABLE: 11,     // OpenRouter model not available for request
  CONTEXT_LENGTH_EXCEEDED: 12,  // Request too large for model context
  TIMEOUT: 13,     // Request timeout or processing timeout
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * Parsed and localized error information
 */
export interface ParsedError {
  code: ErrorCode | number;
  message: string;
  isRetryable: boolean;
  details?: Record<string, unknown>;
  originalError?: unknown;
}

/**
 * Output format for complaint redaction
 */
export const OutputFormat = {
  AUTO: 'AUTO',
  JSON: 'JSON',
  PDF: 'PDF',
} as const;

export type OutputFormat = typeof OutputFormat[keyof typeof OutputFormat];

/**
 * Source reference for answers
 */
export interface Source {
  url: string;
  title: string;
}

/**
 * Main API response DTO - from OpenRouterPublicDto
 */
export interface OpenRouterPublicDto {
  success: boolean;
  message: string | null;
  error: string | null;
  errorCode: ErrorCode | number;
  sources: Source[];
}

/**
 * Async PDF response when complaint is queued
 */
export interface RedactAsyncResponse extends OpenRouterPublicDto {
  pdfUrl?: string;  // Presigned S3 URL for polling
}

/**
 * Ask endpoint request
 */
export interface AskRequest {
  text: string;
  conversationId?: string;
  language: Language; // Language code for API communication
}

/**
 * Redact endpoint request (with optional requester info)
 */
export interface RedactRequest {
  text: string;
  format: OutputFormat;
  conversationId?: string;
  language: Language; // Language code for API communication
  requesterName?: string;
  requesterSurname?: string;
  requesterIdNumber?: string;
}

/**
 * Feedback endpoint request
 */
export interface FeedbackRequest {
  userName: string;
  idUser: string;
  message: string;
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  errorCode: ErrorCode | number;
  message: string;
  body?: OpenRouterPublicDto;
  isRetryable?: boolean;
}

/**
 * Conversation message from API
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;  // Unix timestamp
  sources?: Source[];
}
