/**
 * AI API Call Utility Function
 * Used by Cloudflare Pages Functions
 * 
 * Architecture:
 * - Pages Functions access Volcengine API through Worker proxy
 * - Worker URL can be configured via WORKER_URL environment variable
 * - Default uses cloud Worker: https://ai-component-proxy.xuyongqiang916.workers.dev
 */

export async function callAI(prompt: string, env?: any): Promise<string> {
  // Get Worker URL from environment variable, use default cloud address if not set
  const WORKER_URL = env?.WORKER_URL || 'https://ai-component-proxy.xuyongqiang916.workers.dev';
  
  console.log('Calling Cloudflare Worker proxy:', WORKER_URL);

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Worker request failed:', response.status, errorText);
      throw new Error(`Worker request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Worker response successful');
    
    // Extract AI response content (Worker returns Volcengine standard format)
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    console.error('Worker response format invalid:', JSON.stringify(data));
    throw new Error('Invalid worker response format');
  } catch (error: any) {
    console.error('AI API call failed:', error);
    throw error;
  }
}