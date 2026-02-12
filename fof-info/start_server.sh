#!/bin/bash
cd "$(dirname "$0")"
echo "正在启动服务器..."
echo "访问地址: http://localhost:8888"
echo "按 Ctrl+C 停止服务器"
python3 server.py


