import { callAI } from '../utils/ai';

export async function onRequestPost(context: any) {
  try {
    const request = context.request;
    const env = context.env;
    
    // 解析请求体
    let body;
    try {
      body = await request.json();
      console.log('收到需求整理请求:', JSON.stringify(body));
    } catch (parseError) {
      console.error('请求体解析失败:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: '请求体格式错误' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { description } = body;
    
    if (!description) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数：description' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('开始整理需求...');

    // 构建需求整理提示词
    const prompt = `你是一个专业的产品经理，请根据以下用户描述，整理成结构化的需求文档：

用户描述：${description}

请提供以下内容（使用 JSON 格式）：
1. 核心功能点（3-5个）
2. 用户角色和使用场景
3. 业务流程
4. 关键交互要求
5. 技术约束和注意事项

返回格式示例：
{
  "coreFeatures": ["功能1", "功能2"],
  "userRoles": ["角色1"],
  "businessProcess": "流程描述",
  "keyInteractions": ["交互1"],
  "technicalConstraints": ["约束1"]
}`;

    const result = await callAI(prompt, env);
    console.log('需求整理完成');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          refinedRequirements: result
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('需求整理失败:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '需求整理失败' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
