import React, { useState, useMemo, useCallback } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PreviewResolution } from "../types";
import {
  resolutionPresets,
  resolutionListGrouped,
} from "../constants/resolutions";
import { useStore } from "../store/useStore";
import * as Select from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Laptop,
  AlertCircle,
} from "lucide-react";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// 简单的语法检查函数
function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: true };
  }

  try {
    // 检查基本语法
    const isReactCode =
      code.includes("React") ||
      code.includes("jsx") ||
      code.includes("tsx") ||
      code.includes("import React");

    if (isReactCode) {
      // 检查括号匹配
      const parentheses = code.match(/[()]/g) || [];
      let balance = 0;
      for (const char of parentheses) {
        if (char === "(") balance++;
        else if (char === ")") balance--;
        if (balance < 0) {
          return { valid: false, error: "括号不匹配，请检查代码" };
        }
      }
      if (balance !== 0) {
        return { valid: false, error: "括号不匹配，请检查代码" };
      }

      // 检查大括号匹配
      const braces = code.match(/[{}]/g) || [];
      balance = 0;
      for (const char of braces) {
        if (char === "{") balance++;
        else if (char === "}") balance--;
        if (balance < 0) {
          return { valid: false, error: "大括号不匹配，请检查代码" };
        }
      }
      if (balance !== 0) {
        return { valid: false, error: "大括号不匹配，请检查代码" };
      }

      // 检查尖括号匹配（JSX）
      const hasUnclosedTags =
        /<[A-Z][a-zA-Z]*(?![^>]*\/>)(?![\s\S]*<\/[A-Z][a-zA-Z]*>)/.test(code);
      if (hasUnclosedTags) {
        // 这个检查可能误报，只做警告
        console.warn("可能存在未闭合的 JSX 标签");
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `代码语法检查失败: ${error instanceof Error ? error.message : "未知错误"}`,
    };
  }
}

