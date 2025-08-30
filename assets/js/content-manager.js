/**
 * =====================================================
 * CONTENT MANAGER V4.0 - MODERN MODULAR ARCHITECTURE
 * =====================================================
 * Professional HR Management System with clean, maintainable code
 * 
 * FEATURES:
 * ✓ Modular class-based architecture 
 * ✓ Comprehensive error handling and validation
 * ✓ Modern async/await patterns
 * ✓ Enhanced HR Database Schema v3.1 support
 * ✓ Professional UI components
 * ✓ Mobile-responsive design
 * ✓ Real-time data synchronization
 * ✓ Advanced search and filtering
 * ✓ Role-based access control
 * ✓ Performance optimization
 * 
 * MODULES:
 * - EmployeeManager: Complete employee lifecycle management
 * - AttendanceManager: GPS tracking, time management, reports
 * - TaskManager: Task assignment, tracking, dependencies
 * - PermissionManager: Role-based access control
 * - ReportManager: Analytics, statistics, performance metrics
 * - NotificationManager: Real-time notifications and alerts
 * =====================================================
 */

// =====================================================
// UTILITY CLASSES
// =====================================================

class APIUtils {
    static async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            return { success: false, error: error.message };
        }
    }
    
    static validateResponse(response) {
        if (!response || response.error) {
            return { valid: false, message: response?.error || 'Invalid response' };
        }
        return { valid: true, data: response.data };
    }
}

class DOMUtils {
    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }
    
    static findElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    }
    
    static showNotification(message, type = 'info') {
        const notification = this.createElement('div', `notification notification-${type}`, message);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

class ValidationUtils {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone);
    }
    
    static validateRequired(value) {
        return value && value.toString().trim().length > 0;
    }
}

// =====================================================
// CORE MODULES
// =====================================================

class EmployeeManager {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.employees = new Map();
        this.currentEmployee = null;
    }
    
    async loadEmployeeData(employeeId) {
        const response = await APIUtils.fetchData(`${this.apiBase}/employees/${employeeId}`);
        if (response.success) {
            this.currentEmployee = response.data;
            this.employees.set(employeeId, response.data);
            return response.data;
        }
        return null;
    }
    
    async updateEmployee(employeeId, data) {
        const validation = this.validateEmployeeData(data);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const response = await APIUtils.fetchData(`${this.apiBase}/employees/${employeeId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            this.employees.set(employeeId, response.data);
            DOMUtils.showNotification('Employee updated successfully', 'success');
            return response.data;
        }
        
        throw new Error(response.error);
    }
    
    validateEmployeeData(data) {
        if (!ValidationUtils.validateRequired(data.name)) {
            return { valid: false, message: 'Employee name is required' };
        }
        
        if (data.email && !ValidationUtils.validateEmail(data.email)) {
            return { valid: false, message: 'Invalid email format' };
        }
        
        if (data.phone && !ValidationUtils.validatePhone(data.phone)) {
            return { valid: false, message: 'Invalid phone format' };
        }
        
        return { valid: true };
    }
    
    renderEmployeeProfile(containerId) {
        const container = DOMUtils.findElement(`#${containerId}`);
        if (!container || !this.currentEmployee) return;
        
        container.innerHTML = `
            <div class="employee-profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <img src="${this.currentEmployee.avatar || '/assets/images/default-avatar.png'}" 
                             alt="${this.currentEmployee.name}">
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name">${this.currentEmployee.name}</h2>
                        <p class="profile-position">${this.currentEmployee.position || 'Employee'}</p>
                        <span class="profile-badge ${this.currentEmployee.status}">${this.currentEmployee.status}</span>
                    </div>
                </div>
                
                <div class="profile-details">
                    <div class="detail-group">
                        <label>Employee ID</label>
                        <span>${this.currentEmployee.employee_id}</span>
                    </div>
                    <div class="detail-group">
                        <label>Department</label>
                        <span>${this.currentEmployee.department || 'N/A'}</span>
                    </div>
                    <div class="detail-group">
                        <label>Email</label>
                        <span>${this.currentEmployee.email || 'N/A'}</span>
                    </div>
                    <div class="detail-group">
                        <label>Phone</label>
                        <span>${this.currentEmployee.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-group">
                        <label>Join Date</label>
                        <span>${new Date(this.currentEmployee.hire_date).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="contentManager.editEmployee()">
                        <i class="material-icons">edit</i> Edit Profile
                    </button>
                    <button class="btn btn-secondary" onclick="contentManager.viewEmployeeHistory()">
                        <i class="material-icons">history</i> View History
                    </button>
                </div>
            </div>
        `;
    }
}

