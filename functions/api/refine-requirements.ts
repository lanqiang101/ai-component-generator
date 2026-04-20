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
    
    // 前端发送的是 { params: { ... } } 结构
    const { params } = body;
    
    if (!params || !params.description) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数：params.description' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { componentName, description, componentType, style, framework } = params;

    console.log('开始整理需求...');
    console.log('组件名称:', componentName);
    console.log('组件描述:', description);

    // 构建需求整理提示词
    const prompt = `你是一个专业的产品经理和前端架构师，请根据以下组件需求，整理成结构化的需求文档：

## 基本信息
- 组件名称：${componentName || '未命名组件'}
- 组件类型：${componentType || '通用组件'}
- 框架：${framework || 'React'}
- 风格：${style || '简约'}

## 需求描述
${description}

请提供以下内容（必须返回有效的 JSON 格式）：

{
  "refinedDescription": "用200-300字详细描述组件的功能、交互和技术要求，包括加载性能、用户体验等",
  "componentStructure": "使用 Mermaid 语法生成组件结构图（block-beta 或 flowchart），展示组件的层级关系和子组件",
  "features": ["功能点1", "功能点2", "功能点3", "功能点4"],
  "prototypeDiagram": "使用 Mermaid 的 block-beta 语法生成原型示意图，展示组件的布局和元素位置",
  "technicalNotes": ["技术要点1", "技术要点2", "技术要点3"]
}

注意：
1. componentStructure 和 prototypeDiagram 必须使用合法的 Mermaid 语法
2. features 和 technicalNotes 必须是字符串数组
3. refinedDescription 应该包含性能要求（如加载时间）、交互细节、状态管理等技术要求
4. 所有内容都应该与前端组件开发直接相关`;

    const aiResponse = await callAI(prompt, env);
    console.log('需求整理完成，AI 原始响应:', aiResponse.substring(0, 200));

    // 解析 AI 返回的 JSON 字符串
    let refinedRequirements;
    try {
      refinedRequirements = JSON.parse(aiResponse);
      
      // 确保必需字段存在
      if (!refinedRequirements.refinedDescription) {
        refinedRequirements.refinedDescription = description;
      }
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      // 降级处理：返回原始描述
      refinedRequirements = {
        refinedDescription: description,
        features: [],
        technicalNotes: []
      };
    }

    console.log('最终返回的数据:', JSON.stringify(refinedRequirements).substring(0, 200));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          refinedRequirements: refinedRequirements
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
