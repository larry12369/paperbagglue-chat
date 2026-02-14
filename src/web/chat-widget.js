/**
 * Paper Bag Glue Chat Widget
 * 可嵌入的聊天小部件
 * 
 * 使用方法：
 * 1. 在HTML中引入此脚本
 * 2. 初始化: new ChatWidget({ apiUrl: 'http://your-api-url.com' });
 */

class ChatWidget {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'http://localhost:5000';
        this.sessionId = this.getSessionId();
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        
        this.init();
    }

    getSessionId() {
        let sessionId = localStorage.getItem('pbglue_chat_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pbglue_chat_session_id', sessionId);
        }
        return sessionId;
    }

    init() {
        // Create widget container
        this.createWidget();
        
        // Add styles
        this.addStyles();
        
        // Add event listeners
        this.addEventListeners();
    }

    createWidget() {
        // Chat button
        this.chatButton = document.createElement('div');
        this.chatButton.className = 'pbglue-chat-button';
        this.chatButton.innerHTML = `
            <div class="pbglue-chat-icon">💬</div>
            <div class="pbglue-chat-badge">1</div>
        `;
        document.body.appendChild(this.chatButton);

        // Chat window
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'pbglue-chat-window';
        this.chatWindow.innerHTML = `
            <div class="pbglue-chat-header">
                <div class="pbglue-header-info">
                    <h3>💬 Chat with Us</h3>
                    <p>Online • Usually replies in 1 minute</p>
                </div>
                <button class="pbglue-close-button">×</button>
            </div>
            <div class="pbglue-chat-messages"></div>
            <div class="pbglue-chat-input">
                <input type="text" placeholder="Type your message..." autocomplete="off">
                <button class="pbglue-send-button" disabled>➤</button>
            </div>
        `;
        document.body.appendChild(this.chatWindow);

        // Get elements
        this.messagesContainer = this.chatWindow.querySelector('.pbglue-chat-messages');
        this.inputField = this.chatWindow.querySelector('input');
        this.sendButton = this.chatWindow.querySelector('.pbglue-send-button');
        this.closeButton = this.chatWindow.querySelector('.pbglue-close-button');

        // Add welcome message
        this.addMessage('assistant', 'Hello! 👋 How can I help you today?');
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pbglue-chat-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                z-index: 10000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .pbglue-chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
            }

            .pbglue-chat-icon {
                font-size: 28px;
                color: white;
            }

            .pbglue-chat-badge {
                position: absolute;
                top: 0;
                right: 0;
                width: 20px;
                height: 20px;
                background: #ff4757;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: white;
                font-weight: bold;
            }

            .pbglue-chat-badge.show {
                display: flex;
            }

            .pbglue-chat-window {
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: pbglueSlideUp 0.3s ease;
            }

            @keyframes pbglueSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .pbglue-chat-window.open {
                display: flex;
            }

            .pbglue-chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pbglue-header-info h3 {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .pbglue-header-info p {
                font-size: 12px;
                opacity: 0.9;
            }

            .pbglue-close-button {
                background: none;
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .pbglue-close-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .pbglue-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f8f9fa;
            }

            .pbglue-message {
                display: flex;
                margin-bottom: 12px;
                animation: pbglueFadeIn 0.3s ease;
            }

            @keyframes pbglueFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .pbglue-message.user {
                justify-content: flex-end;
            }

            .pbglue-message.assistant {
                justify-content: flex-start;
            }

            .pbglue-message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.5;
                word-wrap: break-word;
            }

            .pbglue-message.user .pbglue-message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .pbglue-message.assistant .pbglue-message-content {
                background: white;
                color: #333;
                border-bottom-left-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .pbglue-message.assistant .pbglue-message-content a {
                color: #667eea;
                text-decoration: none;
            }

            .pbglue-message.assistant .pbglue-message-content a:hover {
                text-decoration: underline;
            }

            .pbglue-typing-indicator {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 18px;
                border-bottom-left-radius: 4px;
                width: fit-content;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                margin-bottom: 12px;
            }

            .pbglue-typing-indicator span {
                width: 8px;
                height: 8px;
                background: #667eea;
                border-radius: 50%;
                animation: pbglueTyping 1.4s infinite;
            }

            .pbglue-typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .pbglue-typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes pbglueTyping {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }

            .pbglue-chat-input {
                padding: 16px;
                background: white;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
            }

            .pbglue-chat-input input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 25px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s;
            }

            .pbglue-chat-input input:focus {
                border-color: #667eea;
            }

            .pbglue-send-button {
                width: 45px;
                height: 45px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .pbglue-send-button:hover:not(:disabled) {
                transform: scale(1.1);
            }

            .pbglue-send-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }

            /* Scrollbar */
            .pbglue-chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .pbglue-chat-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .pbglue-chat-messages::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }

            /* Mobile */
            @media (max-width: 480px) {
                .pbglue-chat-window {
                    width: calc(100% - 40px);
                    right: 20px;
                    left: 20px;
                    bottom: 90px;
                    height: calc(100vh - 130px);
                }

                .pbglue-chat-button {
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addEventListeners() {
        // Toggle chat window
        this.chatButton.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.closeChat());

        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input field
        this.inputField.addEventListener('input', () => {
            this.sendButton.disabled = this.inputField.value.trim() === '';
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.chatWindow.classList.add('open');
        this.inputField.focus();
    }

    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.remove('open');
    }

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `pbglue-message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'pbglue-message-content';
        contentDiv.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.messages.push({ role, content });
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert line breaks to <br>
        let formatted = text.replace(/\n/g, '<br>');
        
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s<]+)/g;
        formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        return formatted;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'pbglue-typing-indicator';
        typingDiv.id = 'pbglueTypingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('pbglueTypingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message || this.isTyping) return;

        // Clear input
        this.inputField.value = '';
        this.sendButton.disabled = true;

        // Add user message
        this.addMessage('user', message);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to API (streaming)
            const response = await fetch(`${this.apiUrl}/api/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';
            let messageAdded = false;

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.error) {
                            this.hideTypingIndicator();
                            this.addMessage('assistant', 'Sorry, an error occurred. Please try again.');
                            return;
                        }

                        if (data.content) {
                            assistantMessage += data.content;
                            
                            if (!messageAdded) {
                                this.hideTypingIndicator();
                                // Create assistant message element
                                const messageDiv = document.createElement('div');
                                messageDiv.className = 'pbglue-message assistant';
                                const contentDiv = document.createElement('div');
                                contentDiv.className = 'pbglue-message-content';
                                contentDiv.id = 'pbglueCurrentAssistantMessage';
                                messageDiv.appendChild(contentDiv);
                                this.messagesContainer.appendChild(messageDiv);
                                messageAdded = true;
                            }
                            
                            // Update message content
                            document.getElementById('pbglueCurrentAssistantMessage').innerHTML = 
                                this.formatMessage(assistantMessage);
                            this.scrollToBottom();
                        }

                        if (data.done) {
                            this.hideTypingIndicator();
                            if (messageAdded) {
                                document.getElementById('pbglueCurrentAssistantMessage').removeAttribute('id');
                            }
                            return;
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again later.');
        }
    }
}

// Auto-initialize if on page
if (typeof window !== 'undefined') {
    window.ChatWidget = ChatWidget;
}
