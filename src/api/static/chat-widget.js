/**
 * 纸邦胶业智能客服聊天组件 - 高稳定性版
 * 优化离线问题，增强连接稳定性
 */
(function() {
  'use strict';

  // ==================== 配置 ====================
  const CONFIG = {
    API_URL: 'https://paperbagglue-chat-v1.fly.dev/api/chat',
    WIDGET_ID: 'chat-widget-container',
    AUTO_OPEN_DELAY: 3000, // 3秒后自动打开
    API_TIMEOUT: 30000, // 30秒超时（增加）
    KEEP_ALIVE_INTERVAL: 30 * 1000, // 30秒保持活跃（更频繁）
    HEALTH_CHECK_INTERVAL: 20 * 1000, // 20秒健康检查（更频繁）
    MAX_RETRIES: 5, // 最大重试次数（增加）
    RETRY_DELAY: 2000, // 重试延迟 2 秒
    VERSION: '3.0', // 版本号，用于强制刷新缓存
  };

  // 生成会话ID
  let sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  let isServiceAvailable = false;
  let keepAliveTimer = null;
  let healthCheckTimer = null;
  let connectionAttempts = 0;

  // ==================== 创建HTML结构 ====================
  function createWidgetHTML() {
    return `
      <div id="chat-widget-container">
        <!-- 聊天按钮 -->
        <button id="chat-toggle-btn" onclick="window.chatWidget.toggle()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
            <circle cx="9" cy="11" r="1.5" fill="#00A859"/>
            <circle cx="12" cy="11" r="1.5" fill="#00A859"/>
            <circle cx="15" cy="11" r="1.5" fill="#00A859"/>
          </svg>
          <span>Inquiry</span>
        </button>

        <!-- 聊天窗口 -->
        <div id="chat-window">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="chat-header-left">
              <img src="https://paperbagglue.com/wp-content/uploads/2025/01/logo.png" alt="Logo" class="chat-logo" onerror="this.style.display='none'">
              <div class="chat-header-info">
                <h3>Larry Chen</h3>
                <p class="online-status">● <span id="connection-status">Connecting...</span></p>
              </div>
            </div>
            <div class="chat-header-actions">
              <button class="close-btn" onclick="window.chatWidget.toggle()">×</button>
            </div>
          </div>

          <!-- 欢迎消息 -->
          <div id="welcome-message" class="message bot-message">
            <div class="message-content">
              <p>Hello 👋 I'm Larry.</p>
              <p>I recommend or customize adhesives based on your equipment and speed.</p>
              <p>Chat here or WhatsApp: +86 133-2327-3311</p>
            </div>
          </div>

          <!-- 消息区域 -->
          <div id="chat-messages" class="chat-messages"></div>

          <!-- 输入区域 -->
          <div class="chat-input-area">
            <textarea 
              id="chat-input" 
              placeholder="Type your message..." 
              rows="2"
            ></textarea>
            <button id="send-btn" onclick="window.chatWidget.send()" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== 创建CSS样式 ====================
  function createWidgetCSS() {
    return `
      <style>
        /* 聊天组件容器 */
        #chat-widget-container {
          position: fixed !important;
          bottom: 30px !important;
          right: 30px !important;
          z-index: 9999 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }

        /* 聊天按钮 */
        #chat-toggle-btn {
          position: fixed !important;
          bottom: 30px !important;
          right: 30px !important;
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #00A859 0%, #008F4D 100%) !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 4px 12px rgba(0, 168, 89, 0.4) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          z-index: 10000 !important;
        }

        #chat-toggle-btn:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 16px rgba(0, 168, 89, 0.5) !important;
        }

        #chat-toggle-btn span {
          color: white !important;
          font-size: 12px !important;
          margin-top: 2px !important;
          font-weight: 600 !important;
        }

        #chat-toggle-btn svg {
          width: 24px !important;
          height: 24px !important;
        }

        /* 聊天窗口 */
        #chat-window {
          position: fixed !important;
          bottom: 100px !important;
          right: 30px !important;
          width: 380px !important;
          height: 500px !important;
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
          display: none !important;
          flex-direction: column !important;
          z-index: 9999 !important;
          overflow: hidden !important;
        }

        #chat-window.active {
          display: flex !important;
          animation: slideIn 0.3s ease !important;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 聊天头部 */
        .chat-header {
          background: linear-gradient(135deg, #00A859 0%, #008F4D 100%) !important;
          color: white !important;
          padding: 8px 12px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }

        .chat-header-left {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .chat-logo {
          width: 28px !important;
          height: 28px !important;
          border-radius: 50% !important;
          background: white !important;
          padding: 2px !important;
          object-fit: contain !important;
        }

        .chat-header-info h3 {
          margin: 0 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }

        .online-status {
          margin: 0 !important;
          font-size: 10px !important;
          color: #ffffff !important;
          font-weight: 500 !important;
        }

        /* 头部右侧按钮容器 */
        .chat-header-actions {
          display: flex !important;
          align-items: center !important;
        }

        .close-btn {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-size: 24px !important;
          cursor: pointer !important;
          padding: 0 !important;
          width: 30px !important;
          height: 30px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          transition: background 0.2s !important;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        /* 消息区域 */
        .chat-messages {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 16px !important;
          background: #f9f9f9 !important;
        }

        /* 消息样式 */
        .message {
          margin-bottom: 12px !important;
          max-width: 85% !important;
          animation: fadeIn 0.3s ease !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bot-message {
          align-self: flex-start !important;
        }

        .user-message {
          align-self: flex-end !important;
          margin-left: auto !important;
        }

        .message-content {
          padding: 12px 16px !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          word-wrap: break-word !important;
        }

        .bot-message .message-content {
          background: white !important;
          color: #333 !important;
          border-bottom-left-radius: 4px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #00A859 0%, #008F4D 100%) !important;
          color: white !important;
          border-bottom-right-radius: 4px !important;
        }

        .message-content p {
          margin: 0 0 8px 0 !important;
        }

        .message-content p:last-child {
          margin: 0 !important;
        }

        /* 欢迎消息 */
        #welcome-message {
          margin-bottom: 16px !important;
        }

        /* 输入区域 */
        .chat-input-area {
          padding: 12px 16px !important;
          background: white !important;
          border-top: 1px solid #e8e8e8 !important;
          display: flex !important;
          gap: 8px !important;
          align-items: flex-end !important;
        }

        #upload-btn {
          display: none !important;
        }

        #chat-input {
          flex: 1 !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
          font-size: 14px !important;
          resize: none !important;
          outline: none !important;
          transition: border-color 0.2s !important;
          font-family: inherit !important;
          max-height: 100px !important;
        }

        #chat-input:focus {
          border-color: #00A859 !important;
        }

        #send-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 8px !important;
          background: linear-gradient(135deg, #00A859 0%, #008F4D 100%) !important;
          border: none !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
        }

        #send-btn:hover:not(:disabled) {
          transform: scale(1.05) !important;
          box-shadow: 0 2px 8px rgba(0, 168, 89, 0.4) !important;
        }

        #send-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* 滚动条样式 */
        .chat-messages::-webkit-scrollbar {
          width: 6px !important;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1 !important;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #ddd !important;
          border-radius: 3px !important;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #ccc !important;
        }

        /* 响应式设计 */
        @media (max-width: 480px) {
          #chat-window {
            width: 320px !important;
            height: 450px !important;
            bottom: 90px !important;
            right: 20px !important;
          }

          #chat-toggle-btn {
            bottom: 20px !important;
            right: 20px !important;
          }
        }
      </style>
    `;
  }

  // ==================== 功能函数 ====================

  // 增强的健康检查 - 带重试和指数退避
  async function healthCheck(retryCount = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retryCount; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

        // 使用 /health 端点（GET 请求）
        const healthUrl = CONFIG.API_URL.replace('/api/chat', '/health');
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache'
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'healthy') {
            isServiceAvailable = true;
            connectionAttempts = 0;
            updateConnectionStatus("We're Online");
            return true;
          }
        }
      } catch (error) {
        console.log(`Health check attempt ${i + 1}/${retryCount} failed:`, error.message);
        // 指数退避：等待时间逐渐增加
        if (i < retryCount - 1) {
          const waitTime = Math.min(1000 * Math.pow(2, i), 5000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // 所有尝试都失败
    isServiceAvailable = false;
    connectionAttempts++;
    updateConnectionStatus('Connecting...');
    
    // 如果连续失败超过 3 次，显示离线状态
    if (connectionAttempts >= 3) {
      updateConnectionStatus('Offline');
    }
    
    return false;
  }

  // 更新连接状态
  function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = status;
      
      if (status === "We're Online") {
        statusEl.style.color = '#ffffff';
      } else if (status === 'Offline') {
        statusEl.style.color = '#ffcccc';
      } else {
        statusEl.style.color = '#ffffff';
      }
    }
  }

  // 启动定期健康检查
  function startHealthCheck() {
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
    }
    
    // 立即执行一次
    healthCheck();
    
    // 每 20 秒检查一次
    healthCheckTimer = setInterval(() => {
      healthCheck();
    }, CONFIG.HEALTH_CHECK_INTERVAL);
  }

  // Keep-alive 定时器
  function startKeepAlive() {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
    }
    
    keepAliveTimer = setInterval(async () => {
      console.log('Keep-alive ping...');
      await healthCheck(2); // 保活时只重试 2 次
    }, CONFIG.KEEP_ALIVE_INTERVAL);
  }

  // 滚动到底部
  function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // 切换聊天窗口
  function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('chat-toggle-btn');

    if (chatWindow.classList.contains('active')) {
      chatWindow.classList.remove('active');
      toggleBtn.style.display = 'flex';
      
      // 关闭窗口时停止健康检查
      if (healthCheckTimer) {
        clearInterval(healthCheckTimer);
      }
    } else {
      chatWindow.classList.add('active');
      toggleBtn.style.display = 'none';

      setTimeout(() => {
        document.getElementById('chat-input').focus();
      }, 300);

      // 窗口打开时，启动健康检查
      startHealthCheck();
    }
  }

  // 显示输入提示
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  // 发送消息
  async function send() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    await sendText(message);
    input.value = '';
  }

  // 发送文本消息 - 增强重试机制
  async function sendText(message, retryCount = 0) {
    const input = document.getElementById('chat-input');
    
    input.disabled = true;
    document.getElementById('send-btn').disabled = true;

    if (retryCount === 0) {
      addMessage(message, 'user');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          session_id: sessionId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.response) {
        addMessage(data.response, 'bot');
        isServiceAvailable = true;
        connectionAttempts = 0;
        updateConnectionStatus("We're Online");
      } else {
        throw new Error('No response from server');
      }

    } catch (error) {
      console.error('Error:', error, 'Retry:', retryCount + 1, '/', CONFIG.MAX_RETRIES);

      // 如果还有重试机会，自动重试
      if (retryCount < CONFIG.MAX_RETRIES - 1) {
        // 指数退避
        const waitTime = Math.min(2000 * Math.pow(2, retryCount), 10000);
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return sendText(message, retryCount + 1);
      }

      // 所有重试都失败
      addMessage(`Sorry, the service is temporarily unavailable. This might be due to high traffic or the service is waking up.\n\nPlease try again in a moment, or contact me directly:\n\n📱 WhatsApp: +8613323273311\n📧 Email: LarryChen@paperbagglue.com`, 'bot');
      
      isServiceAvailable = false;
      connectionAttempts++;
      updateConnectionStatus('Offline');
    } finally {
      input.disabled = false;
      document.getElementById('send-btn').disabled = true;
      input.focus();
    }
  }

  // 添加消息
  function addMessage(content, type) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const processedContent = processMessageContent(content);
    contentDiv.innerHTML = processedContent;

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    scrollToBottom();
  }

  // 处理消息内容
  function processMessageContent(content) {
    let processed = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 处理换行
    processed = processed.replace(/\n/g, '<br>');

    // 处理链接
    processed = processed.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" style="color: #00A859; text-decoration: underline;">$1</a>'
    );

    // 处理 WhatsApp 号码
    processed = processed.replace(
      /(\+86[\d\s\-]{10,})/g,
      '<a href="https://wa.me/$1" target="_blank" style="color: #00A859; text-decoration: underline;">$1</a>'
    );

    return processed;
  }

  // 监听输入
  function setupInputListeners() {
    const input = document.getElementById('chat-input');
    if (input) {
      input.addEventListener('keydown', handleKeyDown);
      input.addEventListener('input', function() {
        const sendBtn = document.getElementById('send-btn');
        sendBtn.disabled = !this.value.trim();
      });
    }
  }

  // 初始化组件
  function init() {
    // 创建 HTML 结构
    const widgetHTML = createWidgetHTML();
    const widgetCSS = createWidgetCSS();
    
    // 插入到页面
    document.head.insertAdjacentHTML('beforeend', widgetCSS);
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // 设置输入监听
    setupInputListeners();

    // 启动保活
    startKeepAlive();

    // 暴露到全局
    window.chatWidget = {
      toggle: toggleChat,
      send: send
    };

    console.log('Chat Widget initialized (v' + CONFIG.VERSION + ')');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
