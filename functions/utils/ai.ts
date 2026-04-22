/**
 * AI API 调用工具函数
 * 用于 Cloudflare Pages Functions
 * 
 * 架构说明：
 * - Pages Functions 直接调用火山方舟 API
 * - API Key 通过 Cloudflare Secrets 配置 (API_KEY)
 * - 支持通过环境变量 ARK_API_URL 配置 API 地址(可选)
 */

export async function callAI(prompt: string, env?: any): Promise<string> {
  // 火山方舟 API 配置
  const ARK_API_URL = env?.ARK_API_URL || 'https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions';
  const API_KEY = env?.API_KEY;
  
  if (!API_KEY) {
    throw new Error('API_KEY 环境变量未配置');
  }

  console.log('调用火山方舟 API:', ARK_API_URL);

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
      const errorText = await response.text();
      console.error('火山方舟 API 请求失败:', response.status, errorText);
      throw new Error(`Volcengine API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('火山方舟 API 响应成功');
    
    // 提取 AI 回复内容
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    console.error('火山方舟 API 响应格式异常:', JSON.stringify(data));
    throw new Error('Invalid Volcengine API response format');
  } catch (error: any) {
    console.error('AI API call failed:', error);
    throw error;
  }
}
