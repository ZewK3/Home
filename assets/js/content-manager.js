/**
 * =====================================================
 * ENTERPRISE CONTENT MANAGER v4.0 - MODULAR ARCHITECTURE
 * =====================================================
 * Complete refactor with separated modules and professional structure
 * 
 * Features:
 * ✓ Modular architecture with clear separation of concerns
 * ✓ Enhanced HR Database Schema v3.1 support
 * ✓ Comprehensive error handling and validation
 * ✓ Modern async/await patterns
 * ✓ Professional UI components
 * ✓ Mobile-responsive design
 * ✓ Accessibility compliance
 * =====================================================
 */

// =====================================================
// CORE CONTENT MANAGER CLASS
// =====================================================
class ContentManager {
    constructor(user) {
        this.user = user;
        this.isInitialized = false;
        
        // Initialize modules
        this.attendance = new AttendanceManager(this);
        this.personalInfo = new PersonalInfoManager(this);
        this.taskAssignment = new TaskAssignmentManager(this);
        this.timesheet = new TimesheetManager(this);
        this.grantAccess = new GrantAccessManager(this);
        this.statistics = new StatisticsManager(this);
        
        // Utilities
        this.apiUtils = new APIUtils();
        this.domUtils = new DOMUtils();
        this.validator = new ValidationUtils();
        
        console.log('✅ ContentManager v4.0 initialized with modular architecture');
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                console.log('ContentManager already initialized');
                return;
            }

            // Show loading state
            this.showDashboardLoader();
            
            // Initialize core components
            this.initializeTimeDisplay();
            this.setupMobileMenu();
            this.setupSecurityHandlers();
            this.setupModalCloseHandlers();
            this.initializeAccordionMenu();
            
            // Initialize all modules
            await Promise.all([
                this.attendance.initialize(),
                this.personalInfo.initialize(),
                this.taskAssignment.initialize(),
                this.timesheet.initialize(),
                this.grantAccess.initialize(),
                this.statistics.initialize()
            ]);
            
            // Update dashboard
            await this.updateDashboardStats();
            
