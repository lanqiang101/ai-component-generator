/**
 * AI Proxy - Pages Function
 * 
 * 本地调试时，Pages Functions 通过此端点调用云端 Worker
 * 避免本地网络环境无法直接访问 Worker 的问题
 */

export async function onRequestPost(context: any) {
  try {
    const { env } = context;
    
    // Worker URL（从环境变量获取，默认使用云端 Worker）
    const WORKER_URL = env.AI_PROXY_URL || 'https://ai-component-proxy.xuyongqiang916.workers.dev';
    
    console.log('AI Proxy: 转发请求到 Worker:', WORKER_URL);

    // 获取请求体
    const body = await context.request.json();

    // 转发到 Worker
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('AI Proxy 错误:', error);
    return new Response(
      JSON.stringify({ error: 'AI Proxy failed', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
