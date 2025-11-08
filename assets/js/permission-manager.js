/**
 * Permission Manager - Handles permission-based UI rendering
 * Uses permissions field from positions table instead of positionLevel
 */

const PermissionManager = {
    /**
     * Module permission requirements - maps module names to required permission strings
     */
    modulePermissions: {
        // VP (HRMSystem.html) Module Permissions
        VP: {
            'home': { required: [], label: 'Dashboard' }, // Everyone can access
            'employee-management': { required: ['employee_manage'], label: 'Quản Lý Nhân Viên' },
            'approve-registration': { required: ['registration_approve'], label: 'Duyệt Đăng Ký' },
            'departments': { required: ['department_manage'], label: 'Phòng Ban' },
            'positions': { required: ['position_manage'], label: 'Chức Vụ' },
            'salary-management': { required: ['salary_manage'], label: 'Quản Lý Lương' },
            'timesheet-approval': { required: ['timesheet_approve'], label: 'Duyệt Bảng Công' },
            'reports': { required: ['reports_view'], label: 'Báo Cáo' }
        },
        
        // CH (dashboard.html) Module Permissions
        CH: {
            'home': { required: [], label: 'Trang Chủ' },
            'attendance': { required: ['attendance_self'], label: 'Chấm Công' },
            'schedule': { required: ['schedule_view'], label: 'Lịch Làm' },
            'timesheet': { required: ['timesheet_view'], label: 'Bảng Công' },
            'salary': { required: ['salary_view'], label: 'Bảng Lương' },
            'requests': { required: ['request_create'], label: 'Yêu Cầu' },
            'notifications': { required: ['notification_view'], label: 'Thông Báo' },
            'profile': { required: ['profile_view'], label: 'Cá Nhân' }
        }
    },

    /**
     * Get user permission info from localStorage
     */
    getUserPermissions() {
        try {
            // Use SimpleStorage if available, otherwise fall back to localStorage
            let user;
            if (typeof SimpleStorage !== 'undefined') {
                user = SimpleStorage.get('userData');
            } else {
                const userData = localStorage.getItem('userData');
                if (!userData) {
                    return null;
                }
                user = JSON.parse(userData);
            }
            
            if (!user) {
                return null;
            }

            // Parse permissions from comma-separated string
            const permissionsList = user.permissions ? user.permissions.split(',').map(p => p.trim()) : [];
            
            return {
                employeeId: user.employeeId,
                companyId: user.companyId,
                positionId: user.positionId,
                positionLevel: user.positionLevel || 1, // Keep for backward compatibility
                permissions: permissionsList, // Array of permission strings
                permissionsRaw: user.permissions || '' // Original string
            };
        } catch (error) {
            console.error('Error getting user permissions:', error);
            return null;
        }
    },

    /**
     * Check if user has access to a module based on permissions
     */
    hasAccess(moduleName, department) {
        const userPerms = this.getUserPermissions();
        if (!userPerms) {
            return false;
        }

        const moduleConfig = this.modulePermissions[department];
        if (!moduleConfig || !moduleConfig[moduleName]) {
            console.warn(`Module ${moduleName} not found in ${department} permissions`);
            return false;
        }

        const requiredPerms = moduleConfig[moduleName].required;
        
        // If no permissions required, everyone can access
        if (!requiredPerms || requiredPerms.length === 0) {
            return true;
        }

        // Check if user has at least one of the required permissions
        const hasPermission = requiredPerms.some(reqPerm => 
            userPerms.permissions.includes(reqPerm)
        );

        return hasPermission;
    },

    /**
     * Filter menu items based on user permissions
     */
    filterMenuItems(department) {
        const userPerms = this.getUserPermissions();
        if (!userPerms) {
            return [];
        }

        const allowedModules = [];
        const moduleConfig = this.modulePermissions[department];

        for (const [moduleName, moduleInfo] of Object.entries(moduleConfig)) {
            // Check if user has required permissions
            const requiredPerms = moduleInfo.required;
            
            if (requiredPerms.length === 0 || 
                requiredPerms.some(reqPerm => userPerms.permissions.includes(reqPerm))) {
                allowedModules.push({
                    name: moduleName,
                    label: moduleInfo.label,
                    requiredPermissions: requiredPerms
                });
            }
        }

        return allowedModules;
    },

    /**
     * Hide/show menu items based on permissions (VP Dashboard)
     */
    applyVPMenuPermissions() {
        const userPerms = this.getUserPermissions();
        if (!userPerms || userPerms.companyId !== 'VP') {
            return;
        }

        const menuItems = {
            // Employee Management Section
            'employee-management': { selector: '[data-function="employee-management"]', permissions: ['employee_manage'] },
            'approve-registration': { selector: '[data-function="approve-registration"]', permissions: ['registration_approve'] },
            'grant-access': { selector: '[data-function="grant-access"]', permissions: ['registration_approve'] },
            
            // Approval Section
            'process-requests': { selector: '[data-function="process-requests"]', permissions: ['request_approve'] },
            'attendance-approval': { selector: '[data-function="attendance-approval"]', permissions: ['timesheet_approve'] },
            
            // Schedule Section
            'schedule-management': { selector: '[data-function="schedule-management"]', permissions: ['schedule_manage'] },
            'shift-management': { selector: '[data-function="shift-management"]', permissions: ['shift_manage'] },
            
            // Reports Section
            'view-reports': { selector: '[data-function="view-reports"]', permissions: ['reports_view'] },
            'analytics': { selector: '[data-function="analytics"]', permissions: ['reports_view'] },
            
            // System Section
            'system-settings': { selector: '[data-function="system-settings"]', permissions: ['system_admin'] }
        };

        // Apply permissions to each menu item
        for (const [key, config] of Object.entries(menuItems)) {
            const element = document.querySelector(config.selector);
            if (element) {
                const listItem = element.closest('li');
                if (listItem) {
                    // Check if user has any of the required permissions
                    const hasPermission = config.permissions.some(perm => 
                        userPerms.permissions.includes(perm)
                    );
                    
                    if (!hasPermission) {
                        listItem.style.display = 'none';
                    } else {
                        listItem.style.display = 'block';
                    }
                }
            }
        }

        // Hide entire sections if all items are hidden
        this.hideEmptySections();
    },

    /**
     * Apply permissions to CH Dashboard (all CH employees have access to all features)
     */
    applyCHMenuPermissions() {
        const userPerms = this.getUserPermissions();
        if (!userPerms || userPerms.companyId !== 'CH') {
            return;
        }

        // CH employees have access to all bottom nav features
        // No filtering needed for now
        console.log('CH permissions applied - all features accessible');
    },

    /**
     * Hide menu sections that have no visible items
     */
    hideEmptySections() {
        const sections = document.querySelectorAll('.menu-section');
        sections.forEach(section => {
            const visibleItems = section.querySelectorAll('li:not([style*="display: none"])');
            if (visibleItems.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    },

    /**
     * Show access denied message
     */
    showAccessDenied(moduleName) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Không Có Quyền Truy Cập</h2>
                    </div>
                    <div class="card-body" id="access-denied-module">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 20px; text-align: center;">
                            <span class="material-icons-round" style="font-size: 64px; color: #ef4444; margin-bottom: 16px;">
                                block
                            </span>
                            <h2 style="color: #e8edf4; margin-bottom: 8px;">Không Có Quyền Truy Cập</h2>
                            <p style="color: #c9d1d9; margin-bottom: 24px;">
                                Bạn không có quyền truy cập chức năng <strong>${moduleName}</strong>.
                                <br>Vui lòng liên hệ quản trị viên để được cấp quyền.
                            </p>
                            <button onclick="HRMRouter.navigateTo('home')" 
                                    style="background: #5b9ff9; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                                <span class="material-icons-round" style="vertical-align: middle; margin-right: 8px;">home</span>
                                Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Get user level label
     */
    getLevelLabel(level) {
        const labels = {
            1: 'Nhân Viên',
            2: 'Giám Sát',
            3: 'Quản Lý',
            4: 'Quản Trị Viên'
        };
        return labels[level] || 'Unknown';
    },

    /**
     * Display user info with permission level
     */
    displayUserInfo() {
        const userPerms = this.getUserPermissions();
        if (!userPerms) {
            return '';
        }

        return `
            <div class="user-info-card">
                <div class="user-avatar">
                    <span class="material-icons-round">account_circle</span>
                </div>
                <div class="user-details">
                    <h4>${userPerms.employeeId}</h4>
                    <p>${this.getLevelLabel(userPerms.positionLevel)} - Level ${userPerms.positionLevel}</p>
                </div>
            </div>
        `;
    }
};

// Auto-initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Apply permissions after a short delay to ensure DOM is ready
        setTimeout(() => {
            // Use SimpleStorage if available, otherwise fall back to localStorage
            let user;
            if (typeof SimpleStorage !== 'undefined') {
                user = SimpleStorage.get('userData');
            } else {
                const userData = localStorage.getItem('userData');
                if (userData) {
                    user = JSON.parse(userData);
                }
            }
            
            if (user) {
                if (user.companyId === 'VP') {
                    PermissionManager.applyVPMenuPermissions();
                } else if (user.companyId === 'CH') {
                    PermissionManager.applyCHMenuPermissions();
                }
                console.log('✅ Permissions applied for', user.companyId, 'Level', user.positionLevel);
            }
        }, 100);
    });
}
