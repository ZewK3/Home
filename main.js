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
    }

    // Schedule Management Functions
    async showScheduleRegistration() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI(`?action=getSchedule&employeeId=${this.user.employeeId}`);
            
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
                                    ${this.generateScheduleRows(response.schedule)}
                                </tbody>
                            </table>
                            <button type="submit" class="btn btn-primary">Lưu lịch làm việc</button>
                        </form>
                    </div>
                </div>
            `;

            this.setupScheduleForm();
        } catch (error) {
            utils.showNotification("Không thể tải lịch làm việc", "error");
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
                await utils.fetchAPI('?action=saveSchedule', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                utils.showNotification("Lịch làm việc đã được lưu", "success");
            } catch (error) {
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
                await utils.fetchAPI('?action=submitTask', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                utils.showNotification("Yêu cầu đã được gửi", "success");
            } catch (error) {
                utils.showNotification("Không thể gửi yêu cầu", "error");
            }
        });
    }

    async showScheduleWork() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getAllSchedules');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xếp Lịch Làm Việc</h2>
                    </div>
                    <div class="card-body">
                        <div class="schedule-filters">
                            <select id="employeeFilter" class="form-control">
                                <option value="">Tất cả nhân viên</option>
                                ${response.employees?.map(emp => 
                                    `<option value="${emp.employeeId}">${emp.fullName} - ${emp.employeeId}</option>`
                                ).join('') || ''}
                            </select>
                            <select id="weekFilter" class="form-control">
                                <option value="current">Tuần hiện tại</option>
                                <option value="next">Tuần tới</option>
                            </select>
                        </div>
                        <div id="scheduleTable" class="schedule-table">
                            ${this.generateScheduleTable(response.schedules)}
                        </div>
                        <button id="saveScheduleChanges" class="btn btn-primary">Lưu thay đổi</button>
                    </div>
                </div>
            `;

            this.setupScheduleWorkHandlers();
        } catch (error) {
            utils.showNotification("Không thể tải lịch làm việc", "error");
        }
    }

    async showOfficialSchedule() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI(`?action=getOfficialSchedule&employeeId=${this.user.employeeId}`);
            
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
                                    ${this.generateOfficialScheduleRows(response.schedule)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            utils.showNotification("Không thể tải lịch chính thức", "error");
        }
    }

    async showTaskPersonnel() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getPersonnelTasks');
            
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
                            ${this.generateTaskList(response.tasks, 'personnel')}
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('personnel');
        } catch (error) {
            utils.showNotification("Không thể tải yêu cầu nhân sự", "error");
        }
    }

    async showTaskStore() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getStoreTasks');
            
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
                            ${this.generateTaskList(response.tasks, 'store')}
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('store');
        } catch (error) {
            utils.showNotification("Không thể tải yêu cầu cửa hàng", "error");
        }
    }

    async showTaskFinance() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getFinanceTasks');
            
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
                            ${this.generateTaskList(response.tasks, 'finance')}
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('finance');
        } catch (error) {
            utils.showNotification("Không thể tải yêu cầu tài chính", "error");
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
            const response = await utils.fetchAPI('?action=getRewards');
            
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
                                    ${response.employees?.map(emp => 
                                        `<option value="${emp.employeeId}">${emp.fullName} - ${emp.employeeId}</option>`
                                    ).join('') || ''}
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
                            ${this.generateRewardHistory(response.rewards)}
                        </div>
                    </div>
                </div>
            `;

            this.setupRewardHandlers();
        } catch (error) {
            utils.showNotification("Không thể tải thông tin thưởng/phạt", "error");
        }
    }

    async showGrantAccess() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getUserPermissions');
            
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
                                    ${response.users?.map(user => 
                                        `<option value="${user.employeeId}">${user.fullName} - ${user.employeeId}</option>`
                                    ).join('') || ''}
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
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupAccessHandlers();
        } catch (error) {
            utils.showNotification("Không thể tải thông tin phân quyền", "error");
        }
    }

    async showPersonalInfo() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI(`?action=getUserInfo&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Thông Tin Cá Nhân</h2>
                    </div>
                    <div class="card-body">
                        <form id="personalInfoForm" class="personal-info-form">
                            <div class="form-group">
                                <label>Mã nhân viên</label>
                                <input type="text" name="employeeId" class="form-control" value="${response.employeeId || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label>Họ và tên</label>
                                <input type="text" name="fullName" class="form-control" value="${response.fullName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" class="form-control" value="${response.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Số điện thoại</label>
                                <input type="tel" name="phone" class="form-control" value="${response.phone || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Chức vụ</label>
                                <input type="text" name="position" class="form-control" value="${response.position || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label>Mật khẩu mới (để trống nếu không thay đổi)</label>
                                <input type="password" name="newPassword" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-primary">Cập nhật thông tin</button>
                        </form>
                    </div>
                </div>
            `;

            this.setupPersonalInfoHandlers();
        } catch (error) {
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

    generateOfficialScheduleRows(schedule = []) {
        if (!schedule.length) return '<tr><td colspan="5">Không có lịch làm việc.</td></tr>';
        
        return schedule.map(item => `
            <tr>
                <td>${utils.formatDate(item.date)}</td>
                <td>${item.shift}</td>
                <td>${item.startTime}</td>
                <td>${item.endTime}</td>
                <td><span class="status ${item.status}">${item.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}</span></td>
            </tr>
        `).join('');
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
                    const permissions = await utils.fetchAPI(`?action=getUserPermissions&employeeId=${employeeId}`);
                    document.getElementById('permissionForm').style.display = 'block';
                    
                    // Set current permissions
                    Object.keys(permissions).forEach(permission => {
                        const checkbox = document.querySelector(`input[name="${permission}"]`);
                        if (checkbox) checkbox.checked = permissions[permission];
                    });
                } catch (error) {
                    utils.showNotification("Không thể tải quyền hạn", "error");
                }
            } else {
                document.getElementById('permissionForm').style.display = 'none';
            }
        });

        document.getElementById('savePermissions')?.addEventListener('click', async () => {
            try {
                const employeeId = document.getElementById('userSelect').value;
                const permissions = {};
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    permissions[checkbox.name] = checkbox.checked;
                });

                await utils.fetchAPI('?action=updatePermissions', {
                    method: 'POST',
                    body: JSON.stringify({ employeeId, permissions })
                });
                utils.showNotification("Đã cập nhật quyền hạn", "success");
            } catch (error) {
                utils.showNotification("Không thể cập nhật quyền hạn", "error");
            }
        });
    }

    setupPersonalInfoHandlers() {
        document.getElementById('personalInfoForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                await utils.fetchAPI('?action=updatePersonalInfo', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                utils.showNotification("Đã cập nhật thông tin cá nhân", "success");
            } catch (error) {
                utils.showNotification("Không thể cập nhật thông tin", "error");
            }
        });
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
        // Close all submenus initially
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.style.display = 'none';
        });

        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Close all other submenus
                    document.querySelectorAll('.submenu').forEach(other => {
                        if (other !== submenu) {
                            other.style.display = 'none';
                        }
                    });
                    // Toggle current submenu
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                });
            }
        });

        // Close submenu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.submenu').forEach(submenu => {
                    submenu.style.display = 'none';
                });
            }
        });
    }
}

// Chat Manager
class ChatManager {
    constructor(user) {
        this.user = user;
        this.lastMessageId = 0;
        
        this.elements = {
            openButton: document.getElementById("openChatButton"),
            popup: document.getElementById("chatPopup"),
            messages: document.getElementById("chatMessages"),
            input: document.getElementById("messageInput"),
            sendButton: document.getElementById("sendButton")
        };

        this.initialize();
    }

    initialize() {
        if (!this.elements.openButton || !this.elements.popup) return;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.openButton.addEventListener("click", () => this.toggleChat());
        this.elements.sendButton?.addEventListener("click", () => this.sendMessage());
        this.elements.input?.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        const isVisible = this.elements.popup.style.display === "flex";
        this.elements.popup.style.display = isVisible ? "none" : "flex";
        
        if (!isVisible) {
            this.elements.input?.focus();
            this.loadMessages();
        }
    }

    async sendMessage() {
        const message = this.elements.input?.value.trim();
        if (!message) return;

        try {
            await utils.fetchAPI('?action=sendMessage', {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    employeeId: this.user.employeeId
                })
            });

            this.elements.input.value = "";
            this.appendMessage({
                message,
                sender: this.user.fullName,
                time: new Date()
            });
        } catch (error) {
            utils.showNotification("Không thể gửi tin nhắn", "error");
        }
    }

    async loadMessages() {
        try {
            const messages = await utils.fetchAPI('?action=getMessages');
            this.elements.messages.innerHTML = '';
            messages.forEach(msg => this.appendMessage(msg));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }

    appendMessage(msg) {
        const messageEl = document.createElement("div");
        messageEl.className = `message ${msg.sender === this.user.fullName ? 'user-message' : 'other-message'}`;
        messageEl.innerHTML = `
            <div class="message-content">${utils.escapeHtml(msg.message)}</div>
            <div class="message-info">
                <span class="message-sender">${utils.escapeHtml(msg.sender)}</span>
                <span class="message-time">${utils.formatDate(msg.time)}</span>
            </div>
        `;
        this.elements.messages.appendChild(messageEl);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
}

// Theme Manager
class ThemeManager {
    static initialize() {
        const themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;

        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeSwitch.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
            
            const icon = themeSwitch.querySelector('.material-icons-round');
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
(async () => {
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
        new ChatManager(user);
        new ContentManager(user);

        // Initialize dashboard stats
        await initializeDashboardStats();

        // Mobile menu functionality
        setupMobileMenu();

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
})();

// Dashboard Stats Initialization - Fixed with null checks
async function initializeDashboardStats() {
    const elements = {
        totalEmployees: document.getElementById('totalEmployees'),
        todaySchedule: document.getElementById('todaySchedule'), 
        pendingRequests: document.getElementById('pendingRequests'),
        systemStatus: document.getElementById('systemStatus')
    };

    try {
        // Update total employees
        const employees = await utils.fetchAPI('?action=getUsers');
        if (elements.totalEmployees) {
            elements.totalEmployees.textContent = employees.length || '0';
        }

        // Update today's schedule count
        const schedules = await utils.fetchAPI('?action=getTodaySchedule');
        if (elements.todaySchedule) {
            elements.todaySchedule.textContent = schedules.length || '0';
        }

        // Update pending requests
        const pendingRequests = await utils.fetchAPI('?action=getPendingRequests');
        if (elements.pendingRequests) {
            elements.pendingRequests.textContent = pendingRequests.length || '0';
        }

        // System status is always online in this context
        if (elements.systemStatus) {
            elements.systemStatus.textContent = 'Hoạt động';
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set fallback values only if elements exist
        if (elements.totalEmployees) elements.totalEmployees.textContent = '-';
        if (elements.todaySchedule) elements.todaySchedule.textContent = '-';
        if (elements.pendingRequests) elements.pendingRequests.textContent = '-';
        if (elements.systemStatus) elements.systemStatus.textContent = 'Offline';
    }
}

// Mobile Menu Setup
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
