import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '../types';
import { getLanguageCode } from '../utils/translations';

// Extend the Window interface to include Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseSpeechReturn {
  listening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  supported: boolean;
  error: string | null;
  wakeWordDetected: boolean;
}

export const useSpeech = (
  language: Language,
  onTranscript?: (transcript: string) => void,
  onStatusChange?: (status: string) => void,
  onWakeWordDetected?: () => void
): UseSpeechReturn => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const supported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const detectWakeWord = useCallback((text: string): boolean => {
    const normalizedText = text.toLowerCase().trim();
    const wakeWords = ['orion', 'hey orion', 'hi orion', 'hello orion'];
    
    return wakeWords.some(word => 
      normalizedText.includes(word) || 
      normalizedText.startsWith(word) ||
      normalizedText.endsWith(word)
    );
  }, []);

  const handleWakeWordDetection = useCallback(() => {
    setWakeWordDetected(true);
    onWakeWordDetected?.();
    onStatusChange?.('Wake word "Orion" detected! Listening for your command...');
    
    // Reset wake word detection after 10 seconds
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
    }
    
    wakeWordTimeoutRef.current = setTimeout(() => {
      setWakeWordDetected(false);
      onStatusChange?.('Wake word session ended');
    }, 10000);
  }, [onWakeWordDetected, onStatusChange]);

  const initializeRecognition = useCallback(() => {
    if (!supported) return null;

    // Get the Speech Recognition constructor
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return null;
    
    const recognition = new SpeechRecognitionConstructor();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(language);
    
    recognition.onstart = () => {
      setListening(true);
      setError(null);
      onStatusChange?.('Listening started');
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Check for wake word in both final and interim results
      const fullTranscript = finalTranscript + interimTranscript;
      if (detectWakeWord(fullTranscript) && !wakeWordDetected) {
        handleWakeWordDetection();
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
        onTranscript?.(finalTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setListening(false);
      onStatusChange?.(`Error: ${event.error}`);
    };
    
    recognition.onend = () => {
      setListening(false);
      onStatusChange?.('Listening stopped');
    };
    
    return recognition;
  }, [language, onTranscript, onStatusChange, supported, detectWakeWord, wakeWordDetected, handleWakeWordDetection]);

  const startListening = useCallback(() => {
    if (!supported) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    recognitionRef.current = initializeRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start speech recognition');
        onStatusChange?.('Failed to start listening');
      }
    }
  }, [initializeRecognition, supported, onStatusChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
    setWakeWordDetected(false);
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
      wakeWordTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
    };
  }, []);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current && listening) {
      stopListening();
      // Restart with new language
      setTimeout(startListening, 100);
    }
  }, [language, listening, startListening, stopListening]);

  return {
    listening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    supported,
    error,
    wakeWordDetected
  };
};