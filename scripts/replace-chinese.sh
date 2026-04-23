#!/bin/bash

# Script to replace Chinese comments in server/index.js with English

FILE="server/index.js"

# Backup the original file
cp "$FILE" "${FILE}.backup"

echo "Starting replacement of Chinese comments in $FILE..."

# Common patterns to replace
# Format: sed -i '' 's/中文/English/g' $FILE

# Comments about variables and declarations
sed -i '' 's/声明 process 变量/Declare process variable/g' "$FILE"

# API route comments
sed -i '' 's/AI 生成组件 API/AI Component Generation API/g' "$FILE"
sed -i '' 's/前端获取模型配置，发送完整的model参数给后端，后端做API代理/Frontend fetches model configuration, sends complete model params to backend, backend acts as API proxy/g' "$FILE"

# Error messages and console logs
sed -i '' 's/缺少参数/Missing parameters/g' "$FILE"
sed -i '' 's/生成失败/Generation failed/g' "$FILE"
sed -i '' 's/清理后的代码长度/Length of cleaned code/g' "$FILE"
sed -i '' 's/代码前100字符/First 100 characters of code/g' "$FILE"

# Multi-file generation comments
sed -i '' 's/多文件组件化生成 API/Multi-file Component Generation API/g' "$FILE"
sed -i '' 's/内存存储生成任务/In-memory storage for generation tasks/g' "$FILE"
sed -i '' 's/生产环境应使用 Redis\/数据库/Use Redis\/database in production/g' "$FILE"
sed -i '' 's/启动多文件生成任务/Start multi-file generation task/g' "$FILE"
sed -i '' 's/🚀 启动多文件生成任务/🚀 Starting multi-file generation task/g' "$FILE"
sed -i '' 's/分析组件架构/Analyze component architecture/g' "$FILE"
sed -i '' 's/创建任务ID/Create task ID/g' "$FILE"
sed -i '' 's/初始化任务/Initialize task/g' "$FILE"
sed -i '' 's/异步执行生成/Execute generation asynchronously/g' "$FILE"
sed -i '' 's/❌ 生成任务失败/❌ Generation task failed/g' "$FILE"
sed -i '' 's/生成任务已启动/Generation task started/g' "$FILE"
sed -i '' 's/启动生成任务失败/Failed to start generation task/g' "$FILE"

# Task status endpoints
sed -i '' 's/查询任务状态/Query task status/g' "$FILE"
sed -i '' 's/任务不存在/Task not found/g' "$FILE"
sed -i '' 's/获取所有生成的文件/Get all generated files/g' "$FILE"
sed -i '' 's/任务未完成或不存在/Task not completed or not found/g' "$FILE"

# Internal functions
sed -i '' 's/内部函数: 分析组件架构/Internal function: Analyze component architecture/g' "$FILE"
sed -i '' 's/⚠️ 固定使用多文件生成模式/⚠️ Always use multi-file generation mode/g' "$FILE"
sed -i '' 's/确保至少生成 2 个文件/Ensure at least 2 files are generated/g' "$FILE"
sed -i '' 's/如果 AI 未返回子组件，自动生成一个默认子组件/If AI does not return sub-components, auto-generate a default sub-component/g' "$FILE"
sed -i '' 's/组件主要内容区域/Main content area of component/g' "$FILE"
sed -i '' 's/✅ 架构分析完成/✅ Architecture analysis completed/g' "$FILE"
sed -i '' 's/⚠️ 架构分析失败,使用默认多文件模式/⚠️ Architecture analysis failed, using default multi-file mode/g' "$FILE"

# Multi-file generation execution
sed -i '' 's/内部函数: 执行多文件生成/Internal function: Execute multi-file generation/g' "$FILE"
sed -i '' 's/📦 开始执行多文件生成/📦 Starting multi-file generation/g' "$FILE"
sed -i '' 's/现在只有多文件模式，移除单文件模式判断/Now only multi-file mode, removed single-file mode check/g' "$FILE"
sed -i '' 's/多文件模式:逐个生成/Multi-file mode: generate one by one/g' "$FILE"

