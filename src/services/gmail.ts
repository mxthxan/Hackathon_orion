import type { Email } from '../types';

interface GmailMessage {
  id: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
  };
  internalDate: string;
}

interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
}

class GmailService {
  private clientId: string;
  private apiKey: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
    this.apiKey = import.meta.env.VITE_GMAIL_API_KEY;
    
    if (!this.clientId || !this.apiKey) {
      console.warn('Gmail API credentials not found. Please add VITE_GMAIL_CLIENT_ID and VITE_GMAIL_API_KEY to your .env file');
    }
  }

  async authenticate(): Promise<boolean> {
    if (!this.clientId) {
      throw new Error('Gmail client ID not configured');
    }

    try {
      // Load Google API
      await this.loadGoogleAPI();
      
      // Initialize the API
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: this.clientId,
            scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      });

      // Sign in
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      this.accessToken = user.getAuthResponse().access_token;
      
      return true;
    } catch (error) {
      console.error('Gmail authentication error:', error);
      return false;
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async getEmails(maxResults: number = 10): Promise<Email[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      // Get list of message IDs
      const listResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Gmail API error: ${listResponse.status}`);
      }

      const listData: GmailListResponse = await listResponse.json();
      
      if (!listData.messages || listData.messages.length === 0) {
        return [];
      }

      // Get detailed information for each message
      const emailPromises = listData.messages.map(async (message) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!detailResponse.ok) {
          throw new Error(`Gmail API error: ${detailResponse.status}`);
        }

        const detail: GmailMessage = await detailResponse.json();
        
        const getHeader = (name: string) => 
          detail.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        return {
          id: detail.id,
          from: getHeader('From'),
          subject: getHeader('Subject'),
          snippet: detail.snippet,
          date: new Date(parseInt(detail.internalDate)).toLocaleDateString()
        };
      });

      return await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: encodedEmail
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const gmailService = new GmailService();

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}