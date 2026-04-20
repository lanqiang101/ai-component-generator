#!/bin/bash

# AI Component Generator - 带代理启动脚本
# 使用方法：
#   chmod +x start-with-proxy.sh
#   ./start-with-proxy.sh

echo "🚀 AI Component Generator - 带代理启动"
echo ""

# 默认代理地址（Clash）
DEFAULT_PROXY="http://127.0.0.1:7890"

# 检查是否传入了代理地址
if [ -n "$1" ]; then
  PROXY_URL=$1
else
  PROXY_URL=$DEFAULT_PROXY
  echo "⚠️  未指定代理地址，使用默认: $PROXY_URL"
  echo "💡 如需使用其他代理，请运行: ./start-with-proxy.sh http://your-proxy:port"
fi

echo ""
echo "📡 配置代理..."
export http_proxy=$PROXY_URL
export https_proxy=$PROXY_URL

echo "✅ http_proxy=$http_proxy"
echo "✅ https_proxy=$https_proxy"
echo ""

echo "🧪 测试 Worker 连接..."
node test-worker.js

echo ""
echo "🎯 启动开发服务器..."
npm run dev
