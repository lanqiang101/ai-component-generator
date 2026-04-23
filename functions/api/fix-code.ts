/**
 * AI Fix Code API
 * POST /api/fix-code
 * 
 * Request body:
 * {
 *   code: string,
 *   errorMessages: string[],
 *   fileName: string
 * }
 */

import { callAI } from '../utils/ai';

export async function onRequest(context: any) {
  const { request, env } = context;
  
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { code, errorMessages, fileName } = body;

    if (!code || !errorMessages) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters: code and errorMessages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build AI prompt for code fixing
    const prompt = `You are a code fixing expert. Please fix the syntax errors in the following code.

**File**: ${fileName || 'unknown'}

**Error Messages**:
${errorMessages.join('\n')}

**Original Code**:
\`\`\`typescript
${code}
\`\`\`

**Requirements**:
1. Fix all syntax errors mentioned above
2. Keep the original functionality intact
3. Only fix syntax errors, do not refactor or optimize
4. Return ONLY the fixed code, no explanation
5. Maintain the same code structure and style
6. Ensure all imports, exports, and variable names remain unchanged
7. If there are type annotation issues, fix them properly
8. Return the complete fixed code, do not omit any parts

**Fixed Code**:`;

    // Call AI to fix code
    const fixedCode = await callAI(prompt, env);

    // Extract code from AI response
    let cleanedCode = fixedCode.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = cleanedCode.match(/```(?:tsx|typescript|javascript|jsx)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      cleanedCode = codeBlockMatch[1].trim();
    }

    // Verify the fix is not empty
    if (!cleanedCode || cleanedCode.length < 10) {
      throw new Error('AI returned empty or invalid code');
    }

    return new Response(
      JSON.stringify({
        success: true,
        fixedCode: cleanedCode,
        originalCode: code,
        fileName: fileName
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Fix API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'AI fix failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
