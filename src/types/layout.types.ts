/**
 * Layout type definitions for handler interfaces and component props
 */

import type { OutputFormat } from './api.types';

/**
 * Handler functions for main layout message sending
 */
export interface MainLayoutHandlers {
  /**
   * Handler for sending regular questions/messages
   * @param text The message text
   * @param jwtToken JWT authentication token
   */
  onSendQuestion: (text: string, jwtToken: string) => void;

  /**
   * Handler for sending complaint redactions
   * @param text The complaint message text
   * @param format Output format for the complaint
   * @param name Optional requester name
   * @param surname Optional requester surname
   * @param idNumber Optional requester ID number
   * @param jwtToken JWT authentication token
   */
  onSendComplaint: (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined,
    jwtToken: string
  ) => void;
}

/**
 * Properties for MobileInputFooter component
 */
export interface MobileInputFooterProps {
  /** Callback when message is sent (normal mode) */
  onSend: (text: string, format?: OutputFormat) => void;

  /** Callback when complaint is sent */
  onSendComplaint: (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined
  ) => void;

  /** Whether input is disabled (loading state) */
  disabled: boolean;

  /** Whether in complaint mode */
  isComplaintMode?: boolean;

  /** Callback for complaint information changes */
  onComplaintInfoChange?: (info: {
    name?: string;
    surname?: string;
    idNumber?: string;
  }) => void;

  /** Chat message history */
  messages: any[];

  /** Whether text-to-speech is enabled */
  ttsEnabled?: boolean;

  /** JWT token for API requests */
  jwtToken: string | null;
}
