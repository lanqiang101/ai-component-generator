# Cloudflare Worker 自动部署配置指南

本文档介绍如何为 Cloudflare Worker 配置 GitHub Actions 自动部署。

## 📊 Workers vs Pages 部署方式对比

| 特性 | Cloudflare Pages | Cloudflare Workers |
|------|-----------------|-------------------|
| **Git 集成** | ✅ 原生支持 | ❌ 需要额外配置 |
| **自动部署** | ✅ 推送即部署 | ⚠️ 需配置 CI/CD |
| **构建配置** | ✅ 可视化配置 | ❌ 需配置文件 |
| **环境变量** | ✅ Dashboard 配置 | ✅ Dashboard 或 Wrangler |
| **推荐方案** | 直接使用 Git 集成 | GitHub Actions |

## 🚀 配置 GitHub Actions 自动部署

### 步骤 1：获取 Cloudflare API Token

1. **访问 Cloudflare Dashboard**
   - https://dash.cloudflare.com

2. **创建 API Token**
   - 点击右上角头像 > **My Profile** > **API Tokens**
   - 点击 **Create Token**
   - 选择 **Edit Cloudflare Workers** 模板

3. **配置 Token 权限**
   ```
   Permissions:
   - Account: Workers Scripts: Edit
   - Account: Workers KV Storage: Edit
   - Zone: (不需要)
   
   Account Resources:
   - Include: All accounts
   
   Zone Resources:
   - (留空)
   ```

4. **复制 Token**
   - 复制生成的 Token（**只会显示一次**）
   - 保存好，后面需要用到

### 步骤 2：获取 Cloudflare Account ID

1. **查看 Account ID**
   - 访问：https://dash.cloudflare.com
   - 在右侧栏找到 **Account ID**
   - 复制 ID（格式类似：`abc123def456...`）

### 步骤 3：配置 GitHub Secrets

1. **访问 GitHub 仓库设置**
   - https://github.com/lanqiang101/ai-component-generator/settings/secrets/actions

2. **添加 Secrets**
   
   **添加 CLOUDFLARE_API_TOKEN**：
   - 点击 **New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 粘贴刚才复制的 API Token
   - 点击 **Add secret**

   **添加 CLOUDFLARE_ACCOUNT_ID**：
   - 点击 **New repository secret**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: 粘贴 Account ID
   - 点击 **Add secret**

### 步骤 4：验证配置

GitHub Actions 工作流文件已创建：[.github/workflows/deploy-worker.yml](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/.github/workflows/deploy-worker.yml)

配置内容：
```yaml
name: Deploy Cloudflare Worker

on:
  push:
    branches:
      - main
    paths:
      - 'worker/**'
      - 'wrangler.toml'
  workflow_dispatch:

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install Wrangler
        run: npm install -g wrangler
      - name: Deploy Worker
        run: |
          cd worker
          wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**触发条件**：
- ✅ 推送 [main](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/components/CodeEditorPanel.tsx#L260-L260) 分支，且修改了 `worker/` 目录或 [wrangler.toml](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/wrangler.toml)
- ✅ 手动触发（GitHub Actions 页面点击 "Run workflow"）

## 📝 使用流程

### 自动部署流程

1. **修改 Worker 代码**
   ```bash
   # 修改 worker/index.js
   vim worker/index.js
   ```

2. **提交并推送**
   ```bash
   git add worker/index.js
   git commit -m "fix: 修复 Worker 错误处理"
   git push origin main
   ```

3. **自动部署**
   - GitHub Actions 自动触发
   - 访问查看进度：https://github.com/lanqiang101/ai-component-generator/actions
   - 等待 1-2 分钟完成部署

4. **验证部署**
   ```bash
   curl -X POST https://ai-component-proxy.xuyongqiang916.workers.dev \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"测试"}]}'
   ```

### 手动触发部署

如果需要在不推送代码的情况下重新部署：

1. 访问：https://github.com/lanqiang101/ai-component-generator/actions
2. 点击左侧 **Deploy Cloudflare Worker**
3. 点击 **Run workflow** 按钮
4. 选择 [main](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/components/CodeEditorPanel.tsx#L260-L260) 分支
5. 点击 **Run workflow**

## ⚠️ 重要注意事项

### 1. 环境变量不会自动同步

**问题**：GitHub Actions 部署时**不会**自动配置 Worker 的环境变量（如 `API_KEY`）。

**解决方案**：

**方式 A：首次部署后手动配置**
```bash
# 部署后，手动添加 Secret
cd worker
wrangler secret put API_KEY
# 输入你的火山方舟 API Key
```

**方式 B：在 Dashboard 中配置**
1. 访问：https://dash.cloudflare.com
2. Workers & Pages > **ai-component-proxy**
3. **Settings** > **Variables**
4. 添加 `API_KEY`（类型为 Secret）

**方式 C：在 GitHub Actions 中配置（不推荐）**
```yaml
# 不推荐：会暴露 API Key
- name: Deploy Worker
  run: |
    cd worker
    echo "${{ secrets.ARK_API_KEY }}" | wrangler secret put API_KEY
    wrangler deploy
