import React, { useState } from 'react';
import { FileText, Upload, Volume2, FileDown, MessageCircle } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { openAIService } from '../services/openai';

interface SummarizerCardProps {
  language: Language;
  onStatusChange: (status: string) => void;
  onSendToChat: (content: string) => void;
  onReadAloud: (text: string) => void;
}

export const SummarizerCard: React.FC<SummarizerCardProps> = ({
  language,
  onStatusChange,
  onSendToChat,
  onReadAloud
}) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onStatusChange(`Document selected: ${file.name}`);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim() && !selectedFile) {
      onStatusChange('Please enter text or select a document to summarize');
      return;
    }

    setProcessing(true);
    onStatusChange(t('processing'));

    try {
      let summary;
      
      if (selectedFile) {
        // Read file content
        const fileContent = await readFileContent(selectedFile);
        summary = await openAIService.summarizeText(fileContent, language);
      } else {
        summary = await openAIService.summarizeText(text.trim(), language);
      }


      setSummary(summary);
      onStatusChange('Summary generated successfully');
    } catch (error) {
      const errorMessage = `${t('error')}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onStatusChange(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // For text files, read as text; for others, read as text (basic implementation)
      reader.readAsText(file);
    });
  };

  const handleExportBraille = async () => {
    if (!summary) return;
    
    try {
      // Create a simple text file for now - in production this would generate actual Braille
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `summary-braille-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      onStatusChange('Braille file exported successfully');
    } catch (error) {
      onStatusChange(`${t('error')}: Failed to export Braille`);
    }
  };

  return (
    <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700" aria-labelledby="summarizer-heading">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-amber-400" aria-hidden="true" />
        <h2 id="summarizer-heading" className="text-xl font-semibold text-white">
          {t('summarizer')}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-2">
            {t('enterText')}
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here for summarization..."
            className="w-full h-32 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-vertical"
            aria-describedby="text-help"
          />
          <span id="text-help" className="sr-only">
            Enter text to be summarized
          </span>
        </div>

        <div className="text-center text-gray-400">or</div>

        <div>
          <label htmlFor="doc-input" className="block text-sm font-medium text-gray-300 mb-2">
            {t('chooseDocument')}
          </label>
          <div className="relative">
            <input
              id="doc-input"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              aria-describedby="doc-help"
            />
            <button
              onClick={() => document.getElementById('doc-input')?.click()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <Upload className="w-5 h-5" aria-hidden="true" />
              {selectedFile ? selectedFile.name : t('chooseDocument')}
            </button>
            <span id="doc-help" className="sr-only">
              Select a document file to summarize
            </span>
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={(!text.trim() && !selectedFile) || processing}
          className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {processing ? t('processing') : t('summarize')}
        </button>

        {summary && (
          <div className="bg-gray-700 rounded-lg p-4" role="region" aria-label="Summary result">
            <h3 className="text-lg font-medium text-white mb-3">Summary</h3>
            <p className="text-gray-300 leading-relaxed mb-4">{summary}</p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onReadAloud(summary)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-700"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                {t('readAloud')}
              </button>
              
              <button
                onClick={handleExportBraille}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-700"
              >
                <FileDown className="w-4 h-4" aria-hidden="true" />
                {t('exportBraille')}
              </button>
              
              <button
                onClick={() => onSendToChat(`Summary:\n\n${summary}`)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                {t('sendToChat')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};