/**
 * Dashboard Content Renderer
 * Provides comprehensive content templates with API integration
 */

// Simple notification helper (replaces utils.showNotification)
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement a proper notification UI here if needed
    // For now, just log to console
}

// Simple HTML escaping utility (replaces utils.escapeHtml)
const utils = {
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

const DashboardContent = {
    /**
     * Initialize content renderer
     */
    async init() {
        this.userData = this.getUserData();
        this.employeeId = this.userData?.employeeId || null;
    },

    getUserData() {
        const data = SimpleStorage.get('userData');
        if (!data) return null;
        return typeof data === 'string' ? JSON.parse(data) : data;
    },

    /**
     * Home Dashboard with Permission-Based Views
     */
    async renderHome() {
        const permissions = this.userData?.permissions || '';
        const permissionList = permissions.split(',');
        
        // Render based on permissions
        // Admin: has system_admin or multiple management permissions
        if (permissionList.includes('system_admin') || 
            (permissionList.includes('employee_manage') && permissionList.includes('department_manage'))) {
            return this.renderAdminDashboard();
        } 
        // Manager: has approve or manage permissions
        else if (permissionList.includes('timesheet_approve') || 
                 permissionList.includes('request_approve') ||
                 permissionList.includes('schedule_manage')) {
            return this.renderManagerDashboard();
        } 
        // Worker: default view
        else {
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
        const userData = SimpleStorage.get('userData');
        
        // Determine if user has schedule management permissions
        const permissions = userData?.permissions || '';
        const permissionList = permissions.split(',');
        const isManager = permissionList.includes('schedule_manage') || permissionList.includes('shift_manage');
        
        // Permission-based schedule view
        if (isManager) {
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
        const schedule = await apiClient.get('/schedule', weekStart);
        
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
            const result = await apiClient.post('/shifts/register', { date, shiftType: 'morning' });
            
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
        const teamSchedule = await apiClient.get('/team-schedule', weekStart);
        
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

        try {
            // Fix: API call should pass employeeId as parameter object
            const response = await apiClient.get('/profile', { employeeId: this.employeeId });
            const profile = response.data || response;
            
            if (!profile) {
                container.innerHTML = '<div class="message error">Không thể tải thông tin</div>';
                return;
            }

            container.innerHTML = `
                <div class="form-group">
                    <label class="form-label">Mã nhân viên</label>
                    <input type="text" class="form-input" value="${profile.employeeId || ''}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Họ và tên</label>
                    <input type="text" class="form-input" id="profileName" value="${profile.fullName || ''}">
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
                    <label class="form-label">Phòng ban</label>
                    <input type="text" class="form-input" value="${profile.departmentId || ''}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Chức vụ</label>
                    <input type="text" class="form-input" value="${profile.positionId || ''}" disabled>
                </div>
                <button class="btn btn-primary btn-full" onclick="DashboardContent.saveProfile()">
                    <span class="material-icons-round">save</span>
                    Lưu thay đổi
                </button>
            `;
        } catch (error) {
            console.error('Error loading profile:', error);
            container.innerHTML = '<div class="message error">Không thể tải thông tin profile</div>';
        }
    },

    async saveProfile() {
        const name = document.getElementById('profileName')?.value;
        const email = document.getElementById('profileEmail')?.value;
        const phone = document.getElementById('profilePhone')?.value;

        const result = await apiClient.put('/profile/update', {
            fullName: name,
            email,
            phone
        });

        if (result.success) {
            showNotification('Cập nhật thông tin thành công', 'success');
        } else {
            showNotification('Không thể cập nhật thông tin', 'error');
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
                    <button class="btn btn-primary btn-full mb-md" onclick="DashboardContent.performAttendance()">
                        <span class="material-icons-round">fingerprint</span>
                        Chấm công
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

    async performAttendance() {
        if (!navigator.geolocation) {
            showNotification('Trình duyệt không hỗ trợ GPS', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const result = await apiClient.post('/gps/check', {
                    employeeId: this.employeeId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });

                if (result.success) {
                    showNotification('Chấm công thành công!', 'success');
                    this.loadAttendanceHistory();
                } else {
                    showNotification(result.message || 'Chấm công thất bại', 'error');
                }
            },
            (error) => {
                showNotification('Không thể lấy vị trí GPS', 'error');
                console.error('GPS error:', error);
            }
        );
    },

    async loadAttendanceHistory() {
        const container = document.getElementById('attendanceHistory');
        if (!container) return;

        // Only get today's attendance records
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const attendance = await apiClient.get('/attendance', { 
            employeeId: this.employeeId, 
            startDate: todayStr, 
            endDate: todayStr 
        });
        
        if (!attendance || !attendance.data || attendance.data.length === 0) {
            container.innerHTML = '<div class="message">Chưa có dữ liệu chấm công hôm nay</div>';
            return;
        }

        // Filter to only show today's records and records with valid checkTime
        const todayRecords = attendance.data.filter(record => {
            if (!record.checkDate || !record.checkTime) return false;
            const recordDate = new Date(record.checkDate).toISOString().split('T')[0];
            return recordDate === todayStr;
        });

        if (todayRecords.length === 0) {
            container.innerHTML = '<div class="message">Chưa có dữ liệu chấm công hôm nay</div>';
            return;
        }

        let html = '<div class="list">';
        todayRecords.forEach(record => {
            const checkTypeName = {
                'in': 'Chấm công',
                'out': 'Chấm công',
                'checkin': 'Chấm công',
                'checkout': 'Chấm công'
            }[record.checkType] || 'Chấm công';

            html += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${checkTypeName}</div>
                        <div class="list-item-subtitle">
                            Thời gian: ${record.checkTime}
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
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        // Store current selection in instance variables
        this.selectedMonth = this.selectedMonth || currentMonth;
        this.selectedYear = this.selectedYear || currentYear;

        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">table_chart</span>
                        Bảng công tháng ${this.selectedMonth}/${this.selectedYear}
                    </h2>
                    <div class="month-year-selector" style="display: flex; gap: 10px; margin-top: 10px;">
                        <select id="monthSelector" class="form-select" style="flex: 1;">
                            ${Array.from({length: 12}, (_, i) => i + 1).map(m => 
                                `<option value="${m}" ${m === this.selectedMonth ? 'selected' : ''}>Tháng ${m}</option>`
                            ).join('')}
                        </select>
                        <select id="yearSelector" class="form-select" style="flex: 1;">
                            ${[currentYear, currentYear - 1, currentYear - 2].map(y => 
                                `<option value="${y}" ${y === this.selectedYear ? 'selected' : ''}>${y}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div id="timesheetData">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.loadTimesheet(this.selectedMonth, this.selectedYear);
            this.attachTimesheetSelectors();
        }, 100);

        return content;
    },
    
    /**
     * Attach event listeners for month/year selectors
     */
    attachTimesheetSelectors() {
        const monthSelector = document.getElementById('monthSelector');
        const yearSelector = document.getElementById('yearSelector');
        
        if (monthSelector && yearSelector) {
            monthSelector.addEventListener('change', () => {
                this.selectedMonth = parseInt(monthSelector.value);
                this.loadTimesheet(this.selectedMonth, this.selectedYear);
            });
            
            yearSelector.addEventListener('change', () => {
                this.selectedYear = parseInt(yearSelector.value);
                this.loadTimesheet(this.selectedMonth, this.selectedYear);
            });
        }
    },

    async loadTimesheet(month, year) {
        const container = document.getElementById('timesheetData');
        if (!container) return;

        try {
            const response = await apiClient.get('/timesheet', { employeeId: this.employeeId, month, year });
            const timesheet = response.data || response;
            
            if (!timesheet) {
                container.innerHTML = '<div class="message">Chưa có bảng công</div>';
                return;
            }

            // Generate calendar grid
            const firstDay = new Date(year, month - 1, 1).getDay();
            const daysInMonth = new Date(year, month, 0).getDate();
            
            let calendarHTML = '<div class="calendar-container"><div class="calendar-grid">';
            
            // Calendar headers
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            dayNames.forEach(day => {
                calendarHTML += `<div class="calendar-header">${day}</div>`;
            });
            
            // Empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
            
            // Calendar days
            const records = timesheet.records || [];
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.getDay();
                
                // Find attendance record for this day
                const record = records.find(r => new Date(r.date).getDate() === day);
                
                let dayClass = 'calendar-day';
                let statusHTML = '';
                
                if (record) {
                    dayClass += ' clickable'; // Add clickable class
                    const hours = record.hoursWorked || 0;
                    if (record.status === 'present') {
                        dayClass += ' present';
                        statusHTML = `<span class="day-status success">${hours}h</span>`;
                    } else if (record.status === 'absent') {
                        dayClass += ' absent';
                        statusHTML = `<span class="day-status error">0h</span>`;
                    } else if (record.status === 'late') {
                        dayClass += ' late';
                        statusHTML = `<span class="day-status warning">${hours}h</span>`;
                    }
                } else {
                    statusHTML = '<span class="day-status">-</span>';
                }
                
                // Store record data as JSON for click handler
                const recordData = record ? JSON.stringify(record).replace(/"/g, '&quot;') : null;
                
                calendarHTML += `
                    <div class="${dayClass}" 
                         title="${record ? record.checkTime : 'Chưa chấm công'}"
                         ${record ? `onclick="DashboardContent.showAttendanceDetail(${recordData})"` : ''}
                         style="${record ? 'cursor: pointer;' : ''}">
                        <div class="day-number">${day}</div>
                        ${statusHTML}
                    </div>
                `;
            }
            
            calendarHTML += '</div></div>';
            
            // Summary section below calendar
            const summaryHTML = `
                <div class="timesheet-summary">
                    <h3>Tổng hợp tháng ${month}/${year}</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${timesheet.presentDays || 0}</div>
                            <div class="stat-label">Ngày đi làm</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${timesheet.totalHours || 0}h</div>
                            <div class="stat-label">Tổng giờ</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${timesheet.lateDays || 0}</div>
                            <div class="stat-label">Ngày đi trễ</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${timesheet.absentDays || 0}</div>
                            <div class="stat-label">Ngày vắng</div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = calendarHTML + summaryHTML;
        } catch (error) {
            console.error('Error loading timesheet:', error);
            container.innerHTML = '<div class="message error">Không thể tải bảng công</div>';
        }
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
                                <option value="forgot_attendance">Quên chấm công</option>
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
            showNotification('Vui lòng điền đầy đủ thông tin', 'warning');
            return;
        }

        const result = await apiClient.post('/requests/submit', {
            employeeId: this.employeeId,
            type,
            startDate,
            endDate,
            reason,
            status: 'pending'
        });

        if (result.success) {
            showNotification('Gửi yêu cầu thành công', 'success');
            document.getElementById('requestForm')?.reset();
        } else {
            showNotification(result.message || 'Không thể gửi yêu cầu', 'error');
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

        const requests = await apiClient.get('/requests', this.employeeId);
        
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

        const requests = await apiClient.get('/requests', );
        
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
        const result = await apiClient.post('/requests/approve', { requestId, reason: 'Đã duyệt' });
        
        if (result.success) {
            showNotification('Đã duyệt yêu cầu', 'success');
            this.loadPendingRequests();
        } else {
            showNotification('Không thể duyệt yêu cầu', 'error');
        }
    },

    async rejectRequest(requestId) {
        const result = await apiClient.post('/requests/reject', { requestId, reason: 'Không đủ điều kiện' });
        
        if (result.success) {
            showNotification('Đã từ chối yêu cầu', 'success');
            this.loadPendingRequests();
        } else {
            showNotification('Không thể từ chối yêu cầu', 'error');
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

        const registrations = await apiClient.get('/registrations', );
        
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
        const result = await apiClient.post('/registrations/approve', { employeeId });
        
        if (result.success) {
            showNotification('Đã duyệt đăng ký', 'success');
            this.loadPendingRegistrations();
        } else {
            showNotification('Không thể duyệt đăng ký', 'error');
        }
    },

    async rejectRegistration(employeeId) {
        const result = await apiClient.post('/registrations/reject', { employeeId, reason: 'Thông tin không đầy đủ' });
        
        if (result.success) {
            showNotification('Đã từ chối đăng ký', 'success');
            this.loadPendingRegistrations();
        } else {
            showNotification('Không thể từ chối đăng ký', 'error');
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

        const employees = await apiClient.get('/employees', );
        
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
        const result = await apiClient.put('/permissions/update', { employeeId, position: newPosition });
        
        if (result.success) {
            showNotification('Đã cập nhật quyền', 'success');
        } else {
            showNotification('Không thể cập nhật quyền', 'error');
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

        const notifications = await apiClient.get('/notifications', );
        
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
        await apiClient.post('/notifications/read', { notificationId });
        await this.updateNotificationBadge();
        await this.loadNotifications();
    },

    async markAllRead() {
        await apiClient.post('/notifications/read-all', {});
        await this.updateNotificationBadge();
        await this.loadNotifications();
    },

    async updateNotificationBadge() {
        const count = await apiClient.get('/notification-count', );
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

        const shifts = await apiClient.get('/shifts/available', weekStartStr);
        
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
        const result = await apiClient.post('/shifts/register', { shiftId });
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

        const notifications = await apiClient.get('/notifications', );
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
                await apiClient.post('/notifications/read', { notificationId: id });
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
        const count = await apiClient.get('/notification-count', );
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
    },

    // Additional render methods for admin dashboard
    async renderEmployeeManagement() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">groups</span>
                        Quản lý nhân viên
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderAttendanceApproval() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">fact_check</span>
                        Duyệt chấm công
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderShiftManagement() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">schedule</span>
                        Quản lý ca làm việc
                    </h2>
                </div>
                <div class="card-body">
                    <div id="shiftsList">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;
    },

    async renderReports() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">assessment</span>
                        Báo cáo tổng hợp
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderAnalytics() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">analytics</span>
                        Phân tích dữ liệu
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

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
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderSystemLogs() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">history</span>
                        Nhật ký hệ thống
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderWorkManagement() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">work</span>
                        Quản lý công việc
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">info</span>
                        <p>Xem thông tin công việc của bạn</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderSubmitRequest() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">send</span>
                        Gửi yêu cầu
                    </h2>
                </div>
                <div class="card-body">
                    <div class="message">
                        <span class="material-icons-round">construction</span>
                        <p>Chức năng đang được phát triển</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderShifts() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">schedule</span>
                        Ca làm
                    </h2>
                </div>
                <div class="card-body">
                    <div id="shiftsContent">
                        <div class="spinner-sm"></div>
                    </div>
                </div>
            </div>
        `;
    },

    async renderSalary() {
        // Delegate to HRMModules.CH.renderSalary which has full implementation
        const html = await HRMModules.CH.renderSalary();
        setTimeout(() => HRMModules.CH.initSalary(), 100);
        return html;
    },

    async renderLeaveRequest() {
        // Delegate to HRMModules.CH.renderRequests which has full implementation
        const html = await HRMModules.CH.renderRequests();
        setTimeout(() => HRMModules.CH.initRequests(), 100);
        return html;
    },
    
    async renderProcessRequests() {
        // Manager/Admin module for processing employee requests
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">pending_actions</span>
                        Xử Lý Yêu Cầu
                    </h2>
                    <div class="filters">
                        <select id="requestStatusFilter" class="form-select">
                            <option value="">Tất cả</option>
                            <option value="pending" selected>Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Đã từ chối</option>
                        </select>
                    </div>
                </div>
                <div class="card-body" id="pendingRequestsList">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
            
            <!-- Request Review Modal -->
            <div id="reviewModal" class="modal" style="display: none;">
                <div class="modal-backdrop" onclick="DashboardContent.closeReviewModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Xét Duyệt Yêu Cầu</h3>
                        <button class="modal-close" onclick="DashboardContent.closeReviewModal()">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="reviewRequestDetails"></div>
                        <form id="reviewForm">
                            <input type="hidden" id="reviewRequestId">
                            <div class="form-group">
                                <label>Ghi chú (tùy chọn)</label>
                                <textarea id="reviewNote" class="form-control" rows="3" placeholder="Nhập ghi chú..."></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-danger" onclick="DashboardContent.reviewRequest('rejected')">
                                    <span class="material-icons-round">close</span>
                                    Từ chối
                                </button>
                                <button type="button" class="btn btn-success" onclick="DashboardContent.reviewRequest('approved')">
                                    <span class="material-icons-round">check</span>
                                    Phê duyệt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initProcessRequests() {
        await this.loadPendingRequests();
        
        // Setup filter change handler
        const filter = document.getElementById('requestStatusFilter');
        if (filter) {
            filter.addEventListener('change', () => this.loadPendingRequests());
        }
    },
    
    async loadPendingRequests() {
        const container = document.getElementById('pendingRequestsList');
        const statusFilter = document.getElementById('requestStatusFilter')?.value || 'pending';
        
        if (!container) return;
        
        try {
            const requests = await apiClient.get('/requests/all', {
                status: statusFilter,
                limit: 100
            });
            
            if (requests.data && requests.data.length > 0) {
                container.innerHTML = `
                    <div class="requests-list">
                        ${requests.data.map((req, index) => `
                            <div class="request-item ${req.status}" data-request-index="${index}" style="cursor: pointer;">
                                <div class="request-header">
                                    <div class="request-type">
                                        <span class="material-icons-round">${this.getRequestIcon(req.requestType)}</span>
                                        <strong>${this.getRequestTypeName(req.requestType)}</strong>
                                    </div>
                                    <span class="badge badge-${req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}">
                                        ${req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                                    </span>
                                </div>
                                <div class="request-body">
                                    <div class="employee-info">
                                        <span class="material-icons-round">person</span>
                                        ${req.employeeName || req.employeeId || ''}
                                    </div>
                                    <p><strong>Lý do:</strong> ${req.reason || req.description || 'Không có'}</p>
                                    <p><strong>Thời gian:</strong> ${req.fromDate || req.requestDate || req.currentShiftDate || ''}${req.toDate && req.toDate !== req.fromDate ? ' đến ' + req.toDate : req.requestedShiftDate && req.requestedShiftDate !== req.currentShiftDate ? ' đến ' + req.requestedShiftDate : ''}</p>
                                    <p><small>Tạo lúc: ${new Date(req.createdAt).toLocaleString('vi-VN')}</small></p>
                                    ${req.reviewedBy ? `
                                    <p><small>Duyệt bởi: ${req.reviewerName || 'Quản lý'} - ${new Date(req.reviewedAt).toLocaleString('vi-VN')}</small></p>
                                    ${req.rejectionReason ? `<p><small>Lý do từ chối: ${req.rejectionReason}</small></p>` : ''}
                                    ` : ''}
                                </div>
                                ${req.status === 'pending' ? `
                                <div class="request-actions">
                                    <button class="btn btn-sm btn-primary" data-request-id="${req.requestId}" data-action="review">
                                        Xét duyệt
                                    </button>
                                </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
                
                // Store requests data for later use
                this.currentRequests = requests.data;
                
                // Add click event listeners
                const requestItems = container.querySelectorAll('.request-item');
                requestItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        // Don't trigger if clicking on the review button
                        if (e.target.closest('[data-action="review"]')) {
                            return;
                        }
                        const index = parseInt(item.getAttribute('data-request-index'));
                        const request = this.currentRequests[index];
                        this.showRequestDetail(request);
                    });
                });
                
                // Add click event listeners for review buttons
                const reviewButtons = container.querySelectorAll('[data-action="review"]');
                reviewButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const requestId = btn.getAttribute('data-request-id');
                        const request = this.currentRequests.find(r => r.requestId == requestId);
                        if (request) {
                            this.showReviewModal(requestId, request);
                        }
                    });
                });
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="material-icons-round">assignment</span>
                        <p>Không có yêu cầu ${statusFilter === 'pending' ? 'chờ duyệt' : statusFilter === 'approved' ? 'đã duyệt' : statusFilter === 'rejected' ? 'đã từ chối' : ''}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading pending requests:', error);
            container.innerHTML = '<p class="text-error">Lỗi khi tải danh sách yêu cầu</p>';
        }
    },
    
    showReviewModal(requestId, requestData) {
        const modal = document.getElementById('reviewModal');
        const details = document.getElementById('reviewRequestDetails');
        
        if (modal && details) {
            details.innerHTML = `
                <div class="request-review-details">
                    <div class="detail-row">
                        <strong>Nhân viên:</strong> ${requestData.employeeName || requestData.employeeId}
                    </div>
                    <div class="detail-row">
                        <strong>Loại yêu cầu:</strong> ${this.getRequestTypeName(requestData.type)}
                    </div>
                    <div class="detail-row">
                        <strong>Thời gian:</strong> ${requestData.startDate}${requestData.endDate ? ' đến ' + requestData.endDate : ''}
                    </div>
                    <div class="detail-row">
                        <strong>Lý do:</strong> ${requestData.reason}
                    </div>
                    <div class="detail-row">
                        <strong>Ngày tạo:</strong> ${new Date(requestData.createdAt).toLocaleString('vi-VN')}
                    </div>
                </div>
            `;
            
            document.getElementById('reviewRequestId').value = requestId;
            modal.style.display = 'flex';
        }
    },
    
    closeReviewModal() {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('reviewForm').reset();
        }
    },
    
    async reviewRequest(decision) {
        const requestId = document.getElementById('reviewRequestId').value;
        const note = document.getElementById('reviewNote').value;
        
        try {
            await apiClient.post(`/requests/${requestId}/review`, {
                decision,
                note
            });
            
            this.closeReviewModal();
            await this.loadPendingRequests();
            
            showNotification(
                decision === 'approved' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu',
                'success'
            );
        } catch (error) {
            console.error('Error reviewing request:', error);
            showNotification('Lỗi khi xử lý yêu cầu', 'error');
        }
    },
    
    getRequestIcon(type) {
        const icons = {
            'leave': 'event_busy',
            'overtime': 'schedule',
            'shift_change': 'swap_horiz',
            'shift_swap': 'swap_calls',
            'forgot_attendance': 'schedule',
            'forgot_checkin': 'schedule',
            'forgot_checkout': 'schedule',
            'early_leave': 'exit_to_app',
            'late_arrival': 'access_time',
            'general': 'help_outline',
            'other': 'help_outline'
        };
        return icons[type] || 'assignment';
    },
    
    getRequestTypeName(type) {
        const names = {
            'leave': 'Nghỉ phép',
            'overtime': 'Tăng ca',
            'shift_change': 'Đổi ca',
            'shift_swap': 'Đổi ca với đồng nghiệp',
            'forgot_attendance': 'Quên chấm công',
            'forgot_checkin': 'Quên chấm công',
            'forgot_checkout': 'Quên chấm công',
            'early_leave': 'Về sớm',
            'late_arrival': 'Đi muộn',
            'general': 'Yêu cầu chung',
            'other': 'Khác'
        };
        return names[type] || type;
    },
    
    /**
     * Show attendance detail modal for a calendar day
     */
    showAttendanceDetail(record) {
        if (!record) return;
        
        const statusText = {
            'present': 'Có mặt',
            'late': 'Đi trễ',
            'absent': 'Vắng'
        }[record.status] || record.status;
        
        const statusClass = {
            'present': 'success',
            'late': 'warning',
            'absent': 'danger'
        }[record.status] || 'info';
        
        // Combine checkTimes and related requests into activity list
        const activityList = [];
        
        // Add check times as activities
        if (record.checkTimes && record.checkTimes.length > 0) {
            record.checkTimes.forEach(ct => {
                activityList.push({
                    type: 'attendance',
                    time: ct.checkTime,
                    label: 'Chấm công'
                });
            });
        }
        
        // Add related requests as activities
        if (record.relatedRequests && record.relatedRequests.length > 0) {
            record.relatedRequests.forEach(req => {
                activityList.push({
                    type: 'request',
                    time: req.requestDate || req.fromDate || req.createdAt,
                    label: 'Đơn từ',
                    requestType: this.getRequestTypeName(req.requestType),
                    status: req.status,
                    reason: req.reason || req.description
                });
            });
        }
        
        // Sort by time if available
        activityList.sort((a, b) => {
            if (!a.time || !b.time) return 0;
            return a.time.localeCompare(b.time);
        });
        
        // Generate activity list HTML
        const activityListHTML = activityList.length > 0 ? activityList.map(activity => {
            if (activity.type === 'attendance') {
                return `
                    <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span style="color: var(--text-secondary, #b0b3b8);">${activity.label}</span>
                        <span style="color: var(--text-primary, #e4e6eb); font-weight: 600;">${activity.time}</span>
                    </div>
                `;
            } else {
                return `
                    <div class="activity-item" style="padding: 10px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: var(--text-secondary, #b0b3b8);">${activity.label} - ${activity.requestType}</span>
                            <span style="color: var(--text-primary, #e4e6eb); font-weight: 600;">${activity.time ? new Date(activity.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : ''}</span>
                        </div>
                        ${activity.reason ? `<div style="color: var(--text-secondary, #b0b3b8); font-size: 12px; margin-top: 4px;">${activity.reason}</div>` : ''}
                    </div>
                `;
            }
        }).join('') : '<div style="color: var(--text-secondary, #b0b3b8); font-size: 13px; padding: 10px 0;">Chưa có dữ liệu</div>';
        
        const modalHTML = `
            <div class="modal-overlay" id="attendanceDetailModal" onclick="this.remove()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;">
                <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--bg-card, #1e2228); border-radius: 12px; max-width: 450px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <h3 style="margin: 0; color: var(--text-primary, #e4e6eb);">Chi tiết chấm công</h3>
                        <button class="close-btn" onclick="document.getElementById('attendanceDetailModal').remove()" style="background: transparent; border: none; color: var(--text-secondary, #b0b3b8); cursor: pointer; padding: 4px;">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        <div class="attendance-detail-card">
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ngày:</span>
                                <span class="detail-value"><strong style="color: var(--text-primary, #e4e6eb);">${new Date(record.date).toLocaleDateString('vi-VN')}</strong></span>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ca làm:</span>
                                <span class="detail-value" style="color: var(--text-primary, #e4e6eb); font-weight: 600;">${record.shiftTimeName || record.shiftName || 'N/A'}</span>
                            </div>
                            
                            <div class="detail-section" style="margin: 16px 0;">
                                <h4 style="color: var(--text-primary, #e4e6eb); margin: 0 0 12px 0; font-size: 14px;">Hoạt động trong ngày:</h4>
                                ${activityListHTML}
                            </div>
                            
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-top: 16px; border-top: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Số giờ làm:</span>
                                <span class="detail-value" style="color: var(--success, #3fb950); font-weight: 700; font-size: 16px;">${record.hoursWorked || 0} giờ</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="display: flex; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid var(--border-color, #2d3139);">
                        <button class="btn btn-secondary" onclick="document.getElementById('attendanceDetailModal').remove()" style="padding: 10px 20px; background: var(--bg-secondary, #2d3139); color: var(--text-primary, #e4e6eb); border: none; border-radius: 8px; cursor: pointer;">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    /**
     * Show request detail modal
     */
    showRequestDetail(request) {
        if (!request) return;
        
        // Close any existing modal
        const existingModal = document.getElementById('requestDetailModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const statusClass = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        }[request.status] || 'info';
        
        const statusText = {
            'pending': 'Chờ duyệt',
            'approved': 'Đã duyệt',
            'rejected': 'Đã từ chối'
        }[request.status] || request.status;
        
        // Build type-specific fields based on requestType
        let typeSpecificFields = '';
        
        switch(request.requestType) {
            case 'leave':
                // Nghỉ phép: fromDate, toDate, reason
                typeSpecificFields = `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Từ ngày:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.fromDate || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Đến ngày:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.toDate || 'N/A'}</span>
                    </div>
                `;
                break;
                
            case 'overtime':
                // Tăng ca: requestDate, startTime, endTime, reason
                typeSpecificFields = `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ngày tăng ca:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.requestDate || 'N/A'}</span>
                    </div>
                    ${request.startTime ? `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Giờ bắt đầu:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.startTime}</span>
                    </div>
                    ` : ''}
                    ${request.endTime ? `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Giờ kết thúc:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.endTime}</span>
                    </div>
                    ` : ''}
                `;
                break;
                
            case 'shift_change':
                // Đổi ca: currentShiftDate, currentShiftId, requestedShiftDate, requestedShiftId, reason
                typeSpecificFields = `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ca hiện tại:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.currentShiftDate || 'N/A'} ${request.currentShiftId ? `(${request.currentShiftId})` : ''}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ca muốn đổi:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.requestedShiftDate || 'N/A'} ${request.requestedShiftId ? `(${request.requestedShiftId})` : ''}</span>
                    </div>
                `;
                break;
                
            case 'shift_swap':
                // Đổi ca với đồng nghiệp: currentShiftDate, requestedShiftDate, swapWithEmployeeId, reason
                typeSpecificFields = `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ca hiện tại:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.currentShiftDate || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ca muốn đổi:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.requestedShiftDate || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Đổi với nhân viên:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.swapWithEmployeeId || 'N/A'}</span>
                    </div>
                `;
                break;
                
            case 'forgot_attendance':
            case 'forgot_checkin':
            case 'forgot_checkout':
                // Quên chấm công: requestDate, actualTime (extracted from description), reason
                // Extract time from description if present (e.g., "Quên chấm công vào lúc 08:00")
                let forgotTime = request.actualTime || '';
                if (!forgotTime && request.description) {
                    const timeMatch = request.description.match(/(\d{1,2}:\d{2})/);
                    if (timeMatch) {
                        forgotTime = timeMatch[1];
                    }
                }
                
                typeSpecificFields = `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ngày quên chấm:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.requestDate || 'N/A'}</span>
                    </div>
                    ${forgotTime ? `
                    <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Giờ quên chấm công:</span>
                        <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${forgotTime}</span>
                    </div>
                    ` : ''}
                `;
                break;
                
            case 'general':
            default:
                // Yêu cầu chung: requestDate, reason, description
                if (request.requestDate) {
                    typeSpecificFields = `
                        <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                            <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ngày yêu cầu:</span>
                            <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.requestDate}</span>
                        </div>
                    `;
                }
                break;
        }
        
        const modalHTML = `
            <div class="modal-overlay" id="requestDetailModal" onclick="this.remove()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;">
                <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--bg-card, #1e2228); border-radius: 12px; max-width: 450px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color, #2d3139);">
                        <h3 style="margin: 0; color: var(--text-primary, #e4e6eb);">Chi tiết đơn từ</h3>
                        <button class="close-btn" onclick="document.getElementById('requestDetailModal').remove()" style="background: transparent; border: none; color: var(--text-secondary, #b0b3b8); cursor: pointer; padding: 4px;">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        <div class="request-detail-card">
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Loại đơn:</span>
                                <span class="detail-value" style="color: var(--text-primary, #e4e6eb); font-weight: 600;">${this.getRequestTypeName(request.requestType)}</span>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Trạng thái:</span>
                                <span class="badge badge-${statusClass}">${statusText}</span>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Nhân viên:</span>
                                <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.employeeName || request.employeeId}</span>
                            </div>
                            ${typeSpecificFields}
                            <div class="detail-section" style="margin: 16px 0; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <h4 style="color: var(--text-secondary, #b0b3b8); margin: 0 0 8px 0; font-size: 14px;">Lý do:</h4>
                                <p style="color: var(--text-primary, #e4e6eb); margin: 0; line-height: 1.6;">${request.reason || request.description || 'Không có'}</p>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Tạo lúc:</span>
                                <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${new Date(request.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            ${request.reviewedBy ? `
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Duyệt bởi:</span>
                                <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.reviewerName || 'Quản lý'}</span>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                                <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Duyệt lúc:</span>
                                <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${new Date(request.reviewedAt).toLocaleString('vi-VN')}</span>
                            </div>
                            ${request.rejectionReason ? `
                            <div class="detail-section" style="margin: 16px 0; padding: 12px 0;">
                                <h4 style="color: var(--error, #f85149); margin: 0 0 8px 0; font-size: 14px;">Lý do từ chối:</h4>
                                <p style="color: var(--text-primary, #e4e6eb); margin: 0; line-height: 1.6;">${request.rejectionReason}</p>
                            </div>
                            ` : ''}
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--border-color, #2d3139);">
                        ${request.status === 'pending' ? `
                        <button class="btn btn-primary" id="modalReviewBtn-${request.requestId}" style="padding: 10px 20px; background: var(--brand, #0969da); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Xét duyệt
                        </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="document.getElementById('requestDetailModal').remove()" style="padding: 10px 20px; background: var(--bg-secondary, #2d3139); color: var(--text-primary, #e4e6eb); border: none; border-radius: 8px; cursor: pointer;">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener for review button if it exists
        if (request.status === 'pending') {
            const reviewBtn = document.getElementById(`modalReviewBtn-${request.requestId}`);
            if (reviewBtn) {
                reviewBtn.addEventListener('click', () => {
                    document.getElementById('requestDetailModal').remove();
                    this.showReviewModal(request.requestId, request);
                });
            }
        }
    },
    
    /**
     * System Settings Module
     */
    async renderSystemSettings() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-icons-round">settings</span>
                        Cài Đặt Hệ Thống
                    </h2>
                </div>
                <div class="card-body">
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="general">
                            <span class="material-icons-round">tune</span>
                            Chung
                        </button>
                        <button class="tab-btn" data-tab="attendance">
                            <span class="material-icons-round">schedule</span>
                            Chấm công
                        </button>
                        <button class="tab-btn" data-tab="notifications">
                            <span class="material-icons-round">notifications</span>
                            Thông báo
                        </button>
                        <button class="tab-btn" data-tab="security">
                            <span class="material-icons-round">security</span>
                            Bảo mật
                        </button>
                    </div>
                    
                    <div class="settings-content">
                        <!-- General Settings Tab -->
                        <div class="tab-content active" id="general-tab">
                            <h3 class="section-title">Cài Đặt Chung</h3>
                            <form id="generalSettingsForm">
                                <div class="form-group">
                                    <label for="companyName">Tên công ty</label>
                                    <input type="text" id="companyName" class="form-control" value="Công Ty TNHH ABC" required>
                                </div>
                                <div class="form-group">
                                    <label for="timezone">Múi giờ</label>
                                    <select id="timezone" class="form-control">
                                        <option value="Asia/Ho_Chi_Minh" selected>Việt Nam (GMT+7)</option>
                                        <option value="Asia/Bangkok">Thailand (GMT+7)</option>
                                        <option value="Asia/Singapore">Singapore (GMT+8)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="language">Ngôn ngữ</label>
                                    <select id="language" class="form-control">
                                        <option value="vi" selected>Tiếng Việt</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="dateFormat">Định dạng ngày</label>
                                    <select id="dateFormat" class="form-control">
                                        <option value="dd/MM/yyyy" selected>DD/MM/YYYY</option>
                                        <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                                        <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                            </form>
                        </div>
                        
                        <!-- Attendance Settings Tab -->
                        <div class="tab-content" id="attendance-tab">
                            <h3 class="section-title">Cài Đặt Chấm Công</h3>
                            <form id="attendanceSettingsForm">
                                <div class="form-group">
                                    <label for="gpsRadius">Bán kính GPS cho phép (mét)</label>
                                    <input type="number" id="gpsRadius" class="form-control" value="100" min="10" max="1000" required>
                                    <small class="form-text">Nhân viên phải ở trong bán kính này để chấm công</small>
                                </div>
                                <div class="form-group">
                                    <label for="lateThreshold">Thời gian trễ tối đa (phút)</label>
                                    <input type="number" id="lateThreshold" class="form-control" value="15" min="0" max="60" required>
                                    <small class="form-text">Số phút trễ được xem là "Đi trễ" thay vì "Vắng"</small>
                                </div>
                                <div class="form-group">
                                    <label for="requirePhoto">
                                        <input type="checkbox" id="requirePhoto" checked>
                                        Yêu cầu chụp ảnh khi chấm công
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label for="allowMultipleCheckins">
                                        <input type="checkbox" id="allowMultipleCheckins" checked>
                                        Cho phép chấm công nhiều lần trong ngày
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label for="autoApproveOvertimeHours">Số giờ tăng ca tự động duyệt</label>
                                    <input type="number" id="autoApproveOvertimeHours" class="form-control" value="0" min="0" max="24" step="0.5">
                                    <small class="form-text">0 = Không tự động duyệt</small>
                                </div>
                                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                            </form>
                        </div>
                        
                        <!-- Notification Settings Tab -->
                        <div class="tab-content" id="notifications-tab">
                            <h3 class="section-title">Cài Đặt Thông Báo</h3>
                            <form id="notificationSettingsForm">
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="emailNotifications" checked>
                                        Gửi email thông báo
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="smsNotifications">
                                        Gửi SMS thông báo
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="pushNotifications" checked>
                                        Thông báo đẩy (Push notification)
                                    </label>
                                </div>
                                <div class="form-group">
                                    <h4>Loại thông báo</h4>
                                    <label>
                                        <input type="checkbox" id="notifyRequests" checked>
                                        Yêu cầu mới từ nhân viên
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="notifyTimesheet" checked>
                                        Bảng công cần duyệt
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="notifySchedule" checked>
                                        Lịch làm việc mới
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="notifyBirthday" checked>
                                        Sinh nhật nhân viên
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                            </form>
                        </div>
                        
                        <!-- Security Settings Tab -->
                        <div class="tab-content" id="security-tab">
                            <h3 class="section-title">Cài Đặt Bảo Mật</h3>
                            <form id="securitySettingsForm">
                                <div class="form-group">
                                    <label for="sessionTimeout">Thời gian hết phiên (phút)</label>
                                    <input type="number" id="sessionTimeout" class="form-control" value="30" min="5" max="480" required>
                                    <small class="form-text">Tự động đăng xuất sau thời gian không hoạt động</small>
                                </div>
                                <div class="form-group">
                                    <label for="passwordMinLength">Độ dài mật khẩu tối thiểu</label>
                                    <input type="number" id="passwordMinLength" class="form-control" value="8" min="6" max="32" required>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="requirePasswordComplex" checked>
                                        Yêu cầu mật khẩu phức tạp (chữ hoa, chữ thường, số, ký tự đặc biệt)
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label for="passwordExpiryDays">Mật khẩu hết hạn sau (ngày)</label>
                                    <input type="number" id="passwordExpiryDays" class="form-control" value="90" min="0" max="365">
                                    <small class="form-text">0 = Không hết hạn</small>
                                </div>
                                <div class="form-group">
                                    <label for="maxLoginAttempts">Số lần đăng nhập sai tối đa</label>
                                    <input type="number" id="maxLoginAttempts" class="form-control" value="5" min="3" max="10" required>
                                </div>
                                <div class="form-group">
                                    <label for="lockoutDuration">Thời gian khóa tài khoản (phút)</label>
                                    <input type="number" id="lockoutDuration" class="form-control" value="15" min="5" max="120" required>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="enable2FA">
                                        Bật xác thực hai yếu tố (2FA)
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initSystemSettings() {
        // Load current settings
        await this.loadSystemSettings();
        
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchSettingsTab(tab);
            });
        });
        
        // Form submissions
        const forms = [
            'generalSettingsForm',
            'attendanceSettingsForm',
            'notificationSettingsForm',
            'securitySettingsForm'
        ];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveSettings(formId);
                });
            }
        });
    },
    
    switchSettingsTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    async loadSystemSettings() {
        try {
            const settings = await apiClient.get('/settings');
            
            if (settings && settings.data) {
                // Populate form fields with saved settings
                Object.keys(settings.data).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = settings.data[key];
                        } else {
                            element.value = settings.data[key];
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Use default values from HTML
        }
    },
    
    async saveSettings(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const formData = new FormData(form);
        const settings = {};
        
        // Get all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                settings[input.id] = input.checked;
            } else {
                settings[input.id] = input.value;
            }
        });
        
        try {
            await apiClient.post('/settings', settings);
            showNotification('Đã lưu cài đặt thành công', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification('Lỗi khi lưu cài đặt', 'error');
        }
    },

    /**
     * ATTENDANCE APPROVAL MODULE
     * Manager approves daily attendance records
     */
    async renderAttendanceApproval() {
        const userData = this.getUserData();
        
        return `
            <div class="content-header">
                <h1 class="page-title">
                    <span class="material-icons">fact_check</span>
                    Duyệt Chấm Công
                </h1>
            </div>
            
            <div class="content-body">
                <!-- Filter Section -->
                <div class="filter-section" style="background: var(--card-bg, #242526); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ngày:</label>
                            <input type="date" id="filterDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Phòng ban:</label>
                            <select id="filterDepartment" class="form-control">
                                <option value="">Tất cả</option>
                                <option value="IT">Công nghệ thông tin</option>
                                <option value="HR">Nhân sự</option>
                                <option value="SALES">Kinh doanh</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Trạng thái:</label>
                            <select id="filterStatus" class="form-control">
                                <option value="pending">Chờ duyệt</option>
                                <option value="all">Tất cả</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Đã từ chối</option>
                            </select>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button id="btnFilterAttendance" class="btn btn-primary" style="width: 100%;">
                                <span class="material-icons" style="font-size: 18px;">search</span>
                                Lọc
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Attendance List -->
                <div id="attendanceApprovalList" class="list">
                    <div class="loading">Đang tải dữ liệu...</div>
                </div>
            </div>
        `;
    },

    async initAttendanceApproval() {
        await this.loadAttendanceForApproval();
        
        document.getElementById('btnFilterAttendance')?.addEventListener('click', () => {
            this.loadAttendanceForApproval();
        });
    },

    async loadAttendanceForApproval() {
        const container = document.getElementById('attendanceApprovalList');
        if (!container) return;
        
        const date = document.getElementById('filterDate')?.value || new Date().toISOString().split('T')[0];
        const department = document.getElementById('filterDepartment')?.value || '';
        const status = document.getElementById('filterStatus')?.value || 'pending';
        
        // Mock data - replace with actual API call
        const mockAttendance = [
            {
                id: 1,
                employeeId: 'E102',
                employeeName: 'Trần Văn B',
                department: 'IT',
                date: date,
                checkIn: '08:05',
                checkOut: '17:30',
                shift: 'Ca sáng (08:00-17:00)',
                status: 'pending',
                hours: 9.5,
                isLate: true,
                lateMinutes: 5
            },
            {
                id: 2,
                employeeId: 'E103',
                employeeName: 'Phạm Thị C',
                department: 'HR',
                date: date,
                checkIn: '08:00',
                checkOut: '18:00',
                shift: 'Ca sáng (08:00-17:00)',
                status: 'pending',
                hours: 10,
                overtime: 1
            },
            {
                id: 3,
                employeeId: 'E104',
                employeeName: 'Lê Văn D',
                department: 'SALES',
                date: date,
                checkIn: '08:00',
                checkOut: null,
                shift: 'Ca sáng (08:00-17:00)',
                status: 'pending',
                hours: 0,
                missingCheckout: true
            }
        ];
        
        const filtered = mockAttendance.filter(record => {
            if (department && record.department !== department) return false;
            if (status !== 'all' && record.status !== status) return false;
            return true;
        });
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Không có dữ liệu chấm công</div>';
            return;
        }
        
        container.innerHTML = filtered.map(record => {
            const statusBadge = {
                'pending': '<span class="badge badge-warning">Chờ duyệt</span>',
                'approved': '<span class="badge badge-success">Đã duyệt</span>',
                'rejected': '<span class="badge badge-danger">Từ chối</span>'
            }[record.status];
            
            const issues = [];
            if (record.isLate) issues.push(`Trễ ${record.lateMinutes} phút`);
            if (record.missingCheckout) issues.push('Thiếu chấm ra');
            if (record.overtime) issues.push(`OT: ${record.overtime}h`);
            
            return `
                <div class="list-item" style="cursor: pointer;" data-attendance-id="${record.id}">
                    <div class="list-item-content">
                        <div class="list-item-title">
                            ${record.employeeName} (${record.employeeId})
                            ${statusBadge}
                        </div>
                        <div class="list-item-subtitle">
                            ${record.shift} | ${record.department}
                        </div>
                        <div class="list-item-meta">
                            Vào: ${record.checkIn || 'N/A'} | Ra: ${record.checkOut || 'N/A'} | ${record.hours}h
                            ${issues.length > 0 ? `<br><span style="color: var(--warning, #ffa500);">${issues.join(' • ')}</span>` : ''}
                        </div>
                    </div>
                    ${record.status === 'pending' ? `
                    <div class="list-item-action">
                        <button class="btn btn-sm btn-success approve-attendance" data-id="${record.id}">
                            <span class="material-icons">check</span>
                        </button>
                        <button class="btn btn-sm btn-danger reject-attendance" data-id="${record.id}">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Add event listeners
        document.querySelectorAll('.approve-attendance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.approveAttendance(btn.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.reject-attendance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.rejectAttendance(btn.getAttribute('data-id'));
            });
        });
    },

    async approveAttendance(id) {
        if (!confirm('Xác nhận duyệt chấm công này?')) return;
        
        try {
            // await apiClient.post(`/attendance/${id}/approve`);
            showNotification('Đã duyệt chấm công', 'success');
            await this.loadAttendanceForApproval();
        } catch (error) {
            showNotification('Lỗi khi duyệt chấm công', 'error');
        }
    },

    async rejectAttendance(id) {
        const reason = prompt('Lý do từ chối:');
        if (!reason) return;
        
        try {
            // await apiClient.post(`/attendance/${id}/reject`, { reason });
            showNotification('Đã từ chối chấm công', 'success');
            await this.loadAttendanceForApproval();
        } catch (error) {
            showNotification('Lỗi khi từ chối chấm công', 'error');
        }
    },

    /**
     * TIMESHEET APPROVAL MODULE
     * Manager approves monthly timesheets
     */
    async renderTimesheetApproval() {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        return `
            <div class="content-header">
                <h1 class="page-title">
                    <span class="material-icons">assignment_turned_in</span>
                    Duyệt Bảng Công
                </h1>
            </div>
            
            <div class="content-body">
                <!-- Filter Section -->
                <div class="filter-section" style="background: var(--card-bg, #242526); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Tháng:</label>
                            <select id="filterMonth" class="form-control">
                                ${Array.from({length: 12}, (_, i) => `<option value="${i+1}" ${i+1 === currentMonth ? 'selected' : ''}>Tháng ${i+1}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Năm:</label>
                            <select id="filterYear" class="form-control">
                                <option value="2024">2024</option>
                                <option value="2025" selected>2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Phòng ban:</label>
                            <select id="filterDeptTimesheet" class="form-control">
                                <option value="">Tất cả</option>
                                <option value="IT">Công nghệ thông tin</option>
                                <option value="HR">Nhân sự</option>
                                <option value="SALES">Kinh doanh</option>
                            </select>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button id="btnFilterTimesheet" class="btn btn-primary" style="width: 100%;">
                                <span class="material-icons" style="font-size: 18px;">search</span>
                                Lọc
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Timesheet List -->
                <div id="timesheetApprovalList" class="list">
                    <div class="loading">Đang tải dữ liệu...</div>
                </div>
            </div>
        `;
    },

    async initTimesheetApproval() {
        await this.loadTimesheetForApproval();
        
        document.getElementById('btnFilterTimesheet')?.addEventListener('click', () => {
            this.loadTimesheetForApproval();
        });
    },

    async loadTimesheetForApproval() {
        const container = document.getElementById('timesheetApprovalList');
        if (!container) return;
        
        const month = document.getElementById('filterMonth')?.value || new Date().getMonth() + 1;
        const year = document.getElementById('filterYear')?.value || new Date().getFullYear();
        const department = document.getElementById('filterDeptTimesheet')?.value || '';
        
        // Mock data
        const mockTimesheets = [
            {
                employeeId: 'E102',
                employeeName: 'Trần Văn B',
                department: 'IT',
                month: month,
                year: year,
                workDays: 22,
                actualDays: 20,
                leaveDays: 2,
                lateDays: 3,
                overtimeHours: 5,
                totalHours: 176,
                status: 'pending'
            },
            {
                employeeId: 'E103',
                employeeName: 'Phạm Thị C',
                department: 'HR',
                month: month,
                year: year,
                workDays: 22,
                actualDays: 22,
                leaveDays: 0,
                lateDays: 0,
                overtimeHours: 0,
                totalHours: 176,
                status: 'pending'
            }
        ];
        
        const filtered = mockTimesheets.filter(ts => {
            if (department && ts.department !== department) return false;
            return true;
        });
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Không có bảng công</div>';
            return;
        }
        
        container.innerHTML = filtered.map(ts => `
            <div class="list-item" style="cursor: pointer;" data-employee-id="${ts.employeeId}">
                <div class="list-item-content">
                    <div class="list-item-title">
                        ${ts.employeeName} (${ts.employeeId})
                        <span class="badge badge-warning">Chờ duyệt</span>
                    </div>
                    <div class="list-item-subtitle">
                        ${ts.department} | Tháng ${ts.month}/${ts.year}
                    </div>
                    <div class="list-item-meta">
                        Công: ${ts.actualDays}/${ts.workDays} ngày | Nghỉ: ${ts.leaveDays} | Trễ: ${ts.lateDays} | OT: ${ts.overtimeHours}h
                    </div>
                </div>
                ${ts.status === 'pending' ? `
                <div class="list-item-action">
                    <button class="btn btn-sm btn-success approve-timesheet" data-id="${ts.employeeId}">
                        <span class="material-icons">check</span>
                    </button>
                    <button class="btn btn-sm btn-danger reject-timesheet" data-id="${ts.employeeId}">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                ` : ''}
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.approve-timesheet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.approveTimesheet(btn.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.reject-timesheet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.rejectTimesheet(btn.getAttribute('data-id'));
            });
        });
    },

    async approveTimesheet(employeeId) {
        if (!confirm('Xác nhận duyệt bảng công?')) return;
        
        try {
            // await apiClient.post(`/timesheets/${employeeId}/approve`);
            showNotification('Đã duyệt bảng công', 'success');
            await this.loadTimesheetForApproval();
        } catch (error) {
            showNotification('Lỗi khi duyệt bảng công', 'error');
        }
    },

    async rejectTimesheet(employeeId) {
        const reason = prompt('Lý do từ chối:');
        if (!reason) return;
        
        try {
            // await apiClient.post(`/timesheets/${employeeId}/reject`, { reason });
            showNotification('Đã từ chối bảng công', 'success');
            await this.loadTimesheetForApproval();
        } catch (error) {
            showNotification('Lỗi khi từ chối bảng công', 'error');
        }
    },

    /**
     * SALARY MANAGEMENT MODULE
     * Admin manages employee salaries
     */
    async renderSalaryManagement() {
        return `
            <div class="content-header">
                <h1 class="page-title">
                    <span class="material-icons">payments</span>
                    Quản Lý Lương
                </h1>
                <button id="btnAddSalary" class="btn btn-primary">
                    <span class="material-icons">add</span>
                    Thêm Lương
                </button>
            </div>
            
            <div class="content-body">
                <!-- Filter Section -->
                <div class="filter-section" style="background: var(--card-bg, #242526); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Tháng:</label>
                            <select id="filterSalaryMonth" class="form-control">
                                ${Array.from({length: 12}, (_, i) => `<option value="${i+1}">Tháng ${i+1}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: var(--text-secondary, #b0b3b8); font-size: 14px;">Phòng ban:</label>
                            <select id="filterSalaryDept" class="form-control">
                                <option value="">Tất cả</option>
                                <option value="IT">Công nghệ thông tin</option>
                                <option value="HR">Nhân sự</option>
                                <option value="SALES">Kinh doanh</option>
                            </select>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button id="btnFilterSalary" class="btn btn-primary" style="width: 100%;">
                                <span class="material-icons" style="font-size: 18px;">search</span>
                                Lọc
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Salary List -->
                <div id="salaryList" class="list">
                    <div class="loading">Đang tải dữ liệu...</div>
                </div>
            </div>
        `;
    },

    async initSalaryManagement() {
        await this.loadSalaries();
        
        document.getElementById('btnAddSalary')?.addEventListener('click', () => {
            this.showAddSalaryForm();
        });
        
        document.getElementById('btnFilterSalary')?.addEventListener('click', () => {
            this.loadSalaries();
        });
    },

    async loadSalaries() {
        const container = document.getElementById('salaryList');
        if (!container) return;
        
        // Mock data
        const mockSalaries = [
            {
                employeeId: 'E102',
                employeeName: 'Trần Văn B',
                department: 'IT',
                position: 'Developer',
                baseSalary: 15000000,
                allowances: 2000000,
                bonus: 1000000,
                deductions: 500000,
                netSalary: 17500000,
                month: 11,
                year: 2025,
                status: 'paid'
            },
            {
                employeeId: 'E103',
                employeeName: 'Phạm Thị C',
                department: 'HR',
                position: 'HR Manager',
                baseSalary: 20000000,
                allowances: 3000000,
                bonus: 2000000,
                deductions: 1000000,
                netSalary: 24000000,
                month: 11,
                year: 2025,
                status: 'pending'
            }
        ];
        
        container.innerHTML = mockSalaries.map(salary => `
            <div class="list-item" style="cursor: pointer;" data-employee-id="${salary.employeeId}">
                <div class="list-item-content">
                    <div class="list-item-title">
                        ${salary.employeeName} (${salary.employeeId})
                        ${salary.status === 'paid' ? 
                            '<span class="badge badge-success">Đã chi trả</span>' : 
                            '<span class="badge badge-warning">Chờ chi trả</span>'}
                    </div>
                    <div class="list-item-subtitle">
                        ${salary.department} - ${salary.position} | Tháng ${salary.month}/${salary.year}
                    </div>
                    <div class="list-item-meta">
                        Lương CB: ${this.formatCurrency(salary.baseSalary)} | 
                        Phụ cấp: ${this.formatCurrency(salary.allowances)} | 
                        Thưởng: ${this.formatCurrency(salary.bonus)} | 
                        <strong>Thực lĩnh: ${this.formatCurrency(salary.netSalary)}</strong>
                    </div>
                </div>
                <div class="list-item-action">
                    <button class="btn btn-sm btn-secondary edit-salary" data-id="${salary.employeeId}">
                        <span class="material-icons">edit</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.edit-salary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditSalaryForm(btn.getAttribute('data-id'));
            });
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    },

    showAddSalaryForm() {
        showNotification('Chức năng thêm lương sẽ được phát triển', 'info');
    },

    showEditSalaryForm(employeeId) {
        showNotification(`Chỉnh sửa lương cho ${employeeId}`, 'info');
    },

    /**
     * EMPLOYEE MANAGEMENT MODULE
     * Admin manages employee records
     */
    async renderEmployeeManagement() {
        return `
            <div class="content-header">
                <h1 class="page-title">
                    <span class="material-icons">people</span>
                    Quản Lý Nhân Viên
                </h1>
                <button id="btnAddEmployee" class="btn btn-primary">
                    <span class="material-icons">person_add</span>
                    Thêm Nhân Viên
                </button>
            </div>
            
            <div class="content-body">
                <!-- Search and Filter -->
                <div class="filter-section" style="background: var(--card-bg, #242526); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px;">
                        <input type="text" id="searchEmployee" class="form-control" placeholder="Tìm kiếm theo tên hoặc mã NV...">
                        <button id="btnSearchEmployee" class="btn btn-primary">
                            <span class="material-icons">search</span>
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                <!-- Employee List -->
                <div id="employeeList" class="list">
                    <div class="loading">Đang tải dữ liệu...</div>
                </div>
            </div>
        `;
    },

    async initEmployeeManagement() {
        await this.loadEmployees();
        
        document.getElementById('btnAddEmployee')?.addEventListener('click', () => {
            this.showAddEmployeeForm();
        });
        
        document.getElementById('btnSearchEmployee')?.addEventListener('click', () => {
            this.loadEmployees();
        });
        
        document.getElementById('searchEmployee')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadEmployees();
            }
        });
    },

    async loadEmployees() {
        const container = document.getElementById('employeeList');
        if (!container) return;
        
        const searchTerm = document.getElementById('searchEmployee')?.value.toLowerCase() || '';
        
        // Mock data
        const mockEmployees = [
            {
                employeeId: 'E101',
                fullName: 'Nguyễn Thị Lan',
                email: 'lan.nguyen@company.com',
                phone: '0901234567',
                department: 'HR',
                position: 'Manager',
                status: 'active',
                joinDate: '2023-01-15'
            },
            {
                employeeId: 'E102',
                fullName: 'Trần Văn B',
                email: 'b.tran@company.com',
                phone: '0912345678',
                department: 'IT',
                position: 'Developer',
                status: 'active',
                joinDate: '2023-03-20'
            },
            {
                employeeId: 'E103',
                fullName: 'Phạm Thị C',
                email: 'c.pham@company.com',
                phone: '0923456789',
                department: 'SALES',
                position: 'Sales Executive',
                status: 'inactive',
                joinDate: '2022-06-10'
            }
        ];
        
        const filtered = mockEmployees.filter(emp => {
            if (!searchTerm) return true;
            return emp.employeeId.toLowerCase().includes(searchTerm) ||
                   emp.fullName.toLowerCase().includes(searchTerm);
        });
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Không tìm thấy nhân viên</div>';
            return;
        }
        
        container.innerHTML = filtered.map(emp => `
            <div class="list-item" style="cursor: pointer;" data-employee-id="${emp.employeeId}">
                <div class="list-item-content">
                    <div class="list-item-title">
                        ${emp.fullName} (${emp.employeeId})
                        ${emp.status === 'active' ? 
                            '<span class="badge badge-success">Đang làm việc</span>' : 
                            '<span class="badge badge-secondary">Đã nghỉ</span>'}
                    </div>
                    <div class="list-item-subtitle">
                        ${emp.department} - ${emp.position}
                    </div>
                    <div class="list-item-meta">
                        ${emp.email} | ${emp.phone} | Vào: ${emp.joinDate}
                    </div>
                </div>
                <div class="list-item-action">
                    <button class="btn btn-sm btn-secondary edit-employee" data-id="${emp.employeeId}">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger delete-employee" data-id="${emp.employeeId}">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.edit-employee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditEmployeeForm(btn.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.delete-employee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEmployee(btn.getAttribute('data-id'));
            });
        });
    },

    showAddEmployeeForm() {
        showNotification('Form thêm nhân viên sẽ được phát triển', 'info');
    },

    showEditEmployeeForm(employeeId) {
        showNotification(`Chỉnh sửa thông tin ${employeeId}`, 'info');
    },

    deleteEmployee(employeeId) {
        if (!confirm(`Xác nhận xóa nhân viên ${employeeId}?`)) return;
        showNotification('Đã xóa nhân viên', 'success');
        this.loadEmployees();
    },

    /**
     * SCHEDULE MANAGEMENT MODULE
     * Manager creates and assigns schedules
     */
    async renderScheduleManagement() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        
        return `
            <div class="content-header">
                <h1 class="page-title">
                    <span class="material-icons">event</span>
                    Xếp Lịch Làm Việc
                </h1>
                <button id="btnCreateSchedule" class="btn btn-primary">
                    <span class="material-icons">add</span>
                    Tạo Lịch
                </button>
            </div>
            
            <div class="content-body">
                <!-- Week Selector -->
                <div class="week-selector" style="background: var(--card-bg, #242526); padding: 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <button id="btnPrevWeek" class="btn btn-secondary">
                        <span class="material-icons">chevron_left</span>
                    </button>
                    <h3 id="weekDisplay" style="margin: 0;">Tuần ${this.getWeekNumber(startOfWeek)}</h3>
                    <button id="btnNextWeek" class="btn btn-secondary">
                        <span class="material-icons">chevron_right</span>
                    </button>
                </div>

                <!-- Schedule Grid -->
                <div id="scheduleGrid" style="overflow-x: auto;">
                    <div class="loading">Đang tải lịch...</div>
                </div>
            </div>
        `;
    },

    async initScheduleManagement() {
        this.currentWeekStart = this.getMonday(new Date());
        await this.loadScheduleGrid();
        
        document.getElementById('btnPrevWeek')?.addEventListener('click', () => {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
            this.loadScheduleGrid();
        });
        
        document.getElementById('btnNextWeek')?.addEventListener('click', () => {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
            this.loadScheduleGrid();
        });
        
        document.getElementById('btnCreateSchedule')?.addEventListener('click', () => {
            this.showCreateScheduleForm();
        });
    },

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    async loadScheduleGrid() {
        const container = document.getElementById('scheduleGrid');
        if (!container) return;
        
        const weekDisplay = document.getElementById('weekDisplay');
        if (weekDisplay) {
            weekDisplay.textContent = `Tuần ${this.getWeekNumber(this.currentWeekStart)}`;
        }
        
        // Mock employees
        const employees = ['E101 - Nguyễn Thị Lan', 'E102 - Trần Văn B', 'E103 - Phạm Thị C'];
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const shifts = ['Ca sáng', 'Ca chiều', 'Ca tối', 'OFF'];
        
        let html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--card-bg, #242526);">
                        <th style="padding: 12px; border: 1px solid var(--border-color, #3a3b3c); text-align: left;">Nhân viên</th>
                        ${days.map(day => `<th style="padding: 12px; border: 1px solid var(--border-color, #3a3b3c); text-align: center;">${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;
        
        employees.forEach(emp => {
            html += '<tr>';
            html += `<td style="padding: 12px; border: 1px solid var(--border-color, #3a3b3c);">${emp}</td>`;
            days.forEach((_, idx) => {
                const shift = shifts[Math.floor(Math.random() * shifts.length)];
                const bgColor = shift === 'OFF' ? 'var(--danger, #e74c3c)' : 
                                shift === 'Ca sáng' ? 'var(--info, #3498db)' :
                                shift === 'Ca chiều' ? 'var(--warning, #f39c12)' :
                                'var(--secondary, #95a5a6)';
                html += `<td style="padding: 8px; border: 1px solid var(--border-color, #3a3b3c); text-align: center; background: ${bgColor}20;">
                    <div style="font-size: 12px;">${shift}</div>
                </td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    },

    showCreateScheduleForm() {
        showNotification('Form tạo lịch sẽ được phát triển', 'info');
    }
};
