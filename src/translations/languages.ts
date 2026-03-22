/**
 * Translation strings for ComplAI frontend
 * Supports: Spanish (es), English (en), Catalan (ca)
 */

import type { Language } from '../types/accessibility.types';

export type TranslationKey = keyof typeof translations.es;

export const translations: Record<Language, Record<TranslationKey, string>> = {
  es: {
    accessibility_settings: 'Configuración de Accesibilidad',
    close: 'Cerrar',
    color_blindness_filter: 'Filtro de Daltonismo',
    vision_type: 'Tipo de Visión:',
    preview: 'Vista Previa:',
    normal: 'Normal',
    deuteranopia: 'Deuteranopía (Rojo-Verde)',
    protanopia: 'Protanopía (Rojo-Verde)',
    tritanopia: 'Tritanopía (Azul-Amarillo)',
    text_to_speech: 'Texto a Voz',
    enable_tts: 'Habilitar Texto a Voz',
    select_voice: 'Seleccionar Voz:',
    voice_rate: 'Velocidad:',
    speech_recognition: 'Reconocimiento de Voz',
    enable_stt: 'Habilitar Reconocimiento de Voz',
    send: 'Enviar',
    listen: 'Escuchar',
    stop: 'Detener',
    clear_chat: 'Limpiar Chat',
    accessibility_tooltip: 'Configuración de Accesibilidad',
    select_language: 'Seleccionar idioma',
  },
  en: {
    accessibility_settings: 'Accessibility Settings',
    close: 'Close',
    color_blindness_filter: 'Color Blindness Filter',
    vision_type: 'Vision Type:',
    preview: 'Preview:',
    normal: 'Normal',
    deuteranopia: 'Deuteranopia (Red-Green)',
    protanopia: 'Protanopia (Red-Green)',
    tritanopia: 'Tritanopia (Blue-Yellow)',
    text_to_speech: 'Text-to-Speech',
    enable_tts: 'Enable Text-to-Speech',
    select_voice: 'Select Voice:',
    voice_rate: 'Speed:',
    speech_recognition: 'Speech Recognition',
    enable_stt: 'Enable Speech Recognition',
    send: 'Send',
    listen: 'Listen',
    stop: 'Stop',
    clear_chat: 'Clear Chat',
    accessibility_tooltip: 'Accessibility Settings',
    select_language: 'Select language',
  },
  ca: {
    accessibility_settings: 'Configuració d\'Accessibilitat',
    close: 'Tancar',
    color_blindness_filter: 'Filtre de Daltonisme',
    vision_type: 'Tipus de Visió:',
    preview: 'Vista Prèvia:',
    normal: 'Normal',
    deuteranopia: 'Deuteranopia (Vermell-Verd)',
    protanopia: 'Protanopia (Vermell-Verd)',
    tritanopia: 'Tritanopia (Blau-Groc)',
    text_to_speech: 'Text a Veu',
    enable_tts: 'Habilitar Text a Veu',
    select_voice: 'Seleccionar Veu:',
    voice_rate: 'Velocitat:',
    speech_recognition: 'Reconeixement de Veu',
    enable_stt: 'Habilitar Reconeixement de Veu',
    send: 'Enviar',
    listen: 'Escoltar',
    stop: 'Detenir',
    clear_chat: 'Netejar Xat',
    accessibility_tooltip: 'Configuració d\'Accessibilitat',
    select_language: 'Seleccionar idioma',
  },
};

/**
 * Get translation for a given key in the current language
 */
export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations.es[key] ?? key;
}
