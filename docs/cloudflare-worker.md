# Cloudflare Worker 部署指南

本指南将帮助你部署 Cloudflare Worker 来安全地中转火山方舟 API 请求。

## 为什么使用 Cloudflare Worker？

- 🔒 **安全性**：API Key 存储在 Cloudflare 环境变量中，不会暴露在前端或后端代码中
- ⚡ **性能**：Cloudflare 全球边缘网络，响应速度快
- 💰 **免费额度**：每月 10 万次免费请求，足够个人和小团队使用
- 🛡️ **跨域支持**：自动处理 CORS，前端可以直接调用

## 快速开始

### 1. 配置项目环境变量

项目已经配置了正式的 Worker URL，直接使用即可：

```bash
# .env 文件中已经配置
VITE_AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
```

### 2. 测试 Worker 是否正常工作

```bash
# 运行测试脚本
npm run test:worker
```

如果测试通过，你会看到类似这样的输出：
```
🧪 开始测试 Cloudflare Worker...

📡 Worker URL: https://ai-component-proxy.xuyongqiang916.workers.dev

📤 发送测试请求...

📥 收到响应:
⏱️  耗时: 1234ms
📊 状态码: 200
✅ 成功！收到 1523 字符的响应

📝 响应内容（前200字符）:
```jsx
import React from 'react';
...
```
```

### 3. 启动项目

```bash
npm install
npm run dev
```

访问：http://localhost:3000

## 如何部署自己的 Worker（可选）

如果你需要部署自己的 Worker，请按以下步骤操作：

### 1. 登录 Cloudflare Dashboard

访问 [https://dash.cloudflare.com](https://dash.cloudflare.com) 并登录你的账号。

### 2. 创建 Worker

1. 在左侧菜单选择 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. 输入 Worker 名称，例如：`ai-component-proxy`
5. 点击 **Deploy**

### 3. 配置环境变量

1. 进入刚创建的 Worker 页面
2. 点击 **Settings** 标签
3. 找到 **Environment Variables** 部分
4. 点击 **Add variable**
5. 添加以下变量：
   - **Variable name**: `ARK_API_KEY`
   - **Value**: 你的火山方舟 API Key（从火山方舟控制台获取）
6. 点击 **Save and deploy**

### 4. 部署 Worker 代码

1. 点击 **Edit code** 按钮
2. 将 `worker/index.js` 文件的内容复制粘贴到编辑器中
3. 点击 **Save and deploy**

### 5. 获取 Worker URL

部署成功后，你会看到一个 URL，格式类似：
```
https://ai-component-proxy.your-subdomain.workers.dev
```

### 6. 更新项目配置

修改 `.env` 文件中的 Worker URL：

```env
VITE_AI_PROXY_URL=https://your-worker.your-subdomain.workers.dev
AI_PROXY_URL=https://your-worker.your-subdomain.workers.dev
```

## 本地开发 Worker（可选）

如果你想在本地开发和测试 Worker：

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 本地运行 Worker

在 `worker` 目录下运行：

```bash
cd worker
wrangler dev
```

Worker 将在 `http://localhost:8787` 运行。

### 4. 配置本地环境变量

修改 `.env` 文件：

```env
VITE_AI_PROXY_URL=http://localhost:8787
AI_PROXY_URL=http://localhost:8787
```

### 5. 测试本地 Worker

```bash
npm run test:worker
```

## 获取火山方舟 API Key

1. 访问 [火山方舟控制台](https://console.volcengine.com/ark)
2. 进入 **API Key 管理** 页面
3. 创建新的 API Key
4. 复制 Key 并配置到 Cloudflare Worker 环境变量中

## API 配置说明

项目已内置以下配置，无需修改：

- **Base URL**: `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions`
- **模型标识**: `ark-code-latest`
- **Temperature**: 0.7
- **Max Tokens**: 4096

## 故障排查

### 1. Worker 返回 400 错误

**原因**：请求格式不正确

**解决方案**：
- 确保请求体包含 `messages` 数组字段
- 检查 `messages` 数组中的每个消息对象都有 `role` 和 `content` 字段

### 2. Worker 返回 500 错误

**原因**：API Key 未配置或火山方舟服务异常

**解决方案**：
1. 检查 Cloudflare Worker 日志：
   - 进入 Worker 页面
   - 点击 **Logs** 标签
   - 查看错误信息
2. 确认 `ARK_API_KEY` 环境变量已配置
3. 验证 API Key 是否有效

### 3. 测试脚本失败

运行测试脚本查看详细错误：

```bash
npm run test:worker
```

常见错误：
- **Network Error**：网络连接问题，检查防火墙设置
- **401 Unauthorized**：API Key 无效或已过期
- **429 Too Many Requests**：超出速率限制

### 4. 前端请求失败

检查浏览器控制台的网络请求：
- 确认 `VITE_AI_PROXY_URL` 配置正确
- 检查是否有 CORS 错误（Worker 已配置 CORS，应该不会出现）
- 确认 Worker 处于活跃状态

### 5. 后端请求失败

检查后端日志：
- 确认 `AI_PROXY_URL` 环境变量已配置
- 检查网络连接是否正常
- 确认 Worker URL 可访问

## 安全建议

1. **不要在前端或后端代码中硬编码 API Key**
2. **定期轮换 API Key**（在火山方舟控制台重新生成）
3. **监控 Worker 使用量**（Cloudflare Dashboard > Workers > Usage）
4. **设置速率限制**（可选，在 Worker 代码中添加限流逻辑）
5. **配置自定义域名**（可选，提升专业度）

## 费用说明

- Cloudflare Workers 免费额度：每月 10 万次请求
- 超出部分：$0.30 / 百万次请求
- 火山方舟 API 费用：根据你的使用量计费，参考火山方舟定价页面

## 测试与监控

### 测试 Worker

```bash
# 测试 Worker 是否正常工作
npm run test:worker
```

### 监控使用量

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的 Worker
3. 查看 **Analytics** 标签页
4. 监控请求数量、错误率和响应时间

## 技术支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [火山方舟 API 文档](https://www.volcengine.com/docs/82379)
- 项目 Issue 区
