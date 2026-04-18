
import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export const GenerateButton: React.FC = () => {
  const { generation, generateComponent } = useStore();

  return (
    <button
      onClick={generateComponent}
      disabled={generation.isGenerating}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg overflow-hidden transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {generation.isGenerating ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>生成中...</span>
        </>
      ) : (
        <>
          <Zap size={18} />
          <span>生成组件</span>
          <span className="text-xs opacity-70 ml-1">
            (⌘/Ctrl + Enter)
          </span>
        </>
      )}
    </button>
  );
};
