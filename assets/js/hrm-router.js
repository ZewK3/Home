/**
 * HRM Router - SPA Navigation System
 * Handles URL routing and module loading for both VP and CH dashboards
 */

const HRMRouter = {
    currentModule: null,
    currentDepartment: null,
    
    /**
     * Initialize router
     */
    init(department) {
        this.currentDepartment = department; // 'VP' or 'CH'
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    },
    
    /**
     * Handle current route
     */
    handleRoute() {
        const hash = window.location.hash.substring(1) || 'home';
        this.navigateTo(hash);
    },
    
    /**
     * Navigate to module
     */
    async navigateTo(moduleName, params = {}) {
        try {
            // Update URL if needed
            if (window.location.hash !== `#${moduleName}`) {
                window.location.hash = moduleName;
            }
            
            // Update current module
            this.currentModule = moduleName;
            
            // Update page title
            this.updatePageTitle(moduleName);
            
            // Load and render module
            await this.loadModule(moduleName, params);
            
            // Update active menu item
            this.updateActiveMenu(moduleName);
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.showError('Không thể tải nội dung');
        }
    },
    
    /**
     * Load module content
     */
    async loadModule(moduleName, params) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }
        
        // CHECK PERMISSIONS - Use unified permission check
        const userData = typeof SimpleStorage !== 'undefined' ? SimpleStorage.get('userData') : null;
        if (userData && userData.permissions) {
            // For unified dashboard, check if user has access based on their permissions
            // Home and profile are always accessible
            if (moduleName !== 'home' && moduleName !== 'profile') {
                const hasPermission = this.checkModulePermission(moduleName, userData.permissions);
                if (!hasPermission) {
                    console.warn(`Access denied to module: ${moduleName} - user lacks required permission`);
                    this.showAccessDenied(moduleName);
                    return;
                }
            }
        }
        
        // Show loading state
        mainContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Đang tải...</p>
            </div>
        `;
        
        // Get module config
        const moduleConfig = this.getModuleConfig(moduleName);
        
        if (!moduleConfig) {
            this.showError('Module không tồn tại');
            return;
        }
        
        // Load module content
        try {
            const content = await moduleConfig.loader(params);
            mainContent.innerHTML = content;
            
            // Execute module initialization if exists
            if (moduleConfig.onLoad) {
                moduleConfig.onLoad(params);
            }
        } catch (error) {
            console.error(`Error loading module ${moduleName}:`, error);
            this.showError('Lỗi khi tải nội dung');
        }
    },
    
    /**
     * Get module configuration
     */
    getModuleConfig(moduleName) {
        // VP modules (HRMSystem.html)
        const vpModules = {
            'home': {
                title: 'Tổng Quan VP',
                loader: () => HRMModules.VP.renderDashboard(),
                onLoad: () => HRMModules.VP.initDashboard()
            },
            'employee-management': {
                title: 'Quản Lý Nhân Viên',
                loader: () => HRMModules.VP.renderEmployeeManagement(),
                onLoad: () => HRMModules.VP.initEmployeeManagement()
            },
            'approve-registration': {
                title: 'Duyệt Đăng Ký',
                loader: () => HRMModules.VP.renderApproveRegistration(),
                onLoad: () => HRMModules.VP.initApproveRegistration()
            },
            'departments': {
                title: 'Phòng Ban',
                loader: () => HRMModules.VP.renderDepartments(),
                onLoad: () => HRMModules.VP.initDepartments()
            },
            'positions': {
                title: 'Chức Vụ',
                loader: () => HRMModules.VP.renderPositions(),
                onLoad: () => HRMModules.VP.initPositions()
            },
            'salary-management': {
                title: 'Quản Lý Lương',
                loader: () => HRMModules.VP.renderSalaryManagement(),
                onLoad: () => HRMModules.VP.initSalaryManagement()
            },
            'timesheet-approval': {
                title: 'Duyệt Bảng Công',
                loader: () => HRMModules.VP.renderTimesheetApproval(),
                onLoad: () => HRMModules.VP.initTimesheetApproval()
            },
            'reports': {
                title: 'Báo Cáo',
                loader: () => HRMModules.VP.renderReports(),
                onLoad: () => HRMModules.VP.initReports()
            }
        };
        
        // CH modules (dashboard.html)
        const chModules = {
            'home': {
                title: 'Trang Chủ',
                loader: () => HRMModules.CH.renderDashboard(),
                onLoad: () => HRMModules.CH.initDashboard()
            },
            'attendance': {
                title: 'Chấm Công',
                loader: () => HRMModules.CH.renderAttendance(),
                onLoad: () => HRMModules.CH.initAttendance()
            },
            'schedule': {
                title: 'Lịch Làm Việc',
                loader: () => HRMModules.CH.renderSchedule(),
                onLoad: () => HRMModules.CH.initSchedule()
            },
            'timesheet': {
                title: 'Bảng Công',
                loader: () => HRMModules.CH.renderTimesheet(),
                onLoad: () => HRMModules.CH.initTimesheet()
            },
            'salary': {
                title: 'Lương',
                loader: () => HRMModules.CH.renderSalary(),
                onLoad: () => HRMModules.CH.initSalary()
            },
            'requests': {
                title: 'Yêu Cầu',
                loader: () => HRMModules.CH.renderRequests(),
                onLoad: () => HRMModules.CH.initRequests()
            },
            'notifications': {
                title: 'Thông Báo',
                loader: () => HRMModules.CH.renderNotifications(),
                onLoad: () => HRMModules.CH.initNotifications()
            },
            'profile': {
                title: 'Thông Tin Cá Nhân',
                loader: () => HRMModules.CH.renderProfile(),
                onLoad: () => HRMModules.CH.initProfile()
            }
        };
        
        // Return module based on current department
        const modules = this.currentDepartment === 'VP' ? vpModules : chModules;
        return modules[moduleName];
    },
    
    /**
     * Update page title
     */
    updatePageTitle(moduleName) {
        const headerTitle = document.querySelector('.header-title');
        const moduleConfig = this.getModuleConfig(moduleName);
        
        if (headerTitle && moduleConfig) {
            headerTitle.textContent = moduleConfig.title;
        }
        
        // Update document title
        document.title = moduleConfig?.title ? 
            `${moduleConfig.title} - ${this.currentDepartment === 'VP' ? 'HRM System' : 'Dashboard'}` :
            (this.currentDepartment === 'VP' ? 'HRM System' : 'Dashboard');
    },
    
    /**
     * Update active menu item
     */
    updateActiveMenu(moduleName) {
        // Update drawer menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update bottom navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.nav === moduleName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    /**
     * Check if user has permission for a module
     */
    checkModulePermission(moduleName, permissionsString) {
        // Define module permission requirements
        const modulePermissions = {
            'attendance': ['attendance_self'],
            'schedule': ['schedule_view', 'schedule_manage'],
            'timesheet': ['timesheet_view', 'timesheet_approve'],
            'salary': ['salary_view', 'salary_manage'],
            'requests': ['request_create', 'request_approve'],
            'leave-request': ['request_create'],
            'process-requests': ['request_approve'],
            'schedule-management': ['schedule_manage'],
            'timesheet-approval': ['timesheet_approve'],
            'attendance-approval': ['attendance_approve'],
            'employees': ['employee_view', 'employee_manage'],
            'employee-management': ['employee_manage'],
            'registration-approval': ['registration_approve'],
            'departments': ['department_manage'],
            'positions': ['position_manage'],
            'reports': ['reports_view'],
            'salary-management': ['salary_manage'],
            'system-settings': ['system_admin']
        };
        
        const requiredPerms = modulePermissions[moduleName];
        if (!requiredPerms) {
            // Module not found in permissions map, allow access
            return true;
        }
        
        const userPermissions = permissionsString.split(',').map(p => p.trim());
        
        // Check if user has at least one of the required permissions
        return requiredPerms.some(perm => userPermissions.includes(perm));
    },
    
    /**
     * Show access denied message
     */
    showAccessDenied(moduleName) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <span class="material-icons-round" style="font-size: 64px; color: #f87171;">lock</span>
                    <h3>Không có quyền truy cập</h3>
                    <p>Bạn không có quyền truy cập module "${moduleName}"</p>
                    <button class="btn btn-primary" onclick="HRMRouter.navigateTo('home')">
                        Về trang chủ
                    </button>
                </div>
            `;
        }
    },
    
    /**
     * Show error message
     */
    showError(message) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <span class="material-icons-round" style="font-size: 64px; color: #f87171;">error_outline</span>
                    <h3>Có lỗi xảy ra</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="HRMRouter.navigateTo('home')">
                        Về trang chủ
                    </button>
                </div>
            `;
        }
    }
};
