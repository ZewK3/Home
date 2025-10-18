/**
 * Dashboard Content Renderer
 * Provides comprehensive content templates with API integration
 */

const DashboardContent = {
    /**
     * Initialize content renderer
     */
    async init() {
        this.userData = this.getUserData();
        this.employeeId = this.userData?.employeeId || null;
    },

    getUserData() {
        const data = localStorage.getItem('userData');
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse user data:', e);
            return null;
        }
    },

    /**
     * Home Dashboard with Stats
     */
    async renderHome() {
        const content = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="totalEmployees">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Nhân viên</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="todayShift">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Ca hôm nay</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="pendingTasks">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Công việc</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="newMessages">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Tin nhắn</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">bolt</span>
                        Thao tác nhanh
                    </h2>
                </div>
                <div class="card-body">
                    <button class="btn btn-primary btn-full mb-md" onclick="navigateToFunction('attendance')">
                        <span class="material-icons-round">check_circle</span>
                        Chấm công
                    </button>
                    <button class="btn btn-secondary btn-full mb-md" onclick="navigateToFunction('submit-request')">
                        <span class="material-icons-round">request_page</span>
                        Gửi yêu cầu
                    </button>
                    <button class="btn btn-secondary btn-full" onclick="navigateToFunction('schedule')">
                        <span class="material-icons-round">schedule</span>
                        Xem ca làm việc
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">history</span>
                        Hoạt động gần đây
                    </h2>
                </div>
                <div class="card-body">
                    <div id="recentActivities">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        // Load stats data
        this.loadHomeStats();

        return content;
    },

    async loadHomeStats() {
        // Load employee count
        const empData = await DashboardAPI.getEmployeeCount();
        if (empData) {
            document.getElementById('totalEmployees').textContent = empData.count || '0';
        }

        // Load today's shift
        const shiftData = await DashboardAPI.getTodayShift();
        if (shiftData) {
            document.getElementById('todayShift').textContent = `${shiftData.present || 0}/${shiftData.total || 0}`;
        }

        // Load pending tasks
        const tasksData = await DashboardAPI.getPendingTasks();
        if (tasksData) {
            document.getElementById('pendingTasks').textContent = tasksData.count || '0';
        }

        // Load messages
        const msgData = await DashboardAPI.getRecentMessagesCount();
        if (msgData) {
            document.getElementById('newMessages').textContent = msgData.count || '0';
        }
    },

    /**
     * Work Schedule
     */
    async renderSchedule() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">calendar_month</span>
                        Lịch làm việc tháng ${month}/${year}
                    </h2>
                </div>
                <div class="card-body">
                    <div id="scheduleList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        // Load shift assignments
        setTimeout(() => this.loadShiftAssignments(month, year), 100);

        return content;
    },

    async loadShiftAssignments(month, year) {
        const container = document.getElementById('scheduleList');
        if (!container) return;

        const shifts = await DashboardAPI.getShiftAssignments(this.employeeId, month, year);
        
        if (!shifts || shifts.length === 0) {
            container.innerHTML = '<div class="message">Không có lịch làm việc</div>';
            return;
        }

        let html = '<div class="list">';
        shifts.forEach(shift => {
            const date = new Date(shift.date);
            const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' });
            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${dayName}, ${shift.date}</div>
                        <div class="list-item-subtitle">${shift.shiftName}: ${shift.startTime} - ${shift.endTime}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Tasks Management
     */
    async renderTasks() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">task</span>
                        Công việc của tôi
                    </h2>
                </div>
                <div class="card-body">
                    <div id="tasksList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadUserTasks(), 100);

        return content;
    },

    async loadUserTasks() {
        const container = document.getElementById('tasksList');
        if (!container) return;

        const tasks = await DashboardAPI.getUserTasks(this.employeeId);
        
        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div class="message">Không có công việc</div>';
            return;
        }

        let html = '<div class="list">';
        tasks.forEach(task => {
            const iconName = task.status === 'completed' ? 'check_circle' : 'pending';
            const iconColor = task.status === 'completed' ? 'success' : 'warning';
            
            html += `
                <div class="list-item">
                    <div class="list-item-icon ${iconColor}">
                        <span class="material-icons-round">${iconName}</span>
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-title">${utils.escapeHtml(task.title)}</div>
                        <div class="list-item-subtitle">
                            ${task.dueDate ? 'Hạn: ' + task.dueDate : 'Không có hạn'}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },



    /**
     * Profile Management
     */
    async renderProfile() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">person</span>
                        Thông tin cá nhân
                    </h2>
                </div>
                <div class="card-body">
                    <div id="profileContent">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadProfile(), 100);

        return content;
    },

    async loadProfile() {
        const container = document.getElementById('profileContent');
        if (!container) return;

        const profile = await DashboardAPI.getEmployeeProfile(this.employeeId);
        
        if (!profile) {
            container.innerHTML = '<div class="message error">Không thể tải thông tin</div>';
            return;
        }

        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Mã nhân viên</label>
                <input type="text" class="form-input" value="${profile.employeeId}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Họ và tên</label>
                <input type="text" class="form-input" id="profileName" value="${profile.fullName}">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="profileEmail" value="${profile.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Số điện thoại</label>
                <input type="tel" class="form-input" id="profilePhone" value="${profile.phone || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Cửa hàng</label>
                <input type="text" class="form-input" value="${profile.storeName}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Chức vụ</label>
                <input type="text" class="form-input" value="${profile.position}" disabled>
            </div>
            <button class="btn btn-primary btn-full" onclick="DashboardContent.saveProfile()">
                <span class="material-icons-round">save</span>
                Lưu thay đổi
            </button>
        `;
    },

    async saveProfile() {
        const name = document.getElementById('profileName')?.value;
        const email = document.getElementById('profileEmail')?.value;
        const phone = document.getElementById('profilePhone')?.value;

        const result = await DashboardAPI.updateEmployeeProfile(this.employeeId, {
            fullName: name,
            email,
            phone
        });

        if (result.success) {
            utils.showNotification('Cập nhật thông tin thành công', 'success');
        } else {
            utils.showNotification('Không thể cập nhật thông tin', 'error');
        }
    },

    /**
     * Attendance Check-in/out
     */
    async renderAttendance() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">how_to_reg</span>
                        Chấm công
                    </h2>
                </div>
                <div class="card-body">
                    <div class="text-center mb-lg">
                        <div class="stat-value" id="currentTime">--:--</div>
                        <div class="stat-label" id="currentDate">--</div>
                    </div>
                    <button class="btn btn-success btn-full mb-md" onclick="DashboardContent.performCheckIn()">
                        <span class="material-icons-round">login</span>
                        Check In
                    </button>
                    <button class="btn btn-danger btn-full" onclick="DashboardContent.performCheckOut()">
                        <span class="material-icons-round">logout</span>
                        Check Out
                    </button>
                    <div id="attendanceStatus" class="mt-md"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">history</span>
                        Lịch sử chấm công
                    </h2>
                </div>
                <div class="card-body">
                    <div id="attendanceHistory">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.updateClock();
            this.loadAttendanceHistory();
        }, 100);

        return content;
    },

    updateClock() {
        const updateTime = () => {
            const now = new Date();
            const timeEl = document.getElementById('currentTime');
            const dateEl = document.getElementById('currentDate');
            
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('vi-VN');
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('vi-VN');
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    },

    async performCheckIn() {
        if (!navigator.geolocation) {
            utils.showNotification('Trình duyệt không hỗ trợ GPS', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const result = await DashboardAPI.clockIn(
                    this.employeeId,
                    position.coords.latitude,
                    position.coords.longitude
                );

                if (result.success) {
                    utils.showNotification('Check-in thành công!', 'success');
                    this.loadAttendanceHistory();
                } else {
                    utils.showNotification(result.message || 'Check-in thất bại', 'error');
                }
            },
            (error) => {
                utils.showNotification('Không thể lấy vị trí GPS', 'error');
                console.error('GPS error:', error);
            }
        );
    },

    async performCheckOut() {
        if (!navigator.geolocation) {
            utils.showNotification('Trình duyệt không hỗ trợ GPS', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const result = await DashboardAPI.clockOut(
                    this.employeeId,
                    position.coords.latitude,
                    position.coords.longitude
                );

                if (result.success) {
                    utils.showNotification('Check-out thành công!', 'success');
                    this.loadAttendanceHistory();
                } else {
                    utils.showNotification(result.message || 'Check-out thất bại', 'error');
                }
            },
            (error) => {
                utils.showNotification('Không thể lấy vị trí GPS', 'error');
                console.error('GPS error:', error);
            }
        );
    },

    async loadAttendanceHistory() {
        const container = document.getElementById('attendanceHistory');
        if (!container) return;

        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const attendance = await DashboardAPI.getAttendance(this.employeeId, startDate, endDate);
        
        if (!attendance || attendance.length === 0) {
            container.innerHTML = '<div class="message">Chưa có dữ liệu chấm công</div>';
            return;
        }

        let html = '<div class="list">';
        attendance.forEach(record => {
            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${record.date}</div>
                        <div class="list-item-subtitle">
                            Vào: ${record.checkIn || 'N/A'} | Ra: ${record.checkOut || 'N/A'}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Timesheet
     */
    async renderTimesheet() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">table_chart</span>
                        Bảng công tháng ${month}/${year}
                    </h2>
                </div>
                <div class="card-body">
                    <div id="timesheetData">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadTimesheet(month, year), 100);

        return content;
    },

    async loadTimesheet(month, year) {
        const container = document.getElementById('timesheetData');
        if (!container) return;

        const timesheet = await DashboardAPI.getTimesheet(this.employeeId, month, year);
        
        if (!timesheet) {
            container.innerHTML = '<div class="message">Chưa có bảng công</div>';
            return;
        }

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${timesheet.totalDays || 0}</div>
                    <div class="stat-label">Ngày làm việc</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${timesheet.totalHours || 0}h</div>
                    <div class="stat-label">Tổng giờ</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${timesheet.overtimeHours || 0}h</div>
                    <div class="stat-label">Làm thêm</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${timesheet.leaveDays || 0}</div>
                    <div class="stat-label">Nghỉ phép</div>
                </div>
            </div>
        `;
    },

    /**
     * Submit Request Form
     */
    renderSubmitRequest() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">send</span>
                        Gửi yêu cầu
                    </h2>
                </div>
                <div class="card-body">
                    <form id="requestForm" onsubmit="event.preventDefault(); DashboardContent.submitRequest();">
                        <div class="form-group">
                            <label class="form-label">Loại yêu cầu</label>
                            <select id="requestType" class="form-select" required>
                                <option value="">Chọn loại yêu cầu</option>
                                <option value="leave">Nghỉ phép</option>
                                <option value="overtime">Làm thêm giờ</option>
                                <option value="shift_change">Điều chỉnh ca</option>
                                <option value="forgot_checkin">Quên chấm công vào</option>
                                <option value="forgot_checkout">Quên chấm công ra</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ngày bắt đầu</label>
                            <input type="date" id="requestStartDate" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ngày kết thúc</label>
                            <input type="date" id="requestEndDate" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lý do</label>
                            <textarea id="requestReason" class="form-textarea" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">
                            <span class="material-icons-round">send</span>
                            Gửi yêu cầu
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    async submitRequest() {
        const type = document.getElementById('requestType')?.value;
        const startDate = document.getElementById('requestStartDate')?.value;
        const endDate = document.getElementById('requestEndDate')?.value;
        const reason = document.getElementById('requestReason')?.value;

        if (!type || !startDate || !endDate || !reason) {
            utils.showNotification('Vui lòng điền đầy đủ thông tin', 'warning');
            return;
        }

        const result = await DashboardAPI.submitAttendanceRequest({
            employeeId: this.employeeId,
            type,
            startDate,
            endDate,
            reason,
            status: 'pending'
        });

        if (result.success) {
            utils.showNotification('Gửi yêu cầu thành công', 'success');
            document.getElementById('requestForm')?.reset();
        } else {
            utils.showNotification(result.message || 'Không thể gửi yêu cầu', 'error');
        }
    },

    /**
     * View Attendance Requests
     */
    async renderAttendanceRequest() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">assignment</span>
                        Đơn từ chấm công
                    </h2>
                </div>
                <div class="card-body">
                    <div id="requestsList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadAttendanceRequests(), 100);

        return content;
    },

    async loadAttendanceRequests() {
        const container = document.getElementById('requestsList');
        if (!container) return;

        const requests = await DashboardAPI.getAttendanceRequests(this.employeeId);
        
        if (!requests || requests.length === 0) {
            container.innerHTML = '<div class="message">Không có đơn từ</div>';
            return;
        }

        let html = '<div class="list">';
        requests.forEach(req => {
            const statusClass = req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning';
            const statusText = req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt';
            
            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${utils.escapeHtml(req.type)}</div>
                        <div class="list-item-subtitle">
                            ${req.startDate} đến ${req.endDate}
                        </div>
                        <div class="badge badge-${statusClass}">${statusText}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Process Requests (Manager/Admin)
     */
    async renderProcessRequests() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">pending_actions</span>
                        Xử lý yêu cầu
                    </h2>
                </div>
                <div class="card-body">
                    <div id="pendingRequestsList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadPendingRequests(), 100);

        return content;
    },

    async loadPendingRequests() {
        const container = document.getElementById('pendingRequestsList');
        if (!container) return;

        const requests = await DashboardAPI.getPendingRequests();
        
        if (!requests || requests.length === 0) {
            container.innerHTML = '<div class="message">Không có yêu cầu chờ xử lý</div>';
            return;
        }

        let html = '<div class="list">';
        requests.forEach(req => {
            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${utils.escapeHtml(req.employeeName)} - ${utils.escapeHtml(req.type)}</div>
                        <div class="list-item-subtitle">
                            ${req.startDate} đến ${req.endDate}<br>
                            Lý do: ${utils.escapeHtml(req.reason)}
                        </div>
                        <div class="mt-sm">
                            <button class="btn btn-sm btn-success" onclick="DashboardContent.approveRequest('${req.requestId}')">
                                Duyệt
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="DashboardContent.rejectRequest('${req.requestId}')">
                                Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    async approveRequest(requestId) {
        const result = await DashboardAPI.approveRequest(requestId, 'Đã duyệt');
        
        if (result.success) {
            utils.showNotification('Đã duyệt yêu cầu', 'success');
            this.loadPendingRequests();
        } else {
            utils.showNotification('Không thể duyệt yêu cầu', 'error');
        }
    },

    async rejectRequest(requestId) {
        const result = await DashboardAPI.rejectRequest(requestId, 'Không đủ điều kiện');
        
        if (result.success) {
            utils.showNotification('Đã từ chối yêu cầu', 'success');
            this.loadPendingRequests();
        } else {
            utils.showNotification('Không thể từ chối yêu cầu', 'error');
        }
    },

    /**
     * Approve Registration (Admin only)
     */
    async renderApproveRegistration() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">how_to_reg</span>
                        Duyệt đăng ký
                    </h2>
                </div>
                <div class="card-body">
                    <div id="pendingRegistrationsList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadPendingRegistrations(), 100);

        return content;
    },

    async loadPendingRegistrations() {
        const container = document.getElementById('pendingRegistrationsList');
        if (!container) return;

        const registrations = await DashboardAPI.getPendingRegistrations();
        
        if (!registrations || registrations.length === 0) {
            container.innerHTML = '<div class="message">Không có đăng ký chờ duyệt</div>';
            return;
        }

        let html = '<div class="list">';
        registrations.forEach(reg => {
            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${utils.escapeHtml(reg.fullName)}</div>
                        <div class="list-item-subtitle">
                            Email: ${utils.escapeHtml(reg.email)}<br>
                            SĐT: ${utils.escapeHtml(reg.phone)}<br>
                            Cửa hàng: ${utils.escapeHtml(reg.storeName)}
                        </div>
                        <div class="mt-sm">
                            <button class="btn btn-sm btn-success" onclick="DashboardContent.approveRegistration('${reg.employeeId}')">
                                Duyệt
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="DashboardContent.rejectRegistration('${reg.employeeId}')">
                                Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    async approveRegistration(employeeId) {
        const result = await DashboardAPI.approveRegistration(employeeId);
        
        if (result.success) {
            utils.showNotification('Đã duyệt đăng ký', 'success');
            this.loadPendingRegistrations();
        } else {
            utils.showNotification('Không thể duyệt đăng ký', 'error');
        }
    },

    async rejectRegistration(employeeId) {
        const result = await DashboardAPI.rejectRegistration(employeeId, 'Thông tin không đầy đủ');
        
        if (result.success) {
            utils.showNotification('Đã từ chối đăng ký', 'success');
            this.loadPendingRegistrations();
        } else {
            utils.showNotification('Không thể từ chối đăng ký', 'error');
        }
    },

    /**
     * Grant Access/Permissions (Admin only)
     */
    async renderGrantAccess() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">admin_panel_settings</span>
                        Phân quyền
                    </h2>
                </div>
                <div class="card-body">
                    <div id="employeesList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadAllEmployees(), 100);

        return content;
    },

    async loadAllEmployees() {
        const container = document.getElementById('employeesList');
        if (!container) return;

        const employees = await DashboardAPI.getAllEmployees();
        
        if (!employees || employees.length === 0) {
            container.innerHTML = '<div class="message">Không có nhân viên</div>';
            return;
        }

        let html = '<div class="list">';
        employees.forEach(emp => {
            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${utils.escapeHtml(emp.fullName)}</div>
                        <div class="list-item-subtitle">
                            Mã NV: ${emp.employeeId}<br>
                            Chức vụ hiện tại: ${emp.position}
                        </div>
                        <div class="mt-sm">
                            <select class="form-select" id="position_${emp.employeeId}">
                                <option value="NV" ${emp.position === 'NV' ? 'selected' : ''}>Nhân viên</option>
                                <option value="QL" ${emp.position === 'QL' ? 'selected' : ''}>Quản lý</option>
                                <option value="AD" ${emp.position === 'AD' ? 'selected' : ''}>Admin</option>
                            </select>
                            <button class="btn btn-sm btn-primary mt-xs" onclick="DashboardContent.updatePermission('${emp.employeeId}')">
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    async updatePermission(employeeId) {
        const select = document.getElementById(`position_${employeeId}`);
        if (!select) return;

        const newPosition = select.value;
        const result = await DashboardAPI.updateEmployeePermissions(employeeId, newPosition);
        
        if (result.success) {
            utils.showNotification('Đã cập nhật quyền', 'success');
        } else {
            utils.showNotification('Không thể cập nhật quyền', 'error');
        }
    },

    // Placeholder functions for other features
    renderWorkManagement() {
        return '<div class="card"><div class="card-body"><div class="message">Quản lý công</div></div></div>';
    },

    renderTaskAssignment() {
        return '<div class="card"><div class="card-body"><div class="message">Phân công nhiệm vụ</div></div></div>';
    }
};
