import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-markup.min';
import { Copy, Download, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const highlight = (code: string) => {
    const lang = detectLanguage(code);
    return Prism.highlight(code, Prism.languages[lang] || Prism.languages.jsx, lang);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        {/* 左侧：文件名 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">
            component.{detectLanguage(currentCode) === 'typescript' ? 'tsx' : detectLanguage(currentCode) === 'jsx' ? 'jsx' : detectLanguage(currentCode)}
          </span>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={copied}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
              copied
                ? "bg-green-600/20 text-green-400 border border-green-600/50"
                : "bg-blue-600 hover:bg-blue-700 text-white border border-transparent"
            )}
          >
            {copied ? (
              <>
                <Check size={14} className="animate-bounce" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>复制代码</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md border border-transparent transition-all duration-200"
          >
            <Download size={14} />
            <span>下载文件</span>
          </button>
        </div>
      </div>

      {/* 代码编辑器区域 */}
      <div className="flex-1 overflow-auto bg-gray-900 relative">
        {/* 编辑器内容 */}
        <div className="pl-12">
          <Editor
            value={currentCode}
            onValueChange={setCurrentCode}
            highlight={highlight}
            padding={16}
            textareaId="code-editor"
            className="min-h-full font-mono text-sm"
            style={{
              fontFamily: '"Cascadia Code", "Fira Code", "Consolas", "Monaco", monospace',
              minHeight: '100%',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
            placeholder="// 生成的组件代码会显示在这里，您可以直接编辑..."
          />
        </div>
      </div>

      <style>{`
        /* 语法高亮 - 柔和配色 */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #6a9955;
          font-style: italic;
        }

        .token.namespace {
          opacity: .7;
        }

        .token.string {
          color: #ce9178;
        }

        .token.attr-value {
          color: #ce9178;
        }

        .token.punctuation {
          color: #d4d4d4;
        }

        .token.operator {
          color: #d4d4d4;
          background: none;
        }

        .token.keyword {
          color: #569cd6;
        }

        .token.boolean {
          color: #569cd6;
        }

        .token.number {
          color: #b5cea8;
        }

        .token.tag {
          color: #569cd6;
        }

        .token.attr-name {
          color: #9cdcfe;
        }

        .token.function {
          color: #dcdcaa;
        }

        .token.class-name {
          color: #4ec9b0;
        }

        .token.property {
          color: #9cdcfe;
        }

        .token.regex {
          color: #d16969;
        }

        .token.important {
          color: #569cd6;
        }

        /* 编辑器样式优化 */
        #code-editor {
          outline: none;
          caret-color: #d4d4d4;
        }

        #code-editor::placeholder {
          color: #6a9955;
          font-style: italic;
        }

        /* 滚动条样式 - 简约风格 */
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .overflow-auto::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .overflow-auto::-webkit-scrollbar-thumb {
          background: #424242;
          border-radius: 4px;
        }

        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #4f4f4f;
        }
      `}</style>
    </div>
  );
};