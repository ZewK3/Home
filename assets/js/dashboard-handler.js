// Setup modal close handlers for all modals
function setupModalCloseHandlers() {
    // Add event listeners for all modal close buttons
    document.addEventListener('click', (e) => {
        // Handle close-btn clicks
        if (e.target.classList.contains('close-btn') || e.target.closest('.close-btn')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // Handle modal-close clicks
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // Close modal when clicking outside
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Add escape key handler for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const visibleModals = document.querySelectorAll('.modal[style*="display: block"], .modal[style*="display:block"]');
            visibleModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Initialize Dashboard - will be called by main-init.js
async function initializeDashboard() {
    // Show dashboard loader immediately
    showDashboardLoader();
    
    // Set initial CSS classes for dashboard elements
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        dashboardContent.classList.add('dashboard-hidden');
    }
    
    // Initialize time display
    initializeTimeDisplay();
    
    // Setup mobile menu FIRST - before any authentication checks
    setupMobileMenu();
    
    // Wait a moment for all elements to be rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Setup security
    document.addEventListener("keydown", (e) => {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
            e.preventDefault();
        }
    });
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Setup modal close functionality
    setupModalCloseHandlers();

    // Initialize managers
    // Re-enable AuthManager with enhanced caching capabilities
    const authManager = new AuthManager();
    
    // Pre-load and cache essential data during initialization
    try {
        // Pre-cache stores data for the session
        await authManager.getStoresData();
        console.log('Stores data pre-cached during initialization');
    } catch (error) {
        console.warn('Could not pre-cache stores data:', error);
    }
    
    // Check authentication with cached user data
    const userData = await authManager.checkAuthentication();
    
    if (userData) {
        authManager.setupLogoutHandler();
        // Make authManager globally accessible for other functions
        window.authManager = authManager;
        
        // Additional authentication setup
        ThemeManager.initialize();

        // Initialize features with proper user data
        if (typeof ContentManager === 'undefined') {
            console.error('ContentManager class is not defined. Check if content-manager.js is loaded properly.');
            throw new Error('ContentManager class is not defined');
        }
        window.contentManager = new ContentManager(userData);

        // Initialize enhanced navigation manager
        if (typeof NavigationManager !== 'undefined') {
            window.navigationManager = new NavigationManager(window.contentManager);
            console.log('✅ NavigationManager initialized');
        } else {
            console.warn('NavigationManager not available, using fallback navigation');
        }

        // Apply role-based section visibility FIRST
        await applyRoleBasedSectionVisibility();
        
        // Then setup menu interactions after role visibility is applied
        MenuManager.setupMenuInteractions();

        // Populate user info in header after role setup
        const userInfoElement = document.getElementById("userInfo");
        if (userInfoElement && userData) {
            userInfoElement.textContent = `Chào ${userData.fullName} - ${userData.employeeId}`;
            console.log('✅ User info populated in header:', userData.fullName, userData.employeeId);
        }

        // Ensure stats-grid is visible and updated (stats will be loaded in initializeEnhancedDashboard)
        await updateStatsGrid();

        // Initialize enhanced dashboard with cached user data
        await initializeEnhancedDashboard();

        // Hide dashboard loader and show content after initialization is complete
        await hideDashboardLoader();

        // Setup company logo click handler
        const companyLogoLink = document.getElementById('companyLogoLink');
        if (companyLogoLink) {
            companyLogoLink.addEventListener('click', (e) => {
                e.preventDefault();
                restoreOriginalDashboardContent();
                return false;
            });
        }

        // CSS animations replace GSAP for better mobile compatibility

        // Mobile optimization and enhanced menu setup
        setupMobileMenu();
        
        // Additional failsafe - ensure mobile menu is setup after everything else
        setTimeout(() => {
            setupMobileMenu();
        }, 2000);
    } else {
        // Hide dashboard loader if authentication fails
        await hideDashboardLoader();
    }
}

// Standalone mobile menu initialization - independent of authentication
window.addEventListener('load', () => {
    setupMobileMenu();
});

// Additional backup initialization for mobile menu
setTimeout(() => {
    setupMobileMenu();
}, 3000);

// Update dashboard stats UI using cached data - no API calls
async function updateDashboardStatsUI() {
    console.log('📊 Updating dashboard stats UI with cached data...');
    
    // First, ensure the welcome section and stats-grid are visible
    const welcomeSection = document.querySelector('.welcome-section');
    const statsGrid = document.querySelector('.stats-grid');
    const content = document.getElementById('content');
    
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
    } else {
        console.warn('⚠️ Welcome section not found in DOM');
    }
    
    if (statsGrid) {
        statsGrid.style.display = 'grid';
    } else {
        console.warn('⚠️ Stats grid not found in DOM');
    }
    
    if (content) {
        content.style.display = 'block';
    }
    
    // Wait a moment for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const elements = {
        totalEmployees: document.getElementById('totalEmployees'),
        todaySchedule: document.getElementById('todaySchedule'), 
        pendingRequests: document.getElementById('pendingRequests'),
        recentMessages: document.getElementById('recentMessages'),
        todayScheduleDay: document.getElementById('todayScheduleDay')
    };

    console.log('📊 Stats elements found:', {
        totalEmployees: !!elements.totalEmployees,
        todaySchedule: !!elements.todaySchedule,
        pendingRequests: !!elements.pendingRequests,
        recentMessages: !!elements.recentMessages,
        todayScheduleDay: !!elements.todayScheduleDay
    });

    try {
        // Get cached stats from AuthManager - no API call
        const stats = await window.authManager.getDashboardStats();
        
        console.log('📈 Using cached dashboard stats:', stats);
        
        if (stats && typeof stats === 'object') {
            
            // Update dashboard statistics
            if (elements.totalEmployees) {
                const value = stats.totalEmployees?.toString() || '0';
                elements.totalEmployees.textContent = value;
                console.log(`Updated totalEmployees: ${value}`);
            }
            
            if (elements.todaySchedule) {
                const value = stats.todaySchedules?.toString() || '0';
                elements.todaySchedule.textContent = value;
                console.log(`Updated todaySchedule: ${value}`);
            }
            
            if (elements.pendingRequests) {
                const value = stats.pendingRequests?.toString() || '0';
                elements.pendingRequests.textContent = value;
                console.log(`Updated pendingRequests: ${value}`);
            }

            if (elements.recentMessages) {
                const value = stats.recentMessages?.toString() || '0';
                elements.recentMessages.textContent = value;
                console.log(`Updated recentMessages: ${value}`);
            }
            
            // Update day info
            if (elements.todayScheduleDay) {
                const dayNames = {
                    'T2': 'Thứ 2', 'T3': 'Thứ 3', 'T4': 'Thứ 4', 
                    'T5': 'Thứ 5', 'T6': 'Thứ 6', 'T7': 'Thứ 7', 'CN': 'Chủ Nhật'
                };
                const value = dayNames[stats.currentDay] || 'Hôm nay';
                elements.todayScheduleDay.textContent = value;
                console.log(`Updated todayScheduleDay: ${value}`);
            }
            
        } else {
            console.warn('⚠️ Invalid or empty cached stats, setting defaults');
            // Set loading state
            Object.keys(elements).forEach(key => {
                if (elements[key] && key !== 'todayScheduleDay') {
                    elements[key].textContent = '-';
                }
            });
        }
        
        // Always run role checking after stats are loaded to ensure proper permissions
        await refreshUserRoleAndPermissions();
        
    } catch (error) {
        console.error('❌ Failed to load cached dashboard stats:', error);
        // Set default values on error
        if (elements.totalEmployees) {
            elements.totalEmployees.textContent = '0';
            console.log('Set totalEmployees default: 0');
        }
        if (elements.todaySchedule) {
            elements.todaySchedule.textContent = '0';
            console.log('Set todaySchedule default: 0');
        }
        if (elements.pendingRequests) {
            elements.pendingRequests.textContent = '0';
            console.log('Set pendingRequests default: 0');
        }
        if (elements.recentMessages) {
            elements.recentMessages.textContent = '0';
            console.log('Set recentMessages default: 0');
        }
        if (elements.todayScheduleDay) {
            elements.todayScheduleDay.textContent = 'Hôm nay';
            console.log('Set todayScheduleDay default: Hôm nay');
        }
        
        // Show error notification
        utils.showNotification('Không thể tải thống kê dashboard', 'warning');
    }
}

