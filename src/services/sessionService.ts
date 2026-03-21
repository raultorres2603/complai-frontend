/**
 * Session Service - Conversation and session management
 */

import type { ConversationSession, ChatMessage } from '../types/domain.types';
import { storageService, STORAGE_KEYS } from './storageService';

// Use simple UUID generation since crypto-js is not ideal for UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const sessionService = {
  /**
   * Create a new conversation session
   */
  createConversation(cityId: string): ConversationSession {
    return {
      id: generateUUID(),
      cityId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      archived: false,
    };
  },

  /**
   * Get all conversations for a city
   */
  getConversations(cityId: string): ConversationSession[] {
    const conversations = storageService.get<ConversationSession[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    return conversations.filter((c) => c.cityId === cityId && !c.archived);
  },

  /**
   * Get a specific conversation
   */
  getConversation(conversationId: string): ConversationSession | null {
    const conversations = storageService.get<ConversationSession[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    return conversations.find((c) => c.id === conversationId) || null;
  },

  /**
   * Save a conversation
   */
  saveConversation(conversation: ConversationSession): void {
    const conversations = storageService.get<ConversationSession[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const index = conversations.findIndex((c) => c.id === conversation.id);

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }

    storageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
  },

  /**
   * Add a message to a conversation
   */
  addMessage(conversationId: string, message: ChatMessage): ConversationSession | null {
    const conversation = sessionService.getConversation(conversationId);
    if (!conversation) return null;

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();
    sessionService.saveConversation(conversation);

    return conversation;
  },

  /**
   * Update a message in a conversation
   */
  updateMessage(conversationId: string, messageId: string, updates: Partial<ChatMessage>): boolean {
    const conversation = sessionService.getConversation(conversationId);
    if (!conversation) return false;

    const message = conversation.messages.find((m) => m.id === messageId);
    if (!message) return false;

    Object.assign(message, updates);
    conversation.updatedAt = Date.now();
    sessionService.saveConversation(conversation);

    return true;
  },

  /**
   * Archive a conversation
   */
  archiveConversation(conversationId: string): boolean {
    const conversation = sessionService.getConversation(conversationId);
    if (!conversation) return false;

    conversation.archived = true;
    conversation.updatedAt = Date.now();
    sessionService.saveConversation(conversation);

    return true;
  },

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): boolean {
    const conversations = storageService.get<ConversationSession[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const filtered = conversations.filter((c) => c.id !== conversationId);

    if (filtered.length === conversations.length) return false; // Not found

    storageService.set(STORAGE_KEYS.CONVERSATIONS, filtered);
    return true;
  },

  /**
   * Get the most recent conversation for a city
   */
  getLastConversation(cityId: string): ConversationSession | null {
    const conversations = sessionService.getConversations(cityId);
    if (conversations.length === 0) return null;

    return conversations.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  },

  /**
   * Clear all conversations for a city
   */
  clearConversations(cityId: string): void {
    const conversations = storageService.get<ConversationSession[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const remaining = conversations.filter((c) => c.cityId !== cityId);
    storageService.set(STORAGE_KEYS.CONVERSATIONS, remaining);
  },
};
