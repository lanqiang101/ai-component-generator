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

// Device type definition
type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Device type configuration - using internationalized labels
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

// Helper function: Check common AI-generated syntax errors
function checkCommonSyntaxErrors(code: string): string[] {
  const errors: string[] = [];

  // 1. Detect ternary operator using dot instead of colon error
  // Error example: ...(isOutOfStock ? styles.outOfStockTag.inStockTag)
  // Correct example: ...(isOutOfStock ? styles.outOfStockTag : styles.inStockTag)
  const ternaryDotPattern = /\?\s*\w+\.\w+\.\w+\s*[),}]/g;
  const ternaryMatches = code.match(ternaryDotPattern);
  if (ternaryMatches) {
    ternaryMatches.forEach((match) => {
      // Extract line number
      const lines = code.substring(0, code.indexOf(match)).split('\n');
      const lineNumber = lines.length;
      errors.push(
        `Line ${lineNumber}: Ternary operator syntax error "${match.trim()}", should be "? value1 : value2" not "? obj1.obj2"`
      );
    });
  }

  // 2. Detect unclosed parentheses (simple check)
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Parentheses mismatch: ${openParens} "(" but only ${closeParens} ")"`);
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Braces mismatch: ${openBraces} "{" but only ${closeBraces} "}"`);
  }

  // 3. Detect common event handler type annotation errors
  // Error example: (e.MouseEvent) => Should be (e: MouseEvent) =>
  const wrongEventTypePattern = /\(\w+\.MouseEvent\)/g;
  const eventTypeMatches = code.match(wrongEventTypePattern);
  if (eventTypeMatches) {
    errors.push(
      `Found type annotation syntax errors: ${eventTypeMatches.join(', ')}. Frontend rendering does not support TypeScript, remove type annotations.`
    );
  }

  return errors;
}

// Extract component name
function extractComponentName(code: string): string {
  console.log('🔍 Starting to extract component name...');
  
  // 0. If it's a multi-file structure, extract the main component file name from FILE markers
  const fileRegex = /\/\/\s*======\s*FILE:\s*([^\n]+)\s*======/g;
  const files: string[] = [];
  let match;
  while ((match = fileRegex.exec(code)) !== null) {
    const fileName = match[1].trim();
    files.push(fileName);
    console.log(`  - Found file: ${fileName}`);
  }
  
  // If there are multiple files, try to extract from the main component file (component.tsx or index.tsx)
  if (files.length > 1) {
    const mainFile = files.find(f => 
      f.includes('component') || f.includes('index') || f.includes('App')
    );
    if (mainFile) {
      // Extract component name from file name (remove extension, capitalize first letter)
      const componentName = mainFile
        .replace(/\.(tsx|ts|jsx|js)$/, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      console.log(`✅ Extracted component name from multi-file structure: ${componentName}`);
      return componentName;
    }
  }

  // 1. Prioritize matching export default function name
  const exportDefaultMatch = code.match(
    /export\s+default\s+function\s+(\w+)/,
  );
  if (exportDefaultMatch) {
    console.log(`✅ Matched export default function: ${exportDefaultMatch[1]}`);
    return exportDefaultMatch[1];
  }

  // 2. Match export default variable name
  const exportDefaultVarMatch = code.match(
    /export\s+default\s+(\w+)\s*;/,
  );
  if (exportDefaultVarMatch) {
    console.log(`✅ Matched export default variable: ${exportDefaultVarMatch[1]}`);
    return exportDefaultVarMatch[1];
  }

  // 3. Match export default arrow function
  const exportDefaultArrowMatch = code.match(
    /export\s+default\s+\(\s*\)\s*=>\s*\{/,
  );
  if (exportDefaultArrowMatch) {
    // Try to find component name from comments or context
    const componentMatch = code.match(
      /\/\/\s*Main component[：:]\s*(\w+)|\/\*\s*Main component[：:]\s*(\w+)/,
    );
    const name = componentMatch?.[1] || componentMatch?.[2] || "MainComponent";
    console.log(`⚠️ Anonymous arrow function, using default name: ${name}`);
    return name;
  }

  // 4. Try to find function Component (capital letter start)
  const functionMatch = code.match(/function\s+([A-Z]\w+)/);
  if (functionMatch) {
    console.log(`✅ Matched function declaration: ${functionMatch[1]}`);
    return functionMatch[1];
  }

  // 5. Try to find const Component = (capital letter start, usually a component)
  const constMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*\(?[^)]*\)?\s*=>/);
  if (constMatch) {
    console.log(`✅ Matched const arrow function: ${constMatch[1]}`);
    return constMatch[1];
  }

  // 6. Try to find const Component = function
  const constFunctionMatch = code.match(/const\s+([A-Z]\w+)\s*=\s*function/);
  if (constFunctionMatch) {
    console.log(`✅ Matched const function: ${constFunctionMatch[1]}`);
    return constFunctionMatch[1];
  }

  // 7. Last resort: Infer from the first capital letter identifier
  const firstComponentMatch = code.match(/\b([A-Z][a-zA-Z]+)\s*[=:]/);
  if (firstComponentMatch) {
    console.log(`⚠️ Fallback strategy, using first component name: ${firstComponentMatch[1]}`);
    return firstComponentMatch[1];
  }

  // 8. If all else fails, return default value
  console.warn('❌ Unable to extract component name, using default value "App"');
  console.log('Code snippet:', code.substring(0, 200));
  return "App";
}

