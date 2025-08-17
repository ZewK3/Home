/**
 * Professional HR Dashboard JavaScript
 * Clean rebuild to fix syntax errors
 */

// TEST ACCOUNTS - Remove when deploying to production
const TEST_ACCOUNTS = {
    ADMIN: {
        id: 1,
        email: 'admin@hrms.com',
        username: 'ADMIN',
        password: 'ADMIN123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        department: 'Administration',
        permissions: ['all']
    }
};

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.language = localStorage.getItem('language') || 'vi';
        this.notifications = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('Dashboard Manager initializing...');
        
        // Check authentication
        if (!this.checkAuth()) {
            console.log('Not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        console.log('User authenticated, loading dashboard');
        this.setupEventListeners();
        this.updateLanguage();
        this.loadUserProfile();
        this.loadDashboardData();
        this.setupThemeForDepartment();
    }

    checkAuth() {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        if (!token) {
            return false;
        }

        // Check test account
        const credentials = localStorage.getItem('testCredentials');
        if (credentials) {
            try {
                const parsed = JSON.parse(credentials);
                if (parsed.username === 'ADMIN' && parsed.password === 'ADMIN123') {
                    this.currentUser = TEST_ACCOUNTS.ADMIN;
                    return true;
                }
            } catch (e) {
                console.error('Error parsing credentials:', e);
            }
        }

        // For now, assume authenticated if token exists
        this.currentUser = TEST_ACCOUNTS.ADMIN;
        return true;
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                document.body.classList.toggle('sidebar-collapsed');
            });
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                document.body.classList.toggle('mobile-menu-open');
            });
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Language toggle
        this.setupLanguageToggle();

        // User profile
        this.setupUserProfile();

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutDropdown = document.getElementById('logoutDropdown');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        if (logoutDropdown) {
            logoutDropdown.addEventListener('click', () => this.logout());
        }

        // Quick actions
        this.setupQuickActions();
    }

    setupLanguageToggle() {
        const currentLangBtn = document.getElementById('currentLangBtn');
        const langDropdown = document.getElementById('langDropdown');

        if (currentLangBtn && langDropdown) {
            currentLangBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.style.display = langDropdown.style.display === 'none' ? 'block' : 'none';
            });

            const langBtns = langDropdown.querySelectorAll('.lang-btn');
            langBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = btn.dataset.lang;
                    this.switchLanguage(lang);
                    langDropdown.style.display = 'none';
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.style.display = 'none';
            });
        }
    }

    setupUserProfile() {
        const userProfile = document.querySelector('.user-profile');
        const userMenuBtn = document.querySelector('.user-menu-btn');
        
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                this.showUserProfileModal();
            });
        }

        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                this.showUserProfileModal();
            });
        }
    }

    setupQuickActions() {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.loadSectionContent(section);
        }

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(section);
        }

        this.currentSection = section;
    }

    loadSectionContent(section) {
        const sectionElement = document.getElementById(`${section}Section`);
        if (!sectionElement) return;

        // Show loading state
        sectionElement.innerHTML = `
            <div class="section-loading">
                <div class="loading-spinner"></div>
                <p data-i18n="loading">Đang tải...</p>
            </div>
        `;

        // Load section-specific content
        setTimeout(() => {
            switch (section) {
                case 'dashboard':
                    this.loadDashboardContent();
                    break;
                case 'employees':
                    this.loadEmployeesContent();
                    break;
                case 'attendance':
                    this.loadAttendanceContent();
                    break;
                case 'payroll':
                    this.loadPayrollContent();
                    break;
                case 'reports':
                    this.loadReportsContent();
                    break;
                case 'admin':
                    this.loadAdminContent();
                    break;
            }
        }, 500);
    }

    loadDashboardContent() {
        const dashboardSection = document.getElementById('dashboardSection');
        if (!dashboardSection) return;

        // This content should already be in the HTML, just make sure it's visible
        dashboardSection.style.display = 'block';
        this.loadDashboardData();
    }

    loadEmployeesContent() {
        const section = document.getElementById('employeesSection');
        if (!section) return;

        section.innerHTML = `
            <div class="section-header">
                <h2>Quản lý nhân viên</h2>
                <button class="btn-primary">Thêm nhân viên</button>
            </div>
            <div class="employees-content">
                <div class="employees-table">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ tên</th>
                                <th>Phòng ban</th>
                                <th>Chức vụ</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>EMP001</td>
                                <td>Admin User</td>
                                <td>Quản trị</td>
                                <td>Quản trị viên</td>
                                <td><span class="status active">Hoạt động</span></td>
                                <td>
                                    <button class="btn-edit">Sửa</button>
                                    <button class="btn-view">Xem</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    loadAttendanceContent() {
        const section = document.getElementById('attendanceSection');
        if (!section) return;

        section.innerHTML = `
            <div class="section-header">
                <h2>Quản lý chấm công</h2>
                <div class="attendance-actions">
                    <button class="btn-primary" id="checkInBtn">Chấm công vào</button>
                    <button class="btn-secondary" id="checkOutBtn">Chấm công ra</button>
                </div>
            </div>
            <div class="attendance-content">
                <div class="attendance-summary">
                    <div class="summary-card">
                        <h3>Hôm nay</h3>
                        <div class="summary-stats">
                            <div class="stat">
                                <span class="value">42</span>
                                <span class="label">Có mặt</span>
                            </div>
                            <div class="stat">
                                <span class="value">3</span>
                                <span class="label">Đi muộn</span>
                            </div>
                            <div class="stat">
                                <span class="value">3</span>
                                <span class="label">Vắng mặt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadPayrollContent() {
        const section = document.getElementById('payrollSection');
        if (!section) return;

        section.innerHTML = `
            <div class="section-header">
                <h2>Quản lý lương</h2>
                <button class="btn-primary">Tính lương tháng</button>
            </div>
            <div class="payroll-content">
                <div class="payroll-summary">
                    <div class="summary-card">
                        <h3>Tổng quan lương tháng này</h3>
                        <div class="payroll-stats">
                            <div class="stat">
                                <span class="value">₫ 2,450,000,000</span>
                                <span class="label">Tổng lương</span>
                            </div>
                            <div class="stat">
                                <span class="value">45</span>
                                <span class="label">Nhân viên</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadReportsContent() {
        const section = document.getElementById('reportsSection');
        if (!section) return;

        section.innerHTML = `
            <div class="section-header">
                <h2>Báo cáo và thống kê</h2>
                <select class="report-filter">
                    <option value="month">Tháng này</option>
                    <option value="quarter">Quý này</option>
                    <option value="year">Năm này</option>
                </select>
            </div>
            <div class="reports-content">
                <div class="reports-grid">
                    <div class="report-card">
                        <h3>Báo cáo chấm công</h3>
                        <p>Thống kê chấm công theo thời gian</p>
                        <button class="btn-secondary">Xem báo cáo</button>
                    </div>
                    <div class="report-card">
                        <h3>Báo cáo lương</h3>
                        <p>Phân tích chi phí lương theo phòng ban</p>
                        <button class="btn-secondary">Xem báo cáo</button>
                    </div>
                </div>
            </div>
        `;
    }

    loadAdminContent() {
        const section = document.getElementById('adminSection');
        if (!section) return;

        section.innerHTML = `
            <div class="section-header">
                <h2>Quản trị hệ thống</h2>
            </div>
            <div class="admin-content">
                <div class="admin-grid">
                    <div class="admin-card">
                        <h3>Quản lý người dùng</h3>
                        <p>Thêm, sửa, xóa tài khoản người dùng</p>
                        <button class="btn-secondary">Quản lý</button>
                    </div>
                    <div class="admin-card">
                        <h3>Cài đặt hệ thống</h3>
                        <p>Cấu hình các tham số hệ thống</p>
                        <button class="btn-secondary">Cài đặt</button>
                    </div>
                </div>
            </div>
        `;
    }

    loadDashboardData() {
        // Update statistics
        this.updateStatistics();
        this.loadRecentActivities();
    }

    updateStatistics() {
        // Animate counters
        this.animateCounter('totalEmployees', 48);
        this.animateCounter('presentToday', 42);
        this.animateCounter('lateToday', 3);
        this.animateCounter('absentToday', 3);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let current = 0;
        const increment = targetValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 30);
    }

    loadRecentActivities() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            {
                first_name: 'Nguyễn Văn',
                last_name: 'An',
                action: 'check_in',
                description: 'đã chấm công vào lúc 08:15',
                time: '15m ago'
            },
            {
                first_name: 'Trần Thị',
                last_name: 'Bình',
                action: 'update',
                description: 'đã được thêm vào hệ thống',
                time: '2h ago'
            },
            {
                first_name: 'Lê Minh',
                last_name: 'Cường',
                action: 'check_out',
                description: 'đã chấm công ra lúc 17:30',
                time: '3h ago'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg class="icon">
                        <use href="#icon-${this.getActivityIcon(activity.action)}"></use>
                    </svg>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.first_name} ${activity.last_name}</strong>
                        ${activity.description}
                    </div>
                    <div class="activity-time">
                        ${activity.time}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(action) {
        const icons = {
            check_in: 'clock',
            check_out: 'clock',
            update: 'user',
            create: 'user-plus',
            delete: 'x'
        };
        return icons[action] || 'info-circle';
    }

    switchLanguage(lang) {
        this.language = lang;
        localStorage.setItem('language', lang);
        this.updateLanguage();
    }

    updateLanguage() {
        const currentLangBtn = document.getElementById('currentLangBtn');
        if (currentLangBtn) {
            const flagEmoji = this.language === 'vi' ? '🇻🇳' : '🇺🇸';
            const langText = this.language === 'vi' ? 'VI' : 'EN';
            
            currentLangBtn.innerHTML = `
                <span class="flag-emoji">${flagEmoji}</span>
                ${langText}
            `;

            // Update dropdown to show other language
            const langDropdown = document.getElementById('langDropdown');
            if (langDropdown) {
                const otherLang = this.language === 'vi' ? 'en' : 'vi';
                const otherFlag = this.language === 'vi' ? '🇺🇸' : '🇻🇳';
                const otherText = this.language === 'vi' ? 'EN' : 'VI';
                
                langDropdown.innerHTML = `
                    <button class="lang-btn" data-lang="${otherLang}">
                        <span class="flag-emoji">${otherFlag}</span>
                        ${otherText}
                    </button>
                `;
                
                // Re-add event listener
                const langBtn = langDropdown.querySelector('.lang-btn');
                if (langBtn) {
                    langBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.switchLanguage(otherLang);
                        langDropdown.style.display = 'none';
                    });
                }
            }
        }

        // Update all translatable elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    getTranslation(key) {
        const translations = {
            vi: {
                dashboard: 'Bảng điều khiển',
                employees: 'Nhân viên',
                attendance: 'Chấm công',
                payroll: 'Lương',
                reports: 'Báo cáo',
                admin: 'Quản trị',
                total_employees: 'Tổng nhân viên',
                present_today: 'Có mặt hôm nay',
                late_today: 'Đi muộn hôm nay',
                absent_today: 'Vắng mặt hôm nay',
                recent_activities: 'Hoạt động gần đây',
                attendance_overview: 'Tổng quan chấm công',
                quick_actions: 'Thao tác nhanh',
                loading: 'Đang tải...'
            },
            en: {
                dashboard: 'Dashboard',
                employees: 'Employees',
                attendance: 'Attendance',
                payroll: 'Payroll',
                reports: 'Reports',
                admin: 'Administration',
                total_employees: 'Total Employees',
                present_today: 'Present Today',
                late_today: 'Late Today',
                absent_today: 'Absent Today',
                recent_activities: 'Recent Activities',
                attendance_overview: 'Attendance Overview',
                quick_actions: 'Quick Actions',
                loading: 'Loading...'
            }
        };

        return translations[this.language]?.[key] || key;
    }

    getSectionTitle(section) {
        const titles = {
            dashboard: this.getTranslation('dashboard'),
            employees: this.getTranslation('employees'),
            attendance: this.getTranslation('attendance'),
            payroll: this.getTranslation('payroll'),
            reports: this.getTranslation('reports'),
            admin: this.getTranslation('admin')
        };
        return titles[section] || section;
    }

    loadUserProfile() {
        if (!this.currentUser) return;

        // Update user info in sidebar
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userName) {
            userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        if (userRole) {
            userRole.textContent = this.currentUser.department;
        }
    }

    setupThemeForDepartment() {
        if (!this.currentUser?.department) return;

        const themeColors = {
            'Administration': '#4F46E5',
            'Human Resources': '#10B981',
            'Finance': '#F59E0B',
            'Operations': '#EF4444'
        };

        const color = themeColors[this.currentUser.department];
        if (color) {
            document.documentElement.style.setProperty('--primary-color', color);
        }
    }

    showUserProfileModal() {
        const modal = document.getElementById('userProfileModal');
        if (!modal) return;

        // Update modal content with user data
        const profileFullName = document.getElementById('profileFullName');
        const profileEmail = document.getElementById('profileEmail');
        const profileEmployeeId = document.getElementById('profileEmployeeId');
        const profileDepartment = document.getElementById('profileDepartment');

        if (profileFullName) {
            profileFullName.textContent = `${this.currentUser.firstName || 'Admin'} ${this.currentUser.lastName || 'User'}`;
        }
        if (profileEmail) {
            profileEmail.textContent = this.currentUser.email;
        }
        if (profileEmployeeId) {
            profileEmployeeId.textContent = 'EMP001';
        }
        if (profileDepartment) {
            profileDepartment.textContent = this.currentUser.department;
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        // Setup close handlers
        const closeBtn = document.getElementById('closeProfileModal');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            };
        }

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        };
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-employee':
                this.switchSection('employees');
                break;
            case 'clock-in':
                this.handleClockIn();
                break;
            case 'generate-report':
                this.switchSection('reports');
                break;
            case 'payroll':
                this.switchSection('payroll');
                break;
        }
    }

    handleClockIn() {
        this.showNotification('success', 'Chấm công thành công!');
    }

    showNotification(type, message) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon"></span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        notification.style.display = 'block';
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('testCredentials');
        window.location.href = '/pages/auth/login.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard script loaded, initializing...');
    window.dashboardManager = new DashboardManager();
});