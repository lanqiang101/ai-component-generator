
import React, { useMemo, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PreviewResolution } from '../types';
import { resolutionPresets, resolutionListGrouped } from '../constants/resolutions';
import { useStore } from '../store/useStore';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Monitor, Smartphone, Tablet, Tv, Laptop } from 'lucide-react';

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

  // 获取分类标签
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mobile: '手机设备',
      tablet: '平板设备',
      desktop: '桌面显示器',
      laptop: '笔记本电脑',
      tv: '电视屏幕',
    };
    return labels[category] || category;
  };

  const containerStyle: React.CSSStyleDeclaration = {
    width: preset.width === '100%' ? '100%' : `${preset.width}px`,
    height: preset.height === '100%' ? '100%' : `${preset.height}px`,
    maxHeight: '100%',
    margin: '0 auto',
    background: 'white',
    overflow: 'auto',
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* 分辨率选择器 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">预览尺寸：</span>
          <Select.Root value={resolution} onValueChange={(value) => setPreviewResolution(value as PreviewResolution)}>
            <Select.Trigger className="inline-flex items-center justify-between px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[180px] transition-colors">
              <Select.Value placeholder="选择分辨率" />
              <Select.Icon className="ml-2">
                <ChevronDown size={14} />
              </Select.Icon>
            </Select.Trigger>
            
            <Select.Portal>
              <Select.Content 
                className="overflow-hidden bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 max-h-[60vh]"
                position="popper"
                sideOffset={5}
              >
                <Select.Viewport className="p-1">
                  {resolutionListGrouped.map((group) => (
                    <Select.Group key={group.category}>
                      <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                        {group.category === 'mobile' && <Smartphone className="w-4 h-4 mr-2" />}
                        {group.category === 'tablet' && <Tablet className="w-4 h-4 mr-2" />}
                        {group.category === 'desktop' && <Monitor className="w-4 h-4 mr-2" />}
                        {group.category === 'tv' && <Tv className="w-4 h-4 mr-2" />}
                        {group.category === 'laptop' && <Laptop className="w-4 h-4 mr-2" />}
                        {getCategoryLabel(group.category)}
                      </Select.Label>
                      {group.items.map((preset) => (
                        <Select.Item
                          key={preset.key}
                          value={preset.key}
                          className="relative flex items-center px-3 py-2 text-sm rounded-md cursor-pointer outline-none select-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-slate-700 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-white transition-colors"
                        >
                          <Select.ItemText>{preset.label}</Select.ItemText>
                          <Select.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
                            <Check size={16} className="text-primary" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* 预览 iframe 容器 */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-slate-900/50 p-6 overflow-auto">
        <div style={containerStyle} className="shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg">
          {error ? (
            <div className="p-8 text-center text-red-500">
              <p>预览出错：{error}</p>
              <p className="text-sm mt-2">请检查代码语法是否正确</p>
            </div>
          ) : (
            <iframe
              srcDoc={iframeHtml}
              title="component-preview"
              className="w-full h-full border-0 rounded-lg bg-white"
              onError={() => setError('无法加载预览')}
              onLoad={() => setError(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
