# 快速开始指南

## 5分钟快速集成到你的网站

### 第1步：启动后端服务（2分钟）

```bash
# 进入项目目录
cd /workspace/projects

# 启动服务
bash scripts/start_server.sh
```

服务将在 `http://localhost:5000` 启动

### 第2步：选择集成方式（2分钟）

#### 方式A：完整聊天页面

1. 复制 `src/web/chat-widget.html` 到你的网站
2. 修改API地址：将 `const API_BASE_URL = 'http://localhost:5000'` 改为你的服务器地址
3. 在网站中添加链接：`<a href="/chat.html">💬 Chat with Us</a>`

#### 方式B：嵌入式小部件（推荐）

1. 复制 `src/web/chat-widget.js` 到你的网站
2. 在HTML页面中添加：

```html
<!-- 在</body>标签前添加 -->
<script src="/js/chat-widget.js"></script>
<script>
  const chatWidget = new ChatWidget({
    apiUrl: 'http://your-api-url.com'  // 改为你的API地址
  });
</script>
```

### 第3步：测试（1分钟）

1. 打开你的网站
2. 点击聊天按钮
3. 发送消息测试

### 完整示例

查看 `src/web/example-website.html` 了解完整的集成示例

## 生产环境部署

详细的部署说明请查看 [WEBSITE_INTEGRATION.md](./WEBSITE_INTEGRATION.md)

## 常见问题

**Q: 如何修改API地址？**

A: 在 `chat-widget.js` 或 `chat-widget.html` 中修改 `apiUrl` 或 `API_BASE_URL`

**Q: 如何自定义颜色？**

A: 在 `chat-widget.js` 中搜索 `#667eea` 和 `#764ba2`，替换为你喜欢的颜色

**Q: 流式响应不工作？**

A: 确保你的反向代理（如Nginx）配置了 `proxy_buffering off`

## 技术支持

遇到问题？查看 [WEBSITE_INTEGRATION.md](./WEBSITE_INTEGRATION.md) 获取详细文档
