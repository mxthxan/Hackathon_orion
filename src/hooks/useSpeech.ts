import { useState, useCallback, useRef } from 'react';
import type { Language } from '../types';

interface UseSpeechReturn {
  isSpeaking: boolean;
  speak: (text: string, options?: SpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  getAvailableVoices: () => SpeechSynthesisVoice[];
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: Language;
  voice?: SpeechSynthesisVoice;
}

export const useSpeech = (
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): UseSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRateState] = useState(1.0);
  const [pitch, setPitchState] = useState(1.0);
  const [volume, setVolumeState] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      utterance.rate = options.rate ?? rate;
      utterance.pitch = options.pitch ?? pitch;
      utterance.volume = options.volume ?? volume;
      utterance.lang = options.lang ?? 'en-US';

      if (options.voice || selectedVoice) {
        utterance.voice = options.voice || selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        onError?.(event.error || 'Speech synthesis error');
      };

      speechSynthesis.speak(utterance);
    } else {
      onError?.('Speech synthesis not supported in this browser');
    }
  }, [rate, pitch, volume, selectedVoice, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  const getAvailableVoices = useCallback((): SpeechSynthesisVoice[] => {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }, []);

  const setRate = useCallback((newRate: number) => {
    setRateState(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    setPitchState(Math.max(0, Math.min(2, newPitch)));
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    setVoice,
    getAvailableVoices,
    setRate,
    setPitch,
    setVolume,
  };
};

// Optional: Export as default if needed
export default useSpeech;