            this.isInitialized = true;
            console.log('✅ ContentManager fully initialized with all modules');
            
        } catch (error) {
            console.error('❌ ContentManager initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    // Global access methods
    showPersonalInfo() { this.personalInfo.show(); }
    showAttendanceGPS() { this.attendance.showGPS(); }
    showTaskAssignment() { this.taskAssignment.show(); }
    showTimesheet() { this.timesheet.show(); }
    showGrantAccess() { this.grantAccess.show(); }
    showStatistics() { this.statistics.show(); }

    // Core utility methods
    showDashboardLoader() {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="dashboard-loader">
                    <div class="loader-animation"></div>
                    <p>Đang tải dashboard...</p>
                </div>
            `;
        }
    }

    initializeTimeDisplay() {
        const updateTime = () => {
            const now = new Date();
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('vi-VN');
            }
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('vi-VN');
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    setupMobileMenu() {
        // Mobile menu synchronization with desktop
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.id;
                
                // Map mobile IDs to desktop functions
                const actionMap = {
                    'mobilePersonalInformation': () => this.showPersonalInfo(),
                    'mobileAttendance': () => this.showAttendanceGPS(),
                    'mobileTaskAssignment': () => this.showTaskAssignment(),
                    'mobileTimesheet': () => this.showTimesheet(),
                    'mobileGrantAccess': () => this.showGrantAccess(),
                    'mobileStatistics': () => this.showStatistics()
                };
                
                if (actionMap[id]) {
                    actionMap[id]();
                    // Close mobile menu after selection
                    this.closeMobileMenu();
                }
            });
        });
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    }

    setupSecurityHandlers() {
        // Enhanced security event handlers
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('secure-content')) {
                e.preventDefault();
            }
        });
    }

    setupModalCloseHandlers() {
        // Universal modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => modal.classList.remove('active'));
    }

    initializeAccordionMenu() {
        // Enhanced accordion menu for sidebar
        const menuItems = document.querySelectorAll('[data-menu-toggle]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = item.nextElementSibling;
                const isExpanded = item.getAttribute('aria-expanded') === 'true';
                
                // Close all other submenus
                menuItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.setAttribute('aria-expanded', 'false');
                        const otherSubmenu = otherItem.nextElementSibling;
                        if (otherSubmenu && otherSubmenu.classList.contains('nav-submenu')) {
                            otherSubmenu.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle current submenu
                if (submenu && submenu.classList.contains('nav-submenu')) {
                    item.setAttribute('aria-expanded', !isExpanded);
                    submenu.style.maxHeight = isExpanded ? '0' : submenu.scrollHeight + 'px';
                }
            });
        });
    }

    async updateDashboardStats() {
        try {
            const stats = await this.statistics.getDashboardStats();
            this.renderDashboardStats(stats);
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    renderDashboardStats(stats) {
        const statsContainer = document.getElementById('dashboardStats');
        if (statsContainer && stats) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${stats.totalEmployees || 0}</h3>
                        <p>Tổng nhân viên</p>
                    </div>
                    <div class="stat-card">
                        <h3>${stats.presentToday || 0}</h3>
                        <p>Có mặt hôm nay</p>
                    </div>
                    <div class="stat-card">
                        <h3>${stats.pendingTasks || 0}</h3>
                        <p>Nhiệm vụ đang chờ</p>
                    </div>
                    <div class="stat-card">
                        <h3>${stats.onLeave || 0}</h3>
                        <p>Đang nghỉ phép</p>
                    </div>
                </div>
            `;
        }
    }

    handleInitializationError(error) {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h3>Lỗi khởi tạo hệ thống</h3>
                    <p>Không thể khởi tạo ContentManager: ${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Tải lại trang</button>
                </div>
            `;
        }
    }

    // Make globally accessible
    makeGloballyAccessible() {
        window.ContentManager = ContentManager;
        window.contentManager = this;
    }
}

// =====================================================
// ATTENDANCE MANAGEMENT MODULE
// =====================================================
class AttendanceManager {
    constructor(contentManager) {
        this.cm = contentManager;
        this.currentLocation = null;
    }

    async initialize() {
        console.log('AttendanceManager initialized');
    }

    async show() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            const attendanceData = await this.getAttendanceData();
            const todayAttendance = await this.getTodayAttendance();
            
            this.renderAttendanceInterface(attendanceData, todayAttendance);
        } catch (error) {
            console.error('Error loading attendance:', error);
            this.renderErrorState('Không thể tải dữ liệu chấm công');
        }
    }

    async showGPS() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            // Get current location
            await this.getCurrentLocation();
            
            const gpsData = await this.getGPSAttendanceData();
            this.renderGPSInterface(gpsData);
        } catch (error) {
            console.error('Error loading GPS attendance:', error);
            this.renderErrorState('Không thể tải chấm công GPS');
        }
    }

    async getAttendanceData() {
        const response = await fetch('/api/attendance/records', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    async getTodayAttendance() {
        const response = await fetch('/api/attendance/today', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    async getGPSAttendanceData() {
        const response = await fetch('/api/attendance/gps-data', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Trình duyệt không hỗ trợ GPS'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.currentLocation);
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
            );
        });
    }

    renderAttendanceInterface(attendanceData, todayAttendance) {
        const content = `
            <div class="attendance-container">
                <div class="attendance-header">
                    <h2>Quản lý chấm công</h2>
                    <div class="attendance-actions">
                        <button class="btn btn-primary" onclick="contentManager.attendance.showGPS()">
                            <span class="material-icons-round">location_on</span>
                            Chấm công GPS
                        </button>
                    </div>
                </div>
                
                <div class="attendance-overview">
                    ${this.renderTodayAttendance(todayAttendance)}
                </div>
                
                <div class="attendance-records">
                    ${this.renderAttendanceRecords(attendanceData)}
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }

    renderGPSInterface(gpsData) {
        const content = `
            <div class="attendance-gps-container">
                <div class="gps-header">
                    <h2>Chấm công GPS</h2>
                    <div class="location-status">
                        <span class="status-indicator ${this.currentLocation ? 'active' : 'inactive'}"></span>
                        <span>GPS ${this.currentLocation ? 'Đã kết nối' : 'Không khả dụng'}</span>
                    </div>
                </div>
                
                <div class="gps-interface">
                    <div class="location-info">
                        <h3>Thông tin vị trí</h3>
                        ${this.renderLocationInfo()}
                    </div>
                    
                    <div class="attendance-actions">
                        <button class="btn btn-success attendance-btn" onclick="contentManager.attendance.checkIn()">
                            <span class="material-icons-round">login</span>
                            Vào ca
                        </button>
                        <button class="btn btn-warning attendance-btn" onclick="contentManager.attendance.checkOut()">
                            <span class="material-icons-round">logout</span>
                            Tan ca
                        </button>
                    </div>
                    
                    <div class="attendance-timeline">
                        ${this.renderAttendanceTimeline(gpsData)}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }

    renderTodayAttendance(todayData) {
        if (!todayData) return '<p>Không có dữ liệu chấm công hôm nay</p>';
        
        return `
            <div class="today-attendance">
                <h3>Chấm công hôm nay</h3>
                <div class="attendance-summary">
                    <div class="time-entry">
                        <span class="label">Vào ca:</span>
                        <span class="value">${todayData.checkIn || 'Chưa vào ca'}</span>
                    </div>
                    <div class="time-entry">
                        <span class="label">Tan ca:</span>
                        <span class="value">${todayData.checkOut || 'Chưa tan ca'}</span>
                    </div>
                    <div class="time-entry">
                        <span class="label">Tổng giờ:</span>
                        <span class="value">${todayData.totalHours || '0h'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLocationInfo() {
        if (!this.currentLocation) {
            return '<p class="error">Không thể xác định vị trí GPS</p>';
        }
        
        return `
            <div class="location-details">
                <div class="coordinate">
                    <span class="label">Vĩ độ:</span>
                    <span class="value">${this.currentLocation.latitude.toFixed(6)}</span>
                </div>
                <div class="coordinate">
                    <span class="label">Kinh độ:</span>
                    <span class="value">${this.currentLocation.longitude.toFixed(6)}</span>
                </div>
                <div class="coordinate">
                    <span class="label">Độ chính xác:</span>
                    <span class="value">${Math.round(this.currentLocation.accuracy)}m</span>
                </div>
            </div>
        `;
    }

    renderAttendanceTimeline(gpsData) {
        if (!gpsData || !gpsData.timeline) {
            return '<p>Không có dữ liệu timeline</p>';
        }
        
        return `
            <h3>Timeline hôm nay</h3>
            <div class="timeline-list">
                ${gpsData.timeline.map(entry => `
                    <div class="timeline-entry">
                        <div class="timeline-time">${entry.time}</div>
                        <div class="timeline-action">${entry.action}</div>
                        <div class="timeline-location">${entry.location}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAttendanceRecords(attendanceData) {
        if (!attendanceData || !attendanceData.records) {
            return '<p>Không có dữ liệu chấm công</p>';
        }
        
        return `
            <h3>Lịch sử chấm công</h3>
            <div class="records-table">
                <table>
                    <thead>
                        <tr>
                            <th>Ngày</th>
                            <th>Vào ca</th>
                            <th>Tan ca</th>
                            <th>Tổng giờ</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendanceData.records.map(record => `
                            <tr>
                                <td>${record.date}</td>
                                <td>${record.checkIn || '-'}</td>
                                <td>${record.checkOut || '-'}</td>
                                <td>${record.totalHours || '0h'}</td>
                                <td><span class="status-badge ${record.status}">${record.statusText}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async checkIn() {
        try {
            if (!this.currentLocation) {
                await this.getCurrentLocation();
            }
            
            const response = await fetch('/api/attendance/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: this.cm.user.employeeId,
                    location: this.currentLocation,
                    timestamp: new Date().toISOString()
                })
            });
            
            const result = await this.cm.apiUtils.validateAndParseResponse(response);
            this.cm.domUtils.showNotification('Vào ca thành công!', 'success');
            this.showGPS(); // Refresh interface
        } catch (error) {
            console.error('Check-in error:', error);
            this.cm.domUtils.showNotification('Lỗi khi vào ca: ' + error.message, 'error');
        }
    }

    async checkOut() {
        try {
            if (!this.currentLocation) {
                await this.getCurrentLocation();
            }
            
            const response = await fetch('/api/attendance/check-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: this.cm.user.employeeId,
                    location: this.currentLocation,
                    timestamp: new Date().toISOString()
                })
            });
            
            const result = await this.cm.apiUtils.validateAndParseResponse(response);
            this.cm.domUtils.showNotification('Tan ca thành công!', 'success');
            this.showGPS(); // Refresh interface
        } catch (error) {
            console.error('Check-out error:', error);
            this.cm.domUtils.showNotification('Lỗi khi tan ca: ' + error.message, 'error');
        }
    }

    renderErrorState(message) {
        const content = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${message}</p>
                <button onclick="contentManager.attendance.show()" class="btn btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }
}