interface PreviewPanelProps {
  code: string;
  resolution: PreviewResolution;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  code,
  resolution,
}) => {
  const { setPreviewResolution } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const preset = resolutionPresets[resolution];

  // 验证代码
  const validation = useMemo(() => {
    if (!code) return { valid: true };
    return validateCode(code);
  }, [code]);

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

    // 如果代码验证失败，不生成预览
    if (!validation.valid) {
      return null;
    }

    // 检测框架，生成适合的HTML包装
    const isReactCode =
      code.includes("React") || code.includes("jsx") || code.includes("tsx");
    const isVueCode = code.includes("<template>") || code.includes(".vue");
    const isHtmlCode = code.includes("<!DOCTYPE") || code.includes("<html");

    if (isHtmlCode) {
      // 已经是完整HTML
      return code;
    }

    // 默认打包成可以直接运行的HTML（对于React/Vue，只支持使用CDN的简单组件）
    // 如果是React组件，我们提供一个简单的渲染环境
    if (isReactCode) {
      // 预处理代码：移除 export 语句，使其能在浏览器中直接运行
      const processedCode = preprocessCodeForBrowser(code);

      // 调试：在控制台输出预处理后的代码
      console.log("=== 原始代码 ===");
      console.log(code);
      console.log("=== 预处理后的代码 ===");
      console.log(processedCode);

      return `
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
  }, [code, validation]);

  // 提取组件名称
  function extractComponentName(code: string): string {
    // 优先查找 export default 的组件名
    const exportDefaultMatch = code.match(
      /export\s+default\s+function\s+(\w+)/,
    );
    if (exportDefaultMatch) return exportDefaultMatch[1];

    // 查找 export default 的箭头函数
    const exportDefaultArrowMatch = code.match(
      /export\s+default\s+\(\s*\)\s*=>\s*\{/,
    );
    if (exportDefaultArrowMatch) {
      // 尝试从注释或上下文中找到组件名
      const componentMatch = code.match(
        /\/\/\s*主组件[：:]\s*(\w+)|\/\*\s*主组件[：:]\s*(\w+)/,
      );
      if (componentMatch)
        return componentMatch[1] || componentMatch[2] || "MainComponent";
      return "MainComponent";
    }

    // 尝试找 function Component
    const functionMatch = code.match(/function\s+([A-Z]\w+)/);
    if (functionMatch) return functionMatch[1];

    // 尝试找 const Component = （大写字母开头，通常是组件）
    const constMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*\(?[^)]*\)?\s*=>/);
    if (constMatch) return constMatch[1];

    return "Component";
  }

  // 预处理代码，使其能在浏览器中运行
  function preprocessCodeForBrowser(code: string): string {
    let processed = code;

    // 0. 如果是多文件结构，只提取主组件文件的内容
    const fileRegex =
      /\/\/\s*======\s*FILE:\s*([^\n]+)\s*======([\s\S]*?)(?=\/\/\s*======\s*FILE:|$)/g;
    const files: { name: string; content: string }[] = [];
    let match;

    while ((match = fileRegex.exec(code)) !== null) {
      files.push({
        name: match[1].trim(),
        content: match[2].trim(),
      });
    }

    // 如果找到了多个文件，合并所有内容（子组件在前，主组件在后）
    if (files.length > 1) {
      // 按照文件名排序，确保子组件在前，主组件在后
      const sortedFiles = files.sort((a, b) => {
        // component.tsx 或 index.tsx 放在最后
        if (a.name.includes("component") || a.name.includes("index")) return 1;
        if (b.name.includes("component") || b.name.includes("index")) return -1;
        return 0;
      });

      // 合并所有文件内容
      processed = sortedFiles.map((f) => f.content).join("\n\n");
    }

    // 1. 移除 export default
    processed = processed.replace(/export\s+default\s+/g, "");

    // 2. 移除 named exports
    processed = processed.replace(
      /export\s+(const|let|var|function|class|interface|type)\s+/g,
      "$1 ",
    );

    // 3. 移除 export { ... } 语句
    processed = processed.replace(/export\s*\{[^}]*\}\s*;?/g, "");

    // 4. 处理 import 语句
    // 4.1 提取 React Hooks (useState, useEffect 等)
    const reactHooksMatch = processed.match(
      /import\s+\{([^}]+)\}\s+from\s+['"]react['"]/,
    );
    if (reactHooksMatch) {
      const hooks = reactHooksMatch[1].split(",").map((h) => h.trim());
      // 将 import { useState, useEffect } from 'react' 转换为注释
      processed = processed.replace(
        /import\s+\{[^}]+\}\s+from\s+['"]react['"]\s*;?/g,
        "// React import removed - using global React object",
      );

      // 将代码中的 useState, useEffect 等替换为 React.useState, React.useEffect
      hooks.forEach((hook) => {
        // 使用单词边界匹配，避免替换部分匹配
        const regex = new RegExp(`\\b${hook}\\b`, "g");
        processed = processed.replace(regex, `React.${hook}`);
      });
    }

    // 4.2 处理 default import: import React from 'react'
    const reactDefaultMatch = processed.match(
      /import\s+React\s+from\s+['"]react['"]/,
    );
    if (reactDefaultMatch) {
      processed = processed.replace(
        /import\s+React\s+from\s+['"]react['"]\s*;?/g,
        "// React import removed - using global React object",
      );
    }

    // 4.3 处理混合 import: import React, { useState } from 'react'
    const reactMixedMatch = processed.match(
      /import\s+React\s*,\s*\{([^}]+)\}\s+from\s+['"]react['"]/,
    );
    if (reactMixedMatch) {
      const hooks = reactMixedMatch[1].split(",").map((h) => h.trim());
      processed = processed.replace(
        /import\s+React\s*,\s*\{[^}]+\}\s+from\s+['"]react['"]\s*;?/g,
        "// React import removed - using global React object",
      );

      hooks.forEach((hook) => {
        const regex = new RegExp(`\\b${hook}\\b`, "g");
        processed = processed.replace(regex, `React.${hook}`);
      });
    }

    // 4.4 处理其他库的 import (如 lucide-react)
    processed = processed.replace(
      /import\s+.*?\s+from\s+['"][^'"]+['"]\s*;?/g,
      "// Import removed for browser preview",
    );

    // 5. 移除 TypeScript 类型注解（使用更安全的方法）

    // 5.1 处理 React.FC<Props> 类型的变量声明
    processed = processed.replace(
      /(const|let|var)\s+(\w+)\s*:\s*React\.FC\s*<[^>]*>\s*=/g,
      "$1 $2 =",
    );

    // 5.2 处理其他泛型类型注解的变量声明
    processed = processed.replace(
      /(const|let|var)\s+(\w+)\s*:\s*\w+<[^>]*>\s*=/g,
      "$1 $2 =",
    );

    // 5.3 处理函数参数的对象解构类型注解
    // 使用更安全的方法：先找到函数定义，然后处理其参数
    // 匹配模式：function Name(params: Type) 或 const Name = (params: Type) =>
    // 策略：移除函数参数列表中最后一个 : { ... } 或 : Type

    // 先处理箭头函数的参数类型
    processed = processed.replace(
      /((?:const|let|var)\s+\w+\s*=\s*)\(([^)]*)\)\s*:\s*(?:React\.FC<[^>]*>|\{[^}]*\}|\w+(?:<[^>]*>)?)\s*=>/g,
      "$1($2) =>",
    );

    // 处理普通函数的参数类型
    processed = processed.replace(
      /(function\s+\w+\s*)\(([^)]*)\)\s*:\s*(?:void|string|number|boolean|any|React\.\w+|\{[^}]*\})/g,
      "$1($2)",
    );

    // 5.4 移除变量声明中的类型注解（更精确的匹配）
    // 只处理明显的类型注解模式：const/let/var name: Type =
    processed = processed.replace(
      /(const|let|var)\s+(\w+)\s*:\s*(?:string|number|boolean|any|never|unknown|null|undefined)\s*=/g,
      "$1 $2 =",
    );

    // 处理数组类型
    processed = processed.replace(
      /(const|let|var)\s+(\w+)\s*:\s*(?:\w+\[\]|\[\s*\w+\s*\])\s*=/g,
      "$1 $2 =",
    );

    // 处理对象类型（简单对象，不包含嵌套）
    processed = processed.replace(
      /(const|let|var)\s+(\w+)\s*:\s*\{[^{}\n]*\}\s*=/g,
      "$1 $2 =",
    );

    // 5.5 处理返回类型注解
    processed = processed.replace(
      /:\s*(?:void|string|number|boolean|any|never|unknown|React\.\w+)\s*=>/g,
      " =>",
    );
    processed = processed.replace(/:\s*Promise<[^>]*>\s*=>/g, " =>");
    processed = processed.replace(/:\s*JSX\.Element\s*=>/g, " =>");

    // 6. 移除 interface 和 type 定义
    processed = processed.replace(/interface\s+\w+\s*\{[\s\S]*?\}\s*/g, "");
    processed = processed.replace(/type\s+\w+\s*=[\s\S]*?;?\s*/g, "");

    // 7. 移除 as 类型断言
    processed = processed.replace(/\s+as\s+\w+/g, "");
    processed = processed.replace(/\s+as\s+\{[^}]*\}/g, "");
    processed = processed.replace(/\s+as\s+\w+<[^>]*>/g, "");

    // 8. 移除非空断言 !
    processed = processed.replace(/!\./g, ".");
    processed = processed.replace(/!\[/g, "[");

    // 9. 移除可选链 ?. （保留，因为这是 JavaScript 特性）
    // 不需要处理

    // 10. 清理多余的空行
    processed = processed.replace(/\n{3,}/g, "\n\n");

    return processed;
  }

  // 获取分类标签
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mobile: "手机设备",
      tablet: "平板设备",
      desktop: "桌面显示器",
      laptop: "笔记本电脑",
      tv: "电视屏幕",
    };
    return labels[category] || category;
  };

  // 计算容器样式 - 确保内容完整展示
  // 如果用户没有设置尺寸规格，使用自适应模式
  const isAdaptive = preset.width === "100%";

  const containerStyle: React.CSSProperties = {
    width: isAdaptive ? "100%" : `${preset.width}px`,
    // 自适应模式下使用最小高度，让内容自然撑开
    height: "auto",
    minHeight: isAdaptive
      ? "400px"  // 自适应模式下的最小高度
      : preset.height === "100%"
        ? "100%"
        : `${preset.height}px`,
    maxHeight: isAdaptive ? "none" : "calc(100vh - 200px)", // 固定尺寸时限制最大高度
    margin: "0 auto",
    background: "white",
    overflow: "visible", // 允许内容完全展示
  };

  // iframe 错误处理
  const handleIframeError = useCallback(() => {
    setError("无法加载预览，可能存在语法错误");
  }, []);

  // iframe 加载成功
  const handleIframeLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    setError(null);
    
    // 在自适应模式下，自动调整 iframe 高度以适应内容
    if (isAdaptive) {
      try {
        const iframe = e.currentTarget;
        // 等待内容完全加载后调整高度
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc && iframeDoc.body) {
              const contentHeight = iframeDoc.body.scrollHeight;
              // 设置 iframe 高度为内容高度（加上一些padding）
              iframe.style.height = `${contentHeight + 20}px`;
            }
          } catch (err) {
            // 跨域限制可能导致无法访问 contentDocument，忽略错误
            console.debug('无法调整 iframe 高度:', err);
          }
        }, 100);
      } catch (err) {
        console.debug('iframe 加载处理失败:', err);
      }
    }
  }, [isAdaptive]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* 分辨率选择器 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            预览尺寸：
          </span>
          <Select.Root
            value={resolution}
            onValueChange={(value) =>
              setPreviewResolution(value as PreviewResolution)
            }
          >
            <Select.Trigger className="inline-flex items-center justify-between px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[180px] transition-colors duration-150">
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
                        {group.category === "mobile" && (
                          <Smartphone className="w-4 h-4 mr-2" />
                        )}
                        {group.category === "tablet" && (
                          <Tablet className="w-4 h-4 mr-2" />
                        )}
                        {group.category === "desktop" && (
                          <Monitor className="w-4 h-4 mr-2" />
                        )}
                        {group.category === "tv" && (
                          <Tv className="w-4 h-4 mr-2" />
                        )}
                        {group.category === "laptop" && (
                          <Laptop className="w-4 h-4 mr-2" />
                        )}
                        {getCategoryLabel(group.category)}
                      </Select.Label>
                      {group.items.map((preset) => (
                        <Select.Item
                          key={preset.key}
                          value={preset.key}
                          className="relative flex items-center px-3 py-2 text-sm rounded-md cursor-pointer outline-none select-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-slate-700 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-white transition-colors duration-150"
                        >
                          <Select.ItemText>{preset.label}</Select.ItemText>
                          <Select.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
                            <Check size={16} className="text-blue-600" />
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
      <div className="flex-1 flex items-start justify-center bg-gray-100 dark:bg-slate-900/50 p-6 overflow-y-auto overflow-x-hidden">
        {/* 代码验证失败提示 */}
        {!validation.valid ? (
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 shadow-sm p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                    代码存在语法错误
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    {validation.error}
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 border border-red-100 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      <strong>提示：</strong>
                      请检查左侧代码编辑器中的代码，修复语法错误后自动重新预览
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={containerStyle}
            className="shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white"
          >
            {error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">
                  {error}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  请检查代码语法是否正确
                </p>
              </div>
            ) : (
              iframeHtml && (
                <iframe
                  srcDoc={iframeHtml}
                  title="component-preview"
                  className="w-full border-0 rounded-lg bg-white"
                  style={{ minHeight: "inherit" }}
                  onError={handleIframeError}
                  onLoad={handleIframeLoad}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
