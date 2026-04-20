import express from 'express';

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
${dimensions ? `- 尺寸要求: ${dimensions}（请严格按照此尺寸设置组件样式）` : '- 尺寸要求: 自适应容器宽度（不要设置固定宽度，使用 width: 100% 或不设置宽度，让组件响应式适应父容器）'}
${uiLibraryText}${stylePreprocessorText}- ${interactive ? '需要添加完整的交互事件处理' : '不需要复杂交互'}
- ${needMockData ? '请生成合理的默认 Mock 数据，方便直接预览，把 Mock 数据放在代码顶部方便编辑' : '不需要 Mock 数据'}
${extraRequirements ? `- 额外需求: ${extraRequirements}` : ''}

重要要求（必须严格遵守）:

1. **代码结构规范 - 组件化封装与文件拆分**:
   - **必须采用组件化开发思维**，将复杂功能拆分为多个独立的子组件
   - 每个子组件应该是**单一职责**，只负责一个明确的功能模块
   - 主组件作为容器，负责组合和协调所有子组件
   - 每个组件代码控制在 **50-100 行**以内，避免过长
   - 使用清晰的注释标注每个子组件的用途和职责
   
   **文件拆分结构**（非常重要！）：
   **每个子组件都必须独立成文件**，不要把所有组件放在一个文件里！
   
   将代码按照以下结构组织，使用明确的注释分隔不同文件：
   
   \`\`\`javascript
   // ====== FILE: utils.ts ======
   // 工具函数和辅助方法
   
   // 格式化价格
   const formatPrice = (price) => {
     return \`¥\${price.toFixed(2)}\`;
   };
   
   // 格式化日期
   const formatDate = (date) => {
     return new Date(date).toLocaleDateString('zh-CN');
   };
   
   // 验证邮箱
   const validateEmail = (email) => {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   };
   
   // ====== FILE: ProductBadges.tsx ======
   // 子组件：商品角标
   // 职责：展示新品、热销等角标
   
   const ProductBadges = ({ badges }) => {
     return (
       <div className="absolute top-2 left-2 flex flex-col gap-1">
         {badges.map((badge, index) => (
           <span 
             key={index}
             className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded"
           >
             {badge}
           </span>
         ))}
       </div>
     );
   };
   
   // ====== FILE: ProductImageSection.tsx ======
   // 子组件：商品图片区
   // 职责：展示商品图片、处理图片加载失败、显示角标
   
   const ProductImageSection = ({ imageUrl, badges, onImageClick }) => {
     const [isHovered, setIsHovered] = React.useState(false);
     
     return (
       <div className="relative">
         <img 
           src={imageUrl} 
           alt="product" 
           className="w-full h-64 object-cover"
           onClick={onImageClick}
         />
         {badges && <ProductBadges badges={badges} />}
       </div>
     );
   };
   
   // ====== FILE: ProductInfoSection.tsx ======
   // 子组件：商品信息区
   // 职责：展示标题、价格、描述等信息
   
   const ProductInfoSection = ({ title, price, originalPrice }) => {
     return (
       <div className="p-4 space-y-2">
         <h3 className="text-lg font-medium text-gray-900">{title}</h3>
         <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-red-500">
             {formatPrice(price)}
           </span>
           {originalPrice && (
             <del className="text-sm text-gray-400">
               {formatPrice(originalPrice)}
             </del>
           )}
         </div>
       </div>
     );
   };
   
   // ====== FILE: ProductActions.tsx ======
   // 子组件：操作按钮区
   // 职责：处理购买、收藏等交互操作
   
   const ProductActions = ({ onBuy, onFavorite, isFavorite }) => {
     return (
       <div className="flex gap-2 p-4">
         <button 
           onClick={onBuy}
           className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
         >
           立即购买
         </button>
         <button 
           onClick={onFavorite}
           className={cn(
             "px-4 py-2 border rounded transition-all",
             isFavorite 
               ? "border-red-500 text-red-500" 
               : "border-gray-300 text-gray-600"
           )}
         >
           {isFavorite ? '已收藏' : '收藏'}
         </button>
       </div>
     );
   };
   
   // ====== FILE: component.tsx ======
   // 主组件：商品卡片
   // 职责：组合所有子组件，管理整体状态和数据流
   
   // === Mock 数据 ===
   const mockData = {
     id: 'p1001',
     title: '商品标题',
     price: 99.99,
     originalPrice: 199.99,
     image: 'https://images.unsplash.com/photo-1234567890',
     badges: ['新品', '热销'],
     isFavorite: false
   };
   
   export default function ProductCard({ data = mockData }) {
     const [isFavorite, setIsFavorite] = React.useState(data.isFavorite);
     
     const handleBuy = () => {
       console.log('购买:', data.id);
     };
     
     const handleFavorite = () => {
       setIsFavorite(!isFavorite);
     };
     
     return (
       <div className="max-w-sm rounded-lg overflow-hidden shadow-sm border border-gray-200">
         <ProductImageSection 
           imageUrl={data.image} 
           badges={data.badges}
           onImageClick={() => console.log('点击图片')}
         />
         <ProductInfoSection 
           title={data.title}
           price={data.price}
           originalPrice={data.originalPrice}
         />
         <ProductActions 
           onBuy={handleBuy}
           onFavorite={handleFavorite}
           isFavorite={isFavorite}
         />
       </div>
     );
   }
   \`\`\`

2. **代码质量要求**:
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

3. **可读性优化**:
   - 组件命名要有意义，体现功能
   - 函数和变量使用清晰的命名
   - 逻辑清晰，避免过度嵌套（最多 3 层）
   - 适当使用空行分隔不同逻辑块
   - 变量声明要完整，确保所有使用的变量都已定义

4. **预览兼容性**:
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
  // 规范化 API URL - 确保使用正确的端点
  let apiUrl = model.baseUrl;
  
  // 如果是火山方舟，确保使用正确的端点
  if (apiUrl.includes('volces.com')) {
    // 移除末尾的斜杠
    apiUrl = apiUrl.replace(/\/+$/, '');
    
    // 如果用户配置的是旧的 /api/v3，自动修正为 /api/coding/v3
    if (apiUrl.endsWith('/api/v3')) {
      console.warn('检测到旧的 API 地址格式，自动修正为 /api/coding/v3');
      apiUrl = apiUrl.replace('/api/v3', '/api/coding/v3');
    }
    
    // 确保 URL 以 /chat/completions 结尾
    if (!apiUrl.endsWith('/chat/completions')) {
      // 如果已经有 /v3 或 /coding/v3，直接追加
      if (apiUrl.endsWith('/v3') || apiUrl.endsWith('/coding/v3')) {
        apiUrl = `${apiUrl}/chat/completions`;
      }
    }
  }

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

  console.log('调用 AI API:', {
    url: apiUrl,
    model: model.modelName,
    mode: model.mode,
    hasApiKey: !!model.apiKey,
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('AI API 响应状态:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('AI API 错误响应:', text);
      throw new Error(`API 调用失败: ${response.status} ${text}`);
    }

    const data = await response.json();
    console.log('AI API 响应数据:', JSON.stringify(data).substring(0, 200));
    
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
  } catch (error) {
    console.error('AI API 调用异常:', error);
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      throw new Error(`网络连接失败，请检查：
1. 是否能访问 ${apiUrl}
2. 是否需要配置代理
3. API 地址是否正确

