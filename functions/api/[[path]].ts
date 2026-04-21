// Pages Function: 透明代理所有 /api/* 请求到线上 Pages 服务
// 注意: 代码清洗已在 Worker 层完成,此处仅做请求转发
export async function onRequest(context: any) {
  const { request } = context;
  
  try {
    const pathname = new URL(request.url).pathname;
    const targetUrl = `https://ai-component-generator.pages.dev${pathname}`;
    
    // 直接转发请求,不做任何处理
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().text() : undefined,
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('API 代理错误:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'API 服务不可用' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}