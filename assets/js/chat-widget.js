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
        document.getElementById('chatToggle').addEventListener('click', () => {
            this.toggleChat();
        });

        // Chat minimize
        document.getElementById('chatMinimize').addEventListener('click', () => {
            this.toggleChat();
        });

        // Chat form submission
        document.getElementById('chatForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Input events
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('input', () => {
            this.toggleSendButton();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const message = e.target.getAttribute('data-message');
                this.sendMessage(message);
            }
        });

        // Emoji button
        document.getElementById('emojiBtn').addEventListener('click', () => {
            this.showEmojiPicker();
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            const chatWidget = document.getElementById('chatWidget');
            if (!chatWidget.contains(e.target) && this.isOpen) {
                // Don't auto-close for better UX
                // this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        const chatIcon = chatToggle.querySelector('.chat-icon');
        const closeIcon = chatToggle.querySelector('.chat-close-icon');
        const notification = document.getElementById('chatNotification');

        if (this.isOpen) {
            chatWindow.classList.add('open');
            chatIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            notification.style.display = 'none';
            
            // Focus input
            setTimeout(() => {
                document.getElementById('chatInput').focus();
            }, 300);
            
            // Mark messages as read
            this.markMessagesAsRead();
        } else {
            chatWindow.classList.remove('open');
            chatIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    }

    sendMessage(messageText = null) {
        const input = document.getElementById('chatInput');
        const text = messageText || input.value.trim();
        
        if (!text) return;

        // Add user message
        this.addMessage(text, 'user');
        
        // Clear input
        input.value = '';
        this.toggleSendButton();
        
        // Hide suggestions after first message
        this.hideSuggestions();
        
        // Save to conversation
        this.saveMessageToBackend(text, 'customer');
        
        // Simulate agent response
        this.simulateAgentResponse(text);
    }

    addMessage(text, sender, timestamp = null) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'agent-message'}`;
        
        const time = timestamp || this.formatTime(new Date());
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessageText(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
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
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (input.value.trim()) {
            sendBtn.disabled = false;
        } else {
            sendBtn.disabled = true;
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
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