# File generation steps
sed -i '' 's/生成工具函数/Generate utility functions/g' "$FILE"
sed -i '' 's/验证代码完整性/Validate code completeness/g' "$FILE"
sed -i '' 's/⚠️ 工具函数.*代码不完整/⚠️ Utility function code incomplete/g' "$FILE"
sed -i '' 's/生成子组件/Generate sub-components/g' "$FILE"
sed -i '' 's/按优先级排序/Sort by priority/g' "$FILE"
sed -i '' 's/⚠️ 子组件.*代码不完整/⚠️ Sub-component code incomplete/g' "$FILE"
sed -i '' 's/生成主组件/Generate main component/g' "$FILE"
sed -i '' 's/⚠️ 主组件代码不完整/⚠️ Main component code incomplete/g' "$FILE"

# Progress and completion
sed -i '' 's/✅ 多文件生成完成/✅ Multi-file generation completed/g' "$FILE"
sed -i '' 's/个文件/files/g' "$FILE"

# Helper functions
sed -i '' 's/辅助函数: 更新任务进度/Helper function: Update task progress/g' "$FILE"
sed -i '' 's/辅助函数: 保存文件/Helper function: Save file/g' "$FILE"
sed -i '' 's/辅助函数: 清洗代码/Helper function: Clean code/g' "$FILE"
sed -i '' 's/移除 Markdown 标记/Remove Markdown markers/g' "$FILE"
sed -i '' 's/移除结束标记/Remove end markers/g' "$FILE"
sed -i '' 's/自动修复条件样式语法错误（新增）/Auto-fix conditional style syntax errors (NEW)/g' "$FILE"
sed -i '' 's/修复/ Fix/g' "$FILE"
sed -i '' 's/不完整的三元表达式/Incomplete ternary expression/g' "$FILE"
sed -i '' 's/嵌套属性访问的完整三元表达式/Complete ternary expression with nested property access/g' "$FILE"
sed -i '' 's/嵌套属性访问的不完整三元表达式/Incomplete ternary expression with nested property access/g' "$FILE"

# UI Library mappings
sed -i '' 's/不使用（原生）/None (Native)/g' "$FILE"

# Function comments
sed -i '' 's/调用 AI API/Call AI API/g' "$FILE"
sed -i '' 's/模型配置/Model configuration/g' "$FILE"
sed -i '' 's/可以是 params 对象或 prompt 字符串/Can be params object or prompt string/g' "$FILE"
sed -i '' 's/AI 生成的内容/AI generated content/g' "$FILE"
sed -i '' 's/统一通过 Pages Functions 代理,避免直接调用 Worker 的网络问题/Proxy through Pages Functions to avoid network issues with direct Worker calls/g' "$FILE"

# API call logs
sed -i '' 's/🤖 调用 AI API/🤖 Calling AI API/g' "$FILE"
sed -i '' 's/模式/Mode/g' "$FILE"
sed -i '' 's/传递/Passing/g' "$FILE"
sed -i '' 's/构建标准的 Chat API 请求格式/Build standard Chat API request format/g' "$FILE"
sed -i '' 's/调用 Pages Functions/Call Pages Functions/g' "$FILE"
sed -i '' 's/❌ AI API 调用失败/❌ AI API call failed/g' "$FILE"
sed -i '' 's/AI 服务调用失败/AI service call failed/g' "$FILE"

# Requirements refinement API
sed -i '' 's/AI 需求整理 API/AI Requirements Refinement API/g' "$FILE"
sed -i '' 's/缺少参数/Missing parameters/g' "$FILE"
sed -i '' 's/直接代理到 Pages Functions/Directly proxy to Pages Functions/g' "$FILE"
sed -i '' 's/🤖 代理需求整理请求到 Pages Functions/🤖 Proxying requirements refinement request to Pages Functions/g' "$FILE"
sed -i '' 's/Pages Functions 请求失败/Pages Functions request failed/g' "$FILE"
sed -i '' 's/需求整理失败/Requirements refinement failed/g' "$FILE"

# Expand description API
sed -i '' 's/AI 扩写组件描述 API/AI Expand Component Description API/g' "$FILE"
sed -i '' 's/缺少描述内容/Missing description content/g' "$FILE"
sed -i '' 's/🤖 代理扩写请求到 Pages Functions/🤖 Proxying expand request to Pages Functions/g' "$FILE"
sed -i '' 's/扩写失败/Expansion failed/g' "$FILE"

echo "Replacement completed! Check ${FILE}.backup for the original version."
