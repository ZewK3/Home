/**
 * =====================================================
 * ENHANCED CHAT WIDGET - PROFESSIONAL VERSION v2.0
 * =====================================================
 * Complete chat system with advanced features for HR Management
 * 
 * Features:
 * ✓ Emoji picker and support
 * ✓ Smooth scroll with auto-scroll
 * ✓ Online/Offline status tracking
 * ✓ Message read receipts
 * ✓ Typing indicators
 * ✓ File sharing support
 * ✓ Message reactions
 * ✓ Professional responsive design
 * ✓ Mobile fullscreen support
 * =====================================================
 */

class EnhancedChatWidget {
    constructor() {
        this.isOpen = false;
        this.currentUser = {
            id: 'current_user',
            name: 'Bạn',
            avatar: 'CU',
            status: 'online',
            department: 'IT'
        };
        this.currentTab = 'general';
        this.currentConversation = null;
        this.currentGroup = null;
        this.typingTimeouts = new Map();
        this.onlineUsers = new Set();
        this.messageHistory = new Map();
        this.unreadCounts = new Map();
        
        this.emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
            '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
            '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
            '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
            '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
            '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
            '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
            '🙌', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
            '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯'
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeOnlineStatus();
        this.loadMessageHistory();
        this.startHeartbeat();
        this.setupEmojiPicker();
        this.initializeUnreadCounts();
        
        console.log('✅ Enhanced Chat Widget initialized');
    }

