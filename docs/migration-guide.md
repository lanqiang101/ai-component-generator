# AI 组件生成器 - 模型配置重构说明

## 变更概述

本次重构移除了模型配置管理功能，将模型 API 请求内置到项目中，使用 Cloudflare Worker 进行 API Key 加密中转。

## 主要变更

### 1. 后端变更

#### 修改 `server/index.js`

- ✅ **简化 `callAI` 函数**：
  - 移除了动态模型配置参数
  - 使用环境变量 `AI_PROXY_URL` 配置 Cloudflare Worker 地址
  - 固定使用火山方舟 `ark-code-latest` 模型
  - 内置配置：Temperature 0.7, Max Tokens 4096

- ✅ **移除 model 参数验证**：
  - `/api/generate` 接口不再需要 model 参数
  - `/api/refine-requirements` 接口不再需要 model 参数
  - `/api/expand-description` 接口不再需要 model 参数

### 2. 前端变更

#### 修改 `src/store/useStore.ts`

- ✅ **`refineRequirements` 函数**：
  - 移除了 `systemConfig.componentGenerationModelId` 验证
  - 移除了 model 参数传递
  
- ✅ **`confirmAndGenerate` 函数**：
  - 移除了 model 参数验证和查找逻辑
  - 直接调用 API，不再传递 model
  
- ✅ **`expandDescription` 函数**：
  - 移除了 model 参数验证和传递

#### 保留的页面（未删除）

- `src/pages/ModelManagementPage.tsx` - 保留但不再使用
- `src/pages/ConfigPage.tsx` - 保留但不再需要配置模型

> 注意：这两个页面可以从路由中移除，但为了保持代码完整性暂时保留。

### 3. 新增文件

#### `worker/index.js`
Cloudflare Worker 代码，用于安全中转火山方舟 API 请求。

#### `worker/wrangler.toml`
Wrangler CLI 配置文件。

#### `docs/cloudflare-worker.md`
Cloudflare Worker 部署指南文档。

#### `.env.example` 和 `.env`
环境变量配置文件。

#### `test-worker.js`
测试 Worker 是否正常工作的脚本。

#### `README.md` 和 `README_zh.md`
更新了项目文档，说明新的配置方式。

### 4. 配置文件变更

#### `package.json`
添加了新的 npm 脚本：
- `dev:worker` - 本地运行 Cloudflare Worker
- `deploy:worker` - 部署到 Cloudflare
- `test:worker` - 测试 Worker 连接

## API 配置信息

### 火山方舟 API

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Base URL | `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions` | ✅ 正确 |
| 模型标识 | `ark-code-latest` | ✅ 正确 |
| Temperature | 0.7 | 内置，不可配置 |
| Max Tokens | 4096 | 内置，不可配置 |

**说明**：你的配置信息是**正确的**！`/api/coding/v3` 是火山方舟兼容 OpenAI 接口的正确路径。

### Cloudflare Worker 配置

| 变量名 | 值 | 说明 |
|--------|-----|------|
| Worker URL | `https://ai-component-proxy.xuyongqiang916.workers.dev` | 正式的 Worker 地址 |
| ARK_API_KEY | （在 Cloudflare 配置） | 火山方舟 API Key |

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 测试 Worker 连接

```bash
npm run test:worker
```

**⚠️ 如果测试失败**：

#### 网络超时错误
如果你在国内网络环境，可能会遇到以下错误：
```
❌ 请求失败: fetch failed
⏱️  请求超时（30秒）
```

**解决方案**：

1. **使用代理或 VPN**（推荐）
   ```bash
   # 设置 HTTP 代理
   export http_proxy=http://127.0.0.1:7890
   export https_proxy=http://127.0.0.1:7890
   
   # 然后重新测试
   npm run test:worker
   ```

2. **部署自己的 Worker**
   - 参考 [Cloudflare Worker 部署指南](./cloudflare-worker.md)
   - 部署到海外节点可能更稳定

