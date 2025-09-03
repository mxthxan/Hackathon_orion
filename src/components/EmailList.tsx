import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Reply, Forward, Trash2 } from 'lucide-react';
import type { Language, Email } from '../types';
import { getTranslation } from '../utils/translations';
import { gmailService } from '../services/gmail';

interface EmailListProps {
  language: Language;
  onStatusChange: (status: string) => void;
  onComposeReply: (to: string, subject: string) => void;
  onReadAloud: (text: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  language,
  onStatusChange,
  onComposeReply,
  onReadAloud
}) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  const t = (key: string) => getTranslation(language, key);

  const fetchEmails = async () => {
    if (!gmailService.isAuthenticated()) {
      onStatusChange('Please connect your email account first');
      return;
    }

    setLoading(true);
    onStatusChange('Fetching emails...');

    try {
      const fetchedEmails = await gmailService.getEmails(20);
      setEmails(fetchedEmails);
      onStatusChange(`Loaded ${fetchedEmails.length} emails`);
    } catch (error) {
      const errorMessage = `${t('error')}: ${error instanceof Error ? error.message : 'Failed to fetch emails'}`;
      onStatusChange(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gmailService.isAuthenticated()) {
      fetchEmails();
    }
  }, []);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    onStatusChange(`Selected email from ${email.from}`);
  };

  const handleReply = (email: Email) => {
    const replySubject = email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`;
    onComposeReply(email.from, replySubject);
  };

  const handleReadEmail = (email: Email) => {
    const emailText = `Email from ${email.from}. Subject: ${email.subject}. Content: ${email.snippet}`;
    onReadAloud(emailText);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-green-400" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-white">Recent Emails</h3>
        </div>
        <button
          onClick={fetchEmails}
          disabled={loading || !gmailService.isAuthenticated()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Refresh email list"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {!gmailService.isAuthenticated() && (
        <div className="text-center py-8 text-gray-400">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Connect your email account to view messages</p>
        </div>
      )}

      {gmailService.isAuthenticated() && emails.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No unread emails found</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Loading emails...</p>
        </div>
      )}

      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedEmail?.id === email.id
                ? 'bg-blue-900 border-blue-500'
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
            onClick={() => handleEmailSelect(email)}
            role="button"
            tabIndex={0}
            aria-label={`Email from ${email.from}, subject: ${email.subject}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEmailSelect(email);
              }
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{email.from}</div>
                <div className="text-sm text-gray-300 truncate">{email.subject}</div>
              </div>
              <div className="text-xs text-gray-400 ml-4 flex-shrink-0">{email.date}</div>
            </div>
            
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{email.snippet}</p>
            
            {selectedEmail?.id === email.id && (
              <div className="flex gap-2 pt-3 border-t border-gray-600">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadEmail(email);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Read email aloud"
                >
                  <Mail className="w-3 h-3" />
                  Read
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReply(email);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Reply to email"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};