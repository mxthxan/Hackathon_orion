import React from 'react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface SkipLinkProps {
  language: Language;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ language }) => {
  const t = (key: string) => getTranslation(language, key);

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
    >
      {t('skipToContent')}
    </a>
  );
};