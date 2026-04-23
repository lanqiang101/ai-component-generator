#!/bin/bash

# Script to replace remaining Chinese comments in frontend component files

echo "Starting replacement of Chinese comments in component files..."

# CodeEditorPanel.tsx
FILE="src/components/CodeEditorPanel.tsx"
sed -i '' 's/代码编辑器组件/Code Editor Component/g' "$FILE"
sed -i '' 's/显示生成的代码/Display generated code/g' "$FILE"
sed -i '' 's/支持语法高亮/Support syntax highlighting/g' "$FILE"
sed -i '' 's/代码复制功能/Code copy functionality/g' "$FILE"
sed -i '' 's/复制成功/Copied successfully/g' "$FILE"
sed -i '' 's/复制到剪贴板/Copy to clipboard/g' "$FILE"
sed -i '' 's/复制失败/Copy failed/g' "$FILE"

# FileTreeViewer.tsx
FILE="src/components/FileTreeViewer.tsx"
sed -i '' 's/文件树查看器组件/File Tree Viewer Component/g' "$FILE"
sed -i '' 's/显示多文件组件的文件结构/Display file structure of multi-file components/g' "$FILE"
sed -i '' 's/支持文件夹展开\/折叠/Support folder expand\/collapse/g' "$FILE"
sed -i '' 's/点击文件切换查看/Click file to switch view/g' "$FILE"
sed -i '' 's/文件树/File Tree/g' "$FILE"
sed -i '' 's/文件夹/Folder/g' "$FILE"
sed -i '' 's/文件/File/g' "$FILE"
sed -i '' 's/展开/Expand/g' "$FILE"
sed -i '' 's/折叠/Collapse/g' "$FILE"

# GenerateButton.tsx
FILE="src/components/GenerateButton.tsx"
sed -i '' 's/生成按钮组件/Generate Button Component/g' "$FILE"
sed -i '' 's/触发组件生成流程/Trigger component generation process/g' "$FILE"
sed -i '' 's/生成组件/Generate Component/g' "$FILE"
sed -i '' 's/正在生成/Generating/g' "$FILE"
sed -i '' 's/需求分析/Requirements Analysis/g' "$FILE"
sed -i '' 's/生成中/Generating/g' "$FILE"

# GenerationProgress.tsx
FILE="src/components/GenerationProgress.tsx"
sed -i '' 's/生成进度组件/Generation Progress Component/g' "$FILE"
sed -i '' 's/显示多文件生成的进度/Display progress of multi-file generation/g' "$FILE"
sed -i '' 's/当前步骤/Current Step/g' "$FILE"
sed -i '' 's/总步骤/Total Steps/g' "$FILE"
sed -i '' 's/生成进度/Generation Progress/g' "$FILE"
sed -i '' 's/正在生成/Generating/g' "$FILE"
sed -i '' 's/已完成/Completed/g' "$FILE"
sed -i '' 's/失败/Failed/g' "$FILE"
sed -i '' 's/生成完成/Generation Complete/g' "$FILE"

echo "Replacement completed!"
