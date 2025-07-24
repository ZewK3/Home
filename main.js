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
        // Schedule Management
        document.getElementById('openScheduleRegistration')?.addEventListener('click', () => 
            this.showScheduleRegistration());
        document.getElementById('openScheduleWork')?.addEventListener('click', () => 
            this.showScheduleWork());
        document.getElementById('openOfficialworkschedule')?.addEventListener('click', () => 
            this.showOfficialSchedule());

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

    // Schedule Management Functions
    async showScheduleRegistration() {
        const content = document.getElementById('content');
        try {
            // Use checkdk API to get existing schedule
            const response = await utils.fetchAPI(`?action=checkdk&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Đăng Ký Lịch Làm</h2>
                    </div>
                    <div class="card-body">
                        <form id="scheduleForm">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Ca làm</th>
                                        <th>Giờ vào</th>
                                        <th>Giờ ra</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateScheduleRows(response.shifts || [])}
                                </tbody>
                            </table>
                            <button type="submit" class="btn btn-primary">Lưu lịch làm việc</button>
                        </form>
                    </div>
                </div>
            `;

            this.setupScheduleForm();
        } catch (error) {
            console.error('Schedule error:', error);
            // Show basic form even if no existing schedule
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Đăng Ký Lịch Làm</h2>
                    </div>
                    <div class="card-body">
                        <form id="scheduleForm">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Ca làm</th>
                                        <th>Giờ vào</th>
                                        <th>Giờ ra</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateScheduleRows([])}
                                </tbody>
                            </table>
                            <button type="submit" class="btn btn-primary">Lưu lịch làm việc</button>
                        </form>
                    </div>
                </div>
            `;
            this.setupScheduleForm();
        }
    }

    generateScheduleRows(schedule = []) {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        return days.map(day => `
            <tr>
                <td>${day}</td>
                <td>
                    <select name="shift_${day}" class="form-control">
                        <option value="">Chọn ca</option>
                        <option value="morning">Ca sáng</option>
                        <option value="afternoon">Ca chiều</option>
                        <option value="evening">Ca tối</option>
                    </select>
                </td>
                <td>
                    <input type="time" name="start_${day}" class="form-control">
                </td>
                <td>
                    <input type="time" name="end_${day}" class="form-control">
                </td>
            </tr>
        `).join('');
    }

    setupScheduleForm() {
        document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const scheduleData = Object.fromEntries(formData);
                
                // Convert form data to the format expected by savedk API
                const shifts = [];
                const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                
                days.forEach(day => {
                    const start = scheduleData[`start_${day}`];
                    const end = scheduleData[`end_${day}`];
                    if (start && end) {
                        const startHour = parseInt(start.split(':')[0]);
                        const endHour = parseInt(end.split(':')[0]);
                        if (endHour > startHour) {
                            shifts.push({
                                day: day,
                                start: startHour,
                                end: endHour
                            });
                        }
                    }
                });

                if (shifts.length === 0) {
                    utils.showNotification("Vui lòng chọn ít nhất một ca làm việc", "warning");
                    return;
                }

                await utils.fetchAPI('?action=savedk', {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
                        shifts: shifts
                    })
                });
                
                utils.showNotification("Lịch làm việc đã được lưu", "success");
            } catch (error) {
                console.error('Save schedule error:', error);
                utils.showNotification("Không thể lưu lịch làm việc", "error");
            }
        });
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
                
                // For now, use sendMessage API to send the task as a message
                await utils.fetchAPI('?action=sendMessage', {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
                        fullName: this.user.fullName || 'Nhân viên',
                        position: this.user.position || 'NV',
                        message: `[YÊU CẦU] ${taskData.taskType}: ${taskData.content}`
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

    async showScheduleWork() {
        const content = document.getElementById('content');
        try {
            // Use getUsers to get employee list
            const employees = await utils.fetchAPI('?action=getUsers');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xếp Lịch Làm Việc</h2>
                    </div>
                    <div class="card-body">
                        <div class="schedule-filters">
                            <select id="employeeFilter" class="form-control">
                                <option value="">Tất cả nhân viên</option>
                                ${Array.isArray(employees) ? employees.map(emp => 
                                    `<option value="${emp.employeeId}">${emp.fullName} - ${emp.employeeId}</option>`
                                ).join('') : ''}
                            </select>
                            <select id="weekFilter" class="form-control">
                                <option value="current">Tuần hiện tại</option>
                                <option value="next">Tuần tới</option>
                            </select>
                        </div>
                        <div id="scheduleTable" class="schedule-table">
                            <p>Chọn nhân viên để xem lịch làm việc</p>
                        </div>
                        <button id="saveScheduleChanges" class="btn btn-primary">Lưu thay đổi</button>
                    </div>
                </div>
            `;

            this.setupScheduleWorkHandlers();
        } catch (error) {
            console.error('Schedule work error:', error);
            utils.showNotification("Không thể tải danh sách nhân viên", "error");
        }
    }

    async showOfficialSchedule() {
        const content = document.getElementById('content');
        try {
            // Use checkdk API to get official schedule
            const response = await utils.fetchAPI(`?action=checkdk&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Lịch Làm Việc Chính Thức</h2>
                    </div>
                    <div class="card-body">
                        <div class="schedule-view">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Ca làm</th>
                                        <th>Giờ vào</th>
                                        <th>Giờ ra</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateOfficialScheduleRows(response.shifts || [])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Official schedule error:', error);
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Lịch Làm Việc Chính Thức</h2>
                    </div>
                    <div class="card-body">
                        <p>Chưa có lịch làm việc được đăng ký. Vui lòng đăng ký lịch làm việc trước.</p>
                    </div>
                </div>
            `;
        }
    }

    async showTaskPersonnel() {
        const content = document.getElementById('content');
        try {
            // Load task data for dashboard
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const messages = await utils.fetchAPI(`?action=getMessages&token=${token}`);
            
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
                            <p>Chức năng xử lý yêu cầu nhân sự. Hiện tại hệ thống có ${Array.isArray(messages) ? messages.length : 0} tin nhắn chưa xử lý.</p>
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
            // Use getUsers API to get user list
            const users = await utils.fetchAPI('?action=getUsers');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Phân Quyền Người Dùng</h2>
                    </div>
                    <div class="card-body">
                        <div class="permission-management">
                            <div class="user-selection">
                                <select id="userSelect" class="form-control">
                                    <option value="">Chọn nhân viên</option>
                                    ${Array.isArray(users) ? users.map(user => 
                                        `<option value="${user.employeeId}">${user.fullName} - ${user.employeeId}</option>`
                                    ).join('') : ''}
                                </select>
                            </div>
                            
                            <div id="permissionForm" class="permission-form" style="display: none;">
                                <h3>Quyền hạn</h3>
                                <div class="permission-list">
                                    <label class="permission-item">
                                        <input type="checkbox" name="schedule" value="schedule">
                                        <span>Quản lý lịch làm</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="tasks" value="tasks">
                                        <span>Xử lý yêu cầu</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="rewards" value="rewards">
                                        <span>Quản lý thưởng/phạt</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="admin" value="admin">
                                        <span>Quyền quản trị</span>
                                    </label>
                                </div>
                                <button id="savePermissions" class="btn btn-primary">Lưu quyền hạn</button>
                                <p class="permission-note">⏳ Chức năng phân quyền đang được phát triển</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupAccessHandlers();
        } catch (error) {
            console.error('Access management error:', error);
            utils.showNotification("Không thể tải thông tin phân quyền", "error");
        }
    }

    async showPersonalInfo() {
        const content = document.getElementById('content');
        try {
            // Use getUser API to get personal information
            const response = await utils.fetchAPI(`?action=getUser&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Thông Tin Cá Nhân</h2>
                        <p class="card-subtitle">Bạn chỉ có thể cập nhật Email và Số điện thoại. Các thông tin khác cần gửi yêu cầu để được duyệt.</p>
                    </div>
                    <div class="card-body">
                        <form id="personalInfoForm" class="personal-info-form">
                            <div class="form-group">
                                <label>Mã nhân viên</label>
                                <input type="text" name="employeeId" class="form-control readonly-field" value="${response.employeeId || ''}" readonly>
                                <small class="field-note">Không thể thay đổi</small>
                            </div>
                            <div class="form-group">
                                <label>Họ và tên</label>
                                <input type="text" name="fullName" class="form-control request-field" value="${response.fullName || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="fullName">Gửi yêu cầu thay đổi</button>
                            </div>
                            <div class="form-group editable-field">
                                <label>Email <span class="editable-badge">Có thể chỉnh sửa</span></label>
                                <input type="email" name="email" class="form-control" value="${response.email || ''}" required>
                            </div>
                            <div class="form-group editable-field">
                                <label>Số điện thoại <span class="editable-badge">Có thể chỉnh sửa</span></label>
                                <input type="tel" name="phone" class="form-control" value="${response.phone || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Chức vụ</label>
                                <input type="text" name="position" class="form-control request-field" value="${response.position || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="position">Gửi yêu cầu thay đổi</button>
                            </div>
                            <div class="form-group">
                                <label>Cửa hàng</label>
                                <input type="text" name="storeName" class="form-control request-field" value="${response.storeName || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="storeName">Gửi yêu cầu thay đổi</button>
                            </div>
                            <div class="form-group">
                                <label>Ngày gia nhập</label>
                                <input type="text" name="joinDate" class="form-control request-field" value="${response.joinDate || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="joinDate">Gửi yêu cầu thay đổi</button>
                            </div>
                            
                            <div class="password-confirmation-section" style="display: none;">
                                <hr>
                                <h3>Xác nhận mật khẩu để cập nhật</h3>
                                <div class="form-group">
                                    <label>Nhập mật khẩu hiện tại</label>
                                    <input type="password" id="confirmPassword" class="form-control" required>
                                    <small class="text-danger">Bắt buộc nhập mật khẩu để xác nhận thay đổi</small>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" disabled>
                                    <span class="btn-text">Cập nhật thông tin</span>
                                    <span class="btn-loader"></span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset(); this.updateButtonState()">Hoàn tác</button>
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
                                    <label id="changeFieldLabel">Trường cần thay đổi</label>
                                    <input type="text" id="currentValue" class="form-control" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Giá trị mới</label>
                                    <input type="text" id="newValue" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>Lý do thay đổi</label>
                                    <textarea id="changeReason" class="form-control" rows="3" required placeholder="Vui lòng nêu rõ lý do cần thay đổi thông tin này..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="closeChangeRequestModal()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Gửi yêu cầu</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            this.setupPersonalInfoHandlers();
        } catch (error) {
            console.error('Personal info error:', error);
            utils.showNotification("Không thể tải thông tin cá nhân", "error");
        }
    }

    // Helper functions for the above methods
    generateScheduleTable(schedules = []) {
        if (!schedules.length) return '<p>Không có lịch làm việc nào.</p>';
        
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Ngày</th>
                        <th>Ca làm</th>
                        <th>Giờ vào</th>
                        <th>Giờ ra</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedules.map(schedule => `
                        <tr data-schedule-id="${schedule.id}">
                            <td>${schedule.employeeName}</td>
                            <td>${utils.formatDate(schedule.date)}</td>
                            <td>${schedule.shift}</td>
                            <td>${schedule.startTime}</td>
                            <td>${schedule.endTime}</td>
                            <td>
                                <button class="btn btn-sm btn-edit" onclick="editSchedule('${schedule.id}')">Sửa</button>
                                <button class="btn btn-sm btn-delete" onclick="deleteSchedule('${schedule.id}')">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    generateOfficialScheduleRows(shifts = []) {
        if (!Array.isArray(shifts) || shifts.length === 0) {
            return '<tr><td colspan="5">Không có lịch làm việc.</td></tr>';
        }
        
        return shifts.map(shift => {
            // Extract time from format like "08:00-17:00"
            const timeRange = shift.time && shift.time !== 'Off' ? shift.time.split('-') : ['', ''];
            const startTime = timeRange[0] || '';
            const endTime = timeRange[1] || '';
            
            return `
                <tr>
                    <td>${shift.day || ''}</td>
                    <td>${shift.time === 'Off' ? 'Nghỉ' : (startTime && endTime ? 'Ca làm' : 'Chưa xác định')}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td><span class="status confirmed">Đã xác nhận</span></td>
                </tr>
            `;
        }).join('');
    }

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
    setupScheduleWorkHandlers() {
        document.getElementById('saveScheduleChanges')?.addEventListener('click', async () => {
            try {
                // Implementation for saving schedule changes
                await utils.fetchAPI('?action=saveScheduleChanges', {
                    method: 'POST',
                    body: JSON.stringify({ scheduleData: 'data' })
                });
                utils.showNotification("Lịch làm việc đã được cập nhật", "success");
            } catch (error) {
                utils.showNotification("Không thể lưu thay đổi", "error");
            }
        });
    }

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

            await this.loadStoresForFilter();
            await this.loadPendingRegistrations();
            this.setupEnhancedRegistrationApprovalHandlers();
        } catch (error) {
            console.error('Registration approval error:', error);
            utils.showNotification("Không thể tải danh sách đăng ký", "error");
        }
    }

    async loadStoresForFilter() {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const response = await utils.fetchAPI(`?action=getStores&token=${token}`);
            console.log('Stores API response:', response);
            
            let stores = [];
            if (Array.isArray(response)) {
                stores = response;
            } else if (response && typeof response === 'object') {
                // Handle object format with numeric keys
                const keys = Object.keys(response).filter(key => !isNaN(key) && key !== 'timestamp' && key !== 'status');
                if (keys.length > 0) {
                    stores = keys.map(key => response[key]).filter(item => item && typeof item === 'object');
                } else if (response.data && Array.isArray(response.data)) {
                    stores = response.data;
                }
            }
            
            console.log('Parsed stores:', stores);
            const storeFilter = document.getElementById('storeFilterSelect');
            if (storeFilter && stores.length > 0) {
                storeFilter.innerHTML = '<option value="">Tất cả cửa hàng</option>' +
                    stores.map(store => `<option value="${store.storeName || store.name || store.storeId}">${store.storeName || store.name || store.storeId}</option>`).join('');
                console.log('✅ Store filter updated with', stores.length, 'stores');
            } else {
                console.log('⚠️ No stores found or storeFilter element missing');
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
                            <span class="store-badge">${reg.storeName || reg.storeId || 'N/A'}</span>
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
                    ` : ''}
                </div>
            </div>
        `).join('');

        this.updatePaginationControls();
    }
    
    getStatusText(status) {
        const statusMap = {
            'Wait': 'Chờ duyệt',
            'Approved': 'Đã duyệt', 
            'Rejected': 'Từ chối'
        };
        return statusMap[status] || status || 'Chờ duyệt';
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
                            <span class="label">Cửa hàng:</span>
                            <span class="value">${registration.storeName || registration.storeId || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Mã cửa hàng:</span>
                            <span class="value">${registration.storeId || 'N/A'}</span>
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
            case 'pending': return '⏳ Chờ duyệt';
            case 'approved': return '✅ Đã duyệt';
            case 'rejected': return '❌ Đã từ chối';
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

// Theme Manager - Single Instance
class ThemeManager {
    static initialize() {
        const themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;

        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update icon based on current theme
        const icon = themeSwitch.querySelector('.material-icons-round');
        if (icon) {
            icon.textContent = savedTheme === 'light' ? 'dark_mode' : 'light_mode';
        }

        themeSwitch.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
            
            if (icon) {
                icon.textContent = newTheme === 'light' ? 'dark_mode' : 'light_mode';
            }
        });
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
            const user = await utils.fetchAPI(`?action=getUser&employeeId=${this.userData.loginEmployeeId}`);
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
    console.log('🌟 DOM Content Loaded - Starting application initialization');
    
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
    const user = await authManager.checkAuthentication();

    if (user) {
        authManager.setupLogoutHandler();
        MenuManager.setupMenuInteractions();
        ThemeManager.initialize();

        // Initialize features
        new ContentManager(user);

        // Load dashboard stats immediately when page loads
        console.log('🔄 Loading dashboard stats on page load...');
        await getDashboardStats();
        
        // Ensure stats-grid is visible and updated
        await updateStatsGrid();

        // Apply role-based section visibility
        await applyRoleBasedSectionVisibility();

        // Initialize enhanced dashboard
        await initializeEnhancedDashboard();

        // Mobile optimization
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector(".sidebar");
            document.addEventListener("click", (e) => {
                if (!sidebar.contains(e.target) && 
                    !e.target.closest(".menu-toggle")) {
                    sidebar.classList.remove("active");
                }
            });
        }
    }
});

// Enhanced Dashboard Stats Initialization - Using unified dashboard API
async function getDashboardStats() {
    console.log('🔄 Starting dashboard stats initialization...');
    
    // First, ensure the welcome section and stats-grid are visible
    const welcomeSection = document.querySelector('.welcome-section');
    const statsGrid = document.querySelector('.stats-grid');
    const content = document.getElementById('content');
    
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        console.log('✅ Welcome section made visible');
    } else {
        console.warn('⚠️ Welcome section not found in DOM');
    }
    
    if (statsGrid) {
        statsGrid.style.display = 'grid';
        console.log('✅ Stats grid made visible');
    } else {
        console.warn('⚠️ Stats grid not found in DOM');
    }
    
    if (content) {
        content.style.display = 'block';
        console.log('✅ Content section made visible');
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
            console.log('✅ Valid stats response received, updating elements...');
            
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
            
            console.log('✅ All dashboard stats updated successfully');
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
        console.log('✅ Stats-grid made visible');
        
        // Ensure all stat cards are visible
        const statCards = statsGrid.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.display = 'block';
            console.log(`✅ Stat card ${index + 1} made visible`);
        });
    } else {
        console.warn('⚠️ Stats-grid not found in DOM');
    }
    
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        welcomeSection.style.visibility = 'visible';
        console.log('✅ Welcome section made visible');
    }
    
    // Force a re-layout
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log('✅ Stats-grid update complete');
}

