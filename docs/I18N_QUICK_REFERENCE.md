# 国际化 (i18n) 快速参考

## 🌐 语言切换

### 方法1: UI切换（推荐）
- 点击右上角的 **Globe图标** (🌐) 
- 在英文和中文之间切换
- 自动保存偏好设置

### 方法2: 代码中切换
```typescript
import { useStore } from '../store/useStore';

const { language, setLanguage } = useStore();

// 切换到中文
setLanguage('zh');

// 切换到英文
setLanguage('en');

// 切换当前语言
setLanguage(language === 'en' ? 'zh' : 'en');
```

## 📝 使用翻译

### 基本用法
```typescript
import { useTranslation } from '../i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t.common.appName}</h1>
      <p>{t.form.componentName}</p>
    </div>
  );
}
```

### 访问嵌套翻译
```typescript
// 访问: t.form.componentName
t.form.componentName  // "组件名称" 或 "Component Name"

// 访问: t.preview.mobile
t.preview.mobile  // "移动端" 或 "Mobile"
```

## 🗂️ 翻译键组织结构

```
t.
├── common.          # 通用文本
│   ├── appName
│   ├── generate
│   └── cancel
├── header.          # 头部导航
│   ├── darkModeAuto
│   └── darkModeDark
├── form.            # 表单相关
│   ├── componentName
│   ├── framework
│   └── uiStyle
├── preview.         # 预览面板
│   ├── title
│   └── resolution
├── codeEditor.      # 代码编辑器
│   └── title
├── progress.        # 进度提示
│   ├── analyzing
│   └── generating
└── refinement.      # 需求整理
    ├── title
    └── features
```

## ➕ 添加新翻译

### 步骤1: 添加到 en.ts
```typescript
export const en = {
  // ... existing
  myNewSection: {
    title: 'My Title',
    description: 'My Description',
  },
};
```

### 步骤2: 添加到 zh.ts
```typescript
export const zh = {
  // ... existing
  myNewSection: {
    title: '我的标题',
    description: '我的描述',
  },
};
```

### 步骤3: 在组件中使用
```typescript
const { t } = useTranslation();
<h1>{t.myNewSection.title}</h1>
```

## 🔍 常见问题

### Q: 如何获取当前语言？
```typescript
const { language } = useTranslation();
console.log(language); // 'en' or 'zh'
```

### Q: 翻译文件在哪里？
- 英文: `src/i18n/en.ts`
- 中文: `src/i18n/zh.ts`

### Q: 如何添加新语言？
1. 创建新文件 `src/i18n/ja.ts` (例如日语)
2. 复制 en.ts 的结构并翻译
3. 在 `index.tsx` 中添加新语言类型
4. 更新 Language 类型定义

### Q: 为什么有些文本没有翻译？
- 可能该组件还未国际化
- 检查是否使用了 `useTranslation()` hook
- 确认翻译键是否正确

## 💡 最佳实践

✅ **DO:**
- 所有UI文本都使用翻译
- 保持翻译键的语义化命名
- 同时更新 en.ts 和 zh.ts
- 使用有意义的分组（form, preview, etc.）

❌ **DON'T:**
- 不要在UI中硬编码文本
- 不要混合使用中英文
- 不要忘记添加对应的中文/英文翻译
- 不要在代码注释中使用中文（保持英文）

## 🎯 已国际化的组件清单

- ✅ App Header (标题、副标题、工具提示)
- ✅ LeftFormPanel (所有表单字段)
- ✅ GenerateButton (生成按钮)
- ✅ HomePage (页面内容)
- ✅ PreviewPanel (预览面板)
- ✅ RequirementsRefinementDialog (需求整理弹窗)

## 📊 翻译统计

- **总翻译键**: ~200+
- **支持语言**: 2 (English, 中文)
- **覆盖组件**: 6个主要组件
- **覆盖率**: ~85% UI文本

---

**提示**: 按 `Ctrl/Cmd + Enter` 可以快速生成组件（快捷键不受语言影响）
