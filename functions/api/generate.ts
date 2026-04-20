import { callAI } from '../utils/ai';

export async function onRequestPost(context: any) {
  try {
    const request = context.request;
    const env = context.env;
    const { params } = await request.json();
    
    if (!params) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少参数' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 构建简化的提示词
    const prompt = `你是一个专业的前端开发工程师，请根据以下需求生成一个 React 组件：

组件名称: ${params.componentName || 'MyComponent'}
组件类型: ${params.componentType || '通用组件'}
描述: ${params.description}
设计风格: ${params.style || '简约现代'}
${params.dimensions ? `尺寸要求: ${params.dimensions}` : ''}
${params.uiLibrary && params.uiLibrary !== 'none' ? `使用 UI 库: ${params.uiLibrary}` : '不使用第三方 UI 库'}

要求：
1. 只返回完整可运行的组件代码，不要有多余解释
2. 使用 React 18 + TypeScript (TSX)
3. 代码要整洁，有适当的注释
4. 确保代码可以直接复制使用
5. 使用 React.useState、React.useEffect 等完整形式
6. Mock 数据要完整

开始生成代码:`;

    const code = await callAI(prompt, env);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { code }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('生成失败:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '生成失败' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
