/**
 * HRM Modules - Content renderers for all dashboards
 * All modules are rendered into #mainContent dynamically
 * Company differentiation via companyId, contract-based logic
 */

const HRMModules = {
    
    /**
     * VP Modules (HRMSystem.html - Office Department)
     */
        /**
         * VP Dashboard - Overview
         */
    async renderDashboard() {
        try {
            // Fetch dashboard data
            const [employees, pendingRegs, departments, positions] = await Promise.all([
                apiClient.getEmployees({limit: 1}),
                apiClient.get('/registrations/pending'),
                apiClient.get('/departments'),
                apiClient.get('/positions')
            ]);
            
            return `
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #3b82f6;">
                            <span class="material-icons-round">groups</span>
                        </div>
                        <div class="stat-info">
                            <h3>${employees.total || 0}</h3>
                            <p>Tổng Nhân Viên</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #f59e0b;">
                            <span class="material-icons-round">pending</span>
                        </div>
                        <div class="stat-info">
                            <h3>${pendingRegs.data?.length || 0}</h3>
                            <p>Chờ Duyệt</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #8b5cf6;">
                            <span class="material-icons-round">business</span>
                        </div>
                        <div class="stat-info">
                            <h3>${departments.data?.length || 0}</h3>
                            <p>Phòng Ban</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #10b981;">
                            <span class="material-icons-round">badge</span>
                        </div>
                        <div class="stat-info">
                            <h3>${positions.data?.length || 0}</h3>
                            <p>Chức Vụ</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3 class="section-title">Đăng Ký Chờ Duyệt</h3>
                        <button class="btn btn-primary btn-sm" onclick="HRMRouter.navigateTo('approve-registration')">
                            Xem Tất Cả
                        </button>
                    </div>
                    <div class="section-body">
                        ${pendingRegs.data?.length > 0 ? 
                            `<div class="list-group">
                                ${pendingRegs.data.slice(0, 5).map(reg => `
                                    <div class="list-item">
                                        <div class="list-item-content">
                                            <h4>${reg.fullName}</h4>
                                            <p>${reg.email} • ${reg.phone}</p>
                                        </div>
                                        <button class="btn btn-success btn-sm" onclick="HRMModules.approveRegistration('${reg.registrationId}')">
                                            Duyệt
                                        </button>
                                    </div>
                                `).join('')}
                            </div>` :
                            '<p class="text-muted">Không có đăng ký chờ duyệt</p>'
                        }
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering VP dashboard:', error);
            return '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    initDashboard() {
        console.log('VP Dashboard initialized');
    },
    
    /**
     * Employee Management
     */
    async renderEmployeeManagement() {
        return `
            <div class="section">
                <h3 class="section-title">Quản Lý Nhân Viên</h3>
                    <button class="btn btn-primary" onclick="HRMModules.showAddEmployeeForm()">
                        <span class="material-icons-round">person_add</span>
                        Thêm Nhân Viên
                    </button>
                </div>
                <div class="section-body">
                    <div class="filters mb-3">
                        <select id="filterDepartment" class="form-select">
                            <option value="">Tất cả phòng ban</option>
                        </select>
                        <select id="filterPosition" class="form-select">
                            <option value="">Tất cả chức vụ</option>
                        </select>
                        <input type="search" id="searchEmployee" class="form-input" placeholder="Tìm kiếm...">
                    </div>
                    <div id="employeeList">
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <p>Đang tải danh sách nhân viên...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initEmployeeManagement() {
        // Load departments and positions for filters
        const [departments, positions] = await Promise.all([
            apiClient.get('/departments'),
            apiClient.get('/positions')
        ]);
        
        // Populate filters
        const deptFilter = document.getElementById('filterDepartment');
        const posFilter = document.getElementById('filterPosition');
        
        departments.data?.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.companyId;
            option.textContent = dept.departmentName;
            deptFilter.appendChild(option);
        });
        
        positions.data?.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos.positionId;
            option.textContent = pos.positionName;
            posFilter.appendChild(option);
        });
        
        // Load employees
        await this.loadEmployeeList();
        
        // Add filter listeners
        deptFilter.addEventListener('change', () => this.loadEmployeeList());
        posFilter.addEventListener('change', () => this.loadEmployeeList());
        document.getElementById('searchEmployee').addEventListener('input', 
            debounce(() => this.loadEmployeeList(), 300)
        );
    },
    
    async loadEmployeeList() {
        const listEl = document.getElementById('employeeList');
        const filters = {
            companyId: document.getElementById('filterDepartment')?.value,
            positionId: document.getElementById('filterPosition')?.value,
            search: document.getElementById('searchEmployee')?.value
        };
        
        try {
            const employees = await apiClient.getEmployees(filters);
            
            if (employees.data?.length > 0) {
                listEl.innerHTML = `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mã NV</th>
                                    <th>Họ Tên</th>
                                    <th>Phòng Ban</th>
                                    <th>Chức Vụ</th>
                                    <th>Email</th>
                                    <th>Số ĐT</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${employees.data.map(emp => `
                                    <tr>
                                        <td>${emp.employeeId}</td>
                                        <td>${emp.fullName}</td>
                                        <td>${emp.departmentName || '-'}</td>
                                        <td>${emp.positionName || '-'}</td>
                                        <td>${emp.email}</td>
                                        <td>${emp.phone}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="HRMModules.editEmployee('${emp.employeeId}')">
                                                Sửa
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                listEl.innerHTML = '<p class="text-muted">Không tìm thấy nhân viên</p>';
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            listEl.innerHTML = '<p class="text-error">Lỗi khi tải danh sách</p>';
        }
    },
    
    /**
     * Approve Registration
     */
    async renderApproveRegistration() {
        return `
            <div class="section">
                <h3 class="section-title">Duyệt Đăng Ký</h3>
                </div>
                <div class="section-body">
                    <div id="registrationList">
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <p>Đang tải danh sách...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initApproveRegistration() {
        await this.loadPendingRegistrations();
    },
    
    async loadPendingRegistrations() {
        const listEl = document.getElementById('registrationList');
        
        try {
            const result = await apiClient.get('/registrations/pending');
            
            if (result.data?.length > 0) {
                listEl.innerHTML = `
                    <div class="list-group">
                        ${result.data.map(reg => `
                            <div class="list-item registration-item">
                                <div class="registration-info">
                                    <h4>${reg.fullName}</h4>
                                    <p><strong>Email:</strong> ${reg.email}</p>
                                    <p><strong>Số ĐT:</strong> ${reg.phone}</p>
                                    <p><strong>Cửa hàng:</strong> ${reg.storeName || 'N/A'}</p>
                                    <p><strong>Ngày đăng ký:</strong> ${new Date(reg.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div class="registration-actions">
                                    <button class="btn btn-success" onclick="HRMModules.approveRegistration('${reg.registrationId}')">
                                        <span class="material-icons-round">check</span>
                                        Duyệt
                                    </button>
                                    <button class="btn btn-danger" onclick="HRMModules.rejectRegistration('${reg.registrationId}')">
                                        <span class="material-icons-round">close</span>
                                        Từ Chối
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                listEl.innerHTML = '<p class="text-muted">Không có đăng ký chờ duyệt</p>';
            }
        } catch (error) {
            console.error('Error loading registrations:', error);
            listEl.innerHTML = '<p class="text-error">Lỗi khi tải danh sách</p>';
        }
    },
    
    async approveRegistration(registrationId) {
        if (!confirm('Xác nhận duyệt đăng ký này?')) return;
        
        try {
            await apiClient.post(`/registrations/${registrationId}/approve`);
            alert('Đã duyệt đăng ký thành công');
            await this.loadPendingRegistrations();
        } catch (error) {
            console.error('Error approving registration:', error);
            alert('Lỗi khi duyệt đăng ký');
        }
    },
    
    async rejectRegistration(registrationId) {
        if (!confirm('Xác nhận từ chối đăng ký này?')) return;
        
        const reason = prompt('Lý do từ chối (tùy chọn):');
        
        try {
            await apiClient.post(`/registrations/${registrationId}/reject`, { reason });
            alert('Đã từ chối đăng ký');
            await this.loadPendingRegistrations();
        } catch (error) {
            console.error('Error rejecting registration:', error);
            alert('Lỗi khi từ chối đăng ký');
        }
    },
    
    /**
     * Departments
     */
    async renderDepartments() {
        return `
            <div class="section">
                <h3 class="section-title">Danh Sách Phòng Ban</h3>
                </div>
                <div class="section-body" id="departmentList">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initDepartments() {
        const listEl = document.getElementById('departmentList');
        
        try {
            const result = await apiClient.get('/departments');
            
            if (result.data?.length > 0) {
                listEl.innerHTML = `
                    <div class="grid grid-cols-2">
                        ${result.data.map(dept => `
                            <div class="section">
                                <h4>${dept.departmentName}</h4>
                                <p>Mã: ${dept.departmentCode}</p>
                                <p>Giờ làm: ${dept.workHoursPerDay}h/ngày</p>
                                <p>Ngày làm: ${dept.workDaysPerMonth} ngày/tháng</p>
                                <p>Phân ca: ${dept.requiresShiftAssignment ? 'Có' : 'Không'}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            listEl.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    /**
     * Positions
     */
    async renderPositions() {
        return `
            <div class="section">
                <h3 class="section-title">Danh Sách Chức Vụ</h3>
                    <select id="positionDepartmentFilter" class="form-select">
                        <option value="">Tất cả phòng ban</option>
                    </select>
                </div>
                <div class="section-body" id="positionList">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initPositions() {
        // Load departments for filter
        const departments = await apiClient.get('/departments');
        const filter = document.getElementById('positionDepartmentFilter');
        
        departments.data?.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.companyId;
            option.textContent = dept.departmentName;
            filter.appendChild(option);
        });
        
        filter.addEventListener('change', () => this.loadPositions());
        await this.loadPositions();
    },
    
    async loadPositions() {
        const listEl = document.getElementById('positionList');
        const companyId = document.getElementById('positionDepartmentFilter')?.value;
        
        try {
            const params = companyId ? { companyId } : {};
            const result = await apiClient.get('/positions', params);
            
            if (result.data?.length > 0) {
                listEl.innerHTML = `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Chức Vụ</th>
                                    <th>Phòng Ban</th>
                                    <th>Cấp Độ</th>
                                    <th>Mức Lương</th>
                                    <th>Loại Lương</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.data.map(pos => `
                                    <tr>
                                        <td>${pos.positionName}</td>
                                        <td>${pos.departmentName || '-'}</td>
                                        <td>Level ${pos.positionLevel}</td>
                                        <td>${pos.baseSalaryRate?.toLocaleString('vi-VN')} VNĐ</td>
                                        <td>${pos.salaryType === 'monthly' ? 'Tháng' : pos.salaryType === 'hourly' ? 'Giờ' : 'Ngày'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                listEl.innerHTML = '<p class="text-muted">Không có dữ liệu</p>';
            }
        } catch (error) {
            console.error('Error loading positions:', error);
            listEl.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    /**
     * Salary Management
     */
    async renderSalaryManagement() {
        return `
            <div class="section">
                <h3 class="section-title">Quản Lý Lương</h3>
                    <div class="filters">
                        <select id="salaryMonth" class="form-select">
                            ${Array.from({length: 12}, (_, i) => `<option value="${i+1}">Tháng ${i+1}</option>`).join('')}
                        </select>
                        <select id="salaryYear" class="form-select">
                            ${Array.from({length: 3}, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return `<option value="${year}">${year}</option>`;
                            }).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="HRMModules.calculateAllSalaries()">
                            Tính Lương Tất Cả
                        </button>
                    </div>
                </div>
                <div class="section-body" id="salaryList">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initSalaryManagement() {
        // Set current month/year
        const now = new Date();
        document.getElementById('salaryMonth').value = now.getMonth() + 1;
        document.getElementById('salaryYear').value = now.getFullYear();
        
        // Add listeners
        document.getElementById('salaryMonth').addEventListener('change', () => this.loadSalaryRecords());
        document.getElementById('salaryYear').addEventListener('change', () => this.loadSalaryRecords());
        
        await this.loadSalaryRecords();
    },
    
    async loadSalaryRecords() {
        const listEl = document.getElementById('salaryList');
        const month = document.getElementById('salaryMonth').value;
        const year = document.getElementById('salaryYear').value;
        
        try {
            const result = await apiClient.get('/salary/records', { month, year });
            
            if (result.data?.length > 0) {
                listEl.innerHTML = `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nhân Viên</th>
                                    <th>Tháng</th>
                                    <th>Lương Cơ Bản</th>
                                    <th>Tổng Lương</th>
                                    <th>Trạng Thái</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.data.map(salary => `
                                    <tr>
                                        <td>${salary.fullName}</td>
                                        <td>${salary.month}/${salary.year}</td>
                                        <td>${salary.baseSalary?.toLocaleString('vi-VN')} VNĐ</td>
                                        <td><strong>${salary.totalSalary?.toLocaleString('vi-VN')} VNĐ</strong></td>
                                        <td>
                                            <span class="badge badge-${salary.status === 'paid' ? 'success' : salary.status === 'approved' ? 'info' : 'warning'}">
                                                ${salary.status === 'paid' ? 'Đã Trả' : salary.status === 'approved' ? 'Đã Duyệt' : 'Chờ Duyệt'}
                                            </span>
                                        </td>
                                        <td>
                                            ${salary.status === 'pending' ? `
                                                <button class="btn btn-sm btn-success" onclick="HRMModules.approveSalary(${salary.salaryId})">
                                                    Duyệt
                                                </button>
                                            ` : salary.status === 'approved' ? `
                                                <button class="btn btn-sm btn-primary" onclick="HRMModules.markSalaryPaid(${salary.salaryId})">
                                                    Đã Trả
                                                </button>
                                            ` : '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                listEl.innerHTML = '<p class="text-muted">Chưa có dữ liệu lương cho tháng này</p>';
            }
        } catch (error) {
            console.error('Error loading salary records:', error);
            listEl.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    async calculateAllSalaries() {
        const month = document.getElementById('salaryMonth').value;
        const year = document.getElementById('salaryYear').value;
        
        if (!confirm(`Tính lương cho tất cả nhân viên tháng ${month}/${year}?`)) return;
        
        try {
            const employees = await apiClient.getEmployees();
            let success = 0;
            let failed = 0;
            
            for (const emp of employees.data) {
                try {
                    await apiClient.post('/salary/calculate', {
                        employeeId: emp.employeeId,
                        month: parseInt(month),
                        year: parseInt(year)
                    });
                    success++;
                } catch (err) {
                    console.error(`Failed to calculate salary for ${emp.employeeId}:`, err);
                    failed++;
                }
            
            alert(`Hoàn thành!\nThành công: ${success}\nThất bại: ${failed}`);
            await this.loadSalaryRecords();
        } catch (error) {
            console.error('Error calculating salaries:', error);
            alert('Lỗi khi tính lương');
        }
    },
    
    async approveSalary(salaryId) {
        if (!confirm('Xác nhận duyệt lương?')) return;
        
        try {
            await apiClient.post('/salary/approve', { salaryId });
            alert('Đã duyệt lương');
            await this.loadSalaryRecords();
        } catch (error) {
            console.error('Error approving salary:', error);
            alert('Lỗi khi duyệt lương');
        }
    },
    
    async markSalaryPaid(salaryId) {
        if (!confirm('Xác nhận đã thanh toán lương?')) return;
        
        try {
            await apiClient.post('/salary/mark-paid', { salaryId });
            alert('Đã đánh dấu đã thanh toán');
            await this.loadSalaryRecords();
        } catch (error) {
            console.error('Error marking salary as paid:', error);
            alert('Lỗi khi cập nhật trạng thái');
        }
    },
    
    /**
     * Timesheet Approval
     */
    async renderTimesheetApproval() {
        return `
            <div class="section">
                <h3 class="section-title">Duyệt Bảng Công</h3>
                </div>
                <div class="section-body">
                    <p class="text-muted">Chức năng đang được phát triển</p>
                </div>
            </div>
        `;
    },
    
    initTimesheetApproval() {
        console.log('Timesheet approval initialized');
    },
    
    /**
     * Reports
     */
    async renderReports() {
        return `
            <div class="section">
                <h3 class="section-title">Báo Cáo & Thống Kê</h3>
                </div>
                <div class="section-body">
                    <p class="text-muted">Chức năng đang được phát triển</p>
                </div>
            </div>
        `;
    },
    
    initReports() {
        console.log('Reports initialized');
    }
    },
    
    /**
     * CH Modules (dashboard.html - Store Department)
     */
    /**
     * CH Dashboard
     */
    async renderDashboard() {
        const userData = SimpleStorage.get('userData');
        const employeeId = userData?.employeeId;
        
        return `
            <div class="dashboard-welcome">
                <h2>Xin chào, ${userData?.fullName || 'User'}!</span>
                <p>${userData?.positionName || 'Nhân viên'} - ${userData?.departmentName || 'Store'}</p>
            </div>
            
            <!-- Enhanced Quick Actions Grid -->
            <div class="quick-actions-grid">
                <button class="action-card-modern" onclick="HRMRouter.navigateTo('attendance')">
                    <div class="action-icon gradient-primary">
                        <span class="material-icons-round">fingerprint</span>
                    </div>
                    <span class="action-label">Chấm Công</span>
                </button>
                <button class="action-card-modern" onclick="HRMRouter.navigateTo('schedule')">
                    <div class="action-icon gradient-info">
                        <span class="material-icons-round">calendar_month</span>
                    </div>
                    <span class="action-label">Lịch Làm</span>
                </button>
                <button class="action-card-modern" onclick="HRMRouter.navigateTo('timesheet')">
                    <div class="action-icon gradient-warning">
                        <span class="material-icons-round">table_chart</span>
                    </div>
                    <span class="action-label">Bảng Công</span>
                </button>
                <button class="action-card-modern" onclick="HRMRouter.navigateTo('salary')">
                    <div class="action-icon gradient-success">
                        <span class="material-icons-round">payments</span>
                    </div>
                    <span class="action-label">Lương</span>
                </button>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <span class="material-icons-round">schedule</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="hoursWorked">--</div>
                        <div class="stat-label">Giờ làm</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <span class="material-icons-round">event_available</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="presentDays">--</div>
                        <div class="stat-label">Ngày công</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initDashboard() {
        // Load statistics
        const userData = SimpleStorage.get('userData');
        const employeeId = userData?.employeeId;
        
        if (employeeId) {
            try {
                // Load notifications for the panel
                const notifications = await apiClient.get('/notifications', {
                    employeeId,
                    limit: 10
                });
                
                // Update notification panel
                this.updateNotificationPanel(notifications);
                
                // Load timesheet stats
                const timesheetData = await apiClient.get('/timesheet', {
                    employeeId,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                });
                
                // Update stats
                const hoursEl = document.getElementById('hoursWorked');
                const daysEl = document.getElementById('presentDays');
                
                if (hoursEl && timesheetData.data) {
                    hoursEl.textContent = timesheetData.data.totalHours || '--';
                }
                if (daysEl && timesheetData.data) {
                    daysEl.textContent = timesheetData.data.presentDays || '--';
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
    },
    
    updateNotificationPanel(notifications) {
        const notifList = document.getElementById('notificationList');
        const notifBadge = document.querySelector('.notification-badge');
        const notifBtn = document.getElementById('notifBtn');
        
        if (notifications && notifications.data && notifications.data.length > 0) {
            // Update badge
            if (notifBadge && notifications.unreadCount > 0) {
                notifBadge.textContent = notifications.unreadCount > 99 ? '99+' : notifications.unreadCount;
                notifBadge.style.display = 'flex';
            
            // Update notification list
            if (notifList) {
                const formatTime = this.formatTime;  // Capture method reference
                notifList.innerHTML = notifications.data.map(notif => `
                    <div class="notification-item ${notif.isRead ? 'read' : 'unread'}">
                        <div class="notification-icon ${notif.type}">
                            <span class="material-icons-round">
                                ${notif.type === 'success' ? 'check_circle' : notif.type === 'warning' ? 'warning' : 'info'}
                            </span>
                        </div>
                        <div class="notification-content">
                            <h4 class="notification-title">${notif.title}</h4>
                            <p class="notification-message">${notif.message}</p>
                            <small class="notification-time">${formatTime(notif.createdAt)}</small>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            if (notifList) {
                notifList.innerHTML = '<div class="empty-state"><p>Không có thông báo mới</p></div>';
            }
            if (notifBadge) {
                notifBadge.style.display = 'none';
            }
        }
    },
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds
        
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    },
    
    /**
     * Attendance
     */
    async renderAttendance() {
        return `
            <div class="section">
                <h3 class="section-title">Chấm Công</h3>
                </div>
                <div class="section-body">
                    <!-- Single Attendance Button -->
                    <div class="attendance-single-action">
                        <button class="btn-attendance-primary" id="attendanceBtn" onclick="HRMModules.handleAttendance()">
                            <span class="material-icons-round">fingerprint</span>
                            <span class="btn-text">Chấm Công</span>
                        </button>
                        <p class="attendance-hint">Nhấn để ghi nhận thời gian ra/vào</p>
                    </div>
                    
                    <div class="mt-4" id="todayAttendance">
                        <h4>Lịch Sử Hôm Nay</h4>
                        <div class="loading-container">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initAttendance() {
        // Load today's attendance
        const userData = SimpleStorage.get('userData');
        const employeeId = userData?.employeeId;
        
        if (employeeId) {
            try {
                const attendance = await apiClient.get('/attendance', {
                    employeeId,
                    date: new Date().toISOString().split('T')[0]
                });
                
                const container = document.getElementById('todayAttendance');
                if (attendance.data?.length > 0) {
                    const record = attendance.data[0];
                    container.innerHTML = `
                        <h4>Lịch Sử Hôm Nay</h4>
                        <div class="attendance-timeline">
                            ${record.checkIn ? `
                                <div class="timeline-item success">
                                    <div class="timeline-icon">
                                        <span class="material-icons-round">login</span>
                                    </div>
                                    <div class="timeline-content">
                                        <strong>Vào làm</strong>
                                        <span>${record.checkIn}</span>
                                    </div>
                                </div>
                            ` : ''}
                            ${record.checkOut ? `
                                <div class="timeline-item danger">
                                    <div class="timeline-icon">
                                        <span class="material-icons-round">logout</span>
                                    </div>
                                    <div class="timeline-content">
                                        <strong>Ra về</strong>
                                        <span>${record.checkOut}</span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    
                    // Update button state
                    const btn = document.getElementById('attendanceBtn');
                    if (btn) {
                        if (record.checkIn && !record.checkOut) {
                            btn.classList.add('checked-in');
                            btn.querySelector('.btn-text').textContent = 'Chấm Công Ra';
                        }
                    }
                } else {
                    container.innerHTML = '<h4>Lịch Sử Hôm Nay</h4><p class="text-muted">Chưa có dữ liệu chấm công hôm nay</p>';
                }
            } catch (error) {
                console.error('Error loading attendance:', error);
            }
        }
    },
    
    async handleAttendance() {
        const userData = SimpleStorage.get('userData');
        const employeeId = userData?.employeeId;
        
        if (!employeeId) return;
        
        try {
            // Check current status
            const attendance = await apiClient.get('/attendance', {
                employeeId,
                date: new Date().toISOString().split('T')[0]
            });
            
            const hasCheckedIn = attendance.data?.length > 0 && attendance.data[0].checkIn;
            const hasCheckedOut = attendance.data?.length > 0 && attendance.data[0].checkOut;
            
            let result;
            if (!hasCheckedIn) {
                // Check in
                result = await apiClient.post('/attendance/check-in', { employeeId });
                alert('✅ ' + result.message);
            } else if (!hasCheckedOut) {
                // Check out
                result = await apiClient.post('/attendance/check-out', { employeeId });
                alert('✅ ' + result.message);
            } else {
                alert('ℹ️ Bạn đã hoàn thành chấm công hôm nay');
                return;
            
            // Reload attendance data
            await this.initAttendance();
        } catch (error) {
            console.error('Error during attendance:', error);
            alert('❌ Có lỗi xảy ra: ' + error.message);
        }
    },
    
    async loadTodayAttendance() {
        const userData = SimpleStorage.get('userData');
        const container = document.getElementById('todayAttendance');
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const attendance = await apiClient.get('/attendance', {
                employeeId: userData?.employeeId,
                date: today
            });
            
            if (attendance.data?.length > 0) {
                container.innerHTML = `
                    <div class="list-group">
                        ${attendance.data.map(record => `
                            <div class="list-item">
                                <p><strong>Check In:</strong> ${record.checkIn ? new Date(record.checkIn).toLocaleTimeString('vi-VN') : '-'}</p>
                                <p><strong>Check Out:</strong> ${record.checkOut ? new Date(record.checkOut).toLocaleTimeString('vi-VN') : '-'}</p>
                                <p><strong>Tổng giờ:</strong> ${record.totalHours || 0} giờ</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = '<p class="text-muted">Chưa có chấm công hôm nay</p>';
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
            container.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    async clockIn() {
        const userData = SimpleStorage.get('userData');
        
        try {
            await apiClient.post('/attendance/check-in', {
                employeeId: userData?.employeeId
            });
            alert('Check in thành công!');
            await this.loadTodayAttendance();
        } catch (error) {
            console.error('Error clocking in:', error);
            alert('Lỗi khi check in');
        }
    },
    
    async clockOut() {
        const userData = SimpleStorage.get('userData');
        
        try {
            await apiClient.post('/attendance/check-out', {
                employeeId: userData?.employeeId
            });
            alert('Check out thành công!');
            await this.loadTodayAttendance();
        } catch (error) {
            console.error('Error clocking out:', error);
            alert('Lỗi khi check out');
        }
    },
    
    /**
     * Schedule
     */
    async renderSchedule() {
        return `
            <div class="section">
                <h3 class="section-title">Lịch Làm Việc</h3>
                </div>
                <div class="section-body">
                    <p class="text-muted">Chức năng đang được phát triển</p>
                </div>
            </div>
        `;
    },
    
    initSchedule() {
        console.log('Schedule initialized');
    },
    
    /**
     * Timesheet
     */
    async renderTimesheet() {
        return `
            <div class="section">
                <h3 class="section-title">Bảng Công</h3>
                    <div class="filters">
                        <select id="timesheetMonth" class="form-select">
                            ${Array.from({length: 12}, (_, i) => `<option value="${i+1}">Tháng ${i+1}</option>`).join('')}
                        </select>
                        <select id="timesheetYear" class="form-select">
                            ${Array.from({length: 3}, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return `<option value="${year}">${year}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>
                <div class="section-body" id="timesheetData">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initTimesheet() {
        const now = new Date();
        document.getElementById('timesheetMonth').value = now.getMonth() + 1;
        document.getElementById('timesheetYear').value = now.getFullYear();
        
        document.getElementById('timesheetMonth').addEventListener('change', () => this.loadTimesheet());
        document.getElementById('timesheetYear').addEventListener('change', () => this.loadTimesheet());
        
        await this.loadTimesheet();
    },
    
    async loadTimesheet() {
        const userData = SimpleStorage.get('userData');
        const container = document.getElementById('timesheetData');
        const month = document.getElementById('timesheetMonth').value;
        const year = document.getElementById('timesheetYear').value;
        
        try {
            const timesheet = await apiClient.get('/timesheets/monthly', {
                employeeId: userData?.employeeId,
                month,
                year
            });
            
            if (timesheet.data) {
                const data = timesheet.data;
                const details = data.details || [];
                
                // Calculate weekend hours and bonus for CH department
                let weekendHours = 0;
                let weekdayHours = 0;
                let weekendBonus = 0;
                
                if (userData?.contract === 'parttime') {
                    details.forEach(day => {
                        const date = new Date(day.date);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        if (isWeekend) {
                            weekendHours += day.workHours || 0;
                        } else {
                            weekdayHours += day.workHours || 0;
                        }
                    });
                    // Weekend bonus: 50% additional for CH department
                    // Default CH hourly rate if not provided
                    const salaryRate = 25000; // Base rate for CH from SQL schema
                    weekendBonus = weekendHours * 0.5 * salaryRate;
                
                container.innerHTML = `
                    <div class="timesheet-summary">
                        <div class="stat">
                            <h4>${data.totalDays || 0}</h4>
                            <p>Tổng Ngày</p>
                        </div>
                        <div class="stat">
                            <h4>${data.presentDays || 0}</h4>
                            <p>Ngày Làm</p>
                        </div>
                        <div class="stat">
                            <h4>${data.absentDays || 0}</h4>
                            <p>Ngày Nghỉ</p>
                        </div>
                        <div class="stat">
                            <h4>${data.lateDays || 0}</h4>
                            <p>Ngày Trễ</p>
                        </div>
                        <div class="stat">
                            <h4>${data.totalHours || 0}</h4>
                            <p>Tổng Giờ</p>
                        </div>
                        <div class="stat">
                            <h4>${data.overtimeHours || 0}</h4>
                            <p>Tăng Ca</p>
                        </div>
                        ${userData?.contract === 'parttime' ? `
                        <div class="stat">
                            <h4>${weekdayHours.toFixed(1)}</h4>
                            <p>Giờ T2-T6</p>
                        </div>
                        <div class="stat weekend-stat">
                            <h4>${weekendHours.toFixed(1)}</h4>
                            <p>Giờ Cuối Tuần</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${userData?.contract === 'parttime' && weekendHours > 0 ? `
                    <div class="weekend-bonus-alert">
                        <span class="material-icons-round">card_giftcard</span>
                        <div>
                            <strong>Phụ cấp cuối tuần:</strong>
                            <p>${weekendHours.toFixed(1)} giờ × 150% = +${weekendBonus.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${details.length > 0 ? `
                    <div class="timesheet-table-wrapper">
                        <table class="timesheet-table">
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Thứ</th>
                                    <th>Ca Làm</th>
                                    <th>Giờ Vào</th>
                                    <th>Giờ Ra</th>
                                    <th>Giờ Làm</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${details.map(day => {
                                    const date = new Date(day.date);
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    return `
                                    <tr class="${isWeekend ? 'weekend-row' : ''}">
                                        <td>${day.date}</td>
                                        <td>${day.dayOfWeek}${isWeekend ? ' 🎉' : ''}</td>
                                        <td>${day.shiftName || '-'}</td>
                                        <td>${day.checkInTime || '-'}</td>
                                        <td>${day.checkOutTime || '-'}</td>
                                        <td><strong>${day.workHours || 0}h</strong></td>
                                        <td>
                                            <span class="badge badge-${day.status === 'present' ? 'success' : day.status === 'late' ? 'warning' : 'danger'}">
                                                ${day.status === 'present' ? 'Đúng giờ' : day.status === 'late' ? 'Trễ' : 'Vắng'}
                                            </span>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5"><strong>Tổng</strong></td>
                                    <td><strong>${data.totalHours || 0}h</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    ` : ''}
                `;
            } else {
                container.innerHTML = '<p class="text-muted">Chưa có dữ liệu bảng công cho tháng này</p>';
            }
        } catch (error) {
            console.error('Error loading timesheet:', error);
            container.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    /**
     * Salary
     */
    async renderSalary() {
        return `
            <div class="section">
                <h3 class="section-title">Lương</h3>
                    <div class="filters">
                        <select id="salaryMonth" class="form-select">
                            ${Array.from({length: 12}, (_, i) => `<option value="${i+1}">Tháng ${i+1}</option>`).join('')}
                        </select>
                        <select id="salaryYear" class="form-select">
                            ${Array.from({length: 3}, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return `<option value="${year}">${year}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>
                <div class="section-body" id="salaryData">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initSalary() {
        const now = new Date();
        document.getElementById('salaryMonth').value = now.getMonth() + 1;
        document.getElementById('salaryYear').value = now.getFullYear();
        
        document.getElementById('salaryMonth').addEventListener('change', () => this.loadSalary());
        document.getElementById('salaryYear').addEventListener('change', () => this.loadSalary());
        
        await this.loadSalary();
    },
    
    async loadSalary() {
        const userData = SimpleStorage.get('userData');
        const container = document.getElementById('salaryData');
        const month = document.getElementById('salaryMonth').value;
        const year = document.getElementById('salaryYear').value;
        
        try {
            const salary = await apiClient.get('/salary/records', {
                employeeId: userData?.employeeId,
                month,
                year
            });
            
            if (salary.data) {
                const data = salary.data;
                const contract = userData?.contract || 'fulltime';
                const isParttime = userData?.contract === 'parttime';
                const isParttime = contract === 'parttime';
                
                // Use default rates from SQL schema if department is known
                // Contract types affect base rate: fulltime vs parttime
                let salaryRate;
                if (isParttime) {
                    // CH hourly rate - parttime gets lower rate
                    salaryRate = isParttime ? 20000 : 25000;
                } else {
                    // VP monthly rate - parttime gets prorated
                    salaryRate = isParttime ? 5000000 : 8000000;
                
                // Calculate salary components
                let baseSalaryAmount = 0;
                let overtimePay = 0;
                let weekendBonus = 0;
                
                if (isParttime) {
                    // Hourly calculation for CH
                    baseSalaryAmount = (data.workHours || 0) * salaryRate;
                    overtimePay = (data.overtimeHours || 0) * salaryRate * 1.5;
                    
                    // Weekend bonus calculation
                    // Get actual weekend hours from details if available, otherwise estimate
                    let weekendHours = 0;
                    if (data.details && Array.isArray(data.details)) {
                        data.details.forEach(day => {
                            const date = new Date(day.date);
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            if (isWeekend) {
                                weekendHours += day.workHours || 0;
                            }
                        });
                    } else {
                        // Estimate: assume 2/7 of work days are weekend (roughly 28.5%)
                        weekendHours = (data.workHours || 0) * 0.285;
                    
                    // Weekend bonus: 50% additional pay for weekend hours
                    weekendBonus = weekendHours * salaryRate * 0.5;
                } else {
                    // Monthly calculation for VP
                    baseSalaryAmount = data.baseSalary || salaryRate;
                
                const totalSalary = baseSalaryAmount + overtimePay + weekendBonus + (data.bonus || 0) - (data.deduction || 0);
                
                container.innerHTML = `
                    <div class="salary-detail">
                        <div class="contract-info-banner">
                            <span class="material-icons-round">badge</span>
                            <span>Loại hợp đồng: <strong>${isParttime ? 'Bán thời gian (Parttime)' : 'Toàn thời gian (Fulltime)'}</strong></span>
                        </div>
                        ${isParttime ? `
                        <div class="salary-calculation-header">
                            <span class="material-icons-round">calculate</span>
                            <h4>Tính Lương Theo Giờ (CH)</h4>
                        </div>
                        <div class="salary-row">
                            <span>Mức lương giờ ${isParttime ? '(Parttime)' : '(Fulltime)'}:</span>
                            <span><strong>${salaryRate.toLocaleString('vi-VN')} VNĐ/giờ</strong></span>
                        </div>
                        <div class="salary-row">
                            <span>Số giờ làm việc:</span>
                            <span>${data.workHours || 0} giờ</span>
                        </div>
                        <div class="salary-row">
                            <span>Lương giờ cơ bản:</span>
                            <span>${baseSalaryAmount.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div class="salary-row">
                            <span>Giờ tăng ca (×1.5):</span>
                            <span>${data.overtimeHours || 0} giờ</span>
                        </div>
                        <div class="salary-row">
                            <span>Lương tăng ca:</span>
                            <span class="text-success">+${overtimePay.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div class="salary-row weekend-bonus-row">
                            <span>Phụ cấp cuối tuần (×1.5):</span>
                            <span class="text-success">+${weekendBonus.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        ` : `
                        <div class="salary-calculation-header">
                            <span class="material-icons-round">money</span>
                            <h4>Tính Lương Theo Tháng (VP)</h4>
                        </div>
                        <div class="salary-row">
                            <span>Lương cơ bản:</span>
                            <span><strong>${baseSalaryAmount.toLocaleString('vi-VN')} VNĐ</strong></span>
                        </div>
                        <div class="salary-row">
                            <span>Số ngày làm việc:</span>
                            <span>${data.workDays || 0} / 26 ngày</span>
                        </div>
                        `}
                        <div class="salary-row">
                            <span>Thưởng:</span>
                            <span class="text-success">+${(data.bonus || 0).toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div class="salary-row">
                            <span>Khấu trừ (Bảo hiểm, thuế):</span>
                            <span class="text-danger">-${(data.deduction || 0).toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <hr>
                        <div class="salary-row total">
                            <span><strong>TỔNG LƯƠNG:</strong></span>
                            <span><strong>${totalSalary.toLocaleString('vi-VN')} VNĐ</strong></span>
                        </div>
                        <div class="salary-row">
                            <span>Trạng thái:</span>
                            <span class="badge badge-${data.status === 'paid' ? 'success' : data.status === 'approved' ? 'info' : 'warning'}">
                                ${data.status === 'paid' ? 'Đã Thanh Toán' : data.status === 'approved' ? 'Đã Duyệt' : 'Chờ Duyệt'}
                            </span>
                        </div>
                        ${data.paymentDate ? `
                        <div class="salary-row">
                            <span>Ngày thanh toán:</span>
                            <span>${data.paymentDate}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${isParttime ? `
                    <div class="salary-breakdown-info">
                        <h5>📊 Chi Tiết Tính Lương</h5>
                        <ul>
                            <li>Lương giờ thường: ${data.workHours || 0}h × ${salaryRate.toLocaleString('vi-VN')} = ${baseSalaryAmount.toLocaleString('vi-VN')} VNĐ</li>
                            <li>Lương tăng ca: ${data.overtimeHours || 0}h × ${salaryRate.toLocaleString('vi-VN')} × 1.5 = ${overtimePay.toLocaleString('vi-VN')} VNĐ</li>
                            <li>Phụ cấp cuối tuần: ${(data.details ? 'thực tế' : '~' + ((data.workHours || 0) * 0.285).toFixed(1) + 'h ước tính')} × ${salaryRate.toLocaleString('vi-VN')} × 0.5 = ${weekendBonus.toLocaleString('vi-VN')} VNĐ</li>
                        </ul>
                        <p class="text-muted">* Giờ làm cuối tuần được tính thêm 50% lương cơ bản (tổng 1.5x)</p>
                    </div>
                    ` : ''}
                `;
            } else {
                container.innerHTML = '<p class="text-muted">Chưa có dữ liệu lương cho tháng này</p>';
            }
        } catch (error) {
            console.error('Error loading salary:', error);
            container.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
        }
    },
    
    /**
     * Requests
     */
    async renderRequests() {
        return `
            <div class="section">
                <h3 class="section-title">Yêu Cầu Của Tôi</h3>
                    <button class="btn btn-primary" onclick="HRMModules.showNewRequestForm()">
                        <span class="material-icons-round">add</span>
                        Tạo Yêu Cầu Mới
                    </button>
                </div>
                <div class="section-body" id="requestsList">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
            
            <!-- Request Form Modal -->
            <div id="requestModal" class="modal" style="display: none;">
                <div class="modal-backdrop" onclick="HRMModules.closeRequestForm()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Tạo Yêu Cầu Mới</h3>
                        <button class="modal-close" onclick="HRMModules.closeRequestForm()">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="newRequestForm">
                            <div class="form-group">
                                <label>Loại yêu cầu *</label>
                                <select id="requestType" class="form-control" required>
                                    <option value="">Chọn loại yêu cầu</option>
                                    <option value="leave">Nghỉ phép</option>
                                    <option value="overtime">Đăng ký tăng ca</option>
                                    <option value="shift_change">Đổi ca làm việc</option>
                                    <option value="forgot_attendance">Quên chấm công</option>
                                    <option value="early_leave">Xin về sớm</option>
                                    <option value="late_arrival">Xin đi muộn</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="startDateGroup">
                                <label>Ngày *</label>
                                <input type="date" id="requestStartDate" class="form-control" required>
                            </div>
                            
                            <div class="form-group" id="endDateGroup" style="display: none;">
                                <label>Ngày kết thúc</label>
                                <input type="date" id="requestEndDate" class="form-control">
                            </div>
                            
                            <div class="form-group" id="startTimeGroup" style="display: none;">
                                <label>Giờ bắt đầu *</label>
                                <input type="time" id="requestStartTime" class="form-control">
                            </div>
                            
                            <div class="form-group" id="endTimeGroup" style="display: none;">
                                <label>Giờ kết thúc *</label>
                                <input type="time" id="requestEndTime" class="form-control">
                            </div>
                            
                            <div class="form-group" id="actualTimeGroup" style="display: none;">
                                <label>Giờ thực tế (HH:MM) *</label>
                                <input type="time" id="requestActualTime" class="form-control">
                            </div>
                            
                            <div class="form-group" id="currentShiftGroup" style="display: none;">
                                <label>Ca hiện tại *</label>
                                <select id="requestCurrentShift" class="form-control">
                                    <option value="">Chọn ca hiện tại</option>
                                    <option value="S4_08-12">Ca 4 (08:00-12:00)</option>
                                    <option value="S8_08-17">Ca 8 (08:00-17:00)</option>
                                    <option value="S8_13-22">Ca tối (13:00-22:00)</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="desiredShiftGroup" style="display: none;">
                                <label>Ca mong muốn *</label>
                                <select id="requestDesiredShift" class="form-control">
                                    <option value="">Chọn ca mong muốn</option>
                                    <option value="S4_08-12">Ca 4 (08:00-12:00)</option>
                                    <option value="S8_08-17">Ca 8 (08:00-17:00)</option>
                                    <option value="S8_13-22">Ca tối (13:00-22:00)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Lý do *</label>
                                <textarea id="requestReason" class="form-control" rows="4" required placeholder="Nhập lý do chi tiết..."></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="HRMModules.closeRequestForm()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Gửi Yêu Cầu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initRequests() {
        await this.loadRequests();
        
        // Setup form submit handler
        const form = document.getElementById('newRequestForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRequest();
            });
        
        // Setup dynamic form update based on request type
        const requestTypeSelect = document.getElementById('requestType');
        if (requestTypeSelect) {
            requestTypeSelect.addEventListener('change', () => {
                this.updateRequestFormFields();
            });
            // Initialize form fields for current selection
            this.updateRequestFormFields();
        }
    },
    
    updateRequestFormFields() {
        const requestType = document.getElementById('requestType')?.value;
        const startDateGroup = document.getElementById('startDateGroup');
        const endDateGroup = document.getElementById('endDateGroup');
        const startTimeGroup = document.getElementById('startTimeGroup');
        const endTimeGroup = document.getElementById('endTimeGroup');
        const actualTimeGroup = document.getElementById('actualTimeGroup');
        const currentShiftGroup = document.getElementById('currentShiftGroup');
        const desiredShiftGroup = document.getElementById('desiredShiftGroup');
        
        // Hide all optional fields first
        [endDateGroup, startTimeGroup, endTimeGroup, actualTimeGroup, currentShiftGroup, desiredShiftGroup].forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Show fields based on request type
        switch(requestType) {
            case 'leave':
                // Date range + reason (default fields already shown)
                if (endDateGroup) endDateGroup.style.display = 'block';
                break;
                
            case 'overtime':
                // Date + time range + reason
                if (startTimeGroup) startTimeGroup.style.display = 'block';
                if (endTimeGroup) endTimeGroup.style.display = 'block';
                break;
                
            case 'shift_change':
                // Date + current shift + desired shift + reason
                if (currentShiftGroup) currentShiftGroup.style.display = 'block';
                if (desiredShiftGroup) desiredShiftGroup.style.display = 'block';
                break;
                
            case 'forgot_attendance':
            case 'forgot_checkin':
            case 'forgot_checkout':
                // Date + actual time + reason
                if (actualTimeGroup) actualTimeGroup.style.display = 'block';
                break;
                
            case 'early_leave':
            case 'late_arrival':
            case 'other':
            default:
                // Date range + reason (default)
                if (endDateGroup) endDateGroup.style.display = 'block';
                break;
        }
    },
    
    async loadRequests() {
        const userData = SimpleStorage.get('userData');
        const container = document.getElementById('requestsList');
        
        if (!container) return;
        
        try {
            const requests = await apiClient.get('/requests', {
                employeeId: userData?.employeeId,
                limit: 50
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
                                        ${req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                    </span>
                                </div>
                                <div class="request-body">
                                    <p><strong>Lý do:</strong> ${req.reason || req.description || 'Không có'}</p>
                                    <p><strong>Thời gian:</strong> ${req.fromDate || req.requestDate || req.currentShiftDate || ''}${req.toDate && req.toDate !== req.fromDate ? ' đến ' + req.toDate : req.requestedShiftDate && req.requestedShiftDate !== req.currentShiftDate ? ' đến ' + req.requestedShiftDate : ''}</p>
                                    <p><small>Tạo lúc: ${new Date(req.createdAt).toLocaleString('vi-VN')}</small></p>
                                    ${req.reviewedBy ? `
                                    <p><small>Duyệt bởi: ${req.reviewerName || 'Quản lý'} - ${new Date(req.reviewedAt).toLocaleString('vi-VN')}</small></p>
                                    ${req.rejectionReason ? `<p><small>Lý do từ chối: ${req.rejectionReason}</small></p>` : ''}
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                // Store requests data for click handlers
                this.currentRequests = requests.data;
                
                // Add click event listeners to request items
                const requestItems = container.querySelectorAll('.request-item');
                requestItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        const index = parseInt(item.getAttribute('data-request-index'));
                        const request = this.currentRequests[index];
                        this.showRequestDetail(request);
                    });
                });
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="material-icons-round">assignment</span>
                        <p>Chưa có yêu cầu nào</p>
                        <button class="btn btn-primary" onclick="HRMModules.showNewRequestForm()">
                            Tạo yêu cầu đầu tiên
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading requests:', error);
            container.innerHTML = '<p class="text-error">Lỗi khi tải danh sách yêu cầu</p>';
        }
    },
    
    showNewRequestForm() {
        const modal = document.getElementById('requestModal');
        if (modal) {
            modal.style.display = 'flex';
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('requestStartDate').value = today;
        }
    },
    
    closeRequestForm() {
        const modal = document.getElementById('requestModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('newRequestForm').reset();
        }
    },
    
    async submitRequest() {
        const userData = SimpleStorage.get('userData');
        const type = document.getElementById('requestType').value;
        const startDate = document.getElementById('requestStartDate').value;
        const endDate = document.getElementById('requestEndDate').value;
        const reason = document.getElementById('requestReason').value;
        
        if (!type || !startDate || !reason) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        
        try {
            await apiClient.post('/requests', {
                employeeId: userData?.employeeId,
                type,
                startDate,
                endDate: endDate || startDate,
                reason,
                status: 'pending'
            });
            
            alert('Gửi yêu cầu thành công! Yêu cầu đang chờ phê duyệt.');
            this.closeRequestForm();
            await this.loadRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Lỗi khi gửi yêu cầu: ' + error.message);
        }
    },
    
    getRequestIcon(type) {
        const icons = {
            'leave': 'event_busy',
            'overtime': 'schedule',
            'shift_change': 'swap_horiz',
            'forgot_attendance': 'schedule',
            'forgot_checkin': 'schedule',
            'forgot_checkout': 'schedule',
            'shift_swap': 'swap_calls',
            'general': 'help_outline',
            // Legacy support
            'early_leave': 'logout',
            'late_arrival': 'login',
            'other': 'help'
        };
        return icons[type] || 'assignment';
    },
    
    getRequestTypeName(type) {
        const names = {
            'leave': 'Nghỉ phép',
            'overtime': 'Tăng ca',
            'shift_change': 'Đổi ca',
            'forgot_attendance': 'Quên chấm công',
            'forgot_checkin': 'Quên chấm công',
            'forgot_checkout': 'Quên chấm công',
            'shift_swap': 'Đổi ca với đồng nghiệp',
            'general': 'Yêu cầu chung',
            // Legacy support
            'early_leave': 'Xin về sớm',
            'late_arrival': 'Xin đi muộn',
            'other': 'Yêu cầu khác'
        };
        return names[type] || type;
    },
    
    showRequestDetail(request) {
        if (!request) return;
        
        // Build type-specific fields based on requestType
        let typeSpecificFields = '';
        
        switch(request.requestType) {
            case 'leave':
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
                if (request.requestDate) {
                    typeSpecificFields = `
                        <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                            <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Ngày yêu cầu:</span>
                            <span class="detail-value" style="color: var(--text-primary, #e4e6eb);">${request.requestDate}</span>
                        </div>
                    `;
                }
                break;
        
        const modalHTML = `
            <div id="requestDetailModal" class="modal" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 9999; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: var(--bg-primary, #1c1e26); border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <div class="modal-header" style="padding: 20px; border-bottom: 1px solid var(--border-color, #2d3139); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: var(--text-primary, #e4e6eb); font-size: 20px;">Chi tiết đơn từ</span>
                        <button onclick="document.getElementById('requestDetailModal').remove()" style="background: none; border: none; color: var(--text-secondary, #b0b3b8); cursor: pointer; font-size: 24px; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                            <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Loại đơn:</span>
                            <span class="detail-value" style="color: var(--text-primary, #e4e6eb); font-weight: 500;">${this.getRequestTypeName(request.requestType)}</span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, #2d3139);">
                            <span class="detail-label" style="color: var(--text-secondary, #b0b3b8); font-size: 14px;">Trạng thái:</span>
                            <span class="badge badge-${request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}">
                                ${request.status === 'approved' ? 'Đã duyệt' : request.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                            </span>
                        </div>
                        ${typeSpecificFields}
                        <div class="detail-section" style="margin: 16px 0; padding: 12px 0;">
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
                    <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--border-color, #2d3139);">
                        <button class="btn btn-secondary" onclick="document.getElementById('requestDetailModal').remove()" style="padding: 10px 20px; background: var(--bg-secondary, #2d3139); color: var(--text-primary, #e4e6eb); border: none; border-radius: 8px; cursor: pointer;">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    /**
     * Notifications
     */
    async renderNotifications() {
        return `
            <div class="section">
                <h3 class="section-title">Thông Báo</h3>
                    <button class="btn btn-sm" onclick="HRMModules.markAllRead()">
                        Đánh dấu tất cả đã đọc
                    </button>
                </div>
                <div class="section-body" id="notificationList">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async initNotifications() {
        await this.loadNotifications();
    },
    
    async loadNotifications() {
        const userData = SimpleStorage.get('userData');
        const container = document.getElementById('notificationList');
        
        try {
            const notifications = await apiClient.get('/notifications', {
                employeeId: userData?.employeeId,
                limit: 50
            });
            
            if (notifications.data?.length > 0) {
                container.innerHTML = `
                    <div class="list-group">
                        ${notifications.data.map(notif => `
                            <div class="list-item ${notif.isRead ? '' : 'unread'}" onclick="HRMModules.markNotificationRead(${notif.notificationId})">
                                <div class="notification-icon">
                                    <span class="material-icons-round">${this.getNotificationIcon(notif.type)}</span>
                                </div>
                                <div class="notification-content">
                                    <h4>${notif.title}</h4>
                                    <p>${notif.message}</p>
                                    <small>${new Date(notif.createdAt).toLocaleString('vi-VN')}</small>
                                </div>
                                ${!notif.isRead ? '<span class="unread-badge"></span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = '<p class="text-muted">Không có thông báo</p>';
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            container.innerHTML = '<p class="text-error">Lỗi khi tải thông báo</p>';
        }
    },
    
    getNotificationIcon(type) {
        const icons = {
            'info': 'info',
            'success': 'check_circle',
            'warning': 'warning',
            'error': 'error',
            'request': 'assignment',
            'task': 'task_alt',
            'system': 'settings'
        };
        return icons[type] || 'notifications';
    },
    
    async markNotificationRead(notificationId) {
        const userData = SimpleStorage.get('userData');
        
        try {
            await apiClient.post('/notifications/mark-read', {
                notificationId,
                employeeId: userData?.employeeId
            });
            await this.loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },
    
    async markAllRead() {
        const userData = SimpleStorage.get('userData');
        
        try {
            await apiClient.post('/notifications/mark-all-read', {
                employeeId: userData?.employeeId
            });
            alert('Đã đánh dấu tất cả là đã đọc');
            await this.loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
            alert('Lỗi khi cập nhật');
        }
    },
    
    /**
     * Profile
     */
    async renderProfile() {
        const userData = SimpleStorage.get('userData');
        
        // Calculate seniority if hire_date exists
        let seniorityText = '-';
        if (userData?.hire_date) {
            const hireDate = new Date(userData.hire_date);
            const today = new Date();
            const diffTime = Math.abs(today - hireDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            
            if (years > 0) {
                seniorityText = `${years} năm ${months} tháng`;
            } else {
                seniorityText = `${months} tháng`;
            }
        
        // Format birthdate
        let birthdateFormatted = '-';
        if (userData?.birthdate) {
            const bdate = new Date(userData.birthdate);
            birthdateFormatted = bdate.toLocaleDateString('vi-VN');
        
        // Format hire_date
        let hireDateFormatted = '-';
        if (userData?.hire_date) {
            const hdate = new Date(userData.hire_date);
            hireDateFormatted = hdate.toLocaleDateString('vi-VN');
        
        return `
            <div class="section">
                <h3 class="section-title">Thông Tin Cá Nhân</h3>
                </div>
                <div class="section-body">
                    <div class="profile-info">
                        <div class="profile-row">
                            <span>Mã nhân viên:</span>
                            <span><strong>${userData?.employeeId || '-'}</strong></span>
                        </div>
                        <div class="profile-row">
                            <span>Họ tên:</span>
                            <span>${userData?.fullName || '-'}</span>
                        </div>
                        <div class="profile-row">
                            <span>Email:</span>
                            <span>${userData?.email || '-'}</span>
                        </div>
                        <div class="profile-row">
                            <span>Số điện thoại:</span>
                            <span>${userData?.phone || '-'}</span>
                        </div>
                        <div class="profile-row">
                            <span>Ngày sinh:</span>
                            <span>${birthdateFormatted}</span>
                        </div>
                        <div class="profile-row">
                            <span>Loại hợp đồng:</span>
                            <span><span class="badge badge-${userData?.contract === 'fulltime' ? 'success' : 'info'}">${userData?.contract === 'fulltime' ? 'Toàn thời gian' : 'Bán thời gian'}</span></span>
                        </div>
                        <div class="profile-row">
                            <span>Phòng ban:</span>
                            <span>${userData?.departmentName || '-'}</span>
                        </div>
                        <div class="profile-row">
                            <span>Chức vụ:</span>
                            <span>${userData?.positionName || '-'}</span>
                        </div>
                        <div class="profile-row">
                            <span>Cửa hàng:</span>
                            <span>${userData?.storeName || '-'}</span>
                        </div>
                        <div class="profile-row">
                            <span>Ngày vào làm:</span>
                            <span>${hireDateFormatted}</span>
                        </div>
                        <div class="profile-row">
                            <span>Thâm niên:</span>
                            <span><strong>${seniorityText}</strong></span>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button class="btn btn-primary" onclick="HRMModules.changePassword()">
                            Đổi Mật Khẩu
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    initProfile() {
        console.log('Profile initialized');
    },
    
    changePassword() {
        alert('Chức năng đổi mật khẩu đang được phát triển');
    }
    }
};

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
    const later = () => {
        clearTimeout(timeout);
        func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    };
}