// Preprocess code: Remove type annotations, import statements, etc. to make it runnable in the browser
function preprocessCodeForBrowser(code: string): string {
  let processed = code;

  // ⚠️ Syntax check: Check for common syntax errors before preprocessing
  const syntaxErrors = checkCommonSyntaxErrors(processed);
  if (syntaxErrors.length > 0) {
    console.error('⚠️ Syntax errors detected:', syntaxErrors);
    // Throw error for upper layer to handle
    throw new Error(
      `Code contains syntax errors:\n${syntaxErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}\n\nPlease regenerate the code.`
    );
  }

  // 1. Remove all export keywords (including export default, export const, etc.)
  // ⚠️ Important: Use more precise regex to avoid double export or syntax errors
  // Error example: "export export function" or "export const export"
  processed = processed.replace(/^export\s+default\s+/gm, '');
  processed = processed.replace(/^export\s+(const|let|var|function|class|interface|type|enum)\s+/gm, '$1 ');
  processed = processed.replace(/\bexport\s*\{[^}]*\}\s*;?/gm, ''); // export { ... }
  processed = processed.replace(/\bexport\s+\*\s+from\s+['"][^'"]+['"]\s*;?/gm, ''); // export * from '...'

  // 1.5 ⚠️ New: Remove CommonJS module export syntax (not supported in browsers)
  // Error example: exports.someFunction = function() {}
  // Error example: module.exports = { ... }
  // Remove all exports.xxx and module.exports statements
  processed = processed.replace(/^exports\.\w+\s*=\s*[^;]+;?\s*$/gm, '');
  processed = processed.replace(/^module\.exports\s*=\s*[^;]+;?\s*$/gm, '');
  processed = processed.replace(/\bexports\s*=\s*\{[^}]*\};?/g, '');

  // 2. Remove code block markers
  processed = processed.replace(/```(?:tsx|typescript|javascript|jsx|vue)?\n?/gi, '');
  processed = processed.replace(/\n?```\s*$/g, '');

  // 3. Remove end markers
  processed = processed.replace(/\/\/ \[END_OF_CODE\]/g, '');
  processed = processed.replace(/\/\/ \[FILE_END\]/g, '');

  // 4. Process import statements
  // 4.1 Remove React import, but keep React namespace usage
  processed = processed.replace(/import\s+React\s+from\s+['"]react['"]\s*;?/g, '');

  // 4.2 Remove React hooks destructuring import, replace with React.useState etc.
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

  // First extract all React hooks imports
  const reactImportMatch = processed.match(
    /import\s+\{([^}]+)\}\s+from\s+['"]react['"]\s*;?/
  );
  if (reactImportMatch) {
    const importedHooks = reactImportMatch[1]
      .split(',')
      .map((h: string) => h.trim())
      .filter((h: string) => hooks.includes(h));

    // Remove React import line
    processed = processed.replace(
      /import\s+\{[^}]+\}\s+from\s+['"]react['"]\s*;?/g,
      ''
    );

    // Replace used hooks with React.hook form
    importedHooks.forEach((hook: string) => {
      const regex = new RegExp(`\\b${hook}\\b`, 'g');
      processed = processed.replace(regex, `React.${hook}`);
    });
  }

  // 4.4 Process other library imports (e.g., lucide-react)
  processed = processed.replace(
    /import\s+.*?\s+from\s+['"][^'"]+['"]\s*;?/g,
    "// Import removed for browser preview",
  );

  // 5. Remove TypeScript type annotations (use safer method)

  // 5.0 Remove standalone type definition statements (e.g., (product: Product) => void;)
  // Match pattern: starts with ( or identifier, contains : Type, ends with ;
  processed = processed.replace(/^\s*\([^)]*:\s*\w+\)\s*=>\s*\w+;\s*$/gm, '');
  processed = processed.replace(/^\s*\w+\s*:\s*\w+\s*=>\s*\w+;\s*$/gm, '');

  // 5.1 Process React.FC<Props> type variable declarations
  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*React\.FC\s*<[^>]*>\s*=/g,
    "$1 $2 =",
  );

  // 5.2 Process other generic type annotation variable declarations
  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*\w+<[^>]*>\s*=/g,
    "$1 $2 =",
  );

  // 5.3 Process function parameter object destructuring type annotations
  // Use safer method: First find function definition, then process its parameters
  // Match pattern: function Name(params: Type) or const Name = (params: Type) =>
  // Strategy: Remove last : { ... } or : Type in function parameter list

  // First process arrow function parameters
  processed = processed.replace(
    /((?:const|let|var)\s+\w+\s*=\s*)\(([^)]*)\)\s*:\s*(?:React\.FC<[^>]*>|\{[^}]*\}|\w+(?:<[^>]*>)?)\s*=>/g,
    "$1($2) =>",
  );

  // Process regular function parameters
  processed = processed.replace(
    /(function\s+\w+\s*)\(([^)]*)\)\s*:\s*(?:void|string|number|boolean|any|React\.\w+|\{[^}]*\})/g,
    "$1($2)",
  );

  // ⚠️ New: Process multiline object type annotations (e.g., Props interface)
  // Match pattern: function Name({ param1, param2 }: {\n  param1: Type;\n  param2: Type;\n})
  // Strategy: Remove entire : { ... } part
  processed = processed.replace(
    /(function\s+\w+\s*\(\{[^}]*\}\s*)\s*:\s*\{[\s\S]*?\}\s*\)/g,
    "$1)"
  );
  
  // Process arrow function multiline object
  processed = processed.replace(
    /((?:const|let|var)\s+\w+\s*=\s*\(\{[^}]*\}\s*)\s*:\s*\{[\s\S]*?\}\s*\)\s*=>/g,
    "$1) =>"
  );

  // 5.4 Remove type annotations in variable declarations (more precise matching)
  // Only process obvious type annotation patterns: const/let/var name: Type =
  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*(?:string|number|boolean|any|never|unknown|null|undefined)\s*=/g,
    "$1 $2 =",
  );

  // Process array types
  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*(?:\w+\[\]|\[\s*\w+\s*\])\s*=/g,
    "$1 $2 =",
  );

  // Process object types (simple object, no nested)
  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*\{[^{}\n]*\}\s*=/g,
    "$1 $2 =",
  );

  // 5.5 Process return type annotations
  processed = processed.replace(
    /:\s*(?:void|string|number|boolean|any|never|unknown|React\.\w+)\s*=>/g,
    " =>",
  );
  processed = processed.replace(/:\s*Promise<[^>]*>\s*=>/g, " =>");
  processed = processed.replace(/:\s*JSX\.Element\s*=>/g, " =>");

  // 5.6 Remove type annotations in function parameters (generic pattern)
  // Match: param: Type in parentheses
  // Note: Do not match object literals' properties (e.g., style={{ fontWeight: 500 }})
  // Strategy: Only remove type annotations in function parameter context
  
  // First process function parameters' type annotations (more precise pattern)
  // Match: (param1: Type, param2: Type) => or function name(param: Type)
  processed = processed.replace(
    /(\([^)]*)\b(\w+)\s*:\s*(?:\w+(?:<[^>]*>)?|\{[^}]*\})([^)]*\))/g,
    '$1$2$3'
  );
  
  // Process arrow function single parameter: (param: Type) =>
  processed = processed.replace(
    /\((\w+)\s*:\s*(?:\w+(?:<[^>]*>)?|\{[^}]*\})\)\s*=>/g,
    '($1) =>'
  );

  // ⚠️ New: Remove React.useRef, useState etc. Hook generic type annotations
  // Error example: React.useRef<Map<string, HTMLButtonElement | null>>(new Map())
  // Correct example: React.useRef(new Map())
  processed = processed.replace(
    /(React\.(?:useRef|useState|useCallback|useMemo|useReducer|useContext))\s*<[^>]*>/g,
    '$1'
  );

  // ⚠️ New: Remove generic function type parameters (e.g., customHook<Type>())
  // Match: function<Type>( or const func = <Type>(
  processed = processed.replace(
    /(function\s+\w+\s*|const\s+\w+\s*=\s*)<[^>]+>\s*\(/g,
    '$1('
  );

  // 6. Remove interface and type definitions
  processed = processed.replace(/interface\s+\w+\s*\{[\s\S]*?\}\s*/g, "");
  processed = processed.replace(/type\s+\w+\s*=[\s\S]*?;?\s*/g, "");

  // 7. Remove as type assertions
  processed = processed.replace(/\s+as\s+\w+/g, "");
  processed = processed.replace(/\s+as\s+\{[^}]*\}/g, "");
  processed = processed.replace(/\s+as\s+\w+<[^>]*>/g, "");

  // 8. Remove non-null assertion !
  processed = processed.replace(/!\./g, ".");
  processed = processed.replace(/!\[/g, "[");

  // 9. Remove optional chaining ?. (keep, as this is a JavaScript feature)
  // No need to handle

  // 10. Clean up extra blank lines
  processed = processed.replace(/\n{3,}/g, "\n\n");

  return processed;
}

