#!/bin/bash

# Comprehensive script to replace ALL remaining Chinese comments

echo "Starting COMPREHENSIVE replacement of Chinese comments..."

# useStore.ts - Most important file
FILE="src/store/useStore.ts"

# Helper functions section
sed -i '' 's/辅助函数/Helper Functions/g' "$FILE"
sed -i '' 's/在 store 外部定义/Defined outside store/g' "$FILE"

# analyzeComponentComplexity function
sed -i '' 's/根据需求分析结果判断组件复杂度/Determine component complexity based on requirements analysis/g' "$FILE"
sed -i '' 's/复杂组件/Complex Component/g' "$FILE"
sed -i '' 's/简单组件/Simple Component/g' "$FILE"
sed -i '' 's/默认使用单文件/Default to single file/g' "$FILE"

# Comments inside functions
sed -i '' 's/判断标准/Criteria/g' "$FILE"
sed -i '' 's/功能点数量/Feature count/g' "$FILE"
sed -i '' 's/技术要点包含/Technical notes contain/g' "$FILE"
sed -i '' 's/组件结构描述中包含多个文件或模块/Component structure description contains multiple files or modules/g' "$FILE"

# Scoring rules
sed -i '' 's/评分规则/Scoring Rule/g' "$FILE"
sed -i '' 's/技术要点关键词/Technical Notes Keywords/g' "$FILE"
sed -i '' 's/组件结构描述长度和关键词/Component Structure Description Length and Keywords/g' "$FILE"

# Complexity threshold
sed -i '' 's/复杂度评分/Complexity Score/g' "$FILE"
sed -i '' 's/总分/Total Score/g' "$FILE"
sed -i '' 's/判定为复杂组件/Determined as complex component/g' "$FILE"

# generateSimpleComponent function
sed -i '' 's/生成简单组件/Generate Simple Component/g' "$FILE"
sed -i '' 's/开始生成简单组件/Starting to generate simple component/g' "$FILE"
sed -i '' 's/构建增强的参数/Build enhanced params/g' "$FILE"

# More comments to replace
sed -i '' 's/调用AI生成/Call AI to generate/g' "$FILE"
sed -i '' 's/检查代码完整性/Check code completeness/g' "$FILE"
sed -i '' 's/代码不完整，尝试重试/Code incomplete, attempting retry/g' "$FILE"
sed -i '' 's/代码完整，退出循环/Code complete, exit loop/g' "$FILE"
sed -i '' 's/生成失败/Generation failed/g' "$FILE"
sed -i '' 's/更新状态/Update state/g' "$FILE"

# generateMultiFileComponent function
sed -i '' 's/生成复杂组件/Generate Complex Component/g' "$FILE"
sed -i '' 's/启动多文件生成任务/Start multi-file generation task/g' "$FILE"
sed -i '' 's/轮询任务状态/Poll task status/g' "$FILE"
sed -i '' 's/任务完成/Task completed/g' "$FILE"
sed -i '' 's/任务失败/Task failed/g' "$FILE"
sed -i '' 's/获取所有文件/Get all files/g' "$FILE"
sed -i '' 's/更新store/Update store/g' "$FILE"

# expandDescription function
sed -i '' 's/扩写组件描述/Expand Component Description/g' "$FILE"
sed -i '' 's/调用扩写/Call expansion/g' "$FILE"

# refineRequirements function  
sed -i '' 's/整理需求分析/Refine Requirements Analysis/g' "$FILE"
sed -i '' 's/调用需求整理/Call requirements refinement/g' "$FILE"

# generateComponent function
sed -i '' 's/生成组件主函数/Generate Component Main Function/g' "$FILE"
sed -i '' 's/重置状态/Reset state/g' "$FILE"
sed -i '' 's/第一步/First Step/g' "$FILE"
sed -i '' 's/需求整理/Requirements Refinement/g' "$FILE"
sed -i '' 's/判断组件复杂度/Determine component complexity/g' "$FILE"
sed -i '' 's/复杂组件，使用多文件生成/Complex component, use multi-file generation/g' "$FILE"
sed -i '' 's/简单组件，使用单文件生成/Simple component, use single-file generation/g' "$FILE"

# Polling function
sed -i '' 's/轮询函数/Polling Function/g' "$FILE"
sed -i '' 's/开始轮询/Start polling/g' "$FILE"
sed -i '' 's/停止轮询/Stop polling/g' "$FILE"
sed -i '' 's/轮询间隔/Polling interval/g' "$FILE"

# Reset functions
sed -i '' 's/重置生成状态/Reset generation state/g' "$FILE"
sed -i '' 's/清除错误/Clear error/g' "$FILE"

echo "COMPREHENSIVE replacement completed!"
