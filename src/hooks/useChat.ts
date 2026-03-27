/**
 * useChat Hook - Chat state management and logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, ChatState, ComplaintRedactContext } from '../types/domain.types';
import type { SSECallbacks } from '../types/api.types';
import type { Source } from '../types/api.types';
import { complaiService, ApiError } from '../services/apiService';
import { sessionService } from '../services/sessionService';
import { useLanguage } from './useLanguage';

function generateMessageId(): string {
  return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function useChat(
  initialConversationId?: string,
  cityId?: string
) {
  const { currentLanguage } = useLanguage(); // Get current language for API calls
  const [state, setState] = useState<ChatState>({
    conversationId: initialConversationId || '',
    messages: [],
    isLoading: false,
    currentError: null,
    lastMessageTimestamp: null,
  });

  const [redactContext, setRedactContext] = useState<ComplaintRedactContext | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup: abort stream on unmount
  useEffect(() => () => { abortControllerRef.current?.abort(); }, []);

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
   * Send a question to the chatbot (SSE streaming)
   */
  const sendQuestion = useCallback(
    async (text: string, jwtToken: string) => {
      // Abort any previous stream
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Extract current conversationId at function start to avoid stale closure
      const conversationId = state.conversationId;

      if (!conversationId || !jwtToken) {
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

      // Create streaming placeholder
      const streamingMessageId = generateMessageId();
      const placeholderMessage: ChatMessage = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        loading: true,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, placeholderMessage],
        isLoading: true,
        currentError: null,
      }));

      // Save user message to session
      sessionService.addMessage(conversationId, userMessage);

      // Track accumulated content to avoid stale closure
      let accumulatedContent = '';
      let accumulatedSources: Source[] | undefined;

      const callbacks: SSECallbacks = {
        onChunk(content) {
          accumulatedContent += content;
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === streamingMessageId ? { ...m, content: m.content + content } : m
            ),
          }));
        },
        onSources(sources) {
          accumulatedSources = sources;
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === streamingMessageId ? { ...m, sources } : m
            ),
          }));
        },
        onDone(_conversationId) {
          const finalMessage: ChatMessage = {
            id: streamingMessageId,
            role: 'assistant',
            content: accumulatedContent,
            timestamp: Date.now(),
            sources: accumulatedSources,
            loading: false,
          };
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === streamingMessageId ? finalMessage : m
            ),
            isLoading: false,
            lastMessageTimestamp: Date.now(),
          }));
          sessionService.addMessage(conversationId, finalMessage);
          abortControllerRef.current = null;
        },
        onError(error, errorCode) {
          const code = errorCode ?? 4;
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === streamingMessageId
                ? { ...m, loading: false, content: m.content || `Error: ${error}`, error: { code, message: error } }
                : m
            ),
            isLoading: false,
            currentError: { code, message: error },
          }));
          sessionService.addMessage(conversationId, {
            id: streamingMessageId,
            role: 'assistant',
            content: accumulatedContent || `Error: ${error}`,
            timestamp: Date.now(),
            error: { code, message: error },
          });
          abortControllerRef.current = null;
        },
      };

      try {
        await complaiService.askQuestionStream(
          text,
          conversationId,
          jwtToken,
          currentLanguage,
          callbacks,
          abortController.signal
        );
      } catch {
        // onError callback already handles errors; this catch handles unexpected throws
      }
    },
    [state.conversationId, currentLanguage]
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
      // Extract current conversationId at function start to avoid stale closure
      const conversationId = state.conversationId;

      if (!conversationId || !jwtToken) {
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

      sessionService.addMessage(conversationId, userMessage);

      try {
        const response = await complaiService.redactComplaint(
          text,
          format,
          conversationId,
          requesterName,
          requesterSurname,
          requesterIdNumber,
          jwtToken,
          currentLanguage,
          90000
        );

        // Check if response is async (202 Accepted)
        if (response.pdfUrl) {
          setRedactContext({
            conversationId: conversationId,
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

        sessionService.addMessage(conversationId, assistantMessage);
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

        sessionService.addMessage(conversationId, errorMessage);
      }
    },
    [state.conversationId, currentLanguage]
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
    // Extract current conversationId at function start to avoid stale closure
    const conversationId = state.conversationId;

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
    if (conversationId) {
      sessionService.addMessage(conversationId, message);
    }
  }, [state.conversationId]);

  /**
   * Clear the current error state
   */
  const clearCurrentError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentError: null,
    }));
  }, []);

  return {
    state,
    redactContext,
    setRedactContext,
    sendQuestion,
    sendRedactComplaint,
    clearMessages,
    setConversationId,
    addMessage,
    clearCurrentError,
  };
}
