// Dashboard Sidebar Accordion Manager
class SidebarAccordion {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindDesktopAccordion();
        this.bindMobileAccordion();
        this.bindMobileMenuLinks();
    }
    
    // Desktop Sidebar Accordion
    bindDesktopAccordion() {
        const accordionTriggers = document.querySelectorAll('[data-menu-toggle]');
        
        accordionTriggers.forEach(trigger => {
            const titleElement = trigger.querySelector('.nav-title.expandable');
            if (titleElement) {
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const submenu = trigger.querySelector('.nav-submenu');
                    const icon = trigger.querySelector('.expand-icon');
                    
                    if (submenu) {
                        const isOpen = submenu.style.maxHeight && submenu.style.maxHeight !== '0px';
                        
                        // Close all other accordion items
                        accordionTriggers.forEach(otherTrigger => {
                            if (otherTrigger !== trigger) {
                                const otherSubmenu = otherTrigger.querySelector('.nav-submenu');
                                const otherIcon = otherTrigger.querySelector('.expand-icon');
                                if (otherSubmenu) {
                                    otherSubmenu.style.maxHeight = '0px';
                                    otherSubmenu.style.opacity = '0';
                                    otherTrigger.classList.remove('expanded');
                                }
                                if (otherIcon) {
                                    otherIcon.style.transform = 'rotate(0deg)';
                                }
                            }
                        });
                        
                        // Toggle current item
                        if (isOpen) {
                            submenu.style.maxHeight = '0px';
                            submenu.style.opacity = '0';
                            trigger.classList.remove('expanded');
                            if (icon) icon.style.transform = 'rotate(0deg)';
                        } else {
                            submenu.style.maxHeight = submenu.scrollHeight + 'px';
                            submenu.style.opacity = '1';
                            trigger.classList.add('expanded');
                            if (icon) icon.style.transform = 'rotate(180deg)';
                        }
                    }
                });
            }
        });
    }
    
    // Mobile Sidebar Accordion
    bindMobileAccordion() {
        const mobileToggleButtons = document.querySelectorAll('.mobile-nav-toggle');
        
        mobileToggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = button.nextElementSibling;
                if (submenu && submenu.classList.contains('mobile-submenu')) {
                    const isOpen = submenu.style.maxHeight && submenu.style.maxHeight !== '0px';
                    
                    if (isOpen) {
                        submenu.style.maxHeight = '0px';
                        button.classList.remove('expanded');
                    } else {
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                        button.classList.add('expanded');
                    }
                }
            });
        });
    }
    
    // Bind mobile menu links
    bindMobileMenuLinks() {
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
        
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const targetFunction = link.getAttribute('onclick');
                
                if (href && href !== '#') {
                    // Regular href navigation
                    return;
                } else if (targetFunction) {
                    // Execute onclick function
                    e.preventDefault();
                    eval(targetFunction);
                } else {
                    // Handle as content manager function
                    e.preventDefault();
                    const linkText = link.textContent.trim();
                    this.handleMobileMenuAction(linkText);
                }
                
                // Close mobile menu after action
                this.closeMobileMenu();
            });
        });
    }
    
    handleMobileMenuAction(actionText) {
        // Map mobile menu actions to content manager functions
        const actionMap = {
            'Chấm công': () => window.ContentManager?.showAttendance(),
            'Thông tin cá nhân': () => window.ContentManager?.showPersonalInfo(),
            'Phân công nhiệm vụ': () => window.ContentManager?.showTaskAssignment(),
            'Bảng chấm công': () => window.ContentManager?.showTimesheet(),
            'Cấp quyền truy cập': () => window.ContentManager?.showGrantAccess(),
            'Thống kê': () => window.ContentManager?.showStatistics()
        };
        
        const action = actionMap[actionText];
        if (action) {
            action();
        }
    }
    
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuIcon = document.querySelector('.menu-icon');
        const closeIcon = document.querySelector('.close-icon');
        
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
        if (menuIcon) {
            menuIcon.style.display = 'block';
        }
        if (closeIcon) {
            closeIcon.style.display = 'none';
        }
    }
}

