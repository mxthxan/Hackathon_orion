import React, { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { gmailService } from '../services/gmail';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onStatusChange: (status: string) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  language,
  onStatusChange,
  initialTo = '',
  initialSubject = '',
  initialBody = ''
}) => {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      onStatusChange('Please fill in all fields');
      return;
    }

    if (!gmailService.isAuthenticated()) {
      onStatusChange('Please connect your email account first');
      return;
    }

    setSending(true);
    onStatusChange('Sending email...');

    try {
      const success = await gmailService.sendEmail(to.trim(), subject.trim(), body.trim());
      
      if (success) {
        onStatusChange('Email sent successfully');
        onClose();
        // Reset form
        setTo('');
        setSubject('');
        setBody('');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      const errorMessage = `${t('error')}: ${error instanceof Error ? error.message : 'Failed to send email'}`;
      onStatusChange(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
    if (event.ctrlKey && event.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-title"
      onKeyDown={handleKeyPress}
    >
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-400" aria-hidden="true" />
            <h2 id="email-title" className="text-xl font-bold text-white">
              Compose Email
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close email composer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="email-to" className="block text-sm font-medium text-gray-300 mb-2">
              To
            </label>
            <input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
              required
            />
          </div>

          <div>
            <label htmlFor="email-subject" className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
              required
            />
          </div>

          <div>
            <label htmlFor="email-body" className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={sending}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSend}
              disabled={sending || !to.trim() || !subject.trim() || !body.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            
            <button
              onClick={onClose}
              disabled={sending}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Cancel
            </button>
          </div>

          <div className="text-sm text-gray-400 text-center">
            Press Ctrl+Enter to send • Escape to close
          </div>
        </div>
      </div>
    </div>
  );
};