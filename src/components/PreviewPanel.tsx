import React, { useState, useMemo, useCallback } from "react";
import type { PreviewResolution } from "../types";
import {
  resolutionPresets,
} from "../constants/resolutions";
import { useStore } from "../store/useStore";
import * as Select from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from '../i18n';

// 设备类型定义
type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 设备类型配置 - 使用国际化标签
const getDevicePresets = (t: any) => ({
  desktop: {
    label: t.preview.desktop,
    icon: Monitor,
    resolutions: ['full', 'laptop', 'desktop', 'surface-pro7'] as PreviewResolution[],
  },
  tablet: {
    label: t.preview.tablet,
    icon: Tablet,
    resolutions: ['ipad-mini', 'ipad-air', 'ipad-pro', 'surface-duo'] as PreviewResolution[],
  },
  mobile: {
    label: t.preview.mobile,
    icon: Smartphone,
    resolutions: ['iphone-se', 'iphone-xr', 'iphone-12-pro', 'iphone-14-pro-max', 'pixel-7', 'pixel-7-pro'] as PreviewResolution[],
  },
});

// Helper function to get localized resolution label
const getResolutionLabel = (key: PreviewResolution, t: any): string => {
  const labelMap: Record<PreviewResolution, string> = {
    'full': t.preview.fullscreenAdaptive,
    'laptop': `${t.preview.laptopSize} (1366×768)`,
    'desktop': `${t.preview.desktopSize} (1920×1080)`,
    'surface-pro7': `${t.preview.surfacePro7} (912×1368)`,
    'ipad-mini': `${t.preview.ipadMini} (768×1024)`,
    'ipad-air': `${t.preview.ipadAir} (820×1180)`,
    'ipad-pro': `${t.preview.ipadPro} (1024×1366)`,
    'surface-duo': `${t.preview.surfaceDuo} (540×720)`,
    'iphone-se': `${t.preview.iphoneSE} (375×667)`,
    'iphone-xr': `${t.preview.iphoneXR} (414×896)`,
    'iphone-12-pro': `${t.preview.iphone12Pro} (390×844)`,
    'iphone-14-pro-max': `${t.preview.iphone14ProMax} (430×932)`,
    'pixel-7': `${t.preview.pixel7} (412×915)`,
    'pixel-7-pro': `${t.preview.pixel7Pro} (480×1024)`,
    'galaxy-s8': `${t.preview.galaxyS8} (360×740)`,
    'galaxy-s20-ultra': `${t.preview.galaxyS20Ultra} (412×915)`,
    'galaxy-z-fold5': `${t.preview.galaxyZFold5} (674×904)`,
    'galaxy-a51': `${t.preview.galaxyA51} (412×914)`,
    'zenbook-fold': `${t.preview.zenbookFold} (853×1280)`,
    'nest-hub': `${t.preview.nestHub} (1024×600)`,
    'nest-hub-max': `${t.preview.nestHubMax} (1280×800)`,
  };
  
  return labelMap[key] || key;
};

