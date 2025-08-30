// =====================================================
// PROFESSIONAL CHAT WIDGET - Customer Support Integration
// =====================================================
// Real-time chat support for HR Management System landing page
// Features:
// ✓ Real-time messaging simulation
// ✓ Professional UI/UX design
// ✓ Quick response suggestions
// ✓ Typing indicators and animations
// ✓ Mobile responsive design
// ✓ Integration with backend support system
// =====================================================

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.conversationId = null;
        this.customerInfo = {
            name: null,
            email: null,
            phone: null
        };
        this.messageQueue = [];
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.generateConversationId();
        this.loadSavedConversation();
        this.showWelcomeMessage();
    }

    generateConversationId() {
        this.conversationId = 'CONV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    bindEvents() {
        // Chat toggle
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        // Chat close button (update from chatMinimize to closeChat)
        const closeChat = document.getElementById('closeChat');
        if (closeChat) {
            closeChat.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        // Chat form submission
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        } else {
            // Alternative: listen for send button if no form
            const sendBtn = document.querySelector('.chat-send-btn');
            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    this.sendMessage();
                });
            }
        }

        // Input events (update to use actual input class)
        const chatInput = document.querySelector('.customer-chat-input .chat-input') || document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                this.toggleSendButton();
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const message = e.target.getAttribute('data-message');
                this.sendMessage(message);
            }
        });

        // Emoji button (optional)
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                this.showEmojiPicker();
            });
        }

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            const chatWidget = document.getElementById('chatWidget');
            if (chatWidget && !chatWidget.contains(e.target) && this.isOpen) {
                // Don't auto-close for better UX
                // this.toggleChat();
            }
        });
    }
            if (!chatWidget.contains(e.target) && this.isOpen) {
                // Don't auto-close for better UX
                // this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatPanel = document.getElementById('chatPanel');
        const chatToggle = document.getElementById('chatToggle');
        const chatIcon = chatToggle?.querySelector('.material-icons-round');
        const notification = document.getElementById('chatNotificationBadge');

        if (!chatPanel || !chatToggle) {
            console.warn('Chat elements not found');
            return;
        }

        if (this.isOpen) {
            chatPanel.classList.add('open');
            chatToggle.classList.add('active');
            if (notification) {
                notification.style.display = 'none';
            }
            
            // Focus input
            setTimeout(() => {
                const input = document.querySelector('.customer-chat-input .chat-input');
                if (input) {
                    input.focus();
                }
            }, 300);
            
            // Mark messages as read
            this.markMessagesAsRead();
        } else {
            chatPanel.classList.remove('open');
            chatToggle.classList.remove('active');
        }
    }

    async sendMessage(messageText = null) {
        const input = document.querySelector('.customer-chat-input .chat-input') || document.getElementById('chatInput');
        const text = messageText || (input ? input.value.trim() : '');
        
        if (!text) return;

        // Add user message
        this.addMessage(text, 'user');
        
        // Clear input
        if (input) {
            input.value = '';
        }
        this.toggleSendButton();
        
        // Hide suggestions after first message
        this.hideSuggestions();
        
        try {
            // If this is the first message and no conversation exists, create one
            if (!this.conversationId) {
                // Collect customer info if not available
                if (!this.customerInfo.name || !this.customerInfo.email) {
                    await this.collectCustomerInfo();
                    if (!this.customerInfo.name || !this.customerInfo.email) {
                        return; // User cancelled info collection
                    }
                }
                
                console.log('Creating new support conversation...');
                const conversation = await utils.createSupportConversation(
                    this.customerInfo.name,
                    this.customerInfo.email,
                    text
                );
                
                this.conversationId = conversation.id || conversation.conversationId;
                console.log('New conversation created:', this.conversationId);
                
                // Save conversation info
                this.saveConversationData();
                
                // Show confirmation message
                setTimeout(() => {
                    this.addMessage('Cảm ơn bạn đã liên hệ! Chúng tôi đã ghi nhận yêu cầu của bạn và sẽ phản hồi sớm nhất có thể.', 'agent');
                }, 1000);
                
            } else {
                // Send message to existing conversation
                console.log('Sending message to conversation:', this.conversationId);
                await utils.sendSupportMessage(this.conversationId, text, false);
                
                // Show typing indicator and simulate response
                this.showTypingIndicator();
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addMessage('Tin nhắn của bạn đã được ghi nhận. Nhân viên hỗ trợ sẽ phản hồi sớm.', 'agent');
                }, 2000);
            }
            
            // Save to conversation
            this.saveMessageToBackend(text, 'customer');
            
        } catch (error) {
            console.error('Error sending message to support system:', error);
            // Fallback to simulation if API fails
            this.simulateAgentResponse(text);
        }
    }

    addMessage(text, sender, timestamp = null) {
        const messagesContainer = document.getElementById('customerMessages') || document.getElementById('chatMessages');
        if (!messagesContainer) {
            console.warn('Messages container not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'sent' : 'received'}`;
        
        const time = timestamp || this.formatTime(new Date());
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.formatMessageText(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">CS</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">Hỗ trợ khách hàng</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${this.formatMessageText(text)}</div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessageText(text) {
        // Basic text formatting
        return text
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    simulateAgentResponse(userMessage) {
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate thinking time
        const responseTime = Math.random() * 2000 + 1000; // 1-3 seconds
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const response = this.generateResponse(userMessage);
            this.addMessage(response, 'agent');
            
            // Save agent response to backend
            this.saveMessageToBackend(response, 'agent');
            
            // Show notification if chat is closed
            if (!this.isOpen) {
                this.showNotification();
            }
        }, responseTime);
    }

    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Smart response generation based on keywords
        if (message.includes('hệ thống') || message.includes('hr') || message.includes('quản lý')) {
            return 'Hệ thống HR của chúng tôi bao gồm các tính năng: quản lý nhân viên, chấm công thông minh, tính lương tự động, và báo cáo chi tiết. Bạn có muốn tôi giải thích chi tiết về tính năng nào không?';
        }
        
        if (message.includes('đăng ký') || message.includes('tài khoản')) {
            return 'Để đăng ký tài khoản, bạn có thể nhấp vào nút "Đăng nhập" ở góc trên cùng và chọn "Đăng ký". Bạn sẽ cần cung cấp thông tin cơ bản và email để xác thực. Tôi có thể hướng dẫn bạn từng bước không?';
        }
        
        if (message.includes('giá') || message.includes('phí') || message.includes('cost')) {
            return 'Chúng tôi có nhiều gói dịch vụ phù hợp với quy mô doanh nghiệp khác nhau. Bạn có thể cho tôi biết quy mô công ty của bạn (số lượng nhân viên) để tôi tư vấn gói phù hợp nhất không?';
        }
        
        if (message.includes('demo') || message.includes('thử nghiệm')) {
            return 'Chúng tôi cung cấp bản demo miễn phí 30 ngày với đầy đủ tính năng. Bạn có muốn tôi đăng ký demo cho bạn không? Tôi sẽ cần email và số điện thoại của bạn.';
        }
        
        if (message.includes('hỗ trợ') || message.includes('help') || message.includes('kỹ thuật')) {
            return 'Đội ngũ hỗ trợ kỹ thuật của chúng tôi luôn sẵn sàng 24/7. Bạn đang gặp vấn đề gì cụ thể? Tôi có thể kết nối bạn với chuyên gia kỹ thuật hoặc hướng dẫn bạn qua chat này.';
        }
        
        if (message.includes('xin chào') || message.includes('hello') || message.includes('hi')) {
            return 'Xin chào! Rất vui được hỗ trợ bạn hôm nay. Tôi là chuyên viên tư vấn của Professional HR. Bạn có câu hỏi gì về hệ thống quản lý nhân sự của chúng tôi không?';
        }
        
        if (message.includes('cảm ơn') || message.includes('thank')) {
            return 'Rất vui được hỗ trợ bạn! Nếu bạn có thêm câu hỏi nào khác, đừng ngần ngại liên hệ với chúng tôi nhé. Chúc bạn một ngày tốt lành! 😊';
        }
        
        // Default responses
        const defaultResponses = [
            'Cảm ơn bạn đã liên hệ! Tôi đang xem xét câu hỏi của bạn. Bạn có thể chia sẻ thêm chi tiết để tôi hỗ trợ tốt hơn không?',
            'Đây là một câu hỏi hay! Để tôi tư vấn chính xác nhất, bạn có thể cho tôi biết thêm về tình huống cụ thể của bạn không?',
            'Tôi hiểu mối quan tâm của bạn. Hãy để tôi kết nối bạn với chuyên gia phù hợp. Trong lúc chờ, bạn có thể xem thêm thông tin trên website của chúng tôi.',
            'Cảm ơn bạn đã quan tâm đến dịch vụ của chúng tôi. Tôi sẽ ghi nhận yêu cầu và có chuyên viên liên hệ lại trong thời gian sớm nhất.'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    showTypingIndicator() {
        const typingDiv = document.getElementById('chatTyping');
        typingDiv.style.display = 'flex';
        this.scrollToBottom();
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const typingDiv = document.getElementById('chatTyping');
        typingDiv.style.display = 'none';
        this.isTyping = false;
    }

    hideSuggestions() {
        const suggestions = document.getElementById('chatSuggestions');
        if (suggestions.children.length > 0) {
            suggestions.style.display = 'none';
        }
    }

    toggleSendButton() {
        const input = document.querySelector('.customer-chat-input .chat-input') || document.getElementById('chatInput');
        const sendBtn = document.querySelector('.chat-send-btn') || document.getElementById('sendBtn');
        
        if (input && sendBtn) {
            if (input.value.trim()) {
                sendBtn.disabled = false;
                sendBtn.classList.add('active');
            } else {
                sendBtn.disabled = true;
                sendBtn.classList.remove('active');
            }
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('customerMessages') || document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    showNotification() {
        const notification = document.getElementById('chatNotification');
        notification.style.display = 'flex';
        notification.textContent = '1';
    }

    markMessagesAsRead() {
        // This would mark messages as read in the backend
        console.log('Messages marked as read for conversation:', this.conversationId);
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Vừa xong';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} phút trước`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} giờ trước`;
        } else {
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    showEmojiPicker() {
        // Simple emoji insertion
        const emojis = ['😊', '👍', '❤️', '😢', '😮', '😄', '🙏', '👌'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        const input = document.getElementById('chatInput');
        input.value += randomEmoji;
        input.focus();
        this.toggleSendButton();
    }

    async saveMessageToBackend(message, senderType) {
        // This would save the message to the backend
        const messageData = {
            conversation_id: this.conversationId,
            message_text: message,
            sender_type: senderType,
            customer_info: this.customerInfo,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Simulate API call - replace with actual endpoint
            console.log('Saving message to backend:', messageData);
            
            // Example API call:
            // const response = await fetch('/api/chat/messages', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(messageData)
            // });
            
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }

    loadSavedConversation() {
        // Load previous conversation from localStorage or backend
        const saved = localStorage.getItem('chat_conversation');
        if (saved) {
            try {
                const conversation = JSON.parse(saved);
                this.conversationId = conversation.id;
                this.customerInfo = conversation.customerInfo || {};
                
                // Load previous messages
                if (conversation.messages && conversation.messages.length > 0) {
                    conversation.messages.forEach(msg => {
                        this.addMessage(msg.text, msg.sender, msg.timestamp);
                    });
                }
            } catch (error) {
                console.error('Error loading conversation:', error);
            }
        }
    }

    saveConversation() {
        // Save conversation to localStorage
        const messages = Array.from(document.querySelectorAll('.message')).map(msg => ({
            text: msg.querySelector('.message-text').textContent,
            sender: msg.classList.contains('user-message') ? 'user' : 'agent',
            timestamp: msg.querySelector('.message-time').textContent
        }));
        
        const conversation = {
            id: this.conversationId,
            customerInfo: this.customerInfo,
            messages: messages,
            lastUpdate: new Date().toISOString()
        };
        
        localStorage.setItem('chat_conversation', JSON.stringify(conversation));
    }

    saveConversationData() {
        // Save conversation data including Enhanced Database Schema v3.0 support
        const conversation = {
            id: this.conversationId,
            customerInfo: this.customerInfo,
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };
        
        localStorage.setItem('chat_conversation', JSON.stringify(conversation));
    }

    async collectCustomerInfo() {
        return new Promise((resolve) => {
            // Create modal for customer info collection
            const modal = document.createElement('div');
            modal.className = 'chat-info-modal';
            modal.innerHTML = `
                <div class="chat-info-content">
                    <h3>Thông tin liên hệ</h3>
                    <p>Vui lòng cung cấp thông tin để chúng tôi hỗ trợ bạn tốt hơn:</p>
                    <form id="customerInfoForm">
                        <div class="form-group">
                            <label for="customerName">Họ và tên *</label>
                            <input type="text" id="customerName" required>
                        </div>
                        <div class="form-group">
                            <label for="customerEmail">Email *</label>
                            <input type="email" id="customerEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="customerPhone">Số điện thoại</label>
                            <input type="tel" id="customerPhone">
                        </div>
                        <div class="form-actions">
                            <button type="button" id="cancelInfo">Hủy</button>
                            <button type="submit" id="submitInfo">Tiếp tục</button>
                        </div>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Handle form submission
            document.getElementById('customerInfoForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                this.customerInfo.name = document.getElementById('customerName').value.trim();
                this.customerInfo.email = document.getElementById('customerEmail').value.trim();
                this.customerInfo.phone = document.getElementById('customerPhone').value.trim();
                
                if (this.customerInfo.name && this.customerInfo.email) {
                    document.body.removeChild(modal);
                    resolve(true);
                }
            });
            
            // Handle cancel
            document.getElementById('cancelInfo').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
        });
    }

    showWelcomeMessage() {
        // Show welcome message after a delay
        setTimeout(() => {
            if (!this.isOpen) {
                this.showNotification();
            }
        }, 3000);
    }

    // Public methods for integration
    openChat() {
        if (!this.isOpen) {
            this.toggleChat();
        }
    }

    sendSystemMessage(message) {
        this.addMessage(message, 'agent');
    }

    updateCustomerInfo(info) {
        this.customerInfo = { ...this.customerInfo, ...info };
        this.saveConversation();
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatWidget = new ChatWidget();
    
    // Save conversation before page unload
    window.addEventListener('beforeunload', () => {
        if (window.chatWidget) {
            window.chatWidget.saveConversation();
        }
    });
});

// Global functions for external integration
window.openSupportChat = () => {
    if (window.chatWidget) {
        window.chatWidget.openChat();
    }
};

window.sendChatMessage = (message) => {
    if (window.chatWidget) {
        window.chatWidget.sendSystemMessage(message);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatWidget;
}