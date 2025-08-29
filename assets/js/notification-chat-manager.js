/**
 * Notification and Chat Management System
 * Handles notifications, chat functionality, and real-time communication
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.loadNotifications();
        this.isInitialized = true;
        
        console.log('✅ NotificationManager initialized');
    }

    bindEvents() {
        const notificationToggle = document.getElementById('notificationToggle');
        const markAllRead = document.getElementById('markAllRead');
        
        if (notificationToggle) {
            notificationToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationDropdown();
            });
        }

        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown && !dropdown.contains(e.target) && !notificationToggle?.contains(e.target)) {
                this.closeNotificationDropdown();
            }
        });
    }

    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    closeNotificationDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    async loadNotifications() {
        try {
            // Sample notifications - in production, this would come from API
            const sampleNotifications = [
                {
                    id: 1,
                    type: 'task',
                    title: 'Nhiệm vụ mới được giao',
                    message: 'Bạn có nhiệm vụ mới: Hoàn thành báo cáo tháng 12',
                    time: '5 phút trước',
                    unread: true,
                    icon: 'assignment'
                },
                {
                    id: 2,
                    type: 'attendance',
                    title: 'Yêu cầu nghỉ phép được duyệt',
                    message: 'Yêu cầu nghỉ phép ngày 15/12 đã được quản lý phê duyệt',
                    time: '1 giờ trước',
                    unread: true,
                    icon: 'event_available'
                },
                {
                    id: 3,
                    type: 'system',
                    title: 'Cập nhật hệ thống',
                    message: 'Hệ thống HR đã được cập nhật với các tính năng mới',
                    time: '2 giờ trước',
                    unread: false,
                    icon: 'system_update'
                }
            ];

            this.notifications = sampleNotifications;
            this.renderNotifications();
            this.updateBadgeCount();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        if (this.notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-chat">
                    <span class="material-icons-round">notifications_none</span>
                    <p>Không có thông báo mới</p>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">
                    <span class="material-icons-round">${notification.icon}</span>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        `).join('');

        // Add click events to notifications
        notificationList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.markAsRead(id);
            });
        });
    }

    updateBadgeCount() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        const unreadCount = this.notifications.filter(n => n.unread).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.unread = false;
            this.renderNotifications();
            this.updateBadgeCount();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.unread = false);
        this.renderNotifications();
        this.updateBadgeCount();
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            unread: true,
            time: 'Vừa xong',
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        this.renderNotifications();
        this.updateBadgeCount();
    }
}

class ChatManager {
    constructor() {
        this.currentRoom = 'general';
        this.currentPrivateChat = null;
        this.currentGroup = null;
        this.currentDepartment = null;
        this.isInitialized = false;
        this.isPanelOpen = false;
        this.isMinimized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.loadDepartments();
        this.loadPrivateChats();
        this.loadGroups();
        this.loadSampleMessages();
        this.isInitialized = true;
        
        console.log('✅ ChatManager initialized');
    }

    bindEvents() {
        // Chat toggle
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                this.toggleChatPanel();
            });
        }

        // Chat controls
        const minimizeChat = document.getElementById('minimizeChat');
        const closeChat = document.getElementById('closeChat');
        
        if (minimizeChat) {
            minimizeChat.addEventListener('click', () => {
                this.minimizeChatPanel();
            });
        }

        if (closeChat) {
            closeChat.addEventListener('click', () => {
                this.closeChatPanel();
            });
        }

        // Chat tabs
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const chatType = tab.dataset.chatType;
                this.switchChatRoom(chatType);
            });
        });

        // Chat inputs
        document.querySelectorAll('.chat-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const room = input.dataset.room;
                    this.sendMessage(room, input.value.trim());
                    input.value = '';
                }
            });
        });

        // Send buttons
        document.querySelectorAll('.chat-send').forEach(button => {
            button.addEventListener('click', () => {
                const room = button.dataset.room;
                const input = document.querySelector(`input[data-room="${room}"]`);
                if (input && input.value.trim()) {
                    this.sendMessage(room, input.value.trim());
                    input.value = '';
                }
            });
        });

        // Department selector
        const departmentSelect = document.getElementById('departmentSelect');
        if (departmentSelect) {
            departmentSelect.addEventListener('change', (e) => {
                this.switchDepartment(e.target.value);
            });
        }

        // Create group button
        const createGroupBtn = document.getElementById('createGroupBtn');
        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => {
                this.showCreateGroupModal();
            });
        }

        // Create group modal events
        const createGroupConfirm = document.getElementById('createGroupConfirm');
        if (createGroupConfirm) {
            createGroupConfirm.addEventListener('click', () => {
                this.createGroup();
            });
        }
    }

    toggleChatPanel() {
        const chatPanel = document.getElementById('chatPanel');
        if (!chatPanel) return;

        this.isPanelOpen = !this.isPanelOpen;
        
        if (this.isPanelOpen) {
            chatPanel.classList.add('active');
            this.updateChatBadge();
        } else {
            chatPanel.classList.remove('active');
        }
    }

    minimizeChatPanel() {
        // For now, just close the panel
        this.closeChatPanel();
    }

    closeChatPanel() {
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) {
            chatPanel.classList.remove('active');
            this.isPanelOpen = false;
        }
    }

    switchChatRoom(roomType) {
        // Update tabs
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.querySelector(`[data-tab="${roomType}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.warn(`Chat tab with data-tab="${roomType}" not found`);
        }

        // Update rooms (for this simple implementation, we just hide/show content)
        // Since the HRMS implementation uses a single chat-content area
        const chatContent = document.querySelector('.chat-content');
        if (chatContent) {
            // For simple implementation, just update the content
            // In a full implementation, you'd have separate room divs
            console.log(`Switched to ${roomType} chat room`);
        }

        this.currentRoom = roomType;
    }

    async loadDepartments() {
        try {
            // Sample departments - in production, load from API
            const departments = [
                { id: 1, name: 'Nhân sự' },
                { id: 2, name: 'Kế toán' },
                { id: 3, name: 'Bán hàng' },
                { id: 4, name: 'Kỹ thuật' },
                { id: 5, name: 'Marketing' }
            ];

            const departmentSelect = document.getElementById('departmentSelect');
            if (departmentSelect) {
                departmentSelect.innerHTML = '<option value="">Chọn phòng ban</option>' +
                    departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    async loadPrivateChats() {
        try {
            // Sample private chats - in production, load from API
            const privateChats = [
                { id: 1, name: 'Nguyễn Văn A', lastMessage: 'Chào bạn!', unread: 2 },
                { id: 2, name: 'Trần Thị B', lastMessage: 'Báo cáo đã xong', unread: 0 },
                { id: 3, name: 'Lê Văn C', lastMessage: 'Meeting lúc 2h', unread: 1 }
            ];

            const privateChatList = document.getElementById('privateChatList');
            if (privateChatList) {
                privateChatList.innerHTML = privateChats.map(chat => `
                    <div class="private-chat-item" data-chat-id="${chat.id}">
                        <div class="private-chat-name">${chat.name}</div>
                        ${chat.unread > 0 ? `<div class="private-chat-unread">${chat.unread}</div>` : ''}
                    </div>
                `).join('');

                // Add click events
                privateChatList.querySelectorAll('.private-chat-item').forEach(item => {
                    item.addEventListener('click', () => {
                        this.switchPrivateChat(item.dataset.chatId);
                    });
                });
            }
        } catch (error) {
            console.error('Error loading private chats:', error);
        }
    }

    async loadGroups() {
        try {
            // Sample groups - in production, load from API
            const groups = [
                { id: 1, name: 'Team Nhân sự', members: 5, unread: 3 },
                { id: 2, name: 'Dự án ABC', members: 8, unread: 0 },
                { id: 3, name: 'Thông báo chung', members: 23, unread: 1 }
            ];

            const groupList = document.getElementById('groupList');
            if (groupList) {
                groupList.innerHTML = groups.map(group => `
                    <div class="group-item" data-group-id="${group.id}">
                        <div class="group-name">${group.name}</div>
                        <div class="group-members">${group.members} thành viên</div>
                        ${group.unread > 0 ? `<div class="group-unread">${group.unread}</div>` : ''}
                    </div>
                `).join('');

                // Add click events
                groupList.querySelectorAll('.group-item').forEach(item => {
                    item.addEventListener('click', () => {
                        this.switchGroup(item.dataset.groupId);
                    });
                });
            }
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    }

    loadSampleMessages() {
        // Load sample messages for general chat
        const generalMessages = document.getElementById('generalMessages');
        if (generalMessages) {
            const sampleMessages = [
                {
                    id: 1,
                    sender: 'Nguyễn Văn A',
                    message: 'Chào mọi người! Hôm nay có ai ở văn phòng không?',
                    time: '10:30',
                    own: false,
                    avatar: 'NA'
                },
                {
                    id: 2,
                    sender: 'Tôi',
                    message: 'Mình đang ở đây. Bạn cần hỗ trợ gì không?',
                    time: '10:32',
                    own: true,
                    avatar: 'T'
                },
                {
                    id: 3,
                    sender: 'Trần Thị B',
                    message: 'Meeting lúc 2h có thay đổi địa điểm không nhỉ?',
                    time: '10:35',
                    own: false,
                    avatar: 'TB'
                }
            ];

            const messagesHtml = sampleMessages.map(msg => this.createMessageElement(msg)).join('');
            generalMessages.innerHTML = '<div class="message-day">Hôm nay</div>' + messagesHtml;
        }
    }

    createMessageElement(message) {
        return `
            <div class="chat-message ${message.own ? 'own' : ''}">
                ${!message.own ? `<div class="message-avatar">${message.avatar}</div>` : ''}
                <div class="message-content">
                    ${!message.own ? `
                        <div class="message-header">
                            <span class="message-sender">${message.sender}</span>
                            <span class="message-time">${message.time}</span>
                        </div>
                    ` : ''}
                    <div class="message-text">${message.message}</div>
                    ${message.own ? `<div class="message-time" style="text-align: right; margin-top: 2px; font-size: 10px; color: rgba(255,255,255,0.7);">${message.time}</div>` : ''}
                </div>
                ${message.own ? `<div class="message-avatar">${message.avatar}</div>` : ''}
            </div>
        `;
    }

    sendMessage(room, message) {
        if (!message) return;

        const messagesContainer = document.getElementById(`${room}Messages`);
        if (!messagesContainer) return;

        const newMessage = {
            id: Date.now(),
            sender: 'Tôi',
            message: message,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            own: true,
            avatar: 'T'
        };

        const messageElement = this.createMessageElement(newMessage);
        messagesContainer.insertAdjacentHTML('beforeend', messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simulate response (in production, this would be real-time)
        if (room === 'general') {
            setTimeout(() => {
                const responseMessage = {
                    id: Date.now() + 1,
                    sender: 'Hệ thống',
                    message: 'Tin nhắn đã được gửi đến tất cả thành viên.',
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    own: false,
                    avatar: 'HT'
                };
                const responseElement = this.createMessageElement(responseMessage);
                messagesContainer.insertAdjacentHTML('beforeend', responseElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
        }
    }

    switchDepartment(departmentId) {
        this.currentDepartment = departmentId;
        const input = document.querySelector('input[data-room="department"]');
        const sendBtn = document.querySelector('button[data-room="department"]');
        
        if (departmentId) {
            input.disabled = false;
            sendBtn.disabled = false;
            
            // Load department messages
            const messagesContainer = document.getElementById('departmentMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '<div class="message-day">Hôm nay</div>';
            }
        } else {
            input.disabled = true;
            sendBtn.disabled = true;
        }
    }

    switchPrivateChat(chatId) {
        this.currentPrivateChat = chatId;
        
        // Update active state
        document.querySelectorAll('.private-chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('active');
        
        // Enable input
        const input = document.querySelector('input[data-room="private"]');
        const sendBtn = document.querySelector('button[data-room="private"]');
        input.disabled = false;
        sendBtn.disabled = false;
        
        // Update header and load messages
        const header = document.getElementById('privateChatHeader');
        if (header) {
            header.innerHTML = `Chat với: Người dùng ${chatId}`;
        }
    }

    switchGroup(groupId) {
        this.currentGroup = groupId;
        
        // Update active state
        document.querySelectorAll('.group-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-group-id="${groupId}"]`).classList.add('active');
        
        // Enable input
        const input = document.querySelector('input[data-room="group"]');
        const sendBtn = document.querySelector('button[data-room="group"]');
        input.disabled = false;
        sendBtn.disabled = false;
    }

    showCreateGroupModal() {
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.classList.add('active');
            this.loadMemberSelection();
        }
    }

    async loadMemberSelection() {
        try {
            // Sample employees - in production, load from API
            const employees = [
                { id: 1, name: 'Nguyễn Văn A', role: 'Nhân viên' },
                { id: 2, name: 'Trần Thị B', role: 'Quản lý' },
                { id: 3, name: 'Lê Văn C', role: 'Nhân viên' },
                { id: 4, name: 'Phạm Thị D', role: 'Trưởng phòng' }
            ];

            const memberSelection = document.getElementById('memberSelection');
            if (memberSelection) {
                memberSelection.innerHTML = employees.map(emp => `
                    <div class="member-option">
                        <input type="checkbox" class="member-checkbox" value="${emp.id}" id="member-${emp.id}">
                        <div class="member-avatar">${emp.name.charAt(0)}</div>
                        <div class="member-info">
                            <div class="member-name">${emp.name}</div>
                            <div class="member-role">${emp.role}</div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading member selection:', error);
        }
    }

    createGroup() {
        const groupName = document.getElementById('groupName').value.trim();
        const groupDescription = document.getElementById('groupDescription').value.trim();
        const selectedMembers = Array.from(document.querySelectorAll('.member-checkbox:checked'))
            .map(cb => cb.value);

        if (!groupName || selectedMembers.length === 0) {
            alert('Vui lòng nhập tên nhóm và chọn ít nhất một thành viên');
            return;
        }

        // Create group (in production, send to API)
        console.log('Creating group:', { groupName, groupDescription, selectedMembers });
        
        // Close modal
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reload groups
        this.loadGroups();
        
        // Show success message
        alert('Nhóm đã được tạo thành công!');
    }

    updateChatBadge() {
        const badge = document.getElementById('chatNotificationBadge');
        if (!badge) return;

        // Simulate unread count (in production, get from API)
        const unreadCount = this.isPanelOpen ? 0 : 2;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationManager, ChatManager };
}