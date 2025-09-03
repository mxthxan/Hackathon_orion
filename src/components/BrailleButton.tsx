import React, { useState } from 'react';
import { FileDown, Eye } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { brailleService } from '../services/braille';
import { BraillePreviewModal } from './BraillePreviewModal';

interface BrailleButtonProps {
  text: string;
  language: Language;
  onStatusChange?: (status: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const BrailleButton: React.FC<BrailleButtonProps> = ({
  text,
  language,
  onStatusChange,
  className = '',
  variant = 'primary'
}) => {
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [brailleData, setBrailleData] = useState<any>(null);
  
  const t = (key: string) => getTranslation(language, key);

  const handleExport = async () => {
    if (!text.trim()) {
      onStatusChange?.('No text available to export');
      return;
    }

    setExporting(true);
    onStatusChange?.('Generating Braille export...');

    try {
      const result = await brailleService.exportBraille(text, language);
      setBrailleData(result);
      setShowPreview(true);
      onStatusChange?.('Braille export generated successfully');
    } catch (error) {
      const errorMessage = `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onStatusChange?.(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleDirectDownload = async () => {
    if (!text.trim()) {
      onStatusChange?.('No text available to export');
      return;
    }

    setExporting(true);
    onStatusChange?.('Generating Braille file...');

    try {
      const result = await brailleService.exportBraille(text, language);
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.fileUrl;
      link.download = `braille-export-${Date.now()}.brf`;
      link.click();
      
      onStatusChange?.('Braille file downloaded successfully');
    } catch (error) {
      const errorMessage = `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onStatusChange?.(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white focus:ring-purple-500",
    secondary: "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white focus:ring-gray-500"
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={exporting || !text.trim()}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          aria-label={`${t('exportBraille')} - Preview before download`}
          title={t('exportBraille')}
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
          {exporting ? 'Generating...' : t('exportBraille')}
        </button>
        
        <button
          onClick={handleDirectDownload}
          disabled={exporting || !text.trim()}
          className={`${baseClasses} ${variantClasses.secondary} ${className}`}
          aria-label={`${t('downloadBraille')} - Direct download`}
          title={t('downloadBraille')}
        >
          <FileDown className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {showPreview && brailleData && (
        <BraillePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          brailleData={brailleData}
          language={language}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
};