```

### 2. 本地调试 vs 自动部署

| 场景 | 方式 | 说明 |
|------|------|------|
| **本地开发** | `npm run dev:worker` | 快速迭代，不影响线上 |
| **测试验证** | `npm run test:worker` | 测试 Worker 功能 |
| **正式发布** | `git push origin main` | 触发 GitHub Actions 自动部署 |

### 3. Pages Functions 不需要额外配置

**重要**：Pages Functions 已经通过 Pages 的 Git 集成自动部署，**不需要**配置 GitHub Actions。

- ✅ Pages Functions：推送代码 → Pages 自动构建部署
- ⚠️ Worker：推送代码 → GitHub Actions → Wrangler 部署

## 🔍 故障排查

### 问题 1：GitHub Actions 部署失败

**检查日志**：
1. 访问：https://github.com/lanqiang101/ai-component-generator/actions
2. 点击失败的工作流
3. 查看 **Deploy Worker** 步骤的详细日志

**常见错误**：

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `CLOUDFLARE_API_TOKEN not found` | Secret 未配置 | 检查 GitHub Secrets 是否正确添加 |
| `Authentication error` | Token 无效或过期 | 重新生成 API Token |
| `Account ID not found` | Account ID 错误 | 检查并更新 CLOUDFLARE_ACCOUNT_ID |
| `Worker name not found` | Worker 名称不匹配 | 检查 [wrangler.toml](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/wrangler.toml) 中的 [name](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/types/index.ts#L17-L17) 字段 |

### 问题 2：部署成功但 Worker 不工作

**检查步骤**：

1. **验证环境变量**
   ```bash
   cd worker
   wrangler secret list
   ```

2. **测试 Worker**
   ```bash
   curl -X POST https://ai-component-proxy.xuyongqiang916.workers.dev \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"测试"}]}'
   ```

3. **查看 Worker 日志**
   - 访问：https://dash.cloudflare.com
   - Workers & Pages > **ai-component-proxy** > **Logs**

### 问题 3：Pages Functions 调用 Worker 失败

**原因**：Worker 部署后环境变量未配置。

**解决方案**：
```bash
# 部署后立即配置环境变量
cd worker
wrangler secret put API_KEY
```

## 📚 最佳实践

### 1. 分支策略

```
main          ← 稳定版本，自动部署到生产环境
├── develop   ← 开发分支，手动测试
└── feature/* ← 功能分支，本地调试
```

### 2. 提交规范

```bash
# Worker 代码修改
git commit -m "fix: 修复 Worker 错误处理逻辑"

# 配置文件修改
git commit -m "chore: 更新 wrangler.toml 配置"

# 文档更新
git commit -m "docs: 添加自动部署指南"
```

### 3. 部署前检查清单

- [ ] Worker 代码已提交并推送到 [main](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/components/CodeEditorPanel.tsx#L260-L260) 分支
- [ ] GitHub Actions 工作流正常运行
- [ ] Worker 环境变量已配置（`API_KEY`）
- [ ] Worker URL 可访问
- [ ] Pages Functions 可以调用 Worker

## 🎯 完整自动化流程

```
开发者推送代码
    ↓
GitHub 接收推送
    ↓
GitHub Actions 触发
    ↓
安装依赖并构建
    ↓
Wrangler 部署 Worker
    ↓
Cloudflare 更新 Worker
    ↓
Worker 立即可用 ✅
```

**对比 Pages Functions**：

```
开发者推送代码
    ↓
Cloudflare Pages 检测推送
    ↓
自动构建前端和 Functions
    ↓
自动部署到 CDN
    ↓
Pages 立即可用 ✅
```

## 📖 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Worker 部署文档](./cloudflare-worker.md)
- [Pages Functions 部署文档](./pages-functions-deployment.md)
