#!/usr/bin/env python3
"""
简单的HTTP服务器，支持CORS
"""
import http.server
import socketserver
import os
import socket

PORT = 8888

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[{self.log_date_time_string()}] {format % args}")

def get_local_ip():
    """获取本机在局域网中的IP地址"""
    try:
        # 连接到一个远程地址（不会实际发送数据）
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "无法获取IP地址"

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    local_ip = get_local_ip()
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("服务器已启动!")
        print("=" * 60)
        print(f"本地访问: http://localhost:{PORT}")
        print(f"手机访问: http://{local_ip}:{PORT}")
        print("=" * 60)
        print("提示: 确保手机和电脑连接到同一个WiFi网络")
        print("按 Ctrl+C 停止服务器")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")

