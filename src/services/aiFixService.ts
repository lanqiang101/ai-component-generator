/**
 * AI Code Fix Service
 * Calls the AI API to fix syntax errors in code
 */

interface AIFixResponse {
  success: boolean;
  fixedCode: string;
  originalCode: string;
  fileName: string;
  error?: string;
  message?: string;
}

/**
 * Fix code errors using AI
 * @param code - The code with errors
 * @param errorMessages - Array of error messages
 * @param fileName - Current file name
 * @returns Fixed code or error information
 */
export async function fixCodeWithAI(
  code: string,
  errorMessages: string[],
  fileName: string
): Promise<AIFixResponse> {
  try {
    const response = await fetch('/api/fix-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        errorMessages,
        fileName,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'AI fix failed');
    }

    return result;
  } catch (error) {
    console.error('AI Code Fix Error:', error);
    throw error;
  }
}
