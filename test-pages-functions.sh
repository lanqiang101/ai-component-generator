#!/bin/bash

# 测试 Cloudflare Pages Functions API
# 用法: 
#   bash test-pages-functions.sh           # 测试云端部署
#   bash test-pages-functions.sh local     # 测试本地调试

echo "========================================="
echo "测试 Pages Functions API"
echo "========================================="
echo ""

# 根据参数设置基础 URL
if [ "$1" = "local" ]; then
  BASE_URL="http://localhost:8788"
  echo "🔧 测试模式: 本地调试 (localhost:8788)"
else
  BASE_URL="https://4e2f0f62.ai-component-generator.pages.dev"
  echo "☁️  测试模式: 云端部署"
fi

echo "📡 目标 URL: ${BASE_URL}"
echo ""
echo "========================================="
echo ""

echo "1. 测试 /api/expand-description (扩展描述)"
echo "-----------------------------------------"
curl -X POST "${BASE_URL}/api/expand-description" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "商品卡片组件",
    "componentName": "ProductCard"
  }' | jq '.'

echo ""
echo ""

echo "2. 测试 /api/refine-requirements (需求整理)"
echo "-----------------------------------------"
curl -X POST "${BASE_URL}/api/refine-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "componentName": "商品卡片",
      "description": "电商商品展示卡片，包含图片、价格、标题",
      "framework": "react-tsx",
      "componentType": "card",
      "style": "minimal"
    }
  }' | jq '.'

echo ""
echo ""

echo "3. 测试 /api/generate (组件生成)"
echo "-----------------------------------------"
curl -X POST "${BASE_URL}/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "componentName": "CustomButton",
      "description": "一个蓝色的提交按钮",
      "framework": "react-tsx",
      "style": "minimal"
    }
  }' | jq '.'

echo ""
echo ""
echo "========================================="
echo "✅ 测试完成"
echo "========================================="
