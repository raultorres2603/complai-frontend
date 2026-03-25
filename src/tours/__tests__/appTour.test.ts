import { describe, it, expect } from 'vitest';
import { getAppTourSteps, APP_TOUR_STEPS } from '../appTour';
import { translations } from '../../translations/languages';
import type { Language } from '../../types/accessibility.types';

describe('getAppTourSteps', () => {
  const languages: Language[] = ['es', 'en', 'ca'];
  const expectedStepIds = ['chat_area', 'message_input', 'complaint_toggle', 'microphone_button', 'speech_controls', 'language_selector', 'feedback_button', 'tour_button'];

  it('should return 8 tour steps for each language', () => {
    languages.forEach((lang) => {
      const steps = getAppTourSteps(lang);
      expect(steps).toHaveLength(8);
    });
  });

  it('should return steps with all required fields', () => {
    languages.forEach((lang) => {
      const steps = getAppTourSteps(lang);
      steps.forEach((step) => {
        expect(step).toHaveProperty('element');
        expect(step).toHaveProperty('intro');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('position');
        expect(typeof step.element).toBe('string');
        expect(typeof step.intro).toBe('string');
        expect(typeof step.title).toBe('string');
        expect(typeof step.position).toBe('string');
      });
    });
  });

  it('should preserve HTML content in descriptions', () => {
    languages.forEach((lang) => {
      const steps = getAppTourSteps(lang);
      steps.forEach((step) => {
        // Verify that descriptions contain expected HTML elements
        expect(step.intro).toMatch(/<b>/);
        expect(step.intro).toMatch(/<\/b>/);
        expect(step.intro).toMatch(/<br\/>/);
        // Verify emoji presence
        expect(step.intro).toMatch(/[💬✍️📋🎤🔊🌐💭🧭]/);
      });
    });
  });

  it('should map translation keys correctly for each language', () => {
    languages.forEach((lang) => {
      const steps = getAppTourSteps(lang);
      const langTranslations = translations[lang];
      
      expectedStepIds.forEach((stepId, index) => {
        const step = steps[index];
        const titleKey = `tour_${stepId}_title` as const;
        const descKey = `tour_${stepId}_description` as const;
        const expectedTitle = langTranslations[titleKey as keyof typeof langTranslations];
        const expectedDescription = langTranslations[descKey as keyof typeof langTranslations];
        
        expect(step.title).toBe(expectedTitle);
        expect(step.intro).toBe(expectedDescription);
      });
    });
  });

  it('should have correct data-tour selectors', () => {
    const steps = getAppTourSteps('ca');
    const expectedSelectors = [
      '[data-tour="chat-window"]',
      '[data-tour="message-input"]',
      '[data-tour="complaint-toggle"]',
      '[data-tour="microphone-button"]',
      '[data-tour="speech-controls"]',
      '[data-tour="language-selector"]',
      '[data-tour="feedback-button"]',
      '[data-tour="tour-button"]',
    ];

    steps.forEach((step, index) => {
      expect(step.element).toBe(expectedSelectors[index]);
    });
  });

  it('should maintain step order across languages', () => {
    const catalan = getAppTourSteps('ca');
    const spanish = getAppTourSteps('es');
    const english = getAppTourSteps('en');

    // All languages should have same selectors in same order
    catalan.forEach((step, index) => {
      expect(step.element).toBe(spanish[index].element);
      expect(step.element).toBe(english[index].element);
    });
  });

  it('should default to Catalan for invalid language', () => {
    const steps = getAppTourSteps('invalid' as Language);
    const catalan = getAppTourSteps('ca');
    expect(steps).toEqual(catalan);
  });

  it('should have valid titles and descriptions for each step', () => {
    languages.forEach((lang) => {
      const steps = getAppTourSteps(lang);
      steps.forEach((step) => {
        // Verify that title and intro are not empty and are strings
        expect(step.title).toBeTruthy();
        expect(step.intro).toBeTruthy();
        expect(typeof step.title).toBe('string');
        expect(typeof step.intro).toBe('string');
      });
    });
  });

  it('should have different content for each language', () => {
    const spanish = getAppTourSteps('es');
    const english = getAppTourSteps('en');
    const catalan = getAppTourSteps('ca');

    // Verify that at least the first step title is different across languages
    expect(spanish[0].title).not.toBe(english[0].title);
    expect(english[0].title).not.toBe(catalan[0].title);
    expect(spanish[0].title).not.toBe(catalan[0].title);
  });
});

describe('APP_TOUR_STEPS', () => {
  it('should be equal to getAppTourSteps("ca")', () => {
    const steps = getAppTourSteps('ca');
    expect(APP_TOUR_STEPS).toEqual(steps);
  });

  it('should have 8 tour steps', () => {
    expect(APP_TOUR_STEPS).toHaveLength(8);
  });

  it('should use Catalan translations', () => {
    const caTranslations = translations.ca;
    APP_TOUR_STEPS.forEach((step, index) => {
      const correspondingStep = getAppTourSteps('ca')[index];
      expect(step.title).toBe(correspondingStep.title);
      expect(step.intro).toBe(correspondingStep.intro);
    });
  });

  it('backwards compatibility: APP_TOUR_STEPS can be imported and used', () => {
    expect(APP_TOUR_STEPS).toBeDefined();
    expect(Array.isArray(APP_TOUR_STEPS)).toBe(true);
    expect(APP_TOUR_STEPS.length).toBe(8);
    APP_TOUR_STEPS.forEach((step) => {
      expect(step.element).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.intro).toBeDefined();
    });
  });
});
