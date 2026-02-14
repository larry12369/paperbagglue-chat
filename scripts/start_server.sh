#!/bin/bash

# Paper Bag Glue Chat Agent - 启动脚本

echo "🚀 Starting Paper Bag Glue Chat Agent..."
echo ""

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.12 or later."
    exit 1
fi

# 检查依赖
echo "📦 Checking dependencies..."
pip install -q flask flask-cors 2>&1 | grep -v "WARNING"

# 检查配置文件
if [ ! -f "config/agent_llm_config.json" ]; then
    echo "❌ Configuration file not found: config/agent_llm_config.json"
    exit 1
fi

# 设置环境变量（如果需要）
export COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
export PORT="${PORT:-5000}"

echo "✅ Dependencies installed"
echo "✅ Configuration found"
echo ""

# 启动服务
echo "🌐 Starting server on port $PORT..."
echo "   Health check: http://localhost:$PORT/health"
echo "   Chat API:     http://localhost:$PORT/api/chat"
echo "   Stream API:   http://localhost:$PORT/api/chat/stream"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m src.api.app
