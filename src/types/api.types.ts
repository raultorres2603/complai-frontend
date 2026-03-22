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
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

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
 * API error response
 */
export interface ApiError {
  status: number;
  errorCode: ErrorCode | number;
  message: string;
  body?: OpenRouterPublicDto;
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
