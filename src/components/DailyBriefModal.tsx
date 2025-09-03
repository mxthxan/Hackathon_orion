import React, { useState } from 'react';
import { X, Calendar, Mail, FileText, Newspaper } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { EmailList } from './EmailList';
import { EmailComposer } from './EmailComposer';
import { useFocusManager } from '../hooks/useFocusManager';
import { mockDailyBrief } from '../utils/mockResponses';

interface DailyBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onStatusChange: (status: string) => void;
}

export const DailyBriefModal: React.FC<DailyBriefModalProps> = ({
  isOpen,
  onClose,
  language,
  onStatusChange
}) => {
  const t = (key: string) => getTranslation(language, key);
  const [showEmails, setShowEmails] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [briefRead, setBriefRead] = useState(false);

  const { setupFocusTrap } = useFocusManager({ isOpen });

  const handleComposeEmail = (to: string = '', subject: string = '', body: string = '') => {
    setComposeData({ to, subject, body });
    setShowComposer(true);
  };

  const handleReadAloud = (text: string) => {
    // TODO: This should call the TTS service from parent
    onStatusChange(`Reading: ${text.substring(0, 50)}...`);
  };

  const handleReadBrief = () => {
    const briefText = `${mockDailyBrief.greeting} ${mockDailyBrief.summary}`;
    handleReadAloud(briefText);
    setBriefRead(true);
    onStatusChange('Daily brief read aloud');
  };

  const handleReadEmails = () => {
    setShowEmails(true);
    onStatusChange('Opening email list');
  };

  const handleReadNews = () => {
    const newsText = "Today's top news: Major breakthrough in AI accessibility technology announced. New screen reader features improve web navigation. Government announces enhanced digital accessibility standards.";
    handleReadAloud(newsText);
    onStatusChange('Reading today\'s news headlines');
  };
  if (showComposer) {
    return (
      <EmailComposer
        isOpen={true}
        onClose={() => setShowComposer(false)}
        language={language}
        onStatusChange={onStatusChange}
        initialTo={composeData.to}
        initialSubject={composeData.subject}
        initialBody={composeData.body}
      />
    );
  }

  if (showEmails) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emails-title"
      >
        <div 
          className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          ref={setupFocusTrap}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 id="emails-title" className="text-2xl font-bold text-white">
              Email Management
            </h2>
            <button
              onClick={() => setShowEmails(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <button
                onClick={() => handleComposeEmail()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Compose New Email
              </button>
            </div>
            
            <EmailList
              language={language}
              onStatusChange={onStatusChange}
              onComposeReply={handleComposeEmail}
              onReadAloud={handleReadAloud}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-title"
    >
      <div 
        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        ref={setupFocusTrap}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" aria-hidden="true" />
            <h2 id="brief-title" className="text-2xl font-bold text-white">
              {t('goodMorning')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-3">{mockDailyBrief.greeting}</h3>
            <p className="leading-relaxed">
              {mockDailyBrief.summary}
            </p>
            <div className="mt-4">
              <button
                onClick={handleReadBrief}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Read daily brief aloud"
              >
                {briefRead ? 'Read Again' : 'Read Brief Aloud'}
              </button>
            </div>
          </div>

          {/* Priority Items */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Today's Priorities</h3>
            <ul className="space-y-2">
              {mockDailyBrief.priorities.map((priority, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-blue-400 font-bold">{index + 1}.</span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={handleListFiles}
              className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              aria-label="View recent files from cloud storage"
            >
              <FileText className="w-6 h-6 text-amber-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-white">Recent Files</div>
                <div className="text-sm text-gray-300">View your latest documents</div>
              </div>
            </button>

            <button
              onClick={handleReadEmails}
              className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              aria-label="View recent emails"
            >
              <Mail className="w-6 h-6 text-green-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-white">Recent Emails</div>
                <div className="text-sm text-gray-300">Check your inbox</div>
              </div>
            </button>

            <button
              onClick={handleReadNews}
              className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left col-span-full sm:col-span-2"
              aria-label="View today's news headlines"
            >
              <Newspaper className="w-6 h-6 text-blue-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-white">Today's News</div>
                <div className="text-sm text-gray-300">Top headlines and updates</div>
              </div>
            </button>
          </div>

          {/* Weather and News Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Quick Updates</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong>Weather:</strong> {mockDailyBrief.weather}</p>
              <p><strong>Top News:</strong> {mockDailyBrief.news}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};