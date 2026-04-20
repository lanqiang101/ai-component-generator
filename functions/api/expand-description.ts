import { callAI } from '../utils/ai';

export async function onRequestPost(context: any) {
  try {
    const request = context.request;
    const env = context.env;
    
    // 解析请求体
    let body;
    try {
      body = await request.json();
      console.log('收到扩展描述请求:', JSON.stringify(body));
    } catch (parseError) {
      console.error('请求体解析失败:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '请求体格式错误' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
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

    console.log('开始调用 AI...');
    const aiResponse = await callAI(prompt, env);
    console.log('AI 调用成功，原始响应:', aiResponse.substring(0, 200));

    // AI 可能返回 JSON 字符串，需要解析
    let expandedDescription;
    try {
      // 尝试解析 JSON 字符串
      const parsedJson = JSON.parse(aiResponse);
      
      // 如果解析成功，提取 detailedDescription 字段
      if (parsedJson.detailedDescription) {
        expandedDescription = parsedJson.detailedDescription;
      } else {
        // 如果没有 detailedDescription 字段，返回整个 JSON 对象
        expandedDescription = JSON.stringify(parsedJson, null, 2);
      }
    } catch (parseError) {
      // 如果不是 JSON 格式，直接使用原始文本
      console.log('AI 响应不是 JSON 格式，使用原始文本');
      expandedDescription = aiResponse;
    }

    console.log('最终返回的描述:', expandedDescription.substring(0, 200));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          expandedDescription: expandedDescription
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
