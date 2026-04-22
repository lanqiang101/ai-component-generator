import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 声明 process 变量（ES Module 环境中需要）
const process = globalThis.process || { env: {} };

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ===== AI 生成组件 API =====
// 前端获取模型配置，发送完整的model参数给后端，后端做API代理

app.post('/api/generate', async (req, res) => {
  try {
    const { params } = req.body;
    
    if (!params) {
      return res.status(400).json({ success: false, error: '缺少参数' });
    }

    // 构建提示词
    const prompt = buildPrompt(params);

    // 调用 AI API
    let result = await callAI(null, prompt);
    
    // 清理AI返回的代码：移除各种格式的Markdown标记
    if (result) {
      result = result.trim();
      
      // 1. 处理转义的格式: \`\`\`tsx\n 或 \\`\\`\\`tsx\\n
      result = result.replace(/\\?`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\\?\\n?/gi, '');
      
      // 2. 处理正常格式: ```tsx\n
      result = result.replace(/^`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
      result = result.replace(/\n?`{3}$/, '');
      
      // 3. 处理可能存在的开头/结尾空白
      result = result.trim();
      
      console.log('清理后的代码长度:', result.length);
      console.log('代码前100字符:', result.substring(0, 100));
    }
    
    res.json({ 
      success: true, 
      data: {
        code: result,
      } 
    });
  } catch (err) {
    console.error('生成失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====== 多文件组件化生成 API ======

// 内存存储生成任务 (生产环境应使用 Redis/数据库)
const generationTasks = new Map();

// POST /api/generate/component - 启动多文件生成任务
app.post('/api/generate/component', async (req, res) => {
  try {
    const { params } = req.body;
    
    if (!params) {
      return res.status(400).json({ success: false, error: '缺少参数' });
    }
    
    console.log('🚀 启动多文件生成任务');
    
    // 1. 分析组件架构
    const architecture = await analyzeComponentArchitecture(params);
    
    // 2. 创建任务ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 3. 初始化任务
    const task = {
      id: taskId,
      status: 'analyzing',
      currentStep: 0,
      totalSteps: architecture.totalFiles,
      progress: 0,
      params,
      architecture,
      files: [],
      startedAt: new Date(),
    };
    
    generationTasks.set(taskId, task);
    
    // 4. 异步执行生成
    executeMultiFileGeneration(taskId).catch(err => {
      console.error('❌ 生成任务失败:', err);
      const task = generationTasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = err.message;
      }
    });
    
    res.json({ 
      success: true, 
      taskId,
      message: '生成任务已启动',
      architecture: {
        complexity: architecture.complexity,
        generationMode: architecture.generationMode,
        totalFiles: architecture.totalFiles,
        estimatedTotalLines: architecture.estimatedTotalLines
      }
    });
  } catch (err) {
    console.error('启动生成任务失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/generate/:taskId/status - 查询任务状态
app.get('/api/generate/:taskId/status', (req, res) => {
  const task = generationTasks.get(req.params.taskId);
  
  if (!task) {
    return res.status(404).json({ success: false, error: '任务不存在' });
  }
  
  res.json({ 
    success: true, 
    task: {
      id: task.id,
      status: task.status,
      progress: task.progress,
      currentStep: task.currentStep,
      totalSteps: task.totalSteps,
      error: task.error,
      files: task.files.map(f => ({
        path: f.path,
        name: f.name,
        status: f.status,
        size: f.code?.length || 0
      }))
    }
  });
});

// GET /api/generate/:taskId/files - 获取所有生成的文件
app.get('/api/generate/:taskId/files', (req, res) => {
  const task = generationTasks.get(req.params.taskId);
  
  if (!task) {
    return res.status(404).json({ success: false, error: '任务不存在' });
  }
  
  if (task.status !== 'completed') {
    return res.status(400).json({ 
      success: false, 
      error: '任务未完成或不存在' 
    });
  }
  
  res.json({ 
    success: true, 
    files: task.files
  });
});

// 内部函数: 分析组件架构
async function analyzeComponentArchitecture(params) {
  const prompt = buildArchitectureAnalysisPrompt(params);
  const result = await callAI(null, prompt);
  
  try {
    // 解析 JSON
    let jsonStr = result.trim();
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const architecture = JSON.parse(jsonStr);
    
    // 判断生成模式
    const estimatedLines = architecture.estimatedTotalLines || 100;
    const isComplex = estimatedLines > 100 || (architecture.subComponents && architecture.subComponents.length > 0);
    
    architecture.generationMode = isComplex ? 'multi-file' : 'single-file';
    architecture.complexity = estimatedLines > 200 ? 'complex' : (estimatedLines > 100 ? 'medium' : 'simple');
    architecture.totalFiles = isComplex ? (architecture.subComponents?.length || 0) + 2 : 1; // 子组件 + 主组件 + utils
    architecture.estimatedTotalLines = estimatedLines;
    
    console.log('✅ 架构分析完成:', {
      mode: architecture.generationMode,
      complexity: architecture.complexity,
      files: architecture.totalFiles,
      lines: architecture.estimatedTotalLines
    });
    
    return architecture;
  } catch (err) {
    console.error('架构分析失败:', err);
    // 降级为单文件模式
    return {
      componentName: params.componentName,
      description: params.description,
      complexity: 'simple',
      generationMode: 'single-file',
      totalFiles: 1,
      estimatedTotalLines: 80
    };
  }
}

// 内部函数: 执行多文件生成
async function executeMultiFileGeneration(taskId) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  console.log(`📦 开始执行多文件生成: ${taskId}`);
  
  const { architecture, params } = task;
  
  // 如果是单文件模式,直接使用原有逻辑
  if (architecture.generationMode === 'single-file') {
    task.status = 'generating';
    
    // 添加重试机制
    let code = null;
    let validation = null;
    let currentPrompt = buildPrompt(params);
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      code = await callAI(null, currentPrompt);
      code = cleanGeneratedCode(code);
      
      // 验证代码完整性
      validation = validateCodeCompleteness(code);
      
      if (validation.valid) {
        console.log('✅ 代码完整性验证通过');
        break;
      } else {
        console.warn(`⚠️ 第 ${attempt} 次尝试代码不完整:`, validation.issues.join(', '));
        
        if (attempt <= maxRetries) {
          console.log(`🔄 尝试重新生成 (${attempt}/${maxRetries})...`);
          // 在 prompt 中强调完整性要求
          currentPrompt += '\n\n⚠️ 上次生成的代码不完整，请确保：\n' +
                    '- 所有括号正确闭合\n' +
                    '- 所有字符串完整\n' +
                    '- 最后一行是完整语句\n' +
                    '- 末尾添加 // [FILE_END] 标记';
        } else {
          console.warn('❌ 达到最大重试次数，使用当前代码');
        }
      }
    }
    
    task.files = [{
      path: 'index.tsx',
      name: 'index.tsx',
      code: code,
      status: 'completed',
      generatedAt: new Date(),
      validation: validation
    }];
    
    task.status = 'completed';
    task.progress = 100;
    task.completedAt = new Date();
    
    console.log('✅ 单文件生成完成');
    return;
  }
  
  // 多文件模式:逐个生成
  task.status = 'filling';
  
  // 1. 生成工具函数(如果有)
  if (architecture.utilityFunctions && architecture.utilityFunctions.length > 0) {
    for (const util of architecture.utilityFunctions) {
      updateTaskProgress(taskId, 'generating', util.filePath);
      
      const prompt = buildUtilityFunctionPrompt(util, params, task.files);
      let code = await callAI(null, prompt);
      code = cleanGeneratedCode(code);
      
      // 验证代码完整性
      const validation = validateCodeCompleteness(code);
      
      saveTaskFile(taskId, {
        path: util.filePath,
        name: util.filePath.split('/').pop(),
        code: code,
        status: validation.valid ? 'completed' : 'warning',
        generatedAt: new Date(),
        validation: validation
      });
      
      if (!validation.valid) {
        console.warn(`⚠️ 工具函数 ${util.filePath} 代码不完整:`, validation.issues.join(', '));
      }
      
      updateTaskProgress(taskId, 'completed', util.filePath);
    }
  }
  
  // 2. 生成子组件
  if (architecture.subComponents && architecture.subComponents.length > 0) {
    // 按优先级排序
    const sortedComponents = [...architecture.subComponents].sort((a, b) => a.priority - b.priority);
    
    for (const component of sortedComponents) {
      updateTaskProgress(taskId, 'generating', component.filePath);
      
      const prompt = buildSubComponentPrompt(component, params, task.files);
      let code = await callAI(null, prompt);
      code = cleanGeneratedCode(code);
      
      // 验证代码完整性
      const validation = validateCodeCompleteness(code);
      
      saveTaskFile(taskId, {
        path: component.filePath,
        name: component.filePath.split('/').pop(),
        code: code,
        status: validation.valid ? 'completed' : 'warning',
        generatedAt: new Date(),
        validation: validation
      });
      
      if (!validation.valid) {
        console.warn(`⚠️ 子组件 ${component.filePath} 代码不完整:`, validation.issues.join(', '));
      }
      
      updateTaskProgress(taskId, 'completed', component.filePath);
    }
  }
  
  // 3. 生成主组件
  if (architecture.mainComponent) {
    updateTaskProgress(taskId, 'generating', architecture.mainComponent.filePath);
    
    const prompt = buildMainComponentPrompt(architecture, params, task.files);
    let code = await callAI(null, prompt);
    code = cleanGeneratedCode(code);
    
    // 验证代码完整性
    const validation = validateCodeCompleteness(code);
    
    saveTaskFile(taskId, {
      path: architecture.mainComponent.filePath,
      name: 'index.tsx',
      code: code,
      status: validation.valid ? 'completed' : 'warning',
      generatedAt: new Date(),
      validation: validation
    });
    
    if (!validation.valid) {
      console.warn(`⚠️ 主组件代码不完整:`, validation.issues.join(', '));
    }
    
    updateTaskProgress(taskId, 'completed', architecture.mainComponent.filePath);
  }
  
  task.status = 'completed';
  task.progress = 100;
  task.completedAt = new Date();
  
  console.log(`✅ 多文件生成完成: ${task.files.length} 个文件`);
}

// 辅助函数: 更新任务进度
function updateTaskProgress(taskId, stepStatus, fileName) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  task.currentStep++;
  task.progress = Math.round((task.currentStep / task.totalSteps) * 100);
  
  console.log(`  📝 [${task.currentStep}/${task.totalSteps}] ${stepStatus}: ${fileName}`);
}

// 辅助函数: 保存文件
function saveTaskFile(taskId, fileData) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  task.files.push(fileData);
}

// 辅助函数: 清洗代码
function cleanGeneratedCode(code) {
  if (!code || typeof code !== 'string') return code;
  
  let cleaned = code.trim();
  
  // 移除 Markdown 标记
  cleaned = cleaned.replace(/\\?`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\\?\n?/gi, '');
  cleaned = cleaned.replace(/^`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?`{3}$/, '');
  
  // 移除结束标记
  cleaned = cleaned.replace(/\n?\/\/ \[FILE_END\]$/, '');
  cleaned = cleaned.replace(/\n?\/\/ \[END_OF_CODE\]$/, '');
  
  // ⚠️ 自动修复条件样式语法错误（新增）
  
  // 修复 1: 不完整的三元表达式 ...(condition ? value) → ...(condition ? value : {})
  // 匹配: ...(isInStock ? styles.hidden) 或 ...(isLoading ? styles.inStockColor.outOfStockColor)
  cleaned = cleaned.replace(
    /\.\.\.\s*\(\s*(\w+)\s*\?\s*([\w.]+)\s*\)/g,
    '...($1 ? $2 : {})'
  );
  
  // 修复 2: 嵌套属性访问的完整三元表达式 ...(condition ? styles.a.b : styles.c.d)
  // 简化为: ...(condition ? styles.a : styles.c)
  cleaned = cleaned.replace(
    /\.\.\.\s*\(\s*(\w+)\s*\?\s*styles\.(\w+)\.(\w+)\s*:\s*styles\.(\w+)\.(\w+)\s*\)/g,
    '...($1 ? styles.$2 : styles.$4)'
  );
  
  // 修复 3: 嵌套属性访问的不完整三元表达式 ...(condition ? styles.a.b)
  // 简化为: ...(condition ? styles.a : {})
  cleaned = cleaned.replace(
    /\.\.\.\s*\(\s*(\w+)\s*\?\s*styles\.(\w+)\.(\w+)\s*\)/g,
    '...($1 ? styles.$2 : {})'
  );
  
  return cleaned.trim();
}

// 从 JSON 结构组装完整组件代码(已废弃,保留供参考)
// function assembleComponent(codeStructure, framework) {
//   const {
//     imports = '',
//     types = '',
//     utils = '',
//     subComponents = [],
//     mainComponent,
//     mockData = '',
//     styles = ''
//   } = codeStructure;
  
//   if (!mainComponent || !mainComponent.render) {
//     throw new Error('缺少主组件定义');
//   }
  
//   let code = '';
  
//   // 1. 导入语句
//   if (imports) {
//     code += imports + '\n\n';
//   } else {
//     // 默认导入 React
//     code += "import React from 'react';\n\n";
//   }
  
//   // 2. 类型定义（如果有）
//   if (types) {
//     code += types + '\n\n';
//   }
  
//   // 3. 工具函数
//   if (utils) {
//     code += '// ====== 工具函数 ======\n';
//     code += utils + '\n\n';
//   }
  
//   // 4. Mock 数据
//   if (mockData) {
//     code += '// ====== Mock 数据 ======\n';
//     code += mockData + '\n\n';
//   }
  
//   // 5. 子组件
//   if (subComponents && subComponents.length > 0) {
//     code += '// ====== 子组件 ======\n\n';
//     subComponents.forEach((comp, index) => {
//       code += `// --- ${comp.name} ---\n`;
//       code += comp.code + '\n\n';
//     });
//   }
  
//   // 6. 主组件
//   code += '// ====== 主组件 ======\n';
  
//   // 构建主组件签名
//   const propsList = mainComponent.props || [];
//   const propsStr = propsList.length > 0 ? `{ ${propsList.join(', ')} }` : '';
  
//   code += `export default function ${mainComponent.name}(${propsStr}) {\n`;
  
//   // 状态声明
//   if (mainComponent.state && mainComponent.state.length > 0) {
//     code += '  // 状态管理\n';
//     mainComponent.state.forEach(stateLine => {
//       code += `  ${stateLine}\n`;
//     });
//     code += '\n';
//   }
  
//   // 事件处理器
//   if (mainComponent.handlers && mainComponent.handlers.length > 0) {
//     code += '  // 事件处理\n';
//     mainComponent.handlers.forEach(handlerLine => {
//       code += `  ${handlerLine}\n`;
//     });
//     code += '\n';
//   }
  
//   // 渲染部分
//   code += '  // 渲染\n';
//   code += mainComponent.render;
  
//   // 确保闭合
//   if (!code.trim().endsWith('}')) {
//     code += '\n}';
//   }
  
//   // 7. 样式（如果有外部样式）
//   if (styles) {
//     code += '\n\n// ====== 样式 ======\n';
//     code += styles;
//   }
  
//   // 8. 添加结束标记
//   code += '\n\n// [END_OF_CODE]';
  
//   return code;
// }

function buildPrompt(params) {
  const {
    componentName,
    description,
    framework,
    componentType,
    style,
    dimensions,
    needMockData,
    interactive,
    uiLibrary,
    uiLibraryVersion,
    stylePreprocessor,
    extraRequirements,
    refinedRequirements, // 新增：接收完整的需求分析
  } = params;

  let frameworkLabel = '';
  switch (framework) {
    case 'react-tsx':
      frameworkLabel = 'React 18 + TypeScript TSX';
      break;
    case 'react-jsx':
      frameworkLabel = 'React 18 JavaScript JSX';
      break;
    case 'vue3-sfc':
      frameworkLabel = 'Vue 3 Single-File Component (.vue) TypeScript';
      break;
    case 'vue3-js':
      frameworkLabel = 'Vue 3 Single-File Component (.vue) JavaScript';
      break;
    case 'html-css-js':
      frameworkLabel = '纯 HTML + CSS + JavaScript (不需要构建工具)';
      break;
  }

  // UI 库信息
  let uiLibraryText = '';
  if (uiLibrary && uiLibrary !== 'none') {
    const libName = getUILibraryName(uiLibrary);
    if (uiLibraryVersion) {
      uiLibraryText = `请使用 ${libName} ${uiLibraryVersion} 版本来开发这个组件\n`;
    } else {
      uiLibraryText = `请使用 ${libName} 组件库来开发这个组件\n`;
    }
  } else {
    uiLibraryText = '不使用任何第三方UI库，使用原生手写样式\n';
  }

  // 样式预处理
  let stylePreprocessorText = '';
  switch (stylePreprocessor) {
    case 'css':
      stylePreprocessorText = '使用原生纯 CSS\n';
      break;
    case 'scss':
      stylePreprocessorText = '使用 SCSS 预处理样式\n';
      break;
    case 'less':
      stylePreprocessorText = '使用 LESS 预处理样式\n';
      break;
    case 'tailwind':
      stylePreprocessorText = '使用 Tailwind CSS 进行样式开发\n';
      break;
  }

  let styleLabel = '';
  switch (style) {
    case 'minimal': styleLabel = '简约现代风格'; break;
    case 'neumorphism': styleLabel = '新拟物化 (Neumorphism) 风格'; break;
    case 'glassmorphism': styleLabel = '玻璃拟态 (Glassmorphism) 风格'; break;
    case 'cyberpunk': styleLabel = '赛博朋克风格'; break;
    case 'retro': styleLabel = '复古风格'; break;
    case 'material': styleLabel = 'Material Design 风格'; break;
    case 'antd': styleLabel = 'Ant Design 设计风格'; break;
  }

  let componentTypeLabel = componentType;

  // 构建需求分析部分（如果有）
  let refinedRequirementsSection = '';
  if (refinedRequirements) {
    refinedRequirementsSection = ```

## 📋 详细需求分析（重要参考！）

### 功能列表
${refinedRequirements.features?.map((f, i) => `${i + 1}. ${f}`).join('\n') || '无'}

### 技术要点
${refinedRequirements.technicalNotes?.map((t, i) => `${i + 1}. ${t}`).join('\n') || '无'}

### 组件结构参考
\`\`\`mermaid
${refinedRequirements.componentStructure || ''}
\`\`\`

### 布局原型参考
\`\`\`mermaid
${refinedRequirements.prototypeDiagram || ''}
\`\`\`

**请严格按照以上需求分析生成代码，确保实现所有功能和符合技术规范！**
`;
  }

  const promptText = `你是一个经验丰富的前端开发工程师，请根据用户需求生成一个${frameworkLabel}组件。

⚠️ **极其重要的完整性要求（违反将导致代码无法使用）**:
1. **必须在代码最后一行添加标记**: \`// [END_OF_CODE]\`
2. **所有括号、引号、标签必须成对闭合**
3. **如果代码较长,宁可简化逻辑也要保证结构完整**
4. **输出前自我检查**: 最后一行是否是完整语句?所有括号是否闭合?

组件需求:
- 组件名称: ${componentName}
- 组件类型: ${componentTypeLabel}
- 描述: ${description}
- 设计风格: ${styleLabel}
${dimensions ? `- 尺寸要求: ${dimensions}（请严格按照此尺寸设置组件样式）` : '- 尺寸要求: 自适应容器宽度（不要设置固定宽度，使用 width: 100% 或不设置宽度，让组件响应式适应父容器）'}
${uiLibraryText}${stylePreprocessorText}- ${interactive ? '需要添加完整的交互事件处理' : '不需要复杂交互'}
- ${needMockData ? '请生成合理的默认 Mock 数据，方便直接预览，把 Mock 数据放在代码顶部方便编辑' : '不需要 Mock 数据'}
${extraRequirements ? `- 额外需求: ${extraRequirements}` : ''}
${refinedRequirementsSection}

## 📋 代码结构模板（必须严格遵循）

Please按照 following structure organize code, ensure each part is complete:

\`\`\`javascript
// ====== 导入语句 ======
import React from 'react';

// ====== 工具函数（可选）======
// 如果有工具函数，放在这里

// ====== Mock 数据（如果需要）======
const mockData = {
  // 完整的 Mock 数据对象
};

// ====== 子组件（可选，每个不超过80行）======
const SubComponent1 = (props) => {
  return (
    // JSX
  );
};

// ====== 主组件（必须 export default）======
export default function ComponentName(props) {
  // 1. 状态声明
  const [state1, setState1] = React.useState(initialValue);
  
  // 2. 副作用
  React.useEffect(() => {
    // effect logic
  }, []);
  
  // 3. 事件处理器
  const handler1 = () => {
    // handler logic
  };
  
  // 4. 渲染
  return (
    <div className="container">
      {/* 完整的 JSX 结构 */}
    </div>
  );
}
// [END_OF_CODE]
\`\`\`

## ⚠️ 关键要求

1. **代码质量要求**:
   - 只返回完整可运行的组件代码，不要有多余解释
   - 代码要整洁，有适当的注释
   - 如果使用 UI 库，请正确导入对应版本的组件
   - 确保代码可以直接复制使用，不需要额外修改
   - 遵循当前框架、UI库和版本的最佳实践
   - 所有括号、大括号、尖括号必须正确配对闭合
   - 确保语法正确，避免出现语法错误
   - **重要：使用纯 JavaScript 编写，避免使用 TypeScript 类型注解**
   - **不要使用 interface、type、泛型等 TypeScript 特性**
   - **函数参数不要添加类型注解，直接使用解构：({ param1, param2 }) 而不是 ({ param1, param2 }: PropsType)**

2. **可读性优化**:
   - 组件命名要有意义，体现功能
   - 函数和变量使用清晰的命名
   - 逻辑清晰，避免过度嵌套（最多 3 层）
   - 适当使用空行分隔不同逻辑块
   - 变量声明要完整，确保所有使用的变量都已定义

3. **预览兼容性**:
   - 生成的代码需要能在浏览器中直接运行
   - 避免使用 Node.js 特有的 API
   - Mock 数据要完整，包含所有组件需要的数据字段
   - **重要：使用 React.useState、React.useEffect 等完整形式，而不是从 react 解构导入**
   - 示例：
     \`\`\`javascript
     // ✅ 正确：使用 React.useState
     const [count, setCount] = React.useState(0);
     React.useEffect(() => { ... }, []);
     
     // ❌ 错误：不要使用解构导入
     import { useState, useEffect } from 'react';
     const [count, setCount] = useState(0);
     \`\`\`
   - 确保所有导入的组件和库都能正常工作

开始生成代码（记住在最后一行添加 // [END_OF_CODE]）:`;

  return promptText;
}

function getUILibraryName(value) {
  const map = {
    none: '不使用（原生）',
    antd: 'Ant Design',
    'material-ui': 'Material UI',
    'chakra-ui': 'Chakra UI',
    mantine: 'Mantine',
    'shadcn-ui': 'Shadcn UI',
    'element-plus': 'Element Plus',
    'antd-vue': 'Ant Design Vue',
    vuetify: 'Vuetify',
    'naive-ui': 'Naive UI',
    bootstrap: 'Bootstrap',
    tailwind: 'Tailwind CSS',
  };
  return map[value] || value;
}

/**
 * 调用 AI API
 * 使用 Cloudflare Pages Worker 代理请求，避免暴露 API Key
 */
async function callAI(model, prompt) {
  // 根据环境变量选择代理 URL
  // 本地开发默认使用测试环境的 Pages Functions
  // 生产环境通过环境变量配置
  const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
  const proxyUrl = `${baseUrl}/api/generate`;

  const headers = {
    'Content-Type': 'application/json',
  };

  // 注意: 测试环境当前的 /api/generate 期望的是旧格式
  // 需要包装成 params 对象
  const body = {
    params: {
      componentName: 'TempComponent',
      description: prompt,  // 将 prompt 作为 description
      framework: 'react-jsx',
      componentType: 'other',
      style: 'minimal',
      dimensions: '',
      needMockData: false,
      interactive: false,
      uiLibrary: 'none',
      uiLibraryVersion: '',
      stylePreprocessor: 'css',
      extraRequirements: ''
    }
  };

  console.log('🤖 调用 AI API (通过 Pages Functions):', {
    url: proxyUrl,
    env: process.env.NODE_ENV || 'development'
  });

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // 处理响应格式
    if (data.success && data.data && data.data.code) {
      return data.data.code;
    } else if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('API 返回格式错误');
    }
  } catch (err) {
    console.error('❌ AI API 调用失败:', err);
    throw new Error(`AI 服务调用失败: ${err.message}`);
  }
}

// ===== AI 需求整理 API =====
app.post('/api/refine-requirements', async (req, res) => {
  try {
    const { params } = req.body;
    
    if (!params) {
      return res.status(400).json({ success: false, error: '缺少参数' });
    }

    // 直接代理到 Pages Functions
    const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
    const proxyUrl = `${baseUrl}/api/refine-requirements`;

    console.log('🤖 代理需求整理请求到 Pages Functions:', {
      url: proxyUrl,
      env: process.env.NODE_ENV || 'development'
    });

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pages Functions 请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('需求整理失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function buildRefinementPrompt(params) {
  const {
    componentName,
    description,
    framework,
    componentType,
    style,
    dimensions,
    needMockData,
    interactive,
    uiLibrary,
    uiLibraryVersion,
    stylePreprocessor,
    extraRequirements,
  } = params;

  let frameworkLabel = '';
  switch (framework) {
    case 'react-tsx': frameworkLabel = 'React 18 + TypeScript (TSX)'; break;
    case 'react-jsx': frameworkLabel = 'React 18 + JavaScript (JSX)'; break;
    case 'vue3-sfc': frameworkLabel = 'Vue 3 + TypeScript (.vue)'; break;
    case 'vue3-js': frameworkLabel = 'Vue 3 + JavaScript (.vue)'; break;
    case 'html-css-js': frameworkLabel = '纯 HTML + CSS + JavaScript'; break;
  }

  let styleLabel = '';
  switch (style) {
    case 'minimal': styleLabel = '简约现代'; break;
    case 'neumorphism': styleLabel = '新拟物化'; break;
    case 'glassmorphism': styleLabel = '玻璃拟态'; break;
    case 'cyberpunk': styleLabel = '赛博朋克'; break;
    case 'retro': styleLabel = '复古'; break;
    case 'material': styleLabel = 'Material Design'; break;
    case 'antd': styleLabel = 'Ant Design 风格'; break;
  }

  const uiLibraryInfo = uiLibrary && uiLibrary !== 'none' 
    ? `${uiLibrary}${uiLibraryVersion ? ' ' + uiLibraryVersion : ''}`
    : '原生手写（不使用第三方库）';

  const promptText = `你是一个资深前端架构师和产品经理。请根据用户的组件需求，生成详细的需求分析文档。

## 用户原始需求

- **组件名称**: ${componentName || '未指定'}
- **组件类型**: ${componentType}
- **技术栈**: ${frameworkLabel}
- **设计风格**: ${styleLabel}
- **UI 库**: ${uiLibraryInfo}
- **样式方案**: ${stylePreprocessor}
${dimensions ? `- **尺寸要求**: ${dimensions}` : '- **尺寸要求**: 自适应容器宽度'}
- **需要 Mock 数据**: ${needMockData ? '是' : '否'}
- **需要交互**: ${interactive ? '是' : '否'}
- **原始描述**: 
${description}
${extraRequirements ? `- **额外需求**: ${extraRequirements}` : ''}

## 任务要求

请严格按照以下 JSON 格式输出需求分析结果（不要输出其他内容）：

\`\`\`json
{
  "refinedDescription": "详细且专业的需求描述，包括组件功能、交互方式、视觉呈现、数据处理等，200-300字",
  "componentStructure": "使用 Mermaid graph TD 语法绘制组件层次结构图，例如：\\ngraph TD\\n    A[ProductCard] --> B[ProductImage]\\n    A --> C[ProductInfo]\\n    B --> B1[Image]",
  "features": ["功能点1", "功能点2", "功能点3", "功能点4", "功能点5"],
  "prototypeDiagram": "使用 Mermaid block-beta 语法绘制组件布局原型图，例如：\\nblock-beta\\ncolumns 1\\n  Card[\"商品卡片\"]\\n  Image[\"商品图片\"]\\n  Content[\"内容区域\"]",
  "technicalNotes": ["技术要点1", "技术要点2", "技术要点3"]
}
\`\`\`

## 要求说明

1. **refinedDescription**: 将用户简短的描述扩写为专业的产品需求文档风格
2. **componentStructure**: 使用 Mermaid graph TD 语法绘制组件层次结构图
3. **features**: 列出 5-8 个核心功能点
4. **prototypeDiagram**: 使用 Mermaid block-beta 或 flowchart 语法绘制组件布局原型图
5. **technicalNotes**: 列出 3-5 个技术实现要点（如状态管理、性能优化、可访问性等）

### Mermaid 示例

**组件结构图示例：**
\`\`\`mermaid
graph TD
    A[ProductCard] --> B[ProductImage]
    A --> C[ProductInfo]
    A --> D[ProductActions]
    B --> B1[Image]
    B --> B2[Badges]
    C --> C1[Title]
    C --> C2[Price]
    D --> D1[BuyButton]
\`\`\`

**布局原型图示例：**
\`\`\`mermaid
block-beta
columns 1
  Card["商品卡片"]
  space
  block:Header
    columns 2
    Badges["标签区域"] space Space[" "]
  end
  Image["商品图片"]
  block:Content
    columns 2
    Title["商品标题"] Price["价格"]
  end
  Actions["操作按钮区"]
\`\`\`

Please directly output JSON 格 format的结果, don't contain any explanation或其他文字。`;

  return promptText;
}

function parseRefinedRequirements(result) {
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

// ===== AI 扩写组件描述 API =====
app.post('/api/expand-description', async (req, res) => {
  try {
    const { description, componentName } = req.body;
    
    if (!description) {
      return res.status(400).json({ success: false, error: '缺少描述内容' });
    }

    // 直接代理到 Pages Functions
    const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
    const proxyUrl = `${baseUrl}/api/expand-description`;

    console.log('🤖 代理扩写请求到 Pages Functions:', {
      url: proxyUrl,
      env: process.env.NODE_ENV || 'development'
    });

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, componentName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pages Functions 请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('扩写失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function buildExpandPrompt(description, componentName) {
  return `你是一个专业的前端产品需求分析师。请根据用户提供的组件简要描述，进行详细扩写。

原始组件名称：${componentName || '未指定'}
原始描述：${description}

请将这个描述扩写为更详细、更专业的产品需求描述，包括：
1. 组件的核心功能和用途
2. 用户交互方式和行为
3. 视觉呈现和布局要求
4. 数据展示和处理方式
5. 边界情况和错误处理

要求：
- 保持简洁明了，不要过于冗长
- 使用产品需求的语言风格
- 突出关键功能和特性
- 控制在 200-300 字以内
- 直接输出扩写后的描述，不要有其他解释

扩写后的描述：`;
}

// ====== 多文件生成的 Prompt 构建函数 ======

// 1. 架构分析 Prompt (优化版)
function buildArchitectureAnalysisPrompt(params) {
  const { componentName, description, componentType } = params;
  
  return `# 组件架构分析任务

请深入分析以下组件需求，设计合理的组件架构和文件结构。

## 组件信息
- **名称**: ${componentName}
- **类型**: ${componentType || '通用组件'}
- **描述**: ${description}

## 复杂度评估标准

### 🟢 简单组件 (single-file, <100行)
**特征**:
- 功能单一，无复杂交互
- 无需内部状态管理或仅有简单状态
- 不涉及数据转换或业务逻辑
- 示例: Button, Badge, Icon, Label

**文件结构**: 
\`\`\`
index.tsx (主组件，包含所有逻辑)
\`\`\`

### 🟡 中等组件 (multi-file, 100-250行)
**特征**:
- 包含2-3个可复用的UI片段
- 需要简单的工具函数（格式化、验证等）
- 有明确的状态管理需求
- 示例: Card, FormInput, Dropdown

**文件结构**:
\`\`\`
index.tsx (主组件)
components/ChildComponent1.tsx (子组件1)
utils/helper.ts (工具函数，可选)
\`\`\`

### 🔴 复杂组件 (multi-file, >250行)
**特征**:
- 包含4+个独立的功能模块
- 需要多个工具函数和辅助方法
- 复杂的状态管理和数据流
- 示例: DataTable, Dashboard, WizardForm

**文件结构**:
\`\`\`
index.tsx (主组件)
components/Header.tsx
components/Body.tsx
components/Footer.tsx
utils/formatters.ts
utils/validators.ts
\`\`\`

## 输出格式（严格 JSON）

### 简单组件示例：
{
  "componentName": "${componentName}",
  "description": "简洁的组件描述",
  "complexity": "simple",
  "generationMode": "single-file",
  "estimatedTotalLines": 80,
  "subComponents": [],
  "utilityFunctions": [],
  "mainComponent": {
    "filePath": "index.tsx",
    "dependencies": [],
    "estimatedLines": 80
  }
}

### 复杂组件示例：
{
  "componentName": "${componentName}",
  "description": "详细的组件描述",
  "complexity": "medium",
  "generationMode": "multi-file",
  "estimatedTotalLines": 220,
  "subComponents": [
    {
      "id": "comp1",
      "name": "ProductImage",
      "filePath": "components/ProductImage.tsx",
      "purpose": "展示商品图片，支持懒加载和错误处理",
      "props": ["src", "alt", "fallbackSrc"],
      "estimatedLines": 50,
      "priority": 1
    },
    {
      "id": "comp2",
      "name": "ProductInfo",
      "filePath": "components/ProductInfo.tsx",
      "purpose": "展示商品标题、价格、描述等信息",
      "props": ["title", "price", "description", "stock"],
      "estimatedLines": 70,
      "priority": 2
    }
  ],
  "utilityFunctions": [
    {
      "name": "formatPrice",
      "filePath": "utils/formatters.ts",
      "purpose": "将数字格式化为货币字符串",
      "exports": ["formatPrice"],
      "estimatedLines": 15
    }
  ],
  "mainComponent": {
    "filePath": "index.tsx",
    "dependencies": ["ProductImage", "ProductInfo"],
    "estimatedLines": 80
  }
}

## 关键要求

1. **子组件拆分原则**:
   - 每个子组件职责单一，遵循单一职责原则
   - 子组件之间低耦合，高内聚
   - 避免过度拆分（不超过6个子组件）
   - 子组件代码行数控制在 40-80 行

2. **工具函数提取原则**:
   - 纯函数，无副作用
   - 可复用性强
   - 放在 utils/ 目录
   - 每个文件不超过 30 行

3. **命名规范**:
   - 组件名使用 PascalCase
   - 文件路径使用 kebab-case 或 camelCase
   - 工具函数使用 camelCase

4. **依赖关系**:
   - 主组件依赖所有子组件
   - 子组件可以依赖工具函数
   - 避免循环依赖

## 输出要求
- **只输出 JSON**，不要包含 Markdown 代码块标记
- **不要添加任何解释性文字**
- **确保 JSON 格式正确**，可以被 JSON.parse() 解析
- **estimatedTotalLines** 必须准确反映总行数`;
}

// 2. 工具函数生成 Prompt (优化版)
function buildUtilityFunctionPrompt(utilDesign, params, generatedFiles) {
  const context = generatedFiles.length > 0 
    ? `\n\n【已生成文件】\n${generatedFiles.map(f => `- ${f.path}: ${extractExportsSummary(f.code)}`).join('\n')}`
    : '';
  
  return `# 工具函数生成任务

请生成纯 JavaScript 工具函数文件，确保代码简洁、可复用。

## 项目上下文
- **主组件**: ${params.componentName}
- **描述**: ${params.description}${context}

## 当前文件信息
- **文件路径**: ${utilDesign.filePath}
- **用途说明**: ${utilDesign.purpose}
- **导出函数**: ${utilDesign.exports.join(', ')}
- **预估行数**: ${utilDesign.estimatedLines || 20} 行

## 代码规范要求

### 1. 禁止导入 React
\`\`\`javascript
// ❌ 错误：不要导入 React
// import React from 'react';

// ✅ 正确：纯 JavaScript 函数
export function formatPrice(price) {
  return \`¥\${price.toFixed(2)}\`;
}
\`\`\`

### 2. 函数定义规范
\`\`\`javascript
/**
 * 格式化价格为货币字符串
 * @param {number} price - 价格数值
 * @param {string} currency - 货币符号（可选，默认 ¥）
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price, currency = '¥') {
  if (typeof price !== 'number' || isNaN(price)) {
    return \`\${currency}0.00\`;
  }
  return \`\${currency}\${price.toFixed(2)}\`;
}
\`\`\`

### 3. 命名规范
- 函数名使用 camelCase
- 参数名清晰明了
- 添加 JSDoc 注释

### 4. 错误处理
\`\`\`javascript
// ✅ 包含基本的类型检查和边界处理
export function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  return date.toISOString().split('T')[0];
}
\`\`\`

### 5. 导出方式
\`\`\`javascript
// ✅ 使用命名导出
export function func1() { }
export function func2() { }

// ❌ 不要使用 default export
// export default { func1, func2 };
\`\`\`

## 输出示例

\`\`\`javascript
/**
 * 格式化价格为货币字符串
 * @param {number} price - 价格
 * @param {string} symbol - 货币符号
 * @returns {string}
 */
export function formatPrice(price, symbol = '¥') {
  if (typeof price !== 'number') {
    return \`\${symbol}0.00\`;
  }
  return \`\${symbol}\${price.toFixed(2)}\`;
}

/**
 * 截断文本到指定长度
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

// [FILE_END]
\`\`\`

## 开始生成
请生成完整的 ${utilDesign.filePath} 文件，确保：
1. 只包含纯 JavaScript 函数
2. 每个函数都有 JSDoc 注释
3. 包含基本的错误处理
4. 代码不超过 ${utilDesign.estimatedLines || 30} 行
5. 最后一行添加 \`// [FILE_END]\` 标记`;
}

// 3. 子组件生成 Prompt (优化版)
function buildSubComponentPrompt(componentDesign, params, generatedFiles) {
  const context = generatedFiles.length > 0
    ? `\n\n【已生成文件清单】\n${generatedFiles.map(f => `- ${f.path}: ${extractExportsSummary(f.code)}`).join('\n')}`
    : '';
  
  return `# 子组件生成任务

请生成以下子组件，确保代码质量和完整性。

## 项目上下文
- **主组件**: ${params.componentName}
- **组件描述**: ${params.description}${context}

## 当前文件信息
- **文件路径**: ${componentDesign.filePath}
- **组件名称**: ${componentDesign.name}
- **核心职责**: ${componentDesign.purpose}
- **接收 Props**: 
${componentDesign.props.map(prop => `  - \`${prop}\``).join('\n')}
- **预估行数**: ${componentDesign.estimatedLines} 行

## 代码规范要求

### 1. 导入语句
\`\`\`javascript
// ✅ 可以导入已生成的工具函数或子组件
import { formatPrice } from '../utils/formatters';
import ProductImage from './ProductImage';

// ❌ 不要导入 React（使用全局 React 对象）
// import React from 'react';
\`\`\`

### 2. 状态管理
\`\`\`javascript
// ✅ 使用 React.useState
const [isOpen, setIsOpen] = React.useState(false);

// ✅ 使用 React.useEffect
React.useEffect(() => {
  // 副作用逻辑
}, [dependency]);
\`\`\`

### 3. Props 定义
\`\`\`javascript
/**
 * @param {string} title - 商品标题
 * @param {number} price - 商品价格
 * @param {boolean} inStock - 是否有库存
 */
export default function ProductInfo({ title, price, inStock }) {
  // 组件逻辑
}
\`\`\`

### 4. 样式处理
\`\`\`javascript
// ✅ 使用内联 style 对象
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }
};

return <div style={styles.container}>...</div>;
\`\`\`

**⚠️ 条件样式的正确写法（严格遵守）**:

\`\`\`javascript
// ❌ 绝对禁止的写法 1：三元表达式缺少 else 分支
style={{
  ...styles.buttonBase,
  ...(isDisabled ? styles.disabled),  // ← 语法错误！缺少冒号和 else
}}

// ❌ 绝对禁止的写法 2：错误的嵌套属性访问
style={{
  ...styles.stockStatus,
  ...(isInStock ? styles.a.b : styles.c.d),  // ← 语法错误！
}}

// ✅ 正确方式 1：三元表达式必须有完整的 if-else（推荐用于二选一）
style={{
  ...styles.base,
  ...(isActive ? styles.active : styles.inactive),  // ← 必须有两个值
}}

// ✅ 正确方式 2：使用逻辑与 &&（推荐用于有条件地添加）
style={{
  ...styles.base,
  ...(isDisabled && styles.disabled),  // ← 简洁安全
}}

// ✅ 正确方式 3：直接在 style 属性上使用三元表达式
style={isDisabled ? styles.disabled : styles.base}

// ✅ 正确方式 4：提取为变量
const statusStyle = isInStock ? styles.inStock : styles.outOfStock;
<span style={{ ...styles.stockStatus, ...statusStyle }}>
\`\`\`

**🚨 关键规则（必须遵守）**:
1. **三元表达式必须完整**: \`condition ? value1 : value2\` - **绝不能省略 \`: value2\`**
2. **禁止嵌套属性链式访问**: 不要用 \`styles.a.b.c\`,使用 \`styles.a\` 或 \`styles.b\`
3. **展开运算符后必须是完整表达式**: \`...(expr)\` 中的 expr 必须能独立求值
4. **优先使用逻辑与 &&**: 比三元表达式更简洁、更安全

### 5. 代码完整性要求
- ✅ **所有括号必须闭合**: (), {}, <>
- ✅ **所有字符串必须闭合**: "", '', \`\`
- ✅ **所有 JSX 标签必须闭合**: <div>...</div> 或 <div />
- ✅ **最后一行必须是完整语句**
- ✅ **必须在末尾添加标记**: \`// [FILE_END]\`

## 输出示例

\`\`\`javascript
import { formatPrice } from '../utils/formatters';

/**
 * 商品信息展示组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 商品标题
 * @param {number} props.price - 商品价格
 */
export default function ProductInfo({ title, price }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</h3>
      <p style={{ color: '#e53e3e', fontSize: '20px' }}>
        {formatPrice(price)}
      </p>
      {isExpanded && (
        <button onClick={handleToggle}>收起</button>
      )}
    </div>
  );
}

// [FILE_END]
\`\`\`

## 开始生成
请生成完整的 ${componentDesign.name} 组件代码，确保：
1. 代码不超过 ${componentDesign.estimatedLines} 行
2. 严格遵循上述规范
3. 最后一行添加 \`// [FILE_END]\` 标记`;
}

// 4. 主组件生成 Prompt (优化版)
function buildMainComponentPrompt(architecture, _params, _generatedFiles) {
  const subComponentsList = architecture.subComponents?.map(c => 
    `- **${c.filePath}**: export default ${c.name} (${c.purpose})`
  ).join('\n') || '无';
  
  const utilsList = architecture.utilityFunctions?.map(u =>
    `- **${u.filePath}**: 导出 ${u.exports.join(', ')} (${u.purpose})`
  ).join('\n') || '无';
  
  const importStatements = [
    ...(architecture.subComponents?.map(c => `import ${c.name} from './${c.filePath.replace('.tsx', '')}';`) || []),
    ...(architecture.utilityFunctions?.map(u => `import { ${u.exports.join(', ')} } from './${u.filePath.replace('.ts', '')}';`) || [])
  ].join('\n');
  
  return `# 主组件生成任务

请生成主组件入口文件，负责组合所有子组件并管理整体状态。

## 项目信息
- **组件名称**: ${architecture.componentName}
- **组件描述**: ${architecture.description}
- **复杂度**: ${architecture.complexity}
- **预估总行数**: ${architecture.estimatedTotalLines} 行

## 已生成文件清单

### 子组件
${subComponentsList}

### 工具函数
${utilsList}

## 当前文件要求
- **文件路径**: index.tsx
- **组件名称**: ${architecture.componentName}
- **核心职责**: 
  1. 导入并组合所有子组件
  2. 管理全局状态和数据流
  3. 处理用户交互和业务逻辑
  4. 向子组件传递 Props

## Mock 数据定义

请在代码顶部定义 \`mockData\` 对象，包含：
- 组件所需的所有字段
- 合理的数据类型和默认值
- 至少 2-3 条示例数据（如果是列表）

示例：
\`\`\`javascript
const mockData = {
  title: '商品标题',
  price: 99.99,
  description: '商品描述',
  inStock: true,
  images: ['image1.jpg', 'image2.jpg']
};
\`\`\`

## 代码结构模板

\`\`\`javascript
// ====== 导入语句 ======
${importStatements || '// 无需额外导入'}

// ====== Mock 数据 ======
const mockData = {
  // 在此定义 mock 数据
};

// ====== 主组件 ======
/**
 * ${architecture.componentName} 组件
 * @description ${architecture.description}
 */
export default function ${architecture.componentName}(props) {
  // 1. 解构 Props（使用默认值）
  const {
    // props 列表
  } = props || {};

  // 2. 状态声明
  const [state1, setState1] = React.useState(mockData.field1);
  const [state2, setState2] = React.useState(false);

  // 3. 副作用
  React.useEffect(() => {
    // 初始化逻辑
  }, []);

  // 4. 事件处理器
  const handleAction = () => {
    // 业务逻辑
  };

  // 5. 渲染
  return (
    <div style={{ /* 容器样式 */ }}>
      {/* 使用子组件 */}
      <SubComponent1 prop1={state1} onAction={handleAction} />
      <SubComponent2 data={mockData} />
    </div>
  );
}

// [FILE_END]
\`\`\`

## 关键要求

### 1. 导入规范
\`\`\`javascript
// ✅ 正确：导入所有依赖
import ProductImage from './components/ProductImage';
import { formatPrice } from './utils/formatters';

// ❌ 错误：不要导入 React
// import React from 'react';
\`\`\`

### 2. Props 接口（使用 JSDoc）
\`\`\`javascript
/**
 * @param {string} props.title - 标题
 * @param {number} props.price - 价格
 * @param {Function} props.onClick - 点击回调
 */
export default function Component({ title, price, onClick }) {
  // ...
}
\`\`\`

### 3. 状态管理
- 使用 \`React.useState\` 管理本地状态
- 使用 \`React.useEffect\` 处理副作用
- 状态命名清晰（如 \`isLoading\`, \`isExpanded\`）

### 4. 样式处理
- 使用内联 style 对象
- 保持样式简洁，避免过度嵌套
- 支持响应式（可选）

**⚠️ 条件样式的正确写法**:
\`\`\`javascript
// ❌ 错误：多余的括号导致语法错误
style={{
  ...styles.buttonBase,
  ...(isDisabled ? styles.disabled),  // ← 错误！
}}

// ✅ 正确方式 1：提供默认值
style={{
  ...styles.buttonBase,
  ...(isDisabled ? styles.disabled : {}),
}}

// ✅ 正确方式 2：使用逻辑与（推荐）
style={{
  ...styles.buttonBase,
  ...(isDisabled && styles.disabled),
}}

// ✅ 正确方式 3：直接在 style 属性上使用三元表达式
style={isDisabled ? styles.disabled : styles.buttonBase}
\`\`\`

### 5. 代码完整性
- ✅ 所有括号闭合
- ✅ 所有字符串闭合
- ✅ JSX 标签完整
- ✅ 最后一行添加 \`// [FILE_END]\`

## 输出要求
- 代码不超过 ${architecture.mainComponent?.estimatedLines || 100} 行
- 严格遵循上述模板和规范
- 确保可以独立运行（配合已生成的子组件）
- 最后一行必须添加 \`// [FILE_END]\` 标记`;
}

// 辅助函数: 提取代码导出摘要
function extractExportsSummary(code) {
  const exports = [];
  
  // 查找 export default
  const defaultExport = code.match(/export default\s+(?:function|class|const)\s+(\w+)/);
  if (defaultExport) {
    exports.push(`default: ${defaultExport[1]}`);
  }
  
  // 查找命名导出
  const namedExports = code.matchAll(/export\s+(?:function|const)\s+(\w+)/g);
  for (const match of namedExports) {
    exports.push(match[1]);
  }
  
  return exports.length > 0 ? exports.join(', ') : '无导出';
}

// ====== 代码完整性验证函数 ======

/**
 * 验证生成代码的完整性
 * @param {string} code - 生成的代码
 * @returns {{valid: boolean, issues: string[], suggestions: string[]}}
 */
function validateCodeCompleteness(code) {
  const issues = [];
  const suggestions = [];
  
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      issues: ['代码为空'],
      suggestions: ['请重新生成代码']
    };
  }
  
  const trimmed = code.trim();
  
  // 1. 检查结束标记
  if (!trimmed.endsWith('// [FILE_END]')) {
    issues.push('缺少文件结束标记 // [FILE_END]');
    suggestions.push('在代码末尾添加 // [FILE_END]');
  }
  
  // 2. 检查括号平衡
  const bracketBalance = checkBracketBalance(trimmed);
  if (!bracketBalance.balanced) {
    issues.push(`括号不平衡: ${bracketBalance.message}`);
    suggestions.push('确保所有括号正确闭合');
  }
  
  // 3. 检查字符串闭合
  const stringCheck = checkStringClosure(trimmed);
  if (!stringCheck.closed) {
    issues.push(`字符串未闭合: ${stringCheck.message}`);
    suggestions.push('确保所有引号正确配对');
  }
  
  // 4. 检查 JSX 标签
  const jsxCheck = checkJsxTags(trimmed);
  if (!jsxCheck.valid) {
    issues.push(`JSX 标签问题: ${jsxCheck.message}`);
    suggestions.push('确保所有 JSX 标签正确闭合');
  }
  
  // 5. 检查最后一行是否完整
  const lines = trimmed.split('\n');
  const lastLine = lines[lines.length - 1].trim();
  if (lastLine && isIncompleteStatement(lastLine)) {
    issues.push(`最后一行不完整: "${lastLine.substring(0, 50)}"`);
    suggestions.push('确保最后一行是完整的语句');
  }
  
  // 6. 检查条件样式语法（新增）
  const styleSyntaxCheck = checkConditionalStyleSyntax(trimmed);
  if (!styleSyntaxCheck.valid) {
    issues.push(`条件样式语法错误: ${styleSyntaxCheck.message}`);
    suggestions.push('确保三元表达式完整: condition ? value1 : value2');
  }
  
  // 7. 检查是否有 export default（主组件和子组件）
  if (trimmed.includes('export default function') || 
      trimmed.includes('export default class') ||
      trimmed.match(/export default\s+\w+/)) {
    // 有默认导出，通过
  } else if (trimmed.includes('export function') || trimmed.includes('export const')) {
    // 工具函数使用命名导出，通过
  } else {
    issues.push('缺少导出语句');
    suggestions.push('添加 export default 或 export 语句');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * 检查括号平衡
 */
function checkBracketBalance(code) {
  const stack = [];
  const pairs = { '(': ')', '[': ']', '{': '}', '<': '>' };
  const openers = Object.keys(pairs);
  const closers = Object.values(pairs);
  
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inJsxTag = false;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';
    
    // 跳过注释
    if (char === '/' && code[i + 1] === '/') {
      inComment = true;
      continue;
    }
    if (inComment && char === '\n') {
      inComment = false;
      continue;
    }
    if (inComment) continue;
    
    // 处理字符串
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (inString) continue;
    
    // 处理括号
    if (openers.includes(char)) {
      // JSX 中的 < 需要特殊处理
      if (char === '<') {
        if (prevChar === '=' || /\w/.test(prevChar)) {
          // 可能是比较运算符或泛型，跳过
          continue;
        }
        inJsxTag = true;
      }
      stack.push(char);
    } else if (closers.includes(char)) {
      if (char === '>') {
        if (inJsxTag) {
          inJsxTag = false;
          stack.pop();
        }
        // 非 JSX 的 > 不处理
      } else {
        const lastOpener = stack.pop();
        if (!lastOpener || pairs[lastOpener] !== char) {
          return {
            balanced: false,
            message: `发现未匹配的 '${char}'`
          };
        }
      }
    }
  }
  
  if (stack.length > 0) {
    return {
      balanced: false,
      message: `有 ${stack.length} 个未闭合的括号: ${stack.join(', ')}`
    };
  }
  
  return { balanced: true, message: '' };
}

/**
 * 检查字符串闭合
 */
function checkStringClosure(code) {
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  const backticks = (code.match(/`/g) || []).length;
  
  const issues = [];
  
  if (singleQuotes % 2 !== 0) {
    issues.push('单引号数量为奇数');
  }
  if (doubleQuotes % 2 !== 0) {
    issues.push('双引号数量为奇数');
  }
  if (backticks % 2 !== 0) {
    issues.push('反引号数量为奇数');
  }
  
  return {
    closed: issues.length === 0,
    message: issues.join(', ')
  };
}

/**
 * 检查 JSX 标签
 */
function checkJsxTags(code) {
  // 简单的 JSX 标签检查
  const openTags = code.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) || [];
  const closeTags = code.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];
  
  // 提取标签名
  const openNames = openTags.map(tag => tag.match(/<([a-zA-Z]+)/)[1]);
  const closeNames = closeTags.map(tag => tag.match(/<\/([a-zA-Z]+)/)[1]);
  
  // 统计每个标签的出现次数
  const openCount = {};
  const closeCount = {};
  
  openNames.forEach(name => {
    openCount[name] = (openCount[name] || 0) + 1;
  });
  
  closeNames.forEach(name => {
    closeCount[name] = (closeCount[name] || 0) + 1;
  });
  
  // 检查是否匹配（排除自关闭标签和 HTML 原生标签）
  const htmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input', 'img', 'br', 'hr'];
  
  for (const name in openCount) {
    if (htmlTags.includes(name.toLowerCase())) continue;
    
    const expected = openCount[name];
    const actual = closeCount[name] || 0;
    
    if (expected !== actual) {
      return {
        valid: false,
        message: `<${name}> 标签打开 ${expected} 次，关闭 ${actual} 次`
      };
    }
  }
  
  return { valid: true, message: '' };
}

/**
 * 检查是否为不完整的语句
 */
function isIncompleteStatement(line) {
  // 常见的不完整模式
  const incompletePatterns = [
    /,\s*$/,           // 以逗号结尾
    /\.\.\.\s*$/,      // 以省略号结尾
    /\.\s*$/,          // 以点号结尾
    /=>\s*$/,          // 以箭头函数符号结尾
    /=\s*$/,           // 以赋值符号结尾
    /\(\s*$/,          // 以开括号结尾
    /\{\s*$/,          // 以开大括号结尾
    /<[^>]*$/,         // 未闭合的 JSX 标签
    /['"`][^'"`]*$/,   // 未闭合的字符串
  ];
  
  return incompletePatterns.some(pattern => pattern.test(line));
}

/**
 * 检查条件样式语法（新增）
 * 检测不完整的三元表达式：...(condition ? value)
 */
function checkConditionalStyleSyntax(code) {
  // 匹配模式: ...(xxx ? yyy) 或 ...(xxx ? yyy.zzz)
  // 特征: 三元表达式缺少 : elseValue
  const incompleteTernaryRegex = /\.\.\.\s*\(\s*\w+[^)]*\?\s*[^:)]+\)/g;
  
  const matches = code.match(incompleteTernaryRegex);
  
  if (matches && matches.length > 0) {
    return {
      valid: false,
      message: `发现不完整的三元表达式: ${matches[0].substring(0, 50)}...`,
      examples: matches.slice(0, 3) // 返回前3个错误示例
    };
  }
  
  // 检查嵌套属性访问：styles.a.b.c
  const nestedPropertyRegex = /\.\.\.\s*\(\s*\w+\s*\?\s*styles\.\w+\.\w+/g;
  const nestedMatches = code.match(nestedPropertyRegex);
  
  if (nestedMatches && nestedMatches.length > 0) {
    return {
      valid: false,
      message: `禁止嵌套属性访问: ${nestedMatches[0].substring(0, 50)}...`,
      examples: nestedMatches.slice(0, 3)
    };
  }
  
  return { valid: true, message: '' };
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`AI 组件生成器后端服务运行在 http://localhost:${PORT}`);
  console.log('模型配置存储在前端 localStorage，后端仅做 API 代理');
});