// Enhanced Dashboard Stats Initialization - Using unified dashboard API (LEGACY - kept for manual refresh only)
async function getDashboardStats() {
    
    // First, ensure the welcome section and stats-grid are visible
    const welcomeSection = document.querySelector('.welcome-section');
    const statsGrid = document.querySelector('.stats-grid');
    const content = document.getElementById('content');
    
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
    } else {
        console.warn('⚠️ Welcome section not found in DOM');
    }
    
    if (statsGrid) {
        statsGrid.style.display = 'grid';
    } else {
        console.warn('⚠️ Stats grid not found in DOM');
    }
    
    if (content) {
        content.style.display = 'block';
    }
    
    // Wait a moment for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const elements = {
        totalEmployees: document.getElementById('totalEmployees'),
        todaySchedule: document.getElementById('todaySchedule'), 
        pendingRequests: document.getElementById('pendingRequests'),
        recentMessages: document.getElementById('recentMessages'),
        todayScheduleDay: document.getElementById('todayScheduleDay')
    };

    console.log('📊 Stats elements found:', {
        totalEmployees: !!elements.totalEmployees,
        todaySchedule: !!elements.todaySchedule,
        pendingRequests: !!elements.pendingRequests,
        recentMessages: !!elements.recentMessages,
        todayScheduleDay: !!elements.todayScheduleDay
    });

    try {
        console.log('🌐 Fetching dashboard stats from API...');
        // Use the new unified dashboard stats API
        const stats = await utils.fetchAPI('?action=getDashboardStats');
        
        console.log('📈 Dashboard stats response:', stats);
        
        if (stats && typeof stats === 'object') {
            
            // Update dashboard statistics
            if (elements.totalEmployees) {
                const value = stats.totalEmployees?.toString() || '0';
                elements.totalEmployees.textContent = value;
                console.log(`Updated totalEmployees: ${value}`);
            }
            
            if (elements.todaySchedule) {
                const value = stats.todaySchedules?.toString() || '0';
                elements.todaySchedule.textContent = value;
                console.log(`Updated todaySchedule: ${value}`);
            }
            
            if (elements.pendingRequests) {
                const value = stats.pendingRequests?.toString() || '0';
                elements.pendingRequests.textContent = value;
                console.log(`Updated pendingRequests: ${value}`);
            }

            if (elements.recentMessages) {
                const value = stats.recentMessages?.toString() || '0';
                elements.recentMessages.textContent = value;
                console.log(`Updated recentMessages: ${value}`);
            }
            
            // Update day info
            if (elements.todayScheduleDay) {
                const dayNames = {
                    'T2': 'Thứ 2', 'T3': 'Thứ 3', 'T4': 'Thứ 4', 
                    'T5': 'Thứ 5', 'T6': 'Thứ 6', 'T7': 'Thứ 7', 'CN': 'Chủ Nhật'
                };
                const value = dayNames[stats.currentDay] || 'Hôm nay';
                elements.todayScheduleDay.textContent = value;
                console.log(`Updated todayScheduleDay: ${value}`);
            }
            
        } else {
            console.warn('⚠️ Invalid or empty stats response');
            // Set loading state
            Object.keys(elements).forEach(key => {
                if (elements[key] && key !== 'todayScheduleDay') {
                    elements[key].textContent = '-';
                }
            });
        }
        
        // Always run role checking after stats are loaded to ensure proper permissions
        await refreshUserRoleAndPermissions();
        
    } catch (error) {
        console.error('❌ Failed to load dashboard stats:', error);
        // Set default values on error
        if (elements.totalEmployees) {
            elements.totalEmployees.textContent = '0';
            console.log('Set totalEmployees default: 0');
        }
        if (elements.todaySchedule) {
            elements.todaySchedule.textContent = '0';
            console.log('Set todaySchedule default: 0');
        }
        if (elements.pendingRequests) {
            elements.pendingRequests.textContent = '0';
            console.log('Set pendingRequests default: 0');
        }
        if (elements.recentMessages) {
            elements.recentMessages.textContent = '0';
            console.log('Set recentMessages default: 0');
        }
        if (elements.todayScheduleDay) {
            elements.todayScheduleDay.textContent = 'Hôm nay';
            console.log('Set todayScheduleDay default: Hôm nay');
        }
        
        // Show error notification
        utils.showNotification('Không thể tải thống kê dashboard', 'warning');
    }
}

// Function to specifically ensure stats-grid is visible and updated
async function updateStatsGrid() {
    console.log('📊 Updating stats-grid visibility and content...');
    
    const statsGrid = document.querySelector('.stats-grid');
    const welcomeSection = document.querySelector('.welcome-section');
    
    if (statsGrid) {
        statsGrid.style.display = 'grid';
        statsGrid.style.visibility = 'visible';
        
        // Ensure all stat cards are visible
        const statCards = statsGrid.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.display = 'block';
        });
        
        // Update welcome section statistics
        await updateWelcomeStats();
    } else {
        console.warn('⚠️ Stats-grid not found in DOM');
    }
    
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        welcomeSection.style.visibility = 'visible';
    }
    
    // Force a re-layout
    await new Promise(resolve => setTimeout(resolve, 50));
}

// Update welcome section statistics with real data
async function updateWelcomeStats() {
    try {
        console.log('📊 Updating welcome section statistics...');
        
        // Get current user data
        const userData = await window.authManager.getUserData();
        if (!userData) {
            console.warn('No user data available for stats update');
            return;
        }
        
        // Update total employees (mock data for now)
        const totalEmployeesEl = document.getElementById('totalEmployees');
        if (totalEmployeesEl) {
            totalEmployeesEl.textContent = '45'; // Mock data
        }
        
        // Update today's shift info
        const todayShiftEl = document.getElementById('todayShift');
        const todayShiftTimeEl = document.getElementById('todayShiftTime');
        if (todayShiftEl && todayShiftTimeEl) {
            const now = new Date();
            const hour = now.getHours();
            
            if (hour >= 6 && hour < 14) {
                todayShiftEl.textContent = 'Ca Sáng';
                todayShiftTimeEl.textContent = '06:00 - 14:00';
            } else if (hour >= 14 && hour < 22) {
                todayShiftEl.textContent = 'Ca Chiều';
                todayShiftTimeEl.textContent = '14:00 - 22:00';
            } else {
                todayShiftEl.textContent = 'Ca Đêm';
                todayShiftTimeEl.textContent = '22:00 - 06:00';
            }
        }
        
        // Update pending requests (fetch from API)
        const pendingRequestsEl = document.getElementById('pendingRequests');
        if (pendingRequestsEl) {
            try {
                const response = await utils.fetchAPI(`?action=getPendingRequestsCount&employeeId=${userData.employeeId}`);
                if (response.success) {
                    pendingRequestsEl.textContent = response.count || '0';
                } else {
                    pendingRequestsEl.textContent = '0';
                }
            } catch (error) {
                console.log('Could not fetch pending requests count:', error);
                pendingRequestsEl.textContent = '0';
            }
        }
        
        // Update recent messages (mock data)
        const recentMessagesEl = document.getElementById('recentMessages');
        if (recentMessagesEl) {
            recentMessagesEl.textContent = Math.floor(Math.random() * 10).toString();
        }
        
        console.log('✅ Welcome stats updated successfully');
    } catch (error) {
        console.error('Error updating welcome stats:', error);
    }
}

// Role-based UI Management  
async function initializeRoleBasedUI() {
    let userPosition = 'NV'; // Default fallback
    
    // Use cached user data instead of making fresh API calls during initialization
    try {
        let freshUserData = null;
        if (window.authManager.cachedUser && window.authManager.isCacheValid('user')) {
            freshUserData = window.authManager.cachedUser;
        } else {
            // Fallback to localStorage data if cache is not available  
            freshUserData = window.authManager.userData;
        }
        
        if (freshUserData && freshUserData.position) {
            userPosition = freshUserData.position;
            console.log('🔐 Using cached role for UI initialization:', userPosition);
        } else {
            console.warn('⚠️ No user data found, using default role NV');
        }
    } catch (error) {
        console.warn('⚠️ Using default role due to error:', error);
    }
    
    console.log('🔐 Initializing role-based UI for position:', userPosition);
    
    // Show/hide elements based on role (simple direct matching like original)
    const allRoleElements = document.querySelectorAll('[data-role]');
    let adElementsFound = 0;
    let adElementsShown = 0;
    
    allRoleElements.forEach(element => {
        // Skip menu items as they are handled by MenuManager
        if (element.closest('#menuList')) {
            return;
        }
        
        // Skip user cards in permission management to prevent data loss
        if (element.classList.contains('user-card') || element.closest('.user-selection-panel')) {
            return;
        }
        
        const allowedRoles = element.dataset.role.split(',');
        const hasAccess = allowedRoles.includes(userPosition);
        
        // Special tracking for AD role debugging
        if (allowedRoles.includes('AD')) {
            adElementsFound++;
        }
        
        if (hasAccess) {
            element.classList.add('role-visible');
            element.style.display = '';
            element.style.visibility = 'visible';
            
            // Special tracking for AD role debugging
            if (allowedRoles.includes('AD') && userPosition === 'AD') {
                adElementsShown++;
            }
        } else {
            element.classList.remove('role-visible');
            element.style.display = 'none';
        }
    });
    
    if (userPosition === 'AD') {
        console.log(`🔍 AD Role Summary: Found ${adElementsFound} AD elements, Shown ${adElementsShown} elements`);
        
        // Additional verification for all AD-specific sections - with improved error handling
        const adSections = [
            '.quick-actions-section',
            '.analytics-section', 
            '.finance-section',
            '.registration-approval-section',
            '.store-management-section'
        ];
        
        // Wait for DOM to be fully ready before checking sections
        await new Promise(resolve => setTimeout(resolve, 100));
        
        adSections.forEach(selector => {
            // Use more flexible selector approach
            const section = document.querySelector(selector);
            if (section) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.classList.add('role-visible');
                section.classList.remove('role-hidden');
            } else {
                // Try without the dot prefix in case of selector issues
                const altSelector = selector.startsWith('.') ? selector.substring(1) : '.' + selector;
                const altSection = document.querySelector(altSelector);
                if (altSection) {
                    altSection.style.display = 'block';
                    altSection.style.visibility = 'visible';
                    altSection.classList.add('role-visible');
                    altSection.classList.remove('role-hidden');
                } else {
                    // Final check: look for class name in any div
                    const className = selector.replace('.', '');
                    const classSection = document.querySelector(`div.${className}`);
                    if (classSection) {
                        classSection.style.display = 'block';
                        classSection.style.visibility = 'visible';
                        classSection.classList.add('role-visible');
                        classSection.classList.remove('role-hidden');
                    } else {
                        console.log(`ℹ️ AD Section ${selector} not found - likely due to DOM timing or authentication`);
                    }
                }
            }
        });
    }
    
}

