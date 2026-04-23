/**
 * API: Requirements Refinement
 * POST /api/refine-requirements
 * 
 * Request body:
 * {
 *   params: {
 *     componentName: string,
 *     description: string,
 *     framework: string,
 *     componentType: string,
 *     style: string,
 *     // ... other parameters
 *   },
 *   language?: string  // 'en' | 'zh'
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     refinedRequirements: {
 *       refinedDescription: string,
 *       componentStructure: string,
 *       features: string[],
 *       prototypeDiagram: string,  // Mermaid diagram
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
    const { params, language = 'en' } = body;

    if (!params || !params.componentName || !params.description) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build refinement prompt (based on language)
    const prompt = buildRefinementPrompt(params, language);

    // Call AI to generate structured requirements
    const result = await callAI(prompt, env);

    // Parse JSON returned by AI
    const refinedRequirements = parseRefinedRequirements(result, language);

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
    console.error('Requirements refinement failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Requirements refinement failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildRefinementPrompt(params: any, language: string = 'en'): string {
  const { componentName, description, framework, componentType, style } = params;

  if (language === 'zh') {
    // 中文提示词
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
  } else {
    // English prompt
    return `You are a senior Frontend Architect. Please conduct detailed requirements analysis and architecture design based on the following component requirements.

**Component Information**:
- Name: ${componentName}
- Description: ${description}
- Framework: ${framework}
- Type: ${componentType}
- Style: ${style}

Please return the analysis results in **JSON format**, containing the following fields:

\`\`\`json
{
  "refinedDescription": "Detailed requirements rewritten in professional terminology, including functionality, interaction, and visual requirements",
  "componentStructure": "Component file structure and module division description",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "prototypeDiagram": "Use Mermaid block-beta syntax to draw component layout prototype, e.g.:\\nblock-beta\\ncolumns 1\\n  Card[\\"Product Card\\"]\\n  Image[\\"Product Image\\"]\\n  Content[\\"Content Area\\"]",
  "technicalNotes": ["Technical Note 1", "Technical Note 2"]
}
\`\`\`

**Requirements**:
1. refinedDescription: 200-400 words professional requirements description
2. features: List at least 3-5 core features
3. prototypeDiagram: Must use Mermaid block-beta syntax to show component visual layout
4. technicalNotes: List 2-4 key technical implementation points
5. Ensure the returned JSON is valid, do not add extra explanatory text
6. **重要**: 生成的 component code中，所有代码注释必须使用英文

Please return the JSON object directly, without adding \`\`\`json markers or other prefixes.`;
  }
}

function parseRefinedRequirements(result: string, language: string = 'en'): any {
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
      throw new Error(language === 'zh' ? '需求整理结果缺少必需字段' : 'Missing required fields in requirements refinement result');
    }
    
    return parsed;
  } catch (err) {
    console.error('Failed to parse requirements refinement result:', err, '\nOriginal result:', result);
    // 返回默认结构
    return {
      refinedDescription: result,
      componentStructure: language === 'zh' ? '组件结构分析失败' : 'Component structure analysis failed',
      features: [],
      prototypeDiagram: language === 'zh' ? '原型图生成失败' : 'Prototype diagram generation failed',
      technicalNotes: [],
    };
  }
}