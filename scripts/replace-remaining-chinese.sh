#!/bin/bash

# Script to replace remaining Chinese comments in additional files

echo "Starting replacement of Chinese comments in additional files..."

# LeftFormPanel.tsx
FILE="src/components/LeftFormPanel.tsx"
sed -i '' 's/左侧表单面板组件/Left Form Panel Component/g' "$FILE"
sed -i '' 's/包含所有生成配置选项/Contains all generation configuration options/g' "$FILE"
sed -i '' 's/组件名称/Component Name/g' "$FILE"
sed -i '' 's/组件描述/Component Description/g' "$FILE"
sed -i '' 's/技术栈/Technology Stack/g' "$FILE"
sed -i '' 's/组件类型/Component Type/g' "$FILE"
sed -i '' 's/设计风格/Design Style/g' "$FILE"
sed -i '' 's/UI库/UI Library/g' "$FILE"
sed -i '' 's/样式预处理器/Style Preprocessor/g' "$FILE"
sed -i '' 's/额外需求/Additional Requirements/g' "$FILE"
sed -i '' 's/AI扩写/AI Expand/g' "$FILE"
sed -i '' 's/扩写中/Expanding/g' "$FILE"
sed -i '' 's/请输入组件名称/Please enter component name/g' "$FILE"
sed -i '' 's/请输入组件描述/Please enter component description/g' "$FILE"

# PreviewPanel.tsx
FILE="src/components/PreviewPanel.tsx"
sed -i '' 's/预览面板组件/Preview Panel Component/g' "$FILE"
sed -i '' 's/显示生成的代码和预览/Display generated code and preview/g' "$FILE"
sed -i '' 's/代码编辑器/Code Editor/g' "$FILE"
sed -i '' 's/实时预览/Live Preview/g' "$FILE"
sed -i '' 's/设备切换/Device Switch/g' "$FILE"
sed -i '' 's/全屏自适应/Fullscreen Adaptive/g' "$FILE"
sed -i '' 's/桌面/Desktop/g' "$FILE"
sed -i '' 's/平板/Tablet/g' "$FILE"
sed -i '' 's/手机/Mobile/g' "$FILE"

# RequirementsRefinementDialog.tsx
FILE="src/components/RequirementsRefinementDialog.tsx"
sed -i '' 's/需求整理对话框组件/Requirements Refinement Dialog Component/g' "$FILE"
sed -i '' 's/显示AI分析后的需求/Display AI-analyzed requirements/g' "$FILE"
sed -i '' 's/需求分析/Requirements Analysis/g' "$FILE"
sed -i '' 's/功能列表/Feature List/g' "$FILE"
sed -i '' 's/技术要点/Technical Notes/g' "$FILE"
sed -i '' 's/组件结构/Component Structure/g' "$FILE"
sed -i '' 's/布局原型/Layout Prototype/g' "$FILE"
sed -i '' 's/整理中/Refining/g' "$FILE"
sed -i '' 's/整理完成/Refinement Complete/g' "$FILE"

# ui-libraries.ts
FILE="src/constants/ui-libraries.ts"
sed -i '' 's/不使用/None/g' "$FILE"
sed -i '' 's/不使用任何UI库/No UI library/g' "$FILE"

# HomePage.tsx
FILE="src/pages/HomePage.tsx"
sed -i '' 's/首页组件/Home Page Component/g' "$FILE"
sed -i '' 's/主要布局/Main Layout/g' "$FILE"
sed -i '' 's/左侧表单/Left Form/g' "$FILE"
sed -i '' 's/右侧预览/Right Preview/g' "$FILE"

# useStore.ts
FILE="src/store/useStore.ts"
sed -i '' 's/状态管理Store/State Management Store/g' "$FILE"
sed -i '' 's/生成状态/Generation State/g' "$FILE"
sed -i '' 's/生成任务/Generation Task/g' "$FILE"
sed -i '' 's/需求整理/Requirements Refinement/g' "$FILE"
sed -i '' 's/组件生成/Component Generation/g' "$FILE"
sed -i '' 's/轮询状态/Polling Status/g' "$FILE"
sed -i '' 's/当前代码/Current Code/g' "$FILE"
sed -i '' 's/生成的文件/Generated Files/g' "$FILE"
sed -i '' 's/当前文件路径/Current File Path/g' "$FILE"

# index.ts (types)
FILE="src/types/index.ts"
sed -i '' 's/类型定义/Type Definitions/g' "$FILE"
sed -i '' 's/生成状态枚举/Generation Status Enum/g' "$FILE"
sed -i '' 's/生成任务接口/Generation Task Interface/g' "$FILE"
sed -i '' 's/生成进度接口/Generation Progress Interface/g' "$FILE"
sed -i '' 's/组件参数接口/Component Parameters Interface/g' "$FILE"

echo "Replacement completed!"
