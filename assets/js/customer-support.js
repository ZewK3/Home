// =====================================================
// CUSTOMER SUPPORT MANAGER - Enhanced Database Schema v3.0
// =====================================================
// Complete customer support functionality for HR Management System
// Compatible with Enhanced_HR_Database_Schema_v3.sql
// Features:
// ✓ Real-time conversation management
// ✓ Message sending and receiving
// ✓ Status management (open, in_progress, waiting_customer, resolved, closed)
// ✓ Search and filter capabilities
// ✓ Professional chat interface
// =====================================================

class CustomerSupportManager {
    constructor() {
        this.conversations = [];
        this.currentConversationId = null;
        this.currentMessages = [];
        this.pollingInterval = null;
        this.isLoading = false;
        
        // Status mapping for display
        this.statusLabels = {
            'open': 'Mở',
            'in_progress': 'Đang xử lý', 
            'waiting_customer': 'Chờ khách hàng',
            'resolved': 'Đã giải quyết',
            'closed': 'Đã đóng'
        };

        this.statusColors = {
            'open': '#ef4444',
            'in_progress': '#f59e0b',
            'waiting_customer': '#8b5cf6',
            'resolved': '#10b981',
            'closed': '#6b7280'
        };

        this.initialize();
    }

    async initialize() {
        console.log('🎧 Customer Support Manager initializing...');
        
        try {
            await this.loadConversations();
            this.setupEventListeners();
            this.startPolling();
            console.log('✅ Customer Support Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Customer Support Manager:', error);
            utils.showNotification('Không thể khởi tạo hệ thống hỗ trợ khách hàng', 'error');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchConversations');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Message sending
        const sendButton = document.getElementById('sendMessage');
        const messageInput = document.getElementById('messageInput');
        
        if (sendButton && messageInput) {
            sendButton.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Status update buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                const status = e.target.dataset.status;
                const conversationId = e.target.dataset.conversationId || this.currentConversationId;
                if (status && conversationId) {
                    this.updateConversationStatus(conversationId, status);
                }
            }

            // Conversation selection
            if (e.target.classList.contains('conversation-item') || e.target.closest('.conversation-item')) {
                const conversationItem = e.target.classList.contains('conversation-item') ? 
                    e.target : e.target.closest('.conversation-item');
                const conversationId = conversationItem.dataset.conversationId;
                if (conversationId) {
                    this.selectConversation(conversationId);
                }
            }
        });

