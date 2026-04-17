
import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-markup.min';
import { Copy, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// 根据当前代码判断语言
function detectLanguage(code: string): string {
  if (code.includes('.vue') || code.includes('<template>')) return 'html';
  if (code.includes('function') && code.includes('import') && code.includes('export')) {
    if (code.includes('JSX') || code.includes('<') && code.includes('/>')) return 'jsx';
    return 'javascript';
  }
  if (code.includes('interface') || code.includes('type ') || code.includes(': ')) return 'typescript';
  if (code.includes('{') && code.includes('}') && code.includes(':')) return 'css';
  if (code.includes('<!DOCTYPE') || code.includes('<html')) return 'html';
  return 'jsx';
}

export const CodeEditorPanel: React.FC = () => {
  const { currentCode, setCurrentCode } = useStore();

  const highlight = (code: string) => {
    const lang = detectLanguage(code);
    return Prism.highlight(code, Prism.languages[lang] || Prism.languages.jsx, lang);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  const handleDownload = () => {
    let extension = 'txt';
    const lang = detectLanguage(currentCode);
    if (lang === 'jsx') extension = 'jsx';
    if (lang === 'typescript') extension = 'tsx';
    if (lang === 'html') extension = 'html';
    if (lang === 'css') extension = 'css';

    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-end gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-200"
        >
          <Copy size={14} />
          复制代码
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download size={14} />
          下载文件
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        <Editor
          value={currentCode}
          onValueChange={setCurrentCode}
          highlight={highlight}
          padding={16}
          textareaId="code-editor"
          className="min-h-full font-mono text-sm"
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minHeight: '100%',
          }}
          placeholder="生成的组件代码会显示在这里，您可以直接编辑..."
        />

        <style>{`
          /* Prism.js theme */
          .token.comment,
          .token.prolog,
          .token.doctype,
          .token.cdata {
            color: #6b7280;
            font-style: italic;
          }

          .token.namespace {
            opacity: .7;
          }

          .token.string {
            color: #10b981;
          }

          .token.attr-value {
            color: #10b981;
          }

          .token.punctuation {
            color: #6b7280;
          }

          .token.operator {
            color: #6b7280;
            background: none;
          }

          .token.keyword {
            color: #8b5cf6;
          }

          .token.boolean {
            color: #f59e0b;
          }

          .token.number {
            color: #f59e0b;
          }

          .token.tag {
            color: #ef4444;
          }

          .token.attr-name {
            color: #3b82f6;
          }

          .token.function {
            color: #3b82f6;
          }

          .token.class-name {
            color: #06b6d4;
          }

          .token.property {
            color: #06b6d4;
          }

          .token.comment {
            background: none;
          }

          /* Dark mode */
          .dark .token.comment,
          .dark .token.prolog,
          .dark .token.doctype,
          .dark .token.cdata {
            color: #94a3b8;
          }

          .dark .token.string {
            color: #34d399;
          }

          .dark .token.attr-value {
            color: #34d399;
          }

          .dark .token.punctuation {
            color: #94a3b8;
          }

          .dark .token.keyword {
            color: #c4b5fd;
          }

          .dark .token.boolean {
            color: #fbbf24;
          }

          .dark .token.number {
            color: #fbbf24;
          }

          .dark .token.tag {
            color: #f87171;
          }

          .dark .token.attr-name {
            color: #60a5fa;
          }

          .dark .token.function {
            color: #60a5fa;
          }

          .dark .token.class-name {
            color: #22d3ee;
          }

          .dark .token.property {
            color: #22d3ee;
          }

          /* Editor container */
          #code-editor {
            outline: none;
          }
        `}</style>
      </div>
    </div>
  );
};
