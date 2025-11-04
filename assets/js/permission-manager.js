/**
 * Permission Manager - Handles permission-based UI rendering
 */

const PermissionManager = {
    /**
     * Module permission requirements
     */
    permissions: {
        // VP (HRMSystem.html) Module Permissions
        VP: {
            'home': { level: 1, label: 'Dashboard' },
            'employee-management': { level: 3, label: 'Quản Lý Nhân Viên' },
            'approve-registration': { level: 4, label: 'Duyệt Đăng Ký' },
            'departments': { level: 3, label: 'Phòng Ban' },
            'positions': { level: 3, label: 'Chức Vụ' },
            'salary-management': { level: 3, label: 'Quản Lý Lương' },
            'timesheet-approval': { level: 2, label: 'Duyệt Bảng Công' },
            'reports': { level: 3, label: 'Báo Cáo' }
        },
        
        // CH (dashboard.html) Module Permissions
        CH: {
            'home': { level: 1, label: 'Trang Chủ' },
            'attendance': { level: 1, label: 'Chấm Công' },
            'schedule': { level: 1, label: 'Lịch Làm' },
            'timesheet': { level: 1, label: 'Bảng Công' },
            'salary': { level: 1, label: 'Bảng Lương' },
            'requests': { level: 1, label: 'Yêu Cầu' },
            'notifications': { level: 1, label: 'Thông Báo' },
            'profile': { level: 1, label: 'Cá Nhân' }
        }
    },

    /**
     * Get user permission info from localStorage
     */
    getUserPermissions() {
        try {
            const userData = localStorage.getItem('userData');
            if (!userData) {
                return null;
            }

            const user = JSON.parse(userData);
            return {
                employeeId: user.employeeId,
                departmentId: user.departmentId,
                positionId: user.positionId,
                positionLevel: user.positionLevel || 1,
                permissions: user.permissions || ''
            };
        } catch (error) {
            console.error('Error getting user permissions:', error);
            return null;
        }
    },

    /**
     * Check if user has access to a module
     */
    hasAccess(moduleName, department) {
        const userPerms = this.getUserPermissions();
        if (!userPerms) {
            return false;
        }

        const modulePerms = this.permissions[department];
        if (!modulePerms || !modulePerms[moduleName]) {
            console.warn(`Module ${moduleName} not found in ${department} permissions`);
            return false;
        }

        const requiredLevel = modulePerms[moduleName].level;
        const userLevel = userPerms.positionLevel;

        return userLevel >= requiredLevel;
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
        const modulePerms = this.permissions[department];

        for (const [moduleName, moduleInfo] of Object.entries(modulePerms)) {
            if (userPerms.positionLevel >= moduleInfo.level) {
                allowedModules.push({
                    name: moduleName,
                    label: moduleInfo.label,
                    requiredLevel: moduleInfo.level
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
        if (!userPerms || userPerms.departmentId !== 'VP') {
            return;
        }

        const menuItems = {
            // Employee Management Section
            'employee-management': { selector: '[data-function="employee-management"]', level: 3 },
            'approve-registration': { selector: '[data-function="approve-registration"]', level: 4 },
            'grant-access': { selector: '[data-function="grant-access"]', level: 4 },
            
            // Approval Section
            'process-requests': { selector: '[data-function="process-requests"]', level: 2 },
            'attendance-approval': { selector: '[data-function="attendance-approval"]', level: 2 },
            
            // Schedule Section
            'schedule-management': { selector: '[data-function="schedule-management"]', level: 3 },
            'shift-management': { selector: '[data-function="shift-management"]', level: 2 },
            
            // Reports Section
            'view-reports': { selector: '[data-function="view-reports"]', level: 3 },
            'analytics': { selector: '[data-function="analytics"]', level: 3 },
            
            // System Section
            'system-settings': { selector: '[data-function="system-settings"]', level: 4 }
        };

        // Apply permissions to each menu item
        for (const [key, config] of Object.entries(menuItems)) {
            const element = document.querySelector(config.selector);
            if (element) {
                const listItem = element.closest('li');
                if (listItem) {
                    if (userPerms.positionLevel < config.level) {
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
        if (!userPerms || userPerms.departmentId !== 'CH') {
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
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.departmentId === 'VP') {
                    PermissionManager.applyVPMenuPermissions();
                } else if (user.departmentId === 'CH') {
                    PermissionManager.applyCHMenuPermissions();
                }
                console.log('✅ Permissions applied for', user.departmentId, 'Level', user.positionLevel);
            }
        }, 100);
    });
}
