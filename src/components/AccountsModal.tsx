import React, { useState } from 'react';
import { X, Cloud, Mail, HardDrive, Droplets } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { gmailService } from '../services/gmail';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onStatusChange: (status: string) => void;
}

interface ConnectionState {
  google: boolean;
  onedrive: boolean;
  dropbox: boolean;
  email: boolean;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  language,
  onStatusChange
}) => {
  const t = (key: string) => getTranslation(language, key);
  const [connections, setConnections] = useState<ConnectionState>({
    google: false,
    onedrive: false,
    dropbox: false,
    email: false
  });

  const handleConnect = async (provider: keyof ConnectionState) => {
    try {
      if (provider === 'email') {
        const success = await gmailService.authenticate();
        if (success) {
          setConnections(prev => ({ ...prev, [provider]: true }));
          onStatusChange('Gmail connected successfully');
        } else {
          throw new Error('Gmail authentication failed');
        }
      } else {
        // TODO: Implement other OAuth flows (Google Drive, OneDrive, Dropbox)
        // For now, simulate connection
        setConnections(prev => ({ ...prev, [provider]: true }));
        onStatusChange(`${provider} connected successfully`);
      }
    } catch (error) {
      onStatusChange(`${t('error')}: Failed to connect ${provider}`);
    }
  };

  const handleListEmails = async () => {
    try {
      if (!gmailService.isAuthenticated()) {
        onStatusChange('Please connect your email account first');
        return;
      }
      
      const emails = await gmailService.getEmails(10);
      onStatusChange(`Found ${emails.length} unread emails`);
      
      // TODO: Display emails in a list or send to chat
      console.log('Emails:', emails);
    } catch (error) {
      onStatusChange(`${t('error')}: Failed to fetch emails`);
    }
  };

  const handleListFiles = async () => {
    try {
      // TODO: Implement cloud files listing for connected services
      onStatusChange('Cloud files feature coming soon');
    } catch (error) {
      onStatusChange(`${t('error')}: Failed to fetch files`);
    }
  };
  const connectionButtons = [
    { key: 'google', icon: Cloud, label: t('connectGoogle'), color: 'bg-blue-600 hover:bg-blue-700' },
    { key: 'onedrive', icon: HardDrive, label: t('connectOneDrive'), color: 'bg-blue-700 hover:bg-blue-800' },
    { key: 'dropbox', icon: Droplets, label: t('connectDropbox'), color: 'bg-blue-500 hover:bg-blue-600' },
    { key: 'email', icon: Mail, label: t('connectEmail'), color: 'bg-green-600 hover:bg-green-700' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accounts-title"
    >
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 id="accounts-title" className="text-xl font-bold text-white">
            {t('connectAccounts')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {connectionButtons.map(({ key, icon: Icon, label, color }) => (
            <button
              key={key}
              onClick={() => handleConnect(key as keyof ConnectionState)}
              disabled={connections[key as keyof ConnectionState]}
              className={`w-full flex items-center justify-between gap-3 p-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                connections[key as keyof ConnectionState]
                  ? 'bg-gray-600 cursor-not-allowed'
                  : `${color} focus:ring-blue-500`
              } text-white`}
              aria-label={`${label} - ${connections[key as keyof ConnectionState] ? t('connected') : 'Not connected'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">{label}</span>
              </div>
              {connections[key as keyof ConnectionState] && (
                <span className="text-sm bg-green-500 px-2 py-1 rounded">
                  {t('connected')}
                </span>
              )}
            </button>
          ))}
          
          <div className="pt-4 space-y-2">
            <button
              onClick={handleListFiles}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="List files from connected cloud storage"
            >
              {t('listFiles')}
            </button>
            <button
              onClick={handleListEmails}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="List emails from connected email accounts"
            >
              {t('listEmails')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};