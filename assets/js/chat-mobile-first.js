/**
 * Mobile-First ChatPanel Manager
 * Professional internal chat system with conversation list → messages flow
 */
class MobileChatPanel {
    constructor() {
        this.currentUser = null;
        this.selectedConversation = null;
        this.conversations = new Map();
        this.messages = new Map();
        this.isInitialized = false;
        
        // Mobile state management
        this.isMobile = window.innerWidth < 768;
        this.chatState = 'conversations'; // 'conversations' or 'messages'
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadCurrentUser();
    }
    
    initializeElements() {
        this.chatToggle = document.getElementById('chatToggle');
        this.chatPanel = document.getElementById('chatPanel');
        this.closeChat = document.getElementById('closeChat');
        this.chatSidebar = document.querySelector('.chat-sidebar');
        this.chatContent = document.querySelector('.chat-content');
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.querySelector('.chat-input');
        this.chatSendBtn = document.querySelector('.chat-send-btn');
        this.mobileBackBtn = document.querySelector('.mobile-back-btn');
        
        if (!this.chatToggle || !this.chatPanel) {
            console.warn('ChatPanel elements not found');
            return;
        }
        
        this.isInitialized = true;
    }
    
    setupEventListeners() {
        if (!this.isInitialized) return;
        
        // Chat toggle
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        
        // Close chat
        if (this.closeChat) {
            this.closeChat.addEventListener('click', () => this.closeChat());
        }
        
        // Mobile back button
        if (this.mobileBackBtn) {
            this.mobileBackBtn.addEventListener('click', () => this.showConversationsList());
        }
        
        // Message sending
        if (this.chatSendBtn) {
            this.chatSendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            this.chatInput.addEventListener('input', () => this.handleInputChange());
        }
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.chatPanel.contains(e.target) && !this.chatToggle.contains(e.target)) {
                this.closeChatPanel();
            }
        });
    }
    
    async loadCurrentUser() {
        try {
            // Get user data from authManager
            if (window.authManager) {
                this.currentUser = await window.authManager.getCurrentUser();
                if (this.currentUser) {
                    this.loadConversations();
                }
            }
        } catch (error) {
            console.error('Failed to load current user:', error);
        }
    }
    
    toggleChat() {
        if (this.chatPanel.classList.contains('active')) {
            this.closeChatPanel();
        } else {
            this.openChatPanel();
        }
    }
    
    openChatPanel() {
        this.chatPanel.classList.add('active');
        this.chatState = 'conversations';
        this.updateChatView();
        
        // Focus management
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        
        // Auto-load conversations if not loaded
        if (this.conversations.size === 0) {
            this.loadConversations();
        }
    }
    
    closeChatPanel() {
        this.chatPanel.classList.remove('active');
        this.chatState = 'conversations';
        this.selectedConversation = null;
        
        if (this.isMobile) {
            document.body.style.overflow = '';
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (wasMobile !== this.isMobile) {
            this.updateChatView();
        }
    }
    
    updateChatView() {
        if (this.isMobile) {
            // Mobile: Show either conversations or messages
            if (this.chatState === 'conversations') {
                this.showConversationsList();
            } else {
                this.showMessagesView();
            }
        } else {
            // Desktop: Show both sidebar and content
            this.chatSidebar.style.display = 'flex';
            this.chatContent.style.display = 'flex';
            this.chatContent.classList.remove('mobile-active');
            
            if (this.mobileBackBtn) {
                this.mobileBackBtn.style.display = 'none';
            }
        }
    }
    
    showConversationsList() {
        this.chatState = 'conversations';
        
        if (this.isMobile) {
            this.chatSidebar.style.display = 'flex';
            this.chatContent.style.display = 'none';
            this.chatContent.classList.remove('mobile-active');
            
            if (this.mobileBackBtn) {
                this.mobileBackBtn.style.display = 'none';
            }
        }
    }
    
    showMessagesView() {
        this.chatState = 'messages';
        
        if (this.isMobile) {
            this.chatSidebar.style.display = 'none';
            this.chatContent.style.display = 'flex';
            this.chatContent.classList.add('mobile-active');
            
            if (this.mobileBackBtn) {
                this.mobileBackBtn.style.display = 'flex';
            }
        }
    }
    
    async loadConversations() {
        try {
            // Show loading state
            this.renderConversationsLoading();
            
            // Load conversations based on user's department and permissions
            const conversations = await this.fetchConversations();
            
            conversations.forEach(conv => {
                this.conversations.set(conv.id, conv);
            });
            
            this.renderConversations();
        } catch (error) {
            console.error('Failed to load conversations:', error);
            this.renderConversationsError();
        }
    }
    
    async fetchConversations() {
        // Mock data - in real implementation, this would be API calls
        const mockConversations = [
            {
                id: 'general',
                type: 'general',
                name: 'Thảo luận chung',
                icon: 'public',
                lastMessage: 'Chúc mọi người một ngày làm việc hiệu quả!',
                lastMessageTime: '10:30',
                unreadCount: 3,
                participants: []
            },
            {
                id: 'department',
                type: 'department',
                name: this.getDepartmentName(),
                icon: 'business',
                lastMessage: 'Họp phòng ban lúc 14:00 hôm nay',
                lastMessageTime: '09:15',
                unreadCount: 1,
                departmentId: this.currentUser?.department_id,
                participants: []
            },
            {
                id: 'private-user1',
                type: 'private',
                name: 'Nguyễn Văn A',
                avatar: '../../assets/icons/avatar-placeholder.png',
                lastMessage: 'Anh có thể gửi báo cáo cho em được không?',
                lastMessageTime: 'Hôm qua',
                unreadCount: 2,
                participants: ['current_user', 'user1']
            },
            {
                id: 'group-project',
                type: 'group',
                name: 'Dự án Website',
                icon: 'group',
                lastMessage: 'Tasks đã được cập nhật',
                lastMessageTime: '2 ngày trước',
                unreadCount: 0,
                participants: ['current_user', 'user1', 'user2', 'user3']
            }
        ];
        
        // Filter department chat based on current user's department
        return mockConversations.filter(conv => {
            if (conv.type === 'department') {
                return this.currentUser?.department_id === conv.departmentId;
            }
            return true;
        });
    }
    
    getDepartmentName() {
        const departmentNames = {
            1: 'Phòng Nhân sự',
            2: 'Phòng Kỹ thuật',
            3: 'Phòng Marketing',
            4: 'Phòng Tài chính',
            5: 'Phòng Hành chính'
        };
        
        return departmentNames[this.currentUser?.department_id] || 'Phòng ban';
    }
    
    renderConversationsLoading() {
        this.chatSidebar.innerHTML = `
            <div class="chat-loading">
                <div class="chat-loading-dots">
                    <div class="chat-loading-dot"></div>
                    <div class="chat-loading-dot"></div>
                    <div class="chat-loading-dot"></div>
                </div>
            </div>
        `;
    }
    
    renderConversationsError() {
        this.chatSidebar.innerHTML = `
            <div class="chat-empty-state">
                <span class="material-icons-round">error_outline</span>
                <h3>Không thể tải cuộc trò chuyện</h3>
                <p>Vui lòng thử lại sau</p>
            </div>
        `;
    }
    
    renderConversations() {
        const conversationsHTML = Array.from(this.conversations.values())
            .map(conv => this.renderConversationItem(conv))
            .join('');
            
        this.chatSidebar.innerHTML = conversationsHTML;
        
        // Add click listeners
        this.chatSidebar.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.dataset.conversationId;
                this.selectConversation(convId);
            });
        });
    }
    
    renderConversationItem(conversation) {
        const unreadBadge = conversation.unreadCount > 0 
            ? `<div class="conversation-badge ${conversation.unreadCount > 0 ? 'new' : ''}">${conversation.unreadCount}</div>`
            : '';
            
        const avatar = conversation.avatar 
            ? `<img src="${conversation.avatar}" alt="${conversation.name}">`
            : `<span class="material-icons-round">${conversation.icon}</span>`;
            
        return `
            <div class="conversation-item" data-conversation-id="${conversation.id}">
                <div class="conversation-avatar">
                    ${avatar}
                </div>
                <div class="conversation-info">
                    <div class="conversation-name">${conversation.name}</div>
                    <div class="conversation-preview">${conversation.lastMessage}</div>
                </div>
                <div class="conversation-meta">
                    <div class="conversation-time">${conversation.lastMessageTime}</div>
                    ${unreadBadge}
                </div>
            </div>
        `;
    }
    
    selectConversation(conversationId) {
        // Update UI selection
        this.chatSidebar.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = this.chatSidebar.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Set selected conversation
        this.selectedConversation = this.conversations.get(conversationId);
        
        // Show messages view on mobile
        if (this.isMobile) {
            this.showMessagesView();
        }
        
        // Load messages for this conversation
        this.loadMessages(conversationId);
        
        // Clear unread count
        if (this.selectedConversation) {
            this.selectedConversation.unreadCount = 0;
            this.updateConversationBadge(conversationId);
        }
    }
    
    updateConversationBadge(conversationId) {
        const conversationItem = this.chatSidebar.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (conversationItem) {
            const badge = conversationItem.querySelector('.conversation-badge');
            if (badge) {
                badge.remove();
            }
        }
    }
    
    async loadMessages(conversationId) {
        try {
            this.renderMessagesLoading();
            
            // Fetch messages for this conversation
            const messages = await this.fetchMessages(conversationId);
            this.messages.set(conversationId, messages);
            
            this.renderMessages(messages);
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.renderMessagesError();
        }
    }
    
    async fetchMessages(conversationId) {
        // Mock messages - in real implementation, this would be API calls
        const mockMessages = {
            'general': [
                {
                    id: 1,
                    senderId: 'user1',
                    senderName: 'Nguyễn Văn A',
                    senderAvatar: '../../assets/icons/avatar-placeholder.png',
                    text: 'Chào mọi người! Chúc một ngày làm việc hiệu quả!',
                    timestamp: '2024-01-15T10:30:00Z',
                    isOwn: false
                },
                {
                    id: 2,
                    senderId: 'current_user',
                    senderName: this.currentUser?.name || 'Bạn',
                    text: 'Cảm ơn anh! Chúc anh cũng vậy!',
                    timestamp: '2024-01-15T10:31:00Z',
                    isOwn: true
                }
            ],
            'department': [
                {
                    id: 1,
                    senderId: 'manager',
                    senderName: 'Trưởng phòng',
                    senderAvatar: '../../assets/icons/avatar-placeholder.png',
                    text: 'Họp phòng ban lúc 14:00 hôm nay tại phòng họp A. Mọi người nhớ chuẩn bị báo cáo tiến độ.',
                    timestamp: '2024-01-15T09:15:00Z',
                    isOwn: false
                }
            ]
        };
        
        return mockMessages[conversationId] || [];
    }
    
    renderMessagesLoading() {
        this.chatMessages.innerHTML = `
            <div class="chat-loading">
                <div class="chat-loading-dots">
                    <div class="chat-loading-dot"></div>
                    <div class="chat-loading-dot"></div>
                    <div class="chat-loading-dot"></div>
                </div>
            </div>
        `;
    }
    
    renderMessagesError() {
        this.chatMessages.innerHTML = `
            <div class="chat-empty-state">
                <span class="material-icons-round">error_outline</span>
                <h3>Không thể tải tin nhắn</h3>
                <p>Vui lòng thử lại sau</p>
            </div>
        `;
    }
    
    renderMessages(messages) {
        if (messages.length === 0) {
            this.chatMessages.innerHTML = `
                <div class="chat-empty-state">
                    <span class="material-icons-round">chat_bubble_outline</span>
                    <h3>Chưa có tin nhắn</h3>
                    <p>Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
            `;
            return;
        }
        
        const messagesHTML = messages.map(message => this.renderMessage(message)).join('');
        this.chatMessages.innerHTML = messagesHTML;
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    renderMessage(message) {
        const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const avatar = message.senderAvatar 
            ? `<img src="${message.senderAvatar}" alt="${message.senderName}" class="sender-avatar">`
            : `<div class="sender-avatar"><span class="material-icons-round">person</span></div>`;
            
        return `
            <div class="message-group">
                ${!message.isOwn ? `
                    <div class="message-sender">
                        ${avatar}
                        <span class="sender-name">${message.senderName}</span>
                        <span class="message-time">${time}</span>
                    </div>
                ` : ''}
                <div class="message-bubble ${message.isOwn ? 'own' : ''}">
                    ${message.text}
                    ${message.isOwn ? `<div class="message-time" style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem;">${time}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    sendMessage() {
        if (!this.selectedConversation || !this.chatInput) return;
        
        const messageText = this.chatInput.value.trim();
        if (!messageText) return;
        
        // Create message object
        const message = {
            id: Date.now(),
            senderId: 'current_user',
            senderName: this.currentUser?.name || 'Bạn',
            text: messageText,
            timestamp: new Date().toISOString(),
            isOwn: true
        };
        
        // Add to messages
        const conversationMessages = this.messages.get(this.selectedConversation.id) || [];
        conversationMessages.push(message);
        this.messages.set(this.selectedConversation.id, conversationMessages);
        
        // Update UI
        this.renderMessages(conversationMessages);
        
        // Clear input
        this.chatInput.value = '';
        this.updateSendButton();
        
        // Update conversation preview
        this.selectedConversation.lastMessage = messageText;
        this.selectedConversation.lastMessageTime = 'Vừa xong';
        this.renderConversations();
        
        // In real implementation, send to server here
        this.sendMessageToServer(message);
    }
    
    async sendMessageToServer(message) {
        try {
            // Mock API call
            console.log('Sending message to server:', message);
            
            // Simulate server response with typing indicator
            setTimeout(() => {
                this.simulateTypingResponse();
            }, 1000);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Show error state
        }
    }
    
    simulateTypingResponse() {
        if (!this.selectedConversation) return;
        
        // Add a mock response (for demo purposes)
        const responses = [
            'Đã nhận được tin nhắn của bạn!',
            'Cảm ơn bạn đã liên hệ.',
            'Tôi sẽ phản hồi sớm nhất có thể.',
            'Được rồi, tôi hiểu.',
            'Cảm ơn bạn!'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage = {
            id: Date.now() + 1,
            senderId: 'bot',
            senderName: 'Hệ thống',
            text: randomResponse,
            timestamp: new Date().toISOString(),
            isOwn: false
        };
        
        const conversationMessages = this.messages.get(this.selectedConversation.id) || [];
        conversationMessages.push(responseMessage);
        this.messages.set(this.selectedConversation.id, conversationMessages);
        
        this.renderMessages(conversationMessages);
    }
    
    handleInputChange() {
        this.updateSendButton();
    }
    
    updateSendButton() {
        if (!this.chatSendBtn || !this.chatInput) return;
        
        const hasText = this.chatInput.value.trim().length > 0;
        this.chatSendBtn.disabled = !hasText;
    }
    
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

// Initialize ChatPanel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileChatPanel = new MobileChatPanel();
});

// Also initialize if scripts are loaded after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.mobileChatPanel) {
            window.mobileChatPanel = new MobileChatPanel();
        }
    });
} else {
    if (!window.mobileChatPanel) {
        window.mobileChatPanel = new MobileChatPanel();
    }
}