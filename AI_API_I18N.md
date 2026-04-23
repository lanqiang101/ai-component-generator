# AI API 国际化支持

## ✅ 修改内容

### 1. 前端API调用添加语言参数

修改了以下函数，在调用后端API时传递当前语言：

#### expandDescription (组件描述扩写)
- **文件**: `src/store/useStore.ts`
- **修改**: 添加 `language` 参数到请求体
- **逻辑**: 通过 `window.location.pathname.startsWith('/zh')` 判断当前语言

#### refineRequirements (需求分析整理)
- **文件**: `src/store/useStore.ts`
- **修改**: 添加 `language` 参数到请求体
- **逻辑**: 同上

#### startMultiFileGeneration (组件生成)
- **文件**: `src/store/useStore.ts`
- **修改**: 添加 `language` 参数到请求体
- **说明**: 组件生成API在远程服务器上，这里只负责传递语言参数

### 2. 后端API添加中英文提示词

#### expand-description.ts (扩写组件描述)
- **文件**: `functions/api/expand-description.ts`
- **修改**:
  - 接收 `language` 参数（默认 'en'）
  - 添加中英文两套提示词
  - 根据语言选择对应的提示词模板
- **中文提示词**: 要求AI用中文扩写需求描述
- **英文提示词**: 要求AI用英文扩写需求描述

#### refine-requirements.ts (需求分析整理)
- **文件**: `functions/api/refine-requirements.ts`
- **修改**:
  - 接收 `language` 参数（默认 'en'）
  - 添加中英文两套提示词
  - 错误提示也根据语言显示
  - 解析失败的默认消息也支持国际化
- **中文提示词**: 要求AI用中文返回JSON格式的需求分析
- **英文提示词**: 要求AI用英文返回JSON格式的需求分析

## 📋 修改的文件列表

1. `src/store/useStore.ts` - 添加language参数到3个API调用
2. `functions/api/expand-description.ts` - 添加中英文提示词支持
3. `functions/api/refine-requirements.ts` - 添加中英文提示词支持

## 🧪 测试方法

1. 访问 `http://localhost:3000/` （英文环境）
2. 在组件描述输入框输入简短描述
3. 点击 "AI Expand" 按钮
4. **预期结果**: 返回的描述应该是英文的

5. 点击右上角 Globe 图标切换到中文
6. URL变为 `http://localhost:3000/zh`
7. 在组件描述输入框输入简短描述
8. 点击 "AI扩写" 按钮
9. **预期结果**: 返回的描述应该是中文的

10. 点击"生成组件"按钮
11. 在需求整理弹窗中查看整理后的需求
12. **预期结果**: 
    - 英文环境: refinedDescription、features 等字段为英文
    - 中文环境: refinedDescription、features 等字段为中文

## 📝 技术细节

### 语言检测逻辑
```typescript
// 通过URL路径判断当前语言
const language = window.location.pathname.startsWith('/zh') ? 'zh' : 'en';
```

### API请求结构
```typescript
// expand-description
{
  description: string,
  componentName: string,
  language: 'en' | 'zh'  // 新增
}

// refine-requirements
{
  params: {...},
  language: 'en' | 'zh'  // 新增
}

// generate/component
{
  params: {...},
  language: 'en' | 'zh'  // 新增 (远程服务器需要支持)
}
```

### 提示词结构
每个API现在都有两套提示词：

```typescript
if (language === 'zh') {
  // 中文提示词
  return `你是...请用中文...`;
} else {
  // English prompt
  return `You are...Please use English...`;
}
```

## ⚠️ 注意事项

1. **组件生成API**: 该API部署在远程服务器（`ai-component-generator.pages.dev`），本地只传递language参数。远程服务器需要相应更新提示词逻辑。

2. **缓存问题**: Vite显示的 "Duplicate key 'desktop'" 警告是之前的缓存问题，代码已修复，不影响功能。

3. **默认语言**: 所有API默认语言为 'en'，确保在未检测到语言时不会出错。

## 📖 相关文件

- 前端语言状态管理: `src/i18n/index.tsx`
- 路由配置: `src/App.tsx`
- 翻译文件: `src/i18n/en.ts`, `src/i18n/zh.ts`