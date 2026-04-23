/**
 * Code Cleaner Utility
 * Cleans and fixes AI-generated code
 */

/**
 * Clean generated code by removing markdown markers and fixing syntax errors
 * @param {string} code - Raw code from AI
 * @returns {string} Cleaned code
 */
export function cleanGeneratedCode(code) {
  if (!code || typeof code !== 'string') return code;
  
  let cleaned = code.trim();
  
  // Remove Markdown markers
  cleaned = cleaned.replace(/\\?`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\\?\n?/gi, '');
  cleaned = cleaned.replace(/^`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?`{3}$/, '');
  
  // Remove end markers
  cleaned = cleaned.replace(/\n?\/\/ \[FILE_END\]$/, '');
  cleaned = cleaned.replace(/\n?\/\/ \[END_OF_CODE\]$/, '');
  
  // ⚠️ Auto-fix conditional style syntax errors
  
  // Fix 1: Incomplete ternary expression ...(condition ? value) → ...(condition ? value : {})
  cleaned = cleaned.replace(
    /\.\.\.\s*\(\s*(\w+)\s*\?\s*([\w.]+)\s*\)/g,
    '...($1 ? $2 : {})'
  );
  
  // Fix 2: Complete ternary with nested property access ...(condition ? styles.a.b : styles.c.d)
  // Simplify to: ...(condition ? styles.a : styles.c)
  cleaned = cleaned.replace(
    /\.\.\.\s*\(\s*(\w+)\s*\?\s*styles\.(\w+)\.(\w+)\s*:\s*styles\.(\w+)\.(\w+)\s*\)/g,
    '...($1 ? styles.$2 : styles.$4)'
  );
  
  // Fix 3: Incomplete ternary with nested property access ...(condition ? styles.a.b)
  // Simplify to: ...(condition ? styles.a : {})
  cleaned = cleaned.replace(
    /\.\.\.\s*\(\s*(\w+)\s*\?\s*styles\.(\w+)\.(\w+)\s*\)/g,
    '...($1 ? styles.$2 : {})'
  );
  
  return cleaned.trim();
}

/**
 * Check bracket balance
 */
export function checkBracketBalance(code) {
  const pairs = { '(': ')', '[': ']', '{': '}', '<': '>' };
  const openers = Object.keys(pairs);
  const closers = Object.values(pairs);
  const stack = [];
  
  let inJsxTag = false;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    if (char === '<' && (i === 0 || code[i-1] !== '/')) {
      inJsxTag = true;
      stack.push(char);
    } else if (openers.includes(char) && !inJsxTag) {
      stack.push(char);
    } else if (closers.includes(char)) {
      if (char === '>') {
        if (inJsxTag) {
          inJsxTag = false;
          stack.pop();
        }
      } else {
        const lastOpener = stack.pop();
        if (!lastOpener || pairs[lastOpener] !== char) {
          return {
            balanced: false,
            message: `Found unmatched '${char}'`
          };
        }
      }
    }
  }
  
  if (stack.length > 0) {
    return {
      balanced: false,
      message: `${stack.length} unclosed brackets: ${stack.join(', ')}`
    };
  }
  
  return { balanced: true, message: '' };
}

/**
 * Check string closure
 */
export function checkStringClosure(code) {
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  const backticks = (code.match(/`/g) || []).length;
  
  const issues = [];
  
  if (singleQuotes % 2 !== 0) {
    issues.push('Odd number of single quotes');
  }
  if (doubleQuotes % 2 !== 0) {
    issues.push('Odd number of double quotes');
  }
  if (backticks % 2 !== 0) {
    issues.push('Odd number of backticks');
  }
  
  return {
    closed: issues.length === 0,
    message: issues.join(', ')
  };
}

/**
 * Check JSX tags
 */
export function checkJsxTags(code) {
  const openTags = code.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) || [];
  const closeTags = code.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];
  
  const openNames = openTags.map(tag => tag.match(/<([a-zA-Z]+)/)[1]);
  const closeNames = closeTags.map(tag => tag.match(/<\/([a-zA-Z]+)/)[1]);
  
  const openCount = {};
  const closeCount = {};
  
  openNames.forEach(name => {
    openCount[name] = (openCount[name] || 0) + 1;
  });
  
  closeNames.forEach(name => {
    closeCount[name] = (closeCount[name] || 0) + 1;
  });
  
  const htmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input', 'img', 'br', 'hr'];
  
  for (const name in openCount) {
    if (htmlTags.includes(name.toLowerCase())) continue;
    
    const expected = openCount[name];
    const actual = closeCount[name] || 0;
    
    if (expected !== actual) {
      return {
        valid: false,
        message: `<${name}> tag opened ${expected} times, closed ${actual} times`
      };
    }
  }
  
  return { valid: true, message: '' };
}

/**
 * Check if line is incomplete statement
 */
export function isIncompleteStatement(line) {
  const incompletePatterns = [
    /,\s*$/,           // Ends with comma
    /\.\.\.\s*$/,      // Ends with ellipsis
    /\.\s*$/,          // Ends with dot
    /=>\s*$/,          // Ends with arrow function
    /=\s*$/,           // Ends with assignment
    /\(\s*$/,          // Ends with opening parenthesis
    /\{\s*$/,          // Ends with opening brace
    /<[^>]*$/,         // Unclosed JSX tag
    /['"`][^'"`]*$/,   // Unclosed string
  ];
  
  return incompletePatterns.some(pattern => pattern.test(line));
}

/**
 * Check conditional style syntax
 */
export function checkConditionalStyleSyntax(code) {
  const incompleteTernaryRegex = /\.\.\.\s*\(\s*\w+[^)]*\?\s*[^:)]+\)/g;
  const matches = code.match(incompleteTernaryRegex);
  
  if (matches && matches.length > 0) {
    return {
      valid: false,
      message: `Found incomplete ternary expression: ${matches[0].substring(0, 50)}...`,
      examples: matches.slice(0, 3)
    };
  }
  
  const nestedPropertyRegex = /\.\.\.\s*\(\s*\w+\s*\?\s*styles\.\w+\.\w+/g;
  const nestedMatches = code.match(nestedPropertyRegex);
  
  if (nestedMatches && nestedMatches.length > 0) {
    return {
      valid: false,
      message: `Nested property access not allowed: ${nestedMatches[0].substring(0, 50)}...`,
      examples: nestedMatches.slice(0, 3)
    };
  }
  
  return { valid: true, message: '' };
}