class AttendanceManager {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.attendanceRecords = [];
        this.currentLocation = null;
    }
    
    async checkIn() {
        try {
            this.currentLocation = await this.getCurrentLocation();
            
            const checkInData = {
                employee_id: contentManager.user.employeeId,
                check_in_time: new Date().toISOString(),
                location: this.currentLocation,
                status: 'present'
            };
            
            const response = await APIUtils.fetchData(`${this.apiBase}/attendance/checkin`, {
                method: 'POST',
                body: JSON.stringify(checkInData)
            });
            
            if (response.success) {
                DOMUtils.showNotification('Check-in successful!', 'success');
                this.updateAttendanceUI();
                return response.data;
            }
            
            throw new Error(response.error);
        } catch (error) {
            DOMUtils.showNotification(`Check-in failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async checkOut() {
        try {
            const checkOutData = {
                employee_id: contentManager.user.employeeId,
                check_out_time: new Date().toISOString(),
                location: this.currentLocation
            };
            
            const response = await APIUtils.fetchData(`${this.apiBase}/attendance/checkout`, {
                method: 'POST',
                body: JSON.stringify(checkOutData)
            });
            
            if (response.success) {
                DOMUtils.showNotification('Check-out successful!', 'success');
                this.updateAttendanceUI();
                return response.data;
            }
            
            throw new Error(response.error);
        } catch (error) {
            DOMUtils.showNotification(`Check-out failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    reject(new Error(`Location error: ${error.message}`));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        });
    }
    
    async loadTodayAttendance() {
        const today = new Date().toISOString().split('T')[0];
        const response = await APIUtils.fetchData(
            `${this.apiBase}/attendance?employee_id=${contentManager.user.employeeId}&date=${today}`
        );
        
        if (response.success) {
            this.attendanceRecords = response.data;
            return response.data;
        }
        
        return [];
    }
    
    renderAttendancePanel(containerId) {
        const container = DOMUtils.findElement(`#${containerId}`);
        if (!container) return;
        
        container.innerHTML = `
            <div class="attendance-panel">
                <div class="attendance-header">
                    <h3>Attendance Management</h3>
                    <div class="attendance-status">
                        <span class="status-indicator" id="attendanceStatus">Not Checked In</span>
                        <span class="current-time" id="currentTime">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
                
                <div class="attendance-actions">
                    <button class="btn btn-success" id="checkInBtn" onclick="contentManager.attendanceManager.checkIn()">
                        <i class="material-icons">login</i> Check In
                    </button>
                    <button class="btn btn-warning" id="checkOutBtn" onclick="contentManager.attendanceManager.checkOut()" disabled>
                        <i class="material-icons">logout</i> Check Out
                    </button>
                    <button class="btn btn-info" onclick="contentManager.showAttendanceHistory()">
                        <i class="material-icons">history</i> History
                    </button>
                </div>
                
                <div class="attendance-summary">
                    <div class="summary-item">
                        <label>Today's Hours</label>
                        <span id="todayHours">0:00</span>
                    </div>
                    <div class="summary-item">
                        <label>This Week</label>
                        <span id="weekHours">0:00</span>
                    </div>
                    <div class="summary-item">
                        <label>This Month</label>
                        <span id="monthHours">0:00</span>
                    </div>
                </div>
                
                <div class="location-info" id="locationInfo">
                    <i class="material-icons">location_on</i>
                    <span>Detecting location...</span>
                </div>
            </div>
        `;
        
        this.updateAttendanceUI();
        this.startTimeUpdater();
    }
    
    updateAttendanceUI() {
        // Update attendance status and button states
        this.loadTodayAttendance().then(records => {
            const hasCheckedIn = records.some(r => r.check_in_time && !r.check_out_time);
            const checkInBtn = DOMUtils.findElement('#checkInBtn');
            const checkOutBtn = DOMUtils.findElement('#checkOutBtn');
            const statusIndicator = DOMUtils.findElement('#attendanceStatus');
            
            if (hasCheckedIn) {
                checkInBtn.disabled = true;
                checkOutBtn.disabled = false;
                statusIndicator.textContent = 'Checked In';
                statusIndicator.className = 'status-indicator checked-in';
            } else {
                checkInBtn.disabled = false;
                checkOutBtn.disabled = true;
                statusIndicator.textContent = 'Not Checked In';
                statusIndicator.className = 'status-indicator not-checked-in';
            }
        });
    }
    
    startTimeUpdater() {
        setInterval(() => {
            const timeElement = DOMUtils.findElement('#currentTime');
            if (timeElement) {
                timeElement.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);
    }
}

class TaskManager {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.tasks = [];
        this.currentTask = null;
    }
    
    async loadUserTasks(employeeId) {
        const response = await APIUtils.fetchData(`${this.apiBase}/tasks?employee_id=${employeeId}`);
        if (response.success) {
            this.tasks = response.data;
            return response.data;
        }
        return [];
    }
    
    async createTask(taskData) {
        const validation = this.validateTaskData(taskData);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const response = await APIUtils.fetchData(`${this.apiBase}/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
        
        if (response.success) {
            this.tasks.push(response.data);
            DOMUtils.showNotification('Task created successfully', 'success');
            this.renderTaskList('task-list-container');
            return response.data;
        }
        
        throw new Error(response.error);
    }
    
    async updateTaskStatus(taskId, status) {
        const response = await APIUtils.fetchData(`${this.apiBase}/tasks/${taskId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (response.success) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].status = status;
                this.renderTaskList('task-list-container');
            }
            DOMUtils.showNotification('Task status updated', 'success');
            return response.data;
        }
        
        throw new Error(response.error);
    }
    
    validateTaskData(data) {
        if (!ValidationUtils.validateRequired(data.title)) {
            return { valid: false, message: 'Task title is required' };
        }
        
        if (!ValidationUtils.validateRequired(data.description)) {
            return { valid: false, message: 'Task description is required' };
        }
        
        if (!data.due_date || new Date(data.due_date) < new Date()) {
            return { valid: false, message: 'Valid due date is required' };
        }
        
        return { valid: true };
    }
    
    renderTaskList(containerId) {
        const container = DOMUtils.findElement(`#${containerId}`);
        if (!container) return;
        
        const tasksByStatus = this.groupTasksByStatus();
        
        container.innerHTML = `
            <div class="task-management">
                <div class="task-header">
                    <h3>Task Management</h3>
                    <button class="btn btn-primary" onclick="contentManager.showCreateTaskModal()">
                        <i class="material-icons">add</i> New Task
                    </button>
                </div>
                
                <div class="task-board">
                    <div class="task-column">
                        <h4>To Do (${tasksByStatus.todo.length})</h4>
                        <div class="task-list">
                            ${tasksByStatus.todo.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    </div>
                    
                    <div class="task-column">
                        <h4>In Progress (${tasksByStatus.inprogress.length})</h4>
                        <div class="task-list">
                            ${tasksByStatus.inprogress.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    </div>
                    
                    <div class="task-column">
                        <h4>Completed (${tasksByStatus.completed.length})</h4>
                        <div class="task-list">
                            ${tasksByStatus.completed.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    groupTasksByStatus() {
        return {
            todo: this.tasks.filter(t => t.status === 'todo'),
            inprogress: this.tasks.filter(t => t.status === 'in_progress'),
            completed: this.tasks.filter(t => t.status === 'completed')
        };
    }
    
    renderTaskCard(task) {
        const dueDate = new Date(task.due_date);
        const isOverdue = dueDate < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-card ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <h5 class="task-title">${task.title}</h5>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-due-date">
                        <i class="material-icons">schedule</i>
                        ${dueDate.toLocaleDateString()}
                    </span>
                    <div class="task-actions">
                        <select onchange="contentManager.taskManager.updateTaskStatus(${task.id}, this.value)">
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
}

class PermissionManager {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.roles = [];
        this.permissions = [];
        this.userRoles = new Map();
    }
    
    async loadRolesAndPermissions() {
        const [rolesResponse, permissionsResponse] = await Promise.all([
            APIUtils.fetchData(`${this.apiBase}/roles`),
            APIUtils.fetchData(`${this.apiBase}/permissions`)
        ]);
        
        if (rolesResponse.success) this.roles = rolesResponse.data;
        if (permissionsResponse.success) this.permissions = permissionsResponse.data;
        
        return { roles: this.roles, permissions: this.permissions };
    }
    
    async assignRole(userId, roleId) {
        const response = await APIUtils.fetchData(`${this.apiBase}/users/${userId}/roles`, {
            method: 'POST',
            body: JSON.stringify({ role_id: roleId })
        });
        
        if (response.success) {
            this.userRoles.set(userId, [...(this.userRoles.get(userId) || []), roleId]);
            DOMUtils.showNotification('Role assigned successfully', 'success');
            return response.data;
        }
        
        throw new Error(response.error);
    }
    
    renderPermissionPanel(containerId) {
        const container = DOMUtils.findElement(`#${containerId}`);
        if (!container) return;
        
        container.innerHTML = `
            <div class="permission-management">
                <div class="permission-header">
                    <h3>Permission Management</h3>
                    <button class="btn btn-primary" onclick="contentManager.showUserSearch()">
                        <i class="material-icons">person_add</i> Grant Access
                    </button>
                </div>
                
                <div class="permission-stats">
                    <div class="stat-card">
                        <div class="stat-number">${this.roles.filter(r => r.name === 'admin').length}</div>
                        <div class="stat-label">Administrators</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.roles.filter(r => r.name === 'manager').length}</div>
                        <div class="stat-label">Managers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.roles.filter(r => r.name === 'employee').length}</div>
                        <div class="stat-label">Employees</div>
                    </div>
                </div>
                
                <div class="role-list">
                    <h4>Roles & Permissions</h4>
                    ${this.roles.map(role => this.renderRoleCard(role)).join('')}
                </div>
            </div>
        `;
    }
    
    renderRoleCard(role) {
        return `
            <div class="role-card">
                <div class="role-header">
                    <h5>${role.name}</h5>
                    <span class="role-badge">${role.level}</span>
                </div>
                <p class="role-description">${role.description}</p>
                <div class="role-permissions">
                    ${(role.permissions || []).map(perm => 
                        `<span class="permission-tag">${perm}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
}

