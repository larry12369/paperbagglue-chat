# PythonAnywhere 部署指南

## 📋 目录
- [准备工作](#准备工作)
- [注册 PythonAnywhere 账号](#注册-pythonanywhere-账号)
- [上传代码](#上传代码)
- [配置 Web 应用](#配置-web-应用)
- [配置环境变量](#配置环境变量)
- [配置静态文件](#配置静态文件)
- [启动应用](#启动应用)
- [测试部署](#测试部署)
- [常见问题](#常见问题)

---

## 准备工作

### 需要的文件

确保您的项目包含以下文件：

```
project/
├── wsgi.py                        # WSGI 入口文件（必需）
├── requirements-pythonanywhere.txt # Python 依赖（必需）
├── config/
│   └── agent_llm_config.json      # Agent 配置
├── src/
│   ├── api/
│   │   ├── app.py                 # Flask 应用
│   │   └── static/
│   │       └── chat-widget.js     # 聊天组件
│   ├── agents/
│   │   └── agent.py               # Agent 逻辑
│   ├── storage/
│   │   ├── database/
│   │   ├── memory/
│   │   │   └── memory_saver.py    # 记忆存储
│   │   └── s3/
│   ├── tools/
│   └── utils/
```

### 压缩项目文件

在本地将项目文件压缩为 zip 文件：

```bash
# Windows
# 右键项目文件夹 -> 发送到 -> 压缩(zipped)文件夹

# macOS/Linux
zip -r project.zip project/
```

**注意**：不要包含以下文件/文件夹：
- `__pycache__/`
- `.git/`
- `*.pyc`
- `node_modules/`
- `venv/`
- `.env`（环境变量将在 PythonAnywhere 控制台配置）

---

## 注册 PythonAnywhere 账号

1. 访问 [https://www.pythonanywhere.com](https://www.pythonanywhere.com)
2. 点击 "Create a free account"
3. 填写注册信息：
   - Username（用户名，将成为子域名的一部分）
   - Email
   - Password
4. 完成注册并登录

---

## 上传代码

### 方法 1：使用 Web 界面上传（推荐新手）

1. 登录 PythonAnywhere
2. 进入 "Files" 标签页
3. 点击 "Upload a file"
4. 选择之前压缩的 `project.zip` 文件
5. 上传完成后，在控制台解压：

```bash
cd /home/yourusername
unzip project.zip
mv project/* .
rmdir project
rm project.zip
```

### 方法 2：使用 Git（推荐有 Git 经验的开发者）

```bash
# 在 PythonAnywhere 控制台
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
```

---

## 配置 Web 应用

### 1. 创建 Web 应用

1. 进入 "Web" 标签页
2. 点击 "Add a new web app"
3. 选择 "Flask"
4. 选择 "Python 3.12"（推荐）或 "Python 3.11"
5. 设置应用路径（默认为 `/`，即根路径）
6. PythonAnywhere 会自动创建虚拟环境

### 2. 配置 WSGI 文件

1. 在 "Web" 标签页，找到 "Code" 部分
2. 点击 "WSGI configuration file" 链接
3. 替换文件内容为：

```python
import sys
import os

# 添加项目根目录到 Python 路径
project_home = '/home/yourusername'  # 替换为您的用户名
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# 切换到项目目录
os.chdir(project_home)

# 导入 Flask 应用
from wsgi import app as application
```

4. 保存文件

### 3. 安装依赖

1. 在 "Web" 标签页，找到 "Virtualenv" 部分
2. 记下虚拟环境的路径，例如：`/home/yourusername/.virtualenvs/myproject`
3. 在 "Bash" 控制台中激活虚拟环境并安装依赖：

```bash
# 激活虚拟环境
source /home/yourusername/.virtualenvs/myproject/bin/activate

# 安装依赖
pip install -r requirements-pythonanywhere.txt

# 查看已安装的包
pip list
```

**注意**：安装可能需要几分钟时间，特别是对于包含 LangChain 等大型依赖的项目。

---

## 配置环境变量

### 1. 打开环境变量配置

1. 在 "Web" 标签页，向下滚动到 "Environment variables" 部分
2. 点击 "Add a new variable"

### 2. 添加必要的环境变量

您需要添加以下环境变量（根据您的实际情况填写）：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_WORKSPACE_PATH` | 项目根目录 | `/home/yourusername` |
| `COZE_INTEGRATION_MODEL_BASE_URL` | 模型 API 基础 URL | 从 Coze 获取 |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | API 密钥 | 从 Coze 获取 |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | 从 Coze 获取 |
| `COZE_BUCKET_NAME` | 存储桶名称 | 从 Coze 获取 |
| `FEISHU_BASE_TOKEN` | 飞书 Base Token | 可选 |
| `FEISHU_TABLE_ID` | 飞书表格 ID | 可选 |

### 3. 获取环境变量的值

#### 从当前部署平台（Render）获取

如果您之前部署在 Render，可以从 Render 控制台复制环境变量：

1. 登录 Render
2. 进入您的项目
3. 点击 "Environment" 标签
4. 复制所有必要的环境变量

#### 从 Coze 平台获取

如果需要创建新的集成：

1. 访问 Coze 平台
2. 创建新的集成（如：大模型、对象存储）
3. 获取 API 密钥和端点 URL

---

## 配置静态文件

### 1. 配置静态文件路径

1. 在 "Web" 标签页，找到 "Static files" 部分
2. 点击 "Add a new mapping"

添加以下映射：

| URL directory | Directory |
|---------------|-----------|
| `/static/` | `/home/yourusername/src/api/static/` |

### 2. 配置媒体文件（可选）

如果有图片上传功能，可以添加：

| URL directory | Directory |
|---------------|-----------|
| `/media/` | `/home/yourusername/media/` |

---

## 启动应用

### 1. 重载 Web 应用

1. 在 "Web" 标签页顶部
2. 点击 "Reload" 按钮
3. 等待几秒钟让应用重新加载

### 2. 检查日志

1. 在 "Web" 标签页，向下滚动到 "Log files" 部分
2. 查看日志文件：
   - `error.log` - 错误日志
   - `user.log` - 用户日志
   - `server.log` - 服务器日志

### 3. 常见启动问题

**问题 1：ModuleNotFoundError**

```
ModuleNotFoundError: No module named 'langchain'
```

**解决方案**：
```bash
# 重新激活虚拟环境
source /home/yourusername/.virtualenvs/myproject/bin/activate

# 重新安装依赖
pip install -r requirements-pythonanywhere.txt
```

**问题 2：配置文件找不到**

```
FileNotFoundError: config/agent_llm_config.json
```

**解决方案**：
确保 `config/agent_llm_config.json` 文件存在于项目根目录，并且设置了正确的环境变量：
```
COZE_WORKSPACE_PATH=/home/yourusername
```

**问题 3：环境变量未生效**

**解决方案**：
1. 在 "Web" 标签页重新加载应用
2. 确保环境变量名称拼写正确
3. 检查环境变量值是否正确

---

## 测试部署

### 1. 测试健康检查

访问您的应用 URL（格式：`https://yourusername.pythonanywhere.com/health`）

**预期响应**：
```json
{
  "status": "healthy",
  "agent_loaded": true
}
```

### 2. 测试聊天接口

使用 curl 或 Postman 测试：

```bash
curl -X POST https://yourusername.pythonanywhere.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, Larry!",
    "session_id": "test-session-001"
  }'
```

**预期响应**：
```json
{
  "response": "Hello! I am Larry, your AI assistant...",
  "session_id": "test-session-001"
}
```

### 3. 测试流式聊天

```bash
curl -X POST https://yourusername.pythonanywhere.com/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about your company",
    "session_id": "test-session-002"
  }'
```

**预期响应**：
```
data: {"content": "Hello", "done": false}

data: {"content": "!", "done": false}

data: {"content": "", "done": true, "session_id": "test-session-002"}
```

### 4. 测试前端页面

访问您的应用根 URL：`https://yourusername.pythonanywhere.com/`

应该能看到您的网站首页。

---

## 更新网站中的聊天组件

### 1. 更新脚本 URL

在您网站的 CMS 中，将聊天组件脚本的 URL 更新为新的 PythonAnywhere 地址：

```html
<!-- 旧的 Render 地址 -->
<script src="https://your-app.onrender.com/static/chat-widget.js"></script>

<!-- 新的 PythonAnywhere 地址 -->
<script src="https://yourusername.pythonanywhere.com/static/chat-widget.js"></script>
```

### 2. 更新 API URL

在 `src/api/static/chat-widget.js` 中，确保 API URL 正确：

```javascript
const API_BASE_URL = 'https://yourusername.pythonanywhere.com';
```

如果使用相对路径（推荐），则无需修改：

```javascript
const API_BASE_URL = window.location.origin;
```

---

## 性能优化

### 1. 免费版限制

PythonAnywhere 免费版的限制：
- CPU 时间：每月约 3-4 小时
- 内存：512MB
- 磁盘空间：512MB
- 数据流量：无限

### 2. 优化建议

1. **减少不必要的日志输出**
   ```python
   # 在生产环境中设置日志级别为 WARNING 或 ERROR
   logging.basicConfig(level=logging.WARNING)
   ```

2. **缓存常见查询**
   ```python
   from functools import lru_cache

   @lru_cache(maxsize=100)
   def get_cached_response(query):
       # ...
   ```

3. **使用数据库连接池**
   ```python
   from psycopg_pool import ConnectionPool

   pool = ConnectionPool(conninfo="...")
   ```

---

## 常见问题

### Q1: 免费版会休眠吗？

**A**: PythonAnywhere 免费版 **不会休眠**，应用会 24/7 运行。但 CPU 时间有限，如果超出限制，应用可能会变慢。

### Q2: 如何绑定自定义域名？

**A**: 
1. 在 PythonAnywhere "Web" 页面添加自定义域名
2. 在您的域名 DNS 设置中添加 CNAME 记录：
   ```
   www.yourdomain.com -> yourusername.pythonanywhere.com
   ```
3. PythonAnywhere 会自动提供 SSL 证书

### Q3: 如何升级到付费版？

**A**:
1. 进入 "Account" 标签
2. 选择 "Account settings"
3. 点击 "Upgrade"
4. 选择适合的计划（$5/月起）

付费版提供：
- 更多 CPU 时间
- 更多内存
- 更快的响应速度
- 无域名限制

### Q4: 如何查看当前 CPU 使用情况？

**A**:
1. 进入 "Web" 标签页
2. 查看 "CPU usage" 部分
3. 免费版会显示剩余的 CPU 时间

### Q5: 应用启动失败怎么办？

**A**:
1. 检查 `error.log` 日志文件
2. 确保所有依赖都已安装
3. 确保环境变量配置正确
4. 尝试在控制台手动运行：
   ```bash
   python3 wsgi.py
   ```

### Q6: 如何备份数据？

**A**:
1. 定期下载静态文件和配置
2. 使用 Git 保存代码版本
3. 如果使用数据库，定期导出数据

---

## 📞 获取帮助

- PythonAnywhere 官方文档：[https://help.pythonanywhere.com](https://help.pythonanywhere.com)
- PythonAnywhere 论坛：[https://www.pythonanywhere.com/forums](https://www.pythonanywhere.com/forums)
- Flask 文档：[https://flask.palletsprojects.com](https://flask.palletsprojects.com)

---

## 🎉 部署成功！

恭喜！您已成功将聊天后端部署到 PythonAnywhere。

**下一步**：
1. 测试所有功能
2. 更新网站中的聊天组件 URL
3. 监控应用性能和日志
4. 根据需要升级到付费版

---

## 📊 PythonAnywhere vs Render 对比

| 特性 | PythonAnywhere | Render |
|------|---------------|--------|
| **价格** | 免费版可用 | 免费版可用 |
| **24/7 运行** | ✅ 是 | ⚠️ 休眠 |
| **冷启动** | ✅ 无需冷启动 | ❌ 50+ 秒 |
| **响应速度** | 500ms-1s | 1-2 秒 |
| **CPU 时间** | 每月 3-4 小时 | 每月 750 小时 |
| **内存** | 512MB | 512MB |
| **自定义域名** | ✅ 支持 | ✅ 支持 |
| **SSL 证书** | ✅ 自动 | ✅ 自动 |

**结论**：
- 如果需要 **24/7 运行且响应快**：选择 PythonAnywhere
- 如果 CPU 使用量大：选择 Render（但会有冷启动）

---

*最后更新：2025年*
