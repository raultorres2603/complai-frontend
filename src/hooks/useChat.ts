/**
 * useChat Hook - Chat state management and logic
 */

import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatState, ComplaintRedactContext } from '../types/domain.types';
import { complaiService, ApiError } from '../services/apiService';
import { sessionService } from '../services/sessionService';

function generateMessageId(): string {
  return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function useChat(
  initialConversationId?: string,
  cityId?: string
) {
  const [state, setState] = useState<ChatState>({
    conversationId: initialConversationId || '',
    messages: [],
    isLoading: false,
    currentError: null,
    lastMessageTimestamp: null,
  });

  const [redactContext, setRedactContext] = useState<ComplaintRedactContext | null>(null);

  // Initialize conversation on mount or when conversationId changes
  useEffect(() => {
    if (initialConversationId && cityId) {
      const conversation = sessionService.getConversation(initialConversationId);
      if (conversation) {
        setState((prev) => ({
          ...prev,
          conversationId: initialConversationId,
          messages: conversation.messages,
        }));
      }
    }
  }, [initialConversationId, cityId]);

  /**
   * Send a question to the chatbot
   */
  const sendQuestion = useCallback(
    async (text: string, jwtToken: string) => {
      if (!state.conversationId || !jwtToken) {
        setState((prev) => ({
          ...prev,
          currentError: {
            code: 2,
            message: 'Missing conversation ID or JWT token',
          },
        }));
        return;
      }

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        currentError: null,
      }));

      // Save to session
      sessionService.addMessage(state.conversationId, userMessage);

      try {
        // Call API
        const response = await complaiService.askQuestion(
          text,
          state.conversationId,
          jwtToken,
          60000
        );

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: response.message || '',
          timestamp: Date.now(),
          sources: response.sources,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          lastMessageTimestamp: Date.now(),
        }));

        // Save to session
        sessionService.addMessage(state.conversationId, assistantMessage);
      } catch (error) {
        const errorMsg = error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown error occurred';

        const errorCode = error instanceof ApiError ? error.errorCode : 4;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          currentError: {
            code: errorCode,
            message: errorMsg,
          },
        }));

        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: Date.now(),
          error: {
            code: errorCode,
            message: errorMsg,
          },
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }));

        sessionService.addMessage(state.conversationId, errorMessage);
      }
    },
    [state.conversationId]
  );

  /**
   * Send a complaint redaction request
   */
  const sendRedactComplaint = useCallback(
    async (
      text: string,
      format: string,
      requesterName: string | undefined,
      requesterSurname: string | undefined,
      requesterIdNumber: string | undefined,
      jwtToken: string
    ) => {
      if (!state.conversationId || !jwtToken) {
        setState((prev) => ({
          ...prev,
          currentError: {
            code: 2,
            message: 'Missing conversation ID or JWT token',
          },
        }));
        return;
      }

      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: `[Complaint - ${format}] ${text}`,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        currentError: null,
      }));

      sessionService.addMessage(state.conversationId, userMessage);

      try {
        const response = await complaiService.redactComplaint(
          text,
          format,
          state.conversationId,
          requesterName,
          requesterSurname,
          requesterIdNumber,
          jwtToken,
          90000
        );

        // Check if response is async (202 Accepted)
        if (response.pdfUrl) {
          setRedactContext({
            conversationId: state.conversationId,
            format: format as any,
            requesterName,
            requesterSurname,
            requesterIdNumber,
            pdfUrl: response.pdfUrl,
            pollingInProgress: true,
          });
        }

        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: response.message || 'Complaint processed',
          timestamp: Date.now(),
          sources: response.sources,
          ...(response.pdfUrl && {
            files: [
              {
                id: generateMessageId(),
                name: 'complaint.pdf',
                url: response.pdfUrl,
                type: 'pdf',
                createdAt: Date.now(),
              },
            ],
          }),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          lastMessageTimestamp: Date.now(),
        }));

        sessionService.addMessage(state.conversationId, assistantMessage);
      } catch (error) {
        const errorMsg = error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown error occurred';

        const errorCode = error instanceof ApiError ? error.errorCode : 4;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          currentError: {
            code: errorCode,
            message: errorMsg,
          },
        }));

        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: Date.now(),
          error: {
            code: errorCode,
            message: errorMsg,
          },
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }));

        sessionService.addMessage(state.conversationId, errorMessage);
      }
    },
    [state.conversationId]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      currentError: null,
    }));
  }, []);

  /**
   * Set conversation ID
   */
  const setConversationId = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      conversationId: id,
      messages: [],
      currentError: null,
    }));
  }, []);

  /**
   * Add message manually (for testing)
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
    if (state.conversationId) {
      sessionService.addMessage(state.conversationId, message);
    }
  }, [state.conversationId]);

  return {
    state,
    redactContext,
    setRedactContext,
    sendQuestion,
    sendRedactComplaint,
    clearMessages,
    setConversationId,
    addMessage,
  };
}