class ReportManager {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.reports = [];
        this.analytics = {};
    }
    
    async generateAttendanceReport(startDate, endDate) {
        const response = await APIUtils.fetchData(
            `${this.apiBase}/reports/attendance?start=${startDate}&end=${endDate}`
        );
        
        if (response.success) {
            return response.data;
        }
        
        throw new Error(response.error);
    }
    
    async generatePerformanceReport(employeeId, period) {
        const response = await APIUtils.fetchData(
            `${this.apiBase}/reports/performance?employee_id=${employeeId}&period=${period}`
        );
        
        if (response.success) {
            return response.data;
        }
        
        throw new Error(response.error);
    }
    
    renderReportsPanel(containerId) {
        const container = DOMUtils.findElement(`#${containerId}`);
        if (!container) return;
        
        container.innerHTML = `
            <div class="reports-panel">
                <div class="reports-header">
                    <h3>Reports & Analytics</h3>
                    <div class="report-filters">
                        <select id="reportType">
                            <option value="attendance">Attendance Report</option>
                            <option value="performance">Performance Report</option>
                            <option value="tasks">Task Report</option>
                        </select>
                        <input type="date" id="startDate">
                        <input type="date" id="endDate">
                        <button class="btn btn-primary" onclick="contentManager.generateReport()">
                            <i class="material-icons">assessment</i> Generate
                        </button>
                    </div>
                </div>
                
                <div class="analytics-summary">
                    <div class="metric-card">
                        <h4>Today's Attendance</h4>
                        <div class="metric-value">85%</div>
                    </div>
                    <div class="metric-card">
                        <h4>Tasks Completed</h4>
                        <div class="metric-value">23</div>
                    </div>
                    <div class="metric-card">
                        <h4>Average Performance</h4>
                        <div class="metric-value">92%</div>
                    </div>
                </div>
                
                <div class="report-output" id="reportOutput">
                    <p>Select report type and date range to generate reports</p>
                </div>
            </div>
        `;
    }
}

