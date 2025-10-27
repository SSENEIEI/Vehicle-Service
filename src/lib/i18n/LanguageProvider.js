'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './translations/en.json';
import th from './translations/th.json';

const LANGUAGE_STORAGE_KEY = 'appLanguage';
const TRANSLATIONS = { en, th };
const SUPPORTED_LANGUAGES = ['th', 'en'];

function resolveLanguage(candidate, fallback) {
  const normalized = String(candidate || '').trim().toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : fallback;
}

function resolveValue(dictionary, path) {
  if (!dictionary || !path) {
    return undefined;
  }
  const segments = String(path).split('.');
  let current = dictionary;
  for (const segment of segments) {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageContext = createContext({
  language: 'th',
  setLanguage: () => {},
  t: (key, fallback) => (fallback !== undefined ? fallback : key),
  availableLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children, defaultLanguage = 'th' }) {
  const fallbackLanguage = resolveLanguage(defaultLanguage, 'th');
  const [language, setLanguageState] = useState(fallbackLanguage);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        setLanguageState(resolveLanguage(stored, fallbackLanguage));
      }
    } catch (error) {
      console.warn('Failed to read language from storage', error);
    }
  }, [fallbackLanguage]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.warn('Failed to persist language selection', error);
    }
  }, [language]);

  const setLanguage = useCallback(
    (nextLanguage) => {
      setLanguageState((current) =>
        resolveLanguage(nextLanguage, resolveLanguage(current, fallbackLanguage))
      );
    },
    [fallbackLanguage]
  );

  const contextValue = useMemo(() => {
    const dictionary = TRANSLATIONS[language] || TRANSLATIONS[fallbackLanguage] || {};
    const translate = (key, fallback) => {
      const resolved = resolveValue(dictionary, key);
      if (resolved !== undefined) {
        return resolved;
      }
      if (fallback !== undefined) {
        return fallback;
      }
      return key;
    };

    return {
      language,
      setLanguage,
      t: translate,
      availableLanguages: SUPPORTED_LANGUAGES.slice(),
    };
  }, [language, fallbackLanguage, setLanguage]);

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES };
