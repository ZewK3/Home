// Modern Dashboard Handler for Unified Structure
// Handles all dashboard functionality with the new layout

// Global variables
let currentUser = null;
let dashboardData = null;

// Initialize the modern dashboard
async function initializeModernDashboard() {
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize core functionality
        await initializeAuth();
        initializeUI();
        initializeEventHandlers();
        await loadDashboardData();
        
        // Hide loading screen
        hideLoadingScreen();
        
        console.log('✅ Modern dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        handleInitializationError(error);
    }
}

// Authentication initialization
async function initializeAuth() {
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        const employeeId = localStorage.getItem('employeeId');
        
        if (!token || !employeeId) {
            // Redirect to login if not authenticated
            window.location.href = '/pages/auth/index.html';
            return;
        }
        
        // Get user data
        const response = await fetch(`/api/worker-service.js?action=getUser&employeeId=${employeeId}&token=${token}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            currentUser = result.data;
            updateUserInterface();
            console.log('✅ User authenticated:', currentUser.name);
        } else {
            throw new Error('Authentication failed');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeId');
        window.location.href = '/pages/auth/index.html';
    }
}

// Update UI with user data
function updateUserInterface() {
    if (!currentUser) return;
    
    // Update user name and role in header
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (userName) userName.textContent = currentUser.name || 'Admin User';
    if (userRole) userRole.textContent = currentUser.position || 'System Administrator';
    if (profileName) profileName.textContent = currentUser.name || 'Admin User';
    if (profileEmail) profileEmail.textContent = currentUser.email || 'admin@zewk.com';
    
    // Update navigation based on user role
    updateNavigationForRole(currentUser.position);
}

// Update navigation visibility based on user role
function updateNavigationForRole(userRole) {
    const roleElements = document.querySelectorAll('[data-role]');
    
    roleElements.forEach(element => {
        const allowedRoles = element.getAttribute('data-role').split(',');
        const hasAccess = allowedRoles.some(role => 
            role.trim() === userRole || 
            isRoleCompatible(userRole, role.trim())
        );
        
        if (hasAccess) {
            element.classList.add('visible');
            element.style.display = '';
        } else {
            element.classList.remove('visible');
            element.style.display = 'none';
        }
    });
}

// Check role compatibility
function isRoleCompatible(userRole, requiredRole) {
    const roleMap = {
        'SUPER_ADMIN': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AD', 'QL', 'NV'],
        'ADMIN': ['ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AD', 'QL', 'NV'],
        'STORE_MANAGER': ['STORE_MANAGER', 'EMPLOYEE', 'QL', 'NV'],
        'EMPLOYEE': ['EMPLOYEE', 'NV'],
        'System Administrator': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AD', 'QL', 'NV']
    };
    
    const allowedRoles = roleMap[userRole] || [userRole];
    return allowedRoles.includes(requiredRole);
}

// Initialize UI components
function initializeUI() {
    initializeSidebar();
    initializeDropdowns();
    initializeChat();
    initializeTime();
}

// Initialize sidebar functionality
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target) &&
                sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        });
    }
    
    // Handle navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked item
            link.closest('.nav-item').classList.add('active');
            
            // Handle page navigation
            const page = link.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

// Initialize dropdown functionality
function initializeDropdowns() {
    // Notification dropdown
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            
            // Close profile dropdown if open
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileDropdown) profileDropdown.classList.remove('show');
        });
    }
    
    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
            
            // Close notification dropdown if open
            if (notificationDropdown) notificationDropdown.classList.remove('show');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        if (notificationDropdown) notificationDropdown.classList.remove('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
    });
}

// Initialize chat system
function initializeChat() {
    const chatToggle = document.getElementById('chatToggle');
    const chatPanel = document.getElementById('chatPanel');
    const chatClose = document.getElementById('chatClose');
    
    if (chatToggle && chatPanel) {
        chatToggle.addEventListener('click', () => {
            chatPanel.classList.toggle('show');
        });
    }
    
    if (chatClose && chatPanel) {
        chatClose.addEventListener('click', () => {
            chatPanel.classList.remove('show');
        });
    }
    
    // Chat tabs
    const chatTabs = document.querySelectorAll('.chat-tab');
    chatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            chatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Handle tab switching logic here
            const chatType = tab.getAttribute('data-chat');
            console.log('Switched to chat type:', chatType);
        });
    });
    
    // Send message functionality
    const messageInput = document.getElementById('messageInput');
    const sendMessage = document.getElementById('sendMessage');
    
    if (messageInput && sendMessage) {
        sendMessage.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                // Handle sending message
                console.log('Sending message:', message);
                messageInput.value = '';
            }
        });
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage.click();
            }
        });
    }
}

// Initialize time display
function initializeTime() {
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Update any time displays
        const timeDisplays = document.querySelectorAll('.time-display, #timeDisplay');
        timeDisplays.forEach(display => {
            display.textContent = timeString;
        });
        
        // Update date
        const dateString = now.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const dateDisplays = document.querySelectorAll('#currentDateDisplay');
        dateDisplays.forEach(display => {
            display.textContent = dateString;
        });
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Initialize event handlers
function initializeEventHandlers() {
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Quick action handlers
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    // Refresh button handlers
    const refreshBtns = document.querySelectorAll('[id*="refresh"], .refresh-btn');
    refreshBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            refreshDashboardData();
        });
    });
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load statistics
        await loadStatistics();
        
        // Load recent activities
        await loadRecentActivities();
        
        // Load store data (if user has access)
        if (isRoleCompatible(currentUser.position, 'STORE_MANAGER')) {
            await loadStoreData();
        }
        
        console.log('✅ Dashboard data loaded');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load statistics data
async function loadStatistics() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/worker-service.js?action=getDashboardStats&token=${token}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            updateStatistics(result.data);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update statistics display
function updateStatistics(stats) {
    const elements = {
        totalEmployees: document.getElementById('totalEmployees'),
        presentToday: document.getElementById('presentToday'),
        pendingRequests: document.getElementById('pendingRequests'),
        activeStores: document.getElementById('activeStores')
    };
    
    if (elements.totalEmployees) elements.totalEmployees.textContent = stats.totalEmployees || '248';
    if (elements.presentToday) elements.presentToday.textContent = stats.presentToday || '235';
    if (elements.pendingRequests) elements.pendingRequests.textContent = stats.pendingRequests || '12';
    if (elements.activeStores) elements.activeStores.textContent = stats.activeStores || '8';
}

// Load recent activities
async function loadRecentActivities() {
    try {
        // Mock data for now - replace with actual API call
        const activities = [
            {
                type: 'success',
                icon: 'person_add',
                text: '<strong>Nguyễn Văn A</strong> đã được thêm vào hệ thống',
                time: '5 phút trước'
            },
            {
                type: 'warning',
                icon: 'schedule',
                text: '<strong>Trần Thị B</strong> gửi đơn xin nghỉ phép',
                time: '15 phút trước'
            },
            {
                type: 'info',
                icon: 'check_circle',
                text: 'Ca sáng <strong>Store #001</strong> đã hoàn thành',
                time: '2 giờ trước'
            }
        ];
        
        updateRecentActivities(activities);
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
}

// Update recent activities display
function updateRecentActivities(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <span class="material-icons-round">${activity.icon}</span>
            </div>
            <div class="activity-content">
                <p class="activity-text">${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Load store data
async function loadStoreData() {
    try {
        // Mock data for now - replace with actual API call
        const stores = [
            {
                name: 'Cửa hàng Trung tâm',
                location: 'Quận 1, TP.HCM',
                employees: '24/25',
                performance: '98.5%',
                status: 'success'
            },
            {
                name: 'Cửa hàng Quận 7',
                location: 'Quận 7, TP.HCM',
                employees: '18/20',
                performance: '89.2%',
                status: 'warning'
            }
        ];
        
        updateStoreData(stores);
    } catch (error) {
        console.error('Error loading store data:', error);
    }
}

// Update store data display
function updateStoreData(stores) {
    const storeList = document.querySelector('.store-list');
    if (!storeList) return;
    
    storeList.innerHTML = stores.map(store => `
        <div class="store-item">
            <div class="store-info">
                <h4 class="store-name">${store.name}</h4>
                <p class="store-location">${store.location}</p>
            </div>
            <div class="store-metrics">
                <div class="metric">
                    <span class="metric-label">Nhân viên</span>
                    <span class="metric-value">${store.employees}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Hiệu suất</span>
                    <span class="metric-value ${store.status}">${store.performance}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle page navigation
function navigateToPage(page) {
    console.log('Navigating to page:', page);
    // Implement page navigation logic here
    // This could involve loading different content or redirecting to different pages
}

// Handle quick actions
function handleQuickAction(action) {
    console.log('Handling quick action:', action);
    
    switch (action) {
        case 'add-employee':
            // Implement add employee functionality
            console.log('Adding new employee...');
            break;
        case 'assign-shift':
            // Implement shift assignment functionality
            console.log('Assigning shifts...');
            break;
        case 'create-report':
            // Implement report creation functionality
            console.log('Creating report...');
            break;
        case 'manage-requests':
            // Implement request management functionality
            console.log('Managing requests...');
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeId');
        window.location.href = '/pages/auth/index.html';
    }
}

// Refresh dashboard data
async function refreshDashboardData() {
    console.log('Refreshing dashboard data...');
    await loadDashboardData();
}

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500); // Small delay for smooth transition
    }
}

// Handle initialization errors
function handleInitializationError(error) {
    console.error('Dashboard initialization error:', error);
    
    // Show error message to user
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <div class="error-content">
            <h3>Lỗi khởi tạo hệ thống</h3>
            <p>Đã xảy ra lỗi khi tải dashboard. Vui lòng thử lại.</p>
            <button onclick="location.reload()" class="btn btn-primary">Tải lại trang</button>
        </div>
    `;
    
    document.body.appendChild(errorMessage);
    
    // Hide loading screen
    hideLoadingScreen();
}

// Export functions for global access
window.initializeModernDashboard = initializeModernDashboard;
window.handleLogout = handleLogout;
window.refreshDashboardData = refreshDashboardData;

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModernDashboard);
} else {
    initializeModernDashboard();
}