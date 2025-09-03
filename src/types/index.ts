export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language: Language;
}

export interface GlobalState {
  selectedLanguage: Language;
  ttsEnabled: boolean;
  chatMessages: ChatMessage[];
  listening: boolean;
  statusMessage: string;
}

export interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VisionResponse {
  description: string;
}

export interface TutorResponse {
  explanation: string;
  suggestions: string[];
}

export interface SummaryResponse {
  summary: string;
}

export interface BrailleResponse {
  fileUrl: string;
}