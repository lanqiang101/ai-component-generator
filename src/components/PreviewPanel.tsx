import React, { useState, useMemo, useCallback } from "react";
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

// 简单的语法检查函数
function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: true };
  }

  try {
    // 清理代码
    let cleanCode = code.trim();

    // 检查并移除代码块标记
    if (cleanCode.startsWith("```")) {
      cleanCode = cleanCode.replace(
        /^```(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i,
        "",
      );
      cleanCode = cleanCode.replace(/\n?```$/, "");
      cleanCode = cleanCode.trim();
    }

    // 检查代码是否被截断
    // 1. 检查是否以不完整的语句结尾
    const incompletePatterns = [
      /\.\.\.$/, // 省略号结尾
      /=>\s*$/, // 箭头函数未完整
      /\(\s*$/, // 未闭合的左括号
      /\{\s*$/, // 未闭合的左大括号
      /<\s*$/, // 未闭合的尖括号
      /['"`]$/, // 未闭合的引号
      /,\s*$/, // 逗号结尾(可能是参数列表未完整)
      /\.\w*$/, // 属性访问未完整 (如 console.log('Nav)
    ];

    const lastLine = cleanCode.split("\n").pop()?.trim() || "";
    for (const pattern of incompletePatterns) {
      if (pattern.test(lastLine)) {
        return {
          valid: false,
          error: `代码结构不完整：最后一行 "${lastLine.substring(0, 50)}..." 似乎被截断，请重新生成`,
        };
      }
    }

    // 2. 检查是否存在严重的不完整语句（如未闭合的字符串）
    const unclosedStringMatch = cleanCode.match(/['"`][^'"`]*$/);
    if (unclosedStringMatch) {
      return {
        valid: false,
        error: `代码结构不完整：发现未闭合的字符串，代码可能被截断，请重新生成`,
      };
    }

    // 检查基本语法
    const isReactCode =
      cleanCode.includes("React") ||
      cleanCode.includes("jsx") ||
      cleanCode.includes("tsx") ||
      cleanCode.includes("import React");

    if (isReactCode) {
      // 移除字符串和注释中的内容，避免误判
      const codeWithoutStrings = cleanCode
        // 移除单行注释
        .replace(/\/\/.*$/gm, "")
        // 移除多行注释
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // 移除模板字符串
        .replace(/`[^`]*`/g, '""')
        // 移除双引号字符串
        .replace(/"[^"]*"/g, '""')
        // 移除单引号字符串
        .replace(/'[^']*'/g, '""');

      // 检查括号匹配
      const parentheses = codeWithoutStrings.match(/[()]/g) || [];
      let balance = 0;
      for (const char of parentheses) {
        if (char === "(") balance++;
        else if (char === ")") balance--;
        if (balance < 0) {
          return { valid: false, error: "括号不匹配：发现多余的右括号 ')'" };
        }
      }
      if (balance > 0) {
        return {
          valid: false,
          error: `括号不匹配：缺少 ${balance} 个右括号 ')'`,
        };
      }
      if (balance < 0) {
        return {
          valid: false,
          error: `括号不匹配：缺少 ${Math.abs(balance)} 个左括号 '('`,
        };
      }

      // 检查大括号匹配
      const braces = codeWithoutStrings.match(/[{}]/g) || [];
      balance = 0;
      for (const char of braces) {
        if (char === "{") balance++;
        else if (char === "}") balance--;
        if (balance < 0) {
          return { valid: false, error: "大括号不匹配：发现多余的右括号 '}'" };
        }
      }
      if (balance > 0) {
        return {
          valid: false,
          error: `大括号不匹配：缺少 ${balance} 个右括号 '}'`,
        };
      }
      if (balance < 0) {
        return {
          valid: false,
          error: `大括号不匹配：缺少 ${Math.abs(balance)} 个左括号 '{'`,
        };
      }

      // 检查尖括号匹配（JSX）- 简化检查，避免误报
      const openTags = (
        cleanCode.match(/<[A-Z][a-zA-Z]*(?![^>]*\/>)(?![^>]*\/)\s*>/g) || []
      ).length;
      const closeTags = (cleanCode.match(/<\/[A-Z][a-zA-Z]*>/g) || []).length;

      // 只在不匹配时才警告
      if (openTags !== closeTags && Math.abs(openTags - closeTags) > 2) {
        console.warn(
          `可能存在未闭合的 JSX 标签（开标签: ${openTags}, 闭标签: ${closeTags}）`,
        );
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

  // 获取分辨率预设，如果不存在则使用默认的 full
  const preset = resolutionPresets[resolution] || resolutionPresets["full"];

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
    const isHtmlCode = code.includes("<!DOCTYPE") || code.includes("<html");

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
  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js"></script>
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
  }, [code, validation]);

  // 提取组件名称
  function extractComponentName(code: string): string {
    // 0. 如果是多文件结构，从 FILE 标记中提取主组件文件名
    const fileRegex = /\/\/\s*======\s*FILE:\s*([^\n]+)\s*======/g;
    const files: string[] = [];
    let match;
    while ((match = fileRegex.exec(code)) !== null) {
      const fileName = match[1].trim();
      files.push(fileName);
    }

    // 如果有多文件，尝试从主组件文件（component.tsx 或 index.tsx）提取
    if (files.length > 1) {
      const mainFile = files.find(
        (f) =>
          f.includes("component") || f.includes("index") || f.includes("App"),
      );
      if (mainFile) {
        // 从文件名提取组件名（去掉扩展名，转为首字母大写）
        const componentName = mainFile
          .replace(/\.(tsx|ts|jsx|js)$/, "")
          .replace(/[-_]/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("");
        return componentName;
      }
    }

    // 1. 优先查找 export default 的组件名
    const exportDefaultMatch = code.match(
      /export\s+default\s+function\s+(\w+)/,
    );
    if (exportDefaultMatch) {
      return exportDefaultMatch[1];
    }

    // 2. 查找 export default 的变量名
    const exportDefaultVarMatch = code.match(/export\s+default\s+(\w+)\s*;/);
    if (exportDefaultVarMatch) {
      return exportDefaultVarMatch[1];
    }

    // 3. 查找 export default 的箭头函数
    const exportDefaultArrowMatch = code.match(
      /export\s+default\s+\(\s*\)\s*=>\s*\{/,
    );
    if (exportDefaultArrowMatch) {
      // 尝试从注释或上下文中找到组件名
      const componentMatch = code.match(
        /\/\/\s*主组件[：:]\s*(\w+)|\/\*\s*主组件[：:]\s*(\w+)/,
      );
      const name =
        componentMatch?.[1] || componentMatch?.[2] || "MainComponent";
      return name;
    }

    // 4. 尝试找 function Component (大写字母开头)
    const functionMatch = code.match(/function\s+([A-Z]\w+)/);
    if (functionMatch) {
      return functionMatch[1];
    }

    // 5. 尝试找 const Component = （大写字母开头，通常是组件）
    const constMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*\(?[^)]*\)?\s*=>/);
    if (constMatch) {
      return constMatch[1];
    }

    // 6. 尝试找 const Component = function
    const constFunctionMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*function/);
    if (constFunctionMatch) {
      return constFunctionMatch[1];
    }

    // 7. 最后兜底：从第一个大写字母开头的标识符推断
    const firstComponentMatch = code.match(/\b([A-Z][a-zA-Z]+)\s*[=:]/);
    if (firstComponentMatch) {
      return firstComponentMatch[1];
    }

    // 8. 实在找不到，返回默认值
    return "App";
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
      ? "400px" // 自适应模式下的最小高度
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
  const handleIframeLoad = useCallback(
    (e: React.SyntheticEvent<HTMLIFrameElement>) => {
      setError(null);

      // 在自适应模式下，自动调整 iframe 高度以适应内容
      if (isAdaptive) {
        try {
          const iframe = e.currentTarget;
          // 等待内容完全加载后调整高度
          setTimeout(() => {
            try {
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc && iframeDoc.body) {
                const contentHeight = iframeDoc.body.scrollHeight;
                // 设置 iframe 高度为内容高度（加上一些padding）
                iframe.style.height = `${contentHeight + 20}px`;
              }
            } catch (err) {
              // 跨域限制可能导致无法访问 contentDocument，忽略错误
              console.debug("无法调整 iframe 高度:", err);
            }
          }, 100);
        } catch (err) {
          console.debug("iframe 加载处理失败:", err);
        }
      }
    },
    [isAdaptive],
  );

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
              <Select.Value placeholder="全屏自适应" />
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
                      {group.items.map((item) => (
                        <Select.Item
                          key={item.key}
                          value={item.key}
                          className="relative flex items-center px-3 py-2 rounded-md text-sm cursor-pointer select-none outline-none data-[highlighted]:bg-blue-50 dark:data-[highlighted]:bg-blue-900/20 data-[highlighted]:text-blue-700 dark:data-[highlighted]:text-blue-300 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:bg-blue-900/20 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-blue-300 transition-colors duration-150"
                        >
                          <Select.ItemText>{item.label}</Select.ItemText>
                          <Select.ItemIndicator className="absolute right-2">
                            <Check size={14} />
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
                      请检查下方代码编辑器中的代码，修复语法错误后自动重新预览
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
              <iframe
                id="preview-iframe"
                srcDoc={iframeHtml || ""}
                title="component-preview"
                className="w-full border-0 rounded-lg bg-white"
                style={{ minHeight: "inherit" }}
                onError={handleIframeError}
                onLoad={handleIframeLoad}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
