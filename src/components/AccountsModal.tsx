import React, { useState } from 'react';
import { X, Cloud, Mail, HardDrive, Droplets } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { gmailService } from '../services/gmail';
import { driveService } from '../services/drive';
import { oneDriveService } from '../services/onedrive';
import { dropboxService } from '../services/dropbox';
import { useFocusManager } from '../hooks/useFocusManager';
import { mockCloudFiles, mockEmails } from '../utils/mockResponses';

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

interface CloudFilesState {
  files: any[];
  loading: boolean;
  provider: string;
}

interface EmailsState {
  emails: any[];
  loading: boolean;
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
  
  const [cloudFiles, setCloudFiles] = useState<CloudFilesState>({
    files: [],
    loading: false,
    provider: ''
  });
  
  const [emailsState, setEmailsState] = useState<EmailsState>({
    emails: [],
    loading: false
  });
  
  const [showFiles, setShowFiles] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  
  const { setupFocusTrap } = useFocusManager({ isOpen });

  const handleConnect = async (provider: keyof ConnectionState) => {
    try {
      onStatusChange(`Connecting to ${provider}...`);
      
      if (provider === 'email') {
        const success = await gmailService.authenticate();
        if (success) {
          setConnections(prev => ({ ...prev, [provider]: true }));
          onStatusChange('Gmail connected successfully');
        } else {
          throw new Error('Gmail authentication failed');
        }
      } else if (provider === 'google') {
        const result = await driveService.connectDrive();
        setConnections(prev => ({ ...prev, [provider]: result.connected }));
        onStatusChange(result.status);
      } else if (provider === 'onedrive') {
        const result = await oneDriveService.connectOneDrive();
        setConnections(prev => ({ ...prev, [provider]: result.connected }));
        onStatusChange(result.status);
      } else if (provider === 'dropbox') {
        const result = await dropboxService.connectDropbox();
        setConnections(prev => ({ ...prev, [provider]: result.connected }));
        onStatusChange(result.status);
      } else {
        // Fallback for any other providers
        setConnections(prev => ({ ...prev, [provider]: true }));
        onStatusChange(`${provider} connected successfully`);
      }
    } catch (error) {
      console.error(`Connection error for ${provider}:`, error);
      onStatusChange(`${t('error')}: Failed to connect ${provider}`);
    }
  };

  const handleListEmails = async () => {
    try {
      if (!connections.email && !gmailService.isAuthenticated()) {
        onStatusChange('Please connect your email account first');
        return;
      }
      
      setEmailsState({ emails: [], loading: true });
      setShowEmails(true);
      onStatusChange('Fetching emails...');
      
      const emails = await gmailService.getEmails(10);
      setEmailsState({ emails, loading: false });
      onStatusChange(`Found ${emails.length} emails`);
    } catch (error) {
      console.error('Email fetch error:', error);
      setEmailsState({ emails: mockEmails, loading: false });
      onStatusChange(`${t('error')}: Using mock email data`);
    }
  };

  const handleListFiles = async () => {
    try {
      const connectedProviders = Object.entries(connections)
        .filter(([key, connected]) => connected && key !== 'email')
        .map(([key]) => key);
      
      if (connectedProviders.length === 0) {
        onStatusChange('Please connect a cloud storage provider first');
        return;
      }
      
      const provider = connectedProviders[0];
      setCloudFiles({ files: [], loading: true, provider });
      setShowFiles(true);
      onStatusChange(`Fetching files from ${provider}...`);
      
      let files = [];
      
      if (provider === 'google' && driveService.isConnected()) {
        files = await driveService.listFiles();
      } else if (provider === 'onedrive' && oneDriveService.isConnected()) {
        files = await oneDriveService.listFiles();
      } else if (provider === 'dropbox' && dropboxService.isConnected()) {
        files = await dropboxService.listFiles();
      }
      
      setCloudFiles({ files, loading: false, provider });
      onStatusChange(`Found ${files.length} files in ${provider}`);
    } catch (error) {
      console.error('Files fetch error:', error);
      setCloudFiles({ files: mockCloudFiles, loading: false, provider: 'mock' });
      onStatusChange(`${t('error')}: Using mock file data`);
    }
  };

