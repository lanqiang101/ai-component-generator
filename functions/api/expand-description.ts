import { callAI } from '../utils/ai';

export async function onRequestPost(context: any) {
  try {
    const request = context.request;
    const env = context.env;
    
    // 解析请求体
    let body;
    try {
      body = await request.json();
      console.log('收到请求体:', JSON.stringify(body));
    } catch (parseError) {
      console.error('请求体解析失败:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '请求体格式错误，需要有效的 JSON' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { description, componentName } = body;

    console.log('参数检查 - description:', description, 'componentName:', componentName);

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
        error: error.message || 'AI 服务调用失败' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
