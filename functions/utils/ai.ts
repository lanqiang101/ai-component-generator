/**
 * AI API 调用工具函数
 * 用于 Cloudflare Pages Functions 和 Worker 共享
 */

export async function callAI(prompt: string, env?: any): Promise<string> {
  const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions';
  
  // 从环境变量获取 API Key（Pages Functions 通过 context.env 传递）
  const API_KEY = env?.ARK_API_KEY || process.env.ARK_API_KEY;

  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(ARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'ark-code-latest',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // 提取 AI 回复内容
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    throw new Error('Invalid API response format');
  } catch (error: any) {
    console.error('AI API call failed:', error);
    throw error;
  }
}
