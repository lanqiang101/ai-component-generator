/**
 * API: 需求分析整理
 * POST /api/refine-requirements
 * 
 * 请求体:
 * {
 *   params: {
 *     componentName: string,
 *     description: string,
 *     framework: string,
 *     componentType: string,
 *     style: string,
 *     // ... 其他参数
 *   }
 * }
 * 
 * 响应:
 * {
 *   success: boolean,
 *   data: {
 *     refinedRequirements: {
 *       refinedDescription: string,
 *       componentStructure: string,
 *       features: string[],
 *       prototypeDiagram: string,  // Mermaid 图
 *       technicalNotes: string[]
 *     }
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
    const { params } = body;

    if (!params || !params.componentName || !params.description) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 构建需求整理提示词
    const prompt = buildRefinementPrompt(params);

    // 调用 AI 生成结构化需求
    const result = await callAI(prompt, env);

    // 解析 AI 返回的 JSON
    const refinedRequirements = parseRefinedRequirements(result);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          refinedRequirements,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('需求整理失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '需求整理失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildRefinementPrompt(params: any): string {
  const { componentName, description, framework, componentType, style } = params;

  return `你是一个资深的前端架构师。请根据以下组件需求,进行详细的需求分析和架构设计。

**组件信息**:
- 名称: ${componentName}
- 描述: ${description}
- 框架: ${framework}
- 类型: ${componentType}
- 风格: ${style}

请以 **JSON 格式** 返回分析结果,包含以下字段:

\`\`\`json
{
  "refinedDescription": "用专业术语重新描述的详细需求,包括功能、交互、视觉要求",
  "componentStructure": "组件的文件结构和模块划分说明",
  "features": ["功能点1", "功能点2", "功能点3"],
  "prototypeDiagram": "使用 Mermaid block-beta 语法绘制组件布局原型图,例如:\\nblock-beta\\ncolumns 1\\n  Card[\\"商品卡片\\"]\\n  Image[\\"商品图片\\"]\\n  Content[\\"内容区域\\"]",
  "technicalNotes": ["技术要点1", "技术要点2"]
}
\`\`\`

**要求**:
1. refinedDescription: 200-400字的专业需求描述
2. features: 至少列出 3-5 个核心功能点
3. prototypeDiagram: 必须使用 Mermaid block-beta 语法,展示组件的视觉布局
4. technicalNotes: 列出 2-4 个关键技术实现要点
5. 确保返回的是有效的 JSON 格式,不要添加额外的解释文字

请直接返回 JSON 对象,不要添加 \`\`\`json 标记或其他前缀。`;
}

function parseRefinedRequirements(result: string): any {
  try {
    // 尝试提取 JSON（可能包含在代码块中）
    let jsonStr = result.trim();
    
    // 如果包含在代码块中，提取 JSON
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // 尝试找到 JSON 对象
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // 验证必需字段
    if (!parsed.refinedDescription || !parsed.features || !parsed.prototypeDiagram) {
      throw new Error('需求整理结果缺少必需字段');
    }
    
    return parsed;
  } catch (err) {
    console.error('无法解析需求整理结果:', err, '\n原始结果:', result);
    // 返回默认结构
    return {
      refinedDescription: result,
      componentStructure: '组件结构分析失败',
      features: [],
      prototypeDiagram: '原型图生成失败',
      technicalNotes: [],
    };
  }
}