// Apply role-based section visibility for welcome-section without data-role attributes
async function applyRoleBasedSectionVisibility() {
    let userRole = 'NV'; // Default fallback
    
    // Use cached user data instead of making fresh API calls during initialization
    try {
        let freshUserData = null;
        if (window.authManager.cachedUser && window.authManager.isCacheValid('user')) {
            freshUserData = window.authManager.cachedUser;
        } else {
            // Fallback to localStorage data if cache is not available  
            freshUserData = window.authManager.userData;
        }
        
        if (freshUserData && freshUserData.position) {
            userRole = freshUserData.position;
            console.log('🔐 Using cached role for section visibility:', userRole);
        } else {
            console.warn('⚠️ No user data found, using default role NV');
        }
    } catch (error) {
        console.warn('⚠️ Using default role due to error:', error);
    }
    
    console.log('🎛️ Applying role-based section visibility for role:', userRole);
    
    // Role-based section visibility map
    const sectionVisibility = {
        'AD': {
            '.quick-actions-section': true,
            '.analytics-section': true,
            '.store-management-section': true,
            '.finance-section': true,
            '.registration-approval-section': true,
            '.personal-section': false,
            '.activities-section': true
        },
        'QL': {
            '.quick-actions-section': true,
            '.analytics-section': false,
            '.store-management-section': true,
            '.finance-section': false,
            '.registration-approval-section': true,
            '.personal-section': false,
            '.activities-section': true
        },
        'NV': {
            '.quick-actions-section': false,
            '.analytics-section': false,
            '.store-management-section': false,
            '.finance-section': false,
            '.registration-approval-section': false,
            '.personal-section': true,
            '.activities-section': true
        },
        'AM': {
            '.quick-actions-section': false,
            '.analytics-section': false,
            '.store-management-section': false,
            '.finance-section': false,
            '.registration-approval-section': false,
            '.personal-section': true,
            '.activities-section': true
        }
    };
    
    console.log('📋 Available sections to configure:', Object.keys(sectionVisibility.AD));
    const roleConfig = sectionVisibility[userRole] || sectionVisibility['NV'];
    
    // Count sections that should be visible
    const visibleSections = Object.entries(roleConfig).filter(([_, isVisible]) => isVisible);
    console.log(`📊 Expected ${visibleSections.length} sections to be visible for ${userRole} role`);
    
    // Apply visibility settings
    Object.entries(roleConfig).forEach(([selector, isVisible]) => {
        const section = document.querySelector(selector);
        if (section) {
            if (isVisible) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.classList.remove('role-hidden');
                section.classList.add('role-visible');
            } else {
                section.style.display = 'none';
                section.style.visibility = 'hidden';
                section.classList.add('role-hidden');
                section.classList.remove('role-visible');
                console.log(`❌ Section hidden for ${userRole}: ${selector}`);
            }
        } else {
            console.warn(`⚠️ Section not found: ${selector}`);
        }
    });
    
    // Summary log
    const actualVisibleSections = document.querySelectorAll('.role-visible').length;
    console.log(`📈 Result: ${actualVisibleSections} sections are now visible`);
    
    // Special debug for AD role
    if (userRole === 'AD') {
        console.log('🔍 AD Role Special Debug:');
        console.log('  - Quick Actions:', !!document.querySelector('.quick-actions-section.role-visible'));
        console.log('  - Analytics:', !!document.querySelector('.analytics-section.role-visible'));
        console.log('  - Store Management:', !!document.querySelector('.store-management-section.role-visible'));
        console.log('  - Finance:', !!document.querySelector('.finance-section.role-visible'));
        console.log('  - Registration Approval:', !!document.querySelector('.registration-approval-section.role-visible'));
        console.log('  - Activities:', !!document.querySelector('.activities-section.role-visible'));
    }
    
    // Also apply role-based visibility to quick action buttons within the visible section
    if (roleConfig['.quick-actions-section']) {
        const quickActionVisibility = {
            'AD': ['addEmployee', 'createSchedule', 'viewReports'],
            'QL': ['createSchedule'],
            'NV': [],
            'AM': []
        };
        
        const allowedActions = quickActionVisibility[userRole] || [];
        
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            const action = btn.dataset.action;
            if (allowedActions.includes(action)) {
                btn.style.display = 'flex';
                btn.style.visibility = 'visible';
            } else {
                btn.style.display = 'none';
                btn.style.visibility = 'hidden';
                console.log(`❌ Quick action hidden for ${userRole}: ${action}`);
            }
        });
    }
    
}

// Quick Actions Handler
function initializeQuickActions() {
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleQuickAction(action);
        });
    });
}

// Handle Quick Actions
function handleQuickAction(action) {
    switch (action) {
        case 'addEmployee':
            openModal('register');
            break;
        case 'createSchedule':
            openModal('scheduleWork');
            break;
        case 'viewReports':
            generateReports();
            break;
        default:
            utils.showNotification('Tính năng đang phát triển', 'warning');
    }
}

// Store Management Functions
function manageStore(storeId) {
    utils.showNotification(`Quản lý cửa hàng ${storeId}`, 'info');
    // Implement store management logic here
}

function viewStoreSchedule(storeId) {
    utils.showNotification(`Xem lịch cửa hàng ${storeId}`, 'info');
    // Implement schedule viewing logic here
}

// Load More Activities
function loadMoreActivities() {
    utils.showNotification('Đang tải thêm hoạt động...', 'info');
    // Implement load more logic here
}

