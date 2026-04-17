# AI 前端组件生成器 - 需求文档

## 项目概述

基于 AI 的前端组件在线生成器，用户通过表单填写组件需求，AI 生成对应框架/语言的组件代码，支持实时预览和编辑。

## 技术栈

- 框架：React 18 + TypeScript + Vite
- 样式：Tailwind CSS v3
- 状态管理：Zustand
- UI 组件：Radix UI + 自定义样式（参考 ai-content-txt 项目风格）
- 后端：Node.js + Express
- 图标：Lucide React
- 说明：**不需要数据库**，配置存储使用 localStorage

## 功能需求

### 1. 模型配置

#### 1.1 模型管理页面
- 支持添加/编辑/删除模型
- 支持两种模式：
  - **本地模型**：配置本地 API 地址（如 Ollama）
  - **在线API模型**：配置 API Key、API 地址、模型ID
- 模型配置字段：
  - 模型名称（显示用）
  - 模型标识（实际调用的模型ID）
  - 模式选择（本地/API）
  - API Key（API 模式必填）
  - API 地址（默认填充火山引擎通用地址）
  - 最大 Tokens
  - 温度（Temperature）
  - 启用/禁用状态
- 配置存储：使用 localStorage 持久化

#### 1.2 系统配置页面
- 选择组件生成使用的模型
- 只显示已启用的模型

### 2. 主界面布局

三分栏布局：
- **左侧**：配置表单区域（可滚动）
- **右侧**：上下分栏
  - **上方**：组件预览区域（实时展示生成的组件效果）
  - **下方**：组件代码编辑器（可编辑，支持语法高亮）

### 3. 左侧表单字段设计

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| 组件名称 | 输入框 | 用户给组件起的名称 | - |
| 组件描述 | 文本域 | 详细描述组件的功能和需求 | - |
| 编程语言/框架 | 下拉选择 | 支持：React (TSX)、React (JSX)、Vue 3 (SFC)、Vue 3 (JS)、纯 HTML/CSS/JS | React (TSX) |
| 组件类型 | 下拉选择 | 支持：按钮、卡片、表单、导航栏、模态框、下拉菜单、表格、图表、其他自定义 | - |
| UI 风格 | 下拉选择 | 支持：简约现代、Neumorphism、Glassmorphism、赛博朋克、复古、Material Design、Ant Design 风格 | 简约现代 |
| 尺寸规格 | 输入框 | 描述组件尺寸，如 "高度 48px"、"宽度 100%" | - |
| 需要 Mock 数据 | 开关 | 是否需要生成默认的 Mock 数据 | 开启 |
| 可交互 | 开关 | 组件是否需要添加交互事件（点击、输入等） | 开启 |
| UI 库 | 下拉选择 | 根据选择的框架，动态显示对应框架支持的UI库选项，包含「不使用（原生）」选项 | 不使用（原生） |
| UI 库版本 | 下拉选择 | 选择UI库的具体版本，根据选择的UI库动态显示选项列表，不显示当UI库选择"不使用" | - |
| 样式预处理 | 下拉选择 | 支持：原生 CSS、SCSS、LESS、Tailwind CSS | Tailwind CSS |
| 额外需求 | 文本域 | 用户自定义的额外需求 | - |

- **UI库动态选项规则**：
  - React 可用选项：不使用（原生）、Ant Design、Material UI、Chakra UI、Mantine、Shadcn UI
  - Vue 可用选项：不使用（原生）、Element Plus、Ant Design Vue、Vuetify、Naive UI
  - HTML 可用选项：不使用（原生）、Bootstrap、Tailwind CSS
- **UI库版本**：每个UI库预设常用版本列表，用户选择具体版本后传递给AI，确保生成对应版本兼容的代码

### 4. Mock 数据处理

- 当"需要 Mock 数据"开启时，AI 生成组件时会自动生成合理的默认 Mock 数据
- 在右侧代码编辑器中，用户可以直接编辑 Mock 数据
- Mock 数据修改后，预览区域实时更新

### 5. 预览区域功能

- 实时渲染生成的组件
- 支持切换预览分辨率：
  - 预设常用分辨率：
    - 移动端：360px × 640px
    - 平板：768px × 1024px
    - 笔记本：1366px × 768px
    - 桌面：1920px × 1080px
    - 全屏（自适应）
  - 切换分辨率时，预览容器自动调整尺寸
  - 预览区域始终保持居中展示
- 如果代码有错误，显示友好的错误提示，而不是整个页面崩溃

### 6. 代码编辑区域

- 使用代码编辑器（支持语法高亮）
- 根据选择的语言自动匹配语法高亮（JSX/TSX/Vue/CSS/HTML）
- 支持手动编辑代码
- 编辑后预览区域实时更新
- 支持一键复制代码到剪贴板
- 支持下载代码文件

### 7. 生成功能

- 点击"生成组件"按钮调用 AI 生成代码
- 支持 `Ctrl/Cmd + Enter` 快捷键生成
- 显示生成进度
- 生成完成后自动更新预览和代码编辑器
- 支持重新生成

