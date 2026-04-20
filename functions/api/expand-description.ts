import { callAI } from '../utils/ai';

export async function onRequestPost(context: any) {
  try {
    const request = context.request;
    const env = context.env;
    const body = await request.json();
    
    const { description, componentName } = body;

    if (!description || !componentName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '缺少必要参数：description 和 componentName' 
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

    const result = await callAI(prompt, env);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result 
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
        error: error.message || 'AI 服务调用失败' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