// Initialize Recent Activities - Display static sample data instead of API call
async function initializeRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;

    try {
        // Use sample data instead of API call (removed old chat function)
        const sampleActivities = [
            {
                employeeName: "Admin System",
                time: new Date().toISOString(),
                action: "Hệ thống đã được khởi tạo thành công"
            },
            {
                employeeName: "HR Manager", 
                time: new Date(Date.now() - 3600000).toISOString(),
                action: "Cập nhật chính sách nhân sự"
            },
            {
                employeeName: "Store Manager",
                time: new Date(Date.now() - 7200000).toISOString(), 
                action: "Phê duyệt lịch làm việc tháng mới"
            }
        ];
        
        container.innerHTML = sampleActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-avatar">${activity.employeeName?.substring(0, 2) || 'NV'}</div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-author">${activity.employeeName || 'Nhân viên'}</span>
                        <span class="activity-time">${utils.formatDate(activity.time)}</span>
                    </div>
                    <div class="activity-message">${activity.action}</div>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Recent activities initialized with sample data');
    } catch (error) {
        console.error('Error loading recent activities:', error);
        container.innerHTML = '<p class="loading-text">Không thể tải hoạt động</p>';
    }
}

// Role-based UI Management  
function initializeRoleBasedUI() {
    const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    const userPosition = loggedInUser.position || 'NV';
    
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
                console.log(`✅ AD Element shown: ${element.className} - ${element.tagName}`);
            }
        } else {
            element.classList.remove('role-visible');
            element.style.display = 'none';
        }
    });
    
    if (userPosition === 'AD') {
        console.log(`🔍 AD Role Summary: Found ${adElementsFound} AD elements, Shown ${adElementsShown} elements`);
        
        // Additional verification for all AD-specific sections
        const adSections = [
            '.quick-actions-section',
            '.analytics-section', 
            '.finance-section',
            '.registration-approval-section',
            '.store-management-section'
        ];
        
        adSections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                console.log(`✅ AD Section forced visible: ${selector}`);
            } else {
                console.warn(`⚠️ AD Section not found: ${selector}`);
            }
        });
    }
    
    console.log(`✅ Role UI initialized for position: ${userPosition}`);
}

