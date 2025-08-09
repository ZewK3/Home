/**
 * Enhanced Navigation Manager for HR Management System
 * Handles all navigation functionality and ensures proper routing
 */

class NavigationManager {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.setupNavigationHandlers();
        this.createTestingInterface();
    }

    setupNavigationHandlers() {
        console.log('Setting up enhanced navigation handlers...');
        
        // Main navigation items
        const navigationMap = {
            // Work Management
            'openTimesheet': () => {
                console.log('Attempting to show timesheet...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for timesheet');
                    return;
                }
                return this.contentManager.showTimesheet();
            },
            'openAttendance': () => {
                console.log('Attempting to show attendance GPS...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for attendance');
                    return;
                }
                return this.contentManager.showAttendanceGPS();
            },
            'mobileTimesheet': () => {
                console.log('Mobile: Attempting to show timesheet...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile timesheet');
                    return;
                }
                return this.contentManager.showTimesheet();
            },
            'mobileAttendance': () => {
                console.log('Mobile: Attempting to show attendance GPS...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile attendance');
                    return;
                }
                return this.contentManager.showAttendanceGPS();
            },
            
            // Work Tasks
            'openWorkTasks': () => {
                console.log('Attempting to show work tasks...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for work tasks');
                    return;
                }
                return this.contentManager.showWorkTasks();
            },
            'mobileWorkTasks': () => {
                console.log('Mobile: Attempting to show work tasks...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile work tasks');
                    return;
                }
                return this.contentManager.showWorkTasks();
            },
            
            // Request Management
            'openAttendanceRequest': () => {
                console.log('Attempting to show attendance request...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for attendance request');
                    return;
                }
                return this.contentManager.showAttendanceRequest();
            },
            'openTaskAssignment': () => {
                console.log('Attempting to show task assignment...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for task assignment');
                    return;
                }
                return this.contentManager.showTaskAssignment();
            },
            'openShiftAssignment': () => {
                console.log('Attempting to show shift assignment...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for shift assignment');
                    return;
                }
                return this.contentManager.showShiftAssignment();
            },
            'mobileAttendanceRequest': () => {
                console.log('Mobile: Attempting to show attendance request...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile attendance request');
                    return;
                }
                return this.contentManager.showAttendanceRequest();
            },
            'mobileTaskAssignment': () => {
                console.log('Mobile: Attempting to show task assignment...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile task assignment');
                    return;
                }
                return this.contentManager.showTaskAssignment();
            },
            'mobileShiftAssignment': () => {
                console.log('Mobile: Attempting to show shift assignment...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile shift assignment');
                    return;
                }
                return this.contentManager.showShiftAssignment();
            },
            
            // Analytics & Reports
            'openAnalytics': () => {
                console.log('Attempting to show analytics...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for analytics');
                    return;
                }
                return this.contentManager.showAnalytics();
            },
            'mobileAnalytics': () => {
                console.log('Mobile: Attempting to show analytics...');
                if (!this.contentManager) {
                    console.error('ContentManager not available for mobile analytics');
                    return;
                }
                return this.contentManager.showAnalytics();
            },
        };

        // Setup event listeners for all navigation items
        Object.entries(navigationMap).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                // Remove existing event listeners first
                element.removeEventListener('click', element._navHandler);
                
                // Add new handler
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`Navigation clicked: ${id}`);
                    
                    try {
                        // Close mobile nav if open
                        const mobileDialog = document.getElementById('mobile-nav-dialog');
                        if (mobileDialog && mobileDialog.open) {
                            mobileDialog.close();
                        }
                        
                        // Execute navigation with error handling
                        const result = handler();
                        if (result && typeof result.catch === 'function') {
                            result.catch(error => {
                                console.error(`Async navigation error for ${id}:`, error);
                                utils.showNotification(`Lỗi điều hướng: ${error.message}`, 'error');
                            });
                        }
                        
                        // Update active states
                        this.updateActiveStates(id);
                        
                        console.log(`Navigation completed successfully: ${id}`);
                    } catch (error) {
                        console.error(`Navigation error for ${id}:`, error);
                        utils.showNotification(`Lỗi điều hướng: ${error.message}`, 'error');
                        
                        // Try fallback if available
                        this.tryFallbackNavigation(id, error);
                    }
                };
                
                element.addEventListener('click', clickHandler);
                element._navHandler = clickHandler;
                
                console.log(`Navigation handler set for: ${id}`);
            } else {
                console.warn(`Navigation element not found: ${id}`);
            }
        });
        
        // Add special handlers for menu items that need content switching
        this.setupSpecialHandlers();
    }

    setupSpecialHandlers() {
        // Work Management submenu handler
        const workManagement = document.getElementById('openWorkManagement');
        if (workManagement) {
            workManagement.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Work Management clicked - showing submenu');
                // The submenu should open automatically via CSS/MenuManager
            });
        }

        // Submit Request submenu handler  
        const submitRequest = document.getElementById('openSubmitRequest');
        if (submitRequest) {
            submitRequest.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit Request clicked - showing submenu');
                // The submenu should open automatically via CSS/MenuManager
            });
        }

        // Dashboard home handler
        const dashboardHome = document.getElementById('openDashboard');
        if (dashboardHome) {
            dashboardHome.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Dashboard home clicked');
                this.contentManager.showDashboard();
            });
        }
    }

    updateActiveStates(activeId) {
        // Remove active class from all navigation items
        document.querySelectorAll('.menu-link, .submenu-link, .mobile-menu-link, .mobile-submenu-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current item
        const activeElement = document.getElementById(activeId);
        if (activeElement) {
            activeElement.classList.add('active');
        }
    }

    tryFallbackNavigation(id, originalError) {
        console.warn(`Attempting fallback navigation for ${id} due to error:`, originalError);
        
        // Map of fallback functions using global window references
        const fallbackMap = {
            'openWorkTasks': () => window.contentManager?.showWorkTasks(),
            'openAttendanceRequest': () => window.contentManager?.showAttendanceRequest(),
            'openShiftAssignment': () => window.contentManager?.showShiftAssignment(),
            'openTimesheet': () => window.contentManager?.showTimesheet(),
            'openAttendance': () => window.contentManager?.showAttendanceGPS(),
            'openTaskAssignment': () => window.contentManager?.showTaskAssignment(),
            'openAnalytics': () => window.contentManager?.showAnalytics(),
        };
        
        const fallbackHandler = fallbackMap[id];
        if (fallbackHandler) {
            try {
                console.log(`Executing fallback for ${id}...`);
                fallbackHandler();
                console.log(`Fallback navigation successful for ${id}`);
            } catch (fallbackError) {
                console.error(`Fallback navigation also failed for ${id}:`, fallbackError);
                utils.showNotification(`Không thể điều hướng đến ${id}`, 'error');
            }
        } else {
            console.warn(`No fallback available for ${id}`);
        }
    }

    createTestingInterface() {
        console.log('Creating navigation testing interface...');
        
        // Create testing button in the UI
        const testButton = document.createElement('button');
        testButton.id = 'navTestButton';
        testButton.innerHTML = '<span class="material-icons-round">bug_report</span> Test Navigation';
        testButton.className = 'btn btn-outline test-button';
        testButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: #dc3545;
            color: white;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 10px 15px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
            transition: all 0.3s ease;
        `;
        
        testButton.addEventListener('click', () => this.showTestingPanel());
        document.body.appendChild(testButton);
        
        // Make testing functions globally accessible
        window.testNavigation = () => this.testAllNavigationFunctions();
        window.showNavigationDebug = () => this.showTestingPanel();
    }

    showTestingPanel() {
        const panel = document.createElement('div');
        panel.id = 'navigationTestPanel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #ddd;
            border-radius: 12px;
            padding: 25px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; color: var(--text-primary); font-size: 18px;">🔧 Navigation Testing Panel</h3>
                <button onclick="document.getElementById('navigationTestPanel').remove()" 
                        style="background: var(--danger); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 10px;">📊 Test All Navigation Functions:</h4>
                <button onclick="window.testNavigation()" class="nav-test-btn primary" style="padding: 8px 16px;">🚀 Run Full Test</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 10px;">🧪 Individual Function Tests:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
                    <button onclick="window.contentManager?.showTimesheet()" class="nav-test-btn outline">⏰ Timesheet</button>
                    <button onclick="window.contentManager?.showAttendanceGPS()" class="nav-test-btn outline">📍 Attendance</button>
                    <button onclick="window.contentManager?.showWorkTasks()" class="nav-test-btn outline">📋 Work Tasks</button>
                    <button onclick="window.contentManager?.showAttendanceRequest()" class="nav-test-btn outline">📝 Requests</button>
                    <button onclick="window.contentManager?.showTaskAssignment()" class="nav-test-btn outline">📊 Task Assignment</button>
                    <button onclick="window.contentManager?.showShiftAssignment()" class="nav-test-btn outline">⏰ Shift Assignment</button>
                    <button onclick="window.contentManager?.showAnalytics()" class="nav-test-btn outline">📈 Analytics</button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 10px;">👥 Test User Functions:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
                    <button onclick="window.switchTestUser('ADMIN001')" class="user-test-btn admin">👑 Admin</button>
                    <button onclick="window.switchTestUser('AM001')" class="user-test-btn manager">⚡ Area Manager</button>
                    <button onclick="window.switchTestUser('QL001')" class="user-test-btn store">🎯 Store Manager</button>
                    <button onclick="window.switchTestUser('NV001')" class="user-test-btn employee">👤 Employee</button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 10px;">📱 Mobile Console Logs:</h4>
                <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; max-height: 200px; overflow-y: auto; background: var(--bg-secondary);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 12px; color: var(--text-secondary);">Real-time console logs (Mobile debugging)</span>
                        <button onclick="window.clearMobileLogs()" style="background: var(--text-secondary); color: var(--bg-card); border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;">Clear</button>
                    </div>
                    <div id="mobileLogsContainer" style="font-family: monospace; font-size: 11px; min-height: 100px; color: var(--text-primary);">
                        <div style="color: var(--success); margin-bottom: 4px;">
                            <span style="color: var(--text-secondary);">[${new Date().toLocaleTimeString()}]</span> Mobile console interceptor ready
                        </div>
                    </div>
                </div>
            </div>

            <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                <h4 style="color: var(--text-primary); margin-bottom: 10px;">📋 Quick Diagnostics:</h4>
                <div id="diagnosticResults" style="font-family: monospace; font-size: 12px; color: var(--text-secondary);">
                    Click "Run Full Test" to see results...
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Initialize mobile console logging within the panel
        this.initializeMobileConsoleLogging();
        
        // Create the test user switching function
        window.switchTestUser = (employeeId) => this.switchTestUser(employeeId);
    }

    async switchTestUser(employeeId) {
        try {
            console.log(`Switching to test user: ${employeeId}`);
            
            // Simulate user data based on test users
            const testUsers = {
                'ADMIN001': { employeeId: 'ADMIN001', fullName: 'Nguyễn System Admin', position: 'AD', storeName: 'HQ - Headquarters' },
                'AM001': { employeeId: 'AM001', fullName: 'Trần Quản Lý Vùng 1', position: 'AM', storeName: 'Khu vực 1 - TP.HCM' },
                'QL001': { employeeId: 'QL001', fullName: 'Hoàng Quản Lý Shop', position: 'QL', storeName: 'MayCha Quận 1' },
                'NV001': { employeeId: 'NV001', fullName: 'Nguyễn Nhân Viên 1', position: 'NV', storeName: 'MayCha Quận 1' }
            };
            
            const userData = testUsers[employeeId];
            if (userData) {
                // Store test user data
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, `test_token_${employeeId}`);
                
                // Update UI
                utils.showNotification(`Đã chuyển thành user: ${userData.fullName} (${userData.position})`, 'success');
                
                // Update menu visibility
                if (window.MenuManager) {
                    MenuManager.updateMenuByRole(userData.position);
                }
                
                console.log(`Successfully switched to test user: ${employeeId}`);
            } else {
                throw new Error(`Test user not found: ${employeeId}`);
            }
        } catch (error) {
            console.error('Error switching test user:', error);
            utils.showNotification(`Lỗi chuyển user: ${error.message}`, 'error');
        }
    }

    async testAllNavigationFunctions() {
        const results = document.getElementById('diagnosticResults');
        if (!results) return;
        
        results.innerHTML = 'Running navigation tests...\n';
        
        const tests = [
            { name: 'ContentManager Instance', test: () => !!window.contentManager },
            { name: 'showTimesheet Function', test: () => typeof window.contentManager?.showTimesheet === 'function' },
            { name: 'showWorkTasks Function', test: () => typeof window.contentManager?.showWorkTasks === 'function' },
            { name: 'showAttendanceGPS Function', test: () => typeof window.contentManager?.showAttendanceGPS === 'function' },
            { name: 'showAttendanceRequest Function', test: () => typeof window.contentManager?.showAttendanceRequest === 'function' },
            { name: 'showTaskAssignment Function', test: () => typeof window.contentManager?.showTaskAssignment === 'function' },
            { name: 'showShiftAssignment Function', test: () => typeof window.contentManager?.showShiftAssignment === 'function' },
            { name: 'Navigation Elements Present', test: () => {
                const elements = ['openTimesheet', 'openWorkTasks', 'openAttendance', 'openAttendanceRequest'];
                return elements.every(id => document.getElementById(id));
            }},
            { name: 'User Data Available', test: () => !!localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) },
            { name: 'Auth Token Available', test: () => !!localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) }
        ];
        
        let passed = 0;
        let total = tests.length;
        
        for (const test of tests) {
            try {
                const result = test.test();
                const status = result ? '✅ PASS' : '❌ FAIL';
                results.innerHTML += `${test.name}: ${status}\n`;
                if (result) passed++;
            } catch (error) {
                results.innerHTML += `${test.name}: ❌ ERROR - ${error.message}\n`;
            }
        }
        
        results.innerHTML += `\n📊 Test Results: ${passed}/${total} passed\n`;
        
        if (passed === total) {
            results.innerHTML += '\n🎉 All tests passed! Navigation should work correctly.';
        } else {
            results.innerHTML += '\n⚠️ Some tests failed. Check console for details.';
        }
    }

    initializeMobileConsoleLogging() {
        const logsContainer = document.getElementById('mobileLogsContainer');
        if (!logsContainer) return;

        // Store original console methods
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        // Override console methods to capture logs
        console.log = (...args) => {
            this.originalConsole.log.apply(console, args);
            try {
                this.addMobileLog(args.join(' '), 'debug');
            } catch (e) {
                // Prevent recursion issues
            }
        };

        console.error = (...args) => {
            this.originalConsole.error.apply(console, args);
            try {
                this.addMobileLog(args.join(' '), 'error');
            } catch (e) {
                // Prevent recursion issues
            }
        };

        console.warn = (...args) => {
            this.originalConsole.warn.apply(console, args);
            try {
                this.addMobileLog(args.join(' '), 'warn');
            } catch (e) {
                // Prevent recursion issues
            }
        };

        console.info = (...args) => {
            this.originalConsole.info.apply(console, args);
            try {
                this.addMobileLog(args.join(' '), 'info');
            } catch (e) {
                // Prevent recursion issues
            }
        };

        // Capture uncaught errors
        window.addEventListener('error', (event) => {
            this.addMobileLog(`Error: ${event.message} at ${event.filename}:${event.lineno}`, 'error');
        });

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.addMobileLog(`Unhandled Promise Rejection: ${event.reason}`, 'error');
        });

        // Create clear logs function
        window.clearMobileLogs = () => {
            if (logsContainer) {
                logsContainer.innerHTML = `
                    <div style="color: #28a745; margin-bottom: 4px;">
                        <span style="color: #666;">[${new Date().toLocaleTimeString()}]</span> Console cleared
                    </div>
                `;
            }
        };
    }

    addMobileLog(message, type = 'debug') {
        const logsContainer = document.getElementById('mobileLogsContainer');
        if (!logsContainer) return;

        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            error: '#dc3545',
            warn: '#ffc107',
            info: '#17a2b8', 
            debug: '#28a745'
        };

        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            margin-bottom: 4px;
            padding: 2px 4px;
            border-radius: 2px;
            background: ${type === 'error' ? 'rgba(220, 53, 69, 0.1)' : 'transparent'};
        `;
        
        logEntry.innerHTML = `
            <span style="color: #666; font-size: 10px;">[${timestamp}]</span>
            <span style="color: ${colors[type]}; font-weight: ${type === 'error' ? 'bold' : 'normal'};">
                ${this.escapeHtml(String(message))}
            </span>
        `;

        logsContainer.appendChild(logEntry);
        
        // Auto-scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
        
        // Limit log entries to prevent memory issues
        const entries = logsContainer.children;
        if (entries.length > 50) {
            logsContainer.removeChild(entries[0]);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in main-init.js
window.NavigationManager = NavigationManager;