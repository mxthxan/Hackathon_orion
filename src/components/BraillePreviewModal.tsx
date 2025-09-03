import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface BraillePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  brailleData: {
    fileUrl: string;
    preview: string;
    metadata: {
      pages: number;
      characters: number;
      format: string;
    };
  };
  language: Language;
  onStatusChange?: (status: string) => void;
}

export const BraillePreviewModal: React.FC<BraillePreviewModalProps> = ({
  isOpen,
  onClose,
  brailleData,
  language,
  onStatusChange
}) => {
  const t = (key: string) => getTranslation(language, key);

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = brailleData.fileUrl;
      link.download = `braille-export-${Date.now()}.${brailleData.metadata.format}`;
      link.click();
      
      onStatusChange?.('Braille file downloaded successfully');
      onClose();
    } catch (error) {
      onStatusChange?.('Failed to download Braille file');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
    if (event.ctrlKey && event.key === 'd') {
      event.preventDefault();
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="braille-preview-title"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" aria-hidden="true" />
            <h2 id="braille-preview-title" className="text-xl font-bold text-white">
              {t('braillePreview')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Metadata */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Document Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Pages:</span>
                <span className="text-white ml-2">{brailleData.metadata.pages}</span>
              </div>
              <div>
                <span className="text-gray-400">Characters:</span>
                <span className="text-white ml-2">{brailleData.metadata.characters.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Format:</span>
                <span className="text-white ml-2 uppercase">{brailleData.metadata.format}</span>
              </div>
              <div>
                <span className="text-gray-400">Language:</span>
                <span className="text-white ml-2">{t(`languages.${language}`)}</span>
              </div>
            </div>
          </div>

          {/* Braille Preview */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Braille Preview</h3>
            <div 
              className="bg-black text-white font-mono text-lg leading-relaxed p-4 rounded border-2 border-gray-600 max-h-64 overflow-y-auto"
              role="textbox"
              aria-readonly="true"
              aria-label="Braille text preview"
              tabIndex={0}
            >
              {brailleData.preview}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Preview shows first 200 characters. Full document will be available in download.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              {t('downloadBraille')}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {t('close')}
            </button>
          </div>

          <div className="text-sm text-gray-400 text-center mt-4">
            Press Ctrl+D to download • Escape to close
          </div>
        </div>
      </div>
    </div>
  );
};