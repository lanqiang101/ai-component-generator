import type { PreviewResolution } from "../types";

// Helper function to get localized resolution label
export const getResolutionLabel = (key: PreviewResolution, t: any): string => {
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
export function checkCommonSyntaxErrors(code: string): string[] {
  const errors: string[] = [];

  // 1. Detect ternary operator using dot instead of colon error
  const ternaryDotPattern = /\?\s*\w+\.\w+\.\w+\s*[),}]/g;
  const ternaryMatches = code.match(ternaryDotPattern);
  if (ternaryMatches) {
    ternaryMatches.forEach((match) => {
      const lines = code.substring(0, code.indexOf(match)).split('\n');
      const lineNumber = lines.length;
      errors.push(
        `Line ${lineNumber}: Ternary operator syntax error "${match.trim()}", should be "? value1 : value2" not "? obj1.obj2"`
      );
    });
  }

  // 2. Detect object literal syntax errors: { key.key } should be { key: value }
  // Error examples:
  //   { url.url.trim() } - missing colon
  //   { variantId.variantId } - missing colon
  //   { img.alt.trim() } - missing property name
  const objectLiteralErrorPattern = /\{\s*\w+\.\w+\s*\}/g;
  const objectLiteralMatches = code.match(objectLiteralErrorPattern);
  if (objectLiteralMatches) {
    objectLiteralMatches.forEach((match) => {
      const lines = code.substring(0, code.indexOf(match)).split('\n');
      const lineNumber = lines.length;
      errors.push(
        `Line ${lineNumber}: Object literal syntax error "${match.trim()}", should be "{ key: value }" not "{ obj.property }"`
      );
    });
  }

  // 3. Detect spread operator syntax errors: { ...obj.property } should be { key: obj.property } or { ...obj }
  const spreadErrorPattern = /\{\s*\.\.\.\w+\.\w+\s*\}/g;
  const spreadMatches = code.match(spreadErrorPattern);
  if (spreadMatches) {
    spreadMatches.forEach((match) => {
      const lines = code.substring(0, code.indexOf(match)).split('\n');
      const lineNumber = lines.length;
      errors.push(
        `Line ${lineNumber}: Spread operator syntax error "${match.trim()}", should be "{ key: obj.property }" or "{ ...obj }" not "{ ...obj.property }"`
      );
    });
  }

  // 4. Detect unclosed parentheses (simple check)
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

  // 5. Detect common event handler type annotation errors
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
export function extractComponentName(code: string): string {
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
  
  // If there are multiple files, try to extract from the main component file
  if (files.length > 1) {
    const mainFile = files.find(f => 
      f.includes('component') || f.includes('index') || f.includes('App')
    );
    if (mainFile) {
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
  const exportDefaultMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  if (exportDefaultMatch) {
    console.log(`✅ Matched export default function: ${exportDefaultMatch[1]}`);
    return exportDefaultMatch[1];
  }

  // 2. Match export default variable name
  const exportDefaultVarMatch = code.match(/export\s+default\s+(\w+)\s*;/);
  if (exportDefaultVarMatch) {
    console.log(`✅ Matched export default variable: ${exportDefaultVarMatch[1]}`);
    return exportDefaultVarMatch[1];
  }

  // 3. Match export default arrow function
  const exportDefaultArrowMatch = code.match(/export\s+default\s+\(\s*\)\s*=>\s*\{/);
  if (exportDefaultArrowMatch) {
    const componentMatch = code.match(/\/\/\s*Main component[：:]\s*(\w+)|\/\*\s*Main component[：:]\s*(\w+)/);
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

  // 5. Try to find const Component = (capital letter start)
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

// Preprocess code: Remove type annotations, import statements, etc.
export function preprocessCodeForBrowser(code: string): string {
  let processed = code;

  // ⚠️ Syntax check before preprocessing
  const syntaxErrors = checkCommonSyntaxErrors(processed);
  if (syntaxErrors.length > 0) {
    console.error('⚠️ Syntax errors detected:', syntaxErrors);
    throw new Error(
      `Code contains syntax errors:\n${syntaxErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}\n\nPlease regenerate the code.`
    );
  }

  // 1. Remove all export keywords
  processed = processed.replace(/^export\s+default\s+/gm, '');
  processed = processed.replace(/^export\s+(const|let|var|function|class|interface|type|enum)\s+/gm, '$1 ');
  processed = processed.replace(/\bexport\s*\{[^}]*\}\s*;?/gm, '');
  processed = processed.replace(/\bexport\s+\*\s+from\s+['"][^'"]+['"]\s*;?/gm, '');

  // 1.5 Remove CommonJS module export syntax
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
  processed = processed.replace(/import\s+React\s+from\s+['"]react['"]\s*;?/g, '');

  // 4.2 Remove React hooks destructuring import
  const hooks = [
    'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
    'useContext', 'useReducer', 'useLayoutEffect',
  ];

  const reactImportMatch = processed.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"]\s*;?/);
  if (reactImportMatch) {
    const importedHooks = reactImportMatch[1]
      .split(',')
      .map((h: string) => h.trim())
      .filter((h: string) => hooks.includes(h));

    processed = processed.replace(/import\s+\{[^}]+\}\s+from\s+['"]react['"]\s*;?/g, '');

    importedHooks.forEach((hook: string) => {
      const regex = new RegExp(`\\b${hook}\\b`, 'g');
      processed = processed.replace(regex, `React.${hook}`);
    });
  }

  // 4.4 Process other library imports
  processed = processed.replace(
    /import\s+.*?\s+from\s+['"][^'"]+['"]\s*;?/g,
    "// Import removed for browser preview",
  );

  // 5. Remove TypeScript type annotations
  processed = processed.replace(/^\s*\([^)]*:\s*\w+\)\s*=>\s*\w+;\s*$/gm, '');
  processed = processed.replace(/^\s*\w+\s*:\s*\w+\s*=>\s*\w+;\s*$/gm, '');

  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*React\.FC\s*<[^>]*>\s*=/g,
    "$1 $2 =",
  );

  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*\w+<[^>]*>\s*=/g,
    "$1 $2 =",
  );

  processed = processed.replace(
    /((?:const|let|var)\s+\w+\s*=\s*)\(([^)]*)\)\s*:\s*(?:React\.FC<[^>]*>|\{[^}]*\}|\w+(?:<[^>]*>)?)\s*=>/g,
    "$1($2) =>",
  );

  processed = processed.replace(
    /(function\s+\w+\s*)\(([^)]*)\)\s*:\s*(?:void|string|number|boolean|any|React\.\w+|\{[^}]*\})/g,
    "$1($2)",
  );

  processed = processed.replace(
    /(function\s+\w+\s*\(\{[^}]*\}\s*)\s*:\s*\{[\s\S]*?\}\s*\)/g,
    "$1)"
  );
  
  processed = processed.replace(
    /((?:const|let|var)\s+\w+\s*=\s*\(\{[^}]*\}\s*)\s*:\s*\{[\s\S]*?\}\s*\)\s*=>/g,
    "$1) =>"
  );

  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*(?:string|number|boolean|any|never|unknown|null|undefined)\s*=/g,
    "$1 $2 =",
  );

  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*(?:\w+\[\]|\[\s*\w+\s*\])\s*=/g,
    "$1 $2 =",
  );

  processed = processed.replace(
    /(const|let|var)\s+(\w+)\s*:\s*\{[^{}\n]*\}\s*=/g,
    "$1 $2 =",
  );

  processed = processed.replace(/:\s*(?:void|string|number|boolean|any|never|unknown|React\.\w+)\s*=>/g, " =>");
  processed = processed.replace(/:\s*Promise<[^>]*>\s*=>/g, " =>");
  processed = processed.replace(/:\s*JSX\.Element\s*=>/g, " =>");

  processed = processed.replace(
    /(\([^)]*)\b(\w+)\s*:\s*(?:\w+(?:<[^>]*>)?|\{[^}]*\})([^)]*\))/g,
    '$1$2$3'
  );
  
  processed = processed.replace(
    /\((\w+)\s*:\s*(?:\w+(?:<[^>]*>)?|\{[^}]*\})\)\s*=>/g,
    '($1) =>'
  );

  processed = processed.replace(
    /(React\.(?:useRef|useState|useCallback|useMemo|useReducer|useContext))\s*<[^>]*>/g,
    '$1'
  );

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

  // 9. Clean up extra blank lines
  processed = processed.replace(/\n{3,}/g, "\n\n");

  return processed;
}