### 8. 主题

- 支持亮色/暗色/自动三种模式（参考 ai-content-txt）
- 默认跟随系统，支持手动切换
- 全部页面适配暗色主题

### 9. 路由

- `/` - 组件生成器主页面
- `/config` - 模型系统配置
- `/models` - 模型管理
- 顶部导航栏方便切换

## 非功能需求

### 1. 响应式设计
- 适配不同屏幕尺寸
- 小屏幕下布局自动调整（可能需要堆叠布局）

### 2. 实时预览
- 代码修改后，预览区域立即更新
- 更新不应该造成整个页面刷新

### 3. 数据持久化
- 模型配置存储在 localStorage（不再使用 SQLite 数据库）
- 最近生成的组件可以在本地保存（可选功能）

### 4. 用户体验
- 加载状态提示
- 错误处理友好提示
- 操作有反馈

## 项目结构

```
ai-component-generator/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.cjs
├── .gitignore
├── README.md              # 项目说明（中英文双语）
├── README-EN.md           # English version
├── requirements.md     # 需求文档
├── server/
│   ├── index.js              # Express 服务入口
│   └── (no database needed)  # 不需要数据库
├── src/
│   ├── main.tsx             # 应用入口
│   ├── App.tsx              # 根组件
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   ├── store/
│   │   └── useStore.ts       # Zustand 状态管理
│   ├── pages/
│   │   ├── HomePage.tsx      # 主页面
│   │   ├── ConfigPage.tsx    # 系统配置页面
│   │   └── ModelManagementPage.tsx  # 模型管理页面
│   │       └── ModelDialog.tsx # 添加/编辑模型对话框
│   ├── components/
│   │   ├── ui/               # 基础 UI 组件（Button, Input, Label, 等）
│   │   ├── LeftFormPanel.tsx # 左侧表单区域
│   │   ├── PreviewPanel.tsx  # 右侧上方预览区域
│   │   └── CodeEditorPanel.tsx # 右侧下方代码编辑器
│   └── constants/
│       └── ui-libraries.ts   # UI 库和版本选项配置
├── index.html
├── postcss.config.js
└── tailwind.config.js
```

## 参考项目规范（来自 ai-content-txt）

- 使用 Tailwind CSS 进行样式开发
- 深色模式适配通过 `dark:` 前缀实现
- 使用 Radix UI 原语组件构建交互组件
- 所有模型调用通过后端转发，避免 CORS 问题

## 启动脚本

package.json 中需要包含以下脚本：

```json
{
  "scripts": {
    "dev": "concurrently \"node server/index.js\" \"vite\"",
    "dev:front": "vite",
    "dev:back": "node server/index.js",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

## 核心类型定义

```typescript
// 模型配置
export interface ModelConfig {
  id: number;
  name: string;
  modelName: string;
  mode: 'local' | 'api';
  apiKey?: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

// 样式预处理类型
export type StylePreprocessor = 'css' | 'scss' | 'less' | 'tailwind';

// 组件生成参数
export interface ComponentGenerationParams {
  componentName: string;
  description: string;
  framework: 'react-tsx' | 'react-jsx' | 'vue3-sfc' | 'vue3-js' | 'html-css-js';
  componentType: 'button' | 'card' | 'form' | 'navbar' | 'modal' | 'dropdown' | 'table' | 'chart' | 'other';
  style: 'minimal' | 'neumorphism' | 'glassmorphism' | 'cyberpunk' | 'retro' | 'material' | 'antd';
  dimensions: string;
  needMockData: boolean;
  interactive: boolean;
  uiLibrary: string;
  uiLibraryVersion: string;
  stylePreprocessor: StylePreprocessor;
  extraRequirements: string;
}

// 生成结果
export interface GeneratedComponent {
  id: string;
  params: ComponentGenerationParams;
  code: string;
  createdAt: number;
  updatedAt: number;
}
```

## 验收标准

1. ✓ 可以正常添加模型配置（支持本地和 API 两种模式）
2. ✓ 表单包含所有要求的字段（新增UI库、UI库版本和样式预处理）
3. ✓ UI库根据当前选择的框架动态过滤选项
4. ✓ UI库版本根据当前选择的UI库动态过滤选项，选择不使用时隐藏版本选择
5. ✓ 三分栏布局正确：左侧表单，右侧上下分栏（预览+代码）
6. ✓ 代码编辑后预览实时更新
7. ✓ 支持切换不同预览分辨率
8. ✓ Mock 数据支持编辑并实时更新到预览
9. ✓ 深色模式正常工作
10. ✓ UI库版本支持，根据选择的UI库动态加载版本列表
11. ✓ 不使用数据库，配置存在 localStorage
12. ✓ README.md 提供中文，README-EN.md 提供英文说明
13. ✓ `npm run dev` 可以正常启动前后端
14. ✓ 类型正确，无 TypeScript 错误
