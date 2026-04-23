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

    // 调用 AI API,直接传递 params 对象
    let result = await callAI(null, params);
    
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
  try {
    const prompt = buildArchitectureAnalysisPrompt(params);
    const result = await callAI(null, prompt);
    
    // 解析 JSON
    let jsonStr = result.trim();
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const architecture = JSON.parse(jsonStr);
    
    // ⚠️ 固定使用多文件生成模式
    architecture.generationMode = 'multi-file';
    
    // 确保至少生成 2 个文件（主组件 + 至少 1 个子组件）
    const subComponentsCount = architecture.subComponents?.length || 0;
    
    // 如果 AI 未返回子组件，自动生成一个默认子组件
    if (subComponentsCount === 0) {
      architecture.subComponents = [
        {
          id: 'comp1',
          name: `${params.componentName || 'Component'}Content`,
          filePath: `components/${params.componentName || 'Component'}Content.tsx`,
          purpose: '组件主要内容区域',
          props: [],
          estimatedLines: 80,
          priority: 1
        }
      ];
    }
    
    architecture.totalFiles = 1 + (architecture.subComponents?.length || 0); // 主组件 + 子组件
    architecture.estimatedTotalLines = architecture.estimatedTotalLines || 150;
    
    console.log('✅ 架构分析完成:', {
      mode: architecture.generationMode,
      files: architecture.totalFiles,
      subComponents: architecture.subComponents.length,
      lines: architecture.estimatedTotalLines
    });
    
    return architecture;
  } catch (err) {
    console.error('⚠️ 架构分析失败,使用默认多文件模式:', err.message);
    // 降级为默认多文件模式
    return {
      componentName: params.componentName,
      description: params.description,
      generationMode: 'multi-file',
      totalFiles: 2,
      estimatedTotalLines: 150,
      subComponents: [
        {
          id: 'comp1',
          name: `${params.componentName || 'Component'}Content`,
          filePath: `components/${params.componentName || 'Component'}Content.tsx`,
          purpose: '组件主要内容区域',
          props: [],
          estimatedLines: 80,
          priority: 1
        }
      ],
      utilityFunctions: [],
      mainComponent: {
        filePath: 'index.tsx',
        dependencies: [`${params.componentName || 'Component'}Content`],
        estimatedLines: 70
      }
    };
  }
}

// 内部函数: 执行多文件生成
async function executeMultiFileGeneration(taskId) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  console.log(`📦 开始执行多文件生成: ${taskId}`);
  
  const { architecture, params } = task;
  
  // ⚠️ 现在只有多文件模式，移除单文件模式判断
  
  // 多文件模式:逐个生成
  task.status = 'generating';
  
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






/**
 * 调用 AI API
 * @param {object|null} model - 模型配置(暂未使用)
 * @param {object|string} paramsOrPrompt - 可以是 params 对象或 prompt 字符串
 * @returns {Promise<string>} AI 生成的内容
 */
