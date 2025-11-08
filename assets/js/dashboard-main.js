/**
 * Mobile Dashboard Main Logic
 * Handles initialization, navigation, and real-time notifications
 */

// Notification cache management with encrypted storage
const NotificationCache = {
    CACHE_KEY: 'notifications_cache',
    LAST_CHECK_KEY: 'notifications_last_check',
    
    saveCache(notifications) {
        try {
            SimpleStorage.set(this.CACHE_KEY, notifications);
            SimpleStorage.set(this.LAST_CHECK_KEY, Date.now());
        } catch (e) {
            console.error('Failed to save notification cache:', e);
        }
    },
    
    getCache() {
        try {
            return SimpleStorage.get(this.CACHE_KEY);
        } catch (e) {
            console.error('Failed to get notification cache:', e);
            return null;
        }
    },
    
    getLastCheck() {
        const lastCheck = SimpleStorage.get(this.LAST_CHECK_KEY);
        return lastCheck ? parseInt(lastCheck) : 0;
    }
};

// Load notifications on page load only
async function loadNotifications() {
    try {
        // Use apiClient which respects MOCK_MODE
        const response = await apiClient.get('/notifications', {
            employeeId: SimpleStorage.get('userData')?.employeeId,
            limit: 10
        });
        
        const notifications = response.data || [];
        if (notifications) {
            // Save to cache
            NotificationCache.saveCache(notifications);
            
            // Update UI
            updateNotificationUI(notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        // Try to load from cache
        const cached = NotificationCache.getCache();
        if (cached && Array.isArray(cached)) {
            updateNotificationUI(cached);
        }
    }
}

function updateNotificationUI(notifications) {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : '';
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// Mobile Dashboard Initialization Function
async function initMobileDashboard() {
    // Check authentication - use SimpleStorage to properly decode data
    const token = SimpleStorage.get('authToken');
    const userData = SimpleStorage.get('userData');
    
    if (!token || !userData) {
        console.log('No authentication found, redirecting to login...');
        window.location.href = '../../index.html';
        return;
    }

    // Check if user is admin and redirect to admin dashboard
    try {
        // userData is already parsed by SimpleStorage.get()
        const user = userData;
        const isAdmin = user.position === 'AD' || user.position === 'ADMIN';
        
        if (isAdmin) {
            console.log('Admin user detected, redirecting to admin dashboard...');
            window.location.href = './admin.html';
            return;
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }

    // Initialize Dashboard Content
    await DashboardContent.init();

    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('mobileLoader');
        if (loader) loader.classList.add('hidden');
    }, 500);

    // Apply permission-based menu filtering
    filterMenuByPermissions();

    // Drawer menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const closeDrawer = document.getElementById('closeDrawer');

    if (menuBtn && drawerOverlay && closeDrawer) {
        menuBtn.addEventListener('click', () => {
            drawerOverlay.classList.add('active');
        });

        closeDrawer.addEventListener('click', () => {
            drawerOverlay.classList.remove('active');
        });

    drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) {
            drawerOverlay.classList.remove('active');
        }
    });

    // Menu item click handling
    const menuItems = document.querySelectorAll('.menu-item[data-function]');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const functionName = item.dataset.function;
            navigateToFunction(functionName);
            drawerOverlay.classList.remove('active');
        });
    });

    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const navType = item.dataset.nav;
            navigateToFunction(navType);
        });
    });

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        SimpleStorage.clear();
        window.location.href = '../../index.html';
    });

    // Notification Panel
    const notifBtn = document.getElementById('notifBtn');
    const closeNotifPanel = document.getElementById('closeNotifPanel');
    const notificationPanel = document.getElementById('notificationPanel');

    notifBtn?.addEventListener('click', () => {
        notificationPanel?.classList.toggle('active');
        notificationPanel?.classList.toggle('hidden');
    });

    if (closeNotifPanel) {
        closeNotifPanel.addEventListener('click', () => {
            notificationPanel?.classList.remove('active');
            notificationPanel?.classList.add('hidden');
        });
    }
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationPanel && 
            !notificationPanel.contains(e.target) && 
            e.target !== notifBtn &&
            !notifBtn?.contains(e.target)) {
            notificationPanel.classList.remove('active');
            notificationPanel.classList.add('hidden');
        }
    });

    // Load notifications once on page load
    loadNotifications();

    // Hash-based navigation support
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash
}

// Also support direct call when DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileDashboard);
} else if (typeof window.dashboardInitialized === 'undefined') {
    // If DOM is already loaded and dashboard not initialized, init now
    window.dashboardInitialized = true;
    // Delay slightly to ensure all scripts are loaded
    setTimeout(initMobileDashboard, 100);
}

// Export for use by dashboard-loader
window.initMobileDashboard = initMobileDashboard;

// Permission-based menu filtering
function filterMenuByPermissions() {
    // Get current user data from encrypted localStorage
    const userData = SimpleStorage.get('userData');
    if (!userData) {
        console.warn('No user data found in localStorage');
        return;
    }

    const permissions = userData.permissions || '';
    const permissionList = permissions.split(',').map(p => p.trim());
    
    console.log('Filtering menu for permissions:', permissionList);

    // Hide menu items based on required permissions
    const menuItems = document.querySelectorAll('[data-required-permission]');
    menuItems.forEach(item => {
        const requiredPermission = item.getAttribute('data-required-permission');
        const hasPermission = permissionList.includes(requiredPermission);

        if (!hasPermission) {
            item.style.display = 'none';
        }
    });

    // Hide entire sections if user has no permissions for that section
    const sections = document.querySelectorAll('[data-permission-section]');
    sections.forEach(section => {
        const sectionPermissions = section.getAttribute('data-permission-section').split(',');
        const hasAnyPermission = sectionPermissions.some(perm => permissionList.includes(perm.trim()));
        
        if (!hasAnyPermission) {
            section.style.display = 'none';
        }
    });

    // Log visible menu items for debugging
    const visibleItems = document.querySelectorAll('.menu-item[data-function]:not([style*="display: none"])');
    console.log(`User permissions: ${permissionList.length} permissions`);
    console.log(`Visible menu items: ${visibleItems.length}`);
}

