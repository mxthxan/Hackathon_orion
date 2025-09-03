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
      
      setEmailsState({ emails: [], loading: true });
      setShowEmails(true);
      
      const emails = await gmailService.getEmails(10);
      setEmailsState({ emails, loading: false });
      onStatusChange(`Found ${emails.length} unread emails`);
    } catch (error) {
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
      
      setCloudFiles({ files: [], loading: true, provider: connectedProviders[0] });
      setShowFiles(true);
      
      const provider = connectedProviders[0];
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
      setCl