// 辅助函数: 检查常见的 AI 生成语法错误
function checkCommonSyntaxErrors(code: string): string[] {
  const errors: string[] = [];

  // 1. 检测三元运算符中使用点号代替冒号的错误
  // 错误示例: ...(isOutOfStock ? styles.outOfStockTag.inStockTag)
  // 正确示例: ...(isOutOfStock ? styles.outOfStockTag : styles.inStockTag)
  const ternaryDotPattern = /\?\s*\w+\.\w+\.\w+\s*[),}]/g;
  const ternaryMatches = code.match(ternaryDotPattern);
  if (ternaryMatches) {
    ternaryMatches.forEach((match) => {
      // 提取行号
      const lines = code.substring(0, code.indexOf(match)).split('\n');
      const lineNumber = lines.length;
      errors.push(
        `第 ${lineNumber} 行: 三元运算符语法错误 "${match.trim()}"，应该是 "? value1 : value2" 而不是 "? obj1.obj2"`
      );
    });
  }

  // 2. 检测未闭合的括号 (简单检测)
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`括号不匹配: ${openParens} 个 "(" 但只有 ${closeParens} 个 ")"`);
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`大括号不匹配: ${openBraces} 个 "{" 但只有 ${closeBraces} 个 "}"`);
  }

  // 3. 检测常见的事件处理器类型注解错误
  // 错误示例: (e.MouseEvent) => 应该是 (e: MouseEvent) =>
  const wrongEventTypePattern = /\(\w+\.MouseEvent\)/g;
  const eventTypeMatches = code.match(wrongEventTypePattern);
  if (eventTypeMatches) {
    errors.push(
      `发现类型注解语法错误: ${eventTypeMatches.join(', ')}。前端渲染不支持 TypeScript，应移除类型注解。`
    );
  }

  return errors;
}

// 提取组件名称
function extractComponentName(code: string): string {
  console.log('🔍 开始提取组件名...');
  
  // 0. 如果是多文件结构，从 FILE 标记中提取主组件文件名
  const fileRegex = /\/\/\s*======\s*FILE:\s*([^\n]+)\s*======/g;
  const files: string[] = [];
  let match;
  while ((match = fileRegex.exec(code)) !== null) {
    const fileName = match[1].trim();
    files.push(fileName);
    console.log(`  - 发现文件: ${fileName}`);
  }
  
  // 如果有多文件，尝试从主组件文件（component.tsx 或 index.tsx）提取
  if (files.length > 1) {
    const mainFile = files.find(f => 
      f.includes('component') || f.includes('index') || f.includes('App')
    );
    if (mainFile) {
      // 从文件名提取组件名（去掉扩展名，转为首字母大写）
      const componentName = mainFile
        .replace(/\.(tsx|ts|jsx|js)$/, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      console.log(`✅ 从多文件结构提取组件名: ${componentName}`);
      return componentName;
    }
  }

  // 1. 优先查找 export default 的组件名
  const exportDefaultMatch = code.match(
    /export\s+default\s+function\s+(\w+)/,
  );
  if (exportDefaultMatch) {
    console.log(`✅ 匹配到 export default function: ${exportDefaultMatch[1]}`);
    return exportDefaultMatch[1];
  }

  // 2. 查找 export default 的变量名
  const exportDefaultVarMatch = code.match(
    /export\s+default\s+(\w+)\s*;/,
  );
  if (exportDefaultVarMatch) {
    console.log(`✅ 匹配到 export default 变量: ${exportDefaultVarMatch[1]}`);
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
    const name = componentMatch?.[1] || componentMatch?.[2] || "MainComponent";
    console.log(`⚠️ 匿名箭头函数，使用默认名: ${name}`);
    return name;
  }

  // 4. 尝试找 function Component (大写字母开头)
  const functionMatch = code.match(/function\s+([A-Z]\w+)/);
  if (functionMatch) {
    console.log(`✅ 匹配到 function 声明: ${functionMatch[1]}`);
    return functionMatch[1];
  }

  // 5. 尝试找 const Component = （大写字母开头，通常是组件）
  const constMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*\(?[^)]*\)?\s*=>/);
  if (constMatch) {
    console.log(`✅ 匹配到 const 箭头函数: ${constMatch[1]}`);
    return constMatch[1];
  }

  // 6. 尝试找 const Component = function
  const constFunctionMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*function/);
  if (constFunctionMatch) {
    console.log(`✅ 匹配到 const function: ${constFunctionMatch[1]}`);
    return constFunctionMatch[1];
  }

  // 7. 最后兜底：从第一个大写字母开头的标识符推断
  const firstComponentMatch = code.match(/\b([A-Z][a-zA-Z]+)\s*[=:]/);
  if (firstComponentMatch) {
    console.log(`⚠️ 兜底策略，使用第一个组件名: ${firstComponentMatch[1]}`);
    return firstComponentMatch[1];
  }

  // 8. 实在找不到，返回默认值
  console.warn('❌ 无法提取组件名，使用默认值 "App"');
  console.log('代码片段:', code.substring(0, 200));
  return "App";
}