  const handleFileSelect = (file: any) => {
    onStatusChange(`Selected file: ${file.name}`);
    onClose(); // Close modal after selection
    // TODO: Implement file preview or send to appropriate card
  };

  const handleEmailSelect = (email: any) => {
    onStatusChange(`Selected email from: ${email.from}`);
    onClose(); // Close modal after selection
    // TODO: Implement email preview or compose reply
  };

  const handleDisconnect = (provider: keyof ConnectionState) => {
    setConnections(prev => ({ ...prev, [provider]: false }));
    onStatusChange(`${provider} disconnected`);
    
    // Clear related data
    if (provider !== 'email' && cloudFiles.provider === provider) {
      setCloudFiles({ files: [], loading: false, provider: '' });
      setShowFiles(false);
    }
    if (provider === 'email') {
      setEmailsState({ emails: [], loading: false });
      setShowEmails(false);
    }
  };

  const connectionButtons = [
    { key: 'google', icon: Cloud, label: t('connectDrive'), color: 'bg-blue-600 hover:bg-blue-700' },
    { key: 'onedrive', icon: HardDrive, label: t('connectOneDrive'), color: 'bg-blue-700 hover:bg-blue-800' },
    { key: 'dropbox', icon: Droplets, label: t('connectDropbox'), color: 'bg-blue-500 hover:bg-blue-600' },
    { key: 'email', icon: Mail, label: t('connectGmail'), color: 'bg-green-600 hover:bg-green-700' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accounts-title"
    >
      <div 
        className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        ref={setupFocusTrap}
      >
        {/* Header */}
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

        {/* Content */}
        <div className="p-6">
          {!showFiles && !showEmails && (
            <div className="space-y-6">
              {/* Connection Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Connect Your Accounts</h3>
                {connectionButtons.map(({ key, icon: Icon, label, color }) => {
                  const isConnected = connections[key as keyof ConnectionState];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        onClick={() => handleConnect(key as keyof ConnectionState)}
                        disabled={isConnected}
                        className={`flex-1 flex items-center justify-between gap-3 p-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                          isConnected
                            ? 'bg-gray-600 cursor-not-allowed'
                            : `${color} focus:ring-blue-500`
                        } text-white`}
                        aria-label={`${label} - ${isConnected ? t('connected') : 'Not connected'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <span className="font-medium">{label}</span>
                        </div>
                        {isConnected && (
                          <span className="text-sm bg-green-500 px-2 py-1 rounded">
                            {t('connected')}
                          </span>
                        )}
                      </button>
                      
                      {isConnected && (
                        <button
                          onClick={() => handleDisconnect(key as keyof ConnectionState)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Disconnect ${key}`}
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Browse Your Content</h3>
                <button
                  onClick={handleListFiles}
                  disabled={!Object.entries(connections).some(([key, connected]) => connected && key !== 'email')}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="List files from connected cloud storage"
                >
                  {t('listFiles')}
                </button>
                <button
                  onClick={handleListEmails}
                  disabled={!connections.email}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="List emails from connected email accounts"
                >
                  {t('listEmails')}
                </button>
              </div>
            </div>
          )}

          {/* Cloud Files List */}
          {showFiles && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  Files from {cloudFiles.provider}
                </h3>
                <button
                  onClick={() => setShowFiles(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back
                </button>
              </div>
              
              {cloudFiles.loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading files...</p>
                </div>
              ) : cloudFiles.files.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No files found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cloudFiles.files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`File: ${file.name}, Type: ${file.mimeType}`}
                    >
                      <div className="font-medium text-white">{file.name}</div>
                      <div className="text-sm text-gray-400">{file.mimeType}</div>
                      {file.size && (
                        <div className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Emails List */}
          {showEmails && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Recent Emails</h3>
                <button
                  onClick={() => setShowEmails(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back
                </button>
              </div>
              
              {emailsState.loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading emails...</p>
                </div>
              ) : emailsState.emails.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No emails found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {emailsState.emails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => handleEmailSelect(email)}
                      className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Email from ${email.from}, Subject: ${email.subject}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white">{email.from}</div>
                        {!email.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">{email.subject}</div>
                      <div className="text-xs text-gray-400 mt-1">{email.snippet.substring(0, 100)}...</div>
                      <div className="text-xs text-gray-500 mt-1">{email.date}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
