# PythonAnywhere 快速部署清单

## ✅ 部署前检查清单

- [ ] 已注册 PythonAnywhere 账号
- [ ] 项目代码已准备完整
- [ ] `wsgi.py` 文件已创建
- [ ] `requirements-pythonanywhere.txt` 文件已准备
- [ ] 所有环境变量已从 Render 复制

---

## 🚀 部署步骤（按顺序执行）

### 第 1 步：上传代码（5 分钟）

```bash
# 在本地压缩项目
zip -r project.zip . -x "*.pyc" "__pycache__/*" ".git/*" "venv/*"

# 在 PythonAnywhere 控制台解压
cd /home/yourusername
# 上传 project.zip
unzip project.zip
```

---

### 第 2 步：创建 Web 应用（2 分钟）

1. 进入 PythonAnywhere "Web" 标签
2. 点击 "Add a new web app"
3. 选择 Flask → Python 3.12 → 应用路径 `/`

---

### 第 3 步：安装依赖（10-15 分钟）

```bash
# 激活虚拟环境
source /home/yourusername/.virtualenvs/myproject/bin/activate

# 安装依赖
pip install -r requirements-pythonanywhere.txt
```

---

### 第 4 步：配置 WSGI 文件（1 分钟）

编辑 `/var/www/yourusername_pythonanywhere_com_wsgi.py`：

```python
import sys
import os

project_home = '/home/yourusername'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

os.chdir(project_home)

from wsgi import app as application
```

---

### 第 5 步：配置环境变量（5 分钟）

在 PythonAnywhere "Web" → "Environment variables" 中添加：

```
COZE_WORKSPACE_PATH=/home/yourusername
COZE_INTEGRATION_MODEL_BASE_URL=your_base_url
COZE_WORKLOAD_IDENTITY_API_KEY=your_api_key
COZE_BUCKET_ENDPOINT_URL=your_endpoint_url
COZE_BUCKET_NAME=your_bucket_name
```

---

### 第 6 步：配置静态文件（1 分钟）

在 PythonAnywhere "Web" → "Static files" 中添加：

```
URL: /static/
Directory: /home/yourusername/src/api/static/
```

---

### 第 7 步：重载应用（1 分钟）

在 PythonAnywhere "Web" 标签点击 "Reload" 按钮

---

## 🧪 测试清单

- [ ] 访问 `https://yourusername.pythonanywhere.com/health` 返回健康状态
- [ ] 访问 `https://yourusername.pythonanywhere.com/` 显示网站首页
- [ ] 测试聊天功能是否正常工作
- [ ] 测试图片上传功能（可选）

---

## 🔧 更新网站配置

在网站 CMS 中更新聊天组件脚本：

```html
<script src="https://yourusername.pythonanywhere.com/static/chat-widget.js"></script>
```

---

## 📊 性能对比

| 指标 | Render | PythonAnywhere |
|------|--------|----------------|
| 响应速度 | 1-2 秒 | 500ms-1s ✅ |
| 冷启动 | 50+ 秒 | 无需冷启动 ✅ |
| 24/7 运行 | ❌ 休眠 | ✅ 是 |
| 月成本 | $0 | $0 |

---

## 💡 提示

1. **首次安装依赖可能需要 10-15 分钟**，请耐心等待
2. 如果遇到错误，检查 PythonAnywhere 的 `error.log` 日志
3. 免费版 CPU 时间有限，建议优化代码减少 CPU 使用
4. 如需更多资源，可升级到付费版（$5/月起）

---

## 🆘 遇到问题？

1. **ModuleNotFoundError**：重新安装依赖 `pip install -r requirements-pythonanywhere.txt`
2. **环境变量未生效**：重载应用并检查变量名称拼写
3. **应用启动失败**：检查 `error.log` 查看详细错误信息

---

## 📚 相关文档

- 详细部署指南：`PYTHONANYWHERE_DEPLOYMENT_GUIDE.md`
- PythonAnywhere 官方文档：https://help.pythonanywhere.com

---

*预计总耗时：25-30 分钟*