    setupEventListeners() {
        // Chat toggle
        const chatToggle = document.getElementById('chatToggle');
        const closeChat = document.getElementById('closeChat');
        
        if (chatToggle) {
            chatToggle.addEventListener('click', () => this.toggleChat());
        }
        
        if (closeChat) {
            closeChat.addEventListener('click', () => this.toggleChat());
        }

        // Tab switching
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Message sending
        document.querySelectorAll('.chat-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(input);
                }
            });

            input.addEventListener('input', () => {
                this.showTypingIndicator();
            });
        });

        document.querySelectorAll('.chat-send-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.closest('.chat-input-container').querySelector('.chat-input');
                this.sendMessage(input);
            });
        });

        // Conversation navigation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.getAttribute('data-conversation');
                this.openPrivateChat(conversationId);
            });
        });

        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', () => {
                const groupId = item.getAttribute('data-group');
                this.openGroupChat(groupId);
            });
        });

        // Back navigation
        const backToConversations = document.querySelector('.back-to-conversations');
        const backToGroups = document.querySelector('.back-to-groups');
        
        if (backToConversations) {
            backToConversations.addEventListener('click', () => this.showConversationsList());
        }
        
        if (backToGroups) {
            backToGroups.addEventListener('click', () => this.showGroupsList());
        }

        // Mobile responsive handling
        this.setupMobileHandlers();
    }

    setupMobileHandlers() {
        // Detect mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            const chatPanel = document.getElementById('chatPanel');
            if (chatPanel) {
                chatPanel.classList.add('mobile-fullscreen');
            }
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            const chatPanel = document.getElementById('chatPanel');
            
            if (chatPanel) {
                if (isMobile) {
                    chatPanel.classList.add('mobile-fullscreen');
                } else {
                    chatPanel.classList.remove('mobile-fullscreen');
                }
            }
        });
    }

    setupEmojiPicker() {
        // Create emoji picker for each chat input
        document.querySelectorAll('.chat-input-wrapper').forEach(wrapper => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-picker-btn';
            emojiBtn.innerHTML = '<span class="material-icons-round">emoji_emotions</span>';
            emojiBtn.setAttribute('aria-label', 'Chọn emoji');
            
            const sendBtn = wrapper.querySelector('.chat-send-btn');
            wrapper.insertBefore(emojiBtn, sendBtn);
            
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleEmojiPicker(wrapper);
            });
        });
    }

    toggleEmojiPicker(wrapper) {
        let emojiPicker = wrapper.querySelector('.emoji-picker');
        
        if (emojiPicker) {
            emojiPicker.remove();
            return;
        }

        emojiPicker = document.createElement('div');
        emojiPicker.className = 'emoji-picker';
        
        const emojiGrid = document.createElement('div');
        emojiGrid.className = 'emoji-grid';
        
        this.emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-btn';
            emojiBtn.textContent = emoji;
            emojiBtn.addEventListener('click', () => {
                this.insertEmoji(wrapper, emoji);
                emojiPicker.remove();
            });
            emojiGrid.appendChild(emojiBtn);
        });
        
        emojiPicker.appendChild(emojiGrid);
        wrapper.appendChild(emojiPicker);
        
        // Close picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!emojiPicker.contains(e.target) && !wrapper.contains(e.target)) {
                    emojiPicker.remove();
                }
            }, { once: true });
        }, 100);
    }

    insertEmoji(wrapper, emoji) {
        const input = wrapper.querySelector('.chat-input');
        const cursorPos = input.selectionStart;
        const textBefore = input.value.substring(0, cursorPos);
        const textAfter = input.value.substring(cursorPos);
        
        input.value = textBefore + emoji + textAfter;
        input.focus();
        input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatPanel = document.getElementById('chatPanel');
        const chatToggle = document.getElementById('chatToggle');
        
        if (chatPanel && chatToggle) {
            if (this.isOpen) {
                chatPanel.classList.add('active');
                chatToggle.classList.add('active');
                this.scrollToBottom();
                this.markMessagesAsRead();
                this.updateNotificationBadge();
            } else {
                chatPanel.classList.remove('active');
                chatToggle.classList.remove('active');
            }
        }
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active view
        document.querySelectorAll('.chat-view-content').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${tabName}ChatView`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        this.currentTab = tabName;
        this.scrollToBottom();
        this.markMessagesAsRead();
    }

    sendMessage(input) {
        const message = input.value.trim();
        if (!message) return;

        const messageData = {
            id: this.generateMessageId(),
            text: message,
            sender: this.currentUser,
            timestamp: new Date(),
            type: 'sent'
        };

        // Add message to appropriate chat
        this.addMessageToChat(messageData);
        
        // Clear input
        input.value = '';
        
        // Simulate response after a delay
        setTimeout(() => {
            this.simulateResponse(messageData);
        }, 1000 + Math.random() * 2000);
        
        // Update last activity
        this.updateLastActivity();
    }

    addMessageToChat(messageData) {
        let messagesContainer;
        
        switch (this.currentTab) {
            case 'general':
                messagesContainer = document.getElementById('generalMessages');
                break;
            case 'department':
                messagesContainer = document.getElementById('departmentMessages');
                break;
            case 'private':
                messagesContainer = document.getElementById('privateMessages');
                break;
            case 'group':
                messagesContainer = document.getElementById('groupMessages');
                break;
        }

        if (messagesContainer) {
            const messageElement = this.createMessageElement(messageData);
            messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            
            // Store message in history
            this.storeMessageInHistory(messageData);
        }
    }

    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.type}`;
        messageDiv.setAttribute('data-message-id', messageData.id);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (messageData.type === 'received') {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = messageData.sender.avatar;
            messageDiv.appendChild(avatar);
        }
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        if (messageData.type === 'received') {
            const senderName = document.createElement('span');
            senderName.className = 'message-sender';
            senderName.textContent = messageData.sender.name;
            messageHeader.appendChild(senderName);
        }
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(messageData.timestamp);
        messageHeader.appendChild(messageTime);
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = messageData.text;
        
        // Add emoji reactions container
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        
        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageText);
        messageContent.appendChild(reactionsContainer);
        messageDiv.appendChild(messageContent);
        
        // Add message actions
        this.addMessageActions(messageDiv, messageData);
        
        return messageDiv;
    }

    addMessageActions(messageElement, messageData) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        // React button
        const reactBtn = document.createElement('button');
        reactBtn.className = 'message-action-btn';
        reactBtn.innerHTML = '<span class="material-icons-round">add_reaction</span>';
        reactBtn.addEventListener('click', () => this.showReactionPicker(messageElement, messageData));
        
        // Reply button
        const replyBtn = document.createElement('button');
        replyBtn.className = 'message-action-btn';
        replyBtn.innerHTML = '<span class="material-icons-round">reply</span>';
        replyBtn.addEventListener('click', () => this.replyToMessage(messageData));
        
        actionsDiv.appendChild(reactBtn);
        actionsDiv.appendChild(replyBtn);
        messageElement.appendChild(actionsDiv);
    }

    showReactionPicker(messageElement, messageData) {
        const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
        
        let reactionPicker = messageElement.querySelector('.reaction-picker');
        if (reactionPicker) {
            reactionPicker.remove();
            return;
        }
        
        reactionPicker = document.createElement('div');
        reactionPicker.className = 'reaction-picker';
        
        quickReactions.forEach(reaction => {
            const reactionBtn = document.createElement('button');
            reactionBtn.className = 'reaction-btn';
            reactionBtn.textContent = reaction;
            reactionBtn.addEventListener('click', () => {
                this.addReaction(messageElement, messageData, reaction);
                reactionPicker.remove();
            });
            reactionPicker.appendChild(reactionBtn);
        });
        
        messageElement.appendChild(reactionPicker);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (reactionPicker.parentNode) {
                reactionPicker.remove();
            }
        }, 5000);
    }

    addReaction(messageElement, messageData, reaction) {
        const reactionsContainer = messageElement.querySelector('.message-reactions');
        
        // Check if reaction already exists
        let existingReaction = reactionsContainer.querySelector(`[data-reaction="${reaction}"]`);
        
        if (existingReaction) {
            const count = parseInt(existingReaction.getAttribute('data-count')) + 1;
            existingReaction.setAttribute('data-count', count);
            existingReaction.textContent = `${reaction} ${count}`;
        } else {
            const reactionElement = document.createElement('span');
            reactionElement.className = 'message-reaction';
            reactionElement.setAttribute('data-reaction', reaction);
            reactionElement.setAttribute('data-count', '1');
            reactionElement.textContent = `${reaction} 1`;
            reactionsContainer.appendChild(reactionElement);
        }
    }

    simulateResponse(originalMessage) {
        const responses = [
            'Cảm ơn thông tin!',
            'Tôi hiểu rồi, sẽ xử lý ngay.',
            'Được rồi, để tôi kiểm tra.',
            'OK, noted!',
            'Tôi sẽ phản hồi sớm.',
            'Cảm ơn bạn đã thông báo.',
            'Đã nhận được thông tin.',
            'Sẽ cập nhật kết quả sớm.'
        ];
        
        const senders = [
            { name: 'Admin System', avatar: 'AD' },
            { name: 'HR Manager', avatar: 'HR' },
            { name: 'IT Support', avatar: 'IT' },
            { name: 'Quản lý', avatar: 'QL' }
        ];
        
        const responseMessage = {
            id: this.generateMessageId(),
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: senders[Math.floor(Math.random() * senders.length)],
            timestamp: new Date(),
            type: 'received'
        };
        
        this.addMessageToChat(responseMessage);
        this.updateUnreadCount();
        
        // Show typing indicator first
        this.showTypingIndicator(responseMessage.sender);
        
        setTimeout(() => {
            this.hideTypingIndicator(responseMessage.sender);
        }, 1500);
    }

    showTypingIndicator(sender = null) {
        const messagesContainer = this.getCurrentMessagesContainer();
        if (!messagesContainer) return;
        
        let typingIndicator = messagesContainer.querySelector('.typing-indicator');
        
        if (!typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="message-avatar">${sender ? sender.avatar : 'TY'}</div>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        const messagesContainer = this.getCurrentMessagesContainer();
        if (!messagesContainer) return;
        
        const typingIndicator = messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    getCurrentMessagesContainer() {
        switch (this.currentTab) {
            case 'general':
                return document.getElementById('generalMessages');
            case 'department':
                return document.getElementById('departmentMessages');
            case 'private':
                return document.getElementById('privateMessages');
            case 'group':
                return document.getElementById('groupMessages');
            default:
                return null;
        }
    }

    openPrivateChat(conversationId) {
        this.currentConversation = conversationId;
        
        // Hide conversations list, show chat messages
        const conversationsList = document.getElementById('conversationsList');
        const privateChatMessages = document.getElementById('privateChatMessages');
        
        if (conversationsList) conversationsList.classList.remove('active');
        if (privateChatMessages) privateChatMessages.classList.add('active');
        
        this.loadPrivateMessages(conversationId);
        this.scrollToBottom();
    }

    openGroupChat(groupId) {
        this.currentGroup = groupId;
        
        // Hide groups list, show group chat messages
        const groupsList = document.getElementById('groupsList');
        const groupChatMessages = document.getElementById('groupChatMessages');
        
        if (groupsList) groupsList.classList.remove('active');
        if (groupChatMessages) groupChatMessages.classList.add('active');
        
        this.loadGroupMessages(groupId);
        this.scrollToBottom();
    }

    showConversationsList() {
        const conversationsList = document.getElementById('conversationsList');
        const privateChatMessages = document.getElementById('privateChatMessages');
        
        if (conversationsList) conversationsList.classList.add('active');
        if (privateChatMessages) privateChatMessages.classList.remove('active');
        
        this.currentConversation = null;
    }

    showGroupsList() {
        const groupsList = document.getElementById('groupsList');
        const groupChatMessages = document.getElementById('groupChatMessages');
        
        if (groupsList) groupsList.classList.add('active');
        if (groupChatMessages) groupChatMessages.classList.remove('active');
        
        this.currentGroup = null;
    }

    loadPrivateMessages(conversationId) {
        const messagesContainer = document.getElementById('privateMessages');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Load saved messages or create sample messages
        const messages = this.messageHistory.get(`private_${conversationId}`) || this.generateSamplePrivateMessages(conversationId);
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }

    loadGroupMessages(groupId) {
        const messagesContainer = document.getElementById('groupMessages');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Load saved messages or create sample messages
        const messages = this.messageHistory.get(`group_${groupId}`) || this.generateSampleGroupMessages(groupId);
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }

    generateSamplePrivateMessages(conversationId) {
        const sampleMessages = [
            {
                id: this.generateMessageId(),
                text: 'Chào bạn! Tôi cần hỗ trợ về vấn đề báo cáo.',
                sender: { name: 'Nguyễn Văn An', avatar: 'NV' },
                timestamp: new Date(Date.now() - 300000),
                type: 'received'
            },
            {
                id: this.generateMessageId(),
                text: 'Chào! Tôi có thể giúp gì cho bạn?',
                sender: this.currentUser,
                timestamp: new Date(Date.now() - 240000),
                type: 'sent'
            }
        ];
        
        this.messageHistory.set(`private_${conversationId}`, sampleMessages);
        return sampleMessages;
    }

    generateSampleGroupMessages(groupId) {
        const sampleMessages = [
            {
                id: this.generateMessageId(),
                text: 'Chào team! Meeting hôm nay lúc 14:00 nhé.',
                sender: { name: 'Project Manager', avatar: 'PM' },
                timestamp: new Date(Date.now() - 600000),
                type: 'received'
            },
            {
                id: this.generateMessageId(),
                text: 'OK, tôi sẽ chuẩn bị tài liệu.',
                sender: { name: 'Developer', avatar: 'DV' },
                timestamp: new Date(Date.now() - 540000),
                type: 'received'
            }
        ];
        
        this.messageHistory.set(`group_${groupId}`, sampleMessages);
        return sampleMessages;
    }

    scrollToBottom() {
        setTimeout(() => {
            const messagesContainer = this.getCurrentMessagesContainer();
            if (messagesContainer) {
                messagesContainer.scrollTo({
                    top: messagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    initializeOnlineStatus() {
        // Simulate online users
        this.onlineUsers.add('user1');
        this.onlineUsers.add('user2');
        this.onlineUsers.add('project1');
        
        this.updateOnlineStatus();
    }

    updateOnlineStatus() {
        // Update user status indicators
        document.querySelectorAll('.user-status').forEach(status => {
            status.textContent = 'Đang hoạt động';
            status.className = 'user-status online';
        });
        
        // Update group status
        document.querySelectorAll('.group-preview').forEach(preview => {
            if (preview.textContent.includes('•')) {
                preview.textContent = preview.textContent.replace(/• \w+/, '• Online');
            }
        });
    }

    markMessagesAsRead() {
        const chatKey = this.getCurrentChatKey();
        if (chatKey) {
            this.unreadCounts.set(chatKey, 0);
            this.updateUnreadDisplays();
        }
    }

    updateUnreadCount() {
        const chatKey = this.getCurrentChatKey();
        if (chatKey && !this.isOpen) {
            const currentCount = this.unreadCounts.get(chatKey) || 0;
            this.unreadCounts.set(chatKey, currentCount + 1);
            this.updateUnreadDisplays();
        }
    }

    getCurrentChatKey() {
        switch (this.currentTab) {
            case 'general':
                return 'general';
            case 'department':
                return 'department';
            case 'private':
                return this.currentConversation ? `private_${this.currentConversation}` : 'private';
            case 'group':
                return this.currentGroup ? `group_${this.currentGroup}` : 'group';
            default:
                return null;
        }
    }

    initializeUnreadCounts() {
        // Initialize with some sample unread counts
        this.unreadCounts.set('general', 0);
        this.unreadCounts.set('department', 0);
        this.unreadCounts.set('private_user1', 2);
        this.unreadCounts.set('group_project1', 1);
        
        this.updateUnreadDisplays();
    }

    updateUnreadDisplays() {
        // Update conversation unread badges
        document.querySelectorAll('.conversation-item').forEach(item => {
            const conversationId = item.getAttribute('data-conversation');
            const unreadElement = item.querySelector('.unread-count');
            const count = this.unreadCounts.get(`private_${conversationId}`) || 0;
            
            if (unreadElement) {
                if (count > 0) {
                    unreadElement.textContent = count;
                    unreadElement.style.display = 'block';
                } else {
                    unreadElement.style.display = 'none';
                }
            }
        });
        
        // Update group unread badges
        document.querySelectorAll('.group-item').forEach(item => {
            const groupId = item.getAttribute('data-group');
            const unreadElement = item.querySelector('.unread-count');
            const count = this.unreadCounts.get(`group_${groupId}`) || 0;
            
            if (unreadElement) {
                if (count > 0) {
                    unreadElement.textContent = count;
                    unreadElement.style.display = 'block';
                } else {
                    unreadElement.style.display = 'none';
                }
            }
        });
        
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const totalUnread = Array.from(this.unreadCounts.values()).reduce((sum, count) => sum + count, 0);
        const badge = document.getElementById('chatNotificationBadge');
        
        if (badge) {
            if (totalUnread > 0) {
                badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    storeMessageInHistory(messageData) {
        const chatKey = this.getCurrentChatKey();
        if (!chatKey) return;
        
        let messages = this.messageHistory.get(chatKey) || [];
        messages.push(messageData);
        
        // Keep only last 100 messages
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }
        
        this.messageHistory.set(chatKey, messages);
    }

    loadMessageHistory() {
        // Load from localStorage if available
        const saved = localStorage.getItem('chatMessageHistory');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.messageHistory = new Map(parsed);
            } catch (e) {
                console.warn('Failed to load chat history:', e);
            }
        }
    }

    saveMessageHistory() {
        try {
            const serialized = JSON.stringify(Array.from(this.messageHistory.entries()));
            localStorage.setItem('chatMessageHistory', serialized);
        } catch (e) {
            console.warn('Failed to save chat history:', e);
        }
    }

    startHeartbeat() {
        // Periodic tasks
        setInterval(() => {
            this.updateOnlineStatus();
            this.saveMessageHistory();
        }, 30000); // Every 30 seconds
    }

    updateLastActivity() {
        localStorage.setItem('chatLastActivity', new Date().toISOString());
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffMinutes < 1) {
            return 'Vừa xong';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} phút`;
        } else if (diffMinutes < 24 * 60) {
            return `${Math.floor(diffMinutes / 60)} giờ`;
        } else {
            return time.toLocaleDateString('vi-VN');
        }
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    replyToMessage(messageData) {
        const input = document.querySelector(`#${this.currentTab}ChatView .chat-input`);
        if (input) {
            input.value = `@${messageData.sender.name} `;
            input.focus();
        }
    }
}

// Initialize Enhanced Chat Widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedChatWidget = new EnhancedChatWidget();
    console.log('✅ Enhanced Chat Widget ready');
});