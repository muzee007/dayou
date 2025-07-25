#!/bin/bash

echo "🚀 启动大有电厂管理平台..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "backend/app.py" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# 启动后端服务
echo "🔧 启动后端服务 (端口: 5000)..."
python app.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
echo "🌐 启动前端服务 (端口: 8000)..."
cd ../frontend
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ 大有电厂管理平台启动成功！"
echo ""
echo "📱 前端地址: http://localhost:8000"
echo "🔧 后端API: http://localhost:5000"
echo ""
echo "🔑 默认登录信息:"
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait 