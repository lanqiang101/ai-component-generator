
import React from 'react';
import { useStore } from '../store/useStore';
import { Loader2, AlertCircle } from 'lucide-react';

export const GenerationProgress: React.FC = () => {
  const { generation } = useStore();

  if (generation.isGenerating) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              AI 正在生成组件代码...
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              请稍候，这可能需要几秒钟到几十秒钟不等
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (generation.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
              生成失败
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {generation.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
