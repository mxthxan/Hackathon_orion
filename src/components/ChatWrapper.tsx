import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Mic, MicOff, Volume2, FileDown } from 'lucide-react';
import type { Language, ChatMessage } from '../types';
import { getTranslation } from '../utils/translations';
import { useSpeech } from '../hooks/useSpeech';
import { BrailleButton } from './BrailleButton';

interface ChatWrapperProps {
  language: Language;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onStatusChange: (status: string) => void;
  onReadAloud: (text: string) => void;
  listening: boolean;
  onListeningChange: (listening: boolean) => void;
}

export const ChatWrapper: React.FC<ChatWrapperProps> = ({
  language,
  messages,
  onSendMessage,
  onStatusChange,
  onReadAloud,
  listening,
  onListeningChange
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const t = (key: string) => getTranslation(language, key);

  const { 
    startListening, 
    stopListening, 
    resetTranscript, 
    transcript, 
    supported: speechSupported,
    wakeWordDetected 
  } = useSpeech(
    language,
    (transcript) => {
      if (transcript.trim()) {
        setInputMessage(transcript);
        onSendMessage(transcript);
        resetTranscript();
      }
    },
    onStatusChange,
    () => {
      // Wake word detected - automatically start listening for command
      if (!listening) {
        startListening();
      }
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update listening state
  useEffect(() => {
    onListeningChange(listening);
  }, [listening, onListeningChange]);

  const handleSend = () => {
    const message = inputMessage.trim();
    if (message) {
      onSendMessage(message);
      setInputMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
      onListeningChange(false);
    } else {
      startListening();
      onListeningChange(true);
    }
  };

  const handleExportBraille = async (text: string) => {
    // This is now handled by BrailleButton component
    onStatusChange('Use the Braille export button to generate Braille files');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <section className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full" aria-labelledby="chat-heading">
      <div className="flex items-center gap-3 p-6 border-b border-gray-700">
        <MessageCircle className="w-6 h-6 text-blue-400" aria-hidden="true" />
        <h2 id="chat-heading" className="text-xl font-semibold text-white">
          {t('chat')}
        </h2>
      </div>

      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[400px]" 
        role="log" 
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation by typing or using voice input</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
              role={message.role === 'user' ? 'article' : 'article'}
              aria-label={`${message.role === 'user' ? 'Your message' : 'Assistant message'} at ${formatTimestamp(message.timestamp)}`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-2 flex items-center justify-between ${
                message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
              }`}>
                <span>{formatTimestamp(message.timestamp)}</span>
                {message.role === 'assistant' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReadAloud(message.content)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Read this message aloud"
                      title={t('readAloud')}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="scale-75 origin-left">
                      <BrailleButton
                        text={message.content}
                        language={language}
                        onStatusChange={onStatusChange}
                        variant="secondary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="message-input" className="sr-only">
              {t('typeMessage')}
            </label>
            <input
              ref={inputRef}
              id="message-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              className={`w-full px-4 py-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                wakeWordDetected 
                  ? 'border-green-400 ring-2 ring-green-400 ring-opacity-50' 
                  : 'border-gray-600'
              }`}
              disabled={listening}
              aria-describedby="message-help"
            />
            <span id="message-help" className="sr-only">
              {wakeWordDetected 
                ? 'Wake word detected! Speak your command or type your message' 
                : 'Type your message and press Enter to send, or use the voice button'
              }
            </span>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || listening}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label={t('send')}
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
          
          {speechSupported && (
            <button
              onClick={toggleListening}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 relative ${
                listening
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse'
                  : wakeWordDetected
                    ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500 ring-2 ring-green-400'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } text-white`}
              aria-label={listening ? 'Stop voice input' : t('microphone')}
              aria-describedby="mic-help"
            >
              {listening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
              {wakeWordDetected && !listening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
              )}
            </button>
          )}
        </div>
        <span id="mic-help" className="sr-only">
          {listening 
            ? t('listening') 
            : wakeWordDetected 
              ? 'Wake word detected! Click to start speaking your command'
              : 'Click to start voice input or say "Orion" to activate'
          }
        </span>
      </div>
    </section>
  );
};