// Apply role-based section visibility for welcome-section without data-role attributes
async function applyRoleBasedSectionVisibility() {
    const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    let userRole = loggedInUser.position || 'NV';
    
    // Get fresh user data from API to ensure accurate role
    try {
        if (loggedInUser.employeeId) {
            const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${loggedInUser.employeeId}`);
            if (freshUserData && freshUserData.position) {
                userRole = freshUserData.position;
                console.log('🔐 Using fresh role from API for section visibility:', userRole);
            }
        }
    } catch (error) {
        console.warn('⚠️ Using cached role for section visibility due to API error:', error);
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
    
    const roleConfig = sectionVisibility[userRole] || sectionVisibility['NV'];
    
    // Apply visibility settings
    Object.entries(roleConfig).forEach(([selector, isVisible]) => {
        const section = document.querySelector(selector);
        if (section) {
            if (isVisible) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.classList.remove('role-hidden');
                console.log(`✅ Section visible for ${userRole}: ${selector}`);
            } else {
                section.style.display = 'none';
                section.style.visibility = 'hidden';
                section.classList.add('role-hidden');
                console.log(`❌ Section hidden for ${userRole}: ${selector}`);
            }
        } else {
            console.warn(`⚠️ Section not found: ${selector}`);
        }
    });
    
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
                console.log(`✅ Quick action visible for ${userRole}: ${action}`);
            } else {
                btn.style.display = 'none';
                btn.style.visibility = 'hidden';
                console.log(`❌ Quick action hidden for ${userRole}: ${action}`);
            }
        });
    }
    
    console.log(`✅ Role-based section visibility applied for: ${userRole}`);
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
        if (!loggedInUser.employeeId) return;

        // Get fresh user data from API
        const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${loggedInUser.employeeId}`);
        if (freshUserData && freshUserData.position) {
            console.log('🔄 Refreshing role permissions for:', freshUserData.position);
            
            // Update role-based UI with fresh data
            initializeRoleBasedUI();
            MenuManager.updateMenuByRole(freshUserData.position);
            
            // Verify AD functions are visible if user is AD
            if (freshUserData.position === 'AD') {
                setTimeout(() => {
                    const adElements = document.querySelectorAll('[data-role*="AD"]');
                    const visibleADElements = Array.from(adElements).filter(el => 
                        el.style.display !== 'none' && !el.classList.contains('role-hidden')
                    );
                    console.log('✅ AD functions check - Total:', adElements.length, 'Visible:', visibleADElements.length);
                    
                    if (visibleADElements.length < adElements.length) {
                        console.warn('⚠️ Re-applying AD permissions...');
                        initializeRoleBasedUI();
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
        const response = await utils.fetchAPI(`?action=checkdk&employeeId=${userInfo.employeeId}`);
        
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
        const rewards = await utils.fetchAPI(`?action=getRewards&employeeId=${userInfo.employeeId}&limit=5&token=${token}`);
        
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

// Enhanced Mobile Menu Setup
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Function to ensure dashboard content is visible
function showDashboardContent() {
    console.log('📱 Ensuring dashboard content is visible...');
    
    const content = document.getElementById('content');
    const welcomeSection = document.querySelector('.welcome-section');
    const statsGrid = document.querySelector('.stats-grid');
    
    // Make sure main content is visible
    if (content) {
        content.style.display = 'block';
        content.style.visibility = 'visible';
        console.log('✅ Main content made visible');
    }
    
    // Make sure welcome section is visible
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        welcomeSection.style.visibility = 'visible';
        console.log('✅ Welcome section made visible');
    }
    
    // Make sure stats grid is visible
    if (statsGrid) {
        statsGrid.style.display = 'grid';
        statsGrid.style.visibility = 'visible';
        console.log('✅ Stats grid made visible');
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

// Enhanced Dashboard Initialization
async function initializeEnhancedDashboard() {
    try {
        console.log('🚀 Enhanced dashboard initialization started');
        
        // First ensure content is visible
        showDashboardContent();
        
        // Get fresh user data from API instead of localStorage
        const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        if (!loggedInUser.employeeId) {
            console.error('No employee ID found in localStorage');
            return;
        }

        console.log('🚀 Initializing enhanced dashboard for employee:', loggedInUser.employeeId);
        
        // Fetch fresh user data from API
        const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${loggedInUser.employeeId}`);
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
        await initializeRecentActivities();
        
        // Initialize role-based UI and menu visibility with fresh API data
        console.log('🔐 Setting up role-based UI with fresh data...');
        initializeRoleBasedUI();
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
                console.log('✅ AD visibility verification:', {
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
        setupMobileMenu();
        // Theme switching is handled by ThemeManager.initialize()
        
        utils.showNotification('Dashboard đã được tải thành công', 'success');
        console.log('✅ Dashboard initialization complete for role:', userPosition);
    } catch (error) {
        console.error('Failed to initialize enhanced dashboard:', error);
        utils.showNotification('Có lỗi khi tải dashboard', 'error');
    }
}

// Enhanced polling system - only refresh when there are actual changes
let lastActivityHash = null;
let lastUserDataHash = null;

async function checkForChanges() {
    try {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        if (!token || !loggedInUser.employeeId) return false;
        
        // Check for activity changes (simplified hash check)
        const activitiesResponse = await fetch(`${CONFIG.API_URL}?action=getRecentActivities&token=${token}`);
        const userData = await fetch(`${CONFIG.API_URL}?action=getUser&employeeId=${loggedInUser.employeeId}&token=${token}`);
        
        if (activitiesResponse.ok && userData.ok) {
            const activities = await activitiesResponse.json();
            const user = await userData.json();
            
            // Create simple hash of important data
            const currentActivityHash = JSON.stringify(activities).length;
            const currentUserHash = JSON.stringify(user.position + user.status).length;
            
            // Check if anything changed
            const activitiesChanged = lastActivityHash !== null && lastActivityHash !== currentActivityHash;
            const userDataChanged = lastUserDataHash !== null && lastUserDataHash !== currentUserHash;
            
            // Update stored hashes
            lastActivityHash = currentActivityHash;
            lastUserDataHash = currentUserHash;
            
            return activitiesChanged || userDataChanged;
        }
    } catch (error) {
        console.log('⚠️ Change detection failed:', error.message);
    }
    return false;
}

// Smart polling system - only refresh when changes detected
setInterval(async () => {
    const hasChanges = await checkForChanges();
    
    if (hasChanges) {
        console.log('🔄 Changes detected - refreshing data...');
        
        // Only refresh recent activities, not dashboard stats  
        await initializeRecentActivities();
        
        // Re-initialize role-based UI to ensure AD functions remain visible using fresh API data
        await refreshUserRoleAndPermissions();
        
        console.log('✅ Auto-refresh completed (changes detected)');
    } else {
        console.log('📊 No changes detected - skipping refresh');
    }
}, 30000);

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
            if (loggedInUser.employeeId) {
                const freshUserData = await utils.fetchAPI(`?action=getUser&employeeId=${loggedInUser.employeeId}`);
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
        
        console.log('✅ Welcome section built specifically for role:', userRole);
        
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
    
    console.log('✅ Dashboard content built for role:', userRole);
    return content;
}
