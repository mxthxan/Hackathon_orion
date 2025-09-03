import React from 'react';
import { Settings } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  ttsEnabled: boolean;
  onTTSToggle: () => void;
  onAccountsOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onLanguageChange,
  ttsEnabled,
  onTTSToggle,
  onAccountsOpen
}) => {
  const t = (key: string) => getTranslation(selectedLanguage, key);

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {t('appTitle')}
        </h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <span className="text-white font-medium text-sm sm:text-base">
              {t('autoTTS')}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={onTTSToggle}
                className="sr-only"
                aria-describedby="tts-description"
              />
              <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                ttsEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  ttsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </div>
            <span id="tts-description" className="sr-only">
              Toggle automatic text-to-speech reading
            </span>
          </label>
          
          <button
            onClick={onAccountsOpen}
            className="p-2 text-white hover:text-blue-400 transition-colors duration-200 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Open account settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};