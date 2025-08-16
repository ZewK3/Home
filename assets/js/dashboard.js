/**
 * Professional HR Dashboard JavaScript
 * Handles all dashboard functionality with modern ES6+ features
 */

// TEST ACCOUNTS - Remove when deploying to production
const TEST_ACCOUNTS = {
    ADMIN: {
        id: 1,
        email: 'admin@hrms.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: ['all'],
        avatar: null
    }
};
// END TEST ACCOUNTS

class HRDashboard {
    constructor() {
        this.apiUrl = 'https://zewk.tocotoco.workers.dev';
        this.currentSection = 'dashboard';
        this.currentUser = null;
        this.dashboardData = {};
        
        this.init();
    }

    async init() {
        try {
            // Check authentication
            await this.checkAuthentication();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            console.log('HR Dashboard initialized successfully');
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.redirectToLogin();
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Check for test account mock token
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.role === 'admin') {
                        this.currentUser = user;
                        this.updateUserInfo();
                        return;
                    }
                } catch (e) {
                    // Invalid user data
                }
            }
            throw new Error('No authentication token found');
        }

        // Handle mock tokens for test accounts
        if (token.startsWith('mock_admin_token_')) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    this.currentUser = JSON.parse(userData);
                    this.updateUserInfo();
                    return;
                } catch (e) {
                    // Invalid user data
                }
            }
        }

        try {
            const response = await this.makeAuthenticatedRequest('/api/v1/auth/verify');
            if (!response.ok) {
                throw new Error('Token verification failed');
            }
            
            const data = await response.json();
            this.currentUser = data.data;
            this.updateUserInfo();
            
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            throw error;
        }
    }

    async makeAuthenticatedRequest(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        };

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        // Handle token refresh if needed
        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                // Retry the request with new token
                const newToken = localStorage.getItem('accessToken');
                return fetch(`${this.apiUrl}${endpoint}`, {
                    ...defaultOptions,
                    ...options,
                    headers: {
                        ...defaultOptions.headers,
                        'Authorization': `Bearer ${newToken}`
                    }
                });
            } else {
                this.redirectToLogin();
                throw new Error('Authentication failed');
            }
        }

        return response;
    }

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return false;

            const response = await fetch(`${this.apiUrl}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    initializeUI() {
        // Initialize sidebar
        this.initializeSidebar();
        
        // Initialize theme
        this.initializeTheme();
        
        // Initialize language
        this.initializeLanguage();
        
        // Initialize notifications
        this.initializeNotifications();
        
        // Initialize modals
        this.initializeModals();
    }

    initializeSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const contentArea = document.getElementById('contentArea');

        // Desktop sidebar toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                if (sidebar.classList.contains('collapsed')) {
                    mainContent.style.marginLeft = 'var(--sidebar-collapsed-width)';
                    contentArea.style.marginLeft = '0';
                } else {
                    mainContent.style.marginLeft = 'var(--sidebar-width)';
                    contentArea.style.marginLeft = '0';
                }
            });
        }

        // Mobile menu toggle
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                
                // Add overlay for mobile
                if (sidebar.classList.contains('open')) {
                    this.addMobileOverlay();
                } else {
                    this.removeMobileOverlay();
                }
            });
        }

        // Handle navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
                
                // Close mobile menu on navigation
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    this.removeMobileOverlay();
                }
            });
        });
    }

    addMobileOverlay() {
        if (!document.querySelector('.mobile-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            overlay.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('open');
                this.removeMobileOverlay();
            });
            document.body.appendChild(overlay);
        }
    }

    removeMobileOverlay() {
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    initializeLanguage() {
        const savedLanguage = localStorage.getItem('language') || 'vi';
        this.currentLanguage = savedLanguage;
        this.updateLanguage();
        
        // Handle new single button language toggle with dropdown
        const currentLangBtn = document.getElementById('currentLangBtn');
        const langDropdown = document.getElementById('langDropdown');
        const langButtons = document.querySelectorAll('.lang-btn');
        
        if (currentLangBtn && langDropdown) {
            // Toggle dropdown visibility
            currentLangBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = langDropdown.style.display !== 'none';
                langDropdown.style.display = isVisible ? 'none' : 'block';
            });
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.style.display = 'none';
            });
            
            // Handle language selection from dropdown
            langButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedLang = btn.getAttribute('data-lang');
                    
                    if (selectedLang && selectedLang !== this.currentLanguage) {
                        this.currentLanguage = selectedLang;
                        localStorage.setItem('language', this.currentLanguage);
                        this.updateLanguage();
                        this.updateLanguageUI();
                        langDropdown.style.display = 'none';
                    }
                });
            });
        }
        
        // Initialize language UI
        this.updateLanguageUI();
    }

    updateLanguageUI() {
        const currentLangBtn = document.getElementById('currentLangBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (currentLangBtn) {
            // Update current language button
            const flagEmoji = this.currentLanguage === 'vi' ? '🇻🇳' : '🇺🇸';
            const langText = this.currentLanguage.toUpperCase();
            
            currentLangBtn.innerHTML = `
                <span class="flag-emoji">${flagEmoji}</span>
                ${langText}
            `;
            
            // Update dropdown to show other language
            if (langDropdown) {
                const otherLang = this.currentLanguage === 'vi' ? 'en' : 'vi';
                const otherFlag = otherLang === 'vi' ? '🇻🇳' : '🇺🇸';
                const otherText = otherLang.toUpperCase();
                
                langDropdown.innerHTML = `
                    <button class="lang-btn" data-lang="${otherLang}">
                        <span class="flag-emoji">${otherFlag}</span>
                        ${otherText}
                    </button>
                `;
                
                // Re-attach event listener to new button
                const newBtn = langDropdown.querySelector('.lang-btn');
                if (newBtn) {
                    newBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const selectedLang = newBtn.getAttribute('data-lang');
                        
                        if (selectedLang && selectedLang !== this.currentLanguage) {
                            this.currentLanguage = selectedLang;
                            localStorage.setItem('language', this.currentLanguage);
                            this.updateLanguage();
                            this.updateLanguageUI();
                            langDropdown.style.display = 'none';
                        }
                    });
                }
            }
        }
    }

    initializeNotifications() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    initializeModals() {
        // Initialize user modal
        const userModal = document.getElementById('userModal');
        const userModalTrigger = document.getElementById('userModalTrigger');
        
        if (userModalTrigger && userModal) {
            userModalTrigger.addEventListener('click', () => {
                this.openUserModal();
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });
    }

    async loadDashboardData() {
        this.showLoading();
        
        try {
            // Load dashboard statistics
            await this.loadDashboardStats();
            
            // Load recent activities
            await this.loadRecentActivities();
            
            // Load user data based on current section
            if (this.currentSection === 'employees') {
                await this.loadEmployees();
            } else if (this.currentSection === 'attendance') {
                await this.loadAttendanceData();
            }
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadDashboardStats() {
        try {
            // For test account, use sample data
            if (this.currentUser && (this.currentUser.email === 'admin@hrms.com' || this.currentUser.username === 'ADMIN')) {
                this.dashboardData.stats = {
                    totalEmployees: 48,
                    presentToday: 42,
                    lateToday: 3,
                    absentToday: 3
                };
                this.updateDashboardStats();
                return;
            }

            const response = await this.makeAuthenticatedRequest('/api/v1/dashboard/stats');
            const data = await response.json();
            
            if (data.success) {
                this.dashboardData.stats = data.data;
                this.updateDashboardStats();
            } else {
                throw new Error(data.error || 'Failed to load statistics');
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            // Fallback to sample data
            this.dashboardData.stats = {
                totalEmployees: 0,
                presentToday: 0,
                lateToday: 0,
                absentToday: 0
            };
            this.updateDashboardStats();
        }
    }

    async loadRecentActivities() {
        try {
            // For test account, use sample data
            if (this.currentUser && (this.currentUser.email === 'admin@hrms.com' || this.currentUser.username === 'ADMIN')) {
                this.dashboardData.activities = [
                    {
                        id: 1,
                        action: 'check_in',
                        first_name: 'Nguyễn',
                        last_name: 'Văn An',
                        details: 'đã chấm công vào lúc 08:15',
                        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
                    },
                    {
                        id: 2,
                        action: 'new_employee',
                        first_name: 'Trần',
                        last_name: 'Thị Bình',
                        details: 'đã được thêm vào hệ thống',
                        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 3,
                        action: 'check_out',
                        first_name: 'Lê',
                        last_name: 'Minh Cường',
                        details: 'đã chấm công ra lúc 17:30',
                        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 4,
                        action: 'leave_request',
                        first_name: 'Phạm',
                        last_name: 'Thu Dung',
                        details: 'đã gửi đơn xin nghỉ phép',
                        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 5,
                        action: 'overtime',
                        first_name: 'Hoàng',
                        last_name: 'Văn Em',
                        details: 'đã đăng ký làm thêm giờ',
                        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                this.updateRecentActivities();
                return;
            }

            const response = await this.makeAuthenticatedRequest('/api/v1/dashboard/activities?limit=10');
            const data = await response.json();
            
            if (data.success) {
                this.dashboardData.activities = data.data;
                this.updateRecentActivities();
            } else {
                throw new Error(data.error || 'Failed to load activities');
            }
        } catch (error) {
            console.error('Failed to load recent activities:', error);
            // Fallback to empty activities
            this.dashboardData.activities = [];
            this.updateRecentActivities();
        }
    }

    async loadEmployees(page = 1, search = '', filters = {}) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search,
                ...filters
            });

            const response = await this.makeAuthenticatedRequest(`/api/v1/users?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.dashboardData.employees = data.data;
                this.updateEmployeesTable();
            } else {
                throw new Error(data.error || 'Failed to load employees');
            }
        } catch (error) {
            console.error('Failed to load employees:', error);
            this.showNotification('Failed to load employees', 'error');
        }
    }

    async loadAttendanceData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Load today's attendance
            const response = await this.makeAuthenticatedRequest(`/api/v1/attendance/records?date=${today}`);
            const data = await response.json();
            
            if (data.success) {
                this.dashboardData.attendance = data.data;
                this.updateAttendanceView();
            } else {
                throw new Error(data.error || 'Failed to load attendance data');
            }
        } catch (error) {
            console.error('Failed to load attendance data:', error);
            this.showNotification('Failed to load attendance data', 'error');
        }
    }

    updateDashboardStats() {
        const stats = this.dashboardData.stats;
        if (!stats) return;

        // Update stat cards with correct IDs from HTML
        const totalEmployeesEl = document.getElementById('totalEmployees');
        const presentTodayEl = document.getElementById('presentToday');
        const lateTodayEl = document.getElementById('lateToday');
        const absentTodayEl = document.getElementById('absentToday');

        if (totalEmployeesEl) totalEmployeesEl.textContent = stats.totalEmployees || 0;
        if (presentTodayEl) presentTodayEl.textContent = stats.presentToday || 0;
        if (lateTodayEl) lateTodayEl.textContent = stats.lateToday || 0;
        if (absentTodayEl) absentTodayEl.textContent = stats.absentToday || 0;

        // Animate the numbers
        this.animateStatNumbers();
    }

    animateStatNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(el => {
            const finalValue = parseInt(el.textContent) || 0;
            el.textContent = '0';
            
            let currentValue = 0;
            const increment = finalValue / 20;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    el.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(currentValue);
                }
            }, 50);
        });
    }

    updateStatCard(id, value, label) {
        const card = document.getElementById(id);
        if (card) {
            const valueElement = card.querySelector('.stat-value');
            const labelElement = card.querySelector('.stat-label');
            
            if (valueElement) valueElement.textContent = value || 0;
            if (labelElement) labelElement.textContent = label;
        }
    }

    updateRecentActivities() {
        const activitiesContainer = document.getElementById('activityList');
        if (!activitiesContainer || !this.dashboardData.activities) return;

        const activities = this.dashboardData.activities;
        
        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg class="icon">
                        <use href="#icon-${this.getActivityIcon(activity.action)}"></use>
                    </svg>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.first_name || 'Unknown'} ${activity.last_name || ''}</strong>
                        ${activity.details || activity.action}
                    </div>
                    <div class="activity-time">
                        ${this.formatTimeAgo(activity.created_at)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateEmployeesTable() {
        const tableContainer = document.getElementById('employees-table');
        if (!tableContainer || !this.dashboardData.employees) return;

        const employees = this.dashboardData.employees.users || [];
        const pagination = this.dashboardData.employees.pagination || {};

        // Create table HTML
        const tableHTML = `
            <div class="table-header">
                <h3>Employees</h3>
                <div class="table-controls">
                    <input type="text" id="employee-search" placeholder="Search employees..." class="search-input">
                    <select id="department-filter" class="filter-select">
                        <option value="">All Departments</option>
                    </select>
                    <button class="btn btn-primary" onclick="hrDashboard.openAddEmployeeModal()">
                        <i class="fas fa-plus"></i> Add Employee
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map(employee => `
                            <tr>
                                <td>
                                    <div class="user-info">
                                        <div class="user-avatar">
                                            ${this.getInitials(employee.first_name, employee.last_name)}
                                        </div>
                                        <div>
                                            <div class="user-name">${employee.first_name} ${employee.last_name}</div>
                                            <div class="user-username">@${employee.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${employee.email}</td>
                                <td>${employee.department_name || 'Unassigned'}</td>
                                <td>
                                    <span class="role-badge role-${employee.role}">${employee.role}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${employee.is_active ? 'status-active' : 'status-inactive'}">
                                        ${employee.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-secondary" onclick="hrDashboard.viewEmployee(${employee.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-primary" onclick="hrDashboard.editEmployee(${employee.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="hrDashboard.deleteEmployee(${employee.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="table-pagination">
                <div class="pagination-info">
                    Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} employees
                </div>
                <div class="pagination-controls">
                    ${this.createPaginationButtons(pagination)}
                </div>
            </div>
        `;

        tableContainer.innerHTML = tableHTML;

        // Setup search and filter events
        this.setupEmployeeTableEvents();
    }

    updateAttendanceView() {
        const attendanceContainer = document.getElementById('attendance-container');
        if (!attendanceContainer || !this.dashboardData.attendance) return;

        const attendanceData = this.dashboardData.attendance;

        const attendanceHTML = `
            <div class="attendance-header">
                <h3>Today's Attendance</h3>
                <div class="attendance-controls">
                    <button class="btn btn-primary" onclick="hrDashboard.checkIn()">
                        <i class="fas fa-sign-in-alt"></i> Check In
                    </button>
                    <button class="btn btn-secondary" onclick="hrDashboard.checkOut()">
                        <i class="fas fa-sign-out-alt"></i> Check Out
                    </button>
                    <button class="btn btn-warning" onclick="hrDashboard.startBreak()">
                        <i class="fas fa-coffee"></i> Start Break
                    </button>
                </div>
            </div>
            <div class="attendance-grid">
                ${attendanceData.map(record => `
                    <div class="attendance-card">
                        <div class="employee-info">
                            <div class="employee-avatar">
                                ${this.getInitials(record.first_name, record.last_name)}
                            </div>
                            <div class="employee-details">
                                <div class="employee-name">${record.first_name} ${record.last_name}</div>
                                <div class="employee-department">${record.department_name || 'Unassigned'}</div>
                            </div>
                        </div>
                        <div class="attendance-status">
                            <span class="status-badge status-${record.status}">${record.status.replace('_', ' ')}</span>
                        </div>
                        <div class="attendance-times">
                            <div class="time-item">
                                <label>Check In:</label>
                                <span>${record.check_in_time ? this.formatTime(record.check_in_time) : '-'}</span>
                            </div>
                            <div class="time-item">
                                <label>Check Out:</label>
                                <span>${record.check_out_time ? this.formatTime(record.check_out_time) : '-'}</span>
                            </div>
                            <div class="time-item">
                                <label>Total Hours:</label>
                                <span>${record.total_hours ? record.total_hours.toFixed(2) + 'h' : '-'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        attendanceContainer.innerHTML = attendanceHTML;
    }

    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openSearchModal();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.openAddEmployeeModal();
                        break;
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Before unload handler
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    setupEmployeeTableEvents() {
        // Search functionality
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.loadEmployees(1, e.target.value);
                }, 300);
            });
        }

        // Department filter
        const departmentFilter = document.getElementById('department-filter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                const searchValue = document.getElementById('employee-search')?.value || '';
                this.loadEmployees(1, searchValue, { department: e.target.value });
            });
        }
    }

    // Navigation methods
    async navigateToSection(section) {
        if (this.currentSection === section) return;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });

        // Update content area
        this.currentSection = section;
        await this.updateMainContent();
    }

    async updateMainContent() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        this.showLoading();

        try {
            switch (this.currentSection) {
                case 'dashboard':
                    await this.loadDashboardView();
                    break;
                case 'employees':
                    await this.loadEmployeesView();
                    break;
                case 'attendance':
                    await this.loadAttendanceView();
                    break;
                case 'payroll':
                    await this.loadPayrollView();
                    break;
                case 'reports':
                    await this.loadReportsView();
                    break;
                case 'admin':
                    await this.loadAdminView();
                    break;
                default:
                    await this.loadDashboardView();
            }
        } catch (error) {
            console.error('Failed to update main content:', error);
            this.showNotification('Failed to load section', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // View loading methods
    async loadDashboardView() {
        const content = `
            <div class="dashboard-view">
                <div class="dashboard-header">
                    <h1>Dashboard</h1>
                    <div class="dashboard-actions">
                        <button class="btn btn-primary" onclick="hrDashboard.refreshDashboard()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card" id="total-employees">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Total Employees</div>
                        </div>
                    </div>
                    <div class="stat-card" id="active-today">
                        <div class="stat-icon"><i class="fas fa-user-check"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Active Today</div>
                        </div>
                    </div>
                    <div class="stat-card" id="on-break">
                        <div class="stat-icon"><i class="fas fa-coffee"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">On Break</div>
                        </div>
                    </div>
                    <div class="stat-card" id="total-departments">
                        <div class="stat-icon"><i class="fas fa-building"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Departments</div>
                        </div>
                    </div>
                    <div class="stat-card" id="pending-requests">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Pending Requests</div>
                        </div>
                    </div>
                    <div class="stat-card" id="completed-tasks">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Completed Tasks</div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-content">
                    <div class="recent-activities-section">
                        <h3>Recent Activities</h3>
                        <div class="activities-container" id="recent-activities"></div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        await this.loadDashboardStats();
        await this.loadRecentActivities();
    }

    async loadEmployeesView() {
        const content = `
            <div class="employees-view">
                <div class="page-header">
                    <h1>Employee Management</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="hrDashboard.openAddEmployeeModal()">
                            <i class="fas fa-plus"></i> Add Employee
                        </button>
                        <button class="btn btn-secondary" onclick="hrDashboard.exportEmployees()">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                <div id="employees-table"></div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        await this.loadEmployees();
    }

    async loadAttendanceView() {
        const content = `
            <div class="attendance-view">
                <div class="page-header">
                    <h1>Attendance Management</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="hrDashboard.markAttendance()">
                            <i class="fas fa-calendar-check"></i> Mark Attendance
                        </button>
                        <button class="btn btn-secondary" onclick="hrDashboard.exportAttendance()">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                    </div>
                </div>
                <div id="attendance-container"></div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        await this.loadAttendanceData();
    }

    // Utility methods
    getActivityIcon(action) {
        const icons = {
            login: 'sign-in-alt',
            logout: 'sign-out-alt',
            register: 'user-plus',
            check_in: 'clock',
            check_out: 'clock',
            break_start: 'coffee',
            break_end: 'play',
            default: 'info-circle'
        };
        return icons[action] || icons.default;
    }

    getInitials(firstName, lastName) {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last || 'AU';
    }

    getAvatarColor(initials) {
        const colors = [
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
            '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
            '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'
        ];
        let hash = 0;
        for (let i = 0; i < initials.length; i++) {
            hash = initials.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString();
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    createPaginationButtons(pagination) {
        const { page, totalPages } = pagination;
        const buttons = [];

        // Previous button
        if (page > 1) {
            buttons.push(`
                <button class="btn btn-sm btn-secondary" onclick="hrDashboard.changePage(${page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `);
        }

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(`
                <button class="btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="hrDashboard.changePage(${i})">
                    ${i}
                </button>
            `);
        }

        // Next button
        if (page < totalPages) {
            buttons.push(`
                <button class="btn btn-sm btn-secondary" onclick="hrDashboard.changePage(${page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `);
        }

        return buttons.join('');
    }

    // User interface methods
    updateUserInfo() {
        // Update sidebar user info
        const sidebarUserName = document.getElementById('userName');
        const sidebarUserRole = document.getElementById('userRole');
        
        // Update header user info (multiple avatar elements)
        const userAvatars = document.querySelectorAll('.user-avatar');

        if (this.currentUser) {
            const fullName = `${this.currentUser.firstName || 'Admin'} ${this.currentUser.lastName || 'User'}`;
            const role = this.currentUser.role || 'admin';
            
            // Update sidebar
            if (sidebarUserName) {
                sidebarUserName.textContent = fullName;
            }
            if (sidebarUserRole) {
                sidebarUserRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            }
            
            // Update all avatar elements with initials if no image
            userAvatars.forEach(avatar => {
                if (avatar.tagName === 'IMG' && (!avatar.src || avatar.src.includes('avatar-default'))) {
                    // Create a colored circle with initials as fallback
                    const initials = this.getInitials(this.currentUser.firstName, this.currentUser.lastName);
                    avatar.style.backgroundColor = this.getAvatarColor(initials);
                    avatar.style.color = '#ffffff';
                    avatar.style.display = 'flex';
                    avatar.style.alignItems = 'center';
                    avatar.style.justifyContent = 'center';
                    avatar.style.fontWeight = '600';
                    avatar.alt = initials;
                    avatar.title = fullName;
                }
            });
            
            console.log('User info updated for:', fullName, 'Role:', role);
        }
    }

    updateLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
    }

    // Action methods
    async checkIn() {
        try {
            const position = await this.getCurrentPosition();
            
            const response = await this.makeAuthenticatedRequest('/api/v1/attendance/checkin', {
                method: 'POST',
                body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    location: `${position.coords.latitude},${position.coords.longitude}`
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Check-in successful!', 'success');
                await this.loadAttendanceData();
            } else {
                this.showNotification(data.error || 'Check-in failed', 'error');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            this.showNotification('Check-in failed', 'error');
        }
    }

    async checkOut() {
        try {
            const response = await this.makeAuthenticatedRequest('/api/v1/attendance/checkout', {
                method: 'POST'
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification(`Check-out successful! Total hours: ${data.data.totalHours}`, 'success');
                await this.loadAttendanceData();
            } else {
                this.showNotification(data.error || 'Check-out failed', 'error');
            }
        } catch (error) {
            console.error('Check-out error:', error);
            this.showNotification('Check-out failed', 'error');
        }
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
    }

    // Modal methods
    openUserModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    openAddEmployeeModal() {
        // Implement add employee modal
        this.showNotification('Add employee modal - Coming soon!', 'info');
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Notification methods
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    // Loading methods
    showLoading() {
        const existingLoader = document.querySelector('.loading-overlay');
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.loading-overlay');
        if (loader) {
            loader.remove();
        }
    }

    // Real-time updates
    startRealTimeUpdates() {
        // Update dashboard stats every 30 seconds
        this.statsUpdateInterval = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboardStats();
            }
        }, 30000);

        // Update activities every 60 seconds
        this.activitiesUpdateInterval = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadRecentActivities();
            }
        }, 60000);
    }

    stopRealTimeUpdates() {
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
        if (this.activitiesUpdateInterval) {
            clearInterval(this.activitiesUpdateInterval);
        }
    }

    // Utility methods
    async refreshDashboard() {
        await this.loadDashboardData();
        this.showNotification('Dashboard refreshed', 'success');
    }

    changePage(page) {
        const searchValue = document.getElementById('employee-search')?.value || '';
        const departmentValue = document.getElementById('department-filter')?.value || '';
        this.loadEmployees(page, searchValue, { department: departmentValue });
    }

    handleResize() {
        // Handle responsive behavior
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (window.innerWidth < 768) {
            sidebar?.classList.add('mobile');
            mainContent?.classList.add('mobile');
        } else {
            sidebar?.classList.remove('mobile');
            mainContent?.classList.remove('mobile');
        }
    }

    cleanup() {
        this.stopRealTimeUpdates();
    }

    redirectToLogin() {
        window.location.href = '../auth/login.html';
    }

    // Logout method
    async logout() {
        try {
            await this.makeAuthenticatedRequest('/api/v1/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            this.redirectToLogin();
        }
    }

    async loadPayrollView() {
        const content = `
            <div class="payroll-view">
                <div class="page-header">
                    <h1 data-i18n="payroll">Payroll Management</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="hrDashboard.calculatePayroll()">
                            <i class="fas fa-calculator"></i> <span data-i18n="calculate_payroll">Calculate Payroll</span>
                        </button>
                        <button class="btn btn-secondary" onclick="hrDashboard.generatePayslips()">
                            <i class="fas fa-file-invoice"></i> <span data-i18n="generate_payslips">Generate Payslips</span>
                        </button>
                    </div>
                </div>
                
                <div class="payroll-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalPayroll">₫0</div>
                            <div class="stat-label" data-i18n="total_payroll">Total Payroll</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-content">
                            <div class="stat-value" id="payrollEmployees">0</div>
                            <div class="stat-label" data-i18n="employees_processed">Employees Processed</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-content">
                            <div class="stat-value" id="pendingPayroll">0</div>
                            <div class="stat-label" data-i18n="pending_approval">Pending Approval</div>
                        </div>
                    </div>
                </div>
                
                <div class="payroll-content">
                    <div class="payroll-table-container" id="payrollTableContainer">
                        <div class="loading-spinner"></div>
                        <p data-i18n="loading">Loading payroll data...</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        await this.loadPayrollData();
    }

    async loadReportsView() {
        const content = `
            <div class="reports-view">
                <div class="page-header">
                    <h1 data-i18n="reports">Reports & Analytics</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="hrDashboard.generateReport()">
                            <i class="fas fa-chart-line"></i> <span data-i18n="generate_report">Generate Report</span>
                        </button>
                        <button class="btn btn-secondary" onclick="hrDashboard.scheduleReport()">
                            <i class="fas fa-calendar-alt"></i> <span data-i18n="schedule_report">Schedule Report</span>
                        </button>
                    </div>
                </div>
                
                <div class="reports-dashboard">
                    <div class="report-cards">
                        <div class="report-card" onclick="hrDashboard.viewAttendanceReport()">
                            <div class="report-icon"><i class="fas fa-clock"></i></div>
                            <div class="report-content">
                                <h3 data-i18n="attendance_report">Attendance Report</h3>
                                <p data-i18n="attendance_report_desc">Track employee attendance and punctuality</p>
                            </div>
                        </div>
                        
                        <div class="report-card" onclick="hrDashboard.viewPayrollReport()">
                            <div class="report-icon"><i class="fas fa-money-bill"></i></div>
                            <div class="report-content">
                                <h3 data-i18n="payroll_report">Payroll Report</h3>
                                <p data-i18n="payroll_report_desc">Analyze salary and compensation data</p>
                            </div>
                        </div>
                        
                        <div class="report-card" onclick="hrDashboard.viewPerformanceReport()">
                            <div class="report-icon"><i class="fas fa-chart-bar"></i></div>
                            <div class="report-content">
                                <h3 data-i18n="performance_report">Performance Report</h3>
                                <p data-i18n="performance_report_desc">Employee performance metrics and KPIs</p>
                            </div>
                        </div>
                        
                        <div class="report-card" onclick="hrDashboard.viewLeaveReport()">
                            <div class="report-icon"><i class="fas fa-calendar-times"></i></div>
                            <div class="report-content">
                                <h3 data-i18n="leave_report">Leave Report</h3>
                                <p data-i18n="leave_report_desc">Track vacation and sick leave usage</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="charts-container">
                        <div class="chart-widget">
                            <h3 data-i18n="attendance_trend">Attendance Trend</h3>
                            <canvas id="attendanceTrendChart"></canvas>
                        </div>
                        
                        <div class="chart-widget">
                            <h3 data-i18n="department_stats">Department Statistics</h3>
                            <canvas id="departmentStatsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        await this.loadReportsData();
    }

    async loadAdminView() {
        // Check admin permissions
        if (!this.hasAdminPermissions()) {
            this.showNotification('Access denied. Admin permissions required.', 'error');
            this.navigateToSection('dashboard');
            return;
        }

        const content = `
            <div class="admin-view">
                <div class="page-header">
                    <h1 data-i18n="admin">Admin Panel</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="hrDashboard.openSystemSettings()">
                            <i class="fas fa-cog"></i> <span data-i18n="system_settings">System Settings</span>
                        </button>
                        <button class="btn btn-secondary" onclick="hrDashboard.viewAuditLogs()">
                            <i class="fas fa-history"></i> <span data-i18n="audit_logs">Audit Logs</span>
                        </button>
                    </div>
                </div>
                
                <div class="admin-dashboard">
                    <div class="admin-cards">
                        <div class="admin-card" onclick="hrDashboard.manageUsers()">
                            <div class="admin-icon"><i class="fas fa-users-cog"></i></div>
                            <div class="admin-content">
                                <h3 data-i18n="user_management">User Management</h3>
                                <p data-i18n="manage_user_accounts">Manage user accounts and permissions</p>
                            </div>
                        </div>
                        
                        <div class="admin-card" onclick="hrDashboard.manageDepartments()">
                            <div class="admin-icon"><i class="fas fa-building"></i></div>
                            <div class="admin-content">
                                <h3 data-i18n="department_management">Department Management</h3>
                                <p data-i18n="organize_departments">Organize company departments and structure</p>
                            </div>
                        </div>
                        
                        <div class="admin-card" onclick="hrDashboard.manageRoles()">
                            <div class="admin-icon"><i class="fas fa-user-shield"></i></div>
                            <div class="admin-content">
                                <h3 data-i18n="role_management">Role Management</h3>
                                <p data-i18n="configure_roles">Configure roles and permissions</p>
                            </div>
                        </div>
                        
                        <div class="admin-card" onclick="hrDashboard.systemBackup()">
                            <div class="admin-icon"><i class="fas fa-database"></i></div>
                            <div class="admin-content">
                                <h3 data-i18n="system_backup">System Backup</h3>
                                <p data-i18n="backup_restore">Backup and restore system data</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-content">
                        <div class="system-stats">
                            <h3 data-i18n="system_statistics">System Statistics</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label" data-i18n="total_users">Total Users</div>
                                    <div class="stat-value" id="totalUsers">0</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label" data-i18n="active_sessions">Active Sessions</div>
                                    <div class="stat-value" id="activeSessions">0</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label" data-i18n="system_uptime">System Uptime</div>
                                    <div class="stat-value" id="systemUptime">--</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label" data-i18n="database_size">Database Size</div>
                                    <div class="stat-value" id="databaseSize">--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        await this.loadAdminData();
    }

    // Additional helper methods for the new sections
    async loadPayrollData() {
        try {
            // Mock data for testing - replace with API call
            const mockPayrollData = {
                totalPayroll: 150000000,
                employeesProcessed: 48,
                pendingApproval: 3
            };
            
            document.getElementById('totalPayroll').textContent = 
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(mockPayrollData.totalPayroll);
            document.getElementById('payrollEmployees').textContent = mockPayrollData.employeesProcessed;
            document.getElementById('pendingPayroll').textContent = mockPayrollData.pendingApproval;
            
        } catch (error) {
            console.error('Failed to load payroll data:', error);
            this.showNotification('Failed to load payroll data', 'error');
        }
    }

    async loadReportsData() {
        try {
            // Initialize charts if Chart.js is available
            if (typeof Chart !== 'undefined') {
                this.initializeReportsCharts();
            }
        } catch (error) {
            console.error('Failed to load reports data:', error);
            this.showNotification('Failed to load reports data', 'error');
        }
    }

    async loadAdminData() {
        try {
            // Mock admin data - replace with API call
            const mockAdminData = {
                totalUsers: 52,
                activeSessions: 18,
                systemUptime: '7 days, 3 hours',
                databaseSize: '2.3 GB'
            };
            
            document.getElementById('totalUsers').textContent = mockAdminData.totalUsers;
            document.getElementById('activeSessions').textContent = mockAdminData.activeSessions;
            document.getElementById('systemUptime').textContent = mockAdminData.systemUptime;
            document.getElementById('databaseSize').textContent = mockAdminData.databaseSize;
            
        } catch (error) {
            console.error('Failed to load admin data:', error);
            this.showNotification('Failed to load admin data', 'error');
        }
    }

    hasAdminPermissions() {
        return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.permissions?.includes('all'));
    }

    // Translations (basic implementation)
    translations = {
        vi: {
            dashboard: 'Bảng điều khiển',
            employees: 'Nhân viên',
            attendance: 'Chấm công',
            payroll: 'Lương & Phúc lợi',
            reports: 'Báo cáo',
            admin: 'Quản trị'
        },
        en: {
            dashboard: 'Dashboard',
            employees: 'Employees',
            attendance: 'Attendance',
            payroll: 'Payroll',
            reports: 'Reports',
            admin: 'Admin'
        }
    };
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hrDashboard = new HRDashboard();
});

// Export for global access
window.HRDashboard = HRDashboard;