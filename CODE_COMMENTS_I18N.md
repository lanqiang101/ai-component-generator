# 代码注释国际化说明

## ✅ 已完成的实现

### 1. 本地API提示词已添加注释语言要求

#### expand-description.ts (组件描述扩写)
- **文件**: `functions/api/expand-description.ts`
- **状态**: ✅ 已添加
- **英文提示词**: 包含 `IMPORTANT: All code comments MUST be written in English.`
- **中文提示词**: 不包含特殊要求（AI会根据中文语境自然生成中文注释）

#### refine-requirements.ts (需求分析整理)
- **文件**: `functions/api/refine-requirements.ts`
- **状态**: ✅ 已添加
- **英文提示词**: 包含 `IMPORTANT: All code comments in generated components MUST be written in English.`
- **中文提示词**: 不包含特殊要求

### 2. 前端已传递语言参数

#### useStore.ts
- **文件**: `src/store/useStore.ts`
- **修改内容**:
  - ✅ `expandDescription()` - 传递 `language` 参数
  - ✅ `refineRequirements()` - 传递 `language` 参数
  - ✅ `startMultiFileGeneration()` - 传递 `language` 参数

### 3. 代码清洗逻辑

#### Worker代码清洗
- **文件**: `worker/index.js`
- **功能**:
  - ✅ 移除Markdown标记
  - ✅ 检测代码完整性
  - ❌ **未实现**: 注释语言转换（因为应该在生成阶段就使用正确语言）

## ⚠️ 需要远程服务器配合的部分

### 组件生成API (`/api/generate/component`)

**问题**: 
- 该API部署在远程服务器 `ai-component-generator.pages.dev`
- 本地代码只负责传递 `language` 参数
- 远程服务器需要根据语言参数构建对应的提示词

**需要远程服务器实现的功能**:

1. **接收language参数**
   ```typescript
   const { params, language = 'en' } = await request.json();
   ```

2. **根据语言选择提示词模板**
   ```typescript
   const prompt = language === 'zh' 
     ? buildChinesePrompt(params) 
     : buildEnglishPrompt(params);
   ```

3. **英文提示词中必须包含注释要求**
   ```typescript
   const englishPrompt = `
   You are a professional Frontend Developer.
   Generate a React component based on the following requirements...
   
   IMPORTANT REQUIREMENTS:
   - ALL code comments MUST be written in English
   - Use professional English terminology
   - Follow React best practices
   ...
   `;
   ```

4. **中文提示词不需要特殊要求**
   - AI会根据中文语境自然生成中文注释

## 📋 远程服务器需要修改的提示词示例

### 英文提示词模板（需要添加）

```
function buildEnglishPrompt(params: any): string {
  return `You are a professional Frontend Developer and UI Engineer.

**Task**: Generate a complete React component based on the following requirements.

**Component Requirements**:
- Name: ${params.componentName}
- Description: ${params.description}
- Framework: ${params.framework}
- Component Type: ${params.componentType}
- UI Style: ${params.style}
- UI Library: ${params.uiLibrary || 'None'}

**Architecture Requirements**:
1. Split the component into multiple files (main component + at least 1 sub-component)
2. Follow component composition pattern
3. Extract reusable logic to utility functions

**IMPORTANT: Code Comments**:
- ALL code comments MUST be written in English
- Use clear, concise English descriptions
- Explain the "why" not just the "what"
- Follow JSDoc format for functions and components
- Complex logic must have English comments
- TODO/FIXME markers should be in English

**Code Quality**:
- Use TypeScript with proper type definitions
- Follow React best practices and hooks
- Implement proper error handling
- Ensure responsive design
- Use modern ES6+ syntax