function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash) {
        navigateToFunction(hash);
    }
}

function navigateToFunction(functionName) {
    // Update URL hash
    if (window.location.hash !== `#${functionName}`) {
        window.location.hash = functionName;
    }

    // Update header title
    const headerTitle = document.querySelector('.header-title');
    const titles = {
        'home': 'Dashboard',
        'schedule': 'Lịch Làm',
        'shifts': 'Ca làm',
        'timesheet': 'Bảng Công',
        'salary': 'Bảng Lương',
        'profile': 'Cá Nhân',
        'attendance': 'Chấm công',
        'schedule-registration': 'Đăng ký lịch',
        'leave-request': 'Đơn Từ',
        'process-requests': 'Xử lý yêu cầu',
        'approve-registration': 'Duyệt đăng ký',
        'grant-access': 'Phân quyền',
        'system-settings': 'Cài Đặt Hệ Thống',
        'attendance-approval': 'Duyệt Chấm Công',
        'timesheet-approval': 'Duyệt Bảng Công',
        'salary-management': 'Quản Lý Lương',
        'employee-management': 'Quản Lý Nhân Viên',
        'schedule-management': 'Xếp Lịch Làm Việc'
    };
    headerTitle.textContent = titles[functionName] || 'Dashboard';

    // Render content
    renderContent(functionName);
}

async function renderContent(functionName) {
    const mainContent = document.getElementById('mainContent');
    
    // Module titles for card header
    const moduleTitles = {
        'home': 'Trang Chủ',
        'schedule': 'Lịch Làm Việc',
        'shifts': 'Ca Làm Việc',
        'timesheet': 'Bảng Công',
        'salary': 'Bảng Lương',
        'profile': 'Thông Tin Cá Nhân',
        'attendance': 'Chấm Công',
        'schedule-registration': 'Đăng Ký Lịch',
        'leave-request': 'Đơn Từ',
        'process-requests': 'Xử Lý Yêu Cầu',
        'approve-registration': 'Duyệt Đăng Ký',
        'grant-access': 'Phân Quyền',
        'system-settings': 'Cài Đặt Hệ Thống',
        'attendance-approval': 'Duyệt Chấm Công',
        'timesheet-approval': 'Duyệt Bảng Công',
        'salary-management': 'Quản Lý Lương',
        'employee-management': 'Quản Lý Nhân Viên',
        'schedule-management': 'Xếp Lịch Làm Việc'
    };
    
    // Content mapping to DashboardContent methods
    const contentMethods = {
        'home': 'renderHome',
        'schedule': 'renderSchedule',
        'shifts': 'renderShifts',
        'timesheet': 'renderTimesheet',
        'salary': 'renderSalary',
        'profile': 'renderProfile',
        'attendance': 'renderAttendance',
        'schedule-registration': 'renderScheduleRegistration',
        'leave-request': 'renderLeaveRequest',
        'process-requests': 'renderProcessRequests',
        'approve-registration': 'renderApproveRegistration',
        'grant-access': 'renderGrantAccess',
        'system-settings': 'renderSystemSettings',
        'attendance-approval': 'renderAttendanceApproval',
        'timesheet-approval': 'renderTimesheetApproval',
        'salary-management': 'renderSalaryManagement',
        'employee-management': 'renderEmployeeManagement',
        'schedule-management': 'renderScheduleManagement'
    };
    
    // Init methods that should be called after rendering
    const initMethods = {
        'process-requests': 'initProcessRequests',
        'system-settings': 'initSystemSettings',
        'attendance-approval': 'initAttendanceApproval',
        'timesheet-approval': 'initTimesheetApproval',
        'salary-management': 'initSalaryManagement',
        'employee-management': 'initEmployeeManagement',
        'schedule-management': 'initScheduleManagement'
    };

    const methodName = contentMethods[functionName] || 'renderHome';
    const moduleTitle = moduleTitles[functionName] || 'Dashboard';
    
    if (typeof DashboardContent[methodName] === 'function') {
        const content = await DashboardContent[methodName]();
        // Wrap content in standard card structure per module.html
        const wrappedContent = `
            <div class="card">
                <div class="card-header">
                    <h3>${moduleTitle}</h3>
                </div>
                <div class="card-body" id="${functionName}-module">
                    ${content}
                </div>
            </div>
        `;
        mainContent.innerHTML = wrappedContent;
        
        // Call init method if exists
        const initMethod = initMethods[functionName];
        if (initMethod && typeof DashboardContent[initMethod] === 'function') {
            setTimeout(() => DashboardContent[initMethod](), 100);
        }
    } else {
        const content = await DashboardContent.renderHome();
        const wrappedContent = `
            <div class="card">
                <div class="card-header">
                    <h3>Trang Chủ</h3>
                </div>
                <div class="card-body" id="home-module">
                    ${content}
                </div>
            </div>
        `;
        mainContent.innerHTML = wrappedContent;
    }
}

// Make functions globally available for onclick handlers
window.navigateToFunction = navigateToFunction;
window.filterMenuByPermissions = filterMenuByPermissions;
}

// Export for use in dashboard-loader.js
if (typeof window !== 'undefined') {
    window.initMobileDashboard = initMobileDashboard;
}
