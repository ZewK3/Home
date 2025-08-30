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
                    const targetId = trigger.getAttribute('data-menu-toggle');
                    const submenu = document.getElementById(targetId);
                    const chevron = trigger.querySelector('.nav-chevron');
                    
                    if (submenu) {
                        const isExpanded = submenu.classList.contains('expanded');
                        
                        // Close all other submenus
                        this.closeAllDesktopSubmenus();
                        
                        if (!isExpanded) {
                            // Open this submenu
                            submenu.classList.add('expanded');
                            submenu.style.maxHeight = submenu.scrollHeight + 'px';
                            if (chevron) {
                                chevron.style.transform = 'rotate(180deg)';
                            }
                            trigger.setAttribute('aria-expanded', 'true');
                        } else {
                            // Close this submenu
                            submenu.classList.remove('expanded');
                            submenu.style.maxHeight = '0';
                            if (chevron) {
                                chevron.style.transform = 'rotate(0deg)';
                            }
                            trigger.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });
    }
    
    // Mobile Sidebar Accordion
    bindMobileAccordion() {
        const mobileAccordionTriggers = document.querySelectorAll('[data-mobile-menu-toggle]');
        
        mobileAccordionTriggers.forEach(trigger => {
            const titleElement = trigger.querySelector('.mobile-nav-title.expandable');
            if (titleElement) {
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = trigger.getAttribute('data-mobile-menu-toggle');
                    const submenu = document.getElementById(targetId);
                    const chevron = trigger.querySelector('.mobile-nav-chevron');
                    
                    if (submenu) {
                        const isExpanded = submenu.classList.contains('mobile-expanded');
                        
                        // Close all other mobile submenus
                        this.closeAllMobileSubmenus();
                        
                        if (!isExpanded) {
                            // Open this submenu
                            submenu.classList.add('mobile-expanded');
                            submenu.style.maxHeight = submenu.scrollHeight + 'px';
                            if (chevron) {
                                chevron.style.transform = 'rotate(180deg)';
                            }
                            trigger.setAttribute('aria-expanded', 'true');
                        } else {
                            // Close this submenu
                            submenu.classList.remove('mobile-expanded');
                            submenu.style.maxHeight = '0';
                            if (chevron) {
                                chevron.style.transform = 'rotate(0deg)';
                            }
                            trigger.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });
    }
    
    // Fix mobile menu link functionality
    bindMobileMenuLinks() {
        // Remove mobile prefixes and sync with desktop handlers
        const mobileLinks = [
            { id: 'mobileWorkManagement', handler: 'openWorkManagement' },
            { id: 'mobileTimesheet', handler: 'showTimesheet' },
            { id: 'mobileAttendance', handler: 'showAttendanceGPS' },
            { id: 'mobileWorkTasks', handler: 'openWorkTasks' },
            { id: 'mobileSubmitRequest', handler: 'openSubmitRequest' },
            { id: 'mobileAttendanceRequest', handler: 'openAttendanceRequest' },
            { id: 'mobileTaskAssignment', handler: 'openTaskAssignment' },
            { id: 'mobileShiftAssignment', handler: 'showShiftAssignment' },
            { id: 'mobileTaskProcessing', handler: 'openTaskProcessing' },
            { id: 'mobileRegistrationApproval', handler: 'openRegistrationApproval' },
            { id: 'mobileGrantAccess', handler: 'openGrantAccess' },
            { id: 'mobilePersonalInformation', handler: 'showPersonalInfo' }
        ];
        
        mobileLinks.forEach(link => {
            const element = document.getElementById(link.id);
            if (element) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Close mobile sidebar after selection
                    this.closeMobileSidebar();
                    
                    // Call the appropriate handler
                    if (window.ContentManager && typeof window.ContentManager[link.handler] === 'function') {
                        window.ContentManager[link.handler]();
                    } else if (window[link.handler] && typeof window[link.handler] === 'function') {
                        window[link.handler]();
                    } else {
                        console.warn(`Handler ${link.handler} not found for ${link.id}`);
                    }
                });
            }
        });
    }
    
    closeAllDesktopSubmenus() {
        const allSubmenus = document.querySelectorAll('.nav-submenu');
        const allChevrons = document.querySelectorAll('.nav-chevron');
        const allTriggers = document.querySelectorAll('[data-menu-toggle]');
        
        allSubmenus.forEach(submenu => {
            submenu.classList.remove('expanded');
            submenu.style.maxHeight = '0';
        });
        
        allChevrons.forEach(chevron => {
            chevron.style.transform = 'rotate(0deg)';
        });
        
        allTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
        });
    }
    
    closeAllMobileSubmenus() {
        const allMobileSubmenus = document.querySelectorAll('.mobile-nav-submenu');
        const allMobileChevrons = document.querySelectorAll('.mobile-nav-chevron');
        const allMobileTriggers = document.querySelectorAll('[data-mobile-menu-toggle]');
        
        allMobileSubmenus.forEach(submenu => {
            submenu.classList.remove('mobile-expanded');
            submenu.style.maxHeight = '0';
        });
        
        allMobileChevrons.forEach(chevron => {
            chevron.style.transform = 'rotate(0deg)';
        });
        
        allMobileTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
        });
    }
    
    closeMobileSidebar() {
        const mobileSidebar = document.getElementById('mobileSidebar');
        const btnSidebar = document.getElementById('btnSidebar');
        
        if (mobileSidebar) {
            mobileSidebar.setAttribute('hidden', '');
            if (btnSidebar) {
                btnSidebar.setAttribute('aria-expanded', 'false');
            }
        }
    }
}