Return the generated code with the following structure:
- Main component file (index.tsx)
- Sub-component files (components/*.tsx)
- Utility functions (utils/*.ts)
- Type definitions (types.ts) if needed

Generate complete, production-ready code.`;
}
```

### 中文提示词模板（需要添加）

```
function buildChinesePrompt(params: any): string {
  return `你是一个专业的前端开发工程师。

**任务**: 根据以下需求生成完整的React组件。

**组件需求**:
- 名称: ${params.componentName}
- 描述: ${params.description}
- 框架: ${params.framework}
- 组件类型: ${params.componentType}
- UI风格: ${params.style}
- UI库: ${params.uiLibrary || '无'}

**架构要求**:
1. 将组件拆分为多个文件（主组件 + 至少1个子组件）
2. 遵循组件组合模式
3. 将可复用逻辑提取为工具函数

**代码注释规范**:
- 所有代码注释必须使用中文
- 使用清晰、简洁的中文描述
- 解释"为什么"而不仅仅是"是什么"
- 复杂逻辑必须添加中文注释
- 遵循JSDoc格式

**代码质量**:
- 使用TypeScript并提供完整的类型定义
- 遵循React最佳实践和hooks规范
- 实现完善的错误处理
- 确保响应式设计
- 使用现代ES6+语法

请生成完整的、可用于生产的代码。`;
}
```

## 🧪 测试方法

### 英文环境测试
1. 访问 `http://localhost:3000/`
2. 点击"AI Expand"扩写组件描述
3. **预期**: 返回的描述应该是英文的
4. 点击"生成组件"按钮
5. **预期**: 生成的代码中所有注释都应该是英文的

### 中文环境测试
1. 点击Globe图标切换到中文（`/zh`）
2. 点击"AI扩写"扩写组件描述
3. **预期**: 返回的描述应该是中文的
4. 点击"生成组件"按钮
5. **预期**: 生成的代码中所有注释都应该是中文的

## 📝 项目规范要求

根据项目的**代码注释规范**（memory中的规定）：

> **代码注释规范**：
> - 所有代码注释（单行、多行、JSDoc）必须使用英文
> - 注释应简洁明了，说明"为什么"而非"是什么"
> - 复杂逻辑必须添加英文注释说明
> - TODO/FIXME标记使用英文

**重要发现**: 根据项目规范，**所有代码注释都应该使用英文**，无论界面语言是中文还是英文！

这意味着：
- ✅ **英文环境**: 提示词要求英文注释 → 符合规范
- ❌ **中文环境**: 如果提示词要求中文注释 → **不符合项目规范**

## 🎯 建议修改

基于项目规范，建议**无论什么语言环境，生成的代码注释都应该是英文**：

### 方案1: 统一使用英文注释（推荐）
- 英文提示词: `All code comments MUST be written in English`
- 中文提示词: `所有代码注释必须使用英文`
- **优点**: 符合项目规范，代码国际化更好

### 方案2: 根据界面语言切换注释语言
- 英文提示词: `All code comments MUST be written in English`
- 中文提示词: `所有代码注释使用中文`
- **优点**: 用户体验更好，但**不符合项目规范**

**推荐采用方案1**，保持代码注释始终为英文。

## 📖 相关文件

- 本地API: `functions/api/expand-description.ts`
- 本地API: `functions/api/refine-requirements.ts`
- Worker清洗: `worker/index.js`
- 前端调用: `src/store/useStore.ts`
- 远程API: 部署在 `ai-component-generator.pages.dev`（需要手动更新）

```
# 代码注释国际化核对报告

## ✅ 已完成的修改

### 1. 本地API提示词已添加注释语言要求

#### expand-description.ts (组件描述扩写)
- **文件**: `functions/api/expand-description.ts`
- **英文提示词**: ✅ 包含 `IMPORTANT: All code comments MUST be written in English.`
- **中文提示词**: 不涉及代码生成，只生成需求描述文本

#### refine-requirements.ts (需求分析整理)
- **文件**: `functions/api/refine-requirements.ts`
- **英文提示词**: ✅ 包含 `IMPORTANT: All code comments in generated components MUST be written in English.`
- **中文提示词**: ✅ 包含 `**重要**: 生成的组件代码中，所有代码注释必须使用英文`

**重要决策**: 根据项目规范，**无论界面语言是中文还是英文，生成的代码注释都必须是英文**。

### 2. 前端已传递语言参数

#### useStore.ts
- **文件**: `src/store/useStore.ts`
- **修改内容**:
  - ✅ `expandDescription()` - 传递 `language` 参数
  - ✅ `refineRequirements()` - 传递 `language` 参数
  - ✅ `startMultiFileGeneration()` - 传递 `language` 参数

### 3. 语言检测逻辑

```
// 通过URL路径判断当前语言
const language = window.location.pathname.startsWith('/zh') ? 'zh' : 'en';
```

## ⚠️ 远程服务器需要配合

### 组件生成API (`/api/generate/component`)

该API部署在远程服务器 `ai-component-generator.pages.dev`，本地代码只负责传递 [language](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/i18n/index.tsx#L25-L25) 参数。

**远程服务器需要实现**：

1. 接收 [language](file:///Users/xuyongqiang/Desktop/xm/ai-component-generator/src/i18n/index.tsx#L25-L25) 参数
2. 根据语言选择提示词模板
3. **英文提示词**必须包含：`All code comments MUST be written in English`
4. **中文提示词**也必须包含：`生成的组件代码中，所有代码注释必须使用英文`

## 📋 当前实现逻辑

### 扩写组件描述 (expand-description)
- ✅ 英文环境: 返回英文描述
- ✅ 中文环境: 返回中文描述
- ✅ 两种语言的提示词都已更新

### 需求分析整理 (refine-requirements)
- ✅ 英文环境: 返回英文JSON（包含英文需求描述、功能点等）
- ✅ 中文环境: 返回中文JSON（包含中文需求描述、功能点等）
- ✅ **两种语言的提示词都要求：生成的代码注释必须使用英文**

### 组件生成 (generate/component)
- ⚠️ 前端已传递language参数
- ❓ 远程服务器需要更新提示词（需要手动部署）

## 📝 项目规范依据

根据项目memory中的**代码注释规范**：

> **代码注释规范**：
> - 所有代码注释（单行、多行、JSDoc）必须使用英文
> - 注释应简洁明了，说明"为什么"而非"是什么"
> - 复杂逻辑必须添加英文注释说明
> - TODO/FIXME标记使用英文

因此，我们的实现是：**UI界面可以中英文切换，但生成的代码注释统一使用英文**。

## 🧪 测试验证

### 英文环境测试
1. 访问 `http://localhost:3000/`
2. 点击"AI Expand"扩写组件描述
3. ✅ 返回英文描述
4. 点击"生成组件"
5. 查看需求分析弹窗
6. ✅ refinedDescription为英文
7. ⚠️ 生成的代码注释应为英文（需要远程服务器配合）

### 中文环境测试
1. 点击Globe图标切换到 `/zh`
2. 点击"AI扩写"
3. ✅ 返回中文描述
4. 点击"生成组件"
5. 查看需求分析弹窗
6. ✅ refinedDescription为中文
7. ⚠️ 生成的代码注释仍应为英文（符合项目规范）

## 📖 相关文件

### 已修改的本地文件
- ✅ `functions/api/expand-description.ts` - 添加注释语言要求
- ✅ `functions/api/refine-requirements.ts` - 添加注释语言要求（中英文都要求英文注释）
- ✅ `src/store/useStore.ts` - 3个函数添加language参数

### 需要远程服务器更新
- ❓ 组件生成API的提示词模板（部署在 `ai-component-generator.pages.dev`）

### 文档
- `CODE_COMMENTS_I18N.md` - 完整的实现说明和远程服务器更新指南

## ✅ 核对结论

**本地实现**: ✅ 完整
- 扩写描述和需求分析API已添加注释语言要求
- 前端已正确传递语言参数
- 符合项目规范（代码注释统一使用英文）

**远程服务器**: ⚠️ 需要手动更新
- 组件生成API的提示词需要添加注释语言要求
- 需要按照 `CODE_COMMENTS_I18N.md` 中的示例更新提示词模板
