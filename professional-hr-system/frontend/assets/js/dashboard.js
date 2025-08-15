/**
 * Professional HR Management System - Dashboard JavaScript
 * Modern, feature-rich dashboard with real-time updates
 */

class ProfessionalDashboard {
    constructor() {
        this.apiBaseUrl = 'https://your-cloudflare-worker.your-domain.workers.dev/api/v1';
        this.currentPage = 'dashboard';
        this.userData = null;
        this.authToken = null;
        this.refreshInterval = null;
        this.notifications = [];
        
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Load user data
            await this.loadUserData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
            // Hide loading screen and show dashboard
            this.hideLoadingScreen();
            
            console.log('🚀 Professional HR Dashboard initialized');
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.redirectToAuth();
        }
    }

    /**
     * Check if user is authenticated
     */
    async checkAuthentication() {
        this.authToken = localStorage.getItem('hr_auth_token');
        const userData = localStorage.getItem('hr_user_data');
        
        if (!this.authToken || !userData) {
            throw new Error('No authentication data found');
        }
        
        // Verify token is still valid
        try {
            const response = await fetch(`${this.apiBaseUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Token validation failed');
            }
            
            this.userData = JSON.parse(userData);
        } catch (error) {
            this.clearAuthData();
            throw new Error('Authentication verification failed');
        }
    }

    /**
     * Load user data and update UI
     */
    async loadUserData() {
        if (!this.userData) return;
        
        // Update user info in sidebar
        document.getElementById('userName').textContent = 
            `${this.userData.firstName} ${this.userData.lastName}`;
        document.getElementById('userRole').textContent = 
            this.getRoleDisplayName(this.userData.role);
        
        // Update user avatar if available
        if (this.userData.avatar) {
            document.getElementById('userAvatar').src = this.userData.avatar;
        }
        
        // Update permissions-based UI
        this.updateUIBasedOnPermissions();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
            this.toggleMobileSidebar();
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Notification button
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.showNotificationPanel();
        });

        // Profile button
        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfilePanel();
        });

        // Modal handlers
        this.setupModalHandlers();

        // Add user form
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.showAddUserModal();
        });

        // Save user button
        document.getElementById('saveUserBtn').addEventListener('click', () => {
            this.saveNewUser();
        });

        // Filter handlers
        document.getElementById('userRoleFilter').addEventListener('change', () => {
            this.filterUsers();
        });

        document.getElementById('userStatusFilter').addEventListener('change', () => {
            this.filterUsers();
        });

        // Export handlers
        document.getElementById('exportUsersBtn').addEventListener('click', () => {
            this.exportUsers();
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Load dashboard stats
            await this.loadDashboardStats();
            
            // Load recent activities
            await this.loadRecentActivities();
            
            // Load pending requests
            await this.loadPendingRequests();
            
            // Load users if on users page
            if (this.currentPage === 'users') {
                await this.loadUsers();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Không thể tải dữ liệu dashboard', 'error');
        }
    }

    /**
     * Load dashboard statistics
     */
    async loadDashboardStats() {
        try {
            const response = await this.makeApiRequest('dashboard-stats');
            
            if (response.success) {
                const stats = response.data;
                
                // Update stat cards
                document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
                document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
                document.getElementById('pendingRequests').textContent = stats.pendingRequests || 0;
                document.getElementById('systemHealth').textContent = 
                    stats.systemHealth === 'excellent' ? '100%' : '95%';
                
                // Update notification badge
                document.getElementById('notificationBadge').textContent = stats.pendingRequests || 0;
                document.getElementById('requestsBadge').textContent = stats.pendingRequests || 0;
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    /**
     * Load recent activities
     */
    async loadRecentActivities() {
        try {
            // Mock data for now - replace with real API call
            const activities = [
                {
                    icon: '👤',
                    message: '<strong>Nguyễn Văn A</strong> đã đăng nhập',
                    time: '5 phút trước'
                },
                {
                    icon: '📝',
                    message: '<strong>Trần Thị B</strong> đã gửi yêu cầu nghỉ phép',
                    time: '15 phút trước'
                },
                {
                    icon: '✅',
                    message: '<strong>Lê Văn C</strong> đã được duyệt tăng ca',
                    time: '30 phút trước'
                }
            ];

            const container = document.getElementById('recentActivities');
            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-details">
                        <p>${activity.message}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent activities:', error);
        }
    }

    /**
     * Load pending requests
     */
    async loadPendingRequests() {
        try {
            const response = await this.makeApiRequest('pending-registrations');
            
            if (response.success && response.data) {
                const requests = response.data.slice(0, 3); // Show only top 3
                
                const container = document.getElementById('pendingRequestsList');
                container.innerHTML = requests.map(request => `
                    <div class="request-item">
                        <div class="request-info">
                            <h4>${request.type || 'Nghỉ phép'}</h4>
                            <p>${request.userName} - ${request.duration || '2 ngày'}</p>
                        </div>
                        <div class="request-actions">
                            <button class="approve-btn" onclick="dashboard.approveRequest('${request.id}')">
                                Duyệt
                            </button>
                            <button class="reject-btn" onclick="dashboard.rejectRequest('${request.id}')">
                                Từ chối
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading pending requests:', error);
        }
    }

    /**
     * Load users data
     */
    async loadUsers() {
        try {
            const response = await this.makeApiRequest('users');
            
            if (response.success && response.data) {
                this.renderUsersTable(response.data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Không thể tải danh sách người dùng', 'error');
        }
    }

    /**
     * Render users table
     */
    renderUsersTable(users) {
        const tbody = document.querySelector('#usersTable tbody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="${user.avatar || '../assets/images/default-avatar.png'}" 
                             alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%;">
                        ${user.firstName} ${user.lastName}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role.toLowerCase()}">
                        ${this.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>${user.department || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="dashboard.editUser('${user.id}')">
                            ✏️
                        </button>
                        <button class="action-btn delete" onclick="dashboard.deleteUser('${user.id}')">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Navigate to different pages
     */
    navigateToPage(page) {
        // Update navigation state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update page content
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.toggle('active', content.id === `${page}Page`);
        });

        // Update page title
        const titles = {
            dashboard: { title: 'Tổng Quan', subtitle: 'Xem tổng quan về hệ thống' },
            users: { title: 'Quản Lý Người Dùng', subtitle: 'Quản lý thông tin nhân viên' },
            attendance: { title: 'Chấm Công', subtitle: 'Quản lý chấm công và lịch làm việc' },
            requests: { title: 'Yêu Cầu', subtitle: 'Xử lý các yêu cầu từ nhân viên' },
            reports: { title: 'Báo Cáo', subtitle: 'Xem và tạo báo cáo hệ thống' },
            settings: { title: 'Cài Đặt', subtitle: 'Cấu hình hệ thống' }
        };

        const pageInfo = titles[page] || titles.dashboard;
        document.getElementById('pageTitle').textContent = pageInfo.title;
        document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;

        this.currentPage = page;

        // Load page-specific data
        this.loadPageData(page);

        // Update URL without page reload
        history.pushState({ page }, '', `#${page}`);
    }

    /**
     * Load page-specific data
     */
    async loadPageData(page) {
        switch (page) {
            case 'users':
                await this.loadUsers();
                break;
            case 'attendance':
                await this.loadAttendanceData();
                break;
            case 'requests':
                await this.loadRequestsData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    /**
     * Toggle sidebar collapsed state
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        
        // Store state in localStorage
        localStorage.setItem('hr_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    }

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('mobile-open');
        
        // Add overlay for mobile
        if (sidebar.classList.contains('mobile-open')) {
            this.addMobileOverlay();
        } else {
            this.removeMobileOverlay();
        }
    }

    /**
     * Add mobile overlay
     */
    addMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = () => this.toggleMobileSidebar();
        document.body.appendChild(overlay);
    }

    /**
     * Remove mobile overlay
     */
    removeMobileOverlay() {
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Handle global search
     */
    handleGlobalSearch(query) {
        if (query.length < 2) return;

        // Implement search logic based on current page
        switch (this.currentPage) {
            case 'users':
                this.searchUsers(query);
                break;
            case 'requests':
                this.searchRequests(query);
                break;
            default:
                this.performGlobalSearch(query);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    /**
     * Setup modal handlers
     */
    setupModalHandlers() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Modal backdrop click
        document.getElementById('modalBackdrop').addEventListener('click', () => {
            this.hideAllModals();
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modalBackdrop');
        
        backdrop.classList.add('active');
        modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modalBackdrop');
        
        modal.classList.remove('active');
        
        // Check if any other modals are open
        const openModals = document.querySelectorAll('.modal.active');
        if (openModals.length === 0) {
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Hide all modals
     */
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modalBackdrop').classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Show add user modal
     */
    showAddUserModal() {
        // Reset form
        document.getElementById('addUserForm').reset();
        this.showModal('addUserModal');
    }

    /**
     * Save new user
     */
    async saveNewUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            role: formData.get('role'),
            department: formData.get('department')
        };

        // Validate required fields
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.role) {
            this.showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }

        try {
            const response = await this.makeApiRequest('users', 'POST', userData);
            
            if (response.success) {
                this.showNotification('Thêm nhân viên thành công', 'success');
                this.hideModal('addUserModal');
                
                // Reload users if on users page
                if (this.currentPage === 'users') {
                    await this.loadUsers();
                }
            } else {
                this.showNotification(response.message || 'Có lỗi xảy ra khi thêm nhân viên', 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showNotification('Có lỗi xảy ra khi thêm nhân viên', 'error');
        }
    }

    /**
     * Setup real-time updates
     */
    setupRealTimeUpdates() {
        // Refresh dashboard stats every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboardStats();
        }, 30000);

        // Check for new notifications every minute
        setInterval(() => {
            this.checkNewNotifications();
        }, 60000);
    }

    /**
     * Check for new notifications
     */
    async checkNewNotifications() {
        try {
            // Implement notification checking logic
            // This would typically check for new requests, updates, etc.
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }

    /**
     * Make API request with authentication
     */
    async makeApiRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (response.status === 401) {
            // Token expired, redirect to login
            this.redirectToAuth();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Approve request
     */
    async approveRequest(requestId) {
        try {
            const response = await this.makeApiRequest(`attendance-request`, 'PUT', {
                id: requestId,
                status: 'approved'
            });
            
            if (response.success) {
                this.showNotification('Yêu cầu đã được duyệt', 'success');
                await this.loadPendingRequests();
                await this.loadDashboardStats();
            }
        } catch (error) {
            console.error('Error approving request:', error);
            this.showNotification('Có lỗi xảy ra khi duyệt yêu cầu', 'error');
        }
    }

    /**
     * Reject request
     */
    async rejectRequest(requestId) {
        try {
            const response = await this.makeApiRequest(`attendance-request`, 'PUT', {
                id: requestId,
                status: 'rejected'
            });
            
            if (response.success) {
                this.showNotification('Yêu cầu đã bị từ chối', 'success');
                await this.loadPendingRequests();
                await this.loadDashboardStats();
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            this.showNotification('Có lỗi xảy ra khi từ chối yêu cầu', 'error');
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout API
            await this.makeApiRequest('logout', 'POST');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            this.clearAuthData();
            this.redirectToAuth();
        }
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        localStorage.removeItem('hr_auth_token');
        localStorage.removeItem('hr_refresh_token');
        localStorage.removeItem('hr_user_data');
        localStorage.removeItem('hr_expires_in');
        sessionStorage.removeItem('hr_session_active');
        
        // Clear refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    /**
     * Redirect to authentication page
     */
    redirectToAuth() {
        window.location.href = '/auth';
    }

    /**
     * Show/hide loading screen
     */
    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
        document.getElementById('dashboardContainer').classList.remove('loaded');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('dashboardContainer').classList.add('loaded');
    }

    /**
     * Update UI based on user permissions
     */
    updateUIBasedOnPermissions() {
        const userRole = this.userData.role;
        
        // Hide/show navigation items based on role
        const rolePermissions = {
            'AD': ['dashboard', 'users', 'attendance', 'requests', 'reports', 'settings'],
            'Manager': ['dashboard', 'users', 'attendance', 'requests', 'reports'],
            'HR': ['dashboard', 'users', 'attendance', 'requests'],
            'NV': ['dashboard', 'attendance', 'requests']
        };

        const allowedPages = rolePermissions[userRole] || ['dashboard'];
        
        document.querySelectorAll('.nav-item').forEach(item => {
            const link = item.querySelector('.nav-link');
            const page = link.dataset.page;
            
            if (!allowedPages.includes(page)) {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for global search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch').focus();
        }
        
        // Ctrl/Cmd + N for new user (on users page)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && this.currentPage === 'users') {
            e.preventDefault();
            this.showAddUserModal();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile sidebar on desktop
        if (window.innerWidth > 768) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('mobile-open');
            this.removeMobileOverlay();
        }
    }

    /**
     * Utility methods
     */
    getRoleDisplayName(role) {
        const roleNames = {
            'AD': 'Quản trị viên',
            'Manager': 'Quản lý',
            'HR': 'Nhân sự',
            'NV': 'Nhân viên'
        };
        return roleNames[role] || role;
    }

    getStatusDisplayName(status) {
        const statusNames = {
            'active': 'Hoạt động',
            'inactive': 'Không hoạt động',
            'pending': 'Chờ duyệt',
            'suspended': 'Tạm ngưng'
        };
        return statusNames[status] || status;
    }

    // Placeholder methods for future implementation
    async loadAttendanceData() { /* TODO: Implement */ }
    async loadRequestsData() { /* TODO: Implement */ }
    async loadReportsData() { /* TODO: Implement */ }
    async loadSettingsData() { /* TODO: Implement */ }
    searchUsers(query) { /* TODO: Implement */ }
    searchRequests(query) { /* TODO: Implement */ }
    performGlobalSearch(query) { /* TODO: Implement */ }
    filterUsers() { /* TODO: Implement */ }
    exportUsers() { /* TODO: Implement */ }
    editUser(userId) { /* TODO: Implement */ }
    deleteUser(userId) { /* TODO: Implement */ }
    showNotificationPanel() { /* TODO: Implement */ }
    showProfilePanel() { /* TODO: Implement */ }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ProfessionalDashboard();
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
        window.dashboard.navigateToPage(e.state.page);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalDashboard;
}