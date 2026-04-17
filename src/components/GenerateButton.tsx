
import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store/useStore';

export const GenerateButton: React.FC = () => {
  const { generation, generateComponent } = useStore();

  return (
    <Button
      variant="primary"
      onClick={generateComponent}
      disabled={generation.isGenerating}
      className="w-full py-3 text-base flex items-center justify-center gap-2"
    >
      {generation.isGenerating ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Zap size={20} />
          生成组件
        </>
      )}
      <span className="text-xs opacity-70 ml-2">
        (⌘/Ctrl + Enter)
      </span>
    </Button>
  );
};
