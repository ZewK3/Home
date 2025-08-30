/**
 * Home Chat System
 * Integrated chat functionality for the main landing page
 */

class HomeChatManager {
    constructor() {
        this.currentTab = 'general';
        this.currentConversation = null;
        this.currentGroup = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadInitialData();
    }
    
    bindEvents() {
        // Chat toggle
        const chatToggle = document.getElementById('chatToggle');
        const chatPanel = document.getElementById('chatPanel');
        const closeChat = document.getElementById('closeChat');
        
        if (chatToggle) {
            chatToggle.addEventListener('click', () => this.toggleChat());
        }
        
        if (closeChat) {
            closeChat.addEventListener('click', () => this.closeChat());
        }
        
        // Tab switching
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Private chat navigation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const conversationId = e.currentTarget.dataset.conversation;
                this.openPrivateConversation(conversationId);
            });
        });
        
        const backToConversations = document.querySelector('.back-to-conversations');
        if (backToConversations) {
            backToConversations.addEventListener('click', () => this.backToConversationsList());
        }
        
        // Group chat navigation
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const groupId = e.currentTarget.dataset.group;
                this.openGroupChat(groupId);
            });
        });
        
        const backToGroups = document.querySelector('.back-to-groups');
        if (backToGroups) {
            backToGroups.addEventListener('click', () => this.backToGroupsList());
        }
        
        // Send message handlers
        document.querySelectorAll('.chat-send-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.sendMessage(e));
        });
        
        document.querySelectorAll('.chat-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(e);
                }
            });
        });
        
        // Mobile handling
        this.handleMobileResize();
        window.addEventListener('resize', () => this.handleMobileResize());
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !chatPanel?.contains(e.target) && !chatToggle?.contains(e.target)) {
                this.closeChat();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        const chatPanel = document.getElementById('chatPanel');
        if (!chatPanel) return;
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        const chatPanel = document.getElementById('chatPanel');
        const chatToggle = document.getElementById('chatToggle');
        
        if (!chatPanel) return;
        
        chatPanel.classList.add('active');
        chatToggle?.classList.add('active');
        this.isOpen = true;
        
        // Mobile fullscreen
        if (window.innerWidth <= 768) {
            chatPanel.classList.add('mobile-fullscreen');
        }
        
        // Remove notification badge
        const badge = document.getElementById('chatNotificationBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    }
    
    closeChat() {
        const chatPanel = document.getElementById('chatPanel');
        const chatToggle = document.getElementById('chatToggle');
        
        if (!chatPanel) return;
        
        chatPanel.classList.remove('active', 'mobile-fullscreen');
        chatToggle?.classList.remove('active');
        this.isOpen = false;
    }
    
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Show corresponding view
        document.querySelectorAll('.chat-view-content').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${tabName}ChatView`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // Reset navigation states for private/group chats
        if (tabName === 'private') {
            this.backToConversationsList();
        } else if (tabName === 'group') {
            this.backToGroupsList();
        }
    }
    
    openPrivateConversation(conversationId) {
        const conversationsList = document.getElementById('conversationsList');
        const privateChatMessages = document.getElementById('privateChatMessages');
        
        if (conversationsList && privateChatMessages) {
            conversationsList.classList.remove('active');
            privateChatMessages.classList.add('active');
        }
        
        this.currentConversation = conversationId;
        this.loadPrivateMessages(conversationId);
    }
    
    backToConversationsList() {
        const conversationsList = document.getElementById('conversationsList');
        const privateChatMessages = document.getElementById('privateChatMessages');
        
        if (conversationsList && privateChatMessages) {
            conversationsList.classList.add('active');
            privateChatMessages.classList.remove('active');
        }
        
        this.currentConversation = null;
    }
    
    openGroupChat(groupId) {
        const groupsList = document.getElementById('groupsList');
        const groupChatMessages = document.getElementById('groupChatMessages');
        
        if (groupsList && groupChatMessages) {
            groupsList.classList.remove('active');
            groupChatMessages.classList.add('active');
        }
        
        this.currentGroup = groupId;
        this.loadGroupMessages(groupId);
    }
    
    backToGroupsList() {
        const groupsList = document.getElementById('groupsList');
        const groupChatMessages = document.getElementById('groupChatMessages');
        
        if (groupsList && groupChatMessages) {
            groupsList.classList.add('active');
            groupChatMessages.classList.remove('active');
        }
        
        this.currentGroup = null;
    }
    
    sendMessage(e) {
        const input = e.target.closest('.chat-input-container')?.querySelector('.chat-input');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        // Determine which chat we're in
        let messagesContainer;
        if (this.currentTab === 'general') {
            messagesContainer = document.getElementById('generalMessages');
        } else if (this.currentTab === 'department') {
            messagesContainer = document.getElementById('departmentMessages');
        } else if (this.currentTab === 'private' && this.currentConversation) {
            messagesContainer = document.getElementById('privateMessages');
        } else if (this.currentTab === 'group' && this.currentGroup) {
            messagesContainer = document.getElementById('groupMessages');
        }
        
        if (messagesContainer) {
            this.addMessage(messagesContainer, message, true);
        }
        
        // Simulate response (in real app, this would be WebSocket/API call)
        setTimeout(() => {
            if (messagesContainer) {
                this.addMessage(messagesContainer, "Tin nhắn đã được nhận!", false);
            }
        }, 1000);
    }
    
    addMessage(container, text, sent = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sent ? 'sent' : 'received'}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        if (sent) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">${timeStr}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(text)}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">SYS</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">Hệ thống</span>
                        <span class="message-time">${timeStr}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(text)}</div>
                </div>
            `;
        }
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    loadPrivateMessages(conversationId) {
        const container = document.getElementById('privateMessages');
        if (!container) return;
        
        // Simulate loading messages
        container.innerHTML = `
            <div class="message received">
                <div class="message-avatar">NV</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">Nguyễn Văn An</span>
                        <span class="message-time">10:15</span>
                    </div>
                    <div class="message-text">Anh ơi, em muốn hỏi về quy trình nghỉ phép ạ</div>
                </div>
            </div>
            <div class="message sent">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">10:17</span>
                    </div>
                    <div class="message-text">Em có thể vào phần HR Portal để xem chi tiết quy trình nhé</div>
                </div>
            </div>
        `;
    }
    
    loadGroupMessages(groupId) {
        const container = document.getElementById('groupMessages');
        if (!container) return;
        
        // Simulate loading messages
        container.innerHTML = `
            <div class="message received">
                <div class="message-avatar">TL</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">Team Leader</span>
                        <span class="message-time">09:30</span>
                    </div>
                    <div class="message-text">Các bạn cập nhật tiến độ dự án nhé!</div>
                </div>
            </div>
            <div class="message received">
                <div class="message-avatar">DEV</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">Developer</span>
                        <span class="message-time">09:32</span>
                    </div>
                    <div class="message-text">Frontend đã hoàn thành 80% rồi ạ</div>
                </div>
            </div>
        `;
    }
    
    loadInitialData() {
        // Simulate initial data loading
        this.updateChatSubtitle();
    }
    
    updateChatSubtitle() {
        const subtitle = document.querySelector('.chat-subtitle');
        if (subtitle) {
            const activeChats = 3; // Simulate count
            subtitle.textContent = `${activeChats} cuộc trò chuyện đang hoạt động`;
        }
    }
    
    handleMobileResize() {
        const chatPanel = document.getElementById('chatPanel');
        if (!chatPanel) return;
        
        if (window.innerWidth > 768) {
            chatPanel.classList.remove('mobile-fullscreen');
        } else if (this.isOpen) {
            chatPanel.classList.add('mobile-fullscreen');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomeChatManager();
});