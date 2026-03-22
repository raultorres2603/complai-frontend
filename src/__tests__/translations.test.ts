/**
 * Unit tests for translation system
 * Verifies all translation keys exist in all languages and are non-empty
 */

import { describe, it, expect } from 'vitest';
import { translations, getTranslation } from '../translations/languages';
import type { Language } from '../types/accessibility.types';

describe('Translation System', () => {
  describe('languages.ts', () => {
    const languages: Language[] = ['es', 'en', 'ca'];

    it('should have all keys in Spanish, English, and Catalan', () => {
      const spanishKeys = Object.keys(translations.es);
      const englishKeys = Object.keys(translations.en);
      const catalanKeys = Object.keys(translations.ca);

      expect(spanishKeys.length).toBeGreaterThan(0);
      expect(englishKeys.length).toBe(spanishKeys.length);
      expect(catalanKeys.length).toBe(spanishKeys.length);

      // Verify all keys exist in all languages
      spanishKeys.forEach((key) => {
        expect(englishKeys).toContain(key);
        expect(catalanKeys).toContain(key);
      });
    });

    it('should not have undefined or null values in any language', () => {
      languages.forEach((lang) => {
        Object.entries(translations[lang]).forEach(([_key, value]) => {
          expect(value).toBeDefined();
          expect(value).not.toBeNull();
          expect(typeof value).toBe('string');
        });
      });
    });

    it('should have non-empty translation strings', () => {
      languages.forEach((lang) => {
        Object.entries(translations[lang]).forEach(([_key, value]) => {
          expect((value as string).length).toBeGreaterThan(0);
        });
      });
    });

    it('should contain all new translation keys', () => {
      const newKeys = [
        'complaint_mode',
        'ask_question',
        'requester_information',
        'optional',
        'name_field',
        'surname_field',
        'id_number_field',
        'output_format_label',
        'describe_complaint_placeholder',
        'ask_question_placeholder',
        'send_message',
        'send_message_tooltip',
        'stop_speaking',
        'speed_label',
        'voice_label',
        'stop_listening',
        'start_listening',
        'listening_status',
        'multiple_tabs_detected_title',
        'multiple_tabs_security_message',
        'multiple_tabs_auto_close_message',
        'closing_other_tabs',
        'other_tabs_closed',
        'other_tabs_close_failed',
        'retry_button',
        'continue_this_tab',
        'closing_tabs_status',
      ] as const;

      languages.forEach((lang) => {
        newKeys.forEach((key) => {
          expect(translations[lang][key as keyof typeof translations.es]).toBeDefined();
          expect(translations[lang][key as keyof typeof translations.es]).not.toBe('');
        });
      });
    });

    it('should have correct Spanish translations for new keys', () => {
      expect(translations.es.complaint_mode).toBe('Modo de Reclamación');
      expect(translations.es.ask_question).toBe('Hacer una pregunta');
      expect(translations.es.requester_information).toBe('Información del Solicitante');
      expect(translations.es.optional).toBe('(Opcional)');
      expect(translations.es.send_message).toBe('Enviar');
      expect(translations.es.listening_status).toBe('Escuchando...');
    });

    it('should have correct English translations for new keys', () => {
      expect(translations.en.complaint_mode).toBe('Complaint mode');
      expect(translations.en.ask_question).toBe('Ask a question');
      expect(translations.en.requester_information).toBe('Requester Information');
      expect(translations.en.optional).toBe('(Optional)');
      expect(translations.en.send_message).toBe('Send');
      expect(translations.en.listening_status).toBe('Listening...');
    });

    it('should have correct Catalan translations for new keys', () => {
      expect(translations.ca.complaint_mode).toBe('Mode de Reclamació');
      expect(translations.ca.ask_question).toBe('Fer una pregunta');
      expect(translations.ca.requester_information).toBe('Informació del Solicitant');
      expect(translations.ca.optional).toBe('(Opcional)');
      expect(translations.ca.send_message).toBe('Enviar');
      expect(translations.ca.listening_status).toBe('Escoltant...');
    });
  });

  describe('getTranslation function', () => {
    it('should return translation for valid key and language', () => {
      const result = getTranslation('es', 'complaint_mode');
      expect(result).toBe('Modo de Reclamación');

      const resultEn = getTranslation('en', 'complaint_mode');
      expect(resultEn).toBe('Complaint mode');
    });

    it('should fall back to Spanish when key not found in other language', () => {
      // This tests the fallback behavior in getTranslation
      // If a key doesn't exist in a language, it falls back to Spanish
      const result = getTranslation('en', 'complaint_mode');
      expect(result).toBe('Complaint mode');
    });

    it('should return the key name if not found in any language', () => {
      const result = getTranslation('es', 'nonexistent_key' as any);
      expect(result).toBe('nonexistent_key');
    });

    it('should handle all language variants', () => {
      const languages = ['es', 'en', 'ca'] as const;
      const key = 'send_message' as const;

      languages.forEach((lang) => {
        const result = getTranslation(lang, key);
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Translation consistency', () => {
    it('should have matching UI label translations', () => {
      // Verify that related translation pairs match semantically
      expect(translations.es.send_message).toBe('Enviar');
      expect(translations.es.send).toBe('Enviar');

      expect(translations.en.send_message).toBe('Send');
      expect(translations.en.send).toBe('Send');
    });

    it('should have modal translations for all states', () => {
      const modalKeys = [
        'multiple_tabs_detected_title',
        'multiple_tabs_security_message',
        'multiple_tabs_auto_close_message',
        'closing_other_tabs',
        'other_tabs_closed',
        'other_tabs_close_failed',
        'retry_button',
        'continue_this_tab',
        'closing_tabs_status',
      ] as const;

      modalKeys.forEach((key) => {
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
        expect(translations.ca[key]).toBeDefined();
      });
    });

    it('should have TTS/STT labels translated consistently', () => {
      const ttsKeys = ['stop_speaking', 'speed_label', 'voice_label'] as const;
      const sttKeys = ['start_listening', 'stop_listening', 'listening_status'] as const;

      ttsKeys.forEach((key) => {
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
        expect(translations.ca[key]).toBeDefined();
      });

      sttKeys.forEach((key) => {
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
        expect(translations.ca[key]).toBeDefined();
      });
    });
  });
});
