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
     * Home Dashboard with Role-Specific Views
     */
    async renderHome() {
        const position = this.userData?.position || 'NV';
        
        // Render based on role
        if (position === 'AD' || position === 'ADMIN') {
            return this.renderAdminDashboard();
        } else if (position === 'QL' || position === 'MANAGER') {
            return this.renderManagerDashboard();
        } else {
            return this.renderWorkerDashboard();
        }
    },

    /**
     * Worker (NV) Dashboard
     */
    async renderWorkerDashboard() {
        const content = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="hoursWorked">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Giờ làm việc</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="todayShift">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Ca hôm nay</div>
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

        return content;
    },

    /**
     * Manager (QL) Dashboard
     */
    async renderManagerDashboard() {
        const content = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="teamAttendance">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Đi làm hôm nay</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="pendingRequests">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Yêu cầu chờ</div>
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
                    <button class="btn btn-primary btn-full mb-md" onclick="navigateToFunction('process-requests')">
                        <span class="material-icons-round">approval</span>
                        Xử lý yêu cầu
                    </button>
                    <button class="btn btn-secondary btn-full" onclick="navigateToFunction('schedule-management')">
                        <span class="material-icons-round">calendar_month</span>
                        Xếp lịch làm việc
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">people</span>
                        Hiệu suất nhóm
                    </h2>
                </div>
                <div class="card-body">
                    <div id="teamPerformance">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        return content;
    },

    /**
     * Admin (AD) Dashboard
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
                    <div class="stat-value" id="dailyQueries">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Truy vấn hôm nay</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="quotaRemaining">
                        <div class="spinner-sm"></div>
                    </div>
                    <div class="stat-label">Quota còn lại</div>
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
                    <button class="btn btn-primary btn-full mb-md" onclick="navigateToFunction('approve-registration')">
                        <span class="material-icons-round">person_add</span>
                        Duyệt đăng ký
                    </button>
                    <button class="btn btn-secondary btn-full mb-md" onclick="navigateToFunction('grant-access')">
                        <span class="material-icons-round">admin_panel_settings</span>
                        Phân quyền
                    </button>
                    <button class="btn btn-secondary btn-full mb-md" onclick="navigateToFunction('view-reports')">
                        <span class="material-icons-round">assessment</span>
                        Xem báo cáo
                    </button>
                    <button class="btn btn-secondary btn-full" onclick="navigateToFunction('system-settings')">
                        <span class="material-icons-round">settings</span>
                        Cài đặt hệ thống
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">cloud</span>
                        Cloudflare Analytics
                    </h2>
                </div>
                <div class="card-body">
                    <div id="cloudflareStats">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">storage</span>
                        Trạng thái hệ thống
                    </h2>
                </div>
                <div class="card-body">
                    <div id="systemStatus">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        // Load admin stats
        this.loadAdminStats();

        return content;
    },

    /**
     * Work Schedule
     */
    /**
     * PHASE 4: Mobile-Optimized Schedule UI (7-day swipe view)
     */
    async renderSchedule() {
        const today = new Date();
        const weekStart = this.getWeekStart(today);
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userRole = this.roleHierarchy[userData?.position?.toUpperCase()] || 0;
        
        // Role-specific schedule view
        if (userRole >= 1) {
            // Manager/Admin: Team schedule management
            return this.renderScheduleManagement(weekStart);
        } else {
            // Worker: Personal schedule view with registration
            return this.renderScheduleRegistration(weekStart);
        }
    },

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    },

    async renderScheduleRegistration(weekStart) {
        const content = `
            <div class="card">
                <div class="card-header schedule-header">
                    <button id="prevWeek" class="icon-btn-small" aria-label="Tuần trước">
                        <span class="material-icons-round">chevron_left</span>
                    </button>
                    <h2 class="card-title">
                        <span class="material-icons-round">calendar_month</span>
                        <span id="weekTitle">Tuần này</span>
                    </h2>
                    <button id="nextWeek" class="icon-btn-small" aria-label="Tuần sau">
                        <span class="material-icons-round">chevron_right</span>
                    </button>
                </div>
                <div class="card-body">
                    <div id="weeklySchedule" class="schedule-grid">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadWeeklySchedule(weekStart), 100);
        
        return content;
    },

    async loadWeeklySchedule(weekStart) {
        const container = document.getElementById('weeklySchedule');
        if (!container) return;

        this.currentWeekStart = weekStart;
        
        // Update week title
        const startDate = new Date(weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const weekTitle = document.getElementById('weekTitle');
        if (weekTitle) {
            weekTitle.textContent = `${startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
        }

        // Fetch week schedule
        const schedule = await DashboardAPI.getWeekSchedule(weekStart);
        
        // Generate 7-day grid
        let html = '<div class="week-grid">';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayNum = date.getDate();
            
            const daySchedule = schedule.find(s => s.date === dateStr);
            const shiftClass = daySchedule ? `shift-${daySchedule.shiftType}` : 'no-shift';
            
            html += `
                <div class="day-card ${shiftClass}" data-date="${dateStr}">
                    <div class="day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-number">${dayNum}</div>
                    </div>
                    <div class="day-content">
                        ${daySchedule ? `
                            <div class="shift-info">
                                <div class="shift-type">${this.getShiftName(daySchedule.shiftType)}</div>
                                <div class="shift-time">${daySchedule.startTime} - ${daySchedule.endTime}</div>
                            </div>
                        ` : `
                            <button class="btn-register-shift" data-date="${dateStr}">
                                <span class="material-icons-round">add</span>
                                Đăng ký
                            </button>
                        `}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;

        // Add swipe navigation listeners
        const prevBtn = document.getElementById('prevWeek');
        const nextBtn = document.getElementById('nextWeek');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newStart = new Date(this.currentWeekStart);
                newStart.setDate(newStart.getDate() - 7);
                this.loadWeeklySchedule(newStart.toISOString().split('T')[0]);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newStart = new Date(this.currentWeekStart);
                newStart.setDate(newStart.getDate() + 7);
                this.loadWeeklySchedule(newStart.toISOString().split('T')[0]);
            });
        }

        // Add shift registration handlers
        const registerBtns = container.querySelectorAll('.btn-register-shift');
        registerBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const date = btn.dataset.date;
                await this.showShiftRegistrationDialog(date);
            });
        });
    },

    getShiftName(shiftType) {
        const names = {
            'morning': '🌅 Sáng',
            'afternoon': '☀️ Chiều',
            'night': '🌙 Tối'
        };
        return names[shiftType] || shiftType;
    },

    async showShiftRegistrationDialog(date) {
        // Simple confirmation for now
        const shiftTypes = ['morning', 'afternoon', 'night'];
        const shiftNames = shiftTypes.map(t => this.getShiftName(t));
        
        const choice = confirm(`Đăng ký ca làm cho ngày ${new Date(date).toLocaleDateString('vi-VN')}?\n\nChọn OK để tiếp tục`);
        
        if (choice) {
            // For demo, register for morning shift
            const result = await DashboardAPI.registerForShift({ date, shiftType: 'morning' });
            
            if (result.success) {
                alert('Đã gửi yêu cầu đăng ký ca làm!');
                this.loadWeeklySchedule(this.currentWeekStart);
            } else {
                alert('Không thể đăng ký ca làm. Vui lòng thử lại.');
            }
        }
    },

    async renderScheduleManagement(weekStart) {
        const content = `
            <div class="card">
                <div class="card-header schedule-header">
                    <button id="prevWeek" class="icon-btn-small" aria-label="Tuần trước">
                        <span class="material-icons-round">chevron_left</span>
                    </button>
                    <h2 class="card-title">
                        <span class="material-icons-round">calendar_month</span>
                        <span id="weekTitle">Xếp lịch nhóm</span>
                    </h2>
                    <button id="nextWeek" class="icon-btn-small" aria-label="Tuần sau">
                        <span class="material-icons-round">chevron_right</span>
                    </button>
                </div>
                <div class="card-body">
                    <div id="teamSchedule" class="schedule-grid">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadTeamSchedule(weekStart), 100);
        
        return content;
    },

    async loadTeamSchedule(weekStart) {
        const container = document.getElementById('teamSchedule');
        if (!container) return;

        this.currentWeekStart = weekStart;
        
        // Update week title
        const startDate = new Date(weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const weekTitle = document.getElementById('weekTitle');
        if (weekTitle) {
            weekTitle.textContent = `${startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
        }

        // Fetch team schedule
        const teamSchedule = await DashboardAPI.getTeamSchedule(weekStart);
        
        if (!teamSchedule || teamSchedule.length === 0) {
            container.innerHTML = '<div class="message">Chưa có lịch làm việc cho tuần này</div>';
            return;
        }

        // Group by employee
        const employeeMap = {};
        teamSchedule.forEach(entry => {
            if (!employeeMap[entry.employeeId]) {
                employeeMap[entry.employeeId] = {
                    name: entry.employeeName,
                    schedule: []
                };
            }
            employeeMap[entry.employeeId].schedule.push(entry);
        });

        // Render team schedule
        let html = '<div class="team-schedule-list">';
        Object.values(employeeMap).forEach(employee => {
            html += `
                <div class="team-member-schedule">
                    <h3 class="employee-name">${employee.name}</h3>
                    <div class="mini-week-grid">
            `;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const dayShift = employee.schedule.find(s => s.date === dateStr);
                
                html += `
                    <div class="mini-day ${dayShift ? 'has-shift shift-' + dayShift.shiftType : ''}">
                        <div class="mini-day-num">${date.getDate()}</div>
                        ${dayShift ? `<div class="mini-shift-icon">${this.getShiftIcon(dayShift.shiftType)}</div>` : ''}
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;

        // Add navigation listeners
        const prevBtn = document.getElementById('prevWeek');
        const nextBtn = document.getElementById('nextWeek');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newStart = new Date(this.currentWeekStart);
                newStart.setDate(newStart.getDate() - 7);
                this.loadTeamSchedule(newStart.toISOString().split('T')[0]);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newStart = new Date(this.currentWeekStart);
                newStart.setDate(newStart.getDate() + 7);
                this.loadTeamSchedule(newStart.toISOString().split('T')[0]);
            });
        }
    },

    getShiftIcon(shiftType) {
        const icons = {
            'morning': '🌅',
            'afternoon': '☀️',
            'night': '🌙'
        };
        return icons[shiftType] || '•';
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



    /**
     * PHASE 3: Notification System
     */
    async renderNotifications() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">notifications</span>
                        Thông báo
                    </h2>
                    <button class="btn btn-sm" onclick="DashboardContent.markAllRead()">
                        <span class="material-icons-round">done_all</span>
                        Đánh dấu tất cả đã đọc
                    </button>
                </div>
                <div class="card-body">
                    <div id="notificationsList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadNotifications(), 100);
        return content;
    },

    async loadNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        const notifications = await DashboardAPI.getNotifications();
        
        if (!notifications || notifications.length === 0) {
            container.innerHTML = '<div class="message">Không có thông báo</div>';
            return;
        }

        let html = '<div class="notification-list">';
        notifications.forEach(notif => {
            const iconMap = {
                'request': 'request_page',
                'system': 'info',
                'approval': 'verified'
            };
            const icon = iconMap[notif.type] || 'notifications';
            const unreadClass = notif.read ? '' : 'unread';
            const timeAgo = this.formatTimeAgo(notif.createdAt);

            html += `
                <div class="notification-item ${unreadClass}" onclick="DashboardContent.handleNotificationClick('${notif.id}')">
                    <div class="notification-icon">
                        <span class="material-icons-round">${icon}</span>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${utils.escapeHtml(notif.title)}</div>
                        <div class="notification-message">${utils.escapeHtml(notif.message)}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                    ${!notif.read ? '<div class="notification-badge"></div>' : ''}
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    async handleNotificationClick(notificationId) {
        await DashboardAPI.markNotificationRead(notificationId);
        await this.updateNotificationBadge();
        await this.loadNotifications();
    },

    async markAllRead() {
        await DashboardAPI.markAllNotificationsRead();
        await this.updateNotificationBadge();
        await this.loadNotifications();
    },

    async updateNotificationBadge() {
        const count = await DashboardAPI.getNotificationCount();
        const badge = document.querySelector('.mobile-header .badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN');
    },

    /**
     * PHASE 4: Mobile-Optimized Schedule UI
     */
    async renderScheduleRegistration() {
        const today = new Date();
        const weekStart = this.getMonday(today);
        
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">event_available</span>
                        Đăng ký ca làm việc
                    </h2>
                </div>
                <div class="card-body">
                    <div class="schedule-week-nav">
                        <button class="btn btn-icon" onclick="DashboardContent.changeWeek(-1)">
                            <span class="material-icons-round">chevron_left</span>
                        </button>
                        <span id="weekDisplay">Đang tải...</span>
                        <button class="btn btn-icon" onclick="DashboardContent.changeWeek(1)">
                            <span class="material-icons-round">chevron_right</span>
                        </button>
                    </div>
                    <div id="weeklySchedule" data-week-start="${weekStart.toISOString()}">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadWeeklySchedule(), 100);
        return content;
    },

    async loadWeeklySchedule() {
        const container = document.getElementById('weeklySchedule');
        if (!container) return;

        const weekStartStr = container.getAttribute('data-week-start');
        const weekStart = new Date(weekStartStr);
        
        // Update week display
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        document.getElementById('weekDisplay').textContent = 
            `${weekStart.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})} - ${weekEnd.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}`;

        const shifts = await DashboardAPI.getAvailableShifts(weekStartStr);
        
        if (!shifts || shifts.length === 0) {
            container.innerHTML = '<div class="message">Không có ca làm việc khả dụng</div>';
            return;
        }

        let html = '<div class="schedule-grid">';
        
        // Create 7-day grid
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayName = currentDate.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayNum = currentDate.getDate();
            
            const dayShifts = shifts.filter(s => s.date === dateStr);
            
            html += `
                <div class="schedule-day">
                    <div class="schedule-day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-num">${dayNum}</div>
                    </div>
                    <div class="schedule-day-shifts">
            `;
            
            if (dayShifts.length === 0) {
                html += '<div class="no-shift">Không có ca</div>';
            } else {
                dayShifts.forEach(shift => {
                    const shiftClass = shift.registered ? 'registered' : 
                                      shift.available ? 'available' : 'full';
                    const shiftType = shift.shiftName.includes('Sáng') ? 'morning' :
                                     shift.shiftName.includes('Chiều') ? 'afternoon' : 'night';
                    
                    html += `
                        <div class="shift-card ${shiftClass} ${shiftType}" 
                             onclick="${shift.available && !shift.registered ? `DashboardContent.registerShift('${shift.id}')` : ''}">
                            <div class="shift-name">${shift.shiftName}</div>
                            <div class="shift-time">${shift.startTime} - ${shift.endTime}</div>
                            ${shift.registered ? '<span class="shift-badge">Đã đăng ký</span>' : ''}
                            ${!shift.available && !shift.registered ? '<span class="shift-badge">Đầy</span>' : ''}
                        </div>
                    `;
                });
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    },

    async changeWeek(direction) {
        const container = document.getElementById('weeklySchedule');
        if (!container) return;

        const currentWeekStart = new Date(container.getAttribute('data-week-start'));
        currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
        
        container.setAttribute('data-week-start', currentWeekStart.toISOString());
        await this.loadWeeklySchedule();
    },

    async registerShift(shiftId) {
        const result = await DashboardAPI.registerForShift(shiftId);
        if (result.success) {
            await this.loadWeeklySchedule();
            // Show success message
            alert('Đăng ký ca thành công!');
        } else {
            alert(result.message || 'Đăng ký thất bại');
        }
    },

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    async renderScheduleManagement() {
        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">calendar_month</span>
                        Quản lý ca làm việc
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message info">
                        Chức năng quản lý ca làm việc (chỉ dành cho Quản lý và Admin)
                    </div>
                    <div class="schedule-week-nav">
                        <button class="btn btn-icon" onclick="DashboardContent.changeManagementWeek(-1)">
                            <span class="material-icons-round">chevron_left</span>
                        </button>
                        <span id="managementWeekDisplay">Đang tải...</span>
                        <button class="btn btn-icon" onclick="DashboardContent.changeManagementWeek(1)">
                            <span class="material-icons-round">chevron_right</span>
                        </button>
                    </div>
                    <div id="managementSchedule">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadManagementSchedule(), 100);
        return content;
    },

    async loadManagementSchedule() {
        const container = document.getElementById('managementSchedule');
        if (!container) return;

        // Placeholder for management schedule
        container.innerHTML = `
            <div class="message">
                Giao diện quản lý ca làm việc - cho phép xếp ca cho nhân viên
            </div>
        `;
    },

    async changeManagementWeek(direction) {
        // Placeholder for week navigation
        await this.loadManagementSchedule();
    },

    /**
     * PHASE 3: Notification System Rendering
     */
    async renderNotifications() {
        const panel = document.getElementById('notificationPanel');
        if (!panel) return;

        const notifications = await DashboardAPI.getNotifications();
        const list = document.getElementById('notificationList');
        
        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <span class="material-icons-round" style="font-size: 48px; color: var(--text-muted);">notifications_none</span>
                    <p>Không có thông báo mới</p>
                </div>
            `;
            return;
        }

        list.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                <div class="notification-icon">
                    <span class="material-icons-round">${this.getNotificationIcon(notif.type)}</span>
                </div>
                <div class="notification-title">${utils.escapeHtml(notif.title)}</div>
                <div class="notification-body">${utils.escapeHtml(notif.body)}</div>
                <div class="notification-time">${utils.formatTimeAgo(notif.createdAt)}</div>
            </div>
        `).join('');

        // Add click handlers
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', async () => {
                const id = item.dataset.id;
                await DashboardAPI.markNotificationRead(id);
                item.classList.remove('unread');
                this.updateNotificationBadge();
            });
        });
    },

    getNotificationIcon(type) {
        const icons = {
            'task': 'assignment',
            'request': 'pending_actions',
            'schedule': 'calendar_today',
            'approval': 'approval',
            'system': 'notifications'
        };
        return icons[type] || 'notifications';
    },

    async updateNotificationBadge() {
        const count = await DashboardAPI.getNotificationCount();
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count > 0 ? count : '';
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                this.renderNotifications();
            }
        }
    }
};
