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

// Define file interface
interface CodeFile {
  name: string;
  language: string;
  content: string;
}

// Detect language based on current code
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

// Get file extension from file path
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

// Smart split code into multiple files
function splitCodeToFiles(code: string): CodeFile[] {
  const files: CodeFile[] = [];
  
  // Clean code: remove code markers
  let cleanCode = code.trim();
  if (cleanCode.startsWith('```')) {
    cleanCode = cleanCode.replace(/^```(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
    cleanCode = cleanCode.replace(/\n?```$/, '');
    cleanCode = cleanCode.trim();
  }
  
  // Use regex to match all FILE markers
  const fileRegex = /\/\/\s*======\s*FILE:\s*([^\n]+)\s*======([\s\S]*?)(?=\/\/\s*======\s*FILE:|$)/g;
  let match;
  
  while ((match = fileRegex.exec(cleanCode)) !== null) {
    const fileName = match[1].trim();
    const fileContent = match[2].trim();
    
    // Detect file language
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
  
  // If no FILE markers found, try other splitting methods
  if (files.length === 0) {
    // Check if it contains style code (CSS/SCSS/Less)
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
    
    // Check if it contains utility functions
    const utilsMatch = cleanCode.match(/(\/\/|\/\*)\s*Utility Functions[\s\S]*?(const|function)\s+\w+/);
    if (utilsMatch) {
      const utilsSection = cleanCode.match(/(?:\/\/|\/\*)\s*Utility Functions[\s\S]*?(?=\n\n(?:\/\/|\/\*)|$)/g);
      if (utilsSection) {
        files.push({
          name: 'utils.ts',
          language: 'typescript',
          content: utilsSection.join('\n\n')
        });
      }
    }
    
    // Main component file
    files.push({
      name: detectLanguage(cleanCode) === 'typescript' ? 'component.tsx' : detectLanguage(cleanCode) === 'jsx' ? 'component.jsx' : 'component.js',
      language: detectLanguage(cleanCode),
      content: cleanCode
    });
  }
  
  return files;
}

// Generate line numbers
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
    // Multi-file generation related
    generatedFiles,
    activeFilePath,
    setActiveFile
  } = useStore();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([]);

  // When code updates, re-split files
  React.useEffect(() => {
    // Prioritize multi-file generated code
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

  // Find current file based on activeFilePath
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
      console.error('Copy failed:', err);
      alert('Copy failed，请手动复制');
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

  // Fix Bug: Check both currentCode and generatedFiles
  // In multi-file generation mode, code is stored in generatedFiles, currentCode may be empty
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
      {/* Content area: File tree + Code editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* File tree - as the only switch entry */}
        {files.length > 0 && (
          <FileTreeViewer
            files={generatedFiles.length > 0 ? generatedFiles : files.map(f => ({ name: f.name, path: f.name, code: f.content }))}
            activeFilePath={activeFilePath || (activeFile ? activeFile.name : '')}
            onFileSelect={(filePath) => {
              setActiveFile(filePath);
            }}
          />
        )}

        {/* Code editor container */}
        <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        {/* Left: File name and line count */}
        <div className="flex items-center gap-2">
          <File size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 font-mono">
            {activeFile ? activeFile.name : 'component.tsx'}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {displayCode.split('\n').length} {t.codeEditor.lines}
          </span>
        </div>

        {/* Right: Action buttons */}
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

      {/* Code editor area */}
      <div className="flex-1 overflow-auto bg-gray-50 relative">
        {/* Line numbers */}
        {renderLineNumber(displayCode)}
        
        {/* Editor content */}
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
        /* Syntax highlighting - optimize coloring, ensure visibility on light background */
        
        /* Comments - use green */
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

        /* Strings and attribute values - use green */
        .token.string,
        .token.attr-value {
          color: #032F62 !important;
          font-weight: 500;
        }

        /* Punctuation - use dark gray */
        .token.punctuation {
          color: #24292E !important;
        }

        .token.operator {
          color: #D73A49 !important;
          background: none;
        }

        /* Keywords - use purple */
        .token.keyword {
          color: #D73A49 !important;
          font-weight: 500;
        }

        .token.boolean,
        .token.number {
          color: #005CC5 !important;
          font-weight: 500;
        }

        /* HTML/JSX tag names - use dark red */
        .token.tag {
          color: #22863A !important;
          font-weight: 500;
        }

        /* Attribute names (e.g., className, onClick) - use dark red */
        .token.attr-name {
          color: #6F42C1 !important;
          font-weight: 500;
        }

        /* Function names - use blue */
        .token.function,
        .token.function-variable {
          color: #6F42C1 !important;
          font-weight: 500;
        }

        /* Class names and component names - use dark green */
        .token.class-name,
        .token.maybe-class-name {
          color: #005CC5 !important;
          font-weight: 500;
        }

        /* Properties and parameters - use dark red */
        .token.property,
        .token.parameter {
          color: #6F42C1 !important;
          font-weight: 500;
        }

        .token.regex {
          color: #005CC5 !important;
        }

        /* Constants - use blue */
        .token.constant {
          color: #005CC5 !important;
          font-weight: 500;
        }

        /* Variables - use dark gray */
        .token.variable {
          color: #24292E !important;
        }

        .token.important {
          color: #D73A49 !important;
        }

        /* Template string interpolations - use dark gray */
        .token.template-string,
        .token.interpolation {
          color: #24292E !important;
        }

        /* JSX expressions - use dark gray */
        .token.jsx-expression {
          color: #24292E !important;
        }

        /* Override all possible dark colors */
        .token.plain-text,
        .token.text,
        .token.content {
          color: #24292E !important;
        }

        /* Editor style optimizations */
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

        /* Scrollbar style - minimalist */
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
