
const express = require('express');

const app = express();
const PORT = 3001;

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
    const { model, params } = req.body;
    
    if (!params) {
      return res.status(400).json({ success: false, error: '缺少参数' });
    }

    // 前端需要从localStorage拿到model配置一起发过来
    if (!model) {
      return res.status(400).json({ success: false, error: '必须提供完整模型配置' });
    }

    // 构建提示词
    const prompt = buildPrompt(params);

    // 调用 AI API
    const result = await callAI(model, prompt);
    
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
  } = params;

  let frameworkLabel = '';
  let fileExtension = '';
  switch (framework) {
    case 'react-tsx':
      frameworkLabel = 'React 18 + TypeScript TSX';
      fileExtension = 'tsx';
      break;
    case 'react-jsx':
      frameworkLabel = 'React 18 JavaScript JSX';
      fileExtension = 'jsx';
      break;
    case 'vue3-sfc':
      frameworkLabel = 'Vue 3 Single-File Component (.vue) TypeScript';
      fileExtension = 'vue';
      break;
    case 'vue3-js':
      frameworkLabel = 'Vue 3 Single-File Component (.vue) JavaScript';
      fileExtension = 'vue';
      break;
    case 'html-css-js':
      frameworkLabel = '纯 HTML + CSS + JavaScript (不需要构建工具)';
      fileExtension = 'html';
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

  const promptText = `你是一个经验丰富的前端开发工程师，请根据用户需求生成一个${frameworkLabel}组件。

组件需求:
- 组件名称: ${componentName}
- 组件类型: ${componentTypeLabel}
- 描述: ${description}
- 设计风格: ${styleLabel}
${dimensions ? `- 尺寸要求: ${dimensions}` : ''}
${uiLibraryText}${stylePreprocessorText}- ${interactive ? '需要添加完整的交互事件处理' : '不需要复杂交互'}
- ${needMockData ? '请生成合理的默认 Mock 数据，方便直接预览，把 Mock 数据放在代码顶部方便编辑' : '不需要 Mock 数据'}
${extraRequirements ? `- 额外需求: ${extraRequirements}` : ''}

要求:
1. 只返回完整可运行的组件代码，不要有多余解释
2. 代码要整洁，有适当的注释
3. 如果使用 UI 库，请正确导入对应版本的组件
4. 如果需要 Mock 数据，请把 Mock 数据放在代码顶部，方便用户编辑
5. 确保代码可以直接复制使用，不需要额外修改
6. 遵循当前框架、UI库和版本的最佳实践

开始生成代码:`;

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

async function callAI(model, prompt) {
  const apiUrl = model.baseUrl;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (model.mode === 'api' && model.apiKey) {
    headers['Authorization'] = `Bearer ${model.apiKey}`;
  }

  const body = {
    model: model.modelName,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: model.temperature,
    max_tokens: model.maxTokens,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${text}`);
  }

  const data = await response.json();
  
  // 处理 OpenAI 兼容格式
  if (data.choices && data.choices.length > 0) {
    let content = data.choices[0].message.content;
    // 移除可能的代码包裹标记
    content = content.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
    return content;
  }

  // 处理其他格式
  if (data.output) {
    return data.output;
  }

  if (data.response) {
    return data.response;
  }

  throw new Error('无法解析 AI 响应格式');
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`AI 组件生成器后端服务运行在 http://localhost:${PORT}`);
  console.log('模型配置存储在前端 localStorage，后端仅做 API 代理');
});
