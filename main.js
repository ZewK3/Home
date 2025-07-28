// Constants and Configuration
const CONFIG = {
    API_URL: "https://zewk.tocotoco.workers.dev",
    STORAGE_KEYS: {
        AUTH_TOKEN: "authToken",
        USER_DATA: "loggedInUser",
        THEME: "theme",
        REMEMBER_ME: "rememberedEmployeeId"
    },
    POLLING_INTERVAL: 3000,
    MAX_RETRY_ATTEMPTS: 3
};

// Global cache for API data
const API_CACHE = {
    userData: null,
    storesData: null,
    lastUserDataFetch: null,
    lastStoresDataFetch: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // Clear cache
    clear() {
        this.userData = null;
        this.storesData = null;
        this.lastUserDataFetch = null;
        this.lastStoresDataFetch = null;
    },
    
    // Check if cache is valid
    isCacheValid(timestamp) {
        return timestamp && (Date.now() - timestamp < this.CACHE_DURATION);
    },
    
    // Get cached user data or fetch new
    async getUserData() {
        if (this.userData && this.isCacheValid(this.lastUserDataFetch)) {
            return this.userData;
        }
        
        const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const employeeId = userData.employeeId || userData.loginEmployeeId;
        
        if (!employeeId) {
            throw new Error('No employee ID found');
        }
        
        try {
            this.userData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            this.lastUserDataFetch = Date.now();
            return this.userData;
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            throw error;
        }
    },
    
    // Get cached stores data or fetch new
    async getStoresData() {
        if (this.storesData && this.isCacheValid(this.lastStoresDataFetch)) {
            return this.storesData;
        }
        
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            this.storesData = await utils.fetchAPI(`?action=getStores&token=${token}`);
            this.lastStoresDataFetch = Date.now();
            return this.storesData;
        } catch (error) {
            console.error('Failed to fetch stores data:', error);
            throw error;
        }
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
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('vi-VN', {
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
    }

    setupMenuHandlers() {
        // Shift Management
        document.getElementById('openShiftAssignment')?.addEventListener('click', () => 
            this.showShiftAssignment());
        document.getElementById('openWorkShifts')?.addEventListener('click', () => 
            this.showWorkShifts());
        document.getElementById('openAttendance')?.addEventListener('click', () => 
            this.showAttendance());

        // Tasks
        document.getElementById('openSubmitTask')?.addEventListener('click', () => 
            this.showSubmitTask());
        document.getElementById('taskPersonnel')?.addEventListener('click', () => 
            this.showTaskPersonnel());
        document.getElementById('taskStore')?.addEventListener('click', () => 
            this.showTaskStore());
        document.getElementById('taskFinance')?.addEventListener('click', () => 
            this.showTaskFinance());
        document.getElementById('taskApproval')?.addEventListener('click', () => 
            this.showTaskApproval());

        // Other functionality
        document.getElementById('openReward')?.addEventListener('click', () => 
            this.showRewards());
        document.getElementById('openGrantAccess')?.addEventListener('click', () => 
            this.showGrantAccess());
        document.getElementById('openPersonalInformation')?.addEventListener('click', () => 
            this.showPersonalInfo());
        
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
                <div class="shift-assignment-container">
                    <div class="card">
                        <div class="card-header">
                            <h2>Phân Ca Làm Việc</h2>
                            <p>Phân công ca làm việc cho nhân viên theo cửa hàng và thời gian</p>
                        </div>
                        <div class="card-body">
                            <div class="shift-filters">
                                <div class="filter-row">
                                    <div class="filter-group">
                                        <label for="shiftStore">Cửa hàng:</label>
                                        <select id="shiftStore" class="form-control">
                                            <option value="">Chọn cửa hàng</option>
                                        </select>
                                    </div>
                                    <div class="filter-group">
                                        <label for="shiftWeek">Tuần:</label>
                                        <input type="week" id="shiftWeek" class="form-control" value="${this.getCurrentWeek()}">
                                    </div>
                                    <button id="loadShiftData" class="btn btn-primary">Tải dữ liệu</button>
                                </div>
                            </div>
                            <div id="shiftAssignmentGrid" class="shift-grid">
                                <p class="text-center">Chọn cửa hàng và tuần để bắt đầu phân ca</p>
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
            const response = await API_CACHE.getStoresData();
            
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
            const response = await API_CACHE.getStoresData();
            
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
        document.getElementById('loadShiftData')?.addEventListener('click', async () => {
            const store = document.getElementById('shiftStore')?.value;
            const week = document.getElementById('shiftWeek')?.value;
            
            if (!store || !week) {
                utils.showNotification('Vui lòng chọn cửa hàng và tuần', 'warning');
                return;
            }

            try {
                const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                const response = await utils.fetchAPI(`?action=getShiftAssignments&store=${store}&week=${week}&token=${token}`);
                
                const shiftGrid = document.getElementById('shiftAssignmentGrid');
                if (shiftGrid && response) {
                    // Generate shift assignment grid here
                    shiftGrid.innerHTML = `
                        <div class="shift-assignment-grid">
                            <p>Giao diện phân ca sẽ được triển khai ở đây</p>
                            <p>Cửa hàng: ${store}, Tuần: ${week}</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Load shift assignment error:', error);
                utils.showNotification('Không thể tải dữ liệu phân ca', 'error');
            }
        });
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
                
                // Use createTask API to create a proper task
                await utils.fetchAPI('?action=createTask', {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
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
            // Load task data for dashboard
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const tasks = await utils.fetchAPI(`?action=getTasks&token=${token}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Nhân Sự</h2>
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
                            <p>Chức năng xử lý yêu cầu nhân sự. Hiện tại hệ thống có ${Array.isArray(tasks) ? tasks.length : 0} yêu cầu chưa xử lý.</p>
                            <div class="placeholder-content">
                                <p>📋 Danh sách yêu cầu nhân sự sẽ được hiển thị ở đây</p>
                                <p>💬 Các yêu cầu nghỉ phép, tăng ca, thay đổi lịch làm việc</p>
                                <p>⏳ Trạng thái: Chờ phát triển chức năng</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('personnel');
        } catch (error) {
            console.error('Personnel tasks error:', error);
            utils.showNotification("Không thể tải yêu cầu nhân sự", "error");
        }
    }

    async showTaskStore() {
        const content = document.getElementById('content');
        try {
            // Use getStores API to show store information
            const stores = await utils.fetchAPI('?action=getStores');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Cửa Hàng</h2>
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
                            <p>Quản lý yêu cầu từ ${Array.isArray(stores) ? stores.length : 0} cửa hàng trong hệ thống.</p>
                            <div class="store-list">
                                ${Array.isArray(stores) ? stores.map(store => `
                                    <div class="store-card">
                                        <h4>${store.storeName || store.storeId}</h4>
                                        <p>Mã cửa hàng: ${store.storeId}</p>
                                        <p>Trạng thái: Hoạt động</p>
                                    </div>
                                `).join('') : '<p>Không có cửa hàng nào</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('store');
        } catch (error) {
            console.error('Store tasks error:', error);
            utils.showNotification("Không thể tải thông tin cửa hàng", "error");
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

    async showRewards() {
        const content = document.getElementById('content');
        try {
            // Use getUsers API to populate employee dropdown
            const employees = await utils.fetchAPI('?action=getUsers');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Quản Lý Thưởng/Phạt</h2>
                    </div>
                    <div class="card-body">
                        <form id="rewardForm" class="reward-form">
                            <div class="form-group">
                                <label>Nhân viên</label>
                                <select name="employeeId" class="form-control" required>
                                    <option value="">Chọn nhân viên</option>
                                    ${Array.isArray(employees) ? employees.map(emp => 
                                        `<option value="${emp.employeeId}">${emp.fullName} - ${emp.employeeId}</option>`
                                    ).join('') : ''}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Loại</label>
                                <select name="type" class="form-control" required>
                                    <option value="reward">Thưởng</option>
                                    <option value="penalty">Phạt</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Số tiền</label>
                                <input type="number" name="amount" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Lý do</label>
                                <textarea name="reason" class="form-control" rows="3" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Thêm thưởng/phạt</button>
                        </form>
                        
                        <div class="reward-history">
                            <h3>Lịch sử thưởng/phạt</h3>
                            <p>⏳ Chức năng lịch sử thưởng/phạt đang được phát triển</p>
                            <div class="placeholder-history">
                                <p>📋 Danh sách thưởng/phạt sẽ được hiển thị ở đây</p>
                                <p>💰 Theo dõi các khoản thưởng và phạt của nhân viên</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupRewardHandlers();
        } catch (error) {
            console.error('Rewards error:', error);
            utils.showNotification("Không thể tải thông tin thưởng/phạt", "error");
        }
    }

    async showGrantAccess() {
        const content = document.getElementById('content');
        try {
            // Show loading state
            content.innerHTML = `
                <div class="loading-container" style="display: flex; justify-content: center; align-items: center; height: 400px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-left: 1rem; color: var(--text-muted);">Đang tải danh sách người dùng...</p>
                </div>
            `;

            // Use getUsers API to get user list with enhanced error handling
            const response = await utils.fetchAPI('?action=getUsers');
            
            
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
                        <div class="no-data-state" style="text-align: center; padding: 3rem;">
                            <span style="font-size: 4rem; color: var(--text-muted);">👥</span>
                            <h3 style="color: var(--text-muted); margin: 1rem 0;">Không có dữ liệu người dùng</h3>
                            <p style="color: var(--text-muted);">Vui lòng thêm người dùng vào hệ thống trước.</p>
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
                    <div class="error-state" style="text-align: center; padding: 3rem;">
                        <span style="font-size: 4rem; color: var(--error);">⚠️</span>
                        <h3 style="color: var(--error); margin: 1rem 0;">Lỗi: ${error.message}</h3>
                        <p style="color: var(--text-muted);">Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
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
            // Use getUser API to get personal information
            const response = await utils.fetchAPI(`?action=getUser&employeeId=${this.user.employeeId}`);
            
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
                                    <div class="stat-item">
                                        <div class="stat-icon">🏆</div>
                                        <div class="stat-info">
                                            <div class="stat-value" id="rewardsCount">-</div>
                                            <div class="stat-label">Lần được khen</div>
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
                        <button onclick="this.showPersonalInfo()" class="btn btn-primary">Thử lại</button>
                    </div>
                </div>
            `;
        }
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
                // Verify password first
                const verifyResponse = await utils.fetchAPI(`?action=login`, {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
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
            
            const updateData = {
                employeeId: this.user.employeeId,
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
            const requestData = {
                employeeId: this.user.employeeId,
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
            // Load personal statistics
            const statsResponse = await utils.fetchAPI(`?action=getPersonalStats&employeeId=${this.user.employeeId}`);
            
            if (statsResponse && statsResponse.stats) {
                const stats = statsResponse.stats;
                document.getElementById('workDaysThisMonth').textContent = stats.workDaysThisMonth || 0;
                document.getElementById('totalHoursThisMonth').textContent = `${stats.totalHoursThisMonth || 0} giờ`;
                document.getElementById('attendanceRate').textContent = `${stats.attendanceRate || 0}%`;
                document.getElementById('rewardsCount').textContent = stats.rewardsCount || 0;
            }
        } catch (error) {
            console.log('Stats not available:', error);
            // Set default values if stats API is not available
            document.getElementById('workDaysThisMonth').textContent = '0';
            document.getElementById('totalHoursThisMonth').textContent = '0 giờ';
            document.getElementById('attendanceRate').textContent = '0%';
            document.getElementById('rewardsCount').textContent = '0';
        }
    }

    exportPersonalInfo() {
        // Create downloadable personal info summary
        const userInfo = {
            employeeId: this.user.employeeId,
            timestamp: new Date().toISOString(),
            // Add other relevant info here
        };
        
        const dataStr = JSON.stringify(userInfo, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `personal-info-${this.user.employeeId}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        utils.showNotification('Đã xuất thông tin cá nhân', 'success');
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
                            <td>${reward.amount.toLocaleString('vi-VN')} VNĐ</td>
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

    setupRewardHandlers() {
        document.getElementById('rewardForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                await utils.fetchAPI('?action=addReward', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                utils.showNotification("Đã thêm thưởng/phạt", "success");
                this.showRewards();
            } catch (error) {
                utils.showNotification("Không thể thêm thưởng/phạt", "error");
            }
        });
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
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI(`?action=getStores&token=${token}`);
            
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
            
            const formData = new FormData(e.target);
            const requestData = {
                employeeId: this.user.employeeId,
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
                            <div class="loading-state">
                                <div class="loading-spinner"></div>
                                <p class="loading-text">Đang tải danh sách đăng ký...</p>
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
                            <button class="modal-close" onclick="this.closest('.modal').style.display='none'">✕</button>
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
                            <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Đóng</button>
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
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI(`?action=getStores&token=${token}`);
            
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
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
            
            // Get all stores from API
            const response = await utils.fetchAPI(`?action=getStores&token=${token}`);
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
            
            // Get user's current info to apply proper filtering
            // Handle both loginEmployeeId (from login) and employeeId formats
            const employeeId = userData.employeeId || userData.loginEmployeeId;
            if (!employeeId) {
                console.error('No employee ID found in user data:', userData);
                throw new Error('Employee ID not found in user data');
            }
            const userResponse = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}&token=${token}`);
            let currentUser = userResponse;
            
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
        try {
            const statusFilter = document.getElementById('statusFilterSelect')?.value || 'pending';
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            
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
    }

    async checkAuthentication() {
        if (!this.token || !this.userData) {
            window.location.href = "index.html";
            return null;
        }

        try {
            // Handle both employeeId and loginEmployeeId for compatibility
            const employeeId = this.userData.employeeId || this.userData.loginEmployeeId;
            if (!employeeId) {
                throw new Error("No employee ID in user data");
            }
            
            const user = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
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
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        window.location.href = "index.html";
    }
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

    // Initialize managers
    const authManager = new AuthManager();
    // TEMPORARILY DISABLED FOR TESTING - const user = await authManager.checkAuthentication();
    const user = { employeeId: 'test123', role: 'AD' }; // Mock user for testing

    if (user) {
        authManager.setupLogoutHandler();
        MenuManager.setupMenuInteractions();
        ThemeManager.initialize();

        // Initialize features
        window.contentManager = new ContentManager(user);

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
    const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    let userPosition = 'NV'; // Default fallback
    
    // Get fresh user data from API to ensure accurate role
    try {
        const employeeId = loggedInUser.employeeId || loggedInUser.loginEmployeeId;
        if (employeeId) {
            const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            if (freshUserData && freshUserData.position) {
                userPosition = freshUserData.position;
                console.log('🔐 Using fresh role from API for UI initialization:', userPosition);
            }
        } else {
            console.warn('⚠️ No employee ID found, using default role NV');
        }
    } catch (error) {
        console.warn('⚠️ Using default role due to API error:', error);
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
    const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    
    // Handle both employeeId and loginEmployeeId for compatibility
    const employeeId = loggedInUser.employeeId || loggedInUser.loginEmployeeId;
    let userRole = loggedInUser.position || 'NV';
    
    if (!employeeId) {
        console.error('❌ No employee ID found in localStorage for role visibility');
        // Try to get from current user session instead
        const userInfo = document.getElementById("userInfo");
        if (userInfo && userInfo.textContent) {
            // Extract employee ID from userInfo display
            const match = userInfo.textContent.match(/- ([A-Z0-9]+)$/);
            if (match) {
                const extractedId = match[1];
                try {
                    const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${extractedId}`);
                    if (freshUserData && freshUserData.position) {
                        userRole = freshUserData.position;
                        console.log('🔐 Using fresh role from extracted ID:', userRole);
                    }
                } catch (error) {
                    console.warn('⚠️ Could not fetch user data with extracted ID:', error);
                }
            }
        }
        
        if (!employeeId && userRole === 'NV') {
            console.warn('⚠️ No employee ID available, defaulting to NV role');
            userRole = 'NV';
        }
    } else {
        // Get fresh user data from API to ensure accurate role
        try {
            const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            if (freshUserData && freshUserData.position) {
                userRole = freshUserData.position;
                console.log('🔐 Using fresh role from API for section visibility:', userRole);
            }
        } catch (error) {
            console.warn('⚠️ Using cached role for section visibility due to API error:', error);
        }
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
            'AD': ['addEmployee', 'createSchedule', 'manageRewards', 'viewReports'],
            'QL': ['createSchedule', 'manageRewards'],
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
        case 'manageRewards':
            openModal('reward');
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
        const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const employeeId = loggedInUser.employeeId || loggedInUser.loginEmployeeId;
        if (!employeeId) return;

        // Get fresh user data from API
        const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
        if (freshUserData && freshUserData.position) {
            
            // Update role-based UI with fresh data
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
        await loadPersonalRewards();
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

// Load Personal Rewards
async function loadPersonalRewards() {
    const container = document.getElementById('personalRewards');
    if (!container) return;

    try {
        const userInfo = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const employeeId = userInfo.employeeId || userInfo.loginEmployeeId;
        const rewards = await utils.fetchAPI(`?action=getRewards&employeeId=${employeeId}&limit=5&token=${token}`);
        
        if (rewards && Array.isArray(rewards) && rewards.length > 0) {
            const rewardsHTML = rewards.map(reward => `
                <div class="reward-item ${reward.type}">
                    <span class="reward-type">${reward.type === 'reward' ? '🏆 Thưởng' : '⚠️ Phạt'}:</span>
                    <span class="reward-amount">${reward.amount.toLocaleString('vi-VN')} ₫</span>
                    <span class="reward-reason">${reward.reason}</span>
                </div>
            `).join('');
            container.innerHTML = rewardsHTML;
        } else {
            container.innerHTML = '<p>Chưa có thưởng/phạt</p>';
        }
    } catch (error) {
        console.error('Failed to load personal rewards:', error);
        container.innerHTML = '<p>Không thể tải thưởng/phạt</p>';
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
        
        // Other menu items
        document.getElementById('mobileReward')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => window.contentManager?.showReward(), 300);
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
            setTimeout(() => logout(), 300);
        });
    }
    
    setupMobileMenuHandlers();
    
    console.log('✅ GitHub-style mobile menu dialog initialized');
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
    
    // Simulate minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (dashboardLoader) {
        dashboardLoader.classList.add('hidden');
        
        setTimeout(() => {
            dashboardLoader.style.display = 'none';
        }, 800);
        
        console.log('✅ Dashboard loader hidden');
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
        
        // Get fresh user data from API instead of localStorage
        const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const employeeId = loggedInUser.employeeId || loggedInUser.loginEmployeeId;
        
        if (!employeeId) {
            console.error('No employee ID found in localStorage - checking userInfo fallback');
            
            // Try to get from current user session display
            const userInfo = document.getElementById("userInfo");
            if (userInfo && userInfo.textContent) {
                const match = userInfo.textContent.match(/- ([A-Z0-9]+)$/);
                if (match) {
                    const extractedId = match[1];
                    
                    try {
                        const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${extractedId}`);
                        if (freshUserData && freshUserData.position) {
                            const userPosition = freshUserData.position;
                            console.log('📊 Fresh user data from extracted ID:', { 
                                employeeId: freshUserData.employeeId, 
                                fullName: freshUserData.fullName, 
                                position: userPosition,
                                storeName: freshUserData.storeName
                            });
                            
                            // Continue with initialization
                            console.log('📊 Initializing dashboard stats and role checking...');
                            await getDashboardStats();
                            
                            await initializeRoleBasedUI();
                            MenuManager.updateMenuByRole(userPosition);
                            return;
                        }
                    } catch (error) {
                        console.error('Failed to get user data from extracted ID:', error);
                    }
                }
            }
            
            console.error('❌ Could not determine employee ID - aborting dashboard initialization');
            return;
        }

        
        // Fetch fresh user data from API
        const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
        if (!freshUserData || !freshUserData.position) {
            console.error('Failed to fetch fresh user data from API');
            return;
        }

        const userPosition = freshUserData.position;
        console.log('📊 Fresh user data from API:', { 
            employeeId: freshUserData.employeeId, 
            fullName: freshUserData.fullName, 
            position: userPosition,
            storeName: freshUserData.storeName
        });
        
        // Initialize all dashboard components
        console.log('📊 Initializing dashboard stats and role checking...');
        await getDashboardStats(); // This will also call refreshUserRoleAndPermissions
        
        // Initialize role-based UI and menu visibility with fresh API data
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
        
        // Get user role first before building content
        const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        let userRole = loggedInUser.position || 'NV';
        
        // Get fresh user data from API to ensure accurate role
        try {
            const employeeId = loggedInUser.employeeId || loggedInUser.loginEmployeeId;
            if (employeeId) {
                const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
                if (freshUserData && freshUserData.position) {
                    userRole = freshUserData.position;
                    console.log('🔐 Using fresh role from API:', userRole);
                }
            }
        } catch (error) {
            console.warn('⚠️ Using cached role due to API error:', error);
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
                    <button class="quick-action-btn" data-action="manageRewards">
                        <span class="action-icon">🏆</span>
                        <span class="action-text">Quản Lý Thưởng</span>
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
                        <h3>Thưởng/Phạt</h3>
                        <div class="chart-placeholder" id="rewardsChart">
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
                        <p class="loading-text">Đang tải danh sách...</p>
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
                    <div class="personal-card rewards">
                        <h3>Thưởng/Phạt Gần Đây</h3>
                        <div id="personalRewards" class="rewards-preview">
                            <p>Đang tải thông tin...</p>
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
                    <p class="loading-text">Đang tải hoạt động...</p>
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




