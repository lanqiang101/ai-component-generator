/**
 * AI API 调用工具函数
 * 用于 Cloudflare Pages Functions
 * 
 * 架构说明：
 * - Pages Functions → Cloudflare Worker (AI 代理) → 火山方舟 API
 * - 支持通过环境变量 AI_PROXY_URL 配置 Worker URL
 * - 默认使用云端 Worker: https://ai-component-proxy.xuyongqiang916.workers.dev
 */

export async function callAI(prompt: string, env?: any): Promise<string> {
  // 从环境变量获取 Worker URL，如果没有则使用默认云端地址
  const WORKER_URL = env?.AI_PROXY_URL || 'https://ai-component-proxy.xuyongqiang916.workers.dev';
  
  console.log('调用 Cloudflare Worker 代理:', WORKER_URL);

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
      console.error('Worker 请求失败:', response.status, errorText);
      throw new Error(`Worker request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Worker 响应成功');
    
    // 提取 AI 回复内容（Worker 返回的是火山方舟的标准格式）
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    console.error('Worker 响应格式异常:', JSON.stringify(data));
    throw new Error('Invalid worker response format');
  } catch (error: any) {
    console.error('AI API call failed:', error);
    throw error;
  }
}
