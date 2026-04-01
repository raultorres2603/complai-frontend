import { useEffect, useCallback, useRef, useState } from 'react';
import introJs from 'intro.js';
import { storageService } from '../services/storageService';
import { useLanguage } from './useLanguage';
import { getAppTourSteps } from '../tours/appTour';
import type { TourStep } from '../tours/appTour';

export function useTour(): { startTour: () => void } {
  const tourStartedRef = useRef<boolean>(false);
  const { currentLanguage } = useLanguage();
  const [tourSteps, setTourSteps] = useState<TourStep[]>(() => getAppTourSteps(currentLanguage));

  // Update tour steps when language changes
  useEffect(() => {
    setTourSteps(getAppTourSteps(currentLanguage));
  }, [currentLanguage]);

  const startTour = useCallback(() => {
    try {
      const visibleSteps = tourSteps.filter(
        step => !step.element || document.querySelector(step.element) !== null
      );
      introJs()
        .setOptions({ steps: visibleSteps as any, exitOnOverlayClick: true, showProgress: true, showBullets: false })
        .oncomplete(() => {
          storageService.set('tour_completed', true);
        })
        .onexit(() => {
          storageService.set('tour_completed', true);
        })
        .start();
    } catch (err) {
      console.warn('[useTour] Failed to start tour:', err);
    }
  }, [tourSteps]);

  useEffect(() => {
    if (!tourStartedRef.current && !storageService.has('tour_completed')) {
      tourStartedRef.current = true;
      startTour();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { startTour };
}
