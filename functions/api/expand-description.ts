/**
 * API: 扩写组件描述
 * POST /api/expand-description
 * 
 * 请求体:
 * {
 *   description: string,      // 简短的组件描述
 *   componentName?: string    // 可选的组件名称
 * }
 * 
 * 响应:
 * {
 *   success: boolean,
 *   data: {
 *     expandedDescription: string  // 扩写后的详细描述
 *   }
 * }
 */

import { callAI } from '../utils/ai';

export async function onRequest(context: any) {
  const { request, env } = context;
  
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { description, componentName } = body;

    if (!description) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少描述内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 构建扩写提示词
    const prompt = buildExpandPrompt(description, componentName);

    // 调用 AI 生成扩写文本
    const expandedDescription = await callAI(prompt, env);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          expandedDescription,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('扩写失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '扩写失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildExpandPrompt(description: string, componentName?: string): string {
  return `你是一个专业的产品经理和前端架构师。请根据以下简短的组件描述,扩写成详细、专业的前端组件需求说明。

组件名称: ${componentName || '未指定'}
简要描述: ${description}

请从以下几个方面进行详细描述:

1. **功能需求**: 组件应该具备哪些核心功能?用户如何与之交互?
2. **视觉设计**: 组件的布局结构、颜色方案、间距、圆角等视觉特征
3. **数据展示**: 需要展示哪些数据字段?数据的格式和类型是什么?
4. **交互行为**: 悬停、点击、加载等状态下的反馈效果
5. **响应式要求**: 在不同屏幕尺寸下的适配策略
6. **边界情况**: 空状态、加载状态、错误状态的处理

要求:
- 使用专业的前端术语
- 描述要具体、可执行
- 避免模糊的表述
- 字数控制在 200-400 字之间

请直接返回扩写后的需求描述,不要添加任何前缀或后缀。`;
}
