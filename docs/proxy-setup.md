# 代理配置说明

## 问题描述

在国内网络环境下，Node.js 后端服务无法直接访问 Cloudflare Workers 部署的域名（`.workers.dev`），会出现连接超时错误：

```
ConnectTimeoutError: Connect Timeout Error
code: 'UND_ERR_CONNECT_TIMEOUT'
```

## 当前配置

项目已配置为使用代理访问 Worker：

- **代理地址**: `http://127.0.0.1:7890`（Clash 默认端口）
- **配置位置**: `package.json` 的 `dev` 和 `dev:back` 脚本
- **实现方式**: 使用 `cross-env` + `undici` 的 `ProxyAgent`

## ⚠️ 重要：启动代理工具

**在运行项目之前，必须先启动代理工具！**

### 使用 Clash（推荐）

#### 1. 启动 Clash

- **macOS**: 打开 ClashX 或 Clash Verge
- **Windows**: 打开 Clash for Windows
- **Linux**: 运行 Clash 客户端

#### 2. 确认代理端口

1. 打开 Clash 设置
2. 查看 **HTTP 代理端口**
3. 默认端口通常是 **7890**

#### 3. 确保系统代理已开启

- ClashX: 菜单栏 > 开启系统代理
- Clash for Windows: System Proxy 开关打开

#### 4. 验证代理是否运行

```bash
# 测试代理端口是否可访问
curl -I http://127.0.0.1:7890

# 如果返回 HTTP 响应，说明代理正常运行
```

#### 5. 启动项目

```bash
npm run dev
```

### 使用其他代理工具

如果你的代理工具使用不同的端口，需要修改配置：

#### 修改 package.json

```json
{
  "scripts": {
    "dev": "cross-env https_proxy=http://127.0.0.1:YOUR_PORT http_proxy=http://127.0.0.1:YOUR_PORT concurrently \"node server/index.js\" \"vite\"",
    "dev:back": "cross-env https_proxy=http://127.0.0.1:YOUR_PORT http_proxy=http://127.0.0.1:YOUR_PORT node server/index.js"
  }
}
```

将 `YOUR_PORT` 替换为你的代理端口，例如：
- Shadowsocks: 通常是 `1080`
- V2ray: 通常是 `10809`
- 其他工具: 查看工具设置

## 解决方案

### 方案 1：使用代理（推荐）

#### 步骤 1：启动代理工具

确保你的代理工具（Clash、Shadowsocks 等）正在运行。

#### 步骤 2：验证代理

```bash
# 测试代理端口
curl -I http://127.0.0.1:7890

# 测试 Worker 连接
npm run test:worker
```

#### 步骤 3：启动项目

```bash
npm run dev
```

### 方案 2：使用本地 Worker 开发

在本地运行 Cloudflare Worker，避免网络问题。

#### 步骤 1：安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 步骤 2：登录 Cloudflare

```bash
wrangler login
```

#### 步骤 3：本地运行 Worker

```bash
cd worker
wrangler dev
```

Worker 将在 `http://localhost:8787` 运行。

#### 步骤 4：修改 .env 配置

```env
# 使用本地 Worker
VITE_AI_PROXY_URL=http://localhost:8787
AI_PROXY_URL=http://localhost:8787
```

#### 步骤 5：修改 package.json（移除代理配置）

```json
{
  "scripts": {
    "dev": "concurrently \"node server/index.js\" \"vite\"",
    "dev:back": "node server/index.js"
  }
}
```

#### 步骤 6：启动项目

```bash
npm run dev
```

### 方案 3：部署 Worker 到海外节点

如果你有自己的服务器，可以考虑：
1. 使用 Vercel / Netlify 等平台部署后端
2. 这些平台通常可以正常访问 Cloudflare Workers

## 验证配置

### 测试 Worker 连接

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

### 测试后端 API

```bash
curl -X POST http://localhost:3001/api/expand-description \
  -H "Content-Type: application/json" \
  -d '{"description":"一个简单的按钮组件","componentName":"CustomButton"}'
```

## 常见问题

### Q: 如何查看代理是否生效？

```bash
# 查看当前代理设置
echo $http_proxy
echo $https_proxy

# 测试代理连接
curl -x http://127.0.0.1:7890 https://ai-component-proxy.xuyongqiang916.workers.dev
```

### Q: 代理工具没有运行怎么办？

1. 启动你的代理工具（Clash、Shadowsocks 等）
2. 确认代理端口正确
3. 重新设置环境变量

### Q: 不想使用代理怎么办？

使用**方案 2**（本地 Worker）是最简单的替代方案，完全避免网络问题。

### Q: 如何在 IDE 中配置代理？

#### VS Code
在终端中设置环境变量后，VS Code 的集成终端会自动继承。

#### WebStorm
1. 打开 Run/Debug Configurations
2. 在 Environment variables 中添加：
   - `http_proxy=http://127.0.0.1:7890`
   - `https_proxy=http://127.0.0.1:7890`

### Q: 如何查看后端日志？

启动项目后，后端日志会显示在终端中：

```
🔧 配置代理: http://127.0.0.1:7890
调用 AI API (通过 Cloudflare Worker 代理): {
  url: 'https://ai-component-proxy.xuyongqiang916.workers.dev',
  model: 'ark-code-latest'
}
🌐 正在请求 AI API...
📡 代理配置: {
  https_proxy: 'http://127.0.0.1:7890',
  http_proxy: 'http://127.0.0.1:7890'
}
```

## 注意事项

⚠️ **重要**：
- **必须先启动代理工具**，然后才能运行项目
- 代理设置已内置在 `package.json` 中，无需手动设置环境变量
- 如果使用其他端口，需要修改 `package.json` 中的配置
- 本地 Worker 开发模式不需要代理

## 快速检查清单

在运行项目之前，请确认：

- [ ] 代理工具（Clash 等）已启动
- [ ] 代理端口配置正确（默认 7890）
- [ ] 系统代理已开启
- [ ] 测试代理连接：`curl -I http://127.0.0.1:7890`
- [ ] 测试 Worker 连接：`npm run test:worker`

## 相关文档

- [Cloudflare Worker 部署指南](./cloudflare-worker.md)
- [项目配置说明](./configuration.md)
- [模型配置重构说明](./migration-guide.md)
