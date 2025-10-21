/**
 * Admin Content Renderer
 * Provides admin-specific content templates with API integration
 * This file should only be loaded on admin.html
 */

const AdminContent = {
    /**
     * Initialize admin content renderer
     */
    async init() {
        this.userData = this.getUserData();
        this.employeeId = this.userData?.employeeId || null;
    },

    getUserData() {
        const data = SecureStorage.get('userData') || localStorage.getItem('userData');
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse user data:', e);
            return null;
        }
    },

    /**
     * Admin Dashboard
     */
    async renderAdminDashboard() {
        const content = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="totalEmployees">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Tổng nhân viên</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="pendingRequests">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Yêu cầu chờ duyệt</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="pendingRegistrations">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Đăng ký chờ duyệt</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">admin_panel_settings</span>
                        Quản trị hệ thống
                    </h2>
                </div>
                <div class="card-body">
                    <button class="btn btn-primary btn-full mb-md" onclick="navigateToFunction('approve-registration')">
                        <span class="material-icons-round">how_to_reg</span>
                        Duyệt đăng ký
                    </button>
                    <button class="btn btn-secondary btn-full mb-md" onclick="navigateToFunction('grant-access')">
                        <span class="material-icons-round">admin_panel_settings</span>
                        Phân quyền
                    </button>
                    <button class="btn btn-secondary btn-full mb-md" onclick="navigateToFunction('schedule-management')">
                        <span class="material-icons-round">edit_calendar</span>
                        Xếp lịch làm việc
                    </button>
                    <button class="btn btn-secondary btn-full" onclick="navigateToFunction('employee-management')">
                        <span class="material-icons-round">people</span>
                        Quản lý nhân viên
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">notifications_active</span>
                        Thông báo quan trọng
                    </h2>
                </div>
                <div class="card-body">
                    <div id="adminAlerts">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        // Load stats after render
        setTimeout(() => {
            this.loadAdminStats();
        }, 100);

        return content;
    },

    async loadAdminStats() {
        try {
            const stats = await DashboardAPI.getDashboardStats();
            document.getElementById('totalEmployees').textContent = stats.totalEmployees || '0';
            document.getElementById('pendingRequests').textContent = stats.pendingRequests || '0';
            document.getElementById('pendingRegistrations').textContent = stats.pendingRegistrations || '0';
        } catch (error) {
            console.error('Error loading admin stats:', error);
            document.getElementById('totalEmployees').textContent = '-';
            document.getElementById('pendingRequests').textContent = '-';
            document.getElementById('pendingRegistrations').textContent = '-';
        }
    },

    /**
     * Schedule Management - NEW
     */
    async renderScheduleManagement() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">edit_calendar</span>
                        Xếp Lịch Làm Việc
                    </h2>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label for="scheduleEmployee">Chọn nhân viên</label>
                        <select id="scheduleEmployee" class="form-control">
                            <option value="">Đang tải...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="scheduleShift">Chọn ca làm</label>
                        <select id="scheduleShift" class="form-control">
                            <option value="">Đang tải...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="scheduleDate">Ngày làm việc</label>
                        <input type="date" id="scheduleDate" class="form-control">
                    </div>
                    
                    <button class="btn btn-primary btn-full" onclick="AdminContent.assignShift()">
                        <span class="material-icons-round">save</span>
                        Xếp lịch
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">calendar_month</span>
                        Lịch làm việc hiện tại
                    </h2>
                </div>
                <div class="card-body">
                    <div id="scheduleList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        // Load employees and shifts after render
        setTimeout(() => {
            this.loadEmployeesForSchedule();
            this.loadShiftsForSchedule();
            this.loadCurrentSchedules();
        }, 100);

        return content;
    },

    async loadEmployeesForSchedule() {
        try {
            const employees = await DashboardAPI.getEmployees();
            const select = document.getElementById('scheduleEmployee');
            if (select && employees) {
                select.innerHTML = '<option value="">Chọn nhân viên</option>';
                employees.forEach(emp => {
                    select.innerHTML += `<option value="${emp.employeeId}">${emp.fullName || emp.employeeId}</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    },

    async loadShiftsForSchedule() {
        try {
            const shifts = await DashboardAPI.getShifts();
            const select = document.getElementById('scheduleShift');
            if (select && shifts) {
                select.innerHTML = '<option value="">Chọn ca làm</option>';
                shifts.forEach(shift => {
                    select.innerHTML += `<option value="${shift.shiftId}">${shift.name} (${shift.timeName})</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading shifts:', error);
        }
    },

    async loadCurrentSchedules() {
        try {
            const schedules = await DashboardAPI.getShiftAssignments();
            const listDiv = document.getElementById('scheduleList');
            if (listDiv && schedules) {
                if (schedules.length === 0) {
                    listDiv.innerHTML = '<p class="text-muted">Chưa có lịch làm việc nào</p>';
                } else {
                    listDiv.innerHTML = schedules.map(schedule => `
                        <div class="list-item">
                            <div class="list-item-content">
                                <div class="list-item-title">${schedule.employeeName || schedule.employeeId}</div>
                                <div class="list-item-subtitle">${schedule.shiftName} - ${schedule.date}</div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    },

    async assignShift() {
        const employeeId = document.getElementById('scheduleEmployee').value;
        const shiftId = document.getElementById('scheduleShift').value;
        const date = document.getElementById('scheduleDate').value;

        if (!employeeId || !shiftId || !date) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await DashboardAPI.assignShift(employeeId, shiftId, date);
            alert('Xếp lịch thành công!');
            this.loadCurrentSchedules();
        } catch (error) {
            console.error('Error assigning shift:', error);
            alert('Có lỗi xảy ra khi xếp lịch');
        }
    },

    /**
     * Approve Registration
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
                    <div id="registrationList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.loadPendingRegistrations();
        }, 100);

        return content;
    },

    async loadPendingRegistrations() {
        try {
            const registrations = await DashboardAPI.getPendingRegistrations();
            const listDiv = document.getElementById('registrationList');
            if (listDiv && registrations) {
                if (registrations.length === 0) {
                    listDiv.innerHTML = '<p class="text-muted">Không có đăng ký chờ duyệt</p>';
                } else {
                    listDiv.innerHTML = registrations.map(reg => `
                        <div class="list-item">
                            <div class="list-item-content">
                                <div class="list-item-title">${reg.fullName}</div>
                                <div class="list-item-subtitle">${reg.email} - ${reg.phone}</div>
                            </div>
                            <div class="list-item-actions">
                                <button class="btn btn-success btn-sm" onclick="AdminContent.approveRegistration('${reg.id}')">
                                    Duyệt
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="AdminContent.rejectRegistration('${reg.id}')">
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading registrations:', error);
        }
    },

    async approveRegistration(id) {
        try {
            await DashboardAPI.approveRegistration(id);
            alert('Đã duyệt đăng ký');
            this.loadPendingRegistrations();
        } catch (error) {
            console.error('Error approving registration:', error);
            alert('Có lỗi xảy ra');
        }
    },

    async rejectRegistration(id) {
        try {
            await DashboardAPI.rejectRegistration(id);
            alert('Đã từ chối đăng ký');
            this.loadPendingRegistrations();
        } catch (error) {
            console.error('Error rejecting registration:', error);
            alert('Có lỗi xảy ra');
        }
    },

    /**
     * Grant Access (Phân quyền)
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
                    <div id="employeeList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.loadEmployeesForAccess();
        }, 100);

        return content;
    },

    async loadEmployeesForAccess() {
        try {
            const employees = await DashboardAPI.getEmployees();
            const listDiv = document.getElementById('employeeList');
            if (listDiv && employees) {
                if (employees.length === 0) {
                    listDiv.innerHTML = '<p class="text-muted">Không có nhân viên nào</p>';
                } else {
                    listDiv.innerHTML = employees.map(emp => `
                        <div class="list-item">
                            <div class="list-item-content">
                                <div class="list-item-title">${emp.fullName || emp.employeeId}</div>
                                <div class="list-item-subtitle">Quyền hiện tại: ${emp.position || 'NV'}</div>
                            </div>
                            <div class="list-item-actions">
                                <select class="form-control form-control-sm" onchange="AdminContent.changeRole('${emp.employeeId}', this.value)">
                                    <option value="NV" ${emp.position === 'NV' ? 'selected' : ''}>Nhân viên</option>
                                    <option value="QL" ${emp.position === 'QL' ? 'selected' : ''}>Quản lý</option>
                                    <option value="AD" ${emp.position === 'AD' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    },

    async changeRole(employeeId, newRole) {
        try {
            await DashboardAPI.updateEmployeeRole(employeeId, newRole);
            alert('Đã cập nhật quyền');
        } catch (error) {
            console.error('Error changing role:', error);
            alert('Có lỗi xảy ra');
        }
    },

    /**
     * Employee Management
     */
    async renderEmployeeManagement() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">people</span>
                        Quản lý nhân viên
                    </h2>
                </div>
                <div class="card-body">
                    <p class="text-muted">Chức năng quản lý nhân viên đang được phát triển...</p>
                </div>
            </div>
        `;
    },

    /**
     * Attendance Approval
     */
    async renderAttendanceApproval() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">verified</span>
                        Duyệt chấm công
                    </h2>
                </div>
                <div class="card-body">
                    <p class="text-muted">Chức năng duyệt chấm công đang được phát triển...</p>
                </div>
            </div>
        `;
    },

    /**
     * Reports
     */
    async renderReports() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">assessment</span>
                        Báo cáo
                    </h2>
                </div>
                <div class="card-body">
                    <p class="text-muted">Chức năng báo cáo đang được phát triển...</p>
                </div>
            </div>
        `;
    },

    /**
     * Analytics
     */
    async renderAnalytics() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">analytics</span>
                        Phân tích
                    </h2>
                </div>
                <div class="card-body">
                    <p class="text-muted">Chức năng phân tích đang được phát triển...</p>
                </div>
            </div>
        `;
    },

    /**
     * System Settings
     */
    async renderSystemSettings() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">settings</span>
                        Cài đặt hệ thống
                    </h2>
                </div>
                <div class="card-body">
                    <p class="text-muted">Chức năng cài đặt hệ thống đang được phát triển...</p>
                </div>
            </div>
        `;
    },

    /**
     * System Logs
     */
    async renderSystemLogs() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">description</span>
                        Nhật ký hệ thống
                    </h2>
                </div>
                <div class="card-body">
                    <p class="text-muted">Chức năng nhật ký hệ thống đang được phát triển...</p>
                </div>
            </div>
        `;
    }
};
