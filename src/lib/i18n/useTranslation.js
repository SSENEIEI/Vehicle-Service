'use client';

import { useLanguage } from './LanguageProvider';

export function useTranslation() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  return {
    t,
    language,
    setLanguage,
    availableLanguages,
  };
}