// Chat Panel Mobile Optimization
class ChatPanelManager {
    constructor() {
        this.chatPanel = document.getElementById('chatPanel');
        this.chatToggle = document.getElementById('chatToggle');
        this.closeChat = document.getElementById('closeChat');
        this.init();
    }
    
    init() {
        this.bindChatToggle();
        this.bindChatClose();
        this.bindTabSwitching();
        this.optimizeForMobile();
    }
    
    bindChatToggle() {
        if (this.chatToggle) {
            this.chatToggle.addEventListener('click', () => {
                if (this.chatPanel) {
                    const isVisible = this.chatPanel.classList.contains('active');
                    
                    if (isVisible) {
                        this.closeChat();
                    } else {
                        this.openChat();
                    }
                }
            });
        }
    }
    
    bindChatClose() {
        if (this.closeChat) {
            this.closeChat.addEventListener('click', () => {
                this.closeChat();
            });
        }
    }
    
    bindTabSwitching() {
        const chatTabs = document.querySelectorAll('.chat-tab');
        
        chatTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.getAttribute('data-tab');
                this.switchChatTab(tabType);
            });
        });
    }
    
    switchChatTab(tabType) {
        // Remove active class from all tabs
        const allTabs = document.querySelectorAll('.chat-tab');
        allTabs.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to selected tab
        const selectedTab = document.querySelector(`[data-tab="${tabType}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Hide all chat views
        const allViews = document.querySelectorAll('.chat-view');
        allViews.forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });
        
        // Show selected chat view
        const selectedView = document.getElementById(`${tabType}Chat`);
        if (selectedView) {
            selectedView.classList.add('active');
            selectedView.style.display = 'block';
        }
    }
    
    openChat() {
        if (this.chatPanel) {
            this.chatPanel.classList.add('active');
            
            // Mobile fullscreen optimization
            if (window.innerWidth <= 768) {
                this.chatPanel.classList.add('mobile-fullscreen');
                document.body.classList.add('chat-open');
            }
        }
    }
    
    closeChat() {
        if (this.chatPanel) {
            this.chatPanel.classList.remove('active');
            this.chatPanel.classList.remove('mobile-fullscreen');
            document.body.classList.remove('chat-open');
        }
    }
    
    optimizeForMobile() {
        // Add mobile-specific event listeners
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.chatPanel.classList.contains('mobile-fullscreen')) {
                this.chatPanel.classList.remove('mobile-fullscreen');
                document.body.classList.remove('chat-open');
            }
        });
        
        // Handle escape key for mobile
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.chatPanel.classList.contains('mobile-fullscreen')) {
                this.closeChat();
            }
        });
    }
}

// Enhanced Notification Items
class NotificationManager {
    constructor() {
        this.notificationDropdown = document.getElementById('notificationDropdown');
        this.notificationToggle = document.getElementById('notificationToggle');
        this.notificationList = document.getElementById('notificationList');
        this.init();
    }
    
    init() {
        this.bindNotificationToggle();
        this.loadNotifications();
        this.optimizeForMobile();
    }
    
    bindNotificationToggle() {
        if (this.notificationToggle) {
            this.notificationToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.notificationDropdown && !this.notificationDropdown.contains(e.target) && !this.notificationToggle.contains(e.target)) {
                this.closeNotificationDropdown();
            }
        });
    }
    
    toggleNotificationDropdown() {
        if (this.notificationDropdown) {
            const isVisible = this.notificationDropdown.classList.contains('active');
            
            if (isVisible) {
                this.closeNotificationDropdown();
            } else {
                this.openNotificationDropdown();
            }
        }
    }
    
    openNotificationDropdown() {
        if (this.notificationDropdown) {
            this.notificationDropdown.classList.add('active');
            this.notificationToggle.setAttribute('aria-expanded', 'true');
        }
    }
    
    closeNotificationDropdown() {
        if (this.notificationDropdown) {
            this.notificationDropdown.classList.remove('active');
            this.notificationToggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    loadNotifications() {
        if (!this.notificationList) return;
        
        // Sample notifications with GitHub-style design
        const notifications = [
            {
                id: 1,
                title: 'Yêu cầu nghỉ phép mới',
                message: 'Nguyễn Văn A đã gửi yêu cầu nghỉ phép từ 25/01 đến 27/01',
                time: '2 phút trước',
                unread: true,
                type: 'request'
            },
            {
                id: 2,
                title: 'Cập nhật hệ thống',
                message: 'Hệ thống sẽ được bảo trì vào 26/01 từ 2:00-4:00 AM',
                time: '1 giờ trước',
                unread: true,
                type: 'system'
            },
            {
                id: 3,
                title: 'Báo cáo tháng đã sẵn sàng',
                message: 'Báo cáo chấm công tháng 1/2025 đã được tạo',
                time: '3 giờ trước',
                unread: false,
                type: 'report'
            }
        ];
        
        this.renderNotifications(notifications);
    }
    
    renderNotifications(notifications) {
        if (!this.notificationList) return;
        
        this.notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                ${notification.unread ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');
        
        // Bind click events for notifications
        this.bindNotificationClicks();
    }
    
    getNotificationIcon(type) {
        const icons = {
            request: '<span class="material-icons-round">assignment</span>',
            system: '<span class="material-icons-round">info</span>',
            report: '<span class="material-icons-round">analytics</span>',
            message: '<span class="material-icons-round">message</span>',
            alert: '<span class="material-icons-round">warning</span>'
        };
        
        return icons[type] || icons.message;
    }
    
    bindNotificationClicks() {
        const notificationItems = this.notificationList.querySelectorAll('.notification-item');
        
        notificationItems.forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.getAttribute('data-id');
                this.markAsRead(notificationId);
                this.handleNotificationClick(notificationId);
            });
        });
    }
    
    markAsRead(notificationId) {
        const item = this.notificationList.querySelector(`[data-id="${notificationId}"]`);
        if (item) {
            item.classList.remove('unread');
            const dot = item.querySelector('.notification-dot');
            if (dot) {
                dot.remove();
            }
        }
    }
    
    handleNotificationClick(notificationId) {
        // Handle notification click based on type/id
        console.log('Notification clicked:', notificationId);
        this.closeNotificationDropdown();
    }
    
    optimizeForMobile() {
        // Mobile-specific optimizations for notification dropdown
        if (window.innerWidth <= 768) {
            if (this.notificationDropdown) {
                this.notificationDropdown.classList.add('mobile-optimized');
            }
        }
        
        window.addEventListener('resize', () => {
            if (this.notificationDropdown) {
                if (window.innerWidth <= 768) {
                    this.notificationDropdown.classList.add('mobile-optimized');
                } else {
                    this.notificationDropdown.classList.remove('mobile-optimized');
                }
            }
        });
    }
}

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar accordion
    new SidebarAccordion();
    
    // Initialize chat panel manager
    new ChatPanelManager();
    
    // Initialize notification manager
    new NotificationManager();
    
    console.log('Dashboard enhancements initialized successfully');
});