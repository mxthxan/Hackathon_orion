import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '../types';
import { getLanguageCode } from '../utils/translations';

interface UseTTSReturn {
  speaking: boolean;
  speak: (text: string, language?: Language) => void;
  stop: () => void;
  supported: boolean;
  error: string | null;
}

export const useTTS = (
  defaultLanguage: Language,
  onStatusChange?: (status: string) => void
): UseTTSReturn => {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (supported) {
      synthRef.current = window.speechSynthesis;
    }
  }, [supported]);

  const findBestVoice = useCallback((language: Language): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    
    const voices = synthRef.current.getVoices();
    const languageCode = getLanguageCode(language);
    const shortLang = language;
    
    // Try to find exact match first
    let voice = voices.find(v => v.lang === languageCode);
    
    // Fallback to language prefix match
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(shortLang));
    }
    
    // Fallback to any voice for the language family
    if (!voice) {
      voice = voices.find(v => v.lang.includes(shortLang));
    }
    
    // Final fallback to default voice
    if (!voice) {
      voice = voices.find(v => v.default) || voices[0];
    }
    
    return voice || null;
  }, []);

  const speak = useCallback((text: string, language: Language = defaultLanguage) => {
    if (!supported || !synthRef.current) {
      setError('Text-to-speech not supported in this browser');
      return;
    }

    // Stop any current speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findBestVoice(language);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.9;
    utterance.volume = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setSpeaking(true);
      setError(null);
      onStatusChange?.('Speaking started');
    };
    
    utterance.onend = () => {
      setSpeaking(false);
      onStatusChange?.('Speaking ended');
    };
    
    utterance.onerror = (event) => {
      setSpeaking(false);
      setError(`Speech synthesis error: ${event.error}`);
      onStatusChange?.(`TTS Error: ${event.error}`);
    };
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [defaultLanguage, findBestVoice, onStatusChange, supported]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
      onStatusChange?.('Speech stopped');
    }
  }, [onStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    speaking,
    speak,
    stop,
    supported,
    error
  };
};