async function callAI(model, paramsOrPrompt) {
  // 统一通过 Pages Functions 代理,避免直接调用 Worker 的网络问题
  const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
  
  const headers = {
    'Content-Type': 'application/json',
  };

  let proxyUrl;
  let body;

  // 判断是 params 对象还是 prompt 字符串
  if (typeof paramsOrPrompt === 'string') {
    // 模式 1: 传递 prompt 字符串,通过 Pages Functions 的 /api/chat 端点
    proxyUrl = `${baseUrl}/api/chat`;
    
    // 构建标准的 Chat API 请求格式
    body = {
      messages: [
        { role: 'user', content: paramsOrPrompt }
      ]
    };
    
    console.log('🤖 调用 AI API (Pages Functions - Chat 模式):', {
      url: proxyUrl,
      promptLength: paramsOrPrompt.length
    });
  } else {
    // 模式 2: 传递 params 对象,调用 Pages Functions 的 /api/generate
    proxyUrl = `${baseUrl}/api/generate`;
    body = { params: paramsOrPrompt };
    
    console.log('🤖 调用 AI API (Pages Functions - Generate 模式):', {
      url: proxyUrl,
      componentName: paramsOrPrompt.componentName
    });
  }

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



// ====== 多文件生成的 Prompt 构建函数 ======

// 1. 架构分析 Prompt (优化版)
function buildArchitectureAnalysisPrompt(params) {
  const { componentName, description, componentType } = params;
  
  return `# 组件架构分析任务

请深入分析以下组件需求，设计合理的**多文件组件架构**。

## 组件信息
- **名称**: ${componentName}
- **类型**: ${componentType || '通用组件'}
- **描述**: ${description}

## ⚠️ 重要：强制多文件生成模式

**本项目固定使用多文件组件化方案**，无论组件简单或复杂，都必须拆分为多个文件。

### 最小文件结构（至少 2 个文件）
\`\`\`
index.tsx (主组件)
components/${componentName || 'Component'}Content.tsx (内容子组件)
\`\`\`

### 推荐的多文件结构
\`\`\`
index.tsx (主组件 - 负责状态管理和组合子组件)
components/Header.tsx (头部子组件)
components/Body.tsx (主体子组件)
components/Footer.tsx (底部子组件)
utils/helpers.ts (工具函数，可选)
\`\`\`

## 输出格式（严格 JSON）

{
  "componentName": "${componentName}",
  "description": "简洁的组件描述",
  "generationMode": "multi-file",
  "estimatedTotalLines": 150,
  "subComponents": [
    {
      "id": "comp1",
      "name": "${componentName}Header",
      "filePath": "components/${componentName}Header.tsx",
      "purpose": "组件头部区域，展示标题和主要操作",
      "props": ["title", "onAction"],
      "estimatedLines": 50,
      "priority": 1
    },
    {
      "id": "comp2",
      "name": "${componentName}Content",
      "filePath": "components/${componentName}Content.tsx",
      "purpose": "组件主要内容区域",
      "props": ["data", "loading"],
      "estimatedLines": 70,
      "priority": 2
    }
  ],
  "utilityFunctions": [
    {
      "name": "formatData",
      "filePath": "utils/formatters.ts",
      "purpose": "格式化数据用于展示",
      "exports": ["formatData"],
      "estimatedLines": 15
    }
  ],
  "mainComponent": {
    "filePath": "index.tsx",
    "dependencies": ["${componentName}Header", "${componentName}Content"],
    "estimatedLines": 60
  }
}

## 关键要求

1. **必须拆分至少 1 个子组件**
   - 即使是很简单的组件，也要拆出内容部分
   - 主组件负责状态管理，子组件负责 UI 渲染

2. **子组件拆分原则**:
   - 每个子组件职责单一，遵循单一职责原则
   - 子组件之间低耦合，高内聚
   - 避免过度拆分（不超过 6 个子组件）
   - 子组件代码行数控制在 40-80 行

3. **工具函数提取原则**:
   - 纯函数，无副作用
   - 可复用性强
   - 放在 utils/ 目录
   - 每个文件不超过 30 行

4. **命名规范**:
   - 组件名使用 PascalCase
   - 文件路径使用 kebab-case 或 camelCase
   - 工具函数使用 camelCase

5. **依赖关系**:
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

**⚠️ 条件样式的正确写法 (CRITICAL - 必须遵守!)**:

\`\`\`javascript
// ❌ 绝对禁止：三元运算符中使用点号代替冒号
style={{
  ...styles.stockTag,
  ...(isOutOfStock ? styles.outOfStockTag.inStockTag),  // ← 致命错误! 应该是冒号不是点号
}}

// ✅ 正确方式 1：完整的三元表达式（推荐）
style={{
  ...styles.stockTag,
  ...(isOutOfStock ? styles.outOfStockTag : styles.inStockTag),
}}

// ✅ 正确方式 2：逻辑与运算符
style={{
  ...styles.buttonBase,
  ...(isDisabled && styles.disabled),
}}

// ✅ 正确方式 3：条件赋值
const tagStyle = isOutOfStock ? styles.outOfStockTag : styles.inStockTag;
return <span style={{ ...styles.stockTag, ...tagStyle }}>标签</span>;
\`\`\`

**自我检查清单**:
1. 所有三元运算符必须包含 \`?\` 和 \`:\` 两个符号
2. 绝对不要使用 \`.\` 代替 \`:\`
3. 展开运算符 \`...()\` 内部必须是合法的对象或 \`undefined\`
4. 生成代码后,逐行检查所有三元表达式的语法

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
