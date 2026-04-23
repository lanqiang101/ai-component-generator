import React, { useState, useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-markup.min';
import 'prismjs/components/prism-scss.min';
import 'prismjs/components/prism-less.min';
import { Copy, Download, Check, FileCode2, File } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FileTreeViewer } from './FileTreeViewer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from '../i18n';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// 定义文件接口
interface CodeFile {
  name: string;
  language: string;
  content: string;
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

// 根据文件路径获取文件扩展名
function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || '';
    if (['tsx', 'jsx', 'ts', 'js'].includes(ext)) return ext;
    if (['css', 'scss', 'less'].includes(ext)) return ext;
    if (ext === 'vue') return 'html';
  }
  return 'typescript';
}

// 智能拆分代码为多个文件
function splitCodeToFiles(code: string): CodeFile[] {
  const files: CodeFile[] = [];
  
  // 清理代码：移除代码标记
  let cleanCode = code.trim();
  if (cleanCode.startsWith('```')) {
    cleanCode = cleanCode.replace(/^```(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
    cleanCode = cleanCode.replace(/\n?```$/, '');
    cleanCode = cleanCode.trim();
  }
  
  // 使用正则表达式匹配所有 FILE 标记
  const fileRegex = /\/\/\s*======\s*FILE:\s*([^\n]+)\s*======([\s\S]*?)(?=\/\/\s*======\s*FILE:|$)/g;
  let match;
  
  while ((match = fileRegex.exec(cleanCode)) !== null) {
    const fileName = match[1].trim();
    const fileContent = match[2].trim();
    
    // 检测文件语言
    let language = 'typescript';
    if (fileName.endsWith('.css')) language = 'css';
    else if (fileName.endsWith('.scss')) language = 'scss';
    else if (fileName.endsWith('.less')) language = 'less';
    else if (fileName.endsWith('.js')) language = 'javascript';
    else if (fileName.endsWith('.jsx')) language = 'jsx';
    else if (fileName.endsWith('.ts')) language = 'typescript';
    else if (fileName.endsWith('.tsx')) language = 'typescript';
    
    files.push({
      name: fileName,
      language: language,
      content: fileContent
    });
  }
  
  // 如果没有找到 FILE 标记，则尝试其他拆分方式
  if (files.length === 0) {
    // 检查是否包含样式代码（CSS/SCSS/Less）
    const cssMatch = cleanCode.match(/(?:\.css|\.scss|\.less|styled-components|css\s*`[\s\S]*?`)/);
    if (cssMatch) {
      const cssContent = cleanCode.match(/css\s*`([\s\S]*?)`|<style>([\s\S]*?)<\/style>/);
      if (cssContent) {
        const lang = cssMatch[0].includes('.scss') ? 'scss' : cssMatch[0].includes('.less') ? 'less' : 'css';
        const ext = lang === 'scss' ? 'scss' : lang === 'less' ? 'less' : 'css';
        files.push({
          name: `styles.${ext}`,
          language: lang,
          content: cssContent[1] || cssContent[2] || ''
        });
      }
    }
    
    // 检查是否包含工具函数
    const utilsMatch = cleanCode.match(/(\/\/|\/\*)\s*工具函数[\s\S]*?(const|function)\s+\w+/);
    if (utilsMatch) {
      const utilsSection = cleanCode.match(/(?:\/\/|\/\*)\s*工具函数[\s\S]*?(?=\n\n(?:\/\/|\/\*)|$)/g);
      if (utilsSection) {
        files.push({
          name: 'utils.ts',
          language: 'typescript',
          content: utilsSection.join('\n\n')
        });
      }
    }
    
    // 主组件文件
    files.push({
      name: detectLanguage(cleanCode) === 'typescript' ? 'component.tsx' : detectLanguage(cleanCode) === 'jsx' ? 'component.jsx' : 'component.js',
      language: detectLanguage(cleanCode),
      content: cleanCode
    });
  }
  
  return files;
}

