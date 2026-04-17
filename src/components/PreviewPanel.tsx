
import React, { useMemo, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PreviewResolution } from '../types';
import { resolutionPresets, resolutionList } from '../constants/resolutions';
import { useStore } from '../store/useStore';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface PreviewPanelProps {
  code: string;
  resolution: PreviewResolution;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, resolution }) => {
  const { setPreviewResolution } = useStore();
  const [error, setError] = useState<string | null>(null);

  const preset = resolutionPresets[resolution];

  // 处理iframe srcDoc
  const iframeHtml = useMemo(() => {
    if (!code) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white p-8">
  <div class="text-center text-gray-500">
    <p class="text-lg">点击左侧"生成组件"按钮开始</p>
  </div>
</body>
</html>
      `.trim();
    }

    // 检测框架，生成适合的HTML包装
    const isReactCode = code.includes('React') || code.includes('jsx') || code.includes('tsx');
    const isVueCode = code.includes('<template>') || code.includes('.vue');
    const isHtmlCode = code.includes('<!DOCTYPE') || code.includes('<html');

    if (isHtmlCode) {
      // 已经是完整HTML
      return code;
    }

    // 默认打包成可以直接运行的HTML（对于React/Vue，只支持使用CDN的简单组件）
    // 如果是React组件，我们提供一个简单的渲染环境
    if (isReactCode) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="text/babel">
${code}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<${extractComponentName(code)} />);
  </script>
</body>
</html>
      `.trim();
    }

    // 默认返回，把代码放在body里
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
  </style>
</head>
<body class="bg-white">
${code}
</body>
</html>
    `.trim();
  }, [code]);

  // 提取组件名称
  function extractComponentName(code: string): string {
    // 尝试找 function Component 或者 const Component =
    const functionMatch = code.match(/function\s+(\w+)/);
    if (functionMatch) return functionMatch[1];
    const constMatch = code.match(/const\s+(\w+)\s*=/);
    if (constMatch) return constMatch[1];
    return 'Component';
  }

  const containerStyle: React.CSSStyleDeclaration = {
    width: preset.width === '100%' ? '100%' : `${preset.width}px`,
    height: preset.height === '100%' ? '100%' : `${preset.height}px`,
    maxHeight: '100%',
    margin: '0 auto',
    background: 'white',
    overflow: 'auto',
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Resolution selector */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur flex gap-2 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 self-center">分辨率：</span>
        {resolutionList.map((preset) => (
          <button
            key={preset.key}
            onClick={() => setPreviewResolution(preset.key)}
            className={cn(
              "px-3 py-1 text-xs rounded-full border transition-colors",
              resolution === preset.key
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Preview iframe container */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 overflow-auto">
        <div style={containerStyle} className="shadow-xl rounded">
          {error ? (
            <div className="p-8 text-center text-red-500">
              <p>预览出错：{error}</p>
              <p className="text-sm mt-2">请检查代码语法是否正确</p>
            </div>
          ) : (
            <iframe
              srcDoc={iframeHtml}
              title="component-preview"
              className="w-full h-full border-0 rounded bg-white"
              onError={() => setError('无法加载预览')}
              onLoad={() => setError(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
