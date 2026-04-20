# Cloudflare Pages Functions 部署指南

## 📋 概述

本项目使用 **Cloudflare Pages** 托管前端静态资源，并使用 **Pages Functions** 提供后端 API 服务。

- **前端**: React SPA（`dist/` 目录）
- **后端 API**: Cloudflare Pages Functions（`functions/` 目录）
- **AI 代理**: 独立的 Cloudflare Worker（`worker/` 目录）

## 🏗️ 项目结构

```
ai-component-generator/
├── functions/              # Pages Functions (后端 API)
│   ├── api/
│   │   ├── expand-description.ts  # POST /api/expand-description
│   │   └── generate.ts            # POST /api/generate
│   └── utils/
│       └── ai.ts                  # AI 调用工具函数
├── worker/                 # Cloudflare Worker (AI API 代理)
│   ├── index.js
│   └── wrangler.toml
├── dist/                   # 前端构建产物
└── wrangler.toml          # Pages 配置
```

## ⚙️ 环境配置

### 1. 配置 Cloudflare Worker（AI 代理）

Worker 用于安全地中转火山方舟 API 请求，避免暴露 API Key。

#### 步骤：

1. **部署 Worker**：
   ```bash
   cd worker
   wrangler deploy
   ```

2. **设置 API Key Secret**：
   ```bash
   wrangler secret put ARK_API_KEY
   # 输入你的火山方舟 API Key
   ```

3. **记录 Worker URL**：
   ```
   https://your-worker-name.your-subdomain.workers.dev
   ```

### 2. 配置 Pages Functions 环境变量

Pages Functions 需要访问 Worker 的 URL 和 API Key。

#### 方法 1：通过 Cloudflare Dashboard

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的 Pages 项目
3. 进入 **Settings** > **Environment variables**
4. 添加以下变量：
   - `ARK_API_KEY`: 你的火山方舟 API Key
   - `WORKER_URL`: Worker 的 URL（可选，默认使用硬编码的火山方舟地址）

#### 方法 2：通过 Wrangler CLI

```bash
wrangler pages secret put ARK_API_KEY
# 输入你的火山方舟 API Key
```

### 3. 配置前端环境变量

创建 `.env.production` 文件（或在你部署平台的环境变量中设置）：

```env
# 如果使用 Pages Functions，API 路径为相对路径
VITE_API_BASE_URL=

# 如果直接调用 Worker（备选方案）
# VITE_AI_PROXY_URL=https://your-worker.your-subdomain.workers.dev
```

## 🚀 部署流程

### 自动化部署（推荐）

连接到 Git 仓库后，每次推送到 main 分支会自动触发部署：

1. **构建命令**：`npm run build`
2. **输出目录**：`dist`
3. **Functions 目录**：`functions`（自动识别）

### 手动部署

```bash
# 1. 构建前端
npm run build

# 2. 部署到 Pages
wrangler pages deploy dist --project-name=ai-component-generator
```

## 🔧 本地开发

### 启动完整开发环境

```bash
# 终端 1: 启动前端
npm run dev:front

# 终端 2: 启动 Pages Functions（本地模拟）
npx wrangler pages dev dist --port 8788
```

### 测试 API

```bash
# 测试 expand-description
curl -X POST http://localhost:8788/api/expand-description \
  -H "Content-Type: application/json" \
  -d '{"description":"测试","componentName":"Test"}'

# 测试 generate
curl -X POST http://localhost:8788/api/generate \
  -H "Content-Type: application/json" \
  -d '{"params":{"componentName":"Button","description":"一个按钮"}}'
```

## 📝 API 端点

### POST /api/expand-description

扩展组件描述，生成详细的技术需求文档。

**请求体**：
```json
{
  "description": "一个简单的按钮组件",
  "componentName": "CustomButton"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "expandedDescription": "详细的描述文本..."
  }
}
```

### POST /api/generate

生成组件代码。

**请求体**：
```json
{
  "params": {
    "componentName": "Button",
    "description": "一个按钮组件",
    "framework": "react-tsx",
    "style": "minimal"
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "code": "// 生成的组件代码..."
  }
}
```

## ⚠️ 注意事项

1. **API Key 安全**：
   - ❌ 不要将 API Key 硬编码在代码中
   - ✅ 使用 `wrangler secret put` 或 Cloudflare Dashboard 设置
   - ✅ API Key 只在 Worker 和 Pages Functions 中使用

2. **CORS 配置**：
   - Pages Functions 与前端同域名，无需 CORS 配置
   - 如果直接调用 Worker，需要在 Worker 中添加 CORS 头

3. **性能优化**：
   - Pages Functions 按请求计费，注意控制调用频率
   - 考虑添加缓存策略（如 Redis 或 KV）

4. **错误处理**：
   - 所有 API 都返回统一的错误格式
   - 前端应处理网络错误和 API 错误

## 🔍 调试

### 查看日志

```bash
# 实时查看 Pages Functions 日志
wrangler pages deployment tail --project-name=ai-component-generator
```

### 常见问题

**Q: 405 Method Not Allowed**
A: 确保使用正确的 HTTP 方法（POST），并且请求路径正确。

**Q: 500 Internal Server Error**
A: 检查 Pages Functions 日志，通常是 API Key 配置错误或 Worker 连接失败。

**Q: CORS 错误**
A: Pages Functions 与前端同域名，不应该有 CORS 问题。如果直接调用 Worker，需要添加 CORS 头。

## 📚 相关文档

- [Cloudflare Pages Functions 文档](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
