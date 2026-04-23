import React, { createContext, useContext, ReactNode } from 'react';
import { en } from './en';
import { zh } from './zh';

export type Language = 'en' | 'zh';

type TranslationType = typeof en;

interface I18nContextType {
  language: Language;
  t: TranslationType;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, TranslationType> = {
  en,
  zh,
};

// Determine language from URL path
const getLanguageFromPath = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const path = window.location.pathname;
  if (path.startsWith('/zh')) return 'zh';
  return 'en';
};

interface I18nProviderProps {
  children: ReactNode;
  language?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, language }) => {
  const detectedLanguage = language || getLanguageFromPath();
  const t = translations[detectedLanguage];

  return (
    <I18nContext.Provider value={{ language: detectedLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook for using i18n
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