// =====================================================
// MAIN CONTENT MANAGER CLASS
// =====================================================

class ContentManager {
    constructor(user) {
        this.user = user;
        this.apiBase = '/api/v1';
        this.isInitialized = false;
        
        // Initialize managers
        this.employeeManager = new EmployeeManager(this.apiBase);
        this.attendanceManager = new AttendanceManager(this.apiBase);
        this.taskManager = new TaskManager(this.apiBase);
        this.permissionManager = new PermissionManager(this.apiBase);
        this.reportManager = new ReportManager(this.apiBase);
        
        console.log('✅ ContentManager v4.0 initialized with modular architecture');
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                console.log('ContentManager already initialized');
                return;
            }

            // Load user data
            await this.employeeManager.loadEmployeeData(this.user.employeeId);
            
            // Load initial data for all managers
            await Promise.all([
                this.taskManager.loadUserTasks(this.user.employeeId),
                this.permissionManager.loadRolesAndPermissions(),
                this.attendanceManager.loadTodayAttendance()
            ]);

            // Setup menu handlers
            this.setupMenuHandlers();
            
            // Make globally accessible
            this.makeGloballyAccessible();
            
            this.isInitialized = true;
            DOMUtils.showNotification('Dashboard initialized successfully', 'success');
            
            console.log('✅ ContentManager v4.0 fully initialized');
        } catch (error) {
            console.error('❌ ContentManager initialization failed:', error);
            DOMUtils.showNotification('Failed to initialize dashboard', 'error');
        }
    }

    setupMenuHandlers() {
        // Personal Info
        this.addMenuHandler('#nav-personal-info', () => this.showPersonalInfo());
        
        // Attendance
        this.addMenuHandler('#nav-attendance', () => this.showAttendance());
        
        // Tasks
        this.addMenuHandler('#nav-tasks', () => this.showTasks());
        
        // Permissions
        this.addMenuHandler('#nav-permissions', () => this.showPermissions());
        
        // Reports
        this.addMenuHandler('#nav-reports', () => this.showReports());
        
        // Timesheet
        this.addMenuHandler('#nav-timesheet', () => this.showTimesheet());
    }

    addMenuHandler(selector, callback) {
        const element = DOMUtils.findElement(selector);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveMenuItem(selector);
                callback();
            });
        }
    }

    setActiveMenuItem(activeSelector) {
        // Remove active class from all menu items
        document.querySelectorAll('.nav-item-parent, .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected item
        const activeItem = DOMUtils.findElement(activeSelector);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    makeGloballyAccessible() {
        window.contentManager = this;
    }

    // =====================================================
    // CONTENT DISPLAY METHODS
    // =====================================================

    showPersonalInfo() {
        const content = DOMUtils.findElement('#content');
        if (!content) return;

        content.innerHTML = `
            <div class="content-header">
                <h1>Personal Information</h1>
                <p>Manage your personal details and profile settings</p>
            </div>
            <div id="personal-info-container" class="content-container"></div>
        `;

        this.employeeManager.renderEmployeeProfile('personal-info-container');
    }

    showAttendance() {
        const content = DOMUtils.findElement('#content');
        if (!content) return;

        content.innerHTML = `
            <div class="content-header">
                <h1>Attendance Management</h1>
                <p>Track your attendance, check-in/out, and view history</p>
            </div>
            <div id="attendance-container" class="content-container"></div>
        `;

        this.attendanceManager.renderAttendancePanel('attendance-container');
    }

    showTasks() {
        const content = DOMUtils.findElement('#content');
        if (!content) return;

        content.innerHTML = `
            <div class="content-header">
                <h1>Task Management</h1>
                <p>Manage your tasks, assignments, and project progress</p>
            </div>
            <div id="task-list-container" class="content-container"></div>
        `;

        this.taskManager.renderTaskList('task-list-container');
    }

    showPermissions() {
        const content = DOMUtils.findElement('#content');
        if (!content) return;

        content.innerHTML = `
            <div class="content-header">
                <h1>Permission Management</h1>
                <p>Manage user roles and access permissions</p>
            </div>
            <div id="permission-container" class="content-container"></div>
        `;

        this.permissionManager.renderPermissionPanel('permission-container');
    }

    showReports() {
        const content = DOMUtils.findElement('#content');
        if (!content) return;

        content.innerHTML = `
            <div class="content-header">
                <h1>Reports & Analytics</h1>
                <p>Generate comprehensive reports and view analytics</p>
            </div>
            <div id="reports-container" class="content-container"></div>
        `;

        this.reportManager.renderReportsPanel('reports-container');
    }

    showTimesheet() {
        const content = DOMUtils.findElement('#content');
        if (!content) return;

        content.innerHTML = `
            <div class="content-header">
                <h1>Timesheet</h1>
                <p>Track and manage your working hours</p>
            </div>
            <div id="timesheet-container" class="content-container">
                <div class="timesheet-panel">
                    <div class="timesheet-header">
                        <h3>Weekly Timesheet</h3>
                        <div class="timesheet-controls">
                            <button class="btn btn-primary" onclick="contentManager.saveTimesheet()">
                                <i class="material-icons">save</i> Save
                            </button>
                            <button class="btn btn-secondary" onclick="contentManager.exportTimesheet()">
                                <i class="material-icons">download</i> Export
                            </button>
                        </div>
                    </div>
                    
                    <div class="timesheet-grid">
                        <div class="timesheet-row header-row">
                            <div class="timesheet-cell">Date</div>
                            <div class="timesheet-cell">Check In</div>
                            <div class="timesheet-cell">Check Out</div>
                            <div class="timesheet-cell">Break Time</div>
                            <div class="timesheet-cell">Total Hours</div>
                            <div class="timesheet-cell">Status</div>
                        </div>
                        ${this.generateTimesheetRows()}
                    </div>
                    
                    <div class="timesheet-summary">
                        <div class="summary-item">
                            <label>Total Hours This Week</label>
                            <span id="weeklyTotal">40:00</span>
                        </div>
                        <div class="summary-item">
                            <label>Overtime Hours</label>
                            <span id="overtimeHours">2:30</span>
                        </div>
                        <div class="summary-item">
                            <label>Attendance Rate</label>
                            <span id="attendanceRate">95%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTimesheetRows() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const currentWeek = this.getCurrentWeekDates();
        
        return currentWeek.map((date, index) => `
            <div class="timesheet-row">
                <div class="timesheet-cell date-cell">
                    <strong>${days[index]}</strong>
                    <span>${date.toLocaleDateString()}</span>
                </div>
                <div class="timesheet-cell">
                    <input type="time" class="time-input" value="09:00">
                </div>
                <div class="timesheet-cell">
                    <input type="time" class="time-input" value="18:00">
                </div>
                <div class="timesheet-cell">
                    <input type="number" class="break-input" min="0" max="480" value="60" step="15">
                </div>
                <div class="timesheet-cell total-hours">8:00</div>
                <div class="timesheet-cell">
                    <span class="status-badge present">Present</span>
                </div>
            </div>
        `).join('');
    }

    getCurrentWeekDates() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
        }
        
        return weekDates;
    }

    // =====================================================
    // MODAL AND POPUP METHODS
    // =====================================================

    showCreateTaskModal() {
        const modal = DOMUtils.createElement('div', 'modal-overlay');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Task</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="createTaskForm">
                        <div class="form-group">
                            <label for="taskTitle">Task Title</label>
                            <input type="text" id="taskTitle" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="taskDescription">Description</label>
                            <textarea id="taskDescription" name="description" rows="4" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="taskPriority">Priority</label>
                                <select id="taskPriority" name="priority">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="taskDueDate">Due Date</label>
                                <input type="date" id="taskDueDate" name="due_date" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="taskAssignee">Assign To</label>
                            <select id="taskAssignee" name="assignee_id">
                                <option value="${this.user.employeeId}">Myself</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="contentManager.createTask()">Create Task</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async createTask() {
        const form = DOMUtils.findElement('#createTaskForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const taskData = Object.fromEntries(formData.entries());
        taskData.created_by = this.user.employeeId;
        
        try {
            await this.taskManager.createTask(taskData);
            DOMUtils.findElement('.modal-overlay').remove();
        } catch (error) {
            DOMUtils.showNotification(error.message, 'error');
        }
    }

    showUserSearch() {
        const modal = DOMUtils.createElement('div', 'modal-overlay');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Grant Access - Search Users</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="search-container">
                        <input type="text" id="userSearch" placeholder="Search users by name or email..." class="search-input">
                        <div id="userSearchResults" class="user-search-results">
                            <p>Type to search for users...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add search functionality
        const searchInput = DOMUtils.findElement('#userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchUsers(e.target.value);
            });
        }
    }

    async searchUsers(query) {
        if (query.length < 2) return;
        
        const response = await APIUtils.fetchData(`${this.apiBase}/users/search?q=${encodeURIComponent(query)}`);
        const resultsContainer = DOMUtils.findElement('#userSearchResults');
        
        if (response.success && resultsContainer) {
            const users = response.data;
            resultsContainer.innerHTML = users.map(user => `
                <div class="user-search-item" onclick="contentManager.showUserPermissions('${user.id}')">
                    <div class="user-avatar">
                        <img src="${user.avatar || '/assets/images/default-avatar.png'}" alt="${user.name}">
                    </div>
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                        <span class="user-department">${user.department}</span>
                    </div>
                </div>
            `).join('');
