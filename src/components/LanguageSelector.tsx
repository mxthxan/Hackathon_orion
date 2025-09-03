import React from 'react';
import { Languages } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange
}) => {
  const t = (key: string) => getTranslation(selectedLanguage, key);
  const languages: Language[] = ['en', 'hi', 'ta', 'te', 'kn', 'bn'];

  return (
    <div className="relative">
      <label htmlFor="language-select" className="sr-only">
        {t('languageSelector')}
      </label>
      <div className="relative">
        <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="appearance-none bg-gray-800 text-white pl-10 pr-8 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-w-[140px] cursor-pointer"
          aria-label={t('languageSelector')}
        >
          {languages.map(lang => (
            <option key={lang} value={lang} className="bg-gray-800 text-white">
              {t(`languages.${lang}`)}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};