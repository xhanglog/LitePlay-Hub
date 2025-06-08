#!/usr/bin/env python3
"""
简易HTTP服务器，用于本地运行LitePlay Hub游戏网站
避免CORS (跨域资源共享) 问题
"""

import http.server
import socketserver
import os
import webbrowser
from urllib.parse import quote

# 配置服务器端口
PORT = 8000

# 获取当前目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 自定义处理程序，添加CORS头
class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()

# 创建服务器
Handler = CORSHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

# 打印服务器信息
print(f"服务器启动在 http://localhost:{PORT}")
print("按 Ctrl+C 停止服务器")

# 自动在浏览器中打开网站
url = f"http://localhost:{PORT}/index.html"
print(f"正在打开浏览器访问 {url}")
webbrowser.open(url)

# 启动服务器
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n服务器已停止")
    httpd.server_close() 