// Setup modal close handlers for all modals
function setupModalCloseHandlers() {
    // Add event listeners for all modal close buttons
    document.addEventListener('click', (e) => {
        // Handle close-btn clicks
        if (e.target.classList.contains('close-btn') || e.target.closest('.close-btn')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('modal-hidden');
            }
        }
        
        // Handle modal-close clicks
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('modal-hidden');
            }
        }
        
        // Close modal when clicking outside
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('modal-hidden');
        }
    });
    
    // Add escape key handler for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const visibleModals = document.querySelectorAll('.modal:not(.modal-hidden)');
            visibleModals.forEach(modal => {
                modal.classList.add('modal-hidden');
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

        // Initialize enhanced navigation manager (optional)
        if (typeof NavigationManager !== 'undefined') {
            try {
                window.navigationManager = new NavigationManager(window.contentManager);
                console.log('✅ NavigationManager initialized');
            } catch (error) {
                console.warn('NavigationManager initialization failed:', error.message);
            }
        } else {
            console.log('NavigationManager not available, using built-in navigation');
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

        // Initialize notification and chat managers after dashboard is ready
        initializeNotificationAndChatManagers();

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
        
        // Initialize accordion menu
        initializeAccordionMenu();
        
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
    
    // Ensure the main content and cards are visible (HRMS-style structure)
    const main = document.getElementById('main');
    const content = document.getElementById('content'); // Legacy support
    const cards = document.querySelector('.cards');
    
    if (main) {
        main.classList.add('dashboard-main-visible');
    }
    
    if (content) {
        content.classList.add('dashboard-content-visible');
    }
    
    if (cards) {
        cards.classList.add('dashboard-cards-visible');
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
        // Skip during initialization to prevent duplicate calls
        if (!window.dashboardInitializing) {
            await refreshUserRoleAndPermissions();
        }
        
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
    
    // Ensure the main content and cards are visible (HRMS-style structure)
    const main = document.getElementById('main');
    const content = document.getElementById('content'); // Legacy support
    const cards = document.querySelector('.cards');
    
    if (main) {
        main.classList.add('dashboard-visible');
    }
    
    if (content) {
        content.classList.add('dashboard-visible');
    }
    
    if (cards) {
        cards.classList.add('dashboard-cards-visible');
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
    console.log('📊 Updating dashboard cards visibility and content...');
    
    // Work with the HRMS-style card structure
    const cards = document.querySelectorAll('.cards');
    const statCards = document.querySelectorAll('.stat-card');
    const main = document.getElementById('main');
    
    if (cards.length > 0) {
        cards.forEach(cardSection => {
            cardSection.classList.add('dashboard-cards-visible');
            cardSection.classList.add('dashboard-visible');
        });
        
        // Ensure all stat cards are visible
        statCards.forEach((card, index) => {
            card.classList.add('dashboard-visible');
        });
        
        // Update dashboard statistics
        await updateDashboardNumbers();
    } else {
        console.log('💡 Using HRMS-style dashboard layout (no legacy stats-grid found)');
    }
    
    if (main) {
        main.classList.add('dashboard-visible');
        main.classList.add('dashboard-visible');
    }
    
    // Force a re-layout
    await new Promise(resolve => setTimeout(resolve, 50));
}

// Update dashboard statistics numbers (fetch from API instead of hardcoded values)
async function updateDashboardNumbers() {
    try {
        console.log('📊 Updating dashboard numbers from API...');
        
        // Fetch real-time dashboard metrics from API
        const stats = await utils.fetchAPI('?action=getDashboardMetrics');
        
        if (stats && stats.success) {
            // Update attendance rate
            const attendanceRateEl = document.getElementById('attendanceRate');
            if (attendanceRateEl) {
                attendanceRateEl.textContent = stats.attendanceRate || '0%';
            }
            
            // Update productivity rate
            const productivityRateEl = document.getElementById('productivityRate');
            if (productivityRateEl) {
                productivityRateEl.textContent = stats.productivityRate || '0%';
            }
            
            // Update store performance
            const storePerformanceEl = document.getElementById('storePerformance');
            if (storePerformanceEl) {
                storePerformanceEl.textContent = stats.storePerformance || '0/5';
            }
        } else {
            console.warn('⚠️ API returned no dashboard metrics, using defaults');
            // Use default values if API fails
            const attendanceRateEl = document.getElementById('attendanceRate');
            if (attendanceRateEl) attendanceRateEl.textContent = '0%';
            
            const productivityRateEl = document.getElementById('productivityRate');
            if (productivityRateEl) productivityRateEl.textContent = '0%';
            
            const storePerformanceEl = document.getElementById('storePerformance');
            if (storePerformanceEl) storePerformanceEl.textContent = '0/5';
        }
        
        console.log('✅ Dashboard numbers updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating dashboard numbers:', error);
        // Fallback to default values on error
        const attendanceRateEl = document.getElementById('attendanceRate');
        if (attendanceRateEl) attendanceRateEl.textContent = '0%';
        
        const productivityRateEl = document.getElementById('productivityRate');
        if (productivityRateEl) productivityRateEl.textContent = '0%';
        
        const storePerformanceEl = document.getElementById('storePerformance');
        if (storePerformanceEl) storePerformanceEl.textContent = '0/5';
    }
}

// Update welcome section statistics with real data (LEGACY)
async function updateWelcomeStats() {
    try {
        console.log('📊 Updating welcome section statistics...');
        
        // Get current user data
        const userData = await window.authManager.getUserData();
        if (!userData) {
            console.warn('No user data available for stats update');
            return;
        }
        
        // Update total employees (fetch from API instead of hardcoded data)
        const totalEmployeesEl = document.getElementById('totalEmployees');
        if (totalEmployeesEl) {
            try {
                const employeeStats = await utils.fetchAPI('?action=getEmployeeCount');
                if (employeeStats && employeeStats.success) {
                    totalEmployeesEl.textContent = employeeStats.totalEmployees?.toString() || '0';
                } else {
                    totalEmployeesEl.textContent = '0';
                }
            } catch (error) {
                console.log('Could not fetch employee count:', error);
                totalEmployeesEl.textContent = '0';
            }
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
        
        // Update recent messages (fetch from API instead of random data)
        const recentMessagesEl = document.getElementById('recentMessages');
        if (recentMessagesEl) {
            try {
                const messageStats = await utils.fetchAPI(`?action=getRecentMessagesCount&employeeId=${userData.employeeId}`);
                if (messageStats && messageStats.success) {
                    recentMessagesEl.textContent = messageStats.count?.toString() || '0';
                } else {
                    recentMessagesEl.textContent = '0';
                }
            } catch (error) {
                console.log('Could not fetch recent messages count:', error);
                recentMessagesEl.textContent = '0';
            }
        }
        
        console.log('✅ Welcome stats updated successfully');
    } catch (error) {
        console.error('Error updating welcome stats:', error);
    }
}

// Role-based UI Management with updated role codes
async function initializeRoleBasedUI() {
    let userPosition = 'EMPLOYEE'; // Default fallback using new role code
    
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
            console.warn('⚠️ No user data found, using default role EMPLOYEE');
        }
    } catch (error) {
        console.warn('⚠️ Using default role due to error:', error);
    }
    
    console.log('🔐 Initializing role-based UI for position:', userPosition);
    
    // Show/hide elements based on role using both new and legacy role codes
    const allRoleElements = document.querySelectorAll('[data-role]');
    let adminElementsFound = 0;
    let adminElementsShown = 0;
    
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
        
        // Check access using unified role system
        const hasAccess = utils.checkRoleAccess(userPosition, allowedRoles);
        
        // Special tracking for admin role debugging (check both new and legacy codes)
        if (allowedRoles.some(role => ['ADMIN', 'AD', 'SUPER_ADMIN'].includes(role.trim()))) {
            adminElementsFound++;
        }
        
        if (hasAccess) {
            element.classList.add('role-visible');
            element.classList.add('element-visible');
            element.classList.remove('element-hidden');
            element.classList.add('dashboard-visible');
            
            // Special tracking for admin role debugging
            if (allowedRoles.some(role => ['ADMIN', 'AD', 'SUPER_ADMIN'].includes(role.trim())) && 
                ['Admin', 'System Administrator', 'AD', 'ADMIN', 'SUPER_ADMIN'].includes(userPosition)) {
                adminElementsShown++;
            }
        } else {
            element.classList.remove('role-visible');
            element.classList.add('element-hidden');
            element.classList.remove('element-visible');
        }
    });
    
    // Admin role verification (check both new and legacy admin roles)
    if (['Admin', 'System Administrator', 'AD', 'ADMIN', 'SUPER_ADMIN'].includes(userPosition)) {
        console.log(`🔍 Admin Role Summary: Found ${adminElementsFound} admin elements, Shown ${adminElementsShown} elements`);
        
        // Additional verification for all admin-specific sections
        const adminSections = [
            '.quick-actions-section',
            '.analytics-section', 
            '.finance-section',
            '.registration-approval-section',
            '.store-management-section'
        ];
        
        // Wait for DOM to be fully ready before checking sections
        await new Promise(resolve => setTimeout(resolve, 100));
        
        adminSections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                section.classList.add('dashboard-visible');
                section.classList.add('role-visible');
                section.classList.remove('role-hidden');
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
    
    // Role-based section visibility map - updated for new dashboard structure
    const sectionVisibility = {
        'AD': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': true,
            '.user-management': true,
            '.system-info': true
        },
        'QL': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': false,
            '.user-management': false,
            '.system-info': true
        },
        'NV': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': false,
            '.user-management': false,
            '.system-info': true
        },
        'AM': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': false,
            '.user-management': false,
            '.system-info': true
        },
        // Support new role codes
        'SUPER_ADMIN': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': true,
            '.user-management': true,
            '.system-info': true
        },
        'ADMIN': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': true,
            '.user-management': true,
            '.system-info': true
        },
        'STORE_MANAGER': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': false,
            '.user-management': false,
            '.system-info': true
        },
        'EMPLOYEE': {
            '.dashboard-stats': true,
            '.dashboard-overview': true,
            '.admin-actions': false,
            '.user-management': false,
            '.system-info': true
        }
    };
    
    console.log('📋 Available sections to configure:', Object.keys(sectionVisibility.AD));
    const roleConfig = sectionVisibility[userRole] || sectionVisibility['NV'];
    
    // Count sections that should be visible
    const visibleSections = Object.entries(roleConfig).filter(([_, isVisible]) => isVisible);
    console.log(`📊 Expected ${visibleSections.length} sections to be visible for ${userRole} role`);
    
    // Apply visibility settings only to existing sections
    Object.entries(roleConfig).forEach(([selector, isVisible]) => {
        const section = document.querySelector(selector);
        if (section) {
            if (isVisible) {
                section.classList.add('dashboard-visible');
                section.classList.add('dashboard-visible');
                section.classList.remove('role-hidden');
                section.classList.add('role-visible');
            } else {
                section.classList.add('section-hidden');
                section.classList.remove('section-visible');
                section.classList.add('role-hidden');
                section.classList.remove('role-visible');
                console.log(`❌ Section hidden for ${userRole}: ${selector}`);
            }
        }
        // Removed section not found warnings for cleaner logs
    });
    
    // Summary log
    const actualVisibleSections = document.querySelectorAll('.role-visible').length;
    console.log(`📈 Result: ${actualVisibleSections} sections are now visible`);
    
    // Apply menu-based role visibility instead of missing sections
    if (typeof MenuManager !== 'undefined' && MenuManager.applyRoleBasedVisibility) {
        MenuManager.applyRoleBasedVisibility(userRole);
        console.log('📋 Applied MenuManager role-based visibility');
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
            
            // Update role-based UI with cached data (only if not during initialization)
            if (!window.dashboardInitializing && !window.roleUIInitialized) {
                await initializeRoleBasedUI();
                MenuManager.updateMenuByRole(freshUserData.roles || [freshUserData.position]);
                window.roleUIInitialized = true;
                
                // Verify AD functions are visible if user is AD (only once)
                if (freshUserData.position === 'AD' && !window.adRoleVerified) {
                    setTimeout(async () => {
                        const adElements = document.querySelectorAll('[data-role*="AD"]');
                        const visibleADElements = Array.from(adElements).filter(el => 
                            !el.classList.contains('element-hidden') && !el.classList.contains('role-hidden')
                        );
                        
                        if (visibleADElements.length < adElements.length) {
                            console.warn('⚠️ Re-applying AD permissions...');
                            await initializeRoleBasedUI();
                            MenuManager.updateMenuByRole(freshUserData.roles || [freshUserData.position]);
                        }
                        window.adRoleVerified = true;
                    }, 500);
                }
            } else {
                console.log('🔐 Skipping role UI update (during initialization or already initialized)');
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

// Initialize Finance Dashboard (Admin only) - fetch real data from API
async function initializeFinanceDashboard() {
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    const monthlyExpense = document.getElementById('monthlyExpense');
    const monthlyProfit = document.getElementById('monthlyProfit');
    const monthlyPayroll = document.getElementById('monthlyPayroll');

    try {
        // Fetch real financial data from API
        const financeData = await utils.fetchAPI('?action=getFinancialSummary');
        
        if (financeData && financeData.success) {
            if (monthlyRevenue) monthlyRevenue.textContent = financeData.monthlyRevenue || '0 ₫';
            if (monthlyExpense) monthlyExpense.textContent = financeData.monthlyExpense || '0 ₫';
            if (monthlyProfit) monthlyProfit.textContent = financeData.monthlyProfit || '0 ₫';
            if (monthlyPayroll) monthlyPayroll.textContent = financeData.monthlyPayroll || '0 ₫';
            
            console.log('✅ Financial dashboard loaded with real data');
        } else {
            // Fallback to default values if API fails
            if (monthlyRevenue) monthlyRevenue.textContent = '0 ₫';
            if (monthlyExpense) monthlyExpense.textContent = '0 ₫';
            if (monthlyProfit) monthlyProfit.textContent = '0 ₫';
            if (monthlyPayroll) monthlyPayroll.textContent = '0 ₫';
            
            console.warn('⚠️ Financial API returned no data, using defaults');
        }
    } catch (error) {
        console.error('❌ Error loading financial dashboard:', error);
        // Error fallback
        if (monthlyRevenue) monthlyRevenue.textContent = '0 ₫';
        if (monthlyExpense) monthlyExpense.textContent = '0 ₫';
        if (monthlyProfit) monthlyProfit.textContent = '0 ₫';
        if (monthlyPayroll) monthlyPayroll.textContent = '0 ₫';
    }
}

// GitHub-Style Mobile Menu Dialog Handler
function setupMobileMenu() {
    const menuToggle = document.getElementById('btnSidebar');
    const mobileDialog = document.getElementById('mobileSidebar');
    
    if (!menuToggle || !mobileDialog) {
        console.log('Mobile menu handled by inline script - skipping setupMobileMenu');
        return;
    }
    
    // Check if mobile menu is already handled by inline script
    if (menuToggle.getAttribute('aria-expanded') !== null) {
        console.log('✅ Mobile menu already initialized by HRMS-Responsive script');
        return;
    }
    
    // Fallback mobile menu setup (if inline script is not present)
    console.log('🔧 Setting up fallback mobile menu functionality');
    
    let isMenuOpen = false;
    
    // Remove any existing event listeners first
    const oldHandler = menuToggle._mobileMenuHandler;
    if (oldHandler) {
        menuToggle.removeEventListener('click', oldHandler);
    }
    
    // Open dialog function
    function openMobileMenu() {
        if (!isMenuOpen) {
            // Add professional toggle animation
            menuToggle.classList.add('active');
            
            mobileDialog.showModal();
            document.body.classList.add('body-no-scroll');
            isMenuOpen = true;
            
            // Add animation class
            requestAnimationFrame(() => {
                mobileDialog.classList.add('mobile-dialog-visible');
                mobileDialog.classList.remove('mobile-dialog-hidden');
            });
        }
    }
    
    // Close dialog function
    function closeMobileMenu() {
        if (isMenuOpen) {
            // Remove professional toggle animation
            menuToggle.classList.remove('active');
            
            mobileDialog.classList.add('mobile-dialog-hidden');
            mobileDialog.classList.remove('mobile-dialog-visible');
            
            setTimeout(() => {
                mobileDialog.close();
                document.body.classList.remove('body-no-scroll');
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
            setTimeout(() => window.contentManager?.showAttendanceGPS(), 300);
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
            setTimeout(() => {
                if (window.contentManager && typeof window.contentManager.showGrantAccess === 'function') {
                    window.contentManager.showGrantAccess();
                }
            }, 300);
        });
        
        document.getElementById('mobilePersonalInformation')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => {
                // Use the same function as PC version
                if (window.contentManager && typeof window.contentManager.showPersonalInfo === 'function') {
                    window.contentManager.showPersonalInfo();
                }
            }, 300);
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
    const main = document.getElementById('main');
    const cards = document.querySelectorAll('.cards');
    
    // Make sure main content is visible (HRMS structure)
    if (main) {
        main.classList.add('dashboard-visible');
        main.classList.add('dashboard-visible');
    }
    
    // Make sure legacy content is visible
    if (content) {
        content.classList.add('dashboard-visible');
        content.classList.add('dashboard-visible');
    }
    
    // Make sure card sections are visible
    cards.forEach(cardSection => {
        cardSection.classList.add('dashboard-cards-visible');
        cardSection.classList.add('dashboard-visible');
    });
    
    // Log element existence
    console.log('📊 Dashboard elements status:', {
        main: !!main,
        content: !!content,
        cards: cards.length,
        attendanceRate: !!document.getElementById('attendanceRate'),
        productivityRate: !!document.getElementById('productivityRate'),
        storePerformance: !!document.getElementById('storePerformance')
    });
}

// Enhanced Loading Screen Management with CSS Animations
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('loading-screen-visible');
        loadingScreen.classList.remove('loading-screen-hidden');
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
            dot.classList.add(`animation-delay-${index + 1}`);
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
            loadingScreen.classList.add('loading-screen-hidden');
            loadingScreen.classList.remove('loading-screen-visible');
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
        dashboardLoader.classList.add('dashboard-loader-active');
        dashboardLoader.classList.remove('dashboard-loader-inactive');
        
        // Also disable all interactive elements behind the loader
        document.body.classList.add('body-no-scroll');
        
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
            dashboardLoader.classList.add('dashboard-loader-inactive');
            dashboardLoader.classList.remove('dashboard-loader-active');
            dashboardLoader.classList.add('hidden'); // Ensure hidden class is added
            
            // Re-enable body scroll
            document.body.classList.remove('body-no-scroll');
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
        // Set initialization flag to prevent duplicate role-based UI calls
        window.dashboardInitializing = true;
        
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
        
        // Load personal stats and pending registrations during initialization
        if (freshUserData.employeeId) {
            await window.authManager.getPersonalStatsData(freshUserData.employeeId);
            console.log('📊 Personal stats loaded and cached');
        }
        
        if (userPosition === 'AD' || userPosition === 'Manager') {
            await window.authManager.getPendingRegistrationsData();
            console.log('📊 Pending registrations loaded and cached');
        }
        
        // Update the UI with cached stats
        await updateDashboardStatsUI();
        
        // Initialize role-based UI and menu visibility with cached data
        await initializeRoleBasedUI();
        MenuManager.updateMenuByRole(freshUserData.roles || [userPosition]);
        window.roleUIInitialized = true; // Mark as initialized to prevent duplicates
        
        // Comprehensive AD functions verification
        if (userPosition === 'AD') {
            console.log('🔍 Verifying AD role functions visibility...');
            
            // Force show all AD elements immediately
            const adElements = document.querySelectorAll('[data-role*="AD"]');
            console.log(`Found ${adElements.length} AD elements to show`);
            
            adElements.forEach((element, index) => {
                element.classList.add('dashboard-visible');
                element.classList.add('role-visible');
                element.classList.remove('role-hidden');
                console.log(`AD Element ${index + 1}: ${element.tagName}.${element.className} - Made visible`);
            });
            
            // Special handling for quick action buttons
            const quickActionBtns = document.querySelectorAll('.quick-action-btn[data-role*="AD"]');
            quickActionBtns.forEach((btn, index) => {
                btn.classList.add('button-flex');
                btn.classList.add('role-visible');
                console.log(`AD Quick Action ${index + 1}: ${btn.dataset.action} - Made visible`);
            });
            
            // Verification check after a short delay
            setTimeout(() => {
                const visibleADElements = Array.from(adElements).filter(el => 
                    !el.classList.contains('element-hidden') && !el.classList.contains('role-hidden')
                );
                console.log('AD elements visibility check:', {
                    total: adElements.length,
                    visible: visibleADElements.length,
                    success: visibleADElements.length === adElements.length
                });
                
                if (visibleADElements.length < adElements.length) {
                    console.warn('⚠️ Some AD elements still not visible. Re-applying...');
                    adElements.forEach(el => {
                        el.classList.add('dashboard-visible');
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
        
        // Clear initialization flag
        window.dashboardInitializing = false;
        
    } catch (error) {
        console.error('Failed to initialize enhanced dashboard:', error);
        utils.showNotification('Có lỗi khi tải dashboard', 'error');
        // Clear initialization flag even on error
        window.dashboardInitializing = false;
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
    
    modal.classList.add('modal-flex');
    newValueInput.focus();
}

function closeChangeRequestModal() {
    const modal = document.getElementById('changeRequestModal');
    modal.classList.add('modal-none');
    modal.classList.remove('modal-flex');
}

function closePasswordModal() {
    const modal = document.getElementById('passwordConfirmModal');
    modal.classList.add('modal-none');
    modal.classList.remove('modal-flex');
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

/**
 * Initialize Notification and Chat Managers for dashboard
 * Ensures proper initialization after dashboard content is loaded
 */
function initializeNotificationAndChatManagers() {
    try {
        console.log('🔔 Initializing Notification and Chat Managers...');
        
        // Clear any existing instances to prevent duplicates
        if (window.notificationManager) {
            window.notificationManager = null;
        }
        if (window.chatManager) {
            window.chatManager = null;
        }
        
        // Initialize NotificationManager
        if (typeof NotificationManager !== 'undefined') {
            window.notificationManager = new NotificationManager();
            console.log('✅ NotificationManager initialized successfully');
        } else {
            console.warn('⚠️ NotificationManager class not available');
        }
        
        // Initialize ChatManager
        if (typeof ChatManager !== 'undefined') {
            window.chatManager = new ChatManager();
            console.log('✅ ChatManager initialized successfully');
        } else {
            console.warn('⚠️ ChatManager class not available');
        }
        
        // Add click outside handler for notification dropdown
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationDropdown');
            const toggle = document.getElementById('notificationToggle');
            
            if (dropdown && toggle && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        console.log('🔔 Notification and Chat Managers setup complete');
        
    } catch (error) {
        console.error('❌ Error initializing Notification and Chat Managers:', error);
    }
}

// Professional styles are now properly separated in dashboard-handler.css
// This improves performance and maintainability by avoiding JavaScript CSS injection

/**
 * Initialize accordion menu functionality for sidebar navigation
 */
function initializeAccordionMenu() {
    try {
        console.log('🎛️ Initializing accordion menu functionality...');
        
        // Desktop sidebar accordion
        const menuToggles = document.querySelectorAll('[data-menu-toggle]');
        
        menuToggles.forEach(toggle => {
            const menuId = toggle.dataset.menuToggle;
            const submenu = document.getElementById(menuId);
            const navTitle = toggle.querySelector('.nav-title.expandable');
            
            if (!submenu || !navTitle) {
                console.warn(`Submenu or nav-title not found for: ${menuId}`);
                return;
            }
            
            // Set initial state - collapse all submenus by default
            toggle.classList.remove('expanded');
            submenu.classList.add('submenu-collapsed');
            submenu.classList.remove('submenu-expanded');
            
            // Add click handler
            navTitle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = toggle.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    toggle.classList.remove('expanded');
                    submenu.classList.add('submenu-collapsed');
                    submenu.classList.remove('submenu-expanded');
                    console.log(`Collapsed menu: ${menuId}`);
                } else {
                    // Expand
                    toggle.classList.add('expanded');
                    submenu.classList.remove('submenu-collapsed');
                    submenu.classList.add('submenu-expanded');
                    // Set height for smooth animation using CSS class
                    submenu.classList.add('submenu-dynamic-height');
                    console.log(`Expanded menu: ${menuId}`);
                }
            });
            
            console.log(`✅ Desktop accordion menu setup for: ${menuId}`);
        });
        
        // Mobile sidebar accordion
        const mobileMenuToggles = document.querySelectorAll('[data-mobile-menu-toggle]');
        
        mobileMenuToggles.forEach(toggle => {
            const menuId = toggle.dataset.mobileMenuToggle;
            const submenu = document.getElementById(menuId);
            const navTitle = toggle.querySelector('.mobile-nav-title.expandable');
            
            if (!submenu || !navTitle) {
                console.warn(`Mobile submenu or nav-title not found for: ${menuId}`);
                return;
            }
            
            // Set initial state - collapse all mobile submenus by default
            toggle.classList.remove('expanded');
            submenu.classList.add('submenu-collapsed');
            submenu.classList.remove('submenu-expanded');
            
            // Add click handler
            navTitle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = toggle.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    toggle.classList.remove('expanded');
                    submenu.classList.add('submenu-collapsed');
                    submenu.classList.remove('submenu-expanded');
                    console.log(`Collapsed mobile menu: ${menuId}`);
                } else {
                    // Expand
                    toggle.classList.add('expanded');
                    submenu.classList.remove('submenu-collapsed');
                    submenu.classList.add('submenu-expanded');
                    // Set height for smooth animation using CSS class
                    submenu.classList.add('submenu-dynamic-height');
                    console.log(`Expanded mobile menu: ${menuId}`);
                }
            });
            
            console.log(`✅ Mobile accordion menu setup for: ${menuId}`);
        });
        
        console.log('✅ Accordion menu initialization complete');
        
    } catch (error) {
        console.error('❌ Error initializing accordion menu:', error);
    }
}