// Simple syntax check function
function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: true };
  }

  try {
    // Clean code
    let cleanCode = code.trim();
    
    // Check and remove code block markers
    if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
      cleanCode = cleanCode.replace(/\n?```$/, '');
      cleanCode = cleanCode.trim();
    }

    // ⚠️ Prioritize detecting code truncation features (before parenthesis matching)
    const lines = cleanCode.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    
    // Truncation feature patterns
    const truncationPatterns = [
      { pattern: /,\s*$/, desc: 'comma' },
      { pattern: /\.\.\.\s*$/, desc: 'ellipsis' },
      { pattern: /\.\s*$/, desc: 'dot' },
      { pattern: /=>\s*$/, desc: 'arrow function' },
      { pattern: /=\s*$/, desc: 'assignment symbol' },
      { pattern: /\(\s*$/, desc: 'opening parenthesis' },
      { pattern: /\{\s*$/, desc: 'opening brace' },
      { pattern: /['"`][^'"`]*$/, desc: 'unclosed string' },
    ];
    
    for (const { pattern, desc } of truncationPatterns) {
      if (pattern.test(lastLine)) {
        return { 
          valid: false, 
          error: `⚠️ Code structure incomplete/truncated\n\nLast line ends with ${desc}, possibly AI-generated code was truncated.\n\nSuggestion: Click "Regenerate" button to let AI regenerate the complete code.` 
        };
      }
    }

    // Check basic syntax
    const isReactCode =
      cleanCode.includes("React") ||
      cleanCode.includes("jsx") ||
      cleanCode.includes("tsx") ||
      cleanCode.includes("import React");

    if (isReactCode) {
      // Check parenthesis matching
      const parentheses = cleanCode.match(/[()]/g) || [];
      let balance = 0;
      for (const char of parentheses) {
        if (char === "(") balance++;
        else if (char === ")") balance--;
        if (balance < 0) {
          return { valid: false, error: "Parentheses mismatch, please check code" };
        }
      }
      if (balance !== 0) {
        return { valid: false, error: `Parentheses mismatch (missing ${Math.abs(balance)} parentheses), please check code` };
      }

      // Check brace matching
      const braces = cleanCode.match(/[{}]/g) || [];
      balance = 0;
      for (const char of braces) {
        if (char === "{") balance++;
        else if (char === "}") balance--;
        if (balance < 0) {
          return { valid: false, error: "Braces mismatch, please check code" };
        }
      }
      if (balance !== 0) {
        return { valid: false, error: `Braces mismatch (missing ${Math.abs(balance)} braces), please check code` };
      }

      // Check angle bracket matching (JSX) - simplified check to avoid false positives
      const openTags = (cleanCode.match(/<[A-Z][a-zA-Z]*(?![^>]*\/>)(?![^>]*\/)\s*>/g) || []).length;
      const closeTags = (cleanCode.match(/<\/[A-Z][a-zA-Z]*>/g) || []).length;
      
      // Only warn if mismatched and difference is more than 2
      if (openTags !== closeTags && Math.abs(openTags - closeTags) > 2) {
        console.warn(`Possible unclosed JSX tags (open tags: ${openTags}, close tags: ${closeTags})`);
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Code syntax check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
  // New: Code paste test functionality
  const [testCode, setTestCode] = useState<string>("");
  const [showTestArea, setShowTestArea] = useState<boolean>(false);
  
  // Device Switch state
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    // Initialize device type based on current resolution
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

  // Validate code
  const validation = useMemo(() => {
    if (!code) return { valid: true };
    return validateCode(code);
  }, [code]);

  // Process iframe srcDoc
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

    // If code validation fails, do not generate preview
    if (!validation.valid) {
      return null;
    }

    // Detect framework, generate suitable HTML wrapper
    const isReactCode =
      code.includes("React") || code.includes("jsx") || code.includes("tsx");
    const isHtmlCode = code.includes("<!DOCTYPE") || code.includes("<html");

    if (isHtmlCode) {
      // Already complete HTML
      return code;
    }

    // Default package into directly runnable HTML (for React/Vue, only supports simple components using CDN)
    // If it's a React component, we provide a simple rendering environment
    if (isReactCode) {
      // Preprocess code: Remove export statements to make it runnable in the browser
      const processedCode = preprocessCodeForBrowser(code);

      // Debug: Output preprocessed code to console
      console.log("=== Original code ===");
      console.log(code);
      console.log("=== Preprocessed code ===");
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

    // Default return, put code in body
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

  // Calculate container style - Ensure content is fully displayed
  // If user does not set size specification, use adaptive mode
  const isAdaptive = preset.width === "100%";

  const containerStyle: React.CSSProperties = {
    width: isAdaptive ? "100%" : `${preset.width}px`,
    // Adaptive mode uses minimum height to let content naturally expand
    height: "auto",
    minHeight: isAdaptive
      ? "400px"  // Minimum height in adaptive mode
      : preset.height === "100%"
        ? "100%"
        : `${preset.height}px`,
    maxHeight: isAdaptive ? "none" : "calc(100vh - 200px)", // Limit maximum height for fixed size
    margin: "0 auto",
    background: "white",
    overflow: "visible", // Allow content to fully display
  };

  // iframe error handling
  const handleIframeError = useCallback(() => {
    setError("Unable to load preview, possible syntax error");
  }, []);

  // iframe load success
  const handleIframeLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    setError(null);
    
    // In adaptive mode, automatically adjust iframe height to fit content
    if (isAdaptive) {
      try {
        const iframe = e.currentTarget;
        // Wait for content to fully load before adjusting height
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc && iframeDoc.body) {
              const contentHeight = iframeDoc.body.scrollHeight;
              // Set iframe height to content height (plus some padding)
              iframe.style.height = `${contentHeight + 20}px`;
            }
          } catch (err) {
            // Cross-origin restrictions may prevent accessing contentDocument, ignore error
            console.debug('Unable to adjust iframe height:', err);
          }
        }, 100);
      } catch (err) {
        console.debug('iframe load handling failed:', err);
      }
    }
  }, [isAdaptive]);

  // Handle rendering of test code
  const handleTestCodeRender = () => {
    if (!testCode.trim()) {
      setError("Enter code to test");
      return;
    }
    
    console.log('🧪 Starting code rendering test...');
    console.log('=== Test code ===');
    console.log(testCode);
    
    // Extract component name
    const componentName = extractComponentName(testCode);
    console.log(`📦 Extracted component name: ${componentName}`);
    
    // Preprocess code
    const processedCode = preprocessCodeForBrowser(testCode);
    console.log('=== Preprocessed code ===');
    console.log(processedCode);
    
    // Generate HTML
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
    container.innerHTML = '<h3 style="margin: 10px 0; color: #374151;">🧪 Test result:</h3>';
    container.appendChild(iframe);
    
    // Insert below test area
    const testArea = document.getElementById('test-code-area');
    if (testArea) {
      testArea.parentNode?.insertBefore(container, testArea.nextSibling);
    }
    
    setError(null);
  };

  // Clear test code
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
      {/* Top toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          {/* Left: Device type switch */}
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
                      // Switch to the first resolution of this device
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
          
          {/* Right: Specific Device Size selection */}
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
                <Select.Value placeholder={language === 'en' ? 'Select device size' : '选择Device Size'} />
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
                    {/* Only show resolutions of current device type */}
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
          
          {/* Code Test button - placed separately on the right */}
          <button
            onClick={() => setShowTestArea(!showTestArea)}
            className="px-3 py-1.5 text-sm rounded-md border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-150 flex items-center gap-1"
            title={language === 'en' ? 'Paste code to test directly' : '粘贴代码直接测试渲染，无需走完整生成流程'}
          >
            <span>🧪</span>
            <span>{showTestArea ? t.preview.hideTest : t.preview.codeTest}</span>
          </button>
        </div>
        
        {/* Code paste test area */}
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

      {/* Preview iframe container */}
      <div className="flex-1 flex items-start justify-center bg-gray-100 dark:bg-slate-900/50 p-6 overflow-y-auto overflow-x-hidden">
        {/* Code validation failure prompt */}
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
