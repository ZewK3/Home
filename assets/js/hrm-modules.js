/**
 * HRM Modules - Content renderers for VP and CH dashboards
 * All modules are rendered into #mainContent dynamically
 */

const HRMModules = {
    
    /**
     * VP Modules (HRMSystem.html - Office Department)
     */
    VP: {
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
                    
                    <div class="card mt-4">
                        <div class="card-header">
                            <h3>Đăng Ký Chờ Duyệt</h3>
                            <button class="btn btn-primary btn-sm" onclick="HRMRouter.navigateTo('approve-registration')">
                                Xem Tất Cả
                            </button>
                        </div>
                        <div class="card-body">
                            ${pendingRegs.data?.length > 0 ? 
                                `<div class="list-group">
                                    ${pendingRegs.data.slice(0, 5).map(reg => `
                                        <div class="list-item">
                                            <div class="list-item-content">
                                                <h4>${reg.fullName}</h4>
                                                <p>${reg.email} • ${reg.phone}</p>
                                            </div>
                                            <button class="btn btn-success btn-sm" onclick="HRMModules.VP.approveRegistration('${reg.registrationId}')">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Quản Lý Nhân Viên</h3>
                        <button class="btn btn-primary" onclick="HRMModules.VP.showAddEmployeeForm()">
                            <span class="material-icons-round">person_add</span>
                            Thêm Nhân Viên
                        </button>
                    </div>
                    <div class="card-body">
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
                option.value = dept.departmentId;
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
                departmentId: document.getElementById('filterDepartment')?.value,
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
                                                <button class="btn btn-sm btn-primary" onclick="HRMModules.VP.editEmployee('${emp.employeeId}')">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Duyệt Đăng Ký</h3>
                    </div>
                    <div class="card-body">
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
                                        <button class="btn btn-success" onclick="HRMModules.VP.approveRegistration('${reg.registrationId}')">
                                            <span class="material-icons-round">check</span>
                                            Duyệt
                                        </button>
                                        <button class="btn btn-danger" onclick="HRMModules.VP.rejectRegistration('${reg.registrationId}')">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Danh Sách Phòng Ban</h3>
                    </div>
                    <div class="card-body" id="departmentList">
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
                                <div class="card">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Danh Sách Chức Vụ</h3>
                        <select id="positionDepartmentFilter" class="form-select">
                            <option value="">Tất cả phòng ban</option>
                        </select>
                    </div>
                    <div class="card-body" id="positionList">
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
                option.value = dept.departmentId;
                option.textContent = dept.departmentName;
                filter.appendChild(option);
            });
            
            filter.addEventListener('change', () => this.loadPositions());
            await this.loadPositions();
        },
        
        async loadPositions() {
            const listEl = document.getElementById('positionList');
            const departmentId = document.getElementById('positionDepartmentFilter')?.value;
            
            try {
                const params = departmentId ? { departmentId } : {};
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
                <div class="card">
                    <div class="card-header">
                        <h3>Quản Lý Lương</h3>
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
                            <button class="btn btn-primary" onclick="HRMModules.VP.calculateAllSalaries()">
                                Tính Lương Tất Cả
                            </button>
                        </div>
                    </div>
                    <div class="card-body" id="salaryList">
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
                                                    <button class="btn btn-sm btn-success" onclick="HRMModules.VP.approveSalary(${salary.salaryId})">
                                                        Duyệt
                                                    </button>
                                                ` : salary.status === 'approved' ? `
                                                    <button class="btn btn-sm btn-primary" onclick="HRMModules.VP.markSalaryPaid(${salary.salaryId})">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Duyệt Bảng Công</h3>
                    </div>
                    <div class="card-body">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Báo Cáo & Thống Kê</h3>
                    </div>
                    <div class="card-body">
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
    CH: {
        /**
         * CH Dashboard
         */
        async renderDashboard() {
            const userData = SimpleStorage.get('userData');
            const employeeId = userData?.employeeId;
            
            return `
                <div class="dashboard-welcome">
                    <h2>Xin chào, ${userData?.fullName || 'User'}!</h2>
                    <p>${userData?.positionName || 'Nhân viên'} - ${userData?.departmentName || 'Store'}</p>
                </div>
                
                <div class="quick-actions">
                    <button class="action-card" onclick="HRMRouter.navigateTo('attendance')">
                        <span class="material-icons-round">fingerprint</span>
                        <span>Chấm Công</span>
                    </button>
                    <button class="action-card" onclick="HRMRouter.navigateTo('schedule')">
                        <span class="material-icons-round">calendar_month</span>
                        <span>Lịch Làm</span>
                    </button>
                    <button class="action-card" onclick="HRMRouter.navigateTo('timesheet')">
                        <span class="material-icons-round">table_chart</span>
                        <span>Bảng Công</span>
                    </button>
                    <button class="action-card" onclick="HRMRouter.navigateTo('salary')">
                        <span class="material-icons-round">payments</span>
                        <span>Lương</span>
                    </button>
                </div>
                
                <div class="card mt-4">
                    <div class="card-header">
                        <h3>Thông Báo Mới</h3>
                    </div>
                    <div class="card-body" id="recentNotifications">
                        <div class="loading-container">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        async initDashboard() {
            // Load recent notifications
            const userData = SimpleStorage.get('userData');
            const employeeId = userData?.employeeId;
            
            if (employeeId) {
                try {
                    const notifications = await apiClient.get('/notifications', {
                        employeeId,
                        limit: 5
                    });
                    
                    const container = document.getElementById('recentNotifications');
                    if (notifications.data?.length > 0) {
                        container.innerHTML = `
                            <div class="list-group">
                                ${notifications.data.map(notif => `
                                    <div class="list-item">
                                        <h4>${notif.title}</h4>
                                        <p>${notif.message}</p>
                                        <small>${new Date(notif.createdAt).toLocaleString('vi-VN')}</small>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    } else {
                        container.innerHTML = '<p class="text-muted">Không có thông báo mới</p>';
                    }
                } catch (error) {
                    console.error('Error loading notifications:', error);
                }
            }
        },
        
        /**
         * Attendance
         */
        async renderAttendance() {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3>Chấm Công</h3>
                    </div>
                    <div class="card-body">
                        <div class="attendance-controls">
                            <button class="btn btn-success btn-lg" onclick="HRMModules.CH.clockIn()">
                                <span class="material-icons-round">login</span>
                                Check In
                            </button>
                            <button class="btn btn-danger btn-lg" onclick="HRMModules.CH.clockOut()">
                                <span class="material-icons-round">logout</span>
                                Check Out
                            </button>
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
            await this.loadTodayAttendance();
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
                <div class="card">
                    <div class="card-header">
                        <h3>Lịch Làm Việc</h3>
                    </div>
                    <div class="card-body">
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
                <div class="card">
                    <div class="card-header">
                        <h3>Bảng Công</h3>
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
                    <div class="card-body" id="timesheetData">
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
                        </div>
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
                <div class="card">
                    <div class="card-header">
                        <h3>Lương</h3>
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
                    <div class="card-body" id="salaryData">
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
                
                if (salary.data?.length > 0) {
                    const data = salary.data[0];
                    container.innerHTML = `
                        <div class="salary-detail">
                            <div class="salary-row">
                                <span>Lương cơ bản:</span>
                                <span><strong>${data.baseSalary?.toLocaleString('vi-VN')} VNĐ</strong></span>
                            </div>
                            <div class="salary-row">
                                <span>Số ngày làm:</span>
                                <span>${data.workDays || 0} ngày</span>
                            </div>
                            <div class="salary-row">
                                <span>Số giờ làm:</span>
                                <span>${data.workHours || 0} giờ</span>
                            </div>
                            <div class="salary-row">
                                <span>Tăng ca:</span>
                                <span>${data.overtimeHours || 0} giờ</span>
                            </div>
                            <div class="salary-row">
                                <span>Thưởng:</span>
                                <span class="text-success">+${data.bonus?.toLocaleString('vi-VN') || 0} VNĐ</span>
                            </div>
                            <div class="salary-row">
                                <span>Phạt:</span>
                                <span class="text-danger">-${data.deduction?.toLocaleString('vi-VN') || 0} VNĐ</span>
                            </div>
                            <hr>
                            <div class="salary-row total">
                                <span><strong>TỔNG LƯƠNG:</strong></span>
                                <span><strong>${data.totalSalary?.toLocaleString('vi-VN')} VNĐ</strong></span>
                            </div>
                            <div class="salary-row">
                                <span>Trạng thái:</span>
                                <span class="badge badge-${data.status === 'paid' ? 'success' : data.status === 'approved' ? 'info' : 'warning'}">
                                    ${data.status === 'paid' ? 'Đã Thanh Toán' : data.status === 'approved' ? 'Đã Duyệt' : 'Chờ Duyệt'}
                                </span>
                            </div>
                        </div>
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
                <div class="card">
                    <div class="card-header">
                        <h3>Yêu Cầu Của Tôi</h3>
                        <button class="btn btn-primary" onclick="HRMModules.CH.showNewRequestForm()">
                            Tạo Yêu Cầu Mới
                        </button>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Chức năng đang được phát triển</p>
                    </div>
                </div>
            `;
        },
        
        initRequests() {
            console.log('Requests initialized');
        },
        
        /**
         * Notifications
         */
        async renderNotifications() {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3>Thông Báo</h3>
                        <button class="btn btn-sm" onclick="HRMModules.CH.markAllRead()">
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>
                    <div class="card-body" id="notificationList">
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
                                <div class="list-item ${notif.isRead ? '' : 'unread'}" onclick="HRMModules.CH.markNotificationRead(${notif.notificationId})">
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
            
            return `
                <div class="card">
                    <div class="card-header">
                        <h3>Thông Tin Cá Nhân</h3>
                    </div>
                    <div class="card-body">
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
                        </div>
                        
                        <div class="mt-4">
                            <button class="btn btn-primary" onclick="HRMModules.CH.changePassword()">
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
