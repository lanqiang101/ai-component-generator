/**
 * Cloudflare Worker - AI API Key 加密中转
 * 
 * 作用：安全地中转火山方舟 API 请求，避免在前端或后端暴露 API Key
 * 
 * 部署步骤：
 * 1. 登录 Cloudflare Dashboard
 * 2. 创建 Worker（名称：ai-component-proxy）
 * 3. 将此代码粘贴到 Worker 编辑器中
 * 4. 在 Worker 设置中添加环境变量：
 *    - ARK_API_KEY: 你的火山方舟 API Key（使用 wrangler secret put ARK_API_KEY）
 * 5. 保存并部署
 * 6. Worker URL: https://ai-component-proxy.xuyongqiang916.workers.dev
 */

export default {
  async fetch(request, env, ctx) {
    // 仅允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // 获取请求体
      const body = await request.json();

      // 验证必填参数 - 只需要 messages 字段
      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: messages' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // 构建火山方舟 API 请求
      const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions';
      const API_KEY = env.ARK_API_KEY;

      // 验证 API Key 是否存在
      if (!API_KEY) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // 转发请求到火山方舟
      const response = await fetch(ARK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'ark-code-latest',
          messages: body.messages,
          temperature: body.temperature || 0.7,
          max_tokens: body.max_tokens || 4096,
        }),
      });

      // 返回火山方舟的响应
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('API request failed:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
