# AI 前端组件生成器

基于 AI 的前端组件在线生成器，通过表单配置需求，AI 生成对应框架/语言的组件代码，支持实时预览和编辑。

[English Version](./README.md)

## ✨ 特性

- 🤖 **支持多种框架** - React (TSX/JSX)、Vue 3 (SFC)、纯 HTML/CSS/JS
- 🎨 **丰富的配置选项**
  - 多种UI设计风格（简约、新拟物化、玻璃拟态、赛博朋克、复古等）
  - 动态UI库选择（根据框架自动过滤选项）
  - 支持CSS/SCSS/LESS/Tailwind CSS多种样式预处理
  - Mock数据开关，生成后可直接编辑
- 🔄 **实时预览** - 代码编辑后预览立即更新
- 📱 **分辨率切换** - 支持移动端/平板/笔记本/桌面/全屏多种预设分辨率预览
- 💾 **无需数据库** - 模型配置存储在浏览器 localStorage
- 🌓 **深色模式** - 支持自动/亮色/深色三种主题模式
- 📝 **代码编辑器** - 语法高亮，支持复制和下载

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端服务运行在 `http://localhost:3000`  
后端API服务运行在 `http://localhost:3001`

### 构建生产版本

```bash
npm run build
```

## 📖 使用流程

1. **添加模型** - 前往「模型管理」添加你的 AI 模型（支持本地 Ollama 或在线 API 如火山引擎/OpenAI）
2. **选择模型** - 前往「模型配置」选择用于生成组件的模型
3. **填写需求** - 在主页填写组件需求：
   - 组件名称和描述
   - 选择框架和组件类型
   - 选择UI设计风格
   - 选择UI组件库（可选）
   - 选择样式预处理
   - 配置是否需要Mock数据和交互
   - 添加额外需求
4. **生成组件** - 点击「生成组件」按钮（或按 `Ctrl/Cmd + Enter`）
5. **预览编辑** - 在右侧预览效果，在代码编辑器修改，预览实时更新
6. **切换分辨率** - 在预览栏切换不同分辨率查看适配效果
7. **导出代码** - 复制或下载代码到你的项目使用

## 🗂️ 项目结构

```
ai-component-generator/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.cjs
├── .gitignore
├── README.md          # 中文说明
├── README-EN.md       # English README
├── requirements.md     # 需求文档
├── server/
│   └── index.js        # Express 后端（仅API代理）
└── src/
    ├── main.tsx        # React 入口
    ├── App.tsx         # 根组件 + 路由
    ├── index.css       # 全局样式
    ├── types/
    │   ├── index.ts    # TypeScript 类型定义
    │   └── defaults.ts # 默认参数
    ├── constants/
    │   ├── resolutions.ts  # 分辨率预设
    │   └── ui-libraries.ts # UI库选项配置
    ├── store/
    │   └── useStore.ts # Zustand 状态管理
    ├── pages/
    │   ├── HomePage.tsx      # 生成器主页
    │   ├── ConfigPage.tsx    # 系统配置
    │   └── ModelManagementPage.tsx  # 模型管理
    │       └── ModelDialog.tsx # 添加/编辑模型对话框
    └── components/
        ├── ui/               # 基础 UI 组件
        ├── LeftFormPanel.tsx # 左侧配置表单
        ├── PreviewPanel.tsx  # 预览面板
        └── CodeEditorPanel.tsx # 代码编辑器
```

## 🎛️ 支持的选项

### 框架
- React 18 + TypeScript (TSX)
- React 18 + JavaScript (JSX)
- Vue 3 + TypeScript (.vue)
- Vue 3 + JavaScript (.vue)
- 纯 HTML + CSS + JavaScript

### UI 库（动态）

**React:**
- 不使用（原生）
- Ant Design
- Material UI
- Chakra UI
- Mantine
- Shadcn UI

**Vue:**
- 不使用（原生）
- Element Plus
- Ant Design Vue
- Vuetify
- Naive UI

**HTML:**
- 不使用（原生）
- Bootstrap
- Tailwind CSS

### 样式预处理
- 原生 CSS
- SCSS
- LESS
- Tailwind CSS

### 设计风格
- 简约现代
- 新拟物化 Neumorphism
- 玻璃拟态 Glassmorphism
- 赛博朋克
- 复古
- Material Design
- Ant Design 风格

### 预览分辨率
- 移动端 360×640
- 平板 768×1024
- 笔记本 1366×768
- 桌面 1920×1080
- 全屏自适应

## 🔧 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS v3
- Zustand (状态管理)
- Radix UI (交互原语)
- Express (后端API代理)
- Prism.js (语法高亮)
- Lucide React (图标)

## 📝 说明

- 所有模型配置存储在浏览器 `localStorage`，不需要数据库
- 所有 AI API 请求通过后端转发，避免 CORS 问题
- 支持本地模型（如 Ollama）和云端 API 模型
- 预览使用 iframe 隔离运行，不影响主应用

## 📄 许可证

MIT
