import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, HelpCircle } from 'lucide-react';
import type { Language, ChatMessage, GlobalState } from './types';
import { getTranslation } from './utils/translations';
import { useTTS } from './hooks/useTTS';
import { useWakeWord } from './hooks/useWakeWord';
import { openAIService } from './services/openai';
import { Header } from './components/Header';
import { SkipLink } from './components/SkipLink';
import { VisualUnderstandingCard } from './components/VisualUnderstandingCard';
import { CodingTutorCard } from './components/CodingTutorCard';
import { SummarizerCard } from './components/SummarizerCard';
import { ChatWrapper } from './components/ChatWrapper';
import { DailyBriefModal } from './components/DailyBriefModal';
import { AccountsModal } from './components/AccountsModal';
import { StatusAnnouncer } from './components/StatusAnnouncer';

function App() {
  const [globalState, setGlobalState] = useState<GlobalState>({
    selectedLanguage: 'en',
    ttsEnabled: true,
    chatMessages: [],
    listening: false,
    statusMessage: ''
  });

  const [dailyBriefOpen, setDailyBriefOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

  const { speak, speaking } = useTTS(
    globalState.selectedLanguage,
    (status) => updateStatus(status)
  );

  const { 
    isActive: wakeWordActive, 
    isDetected: wakeWordDetected,
    startWakeWorker, 
    stopWakeWorker,
    setLanguage: setWakeWordLanguage
  } = useWakeWord(
    () => {
      updateStatus('Wake word "Orion" detected! Ready for your command...');
      setGlobalState(prev => ({ ...prev, listening: true }));
    },
    updateStatus
  );
  const t = (key: string) => getTranslation(globalState.selectedLanguage, key);

  const updateStatus = useCallback((message: string) => {
    setGlobalState(prev => ({ ...prev, statusMessage: message }));
  }, []);

  // Initialize wake word detection
  useEffect(() => {
    // TODO: Auto-start wake word detection based on user preference
    console.log('TODO: Load wake word preference from user settings');
    console.log('TODO: Start wake word detection if enabled by user');
    
    if (wakeWordEnabled) {
      startWakeWorker();
    }

    return () => {
      stopWakeWorker();
    };
  }, [wakeWordEnabled, startWakeWorker, stopWakeWorker]);

  const handleLanguageChange = useCallback((language: Language) => {
    setGlobalState(prev => ({ ...prev, selectedLanguage: language }));
    setWakeWordLanguage(language);
    updateStatus(`Language changed to ${getTranslation(language, `languages.${language}`)}`);
  }, [updateStatus]);

  const handleTTSToggle = useCallback(() => {
    setGlobalState(prev => ({ ...prev, ttsEnabled: !prev.ttsEnabled }));
    updateStatus(`Auto TTS ${globalState.ttsEnabled ? 'disabled' : 'enabled'}`);
  }, [globalState.ttsEnabled, updateStatus]);

  const handleWakeWordToggle = useCallback(() => {
    const newState = !wakeWordEnabled;
    setWakeWordEnabled(newState);
    
    if (newState) {
      startWakeWorker();
      updateStatus('Wake word detection enabled');
    } else {
      stopWakeWorker();
      updateStatus('Wake word detection disabled');
    }
  }, [wakeWordEnabled, startWakeWorker, stopWakeWorker, updateStatus]);
  const handleListeningChange = useCallback((listening: boolean) => {
    setGlobalState(prev => ({ ...prev, listening }));
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
      language: globalState.selectedLanguage
    };

    setGlobalState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage]
    }));

    updateStatus('Message sent, waiting for response...');

    try {


      const reply = await openAIService.chat(
        [...globalState.chatMessages, userMessage], 
        globalState.selectedLanguage
      );
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        language: globalState.selectedLanguage
      };

      setGlobalState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, assistantMessage]
      }));

      updateStatus('Response received');

      // Auto-read assistant responses if TTS is enabled
      if (globalState.ttsEnabled) {
        speak(reply, globalState.selectedLanguage);
      }
    } catch (error) {
      const errorMessage = `${t('error')}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      updateStatus(errorMessage);
      
      // Provide fallback response when API fails
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m currently unable to process your request. Please check your internet connection and API configuration, then try again.',
        timestamp: Date.now(),
        language: globalState.selectedLanguage
      };
      
      setGlobalState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, fallbackMessage]
      }));
    }
  }, [globalState.selectedLanguage, globalState.chatMessages, globalState.ttsEnabled, speak, t, updateStatus]);

  const handleReadAloud = useCallback((text: string) => {
    speak(text, globalState.selectedLanguage);
  }, [speak, globalState.selectedLanguage]);

  const handleSendToChat = useCallback((content: string) => {
    handleSendMessage(content);
  }, [handleSendMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        setGlobalState(prev => ({ ...prev, listening: !prev.listening }));
        updateStatus('Voice input shortcut triggered');
      }
      
      if (event.key === 'Escape') {
        setDailyBriefOpen(false);
        setAccountsOpen(false);
      }
      
      if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        handleWakeWordToggle();
        updateStatus('Wake word detection toggled');
      }
      
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        updateStatus(t('helpShortcuts'));
      }
      
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setDailyBriefOpen(true);
      }
      
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        setAccountsOpen(true);
      }
      
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        setGlobalState(prev => ({ ...prev, listening: true }));
        updateStatus('Manual voice input activated');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <SkipLink language={globalState.selectedLanguage} />
      
      <Header
        selectedLanguage={globalState.selectedLanguage}
        onLanguageChange={handleLanguageChange}
        ttsEnabled={globalState.ttsEnabled}
        onTTSToggle={handleTTSToggle}
        onAccountsOpen={() => setAccountsOpen(true)}
      />

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <VisualUnderstandingCard
              language={globalState.selectedLanguage}
              onStatusChange={updateStatus}
              onSendToChat={handleSendToChat}
              onReadAloud={handleReadAloud}
            />
            
            <div className="grid gap-8 md:grid-cols-2">
              <CodingTutorCard
                language={globalState.selectedLanguage}
                onStatusChange={updateStatus}
                onAddToChat={handleSendToChat}
              />
              
              <SummarizerCard
                language={globalState.selectedLanguage}
                onStatusChange={updateStatus}
                onSendToChat={handleSendToChat}
                onReadAloud={handleReadAloud}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <ChatWrapper
              language={globalState.selectedLanguage}
              messages={globalState.chatMessages}
              onSendMessage={handleSendMessage}
              onStatusChange={updateStatus}
              onReadAloud={handleReadAloud}
              listening={globalState.listening}
              onListeningChange={handleListeningChange}
            />
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-700 p-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-gray-400 text-sm leading-relaxed">
            {t('keyboardHelp')} • Ctrl+O: Wake Word • Ctrl+D: Daily Brief • Ctrl+A: Accounts
            {wakeWordActive && (
              <span className="text-green-400 ml-2">
                • {t('wakeWordActive')}
                {wakeWordDetected && ' (Detected!)'}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setDailyBriefOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Open daily brief"
          >
            <Calendar className="w-5 h-5" aria-hidden="true" />
            {t('dailyBrief')}
          </button>
        </div>
      </footer>

      <DailyBriefModal
        isOpen={dailyBriefOpen}
        onClose={() => setDailyBriefOpen(false)}
        language={globalState.selectedLanguage}
        onStatusChange={updateStatus}
      />

      <AccountsModal
        isOpen={accountsOpen}
        onClose={() => setAccountsOpen(false)}
        language={globalState.selectedLanguage}
        onStatusChange={updateStatus}
      />

      <StatusAnnouncer message={globalState.statusMessage} />
    </div>
  );
}

export default App;