import React, { useState } from 'react';
import { X, Calendar, Mail, FileText, Newspaper } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { EmailList } from './EmailList';
import { EmailComposer } from './EmailComposer';

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

  const handleComposeEmail = (to: string = '', subject: string = '', body: string = '') => {
    setComposeData({ to, subject, body });
    setShowComposer(true);
  };

  const handleReadAloud = (text: string) => {
    // This would be passed from parent component
    onStatusChange(`Reading: ${text.substring(0, 50)}...`);
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
        <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
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
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
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
            <h3 className="text-lg font-semibold mb-3">Daily Overview</h3>
            <p className="leading-relaxed">
              {t('briefContent')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => onStatusChange('Cloud files feature coming soon')}
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
              onClick={() => setShowEmails(true)}
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
        </div>
      </div>
    </div>
  );
};