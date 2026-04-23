/**
 * AI Service
 * Handles AI API calls through Pages Functions proxy
 */

// Declare process variable (needed in ES Module environment)
const process = globalThis.process || { env: {} };

/**
 * Call AI API via Pages Functions proxy
 * @param {object|null} model - Model config (not used currently)
 * @param {object|string} paramsOrPrompt - Can be params object or prompt string
 * @returns {Promise<string>} AI generated content
 */
export async function callAI(model, paramsOrPrompt) {
  // Unified proxy through Pages Functions to avoid direct Worker network issues
  const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
  
  const headers = {
    'Content-Type': 'application/json',
  };

  let proxyUrl;
  let body;

  // Determine if params object or prompt string
  if (typeof paramsOrPrompt === 'string') {
    // Mode 1: Pass prompt string via Pages Functions /api/chat endpoint
    proxyUrl = `${baseUrl}/api/chat`;
    
    // Build standard Chat API request format
    body = {
      messages: [
        { role: 'user', content: paramsOrPrompt }
      ]
    };
    
    console.log('🤖 Calling AI API (Pages Functions - Chat mode):', {
      url: proxyUrl,
      promptLength: paramsOrPrompt.length
    });
  } else {
    // Mode 2: Pass params object, call Pages Functions /api/generate
    proxyUrl = `${baseUrl}/api/generate`;
    body = { params: paramsOrPrompt };
    
    console.log('🤖 Calling AI API (Pages Functions - Generate mode):', {
      url: proxyUrl,
      componentName: paramsOrPrompt.componentName
    });
  }

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Handle response format
    if (data.success && data.data && data.data.code) {
      return data.data.code;
    } else if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (err) {
    console.error('❌ AI API call failed:', err);
    throw new Error(`AI service call failed: ${err.message}`);
  }
}