原始错误: ${error.message}`);
    }
    throw error;
  }
}

// ===== AI 需求整理 API =====
app.post('/api/refine-requirements', async (req, res) => {
  try {
    const { model, params } = req.body;
    
    if (!params) {
      return res.status(400).json({ success: false, error: '缺少参数' });
    }

    if (!model) {
      return res.status(400).json({ success: false, error: '必须提供完整模型配置' });
    }

    // 构建需求整理提示词
    const prompt = buildRefinementPrompt(params);

    // 调用 AI API
    const result = await callAI(model, prompt);
    
    // 解析 AI 返回的结构化数据
    const refinedRequirements = parseRefinedRequirements(result);
    
    res.json({ 
      success: true, 
      data: {
        refinedRequirements,
      } 
    });
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

请直接 output JSON 格式的结果，不要包含任何解释或其他文字。`;

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
    const { model, description, componentName } = req.body;
    
    if (!description) {
      return res.status(400).json({ success: false, error: '缺少描述内容' });
    }

    if (!model) {
      return res.status(400).json({ success: false, error: '必须提供完整模型配置' });
    }

    // 构建扩写提示词
    const prompt = buildExpandPrompt(description, componentName);

    // 调用 AI API
    const expandedDescription = await callAI(model, prompt);
    
    res.json({ 
      success: true, 
      data: {
        expandedDescription: expandedDescription,
      } 
    });
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`AI 组件生成器后端服务运行在 http://localhost:${PORT}`);
  console.log('模型配置存储在前端 localStorage，后端仅做 API 代理');
});
