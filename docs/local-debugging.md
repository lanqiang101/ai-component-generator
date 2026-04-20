# 本地调试指南

本文档介绍如何在本地环境中调试 Cloudflare Pages Functions 和 Worker。

## 📋 前置要求

确保已安装以下工具：

```bash
# 安装 Wrangler CLI（如果还未安装）
npm install -g wrangler

# 或者使用 npx（推荐）
npx wrangler --version
```

## 🚀 自动部署配置

本项目已配置 **Cloudflare Git 集成自动部署**：

- ✅ **Pages 项目**：推送代码到 [main](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/components/CodeEditorPanel.tsx#L260-L260) 分支 → 自动部署前端 + Pages Functions
- ✅ **Worker 项目**：推送代码到 [main](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/components/CodeEditorPanel.tsx#L260-L260) 分支 → 自动部署 Worker（当 `worker/` 目录有变化时）

**无需手动部署或配置 GitHub Actions！**

详细配置请参考 Cloudflare Dashboard：
- Pages: https://dash.cloudflare.com > Workers & Pages > ai-component-generator
- Worker: https://dash.cloudflare.com > Workers & Pages > ai-component-proxy

---

## 🔧 本地调试方式

### 1. Pages Functions 本地调试（推荐）

在项目根目录运行：

```bash
# 启动 Pages Functions 本地开发服务器
npm run dev:pages
# 或
npx wrangler pages dev
```

**注意**：Cloudflare Pages 使用根目录的 [wrangler.toml](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/wrangler.toml) 作为配置文件，不支持 `--config` 参数。

**功能**：
- ✅ 本地启动开发服务器（默认 `http://localhost:8788`）
- ✅ 模拟 Pages Functions 的路由和行为
- ✅ 自动热重载（修改代码后自动重新加载）
- ✅ 输出 `console.log` 到终端

**测试 API 端点**：

```bash
# 打开新终端，测试扩展描述接口
curl -X POST http://localhost:8788/api/expand-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "商品卡片组件",
    "componentName": "ProductCard"
  }'

# 测试需求整理接口
curl -X POST http://localhost:8788/api/refine-requirements \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "componentName": "商品卡片",
      "description": "电商商品展示卡片",
      "framework": "react-tsx",
      "componentType": "card",
      "style": "minimal"
    }
  }'

# 测试组件生成接口
curl -X POST http://localhost:8788/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "componentName": "CustomButton",
      "description": "一个蓝色的提交按钮",
      "framework": "react-tsx",
      "style": "minimal"
    }
  }'
```

**访问前端页面**：

打开浏览器访问 `http://localhost:8788`，可以像在云端一样使用所有功能。

### 2. Worker 本地调试

在 [worker](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/worker) 目录下运行：

```bash
# 进入 worker 目录
cd worker

# 启动 Worker 本地开发服务器
npm run dev:worker
# 或
npx wrangler dev
```

**功能**：
- ✅ 本地启动 Worker（默认 `http://localhost:8787`）
- ✅ 测试 Worker 是否正确调用火山方舟 API
- ✅ 查看详细的请求和响应日志

**测试 Worker**：

```bash
# 打开新终端，测试 Worker
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "你好，请回复：Worker本地调试成功"}
    ]
  }'
```

**预期响应**：

```
{
  "id": "msg-xxx",
  "choices": [
    {
      "message": {
        "content": "Worker本地调试成功"
      }
    }
  ]
}
```

## 🔑 配置本地环境变量

### Pages Functions 环境变量

创建 `.dev.vars` 文件（**不要提交到 Git**）：

```bash
# .dev.vars
# 注意：Pages Functions 实际上不需要 API Key，因为它调用的是已部署的 Worker
# 但如果需要调试其他功能，可以在这里配置
```

**注意**：由于 [functions/utils/ai.ts](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/utils/ai.ts) 直接调用已部署的 Worker URL（`https://ai-component-proxy.xuyongqiang916.workers.dev`），所以本地调试 Pages Functions **不需要**配置 API Key。

### Worker 环境变量

如果需要本地调试 Worker，创建 `worker/.dev.vars` 文件：

```bash
# worker/.dev.vars
API_KEY=你的火山方舟API Key
```

**获取 API Key**：

1. 访问 [火山方舟控制台](https://console.volcengine.com/ark/)
2. 创建或复制你的 API Key
3. 粘贴到 `.dev.vars` 文件中

## 🚀 完整本地调试流程

### 场景 1：仅调试 Pages Functions

```bash
# 1. 启动 Pages Functions 本地服务器
npm run dev:pages

# 2. 在另一个终端测试 API
curl -X POST http://localhost:8788/api/expand-description \
  -H "Content-Type: application/json" \
  -d '{"description":"测试","componentName":"Test"}'

# 3. 或打开浏览器访问 http://localhost:8788 使用完整界面
```

**架构**：
```
本地浏览器 → http://localhost:8788 (Pages Functions) → https://ai-component-proxy.xuyongqiang916.workers.dev (云端 Worker) → 火山方舟 API
```

### 场景 2：同时调试 Pages Functions 和 Worker

**终端 1** - 启动 Worker 本地服务器：

```bash
cd worker
npm run dev:worker
# Worker 运行在 http://localhost:8787
```

**终端 2** - 修改 Pages Functions 调用本地 Worker：

临时修改 [functions/utils/ai.ts](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/utils/ai.ts)：

```typescript
// 临时改为本地 Worker
const WORKER_URL = 'http://localhost:8787';
```

**终端 3** - 启动 Pages Functions：

```bash
npm run dev:pages
# Pages Functions 运行在 http://localhost:8788
```

**终端 4** - 测试：

```bash
curl -X POST http://localhost:8788/api/expand-description \
  -H "Content-Type: application/json" \
  -d '{"description":"测试","componentName":"Test"}'
```

**架构**：
```
本地浏览器 → http://localhost:8788 (Pages Functions) → http://localhost:8787 (本地 Worker) → 火山方舟 API
```

**注意**：测试完成后，记得将 [ai.ts](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/utils/ai.ts) 改回云端 Worker URL。

## 📊 调试技巧

### 1. 查看详细日志

Wrangler 会自动输出所有 `console.log` 到终端：

```
[wrangler:inf] GET /api/expand-description 200 OK (15ms)
收到扩展描述请求: {"description":"测试","componentName":"Test"}
开始调用 AI...
调用 Cloudflare Worker 代理: https://ai-component-proxy.xuyongqiang916.workers.dev
Worker 响应成功
```

### 2. 使用浏览器开发者工具

访问 `http://localhost:8788` 时，打开浏览器开发者工具：

- **Network 标签**：查看请求和响应的详细信息
- **Console 标签**：查看前端日志
- **Sources 标签**：调试前端代码

### 3. 使用 Postman 或 Insomnia

导入以下请求配置：

**扩展描述**：
- URL: `http://localhost:8788/api/expand-description`
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "description": "商品卡片组件",
    "componentName": "ProductCard"
  }
  ```

### 4. 模拟慢速网络

在 Chrome 开发者工具中：
1. 打开 **Network** 标签
2. 找到 **Online** 下拉菜单
3. 选择 **Fast 3G** 或 **Slow 3G**
4. 测试加载状态和错误处理

## ⚠️ 常见问题

### Q1: 端口被占用

如果遇到 `EADDRINUSE` 错误：

```bash
# 查找占用端口的进程
lsof -i :8788

# 杀死进程
kill -9 <PID>

# 或使用其他端口
npx wrangler pages dev --port 9000
```

### Q2: Worker 调用失败

如果 Pages Functions 调用 Worker 失败：

1. 检查 Worker 是否已部署：`https://ai-component-proxy.xuyongqiang916.workers.dev`
2. 检查 Worker 日志：Cloudflare Dashboard > Workers > Logs
3. 测试 Worker 直接调用：
   ```bash
   curl -X POST https://ai-component-proxy.xuyongqiang916.workers.dev \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"测试"}]}'
   ```

### Q3: 环境变量未生效

确保：
1. `.dev.vars` 文件存在且格式正确
2. 重启 Wrangler 开发服务器
3. 检查终端输出是否有加载环境变量的日志

## 📝 快速参考

| 命令 | 功能 | 端口 |
|------|------|------|
| `npm run dev:pages` | 启动 Pages Functions 本地服务器 | 8788 |
| `npm run dev:worker` | 启动 Worker 本地服务器 | 8787 |
| `npm run test:pages` | 运行 Pages Functions API 测试脚本 | - |
| `npm run test:worker` | 运行 Worker 测试脚本 | - |

## 🎯 推荐工作流

1. **开发阶段**：
   ```bash
   # 启动 Pages Functions 本地调试
   npm run dev:pages
   
   # 在浏览器中测试功能
   open http://localhost:8788
   ```

2. **测试阶段**：
   ```bash
   # 运行自动化测试
   npm run test:pages
   ```

3. **部署阶段**：
   ```bash
   # 推送到 GitHub，触发 Cloudflare Pages 自动部署
   git add .
   git commit -m "feat: 新功能"
   git push origin main
   ```

## 🔗 相关文档

- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Functions 文档](https://developers.cloudflare.com/pages/functions/)
- [Worker 部署文档](./cloudflare-worker.md)
- [Pages Functions 部署文档](./pages-functions-deployment.md)
