import React, { useEffect, useState } from "react";
import { LeftFormPanel } from "../components/LeftFormPanel";
import { PreviewPanel } from "../components/PreviewPanel";
import { CodeEditorPanel } from "../components/CodeEditorPanel";
import { GenerateButton } from "../components/GenerateButton";
import { GenerationProgress } from "../components/GenerationProgress";
import { RequirementsRefinementDialog } from "../components/RequirementsRefinementDialog";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";

export const HomePage: React.FC = () => {
  const { currentCode, generation, previewResolution } = useStore();

  // 代码测试功能状态
  const [showTestArea, setShowTestArea] = useState(false);
  const [testCode, setTestCode] = useState("");
  const [testError, setTestError] = useState<string | null>(null);

  // 提取组件名称
  function extractComponentName(code: string): string {
    console.log("🔍 开始提取组件名...");

    // 1. 优先查找 export default 的组件名
    const exportDefaultMatch = code.match(
      /export\s+default\s+function\s+(\w+)/,
    );
    if (exportDefaultMatch) {
      console.log(
        `✅ 匹配到 export default function: ${exportDefaultMatch[1]}`,
      );
      return exportDefaultMatch[1];
    }

    // 2. 查找 export default 的变量名
    const exportDefaultVarMatch = code.match(/export\s+default\s+(\w+)\s*;/);
    if (exportDefaultVarMatch) {
      console.log(`✅ 匹配到 export default 变量: ${exportDefaultVarMatch[1]}`);
      return exportDefaultVarMatch[1];
    }

    // 3. 尝试找 const Component = (大写字母开头)
    const constMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*\(?[^)]*\)?\s*=>/);
    if (constMatch) {
      console.log(`✅ 匹配到 const 箭头函数: ${constMatch[1]}`);
      return constMatch[1];
    }

    // 4. 尝试找 function Component
    const functionMatch = code.match(/function\s+([A-Z]\w+)/);
    if (functionMatch) {
      console.log(`✅ 匹配到 function 声明: ${functionMatch[1]}`);
      return functionMatch[1];
    }

    // 5. 兜底
    console.warn('❌ 无法提取组件名，使用默认值 "App"');
    console.log("代码片段:", code.substring(0, 200));
    return "App";
  }

  // 预处理代码，使其能在浏览器中运行
  function preprocessCodeForBrowser(code: string): string {
    let processed = code;

    // 1. 移除所有 TypeScript 类型定义 (interface, type)
    processed = processed.replace(/interface\s+\w+\s*\{[^}]*\}/gs, "");
    processed = processed.replace(/type\s+\w+\s*=\s*[^;]+;/g, "");

    // 2. 移除 export 相关语句
    processed = processed.replace(/^export\s+default\s+/gm, "");
    processed = processed.replace(/^export\s+/gm, "");
    processed = processed.replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, "");

    // 3. 移除 import 语句（使用全局 React）
    processed = processed.replace(
      /^import\s+.*from\s+['"][^'"]+['"]\s*;?\s*$/gm,
      "",
    );

    // 4. 移除 React.MouseEvent 等类型注解
    processed = processed.replace(/:\s*React\.\w+/g, "");
    processed = processed.replace(/:\s*\w+(\[\])?(\s*\|\s*\w+)?/g, (match) => {
      // 保留函数参数中的默认值赋值
      if (match.includes('=')) return match;
      return '';
    });

    // 5. 清理多余的空行
    processed = processed.replace(/\n{3,}/g, "\n\n");

    return processed.trim();
  }

  // 代码测试：渲染测试代码
  const handleTestRender = () => {
    if (!testCode.trim()) {
      setTestError("请输入要测试的代码");
      return;
    }

    console.log("🧪 开始测试代码渲染...");
    console.log("=== 测试代码 ===");
    console.log(testCode);

    // 提取组件名
    const componentName = extractComponentName(testCode);
    console.log(`📦 提取的组件名: ${componentName}`);

    // 预处理代码
    const processedCode = preprocessCodeForBrowser(testCode);
    console.log("=== 预处理后的代码 ===");
    console.log(processedCode);

    // 生成HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="text/babel">
${processedCode}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<${componentName} />);
  </script>
</body>
</html>
    `.trim();

    // 使用 postMessage 将 HTML 发送给 PreviewPanel
    const iframe = document.querySelector(
      "#preview-iframe",
    ) as HTMLIFrameElement;
    if (iframe) {
      iframe.srcdoc = html;
      setTestError(null);
    } else {
      setTestError("预览iframe未找到");
    }
  };

  // 清空测试代码
  const handleClearTest = () => {
    setTestCode("");
    setTestError(null);
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!generation.isGenerating) {
          useStore.getState().generateComponent();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generation.isGenerating]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)] min-h-0">
        {/* 左侧：表单 */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-5">
              <LeftFormPanel />
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
              <GenerateButton />
            </div>
          </Card>
        </div>

        {/* 右侧：预览 + 代码 */}
        <div className="lg:col-span-8 flex flex-col min-h-0 gap-4">
          {/* 生成进度 */}
          <GenerationProgress />

          {/* 上方：预览 */}
          <div className="flex-1 min-h-[300px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">组件预览</h3>
                  
                  {/* 代码测试按钮 */}
                  <button
                    onClick={() => setShowTestArea(!showTestArea)}
                    className="px-3 py-1.5 text-xs rounded-md border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-150 flex items-center gap-1"
                    title="粘贴代码直接测试渲染，无需走完整生成流程"
                  >
                    <span>🧪</span>
                    <span>{showTestArea ? '隐藏测试' : '代码测试'}</span>
                  </button>
                </div>
              </div>
              
              {/* 代码测试区域 */}
              {showTestArea && (
                <div className="px-4 py-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-b border-purple-200 dark:border-purple-700">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span>📋</span>
                      <span>粘贴代码进行测试（无需走完整生成流程）</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearTest}
                        className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        🗑️ 清空
                      </button>
                      <button
                        onClick={handleTestRender}
                        className="px-3 py-1.5 text-xs rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
                      >
                        ▶️ 渲染测试
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                    placeholder={`在此粘贴 React 组件代码，然后点击'渲染测试'按钮...

示例代码：
import React from 'react';

const TestButton = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <button 
      onClick={() => setCount(count + 1)}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      点击次数: {count}
    </button>
  );
};

export default TestButton;`}
                    className="w-full h-40 px-3 py-2 text-sm font-mono rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-vertical"
                  />
                  {testError && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                      <span>⚠️</span>
                      <span>{testError}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* 预览面板 - 始终显示 */}
              <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900">
                <PreviewPanel code={currentCode} resolution={previewResolution} />
              </div>
            </Card>
          </div>

          {/* 下方：代码编辑器 */}
          <div className="flex-1 min-h-[250px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  组件代码
                </h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditorPanel />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 需求整理弹窗 */}
      <RequirementsRefinementDialog />
    </>
  );
};