        // Refresh conversations
        const refreshButton = document.getElementById('refreshConversations');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.loadConversations());
        }
    }

    async loadConversations() {
        try {
            this.isLoading = true;
            this.showConversationsLoading(true);

            console.log('📋 Loading support conversations...');
            const conversations = await utils.getSupportConversations();
            
            this.conversations = Array.isArray(conversations) ? conversations : [];
            console.log(`✅ Loaded ${this.conversations.length} conversations`);
            
            this.renderConversations();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
            utils.showNotification('Không thể tải danh sách cuộc trò chuyện', 'error');
            this.conversations = [];
            this.renderConversations();
        } finally {
            this.isLoading = false;
            this.showConversationsLoading(false);
        }
    }

    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (this.conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>Chưa có cuộc trò chuyện nào</h3>
                    <p>Cuộc trò chuyện mới sẽ xuất hiện ở đây</p>
                </div>
            `;
            return;
        }

        conversationsList.innerHTML = this.conversations.map(conversation => `
            <div class="conversation-item ${conversation.id === this.currentConversationId ? 'active' : ''}" 
                 data-conversation-id="${conversation.id}">
                <div class="conversation-avatar">
                    <span class="avatar-text">${this.getInitials(conversation.customer_name)}</span>
                </div>
                <div class="conversation-content">
                    <div class="conversation-header">
                        <h4 class="customer-name">${utils.escapeHtml(conversation.customer_name)}</h4>
                        <span class="conversation-time">${this.formatTime(conversation.created_at)}</span>
                    </div>
                    <div class="conversation-preview">
                        <p class="last-message">${utils.escapeHtml(conversation.last_message || 'Chưa có tin nhắn')}</p>
                        <div class="conversation-meta">
                            <span class="status-badge" style="background-color: ${this.statusColors[conversation.status]}">
                                ${this.statusLabels[conversation.status]}
                            </span>
                            ${conversation.unread_count > 0 ? 
                                `<span class="unread-badge">${conversation.unread_count}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async selectConversation(conversationId) {
        try {
            console.log(`🎯 Selecting conversation: ${conversationId}`);
            
            this.currentConversationId = conversationId;
            this.renderConversations(); // Re-render to update active state
            
            await this.loadMessages(conversationId);
            this.showChatArea(true);
            
            // Update conversation header
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                this.updateChatHeader(conversation);
            }
            
        } catch (error) {
            console.error('❌ Error selecting conversation:', error);
            utils.showNotification('Không thể tải cuộc trò chuyện', 'error');
        }
    }

    async loadMessages(conversationId) {
        try {
            this.showMessagesLoading(true);
            
            console.log(`📨 Loading messages for conversation: ${conversationId}`);
            const messages = await utils.getSupportMessages(conversationId);
            
            this.currentMessages = Array.isArray(messages) ? messages : [];
            console.log(`✅ Loaded ${this.currentMessages.length} messages`);
            
            this.renderMessages();
            this.scrollToBottom();
            
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            utils.showNotification('Không thể tải tin nhắn', 'error');
            this.currentMessages = [];
            this.renderMessages();
        } finally {
            this.showMessagesLoading(false);
        }
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        if (this.currentMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages">
                    <div class="empty-icon">💭</div>
                    <p>Chưa có tin nhắn nào trong cuộc trò chuyện này</p>
                </div>
            `;
            return;
        }

        messagesContainer.innerHTML = this.currentMessages.map(message => `
            <div class="message ${message.is_employee ? 'employee' : 'customer'}">
                <div class="message-content">
                    <div class="message-text">${utils.escapeHtml(message.message)}</div>
                    <div class="message-time">${this.formatTime(message.created_at)}</div>
                </div>
                <div class="message-avatar">
                    ${message.is_employee ? 
                        '<span class="material-icons-round">support_agent</span>' : 
                        '<span class="material-icons-round">person</span>'}
                </div>
            </div>
        `).join('');
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !this.currentConversationId) return;

        const message = messageInput.value.trim();
        if (!message) return;

        try {
            console.log(`📤 Sending message to conversation: ${this.currentConversationId}`);
            
            // Disable input while sending
            messageInput.disabled = true;
            const sendButton = document.getElementById('sendMessage');
            if (sendButton) sendButton.disabled = true;

            await utils.sendSupportMessage(this.currentConversationId, message, true);
            
            // Clear input
            messageInput.value = '';
            
            // Reload messages to show the new message
            await this.loadMessages(this.currentConversationId);
            
            // Reload conversations to update last message
            await this.loadConversations();
            
            console.log('✅ Message sent successfully');
            
        } catch (error) {
            console.error('❌ Error sending message:', error);
            utils.showNotification('Không thể gửi tin nhắn', 'error');
        } finally {
            // Re-enable input
            messageInput.disabled = false;
            const sendButton = document.getElementById('sendMessage');
            if (sendButton) sendButton.disabled = false;
            messageInput.focus();
        }
    }

    async updateConversationStatus(conversationId, status) {
        try {
            console.log(`🔄 Updating conversation ${conversationId} status to: ${status}`);
            
            await utils.updateSupportStatus(conversationId, status);
            
            // Update local conversation status
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.status = status;
            }
            
            this.renderConversations();
            this.updateChatHeader(conversation);
            this.updateStats();
            
            utils.showNotification(`Đã cập nhật trạng thái: ${this.statusLabels[status]}`, 'success');
            console.log('✅ Status updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating status:', error);
            utils.showNotification('Không thể cập nhật trạng thái', 'error');
        }
    }

    filterConversations(searchTerm) {
        const conversationItems = document.querySelectorAll('.conversation-item');
        const term = searchTerm.toLowerCase();

        conversationItems.forEach(item => {
            const customerName = item.querySelector('.customer-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();
            
            const matches = customerName.includes(term) || lastMessage.includes(term);
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    filterByStatus(status) {
        const conversationItems = document.querySelectorAll('.conversation-item');
        
        conversationItems.forEach(item => {
            if (!status || status === 'all') {
                item.style.display = 'flex';
            } else {
                const statusBadge = item.querySelector('.status-badge');
                const conversationStatus = Object.keys(this.statusLabels).find(
                    key => this.statusLabels[key] === statusBadge.textContent
                );
                item.style.display = conversationStatus === status ? 'flex' : 'none';
            }
        });
    }

    updateChatHeader(conversation) {
        const chatHeader = document.getElementById('chatHeader');
        if (!chatHeader || !conversation) return;

        chatHeader.innerHTML = `
            <div class="chat-customer-info">
                <div class="customer-avatar">
                    <span class="avatar-text">${this.getInitials(conversation.customer_name)}</span>
                </div>
                <div class="customer-details">
                    <h3>${utils.escapeHtml(conversation.customer_name)}</h3>
                    <p>${utils.escapeHtml(conversation.customer_email)}</p>
                    <span class="status-badge" style="background-color: ${this.statusColors[conversation.status]}">
                        ${this.statusLabels[conversation.status]}
                    </span>
                </div>
            </div>
            <div class="chat-actions">
                <button class="status-btn" data-status="in_progress" data-conversation-id="${conversation.id}" title="Đánh dấu đang xử lý">
                    <span class="material-icons-round">schedule</span>
                </button>
                <button class="status-btn" data-status="waiting_customer" data-conversation-id="${conversation.id}" title="Chờ khách hàng">
                    <span class="material-icons-round">hourglass_empty</span>
                </button>
                <button class="status-btn" data-status="resolved" data-conversation-id="${conversation.id}" title="Đánh dấu đã giải quyết">
                    <span class="material-icons-round">check_circle</span>
                </button>
                <button class="status-btn" data-status="closed" data-conversation-id="${conversation.id}" title="Đóng cuộc trò chuyện">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
        `;
    }

    updateStats() {
        const stats = {
            total: this.conversations.length,
            open: this.conversations.filter(c => c.status === 'open').length,
            in_progress: this.conversations.filter(c => c.status === 'in_progress').length,
            resolved: this.conversations.filter(c => c.status === 'resolved').length
        };

        // Update stat elements if they exist
        Object.keys(stats).forEach(stat => {
            const element = document.getElementById(`stat-${stat}`);
            if (element) {
                element.textContent = stats[stat];
            }
        });
    }

    startPolling() {
        // Poll for new conversations and messages every 30 seconds
        this.pollingInterval = setInterval(() => {
            if (!this.isLoading) {
                this.loadConversations();
                if (this.currentConversationId) {
                    this.loadMessages(this.currentConversationId);
                }
            }
        }, 30000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // UI Helper Methods
    showConversationsLoading(show) {
        const loadingElement = document.getElementById('conversationsLoading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    showMessagesLoading(show) {
        const loadingElement = document.getElementById('messagesLoading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    showChatArea(show) {
        const chatArea = document.getElementById('chatArea');
        const emptyChatState = document.getElementById('emptyChatState');
        
        if (chatArea) chatArea.style.display = show ? 'flex' : 'none';
        if (emptyChatState) emptyChatState.style.display = show ? 'none' : 'flex';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes} phút trước`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours} giờ trước`;
        } else {
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Cleanup method
    destroy() {
        this.stopPolling();
        this.conversations = [];
        this.currentMessages = [];
        this.currentConversationId = null;
    }
}

// Initialize Customer Support Manager when DOM is loaded
let customerSupportManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the customer support page
    if (document.getElementById('conversationsList')) {
        customerSupportManager = new CustomerSupportManager();
    }
});

// Global access for debugging
window.customerSupportManager = customerSupportManager;