// Simple syntax check function
export function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: true };
  }

  try {
    let cleanCode = code.trim();
    
    if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
      cleanCode = cleanCode.replace(/\n?```$/, '');
      cleanCode = cleanCode.trim();
    }

    const lines = cleanCode.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    
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

    const isReactCode =
      cleanCode.includes("React") ||
      cleanCode.includes("jsx") ||
      cleanCode.includes("tsx") ||
      cleanCode.includes("import React");

    if (isReactCode) {
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

      const openTags = (cleanCode.match(/<[A-Z][a-zA-Z]*(?![^>]*\/>)(?![^>]*\/)\s*>/g) || []).length;
      const closeTags = (cleanCode.match(/<\/[A-Z][a-zA-Z]*>/g) || []).length;
      
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

// Generate iframe HTML for preview
export function generatePreviewHtml(
  code: string,
  validation: { valid: boolean; error?: string },
  language: 'en' | 'zh',
  t: any
): string | null {
  if (!code) {
    const isZh = language === 'zh';
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

  if (!validation.valid) {
    return null;
  }

  const isReactCode = code.includes("React") || code.includes("jsx") || code.includes("tsx");
  const isHtmlCode = code.includes("<!DOCTYPE") || code.includes("<html");

  if (isHtmlCode) {
    return code;
  }

  if (isReactCode) {
    const processedCode = preprocessCodeForBrowser(code);

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
}

// Generate test HTML for code testing
export function generateTestHtml(code: string): string {
  const componentName = extractComponentName(code);
  const processedCode = preprocessCodeForBrowser(code);
  
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
root.render(<${componentName} />);
  </script>
</body>
</html>
  `.trim();
}
