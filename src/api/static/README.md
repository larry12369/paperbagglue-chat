# 网站聊天组件集成指南

## 问题说明

您的网站后台"客服代码"输入框有**2000字符限制**，而完整的聊天组件代码约4000-5000字符，无法直接粘贴。

## 解决方案

采用**静态文件加载方案**：
1. 完整代码托管在Render服务的 `/static/chat-widget.js`
2. 网站后台只需粘贴一段**简短的引用代码**（约200字符）
3. 浏览器自动从Render加载完整组件

---

## 📋 操作步骤

### 第一步：获取引用代码

复制以下代码（约180字符）：

```javascript
(function(){
  var d=document,w=window,s=d.createElement('script'),h=d.getElementsByTagName('head')[0]||d.documentElement;
  s.async=true;
  s.src='https://paperbagglue-chat.onrender.com/static/chat-widget.js?v='+Date.now();
  s.charset='UTF-8';
  h.appendChild(s);
})();
