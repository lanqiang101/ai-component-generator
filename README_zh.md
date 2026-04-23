# AI 组件生成器

基于 AI 的前端组件生成器，使用大语言模型自动生成 React/Vue/HTML 组件代码。

[English Version](./README.md)

## ✨ 功能特性

- 🤖 **智能需求分析** - AI 自动分析需求，生成组件结构、功能点和代码
- 🎯 **支持多种框架** - React (TSX/JSX)、Vue 3 (SFC)、纯 HTML/CSS/JS
- 🎨 **丰富的配置选项**：
  - 多种 UI 设计风格（简约现代、新拟物化、玻璃拟态、赛博朋克、复古、Material Design、Ant Design）
  - 动态 UI 库选择（根据框架自动过滤可用选项）
  - 支持 CSS/SCSS/LESS/Tailwind CSS 多种样式预处理
  - Mock 数据开关，生成后可编辑
  - 交互事件配置
- 🔄 **实时预览** - 代码编辑后预览立即更新
- 📱 **分辨率切换** - 支持移动端/平板/笔记本/桌面/全屏等多种预设分辨率预览
- 💾 **无需数据库** - 模型配置存储在浏览器 localStorage
- 🌓 **暗黑模式** - 支持自动/浅色/暗黑三种主题模式
- 📝 **代码编辑器** - 内置语法高亮，支持复制和下载
- 🔒 **安全架构** - 使用 Cloudflare Worker 加密中转 API Key，保障安全
- 🚀 **开箱即用** - 内置火山方舟模型配置，无需复杂设置

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目已经配置了正式的 Worker URL，直接使用即可：

```bash
# .env 文件中已经配置
VITE_AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
```

### 3. 测试 Worker 连接

```bash
# 测试 Worker 是否可访问
npm run test:worker
```

**⚠️ 国内网络注意事项**：
- Cloudflare Workers 在国内可能被限制访问
- 如果遇到连接超时，请尝试：
  - 使用代理或 VPN
  - 部署自己的 Worker 到海外节点
  - 检查防火墙设置

### 4. 启动开发服务器

```bash
npm run dev
```

访问：
- 前端：http://localhost:3000
- 后端：http://localhost:3001

### 5. 构建生产版本

```bash
npm run build
```

## 📖 使用流程

1. **配置模型** - 确保 `.env` 中配置了正确的 Cloudflare Worker 地址，或在前端「模型管理」中检查配置（如果使用本地代理）。
2. **填写需求** - 在主页填写组件需求：
   - 组件名称和描述（支持 AI 扩写功能）
   - 选择框架和组件类型
   - 选择 UI 设计风格
   - 选择 UI 组件库（可选，支持版本选择）
   - 选择样式预处理
   - 配置是否需要 Mock 数据和交互
   - 添加额外需求
3. **生成组件** - 点击「生成组件」按钮（或按 `Ctrl/Cmd + Enter`）
4. **查看需求整理** - AI 会分析并整理你的需求，展示组件结构、功能点和技术要点
5. **预览编辑** - 在右侧预览效果，在代码编辑器修改，预览实时更新
6. **切换分辨率** - 在预览栏切换不同分辨率查看适配效果
7. **导出代码** - 复制或下载代码到你的项目使用

## 🗂️ 项目结构

```
ai-component-generator/
├── src/                    # 前端源码
│   ├── components/        # React 组件
│   │   ├── ui/           # 基础 UI 组件（Button, Card, Input 等）
│   │   ├── LeftFormPanel.tsx      # 左侧配置表单
│   │   ├── PreviewPanel.tsx       # 预览面板
│   │   ├── CodeEditorPanel.tsx    # 代码编辑器
│   │   ├── GenerateButton.tsx     # 生成按钮
│   │   └── GenerationProgress.tsx # 生成进度指示器
│   ├── pages/            # 页面组件
│   │   └── HomePage.tsx  # 主生成器页面
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── constants/        # 常量配置（分辨率、UI 库等）
│   └── utils/            # 工具函数
├── server/                # 后端服务（本地开发代理）
│   └── index.js          # Express 服务器
├── worker/                # Cloudflare Worker（生产环境代理）
│   ├── index.js          # Worker 代码
│   └── wrangler.toml     # Wrangler 配置
├── docs/                  # 文档
│   └── cloudflare-worker.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example          # 环境变量示例
```

## 🎛️ 支持的选项

### 框架
- React 18 + TypeScript (TSX)
- React 18 + JavaScript (JSX)
- Vue 3 + TypeScript (.vue)
- Vue 3 + JavaScript (.vue)
- 纯 HTML + CSS + JavaScript

### 组件类型
- 按钮
- 卡片
- 表单
- 导航栏
- 模态框
- 下拉菜单
- 表格
- 图表
- 其他自定义

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

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS v3
- **状态管理**：Zustand
- **UI 组件**：Radix UI Primitives（Dialog, Select, Switch, Tabs）
- **图标**：Lucide React
- **代码编辑器**：react-simple-code-editor + Prism.js
- **后端**：Node.js + Express（本地开发）
- **AI 模型**：火山方舟（ark-code-latest）
- **安全代理**：Cloudflare Workers
- **路由**：React Router DOM v7

## ⚙️ API 配置说明

项目已内置以下配置，**无需手动配置**（前提是使用推荐的 Cloudflare Worker 代理）：

| 配置项 | 值 |
|--------|-----|
| Base URL | `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions` |
| 模型标识 | `ark-code-latest` |
| Temperature | 0.7 |
| Max Tokens | 4096 |

所有 API 请求都通过 Cloudflare Worker 中转，API Key 安全存储在 Cloudflare 环境变量中。

## 🛠️ 开发指南

### 本地开发 Worker

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 本地运行 Worker
npm run dev:worker
```

### 部署 Worker

```bash
# 部署到 Cloudflare
npm run deploy:worker
```

### 安全配置 API Key

```bash
# 使用 wrangler 安全地设置密钥（不会暴露在代码中）
wrangler secret put ARK_API_KEY
```

## ❓ 故障排查

### Worker 返回 500 错误

1. 检查 Cloudflare Worker 日志
2. 确认 `ARK_API_KEY` 环境变量已配置
3. 验证 API Key 是否有效

### 前端请求失败

1. 检查浏览器控制台网络请求
2. 确认 `VITE_AI_PROXY_URL` 配置正确
3. 验证 Worker 是否处于活跃状态

详细故障排查请查看：[Cloudflare Worker 部署指南](./docs/cloudflare-worker.md#故障排查)

## 🔒 安全建议

- ✅ API Key 存储在 Cloudflare 环境变量中，不在代码中暴露
- ✅ 定期轮换 API Key
- ✅ 监控 Worker 使用量
- ✅ 不要将 `.env` 文件提交到 Git

## 💰 费用说明

- **Cloudflare Workers**：每月 10 万次免费请求
- **火山方舟 API**：按使用量计费，参考[官方定价](https://www.volcengine.com/pricing)

## 📄 许可证

MIT License
