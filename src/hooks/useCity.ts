/**
 * useCity Hook - City selection and scoping
 */

import { useState, useCallback, useEffect } from 'react';
import type { City, Language } from '../types/domain.types';
import { storageService, STORAGE_KEYS } from '../services/storageService';

const HARDCODED_CITIES: City[] = [
  {
    id: 'elprat',
    name: 'El Prat',
    displayName: 'El Prat de Llobregat',
    language: 'ca',
  },
  {
    id: 'testcity',
    name: 'Test City',
    displayName: 'Test City',
    language: 'en',
  },
];

export function useCity(defaultCityId?: string) {
  const [selectedCity, setSelectedCityState] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState<City[]>(HARDCODED_CITIES);

  // Initialize from localStorage or default on mount
  useEffect(() => {
    const saved = storageService.get<string>(STORAGE_KEYS.CITY_ID);
    const cityId = saved || defaultCityId || 'elprat';

    const city = cities.find((c) => c.id === cityId) || cities[0];
    setSelectedCityState(city);
    setIsLoading(false);
  }, []);

  /**
   * Select a city by ID
   */
  const selectCity = useCallback(
    (cityId: string) => {
      const city = cities.find((c) => c.id === cityId);
      if (city) {
        setSelectedCityState(city);
        storageService.set(STORAGE_KEYS.CITY_ID, cityId);
      }
    },
    [cities]
  );

  /**
   * Get language for current city
   */
  const getLanguage = useCallback((): Language => {
    return (selectedCity?.language || 'ca') as Language;
  }, [selectedCity]);

  /**
   * Get all available cities
   */
  const getCities = useCallback((): City[] => {
    return cities;
  }, [cities]);

  /**
   * Load cities from environment or API (for future)
   */
  const loadCities = useCallback((newCities: City[]) => {
    setCities(newCities);
  }, []);

  return {
    selectedCity,
    isLoading,
    cities,
    selectCity,
    getLanguage,
    getCities,
    loadCities,
  };
}
