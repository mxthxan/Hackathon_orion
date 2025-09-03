import type { Language } from '../types';

export class WakeWordDetector {
  private isListening = false;
  private recognition: SpeechRecognition | null = null;
  private onWakeWordCallback?: () => void;
  private onStatusCallback?: (status: string) => void;
  private language: Language = 'en';
  private confidenceThreshold = 0.7;

  constructor() {
    this.setupRecognition();
  }

  private setupRecognition() {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Start with English for wake word detection
    
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence;

        // Check for wake word with confidence threshold
        if (this.detectWakeWord(transcript) && confidence >= this.confidenceThreshold) {
          this.onWakeWordCallback?.();
          this.onStatusCallback?.(`Wake word detected with ${Math.round(confidence * 100)}% confidence`);
          
          // Brief pause before switching to command mode
          setTimeout(() => {
            this.switchToCommandMode();
          }, 500);
          break;
        }
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        this.onStatusCallback?.(`Wake word detection error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      // Automatically restart wake word detection if it stops
      if (this.isListening) {
        setTimeout(() => {
          this.startListening();
        }, 1000);
      }
    };
  }

  private detectWakeWord(transcript: string): boolean {
    const wakeWords = [
      'orion',
      'hey orion',
      'hi orion', 
      'hello orion',
      'ok orion',
      'orion help',
      'orion assistant'
    ];

    // Normalize transcript for better matching
    const normalized = transcript
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return wakeWords.some(word => {
      // Exact match
      if (normalized === word) return true;
      
      // Starts with wake word
      if (normalized.startsWith(word + ' ')) return true;
      
      // Contains wake word with word boundaries
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(normalized);
    });
  }

  private switchToCommandMode() {
    // Stop wake word detection temporarily
    this.stopListening();
    
    // Update recognition for command listening in user's preferred language
    if (this.recognition) {
      this.recognition.lang = this.getLanguageCode(this.language);
      this.onStatusCallback?.('Ready for your command...');
    }
  }

  private getLanguageCode(language: Language): string {
    const languageCodes = {
      en: 'en-US',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      bn: 'bn-IN'
    };
    
    return languageCodes[language];
  }

  startListening() {
    if (!this.recognition || this.isListening) return;
    
    this.isListening = true;
    try {
      this.recognition.start();
      this.onStatusCallback?.('Wake word detection active - say "Orion" to activate');
    } catch (error) {
      this.onStatusCallback?.('Failed to start wake word detection');
      this.isListening = false;
    }
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return;
    
    this.isListening = false;
    this.recognition.stop();
    this.onStatusCallback?.('Wake word detection stopped');
  }

  setLanguage(language: Language) {
    this.language = language;
    if (this.recognition && !this.isListening) {
      this.recognition.lang = this.getLanguageCode(language);
    }
  }

  setCallbacks(onWakeWord: () => void, onStatus: (status: string) => void) {
    this.onWakeWordCallback = onWakeWord;
    this.onStatusCallback = onStatus;
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const wakeWordDetector = new WakeWordDetector();