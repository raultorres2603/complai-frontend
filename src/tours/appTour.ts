// Tour step type (inline to avoid @types/intro.js vs intro.js own types ambiguity)
export interface TourStep {
  element?: string;
  intro: string;
  title?: string;
  position?: string;
}

import { translations } from '../translations/languages';
import type { Language } from '../types/accessibility.types';

/**
 * Get tour steps for a specific language
 * Each tour step is dynamically built from translation keys
 * 
 * @param language - The language code (es, en, ca)
 * @returns Array of tour steps with translated content
 */
export function getAppTourSteps(language: Language): TourStep[] {
  // Default to Catalan if language is invalid
  const lang: Language = ['es', 'en', 'ca'].includes(language) ? language : 'ca';
  const langTranslations = translations[lang];

  return [
    {
      element: '[data-tour="chat-window"]',
      title: langTranslations.tour_chat_area_title,
      intro: langTranslations.tour_chat_area_description,
      position: 'right',
    },
    {
      element: '[data-tour="message-input"]',
      title: langTranslations.tour_message_input_title,
      intro: langTranslations.tour_message_input_description,
      position: 'top',
    },
    {
      element: '[data-tour="complaint-toggle"]',
      title: langTranslations.tour_complaint_toggle_title,
      intro: langTranslations.tour_complaint_toggle_description,
      position: 'bottom',
    },
    {
      element: '[data-tour="microphone-button"]',
      title: langTranslations.tour_microphone_button_title,
      intro: langTranslations.tour_microphone_button_description,
      position: 'left',
    },
    {
      element: '[data-tour="speech-controls"]',
      title: langTranslations.tour_speech_controls_title,
      intro: langTranslations.tour_speech_controls_description,
      position: 'left',
    },
    {
      element: '[data-tour="language-selector"]',
      title: langTranslations.tour_language_selector_title,
      intro: langTranslations.tour_language_selector_description,
      position: 'left',
    },
    {
      element: '[data-tour="feedback-button"]',
      title: langTranslations.tour_feedback_button_title,
      intro: langTranslations.tour_feedback_button_description,
      position: 'left',
    },
    {
      element: '[data-tour="tour-button"]',
      title: langTranslations.tour_tour_button_title,
      intro: langTranslations.tour_tour_button_description,
      position: 'left',
    },
  ];
}

/**
 * Default tour steps using Catalan language (for backward compatibility)
 */
export const APP_TOUR_STEPS: TourStep[] = getAppTourSteps('ca');