3. **检查 DNS 解析**
   ```bash
   ping ai-component-proxy.xuyongqiang916.workers.dev
   nslookup ai-component-proxy.xuyongqiang916.workers.dev
   ```

4. **使用浏览器测试**
   直接在浏览器中访问 Worker URL，看是否能收到错误响应

### 3. 启动项目

如果 Worker 测试通过：

```bash
npm run dev
```

## 安全架构

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   前端应用   │ ──────▶ │ Cloudflare   │ ──────▶ │  火山方舟    │
│  (浏览器)    │  HTTPS  │   Worker     │  HTTPS  │   API        │
└─────────────┘         │  (代理层)     │         └──────────────┘
                        │              │
                        │ ✅ API Key   │
                        │   加密存储    │
                        └──────────────┘
```

**安全优势**：
- ✅ API Key 不会暴露在前端代码中
- ✅ API Key 不会暴露在后端代码中
- ✅ API Key 安全存储在 Cloudflare 环境变量中
- ✅ 所有通信使用 HTTPS 加密
- ✅ Cloudflare 提供 DDoS 防护和速率限制

## 费用说明

### Cloudflare Workers
- **免费额度**：每月 10 万次请求
- **超出部分**：$0.30 / 百万次请求
- 参考：[Cloudflare Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)

### 火山方舟 API
- 按使用量计费
- 参考：[火山方舟定价](https://www.volcengine.com/pricing)

## 常见问题

### Q1: Worker 连接超时怎么办？

**A**: 这是国内网络环境的常见问题，有以下解决方案：

1. **使用代理**（最简单）
   ```bash
   export https_proxy=http://127.0.0.1:7890
   npm run test:worker
   ```

2. **部署自己的 Worker**
   - 在 Cloudflare Dashboard 创建新 Worker
   - 部署到更接近你的地区

3. **检查网络**
   ```bash
   curl -I https://ai-component-proxy.xuyongqiang916.workers.dev
   ```

### Q2: 如何在生产环境配置环境变量？

**A**: 根据你的部署平台：

- **Vercel**: Settings > Environment Variables > 添加 `AI_PROXY_URL`
- **Netlify**: Site settings > Environment variables > 添加 `AI_PROXY_URL`
- **其他平台**: 参考对应平台的文档

### Q3: 如何监控 Worker 使用情况？

**A**: 
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 Workers & Pages
3. 选择你的 Worker
4. 查看 Analytics 标签页

### Q4: API Key 泄露了怎么办？

**A**: 
1. 立即在火山方舟控制台撤销该 Key
2. 创建新的 API Key
3. 在 Cloudflare Worker 中更新环境变量
4. 重新部署 Worker

## 故障排查

### Worker 返回 400 错误
- 检查请求格式是否正确
- 确保包含 `messages` 数组字段

### Worker 返回 500 错误
- 检查 Cloudflare Worker 日志
- 确认 `ARK_API_KEY` 已配置
- 验证 API Key 是否有效

### Worker 返回 429 错误
- 超出速率限制
- 等待一段时间后重试
- 考虑升级 Cloudflare 计划

### 前端无法连接 Worker
- 检查 `VITE_AI_PROXY_URL` 配置
- 确认网络连通性
- 查看浏览器控制台错误信息

详细故障排查请查看：[Cloudflare Worker 部署指南](./cloudflare-worker.md#故障排查)

## 后续优化建议

1. **删除未使用的页面**：
   - 可以从路由中移除 `ModelManagementPage` 和 `ConfigPage`
   - 清理相关的 Zustand store 代码

2. **添加速率限制**：
   - 在 Cloudflare Worker 中添加请求限流逻辑
   - 防止滥用 API

3. **添加监控和日志**：
   - 使用 Cloudflare Analytics 监控 Worker 使用量
   - 设置告警通知

4. **配置自定义域名**（可选）：
   - 提升专业度
   - 更容易记忆

5. **多区域部署**（可选）：
   - 如果用户分布在全球，考虑在多个地区部署 Worker
   - 降低延迟

## 联系支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [火山方舟 API 文档](https://www.volcengine.com/docs/82379)
- 项目 Issue 区
