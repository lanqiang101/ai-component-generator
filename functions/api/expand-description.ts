import { callAI } from '../utils/ai';

// 调试端点 - 返回接收到的原始请求
export async function onRequestPost(context: any) {
  try {
    const request = context.request;
    const env = context.env;
    
    // 记录请求头
    console.log('请求头:', Object.fromEntries(request.headers.entries()));
    
    // 获取原始请求体文本
    const rawBody = await request.text();
    console.log('原始请求体文本:', rawBody);
    
    // 尝试解析 JSON
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('解析后的请求体:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '请求体不是有效的 JSON 格式',
          debug: {
            rawBody: rawBody.substring(0, 200),
            error: String(parseError)
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { description, componentName } = body;

    console.log('提取的参数 - description:', description, 'componentName:', componentName);

    if (!description || !componentName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '缺少必要参数：description 和 componentName',
          debug: {
            receivedKeys: Object.keys(body),
            description: description,
            componentName: componentName
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 调用 AI 扩展描述
    const prompt = `请根据以下组件描述，生成更详细的技术需求文档：

组件名称：${componentName}
简要描述：${description}

请提供：
1. 详细的功能描述（200-300字）
2. 核心交互逻辑
3. 样式要求
4. 数据结构定义
5. 边界情况处理

请以 JSON 格式返回，包含以下字段：
- detailedDescription: 详细描述
- interactions: 交互逻辑数组
- styling: 样式要求
- dataStructure: 数据结构
- edgeCases: 边界情况数组`;

    console.log('开始调用 AI...');
    const result = await callAI(prompt, env);
    console.log('AI 调用成功');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          expandedDescription: result
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('扩展描述失败:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'AI 服务调用失败',
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
