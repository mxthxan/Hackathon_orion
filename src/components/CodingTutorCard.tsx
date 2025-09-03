import React, { useState } from 'react';
import { Code, MessageCircle } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { openAIService } from '../services/openai';

interface CodingTutorCardProps {
  language: Language;
  onStatusChange: (status: string) => void;
  onAddToChat: (content: string) => void;
}

export const CodingTutorCard: React.FC<CodingTutorCardProps> = ({
  language,
  onStatusChange,
  onAddToChat
}) => {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      onStatusChange('Please enter some code to analyze');
      return;
    }

    setProcessing(true);
    onStatusChange(t('processing'));

    try {


      const explanation = await openAIService.analyzeCode(code.trim(), language);
      setAnalysis(explanation);
      onStatusChange('Code analysis completed');
    } catch (error) {
      const errorMessage = `${t('error')}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onStatusChange(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700" aria-labelledby="coding-heading">
      <div className="flex items-center gap-3 mb-6">
        <Code className="w-6 h-6 text-green-400" aria-hidden="true" />
        <h2 id="coding-heading" className="text-xl font-semibold text-white">
          {t('codingTutor')}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="code-input" className="block text-sm font-medium text-gray-300 mb-2">
            {t('enterCode')}
          </label>
          <textarea
            id="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="def fibonacci(n):&#10;    if n <= 1:&#10;        return n&#10;    return fibonacci(n-1) + fibonacci(n-2)"
            className="w-full h-32 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm resize-vertical"
            aria-describedby="code-help"
          />
          <span id="code-help" className="sr-only">
            Enter Python code for analysis and feedback
          </span>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={processing || !code.trim()}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {processing ? t('processing') : t('analyzeCode')}
        </button>

        {analysis && (
          <div className="bg-gray-700 rounded-lg p-4" role="region" aria-label="Code analysis result">
            <h3 className="text-lg font-medium text-white mb-3">Analysis</h3>
            <div className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
              {analysis}
            </div>
            
            <button
              onClick={() => onAddToChat(`Code Analysis:\n\nCode:\n${code}\n\nAnalysis:\n${analysis}`)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {t('addToChat')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};