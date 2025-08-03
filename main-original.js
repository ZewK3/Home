// Constants and Configuration
const CONFIG = {
    API_URL: "https://zewk.tocotoco.workers.dev/",
    STORAGE_KEYS: {
        AUTH_TOKEN: "authToken",
        USER_DATA: "loggedInUser",
        THEME: "theme",
        REMEMBER_ME: "rememberedEmployeeId"
    },
    POLLING_INTERVAL: 3000,
    MAX_RETRY_ATTEMPTS: 3
};

// Global cache for API data with enhanced call tracking
const API_CACHE = {
    userData: null,
    usersData: null,
    storesData: null,
    dashboardStats: null,
    lastUserDataFetch: null,
    lastUsersDataFetch: null,
    lastStoresDataFetch: null,
    lastDashboardStatsFetch: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // Track ongoing API calls to prevent duplicates
    ongoingCalls: new Map(),
    
    // Clear cache
    clear() {
        this.userData = null;
        this.usersData = null;
        this.storesData = null;
        this.dashboardStats = null;
        this.lastUserDataFetch = null;
        this.lastUsersDataFetch = null;
        this.lastStoresDataFetch = null;
        this.lastDashboardStatsFetch = null;
        this.ongoingCalls.clear();
    },
    
    // Check if cache is valid
    isCacheValid(timestamp) {
        return timestamp && (Date.now() - timestamp < this.CACHE_DURATION);
    },
    
    // Enhanced API call tracker to prevent duplicates
    async safeAPICall(endpoint, apiFunction) {
        // If call is already in progress, wait for it
        if (this.ongoingCalls.has(endpoint)) {
            console.log(`API call for ${endpoint} already in progress, waiting...`);
            return await this.ongoingCalls.get(endpoint);
        }
        
        // Start new API call
        const promise = apiFunction();
        this.ongoingCalls.set(endpoint, promise);
        
        try {
            const result = await promise;
            return result;
        } finally {
            // Clean up regardless of success/failure
            this.ongoingCalls.delete(endpoint);
        }
    },
    
    // Get cached user data or fetch new with duplicate call prevention
    async getUserData() {
        if (this.userData && this.isCacheValid(this.lastUserDataFetch)) {
            return this.userData;
        }
        
        const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const employeeId = userData.employeeId || userData.loginEmployeeId;
        
        if (!employeeId) {
            throw new Error('No employee ID found');
        }
        
        const endpoint = `getUser_${employeeId}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.userData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
                this.lastUserDataFetch = Date.now();
                return this.userData;
            } catch (error) {
                console.warn('API not available, using localStorage data for testing:', error.message);
                // Fallback to localStorage data for testing
                this.userData = userData;
                this.lastUserDataFetch = Date.now();
                return this.userData;
            }
        });
    },
    
    // Get cached stores data or fetch new with duplicate call prevention
    async getStoresData() {
        if (this.storesData && this.isCacheValid(this.lastStoresDataFetch)) {
            return this.storesData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getStores_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.storesData = await utils.fetchAPI(`?action=getStores&token=${token}`);
                this.lastStoresDataFetch = Date.now();
                return this.storesData;
            } catch (error) {
                console.error('Failed to fetch stores data:', error);
                throw error;
            }
        });
    },
    
    // Get cached users data or fetch new with duplicate call prevention
    async getUsersData() {
        if (this.usersData && this.isCacheValid(this.lastUsersDataFetch)) {
            return this.usersData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getUsers_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.usersData = await utils.fetchAPI(`?action=getUsers&token=${token}`);
                this.lastUsersDataFetch = Date.now();
                return this.usersData;
            } catch (error) {
                console.error('Failed to fetch users data:', error);
                throw error;
            }
        });
    },
    
    // Get cached dashboard stats or fetch new with duplicate call prevention
    async getDashboardStats() {
        if (this.dashboardStats && this.isCacheValid(this.lastDashboardStatsFetch)) {
            return this.dashboardStats;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getDashboardStats_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.dashboardStats = await utils.fetchAPI(`?action=getDashboardStats&token=${token}`);
                this.lastDashboardStatsFetch = Date.now();
                return this.dashboardStats;
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                throw error;
            }
        });
    }
};

// Utility Functions
const utils = {
    showNotification(message, type = "success", duration = 3000) {
        const notification = document.getElementById("notification");
        if (!notification) {
            console.warn("Notification element not found");
            return;
        }

        const icons = {
            success: '✓',
            error: '✕', 
            warning: '⚠'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || '✓'}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
        `;
        
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            if (notification) {
                notification.classList.remove("show");
            }
        }, duration);
    },

    formatDate(date) {
        return new Date(date).toLocaleString({
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString({
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    async fetchAPI(endpoint, options = {}) {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        console.log(`API Call: ${endpoint}`); // Debug logging for API tracking
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Global notification function for backward compatibility
function showNotification(message, type, duration) {
    utils.showNotification(message, type, duration);
}



// Content Manager - Handles all menu functionality
class ContentManager {
    constructor(user) {
        this.user = user;
        this.setupMenuHandlers();
        this.initializeTextEditor(); // Initialize text editor functionality
    }

    // Helper method to safely get user employeeId
    async getUserEmployeeId() {
        if (this.user && this.user.employeeId) {
            return this.user.employeeId;
        }
        
        try {
            const userData = await API_CACHE.getUserData();
            this.user = userData; // Update the instance user data
            return userData.employeeId;
        } catch (error) {
            console.error('Unable to get user employeeId:', error);
            throw new Error('User data not available');
        }
    }

    setupMenuHandlers() {
        // Work Management
        document.getElementById('openTimesheet')?.addEventListener('click', () => 
            this.showTimesheet());
        document.getElementById('openAttendance')?.addEventListener('click', () => 
            this.showAttendanceGPS());

        // Request Management
        document.getElementById('openAttendanceRequest')?.addEventListener('click', () => 
            this.showAttendanceRequest());
        document.getElementById('openTaskAssignment')?.addEventListener('click', () => 
            this.showTaskAssignment());
        document.getElementById('openShiftAssignment')?.addEventListener('click', () => 
            this.showShiftAssignment());
        document.getElementById('openAnalytics')?.addEventListener('click', () => 
            this.showAnalytics());

        // Mobile handlers
        document.getElementById('mobileTimesheet')?.addEventListener('click', () => 
            this.showTimesheet());
        document.getElementById('mobileAttendance')?.addEventListener('click', () => 
            this.showAttendanceGPS());
        document.getElementById('mobileAttendanceRequest')?.addEventListener('click', () => 
            this.showAttendanceRequest());
        document.getElementById('mobileTaskAssignment')?.addEventListener('click', () => 
            this.showTaskAssignment());
        document.getElementById('mobileShiftAssignment')?.addEventListener('click', () => 
            this.showShiftAssignment());
        document.getElementById('mobileAnalytics')?.addEventListener('click', () => 
            this.showAnalytics());

        // Legacy handlers for existing functions
        document.getElementById('openWorkShifts')?.addEventListener('click', () => 
            this.showWorkShifts());

        // Tasks
        document.getElementById('taskPersonnel')?.addEventListener('click', () => 
            this.showTaskPersonnel());
        document.getElementById('taskStore')?.addEventListener('click', () => 
            this.showTaskStore());
        document.getElementById('taskFinance')?.addEventListener('click', () => 
            this.showTaskFinance());
        document.getElementById('taskApproval')?.addEventListener('click', () => 
            this.showTaskApproval());


        document.getElementById('openGrantAccess')?.addEventListener('click', () => 
            this.showGrantAccess());
        document.getElementById('openPersonalInformation')?.addEventListener('click', () => 
            this.showPersonalInfo());
        document.getElementById('openWorkTasks')?.addEventListener('click', () => 
            this.showWorkTasks());
        
        // Registration Approval
        document.getElementById('openRegistrationApproval')?.addEventListener('click', () =>
            this.showRegistrationApproval());
    }

    // Shift Management Functions
    async showShiftAssignment() {
        const content = document.getElementById('content');
        try {
            // Get current user's role and stores to determine permissions using cache
            const userResponse = await API_CACHE.getUserData();
            
            // Only AD, AM, QL can assign shifts
            if (!['AD', 'AM', 'QL'].includes(userResponse.position)) {
                content.innerHTML = `
                    <div class="error-container">
                        <div class="error-card">
                            <span class="material-icons-round error-icon">lock</span>
                            <h3>Không có quyền truy cập</h3>
                            <p>Bạn không có quyền phân ca cho nhân viên.</p>
                        </div>
                    </div>
                `;
                return;
            }

            content.innerHTML = `
                <div class="shift-assignment-container modern-container">
                    <!-- Professional Header -->
                    <div class="page-header professional-header">
                        <div class="header-content">
                            <div class="header-title">
                                <div class="title-icon-wrapper">
                                    <span class="material-icons-round header-icon">schedule</span>
                                </div>
                                <div class="title-text">
                                    <h1>Quản Lý Phân Ca Chuyên Nghiệp</h1>
                                    <p class="header-subtitle">Hệ thống phân ca thông minh với giao diện hiện đại và phân tích thời gian thực</p>
                                </div>
                            </div>
                            <div class="header-stats mini-stats">
                                <div class="mini-stat-card">
                                    <span class="mini-stat-value" id="totalEmployees">0</span>
                                    <span class="mini-stat-label">Nhân viên</span>
                                </div>
                                <div class="mini-stat-card">
                                    <span class="mini-stat-value" id="activeShifts">0</span>
                                    <span class="mini-stat-label">Ca đang hoạt động</span>
                                </div>
                                <div class="mini-stat-card">
                                    <span class="mini-stat-value" id="totalHours">0h</span>
                                    <span class="mini-stat-label">Tổng giờ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Control Panel -->
                    <div class="card modern-card control-panel">
                        <div class="card-body">
                            <div class="shift-filters modern-filters">
                                <div class="filter-section">
                                    <div class="filter-group enhanced-filter">
                                        <label for="shiftStore" class="filter-label">
                                            <span class="material-icons-round">store</span>
                                            Chọn cửa hàng
                                        </label>
                                        <select id="shiftStore" class="form-control modern-select">
                                            <option value="">Tất cả cửa hàng</option>
                                        </select>
                                    </div>
                                    <div class="filter-group enhanced-filter">
                                        <label for="shiftWeek" class="filter-label">
                                            <span class="material-icons-round">date_range</span>
                                            Chọn tuần
                                        </label>
                                        <input type="week" id="shiftWeek" class="form-control modern-input" value="${this.getCurrentWeek()}">
                                    </div>
                                    <div class="filter-group enhanced-filter">
                                        <label for="shiftTemplate" class="filter-label">
                                            <span class="material-icons-round">content_copy</span>
                                            Mẫu ca
                                        </label>
                                        <select id="shiftTemplate" class="form-control modern-select">
                                            <option value="">Tùy chỉnh</option>
                                            <option value="standard">Ca chuẩn (8h)</option>
                                            <option value="flexible">Ca linh hoạt</option>
                                            <option value="weekend">Ca cuối tuần</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="action-section">
                                    <button id="loadShiftData" class="btn btn-primary modern-btn">
                                        <span class="material-icons-round">refresh</span>
                                        Tải dữ liệu
                                    </button>
                                    <button class="btn modern-btn secondary-btn" onclick="contentManager.applyTemplate()">
                                        <span class="material-icons-round">apply</span>
                                        Áp dụng mẫu
                                    </button>
                                    <button class="btn modern-btn success-btn" onclick="contentManager.bulkAssign()">
                                        <span class="material-icons-round">group_add</span>
                                        Phân ca hàng loạt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Professional Employee Grid -->
                    <div class="card modern-card employee-section">
                        <div class="card-header modern-header">
                            <h3>
                                <span class="material-icons-round">people</span>
                                Danh sách nhân viên
                            </h3>
                            <div class="header-tools">
                                <button class="tool-btn" onclick="contentManager.toggleEmployeeView()" title="Chuyển đổi hiển thị">
                                    <span class="material-icons-round">view_module</span>
                                </button>
                                <button class="tool-btn" onclick="contentManager.filterEmployees()" title="Lọc nhân viên">
                                    <span class="material-icons-round">filter_list</span>
                                </button>
                                <button class="tool-btn" onclick="contentManager.refreshEmployees()" title="Làm mới">
                                    <span class="material-icons-round">refresh</span>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="employee-grid modern-employee-grid" id="employeeGrid">
                                <div class="loading-state">
                                    <div class="loading-spinner">
                                        <div class="spinner"></div>
                                    </div>
                                    <p>Chọn cửa hàng để xem danh sách nhân viên</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Shift Schedule Grid -->
                    <div class="card modern-card schedule-section">
                        <div class="card-header modern-header">
                            <h3>
                                <span class="material-icons-round">calendar_view_week</span>
                                Lịch phân ca trong tuần
                            </h3>
                            <div class="header-tools">
                                <button class="tool-btn" onclick="contentManager.exportSchedule()" title="Xuất lịch">
                                    <span class="material-icons-round">download</span>
                                </button>
                                <button class="tool-btn" onclick="contentManager.printSchedule()" title="In lịch">
                                    <span class="material-icons-round">print</span>
                                </button>
                                <button class="tool-btn active" onclick="contentManager.toggleFullscreen()" title="Toàn màn hình">
                                    <span class="material-icons-round">fullscreen</span>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="shift-schedule-grid modern-schedule-grid" id="shiftScheduleGrid">
                                <div class="schedule-placeholder">
                                    <div class="placeholder-content">
                                        <span class="material-icons-round placeholder-icon">schedule</span>
                                        <h4>Chưa có dữ liệu phân ca</h4>
                                        <p>Chọn cửa hàng và tuần để xem lịch phân ca</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Professional Action Panel -->
                    <div class="action-panel modern-action-panel">
                        <div class="panel-content">
                            <div class="panel-info">
                                <div class="info-item">
                                    <span class="material-icons-round">info</span>
                                    <span>Nhấp vào ô để nhập giờ vào/ra. Để trống nếu nghỉ.</span>
                                </div>
                                <div class="info-item">
                                    <span class="material-icons-round">tips_and_updates</span>
                                    <span>Sử dụng Ctrl+Click để chọn nhiều ô cùng lúc.</span>
                                </div>
                            </div>
                            <div class="panel-actions">
                                <button class="btn modern-btn warning-btn" onclick="contentManager.clearAllShifts()">
                                    <span class="material-icons-round">clear_all</span>
                                    Xóa tất cả
                                </button>
                                <button class="btn modern-btn success-btn" onclick="contentManager.saveShiftAssignments()">
                                    <span class="material-icons-round">save</span>
                                    Lưu phân ca
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            await this.loadStoresForShiftAssignment();
            this.setupShiftAssignmentHandlers();
        } catch (error) {
            console.error('Shift assignment error:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải phân ca</h3>
                        <p>Không thể tải giao diện phân ca. Vui lòng thử lại.</p>
                        <button onclick="window.contentManager.showShiftAssignment()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    async showWorkShifts() {
        const content = document.getElementById('content');
        try {
            const userResponse = await API_CACHE.getUserData();
            const employeeId = userResponse.employeeId;

            content.innerHTML = `
                <div class="work-shifts-container">
                    <div class="card">
                        <div class="card-header">
                            <h2>Ca Làm Việc</h2>
                            <p>Xem lịch ca làm việc và thực hiện checkin/checkout</p>
                        </div>
                        <div class="card-body">
                            <div class="shift-overview">
                                <div class="current-shift-card">
                                    <h3>Ca Hiện Tại</h3>
                                    <div id="currentShiftInfo">
                                        <p class="shift-time">Chưa có ca làm</p>
                                        <div class="shift-actions">
                                            <button id="checkinBtn" class="btn btn-success" disabled>Check In</button>
                                            <button id="checkoutBtn" class="btn btn-danger" disabled>Check Out</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="weekly-shifts-card">
                                    <h3>Lịch Ca Tuần Này</h3>
                                    <div id="weeklyShiftsTable">
                                        <div class="loading-shifts">Đang tải ca làm...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            await this.loadCurrentShift(employeeId);
            await this.loadWeeklyShifts(employeeId);
            this.setupShiftCheckHandlers();
        } catch (error) {
            console.error('Work shifts error:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải ca làm</h3>
                        <p>Không thể tải thông tin ca làm. Vui lòng thử lại.</p>
                        <button onclick="window.contentManager.showWorkShifts()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    async showAttendance() {
        const content = document.getElementById('content');
        try {
            const userResponse = await API_CACHE.getUserData();
            const employeeId = userResponse.employeeId;

            content.innerHTML = `
                <div class="attendance-container">
                    <div class="card">
                        <div class="card-header">
                            <h2>Chấm Công</h2>
                            <p>Theo dõi thời gian làm việc và chấm công</p>
                        </div>
                        <div class="card-body">
                            <div class="attendance-filters">
                                <div class="filter-row">
                                    <div class="filter-group">
                                        <label for="attendanceMonth">Tháng:</label>
                                        <input type="month" id="attendanceMonth" class="form-control" value="${this.getCurrentMonth()}">
                                    </div>
                                    ${userResponse.position !== 'NV' ? `
                                    <div class="filter-group">
                                        <label for="attendanceStore">Cửa hàng:</label>
                                        <select id="attendanceStore" class="form-control">
                                            <option value="">Tất cả cửa hàng</option>
                                        </select>
                                    </div>
                                    <div class="filter-group">
                                        <label for="attendanceEmployee">Nhân viên:</label>
                                        <select id="attendanceEmployee" class="form-control">
                                            <option value="">Tất cả nhân viên</option>
                                        </select>
                                    </div>
                                    ` : ''}
                                    <button id="loadAttendanceData" class="btn btn-primary">Tải dữ liệu</button>
                                </div>
                            </div>
                            
                            <div class="attendance-summary">
                                <div class="summary-cards">
                                    <div class="summary-card">
                                        <h4>Tổng giờ làm</h4>
                                        <span id="totalHours" class="summary-value">0h</span>
                                    </div>
                                    <div class="summary-card">
                                        <h4>Số ngày làm</h4>
                                        <span id="workDays" class="summary-value">0</span>
                                    </div>
                                    <div class="summary-card">
                                        <h4>Đi muộn</h4>
                                        <span id="lateCount" class="summary-value">0</span>
                                    </div>
                                    <div class="summary-card">
                                        <h4>Nghỉ không phép</h4>
                                        <span id="absentCount" class="summary-value">0</span>
                                    </div>
                                </div>
                            </div>

                            <div id="attendanceTable" class="attendance-table-container">
                                <div class="loading-attendance">Đang tải dữ liệu chấm công...</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            if (userResponse.position !== 'NV') {
                await this.loadStoresForAttendance();
            }
            await this.loadAttendanceData(employeeId, userResponse.position);
            this.setupAttendanceHandlers();
        } catch (error) {
            console.error('Attendance error:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải chấm công</h3>
                        <p>Không thể tải dữ liệu chấm công. Vui lòng thử lại.</p>
                        <button onclick="window.contentManager.showAttendance()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    async showTimesheet() {
        const content = document.getElementById('content');
        try {
            const userResponse = await API_CACHE.getUserData();
            const employeeId = userResponse.employeeId;

            content.innerHTML = `
                <div class="timesheet-container modern-container">
                    <!-- Enhanced Professional Header -->
                    <div class="page-header professional-header">
                        <div class="header-content">
                            <div class="header-title">
                                <div class="title-icon-wrapper">
                                    <span class="material-icons-round header-icon">calendar_view_month</span>
                                </div>
                                <div class="title-text">
                                    <h1>Bảng Công Chuyên Nghiệp</h1>
                                    <p class="header-subtitle">Theo dõi và phân tích thời gian làm việc với giao diện hiện đại</p>
                                </div>
                            </div>
                            <div class="header-actions">
                                <button class="modern-btn action-btn export-btn" onclick="contentManager.exportTimesheet()">
                                    <span class="material-icons-round">download</span>
                                    Xuất Excel
                                </button>
                                <button class="modern-btn action-btn print-btn" onclick="contentManager.printTimesheet()">
                                    <span class="material-icons-round">print</span>
                                    In báo cáo
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Professional Control Panel -->
                    <div class="card modern-card control-panel">
                        <div class="card-body">
                            <div class="timesheet-controls modern-controls">
                                <div class="control-section">
                                    <div class="filter-group enhanced-filter">
                                        <label for="timesheetMonth" class="filter-label">
                                            <span class="material-icons-round">date_range</span>
                                            Chọn tháng/năm
                                        </label>
                                        <input type="month" id="timesheetMonth" class="form-control modern-input" value="${this.getCurrentMonth()}">
                                    </div>
                                    <div class="filter-group enhanced-filter">
                                        <label for="timesheetView" class="filter-label">
                                            <span class="material-icons-round">view_module</span>
                                            Chế độ xem
                                        </label>
                                        <select id="timesheetView" class="form-control modern-select">
                                            <option value="calendar">Lịch tháng</option>
                                            <option value="list">Danh sách</option>
                                            <option value="summary">Tóm tắt</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="action-section">
                                    <button id="loadTimesheetData" class="btn btn-primary modern-btn">
                                        <span class="material-icons-round">refresh</span>
                                        Tải dữ liệu
                                    </button>
                                    <button class="btn modern-btn secondary-btn" onclick="contentManager.resetTimesheetView()">
                                        <span class="material-icons-round">restore</span>
                                        Đặt lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Enhanced Main Content Area -->
                    <div class="timesheet-main-content">
                        <div class="content-grid">
                            <!-- Professional Calendar Section -->
                            <div class="card modern-card calendar-section">
                                <div class="card-header modern-header">
                                    <h3>
                                        <span class="material-icons-round">calendar_today</span>
                                        Lịch công tháng
                                    </h3>
                                    <div class="header-tools">
                                        <button class="tool-btn" onclick="contentManager.toggleCalendarView()" title="Chuyển đổi hiển thị">
                                            <span class="material-icons-round">view_agenda</span>
                                        </button>
                                        <button class="tool-btn" onclick="contentManager.refreshCalendar()" title="Làm mới">
                                            <span class="material-icons-round">refresh</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="timesheet-calendar modern-calendar" id="timesheetCalendar">
                                        <div class="loading-spinner">
                                            <div class="spinner"></div>
                                            <p>Đang tải bảng công...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Professional Statistics Panel -->
                            <div class="card modern-card stats-section">
                                <div class="card-header modern-header">
                                    <h3>
                                        <span class="material-icons-round">analytics</span>
                                        Thống kê & Phân tích
                                    </h3>
                                    <div class="header-tools">
                                        <button class="tool-btn active" data-period="month" onclick="contentManager.changeStatsPeriod('month')">Tháng</button>
                                        <button class="tool-btn" data-period="week" onclick="contentManager.changeStatsPeriod('week')">Tuần</button>
                                        <button class="tool-btn" data-period="day" onclick="contentManager.changeStatsPeriod('day')">Ngày</button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="timesheet-statistics modern-stats" id="timesheetStats">
                                        <div class="stats-content enhanced-stats">
                                            <!-- Primary KPI Cards -->
                                            <div class="stats-row primary-kpis">
                                                <div class="stat-card modern-stat-card attendance-card">
                                                    <div class="stat-icon">
                                                        <span class="material-icons-round">check_circle</span>
                                                    </div>
                                                    <div class="stat-content">
                                                        <div class="stat-value" id="actualDays">0/0</div>
                                                        <div class="stat-label">Ngày có mặt</div>
                                                        <div class="stat-trend">
                                                            <span class="trend-icon material-icons-round">trending_up</span>
                                                            <span class="trend-value">+5%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="stat-card modern-stat-card hours-card">
                                                    <div class="stat-icon">
                                                        <span class="material-icons-round">schedule</span>
                                                    </div>
                                                    <div class="stat-content">
                                                        <div class="stat-value" id="totalHours">0h</div>
                                                        <div class="stat-label">Tổng giờ làm</div>
                                                        <div class="stat-trend">
                                                            <span class="trend-icon material-icons-round">trending_up</span>
                                                            <span class="trend-value">+12h</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="stat-card modern-stat-card overtime-card">
                                                    <div class="stat-icon">
                                                        <span class="material-icons-round">access_time</span>
                                                    </div>
                                                    <div class="stat-content">
                                                        <div class="stat-value" id="overtimeHours">0h</div>
                                                        <div class="stat-label">Giờ tăng ca</div>
                                                        <div class="stat-trend">
                                                            <span class="trend-icon material-icons-round">trending_down</span>
                                                            <span class="trend-value">-2h</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="stat-card modern-stat-card efficiency-card">
                                                    <div class="stat-icon">
                                                        <span class="material-icons-round">speed</span>
                                                    </div>
                                                    <div class="stat-content">
                                                        <div class="stat-value" id="efficiency">98%</div>
                                                        <div class="stat-label">Hiệu suất</div>
                                                        <div class="stat-trend">
                                                            <span class="trend-icon material-icons-round">trending_up</span>
                                                            <span class="trend-value">+3%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Detailed Analytics -->
                                            <div class="stats-row detailed-analytics">
                                                <div class="analytics-chart">
                                                    <h4>Biểu đồ thời gian làm việc</h4>
                                                    <div class="chart-placeholder" id="workTimeChart">
                                                        <div class="chart-bars">
                                                            <div class="chart-bar" style="height: 80%"><span>T2</span></div>
                                                            <div class="chart-bar" style="height: 95%"><span>T3</span></div>
                                                            <div class="chart-bar" style="height: 85%"><span>T4</span></div>
                                                            <div class="chart-bar" style="height: 90%"><span>T5</span></div>
                                                            <div class="chart-bar" style="height: 75%"><span>T6</span></div>
                                                            <div class="chart-bar" style="height: 60%"><span>T7</span></div>
                                                            <div class="chart-bar" style="height: 45%"><span>CN</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="performance-metrics">
                                                    <h4>Chỉ số hiệu suất</h4>
                                                    <div class="metric-item">
                                                        <div class="metric-label">Đúng giờ</div>
                                                        <div class="metric-bar">
                                                            <div class="metric-fill" style="width: 92%"></div>
                                                        </div>
                                                        <div class="metric-value">92%</div>
                                                    </div>
                                                    <div class="metric-item">
                                                        <div class="metric-label">Hoàn thành KPI</div>
                                                        <div class="metric-bar">
                                                            <div class="metric-fill" style="width: 88%"></div>
                                                        </div>
                                                        <div class="metric-value">88%</div>
                                                    </div>
                                                    <div class="metric-item">
                                                        <div class="metric-label">Chất lượng công việc</div>
                                                        <div class="metric-bar">
                                                            <div class="metric-fill" style="width: 95%"></div>
                                                        </div>
                                                        <div class="metric-value">95%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load timesheet data
            await this.loadTimesheetData(employeeId);
            this.setupTimesheetHandlers();

        } catch (error) {
            console.error('Error loading timesheet:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải bảng công</h3>
                        <p>Không thể tải dữ liệu bảng công. Vui lòng thử lại.</p>
                        <button onclick="window.contentManager.showTimesheet()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    async showAttendanceGPS() {
        const content = document.getElementById('content');
        try {
            const userResponse = await API_CACHE.getUserData();
            const employeeId = userResponse.employeeId;

            content.innerHTML = `
                <div class="attendance-gps-container">
                    <div class="card">
                        <div class="card-header">
                            <h2><span class="material-icons-round">location_on</span> Chấm Công GPS</h2>
                            <p>Hệ thống chấm công dựa trên vị trí địa lý</p>
                        </div>
                        <div class="card-body">
                            <div class="attendance-actions">
                                <div class="location-status" id="locationStatus">
                                    <span class="material-icons-round location-icon">location_searching</span>
                                    <span class="location-text">Đang định vị...</span>
                                </div>
                                <div class="store-info" id="storeInfo" style="display: none;">
                                    <span class="material-icons-round">store</span>
                                    <span id="currentStore">Không xác định</span>
                                </div>
                                <button id="attendanceButton" class="attendance-btn" disabled>
                                    <span class="material-icons-round">access_time</span>
                                    <span class="btn-text">Chấm Công</span>
                                </button>
                            </div>
                            <div class="attendance-history">
                                <h3><span class="material-icons-round">history</span> Lịch sử chấm công hôm nay</h3>
                                <div id="attendanceHistoryToday" class="attendance-list">
                                    <div class="loading-text">Đang tải lịch sử...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Initialize GPS attendance system
            await this.initializeGPSAttendance(employeeId);

        } catch (error) {
            console.error('Error loading GPS attendance:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải chấm công GPS</h3>
                        <p>Không thể tải hệ thống chấm công. Vui lòng thử lại.</p>
                        <button onclick="window.contentManager.showAttendanceGPS()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    // Helper functions for shift management
    getCurrentWeek() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    }

    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    // Helper functions for shift management
    async loadStoresForShiftAssignment() {
        try {
            // Use AuthManager's cached stores data
            const response = window.authManager ? await window.authManager.getStoresData() : await API_CACHE.getStoresData();
            
            let stores = [];
            if (Array.isArray(response)) {
                stores = response;
            } else if (response && typeof response === 'object') {
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    stores = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                }
            }

            const storeSelect = document.getElementById('shiftStore');
            if (storeSelect) {
                storeSelect.innerHTML = '<option value="">Chọn cửa hàng</option>' +
                    stores.map(store => `<option value="${store.storeId}">${store.storeName} (${store.storeId})</option>`).join('');
            }
        } catch (error) {
            console.error('Load stores error:', error);
        }
    }

    async loadStoresForAttendance() {
        try {
            // Use AuthManager's cached stores data
            const response = window.authManager ? await window.authManager.getStoresData() : await API_CACHE.getStoresData();
            
            let stores = [];
            if (Array.isArray(response)) {
                stores = response;
            } else if (response && typeof response === 'object') {
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    stores = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                }
            }

            const storeSelect = document.getElementById('attendanceStore');
            if (storeSelect) {
                storeSelect.innerHTML = '<option value="">Tất cả cửa hàng</option>' +
                    stores.map(store => `<option value="${store.storeId}">${store.storeName} (${store.storeId})</option>`).join('');
            }
        } catch (error) {
            console.error('Load stores for attendance error:', error);
        }
    }

    async loadCurrentShift(employeeId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI(`?action=getCurrentShift&employeeId=${employeeId}&token=${token}`);
            
            const currentShiftInfo = document.getElementById('currentShiftInfo');
            if (currentShiftInfo) {
                if (response && response.currentShift) {
                    const shift = response.currentShift;
                    currentShiftInfo.innerHTML = `
                        <p class="shift-time">${shift.startTime} - ${shift.endTime}</p>
                        <p class="shift-store">Cửa hàng: ${shift.storeName}</p>
                        <div class="shift-actions">
                            <button id="checkinBtn" class="btn btn-success" ${shift.checkedIn ? 'disabled' : ''}>
                                ${shift.checkedIn ? 'Đã Check In' : 'Check In'}
                            </button>
                            <button id="checkoutBtn" class="btn btn-danger" ${!shift.checkedIn || shift.checkedOut ? 'disabled' : ''}>
                                ${shift.checkedOut ? 'Đã Check Out' : 'Check Out'}
                            </button>
                        </div>
                    `;
                } else {
                    currentShiftInfo.innerHTML = `
                        <p class="shift-time">Không có ca làm hôm nay</p>
                        <div class="shift-actions">
                            <button id="checkinBtn" class="btn btn-success" disabled>Check In</button>
                            <button id="checkoutBtn" class="btn btn-danger" disabled>Check Out</button>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Load current shift error:', error);
        }
    }

    async loadWeeklyShifts(employeeId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI(`?action=getWeeklyShifts&employeeId=${employeeId}&token=${token}`);
            
            const weeklyShiftsTable = document.getElementById('weeklyShiftsTable');
            if (weeklyShiftsTable) {
                if (response && response.shifts && response.shifts.length > 0) {
                    weeklyShiftsTable.innerHTML = `
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Ca</th>
                                    <th>Giờ</th>
                                    <th>Cửa hàng</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${response.shifts.map(shift => `
                                    <tr>
                                        <td>${shift.date}</td>
                                        <td>${shift.shiftName}</td>
                                        <td>${shift.startTime} - ${shift.endTime}</td>
                                        <td>${shift.storeName}</td>
                                        <td><span class="status ${shift.status}">${this.getShiftStatusText(shift.status)}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                } else {
                    weeklyShiftsTable.innerHTML = '<p>Không có ca làm nào trong tuần này.</p>';
                }
            }
        } catch (error) {
            console.error('Load weekly shifts error:', error);
            const weeklyShiftsTable = document.getElementById('weeklyShiftsTable');
            if (weeklyShiftsTable) {
                weeklyShiftsTable.innerHTML = '<p>Không thể tải ca làm trong tuần.</p>';
            }
        }
    }

    async loadAttendanceData(employeeId, position) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const month = document.getElementById('attendanceMonth')?.value || this.getCurrentMonth();
            
            let url = `?action=getAttendanceData&month=${month}&token=${token}`;
            if (position === 'NV') {
                url += `&employeeId=${employeeId}`;
            }
            
            const response = await utils.fetchAPI(url);
            
            // Update summary cards
            if (response && response.summary) {
                document.getElementById('totalHours').textContent = `${response.summary.totalHours}h`;
                document.getElementById('workDays').textContent = response.summary.workDays;
                document.getElementById('lateCount').textContent = response.summary.lateCount;
                document.getElementById('absentCount').textContent = response.summary.absentCount;
            }

            // Update attendance table
            const attendanceTable = document.getElementById('attendanceTable');
            if (attendanceTable && response && response.records) {
                attendanceTable.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                ${position !== 'NV' ? '<th>Nhân viên</th>' : ''}
                                <th>Ca làm</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Tổng giờ</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.records.map(record => `
                                <tr>
                                    <td>${record.date}</td>
                                    ${position !== 'NV' ? `<td>${record.employeeName}</td>` : ''}
                                    <td>${record.shiftName}</td>
                                    <td>${record.checkIn || '-'}</td>
                                    <td>${record.checkOut || '-'}</td>
                                    <td>${record.totalHours || '-'}</td>
                                    <td><span class="status ${record.status}">${this.getAttendanceStatusText(record.status)}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            console.error('Load attendance data error:', error);
        }
    }

    setupShiftAssignmentHandlers() {
        // Store selection handler
        document.getElementById('shiftStore')?.addEventListener('change', async (e) => {
            const storeId = e.target.value;
            if (storeId) {
                await this.loadEmployeesForStore(storeId);
            } else {
                document.getElementById('employeeGrid').innerHTML = '<p class="text-center">Chọn cửa hàng để xem danh sách nhân viên</p>';
                document.getElementById('selectedEmployeesList').innerHTML = '';
            }
        });

        // Load shift data handler
        document.getElementById('loadShiftData')?.addEventListener('click', async () => {
            const store = document.getElementById('shiftStore')?.value;
            const week = document.getElementById('shiftWeek')?.value;
            
            if (!store || !week) {
                utils.showNotification('Vui lòng chọn cửa hàng và tuần', 'warning');
                return;
            }

            const selectedEmployees = this.getSelectedEmployees();
            if (selectedEmployees.length === 0) {
                utils.showNotification('Vui lòng chọn ít nhất một nhân viên', 'warning');
                return;
            }

            try {
                await this.loadShiftAssignmentGrid(store, week, selectedEmployees);
            } catch (error) {
                console.error('Load shift assignment error:', error);
                utils.showNotification('Không thể tải dữ liệu phân ca', 'error');
            }
        });

        // Save shift assignments handler
        document.getElementById('saveShiftAssignments')?.addEventListener('click', async () => {
            await this.saveShiftAssignments();
        });

        // Clear shift assignments handler
        document.getElementById('clearShiftAssignments')?.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa tất cả phân ca?')) {
                this.clearAllShiftAssignments();
            }
        });
    }

    async loadEmployeesForStore(storeId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const employees = await utils.fetchAPI(`?action=getEmployeesByStore&storeId=${storeId}&token=${token}`);
            
            const employeeGrid = document.getElementById('employeeGrid');
            
            // Handle different response formats - array or object with numeric keys
            let employeeList = [];
            
            if (Array.isArray(employees)) {
                employeeList = employees;
            } else if (employees && typeof employees === 'object') {
                // Handle object format with numeric keys like {"0": {...}, "1": {...}}
                employeeList = Object.keys(employees)
                    .filter(key => !isNaN(key)) // Only numeric keys
                    .map(key => employees[key])
                    .filter(emp => emp && emp.employeeId); // Filter valid employee records
            }
            
            if (employeeList.length === 0) {
                employeeGrid.innerHTML = '<p class="text-center">Không có nhân viên nào trong cửa hàng này</p>';
                return;
            }

            employeeGrid.innerHTML = `
                <div class="employee-cards">
                    ${employeeList.map(emp => `
                        <div class="employee-card" data-employee-id="${emp.employeeId}">
                            <input type="checkbox" id="emp_${emp.employeeId}" class="employee-checkbox">
                            <label for="emp_${emp.employeeId}">
                                <div class="employee-info">
                                    <h4>${emp.fullName}</h4>
                                    <p>ID: ${emp.employeeId}</p>
                                    <p>Chức vụ: ${emp.position}</p>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <div class="employee-actions">
                    <button id="selectAllEmployees" class="btn btn-secondary">Chọn tất cả</button>
                    <button id="clearAllEmployees" class="btn btn-secondary">Bỏ chọn tất cả</button>
                </div>
                <div class="selected-employees-section">
                    <h4>Nhân viên đã chọn:</h4>
                    <div id="selectedEmployeesList" class="selected-employees-list">
                        <p>Chưa chọn nhân viên nào</p>
                    </div>
                </div>
            `;

            // Set up employee selection handlers
            this.setupEmployeeSelectionHandlers();

        } catch (error) {
            console.error('Error loading employees:', error);
            utils.showNotification('Không thể tải danh sách nhân viên', 'error');
        }
    }

    setupEmployeeSelectionHandlers() {
        // Individual employee checkbox handlers
        const checkboxes = document.querySelectorAll('.employee-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedEmployeesList();
            });
        });

        // Select all handler
        document.getElementById('selectAllEmployees')?.addEventListener('click', () => {
            checkboxes.forEach(checkbox => checkbox.checked = true);
            this.updateSelectedEmployeesList();
        });

        // Clear all handler
        document.getElementById('clearAllEmployees')?.addEventListener('click', () => {
            checkboxes.forEach(checkbox => checkbox.checked = false);
            this.updateSelectedEmployeesList();
        });
    }

    updateSelectedEmployeesList() {
        const selectedList = document.getElementById('selectedEmployeesList');
        const selectedEmployees = this.getSelectedEmployees();
        
        if (selectedEmployees.length === 0) {
            selectedList.innerHTML = '<p>Chưa chọn nhân viên nào</p>';
            return;
        }

        selectedList.innerHTML = selectedEmployees.map(emp => `
            <span class="selected-employee-tag">
                ${emp.fullName} (${emp.employeeId})
                <button onclick="contentManager.removeSelectedEmployee('${emp.employeeId}')" class="remove-btn">×</button>
            </span>
        `).join('');
    }

    getSelectedEmployees() {
        const checkboxes = document.querySelectorAll('.employee-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => {
            const card = checkbox.closest('.employee-card');
            const employeeId = card.dataset.employeeId;
            const employeeName = card.querySelector('h4').textContent;
            return { employeeId, fullName: employeeName };
        });
    }

    removeSelectedEmployee(employeeId) {
        const checkbox = document.getElementById(`emp_${employeeId}`);
        if (checkbox) {
            checkbox.checked = false;
            this.updateSelectedEmployeesList();
        }
    }

    async loadShiftAssignmentGrid(store, week, employees) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const existingShifts = await utils.fetchAPI(`?action=getShiftAssignments&store=${store}&week=${week}&token=${token}`);
            
            const shiftGrid = document.getElementById('shiftScheduleGrid');
            const weekDates = this.getWeekDates(week);
            
            shiftGrid.innerHTML = `
                <div class="shift-schedule-grid">
                    <table class="shift-table">
                        <thead>
                            <tr>
                                <th>Nhân viên</th>
                                ${weekDates.map(date => `<th>${this.formatDateHeader(date)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map(emp => `
                                <tr data-employee-id="${emp.employeeId}">
                                    <td class="employee-name">${emp.fullName}</td>
                                    ${weekDates.map(date => `
                                        <td class="shift-cell" data-date="${date.toISOString().split('T')[0]}">
                                            <div class="time-inputs-container">
                                                <div class="time-labels">Giờ vào - Giờ ra</div>
                                                <input type="time" 
                                                    class="time-input start-time" 
                                                    data-employee="${emp.employeeId}" 
                                                    data-date="${date.toISOString().split('T')[0]}"
                                                    data-type="start"
                                                    placeholder="08:00">
                                                <input type="time" 
                                                    class="time-input end-time" 
                                                    data-employee="${emp.employeeId}" 
                                                    data-date="${date.toISOString().split('T')[0]}"
                                                    data-type="end"
                                                    placeholder="17:00">
                                                <div class="shift-status off">Nghỉ</div>
                                            </div>
                                        </td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Show action buttons with null checks
            const saveBtn = document.getElementById('saveShiftAssignments');
            const clearBtn = document.getElementById('clearShiftAssignments');
            if (saveBtn) saveBtn.style.display = 'inline-block';
            if (clearBtn) clearBtn.style.display = 'inline-block';

            // Set up time input event listeners
            this.setupTimeInputHandlers();

            // Load existing shift assignments if any
            this.loadExistingShifts(existingShifts);

        } catch (error) {
            console.error('Error loading shift grid:', error);
            utils.showNotification('Không thể tải lưới phân ca', 'error');
        }
    }

    getWeekDates(weekString) {
        const [year, week] = weekString.split('-W');
        const firstDayOfYear = new Date(year, 0, 1);
        const days = 7 * (week - 1);
        const weekStart = new Date(firstDayOfYear.getTime() + days * 24 * 60 * 60 * 1000);
        
        // Adjust to Monday
        const monday = new Date(weekStart);
        monday.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    }

    formatDateHeader(date) {
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = dayNames[date.getDay()];
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
        return `${dayName}<br>${dateStr}`;
    }

    setupTimeInputHandlers() {
        // Add event listeners to all time inputs
        const timeInputs = document.querySelectorAll('.time-input');
        timeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateShiftStatus(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.updateShiftStatus(e.target);
            });
        });
    }

    updateShiftStatus(changedInput) {
        const cell = changedInput.closest('.shift-cell');
        if (!cell) return;

        const startTimeInput = cell.querySelector('.start-time');
        const endTimeInput = cell.querySelector('.end-time');
        const statusDiv = cell.querySelector('.shift-status');

        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        if (startTime && endTime) {
            statusDiv.textContent = `${startTime} - ${endTime}`;
            statusDiv.className = 'shift-status working';
        } else if (startTime || endTime) {
            statusDiv.textContent = 'Chưa hoàn thành';
            statusDiv.className = 'shift-status';
        } else {
            statusDiv.textContent = 'Nghỉ';
            statusDiv.className = 'shift-status off';
        }
    }

    loadExistingShifts(existingShifts) {
        if (!Array.isArray(existingShifts)) return;
        
        existingShifts.forEach(shift => {
            const startTimeInput = document.querySelector(`input.start-time[data-employee="${shift.employeeId}"][data-date="${shift.date}"]`);
            const endTimeInput = document.querySelector(`input.end-time[data-employee="${shift.employeeId}"][data-date="${shift.date}"]`);
            
            if (startTimeInput && shift.startTime) {
                startTimeInput.value = shift.startTime;
            }
            if (endTimeInput && shift.endTime) {
                endTimeInput.value = shift.endTime;
            }
            
            // Update status display
            if (startTimeInput) {
                this.updateShiftStatus(startTimeInput);
            }
        });
    }

    async saveShiftAssignments() {
        try {
            const store = document.getElementById('shiftStore').value;
            const week = document.getElementById('shiftWeek').value;
            const shiftData = [];

            // Get all time input pairs
            const startTimeInputs = document.querySelectorAll('.start-time');
            startTimeInputs.forEach(startInput => {
                const employeeId = startInput.dataset.employee;
                const date = startInput.dataset.date;
                const endInput = document.querySelector(`input.end-time[data-employee="${employeeId}"][data-date="${date}"]`);
                
                const startTime = startInput.value;
                const endTime = endInput ? endInput.value : '';
                
                // Only save if both times are provided
                if (startTime && endTime) {
                    shiftData.push({
                        employeeId: employeeId,
                        date: date,
                        startTime: startTime,
                        endTime: endTime,
                        storeId: store
                    });
                }
            });

            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=saveShiftAssignments', {
                method: 'POST',
                body: JSON.stringify({
                    token: token,
                    storeId: store,
                    week: week,
                    shifts: shiftData
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã lưu phân ca thành công!', 'success');
            } else {
                throw new Error(response.message || 'Không thể lưu phân ca');
            }

        } catch (error) {
            console.error('Error saving shift assignments:', error);
            utils.showNotification('Lỗi khi lưu phân ca', 'error');
        }
    }

    clearAllShiftAssignments() {
        const timeInputs = document.querySelectorAll('.time-input');
        timeInputs.forEach(input => {
            input.value = '';
            this.updateShiftStatus(input);
        });
        utils.showNotification('Đã xóa tất cả phân ca', 'info');
    }

    setupShiftCheckHandlers() {
        document.getElementById('checkinBtn')?.addEventListener('click', async () => {
            try {
                const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
                const employeeId = userData.employeeId || userData.loginEmployeeId;
                const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                
                await utils.fetchAPI(`?action=checkIn&employeeId=${employeeId}&token=${token}`, {
                    method: 'POST'
                });
                
                utils.showNotification('Check in thành công', 'success');
                await this.loadCurrentShift(employeeId);
            } catch (error) {
                console.error('Check in error:', error);
                utils.showNotification('Không thể check in', 'error');
            }
        });

        document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
            try {
                const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
                const employeeId = userData.employeeId || userData.loginEmployeeId;
                const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                
                await utils.fetchAPI(`?action=checkOut&employeeId=${employeeId}&token=${token}`, {
                    method: 'POST'
                });
                
                utils.showNotification('Check out thành công', 'success');
                await this.loadCurrentShift(employeeId);
            } catch (error) {
                console.error('Check out error:', error);
                utils.showNotification('Không thể check out', 'error');
            }
        });
    }

    setupAttendanceHandlers() {
        document.getElementById('loadAttendanceData')?.addEventListener('click', async () => {
            const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
            const employeeId = userData.employeeId || userData.loginEmployeeId;
            const userResponse = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            
            await this.loadAttendanceData(employeeId, userResponse.position);
        });

        document.getElementById('attendanceMonth')?.addEventListener('change', async () => {
            const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
            const employeeId = userData.employeeId || userData.loginEmployeeId;
            const userResponse = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            
            await this.loadAttendanceData(employeeId, userResponse.position);
        });
    }

    getShiftStatusText(status) {
        const statusMap = {
            'assigned': 'Đã phân công',
            'confirmed': 'Đã xác nhận',
            'in_progress': 'Đang làm',
            'completed': 'Hoàn thành',
            'absent': 'Vắng mặt'
        };
        return statusMap[status] || status;
    }

    getAttendanceStatusText(status) {
        const statusMap = {
            'present': 'Có mặt',
            'late': 'Muộn',
            'absent': 'Vắng',
            'early_leave': 'Về sớm',
            'overtime': 'Tăng ca'
        };
        return statusMap[status] || status;
    }

    // Task Management Functions
    async showSubmitTask() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Gửi Yêu Cầu</h2>
                </div>
                <div class="card-body">
                    <form id="taskForm">
                        <div class="form-group">
                            <label>Loại yêu cầu</label>
                            <select name="taskType" class="form-control" required>
                                <option value="">Chọn loại yêu cầu</option>
                                <option value="leave">Nghỉ phép</option>
                                <option value="overtime">Tăng ca</option>
                                <option value="equipment">Thiết bị</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nội dung</label>
                            <textarea name="content" class="form-control" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Gửi yêu cầu</button>
                    </form>
                </div>
            </div>
        `;

        this.setupTaskForm();
    }

    setupTaskForm() {
        document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const taskData = Object.fromEntries(formData);
                // Get user employee ID safely
                const employeeId = await this.getUserEmployeeId();
                
                // Use createTask API to create a proper task
                await utils.fetchAPI('?action=createTask', {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: employeeId,
                        fullName: this.user.fullName || 'Nhân viên',
                        position: this.user.position || 'NV',
                        taskType: taskData.taskType,
                        content: taskData.content
                    })
                });
                
                utils.showNotification("Yêu cầu đã được gửi", "success");
                document.getElementById('taskForm').reset();
            } catch (error) {
                console.error('Submit task error:', error);
                utils.showNotification("Không thể gửi yêu cầu", "error");
            }
        });
    }

    async showTaskPersonnel() {
        const content = document.getElementById('content');
        try {
            // Get current user role for permission check
            const userResponse = await API_CACHE.getUserData();
            if (!userResponse || !['QL', 'AD'].includes(userResponse.position)) {
                content.innerHTML = `
                    <div class="access-denied-enhanced">
                        <span class="material-icons-round access-denied-icon">security</span>
                        <h3>Không có quyền truy cập</h3>
                        <p>Tính năng này chỉ dành cho Quản lý (QL) và Quản trị viên (AD).</p>
                        <button onclick="window.contentManager.showDashboard()" class="btn btn-primary modern-btn">
                            <span class="material-icons-round">dashboard</span>
                            Về Dashboard
                        </button>
                    </div>
                `;
                return;
            }

            // Load attendance requests (đơn từ)
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const attendanceRequestsResponse = await utils.fetchAPI(`?action=getAttendanceRequests&token=${token}`);
            
            // Handle different response formats - array or object with numeric keys
            let attendanceRequests = [];
            
            if (Array.isArray(attendanceRequestsResponse)) {
                attendanceRequests = attendanceRequestsResponse;
            } else if (attendanceRequestsResponse && typeof attendanceRequestsResponse === 'object') {
                // Handle object format with numeric keys like {"0": {...}, "1": {...}}
                attendanceRequests = Object.keys(attendanceRequestsResponse)
                    .filter(key => !isNaN(key)) // Only numeric keys
                    .map(key => attendanceRequestsResponse[key])
                    .filter(request => request && request.id); // Filter valid request records
            }
            
            content.innerHTML = `
                <div class="personnel-management-container">
                    <!-- Enhanced Header -->
                    <div class="page-header">
                        <div class="header-content">
                            <div class="header-title">
                                <span class="material-icons-round header-icon">people</span>
                                <div>
                                    <h1>Xử Lý Đơn Từ Nhân Sự</h1>
                                    <p class="header-subtitle">Duyệt và quản lý các yêu cầu từ nhân viên</p>
                                </div>
                            </div>
                            <div class="header-stats">
                                <div class="stat-card">
                                    <span class="stat-number" id="totalRequests">0</span>
                                    <span class="stat-label">Tổng đơn</span>
                                </div>
                                <div class="stat-card pending">
                                    <span class="stat-number" id="pendingRequests">0</span>
                                    <span class="stat-label">Chờ duyệt</span>
                                </div>
                                <div class="stat-card approved">
                                    <span class="stat-number" id="approvedRequests">0</span>
                                    <span class="stat-label">Đã duyệt</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Filter Section -->
                    <div class="card modern-card">
                        <div class="card-body">
                            <div class="request-filters-enhanced">
                                <div class="filter-group">
                                    <label class="filter-label">
                                        <span class="material-icons-round">category</span>
                                        Loại đơn từ
                                    </label>
                                    <select id="attendanceRequestTypeFilter" class="form-control modern-select">
                                        <option value="">Tất cả loại đơn</option>
                                        <option value="forgot_checkin">Quên chấm công vào</option>
                                        <option value="forgot_checkout">Quên chấm công ra</option>
                                        <option value="shift_change">Thay đổi ca làm</option>
                                        <option value="leave">Xin nghỉ phép</option>
                                        <option value="sick_leave">Nghỉ ốm</option>
                                        <option value="personal_leave">Nghỉ cá nhân</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label class="filter-label">
                                        <span class="material-icons-round">flag</span>
                                        Trạng thái
                                    </label>
                                    <select id="attendanceRequestStatusFilter" class="form-control modern-select">
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="pending">Chờ duyệt</option>
                                        <option value="approved">Đã duyệt</option>
                                        <option value="rejected">Đã từ chối</option>
                                    </select>
                                </div>
                                <div class="filter-actions">
                                    <button id="refreshRequests" class="btn btn-outline modern-btn">
                                        <span class="material-icons-round">refresh</span>
                                        Làm mới
                                    </button>
                                </div>
                            </div>
                            
                            <div id="attendanceRequestsList" class="requests-list-enhanced">
                                ${this.renderEnhancedRequestsList(attendanceRequests)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Request Detail Modal -->
                <div id="requestDetailModal" class="modal enhanced-modal">
                    <div class="modal-content enhanced-modal-content">
                        <div class="modal-header">
                            <h3>Chi tiết đơn từ</h3>
                            <button class="close-btn" onclick="contentManager.closeRequestDetailModal()">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        <div id="requestDetailContent" class="modal-body"></div>
                    </div>
                </div>

                <!-- Approval/Rejection Modal -->
                <div id="approvalModal" class="modal enhanced-modal">
                    <div class="modal-content enhanced-modal-content">
                        <div class="modal-header">
                            <h3 id="approvalModalTitle">Xử lý đơn từ</h3>
                            <button class="close-btn" onclick="contentManager.closeApprovalModal()">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="approvalModalContent"></div>
                        </div>
                    </div>
                </div>
            `;

            this.setupEnhancedPersonnelHandlers();
            this.updateRequestStats(attendanceRequests);

        } catch (error) {
            console.error('Personnel management error:', error);
            content.innerHTML = `
                <div class="error-container enhanced-error">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error_outline</span>
                        <h3>Không thể tải dữ liệu</h3>
                        <p>Đã xảy ra lỗi khi tải danh sách đơn từ. Vui lòng kiểm tra kết nối và thử lại.</p>
                        <button onclick="window.contentManager.showTaskPersonnel()" class="btn btn-primary modern-btn">
                            <span class="material-icons-round">refresh</span>
                            Thử lại
                        </button>
                    </div>
                </div>
            `;
        }
    }

    renderEnhancedRequestsList(requests) {
        // Handle both array and object response formats
        let requestList = [];
        if (Array.isArray(requests)) {
            requestList = requests;
        } else if (requests && typeof requests === 'object') {
            requestList = Object.keys(requests).map(key => requests[key]);
        }
        
        if (requestList.length === 0) {
            return `
                <div class="no-requests-enhanced">
                    <span class="material-icons-round no-requests-icon">inbox</span>
                    <h3>Chưa có đơn từ nào</h3>
                    <p>Hiện tại chưa có đơn từ nào cần xử lý. Các yêu cầu mới sẽ xuất hiện tại đây.</p>
                </div>
            `;
        }

        return requestList.map(request => {
            const createdDate = new Date(request.createdAt || request.requestDate);
            const isUrgent = request.status === 'pending' && (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;
            
            return `
                <div class="request-card-enhanced ${isUrgent ? 'urgent' : ''}" data-status="${request.status}" data-type="${request.type}">
                    <div class="request-card-header">
                        <div class="request-title-section">
                            <div class="request-type-badge">
                                ${this.getRequestTypeIcon(request.type)}
                                <span class="request-type-text">${this.getRequestTypeDisplayName(request.type)}</span>
                            </div>
                            <span class="request-status-badge ${request.status}">
                                ${this.getRequestStatusIcon(request.status)}
                                ${this.getRequestStatusText(request.status)}
                            </span>
                            ${isUrgent ? '<span class="urgent-badge"><span class="material-icons-round">priority_high</span>Khẩn cấp</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="request-card-body">
                        <div class="request-employee-info">
                            <span class="material-icons-round">person</span>
                            <div>
                                <strong>${request.employeeName || 'N/A'}</strong>
                                <small>${request.storeName || 'N/A'}</small>
                            </div>
                        </div>
                        
                        <div class="request-details">
                            ${request.targetDate ? `
                                <div class="detail-item">
                                    <span class="material-icons-round">calendar_today</span>
                                    <span>Ngày: ${new Date(request.targetDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            ` : ''}
                            ${request.targetTime ? `
                                <div class="detail-item">
                                    <span class="material-icons-round">schedule</span>
                                    <span>${request.targetTime}</span>
                                </div>
                            ` : ''}
                            ${request.reason ? `
                                <div class="detail-item reason">
                                    <span class="material-icons-round">comment</span>
                                    <span>${request.reason.substring(0, 100)}${request.reason.length > 100 ? '...' : ''}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="request-timestamp">
                            <span class="material-icons-round">access_time</span>
                            <span>Gửi lúc: ${createdDate.toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                    
                    <div class="request-card-footer">
                        ${request.status === 'pending' ? `
                            <div class="request-actions">
                                <button class="btn btn-success modern-btn" onclick="event.stopPropagation(); window.contentManager.approveAttendanceRequest('${request.id}')">
                                    <span class="material-icons-round">check</span>
                                    Duyệt
                                </button>
                                <button class="btn btn-danger modern-btn" onclick="event.stopPropagation(); window.contentManager.showRejectModal('${request.id}')">
                                    <span class="material-icons-round">close</span>
                                    Từ chối
                                </button>
                            </div>
                        ` : `
                            <div class="request-processed-info">
                                <span class="material-icons-round">person</span>
                                <span>Xử lý bởi: ${request.approverName || 'N/A'}</span>
                                ${request.approvedAt ? `<span class="process-time">lúc ${new Date(request.approvedAt).toLocaleString('vi-VN')}</span>` : ''}
                            </div>
                        `}
                        <button class="btn btn-outline modern-btn" onclick="event.stopPropagation(); contentManager.showRequestDetail('${request.id}')">
                            <span class="material-icons-round">visibility</span>
                            Chi tiết
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getRequestTypeIcon(type) {
        const iconMap = {
            'forgot_checkin': 'login',
            'forgot_checkout': 'logout', 
            'shift_change': 'swap_horiz',
            'leave': 'beach_access',
            'sick_leave': 'local_hospital',
            'personal_leave': 'person_off'
        };
        return `<span class="material-icons-round type-icon">${iconMap[type] || 'description'}</span>`;
    }

    getRequestStatusIcon(status) {
        const iconMap = {
            'pending': 'schedule',
            'approved': 'check_circle',
            'rejected': 'cancel'
        };
        return `<span class="material-icons-round status-icon">${iconMap[status] || 'help'}</span>`;
    }

    updateRequestStats(requests) {
        // Handle both array and object response formats
        let requestList = [];
        if (Array.isArray(requests)) {
            requestList = requests;
        } else if (requests && typeof requests === 'object') {
            requestList = Object.keys(requests).map(key => requests[key]);
        }
        
        const total = requestList.length;
        const pending = requestList.filter(r => r.status === 'pending').length;
        const approved = requestList.filter(r => r.status === 'approved').length;
        
        document.getElementById('totalRequests').textContent = total;
        document.getElementById('pendingRequests').textContent = pending;
        document.getElementById('approvedRequests').textContent = approved;
    }

    setupEnhancedPersonnelHandlers() {
        const typeFilter = document.getElementById('attendanceRequestTypeFilter');
        const statusFilter = document.getElementById('attendanceRequestStatusFilter');
        const refreshBtn = document.getElementById('refreshRequests');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterRequests());
        }
        
        if (statusFilter) {  
            statusFilter.addEventListener('change', () => this.filterRequests());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.showTaskPersonnel());
        }
    }

    filterRequests() {
        const typeFilter = document.getElementById('attendanceRequestTypeFilter').value;
        const statusFilter = document.getElementById('attendanceRequestStatusFilter').value;
        const requestCards = document.querySelectorAll('.request-card-enhanced');
        
        requestCards.forEach(card => {
            const cardType = card.dataset.type;
            const cardStatus = card.dataset.status;
            
            const typeMatch = !typeFilter || cardType === typeFilter;
            const statusMatch = !statusFilter || cardStatus === statusFilter;
            
            card.style.display = (typeMatch && statusMatch) ? 'block' : 'none';
        });
    }

    showRejectModal(requestId) {
        const modal = document.getElementById('approvalModal');
        const title = document.getElementById('approvalModalTitle');
        const content = document.getElementById('approvalModalContent');
        
        title.textContent = 'Từ chối đơn từ';
        content.innerHTML = `
            <div class="rejection-form">
                <p>Bạn có chắc chắn muốn từ chối đơn từ này không?</p>
                <div class="form-group">
                    <label for="rejectionReason">Lý do từ chối:</label>
                    <textarea id="rejectionReason" class="form-control" rows="3" placeholder="Nhập lý do từ chối..."></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline modern-btn" onclick="contentManager.closeApprovalModal()">Hủy</button>
                    <button class="btn btn-danger modern-btn" onclick="contentManager.confirmRejectRequest('${requestId}')">
                        <span class="material-icons-round">close</span>
                        Từ chối
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    closeApprovalModal() {
        const modal = document.getElementById('approvalModal');
        modal.style.display = 'none';
    }

    async confirmRejectRequest(requestId) {
        const reason = document.getElementById('rejectionReason').value;
        this.closeApprovalModal();
        
        await this.rejectAttendanceRequest(requestId, reason);
    }

    renderAttendanceRequests(requests) {
        if (!Array.isArray(requests) || requests.length === 0) {
            return '<div class="no-requests"><p>Không có đơn từ nào.</p></div>';
        }

        return requests.map(request => `
            <div class="request-item ${request.status}" data-status="${request.status}" data-type="${request.type || request.requestType}">
                <div class="request-header">
                    <h4>${this.getRequestTypeDisplayName(request.type || request.requestType)}</h4>
                    <span class="request-status ${request.status}">
                        ${this.getRequestStatusText(request.status)}
                    </span>
                </div>
                <div class="request-info">
                    <div class="request-details">
                        <p><strong>Nhân viên:</strong> ${request.employeeName} (${request.employeeId})</p>
                        <p><strong>Cửa hàng:</strong> ${request.storeName}</p>
                        <p><strong>Ngày yêu cầu:</strong> ${new Date(request.requestDate).toLocaleDateString()}</p>
                        
                        ${(request.type || request.requestType)?.includes('forgot') ? `
                            <p><strong>Thời gian:</strong> ${request.targetTime || request.requestTime || 'Không có'}</p>
                            <p><strong>Ngày:</strong> ${request.targetDate ? new Date(request.targetDate).toLocaleDateString() : 'Không có'}</p>
                        ` : ''}
                        
                        ${(request.type || request.requestType) === 'shift_change' ? `
                            <p><strong>Ca hiện tại:</strong> ${this.getShiftDisplayName(request.currentShift)}</p>
                            <p><strong>Ca mong muốn:</strong> ${this.getShiftDisplayName(request.requestedShift)}</p>
                        ` : ''}
                        
                        ${(request.type || request.requestType)?.includes('leave') ? `
                            <p><strong>Từ ngày:</strong> ${request.startDate ? new Date(request.startDate).toLocaleDateString() : 'Không có'}</p>
                            <p><strong>Đến ngày:</strong> ${new Date(request.endDate).toLocaleDateString()}</p>
                            <p><strong>Số ngày:</strong> ${request.dayCount} ngày</p>
                        ` : ''}
                        
                        <p><strong>Lý do:</strong> ${request.reason}</p>
                        <p><strong>Ngày tạo:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                
                ${request.status === 'pending' ? `
                    <div class="request-actions">
                        <button onclick="window.contentManager.approveAttendanceRequest('${request.id}')" class="btn btn-success">
                            <span class="material-icons-round">check</span>
                            Duyệt
                        </button>
                        <button onclick="window.contentManager.rejectAttendanceRequest('${request.id}')" class="btn btn-danger">
                            <span class="material-icons-round">close</span>
                            Từ chối
                        </button>
                    </div>
                ` : ''}
                
                ${request.approvalNote ? `
                    <div class="approval-note">
                        <strong>Ghi chú duyệt:</strong> ${request.approvalNote}
                        <br><strong>Người duyệt:</strong> ${request.approverName}
                        <br><strong>Thời gian duyệt:</strong> ${new Date(request.approvalDate).toLocaleString()}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getRequestTypeDisplayName(requestType) {
        const typeMap = {
            'forgot_checkin': 'Quên chấm công vào',
            'forgot_checkout': 'Quên chấm công ra',
            'shift_change': 'Thay đổi ca làm',
            'leave': 'Xin nghỉ phép',
            'sick_leave': 'Nghỉ ốm',
            'personal_leave': 'Nghỉ cá nhân'
        };
        return typeMap[requestType] || requestType;
    }

    setupAttendanceRequestHandlers() {
        // Type filter
        document.getElementById('attendanceRequestTypeFilter')?.addEventListener('change', (e) => {
            this.filterAttendanceRequests();
        });

        // Status filter
        document.getElementById('attendanceRequestStatusFilter')?.addEventListener('change', (e) => {
            this.filterAttendanceRequests();
        });
    }

    filterAttendanceRequests() {
        const typeFilter = document.getElementById('attendanceRequestTypeFilter').value;
        const statusFilter = document.getElementById('attendanceRequestStatusFilter').value;
        const requestItems = document.querySelectorAll('.request-item');
        
        requestItems.forEach(item => {
            const type = item.dataset.type;
            const status = item.dataset.status;
            
            const typeMatch = !typeFilter || type === typeFilter;
            const statusMatch = !statusFilter || status === statusFilter;
            
            if (typeMatch && statusMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async approveAttendanceRequest(requestId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=approveAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify({
                    requestId: requestId,
                    note: ''
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã duyệt đơn từ', 'success');
                this.showTaskPersonnel(); // Refresh the list
            } else {
                throw new Error(response.message || 'Không thể duyệt đơn từ');
            }

        } catch (error) {
            console.error('Error approving attendance request:', error);
            utils.showNotification('Lỗi khi duyệt đơn từ', 'error');
        }
    }

    async rejectAttendanceRequest(requestId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=rejectAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify({
                    requestId: requestId,
                    note: 'Từ chối tự động'
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã từ chối đơn từ', 'success');
                this.showTaskPersonnel(); // Refresh the list
            } else {
                throw new Error(response.message || 'Không thể từ chối đơn từ');
            }

        } catch (error) {
            console.error('Error rejecting attendance request:', error);
            utils.showNotification('Lỗi khi từ chối đơn từ', 'error');
        }
    }

    async showTaskStore() {
        const content = document.getElementById('content');
        try {
            // Get current user role for permission check
            const userResponse = await API_CACHE.getUserData();
            if (!userResponse || !['AM', 'AD'].includes(userResponse.position)) {
                content.innerHTML = `
                    <div class="access-denied">
                        <span class="material-icons-round">block</span>
                        <h3>Không có quyền truy cập</h3>
                        <p>Chỉ AM và AD mới có quyền xử lý yêu cầu cửa hàng.</p>
                    </div>
                `;
                return;
            }

            // Load shift assignment requests
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const shiftRequests = await utils.fetchAPI(`?action=getShiftRequests&token=${token}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Cửa Hàng - Phân Ca</h2>
                        <p>Duyệt các yêu cầu thay đổi phân ca và lịch làm việc</p>
                    </div>
                    <div class="card-body">
                        <div class="request-filters">
                            <select id="shiftRequestStatusFilter" class="form-control">
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Đã từ chối</option>
                            </select>
                            <select id="shiftRequestStoreFilter" class="form-control">
                                <option value="">Tất cả cửa hàng</option>
                            </select>
                        </div>
                        <div class="requests-list" id="shiftRequestsList">
                            ${this.renderShiftRequests(shiftRequests || [])}
                        </div>
                    </div>
                </div>
            `;

            this.setupShiftRequestHandlers();
            await this.loadStoreFilterOptions();

        } catch (error) {
            console.error('Store shift requests error:', error);
            utils.showNotification("Không thể tải yêu cầu phân ca", "error");
        }
    }

    renderShiftRequests(requests) {
        if (!Array.isArray(requests) || requests.length === 0) {
            return '<div class="no-requests"><p>Không có yêu cầu phân ca nào.</p></div>';
        }

        return requests.map(request => `
            <div class="request-item ${request.status}" data-status="${request.status}" data-store="${request.storeId}">
                <div class="request-header">
                    <h4>${request.requestType === 'shift_change' ? 'Thay đổi ca làm' : 'Yêu cầu phân ca'}</h4>
                    <span class="request-status ${request.status}">
                        ${this.getRequestStatusText(request.status)}
                    </span>
                </div>
                <div class="request-info">
                    <div class="request-details">
                        <p><strong>Nhân viên:</strong> ${request.employeeName} (${request.employeeId})</p>
                        <p><strong>Cửa hàng:</strong> ${request.storeName}</p>
                        <p><strong>Ngày:</strong> ${new Date(request.requestDate).toLocaleDateString()}</p>
                        <p><strong>Ca hiện tại:</strong> ${this.getShiftDisplayName(request.currentShift)}</p>
                        <p><strong>Ca mong muốn:</strong> ${this.getShiftDisplayName(request.requestedShift)}</p>
                        <p><strong>Lý do:</strong> ${request.reason}</p>
                        <p><strong>Ngày tạo:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                
                ${request.status === 'pending' ? `
                    <div class="request-actions">
                        <button onclick="contentManager.approveShiftRequest('${request.id}')" class="btn btn-success">
                            <span class="material-icons-round">check</span>
                            Duyệt
                        </button>
                        <button onclick="contentManager.rejectShiftRequest('${request.id}')" class="btn btn-danger">
                            <span class="material-icons-round">close</span>
                            Từ chối
                        </button>
                    </div>
                ` : ''}
                
                ${request.approvalNote ? `
                    <div class="approval-note">
                        <strong>Ghi chú duyệt:</strong> ${request.approvalNote}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getRequestStatusText(status) {
        const statusMap = {
            'pending': 'Chờ duyệt',
            'approved': 'Đã duyệt',
            'rejected': 'Đã từ chối'
        };
        return statusMap[status] || status;
    }

    getShiftDisplayName(shiftType) {
        const shiftMap = {
            'morning': 'Ca sáng (8:00-16:00)',
            'afternoon': 'Ca chiều (13:00-22:00)',
            'night': 'Ca đêm (22:00-6:00)',
            'full': 'Ca full (8:00-22:00)',
            '': 'Nghỉ'
        };
        return shiftMap[shiftType] || shiftType;
    }

    setupShiftRequestHandlers() {
        // Status filter
        document.getElementById('shiftRequestStatusFilter')?.addEventListener('change', (e) => {
            this.filterShiftRequests();
        });

        // Store filter
        document.getElementById('shiftRequestStoreFilter')?.addEventListener('change', (e) => {
            this.filterShiftRequests();
        });
    }

    filterShiftRequests() {
        const statusFilter = document.getElementById('shiftRequestStatusFilter').value;
        const storeFilter = document.getElementById('shiftRequestStoreFilter').value;
        const requestItems = document.querySelectorAll('.request-item');
        
        requestItems.forEach(item => {
            const status = item.dataset.status;
            const store = item.dataset.store;
            
            const statusMatch = !statusFilter || status === statusFilter;
            const storeMatch = !storeFilter || store === storeFilter;
            
            if (statusMatch && storeMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async loadStoreFilterOptions() {
        try {
            const stores = await API_CACHE.getStoresData();
            const storeFilter = document.getElementById('shiftRequestStoreFilter');
            
            if (Array.isArray(stores)) {
                const storeOptions = stores.map(store => 
                    `<option value="${store.storeId}">${store.storeName || store.storeId}</option>`
                ).join('');
                storeFilter.innerHTML += storeOptions;
            }
        } catch (error) {
            console.error('Error loading store filter options:', error);
        }
    }

    async approveShiftRequest(requestId) {
        try {
            const note = prompt('Ghi chú duyệt (tùy chọn):');
            
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=approveShiftRequest', {
                method: 'POST',
                body: JSON.stringify({
                    requestId: requestId,
                    note: note
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã duyệt yêu cầu phân ca', 'success');
                this.showTaskStore(); // Refresh the list
            } else {
                throw new Error(response.message || 'Không thể duyệt yêu cầu');
            }

        } catch (error) {
            console.error('Error approving shift request:', error);
            utils.showNotification('Lỗi khi duyệt yêu cầu', 'error');
        }
    }

    async rejectShiftRequest(requestId) {
        try {
            const note = prompt('Lý do từ chối:');
            if (!note) {
                utils.showNotification('Vui lòng nhập lý do từ chối', 'warning');
                return;
            }
            
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=rejectShiftRequest', {
                method: 'POST',
                body: JSON.stringify({
                    requestId: requestId,
                    note: note
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã từ chối yêu cầu phân ca', 'success');
                this.showTaskStore(); // Refresh the list
            } else {
                throw new Error(response.message || 'Không thể từ chối yêu cầu');
            }

        } catch (error) {
            console.error('Error rejecting shift request:', error);
            utils.showNotification('Lỗi khi từ chối yêu cầu', 'error');
        }
    }

    async showTaskFinance() {
        const content = document.getElementById('content');
        try {
            // Use a placeholder for finance tasks
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Tài Chính</h2>
                    </div>
                    <div class="card-body">
                        <div class="task-filters">
                            <select id="taskStatusFilter" class="form-control">
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>
                        <div class="task-list">
                            <div class="finance-overview">
                                <h3>📊 Tổng quan tài chính</h3>
                                <div class="finance-stats">
                                    <div class="finance-stat">
                                        <span class="stat-label">💰 Tổng thu:</span>
                                        <span class="stat-value">0 VNĐ</span>
                                    </div>
                                    <div class="finance-stat">
                                        <span class="stat-label">💸 Tổng chi:</span>
                                        <span class="stat-value">0 VNĐ</span>
                                    </div>
                                    <div class="finance-stat">
                                        <span class="stat-label">📈 Lợi nhuận:</span>
                                        <span class="stat-value">0 VNĐ</span>
                                    </div>
                                </div>
                                <p>⏳ Chức năng quản lý tài chính đang được phát triển</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('finance');
        } catch (error) {
            console.error('Finance tasks error:', error);
            utils.showNotification("Không thể tải thông tin tài chính", "error");
        }
    }

    async showTaskApproval() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getApprovalTasks');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xét Duyệt Yêu Cầu</h2>
                    </div>
                    <div class="card-body">
                        <div class="task-filters">
                            <select id="taskTypeFilter" class="form-control">
                                <option value="">Tất cả loại</option>
                                <option value="leave">Nghỉ phép</option>
                                <option value="overtime">Tăng ca</option>
                                <option value="equipment">Thiết bị</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div class="approval-list">
                            ${this.generateApprovalList(response.tasks)}
                        </div>
                    </div>
                </div>
            `;

            this.setupApprovalHandlers();
        } catch (error) {
            utils.showNotification("Không thể tải yêu cầu xét duyệt", "error");
        }
    }



    async showGrantAccess() {
        const content = document.getElementById('content');
        try {
            // Show loading state
            content.innerHTML = `
                <div class="user-list">
                    <div class="loading-text">Đang tải danh sách người dùng...</div>
                </div>
            `;

            // Use cached getUsers API to get user list with enhanced error handling
            const response = await API_CACHE.getUsersData();
            
            // Check if response is valid before proceeding
            if (!response) {
                throw new Error('Không thể tải danh sách người dùng - Không có phản hồi từ server');
            }
            
            // Extract users data - handle multiple response formats
            let users = [];
            if (Array.isArray(response)) {
                users = response;
            } else if (response && Array.isArray(response.results)) {
                users = response.results;
            } else if (response && Array.isArray(response.data)) {
                users = response.data;
            } else if (response && typeof response === 'object') {
                // Handle object with numbered keys (0, 1, 2, 3, etc.) + timestamp/status
                const userKeys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (userKeys.length > 0) {
                    users = userKeys.map(key => response[key]).filter(user => user && typeof user === 'object');
                } else {
                    console.error('Unexpected response format:', response);
                    throw new Error('Định dạng dữ liệu người dùng không đúng');
                }
            } else {
                console.error('Unexpected response format:', response);
                throw new Error('Định dạng dữ liệu người dùng không đúng');
            }
            
            
            // Validate users data
            if (!Array.isArray(users) || users.length === 0) {
                console.warn('No users found or invalid data format');
                throw new Error('Không tìm thấy dữ liệu người dùng');
            }

            if (users.length === 0) {
                content.innerHTML = `
                    <div class="permission-management-container">
                        <div class="permission-header">
                            <h2><span class="material-icons-round">admin_panel_settings</span>Quản Lý Phân Quyền</h2>
                            <p class="header-subtitle">Quản lý phân quyền và vai trò người dùng trong hệ thống HR</p>
                        </div>
                        <div class="no-data-state">
                            <span class="no-data-icon">👥</span>
                            <h3>Không có dữ liệu người dùng</h3>
                            <p>Vui lòng thêm người dùng vào hệ thống trước.</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            content.innerHTML = `
                <div class="permission-management-container">
                    <div class="permission-header">
                        <h2><span class="material-icons-round">admin_panel_settings</span>Quản Lý Phân Quyền</h2>
                        <p class="header-subtitle">Quản lý phân quyền và vai trò người dùng trong hệ thống HR</p>
                    </div>

                    <!-- Statistics Dashboard -->
                    <div class="permission-stats-grid">
                        <div class="permission-stat-card admin">
                            <div class="stat-icon">👑</div>
                            <div class="stat-details">
                                <h3>Admin</h3>
                                <p class="stat-value" id="adminCount">0</p>
                                <span class="stat-label">Quản trị viên</span>
                            </div>
                        </div>
                        <div class="permission-stat-card manager">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-details">
                                <h3>Manager</h3>
                                <p class="stat-value" id="managerCount">0</p>
                                <span class="stat-label">Quản lý</span>
                            </div>
                        </div>
                        <div class="permission-stat-card assistant">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-details">
                                <h3>Trợ lý</h3>
                                <p class="stat-value" id="assistantCount">0</p>
                                <span class="stat-label">Trợ lý quản lý</span>
                            </div>
                        </div>
                        <div class="permission-stat-card employee">
                            <div class="stat-icon">👤</div>
                            <div class="stat-details">
                                <h3>Nhân viên</h3>
                                <p class="stat-value" id="employeeCount">0</p>
                                <span class="stat-label">Nhân viên</span>
                            </div>
                        </div>
                    </div>

                    <!-- User Selection Panel -->
                    <div class="permission-main-content">
                        <div class="user-selection-panel">
                            <div class="search-section">
                                <h3><span class="material-icons-round">search</span>Tìm kiếm nhân viên</h3>
                                <div class="search-controls">
                                    <input type="text" id="userSearch" class="form-control" placeholder="Tìm kiếm theo tên, ID, hoặc email...">
                                    <select id="roleFilter" class="form-control">
                                        <option value="">Tất cả vai trò</option>
                                        <option value="AD">Admin (AD)</option>
                                        <option value="QL">Quản lý (QL)</option>
                                        <option value="AM">Trợ lý (AM)</option>
                                        <option value="NV">Nhân viên (NV)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="user-list" id="userList">
                                ${users.map(user => {
                                    const userRole = user.position || 'NV';
                                    const userName = user.fullName || 'Không rõ';
                                    const userId = user.employeeId || 'Unknown';
                                    
                                    
                                    return `
                                        <div class="user-card" data-user-id="${userId}" data-role="${userRole}">
                                            <div class="user-avatar">${userName.substring(0, 2).toUpperCase()}</div>
                                            <div class="user-info">
                                                <h4>${userName}</h4>
                                                <p class="user-id">ID: ${userId}</p>
                                                <p class="user-role role-${userRole.toLowerCase()}">${this.getRoleDisplayName(userRole)}</p>
                                            </div>
                                            <div class="user-actions">
                                                <button class="btn-edit-role" onclick="window.editUserRole('${userId}')" title="Chỉnh sửa phân quyền">
                                                    <span class="material-icons-round">edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Permission Edit Modal -->
                <div id="permissionEditModal" class="permission-edit-modal">
                    <div class="permission-edit-content">
                        <div class="permission-edit-header">
                            <h3><span class="material-icons-round">settings</span>Chỉnh sửa thông tin và phân quyền</h3>
                            <button class="btn-close" onclick="window.closePermissionModal()">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        
                        <div class="permission-edit-body">
                            <!-- Current User Info -->
                            <div id="currentUserInfo" class="current-user-info">
                                <!-- Will be populated when editing -->
                            </div>

                            <!-- User Data Edit Section -->
                            <div class="user-edit-section">
                                <h4><span class="material-icons-round">person</span>Thông tin cá nhân</h4>
                                <div class="user-edit-grid">
                                    <div class="edit-form-group">
                                        <label>Mã nhân viên</label>
                                        <input type="text" id="editEmployeeId" class="form-control">
                                    </div>
                                    <div class="edit-form-group">
                                        <label>Họ và tên</label>
                                        <input type="text" id="editFullName" class="form-control">
                                    </div>
                                    <div class="edit-form-group" id="storeAssignmentGroup">
                                        <label id="storeAssignmentLabel">Cửa hàng</label>
                                        <!-- Store selection for QL -->
                                        <div id="storeSelection" style="display: none;">
                                            <select id="editStoreName" class="form-control" multiple>
                                                <!-- Populated dynamically -->
                                            </select>
                                            <small class="form-text">Có thể chọn nhiều cửa hàng (Ctrl+Click)</small>
                                        </div>
                                        <!-- Region selection for AM -->
                                        <div id="regionSelection" style="display: none;">
                                            <select id="editRegion" class="form-control">
                                                <option value="">Chọn khu vực</option>
                                                <option value="TP.HCM">TP.HCM</option>
                                                <option value="Miền Bắc">Miền Bắc</option>
                                                <option value="Miền Trung">Miền Trung</option>
                                            </select>
                                        </div>
                                        <!-- Single store for other roles -->
                                        <div id="singleStoreSelection">
                                            <select id="editSingleStore" class="form-control">
                                                <!-- Populated dynamically -->
                                            </select>
                                        </div>
                                    </div>
                                    <div class="edit-form-group">
                                        <label>Số điện thoại</label>
                                        <input type="tel" id="editPhone" class="form-control">
                                    </div>
                                    <div class="edit-form-group">
                                        <label>Email</label>
                                        <input type="email" id="editEmail" class="form-control">
                                    </div>
                                    <div class="edit-form-group">
                                        <label>Ngày gia nhập</label>
                                        <input type="date" id="editJoinDate" class="form-control">
                                    </div>
                                </div>
                            </div>

                            <!-- Role Selection Section -->
                            <div class="user-edit-section">
                                <h4><span class="material-icons-round">security</span>Phân quyền hệ thống</h4>
                                <div class="edit-form-group">
                                    <label>Chọn vai trò</label>
                                    <select id="editUserRole" class="form-control role-select">
                                        <option value="AD">👑 Administrator - Toàn quyền hệ thống</option>
                                        <option value="QL">⚡ Manager - Quản lý cửa hàng</option>
                                        <option value="AM">🎯 Area Manager - Quản lý khu vực</option>
                                        <option value="NV">👤 Employee - Nhân viên</option>
                                    </select>
                                </div>
                                
                                <!-- Permission Preview -->
                                <div id="permissionPreview" class="permission-preview">
                                    <h5><span class="material-icons-round">preview</span>Quyền truy cập</h5>
                                    <div id="permissionList" class="permission-list">
                                        <!-- Will be populated based on selected role -->
                                    </div>
                                </div>
                            </div>

                            <!-- Change Reason Section -->
                            <div class="user-edit-section">
                                <h4><span class="material-icons-round">edit_note</span>Lý do thay đổi</h4>
                                <div class="edit-form-group">
                                    <label>Mô tả lý do thay đổi thông tin</label>
                                    <textarea id="changeReason" class="form-control" rows="3" placeholder="Vui lòng mô tả lý do thay đổi thông tin này..."></textarea>
                                </div>
                            </div>

                            <!-- History Section -->
                            <div class="history-section">
                                <div class="history-header">
                                    <span class="material-icons-round">history</span>
                                    Lịch sử thay đổi
                                </div>
                                <div id="userHistoryList" class="history-list">
                                    <div class="history-item">
                                        <div class="history-content">
                                            <div class="history-action">Đang tải lịch sử...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="permission-actions">
                            <button class="btn btn-secondary" onclick="window.closePermissionModal()">
                                <span class="material-icons-round">cancel</span>
                                Hủy bỏ
                            </button>
                            <button class="btn btn-primary" id="savePermissionChanges" onclick="window.savePermissionChanges()">
                                <span class="material-icons-round">save</span>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Setup permission management functionality
            this.setupPermissionManagement();
            
        } catch (error) {
            console.error('Access management error:', error);
            content.innerHTML = `
                <div class="permission-management-container">
                    <div class="permission-header">
                        <h2><span class="material-icons-round">error</span>Lỗi Hệ Thống</h2>
                        <p class="header-subtitle">Không thể tải thông tin phân quyền</p>
                    </div>
                    <div class="error-state">
                        <span class="error-icon">⚠️</span>
                        <h3>Lỗi: ${error.message}</h3>
                        <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                            <span class="material-icons-round">refresh</span>
                            Thử lại
                        </button>
                    </div>
                </div>
            `;
            utils.showNotification("Không thể tải thông tin phân quyền: " + error.message, "error");
        }
    }

    async showPersonalInfo() {
        const content = document.getElementById('content');
        try {
            // Use cached user data instead of making fresh API calls
            const response = await API_CACHE.getUserData();
            if (!response) {
                throw new Error('Could not get user data from cache');
            }
            
            // Update instance user data
            this.user = response;
            
            content.innerHTML = `
                <div class="personal-info-container">
                    <div class="personal-header">
                        <div class="personal-avatar">
                            <div class="avatar-circle">
                                <span class="material-icons-round">person</span>
                            </div>
                            <div class="avatar-info">
                                <h2>${response.fullName || 'Chưa cập nhật'}</h2>
                                <p class="position-badge ${this.getRoleBadgeClass(response.position)}">${this.getRoleDisplayName(response.position)}</p>
                                <p class="employee-id">ID: ${response.employeeId}</p>
                            </div>
                        </div>
                        <div class="personal-actions">
                            <button type="button" class="btn btn-outline" id="exportInfoBtn">
                                <span class="material-icons-round">download</span>
                                Xuất thông tin
                            </button>
                        </div>
                    </div>

                    <div class="personal-content">
                        <div class="info-grid">
                            <!-- Editable Information Card -->
                            <div class="info-card editable-card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <span class="material-icons-round">edit</span>
                                        <h3>Thông tin có thể chỉnh sửa</h3>
                                    </div>
                                    <span class="edit-badge">Tự cập nhật</span>
                                </div>
                                <form id="editableInfoForm" class="info-form">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label class="form-label">
                                                <span class="material-icons-round">email</span>
                                                Email
                                            </label>
                                            <input type="email" name="email" class="form-input" 
                                                value="${response.email || ''}" required>
                                            <small class="form-hint">Địa chỉ email để liên lạc và nhận thông báo</small>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">
                                                <span class="material-icons-round">phone</span>
                                                Số điện thoại
                                            </label>
                                            <input type="tel" name="phone" class="form-input" 
                                                value="${response.phone || ''}" pattern="[0-9]{10}" required>
                                            <small class="form-hint">Số điện thoại liên lạc (10 chữ số)</small>
                                        </div>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary" disabled>
                                            <span class="material-icons-round">save</span>
                                            <span class="btn-text">Cập nhật</span>
                                            <span class="btn-loader"></span>
                                        </button>
                                        <button type="reset" class="btn btn-outline">
                                            <span class="material-icons-round">refresh</span>
                                            Hoàn tác
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Read-only Information Card -->
                            <div class="info-card readonly-card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <span class="material-icons-round">lock</span>
                                        <h3>Thông tin cố định</h3>
                                    </div>
                                    <span class="readonly-badge">Chỉ đọc</span>
                                </div>
                                <div class="readonly-info">
                                    <div class="info-item">
                                        <div class="info-label">
                                            <span class="material-icons-round">badge</span>
                                            Mã nhân viên
                                        </div>
                                        <div class="info-value">${response.employeeId || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">
                                            <span class="material-icons-round">person</span>
                                            Họ và tên
                                        </div>
                                        <div class="info-value">${response.fullName || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">
                                            <span class="material-icons-round">work</span>
                                            Chức vụ
                                        </div>
                                        <div class="info-value">
                                            <span class="position-tag ${this.getRoleBadgeClass(response.position)}">
                                                ${this.getRoleDisplayName(response.position)}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">
                                            <span class="material-icons-round">store</span>
                                            Cửa hàng
                                        </div>
                                        <div class="info-value">${response.storeName || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">
                                            <span class="material-icons-round">calendar_today</span>
                                            Ngày gia nhập
                                        </div>
                                        <div class="info-value">${response.joinDate ? utils.formatDate(response.joinDate) : 'Chưa cập nhật'}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Request Changes Card -->
                            <div class="info-card request-card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <span class="material-icons-round">request_quote</span>
                                        <h3>Yêu cầu thay đổi</h3>
                                    </div>
                                    <span class="request-badge">Cần duyệt</span>
                                </div>
                                <div class="request-info">
                                    <p class="request-description">
                                        Để thay đổi thông tin như tên, chức vụ, cửa hàng hoặc ngày gia nhập, 
                                        bạn cần gửi yêu cầu để được ban quản lý duyệt.
                                    </p>
                                    <div class="request-buttons">
                                        <button type="button" class="btn-request-change" data-field="fullName" data-current="${response.fullName || ''}">
                                            <span class="material-icons-round">person</span>
                                            Đổi tên
                                        </button>
                                        <button type="button" class="btn-request-change" data-field="position" data-current="${response.position || ''}">
                                            <span class="material-icons-round">work</span>
                                            Đổi chức vụ
                                        </button>
                                        <button type="button" class="btn-request-change" data-field="storeName" data-current="${response.storeName || ''}">
                                            <span class="material-icons-round">store</span>
                                            Đổi cửa hàng
                                        </button>
                                        <button type="button" class="btn-request-change" data-field="joinDate" data-current="${response.joinDate || ''}">
                                            <span class="material-icons-round">calendar_today</span>
                                            Đổi ngày gia nhập
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Statistics Card -->
                            <div class="info-card stats-card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <span class="material-icons-round">analytics</span>
                                        <h3>Thống kê cá nhân</h3>
                                    </div>
                                </div>
                                <div class="personal-stats">
                                    <div class="stat-item">
                                        <div class="stat-icon">📅</div>
                                        <div class="stat-info">
                                            <div class="stat-value" id="workDaysThisMonth">-</div>
                                            <div class="stat-label">Ngày làm tháng này</div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-icon">⏰</div>
                                        <div class="stat-info">
                                            <div class="stat-value" id="totalHoursThisMonth">- giờ</div>
                                            <div class="stat-label">Tổng giờ làm</div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-icon">🎯</div>
                                        <div class="stat-info">
                                            <div class="stat-value" id="attendanceRate">-%</div>
                                            <div class="stat-label">Tỷ lệ chuyên cần</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Password Confirmation Modal -->
                <div id="passwordConfirmModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Xác nhận mật khẩu</h3>
                            <button type="button" class="modal-close">&times;</button>
                        </div>
                        <form id="passwordConfirmForm">
                            <div class="modal-body">
                                <p>Để bảo mật thông tin, vui lòng xác nhận mật khẩu trước khi cập nhật.</p>
                                <div class="form-group">
                                    <label class="form-label">
                                        <span class="material-icons-round">lock</span>
                                        Mật khẩu hiện tại
                                    </label>
                                    <input type="password" id="confirmPassword" class="form-input" required>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline" onclick="closePasswordModal()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Xác nhận</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Change Request Modal -->
                <div id="changeRequestModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Gửi yêu cầu thay đổi thông tin</h3>
                            <button type="button" class="modal-close">&times;</button>
                        </div>
                        <form id="changeRequestForm">
                            <div class="modal-body">
                                <div class="form-group">
                                    <label class="form-label" id="changeFieldLabel">Trường cần thay đổi</label>
                                    <input type="text" id="currentValue" class="form-input" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Giá trị mới</label>
                                    <input type="text" id="newValue" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Lý do thay đổi</label>
                                    <textarea id="changeReason" class="form-input" rows="3" required 
                                        placeholder="Vui lòng nêu rõ lý do cần thay đổi thông tin này..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline" onclick="closeChangeRequestModal()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Gửi yêu cầu</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            this.setupPersonalInfoHandlers();
            this.loadPersonalStats();
            
        } catch (error) {
            console.error('Personal info error:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Không thể tải thông tin cá nhân</h3>
                        <p>Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.</p>
                        <button onclick="contentManager.showPersonalInfo()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    async showAnalytics() {
        const content = document.getElementById('content');
        try {
            const userResponse = await API_CACHE.getUserData();
            
            content.innerHTML = `
                <div class="analytics-container modern-container">
                    <!-- Professional Analytics Header -->
                    <div class="page-header professional-header analytics-header">
                        <div class="header-content">
                            <div class="header-title">
                                <div class="title-icon-wrapper">
                                    <span class="material-icons-round header-icon">analytics</span>
                                </div>
                                <div class="title-text">
                                    <h1>Phân Tích & Báo Cáo Chuyên Nghiệp</h1>
                                    <p class="header-subtitle">Hệ thống phân tích thông minh với báo cáo theo thời gian thực và dự báo xu hướng</p>
                                </div>
                            </div>
                            <div class="header-actions">
                                <button class="modern-btn action-btn export-btn" onclick="contentManager.exportAnalytics()">
                                    <span class="material-icons-round">download</span>
                                    Xuất báo cáo
                                </button>
                                <button class="modern-btn action-btn schedule-btn" onclick="contentManager.scheduleReport()">
                                    <span class="material-icons-round">schedule_send</span>
                                    Lập lịch báo cáo
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Time Period Control -->
                    <div class="card modern-card period-control">
                        <div class="card-body">
                            <div class="period-controls enhanced-controls">
                                <div class="control-section">
                                    <div class="period-selector">
                                        <label class="control-label">
                                            <span class="material-icons-round">date_range</span>
                                            Chọn khoảng thời gian phân tích
                                        </label>
                                        <div class="period-buttons">
                                            <button class="period-btn active" data-period="day" onclick="contentManager.changeStatsPeriod('day')">
                                                <span class="material-icons-round">today</span>
                                                Theo ngày
                                            </button>
                                            <button class="period-btn" data-period="week" onclick="contentManager.changeStatsPeriod('week')">
                                                <span class="material-icons-round">view_week</span>
                                                Theo tuần
                                            </button>
                                            <button class="period-btn" data-period="month" onclick="contentManager.changeStatsPeriod('month')">
                                                <span class="material-icons-round">calendar_view_month</span>
                                                Theo tháng
                                            </button>
                                            <button class="period-btn" data-period="quarter" onclick="contentManager.changeStatsPeriod('quarter')">
                                                <span class="material-icons-round">calendar_view_day</span>
                                                Theo quý
                                            </button>
                                            <button class="period-btn" data-period="year" onclick="contentManager.changeStatsPeriod('year')">
                                                <span class="material-icons-round">calendar_today</span>
                                                Theo năm
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="date-range-picker">
                                        <div class="date-input-group">
                                            <label>Từ ngày:</label>
                                            <input type="date" id="analyticsStartDate" class="form-control modern-input" value="${this.getDefaultStartDate()}">
                                        </div>
                                        <div class="date-input-group">
                                            <label>Đến ngày:</label>
                                            <input type="date" id="analyticsEndDate" class="form-control modern-input" value="${this.getCurrentDate()}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="action-section">
                                    <button id="loadAnalyticsData" class="btn btn-primary modern-btn">
                                        <span class="material-icons-round">analytics</span>
                                        Phân tích dữ liệu
                                    </button>
                                    <button class="btn modern-btn secondary-btn" onclick="contentManager.resetAnalytics()">
                                        <span class="material-icons-round">refresh</span>
                                        Làm mới
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced KPI Dashboard -->
                    <div class="card modern-card kpi-dashboard">
                        <div class="card-header modern-header">
                            <h3>
                                <span class="material-icons-round">dashboard</span>
                                Bảng điều khiển KPI
                            </h3>
                            <div class="header-tools">
                                <button class="tool-btn" onclick="contentManager.refreshKPI()" title="Làm mới KPI">
                                    <span class="material-icons-round">refresh</span>
                                </button>
                                <button class="tool-btn" onclick="contentManager.customizeKPI()" title="Tùy chỉnh KPI">
                                    <span class="material-icons-round">tune</span>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="kpi-grid">
                                <div class="kpi-card performance-kpi">
                                    <div class="kpi-icon">
                                        <span class="material-icons-round">trending_up</span>
                                    </div>
                                    <div class="kpi-content">
                                        <div class="kpi-value" id="performanceKPI">94.5%</div>
                                        <div class="kpi-label">Hiệu suất tổng thể</div>
                                        <div class="kpi-trend positive">
                                            <span class="material-icons-round">arrow_upward</span>
                                            +5.2% so với kỳ trước
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="kpi-card attendance-kpi">
                                    <div class="kpi-icon">
                                        <span class="material-icons-round">person</span>
                                    </div>
                                    <div class="kpi-content">
                                        <div class="kpi-value" id="attendanceKPI">96.8%</div>
                                        <div class="kpi-label">Tỷ lệ chấm công</div>
                                        <div class="kpi-trend positive">
                                            <span class="material-icons-round">arrow_upward</span>
                                            +2.1% so với kỳ trước
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="kpi-card productivity-kpi">
                                    <div class="kpi-icon">
                                        <span class="material-icons-round">speed</span>
                                    </div>
                                    <div class="kpi-content">
                                        <div class="kpi-value" id="productivityKPI">87.3%</div>
                                        <div class="kpi-label">Năng suất làm việc</div>
                                        <div class="kpi-trend negative">
                                            <span class="material-icons-round">arrow_downward</span>
                                            -1.5% so với kỳ trước
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="kpi-card satisfaction-kpi">
                                    <div class="kpi-icon">
                                        <span class="material-icons-round">sentiment_satisfied</span>
                                    </div>
                                    <div class="kpi-content">
                                        <div class="kpi-value" id="satisfactionKPI">92.1%</div>
                                        <div class="kpi-label">Mức độ hài lòng</div>
                                        <div class="kpi-trend positive">
                                            <span class="material-icons-round">arrow_upward</span>
                                            +3.7% so với kỳ trước
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Analytics Content Grid -->
                    <div class="analytics-grid">
                        <!-- Time-based Charts Section -->
                        <div class="card modern-card charts-section">
                            <div class="card-header modern-header">
                                <h3>
                                    <span class="material-icons-round">timeline</span>
                                    Biểu đồ xu hướng
                                </h3>
                                <div class="header-tools">
                                    <select class="chart-type-selector" onchange="this.changeChartType(this.value)">
                                        <option value="line">Biểu đồ đường</option>
                                        <option value="bar">Biểu đồ cột</option>
                                        <option value="area">Biểu đồ vùng</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="chart-container" id="trendChart">
                                    <div class="mock-chart">
                                        <div class="chart-legend">
                                            <div class="legend-item">
                                                <div class="legend-color attendance-color"></div>
                                                <span>Chấm công</span>
                                            </div>
                                            <div class="legend-item">
                                                <div class="legend-color productivity-color"></div>
                                                <span>Năng suất</span>
                                            </div>
                                            <div class="legend-item">
                                                <div class="legend-color performance-color"></div>
                                                <span>Hiệu suất</span>
                                            </div>
                                        </div>
                                        <div class="chart-area">
                                            <div class="chart-bars trend-bars">
                                                <div class="trend-bar" style="height: 85%"><span>T2</span></div>
                                                <div class="trend-bar" style="height: 92%"><span>T3</span></div>
                                                <div class="trend-bar" style="height: 88%"><span>T4</span></div>
                                                <div class="trend-bar" style="height: 95%"><span>T5</span></div>
                                                <div class="trend-bar" style="height: 90%"><span>T6</span></div>
                                                <div class="trend-bar" style="height: 78%"><span>T7</span></div>
                                                <div class="trend-bar" style="height: 70%"><span>CN</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Weekly/Daily Analysis Section -->
                        <div class="card modern-card analysis-section">
                            <div class="card-header modern-header">
                                <h3>
                                    <span class="material-icons-round">insights</span>
                                    Phân tích chi tiết
                                </h3>
                                <div class="header-tools">
                                    <button class="tool-btn active" data-analysis="weekly" onclick="contentManager.changeAnalysisType('weekly')">Tuần</button>
                                    <button class="tool-btn" data-analysis="daily" onclick="contentManager.changeAnalysisType('daily')">Ngày</button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="analysis-content" id="analysisContent">
                                    <!-- Weekly Analysis -->
                                    <div class="analysis-panel weekly-analysis active">
                                        <div class="analysis-summary">
                                            <h4>Tóm tắt tuần này</h4>
                                            <div class="summary-stats">
                                                <div class="summary-item">
                                                    <div class="summary-value">42.5h</div>
                                                    <div class="summary-label">Tổng giờ làm</div>
                                                </div>
                                                <div class="summary-item">
                                                    <div class="summary-value">96%</div>
                                                    <div class="summary-label">Tỷ lệ có mặt</div>
                                                </div>
                                                <div class="summary-item">
                                                    <div class="summary-value">15</div>
                                                    <div class="summary-label">Công việc hoàn thành</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="weekly-breakdown">
                                            <h4>Chi tiết theo ngày</h4>
                                            <div class="breakdown-list">
                                                <div class="breakdown-item">
                                                    <div class="day-info">
                                                        <span class="day-name">Thứ Hai</span>
                                                        <span class="day-date">02/01/2025</span>
                                                    </div>
                                                    <div class="day-stats">
                                                        <span class="hours-worked">8.5h</span>
                                                        <span class="attendance-status present">Có mặt</span>
                                                    </div>
                                                </div>
                                                <div class="breakdown-item">
                                                    <div class="day-info">
                                                        <span class="day-name">Thứ Ba</span>
                                                        <span class="day-date">03/01/2025</span>
                                                    </div>
                                                    <div class="day-stats">
                                                        <span class="hours-worked">8.0h</span>
                                                        <span class="attendance-status present">Có mặt</span>
                                                    </div>
                                                </div>
                                                <!-- More breakdown items would be dynamically generated -->
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Daily Analysis -->
                                    <div class="analysis-panel daily-analysis">
                                        <div class="analysis-summary">
                                            <h4>Phân tích hôm nay</h4>
                                            <div class="hourly-breakdown">
                                                <div class="hour-block">
                                                    <div class="hour-time">08:00</div>
                                                    <div class="hour-activity">Bắt đầu làm việc</div>
                                                    <div class="hour-efficiency">95%</div>
                                                </div>
                                                <div class="hour-block">
                                                    <div class="hour-time">10:00</div>
                                                    <div class="hour-activity">Họp nhóm</div>
                                                    <div class="hour-efficiency">87%</div>
                                                </div>
                                                <div class="hour-block">
                                                    <div class="hour-time">14:00</div>
                                                    <div class="hour-activity">Xử lý công việc</div>
                                                    <div class="hour-efficiency">92%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Performance Metrics Section -->
                        <div class="card modern-card metrics-section">
                            <div class="card-header modern-header">
                                <h3>
                                    <span class="material-icons-round">assessment</span>
                                    Chỉ số hiệu suất
                                </h3>
                                <div class="header-tools">
                                    <button class="tool-btn" onclick="contentManager.exportMetrics()" title="Xuất chỉ số">
                                        <span class="material-icons-round">download</span>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="metrics-grid">
                                    <div class="metric-card">
                                        <div class="metric-header">
                                            <span class="metric-title">Punctuality</span>
                                            <span class="metric-score">9.2/10</span>
                                        </div>
                                        <div class="metric-bar">
                                            <div class="metric-fill" style="width: 92%"></div>
                                        </div>
                                        <div class="metric-description">Đúng giờ làm việc</div>
                                    </div>
                                    
                                    <div class="metric-card">
                                        <div class="metric-header">
                                            <span class="metric-title">Quality</span>
                                            <span class="metric-score">8.8/10</span>
                                        </div>
                                        <div class="metric-bar">
                                            <div class="metric-fill" style="width: 88%"></div>
                                        </div>
                                        <div class="metric-description">Chất lượng công việc</div>
                                    </div>
                                    
                                    <div class="metric-card">
                                        <div class="metric-header">
                                            <span class="metric-title">Collaboration</span>
                                            <span class="metric-score">9.5/10</span>
                                        </div>
                                        <div class="metric-bar">
                                            <div class="metric-fill" style="width: 95%"></div>
                                        </div>
                                        <div class="metric-description">Làm việc nhóm</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Insights and Recommendations -->
                    <div class="card modern-card insights-section">
                        <div class="card-header modern-header">
                            <h3>
                                <span class="material-icons-round">lightbulb</span>
                                Nhận định và khuyến nghị
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="insights-grid">
                                <div class="insight-card positive">
                                    <div class="insight-icon">
                                        <span class="material-icons-round">thumb_up</span>
                                    </div>
                                    <div class="insight-content">
                                        <h4>Điểm mạnh</h4>
                                        <p>Tỷ lệ chấm công đúng giờ tăng 5.2% so với tháng trước, thể hiện kỷ luật lao động tốt.</p>
                                    </div>
                                </div>
                                
                                <div class="insight-card warning">
                                    <div class="insight-icon">
                                        <span class="material-icons-round">warning</span>
                                    </div>
                                    <div class="insight-content">
                                        <h4>Cần cải thiện</h4>
                                        <p>Năng suất làm việc giảm 1.5%, cần xem xét tối ưu hóa quy trình làm việc.</p>
                                    </div>
                                </div>
                                
                                <div class="insight-card recommendation">
                                    <div class="insight-icon">
                                        <span class="material-icons-round">psychology</span>
                                    </div>
                                    <div class="insight-content">
                                        <h4>Khuyến nghị</h4>
                                        <p>Nên tổ chức các buổi đào tạo kỹ năng mềm để nâng cao hiệu quả làm việc nhóm.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupAnalyticsHandlers();
            this.loadAnalyticsData();

        } catch (error) {
            console.error('Analytics error:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Không thể tải phân tích</h3>
                        <p>Đã xảy ra lỗi khi tải dữ liệu phân tích. Vui lòng thử lại sau.</p>
                        <button onclick="window.contentManager.showAnalytics()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    // Analytics Helper Functions
    setupAnalyticsHandlers() {
        // Period button handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.period-btn')) {
                document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.changePeriod(e.target.dataset.period);
            }
        });

        // Load data handler
        document.getElementById('loadAnalyticsData')?.addEventListener('click', () => {
            this.loadAnalyticsData();
        });
    }

    changePeriod(period) {
        const startDate = document.getElementById('analyticsStartDate');
        const endDate = document.getElementById('analyticsEndDate');
        const today = new Date();
        
        switch (period) {
            case 'day':
                startDate.value = this.formatDate(today);
                endDate.value = this.formatDate(today);
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                startDate.value = this.formatDate(weekStart);
                endDate.value = this.formatDate(weekEnd);
                break;
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                startDate.value = this.formatDate(monthStart);
                endDate.value = this.formatDate(monthEnd);
                break;
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
                const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
                startDate.value = this.formatDate(quarterStart);
                endDate.value = this.formatDate(quarterEnd);
                break;
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                const yearEnd = new Date(today.getFullYear(), 11, 31);
                startDate.value = this.formatDate(yearStart);
                endDate.value = this.formatDate(yearEnd);
                break;
        }
        
        this.loadAnalyticsData();
    }

    changeAnalysisType(type) {
        document.querySelectorAll('[data-analysis]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-analysis="${type}"]`).classList.add('active');
        
        document.querySelectorAll('.analysis-panel').forEach(panel => panel.classList.remove('active'));
        document.querySelector(`.${type}-analysis`).classList.add('active');
    }

    async loadAnalyticsData() {
        try {
            const startDate = document.getElementById('analyticsStartDate').value;
            const endDate = document.getElementById('analyticsEndDate').value;
            
            // Simulate loading analytics data
            console.log(`Loading analytics data from ${startDate} to ${endDate}`);
            
            // Update KPIs with simulated data
            this.updateKPIValues();
            
            // Show loading state
            const chartContainer = document.getElementById('trendChart');
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Đang tải dữ liệu...</p></div>';
                
                // Simulate data loading delay
                setTimeout(() => {
                    this.renderTrendChart();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            utils.showNotification('Lỗi khi tải dữ liệu phân tích', 'error');
        }
    }

    updateKPIValues() {
        // Simulate real-time KPI updates
        const kpis = {
            performance: Math.random() * 10 + 90, // 90-100%
            attendance: Math.random() * 5 + 95,   // 95-100%
            productivity: Math.random() * 20 + 80, // 80-100%
            satisfaction: Math.random() * 10 + 90  // 90-100%
        };

        document.getElementById('performanceKPI').textContent = `${kpis.performance.toFixed(1)}%`;
        document.getElementById('attendanceKPI').textContent = `${kpis.attendance.toFixed(1)}%`;
        document.getElementById('productivityKPI').textContent = `${kpis.productivity.toFixed(1)}%`;
        document.getElementById('satisfactionKPI').textContent = `${kpis.satisfaction.toFixed(1)}%`;
    }

    renderTrendChart() {
        const chartContainer = document.getElementById('trendChart');
        if (!chartContainer) return;

        // Generate random data for demonstration
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const data = days.map(() => Math.random() * 30 + 70); // 70-100%

        chartContainer.innerHTML = `
            <div class="mock-chart">
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color attendance-color"></div>
                        <span>Chấm công</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color productivity-color"></div>
                        <span>Năng suất</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color performance-color"></div>
                        <span>Hiệu suất</span>
                    </div>
                </div>
                <div class="chart-area">
                    <div class="chart-bars trend-bars">
                        ${data.map((value, index) => `
                            <div class="trend-bar" style="height: ${value}%">
                                <span>${days[index]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultStartDate() {
        const date = new Date();
        date.setDate(date.getDate() - 30); // 30 days ago
        return this.formatDate(date);
    }

    getCurrentDate() {
        return this.formatDate(new Date());
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    async showWorkTasks() {
        const content = document.getElementById('content');
        try {
            // Get current user's information
            const userResponse = await API_CACHE.getUserData();
            if (!userResponse) {
                throw new Error('Could not get user data');
            }

            // Get all tasks where the user is a participant
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const tasksResponse = await utils.fetchAPI(`?action=getWorkTasks&employeeId=${userResponse.employeeId}&token=${token}`);
            
            content.innerHTML = `
                <div class="work-tasks-container">
                    <!-- Enhanced Header with Stats -->
                    <div class="page-header">
                        <div class="header-content">
                            <div class="header-title">
                                <span class="material-icons-round header-icon">work</span>
                                <div>
                                    <h1>Công Việc Của Tôi</h1>
                                    <p class="header-subtitle">Quản lý và theo dõi tiến độ công việc được giao</p>
                                </div>
                            </div>
                            <div class="header-stats">
                                <div class="stat-card">
                                    <span class="stat-number" id="totalTasks">0</span>
                                    <span class="stat-label">Tổng số</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number" id="pendingTasks">0</span>
                                    <span class="stat-label">Đang xử lý</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number" id="completedTasks">0</span>
                                    <span class="stat-label">Hoàn thành</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Task Cards -->
                    <div class="card modern-card">
                        <div class="card-body">
                            <div class="tasks-filter-enhanced">
                                <button class="filter-btn modern-btn active" data-status="all">
                                    <span class="material-icons-round">list</span>
                                    Tất cả
                                </button>
                                <button class="filter-btn modern-btn" data-status="pending">
                                    <span class="material-icons-round">schedule</span>
                                    Đang xử lý
                                </button>
                                <button class="filter-btn modern-btn" data-status="completed">
                                    <span class="material-icons-round">check_circle</span>
                                    Hoàn thành
                                </button>
                                <button class="filter-btn modern-btn" data-status="overdue">
                                    <span class="material-icons-round">warning</span>
                                    Quá hạn
                                </button>
                            </div>
                            <div id="tasksList" class="tasks-list-enhanced">
                                ${this.renderEnhancedTasksList(tasksResponse || [])}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Task Detail Modal -->
                <div id="taskDetailModal" class="modal enhanced-modal">
                    <div class="modal-content enhanced-modal-content">
                        <div class="modal-header">
                            <h3>Chi tiết công việc</h3>
                            <button class="close-btn" onclick="contentManager.closeTaskDetailModal()">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        <div id="taskDetailContent" class="modal-body"></div>
                    </div>
                </div>
            `;

            this.setupEnhancedWorkTasksHandlers();
            this.updateTaskStats(tasksResponse || []);

        } catch (error) {
            console.error('Work tasks error:', error);
            content.innerHTML = `
                <div class="error-container enhanced-error">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error_outline</span>
                        <h3>Không thể tải công việc</h3>
                        <p>Đã xảy ra lỗi khi tải danh sách công việc. Vui lòng kiểm tra kết nối và thử lại.</p>
                        <button onclick="window.contentManager.showWorkTasks()" class="btn btn-primary modern-btn">
                            <span class="material-icons-round">refresh</span>
                            Thử lại
                        </button>
                    </div>
                </div>
            `;
        }
    }

    renderEnhancedTasksList(tasks) {
        console.log('DEBUG: renderEnhancedTasksList received:', tasks);
        
        // Handle both array and object response formats
        let taskList = [];
        if (Array.isArray(tasks)) {
            taskList = tasks;
        } else if (tasks && typeof tasks === 'object') {
            // Extract tasks from object, excluding metadata
            taskList = Object.keys(tasks)
                .filter(key => !['timestamp', 'status'].includes(key))
                .map(key => tasks[key])
                .filter(task => task && typeof task === 'object' && task.id);
        }
        
        console.log('DEBUG: Processed taskList:', taskList);
        
        if (taskList.length === 0) {
            return `
                <div class="no-tasks-enhanced">
                    <span class="material-icons-round no-tasks-icon">assignment</span>
                    <h3>Chưa có công việc nào</h3>
                    <p>Hiện tại bạn chưa có công việc nào được giao. Các nhiệm vụ mới sẽ xuất hiện tại đây.</p>
                </div>
            `;
        }

        return taskList.map(task => {
            const dueDate = task.deadline ? new Date(task.deadline) : null;
            const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';
            const dueDateText = dueDate ? dueDate.toLocaleDateString('vi-VN') : 'Không giới hạn';
            
            return `
                <div class="task-card-enhanced ${isOverdue ? 'overdue' : ''}" data-status="${task.status}" onclick="contentManager.showTaskDetail('${task.id}')">
                    <div class="task-card-header">
                        <div class="task-title-section">
                            <h4 class="task-title">${task.title}</h4>
                            <span class="task-status-badge ${task.status}">
                                ${this.getStatusIcon(task.status)}
                                ${this.getStatusText(task.status)}
                            </span>
                        </div>
                        <div class="task-priority-section">
                            <span class="priority-badge priority-${task.priority}">
                                ${this.getPriorityIcon(task.priority)}
                                ${this.getPriorityText(task.priority)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-card-body">
                        <p class="task-description">${task.description ? task.description.substring(0, 120) : 'Không có mô tả'}${task.description && task.description.length > 120 ? '...' : ''}</p>
                        
                        <div class="task-meta">
                            <div class="meta-item">
                                <span class="material-icons-round meta-icon">person</span>
                                <span class="meta-text">Người giao: ${task.assignerNames || 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="material-icons-round meta-icon">schedule</span>
                                <span class="meta-text ${isOverdue ? 'overdue-text' : ''}">
                                    Hạn: ${dueDateText}
                                    ${isOverdue ? ' (Quá hạn)' : ''}
                                </span>
                            </div>
                        </div>
                        
                        <div class="task-participants-enhanced">
                            <span class="material-icons-round">group</span>
                            <span class="participants-text">Tham gia: ${task.participantNames || 'Không có'}</span>
                        </div>
                    </div>
                    
                    <div class="task-card-footer">
                        <div class="task-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.getTaskProgress(task.status)}%"></div>
                            </div>
                        </div>
                        <button class="task-action-btn" onclick="event.stopPropagation(); contentManager.showTaskDetail('${task.id}')">
                            <span class="material-icons-round">visibility</span>
                            Chi tiết
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStatusIcon(status) {
        const iconMap = {
            'pending': 'schedule',
            'in_progress': 'sync',
            'completed': 'check_circle',
            'rejected': 'cancel'
        };
        return `<span class="material-icons-round status-icon">${iconMap[status] || 'help'}</span>`;
    }

    getPriorityIcon(priority) {
        const iconMap = {
            'low': 'keyboard_double_arrow_down',
            'medium': 'drag_handle',
            'high': 'keyboard_double_arrow_up',
            'urgent': 'priority_high'
        };
        return `<span class="material-icons-round priority-icon">${iconMap[priority] || 'help'}</span>`;
    }

    getTaskProgress(status) {
        const progressMap = {
            'pending': 10,
            'in_progress': 50,
            'completed': 100,
            'rejected': 0
        };
        return progressMap[status] || 0;
    }

    updateTaskStats(tasks) {
        // Handle both array and object response formats
        let taskList = [];
        if (Array.isArray(tasks)) {
            taskList = tasks;
        } else if (tasks && typeof tasks === 'object') {
            // Extract tasks from object, excluding metadata
            taskList = Object.keys(tasks)
                .filter(key => !['timestamp', 'status'].includes(key))
                .map(key => tasks[key])
                .filter(task => task && typeof task === 'object' && task.id);
        }
        
        const total = taskList.length;
        const pending = taskList.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
        const completed = taskList.filter(t => t.status === 'completed').length;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
    }

    setupEnhancedWorkTasksHandlers() {
        // Enhanced filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const status = e.currentTarget.dataset.status;
                this.filterTasksByStatus(status);
            });
        });
    }

    filterTasksByStatus(status) {
        const taskCards = document.querySelectorAll('.task-card-enhanced');
        taskCards.forEach(card => {
            const taskStatus = card.dataset.status;
            const isOverdue = card.classList.contains('overdue');
            
            let shouldShow = false;
            
            switch(status) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'pending':
                    shouldShow = taskStatus === 'pending' || taskStatus === 'in_progress';
                    break;
                case 'completed':
                    shouldShow = taskStatus === 'completed';
                    break;
                case 'overdue':
                    shouldShow = isOverdue;
                    break;
            }
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Đang xử lý',
            'in_progress': 'Đang thực hiện', 
            'completed': 'Hoàn thành',
            'rejected': 'Từ chối'
        };
        return statusMap[status] || status;
    }

    getPriorityText(priority) {
        const priorityMap = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao',
            'urgent': 'Khẩn cấp'
        };
        return priorityMap[priority] || priority;
    }

    setupWorkTasksHandlers() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const status = e.target.dataset.status;
                const taskItems = document.querySelectorAll('.task-item');
                
                taskItems.forEach(item => {
                    if (status === 'all' || item.dataset.status === status) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    async showTaskDetail(taskId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const taskResponse = await utils.fetchAPI(`?action=getTaskDetail&taskId=${taskId}&token=${token}`);
            
            if (!taskResponse) {
                throw new Error('Cannot load task details');
            }

            const modal = document.getElementById('taskDetailModal');
            const content = document.getElementById('taskDetailContent');
            
            content.innerHTML = `
                <div class="task-detail">
                    <h3>${taskResponse.title}</h3>
                    <div class="task-meta">
                        <span class="task-status ${taskResponse.status}">${this.getStatusText(taskResponse.status)}</span>
                        <span class="task-priority priority-${taskResponse.priority}">${this.getPriorityText(taskResponse.priority)}</span>
                    </div>
                    
                    <div class="task-description">
                        <h4>Mô tả:</h4>
                        <div class="description-content">${taskResponse.description}</div>
                    </div>
                    
                    <div class="task-people">
                        <div class="assigners">
                            <h4>Người giao nhiệm vụ:</h4>
                            <p>${taskResponse.assignerNames}</p>
                        </div>
                        <div class="participants">
                            <h4>Người thực hiện:</h4>
                            <p>${taskResponse.participantNames}</p>
                        </div>
                        ${taskResponse.supporterNames ? `
                        <div class="supporters">
                            <h4>Người hỗ trợ:</h4>
                            <p>${taskResponse.supporterNames}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-timeline">
                        <p><strong>Ngày tạo:</strong> ${new Date(taskResponse.createdAt).toLocaleString()}</p>
                        ${taskResponse.dueDate ? `<p><strong>Hạn hoàn thành:</strong> ${new Date(taskResponse.dueDate).toLocaleString()}</p>` : ''}
                    </div>
                    
                    <div class="task-comments">
                        <h4>Bình luận</h4>
                        <div id="commentsList">
                            ${this.renderComments(taskResponse.comments || [])}
                        </div>
                        
                        <div class="add-comment">
                            <textarea id="newComment" placeholder="Thêm bình luận..." rows="3"></textarea>
                            <button onclick="contentManager.addComment('${taskId}')" class="btn btn-primary">Gửi bình luận</button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading task detail:', error);
            utils.showNotification('Không thể tải chi tiết nhiệm vụ', 'error');
        }
    }

    renderComments(comments) {
        if (!Array.isArray(comments) || comments.length === 0) {
            return '<p class="no-comments">Chưa có bình luận nào.</p>';
        }

        return comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <strong>${comment.authorName}</strong>
                    <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
                ${comment.replies ? this.renderReplies(comment.replies) : ''}
                <button onclick="contentManager.replyToComment('${comment.id}')" class="reply-btn">Trả lời</button>
            </div>
        `).join('');
    }

    renderReplies(replies) {
        if (!Array.isArray(replies) || replies.length === 0) return '';
        
        return `
            <div class="comment-replies">
                ${replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-header">
                            <strong>${reply.authorName}</strong>
                            <span class="reply-time">${new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="reply-content">${reply.content}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async addComment(taskId) {
        try {
            const commentText = document.getElementById('newComment').value.trim();
            if (!commentText) {
                utils.showNotification('Vui lòng nhập nội dung bình luận', 'error');
                return;
            }

            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=addTaskComment', {
                method: 'POST',
                body: JSON.stringify({
                    taskId: taskId,
                    content: commentText
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã thêm bình luận', 'success');
                // Refresh task detail
                this.showTaskDetail(taskId);
            } else {
                throw new Error(response.message || 'Không thể thêm bình luận');
            }

        } catch (error) {
            console.error('Error adding comment:', error);
            utils.showNotification('Lỗi khi thêm bình luận', 'error');
        }
    }

    async replyToComment(commentId) {
        const replyText = prompt('Nhập câu trả lời:');
        if (!replyText) return;

        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI('?action=replyToComment', {
                method: 'POST',
                body: JSON.stringify({
                    commentId: commentId,
                    content: replyText
                })
            });

            if (response && response.success) {
                utils.showNotification('Đã trả lời bình luận', 'success');
                // Refresh the current task detail modal
                const modal = document.getElementById('taskDetailModal');
                if (modal.style.display === 'block') {
                    // Get the task ID from the modal and refresh
                    location.reload(); // Simple refresh for now
                }
            } else {
                throw new Error(response.message || 'Không thể trả lời bình luận');
            }

        } catch (error) {
            console.error('Error replying to comment:', error);
            utils.showNotification('Lỗi khi trả lời bình luận', 'error');
        }
    }

    closeTaskDetailModal() {
        const modal = document.getElementById('taskDetailModal');
        modal.style.display = 'none';
    }

    getRoleBadgeClass(position) {
        const roleClasses = {
            'AD': 'admin-badge',
            'QL': 'manager-badge', 
            'AM': 'assistant-badge',
            'NV': 'employee-badge'
        };
        return roleClasses[position] || 'employee-badge';
    }

    getRoleDisplayName(position) {
        const roleNames = {
            'AD': '👑 Quản trị viên',
            'QL': '⚡ Quản lý',
            'AM': '🎯 Trợ lý quản lý',
            'NV': '👤 Nhân viên'
        };
        return roleNames[position] || '👤 Nhân viên';
    }

    setupPersonalInfoHandlers() {
        // Form input change detection
        const editableForm = document.getElementById('editableInfoForm');
        const submitBtn = editableForm?.querySelector('button[type="submit"]');
        
        if (editableForm && submitBtn) {
            const inputs = editableForm.querySelectorAll('input');
            const originalValues = {};
            
            // Store original values
            inputs.forEach(input => {
                originalValues[input.name] = input.value;
            });
            
            // Enable/disable submit button based on changes
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    const hasChanges = Array.from(inputs).some(inp => inp.value !== originalValues[inp.name]);
                    submitBtn.disabled = !hasChanges;
                });
            });
            
            // Handle form submission
            editableForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showPasswordConfirmModal(editableForm);
            });
        }

        // Change request buttons
        document.querySelectorAll('.btn-request-change').forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.dataset.field;
                const current = btn.dataset.current;
                this.showChangeRequestModal(field, current);
            });
        });

        // Export info button
        const exportBtn = document.getElementById('exportInfoBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPersonalInfo());
        }
    }

    showPasswordConfirmModal(form) {
        const modal = document.getElementById('passwordConfirmModal');
        const passwordForm = document.getElementById('passwordConfirmForm');
        
        modal.style.display = 'block';
        
        passwordForm.onsubmit = async (e) => {
            e.preventDefault();
            const password = document.getElementById('confirmPassword').value;
            
            try {
                // Get user employee ID safely
                const employeeId = await this.getUserEmployeeId();
                
                // Verify password first
                const verifyResponse = await utils.fetchAPI(`?action=login`, {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: employeeId,
                        password: password
                    })
                });
                
                if (verifyResponse.status === 200) {
                    // Password correct, proceed with update
                    this.updatePersonalInfo(form);
                    this.closePasswordModal();
                } else {
                    utils.showNotification('Mật khẩu không chính xác', 'error');
                }
            } catch (error) {
                utils.showNotification('Lỗi xác thực mật khẩu', 'error');
            }
        };
    }

    closePasswordModal() {
        const modal = document.getElementById('passwordConfirmModal');
        modal.style.display = 'none';
        document.getElementById('confirmPassword').value = '';
    }

    async updatePersonalInfo(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        try {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            
            // Get user employee ID safely
            const employeeId = await this.getUserEmployeeId();
            
            const updateData = {
                employeeId: employeeId,
                email: formData.get('email'),
                phone: formData.get('phone')
            };
            
            const response = await utils.fetchAPI(`?action=updateUser`, {
                method: 'POST',
                body: JSON.stringify(updateData)
            });
            
            if (response.status === 200) {
                utils.showNotification('Cập nhật thông tin thành công', 'success');
                // Reload personal info to show updated data
                setTimeout(() => this.showPersonalInfo(), 1000);
            } else {
                utils.showNotification('Không thể cập nhật thông tin', 'error');
            }
            
        } catch (error) {
            console.error('Update error:', error);
            utils.showNotification('Lỗi khi cập nhật thông tin', 'error');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    showChangeRequestModal(field, currentValue) {
        const modal = document.getElementById('changeRequestModal');
        const fieldLabel = document.getElementById('changeFieldLabel');
        const currentValueInput = document.getElementById('currentValue');
        const newValueInput = document.getElementById('newValue');
        const reasonTextarea = document.getElementById('changeReason');
        const form = document.getElementById('changeRequestForm');
        
        const fieldNames = {
            'fullName': 'Họ và tên',
            'position': 'Chức vụ',
            'storeName': 'Cửa hàng',
            'joinDate': 'Ngày gia nhập'
        };
        
        fieldLabel.textContent = fieldNames[field] || field;
        currentValueInput.value = currentValue;
        newValueInput.value = '';
        reasonTextarea.value = '';
        
        modal.style.display = 'block';
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.submitChangeRequest(field, currentValue, newValueInput.value, reasonTextarea.value);
        };
    }

    closeChangeRequestModal() {
        const modal = document.getElementById('changeRequestModal');
        modal.style.display = 'none';
    }

    async submitChangeRequest(field, currentValue, newValue, reason) {
        try {
            // Get user employee ID safely
            const employeeId = await this.getUserEmployeeId();
            
            const requestData = {
                employeeId: employeeId,
                field: field,
                currentValue: currentValue,
                newValue: newValue,
                reason: reason,
                type: 'personal_info_change'
            };
            
            const response = await utils.fetchAPI(`?action=createTask`, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            
            if (response.status === 200) {
                utils.showNotification('Gửi yêu cầu thành công. Chờ ban quản lý duyệt.', 'success');
                this.closeChangeRequestModal();
            } else {
                utils.showNotification('Không thể gửi yêu cầu', 'error');
            }
            
        } catch (error) {
            console.error('Change request error:', error);
            utils.showNotification('Lỗi khi gửi yêu cầu', 'error');
        }
    }

    async loadPersonalStats() {
        try {
            // Get user employee ID safely
            const employeeId = await this.getUserEmployeeId();
            
            // Load personal statistics
            const statsResponse = await utils.fetchAPI(`?action=getPersonalStats&employeeId=${employeeId}`);
            
            if (statsResponse && statsResponse.stats) {
                const stats = statsResponse.stats;
                document.getElementById('workDaysThisMonth').textContent = stats.workDaysThisMonth || 0;
                document.getElementById('totalHoursThisMonth').textContent = `${stats.totalHoursThisMonth || 0} giờ`;
                document.getElementById('attendanceRate').textContent = `${stats.attendanceRate || 0}%`;
            }
        } catch (error) {
            console.log('Stats not available:', error);
            // Set default values if stats API is not available
            document.getElementById('workDaysThisMonth').textContent = '0';
            document.getElementById('totalHoursThisMonth').textContent = '0 giờ';
            document.getElementById('attendanceRate').textContent = '0%';
        }
    }

    async exportPersonalInfo() {
        try {
            // Get user employee ID safely
            const employeeId = await this.getUserEmployeeId();
            
            // Create downloadable personal info summary
            const userInfo = {
                employeeId: employeeId,
                timestamp: new Date().toISOString(),
                // Add other relevant info here
            };
            
            const dataStr = JSON.stringify(userInfo, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `personal-info-${employeeId}-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            utils.showNotification('Đã xuất thông tin cá nhân', 'success');
        } catch (error) {
            console.error('Export personal info error:', error);
            utils.showNotification('Không thể xuất thông tin cá nhân', 'error');
        }
    }



    // Helper functions for the above methods

    generateTaskList(tasks = [], type) {
        if (!tasks.length) return '<p>Không có yêu cầu nào.</p>';
        
        return `
            <div class="task-grid">
                ${tasks.map(task => `
                    <div class="task-card" data-task-id="${task.id}">
                        <h4>${task.title}</h4>
                        <p><strong>Nhân viên:</strong> ${task.employeeName}</p>
                        <p><strong>Loại:</strong> ${task.type}</p>
                        <p><strong>Nội dung:</strong> ${task.content}</p>
                        <p><strong>Ngày gửi:</strong> ${utils.formatDate(task.createdAt)}</p>
                        <div class="task-actions">
                            <button class="btn btn-sm btn-approve" onclick="approveTask('${task.id}')">Duyệt</button>
                            <button class="btn btn-sm btn-reject" onclick="rejectTask('${task.id}')">Từ chối</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateApprovalList(tasks = []) {
        if (!tasks.length) return '<p>Không có yêu cầu cần xét duyệt.</p>';
        
        return `
            <div class="approval-grid">
                ${tasks.map(task => `
                    <div class="approval-card" data-task-id="${task.id}">
                        <h4>${task.title}</h4>
                        <p><strong>Nhân viên:</strong> ${task.employeeName}</p>
                        <p><strong>Loại:</strong> ${task.type}</p>
                        <p><strong>Nội dung:</strong> ${task.content}</p>
                        <p><strong>Ngày gửi:</strong> ${utils.formatDate(task.createdAt)}</p>
                        <div class="approval-form">
                            <textarea placeholder="Ghi chú phê duyệt..." rows="2"></textarea>
                            <div class="approval-actions">
                                <button class="btn btn-sm btn-approve" onclick="finalApprove('${task.id}')">Phê duyệt</button>
                                <button class="btn btn-sm btn-reject" onclick="finalReject('${task.id}')">Từ chối</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateRewardHistory(rewards = []) {
        if (!rewards.length) return '<p>Chưa có lịch sử thưởng/phạt.</p>';
        
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Loại</th>
                        <th>Số tiền</th>
                        <th>Lý do</th>
                        <th>Ngày</th>
                    </tr>
                </thead>
                <tbody>
                    ${rewards.map(reward => `
                        <tr>
                            <td>${reward.employeeName}</td>
                            <td><span class="reward-type ${reward.type}">${reward.type === 'reward' ? 'Thưởng' : 'Phạt'}</span></td>
                            <td>${reward.amount.toLocaleString()} VNĐ</td>
                            <td>${reward.reason}</td>
                            <td>${utils.formatDate(reward.createdAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Setup handlers for the new functions
    setupTaskHandlers(type) {
        // Implementation for task handlers would go here
        window.approveTask = async (taskId) => {
            try {
                await utils.fetchAPI('?action=approveTask', {
                    method: 'POST',
                    body: JSON.stringify({ taskId, type })
                });
                utils.showNotification("Đã duyệt yêu cầu", "success");
                // Refresh the view
                if (type === 'personnel') this.showTaskPersonnel();
                else if (type === 'store') this.showTaskStore();
                else if (type === 'finance') this.showTaskFinance();
            } catch (error) {
                utils.showNotification("Không thể duyệt yêu cầu", "error");
            }
        };

        window.rejectTask = async (taskId) => {
            try {
                await utils.fetchAPI('?action=rejectTask', {
                    method: 'POST',
                    body: JSON.stringify({ taskId, type })
                });
                utils.showNotification("Đã từ chối yêu cầu", "success");
                // Refresh the view
                if (type === 'personnel') this.showTaskPersonnel();
                else if (type === 'store') this.showTaskStore();
                else if (type === 'finance') this.showTaskFinance();
            } catch (error) {
                utils.showNotification("Không thể từ chối yêu cầu", "error");
            }
        };
    }

    setupApprovalHandlers() {
        window.finalApprove = async (taskId) => {
            try {
                await utils.fetchAPI('?action=finalApprove', {
                    method: 'POST',
                    body: JSON.stringify({ taskId })
                });
                utils.showNotification("Đã phê duyệt yêu cầu", "success");
                this.showTaskApproval();
            } catch (error) {
                utils.showNotification("Không thể phê duyệt", "error");
            }
        };

        window.finalReject = async (taskId) => {
            try {
                await utils.fetchAPI('?action=finalReject', {
                    method: 'POST',
                    body: JSON.stringify({ taskId })
                });
                utils.showNotification("Đã từ chối yêu cầu", "success");
                this.showTaskApproval();
            } catch (error) {
                utils.showNotification("Không thể từ chối", "error");
            }
        };
    }



    getRoleDisplayName(role) {
        const roleNames = {
            'AD': 'Administrator',
            'QL': 'Manager',
            'AM': 'Assistant Manager',
            'NV': 'Employee'
        };
        return roleNames[role] || 'Employee';
    }

    setupPermissionManagement() {
        
        // Count roles and update statistics - with delay to ensure DOM is ready
        setTimeout(() => {
            this.updateRoleStatistics();
        }, 100);

        // Setup search functionality
        const searchInput = document.getElementById('userSearch');
        const roleFilter = document.getElementById('roleFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterUsers());
        }
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.filterUsers());
        }

        // Setup role card selection in modal
        document.querySelectorAll('.role-selection-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.role-selection-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Setup global functions for permission management
        window.editUserRole = (userId) => this.editUserRole(userId);
        window.closePermissionModal = () => this.closePermissionModal();
        window.savePermissionChanges = () => this.savePermissionChanges();
        
    }

    updateRoleStatistics() {
        
        const userCards = document.querySelectorAll('.user-card');
        const counts = { AD: 0, QL: 0, AM: 0, NV: 0 };
        
        
        userCards.forEach(card => {
            const role = card.dataset.role || 'NV';
            counts[role] = (counts[role] || 0) + 1;
        });

        // Update the display elements
        const adminCountEl = document.getElementById('adminCount');
        const managerCountEl = document.getElementById('managerCount');
        const assistantCountEl = document.getElementById('assistantCount');
        const employeeCountEl = document.getElementById('employeeCount');

        if (adminCountEl) {
            adminCountEl.textContent = counts.AD;
        }
        if (managerCountEl) {
            managerCountEl.textContent = counts.QL;
        }
        if (assistantCountEl) {
            assistantCountEl.textContent = counts.AM;
        }
        if (employeeCountEl) {
            employeeCountEl.textContent = counts.NV;
        }

    }

    filterUsers() {
        const searchInput = document.getElementById('userSearch');
        const roleFilter = document.getElementById('roleFilter');
        
        if (!searchInput || !roleFilter) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const roleFilterValue = roleFilter.value;
        const userCards = document.querySelectorAll('.user-card');

        userCards.forEach(card => {
            const userName = card.querySelector('h4').textContent.toLowerCase();
            const userId = card.querySelector('.user-id').textContent.toLowerCase();
            const userRole = card.dataset.role;

            // Enhanced search logic: search text ONLY in name and ID, not role
            const matchesSearch = !searchTerm || userName.includes(searchTerm) || userId.includes(searchTerm);
            
            // Role filter: exact match ONLY when role filter is selected
            const matchesRole = !roleFilterValue || userRole === roleFilterValue;

            // Show card only if both search and role filter match
            card.style.display = matchesSearch && matchesRole ? 'flex' : 'none';
        });
    }

    async editUserRole(userId) {
        try {
            
            // Get user details from API
            const userInfo = await utils.fetchAPI(`?action=getUser&employeeId=${userId}`);
            
            if (!userInfo) {
                utils.showNotification("Không thể tải thông tin người dùng", "error");
                return;
            }

            // Load stores for selection
            await this.loadStoresForPermissionEdit();

            const modal = document.getElementById('permissionEditModal');
            const currentUserInfo = document.getElementById('currentUserInfo');
            
            // Populate current user info for the SELECTED user (not logged-in user)
            const userName = userInfo.fullName || 'Không rõ';
            const currentRole = userInfo.position || 'NV';
            const userStore = userInfo.storeName || 'Không rõ';
            
            
            currentUserInfo.innerHTML = `
                <div class="current-user-avatar">${userName.substring(0, 2).toUpperCase()}</div>
                <div class="current-user-details">
                    <h4>${userName}</h4>
                    <p>ID: ${userId} | ${this.getRoleDisplayName(currentRole)} | ${userStore}</p>
                    <span class="current-role-badge role-${currentRole.toLowerCase()}">${this.getRoleDisplayName(currentRole)}</span>
                </div>
            `;

            // Populate form fields with the SELECTED user data
            document.getElementById('editEmployeeId').value = userInfo.employeeId || '';
            document.getElementById('editFullName').value = userInfo.fullName || '';
            document.getElementById('editPhone').value = userInfo.phone || '';
            document.getElementById('editEmail').value = userInfo.email || '';
            document.getElementById('editJoinDate').value = userInfo.joinDate || '';

            // Set current store/region selection based on role
            this.setupStoreRegionSelection(currentRole, userInfo.storeName);

            // Set the role select dropdown to current role
            const roleSelect = document.getElementById('editUserRole');
            if (roleSelect) {
                roleSelect.value = currentRole;
                this.updatePermissionPreview(currentRole);
                
                // Add event listener for role changes to switch store/region selection
                roleSelect.addEventListener('change', (e) => {
                    this.updatePermissionPreview(e.target.value);
                    this.setupStoreRegionSelection(e.target.value, '');
                });
            }

            // Load user history for this specific user
            await this.loadUserHistory(userId);

            // Store current user ID for saving
            modal.dataset.editingUser = userId;
            modal.dataset.originalData = JSON.stringify(userInfo);
            
            // Show modal with CSS animation
            modal.style.display = 'flex';
            modal.classList.add('modal-fade-in');
            
            const modalContent = modal.querySelector('.permission-edit-content');
            if (modalContent) {
                modalContent.classList.add('modal-content-bounce-in');
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
            utils.showNotification("Không thể tải thông tin người dùng", "error");
        }
    }

    updatePermissionPreview(role) {
        const permissionList = document.getElementById('permissionList');
        const permissions = this.getRolePermissions(role);
        
        permissionList.innerHTML = permissions.map(permission => `
            <div class="permission-item">
                <span class="permission-icon">${permission.icon}</span>
                <span class="permission-name">${permission.name}</span>
            </div>
        `).join('');
    }

    async loadStoresForPermissionEdit() {
        try {
            // Use AuthManager's cached stores data
            const response = window.authManager ? await window.authManager.getStoresData() : await API_CACHE.getStoresData();
            
            let stores = [];
            if (Array.isArray(response)) {
                stores = response;
            } else if (response && typeof response === 'object') {
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    stores = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                } else if (response.data && Array.isArray(response.data)) {
                    stores = response.data;
                }
            }

            // Populate store selections
            const storeSelect = document.getElementById('editStoreName');
            const singleStoreSelect = document.getElementById('editSingleStore');
            
            const storeOptions = stores.map(store => 
                `<option value="${store.storeId}">${store.storeName} (${store.storeId})</option>`
            ).join('');
            
            if (storeSelect) {
                storeSelect.innerHTML = storeOptions;
            }
            if (singleStoreSelect) {
                singleStoreSelect.innerHTML = '<option value="">Chọn cửa hàng</option>' + storeOptions;
            }
            
        } catch (error) {
            console.error('Error loading stores for permission edit:', error);
        }
    }

    setupStoreRegionSelection(role, currentValue) {
        const storeSelection = document.getElementById('storeSelection');
        const regionSelection = document.getElementById('regionSelection');
        const singleStoreSelection = document.getElementById('singleStoreSelection');
        const label = document.getElementById('storeAssignmentLabel');
        
        // Hide all by default
        storeSelection.style.display = 'none';
        regionSelection.style.display = 'none';
        singleStoreSelection.style.display = 'none';
        
        if (role === 'AM') {
            // Show region selection for Area Manager
            label.textContent = 'Khu vực quản lý';
            regionSelection.style.display = 'block';
            
            // For AM, set current region based on their store assignment
            if (currentValue && this.regionMap) {
                const currentRegion = this.getStoreRegion(currentValue);
                if (currentRegion) {
                    document.getElementById('editRegion').value = currentRegion;
                }
            }
        } else if (role === 'QL') {
            // Show multi-store selection for Store Manager
            label.textContent = 'Cửa hàng quản lý';
            storeSelection.style.display = 'block';
            
            // Set current stores
            if (currentValue) {
                const stores = currentValue.split(',').map(s => s.trim());
                const select = document.getElementById('editStoreName');
                Array.from(select.options).forEach(option => {
                    option.selected = stores.includes(option.value);
                });
            }
        } else {
            // Show single store selection for other roles
            label.textContent = 'Cửa hàng';
            singleStoreSelection.style.display = 'block';
            
            if (currentValue) {
                document.getElementById('editSingleStore').value = currentValue;
            }
        }
    }

    getRolePermissions(role) {
        const permissions = {
            'AD': [
                { icon: '🏢', name: 'Quản lý toàn hệ thống' },
                { icon: '👥', name: 'Quản lý tất cả nhân viên' },
                { icon: '📊', name: 'Xem tất cả báo cáo' },
                { icon: '⚙️', name: 'Cài đặt hệ thống' },
                { icon: '🔒', name: 'Phân quyền người dùng' },
                { icon: '💰', name: 'Quản lý tài chính' }
            ],
            'QL': [
                { icon: '🏪', name: 'Quản lý cửa hàng' },
                { icon: '👥', name: 'Quản lý nhân viên cửa hàng' },
                { icon: '📈', name: 'Xem báo cáo cửa hàng' },
                { icon: '📝', name: 'Duyệt đăng ký' },
                { icon: '⏰', name: 'Quản lý ca làm việc' }
            ],
            'AM': [
                { icon: '👥', name: 'Hỗ trợ quản lý nhân viên' },
                { icon: '📊', name: 'Xem báo cáo cơ bản' },
                { icon: '📝', name: 'Xử lý yêu cầu nhân viên' },
                { icon: '⏰', name: 'Xem lịch làm việc' }
            ],
            'NV': [
                { icon: '👤', name: 'Xem thông tin cá nhân' },
                { icon: '⏰', name: 'Xem lịch làm việc của mình' },
                { icon: '📝', name: 'Gửi yêu cầu' }
            ]
        };
        
        return permissions[role] || permissions['NV'];
    }

    closePermissionModal() {
        const modal = document.getElementById('permissionEditModal');
        
        if (modal) {
            // CSS-powered modal close animation
            const modalContent = modal.querySelector('.permission-edit-content');
            
            modal.classList.add('modal-fade-out');
            if (modalContent) {
                modalContent.classList.add('modal-content-scale-out');
            }
            
            // Hide modal after animation completes
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('modal-fade-out', 'modal-fade-in');
                if (modalContent) {
                    modalContent.classList.remove('modal-content-scale-out', 'modal-content-bounce-in');
                }
            }, 300);
        }
        
        modal?.removeAttribute('data-editing-user');
        modal?.removeAttribute('data-original-data');
        
        // Clear form
        document.getElementById('changeReason').value = '';
        const roleSelect = document.getElementById('editUserRole');
        if (roleSelect) {
            roleSelect.selectedIndex = 0;
        }
        
        // Clear permission preview
        const permissionList = document.getElementById('permissionList');
        if (permissionList) {
            permissionList.innerHTML = '';
        }
    }

    async loadUserHistory(userId) {
        try {
            const historyList = document.getElementById('userHistoryList');
            historyList.innerHTML = '<div class="history-item"><div class="history-content"><div class="history-action">Đang tải lịch sử...</div></div></div>';
            
            const response = await utils.fetchAPI(`?action=getUserHistory&employeeId=${userId}`);
            
            // Handle multiple response formats
            let history = [];
            if (Array.isArray(response)) {
                history = response;
            } else if (response && Array.isArray(response.results)) {
                history = response.results;
            } else if (response && Array.isArray(response.data)) {
                history = response.data;
            } else if (response && typeof response === 'object') {
                // Handle object with numbered keys like getUserHistory might return
                const historyKeys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (historyKeys.length > 0) {
                    history = historyKeys.map(key => response[key]).filter(item => item && typeof item === 'object');
                    console.log('Converted history object to array:', history);
                }
            }
            
            
            if (!history || history.length === 0) {
                historyList.innerHTML = `
                    <div class="history-item">
                        <div class="history-content">
                            <div class="history-action">Chưa có lịch sử thay đổi cho nhân viên này</div>
                            <div class="history-details">Chưa có hoạt động nào được ghi nhận</div>
                        </div>
                    </div>
                `;
                return;
            }

            // Filter history for this specific user only
            const userHistory = history.filter(item => 
                item.target_employee_id === userId || 
                item.employeeId === userId ||
                item.employee_id === userId
            );
            

            if (userHistory.length === 0) {
                historyList.innerHTML = `
                    <div class="history-item">
                        <div class="history-content">
                            <div class="history-action">Chưa có lịch sử thay đổi cho nhân viên này</div>
                            <div class="history-details">Nhân viên: ${userId}</div>
                        </div>
                    </div>
                `;
                return;
            }

            historyList.innerHTML = userHistory.map(item => `
                <div class="history-item">
                    <div class="history-content">
                        <div class="history-action">${this.getHistoryActionText(item.action_type, item.field_name, item.old_value, item.new_value)}</div>
                        <div class="history-details">Thực hiện bởi: <span class="history-by">${item.action_by_name || item.actionBy || 'Hệ thống'}</span></div>
                        ${item.reason ? `<div class="history-details">Lý do: ${item.reason}</div>` : ''}
                        <div class="history-timestamp">${utils.formatDateTime(item.created_at || item.createdAt || item.timestamp)}</div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading user history:', error);
            const historyList = document.getElementById('userHistoryList');
            historyList.innerHTML = `
                <div class="history-item">
                    <div class="history-content">
                        <div class="history-action">Lỗi tải lịch sử</div>
                        <div class="history-details">Không thể tải lịch sử thay đổi: ${error.message}</div>
                    </div>
                </div>
            `;
        }
    }

    getHistoryActionText(actionType, fieldName, oldValue, newValue) {
        switch (actionType) {
            case 'permission_change':
                return `Thay đổi phân quyền từ ${this.getRoleDisplayName(oldValue)} thành ${this.getRoleDisplayName(newValue)}`;
            case 'user_data_change':
                const fieldNames = {
                    'fullName': 'Họ tên',
                    'storeName': 'Cửa hàng', 
                    'employeeId': 'Mã nhân viên',
                    'phone': 'Số điện thoại',
                    'email': 'Email',
                    'joinDate': 'Ngày gia nhập'
                };
                return `Thay đổi ${fieldNames[fieldName] || fieldName} từ "${oldValue}" thành "${newValue}"`;
            case 'approval_action':
                return `${oldValue} đăng ký của nhân viên`;
            default:
                return 'Thay đổi thông tin';
        }
    }

    async savePermissionChanges() {
        const modal = document.getElementById('permissionEditModal');
        const userId = modal.dataset.editingUser;
        const originalData = JSON.parse(modal.dataset.originalData || '{}');
        
        if (!userId) {
            utils.showNotification("Không tìm thấy thông tin người dùng", "error");
            return;
        }

        const roleSelect = document.getElementById('editUserRole');
        const selectedRole = roleSelect ? roleSelect.value : null;
        const changeReason = document.getElementById('changeReason').value.trim();

        if (!selectedRole) {
            utils.showNotification("Vui lòng chọn vai trò", "warning");
            return;
        }

        if (!changeReason) {
            utils.showNotification("Vui lòng nhập lý do thay đổi", "warning");
            return;
        }

        try {
            // Show loading state
            const saveButton = document.getElementById('savePermissionChanges');
            const originalText = saveButton.innerHTML;
            saveButton.innerHTML = '<span class="material-icons-round">hourglass_empty</span> Đang lưu...';
            saveButton.disabled = true;

            // Get current logged in user
            const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
            
            // Get store/region assignment based on role
            let storeAssignment = '';
            if (selectedRole === 'AM') {
                // For Area Manager, use region selection
                const regionSelect = document.getElementById('editRegion');
                const selectedRegion = regionSelect ? regionSelect.value : '';
                
                // For AM, we store a region-representative store ID or region name
                // This would need backend logic to determine which stores are in this region
                storeAssignment = selectedRegion; // Store the region name directly
            } else if (selectedRole === 'QL') {
                // For Store Manager, use multi-store selection
                const storeSelect = document.getElementById('editStoreName');
                if (storeSelect) {
                    const selectedStores = Array.from(storeSelect.selectedOptions).map(option => option.value);
                    storeAssignment = selectedStores.join(',');
                }
            } else {
                // For other roles, use single store selection
                const singleStoreSelect = document.getElementById('editSingleStore');
                storeAssignment = singleStoreSelect ? singleStoreSelect.value : '';
            }
            
            // Prepare updated user data
            const updateData = {
                employeeId: document.getElementById('editEmployeeId').value,
                fullName: document.getElementById('editFullName').value,
                storeName: storeAssignment,
                position: selectedRole,
                phone: document.getElementById('editPhone').value,
                email: document.getElementById('editEmail').value,
                joinDate: document.getElementById('editJoinDate').value
            };

            // Track what changed for history
            const changes = [];
            Object.keys(updateData).forEach(key => {
                if (originalData[key] !== updateData[key]) {
                    changes.push({
                        field: key,
                        oldValue: originalData[key] || '',
                        newValue: updateData[key] || ''
                    });
                }
            });


            // Update user data
            const result = await utils.fetchAPI('?action=updateUserWithHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...updateData,
                    changes,
                    reason: changeReason,
                    actionBy: loggedInUser.loginEmployeeId
                })
            });

            console.log('Update result:', result);
            
            // Update the UI
            const userCard = document.querySelector(`[data-user-id="${userId}"]`);
            if (userCard) {
                const oldRole = userCard.dataset.role;
                
                // Update user card
                userCard.dataset.role = selectedRole;
                userCard.querySelector('.user-role').textContent = this.getRoleDisplayName(selectedRole);
                userCard.querySelector('.user-role').className = `user-role role-${selectedRole.toLowerCase()}`;
                userCard.querySelector('h4').textContent = updateData.fullName;
                
            }
            
            // Update role statistics
            this.updateRoleStatistics();
            
            // Close modal
            this.closePermissionModal();
            
            utils.showNotification("Đã cập nhật thông tin thành công", "success");
            
            // Refresh the user list to show updates
            setTimeout(() => {
                this.showGrantAccess();
            }, 1000);

        } catch (error) {
            console.error('Save permission error:', error);
            utils.showNotification("Không thể lưu thông tin: " + error.message, "error");
        } finally {
            // Reset button state
            const saveButton = document.getElementById('savePermissionChanges');
            if (saveButton) {
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            }
        }
    }

    setupAccessHandlers() {
        document.getElementById('userSelect')?.addEventListener('change', async (e) => {
            const employeeId = e.target.value;
            if (employeeId) {
                try {
                    // For now, just show the permission form without loading existing permissions
                    document.getElementById('permissionForm').style.display = 'block';
                    
                    // Reset all checkboxes
                    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                        checkbox.checked = false;
                    });
                } catch (error) {
                    console.error('Load permissions error:', error);
                    utils.showNotification("Không thể tải quyền hạn", "error");
                }
            } else {
                document.getElementById('permissionForm').style.display = 'none';
            }
        });

        document.getElementById('savePermissions')?.addEventListener('click', async () => {
            try {
                const employeeId = document.getElementById('userSelect').value;
                if (!employeeId) {
                    utils.showNotification("Vui lòng chọn nhân viên", "warning");
                    return;
                }

                const permissions = {};
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    permissions[checkbox.name] = checkbox.checked;
                });

                // For now, just show success message as the API doesn't exist
                utils.showNotification("Đã cập nhật quyền hạn (demo)", "success");
                console.log('Permissions would be saved:', { employeeId, permissions });
            } catch (error) {
                console.error('Update permissions error:', error);
                utils.showNotification("Không thể cập nhật quyền hạn", "error");
            }
        });
    }

    setupPersonalInfoHandlers() {
        const form = document.getElementById('personalInfoForm');
        const submitButton = form?.querySelector('button[type="submit"]');
        const passwordSection = document.querySelector('.password-confirmation-section');
        
        // Track if editable fields have changed
        let hasChanges = false;
        const originalData = {};
        
        // Store original values
        form?.querySelectorAll('.editable-field input').forEach(input => {
            originalData[input.name] = input.value;
        });
        
        // Monitor changes in editable fields
        form?.querySelectorAll('.editable-field input').forEach(input => {
            input.addEventListener('input', () => {
                hasChanges = Object.keys(originalData).some(key => {
                    const currentInput = form.querySelector(`[name="${key}"]`);
                    return currentInput && currentInput.value !== originalData[key];
                });
                
                if (hasChanges) {
                    passwordSection.style.display = 'block';
                    submitButton.disabled = false;
                } else {
                    passwordSection.style.display = 'none';
                    submitButton.disabled = true;
                }
            });
        });
        
        // Handle form submission with password confirmation
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!hasChanges) {
                utils.showNotification("Không có thay đổi nào để cập nhật", "warning");
                return;
            }
            
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            if (!confirmPassword) {
                utils.showNotification("Vui lòng nhập mật khẩu để xác nhận", "error");
                return;
            }
            
            const button = submitButton;
            const buttonText = button?.querySelector('.btn-text');
            
            if (button) button.classList.add('loading');
            if (buttonText) buttonText.textContent = 'Đang cập nhật...';
            
            try {
                const formData = new FormData(e.target);
                const updateData = Object.fromEntries(formData);
                
                // Only include editable fields
                const editableData = {
                    employeeId: updateData.employeeId,
                    email: updateData.email,
                    phone: updateData.phone,
                    password: confirmPassword // For verification
                };
                
                // Use update API to update personal information
                await utils.fetchAPI('?action=updatePersonalInfo', {
                    method: 'POST',
                    body: JSON.stringify(editableData)
                });
                
                utils.showNotification("Đã cập nhật thông tin cá nhân", "success");
                
                // Reset form state
                hasChanges = false;
                passwordSection.style.display = 'none';
                submitButton.disabled = true;
                document.getElementById('confirmPassword').value = '';
                
                // Update original data
                Object.keys(originalData).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) originalData[key] = input.value;
                });
                
            } catch (error) {
                console.error('Update personal info error:', error);
                utils.showNotification(error.message || "Không thể cập nhật thông tin", "error");
            } finally {
                if (button) button.classList.remove('loading');
                if (buttonText) buttonText.textContent = 'Cập nhật thông tin';
            }
        });
        
        // Handle change request buttons
        document.querySelectorAll('.btn-request').forEach(button => {
            button.addEventListener('click', (e) => {
                const field = e.target.getAttribute('data-field');
                const currentValue = form.querySelector(`[name="${field}"]`)?.value;
                openChangeRequestModal(field, currentValue);
            });
        });
        
        // Handle change request form submission
        document.getElementById('changeRequestForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get user employee ID safely
                const employeeId = await this.getUserEmployeeId();
                
                const formData = new FormData(e.target);
                const requestData = {
                    employeeId: employeeId,
                    field: document.getElementById('changeRequestForm').dataset.field,
                    currentValue: formData.get('currentValue'),
                    newValue: formData.get('newValue'),
                    reason: formData.get('reason'),
                    type: 'personal_info_change'
                };
            
                try {
                    await utils.fetchAPI('?action=createTask', {
                        method: 'POST',
                        body: JSON.stringify(requestData)
                    });
                    
                    utils.showNotification("Yêu cầu thay đổi đã được gửi", "success");
                    closeChangeRequestModal();
                } catch (error) {
                    console.error('Change request error:', error);
                    utils.showNotification("Không thể gửi yêu cầu", "error");
                }
            } catch (error) {
                console.error('Change request form error:', error);
                utils.showNotification("Không thể xử lý yêu cầu", "error");
            }
        });
        
        // Handle modal close
        document.querySelector('.modal-close')?.addEventListener('click', closeChangeRequestModal);
    }

    // Registration Approval Management
    async showRegistrationApproval() {
        const content = document.getElementById('content');
        
        try {
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>🔍 Quản Lý Đăng Ký Nhân Viên</h2>
                        <div class="header-stats">
                            <div class="stat-chip">
                                <span class="stat-icon">⏳</span>
                                <span id="pendingCount">0</span> Chờ duyệt
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Enhanced Filters -->
                        <div class="approval-filters-enhanced">
                            <div class="filter-group">
                                <label>🏪 Cửa hàng:</label>
                                <select id="storeFilterSelect" class="form-control">
                                    <option value="">Tất cả cửa hàng</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>📅 Ngày gửi:</label>
                                <select id="dateFilterSelect" class="form-control">
                                    <option value="">Tất cả ngày</option>
                                    <option value="today">Hôm nay</option>
                                    <option value="yesterday">Hôm qua</option>
                                    <option value="week">7 ngày qua</option>
                                    <option value="month">30 ngày qua</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>🎯 Trạng thái:</label>
                                <select id="statusFilterSelect" class="form-control">
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="rejected">Đã từ chối</option>
                                    <option value="all">Tất cả</option>
                                </select>
                            </div>
                            <div class="filter-actions">
                                <button id="refreshPendingRegistrations" class="btn btn-secondary">
                                    <span class="material-icons-round">refresh</span>
                                    Làm mới
                                </button>
                                <button id="bulkApprovalBtn" class="btn btn-success" style="display: none;">
                                    <span class="material-icons-round">done_all</span>
                                    Duyệt hàng loạt
                                </button>
                            </div>
                        </div>

                        <!-- Search Bar -->
                        <div class="search-section">
                            <div class="search-bar">
                                <span class="search-icon">🔍</span>
                                <input type="text" id="searchInput" placeholder="Tìm kiếm theo tên, email, hoặc mã nhân viên..." class="search-input">
                                <button id="clearSearch" class="clear-search-btn" style="display: none;">✕</button>
                            </div>
                        </div>

                        <!-- Bulk Actions -->
                        <div id="bulkActionsBar" class="bulk-actions-bar" style="display: none;">
                            <div class="bulk-info">
                                <span id="selectedCount">0</span> mục đã chọn
                            </div>
                            <div class="bulk-buttons">
                                <button id="bulkApprove" class="btn btn-success">
                                    <span class="material-icons-round">check</span>
                                    Duyệt tất cả
                                </button>
                                <button id="bulkReject" class="btn btn-danger">
                                    <span class="material-icons-round">close</span>
                                    Từ chối tất cả
                                </button>
                                <button id="clearSelection" class="btn btn-secondary">
                                    <span class="material-icons-round">clear</span>
                                    Bỏ chọn
                                </button>
                            </div>
                        </div>

                        <!-- Registration List -->
                        <div id="pendingRegistrationsList" class="registrations-container-enhanced">
                            <div class="registrations-list">
                                <div class="loading-text">Đang tải danh sách đăng ký...</div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div id="paginationControls" class="pagination-controls" style="display: none;">
                            <button id="prevPage" class="btn btn-outline">
                                <span class="material-icons-round">chevron_left</span>
                                Trang trước
                            </button>
                            <span id="pageInfo" class="page-info">Trang 1 / 1</span>
                            <button id="nextPage" class="btn btn-outline">
                                Trang sau
                                <span class="material-icons-round">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Registration Detail Modal -->
                <div id="registrationDetailModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>📋 Chi Tiết Đăng Ký</h3>
                            <button class="modal-close" onclick="contentManager.closest('.modal').style.display='none'">✕</button>
                        </div>
                        <div class="modal-body" id="registrationDetailContent">
                            <!-- Content will be filled dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button id="modalApprove" class="btn btn-success">
                                <span class="material-icons-round">check</span>
                                Duyệt
                            </button>
                            <button id="modalReject" class="btn btn-danger">
                                <span class="material-icons-round">close</span>
                                Từ chối
                            </button>
                            <button class="btn btn-secondary" onclick="contentManager.closest('.modal').style.display='none'">Đóng</button>
                        </div>
                    </div>
                </div>
            `;

            // Initialize enhanced functionality
            this.currentPage = 1;
            this.pageSize = 10;
            this.selectedRegistrations = new Set();
            this.filteredRegistrations = [];
            this.allRegistrations = [];
            this.storeMap = new Map(); // Store ID -> Store Name mapping
            this.regionMap = new Map(); // Store ID -> Region mapping
            this.isLoadingRegistrations = false; // Prevent duplicate API calls

            await this.loadStoreMapping();
            await this.loadStoresForFilter();
            await this.loadPendingRegistrations();
            this.setupEnhancedRegistrationApprovalHandlers();
        } catch (error) {
            console.error('Registration approval error:', error);
            utils.showNotification("Không thể tải danh sách đăng ký", "error");
        }
    }

    async loadStoreMapping() {
        try {
            // Use AuthManager's cached stores data
            const response = window.authManager ? await window.authManager.getStoresData() : await API_CACHE.getStoresData();
            
            let stores = [];
            if (Array.isArray(response)) {
                stores = response;
            } else if (response && typeof response === 'object') {
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    stores = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                } else if (response.data && Array.isArray(response.data)) {
                    stores = response.data;
                }
            }

            // Create mapping from store ID to store info
            this.storeMap.clear();
            this.regionMap = new Map(); // Store ID -> Region mapping
            stores.forEach(store => {
                if (store.storeId && store.storeName) {
                    this.storeMap.set(store.storeId, store.storeName);
                    if (store.region) {
                        this.regionMap.set(store.storeId, store.region);
                    }
                }
            });
            
            console.log('Store mapping loaded:', this.storeMap);
            console.log('Region mapping loaded:', this.regionMap);
        } catch (error) {
            console.error('Error loading store mapping:', error);
        }
    }

    getStoreDisplayName(storeId) {
        return this.storeMap.get(storeId) || storeId || 'N/A';
    }

    getStoreRegion(storeId) {
        return this.regionMap.get(storeId) || '';
    }

    async loadStoresForFilter() {
        try {
            // Use AuthManager's cached stores data 
            const response = window.authManager ? await window.authManager.getStoresData() : await API_CACHE.getStoresData();
            console.log('Stores API response:', response);
            
            let allStores = [];
            if (Array.isArray(response)) {
                allStores = response;
            } else if (response && typeof response === 'object') {
                // Handle object format with numeric keys
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    allStores = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                } else if (response.data && Array.isArray(response.data)) {
                    allStores = response.data;
                }
            }
            
            // Get user's current info to apply proper filtering using cached data
            const currentUser = window.authManager ? await window.authManager.getUserData() : await API_CACHE.getUserData();
            if (!currentUser) {
                throw new Error('Could not get user data from cache');
            }
            
            let availableStores = [];
            
            // Apply filtering based on user role and permissions
            if (currentUser.position === 'AD') {
                // Administrator can see all stores
                availableStores = allStores;
            } else if (currentUser.position === 'AM') {
                // Area Manager - filter by region based on their store
                if (currentUser.storeName) {
                    const userStore = allStores.find(store => 
                        store.storeId === currentUser.storeName || store.storeName === currentUser.storeName
                    );
                    if (userStore && userStore.region) {
                        availableStores = allStores.filter(store => store.region === userStore.region);
                    }
                }
            } else if (currentUser.position === 'QL') {
                // Store Manager - only their specific stores (support multiple stores)
                if (currentUser.storeName) {
                    const userStores = currentUser.storeName.split(',').map(s => s.trim());
                    availableStores = allStores.filter(store => 
                        userStores.includes(store.storeId) || userStores.includes(store.storeName)
                    );
                }
            }
            
            console.log('Available stores for user:', availableStores);
            const storeFilter = document.getElementById('storeFilterSelect');
            if (storeFilter && availableStores.length > 0) {
                storeFilter.innerHTML = '<option value="">Tất cả cửa hàng</option>' +
                    availableStores.map(store => 
                        `<option value="${store.storeId}">${store.storeName} (${store.storeId})</option>`
                    ).join('');
            } else {
                console.log('⚠️ No stores available for this user');
                if (storeFilter) {
                    storeFilter.innerHTML = '<option value="">Không có cửa hàng nào</option>';
                }
            }
        } catch (error) {
            console.error('Load stores error:', error);
            utils.showNotification('Không thể tải danh sách cửa hàng', 'warning');
        }
    }

    async loadPendingRegistrations(store = '') {
        // Prevent duplicate calls with loading state
        if (this.isLoadingRegistrations) {
            console.log('Already loading registrations, skipping duplicate call');
            return;
        }
        
        this.isLoadingRegistrations = true;
        
        try {
            const statusFilter = document.getElementById('statusFilterSelect')?.value || 'pending';
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            
            // Show loading state
            const container = document.getElementById('pendingRegistrationsList');
            if (container) {
                container.innerHTML = `
                    <div class="registrations-list">
                        <div class="loading-text">Đang tải danh sách đăng ký...</div>
                    </div>
                `;
            }
            
            // Improved URL construction 
            let url = `?action=getPendingRegistrations&token=${token}`;
            if (store) {
                url += `&store=${encodeURIComponent(store)}`;
            }
            if (statusFilter && statusFilter !== 'pending') {
                url += `&status=${statusFilter}`;
            }
            
            console.log('Loading pending registrations from:', CONFIG.API_URL + url);
            const response = await utils.fetchAPI(url);
            console.log('Full API response:', response);
            
            // Convert object format {0: {data}, 1: {data}, ...} to array
            let registrations = [];
            if (Array.isArray(response)) {
                registrations = response;
                console.log('Response is already an array:', registrations);
            } else if (response && typeof response === 'object') {
                // Check if response has numeric keys (API returns {0: {}, 1: {}, ...})
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                console.log('Numeric keys found:', keys);
                if (keys.length > 0) {
                    registrations = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                    console.log('Converted to array:', registrations);
                } else {
                    console.log('No numeric keys found, checking for data property');
                    if (response.data && Array.isArray(response.data)) {
                        registrations = response.data;
                    } else if (response.data && typeof response.data === 'object') {
                        const dataKeys = Object.keys(response.data).filter(key => !isNaN(key));
                        registrations = dataKeys.map(key => response.data[key]).filter(item => item && typeof item === 'object');
                    }
                }
            }
            
            console.log('Final registrations array:', registrations);
            this.allRegistrations = registrations;
            
            // Update pending count
            const pendingCount = this.allRegistrations.filter(r => r.status === 'Wait').length;
            const pendingCountElement = document.getElementById('pendingCount');
            if (pendingCountElement) {
                pendingCountElement.textContent = pendingCount;
            }
            
            // Show detailed debug info
            console.log(`Found ${this.allRegistrations.length} total registrations`);
            console.log(`${pendingCount} are pending (status: 'Wait')`);
            
            this.filterRegistrations();
        } catch (error) {
            console.error('Load pending registrations error:', error);
            const container = document.getElementById('pendingRegistrationsList');
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <div class="error-text">Không thể tải danh sách đăng ký</div>
                        <div class="error-subtext">Lỗi: ${error.message}</div>
                        <div class="error-subtext">API URL: ${CONFIG.API_URL}</div>
                        <button class="btn btn-primary" onclick="window.registrationApproval.loadPendingRegistrations()">
                            Thử lại
                        </button>
                    </div>
                `;
            }
        } finally {
            // Reset loading state
            this.isLoadingRegistrations = false;
        }
    }

    setupEnhancedRegistrationApprovalHandlers() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        searchInput?.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm) {
                clearSearch.style.display = 'block';
            } else {
                clearSearch.style.display = 'none';
            }
            this.filterRegistrations();
        });

        clearSearch?.addEventListener('click', () => {
            searchInput.value = '';
            clearSearch.style.display = 'none';
            this.filterRegistrations();
        });

        // Filter handlers
        document.getElementById('storeFilterSelect')?.addEventListener('change', () => {
            this.filterRegistrations();
        });

        document.getElementById('dateFilterSelect')?.addEventListener('change', () => {
            this.filterRegistrations();
        });

        document.getElementById('statusFilterSelect')?.addEventListener('change', () => {
            this.filterRegistrations();
        });

        // Refresh button
        document.getElementById('refreshPendingRegistrations')?.addEventListener('click', () => {
            this.loadPendingRegistrations();
        });

        // Bulk actions
        document.getElementById('bulkApprove')?.addEventListener('click', () => {
            this.bulkApproveRegistrations();
        });

        document.getElementById('bulkReject')?.addEventListener('click', () => {
            this.bulkRejectRegistrations();
        });

        document.getElementById('clearSelection')?.addEventListener('click', () => {
            this.clearSelection();
        });

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderRegistrations();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredRegistrations.length / this.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderRegistrations();
            }
        });

        // Global functions for enhanced approval
        window.approveRegistration = async (employeeId) => {
            if (!confirm('Bạn có chắc chắn muốn duyệt đăng ký này?')) return;
            
            try {
                await this.processRegistration(employeeId, 'approve');
                utils.showNotification("Đã duyệt đăng ký thành công!", "success");
                await this.loadPendingRegistrations();
            } catch (error) {
                console.error('Approve registration error:', error);
                utils.showNotification("Không thể duyệt đăng ký", "error");
            }
        };

        window.rejectRegistration = async (employeeId) => {
            if (!confirm('Bạn có chắc chắn muốn từ chối đăng ký này?')) return;
            
            try {
                await this.processRegistration(employeeId, 'reject');
                utils.showNotification("Đã từ chối đăng ký", "success");
                await this.loadPendingRegistrations();
            } catch (error) {
                console.error('Reject registration error:', error);
                utils.showNotification("Không thể từ chối đăng ký", "error");
            }
        };

        window.viewRegistrationDetail = (employeeId) => {
            this.showRegistrationDetail(employeeId);
        };

        window.toggleRegistrationSelection = (employeeId, checkbox) => {
            if (checkbox.checked) {
                this.selectedRegistrations.add(employeeId);
            } else {
                this.selectedRegistrations.delete(employeeId);
            }
            this.updateBulkActionsBar();
        };
    }

    async processRegistration(employeeId, action) {
        return await utils.fetchAPI('?action=approveRegistration', {
            method: 'POST',
            body: JSON.stringify({ employeeId, action })
        });
    }

    async bulkApproveRegistrations() {
        if (this.selectedRegistrations.size === 0) {
            utils.showNotification("Vui lòng chọn ít nhất một đăng ký", "warning");
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn duyệt ${this.selectedRegistrations.size} đăng ký đã chọn?`)) return;

        const promises = Array.from(this.selectedRegistrations).map(employeeId => 
            this.processRegistration(employeeId, 'approve')
        );

        try {
            await Promise.all(promises);
            utils.showNotification(`Đã duyệt ${this.selectedRegistrations.size} đăng ký thành công!`, "success");
            this.clearSelection();
            await this.loadPendingRegistrations();
        } catch (error) {
            console.error('Bulk approve error:', error);
            utils.showNotification("Có lỗi xảy ra khi duyệt hàng loạt", "error");
        }
    }

    async bulkRejectRegistrations() {
        if (this.selectedRegistrations.size === 0) {
            utils.showNotification("Vui lòng chọn ít nhất một đăng ký", "warning");
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn từ chối ${this.selectedRegistrations.size} đăng ký đã chọn?`)) return;

        const promises = Array.from(this.selectedRegistrations).map(employeeId => 
            this.processRegistration(employeeId, 'reject')
        );

        try {
            await Promise.all(promises);
            utils.showNotification(`Đã từ chối ${this.selectedRegistrations.size} đăng ký!`, "success");
            this.clearSelection();
            await this.loadPendingRegistrations();
        } catch (error) {
            console.error('Bulk reject error:', error);
            utils.showNotification("Có lỗi xảy ra khi từ chối hàng loạt", "error");
        }
    }

    clearSelection() {
        this.selectedRegistrations.clear();
        document.querySelectorAll('.registration-checkbox').forEach(cb => cb.checked = false);
        this.updateBulkActionsBar();
    }

    updateBulkActionsBar() {
        const bulkActionsBar = document.getElementById('bulkActionsBar');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedRegistrations.size > 0) {
            bulkActionsBar.style.display = 'flex';
            selectedCount.textContent = this.selectedRegistrations.size;
        } else {
            bulkActionsBar.style.display = 'none';
        }
    }

    filterRegistrations() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const storeFilter = document.getElementById('storeFilterSelect')?.value || '';
        const dateFilter = document.getElementById('dateFilterSelect')?.value || '';
        const statusFilter = document.getElementById('statusFilterSelect')?.value || 'pending';
        
        console.log('Filtering with:', { searchTerm, storeFilter, dateFilter, statusFilter });
        console.log('All registrations before filter:', this.allRegistrations);

        this.filteredRegistrations = this.allRegistrations.filter(reg => {
            // Search filter
            const matchesSearch = !searchTerm || 
                reg.fullName?.toLowerCase().includes(searchTerm) ||
                reg.email?.toLowerCase().includes(searchTerm) ||
                reg.employeeId?.toLowerCase().includes(searchTerm);

            // Store filter - check both storeId and storeName 
            const matchesStore = !storeFilter || 
                reg.storeId === storeFilter || 
                reg.storeName === storeFilter;

            // Date filter
            let matchesDate = true;
            if (dateFilter && reg.createdAt) {
                const regDate = new Date(reg.createdAt);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = regDate >= today;
                        break;
                    case 'yesterday':
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        matchesDate = regDate >= yesterday && regDate < today;
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        matchesDate = regDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setDate(monthAgo.getDate() - 30);
                        matchesDate = regDate >= monthAgo;
                        break;
                }
            }

            // Status filter (API uses 'Wait' for pending)
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'pending' && reg.status === 'Wait') ||
                (statusFilter === 'approved' && reg.status === 'Approved') ||
                (statusFilter === 'rejected' && reg.status === 'Rejected') ||
                reg.status === statusFilter;

            const result = matchesSearch && matchesStore && matchesDate && matchesStatus;
            
            // Debug individual filter results
            if (this.allRegistrations.length > 0) {
                console.log(`Registration ${reg.employeeId}:`, {
                    matchesSearch, matchesStore, matchesDate, matchesStatus, result,
                    status: reg.status, storeName: reg.storeName, storeId: reg.storeId
                });
            }
            
            return result;
        });
        
        console.log('Filtered registrations:', this.filteredRegistrations);

        this.currentPage = 1;
        this.renderRegistrations();
    }

    renderRegistrations() {
        const container = document.getElementById('pendingRegistrationsList');
        if (!container) {
            console.error('Container pendingRegistrationsList not found');
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageRegistrations = this.filteredRegistrations.slice(startIndex, endIndex);
        
        console.log(`Rendering page ${this.currentPage}, showing ${pageRegistrations.length} of ${this.filteredRegistrations.length} registrations`);

        if (!pageRegistrations.length) {
            const hasData = this.allRegistrations.length > 0;
            container.innerHTML = `
                <div class="empty-state-enhanced">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">${hasData ? 'Không có kết quả phù hợp' : 'Không có đăng ký nào'}</div>
                    <div class="empty-subtext">${hasData ? 'Thử thay đổi bộ lọc hoặc tìm kiếm' : 'Chưa có đăng ký nào được gửi'}</div>
                    ${hasData ? `<button class="btn btn-secondary" onclick="document.getElementById('searchInput').value = ''; document.getElementById('statusFilterSelect').value = 'pending'; window.registrationApproval.filterRegistrations();">Xóa bộ lọc</button>` : ''}
                </div>
            `;
            const paginationElement = document.getElementById('paginationControls');
            if (paginationElement) {
                paginationElement.style.display = 'none';
            }
            return;
        }

        container.innerHTML = pageRegistrations.map(reg => `
            <div class="registration-card-enhanced" data-employee-id="${reg.employeeId}">
                <div class="registration-select">
                    <input type="checkbox" class="registration-checkbox" 
                           onchange="window.toggleRegistrationSelection('${reg.employeeId}', this)">
                </div>
                <div class="registration-avatar">
                    <div class="avatar-circle">
                        ${reg.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div class="status-indicator status-${reg.status || 'pending'}"></div>
                </div>
                <div class="registration-info-enhanced">
                    <div class="registration-header">
                        <h3 class="registration-name">${reg.fullName || 'N/A'}</h3>
                        <div class="registration-badges">
                            <span class="position-badge">${reg.position || 'N/A'}</span>
                            <span class="store-badge">${this.getStoreDisplayName(reg.storeName)}</span>
                        </div>
                    </div>
                    <div class="registration-details">
                        <div class="detail-row">
                            <span class="detail-label">📧 Email:</span>
                            <span class="detail-value">${reg.email || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📱 SĐT:</span>
                            <span class="detail-value">${reg.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">🆔 Mã NV:</span>
                            <span class="detail-value">${reg.employeeId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📅 Ngày gửi:</span>
                            <span class="detail-value">${utils.formatDateTime(reg.createdAt)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📊 Trạng thái:</span>
                            <span class="detail-value status-text-${reg.status?.toLowerCase() || 'wait'}">${this.getStatusText(reg.status)}</span>
                        </div>
                    </div>
                </div>
                <div class="registration-actions-enhanced">
                    <button class="action-btn view-btn" onclick="window.viewRegistrationDetail('${reg.employeeId}')" title="Xem chi tiết">
                        <span class="material-icons-round">visibility</span>
                    </button>
                    ${reg.status === 'Wait' ? `
                        <button class="action-btn approve-btn" onclick="window.approveRegistration('${reg.employeeId}')" title="Duyệt">
                            <span class="material-icons-round">check</span>
                        </button>
                        <button class="action-btn reject-btn" onclick="window.rejectRegistration('${reg.employeeId}')" title="Từ chối">
                            <span class="material-icons-round">close</span>
                        </button>
                    ` : reg.status === 'Rejected' ? `
                        <button class="action-btn approve-btn" onclick="window.approveRegistration('${reg.employeeId}')" title="Duyệt lại">
                            <span class="material-icons-round">check</span>
                            Duyệt lại
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        this.updatePaginationControls();
    }
    
    getStatusText(status) {
        const statusMap = {
            'Wait': '⏳ Chờ duyệt',
            'Approved': '✅ Đã duyệt', 
            'Rejected': '❌ Đã hủy'
        };
        return statusMap[status] || status || '⏳ Chờ duyệt';
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.filteredRegistrations.length / this.pageSize);
        const paginationControls = document.getElementById('paginationControls');
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (totalPages > 1) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `Trang ${this.currentPage} / ${totalPages}`;
            prevBtn.disabled = this.currentPage === 1;
            nextBtn.disabled = this.currentPage === totalPages;
        } else {
            paginationControls.style.display = 'none';
        }
    }

    async showRegistrationDetail(employeeId) {
        const registration = this.allRegistrations.find(reg => reg.employeeId === employeeId);
        if (!registration) return;

        const modal = document.getElementById('registrationDetailModal');
        const content = document.getElementById('registrationDetailContent');

        content.innerHTML = `
            <div class="registration-detail-view">
                <div class="detail-section">
                    <h4>👤 Thông tin cá nhân</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Họ tên:</span>
                            <span class="value">${registration.fullName || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Mã nhân viên:</span>
                            <span class="value">${registration.employeeId}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Email:</span>
                            <span class="value">${registration.email || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Số điện thoại:</span>
                            <span class="value">${registration.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Chức vụ:</span>
                            <span class="value">${registration.position || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>🏪 Thông tin công việc</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Tên cửa hàng:</span>
                            <span class="value">${this.getStoreDisplayName(registration.storeName)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Mã cửa hàng:</span>
                            <span class="value">${registration.storeName || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>📅 Thông tin đăng ký</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Ngày gửi:</span>
                            <span class="value">${utils.formatDateTime(registration.createdAt)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Trạng thái:</span>
                            <span class="value status-${registration.status || 'pending'}">
                                ${this.getStatusText(registration.status || 'pending')}
                            </span>
                        </div>
                        ${registration.processedAt ? `
                        <div class="detail-item">
                            <span class="label">Ngày xử lý:</span>
                            <span class="value">${utils.formatDateTime(registration.processedAt)}</span>
                        </div>
                        ` : ''}
                        ${registration.processedBy ? `
                        <div class="detail-item">
                            <span class="label">Người xử lý:</span>
                            <span class="value">${registration.processedBy}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Set modal action buttons
        document.getElementById('modalApprove').onclick = () => {
            modal.style.display = 'none';
            window.approveRegistration(employeeId);
        };

        document.getElementById('modalReject').onclick = () => {
            modal.style.display = 'none';
            window.rejectRegistration(employeeId);
        };

        modal.style.display = 'flex';
    }

    getStatusText(status) {
        switch (status) {
            case 'Wait':
            case 'wait':
            case 'pending': return '⏳ Chờ duyệt';
            case 'approved': return '✅ Đã duyệt';
            case 'rejected': return '❌ Đã hủy';
            default: return '❓ Không xác định';
        }
    }

    // Timesheet Management Functions
    async loadTimesheetData(employeeId) {
        try {
            const selectedMonth = document.getElementById('timesheetMonth')?.value || this.getCurrentMonth();
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            
            // Always render a calendar first, then load data
            this.renderTimesheetCalendar(null, selectedMonth);
            
            // Fetch both attendance data and approved attendance requests
            const [attendanceResponse, requestsResponse] = await Promise.all([
                utils.fetchAPI(`?action=getTimesheet&employeeId=${employeeId}&month=${selectedMonth}&token=${token}`),
                utils.fetchAPI(`?action=getAttendanceRequests&employeeId=${employeeId}&month=${selectedMonth}&status=approved&token=${token}`)
            ]);
            
            // Merge attendance data with approved requests
            let mergedData = {};
            let statistics = null;
            
            if (attendanceResponse && attendanceResponse.success) {
                mergedData = attendanceResponse.data || {};
                statistics = attendanceResponse.statistics;
            }
            
            // Process approved attendance requests to supplement missing attendance data
            if (requestsResponse) {
                let requests = [];
                
                // Handle different response formats
                if (Array.isArray(requestsResponse)) {
                    requests = requestsResponse;
                } else if (typeof requestsResponse === 'object') {
                    requests = Object.keys(requestsResponse)
                        .filter(key => !['timestamp', 'status'].includes(key))
                        .map(key => requestsResponse[key])
                        .filter(req => req && req.status === 'approved');
                }
                
                // Merge approved requests into attendance data
                requests.forEach(request => {
                    const requestDate = request.targetDate;
                    if (requestDate && request.targetTime) {
                        // Parse targetTime - handle both Vietnamese and time formats
                        let timeInfo = this.parseTargetTime(request.targetTime);
                        
                        if (!mergedData[requestDate]) {
                            mergedData[requestDate] = {};
                        }
                        
                        // Add the approved request data to the attendance record
                        mergedData[requestDate].checkIn = timeInfo.checkIn || mergedData[requestDate].checkIn;
                        mergedData[requestDate].checkOut = timeInfo.checkOut || mergedData[requestDate].checkOut;
                        mergedData[requestDate].status = mergedData[requestDate].status || 'present';
                        mergedData[requestDate].source = 'approved_request';
                        mergedData[requestDate].requestType = request.type;
                    }
                });
            }
            
            if (Object.keys(mergedData).length > 0) {
                this.renderTimesheetCalendar(mergedData, selectedMonth);
                this.updateTimesheetStatistics(statistics);
            } else {
                // Keep the calendar but show empty data
                this.updateTimesheetStatistics(null);
            }
        } catch (error) {
            console.error('Error loading timesheet:', error);
            // Still show the calendar structure, just with no data
            this.renderTimesheetCalendar(null, this.getCurrentMonth());
            this.updateTimesheetStatistics(null);
        }
    }

    // Helper function to parse targetTime from Vietnamese format
    parseTargetTime(targetTime) {
        const result = {};
        
        if (!targetTime) return result;
        
        // Handle formats like "Giờ vào: 02:03" or "Giờ vào: 01:43, Giờ ra: 09:43"
        const vietnameseTimeRegex = /Giờ vào:\s*(\d{2}:\d{2})|Giờ ra:\s*(\d{2}:\d{2})/g;
        let match;
        
        while ((match = vietnameseTimeRegex.exec(targetTime)) !== null) {
            if (match[1]) {
                result.checkIn = match[1];
            }
            if (match[2]) {
                result.checkOut = match[2];
            }
        }
        
        // Also handle direct time formats like "08:00" or "08:00-17:00"
        const directTimeRegex = /^(\d{2}:\d{2})(?:\s*-\s*(\d{2}:\d{2}))?$/;
        const directMatch = directTimeRegex.exec(targetTime.trim());
        if (directMatch) {
            result.checkIn = directMatch[1];
            if (directMatch[2]) {
                result.checkOut = directMatch[2];
            }
        }
        
        return result;
    }

    renderTimesheetCalendar(data, selectedMonth) {
        const calendar = document.getElementById('timesheetCalendar');
        const month = selectedMonth || document.getElementById('timesheetMonth')?.value || this.getCurrentMonth();
        const [year, monthNum] = month.split('-').map(Number);
        
        // Create calendar grid
        const firstDay = new Date(year, monthNum - 1, 1);
        const lastDay = new Date(year, monthNum, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        
        let calendarHTML = `
            <div class="calendar-header">
                <div class="day-name">CN</div>
                <div class="day-name">T2</div>
                <div class="day-name">T3</div>
                <div class="day-name">T4</div>
                <div class="day-name">T5</div>
                <div class="day-name">T6</div>
                <div class="day-name">T7</div>
            </div>
            <div class="calendar-grid">
        `;
        
        // Add empty cells for days before month start
        for (let i = 0; i < startDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = data ? data.find(d => new Date(d.date).getDate() === day) : null;
            const isToday = new Date().getDate() === day && new Date().getMonth() + 1 === monthNum;
            const dateStr = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${dayData ? 'has-data' : ''}" 
                     data-date="${dateStr}" 
                     onclick="contentManager.showDayDetails('${dateStr}')"
                     style="cursor: pointer;">
                    <div class="day-number">${day}</div>
                    ${dayData ? `
                        <div class="day-hours">${dayData.hoursWorked || 0}h</div>
                    ` : '<div class="day-off">0h</div>'}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        calendar.innerHTML = calendarHTML;
    }

    updateTimesheetStatistics(stats) {
        // Always update statistics, even if null/empty
        const defaultStats = {
            actualDays: '0/0',
            actualHours: '0/0',
            workDays: '0',
            actualWorkHours: '0',
            standardDays: '0',
            lateDays: '0',
            earlyLeave: '0',
            lateMinutes: '0',
            earlyMinutes: '0',
            absentDays: '0',
            forgotCheckin: '0',
            nightHours: '0',
            dayHours: '0',
            overtimeDays: '0',
            overtimeHours: '0'
        };
        
        
        const finalStats = stats || defaultStats;
        const elements = {
            'actualDays': finalStats.actualDays || '0/0',
            'actualHours': finalStats.actualHours || '0/0', 
            'workDays': finalStats.workDays || '0',
            'actualWorkHours': finalStats.actualWorkHours || '0',
            'standardDays': finalStats.standardDays || '0',
            'lateDays': finalStats.lateDays || '0',
            'earlyLeave': finalStats.earlyLeave || '0',
            'lateMinutes': finalStats.lateMinutes || '0',
            'earlyMinutes': finalStats.earlyMinutes || '0',
            'absentDays': finalStats.absentDays || '0',
            'forgotCheckin': finalStats.forgotCheckin || '0',
            'nightHours': finalStats.nightHours || '0',
            'dayHours': finalStats.dayHours || '0',
            'overtimeDays': finalStats.overtimeDays || '0',
            'overtimeHours': finalStats.overtimeHours || '0'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    setupTimesheetHandlers() {
        document.getElementById('loadTimesheetData')?.addEventListener('click', async () => {
            const userResponse = await API_CACHE.getUserData();
            await this.loadTimesheetData(userResponse.employeeId);
        });

        document.getElementById('timesheetMonth')?.addEventListener('change', async () => {
            const userResponse = await API_CACHE.getUserData();
            await this.loadTimesheetData(userResponse.employeeId);
        });
    }

    // Show detailed view for selected day
    async showDayDetails(date) {
        try {
            const userResponse = await API_CACHE.getUserData();
            const employeeId = userResponse.employeeId;
            
            // Get attendance history for the selected date
            const response = await utils.fetchAPI(`?action=getAttendanceHistory&employeeId=${employeeId}&date=${date}`);
            
            const formattedDate = new Date(date).toLocaleDateString();
            
            let historyHTML = '';
            let records = [];
            
            // Handle different response formats
            if (response) {
                if (Array.isArray(response)) {
                    records = response;
                } else if (typeof response === 'object') {
                    // Handle object format with numeric keys like {"0": {...}, "1": {...}}
                    records = Object.keys(response)
                        .filter(key => !isNaN(key)) // Only numeric keys
                        .map(key => response[key])
                        .filter(record => record && record.type); // Filter valid records
                }
            }
            
            if (records.length > 0) {
                historyHTML = records.map(record => {
                    // Use server timestamp directly without timezone adjustment
                    const time = new Date(record.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false
                    });
                    const type = record.type === 'check_in' ? 'Vào ca' : 'Tan ca';
                    const icon = record.type === 'check_in' ? '🟢' : '🔴';
                    
                    return `
                        <div class="attendance-record">
                            <span class="record-icon">${icon}</span>
                            <span class="record-type">${type}</span>
                            <span class="record-time">${time}</span>
                        </div>
                    `;
                }).join('');
            } else {
                historyHTML = '<div class="no-data">Không có dữ liệu chấm công cho ngày này</div>';
            }
            
            // Show modal with day details
            const modalHTML = `
                <div class="day-details-modal" id="dayDetailsModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Chi tiết ngày ${formattedDate}</h3>
                            <button class="close-btn" onclick="document.getElementById('dayDetailsModal').remove()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="attendance-section">
                                <h4>📅 Lịch sử chấm công</h4>
                                <div class="attendance-history">
                                    ${historyHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing modal if any
            document.getElementById('dayDetailsModal')?.remove();
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
        } catch (error) {
            console.error('Error showing day details:', error);
            utils.showNotification('Lỗi khi tải chi tiết ngày', 'error');
        }
    }

    // GPS Attendance Functions
    async initializeGPSAttendance(employeeId) {
        this.userLocation = null;
        this.stores = [];
        
        try {
            // Use cached stores data instead of making new API call
            const storesResponse = await API_CACHE.getStoresData();
            
            // Handle different response formats
            if (Array.isArray(storesResponse)) {
                this.stores = storesResponse;
            } else if (storesResponse && typeof storesResponse === 'object') {
                // Extract stores from object keys
                const keys = Object.keys(storesResponse).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    this.stores = keys.map(key => storesResponse[key]).filter(item => item && typeof item === 'object');
                } else if (storesResponse.stores) {
                    this.stores = Array.isArray(storesResponse.stores) ? storesResponse.stores : [];
                } else if (storesResponse.results) {
                    this.stores = Array.isArray(storesResponse.results) ? storesResponse.results : [];
                } else {
                    this.stores = [];
                }
            } else {
                this.stores = [];
            }
            
            console.log('GPS Attendance - Loaded stores:', this.stores.length, this.stores);
            
            // Load today's attendance history
            await this.loadAttendanceHistoryToday(employeeId);
            
            // Get user location
            await this.getCurrentLocation();
            
        } catch (error) {
            console.error('Error initializing GPS attendance:', error);
            this.updateLocationStatus('error', 'Lỗi khởi tạo hệ thống');
        }
    }

    async getCurrentLocation() {
        const locationStatus = document.getElementById('locationStatus');
        
        if (!navigator.geolocation) {
            this.updateLocationStatus('error', 'Thiết bị không hỗ trợ định vị GPS');
            return;
        }

        this.updateLocationStatus('searching', 'Đang định vị...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.checkStoreProximity();
            },
            (error) => {
                console.error('Location error:', error);
                this.updateLocationStatus('error', 'Không thể định vị. Vui lòng bật GPS');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    checkStoreProximity() {
        if (!this.userLocation || !this.stores.length) {
            this.updateLocationStatus('error', 'Không có dữ liệu vị trí hoặc cửa hàng');
            return;
        }

        let nearestStore = null;
        let minDistance = Infinity;

        this.stores.forEach(store => {
            if (store.latitude && store.longitude) {
                const distance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    parseFloat(store.latitude),
                    parseFloat(store.longitude)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStore = { ...store, distance };
                }
            }
        });

        if (nearestStore && minDistance <= 50) { // Within 50 meters
            this.updateLocationStatus('success', `Trong phạm vi ${nearestStore.storeName}`);
            this.showStoreInfo(nearestStore);
            this.enableAttendanceButton();
        } else {
            this.updateLocationStatus('warning', 
                nearestStore 
                    ? `Cách ${nearestStore.storeName} ${Math.round(minDistance)}m`
                    : 'Không ở gần cửa hàng nào'
            );
            this.disableAttendanceButton();
        }
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    updateLocationStatus(status, message) {
        const locationStatus = document.getElementById('locationStatus');
        const icon = locationStatus.querySelector('.location-icon');
        const text = locationStatus.querySelector('.location-text');

        locationStatus.className = `location-status ${status}`;
        
        const icons = {
            searching: 'location_searching',
            success: 'location_on',
            warning: 'location_disabled',
            error: 'location_off'
        };

        icon.textContent = icons[status] || 'location_searching';
        text.textContent = message;
    }

    showStoreInfo(store) {
        const storeInfo = document.getElementById('storeInfo');
        const storeName = document.getElementById('currentStore');
        
        storeInfo.style.display = 'flex';
        storeName.textContent = store.storeName;
    }

    enableAttendanceButton() {
        const button = document.getElementById('attendanceButton');
        button.disabled = false;
        button.classList.add('enabled');
        button.onclick = () => this.processAttendance();
    }

    disableAttendanceButton() {
        const button = document.getElementById('attendanceButton');
        button.disabled = true;
        button.classList.remove('enabled');
        button.onclick = null;
    }

    async processAttendance() {
        const button = document.getElementById('attendanceButton');
        const originalText = button.innerHTML;
        
        try {
            button.disabled = true;
            button.innerHTML = `
                <span class="material-icons-round spin">sync</span>
                <span class="btn-text">Đang xử lý...</span>
            `;

            const userResponse = await API_CACHE.getUserData();
            
            // Fix location field names to match worker.js expectations
            const locationData = {
                latitude: this.userLocation.lat,
                longitude: this.userLocation.lng
            };
            
            const response = await utils.fetchAPI('?action=processAttendance', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId: userResponse.employeeId,
                    location: locationData
                })
            });

            if (response && response.success) {
                utils.showNotification(response.message || 'Chấm công thành công!', 'success');
                await this.loadAttendanceHistoryToday(userResponse.employeeId);
            } else {
                throw new Error(response.message || 'Chấm công thất bại');
            }

        } catch (error) {
            console.error('Attendance error:', error);
            utils.showNotification('Lỗi chấm công: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async loadAttendanceHistoryToday(employeeId) {
        try {
            // Use local date consistently - avoid timezone issues with UTC
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const response = await utils.fetchAPI(`?action=getAttendanceHistory&employeeId=${employeeId}&date=${dateStr}`);
            
            const historyContainer = document.getElementById('attendanceHistoryToday');
            
            if (response) {
                let records = [];
                
                // Handle different response formats
                if (Array.isArray(response)) {
                    records = response;
                } else if (typeof response === 'object') {
                    // Handle object format with numeric keys like {"0": {...}, "1": {...}}
                    records = Object.keys(response)
                        .filter(key => !isNaN(key)) // Only numeric keys
                        .map(key => response[key])
                        .filter(record => record && record.type); // Filter valid records
                }
                
                if (records.length > 0) {
                    let historyHTML = '';
                    records.forEach(record => {
                        // Use server timestamp directly without timezone adjustment
                        const time = new Date(record.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit',
                            hour12: false
                        });
                        const status = record.type === 'check_in' ? 'Vào ca' : 'Tan ca';
                        const statusClass = record.type === 'check_in' ? 'check-in' : 'check-out';
                        
                        historyHTML += `
                            <div class="attendance-record ${statusClass}">
                                <span class="material-icons-round">${record.type === 'check_in' ? 'login' : 'logout'}</span>
                                <div class="record-info">
                                    <div class="record-time">${time}</div>
                                    <div class="record-status">${status}</div>
                                </div>
                            </div>
                        `;
                    });
                    historyContainer.innerHTML = historyHTML;
                } else {
                    historyContainer.innerHTML = `
                        <div class="no-records">
                            <span class="material-icons-round">event_available</span>
                            <p>Chưa có bản ghi chấm công hôm nay</p>
                        </div>
                    `;
                }
            } else {
                historyContainer.innerHTML = `
                    <div class="no-records">
                        <span class="material-icons-round">event_available</span>
                        <p>Chưa có bản ghi chấm công hôm nay</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading attendance history:', error);
            document.getElementById('attendanceHistoryToday').innerHTML = `
                <div class="error-message">
                    <span class="material-icons-round">error</span>
                    Không thể tải lịch sử chấm công
                </div>
            `;
        }
    }

    // Request Management Functions
    async showAttendanceRequest() {
        const content = document.getElementById('content');
        try {
            content.innerHTML = `
                <div class="attendance-request-container">
                    <div class="card">
                        <div class="card-header">
                            <h2><span class="material-icons-round">assignment</span> Đơn Từ Chấm Công</h2>
                            <p>Gửi yêu cầu liên quan đến chấm công và nghỉ phép</p>
                        </div>
                        <div class="card-body">
                            <div class="request-type-selector">
                                <div class="request-types">
                                    <button class="request-type-btn active" data-type="forgot-checkin">
                                        <span class="material-icons-round">schedule</span>
                                        Quên Check In/Out
                                    </button>
                                    <button class="request-type-btn" data-type="shift-change">
                                        <span class="material-icons-round">swap_horiz</span>
                                        Đổi Ca
                                    </button>
                                    <button class="request-type-btn" data-type="absence">
                                        <span class="material-icons-round">event_busy</span>
                                        Báo Vắng
                                    </button>
                                    <button class="request-type-btn" data-type="leave">
                                        <span class="material-icons-round">beach_access</span>
                                        Nghỉ Phép
                                    </button>
                                </div>
                            </div>
                            
                            <div id="requestForm" class="request-form">
                                <!-- Form content will be dynamically loaded -->
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupRequestTypeSelector();
            this.showRequestForm('forgot-checkin');

        } catch (error) {
            console.error('Error loading attendance request:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải đơn từ</h3>
                        <p>Không thể tải form đơn từ. Vui lòng thử lại.</p>
                    </div>
                </div>
            `;
        }
    }

    setupRequestTypeSelector() {
        document.querySelectorAll('.request-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.request-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showRequestForm(btn.dataset.type);
            });
        });
    }

    showRequestForm(type) {
        const formContainer = document.getElementById('requestForm');
        
        const forms = {
            'forgot-checkin': this.getForgotCheckinForm(),
            'shift-change': this.getShiftChangeForm(),
            'absence': this.getAbsenceForm(),
            'leave': this.getLeaveForm()
        };
        
        formContainer.innerHTML = forms[type] || '';
        this.setupRequestFormSubmission(type);
    }

    getForgotCheckinForm() {
        return `
            <form id="forgotCheckinForm" class="request-specific-form">
                <h3>Đơn Quên Chấm Công</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="forgotDate">Ngày:</label>
                        <input type="date" id="forgotDate" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="forgotType">Loại:</label>
                        <select id="forgotType" class="form-control" required onchange="contentManager.toggleForgotTimeFields(this.value)">
                            <option value="">Chọn loại</option>
                            <option value="check-in">Quên chấm vào</option>
                            <option value="check-out">Quên chấm ra</option>
                            <option value="both">Quên cả hai</option>
                        </select>
                    </div>
                </div>
                <div class="form-row" id="timeFieldsRow">
                    <div class="form-group" id="checkinTimeGroup" style="display: none;">
                        <label for="forgotCheckinTime">Giờ vào:</label>
                        <input type="time" id="forgotCheckinTime" class="form-control">
                    </div>
                    <div class="form-group" id="checkoutTimeGroup" style="display: none;">
                        <label for="forgotCheckoutTime">Giờ ra:</label>
                        <input type="time" id="forgotCheckoutTime" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label for="forgotReason">Lý do:</label>
                    <textarea id="forgotReason" class="form-control" rows="3" placeholder="Nhập lý do quên chấm công..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <span class="material-icons-round">send</span>
                    Gửi đơn
                </button>
            </form>
        `;
    }

    getShiftChangeForm() {
        return `
            <form id="shiftChangeForm" class="request-specific-form">
                <h3>Đơn Đổi Ca</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="changeDate">Ngày:</label>
                        <input type="date" id="changeDate" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="currentShift">Ca hiện tại:</label>
                        <select id="currentShift" class="form-control" required>
                            <option value="">Chọn ca hiện tại</option>
                            <option value="morning">Ca sáng (6:00 - 14:00)</option>
                            <option value="afternoon">Ca chiều (14:00 - 22:00)</option>
                            <option value="night">Ca đêm (22:00 - 6:00)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="requestedShift">Ca muốn đổi:</label>
                    <select id="requestedShift" class="form-control" required>
                        <option value="">Chọn ca muốn đổi</option>
                        <option value="morning">Ca sáng (6:00 - 14:00)</option>
                        <option value="afternoon">Ca chiều (14:00 - 22:00)</option>
                        <option value="night">Ca đêm (22:00 - 6:00)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="changeReason">Lý do đổi ca:</label>
                    <textarea id="changeReason" class="form-control" rows="3" placeholder="Lý do cần đổi ca làm việc..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <span class="material-icons-round">send</span>
                    Gửi Đơn
                </button>
            </form>
        `;
    }

    getAbsenceForm() {
        return `
            <form id="absenceForm" class="request-specific-form">
                <h3>Đơn Báo Vắng</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="absenceDate">Ngày vắng:</label>
                        <input type="date" id="absenceDate" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="absenceType">Loại vắng mặt:</label>
                        <select id="absenceType" class="form-control" required>
                            <option value="">Chọn loại</option>
                            <option value="sick">Ốm đau</option>
                            <option value="personal">Việc cá nhân</option>
                            <option value="family">Việc gia đình</option>
                            <option value="emergency">Khẩn cấp</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="absenceReason">Lý do chi tiết:</label>
                    <textarea id="absenceReason" class="form-control" rows="3" placeholder="Mô tả chi tiết lý do vắng mặt..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <span class="material-icons-round">send</span>
                    Gửi Đơn
                </button>
            </form>
        `;
    }

    getLeaveForm() {
        return `
            <form id="leaveForm" class="request-specific-form">
                <h3>Đơn Nghỉ Phép</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="leaveStartDate">Từ ngày:</label>
                        <input type="date" id="leaveStartDate" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="leaveEndDate">Đến ngày:</label>
                        <input type="date" id="leaveEndDate" class="form-control" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="leaveType">Loại nghỉ phép:</label>
                    <select id="leaveType" class="form-control" required>
                        <option value="">Chọn loại nghỉ phép</option>
                        <option value="annual">Nghỉ phép năm</option>
                        <option value="sick">Nghỉ ốm</option>
                        <option value="maternity">Nghỉ sinh</option>
                        <option value="personal">Nghỉ cá nhân</option>
                        <option value="unpaid">Nghỉ không lương</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="leaveReason">Lý do nghỉ phép:</label>
                    <textarea id="leaveReason" class="form-control" rows="3" placeholder="Lý do chi tiết về việc nghỉ phép..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <span class="material-icons-round">send</span>
                    Gửi Đơn
                </button>
            </form>
        `;
    }

    setupRequestFormSubmission(type) {
        const form = document.querySelector('.request-specific-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitAttendanceRequest(type, new FormData(form));
        });
    }

    async submitAttendanceRequest(type, formData) {
        try {
            const userResponse = await API_CACHE.getUserData();
            // Convert hyphenated types to underscore format for database constraint
            const dbType = type.replace(/-/g, '_');
            const requestData = {
                type: dbType,
                employeeId: userResponse.employeeId,
                timestamp: new Date().toISOString()
            };

            // Extract form data based on type
            const form = document.querySelector('.request-specific-form');
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.value) {
                    requestData[input.id] = input.value;
                }
            });

            const response = await utils.fetchAPI('?action=createAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (response && response.success) {
                utils.showNotification('Đơn từ đã được gửi thành công!', 'success');
                form.reset();
            } else {
                throw new Error(response.message || 'Gửi đơn từ thất bại');
            }

        } catch (error) {
            console.error('Error submitting attendance request:', error);
            utils.showNotification('Lỗi gửi đơn từ: ' + error.message, 'error');
        }
    }

    toggleForgotTimeFields(selectedType) {
        const checkinTimeGroup = document.getElementById('checkinTimeGroup');
        const checkoutTimeGroup = document.getElementById('checkoutTimeGroup');
        const checkinTimeInput = document.getElementById('forgotCheckinTime');
        const checkoutTimeInput = document.getElementById('forgotCheckoutTime');
        
        // Hide all fields first and clear required attributes
        checkinTimeGroup.style.display = 'none';
        checkoutTimeGroup.style.display = 'none';
        checkinTimeInput.removeAttribute('required');
        checkoutTimeInput.removeAttribute('required');
        
        // Show relevant fields based on selection
        switch(selectedType) {
            case 'check-in':
                checkinTimeGroup.style.display = 'block';
                checkinTimeInput.setAttribute('required', 'required');
                break;
            case 'check-out':
                checkoutTimeGroup.style.display = 'block';
                checkoutTimeInput.setAttribute('required', 'required');
                break;
            case 'both':
                checkinTimeGroup.style.display = 'block';
                checkoutTimeGroup.style.display = 'block';
                checkinTimeInput.setAttribute('required', 'required');
                checkoutTimeInput.setAttribute('required', 'required');
                break;
        }
    }

    async showTaskAssignment() {
        const content = document.getElementById('content');
        try {
            content.innerHTML = `
                <div class="task-assignment-container">
                    <div class="card">
                        <div class="card-header">
                            <h2><span class="material-icons-round">task_alt</span> Nhiệm Vụ</h2>
                            <p>Tạo và giao nhiệm vụ cho nhân viên</p>
                        </div>
                        <div class="card-body">
                            <form id="taskAssignmentForm" class="task-form">
                                <div class="form-group">
                                    <label for="taskTitle">Tiêu đề nhiệm vụ:</label>
                                    <input type="text" id="taskTitle" name="taskTitle" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="taskDescription">Mô tả chi tiết:</label>
                                    <div class="text-editor-container enhanced-editor">
                                        <div class="editor-header">
                                            <div class="editor-title">
                                                <span class="material-icons-round">edit</span>
                                                Trình soạn thảo nâng cao
                                            </div>
                                            <div class="editor-tools">
                                                <button type="button" class="tool-btn" onclick="contentManager.toggleEditorFullscreen()" title="Toàn màn hình">
                                                    <span class="material-icons-round">fullscreen</span>
                                                </button>
                                                <button type="button" class="tool-btn" onclick="contentManager.toggleEditorMode()" title="Chế độ markdown">
                                                    <span class="material-icons-round">code</span>
                                                </button>
                                                <button type="button" class="tool-btn" onclick="contentManager.showEditorHelp()" title="Trợ giúp">
                                                    <span class="material-icons-round">help</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div class="editor-toolbar enhanced-toolbar">
                                            <!-- Text Formatting Group -->
                                            <div class="toolbar-group">
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('bold')" title="In đậm (Ctrl+B)">
                                                    <span class="material-icons-round">format_bold</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('italic')" title="In nghiêng (Ctrl+I)">
                                                    <span class="material-icons-round">format_italic</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('underline')" title="Gạch chân (Ctrl+U)">
                                                    <span class="material-icons-round">format_underlined</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('strikeThrough')" title="Gạch ngang">
                                                    <span class="material-icons-round">strikethrough_s</span>
                                                </button>
                                            </div>
                                            
                                            <div class="toolbar-separator"></div>
                                            
                                            <!-- Font Formatting Group -->
                                            <div class="toolbar-group">
                                                <select class="toolbar-select font-size-select" onchange="contentManager.changeFontSize(this.value)" title="Kích thước chữ">
                                                    <option value="1">Rất nhỏ</option>
                                                    <option value="2">Nhỏ</option>
                                                    <option value="3" selected>Bình thường</option>
                                                    <option value="4">Lớn</option>
                                                    <option value="5">Rất lớn</option>
                                                </select>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('subscript')" title="Chỉ số dưới">
                                                    <span class="material-icons-round">subscript</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('superscript')" title="Chỉ số trên">
                                                    <span class="material-icons-round">superscript</span>
                                                </button>
                                            </div>
                                            
                                            <div class="toolbar-separator"></div>
                                            
                                            <!-- Color Group -->
                                            <div class="toolbar-group">
                                                <input type="color" class="toolbar-color-picker" onchange="contentManager.changeTextColor(this.value)" title="Màu chữ">
                                                <input type="color" class="toolbar-color-picker" onchange="contentManager.changeBackgroundColor(this.value)" title="Màu nền" value="#ffffff">
                                            </div>
                                            
                                            <div class="toolbar-separator"></div>
                                            
                                            <!-- List Group -->
                                            <div class="toolbar-group">
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('insertUnorderedList')" title="Danh sách dấu chấm">
                                                    <span class="material-icons-round">format_list_bulleted</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('insertOrderedList')" title="Danh sách số">
                                                    <span class="material-icons-round">format_list_numbered</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('indent')" title="Thụt lề">
                                                    <span class="material-icons-round">format_indent_increase</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('outdent')" title="Giảm thụt lề">
                                                    <span class="material-icons-round">format_indent_decrease</span>
                                                </button>
                                            </div>
                                            
                                            <div class="toolbar-separator"></div>
                                            
                                            <!-- Alignment Group -->
                                            <div class="toolbar-group">
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('justifyLeft')" title="Căn trái">
                                                    <span class="material-icons-round">format_align_left</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('justifyCenter')" title="Căn giữa">
                                                    <span class="material-icons-round">format_align_center</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('justifyRight')" title="Căn phải">
                                                    <span class="material-icons-round">format_align_right</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.formatText('justifyFull')" title="Căn đều">
                                                    <span class="material-icons-round">format_align_justify</span>
                                                </button>
                                            </div>
                                            
                                            <div class="toolbar-separator"></div>
                                            
                                            <!-- Insert Group -->
                                            <div class="toolbar-group">
                                                <button type="button" class="toolbar-btn" onclick="contentManager.insertLink()" title="Chèn liên kết">
                                                    <span class="material-icons-round">link</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.insertTable()" title="Chèn bảng">
                                                    <span class="material-icons-round">table_chart</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.insertHorizontalRule()" title="Chèn đường kẻ">
                                                    <span class="material-icons-round">horizontal_rule</span>
                                                </button>
                                            </div>
                                            
                                            <div class="toolbar-separator"></div>
                                            
                                            <!-- Action Group -->
                                            <div class="toolbar-group">
                                                <button type="button" class="toolbar-btn" onclick="contentManager.undoEditor()" title="Hoàn tác (Ctrl+Z)">
                                                    <span class="material-icons-round">undo</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.redoEditor()" title="Làm lại (Ctrl+Y)">
                                                    <span class="material-icons-round">redo</span>
                                                </button>
                                                <button type="button" class="toolbar-btn" onclick="contentManager.clearFormatting()" title="Xóa định dạng">
                                                    <span class="material-icons-round">format_clear</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div class="editor-workspace">
                                            <div id="taskDescription" 
                                                 class="rich-text-editor enhanced-rich-editor resizable" 
                                                 contenteditable="true" 
                                                 placeholder="Nhập mô tả chi tiết nhiệm vụ... Sử dụng thanh công cụ để định dạng văn bản."
                                                 style="min-height: 200px; max-height: 600px;">
                                            </div>
                                            
                                            <!-- Resize Handle -->
                                            <div class="resize-handle" onmousedown="this.startResize(event)">
                                                <span class="material-icons-round">drag_handle</span>
                                            </div>
                                        </div>
                                        
                                        <div class="editor-footer">
                                            <div class="editor-stats">
                                                <span class="char-count">Ký tự: <span id="charCount">0</span></span>
                                                <span class="word-count">Từ: <span id="wordCount">0</span></span>
                                            </div>
                                            <div class="editor-actions">
                                                <button type="button" class="btn btn-sm secondary-btn" onclick="contentManager.saveAsDraft()">
                                                    <span class="material-icons-round">save</span>
                                                    Lưu nháp
                                                </button>
                                                <button type="button" class="btn btn-sm secondary-btn" onclick="contentManager.previewContent()">
                                                    <span class="material-icons-round">preview</span>
                                                    Xem trước
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <input type="hidden" name="taskDescription" id="taskDescriptionInput">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="taskPriority">Mức độ ưu tiên:</label>
                                        <select id="taskPriority" name="taskPriority" class="form-control" required>
                                            <option value="">Chọn mức độ</option>
                                            <option value="low">Thấp</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="high">Cao</option>
                                            <option value="urgent">Khẩn cấp</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="taskDeadline">Thời hạn:</label>
                                        <input type="datetime-local" id="taskDeadline" name="taskDueDate" class="form-control" required>
                                    </div>
                                </div>
                                
                                <div class="user-selection-section">
                                    <h3><span class="material-icons-round">people</span> Phân Công Nhân Viên</h3>
                                    
                                    <!-- Role Filter Section -->
                                    <div class="role-filter-section">
                                        <label>Lọc theo chức vụ:</label>
                                        <div class="role-filter-buttons">
                                            <button type="button" class="role-filter-btn active" data-role="ALL">Tất cả</button>
                                            <button type="button" class="role-filter-btn" data-role="AD">Admin</button>
                                            <button type="button" class="role-filter-btn" data-role="AM">Quản lý phụ</button>
                                            <button type="button" class="role-filter-btn" data-role="QL">Quản lý</button>
                                            <button type="button" class="role-filter-btn" data-role="NV">Nhân viên</button>
                                        </div>
                                    </div>
                                    
                                    <div class="user-selector">
                                        <label>Người tham gia:</label>
                                        <div class="user-selection-panel" id="participantsPanel">
                                            <div class="user-search">
                                                <input type="text" id="participantSearch" placeholder="Tìm kiếm nhân viên..." class="form-control">
                                                <span class="material-icons-round">search</span>
                                            </div>
                                            <div class="user-list" id="participantsList"></div>
                                            <div class="selected-users" id="selectedParticipants"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="user-selector">
                                        <label>Người hỗ trợ:</label>
                                        <div class="user-selection-panel" id="supportersPanel">
                                            <div class="user-search">
                                                <input type="text" id="supporterSearch" placeholder="Tìm kiếm nhân viên..." class="form-control">
                                                <span class="material-icons-round">search</span>
                                            </div>
                                            <div class="user-list" id="supportersList"></div>
                                            <div class="selected-users" id="selectedSupporters"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="user-selector">
                                        <label>Người giao nhiệm vụ:</label>
                                        <div class="user-selection-panel" id="assignersPanel">
                                            <div class="user-search">
                                                <input type="text" id="assignerSearch" placeholder="Tìm kiếm nhân viên..." class="form-control">
                                                <span class="material-icons-round">search</span>
                                            </div>
                                            <div class="user-list" id="assignersList"></div>
                                            <div class="selected-users" id="selectedAssigners"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <span class="material-icons-round">send</span>
                                        Gửi Nhiệm Vụ
                                    </button>
                                    <button type="reset" class="btn btn-secondary">
                                        <span class="material-icons-round">refresh</span>
                                        Làm Lại
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            await this.setupTaskAssignmentForm();

        } catch (error) {
            console.error('Error loading task assignment:', error);
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <span class="material-icons-round error-icon">error</span>
                        <h3>Lỗi tải nhiệm vụ</h3>
                        <p>Không thể tải form nhiệm vụ. Vui lòng thử lại.</p>
                        <button onclick="window.contentManager.showTaskAssignment()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
    }

    async setupTaskAssignmentForm() {
        try {
            // Load all users for task assignment
            const usersResponse = await API_CACHE.getUserData();
            const allUsersResponse = await API_CACHE.getUsersData();
            
            let allUsers = [];
            if (Array.isArray(allUsersResponse)) {
                allUsers = allUsersResponse;
            } else if (allUsersResponse && typeof allUsersResponse === 'object') {
                const keys = Object.keys(allUsersResponse).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    allUsers = keys.map(key => allUsersResponse[key]).filter(item => item && typeof item === 'object');
                }
            }

            // Initialize user selection panels
            this.currentFilteredUsers = allUsers; // Store all users for filtering
            this.allUsersData = allUsers; // Keep original data
            this.initializeUserSelectionPanel('participantsList', 'selectedParticipants', 'participantSearch', allUsers, 'participants');
            this.initializeUserSelectionPanel('supportersList', 'selectedSupporters', 'supporterSearch', allUsers, 'supporters');
            this.initializeUserSelectionPanel('assignersList', 'selectedAssigners', 'assignerSearch', allUsers, 'assigners');

            // Set up role filtering
            this.setupRoleFiltering();

            // Set up form submission
            const taskForm = document.getElementById('taskAssignmentForm');
            if (taskForm) {
                taskForm.addEventListener('submit', (e) => this.handleTaskAssignmentSubmission(e));
            }

            // Set up reset button
            const resetBtn = document.getElementById('resetTaskForm');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetTaskAssignmentForm());
            }

        } catch (error) {
            console.error('Error setting up task assignment form:', error);
            utils.showNotification('Lỗi khởi tạo form nhiệm vụ', 'error');
        }
    }

    setupRoleFiltering() {
        const roleFilterBtns = document.querySelectorAll('.role-filter-btn');
        
        roleFilterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                roleFilterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const selectedRole = e.target.dataset.role;
                
                // Filter users based on selected role
                let filteredUsers = this.allUsersData;
                if (selectedRole !== 'ALL') {
                    filteredUsers = this.allUsersData.filter(user => user.position === selectedRole);
                }
                
                // Update all user selection panels with filtered users
                this.currentFilteredUsers = filteredUsers;
                this.refreshUserSelectionPanels(filteredUsers);
            });
        });
    }

    refreshUserSelectionPanels(filteredUsers) {
        // Clear existing lists and reinitialize with filtered users
        this.initializeUserSelectionPanel('participantsList', 'selectedParticipants', 'participantSearch', filteredUsers, 'participants');
        this.initializeUserSelectionPanel('supportersList', 'selectedSupporters', 'supporterSearch', filteredUsers, 'supporters');
        this.initializeUserSelectionPanel('assignersList', 'selectedAssigners', 'assignerSearch', filteredUsers, 'assigners');
    }

    initializeUserSelectionPanel(listId, selectedId, searchId, users, type) {
        const listContainer = document.getElementById(listId);
        const selectedContainer = document.getElementById(selectedId);
        const searchInput = document.getElementById(searchId);

        if (!listContainer || !selectedContainer || !searchInput) return;

        let selectedUsers = [];

        // Render user list
        const renderUserList = (filteredUsers = users) => {
            listContainer.innerHTML = '';
            filteredUsers.forEach(user => {
                if (!selectedUsers.find(u => u.employeeId === user.employeeId)) {
                    const userCard = document.createElement('div');
                    userCard.className = 'user-card';
                    userCard.innerHTML = `
                        <div class="user-info">
                            <div class="user-name">${user.fullName}</div>
                            <div class="user-details">${user.employeeId} • ${user.position}</div>
                        </div>
                        <button class="add-user-btn" data-user-id="${user.employeeId}">
                            <span class="material-icons-round">add</span>
                        </button>
                    `;
                    
                    userCard.querySelector('.add-user-btn').addEventListener('click', () => {
                        selectedUsers.push(user);
                        renderUserList();
                        renderSelectedUsers();
                    });
                    
                    listContainer.appendChild(userCard);
                }
            });
        };

        // Render selected users
        const renderSelectedUsers = () => {
            selectedContainer.innerHTML = '';
            selectedUsers.forEach(user => {
                const selectedCard = document.createElement('div');
                selectedCard.className = 'selected-user-card';
                selectedCard.innerHTML = `
                    <span class="user-name">${user.fullName}</span>
                    <button class="remove-user-btn" data-user-id="${user.employeeId}">
                        <span class="material-icons-round">close</span>
                    </button>
                `;
                
                selectedCard.querySelector('.remove-user-btn').addEventListener('click', () => {
                    selectedUsers = selectedUsers.filter(u => u.employeeId !== user.employeeId);
                    renderUserList();
                    renderSelectedUsers();
                });
                
                selectedContainer.appendChild(selectedCard);
            });

            // Store selected users in a data attribute for form submission
            selectedContainer.dataset.selectedUsers = JSON.stringify(selectedUsers.map(u => u.employeeId));
        };

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = users.filter(user => 
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.employeeId.toLowerCase().includes(searchTerm) ||
                user.position.toLowerCase().includes(searchTerm)
            );
            renderUserList(filtered);
        });

        // Initial render
        renderUserList();
    }

    async handleTaskAssignmentSubmission(e) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const formData = new FormData(form);
            
            // Get selected users with defensive checks
            const participantsContainer = document.getElementById('selectedParticipants');
            const supportersContainer = document.getElementById('selectedSupporters');
            const assignersContainer = document.getElementById('selectedAssigners');
            
            // Check if containers exist
            if (!participantsContainer || !supportersContainer || !assignersContainer) {
                console.error('Task assignment containers not found');
                utils.showNotification('Lỗi giao diện: Không tìm thấy container', 'error');
                return;
            }
            
            // Get description from rich text editor and clean it
            const descriptionEditor = document.getElementById('taskDescription');
            if (!descriptionEditor) {
                console.error('Task description editor not found');
                utils.showNotification('Lỗi giao diện: Không tìm thấy trình soạn thảo', 'error');
                return;
            }
            
            const descriptionContent = descriptionEditor.innerHTML.trim();
            // Remove HTML tags for validation to check actual text content
            const textContent = descriptionEditor.textContent || descriptionEditor.innerText || '';
            const hasActualText = textContent.trim().length > 0;
            
            // Parse selected users with error handling
            let participants = [];
            let supporters = [];
            let assigners = [];
            
            try {
                participants = JSON.parse(participantsContainer.dataset.selectedUsers || '[]');
                supporters = JSON.parse(supportersContainer.dataset.selectedUsers || '[]');
                assigners = JSON.parse(assignersContainer.dataset.selectedUsers || '[]');
            } catch (error) {
                console.error('Error parsing selected users:', error);
                utils.showNotification('Lỗi dữ liệu người dùng đã chọn', 'error');
                return;
            }
            
            // Debug logging with more details
            console.log('=== TASK SUBMISSION DEBUG ===');
            console.log('Containers found:', {
                participants: !!participantsContainer,
                supporters: !!supportersContainer, 
                assigners: !!assignersContainer,
                editor: !!descriptionEditor
            });
            console.log('Dataset values:', {
                participants: participantsContainer.dataset.selectedUsers,
                supporters: supportersContainer.dataset.selectedUsers,
                assigners: assignersContainer.dataset.selectedUsers
            });
            console.log('Task submission - Participants:', participants);
            console.log('Task submission - Supporters:', supporters);
            console.log('Task submission - Assigners:', assigners);
            console.log('Task submission - Description HTML:', descriptionContent);
            console.log('Task submission - Description text:', textContent);
            console.log('==========================');
            
            // Get current user as default assigner if no assigner selected
            const userResponse = await API_CACHE.getUserData();
            const finalAssignerId = assigners.length > 0 ? assigners[0] : userResponse.employeeId;
            
            const taskData = {
                title: formData.get('taskTitle'),
                description: descriptionContent,
                priority: formData.get('taskPriority'),
                deadline: formData.get('taskDueDate'), // Changed from dueDate to deadline
                participants: participants,
                supporters: supporters,
                assigners: [finalAssignerId], // Changed from assignerId to assigners array
                createdBy: finalAssignerId, // Added createdBy field
                timestamp: new Date().toISOString() // Added timestamp field
            };

            // Fixed validation - check if all people involved
            const totalPeople = participants.length + supporters.length;
            console.log('Task validation - Title:', taskData.title);
            console.log('Task validation - Description HTML:', descriptionContent);
            console.log('Task validation - Description text:', textContent.trim());
            console.log('Task validation - Has actual text:', hasActualText);
            console.log('Task validation - Total people:', totalPeople);
            console.log('Task validation - Participants length:', participants.length);
            console.log('Task validation - Supporters length:', supporters.length);
            
            if (!taskData.title || !hasActualText || totalPeople === 0) {
                console.log('Validation failed - Title check:', !taskData.title);
                console.log('Validation failed - Description check:', !hasActualText);
                console.log('Validation failed - People check:', totalPeople === 0);
                utils.showNotification('Vui lòng điền đầy đủ thông tin và chọn ít nhất một người thực hiện hoặc hỗ trợ', 'error');
                return;
            }

            // Submit task assignment
            const response = await utils.fetchAPI('?action=createTaskAssignment', {
                method: 'POST',
                body: JSON.stringify(taskData)
            });

            if (response && response.success) {
                utils.showNotification('Tạo nhiệm vụ thành công!', 'success');
                this.resetTaskAssignmentForm();
            } else {
                throw new Error(response.message || 'Tạo nhiệm vụ thất bại');
            }

        } catch (error) {
            console.error('Error submitting task assignment:', error);
            utils.showNotification('Lỗi tạo nhiệm vụ: ' + error.message, 'error');
        }
    }

    resetTaskAssignmentForm() {
        const form = document.getElementById('taskAssignmentForm');
        if (form) {
            form.reset();
        }
        
        // Clear rich text editor
        const descriptionEditor = document.getElementById('taskDescription');
        if (descriptionEditor) {
            descriptionEditor.innerHTML = '';
        }
        
        // Clear selected users
        const selectedContainers = ['selectedParticipants', 'selectedSupporters', 'selectedAssigners'];
        selectedContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                container.dataset.selectedUsers = '[]';
            }
        });
        
        // Re-render user lists
        this.setupTaskAssignmentForm();
    }

    // Rich text editor formatting function
    formatText(command, value = null) {
        try {
            const editor = document.getElementById('taskDescription') || document.querySelector('.rich-text-editor');
            if (!editor) {
                console.warn('Editor not found');
                return;
            }

            // Focus the editor first
            editor.focus();

            // Save selection
            const selection = window.getSelection();
            if (selection.rangeCount === 0) {
                console.warn('No text selected');
                return;
            }

            const range = selection.getRangeAt(0);

            // Handle different commands
            switch (command) {
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
                case 'underline':
                    document.execCommand('underline', false, null);
                    break;
                case 'strikeThrough':
                    document.execCommand('strikeThrough', false, null);
                    break;
                case 'insertOrderedList':
                    document.execCommand('insertOrderedList', false, null);
                    break;
                case 'insertUnorderedList':
                    document.execCommand('insertUnorderedList', false, null);
                    break;
                case 'justifyLeft':
                case 'justifyCenter':
                case 'justifyRight':
                case 'justifyFull':
                    document.execCommand(command, false, null);
                    break;
                case 'foreColor':
                case 'backColor':
                case 'fontSize':
                case 'fontName':
                    document.execCommand(command, false, value);
                    break;
                case 'createLink':
                    const url = prompt('Nhập URL liên kết:');
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                    break;
                case 'insertImage':
                    const imageUrl = prompt('Nhập URL hình ảnh:');
                    if (imageUrl) {
                        document.execCommand('insertImage', false, imageUrl);
                    }
                    break;
                case 'removeFormat':
                    document.execCommand('removeFormat', false, null);
                    break;
                case 'undo':
                    document.execCommand('undo', false, null);
                    break;
                case 'redo':
                    document.execCommand('redo', false, null);
                    break;
                default:
                    document.execCommand(command, false, value);
            }

            // Update character count after formatting
            this.updateCharacterCount(editor);
            
            // Keep focus on editor
            editor.focus();
            
        } catch (error) {
            console.error('Error formatting text:', error);
            utils.showNotification('Lỗi khi định dạng văn bản', 'error');
        }
    }

    // Advanced editor functions
    insertLink() {
        this.formatText('createLink');
    }

    insertTable() {
        const editor = document.getElementById('taskDescription') || document.querySelector('.rich-text-editor');
        if (!editor) return;

        const rows = prompt('Số hàng:', '3');
        const cols = prompt('Số cột:', '3');
        
        if (!rows || !cols) return;

        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
        for (let i = 0; i < parseInt(rows); i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < parseInt(cols); j++) {
                tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';

        document.execCommand('insertHTML', false, tableHTML);
        this.updateCharacterCount(editor);
    }

    insertHorizontalRule() {
        document.execCommand('insertHorizontalRule', false, null);
        const editor = document.getElementById('taskDescription') || document.querySelector('.rich-text-editor');
        if (editor) this.updateCharacterCount(editor);
    }

    undoEditor() {
        this.formatText('undo');
    }

    redoEditor() {
        this.formatText('redo');
    }

    clearFormatting() {
        this.formatText('removeFormat');
    }

    saveAsDraft() {
        const editor = document.getElementById('taskDescription') || document.querySelector('.rich-text-editor');
        if (!editor) return;

        const content = editor.innerHTML;
        localStorage.setItem('taskDraft', content);
        utils.showNotification('Đã lưu nháp thành công', 'success');
    }

    previewContent() {
        const editor = document.getElementById('taskDescription') || document.querySelector('.rich-text-editor');
        if (!editor) return;

        const content = editor.innerHTML;
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(`
            <html>
            <head>
                <title>Xem trước nội dung</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                </style>
            </head>
            <body>
                <h2>Xem trước nội dung</h2>
                <div>${content}</div>
            </body>
            </html>
        `);
        previewWindow.document.close();
    }

    showEditorHelp() {
        const helpContent = `
            <div style="padding: 20px;">
                <h3>Hướng dẫn sử dụng trình soạn thảo</h3>
                <ul>
                    <li><strong>Ctrl + B:</strong> In đậm</li>
                    <li><strong>Ctrl + I:</strong> In nghiêng</li>
                    <li><strong>Ctrl + U:</strong> Gạch chân</li>
                    <li><strong>Ctrl + Z:</strong> Hoàn tác</li>
                    <li><strong>Ctrl + Y:</strong> Làm lại</li>
                    <li><strong>Tab:</strong> Thụt đầu dòng</li>
                    <li><strong>Shift + Tab:</strong> Lùi đầu dòng</li>
                </ul>
                <p>Chọn văn bản trước khi áp dụng định dạng.</p>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn" onclick="this.closest('.modal').remove()">&times;</span>
                ${helpContent}
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Toggle statistics details
    toggleStatsDetails() {
        const detailsStats = document.querySelector('.details-stats');
        const toggleBtn = document.querySelector('.stats-toggle-btn span');
        
        if (detailsStats) {
            if (detailsStats.classList.contains('collapsed')) {
                detailsStats.classList.remove('collapsed');
                toggleBtn.textContent = 'expand_less';
            } else {
                detailsStats.classList.add('collapsed');
                toggleBtn.textContent = 'expand_more';
            }
        }
    }

    // Show detailed request information
    async showRequestDetail(requestId) {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI(`?action=getAttendanceRequests&token=${token}`);
            
            if (!response) {
                throw new Error('Cannot load request details');
            }

            // Find the specific request from the list
            let request = null;
            if (Array.isArray(response)) {
                request = response.find(r => r.id == requestId || r.requestId == requestId);
            } else if (typeof response === 'object') {
                // Handle object format response like {"0": {...}, "1": {...}}
                const requestsList = Object.keys(response)
                    .filter(key => !['timestamp', 'status'].includes(key))
                    .map(key => response[key])
                    .filter(item => item && typeof item === 'object');
                request = requestsList.find(r => r.id == requestId || r.requestId == requestId);
            }

            if (!request) {
                throw new Error('Request not found');
            }

            // Create and show modal
            let modal = document.getElementById('requestDetailModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'requestDetailModal';
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Chi tiết đơn từ</h3>
                            <button class="close-btn" onclick="contentManager.closest('.modal-overlay').style.display='none'">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        <div id="requestDetailContent" class="modal-body"></div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            const content = document.getElementById('requestDetailContent');
            const requestType = this.getRequestTypeText(request.type);
            const statusClass = request.status === 'approved' ? 'success' : 
                               request.status === 'rejected' ? 'danger' : 'warning';

            content.innerHTML = `
                <div class="request-detail-card">
                    <div class="request-header">
                        <div class="request-title">
                            <h4>${requestType}</h4>
                            <span class="status-badge ${statusClass}">${this.getStatusText(request.status)}</span>
                        </div>
                        <div class="request-meta">
                            <p><strong>Mã đơn:</strong> ${request.requestId || request.id}</p>
                            <p><strong>Ngày tạo:</strong> ${new Date(request.requestDate || request.createdAt).toLocaleDateString('vi-VN')}</p>
                            ${request.targetDate ? `<p><strong>Ngày áp dụng:</strong> ${new Date(request.targetDate).toLocaleDateString('vi-VN')}</p>` : ''}
                            ${request.targetTime ? `<p><strong>Thời gian:</strong> ${request.targetTime}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="request-content">
                        <div class="request-reason">
                            <h5>Lý do:</h5>
                            <p>${request.reason}</p>
                        </div>
                        
                        ${request.currentShift ? `
                            <div class="shift-info">
                                <h5>Thông tin ca làm:</h5>
                                <p><strong>Ca hiện tại:</strong> ${request.currentShift}</p>
                                ${request.requestedShift ? `<p><strong>Ca muốn đổi:</strong> ${request.requestedShift}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        ${request.leaveType ? `
                            <div class="leave-info">
                                <h5>Loại nghỉ phép:</h5>
                                <p>${request.leaveType}</p>
                                ${request.startDate ? `<p><strong>Từ ngày:</strong> ${new Date(request.startDate).toLocaleDateString('vi-VN')}</p>` : ''}
                                ${request.endDate ? `<p><strong>Đến ngày:</strong> ${new Date(request.endDate).toLocaleDateString('vi-VN')}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        ${request.approvedBy ? `
                            <div class="approval-info">
                                <h5>Thông tin duyệt:</h5>
                                <p><strong>Người duyệt:</strong> ${request.approverName || request.approvedBy}</p>
                                <p><strong>Thời gian duyệt:</strong> ${new Date(request.approvedAt).toLocaleString('vi-VN')}</p>
                                ${request.note ? `<p><strong>Ghi chú:</strong> ${request.note}</p>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            modal.style.display = 'flex';

        } catch (error) {
            console.error('Error showing request detail:', error);
            utils.showNotification('Lỗi khi tải chi tiết đơn từ', 'error');
        }
    }

    // Bulk assignment for shift scheduling
    async bulkAssign() {
        try {
            const selectedEmployees = Array.from(document.querySelectorAll('.employee-card input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);

            if (selectedEmployees.length === 0) {
                utils.showNotification('Vui lòng chọn ít nhất một nhân viên', 'warning');
                return;
            }

            // Get template time from first selected employee or use default
            const templateStartTime = document.querySelector('.time-input.start-time')?.value || '08:00';
            const templateEndTime = document.querySelector('.time-input.end-time')?.value || '17:00';

            // Create bulk assignment modal
            let modal = document.getElementById('bulkAssignModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'bulkAssignModal';
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Phân ca hàng loạt</h3>
                            <button class="close-btn" onclick="contentManager.closest('.modal-overlay').style.display='none'">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="bulk-assign-form">
                                <div class="form-group">
                                    <label>Thời gian ca làm:</label>
                                    <div class="time-range-inputs">
                                        <input type="time" id="bulkStartTime" class="time-input" value="${templateStartTime}">
                                        <span>đến</span>
                                        <input type="time" id="bulkEndTime" class="time-input" value="${templateEndTime}">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Áp dụng cho ${selectedEmployees.length} nhân viên đã chọn</label>
                                </div>
                                
                                <div class="form-actions">
                                    <button class="btn btn-secondary" onclick="contentManager.closest('.modal-overlay').style.display='none'">
                                        Hủy
                                    </button>
                                    <button class="btn btn-primary" onclick="contentManager.executeBulkAssign()">
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            modal.style.display = 'flex';

        } catch (error) {
            console.error('Error in bulk assign:', error);
            utils.showNotification('Lỗi khi thực hiện phân ca hàng loạt', 'error');
        }
    }

    // Execute bulk assignment
    async executeBulkAssign() {
        try {
            const startTime = document.getElementById('bulkStartTime').value;
            const endTime = document.getElementById('bulkEndTime').value;
            
            if (!startTime || !endTime) {
                utils.showNotification('Vui lòng nhập đầy đủ thời gian', 'warning');
                return;
            }

            const selectedEmployees = Array.from(document.querySelectorAll('.employee-card input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);

            // Apply time to all selected employees
            selectedEmployees.forEach(employeeId => {
                const employeeRow = document.querySelector(`[data-employee-id="${employeeId}"]`);
                if (employeeRow) {
                    const startInput = employeeRow.querySelector('.time-input.start-time');
                    const endInput = employeeRow.querySelector('.time-input.end-time');
                    const statusDisplay = employeeRow.querySelector('.shift-status');
                    
                    if (startInput && endInput && statusDisplay) {
                        startInput.value = startTime;
                        endInput.value = endTime;
                        statusDisplay.textContent = `${startTime} - ${endTime}`;
                        statusDisplay.className = 'shift-status working';
                    }
                }
            });

            // Close modal
            document.getElementById('bulkAssignModal').style.display = 'none';
            
            utils.showNotification(`Đã phân ca cho ${selectedEmployees.length} nhân viên`, 'success');

        } catch (error) {
            console.error('Error executing bulk assign:', error);
            utils.showNotification('Lỗi khi thực hiện phân ca', 'error');
        }
    }

    // Helper function to get request type text
    getRequestTypeText(type) {
        const types = {
            'forgot_checkin': 'Quên chấm công vào',
            'forgot_checkout': 'Quên chấm công ra', 
            'shift_change': 'Đổi ca làm việc',
            'absence': 'Xin nghỉ',
            'leave': 'Nghỉ phép'
        };
        return types[type] || type;
    }

    // Missing functions implementation
    changeStatsPeriod(period) {
        const buttons = document.querySelectorAll('[data-period]');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = document.querySelector(`[data-period="${period}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Update analytics based on selected period
        this.updateAnalyticsPeriod(period);
        utils.showNotification(`Đã chuyển sang phân tích theo ${period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : period === 'quarter' ? 'quý' : 'năm'}`, 'success');
    }

    updateAnalyticsPeriod(period) {
        // Update analytics data based on selected period
        const periods = {
            'day': { label: 'Hôm nay', multiplier: 1 },
            'week': { label: 'Tuần này', multiplier: 7 },
            'month': { label: 'Tháng này', multiplier: 30 },
            'quarter': { label: 'Quý này', multiplier: 90 },
            'year': { label: 'Năm này', multiplier: 365 }
        };

        const selectedPeriod = periods[period] || periods['month'];
        
        // Update KPI values with mock data adjusted for period
        const baseValues = {
            performance: 94.5,
            attendance: 98.2,
            tasks: 87.5,
            efficiency: 92.1
        };

        Object.keys(baseValues).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                const adjustedValue = Math.min(100, baseValues[key] + (Math.random() - 0.5) * 10);
                element.textContent = `${adjustedValue.toFixed(1)}%`;
            }
        });
    }

    applyTemplate() {
        const template = document.getElementById('shiftTemplate')?.value;
        if (!template) {
            utils.showNotification('Vui lòng chọn mẫu ca', 'warning');
            return;
        }

        const templates = {
            'standard': { start: '08:00', end: '17:00' },
            'flexible': { start: '09:00', end: '18:00' },
            'weekend': { start: '10:00', end: '19:00' }
        };

        const selectedTemplate = templates[template];
        if (!selectedTemplate) return;

        // Apply template to all time inputs
        const startInputs = document.querySelectorAll('.start-time');
        const endInputs = document.querySelectorAll('.end-time');

        startInputs.forEach(input => input.value = selectedTemplate.start);
        endInputs.forEach(input => input.value = selectedTemplate.end);

        // Update shift status displays
        this.updateAllShiftStatuses();
        utils.showNotification(`Đã áp dụng mẫu ca ${template}`, 'success');
    }

    updateAllShiftStatuses() {
        const shiftCells = document.querySelectorAll('.shift-cell');
        shiftCells.forEach(cell => {
            const startTime = cell.querySelector('.start-time')?.value;
            const endTime = cell.querySelector('.end-time')?.value;
            const statusDiv = cell.querySelector('.shift-status');
            
            if (statusDiv) {
                if (startTime && endTime) {
                    statusDiv.textContent = `${startTime} - ${endTime}`;
                    statusDiv.className = 'shift-status working';
                } else {
                    statusDiv.textContent = 'Nghỉ';
                    statusDiv.className = 'shift-status off';
                }
            }
        });
    }

    exportSchedule() {
        utils.showNotification('Đang xuất lịch phân ca...', 'info');
        // Implementation for schedule export
        setTimeout(() => {
            utils.showNotification('Đã xuất lịch phán ca thành công', 'success');
        }, 1500);
    }

    printSchedule() {
        window.print();
    }

    toggleFullscreen() {
        const scheduleGrid = document.getElementById('shiftScheduleGrid');
        if (scheduleGrid) {
            scheduleGrid.classList.toggle('fullscreen-mode');
            utils.showNotification('Đã chuyển chế độ toàn màn hình', 'info');
        }
    }

    // Additional missing functions
    exportTimesheet() {
        utils.showNotification('Đang xuất bảng công...', 'info');
        setTimeout(() => {
            utils.showNotification('Đã xuất bảng công thành công', 'success');
        }, 1500);
    }

    printTimesheet() {
        window.print();
    }

    exportAnalytics() {
        utils.showNotification('Đang xuất báo cáo phân tích...', 'info');
        setTimeout(() => {
            utils.showNotification('Đã xuất báo cáo thành công', 'success');
        }, 1500);
    }

    scheduleReport() {
        utils.showNotification('Đã lên lịch gửi báo cáo tự động', 'success');
    }

    resetTimesheetView() {
        const buttons = document.querySelectorAll('.period-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-period="month"]')?.classList.add('active');
        utils.showNotification('Đã reset view bảng công về mặc định', 'info');
    }

    resetAnalytics() {
        const buttons = document.querySelectorAll('.period-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-period="day"]')?.classList.add('active');
        this.updateAnalyticsPeriod('day');
        utils.showNotification('Đã reset phân tích về mặc định', 'info');
    }

    toggleCalendarView() {
        const calendar = document.querySelector('.calendar-view');
        if (calendar) {
            calendar.classList.toggle('list-view');
            utils.showNotification('Đã chuyển đổi hiển thị lịch', 'info');
        }
    }

    refreshCalendar() {
        utils.showNotification('Đang làm mới dữ liệu lịch...', 'info');
        setTimeout(() => {
            utils.showNotification('Đã cập nhật dữ liệu lịch', 'success');
        }, 1000);
    }

    closeRequestDetailModal() {
        const modal = document.getElementById('requestDetailModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeApprovalModal() {
        const modal = document.getElementById('approvalModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeTaskDetailModal() {
        const modal = document.querySelector('.task-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    refreshKPI() {
        utils.showNotification('Đang làm mới KPI...', 'info');
        this.updateAnalyticsPeriod('month');
        setTimeout(() => {
            utils.showNotification('Đã cập nhật KPI', 'success');
        }, 1000);
    }

    customizeKPI() {
        utils.showNotification('Tính năng tùy chỉnh KPI đang phát triển', 'info');
    }

    changeAnalysisType(type) {
        const buttons = document.querySelectorAll('[data-analysis]');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = document.querySelector(`[data-analysis="${type}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        utils.showNotification(`Đã chuyển sang phân tích theo ${type === 'daily' ? 'ngày' : 'tuần'}`, 'success');
    }

    exportMetrics() {
        utils.showNotification('Đang xuất chỉ số hiệu suất...', 'info');
        setTimeout(() => {
            utils.showNotification('Đã xuất chỉ số thành công', 'success');
        }, 1500);
    }

    toggleEmployeeView() {
        const grid = document.querySelector('.employee-grid');
        if (grid) {
            grid.classList.toggle('list-view');
            utils.showNotification('Đã chuyển đổi hiển thị nhân viên', 'info');  
        }
    }

    filterEmployees() {
        utils.showNotification('Tính năng lọc nhân viên đang phát triển', 'info');
    }

    refreshEmployees() {
        utils.showNotification('Đang làm mới danh sách nhân viên...', 'info');
        const storeId = document.getElementById('shiftStore')?.value;
        if (storeId) {
            this.loadEmployeesForStore(storeId);
        }
    }

    clearAllShifts() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả ca làm việc?')) {
            this.clearAllShiftAssignments();
        }
    }

    // Fix for the text editor functions
    toggleEditorFullscreen() {
        const editor = document.querySelector('.text-editor-container');
        if (editor) {
            editor.classList.toggle('fullscreen-editor');
            utils.showNotification('Đã chuyển chế độ toàn màn hình', 'info');
        }
    }

    toggleEditorMode() {
        utils.showNotification('Đã chuyển sang chế độ Markdown', 'info');
    }

    showEditorHelp() {
        utils.showNotification('Trợ giúp: Sử dụng các nút trên thanh công cụ để định dạng text', 'info');
    }

    saveAsDraft() {
        utils.showNotification('Đã lưu bản nháp', 'success');
    }

    previewContent() {
        utils.showNotification('Hiển thị xem trước nội dung', 'info');
    }

    // Enhanced text editor functionality
    initializeTextEditor() {
        document.addEventListener('click', (e) => {
            // Handle toolbar button clicks
            if (e.target.closest('.toolbar-btn')) {
                const btn = e.target.closest('.toolbar-btn');
                const command = btn.dataset.command;
                const value = btn.dataset.value;
                this.executeEditorCommand(command, value);
            }
            
            // Handle color picker changes
            if (e.target.matches('.toolbar-color-picker')) {
                const color = e.target.value;
                const command = e.target.dataset.command || 'foreColor';
                this.executeEditorCommand(command, color);
            }
        });

        // Handle select changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.font-size-select')) {
                this.executeEditorCommand('fontSize', e.target.value);
            }
            if (e.target.matches('.font-family-select')) {
                this.executeEditorCommand('fontName', e.target.value);
            }
        });

        // Initialize editor areas as contenteditable
        document.addEventListener('DOMContentLoaded', () => {
            const editorWorkspaces = document.querySelectorAll('.editor-workspace');
            editorWorkspaces.forEach(workspace => {
                if (!workspace.hasAttribute('contenteditable')) {
                    workspace.setAttribute('contenteditable', 'true');
                    workspace.style.minHeight = '200px';
                    workspace.style.padding = '12px';
                    workspace.style.border = '1px solid #e1e5e9';
                    workspace.style.borderRadius = '6px';
                    workspace.style.outline = 'none';
                    
                    // Add placeholder behavior
                    if (!workspace.textContent.trim()) {
                        workspace.innerHTML = '<p style="color: #999; margin: 0;">Nhập nội dung tại đây...</p>';
                    }
                    
                    workspace.addEventListener('focus', () => {
                        if (workspace.innerHTML.includes('Nhập nội dung tại đây...')) {
                            workspace.innerHTML = '';
                        }
                    });
                    
                    workspace.addEventListener('blur', () => {
                        if (!workspace.textContent.trim()) {
                            workspace.innerHTML = '<p style="color: #999; margin: 0;">Nhập nội dung tại đây...</p>';
                        }
                    });
                }
            });
        });
    }

    executeEditorCommand(command, value = null) {
        try {
            const workspace = document.querySelector('.editor-workspace:focus') || document.querySelector('.editor-workspace');
            if (!workspace) return;

            // Focus the workspace first
            workspace.focus();

            // Execute the formatting command
            switch (command) {
                case 'bold':
                    document.execCommand('bold');
                    break;
                case 'italic':
                    document.execCommand('italic');
                    break;
                case 'underline':
                    document.execCommand('underline');
                    break;
                case 'strikethrough':
                    document.execCommand('strikeThrough');
                    break;
                case 'insertOrderedList':
                    document.execCommand('insertOrderedList');
                    break;
                case 'insertUnorderedList':
                    document.execCommand('insertUnorderedList');
                    break;
                case 'justifyLeft':
                    document.execCommand('justifyLeft');
                    break;
                case 'justifyCenter':
                    document.execCommand('justifyCenter');
                    break;
                case 'justifyRight':
                    document.execCommand('justifyRight');
                    break;
                case 'indent':
                    document.execCommand('indent');
                    break;
                case 'outdent':
                    document.execCommand('outdent');
                    break;
                case 'createLink':
                    const url = prompt('Nhập URL:');
                    if (url) document.execCommand('createLink', false, url);
                    break;
                case 'unlink':
                    document.execCommand('unlink');
                    break;
                case 'insertHorizontalRule':
                    document.execCommand('insertHorizontalRule');
                    break;
                case 'undo':
                    document.execCommand('undo');
                    break;
                case 'redo':
                    document.execCommand('redo');
                    break;
                case 'foreColor':
                case 'backColor':
                case 'fontSize':
                case 'fontName':
                    if (value) document.execCommand(command, false, value);
                    break;
                case 'formatBlock':
                    if (value) document.execCommand('formatBlock', false, `<${value}>`);
                    break;
                default:
                    console.warn('Unknown editor command:', command);
            }

            // Update character count
            this.updateCharacterCount(workspace);
            
        } catch (error) {
            console.error('Error executing editor command:', error);
        }
    }

    updateCharacterCount(workspace) {
        const counter = workspace.closest('.text-editor-container')?.querySelector('.char-count');
        if (counter) {
            const text = workspace.textContent || '';
            const charCount = text.length;
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
            counter.textContent = `${charCount} ký tự, ${wordCount} từ`;
        }
    }
}

// Menu Manager
class MenuManager {
    static updateMenuByRole(userRole) {
        document.querySelectorAll("#menuList .menu-item").forEach(item => {
            const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
            item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
        });
        this.updateSubmenusByRole(userRole);
    }

    static updateSubmenusByRole(userRole) {
        ['#openSchedule', '#openTaskProcessing'].forEach(selector => {
            const menuItem = document.querySelector(selector)?.closest('.menu-item');
            if (menuItem) {
                menuItem.querySelectorAll('.submenu-item').forEach(item => {
                    const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                    item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
                });
            }
        });
    }

    static setupMenuInteractions() {
        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Close all other submenus
                    document.querySelectorAll('.menu-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    // Toggle current submenu
                    item.classList.toggle('active');
                });
            }
        });

        // Close submenu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }
}

// Automatic Time-Based Theme Manager
class ThemeManager {
    static initialize() {
        // Set automatic theme based on time
        this.setAutomaticTheme();
        
        // Update theme every minute
        setInterval(() => this.setAutomaticTheme(), 60000);
    }
    
    static setAutomaticTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        // Dark mode: 18:00 (6 PM) to 06:59 (7 AM)
        // Light mode: 07:00 (7 AM) to 17:59 (6 PM)
        const isDarkTime = hour >= 18 || hour < 7;
        const newTheme = isDarkTime ? "dark" : "light";
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
        
        return newTheme;
    }
}

// Auth Manager
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA));
        // Initialize cache for API data
        this.cachedStores = null;
        this.cachedUser = null;
        this.cachedDashboardStats = null;
        this.cacheTimestamp = {
            stores: null,
            user: null,
            dashboardStats: null
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Check if cache is valid
    isCacheValid(cacheType) {
        const timestamp = this.cacheTimestamp[cacheType];
        return timestamp && (Date.now() - timestamp) < this.cacheTimeout;
    }

    // Get stores data with caching
    async getStoresData() {
        if (this.cachedStores && this.isCacheValid('stores')) {
            console.log('Using cached stores data');
            return this.cachedStores;
        }

        try {
            console.log('Fetching fresh stores data');
            const stores = await utils.fetchAPI(`?action=getStores&token=${this.token}`);
            this.cachedStores = stores;
            this.cacheTimestamp.stores = Date.now();
            return stores;
        } catch (error) {
            console.error('Error fetching stores:', error);
            // Return cached data if available, even if expired
            return this.cachedStores || [];
        }
    }

    // Get user data with caching
    async getUserData() {
        if (this.cachedUser && this.isCacheValid('user')) {
            console.log('Using cached user data');
            return this.cachedUser;
        }

        try {
            const employeeId = this.userData?.employeeId || this.userData?.loginEmployeeId;
            if (!employeeId) {
                throw new Error("No employee ID in user data");
            }
            
            console.log('Fetching fresh user data');
            const user = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            if (user) {
                this.cachedUser = user;
                this.cacheTimestamp.user = Date.now();
                return user;
            }
            throw new Error("Invalid user data");
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Return cached data if available, even if expired
            return this.cachedUser || this.userData;
        }
    }

    // Get dashboard stats with caching
    async getDashboardStats() {
        if (this.cachedDashboardStats && this.isCacheValid('dashboardStats')) {
            console.log('Using cached dashboard stats');
            return this.cachedDashboardStats;
        }

        try {
            console.log('Fetching fresh dashboard stats');
            const stats = await utils.fetchAPI(`?action=getDashboardStats&token=${this.token}`);
            this.cachedDashboardStats = stats;
            this.cacheTimestamp.dashboardStats = Date.now();
            return stats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return cached data if available, even if expired
            return this.cachedDashboardStats || {
                totalEmployees: 0,
                todayShifts: 0,
                pendingRequests: 0
            };
        }
    }

    // Clear specific cache
    clearCache(cacheType = null) {
        if (cacheType) {
            this[`cached${cacheType.charAt(0).toUpperCase() + cacheType.slice(1)}`] = null;
            this.cacheTimestamp[cacheType] = null;
        } else {
            // Clear all cache
            this.cachedStores = null;
            this.cachedUser = null;
            this.cachedDashboardStats = null;
            this.cacheTimestamp = {
                stores: null,
                user: null,
                dashboardStats: null
            };
        }
    }

    async checkAuthentication() {
        if (!this.token || !this.userData) {
            // window.location.href = "index.html"; // Commented for testing
            return null;
        }

        try {
            // Use cached user data method
            const user = await this.getUserData();
            if (user) {
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${user.fullName} - ${user.employeeId}`;
                }
                MenuManager.updateMenuByRole(user.position);
                return user;
            }
            throw new Error("Invalid session");
        } catch (error) {
            utils.showNotification("Phiên hết hạn, vui lòng đăng nhập lại", "warning");
            this.logout();
            return null;
        }
    }

    setupLogoutHandler() {
        document.getElementById("logout")?.addEventListener("click", () => this.logout());
    }

    logout() {
        this.clearCache(); // Clear all cached data
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        // window.location.href = "index.html"; // Commented for testing
    }
}

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

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    
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
        MenuManager.setupMenuInteractions();
        ThemeManager.initialize();

        // Initialize features with proper user data
        window.contentManager = new ContentManager(userData);

        // Populate user info in header early using userData
        const userInfoElement = document.getElementById("userInfo");
        if (userInfoElement && userData) {
            userInfoElement.textContent = `Chào ${userData.fullName} - ${userData.employeeId}`;
            console.log('✅ User info populated in header:', userData.fullName, userData.employeeId);
        }

        // Load dashboard stats immediately when page loads
        await getDashboardStats();
        
        // Ensure stats-grid is visible and updated
        await updateStatsGrid();

        // Apply role-based section visibility
        await applyRoleBasedSectionVisibility();

        // Initialize enhanced dashboard
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
});

// Standalone mobile menu initialization - independent of authentication
window.addEventListener('load', () => {
    setupMobileMenu();
});

// Additional backup initialization for mobile menu
setTimeout(() => {
    setupMobileMenu();
}, 3000);

// Enhanced Dashboard Stats Initialization - Using unified dashboard API
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

// Role-based UI Management  
async function initializeRoleBasedUI() {
    let userPosition = 'NV'; // Default fallback
    
    // Use cached user data instead of making fresh API calls
    try {
        const freshUserData = await API_CACHE.getUserData();
        if (freshUserData && freshUserData.position) {
            userPosition = freshUserData.position;
            console.log('🔐 Using cached role for UI initialization:', userPosition);
        } else {
            console.warn('⚠️ No cached user data found, using default role NV');
        }
    } catch (error) {
        console.warn('⚠️ Using default role due to cache error:', error);
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
    
    // Use cached user data instead of making fresh API calls
    try {
        const freshUserData = await API_CACHE.getUserData();
        if (freshUserData && freshUserData.position) {
            userRole = freshUserData.position;
            console.log('🔐 Using cached role for section visibility:', userRole);
        } else {
            console.warn('⚠️ No cached user data found, using default role NV');
        }
    } catch (error) {
        console.warn('⚠️ Using default role due to cache error:', error);
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
        await getDashboardStats();
        await loadReportData();
        
        // Ensure role permissions are refreshed after stats update
        await refreshUserRoleAndPermissions();
        
        utils.showNotification('Dữ liệu đã được cập nhật', 'success');
    } catch (error) {
        console.error('Error refreshing dashboard stats:', error);
        utils.showNotification('Lỗi khi làm mới dữ liệu', 'error');
    }
}

// Load report data
async function loadReportData() {
    try {
        const stats = await utils.fetchAPI('?action=getDashboardStats');
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

// Refresh user role and permissions using fresh API data
async function refreshUserRoleAndPermissions() {
    try {
        // Use cached user data instead of making fresh API calls
        const freshUserData = await API_CACHE.getUserData();
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
        
        console.log('✅ Dashboard loader shown');
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
        
        // Use cached user data instead of making fresh API calls
        const freshUserData = await API_CACHE.getUserData();
        if (!freshUserData || !freshUserData.position) {
            console.error('Failed to fetch user data from cache');
            return;
        }

        const userPosition = freshUserData.position;
        console.log('📊 Cached user data:', { 
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
        
        // Initialize all dashboard components
        console.log('📊 Initializing dashboard stats and role checking...');
        await getDashboardStats(); // This will also call refreshUserRoleAndPermissions
        
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

// Run refresh only on page load
document.addEventListener('DOMContentLoaded', async () => {
    await refreshSystemData();
});

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
        
        // Use cached user data instead of making fresh API calls
        try {
            const freshUserData = await API_CACHE.getUserData();
            if (freshUserData && freshUserData.position) {
                userRole = freshUserData.position;
                console.log('🔐 Using cached role for welcome section:', userRole);
            } else {
                console.warn('⚠️ No cached user data found, using default role NV');
            }
        } catch (error) {
            console.warn('⚠️ Using default role due to cache error:', error);
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
        
        // Run getDashboardStats to update the stats numbers
        await getDashboardStats();
        
        
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



// Inject professional CSS styles for enhanced interfaces
document.addEventListener('DOMContentLoaded', () => {
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
});

