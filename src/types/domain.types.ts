/**
 * Domain Types - UI/frontend specific types
 */

import type { Source, ErrorCode, OutputFormat } from './api.types';

/**
 * Chat message display type (combines user input with API response)
 */
export interface ChatMessage {
  id: string;                    // Unique message ID (UUID)
  role: 'user' | 'assistant';    // Message sender
  content: string;               // Message text
  timestamp: number;             // Unix timestamp
  sources?: Source[];            // Reference links (assistant only)
  loading?: boolean;             // Loading state for async responses
  error?: ChatMessageError;      // Error details if failed
  files?: ChatFile[];            // Attachments (PDFs, etc.)
}

/**
 * Error information for a failed message
 */
export interface ChatMessageError {
  code: ErrorCode | number;
  message: string;
  details?: string;
}

/**
 * File attachment (PDF, JSON, etc.)
 */
export interface ChatFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'json' | 'text';
  size?: number;
  createdAt: number;
}

/**
 * Conversation session
 */
export interface ConversationSession {
  id: string;                      // UUID
  cityId: string;                  // City scope
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  archived: boolean;
}

/**
 * Chat state
 */
export interface ChatState {
  conversationId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  currentError: ChatMessageError | null;
  lastMessageTimestamp: number | null;
}

/**
 * Complaint redaction context
 */
export interface ComplaintRedactContext {
  conversationId: string;
  format: OutputFormat;
  requesterName?: string;
  requesterSurname?: string;
  requesterIdNumber?: string;
  pdfUrl?: string;                // Presigned S3 URL after 202 Accepted
  pollingInProgress?: boolean;
  pollingError?: string;
}

/**
 * City/Locale configuration
 */
export interface City {
  id: string;
  name: string;
  displayName: string;
  language: 'ca' | 'es' | 'en';  // Default language for city
}

/**
 * User/Auth state
 */
export interface AuthState {
  jwtToken: string | null;
  cityId: string | null;
  isAuthenticated: boolean;
  tokenExpiry?: number;           // Unix timestamp
}

/**
 * Supported languages
 */
export const Language = {
  CATALAN: 'ca',
  SPANISH: 'es',
  ENGLISH: 'en',
} as const;

export type Language = typeof Language[keyof typeof Language];

/**
 * App configuration
 */
export interface AppConfig {
  backendUrl: string;
  defaultCity: string;
  supportedCities: City[];
  appTitle: string;
  appVersion: string;
  enableDarkMode: boolean;
  enableLanguageSelector: boolean;
}
