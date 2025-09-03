import React, { useState } from 'react';
import { Eye, Upload, Volume2, FileDown, MessageCircle } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { openAIService } from '../services/openai';

interface VisualUnderstandingCardProps {
  language: Language;
  onStatusChange: (status: string) => void;
  onSendToChat: (content: string) => void;
  onReadAloud: (text: string) => void;
}

export const VisualUnderstandingCard: React.FC<VisualUnderstandingCardProps> = ({
  language,
  onStatusChange,
  onSendToChat,
  onReadAloud
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onStatusChange(`File selected: ${file.name}`);
    }
  };

  const handleDescribe = async () => {
    if (!selectedFile) {
      onStatusChange(t('noFileSelected'));
      return;
    }

    setProcessing(true);
    onStatusChange(t('processing'));

    try {



      const description = await openAIService.describeImage(selectedFile, language);
      setDescription(description);
      onStatusChange('File description generated successfully');
    } catch (error) {
      const errorMessage = `${t('error')}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onStatusChange(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleExportBraille = async () => {
    if (!description) return;
    
    try {
      // Create a simple text file for now - in production this would generate actual Braille
      const blob = new Blob([description], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `description-braille-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      onStatusChange('Braille file exported successfully');
    } catch (error) {
      onStatusChange(`${t('error')}: Failed to export Braille`);
    }
  };

  return (
    <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700" aria-labelledby="visual-heading">
      <div className="flex items-center gap-3 mb-6">
        <Eye className="w-6 h-6 text-blue-400" aria-hidden="true" />
        <h2 id="visual-heading" className="text-xl font-semibold text-white">
          {t('visualUnderstanding')}
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-300 mb-2">
            {t('chooseFile')}
          </label>
          <div className="relative">
            <input
              id="file-input"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              aria-describedby="file-help"
            />
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-describedby="file-help"
            >
              <Upload className="w-5 h-5" aria-hidden="true" />
              {selectedFile ? selectedFile.name : t('chooseFile')}
            </button>
            <span id="file-help" className="sr-only">
              Select an image or PDF file to analyze
            </span>
          </div>
        </div>

        <button
          onClick={handleDescribe}
          disabled={!selectedFile || processing}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          aria-describedby="describe-help"
        >
          {processing ? t('processing') : t('describeFile')}
        </button>
        <span id="describe-help" className="sr-only">
          Generate description of the uploaded file
        </span>

        {description && (
          <div className="bg-gray-700 rounded-lg p-4" role="region" aria-label="File description result">
            <h3 className="text-lg font-medium text-white mb-3">Description</h3>
            <p className="text-gray-300 leading-relaxed mb-4">{description}</p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onReadAloud(description)}
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
                onClick={() => onSendToChat(description)}
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