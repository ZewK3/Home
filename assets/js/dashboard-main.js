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
            SecureStorage.set(this.CACHE_KEY, notifications);
            SecureStorage.set(this.LAST_CHECK_KEY, Date.now());
        } catch (e) {
            console.error('Failed to save notification cache:', e);
        }
    },
    
    getCache() {
        try {
            return SecureStorage.get(this.CACHE_KEY);
        } catch (e) {
            console.error('Failed to get notification cache:', e);
            return null;
        }
    },
    
    getLastCheck() {
        const lastCheck = SecureStorage.get(this.LAST_CHECK_KEY);
        return lastCheck ? parseInt(lastCheck) : 0;
    }
};

// Load notifications on page load only
async function loadNotifications() {
    try {
        const notifications = await DashboardAPI.getNotifications();
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

// Mobile Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        console.log('No authentication found, redirecting to login...');
        // window.location.href = '../../index.html';
        return;
    }

    // Check if user is admin and redirect to admin dashboard
    try {
        const user = JSON.parse(userData);
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
        document.getElementById('mobileLoader').classList.add('hidden');
    }, 500);

    // Apply role-based menu filtering
    filterMenuByRole();

    // Drawer menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const closeDrawer = document.getElementById('closeDrawer');

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
        SecureStorage.clear();
        window.location.href = '../../index.html';
    });

    // Notification Panel
    const notifBtn = document.getElementById('notifBtn');
    const closeNotifPanel = document.getElementById('closeNotifPanel');
    const notificationPanel = document.getElementById('notificationPanel');

    notifBtn.addEventListener('click', () => {
        DashboardContent.toggleNotificationPanel();
    });

    if (closeNotifPanel) {
        closeNotifPanel.addEventListener('click', () => {
            notificationPanel.classList.add('hidden');
        });
    }

    // Load notifications once on page load
    loadNotifications();

    // Hash-based navigation support
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash
});

// Role-based menu filtering
function filterMenuByRole() {
    // Get current user data from encrypted localStorage
    const userData = SecureStorage.get('userData');
    if (!userData) {
        console.warn('No user data found in localStorage');
        return;
    }

    const userPosition = userData.position || 'NV'; // Default to NV (Employee)
    
    console.log('Filtering menu for role:', userPosition);

    // Role hierarchy: AD > QL > NV
    const roleHierarchy = {
        'NV': 0,      // Employee/Worker
        'EMPLOYEE': 0,
        'QL': 1,      // Manager
        'MANAGER': 1,
        'AD': 2,      // Admin
        'ADMIN': 2
    };

    const userLevel = roleHierarchy[userPosition.toUpperCase()] || 0;

    // Hide menu items based on required role
    const menuItems = document.querySelectorAll('[data-min-role]');
    menuItems.forEach(item => {
        const requiredRole = item.getAttribute('data-min-role');
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        if (userLevel < requiredLevel) {
            item.style.display = 'none';
        }
    });

    // Hide entire admin section if user is NV (worker)
    const adminSection = document.querySelector('[data-role-section="admin"]');
    if (adminSection && userLevel === 0) {
        adminSection.style.display = 'none';
    }

    // Log visible menu items for debugging
    console.log(`User role: ${userPosition} (level ${userLevel})`);
    console.log(`Visible menu items: ${document.querySelectorAll('.menu-item[data-function]').length - document.querySelectorAll('[data-min-role][style*="display: none"]').length}`);
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
        'grant-access': 'Phân quyền'
    };
    headerTitle.textContent = titles[functionName] || 'Dashboard';

    // Render content
    renderContent(functionName);
}

async function renderContent(functionName) {
    const mainContent = document.getElementById('mainContent');
    
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
        'grant-access': 'renderGrantAccess'
    };

    const methodName = contentMethods[functionName] || 'renderHome';
    
    if (typeof DashboardContent[methodName] === 'function') {
        const content = await DashboardContent[methodName]();
        mainContent.innerHTML = content;
    } else {
        mainContent.innerHTML = await DashboardContent.renderHome();
    }
}

// Make functions globally available for onclick handlers
window.navigateToFunction = navigateToFunction;
window.filterMenuByRole = filterMenuByRole;
