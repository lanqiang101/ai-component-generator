// Pages Function: Transparent proxy for all /api/* requests to production Pages service
// Note: Code cleaning is done at the Worker layer, this only handles request forwarding
export async function onRequest(context: any) {
  const { request } = context;
  
  try {
    const pathname = new URL(request.url).pathname;
    const targetUrl = `https://ai-component-generator.pages.dev${pathname}`;
    
    // Directly forward request without any processing
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
    console.error('API proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'API service unavailable' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}