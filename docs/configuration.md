# 项目配置说明

## 环境变量配置

项目使用环境变量来配置 Cloudflare Worker 代理地址。

### 配置文件

- `.env` - 实际的环境变量配置（**不提交到 Git**）
- `.env.example` - 环境变量示例文件（提交到 Git）

### 当前配置

```env
# Cloudflare Worker 代理 URL
VITE_AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev

# 后端服务端口
PORT=3001
```

### 火山方舟 API 配置（内置）

以下配置已内置在代码中，**无需手动配置**：

| 配置项 | 值 | 位置 |
|--------|-----|------|
| Base URL | `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions` | `worker/index.js` |
| 模型标识 | `ark-code-latest` | `worker/index.js` |
| Temperature | 0.7 | `worker/index.js` |
| Max Tokens | 4096 | `worker/index.js` |
| API Key | （在 Cloudflare 配置） | Cloudflare Worker 环境变量 |

## Cloudflare Worker 配置

### Worker URL
```
https://ai-component-proxy.xuyongqiang916.workers.dev
```

### 环境变量（在 Cloudflare Dashboard 配置）
- **Variable name**: `ARK_API_KEY`
- **Value**: 你的火山方舟 API Key

## 测试配置

### 1. 测试 Worker 连接

```bash
npm run test:worker
```

**成功输出示例**：
```
🧪 开始测试 Cloudflare Worker...

📡 Worker URL: https://ai-component-proxy.xuyongqiang916.workers.dev

📤 发送测试请求...

📥 收到响应:
⏱️  耗时: 1234ms
📊 状态码: 200
✅ 成功！收到 1523 字符的响应
```

### 2. 启动项目

```bash
npm run dev
```

访问：http://localhost:3000

## 国内网络注意事项

如果你在国内网络环境，访问 Cloudflare Workers 可能会遇到限制：

### 症状
- 连接超时（30秒）
- `fetch failed` 错误
- `Couldn't connect to server` 错误

### 解决方案

#### 方案 1：使用代理（推荐）

```bash
# 设置代理（以 Clash 为例）
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890

# 测试 Worker
npm run test:worker

# 启动项目
npm run dev
```

#### 方案 2：部署自己的 Worker

1. 在 Cloudflare Dashboard 创建新 Worker
2. 部署到海外节点
3. 更新 `.env` 文件中的 Worker URL

#### 方案 3：使用本地 Worker 开发

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 本地运行 Worker
cd worker
wrangler dev

# 修改 .env 文件
VITE_AI_PROXY_URL=http://localhost:8787
AI_PROXY_URL=http://localhost:8787
```

## 验证配置

### 1. 检查环境变量

```bash
# Linux/Mac
echo $VITE_AI_PROXY_URL
echo $AI_PROXY_URL

# Windows (PowerShell)
echo $env:VITE_AI_PROXY_URL
echo $env:AI_PROXY_URL
```

### 2. 测试网络连接

```bash
# 使用 curl 测试
curl -X POST https://ai-component-proxy.xuyongqiang916.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'
```

### 3. 检查 DNS 解析

```bash
ping ai-component-proxy.xuyongqiang916.workers.dev
nslookup ai-component-proxy.xuyongqiang916.workers.dev
```

## 常见问题

### Q: 如何修改 Worker URL？

编辑 `.env` 文件：
```env
VITE_AI_PROXY_URL=https://your-worker.your-subdomain.workers.dev
AI_PROXY_URL=https://your-worker.your-subdomain.workers.dev
```

### Q: 如何查看 Worker 日志？

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 Workers & Pages
3. 选择你的 Worker
4. 点击 **Logs** 标签

### Q: API Key 配置在哪里？

API Key 配置在 Cloudflare Worker 的环境变量中：
1. 进入 Worker 页面
2. 点击 **Settings**
3. 找到 **Environment Variables**
4. 查看 `ARK_API_KEY` 变量

### Q: 如何在生产环境配置？

根据你的部署平台配置环境变量：
- **Vercel**: Settings > Environment Variables
- **Netlify**: Site settings > Environment variables
- **其他平台**: 参考对应平台文档

## 安全提示

⚠️ **重要**：
- `.env` 文件包含敏感信息，不要提交到 Git
- 定期轮换 API Key
- 监控 Worker 使用量
- 使用 HTTPS 加密通信

## 相关文档

- [Cloudflare Worker 部署指南](./cloudflare-worker.md)
- [模型配置重构说明](./migration-guide.md)
- [README](../README.md)
- [README 中文](../README_zh.md)
