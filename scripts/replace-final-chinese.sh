#!/bin/bash

# Final comprehensive replacement for all remaining Chinese comments

echo "Starting FINAL comprehensive replacement..."

# LeftFormPanel.tsx
FILE="src/components/LeftFormPanel.tsx"
sed -i '' 's/组件参数/Component Params/g' "$FILE"
sed -i '' 's/展开高级选项/Expand Advanced Options/g' "$FILE"
sed -i '' 's/收起高级选项/Collapse Advanced Options/g' "$FILE"
sed -i '' 's/高级选项/Advanced Options/g' "$FILE"
sed -i '' 's/基本设置/Basic Settings/g' "$FILE"
sed -i '' 's/技术配置/Technical Configuration/g' "$FILE"
sed -i '' 's/表单验证/Form Validation/g' "$FILE"

# PreviewPanel.tsx
FILE="src/components/PreviewPanel.tsx"
sed -i '' 's/获取分辨率标签/Get resolution label/g' "$FILE"
sed -i '' 's/根据语言获取/Get based on language/g' "$FILE"
sed -i '' 's/设备尺寸/Device Size/g' "$FILE"
sed -i '' 's/分辨率选择/Resolution Selection/g' "$FILE"
sed -i '' 's/代码测试/Code Test/g' "$FILE"
sed -i '' 's/下载代码/Download Code/g' "$FILE"

# RequirementsRefinementDialog.tsx
FILE="src/components/RequirementsRefinementDialog.tsx"
sed -i '' 's/解析组件结构/Parse component structure/g' "$FILE"
sed -i '' 's/渲染原型图/Render prototype diagram/g' "$FILE"
sed -i '' 's/加载中/Loading/g' "$FILE"
sed -i '' 's/确认并生成/Confirm and Generate/g' "$FILE"

# HomePage.tsx
FILE="src/pages/HomePage.tsx"
sed -i '' 's/首页布局/Home Page Layout/g' "$FILE"
sed -i '' 's/头部/Header/g' "$FILE"
sed -i '' 's/主体/Body/g' "$FILE"

# useStore.ts - Additional replacements
FILE="src/store/useStore.ts"
sed -i '' 's/构建参数对象/Build params object/g' "$FILE"
sed -i '' 's/发送请求/Send request/g' "$FILE"
sed -i '' 's/处理响应/Handle response/g' "$FILE"
sed -i '' 's/解析JSON/Parse JSON/g' "$FILE"
sed -i '' 's/设置当前文件/Set current file/g' "$FILE"
sed -i '' 's/开始生成/Start generation/g' "$FILE"
sed -i '' 's/生成完成/Generation complete/g' "$FILE"

echo "FINAL replacement completed!"
