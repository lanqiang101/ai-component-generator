/**
 * Cloudflare Worker - AI API Key 加密中转 + 代码格式清洗
 * 
 * 作用：
 * 1. 安全地中转火山方舟 API 请求，避免在前端或后端暴露 API Key
 * 2. 对 AI 生成的代码进行格式清洗，移除 Markdown 标记和 TypeScript 语法
 * 
 * 部署步骤：
 * 1. 登录 Cloudflare Dashboard
 * 2. 创建 Worker（名称例如：ai-api-proxy）
 * 3. 将此代码粘贴到 Worker 编辑器中
 * 4. 在 Worker 设置中添加环境变量：
 *    - ARK_API_KEY: 你的火山方舟 API Key
 * 5. 保存并部署
 * 6. 将 Worker URL 配置到项目环境变量中
 * 
 * 环境变量配置：
 * - 开发环境：在项目根目录创建 .env 文件，添加 VITE_AI_PROXY_URL=http://localhost:8787
 * - 生产环境：在 Vercel/Netlify 等平台添加环境变量 VITE_AI_PROXY_URL=https://your-worker.your-subdomain.workers.dev
 */

// 代码清洗函数：移除 Markdown 标记和 TypeScript 语法
function cleanGeneratedCode(code) {
  if (!code || typeof code !== 'string') return code;
  
  let cleaned = code.trim();
  
  // 1. 移除 Markdown 代码块标记（包括转义格式）
  // 处理: \`\`\`tsx\n 或 \\`\\`\\`tsx\\n
  cleaned = cleaned.replace(/\\?`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\\?\n?/gi, '');
  
  // 处理正常格式: ```tsx\n
  cleaned = cleaned.replace(/^`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?`{3}$/, '');
  
  // 2. 清理开头和结尾空白
  cleaned = cleaned.trim();
  
  return cleaned;
}

export default {
  async fetch(request, env, ctx) {
    // 仅允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // 获取请求体
    const body = await request.json();

    // 验证必填参数 - 只需要 messages 字段
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Missing required field: messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构建火山方舟 API 请求
    const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions';
    const API_KEY = env.API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
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
      
      // 如果响应中包含代码，进行清洗
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const originalCode = data.choices[0].message.content;
        const cleanedCode = cleanGeneratedCode(originalCode);
        
        // 记录清洗前后的长度差异（用于调试）
        console.log(`代码清洗: ${originalCode.length} → ${cleanedCode.length} 字符`);
        
        // 更新响应中的代码
        data.choices[0].message.content = cleanedCode;
      }
      
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('API request failed:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};