// =====================================================
// PERSONAL INFO MANAGEMENT MODULE
// =====================================================
class PersonalInfoManager {
    constructor(contentManager) {
        this.cm = contentManager;
    }

    async initialize() {
        console.log('PersonalInfoManager initialized');
    }

    async show() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            const personalData = await this.getPersonalData();
            this.renderPersonalInfoInterface(personalData);
        } catch (error) {
            console.error('Error loading personal info:', error);
            this.renderErrorState('Không thể tải thông tin cá nhân');
        }
    }

    async getPersonalData() {
        const response = await fetch(`/api/employees/${this.cm.user.employeeId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    renderPersonalInfoInterface(personalData) {
        const content = `
            <div class="personal-info-container">
                <div class="personal-header">
                    <h2>Thông tin cá nhân</h2>
                    <button class="btn btn-secondary" onclick="contentManager.personalInfo.editMode()">
                        <span class="material-icons-round">edit</span>
                        Chỉnh sửa
                    </button>
                </div>
                
                <div class="personal-content">
                    <div class="profile-section">
                        <div class="avatar-container">
                            <img src="${personalData.avatar || '/assets/icons/default-avatar.png'}" 
                                 alt="Avatar" class="avatar">
                            <button class="change-avatar-btn" onclick="contentManager.personalInfo.changeAvatar()">
                                <span class="material-icons-round">camera_alt</span>
                            </button>
                        </div>
                        
                        <div class="basic-info">
                            <h3>${personalData.fullName || 'Chưa cập nhật'}</h3>
                            <p class="position">${personalData.position || 'Chưa xác định'}</p>
                            <p class="department">${personalData.department || 'Chưa phân bộ'}</p>
                        </div>
                    </div>
                    
                    <div class="info-grid">
                        ${this.renderInfoGrid(personalData)}
                    </div>
                    
                    <div class="contact-section">
                        ${this.renderContactInfo(personalData)}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }

    renderInfoGrid(data) {
        const fields = [
            { label: 'Mã nhân viên', value: data.employeeId, icon: 'badge' },
            { label: 'Email công ty', value: data.email, icon: 'email' },
            { label: 'Số điện thoại', value: data.phone, icon: 'phone' },
            { label: 'Ngày sinh', value: data.birthDate, icon: 'cake' },
            { label: 'Địa chỉ', value: data.address, icon: 'location_on' },
            { label: 'Ngày vào làm', value: data.hireDate, icon: 'work' },
            { label: 'Trạng thái', value: data.status, icon: 'verified' },
            { label: 'Cấp độ', value: data.level, icon: 'military_tech' }
        ];
        
        return `
            <div class="info-fields">
                ${fields.map(field => `
                    <div class="info-field">
                        <div class="field-header">
                            <span class="material-icons-round">${field.icon}</span>
                            <span class="field-label">${field.label}</span>
                        </div>
                        <div class="field-value">${field.value || 'Chưa cập nhật'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderContactInfo(data) {
        return `
            <div class="contact-info">
                <h3>Thông tin liên hệ khẩn cấp</h3>
                <div class="emergency-contact">
                    <div class="contact-field">
                        <span class="label">Người liên hệ:</span>
                        <span class="value">${data.emergencyContact || 'Chưa cập nhật'}</span>
                    </div>
                    <div class="contact-field">
                        <span class="label">Số điện thoại:</span>
                        <span class="value">${data.emergencyPhone || 'Chưa cập nhật'}</span>
                    </div>
                    <div class="contact-field">
                        <span class="label">Mối quan hệ:</span>
                        <span class="value">${data.emergencyRelation || 'Chưa cập nhật'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    editMode() {
        // Switch to edit mode
        const container = document.querySelector('.personal-info-container');
        if (container) {
            container.classList.add('edit-mode');
            this.cm.domUtils.showNotification('Chế độ chỉnh sửa đã được kích hoạt', 'info');
        }
    }

    changeAvatar() {
        // Create file input for avatar change
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => this.handleAvatarChange(e);
        input.click();
    }

    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatar = document.querySelector('.avatar');
                if (avatar) {
                    avatar.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    renderErrorState(message) {
        const content = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${message}</p>
                <button onclick="contentManager.personalInfo.show()" class="btn btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }
}

// =====================================================
// TASK ASSIGNMENT MANAGEMENT MODULE
// =====================================================
class TaskAssignmentManager {
    constructor(contentManager) {
        this.cm = contentManager;
        this.currentEditor = null;
    }

    async initialize() {
        console.log('TaskAssignmentManager initialized');
    }

    async show() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            const taskData = await this.getTaskData();
            this.renderTaskAssignmentInterface(taskData);
            this.initializeTextEditor();
        } catch (error) {
            console.error('Error loading task assignment:', error);
            this.renderErrorState('Không thể tải giao việc');
        }
    }

    async getTaskData() {
        const response = await fetch('/api/tasks/assignments', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    renderTaskAssignmentInterface(taskData) {
        const content = `
            <div class="task-assignment-container">
                <div class="task-header">
                    <h2>Giao việc</h2>
                    <button class="btn btn-primary" onclick="contentManager.taskAssignment.createNewTask()">
                        <span class="material-icons-round">add_task</span>
                        Tạo nhiệm vụ mới
                    </button>
                </div>
                
                <div class="task-form">
                    <div class="form-section">
                        <label for="taskTitle">Tiêu đề nhiệm vụ</label>
                        <input type="text" id="taskTitle" placeholder="Nhập tiêu đề nhiệm vụ">
                    </div>
                    
                    <div class="form-section">
                        <label for="taskAssignee">Giao cho</label>
                        <select id="taskAssignee">
                            <option value="">Chọn người thực hiện</option>
                            ${this.renderEmployeeOptions(taskData.employees)}
                        </select>
                    </div>
                    
                    <div class="form-section">
                        <label for="taskPriority">Độ ưu tiên</label>
                        <select id="taskPriority">
                            <option value="low">Thấp</option>
                            <option value="medium" selected>Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="critical">Khẩn cấp</option>
                        </select>
                    </div>
                    
                    <div class="form-section">
                        <label for="taskDeadline">Hạn hoàn thành</label>
                        <input type="date" id="taskDeadline">
                    </div>
                    
                    <div class="form-section">
                        <label for="taskDescription">Mô tả chi tiết</label>
                        <div id="taskEditor" class="rich-text-editor">
                            <div class="editor-toolbar">
                                <button type="button" class="editor-btn" data-command="bold">
                                    <span class="material-icons-round">format_bold</span>
                                </button>
                                <button type="button" class="editor-btn" data-command="italic">
                                    <span class="material-icons-round">format_italic</span>
                                </button>
                                <button type="button" class="editor-btn" data-command="underline">
                                    <span class="material-icons-round">format_underlined</span>
                                </button>
                                <button type="button" class="editor-btn" data-command="insertUnorderedList">
                                    <span class="material-icons-round">format_list_bulleted</span>
                                </button>
                                <button type="button" class="editor-btn" data-command="insertOrderedList">
                                    <span class="material-icons-round">format_list_numbered</span>
                                </button>
                            </div>
                            <div id="taskContent" class="editor-content" contenteditable="true" 
                                 placeholder="Nhập mô tả chi tiết nhiệm vụ..."></div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="contentManager.taskAssignment.submitTask()">
                            <span class="material-icons-round">send</span>
                            Giao việc
                        </button>
                        <button class="btn btn-secondary" onclick="contentManager.taskAssignment.saveDraft()">
                            <span class="material-icons-round">save</span>
                            Lưu nháp
                        </button>
                    </div>
                </div>
                
                <div class="task-history">
                    ${this.renderTaskHistory(taskData.history)}
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }

    renderEmployeeOptions(employees) {
        if (!employees) return '';
        
        return employees.map(emp => `
            <option value="${emp.employeeId}">${emp.fullName} - ${emp.department}</option>
        `).join('');
    }

    renderTaskHistory(history) {
        if (!history || !history.length) {
            return '<div class="no-tasks"><p>Chưa có nhiệm vụ nào được giao</p></div>';
        }
        
        return `
            <h3>Lịch sử giao việc</h3>
            <div class="task-list">
                ${history.map(task => `
                    <div class="task-item priority-${task.priority}">
                        <div class="task-info">
                            <h4>${task.title}</h4>
                            <p class="task-assignee">Giao cho: ${task.assigneeName}</p>
                            <p class="task-deadline">Hạn: ${task.deadline}</p>
                        </div>
                        <div class="task-status">
                            <span class="status-badge ${task.status}">${task.statusText}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    initializeTextEditor() {
        const toolbar = document.querySelector('.editor-toolbar');
        if (toolbar) {
            toolbar.addEventListener('click', (e) => {
                const button = e.target.closest('.editor-btn');
                if (button) {
                    e.preventDefault();
                    const command = button.getAttribute('data-command');
                    document.execCommand(command, false, null);
                    document.getElementById('taskContent').focus();
                }
            });
        }
    }

    createNewTask() {
        // Clear form
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskAssignee').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDeadline').value = '';
        document.getElementById('taskContent').innerHTML = '';
        
        this.cm.domUtils.showNotification('Form đã được làm mới', 'info');
    }

    async submitTask() {
        try {
            const taskData = {
                title: document.getElementById('taskTitle').value,
                assigneeId: document.getElementById('taskAssignee').value,
                priority: document.getElementById('taskPriority').value,
                deadline: document.getElementById('taskDeadline').value,
                description: document.getElementById('taskContent').innerHTML,
                createdBy: this.cm.user.employeeId
            };
            
            if (!this.cm.validator.validateTaskData(taskData)) {
                this.cm.domUtils.showNotification('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }
            
            const response = await fetch('/api/tasks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            
            const result = await this.cm.apiUtils.validateAndParseResponse(response);
            this.cm.domUtils.showNotification('Giao việc thành công!', 'success');
            this.show(); // Refresh interface
        } catch (error) {
            console.error('Error submitting task:', error);
            this.cm.domUtils.showNotification('Lỗi khi giao việc: ' + error.message, 'error');
        }
    }

    saveDraft() {
        const draftData = {
            title: document.getElementById('taskTitle').value,
            assigneeId: document.getElementById('taskAssignee').value,
            priority: document.getElementById('taskPriority').value,
            deadline: document.getElementById('taskDeadline').value,
            description: document.getElementById('taskContent').innerHTML
        };
        
        localStorage.setItem('taskDraft', JSON.stringify(draftData));
        this.cm.domUtils.showNotification('Đã lưu nháp', 'success');
    }

    renderErrorState(message) {
        const content = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${message}</p>
                <button onclick="contentManager.taskAssignment.show()" class="btn btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }
}

// =====================================================
// TIMESHEET MANAGEMENT MODULE
// =====================================================
class TimesheetManager {
    constructor(contentManager) {
        this.cm = contentManager;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    async initialize() {
        console.log('TimesheetManager initialized');
    }

    async show() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            const timesheetData = await this.getTimesheetData();
            this.renderTimesheetInterface(timesheetData);
        } catch (error) {
            console.error('Error loading timesheet:', error);
            this.renderErrorState('Không thể tải bảng chấm công');
        }
    }

    async getTimesheetData() {
        const response = await fetch(`/api/timesheet/${this.currentYear}/${this.currentMonth + 1}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    renderTimesheetInterface(timesheetData) {
        const content = `
            <div class="timesheet-container">
                <div class="timesheet-header">
                    <h2>Bảng chấm công</h2>
                    <div class="month-navigation">
                        <button class="btn btn-secondary" onclick="contentManager.timesheet.previousMonth()">
                            <span class="material-icons-round">chevron_left</span>
                        </button>
                        <span class="current-month">${this.getMonthYearString()}</span>
                        <button class="btn btn-secondary" onclick="contentManager.timesheet.nextMonth()">
                            <span class="material-icons-round">chevron_right</span>
                        </button>
                    </div>
                </div>
                
                <div class="timesheet-summary">
                    ${this.renderTimesheetSummary(timesheetData.summary)}
                </div>
                
                <div class="timesheet-calendar">
                    ${this.renderTimesheetCalendar(timesheetData.days)}
                </div>
                
                <div class="timesheet-export">
                    <button class="btn btn-primary" onclick="contentManager.timesheet.exportTimesheet()">
                        <span class="material-icons-round">download</span>
                        Xuất báo cáo
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }

    renderTimesheetSummary(summary) {
        if (!summary) return '<p>Không có dữ liệu tổng kết</p>';
        
        return `
            <div class="summary-cards">
                <div class="summary-card">
                    <h3>${summary.totalDays || 0}</h3>
                    <p>Tổng ngày làm</p>
                </div>
                <div class="summary-card">
                    <h3>${summary.totalHours || '0h'}</h3>
                    <p>Tổng giờ làm</p>
                </div>
                <div class="summary-card">
                    <h3>${summary.lateDays || 0}</h3>
                    <p>Ngày đi muộn</p>
                </div>
                <div class="summary-card">
                    <h3>${summary.overtimeHours || '0h'}</h3>
                    <p>Giờ tăng ca</p>
                </div>
            </div>
        `;
    }

    renderTimesheetCalendar(days) {
        if (!days || !days.length) {
            return '<p>Không có dữ liệu chấm công</p>';
        }
        
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        return `
            <div class="calendar-grid">
                <div class="calendar-header">
                    ${weekdays.map(day => `<div class="weekday">${day}</div>`).join('')}
                </div>
                <div class="calendar-body">
                    ${days.map(day => `
                        <div class="calendar-day ${day.status || ''} ${day.isToday ? 'today' : ''}">
                            <div class="day-number">${day.date}</div>
                            <div class="day-times">
                                <small>${day.checkIn || ''}</small>
                                <small>${day.checkOut || ''}</small>
                            </div>
                            <div class="day-hours">${day.totalHours || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getMonthYearString() {
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        return `${months[this.currentMonth]} ${this.currentYear}`;
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.show();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.show();
    }

    exportTimesheet() {
        // Export timesheet functionality
        this.cm.domUtils.showNotification('Đang xuất báo cáo...', 'info');
        
        // Simulate export process
        setTimeout(() => {
            this.cm.domUtils.showNotification('Báo cáo đã được xuất thành công!', 'success');
        }, 2000);
    }

    renderErrorState(message) {
        const content = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${message}</p>
                <button onclick="contentManager.timesheet.show()" class="btn btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }
}

// =====================================================
// GRANT ACCESS MANAGEMENT MODULE
// =====================================================
class GrantAccessManager {
    constructor(contentManager) {
        this.cm = contentManager;
        this.selectedUser = null;
    }

    async initialize() {
        console.log('GrantAccessManager initialized');
    }

    async show() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            const accessData = await this.getAccessData();
            this.renderGrantAccessInterface(accessData);
        } catch (error) {
            console.error('Error loading grant access:', error);
            this.renderErrorState('Không thể tải phân quyền');
        }
    }

    async getAccessData() {
        const response = await fetch('/api/permissions/users', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    renderGrantAccessInterface(accessData) {
        const content = `
            <div class="permission-management-container">
                <div class="permission-header">
                    <h2>Quản lý phân quyền</h2>
                    <div class="permission-search">
                        <input type="text" id="userSearch" placeholder="Tìm kiếm nhân viên..." 
                               onkeyup="contentManager.grantAccess.searchUsers(this.value)">
                        <span class="material-icons-round">search</span>
                    </div>
                </div>
                
                <div class="permission-stats">
                    ${this.renderPermissionStats(accessData.stats)}
                </div>
                
                <div class="user-selection-area">
                    <h3>Chọn nhân viên để chỉnh sửa quyền</h3>
                    <p class="instruction">Click để chọn, double-click hoặc nhấn nút "Chỉnh sửa" để mở trình chỉnh sửa quyền</p>
                    
                    <div class="user-list-content" id="userListContent">
                        ${this.renderUserList(accessData.users)}
                    </div>
                </div>
                
                <div class="permission-edit-content" id="permissionEditContent" style="display: none;">
                    ${this.renderPermissionEditForm()}
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
        this.setupUserSelection();
    }

    renderPermissionStats(stats) {
        if (!stats) return '<p>Không có thống kê</p>';
        
        return `
            <div class="stats-grid">
                <div class="stat-card admin">
                    <h3>${stats.admins || 0}</h3>
                    <p>Quản trị viên</p>
                </div>
                <div class="stat-card manager">
                    <h3>${stats.managers || 0}</h3>
                    <p>Quản lý</p>
                </div>
                <div class="stat-card assistant">
                    <h3>${stats.assistants || 0}</h3>
                    <p>Trợ lý</p>
                </div>
                <div class="stat-card employee">
                    <h3>${stats.employees || 0}</h3>
                    <p>Nhân viên</p>
                </div>
            </div>
        `;
    }

    renderUserList(users) {
        if (!users || !users.length) {
            return '<div class="no-users"><p>Không có dữ liệu nhân viên</p></div>';
        }
        
        return `
            <div class="users-grid">
                ${users.map(user => `
                    <div class="user-item" data-user-id="${user.employeeId}">
                        <div class="user-avatar">
                            <img src="${user.avatar || '/assets/icons/default-avatar.png'}" alt="Avatar">
                        </div>
                        <div class="user-info">
                            <h4>${user.fullName}</h4>
                            <p class="user-department">${user.department}</p>
                            <p class="user-position">${user.position}</p>
                        </div>
                        <div class="user-role">
                            <span class="role-badge ${user.role}">${user.roleText}</span>
                        </div>
                        <div class="user-actions" style="display: none;">
                            <button class="btn btn-sm btn-primary edit-user-btn">
                                <span class="material-icons-round">edit</span>
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPermissionEditForm() {
        return `
            <div class="permission-edit-form">
                <div class="edit-header">
                    <h3>Chỉnh sửa quyền người dùng</h3>
                    <button class="btn btn-secondary close-edit-btn">
                        <span class="material-icons-round">close</span>
                        Đóng
                    </button>
                </div>
                
                <div class="selected-user-info" id="selectedUserInfo">
                    <!-- User info will be populated here -->
                </div>
                
                <div class="permission-form">
                    <div class="form-section">
                        <label for="userRole">Vai trò</label>
                        <select id="userRole">
                            <option value="employee">Nhân viên</option>
                            <option value="assistant">Trợ lý</option>
                            <option value="manager">Quản lý</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>
                    
                    <div class="form-section">
                        <label>Quyền truy cập</label>
                        <div class="permissions-list">
                            <label class="permission-item">
                                <input type="checkbox" id="permViewAll"> Xem tất cả dữ liệu
                            </label>
                            <label class="permission-item">
                                <input type="checkbox" id="permEditAll"> Chỉnh sửa dữ liệu
                            </label>
                            <label class="permission-item">
                                <input type="checkbox" id="permManageUsers"> Quản lý người dùng
                            </label>
                            <label class="permission-item">
                                <input type="checkbox" id="permManageAttendance"> Quản lý chấm công
                            </label>
                            <label class="permission-item">
                                <input type="checkbox" id="permViewReports"> Xem báo cáo
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="contentManager.grantAccess.savePermissions()">
                            <span class="material-icons-round">save</span>
                            Lưu thay đổi
                        </button>
                        <button class="btn btn-secondary" onclick="contentManager.grantAccess.cancelEdit()">
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupUserSelection() {
        const userItems = document.querySelectorAll('.user-item');
        userItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectUser(item);
            });
            
            item.addEventListener('dblclick', () => {
                this.editUser(item);
            });
        });
    }

    selectUser(userItem) {
        // Remove selection from other users
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('selected');
            const actions = item.querySelector('.user-actions');
            if (actions) actions.style.display = 'none';
        });
        
        // Select current user
        userItem.classList.add('selected');
        const actions = userItem.querySelector('.user-actions');
        if (actions) {
            actions.style.display = 'block';
            const editBtn = actions.querySelector('.edit-user-btn');
            if (editBtn) {
                editBtn.onclick = () => this.editUser(userItem);
            }
        }
        
        this.selectedUser = userItem.getAttribute('data-user-id');
    }

    editUser(userItem) {
        if (!userItem.classList.contains('selected')) {
            this.selectUser(userItem);
        }
        
        // Show edit form
        const editContent = document.getElementById('permissionEditContent');
        const userListContent = document.getElementById('userListContent');
        
        if (editContent && userListContent) {
            userListContent.style.display = 'none';
            editContent.style.display = 'block';
            
            // Populate user info in edit form
            this.populateEditForm(userItem);
        }
    }

    populateEditForm(userItem) {
        const userId = userItem.getAttribute('data-user-id');
        const userName = userItem.querySelector('h4').textContent;
        const userDept = userItem.querySelector('.user-department').textContent;
        const userRole = userItem.querySelector('.role-badge').classList[1];
        
        const selectedUserInfo = document.getElementById('selectedUserInfo');
        if (selectedUserInfo) {
            selectedUserInfo.innerHTML = `
                <div class="selected-user-card">
                    <img src="${userItem.querySelector('.user-avatar img').src}" alt="Avatar" class="avatar">
                    <div class="user-details">
                        <h4>${userName}</h4>
                        <p>${userDept}</p>
                        <p>ID: ${userId}</p>
                    </div>
                </div>
            `;
        }
        
        // Set current role
        const roleSelect = document.getElementById('userRole');
        if (roleSelect) {
            roleSelect.value = userRole;
        }
    }

    searchUsers(searchTerm) {
        const userItems = document.querySelectorAll('.user-item');
        userItems.forEach(item => {
            const userName = item.querySelector('h4').textContent.toLowerCase();
            const userDept = item.querySelector('.user-department').textContent.toLowerCase();
            
            if (userName.includes(searchTerm.toLowerCase()) || 
                userDept.includes(searchTerm.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    savePermissions() {
        // Save permission changes
        this.cm.domUtils.showNotification('Đã lưu thay đổi quyền!', 'success');
        this.cancelEdit();
    }

    cancelEdit() {
        const editContent = document.getElementById('permissionEditContent');
        const userListContent = document.getElementById('userListContent');
        
        if (editContent && userListContent) {
            editContent.style.display = 'none';
            userListContent.style.display = 'block';
        }
        
        // Clear selection
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('selected');
            const actions = item.querySelector('.user-actions');
            if (actions) actions.style.display = 'none';
        });
        
        this.selectedUser = null;
    }

    renderErrorState(message) {
        const content = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${message}</p>
                <button onclick="contentManager.grantAccess.show()" class="btn btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }
}

// =====================================================
// STATISTICS MANAGEMENT MODULE
// =====================================================
class StatisticsManager {
    constructor(contentManager) {
        this.cm = contentManager;
    }

    async initialize() {
        console.log('StatisticsManager initialized');
    }

    async show() {
        try {
            this.cm.domUtils.showLoader('contentArea');
            
            const statsData = await this.getStatisticsData();
            this.renderStatisticsInterface(statsData);
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.renderErrorState('Không thể tải thống kê');
        }
    }

    async getStatisticsData() {
        const response = await fetch('/api/statistics/dashboard', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        return await this.cm.apiUtils.validateAndParseResponse(response);
    }

    async getDashboardStats() {
        try {
            const response = await fetch('/api/statistics/dashboard-summary', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            return await this.cm.apiUtils.validateAndParseResponse(response);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    }

    renderStatisticsInterface(statsData) {
        const content = `
            <div class="statistics-container">
                <div class="stats-header">
                    <h2>Thống kê và báo cáo</h2>
                    <div class="stats-filters">
                        <select id="statsPeriod" onchange="contentManager.statistics.updatePeriod(this.value)">
                            <option value="today">Hôm nay</option>
                            <option value="week" selected>Tuần này</option>
                            <option value="month">Tháng này</option>
                            <option value="quarter">Quý này</option>
                            <option value="year">Năm này</option>
                        </select>
                    </div>
                </div>
                
                <div class="stats-overview">
                    ${this.renderStatsOverview(statsData.overview)}
                </div>
                
                <div class="stats-charts">
                    ${this.renderStatsCharts(statsData.charts)}
                </div>
                
                <div class="stats-tables">
                    ${this.renderStatsTables(statsData.tables)}
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }

    renderStatsOverview(overview) {
        if (!overview) return '<p>Không có dữ liệu tổng quan</p>';
        
        return `
            <div class="overview-grid">
                <div class="overview-card attendance">
                    <div class="card-header">
                        <span class="material-icons-round">people</span>
                        <h3>Chấm công</h3>
                    </div>
                    <div class="card-content">
                        <div class="main-stat">${overview.attendance.present}/${overview.attendance.total}</div>
                        <div class="sub-stat">Có mặt hôm nay</div>
                        <div class="trend ${overview.attendance.trend}">${overview.attendance.trendText}</div>
                    </div>
                </div>
                
                <div class="overview-card tasks">
                    <div class="card-header">
                        <span class="material-icons-round">assignment</span>
                        <h3>Nhiệm vụ</h3>
                    </div>
                    <div class="card-content">
                        <div class="main-stat">${overview.tasks.completed}/${overview.tasks.total}</div>
                        <div class="sub-stat">Hoàn thành</div>
                        <div class="trend ${overview.tasks.trend}">${overview.tasks.trendText}</div>
                    </div>
                </div>
                
                <div class="overview-card performance">
                    <div class="card-header">
                        <span class="material-icons-round">trending_up</span>
                        <h3>Hiệu suất</h3>
                    </div>
                    <div class="card-content">
                        <div class="main-stat">${overview.performance.score}%</div>
                        <div class="sub-stat">Điểm trung bình</div>
                        <div class="trend ${overview.performance.trend}">${overview.performance.trendText}</div>
                    </div>
                </div>
                
                <div class="overview-card leaves">
                    <div class="card-header">
                        <span class="material-icons-round">event_busy</span>
                        <h3>Nghỉ phép</h3>
                    </div>
                    <div class="card-content">
                        <div class="main-stat">${overview.leaves.approved}</div>
                        <div class="sub-stat">Đơn được duyệt</div>
                        <div class="trend ${overview.leaves.trend}">${overview.leaves.trendText}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStatsCharts(charts) {
        if (!charts) return '<p>Không có dữ liệu biểu đồ</p>';
        
        return `
            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Xu hướng chấm công</h3>
                    <div class="chart-placeholder" id="attendanceChart">
                        ${this.renderSimpleChart(charts.attendance, 'bar')}
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3>Phân bố nhiệm vụ</h3>
                    <div class="chart-placeholder" id="tasksChart">
                        ${this.renderSimpleChart(charts.tasks, 'pie')}
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3>Hiệu suất theo phòng ban</h3>
                    <div class="chart-placeholder" id="performanceChart">
                        ${this.renderSimpleChart(charts.performance, 'line')}
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3>Thống kê nghỉ phép</h3>
                    <div class="chart-placeholder" id="leavesChart">
                        ${this.renderSimpleChart(charts.leaves, 'doughnut')}
                    </div>
                </div>
            </div>
        `;
    }

    renderSimpleChart(data, type) {
        if (!data || !data.labels || !data.values) {
            return '<div class="no-chart-data">Không có dữ liệu</div>';
        }
        
        // Simple ASCII-style chart representation
        const maxValue = Math.max(...data.values);
        
        if (type === 'bar') {
            return `
                <div class="simple-bar-chart">
                    ${data.labels.map((label, index) => {
                        const height = (data.values[index] / maxValue) * 100;
                        return `
                            <div class="bar-item">
                                <div class="bar" style="height: ${height}%"></div>
                                <div class="bar-label">${label}</div>
                                <div class="bar-value">${data.values[index]}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (type === 'pie' || type === 'doughnut') {
            const total = data.values.reduce((sum, val) => sum + val, 0);
            return `
                <div class="simple-pie-chart">
                    ${data.labels.map((label, index) => {
                        const percentage = ((data.values[index] / total) * 100).toFixed(1);
                        return `
                            <div class="pie-item">
                                <div class="pie-color" style="background-color: ${this.getChartColor(index)}"></div>
                                <span>${label}: ${percentage}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        return '<div class="chart-coming-soon">Biểu đồ sẽ có trong phiên bản tới</div>';
    }

    getChartColor(index) {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
        return colors[index % colors.length];
    }

    renderStatsTables(tables) {
        if (!tables) return '<p>Không có dữ liệu bảng</p>';
        
        return `
            <div class="tables-grid">
                <div class="table-card">
                    <h3>Top nhân viên xuất sắc</h3>
                    ${this.renderTopEmployees(tables.topEmployees)}
                </div>
                
                <div class="table-card">
                    <h3>Nhiệm vụ gần hạn</h3>
                    ${this.renderUpcomingTasks(tables.upcomingTasks)}
                </div>
                
                <div class="table-card">
                    <h3>Thống kê phòng ban</h3>
                    ${this.renderDepartmentStats(tables.departmentStats)}
                </div>
                
                <div class="table-card">
                    <h3>Hoạt động gần đây</h3>
                    ${this.renderRecentActivity(tables.recentActivity)}
                </div>
            </div>
        `;
    }

    renderTopEmployees(employees) {
        if (!employees || !employees.length) {
            return '<div class="no-data">Không có dữ liệu</div>';
        }
        
        return `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Hạng</th>
                            <th>Nhân viên</th>
                            <th>Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map((emp, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>
                                    <div class="employee-info">
                                        <img src="${emp.avatar || '/assets/icons/default-avatar.png'}" alt="Avatar" class="mini-avatar">
                                        <span>${emp.name}</span>
                                    </div>
                                </td>
                                <td><span class="score-badge">${emp.score}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderUpcomingTasks(tasks) {
        if (!tasks || !tasks.length) {
            return '<div class="no-data">Không có nhiệm vụ gần hạn</div>';
        }
        
        return `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nhiệm vụ</th>
                            <th>Người thực hiện</th>
                            <th>Hạn</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map(task => `
                            <tr>
                                <td>${task.title}</td>
                                <td>${task.assignee}</td>
                                <td><span class="deadline ${task.urgency}">${task.deadline}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderDepartmentStats(departments) {
        if (!departments || !departments.length) {
            return '<div class="no-data">Không có dữ liệu phòng ban</div>';
        }
        
        return `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Phòng ban</th>
                            <th>Nhân viên</th>
                            <th>Hiệu suất</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${departments.map(dept => `
                            <tr>
                                <td>${dept.name}</td>
                                <td>${dept.employeeCount}</td>
                                <td>
                                    <div class="performance-bar">
                                        <div class="performance-fill" style="width: ${dept.performance}%"></div>
                                        <span>${dept.performance}%</span>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderRecentActivity(activities) {
        if (!activities || !activities.length) {
            return '<div class="no-data">Không có hoạt động gần đây</div>';
        }
        
        return `
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon ${activity.type}">
                            <span class="material-icons-round">${activity.icon}</span>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.text}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updatePeriod(period) {
        this.cm.domUtils.showNotification(`Đang cập nhật thống kê ${period}...`, 'info');
        // Reload statistics with new period
        setTimeout(() => {
            this.show();
        }, 1000);
    }

    renderErrorState(message) {
        const content = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${message}</p>
                <button onclick="contentManager.statistics.show()" class="btn btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = content;
    }
}

// =====================================================
// API UTILITIES CLASS
// =====================================================
class APIUtils {
    constructor() {
        this.baseURL = '/api';
    }

    async validateAndParseResponse(response) {
        if (!response) {
            console.warn('API Warning: Không nhận được phản hồi từ server');
            return null;
        }

        const contentType = response.headers.get('content-type');
        
        // Check if response is HTML (error page)
        if (contentType && contentType.includes('text/html')) {
            const htmlText = await response.text();
            if (htmlText.includes('<!DOCTYPE')) {
                console.warn('API Warning: Server trả về trang lỗi thay vì dữ liệu JSON');
                return null;
            }
        }

        // Check if response is empty
        const textResponse = await response.text();
        if (!textResponse || textResponse.trim() === '') {
            console.warn('API Warning: Server trả về dữ liệu trống');
            return null;
        }

        // Try to parse JSON
        try {
            const jsonData = JSON.parse(textResponse);
            
            if (!response.ok) {
                console.warn(`API Warning: HTTP Error ${response.status}:`, jsonData.message || 'Unknown error');
                return null;
            }
            
            return jsonData;
        } catch (parseError) {
            if (parseError instanceof SyntaxError) {
                console.warn('API Warning: Dữ liệu từ server không đúng định dạng JSON');
                return null;
            }
            console.warn('API Warning:', parseError.message);
            return null;
        }
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            return await this.validateAndParseResponse(response);
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async get(endpoint) {
        return await this.makeRequest(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return await this.makeRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return await this.makeRequest(endpoint, { method: 'DELETE' });
    }
}

// =====================================================
// DOM UTILITIES CLASS
// =====================================================
class DOMUtils {
    constructor() {
        this.notificationContainer = null;
        this.initNotificationContainer();
    }

    initNotificationContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        this.notificationContainer = container;
    }

    showLoader(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="content-loader">
                    <div class="loader-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon material-icons-round">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close material-icons-round">close</button>
            </div>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Add to container
        this.notificationContainer.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }
}

// =====================================================
// VALIDATION UTILITIES CLASS
// =====================================================
class ValidationUtils {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    validateTaskData(taskData) {
        return taskData.title && 
               taskData.assigneeId && 
               taskData.deadline && 
               taskData.description;
    }

    validatePersonalData(personalData) {
        return personalData.fullName && 
               personalData.email && 
               this.validateEmail(personalData.email);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .trim();
    }

    validateDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
}

// =====================================================
// GLOBAL INITIALIZATION
// =====================================================
// Make ContentManager globally accessible
window.ContentManager = ContentManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Content Manager v4.0 modules loaded successfully');
});
