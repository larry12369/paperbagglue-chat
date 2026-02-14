# 客服智能体网站集成指南

本指南将帮助你将客服智能体集成到你的网站中。

## 📋 目录

- [快速开始](#快速开始)
- [部署后端服务](#部署后端服务)
- [集成到网站](#集成到网站)
- [API接口说明](#api接口说明)
- [配置选项](#配置选项)
- [常见问题](#常见问题)

## 🚀 快速开始

### 方案1：使用完整页面（推荐用于独立聊天页面）

1. **复制文件到你的网站**

   将 `src/web/chat-widget.html` 复制到你的网站目录中，例如：`/chat.html`

2. **修改API地址**

   打开 `chat.html`，找到以下行并修改API地址：
   ```javascript
   const API_BASE_URL = 'http://localhost:5000'; // 修改为你的API地址
   ```

3. **在网站中添加链接**

   在你的网站导航栏或页面中添加链接：
   ```html
   <a href="/chat.html">💬 Chat with Us</a>
   ```

### 方案2：使用嵌入式小部件（推荐用于现有页面）

1. **复制JavaScript文件**

   将 `src/web/chat-widget.js` 复制到你的网站目录中，例如：`/js/chat-widget.js`

2. **在你的HTML页面中引入**

   在你的网站HTML页面的 `</body>` 标签前添加：
   ```html
   <script src="/js/chat-widget.js"></script>
   <script>
     // 初始化聊天小部件
     const chatWidget = new ChatWidget({
       apiUrl: 'http://your-api-url.com'  // 修改为你的API地址
     });
   </script>
   ```

3. **自定义样式（可选）**

   你可以通过修改 `chat-widget.js` 中的样式来调整外观。

## 🖥️ 部署后端服务

### 方案1：本地开发环境

1. **启动后端服务**

   ```bash
   cd /workspace/projects
   python3 -m src.api.app
   ```

2. **访问测试**

   打开浏览器访问：`http://localhost:5000/health`
   
   应该看到：
   ```json
   {
     "status": "healthy",
     "agent_loaded": true
   }
   ```

### 方案2：生产环境部署（推荐）

#### 使用Docker部署

1. **创建Dockerfile**

   在项目根目录创建 `Dockerfile`：

   ```dockerfile
   FROM python:3.12-slim

   WORKDIR /app

   # 安装依赖
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # 复制源代码
   COPY src/ ./src/
   COPY config/ ./config/

   # 暴露端口
   EXPOSE 5000

   # 启动服务
   CMD ["python3", "-m", "src.api.app"]
   ```

2. **构建Docker镜像**

   ```bash
   docker build -t paperbagglue-chat .
   ```

3. **运行容器**

   ```bash
   docker run -d \
     -p 5000:5000 \
     -e COZE_WORKLOAD_IDENTITY_API_KEY=your_api_key \
     -e COZE_INTEGRATION_MODEL_BASE_URL=your_base_url \
     -e COZE_WORKSPACE_PATH=/app \
     paperbagglue-chat
   ```

#### 使用云服务器部署（AWS/阿里云/腾讯云）

1. **上传代码到服务器**

   ```bash
   scp -r /workspace/projects/* user@your-server:/path/to/app/
   ```

2. **安装依赖**

   ```bash
   ssh user@your-server
   cd /path/to/app
   pip install -r requirements.txt
   ```

3. **使用Gunicorn部署（生产环境推荐）**

   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 src.api.app:app
   ```

4. **使用Nginx反向代理（可选但推荐）**

   创建Nginx配置文件 `/etc/nginx/sites-available/chat`：

   ```nginx
   server {
       listen 80;
       server_name chat.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           
           # SSE支持
           proxy_buffering off;
           proxy_cache off;
           proxy_read_timeout 86400;
       }
   }
   ```

   启用配置：
   ```bash
   sudo ln -s /etc/nginx/sites-available/chat /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 📡 API接口说明

### 1. 健康检查

**端点**: `GET /health`

**响应**:
```json
{
  "status": "healthy",
  "agent_loaded": true
}
```

### 2. 普通聊天（非流式）

**端点**: `POST /api/chat`

**请求体**:
```json
{
  "message": "I need adhesive for paper bags",
  "session_id": "optional-session-id",
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**响应**:
```json
{
  "response": "Perfect! 🎯 For your...",
  "session_id": "session-1234567890"
}
```

### 3. 流式聊天（推荐）

**端点**: `POST /api/chat/stream`

**请求体**: 同上

**响应**: SSE流式响应

事件格式：
```
data: {"content": "Perfect!", "done": false}
data: {"content": " 🎯 For your...", "done": false}
data: {"content": "", "done": true, "session_id": "session-1234567890"}
```

### 4. 获取配置信息

**端点**: `GET /api/config`

**响应**:
```json
{
  "model": "doubao-seed-1-6-251015",
  "company_info": {
    "website": "www.paperbagglue.com",
    "whatsapp": "+8613323273311",
    "email": "LarryChen@paperbagglue.com"
  }
}
```

## ⚙️ 配置选项

### 环境变量

| 变量名 | 说明 | 必填 | 默认值 |
|-------|------|------|--------|
| `PORT` | 服务端口 | 否 | 5000 |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | API密钥 | 是 | - |
| `COZE_INTEGRATION_MODEL_BASE_URL` | 模型API地址 | 是 | - |
| `COZE_WORKSPACE_PATH` | 工作目录路径 | 否 | `/workspace/projects` |

### JavaScript配置选项

```javascript
const chatWidget = new ChatWidget({
  apiUrl: 'http://your-api-url.com',  // API地址
  // 未来可扩展的选项
  // theme: 'light',  // 主题
  // position: 'right',  // 位置
  // welcomeMessage: 'Hello!'  // 欢迎消息
});
```

## 🎨 自定义样式

### 修改主题颜色

在 `chat-widget.js` 中搜索 `#667eea` 和 `#764ba2`，替换为你喜欢的颜色。

例如，改为蓝色主题：
```javascript
// 将这两行
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// 改为
background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
```

### 修改聊天窗口大小

在 `.pbglue-chat-window` CSS类中修改：
```css
.pbglue-chat-window {
    width: 380px;  /* 修改宽度 */
    height: 550px;  /* 修改高度 */
}
```

## ❓ 常见问题

### Q1: 聊天窗口显示"Failed to send message"

**原因**: API地址配置错误或后端服务未启动。

**解决**:
1. 检查 `API_BASE_URL` 或 `apiUrl` 配置是否正确
2. 确认后端服务正在运行：访问 `http://your-api-url.com/health`
3. 检查浏览器控制台是否有CORS错误

### Q2: 流式响应不工作

**原因**: Nginx或反向代理缓存了SSE响应。

**解决**: 确保Nginx配置中包含：
```nginx
proxy_buffering off;
proxy_cache off;
proxy_read_timeout 86400;
```

### Q3: 如何隐藏聊天按钮，手动触发打开？

**修改**:
```javascript
// 初始化时不显示按钮
const chatWidget = new ChatWidget({ apiUrl: '...' });

// 隐藏按钮
document.querySelector('.pbglue-chat-button').style.display = 'none';

// 在你想要的地方打开聊天窗口
chatWidget.openChat();
```

### Q4: 如何修改欢迎消息？

在 `chat-widget.js` 或 `chat-widget.html` 中找到欢迎消息部分并修改：

```javascript
// 在 chat-widget.js 中
this.addMessage('assistant', 'Your custom welcome message!');
```

### Q5: 如何添加客户信息收集表单？

你可以修改聊天流程，在对话开始时询问客户信息：

```javascript
// 在初始化时添加
this.customerInfo = {
    name: '',
    email: '',
    phone: ''
};

// 在发送消息时包含客户信息
body: JSON.stringify({
    message: message,
    session_id: this.sessionId,
    customer_info: this.customerInfo
})
```

## 🔒 安全建议

1. **使用HTTPS**: 在生产环境中始终使用HTTPS
2. **API密钥保护**: 不要在前端代码中暴露API密钥
3. **速率限制**: 在Nginx或后端添加请求速率限制
4. **输入验证**: 在后端验证所有用户输入
5. **CORS配置**: 限制允许的域名来源

## 📞 技术支持

如果遇到问题，请检查：
1. 后端服务日志
2. 浏览器控制台错误
3. 网络请求状态

## 📝 更新日志

- **v1.0.0** (2024)
  - 初始版本发布
  - 支持流式响应
  - 支持嵌入式小部件
  - 支持完整聊天页面

---

**祝你部署顺利！** 🎉