// 生成行号
const renderLineNumber = (code: string) => {
  const lines = code.split('\n').length;
  return (
    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-200 select-none">
      <div className="pt-4 pr-3 text-right">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="text-gray-400 text-sm font-mono leading-6">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CodeEditorPanel: React.FC = () => {
  const { 
    currentCode, 
    setCurrentCode,
    // 多文件生成相关
    generatedFiles,
    activeFilePath,
    setActiveFile
  } = useStore();
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([]);

  // 当代码更新时，重新拆分文件
  React.useEffect(() => {
    // 优先使用多文件生成的代码
    if (generatedFiles.length > 0) {
      const multiFiles = generatedFiles.map(file => ({
        name: file.name,
        language: getFileExtension(file.path),
        content: file.code
      }));
      setFiles(multiFiles);
    } else if (currentCode) {
      const newFiles = splitCodeToFiles(currentCode);
      setFiles(newFiles);
    }
  }, [currentCode, generatedFiles]);

  // 根据 activeFilePath 查找当前文件
  const activeFile = useMemo(() => {
    if (files.length === 0) return null;
    const currentFileName = activeFilePath.split('/').pop();
    return files.find(f => f.name === currentFileName) || files[0];
  }, [files, activeFilePath]);

  const highlight = (code: string) => {
    const lang = detectLanguage(code);
    const prismLang = Prism.languages[lang] || Prism.languages.jsx;
    return Prism.highlight(code, prismLang, lang);
  };

  const handleCopy = async () => {
    try {
      const codeToCopy = activeFile ? activeFile.content : currentCode;
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  const handleDownload = () => {
    const extension = activeFile ? activeFile.name.split('.').pop() : 'txt';

    const blob = new Blob([activeFile ? activeFile.content : currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile ? activeFile.name : `component.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayCode = activeFile ? activeFile.content : currentCode;

  // 修复 Bug: 同时检查 currentCode 和 generatedFiles
  // 多文件生成模式下,代码存储在 generatedFiles 中,currentCode 可能为空
  if (!currentCode && generatedFiles.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200">
        <FileCode2 size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-500 text-sm">{t.codeEditor.noCode}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* 内容区域：文件树 + 代码编辑器 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 文件树 - 作为唯一切换入口 */}
        {files.length > 0 && (
          <FileTreeViewer
            files={generatedFiles.length > 0 ? generatedFiles : files.map(f => ({ name: f.name, path: f.name, code: f.content }))}
            activeFilePath={activeFilePath || (activeFile ? activeFile.name : '')}
            onFileSelect={(filePath) => {
              setActiveFile(filePath);
            }}
          />
        )}

        {/* 代码编辑器容器 */}
        <div className="flex-1 flex flex-col overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        {/* 左侧：文件名和行数 */}
        <div className="flex items-center gap-2">
          <File size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 font-mono">
            {activeFile ? activeFile.name : 'component.tsx'}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {displayCode.split('\n').length} {t.codeEditor.lines}
          </span>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={copied}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150",
              copied
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            )}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>{t.codeEditor.copied}</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>{t.codeEditor.copy}</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-300 transition-all duration-150"
          >
            <Download size={14} />
            <span>{t.codeEditor.download}</span>
          </button>
        </div>
      </div>

      {/* 代码编辑器区域 */}
      <div className="flex-1 overflow-auto bg-gray-50 relative">
        {/* 行号 */}
        {renderLineNumber(displayCode)}
        
        {/* 编辑器内容 */}
        <div className="pl-12">
          <Editor
            value={displayCode}
            onValueChange={(newCode) => {
              if (files.length > 0 && activeFile) {
                const newFiles = files.map(f => 
                  f.name === activeFile.name ? { ...f, content: newCode } : f
                );
                setFiles(newFiles);
              }
              setCurrentCode(newCode);
            }}
            highlight={highlight}
            padding={16}
            textareaId="code-editor"
            className="min-h-full font-mono text-sm"
            style={{
              fontFamily: '"Cascadia Code", "Fira Code", "Consolas", "Monaco", monospace',
              minHeight: '100%',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
            placeholder={t.codeEditor.placeholder}
          />
        </div>
      </div>
        </div>
      </div>

      <style>{`
        /* 语法高亮 - 优化配色，确保在浅色背景下清晰可见 */
        
        /* 注释 - 使用绿色 */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #22863A !important;
          font-style: italic;
        }

        .token.namespace {
          opacity: .7;
        }

        /* 字符串和属性值 - 使用绿色 */
        .token.string,
        .token.attr-value {
          color: #032F62 !important;
          font-weight: 500;
        }

        /* 标点符号 - 使用深灰色 */
        .token.punctuation {
          color: #24292E !important;
        }

        .token.operator {
          color: #D73A49 !important;
          background: none;
        }

        /* 关键字 - 使用紫色 */
        .token.keyword {
          color: #D73A49 !important;
          font-weight: 500;
        }

        .token.boolean,
        .token.number {
          color: #005CC5 !important;
          font-weight: 500;
        }

        /* HTML/JSX 标签名 - 使用深红色 */
        .token.tag {
          color: #22863A !important;
          font-weight: 500;
        }

        /* 属性名（如 className, onClick 等）- 使用深红色 */
        .token.attr-name {
          color: #6F42C1 !important;
          font-weight: 500;
        }

        /* 函数名 - 使用蓝色 */
        .token.function,
        .token.function-variable {
          color: #6F42C1 !important;
          font-weight: 500;
        }

        /* 类名和组件名 - 使用深绿色 */
        .token.class-name,
        .token.maybe-class-name {
          color: #005CC5 !important;
          font-weight: 500;
        }

        /* 属性和参数 - 使用深红色 */
        .token.property,
        .token.parameter {
          color: #6F42C1 !important;
          font-weight: 500;
        }

        .token.regex {
          color: #005CC5 !important;
        }

        /* 常量 - 使用蓝色 */
        .token.constant {
          color: #005CC5 !important;
          font-weight: 500;
        }

        /* 变量 - 使用深灰色 */
        .token.variable {
          color: #24292E !important;
        }

        .token.important {
          color: #D73A49 !important;
        }

        /* 模板字符串中的插值 - 使用深灰色 */
        .token.template-string,
        .token.interpolation {
          color: #24292E !important;
        }

        /* JSX 表达式 - 使用深灰色 */
        .token.jsx-expression {
          color: #24292E !important;
        }

        /* 覆盖所有可能的暗色 */
        .token.plain-text,
        .token.text,
        .token.content {
          color: #24292E !important;
        }

        /* 编辑器样式优化 */
        #code-editor {
          outline: none;
          caret-color: #24292E;
          background: transparent !important;
          color: #24292E !important;
        }

        #code-editor::placeholder {
          color: #22863A;
          font-style: italic;
        }

        #code-editor textarea {
          background: transparent !important;
          color: #24292E !important;
        }

        /* 滚动条样式 - 简约风格 */
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .overflow-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};
