import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n';

export const GenerateButton: React.FC = () => {
  const { generation, generateComponent, isRefiningRequirements } = useStore();
  const { t } = useTranslation();

  // Check if processing (includes requirements refinement and code generation)
  const isProcessing = generation.isGenerating || isRefiningRequirements;

  return (
    <button
      onClick={generateComponent}
      disabled={isProcessing}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg overflow-hidden transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>{isRefiningRequirements ? t.progress.analyzing : t.common.generating}</span>
        </>
      ) : (
        <>
          <Zap size={18} />
          <span>{t.common.generate}</span>
          <span className="text-xs opacity-70 ml-1">
            (⌘/Ctrl + Enter)
          </span>
        </>
      )}
    </button>
  );
};