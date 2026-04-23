/**
 * Code Validation Utility
 * Validates completeness and correctness of generated code
 */

import { 
  checkBracketBalance, 
  checkStringClosure, 
  checkJsxTags, 
  isIncompleteStatement,
  checkConditionalStyleSyntax 
} from '../utils/codeCleaner.js';

/**
 * Validate code completeness
 * @param {string} code - Generated code
 * @returns {{valid: boolean, issues: string[], suggestions: string[]}}
 */
export function validateCodeCompleteness(code) {
  const issues = [];
  const suggestions = [];
  
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      issues: ['Code is empty'],
      suggestions: ['Please regenerate code']
    };
  }
  
  const trimmed = code.trim();
  
  // 1. Check end marker
  if (!trimmed.endsWith('// [FILE_END]')) {
    issues.push('Missing file end marker // [FILE_END]');
    suggestions.push('Add // [FILE_END] at the end of code');
  }
  
  // 2. Check bracket balance
  const bracketBalance = checkBracketBalance(trimmed);
  if (!bracketBalance.balanced) {
    issues.push(`Unbalanced brackets: ${bracketBalance.message}`);
    suggestions.push('Ensure all brackets are properly closed');
  }
  
  // 3. Check string closure
  const stringCheck = checkStringClosure(trimmed);
  if (!stringCheck.closed) {
    issues.push(`Unclosed strings: ${stringCheck.message}`);
    suggestions.push('Ensure all quotes are properly paired');
  }
  
  // 4. Check JSX tags
  const jsxCheck = checkJsxTags(trimmed);
  if (!jsxCheck.valid) {
    issues.push(`JSX tag issue: ${jsxCheck.message}`);
    suggestions.push('Ensure all JSX tags are properly closed');
  }
  
  // 5. Check if last line is complete
  const lines = trimmed.split('\n');
  const lastLine = lines[lines.length - 1].trim();
  if (lastLine && isIncompleteStatement(lastLine)) {
    issues.push(`Incomplete last line: "${lastLine.substring(0, 50)}"`);
    suggestions.push('Ensure last line is a complete statement');
  }
  
  // 6. Check conditional style syntax
  const styleSyntaxCheck = checkConditionalStyleSyntax(trimmed);
  if (!styleSyntaxCheck.valid) {
    issues.push(`Conditional style syntax error: ${styleSyntaxCheck.message}`);
    suggestions.push('Ensure ternary expression is complete: condition ? value1 : value2');
  }
  
  // 7. Check for export default (main component and sub-components)
  if (trimmed.includes('export default function') || 
      trimmed.includes('export default class') ||
      trimmed.match(/export default\s+\w+/)) {
    // Has default export, pass
  } else if (trimmed.includes('export function') || trimmed.includes('export const')) {
    // Utility functions use named exports, pass
  } else {
    issues.push('Missing export statement');
    suggestions.push('Add export default or export statement');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}
