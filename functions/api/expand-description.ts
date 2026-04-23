/**
 * API: Expand Component Description
 * POST /api/expand-description
 * 
 * Request body:
 * {
 *   description: string,      // Brief component description
 *   componentName?: string,   // Optional component name
 *   language?: string         // Language: 'en' | 'zh'
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     expandedDescription: string  // Expanded detailed description
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
    const { description, componentName, language = 'en' } = body;

    if (!description) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing description content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build expansion prompt (based on language)
    const prompt = buildExpandPrompt(description, componentName, language);

    // Call AI to generate expanded text
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
    console.error('Description expansion failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Description expansion failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildExpandPrompt(description: string, componentName?: string, language: string = 'en'): string {
  if (language === 'zh') {
    // 中文提示词
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
  } else {
    // English prompt
    return `You are a professional Product Manager and Frontend Architect. Please expand the following brief component description into a detailed, professional frontend component requirement specification.

Component Name: ${componentName || 'Not specified'}
Brief Description: ${description}

Please describe in detail from the following aspects:

1. **Functional Requirements**: What core features should the component have? How do users interact with it?
2. **Visual Design**: Layout structure, color scheme, spacing, border radius, and other visual characteristics
3. **Data Display**: What data fields need to be displayed? What are the data formats and types?
4. **Interaction Behavior**: Feedback effects in hover, click, loading, and other states
5. **Responsive Requirements**: Adaptation strategies for different screen sizes
6. **Edge Cases**: Handling of empty states, loading states, and error states

Requirements:
- Use professional frontend terminology
- Descriptions should be specific and actionable
- Avoid vague expressions
- Word count should be between 200-400 words

IMPORTANT: All code comments MUST be written in English.

Please return the expanded requirement description directly, without any prefixes or suffixes.`;
  }
}