// 预处理代码: 移除类型注解、导入语句等,使其能在浏览器中运行
function preprocessCodeForBrowser(code: string): string {
  let processed = code;

  // ⚠️ 语法检查: 在预处理之前先检测常见语法错误
  const syntaxErrors = checkCommonSyntaxErrors(processed);
  if (syntaxErrors.length > 0) {
    console.error('⚠️ 检测到语法错误:', syntaxErrors);
    // 抛出错误,让上层处理
    throw new Error(
      `代码包含语法错误:\n${syntaxErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}\n\n请重新生成代码。`
    );
  }

  // 1. 移除所有 export 关键字（包括 export default、export const 等）
  // ⚠️ 重要：使用更精确的正则，避免产生双重 export 或语法错误
  // 错误示例: "export export function" 或 "export const export"
  processed = processed.replace(/^export\s+default\s+/gm, '');
  processed = processed.replace(/^export\s+(const|let|var|function|class|interface|type|enum)\s+/gm, '$1 ');
  processed = processed.replace(/\bexport\s*\{[^}]*\}\s*;?/gm, ''); // export { ... }
  processed = processed.replace(/\bexport\s+\*\s+from\s+['"][^'"]+['"]\s*;?/gm, ''); // export * from '...'

  // 1.5 ⚠️ 新增: 移除 CommonJS 模块导出语法（浏览器不支持）
  // 错误示例: exports.someFunction = function() {}
  // 错误示例: module.exports = { ... }
  // 移除所有 exports.xxx 和 module.exports 语句
  processed = processed.replace(/^exports\.\w+\s*=\s*[^;]+;?\s*$/gm, '');
  processed = processed.replace(/^module\.exports\s*=\s*[^;]+;?\s*$/gm, '');
  processed = processed.replace(/\bexports\s*=\s*\{[^}]*\};?/g, '');

  // 2. 移除 Markdown 代码块标记
  processed = processed.replace(/```(?:tsx|typescript|javascript|jsx|vue)?\n?/gi, '');
  processed = processed.replace(/\n?```\s*$/g, '');

  // 3. 移除结束标记
  processed = processed.replace(/\/\/ \[END_OF_CODE\]/g, '');
  processed = processed.replace(/\/\/ \[FILE_END\]/g, '');

  // 4. 处理 import 语句
  // 4.1 移除 React 导入,但保留 React 命名空间的使用
  processed = processed.replace(/import\s+React\s+from\s+['"]react['"]\s*;?/g, '');

  // 4.2 移除 React hooks 的解构导入,替换为 React.useState 等
  const hooks = [
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext',
    'useReducer',
    'useLayoutEffect',
  ];

  // 先提取所有 React hooks 的导入
  const reactImportMatch = processed.match(
    /import\s+\{([^}]+)\}\s+from\s+['"]react['"]\s*;?/
  );
  if (reactImportMatch) {
    const importedHooks = reactImportMatch[1]
      .split(',')
      .map((h: string) => h.trim())
      .filter((h: string) => hooks.includes(h));

    // 移除 React 导入行
    processed = processed.replace(
      /import\s+\{[^}]+\}\s+from\s+['"]react['"]\s*;?/g,
      ''
    );

    // 将使用的 hooks 替换为 React.hook 形式
    importedHooks.forEach((hook: string) => {
      const regex = new RegExp(`\\b${hook}\\b`, 'g');
      processed = processed.replace(regex, `React.${hook}`);
    });
  }

  // 4.4 处理其他库的 import (如 lucide-react)
  processed = processed.replace(
    /import\s+.*?\s+from\s+['"][^'"]+['"]\s*;?/g,
    "// Import removed for browser preview",
  );

  // 5. 移除 TypeScript 类型注解（使用更安全的方法）

  // 5.0 移除独立的类型定义语句（如：(product: Product) => void;）
  // 匹配模式：以 ( 或标识符开头，包含 : Type，以 ; 结尾的独立行
  processed = processed.replace(/^\s*\([^)]*:\s*\w+\)\s*=>\s*\w+;\s*$/gm, '');
  processed = processed.replace(/^\s*\w+\s*:\s*\w+\s*=>\s*\w+;\s*$/gm, '');

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

  // ⚠️ 新增: 处理多行的对象类型注解（如 Props 接口）
  // 匹配模式: function Name({ param1, param2 }: {\n  param1: Type;\n  param2: Type;\n})
  // 策略: 移除整个 : { ... } 部分
  processed = processed.replace(
    /(function\s+\w+\s*\(\{[^}]*\}\s*)\s*:\s*\{[\s\S]*?\}\s*\)/g,
    "$1)"
  );
  
  // 处理箭头函数的多行对象类型
  processed = processed.replace(
    /((?:const|let|var)\s+\w+\s*=\s*\(\{[^}]*\}\s*)\s*:\s*\{[\s\S]*?\}\s*\)\s*=>/g,
    "$1) =>"
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

  // 5.6 移除函数参数的类型注解（通用模式）
  // 匹配：param: Type 在括号内
  // 注意: 不能匹配对象字面量中的属性 (如 style={{ fontWeight: 500 }})
  // 策略: 只在函数参数列表的上下文中移除类型注解
  
  // 先处理函数参数中的类型注解 (更精确的模式)
  // 匹配: (param1: Type, param2: Type) => 或 function name(param: Type)
  processed = processed.replace(
    /(\([^)]*)\b(\w+)\s*:\s*(?:\w+(?:<[^>]*>)?|\{[^}]*\})([^)]*\))/g,
    '$1$2$3'
  );
  
  // 处理箭头函数的单个参数: (param: Type) =>
  processed = processed.replace(
    /\((\w+)\s*:\s*(?:\w+(?:<[^>]*>)?|\{[^}]*\})\)\s*=>/g,
    '($1) =>'
  );

  // ⚠️ 新增: 移除 React.useRef、useState 等 Hook 的泛型类型注解
  // 错误示例: React.useRef<Map<string, HTMLButtonElement | null>>(new Map())
  // 正确示例: React.useRef(new Map())
  processed = processed.replace(
    /(React\.(?:useRef|useState|useCallback|useMemo|useReducer|useContext))\s*<[^>]*>/g,
    '$1'
  );

  // ⚠️ 新增: 移除普通泛型函数的类型参数（如 customHook<Type>()）
  // 匹配: function<Type>( 或 const func = <Type>(
  processed = processed.replace(
    /(function\s+\w+\s*|const\s+\w+\s*=\s*)<[^>]+>\s*\(/g,
    '$1('
  );

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

// 简单的语法检查函数
function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: true };
  }

  try {
    // 清理代码
    let cleanCode = code.trim();
    
    // 检查并移除代码块标记
    if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
      cleanCode = cleanCode.replace(/\n?```$/, '');
      cleanCode = cleanCode.trim();
    }

    // ⚠️ 优先检测代码截断特征（在括号匹配之前）
    const lines = cleanCode.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    
    // 截断的特征模式
    const truncationPatterns = [
      { pattern: /,\s*$/, desc: '逗号' },
      { pattern: /\.\.\.\s*$/, desc: '省略号' },
      { pattern: /\.\s*$/, desc: '点号' },
      { pattern: /=>\s*$/, desc: '箭头函数' },
      { pattern: /=\s*$/, desc: '赋值符号' },
      { pattern: /\(\s*$/, desc: '开括号' },
      { pattern: /\{\s*$/, desc: '开大括号' },
      { pattern: /['"`][^'"`]*$/, desc: '未闭合的字符串' },
    ];
    
    for (const { pattern, desc } of truncationPatterns) {
      if (pattern.test(lastLine)) {
        return { 
          valid: false, 
          error: `⚠️ 代码结构不完整/被截断\n\n最后一行以${desc}结尾，可能是 AI 生成时被截断了。\n\n建议：点击"重新生成"按钮让 AI 重新生成完整代码。` 
        };
      }
    }

    // 检查基本语法
    const isReactCode =
      cleanCode.includes("React") ||
      cleanCode.includes("jsx") ||
      cleanCode.includes("tsx") ||
      cleanCode.includes("import React");

    if (isReactCode) {
      // 检查括号匹配
      const parentheses = cleanCode.match(/[()]/g) || [];
      let balance = 0;
      for (const char of parentheses) {
        if (char === "(") balance++;
        else if (char === ")") balance--;
        if (balance < 0) {
          return { valid: false, error: "括号不匹配，请检查代码" };
        }
      }
      if (balance !== 0) {
        return { valid: false, error: `括号不匹配（差 ${Math.abs(balance)} 个括号），请检查代码` };
      }

      // 检查大括号匹配
      const braces = cleanCode.match(/[{}]/g) || [];
      balance = 0;
      for (const char of braces) {
        if (char === "{") balance++;
        else if (char === "}") balance--;
        if (balance < 0) {
          return { valid: false, error: "大括号不匹配，请检查代码" };
        }
      }
      if (balance !== 0) {
        return { valid: false, error: `大括号不匹配（差 ${Math.abs(balance)} 个大括号），请检查代码` };
      }

      // 检查尖括号匹配（JSX）- 简化检查，避免误报
      const openTags = (cleanCode.match(/<[A-Z][a-zA-Z]*(?![^>]*\/>)(?![^>]*\/)\s*>/g) || []).length;
      const closeTags = (cleanCode.match(/<\/[A-Z][a-zA-Z]*>/g) || []).length;
      
      // 只在不匹配时才警告
      if (openTags !== closeTags && Math.abs(openTags - closeTags) > 2) {
        console.warn(`可能存在未闭合的 JSX 标签（开标签: ${openTags}, 闭标签: ${closeTags}）`);
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
  const { t, language } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  // 新增：代码粘贴测试功能
  const [testCode, setTestCode] = useState<string>("");
  const [showTestArea, setShowTestArea] = useState<boolean>(false);
  
  // 设备切换状态
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    // 根据当前分辨率初始化设备类型
    if (resolution === 'full' || resolution.includes('macbook') || resolution.includes('surface')) {
      return 'desktop';
    }
    if (resolution.includes('ipad') || resolution.includes('surface-go')) {
      return 'tablet';
    }
    return 'mobile';
  });

  const devicePresets = getDevicePresets(t);
  const preset = resolutionPresets[resolution];

  // 验证代码
  const validation = useMemo(() => {
    if (!code) return { valid: true };
    return validateCode(code);
  }, [code]);

  // 处理iframe srcDoc
  const iframeHtml = useMemo(() => {
    if (!code) {
      // Get current language from URL
      const isZh = window.location.pathname.startsWith('/zh');
      const emptyMessage = isZh ? '点击左侧"生成组件"按钮开始' : 'Click "Generate Component" button on the left to start';
      
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
    <p class="text-lg">${emptyMessage}</p>
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

  // 处理测试代码的渲染
  const handleTestCodeRender = () => {
    if (!testCode.trim()) {
      setError("请输入要测试的代码");
      return;
    }
    
    console.log('🧪 开始测试代码渲染...');
    console.log('=== 测试代码 ===');
    console.log(testCode);
    
    // 提取组件名
    const componentName = extractComponentName(testCode);
    console.log(`📦 提取的组件名: ${componentName}`);
    
    // 预处理代码
    const processedCode = preprocessCodeForBrowser(testCode);
    console.log('=== 预处理后的代码 ===');
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
    
    // 创建一个新的iframe来显示测试结果
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e5e7eb';
    iframe.style.marginTop = '20px';
    iframe.srcdoc = html;
    
    // 清除旧的测试结果
    const oldTestResult = document.getElementById('test-result-container');
    if (oldTestResult) {
      oldTestResult.remove();
    }
    
    // 添加新的测试结果容器
    const container = document.createElement('div');
    container.id = 'test-result-container';
    container.innerHTML = '<h3 style="margin: 10px 0; color: #374151;">🧪 测试结果:</h3>';
    container.appendChild(iframe);
    
    // 插入到测试区域下方
    const testArea = document.getElementById('test-code-area');
    if (testArea) {
      testArea.parentNode?.insertBefore(container, testArea.nextSibling);
    }
    
    setError(null);
  };

  // 清空测试代码
  const handleClearTest = () => {
    setTestCode("");
    setError(null);
    const oldTestResult = document.getElementById('test-result-container');
    if (oldTestResult) {
      oldTestResult.remove();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* 顶部工具栏 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          {/* 左侧：设备类型切换 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t.preview.device}
            </span>
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              {(Object.keys(devicePresets) as DeviceType[]).map((type) => {
                const config = devicePresets[type];
                const Icon = config.icon;
                const isActive = deviceType === type;
                
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setDeviceType(type);
                      // 切换到该设备的第一个分辨率
                      if (config.resolutions.length > 0) {
                        setPreviewResolution(config.resolutions[0]);
                      }
                    }}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                      ${isActive 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* 右侧：具体设备尺寸选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t.preview.size}
            </span>
            <Select.Root
              value={resolution}
              onValueChange={(value) =>
                setPreviewResolution(value as PreviewResolution)
              }
            >
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-50 min-w-[180px] transition-colors duration-150">
                <Select.Value placeholder={language === 'en' ? 'Select device size' : '选择设备尺寸'} />
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
                    {/* 只显示当前设备类型的分辨率 */}
                    {devicePresets[deviceType].resolutions.map((resKey) => {
                      const item = resolutionPresets[resKey];
                      const localizedLabel = getResolutionLabel(resKey, t);
                      return (
                        <Select.Item
                          key={item.key}
                          value={item.key}
                          className="relative flex items-center px-3 py-2 rounded-md text-sm cursor-pointer select-none outline-none data-[highlighted]:bg-blue-50 dark:data-[highlighted]:bg-blue-900/20 data-[highlighted]:text-blue-700 dark:data-[highlighted]:text-blue-300 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:bg-blue-900/20 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-blue-300 transition-colors duration-150"
                        >
                          <Select.ItemText>{localizedLabel}</Select.ItemText>
                          <Select.ItemIndicator className="absolute right-2">
                            <Check size={14} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      );
                    })}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          
          {/* 代码测试按钮 - 独立放置在右侧 */}
          <button
            onClick={() => setShowTestArea(!showTestArea)}
            className="px-3 py-1.5 text-sm rounded-md border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-150 flex items-center gap-1"
            title={language === 'en' ? 'Paste code to test directly' : '粘贴代码直接测试渲染，无需走完整生成流程'}
          >
            <span>🧪</span>
            <span>{showTestArea ? t.preview.hideTest : t.preview.codeTest}</span>
          </button>
        </div>
        
        {/* 代码粘贴测试区域 */}
        {showTestArea && (
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
        )}
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
                    {t.preview.syntaxError}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    {validation.error}
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 border border-red-100 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      <strong>{language === 'en' ? 'Tip:' : '提示：'}</strong>
                      {t.preview.errorHint}
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
                  {t.preview.checkSyntax}
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
