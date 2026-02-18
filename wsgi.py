"""
WSGI entry point for PythonAnywhere deployment
PythonAnywhere 部署的 WSGI 入口文件

This file is used by PythonAnywhere to start the Flask application.
PythonAnywhere 使用此文件启动 Flask 应用。
"""

import os
import sys

# 添加项目根目录到 Python 路径
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 设置工作目录
os.chdir(project_root)

# 导入 Flask 应用
from src.api.app import app as application

# 应用程序现在可以通过 'application' 变量访问
# PythonAnywhere 将使用此变量来启动 WSGI 应用

if __name__ == '__main__':
    # 本地开发时使用
    application.run(debug=False)