// Generate Reports (Admin only)
function generateReports() {
    // Stay on dashboard and show reports interface instead of redirecting
    const content = document.getElementById('content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>📈 Báo Cáo Hệ Thống</h2>
                <button onclick="location.reload()" class="btn btn-secondary">Quay lại Dashboard</button>
            </div>
            <div class="card-body">
                <div class="reports-grid">
                    <div class="report-section">
                        <h3>Báo Cáo Nhân Viên</h3>
                        <div class="report-stats">
                            <div class="stat-item">
                                <span class="stat-label">Tổng nhân viên:</span>
                                <span class="stat-value" id="reportTotalEmployees">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Hoạt động hôm nay:</span>
                                <span class="stat-value" id="reportTodayActive">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="report-section">
                        <h3>Báo Cáo Yêu Cầu</h3>
                        <div class="report-stats">
                            <div class="stat-item">
                                <span class="stat-label">Yêu cầu chờ xử lý:</span>
                                <span class="stat-value" id="reportPendingRequests">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Đã xử lý tuần này:</span>
                                <span class="stat-value" id="reportWeeklyProcessed">-</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="report-actions">
                    <button onclick="refreshDashboardStats()" class="btn btn-primary">🔄 Làm mới dữ liệu</button>
                    <button onclick="exportReports()" class="btn btn-success">📊 Xuất báo cáo</button>
                </div>
            </div>
        </div>
    `;
    
    // Load report data
    loadReportData();
    utils.showNotification('Đang tải báo cáo...', 'info');
}

// Refresh dashboard stats manually when requested
async function refreshDashboardStats() {
    try {
        utils.showNotification('Đang làm mới dữ liệu...', 'info');
        
        // Clear dashboard stats cache to force fresh API call
        window.authManager.clearSpecificCache('dashboardStats');
        
        // Load fresh stats (will call API since cache is cleared)
        await window.authManager.getDashboardStats();
        
        // Update UI with fresh data
        await updateDashboardStatsUI();
        
        // Load fresh report data
        await loadReportData();
        
        // Ensure role permissions are refreshed after stats update
        await refreshUserRoleAndPermissions();
        
        utils.showNotification('Dữ liệu đã được cập nhật', 'success');
    } catch (error) {
        console.error('Error refreshing dashboard stats:', error);
        utils.showNotification('Lỗi khi làm mới dữ liệu', 'error');
    }
}

// Load report data using cached stats to avoid duplicate API calls
async function loadReportData() {
    try {
        // Use cached dashboard stats from AuthManager instead of making fresh API call
        const stats = await window.authManager.getDashboardStats();
        if (stats) {
            document.getElementById('reportTotalEmployees').textContent = stats.totalEmployees || '0';
            document.getElementById('reportTodayActive').textContent = stats.todaySchedules || '0';
            document.getElementById('reportPendingRequests').textContent = stats.pendingRequests || '0';
            document.getElementById('reportWeeklyProcessed').textContent = stats.weeklyProcessed || '0';
        }
    } catch (error) {
        console.error('Error loading report data:', error);
    }
}

// Export reports functionality
function exportReports() {
    utils.showNotification('Tính năng xuất báo cáo đang được phát triển', 'warning');
}

// Refresh user role and permissions using cached data during initialization
async function refreshUserRoleAndPermissions() {
    try {
        // Use cached user data instead of making fresh API calls during initialization
        let freshUserData = null;
        if (window.authManager.cachedUser && window.authManager.isCacheValid('user')) {
            freshUserData = window.authManager.cachedUser;
            console.log('🔐 Using cached user data for role permissions');
        } else {
            // Fallback to localStorage data if cache is not available  
            freshUserData = window.authManager.userData;
            console.log('🔐 Using localStorage user data for role permissions');
        }
        
        if (freshUserData && freshUserData.position) {
            
            // Update role-based UI with cached data
            await initializeRoleBasedUI();
            MenuManager.updateMenuByRole(freshUserData.position);
            
            // Verify AD functions are visible if user is AD
            if (freshUserData.position === 'AD') {
                setTimeout(async () => {
                    const adElements = document.querySelectorAll('[data-role*="AD"]');
                    const visibleADElements = Array.from(adElements).filter(el => 
                        el.style.display !== 'none' && !el.classList.contains('role-hidden')
                    );
                    
                    if (visibleADElements.length < adElements.length) {
                        console.warn('⚠️ Re-applying AD permissions...');
                        await initializeRoleBasedUI();
                        MenuManager.updateMenuByRole(freshUserData.position);
                    }
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error refreshing user role:', error);
    }
}

// Initialize Personal Dashboard for Employees
async function initializePersonalDashboard() {
    const userInfo = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    const position = userInfo.position;
    
    if (['NV', 'AM'].includes(position)) {
        await loadPersonalSchedule();

        await loadPersonalTasks();
    }
}

// Load Personal Schedule
async function loadPersonalSchedule() {
    const container = document.getElementById('personalSchedule');
    if (!container) return;

    try {
        const userInfo = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const employeeId = userInfo.employeeId || userInfo.loginEmployeeId;
        const response = await utils.fetchAPI(`?action=checkdk&employeeId=${employeeId}`);
        
        if (response && response.shifts) {
            const scheduleHTML = response.shifts.map(shift => `
                <div class="schedule-day">
                    <span class="day-name">${shift.day}:</span>
                    <span class="day-time">${shift.time}</span>
                </div>
            `).join('');
            container.innerHTML = scheduleHTML;
        } else {
            container.innerHTML = '<p>Chưa đăng ký lịch làm</p>';
        }
    } catch (error) {
        console.error('Failed to load personal schedule:', error);
        container.innerHTML = '<p>Không thể tải lịch làm</p>';
    }
}



// Load Personal Tasks
async function loadPersonalTasks() {
    const container = document.getElementById('personalTasks');
    if (!container) return;

    try {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const tasks = await utils.fetchAPI(`?action=getTasks&status=pending&limit=5&token=${token}`);
        
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            const tasksHTML = tasks.map(task => `
                <div class="task-item">
                    <span class="task-type">${task.type}</span>
                    <span class="task-status status-${task.status}">${task.status}</span>
                    <span class="task-date">${utils.formatDate(task.createdAt)}</span>
                </div>
            `).join('');
            container.innerHTML = tasksHTML;
        } else {
            container.innerHTML = '<p>Không có yêu cầu nào</p>';
        }
    } catch (error) {
        console.error('Failed to load personal tasks:', error);
        container.innerHTML = '<p>Không thể tải yêu cầu</p>';
    }
}

// Initialize Finance Dashboard (Admin only)
async function initializeFinanceDashboard() {
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    const monthlyExpense = document.getElementById('monthlyExpense');
    const monthlyProfit = document.getElementById('monthlyProfit');
    const monthlyPayroll = document.getElementById('monthlyPayroll');

    // Mock data for demo - replace with real API calls
    if (monthlyRevenue) monthlyRevenue.textContent = '125,000,000 ₫';
    if (monthlyExpense) monthlyExpense.textContent = '85,000,000 ₫';
    if (monthlyProfit) monthlyProfit.textContent = '40,000,000 ₫';
    if (monthlyPayroll) monthlyPayroll.textContent = '35,000,000 ₫';
}

// GitHub-Style Mobile Menu Dialog Handler
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileDialog = document.getElementById('mobile-nav-dialog');
    const closeDialog = document.querySelector('.close-dialog');
    
    if (!menuToggle || !mobileDialog) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    let isMenuOpen = false;
    
    // Remove any existing event listeners first
    const oldHandler = menuToggle._mobileMenuHandler;
    if (oldHandler) {
        menuToggle.removeEventListener('click', oldHandler);
    }
    
    // Open dialog function
    function openMobileMenu() {
        if (!isMenuOpen) {
            mobileDialog.showModal();
            document.body.style.overflow = 'hidden';
            isMenuOpen = true;
            
            // Add animation class
            requestAnimationFrame(() => {
                mobileDialog.style.opacity = '1';
                mobileDialog.style.transform = 'translateX(0)';
            });
        }
    }
    
    // Close dialog function
    function closeMobileMenu() {
        if (isMenuOpen) {
            mobileDialog.style.opacity = '0';
            mobileDialog.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
                mobileDialog.close();
                document.body.style.overflow = '';
                isMenuOpen = false;
            }, 300);
        }
    }
    
    // Menu toggle click handler
    function handleMenuToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        openMobileMenu();
    }
    
    // Store handler reference for cleanup
    menuToggle._mobileMenuHandler = handleMenuToggle;
    
    // Add event listeners
    menuToggle.addEventListener('click', handleMenuToggle);
    
    // Close dialog button
    if (closeDialog) {
        closeDialog.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
        });
    }
    
    // Close on backdrop click
    mobileDialog.addEventListener('click', (e) => {
        if (e.target === mobileDialog) {
            closeMobileMenu();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Mobile menu item handlers - mirror desktop functionality
    function setupMobileMenuHandlers() {
        // Mobile submenu toggle functionality
        const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
        mobileMenuItems.forEach(item => {
            const menuLink = item.querySelector('.mobile-menu-link');
            const submenu = item.querySelector('.mobile-submenu');
            
            if (menuLink && submenu) {
                menuLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Toggle submenu visibility
                    const isOpen = item.classList.contains('submenu-open');
                    
                    // Close all other submenus
                    mobileMenuItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('submenu-open');
                        }
                    });
                    
                    // Toggle current submenu
                    if (isOpen) {
                        item.classList.remove('submenu-open');
                    } else {
                        item.classList.add('submenu-open');
                    }
                });
            }
        });
        
        // Shift Management
        document.getElementById('mobileShiftAssignment')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showShiftAssignment(), 300);
        });
        
        document.getElementById('mobileWorkShifts')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showWorkShifts(), 300);
        });
        
        document.getElementById('mobileAttendance')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showAttendance(), 300);
        });
        

        
        document.getElementById('mobileSubmitTask')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showSubmitTask(), 300);
        });
        
        document.getElementById('mobileTaskPersonnel')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showTaskPersonnel(), 300);
        });
        
        document.getElementById('mobileTaskStore')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showTaskStore(), 300);
        });
        
        document.getElementById('mobileTaskFinance')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showTaskFinance(), 300);
        });
        
        document.getElementById('mobileTaskApproval')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showTaskApproval(), 300);
        });
        
        // Work Tasks menu item
        document.getElementById('mobileWorkTasks')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showWorkTasks(), 300);
        });
        
        document.getElementById('mobileRegistrationApproval')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showRegistrationApproval(), 300);
        });
        
        document.getElementById('mobileGrantAccess')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showGrantAccess(), 300);
        });
        
        document.getElementById('mobilePersonalInformation')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showPersonalInformation(), 300);
        });
        
        // Mobile logout
        document.getElementById('mobileLogout')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => {
                if (window.authManager) {
                    window.authManager.logout();
                } else {
                    // Fallback logout if authManager is not available
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
                    // window.location.href = "index.html"; // Commented for testing
                }
            }, 300);
        });
    }
    
    setupMobileMenuHandlers();
    
    console.log('✅ GitHub-style mobile menu dialog initialized');
}

// Global logout function for sidebar button and other components
function logout() {
    if (window.authManager) {
        window.authManager.logout();
    } else {
        // Fallback logout if authManager is not available
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        // window.location.href = "index.html"; // Commented for testing
    }
}

// Function to ensure dashboard content is visible
function showDashboardContent() {
    
    const content = document.getElementById('content');
    const welcomeSection = document.querySelector('.welcome-section');
    const statsGrid = document.querySelector('.stats-grid');
    
    // Make sure main content is visible
    if (content) {
        content.style.display = 'block';
        content.style.visibility = 'visible';
    }
    
    // Make sure welcome section is visible
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        welcomeSection.style.visibility = 'visible';
    }
    
    // Make sure stats grid is visible
    if (statsGrid) {
        statsGrid.style.display = 'grid';
        statsGrid.style.visibility = 'visible';
    }
    
    // Log element existence
    console.log('📊 Dashboard elements status:', {
        content: !!content,
        welcomeSection: !!welcomeSection,
        statsGrid: !!statsGrid,
        totalEmployees: !!document.getElementById('totalEmployees'),
        todaySchedule: !!document.getElementById('todaySchedule'),
        pendingRequests: !!document.getElementById('pendingRequests'),
        recentMessages: !!document.getElementById('recentMessages')
    });
}

// Enhanced Loading Screen Management with CSS Animations
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.add('loading-fade-in');
        
        // Animate loading content
        const loadingContent = loadingScreen.querySelector('.loading-content');
        if (loadingContent) {
            loadingContent.classList.add('loading-content-slide-in');
        }
        
        // Apply spinning animation to spinner
        const spinner = loadingScreen.querySelector('.loading-spinner');
        if (spinner) {
            spinner.classList.add('loading-spinner-rotate');
        }
        
        // Apply bounce animation to dots
        const dots = loadingScreen.querySelectorAll('.loading-dot');
        dots.forEach((dot, index) => {
            dot.style.animationDelay = `${index * 0.1}s`;
            dot.classList.add('loading-dot-bounce');
        });
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('loading-fade-out');
        
        // Animate loading content out
        const loadingContent = loadingScreen.querySelector('.loading-content');
        if (loadingContent) {
            loadingContent.classList.add('loading-content-slide-out');
        }
        
        // Hide after animation completes
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('loading-fade-in', 'loading-fade-out');
            
            const loadingContent = loadingScreen.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.classList.remove('loading-content-slide-in', 'loading-content-slide-out');
            }
            
            const spinner = loadingScreen.querySelector('.loading-spinner');
            if (spinner) {
                spinner.classList.remove('loading-spinner-rotate');
            }
        }, 400);
    }
}

// Enhanced Dashboard Loader Functions
function showDashboardLoader() {
    const dashboardLoader = document.getElementById('dashboardLoader');
    if (dashboardLoader) {
        dashboardLoader.classList.remove('hidden');
        dashboardLoader.style.display = 'flex';
        dashboardLoader.style.pointerEvents = 'all'; // Block all pointer events on underlying elements
        dashboardLoader.style.zIndex = '999999'; // Ensure highest z-index
        
        // Also disable all interactive elements behind the loader
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Dashboard loader shown with complete interaction blocking');
    }
}

async function hideDashboardLoader() {
    const dashboardLoader = document.getElementById('dashboardLoader');
    const dashboardContent = document.getElementById('dashboardContent');
    
    // Remove artificial delay to improve LCP performance
    // Only wait for content to be actually ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (dashboardLoader) {
        dashboardLoader.classList.add('fade-out');
        
        setTimeout(() => {
            dashboardLoader.style.display = 'none';
            dashboardLoader.classList.remove('fade-out');
            dashboardLoader.classList.add('hidden'); // Ensure hidden class is added
            dashboardLoader.style.pointerEvents = 'none'; // Disable pointer events completely
            
            // Re-enable body scroll
            document.body.style.overflow = '';
        }, 400);
        
        console.log('✅ Dashboard loader hidden (optimized for LCP)');
    }
    
    if (dashboardContent) {
        dashboardContent.classList.remove('dashboard-hidden');
        dashboardContent.classList.add('loaded');
        
        console.log('✅ Dashboard content shown');
        
        // Animate dashboard content after loading screen is hidden
        setTimeout(() => {
            animateDashboardContent();
        }, 100);
    }
}

// Enhanced Dashboard Content Animation with CSS
function animateDashboardContent() {
    console.log('✨ Animating dashboard content with CSS...');
    
    // Animate main content container
    const main = document.querySelector('.main');
    if (main) {
        main.classList.add('dashboard-main-fade-in');
    }
    
    // Animate stat cards with stagger
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('dashboard-card-slide-in');
        }, index * 100 + 200);
    });
    
    // Animate quick action buttons
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach((btn, index) => {
        setTimeout(() => {
            btn.classList.add('dashboard-button-bounce-in');
        }, index * 50 + 400);
    });
    
    // Animate other content sections
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, index) => {
        setTimeout(() => {
            title.classList.add('dashboard-title-slide-in');
        }, index * 200 + 600);
    });
    
    console.log('✅ Dashboard animations applied');
}

// Time Display Management
function updateTimeDisplay() {
    const timeDisplay = document.getElementById('timeDisplay');
    const timeIcon = document.getElementById('timeIcon');
    
    if (!timeDisplay || !timeIcon) return;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    timeDisplay.textContent = timeString;
    
    // Update icon based on time (6 PM - 7 AM = night)
    if (hours >= 18 || hours < 7) {
        timeIcon.textContent = 'bedtime';
        timeIcon.classList.add('moon');
        timeIcon.classList.remove('sun');
    } else {
        timeIcon.textContent = 'wb_sunny';
        timeIcon.classList.add('sun');
        timeIcon.classList.remove('moon');
    }
}

// Initialize time display
function initializeTimeDisplay() {
    updateTimeDisplay();
    // Update every minute
    setInterval(updateTimeDisplay, 60000);
}

// Dashboard Content Storage for Company Logo Restoration
let originalDashboardContent = null;

function saveOriginalDashboardContent() {
    const content = document.getElementById('content');
    if (content && !originalDashboardContent) {
        originalDashboardContent = content.innerHTML;
        console.log('💾 Original dashboard content saved');
    }
}

function restoreOriginalDashboardContent() {
    const content = document.getElementById('content');
    if (content && originalDashboardContent) {
        content.innerHTML = originalDashboardContent;
        console.log('🔄 Dashboard content restored to original state');
        
        // Re-initialize any necessary event handlers for the restored content
        MenuManager.setupMenuInteractions();
        setupMobileMenu();
        
        // Update stats and apply role-based visibility
        setTimeout(async () => {
            await updateStatsGrid();
            await applyRoleBasedSectionVisibility();
        }, 100);
    }
}

// Enhanced Dashboard Initialization
async function initializeEnhancedDashboard() {
    try {
        
        // First ensure content is visible
        showDashboardContent();
        
        // Use cached user data - don't make fresh API calls during initialization
        let freshUserData = null;
        if (window.authManager.cachedUser && window.authManager.isCacheValid('user')) {
            freshUserData = window.authManager.cachedUser;
            console.log('📊 Using cached user data for dashboard initialization');
        } else {
            // Fallback to localStorage data if cache is not available
            freshUserData = window.authManager.userData;
            console.log('📊 Using localStorage user data for dashboard initialization');
        }
        
        if (!freshUserData || !freshUserData.position) {
            console.error('Failed to get user data for dashboard initialization');
            return;
        }

        const userPosition = freshUserData.position;
        console.log('📊 Dashboard user data:', { 
            employeeId: freshUserData.employeeId, 
            fullName: freshUserData.fullName, 
            position: userPosition,
            storeName: freshUserData.storeName
        });
        
        // Update user info display in header
        const userInfoElement = document.getElementById("userInfo");
        if (userInfoElement) {
            userInfoElement.textContent = `Chào ${freshUserData.fullName} - ${freshUserData.employeeId}`;
        }
        
        // Initialize all dashboard components using cached data to prevent duplicate API calls
        console.log('📊 Initializing dashboard with cached stats and role checking...');
        
        // Load stats ONCE using AuthManager cache system
        await window.authManager.getDashboardStats();
        
        // Update the UI with cached stats
        await updateDashboardStatsUI();
        
        // Initialize role-based UI and menu visibility with cached data
        await initializeRoleBasedUI();
        MenuManager.updateMenuByRole(userPosition);
        
        // Comprehensive AD functions verification
        if (userPosition === 'AD') {
            console.log('🔍 Verifying AD role functions visibility...');
            
            // Force show all AD elements immediately
            const adElements = document.querySelectorAll('[data-role*="AD"]');
            console.log(`Found ${adElements.length} AD elements to show`);
            
            adElements.forEach((element, index) => {
                element.style.display = 'block';
                element.classList.add('role-visible');
                element.classList.remove('role-hidden');
                console.log(`AD Element ${index + 1}: ${element.tagName}.${element.className} - Made visible`);
            });
            
            // Special handling for quick action buttons
            const quickActionBtns = document.querySelectorAll('.quick-action-btn[data-role*="AD"]');
            quickActionBtns.forEach((btn, index) => {
                btn.style.display = 'flex';
                btn.classList.add('role-visible');
                console.log(`AD Quick Action ${index + 1}: ${btn.dataset.action} - Made visible`);
            });
            
            // Verification check after a short delay
            setTimeout(() => {
                const visibleADElements = Array.from(adElements).filter(el => 
                    el.style.display !== 'none' && !el.classList.contains('role-hidden')
                );
                console.log('AD elements visibility check:', {
                    total: adElements.length,
                    visible: visibleADElements.length,
                    success: visibleADElements.length === adElements.length
                });
                
                if (visibleADElements.length < adElements.length) {
                    console.warn('⚠️ Some AD elements still not visible. Re-applying...');
                    adElements.forEach(el => {
                        el.style.display = 'block';
                        el.classList.add('role-visible');
                    });
                }
            }, 1000);
        }
        
        initializeQuickActions();
        await initializePersonalDashboard();
        await initializeFinanceDashboard();
        
        // Setup UI enhancements
        // Mobile menu setup is handled in main initialization
        // Theme switching is handled by ThemeManager.initialize()
        
        utils.showNotification('Dashboard đã được tải thành công', 'success');
        
        // Save the original dashboard content after initialization
        saveOriginalDashboardContent();
        
    } catch (error) {
        console.error('Failed to initialize enhanced dashboard:', error);
        utils.showNotification('Có lỗi khi tải dashboard', 'error');
    }
}

// Simplified refresh system - runs only on page load and user actions
async function refreshSystemData() {
    try {
        
        // Re-initialize role-based UI to ensure functions remain visible using fresh API data
        await refreshUserRoleAndPermissions();
        
    } catch (error) {
        console.log('⚠️ System refresh failed:', error.message);
    }
}

// Run refresh only on page load - will be handled by main-init.js

// Export function for manual refresh when user performs actions
window.triggerSystemRefresh = refreshSystemData;

// Global functions for change request modal
function openChangeRequestModal(field, currentValue) {
    const modal = document.getElementById('changeRequestModal');
    const form = document.getElementById('changeRequestForm');
    const fieldLabel = document.getElementById('changeFieldLabel');
    const currentValueInput = document.getElementById('currentValue');
    const newValueInput = document.getElementById('newValue');
    const reasonTextarea = document.getElementById('changeReason');
    
    // Set field information
    form.dataset.field = field;
    fieldLabel.textContent = getFieldDisplayName(field);
    currentValueInput.value = currentValue;
    newValueInput.value = '';
    reasonTextarea.value = '';
    
    modal.style.display = 'flex';
    newValueInput.focus();
}

function closeChangeRequestModal() {
    const modal = document.getElementById('changeRequestModal');
    modal.style.display = 'none';
}

function closePasswordModal() {
    const modal = document.getElementById('passwordConfirmModal');
    modal.style.display = 'none';
    document.getElementById('confirmPassword').value = '';
}

function getFieldDisplayName(field) {
    const displayNames = {
        'fullName': 'Họ và tên',
        'position': 'Chức vụ',
        'storeName': 'Cửa hàng',
        'joinDate': 'Ngày gia nhập'
    };
    return displayNames[field] || field;
}

// Function to show welcome section when clicking HR Management System title
async function showWelcomeSection() {
    console.log('📍 Showing welcome section - Building role-based content');
    
    const content = document.getElementById('content');
    if (!content) {
        console.error('Content element not found');
        return;
    }
    
    try {
        // Show loading message
        content.innerHTML = `
            <h1 class="dashboard-title">Hệ Thống Quản Lý Nhân Sự</h1>
            <div class="welcome-section">
                <div class="stats-grid">
                    <div class="loading-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color);">
                        <p style="margin: 0; font-size: 1.1rem; color: var(--text-secondary);">🔄 Đang tải dashboard theo phân quyền...</p>
                    </div>
                </div>
            </div>
        `;
        
        // Wait a moment for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get user role first before building content using cached data
        let userRole = 'NV'; // Default fallback
        
        // Use cached user data instead of making fresh API calls during initialization
        try {
            let freshUserData = null;
            if (window.authManager.cachedUser && window.authManager.isCacheValid('user')) {
                freshUserData = window.authManager.cachedUser;
            } else {
                // Fallback to localStorage data if cache is not available  
                freshUserData = window.authManager.userData;
            }
            
            if (freshUserData && freshUserData.position) {
                userRole = freshUserData.position;
                console.log('🔐 Using cached role for welcome section:', userRole);
            } else {
                console.warn('⚠️ No user data found, using default role NV');
            }
        } catch (error) {
            console.warn('⚠️ Using default role due to error:', error);
        }
        
        console.log('🏗️ Building content for role:', userRole);
        
        // Build role-specific content
        const roleBasedContent = buildRoleBasedDashboard(userRole);
        
        content.innerHTML = `
            <h1 class="dashboard-title">Hệ Thống Quản Lý Nhân Sự</h1>
            <div class="welcome-section">
                ${roleBasedContent}
            </div>
        `;
        
        // Make sure content is visible first
        showDashboardContent();
        
        // Use cached stats to update the stats numbers (no fresh API call)
        await updateDashboardStatsUI();
        
        
    } catch (error) {
        console.error('❌ Error building role-based welcome section:', error);
        utils.showNotification('Có lỗi khi tải dashboard', 'error');
    }
}

// Helper function to build role-based dashboard content
function buildRoleBasedDashboard(userRole) {
    console.log('🏗️ Building dashboard sections for role:', userRole);
    
    let content = '';
    
    // Stats grid - always shown for all roles
    content += `
        <!-- Main Statistics Grid -->
        <div class="stats-grid">
            <div class="stat-card primary">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3>Tổng Nhân Viên</h3>
                    <p id="totalEmployees">-</p>
                    <span class="stat-trend">+2 tuần này</span>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                    <h3>Lịch Hôm Nay</h3>
                    <p id="todaySchedule">-</p>
                    <span class="stat-trend" id="todayScheduleDay">-</span>
                </div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon">📋</div>
                <div class="stat-info">
                    <h3>Yêu Cầu Chờ</h3>
                    <p id="pendingRequests">-</p>
                    <span class="stat-trend">Cần xử lý</span>
                </div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon">💬</div>
                <div class="stat-info">
                    <h3>Tin Nhắn Mới</h3>
                    <p id="recentMessages">-</p>
                    <span class="stat-trend">24h qua</span>
                </div>
            </div>
        </div>
    `;
    
    // Role-specific sections
    if (userRole === 'AD' || userRole === 'QL') {
        // Quick Actions for Admin and Managers
        content += `
            <!-- Role-based Quick Actions -->
            <div class="quick-actions-section">
                <h2 class="section-title">Thao Tác Nhanh</h2>
                <div class="quick-actions-grid">
        `;
        
        if (userRole === 'AD') {
            content += `
                    <button class="quick-action-btn" data-action="addEmployee">
                        <span class="action-icon">👤</span>
                        <span class="action-text">Thêm Nhân Viên</span>
                    </button>
            `;
        }
        
        content += `
                    <button class="quick-action-btn" data-action="createSchedule">
                        <span class="action-icon">📊</span>
                        <span class="action-text">Tạo Lịch Làm</span>
                    </button>
        `;
        
        if (userRole === 'AD') {
            content += `
                    <button class="quick-action-btn" data-action="viewReports">
                        <span class="action-icon">📈</span>
                        <span class="action-text">Báo Cáo</span>
                    </button>
            `;
        }
        
        content += `
                </div>
            </div>
        `;
    }
    
    // Admin-only sections
    if (userRole === 'AD') {
        // Advanced Analytics Dashboard
        content += `
            <!-- Advanced Analytics Dashboard for Admin -->
            <div class="analytics-section">
                <h2 class="section-title">Phân Tích Dữ Liệu</h2>
                <div class="analytics-grid">
                    <div class="chart-card">
                        <h3>Hiệu Suất Nhân Viên</h3>
                        <div class="chart-placeholder" id="performanceChart">
                            <p>Đang tải biểu đồ...</p>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3>Lịch Làm Theo Tuần</h3>
                        <div class="chart-placeholder" id="scheduleChart">
                            <p>Đang tải biểu đồ...</p>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Doanh Thu</h3>
                        <div class="chart-placeholder" id="revenueChart">
                            <p>Đang tải biểu đồ...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Finance Overview for Admin -->
            <div class="finance-section">
                <h2 class="section-title">Tổng Quan Tài Chính</h2>
                <div class="finance-grid">
                    <div class="finance-card revenue">
                        <div class="finance-header">
                            <h3>Doanh Thu Tháng</h3>
                            <span class="finance-trend up">↗ +12%</span>
                        </div>
                        <div class="finance-amount" id="monthlyRevenue">0 ₫</div>
                        <div class="finance-subtitle">So với tháng trước</div>
                    </div>
                    <div class="finance-card expense">
                        <div class="finance-header">
                            <h3>Chi Phí Tháng</h3>
                            <span class="finance-trend down">↘ -5%</span>
                        </div>
                        <div class="finance-amount" id="monthlyExpense">0 ₫</div>
                        <div class="finance-subtitle">Tiết kiệm được</div>
                    </div>
                    <div class="finance-card profit">
                        <div class="finance-header">
                            <h3>Lợi Nhuận</h3>
                            <span class="finance-trend up">↗ +18%</span>
                        </div>
                        <div class="finance-amount" id="monthlyProfit">0 ₫</div>
                        <div class="finance-subtitle">Tăng trưởng tốt</div>
                    </div>
                    <div class="finance-card payroll">
                        <div class="finance-header">
                            <h3>Lương Nhân Viên</h3>
                            <span class="finance-trend neutral">→ 0%</span>
                        </div>
                        <div class="finance-amount" id="monthlyPayroll">0 ₫</div>
                        <div class="finance-subtitle">Ổn định</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Admin and Manager sections
    if (userRole === 'AD' || userRole === 'QL') {
        // Store Management
        content += `
            <!-- Store Management for Managers -->
            <div class="store-management-section">
                <h2 class="section-title">Quản Lý Cửa Hàng</h2>
                <div class="store-grid">
                    <div class="store-card" data-store="ST001">
                        <div class="store-header">
                            <h3>Cửa Hàng Trung Tâm</h3>
                            <span class="store-status active">Hoạt động</span>
                        </div>
                        <div class="store-stats">
                            <div class="store-stat">
                                <span class="stat-label">Nhân viên:</span>
                                <span class="stat-value" id="store1Employees">-</span>
                            </div>
                            <div class="store-stat">
                                <span class="stat-label">Ca làm hôm nay:</span>
                                <span class="stat-value" id="store1Schedule">-</span>
                            </div>
                        </div>
                        <div class="store-actions">
                            <button class="btn-sm btn-primary" onclick="manageStore('ST001')">Quản Lý</button>
                            <button class="btn-sm btn-outline" onclick="viewStoreSchedule('ST001')">Xem Lịch</button>
                        </div>
                    </div>
                    <div class="store-card" data-store="ST002">
                        <div class="store-header">
                            <h3>Cửa Hàng Quận 1</h3>
                            <span class="store-status active">Hoạt động</span>
                        </div>
                        <div class="store-stats">
                            <div class="store-stat">
                                <span class="stat-label">Nhân viên:</span>
                                <span class="stat-value" id="store2Employees">-</span>
                            </div>
                            <div class="store-stat">
                                <span class="stat-label">Ca làm hôm nay:</span>
                                <span class="stat-value" id="store2Schedule">-</span>
                            </div>
                        </div>
                        <div class="store-actions">
                            <button class="btn-sm btn-primary" onclick="manageStore('ST002')">Quản Lý</button>
                            <button class="btn-sm btn-outline" onclick="viewStoreSchedule('ST002')">Xem Lịch</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Registration Approval for Admin and Managers -->
            <div class="registration-approval-section">
                <h2 class="section-title">Duyệt Đăng Ký Nhân Viên</h2>
                <div class="approval-container">
                    <div class="approval-header">
                        <div class="approval-filters">
                            <select id="storeFilter" class="filter-select">
                                <option value="">Tất cả cửa hàng</option>
                            </select>
                            <button id="refreshPendingBtn" class="refresh-btn">
                                <span class="material-icons-round">refresh</span>
                                Làm mới
                            </button>
                        </div>
                    </div>
                    <div id="pendingRegistrationsList" class="registrations-list">
                        <div class="loading-text">Đang tải danh sách...</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Employee sections
    if (userRole === 'NV' || userRole === 'AM') {
        content += `
            <!-- Personal Dashboard for Employees -->
            <div class="personal-section">
                <h2 class="section-title">Thông Tin Cá Nhân</h2>
                <div class="personal-grid">
                    <div class="personal-card schedule">
                        <h3>Lịch Làm Tuần Này</h3>
                        <div id="personalSchedule" class="schedule-preview">
                            <p>Đang tải lịch làm...</p>
                        </div>
                    </div>

                    <div class="personal-card tasks">
                        <h3>Yêu Cầu Của Tôi</h3>
                        <div id="personalTasks" class="tasks-preview">
                            <p>Đang tải yêu cầu...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Recent Activities - always shown for all roles
    content += `
        <!-- Recent Activities -->
        <div class="activities-section">
            <h2 class="section-title">Hoạt Động Gần Đây</h2>
            <div class="activities-container">
                <div id="recentActivities" class="activities-list">
                    <div class="loading-text">Đang tải hoạt động...</div>
                </div>
                <div class="activities-footer">
                    <button class="btn-outline" onclick="loadMoreActivities()">Xem thêm</button>
                </div>
            </div>
        </div>
    `;
    
    return content;
}

// =============================================================================
// CSS Animation System - Replaced GSAP with pure CSS animations for better performance



// Inject professional CSS styles for enhanced interfaces - will be handled by main-init.js
const professionalStyles = `
<style>
/* Rich Text Editor Styles */
.text-editor-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}

.enhanced-editor {
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
}

.enhanced-editor:focus-within {
    border-color: var(--primary);
    box-shadow: 0 6px 25px rgba(103, 126, 234, 0.15);
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 10px 10px 0 0;
}

.editor-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.9rem;
}

.editor-tools {
    display: flex;
    gap: 8px;
}

.tool-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    color: white;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tool-btn:hover {
    background: rgba(255,255,255,0.25);
    transform: translateY(-1px);
}

.enhanced-toolbar {
    display: flex;
    padding: 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
}

.toolbar-group {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px;
    border-radius: 6px;
    background: white;
    border: 1px solid #e9ecef;
}

.toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.toolbar-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.toolbar-btn:active {
    background: #dee2e6;
    transform: translateY(0);
}

.toolbar-select {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.85rem;
    background: white;
}

.toolbar-color-picker {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
}

.editor-workspace {
    position: relative;
}

.enhanced-rich-editor {
    padding: 16px;
    border: none;
    outline: none;
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    overflow-y: auto;
}

.enhanced-rich-editor:empty:before {
    content: attr(placeholder);
    color: #999;
    font-style: italic;
}

.resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-top-left-radius: 4px;
    color: #666;
}

.resize-handle:hover {
    background: #e9ecef;
}

.editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
    border-radius: 0 0 10px 10px;
}

.editor-stats {
    display: flex;
    gap: 16px;
    font-size: 0.85rem;
    color: #666;
}

.editor-actions {
    display: flex;
    gap: 8px;
}

/* Modern Container Styles */
.modern-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
}

.professional-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 16px;
}

.title-icon-wrapper {
    background: rgba(255,255,255,0.15);
    padding: 12px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-icon {
    font-size: 2rem;
}

.title-text h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
}

.header-subtitle {
    margin: 4px 0 0 0;
    opacity: 0.9;
    font-size: 0.95rem;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.modern-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    font-size: 0.9rem;
}

.action-btn {
    background: rgba(255,255,255,0.15);
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
}

.action-btn:hover {
    background: rgba(255,255,255,0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.secondary-btn {
    background: #6c757d;
    color: white;
}

.secondary-btn:hover {
    background: #5a6268;
    transform: translateY(-1px);
}

.success-btn {
    background: #28a745;
    color: white;
}

.success-btn:hover {
    background: #218838;
    transform: translateY(-1px);
}

.warning-btn {
    background: #ffc107;
    color: #212529;
}

.warning-btn:hover {
    background: #e0a800;
    transform: translateY(-1px);
}

/* Enhanced Cards */
.modern-card {
    background: var(--card-bg, white);
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin-bottom: 24px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.modern-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.modern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid var(--border-color, #e1e5e9);
}

.modern-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: var(--text-primary, #2d3748);
}

.header-tools {
    display: flex;
    gap: 8px;
    align-items: center;
}

.header-tools .tool-btn {
    background: white;
    color: var(--text-secondary, #64748b);
    border: 1px solid var(--border-color, #e1e5e9);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
}

.header-tools .tool-btn.active {
    background: var(--primary, #667eea);
    color: white;
    border-color: var(--primary, #667eea);
}

/* Enhanced Controls */
.modern-controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px 0;
}

.control-section {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: flex-end;
}

.enhanced-filter {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--text-primary, #2d3748);
    font-size: 0.9rem;
}

.modern-input, .modern-select {
    padding: 12px 16px;
    border: 2px solid var(--border-color, #e1e5e9);
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    background: white;
}

.modern-input:focus, .modern-select:focus {
    outline: none;
    border-color: var(--primary, #667eea);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-section {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

/* Analytics Styles */
.analytics-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.period-controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 24px;
    padding: 24px;
}

.period-selector {
    flex: 1;
    min-width: 300px;
}

.control-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.period-buttons {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.period-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: 2px solid var(--border-color);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 0.9rem;
}

.period-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.period-btn:hover:not(.active) {
    background: #f8f9fa;
    transform: translateY(-1px);
}

.date-range-picker {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.date-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.date-input-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

/* KPI Dashboard */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    padding: 24px;
}

.kpi-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border-left: 4px solid var(--primary);
    transition: all 0.3s ease;
}

.kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.kpi-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--primary) 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    margin-bottom: 16px;
}

.kpi-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.kpi-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
}

.kpi-label {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.kpi-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 4px;
}

.kpi-trend.positive {
    color: #28a745;
}

.kpi-trend.negative {
    color: #dc3545;
}

/* Charts and Analytics */
.analytics-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-top: 24px;
}

.charts-section .card-body {
    padding: 24px;
}

.chart-container {
    height: 400px;
    position: relative;
    background: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;
}

.mock-chart {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.chart-legend {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 500;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.attendance-color { background: #28a745; }
.productivity-color { background: #ffc107; }
.performance-color { background: #667eea; }

.chart-area {
    flex: 1;
    display: flex;
    align-items: end;
    justify-content: center;
}

.trend-bars {
    display: flex;
    gap: 12px;
    align-items: end;
    height: 200px;
}

.trend-bar {
    width: 40px;
    background: linear-gradient(to top, var(--primary), #764ba2);
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
}

.trend-bar:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
}

.trend-bar span {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
}

/* Analysis Panels */
.analysis-content {
    position: relative;
    min-height: 400px;
}

.analysis-panel {
    display: none;
    padding: 24px;
}

.analysis-panel.active {
    display: block;
}

.analysis-summary h4 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
    font-weight: 600;
}

.summary-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.summary-item {
    text-align: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    flex: 1;
    min-width: 120px;
}

.summary-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary);
    display: block;
}

.summary-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 4px;
}

/* Metrics Section */
.metrics-grid {
    display: grid;
    gap: 16px;
    padding: 24px;
}

.metric-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
}

.metric-card:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.metric-title {
    font-weight: 600;
    color: var(--text-primary);
}

.metric-score {
    font-weight: 700;
    color: var(--primary);
}

.metric-bar {
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.metric-fill {
    height: 100%;
    background: linear-gradient(to right, var(--primary), #764ba2);
    border-radius: 4px;
    transition: width 0.8s ease;
}

.metric-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

/* Insights Section */
.insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 24px;
}

.insight-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border-left: 4px solid #dee2e6;
    transition: all 0.3s ease;
}

.insight-card.positive {
    border-left-color: #28a745;
}

.insight-card.positive .insight-icon {
    color: #28a745;
}

.insight-card.warning {
    border-left-color: #ffc107;
}

.insight-card.warning .insight-icon {
    color: #ffc107;
}

.insight-card.recommendation {
    border-left-color: #667eea;
}

.insight-card.recommendation .insight-icon {
    color: #667eea;
}

.insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.insight-icon {
    font-size: 2rem;
    margin-bottom: 12px;
}

.insight-content h4 {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: var(--text-primary);
}

.insight-content p {
    margin: 0;
    line-height: 1.5;
    color: var(--text-secondary);
}

/* Loading and Utility Styles */
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-state p {
    color: var(--text-secondary);
    margin: 0;
}

/* Mini Stats */
.mini-stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.mini-stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    min-width: 80px;
}

.mini-stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1;
}

.mini-stat-label {
    font-size: 0.8rem;
    opacity: 0.9;
    margin-top: 4px;
    text-align: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .analytics-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .professional-header {
        padding: 20px;
    }
    
    .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .header-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .title-icon-wrapper {
        align-self: center;
    }
    
    .header-actions {
        align-self: stretch;
        justify-content: center;
    }
    
    .modern-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }
    
    .control-section {
        flex-direction: column;
        gap: 16px;
    }
    
    .period-controls {
        flex-direction: column;
        gap: 20px;
    }
    
    .period-selector {
        min-width: auto;
    }
    
    .period-buttons {
        justify-content: center;
    }
    
    .date-range-picker {
        justify-content: center;
    }
    
    .kpi-grid {
        grid-template-columns: 1fr;
    }
    
    .insights-grid {
        grid-template-columns: 1fr;
    }
    
    .mini-stats {
        justify-content: center;
    }
}

/* Enhanced Statistics Styles */
.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px 8px 0 0;
}

.stats-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.stats-toggle-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stats-toggle-btn:hover {
    background: rgba(255,255,255,0.3);
}

.stats-content {
    padding: 16px;
    background: white;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 8px 8px;
}

.stats-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.stats-row:last-child {
    margin-bottom: 0;
}

.primary-stats .stat-card {
    flex: 1;
    min-width: 150px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-card.highlight {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    border-color: transparent;
}

.stat-icon {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-top: 4px;
}

.secondary-stats, .details-stats {
    justify-content: space-around;
}

.stat-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    min-width: 80px;
    text-align: center;
    border: 1px solid #e9ecef;
    transition: all 0.2s;
}

.stat-mini:hover {
    background: #e9ecef;
}

.stat-mini.warning {
    background: #fff3cd;
    border-color: #ffeaa7;
}

.stat-mini.danger {
    background: #f8d7da;
    border-color: #f5c6cb;
}

.stat-mini .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1;
}

.stat-mini .stat-label {
    font-size: 0.75rem;
    margin-top: 4px;
    opacity: 0.8;
}

.details-stats.collapsed {
    display: none;
}

/* Timesheet Container Improvements */
.timesheet-container {
    max-width: 100%;
    overflow: hidden;
}

.timesheet-main-content {
    margin-top: 24px;
}

.content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
}

.calendar-section, .stats-section {
    background: white;
}

.modern-calendar {
    min-height: 400px;
}

.modern-stats {
    min-height: 400px;
}

.primary-kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.modern-stat-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    border-left: 4px solid #dee2e6;
}

.attendance-card { border-left-color: #28a745; }
.hours-card { border-left-color: #007bff; }
.overtime-card { border-left-color: #ffc107; }
.efficiency-card { border-left-color: #667eea; }

.modern-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 8px;
}

.trend-icon {
    font-size: 1rem;
}

.trend-value {
    color: inherit;
}

.detailed-analytics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
}

.analytics-chart, .performance-metrics {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
}

.analytics-chart h4, .performance-metrics h4 {
    margin: 0 0 16px 0;
    font-weight: 600;
    color: var(--text-primary);
}

.performance-metrics .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.performance-metrics .metric-item:last-child {
    margin-bottom: 0;
}

.performance-metrics .metric-label {
    font-weight: 500;
}

.performance-metrics .metric-bar {
    flex: 1;
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    margin: 0 12px;
    overflow: hidden;
}

.performance-metrics .metric-fill {
    height: 100%;
    background: linear-gradient(to right, var(--primary), #764ba2);
    border-radius: 3px;
    transition: width 0.8s ease;
}

.performance-metrics .metric-value {
    font-weight: 600;
    color: var(--primary);
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
    
    .detailed-analytics {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .stats-row {
        flex-direction: column;
    }
    
    .stat-card {
        min-width: auto;
    }
    
    .secondary-stats, .details-stats {
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .stat-mini {
        flex: 1;
        min-width: 70px;
    }
    
    .primary-kpis {
        grid-template-columns: 1fr;
    }
}

/* Enhanced Color Visibility and UI Improvements */
:root {
    --text-primary: #1a202c;
    --text-secondary: #4a5568;
    --text-muted: #718096;
    --bg-overlay: rgba(255, 255, 255, 0.95);
    --border-color: #e2e8f0;
    --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Ensure text visibility on all backgrounds */
.card, .modern-card {
    background: var(--bg-overlay);
    color: var(--text-primary);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
}

.card-header, .modern-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-header h3, .modern-header h3 {
    color: white !important;
    font-weight: 600;
}

/* Button text visibility */
.btn, .modern-btn {
    font-weight: 500;
    text-shadow: none;
}

.btn-primary, .modern-btn.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}

.btn-secondary, .modern-btn.secondary-btn {
    background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
    color: white;
    border: none;
}

.btn-success, .modern-btn.success-btn {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
}

.btn-danger, .modern-btn.danger-btn {
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    color: white;
    border: none;
}

.btn-warning, .modern-btn.warning-btn {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    color: white;
    border: none;
}

/* Form elements visibility */
.form-control, .modern-input, .modern-select {
    background: white;
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    transition: all 0.3s ease;
}

.form-control:focus, .modern-input:focus, .modern-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
    color: var(--text-primary);
}

/* Status and badge text visibility */
.status, .badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status.present, .badge.success {
    background: #c6f6d5;
    color: #22543d;
    border: 1px solid #9ae6b4;
}

.status.absent, .badge.danger {
    background: #fed7d7;
    color: #742a2a;
    border: 1px solid #fc8181;
}

.status.late, .badge.warning {
    background: #fefcbf;
    color: #744210;
    border: 1px solid #f6e05e;
}

.status.pending, .badge.info {
    background: #bee3f8;
    color: #2a4365;
    border: 1px solid #90cdf4;
}

/* Table text visibility */
.table {
    background: white;
    color: var(--text-primary);
}

.table th {
    background: #f7fafc;
    color: var(--text-primary);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
}

.table td {
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
}

/* Shift assignment improvements */
.shift-cell {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 8px;
}

.time-input {
    background: white;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.9em;
}

.shift-status.working {
    background: #c6f6d5;
    color: #22543d;
    font-weight: 600;
}

.shift-status.off {
    background: #fed7d7;
    color: #742a2a;
    font-weight: 600;
}

/* Employee grid visibility */
.employee-card {
    background: white;
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.employee-card:hover {
    border-color: #667eea;
    box-shadow: var(--shadow-medium);
}

.employee-card h4 {
    color: var(--text-primary);
    font-weight: 600;
}

.employee-card p {
    color: var(--text-secondary);
}

/* Modal text visibility */
.modal-content {
    background: white;
    color: var(--text-primary);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.modal-header h3, .modal-header h4 {
    color: white !important;
}

/* Analytics and stats visibility */
.stat-card, .modern-stat-card {
    background: white;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: var(--shadow-light);
}

.stat-value {
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.8em;
}

.stat-label {
    color: var(--text-secondary);
    font-weight: 500;
}

/* Text editor enhancements */
.text-editor-container.fullscreen-editor {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: white;
    padding: 20px;
}

.editor-workspace {
    background: white;
    color: var(--text-primary);
    min-height: 200px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    resize: vertical;
}

.editor-workspace:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Hide window.location.href redirects during testing */
.testing-mode {
    display: none !important;
}
</style>
`;

// Apply professional styles
document.head.insertAdjacentHTML('beforeend', professionalStyles);