// Enhanced ChatPanel Manager for Professional Communication
class ChatPanelManager {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'general';
        this.currentView = 'conversations'; // 'conversations' or 'chat'
        this.selectedConversation = null;
        this.selectedGroup = null;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.optimizeForMobile();
        this.initializeTabs();
    }
    
    bindEvents() {
        // Chat panel toggle
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                this.toggleChatPanel();
            });
        }
        
        // Chat minimize
        const chatMinimize = document.getElementById('chatMinimize');
        if (chatMinimize) {
            chatMinimize.addEventListener('click', () => {
                this.toggleChatPanel();
            });
        }
        
        // Mobile close button
        const mobileCloseChat = document.getElementById('mobileCloseChat');
        if (mobileCloseChat) {
            mobileCloseChat.addEventListener('click', () => {
                this.toggleChatPanel();
            });
        }
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.chat-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }
    
    toggleChatPanel() {
        this.isOpen = !this.isOpen;
        const chatPanel = document.getElementById('chatPanel');
        const chatToggle = document.getElementById('chatToggle');
        
        if (chatPanel) {
            if (this.isOpen) {
                chatPanel.classList.add('open');
                chatToggle?.classList.add('active');
                
                // On mobile, add fullscreen class
                if (window.innerWidth <= 768) {
                    chatPanel.classList.add('mobile-fullscreen');
                }
                
                // Load initial content
                this.loadInitialContent();
            } else {
                chatPanel.classList.remove('open', 'mobile-fullscreen');
                chatToggle?.classList.remove('active');
            }
        }
    }
    
    switchTab(tabId) {
        this.currentTab = tabId;
        this.currentView = 'conversations';
        
        // Update tab buttons
        document.querySelectorAll('.chat-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        
        // Load tab content
        this.loadTabContent(tabId);
        
        // Update header
        this.updateChatHeader(tabId);
    }
    
    loadTabContent(tabId) {
        const chatView = document.getElementById('chatView');
        if (!chatView) return;
        
        switch (tabId) {
            case 'general':
                this.loadGeneralChat();
                break;
            case 'department':
                this.loadDepartmentChat();
                break;
            case 'private':
                this.loadPrivateConversations();
                break;
            case 'group':
                this.loadGroupConversations();
                break;
        }
    }
    
    loadGeneralChat() {
        const chatView = document.getElementById('chatView');
        chatView.innerHTML = `
            <div class="chat-messages" id="generalMessages">
                <div class="message received">
                    <div class="message-avatar">
                        <span class="material-icons-round">person</span>
                    </div>
                    <div class="message-content">
                        <div class="message-sender">Admin</div>
                        <div class="message-text">Chào mừng đến với chat chung!</div>
                        <div class="message-time">10:30</div>
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-input-container">
                    <input type="text" id="generalChatInput" placeholder="Nhập tin nhắn...">
                    <button class="send-btn" onclick="this.parentNode.parentNode.parentNode.querySelector('.chat-messages').innerHTML += '<div class=&quot;message sent&quot;><div class=&quot;message-content&quot;><div class=&quot;message-text&quot;>' + this.parentNode.querySelector('input').value + '</div><div class=&quot;message-time&quot;>' + new Date().toLocaleTimeString() + '</div></div></div>'; this.parentNode.querySelector('input').value = '';">
                        <span class="material-icons-round">send</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    loadDepartmentChat() {
        // Auto-show user's department chat (no dropdown selection needed)
        const userDepartment = 'Phòng Nhân sự'; // This would come from user data
        
        const chatView = document.getElementById('chatView');
        chatView.innerHTML = `
            <div class="department-header">
                <h4>${userDepartment}</h4>
                <p>Chat nội bộ phòng ban</p>
            </div>
            <div class="chat-messages" id="departmentMessages">
                <div class="message received">
                    <div class="message-avatar">
                        <span class="material-icons-round">person</span>
                    </div>
                    <div class="message-content">
                        <div class="message-sender">Nguyễn Văn A</div>
                        <div class="message-text">Cuộc họp ngày mai có thay đổi gì không?</div>
                        <div class="message-time">09:15</div>
                    </div>
                </div>
                <div class="message sent">
                    <div class="message-content">
                        <div class="message-text">Vẫn giữ nguyên như kế hoạch</div>
                        <div class="message-time">09:20</div>
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-input-container">
                    <input type="text" id="departmentChatInput" placeholder="Nhập tin nhắn cho ${userDepartment}...">
                    <button class="send-btn">
                        <span class="material-icons-round">send</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    loadPrivateConversations() {
        if (this.currentView === 'conversations') {
            this.showConversationsList('private');
        } else {
            this.showChatView('private');
        }
    }
    
    loadGroupConversations() {
        if (this.currentView === 'conversations') {
            this.showConversationsList('group');
        } else {
            this.showChatView('group');
        }
    }
    
    showConversationsList(type) {
        const chatView = document.getElementById('chatView');
        
        if (type === 'private') {
            chatView.innerHTML = `
                <div class="conversations-list">
                    <div class="conversations-header">
                        <h4>Tin nhắn riêng</h4>
                        <button class="new-conversation-btn">
                            <span class="material-icons-round">add</span>
                        </button>
                    </div>
                    <div class="conversation-items">
                        <div class="conversation-item" onclick="window.chatPanelManager.selectConversation('user1')">
                            <div class="conversation-avatar">
                                <span class="material-icons-round">person</span>
                            </div>
                            <div class="conversation-content">
                                <div class="conversation-name">Nguyễn Văn A</div>
                                <div class="conversation-preview">Tài liệu đã gửi cho bạn</div>
                                <div class="conversation-time">2 phút</div>
                            </div>
                            <div class="conversation-badge">2</div>
                        </div>
                        <div class="conversation-item" onclick="window.chatPanelManager.selectConversation('user2')">
                            <div class="conversation-avatar">
                                <span class="material-icons-round">person</span>
                            </div>
                            <div class="conversation-content">
                                <div class="conversation-name">Trần Thị B</div>
                                <div class="conversation-preview">Ok, cảm ơn bạn</div>
                                <div class="conversation-time">1 giờ</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (type === 'group') {
            chatView.innerHTML = `
                <div class="conversations-list">
                    <div class="conversations-header">
                        <h4>Nhóm chat</h4>
                        <button class="new-conversation-btn">
                            <span class="material-icons-round">add</span>
                        </button>
                    </div>
                    <div class="conversation-items">
                        <div class="conversation-item" onclick="window.chatPanelManager.selectGroup('group1')">
                            <div class="conversation-avatar group">
                                <span class="material-icons-round">group</span>
                            </div>
                            <div class="conversation-content">
                                <div class="conversation-name">Dự án Q1</div>
                                <div class="conversation-preview">5 thành viên</div>
                                <div class="conversation-time">30 phút</div>
                            </div>
                            <div class="conversation-badge">5</div>
                        </div>
                        <div class="conversation-item" onclick="window.chatPanelManager.selectGroup('group2')">
                            <div class="conversation-avatar group">
                                <span class="material-icons-round">group</span>
                            </div>
                            <div class="conversation-content">
                                <div class="conversation-name">Team Marketing</div>
                                <div class="conversation-preview">8 thành viên</div>
                                <div class="conversation-time">2 giờ</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    selectConversation(userId) {
        this.selectedConversation = userId;
        this.currentView = 'chat';
        this.showChatView('private');
    }
    
    selectGroup(groupId) {
        this.selectedGroup = groupId;
        this.currentView = 'chat';
        this.showChatView('group');
    }
    
    showChatView(type) {
        const chatView = document.getElementById('chatView');
        
        if (type === 'private') {
            chatView.innerHTML = `
                <div class="chat-header-nav">
                    <button class="back-btn" onclick="window.chatPanelManager.backToConversations()">
                        <span class="material-icons-round">arrow_back</span>
                    </button>
                    <div class="chat-contact-info">
                        <span class="material-icons-round">person</span>
                        <span>Nguyễn Văn A</span>
                    </div>
                </div>
                <div class="chat-messages">
                    <!-- Private messages here -->
                </div>
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <input type="text" placeholder="Nhập tin nhắn riêng...">
                        <button class="send-btn">
                            <span class="material-icons-round">send</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'group') {
            chatView.innerHTML = `
                <div class="chat-header-nav">
                    <button class="back-btn" onclick="window.chatPanelManager.backToConversations()">
                        <span class="material-icons-round">arrow_back</span>
                    </button>
                    <div class="chat-contact-info">
                        <span class="material-icons-round">group</span>
                        <span>Dự án Q1</span>
                    </div>
                </div>
                <div class="chat-messages">
                    <!-- Group messages here -->
                </div>
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <input type="text" placeholder="Nhập tin nhắn nhóm...">
                        <button class="send-btn">
                            <span class="material-icons-round">send</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    backToConversations() {
        this.currentView = 'conversations';
        if (this.currentTab === 'private') {
            this.loadPrivateConversations();
        } else if (this.currentTab === 'group') {
            this.loadGroupConversations();
        }
    }
    
    updateChatHeader(tabId) {
        const chatHeader = document.querySelector('.chat-header h3');
        if (chatHeader) {
            const titles = {
                'general': 'Chat chung',
                'department': 'Chat phòng ban',
                'private': 'Tin nhắn riêng',
                'group': 'Nhóm chat'
            };
            chatHeader.textContent = titles[tabId] || 'Chat';
        }
    }
    
    loadInitialContent() {
        this.loadTabContent(this.currentTab);
    }
    
    optimizeForMobile() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMobileView = (e) => {
            const chatPanel = document.getElementById('chatPanel');
            if (!chatPanel) return;
            
            if (e.matches) {
                // Mobile optimizations
                chatPanel.style.width = '100vw';
                chatPanel.style.height = '100vh';
                chatPanel.style.position = 'fixed';
                chatPanel.style.top = '0';
                chatPanel.style.left = '0';
                chatPanel.style.zIndex = '9999';
            } else {
                // Desktop view
                chatPanel.style.width = '';
                chatPanel.style.height = '';
                chatPanel.style.position = '';
                chatPanel.style.top = '';
                chatPanel.style.left = '';
                chatPanel.style.zIndex = '';
            }
        };
        
        mediaQuery.addEventListener('change', handleMobileView);
        handleMobileView(mediaQuery);
    }
}

// Notification functionality is handled by notification-chat-manager.js
// This file focuses on sidebar accordion and chat panel management

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar accordion
    new SidebarAccordion();
    
    // Initialize chat panel manager
    window.chatPanelManager = new ChatPanelManager();
    
    // NotificationManager is initialized by notification-chat-manager.js
    
    console.log('Dashboard enhancements initialized successfully');
});