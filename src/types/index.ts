// Core types for your voice assistant
export interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdDate?: string;
  modifiedDate?: string;
  url?: string;
  isFolder?: boolean;
  thumbnailUrl?: string;
  parentId?: string;
}

export interface Email {
  id: string;
  from: string;
  to?: string[];
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  isRead?: boolean;
  isStarred?: boolean;
  priority?: 'high' | 'normal' | 'low';
  labels?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface NewsHeadline {
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url?: string;
  category?: string;
}

export interface DailyBrief {
  greeting: string;
  summary: string;
  priorities: string[];
  weather: string;
  news: string;
  calendarEvents?: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

export interface VoiceCommand {
  command: string;
  intent: string;
  entities?: Record<string, string>;
  confidence: number;
}

export interface VoiceResponse {
  text: string;
  shouldSpeak: boolean;
  data?: any;
  followUp?: string;
}

export interface WakeWordConfig {
  sensitivity: number;
  useLocalProcessing: boolean;
  webSocketUrl?: string;
  wakeWords: string[];
  enableVAD: boolean;
  bufferDuration: number;
}
