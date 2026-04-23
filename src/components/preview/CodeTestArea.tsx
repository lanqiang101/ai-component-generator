import React, { useState } from 'react';
import { generateTestHtml } from '../../utils/previewUtils';

interface CodeTestAreaProps {
  t: any;
  language: 'en' | 'zh';
}

export const CodeTestArea: React.FC<CodeTestAreaProps> = ({ t, language }) => {
  const [testCode, setTestCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleTestCodeRender = () => {
    if (!testCode.trim()) {
      setError(language === 'en' ? 'Enter code to test' : '请输入要测试的代码');
      return;
    }
    
    console.log('🧪 Starting code rendering test...');
    console.log('=== Test code ===');
    console.log(testCode);
    
    const html = generateTestHtml(testCode);
    
    // Create a new iframe to display test result
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e5e7eb';
    iframe.style.marginTop = '20px';
    iframe.srcdoc = html;
    
    // Clear old test result
    const oldTestResult = document.getElementById('test-result-container');
    if (oldTestResult) {
      oldTestResult.remove();
    }
    
    // Add new test result container
    const container = document.createElement('div');
    container.id = 'test-result-container';
    container.innerHTML = `<h3 style="margin: 10px 0; color: #374151;">${language === 'en' ? '🧪 Test result:' : '🧪 测试结果:'}</h3>`;
    container.appendChild(iframe);
    
    // Insert below test area
    const testArea = document.getElementById('test-code-area');
    if (testArea) {
      testArea.parentNode?.insertBefore(container, testArea.nextSibling);
    }
    
    setError(null);
  };

  const handleClearTest = () => {
    setTestCode("");
    setError(null);
    const oldTestResult = document.getElementById('test-result-container');
    if (oldTestResult) {
      oldTestResult.remove();
    }
  };

  return (
    <div id="test-code-area" className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg border border-purple-200 dark:border-purple-700">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span>📋</span>
          <span>{language === 'en' ? 'Paste code for testing' : '粘贴代码进行测试（无需走完整生成流程）'}</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleClearTest}
            className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            🗑️ {t.preview.clear}
          </button>
          <button
            onClick={handleTestCodeRender}
            className="px-3 py-1.5 text-xs rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
          >
            ▶️ {t.preview.renderTest}
          </button>
        </div>
      </div>
      <textarea
        value={testCode}
        onChange={(e) => setTestCode(e.target.value)}
        placeholder={t.preview.pasteCodePlaceholder}
        className="w-full h-48 px-3 py-2 text-sm font-mono rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-50 resize-vertical"
      />
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
