/**
 * Mock Users System for Frontend Testing
 * Provides sample users with all permission combinations for testing without backend
 * 
 * Usage:
 * 1. Set CONFIG.MOCK_MODE = true in config.js
 * 2. Use MockAuth.switchUser('username') to change user
 * 3. MockAPI.login(username, password) to simulate login
 */

const MockUsers = {
    // VP - Admin (Full Access)
    admin: {
        employeeId: "E001",
        username: "admin",
        password: "123456",
        fullName: "Nguyễn Văn Admin",
        email: "admin@company.com",
        phone: "0901234567",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "VP_ADMIN",
        positionName: "Quản Trị Viên",
        positionCode: "ADMIN",
        permissions: "employee_manage,registration_approve,department_manage,position_manage,salary_manage,timesheet_approve,reports_view,system_admin",
        authToken: "mock_token_admin"
    },

    // VP - Quản Lý Khu Vực (Manager)
    quanly_vp: {
        employeeId: "E002",
        username: "quanly_vp",
        password: "123456",
        fullName: "Trần Thị Quản Lý",
        email: "quanly@company.com",
        phone: "0902345678",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "VP_QLKV",
        positionName: "Quản Lý Khu Vực",
        positionCode: "QLKV",
        permissions: "employee_manage,salary_manage,timesheet_approve,reports_view,schedule_manage,request_approve",
        authToken: "mock_token_qlvp"
    },

    // VP - Kế Toán
    ketoan: {
        employeeId: "E003",
        username: "ketoan",
        password: "123456",
        fullName: "Lê Văn Toán",
        email: "ketoan@company.com",
        phone: "0903456789",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "VP_KT",
        positionName: "Kế Toán",
        positionCode: "KT",
        permissions: "employee_view,salary_manage,reports_view,timesheet_view",
        authToken: "mock_token_ketoan"
    },

    // VP - IT
    it: {
        employeeId: "E004",
        username: "it",
        password: "123456",
        fullName: "Phạm Thị IT",
        email: "it@company.com",
        phone: "0904567890",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "VP_IT",
        positionName: "Nhân Viên IT",
        positionCode: "IT",
        permissions: "employee_view,system_admin,department_manage,position_manage,reports_view",
        authToken: "mock_token_it"
    },

    // VP - Giám Sát
    giamsat_vp: {
        employeeId: "E005",
        username: "giamsat_vp",
        password: "123456",
        fullName: "Hoàng Văn Sát",
        email: "giamsat@company.com",
        phone: "0905678901",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "VP_GS",
        positionName: "Giám Sát",
        positionCode: "GS",
        permissions: "timesheet_approve,request_approve,shift_manage,attendance_approve",
        authToken: "mock_token_gsvp"
    },

    // CH - Quản Lý LV2 (Store Manager) - Comprehensive 40+ fields
    quanly2: {
        // Basic Identity
        employeeId: "E101",
        username: "quanly2",
        password: "123456",
        fullName: "Nguyễn Thị Lan",
        firstName: "Lan",
        lastName: "Nguyễn Thị",
        nickname: "Lan Lan",
        
        // Contact Information
        email: "lanql@store.com",
        phone: "0911234567",
        emergencyContact: "0912999888",
        emergencyContactName: "Nguyễn Văn Hùng (Chồng)",
        
        // Personal Information
        dateOfBirth: "1988-05-15",
        age: 36,
        gender: "female",
        maritalStatus: "married",
        nationality: "Việt Nam",
        ethnicity: "Kinh",
        religion: "Không",
        
        // Identity Documents
        identityNumber: "079088015678",
        identityIssueDate: "2015-06-10",
        identityIssuePlace: "Công an TP.HCM",
        passportNumber: "",
        driverLicense: "",
        
        // Address Information
        address: "234 Đường Lê Văn Việt, Quận 9, TP.HCM",
        permanentAddress: "456 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
        city: "TP.HCM",
        district: "Quận 9",
        ward: "Phường Tăng Nhơn Phú A",
        
        // Organization Information
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_QL_LV2",
        positionName: "Quản Lý LV2",
        positionCode: "QL_LV2",
        storeId: "S001",
        storeName: "Cửa hàng 74 Đồng Đen",
        
        // Employment Information
        hireDate: "2016-03-01",
        probationEndDate: "2016-05-31",
        contractType: "full_time",
        contractStartDate: "2016-06-01",
        contractEndDate: "2026-05-31",
        workingStatus: "active",
        
        // Salary Information
        baseSalary: 25000, // 25,000 VNĐ per hour for CH
        salaryType: "hourly", // hourly for CH, monthly for VP
        bankAccount: "1234567890",
        bankName: "Vietcombank",
        bankBranch: "Chi nhánh TP.HCM",
        taxCode: "0123456789",
        insuranceNumber: "1234567890123",
        
        // Work Schedule
        workSchedule: "shift", // shift for CH, fixed for VP
        standardHoursPerWeek: 48,
        
        // Performance & Skills
        performanceRating: "excellent",
        skills: "Quản lý nhân sự, Quản lý kho, Chăm sóc khách hàng",
        certifications: "Chứng chỉ Quản lý Cửa hàng F&B",
        
        // System Information
        permissions: "attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,timesheet_approve,salary_view,request_create,request_approve,notification_view,profile_view,profile_edit",
        authToken: "mock_token_ql2",
        status: "active",
        createdAt: "2016-03-01T08:00:00.000Z",
        updatedAt: "2024-11-05T10:00:00.000Z",
        lastLoginAt: "2024-11-05T08:30:00.000Z"
    },

    // CH - Quản Lý LV1
    quanly1: {
        employeeId: "E102",
        username: "quanly1",
        password: "123456",
        fullName: "Trần Văn Minh",
        email: "minhql@store.com",
        phone: "0912345678",
        dateOfBirth: "1985-03-20",
        gender: "male",
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        identityNumber: "079085012345",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        positionId: "CH_QL_LV1",
        positionName: "Quản Lý LV1",
        storeId: "S001",
        storeName: "Cửa hàng Trung tâm",
        hireDate: "2018-06-15",
        contractType: "full_time",
        baseSalary: 15000000,
        status: "active",
        permissions: "attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,salary_view,request_create,request_approve,notification_view,profile_view,profile_edit",
        authToken: "mock_token_ql1"
    },

    // CH - Nhân Viên LV2 - Comprehensive 40+ fields
    nhanvien2: {
        // Basic Identity
        employeeId: "E103",
        username: "nhanvien2",
        password: "123456",
        fullName: "Lê Thị Hoa",
        firstName: "Hoa",
        lastName: "Lê Thị",
        nickname: "Hoa Hoa",
        
        // Contact Information
        email: "hoanv@store.com",
        phone: "0913456789",
        emergencyContact: "0914888777",
        emergencyContactName: "Lê Văn Bình (Anh trai)",
        
        // Personal Information
        dateOfBirth: "1996-08-22",
        age: 28,
        gender: "female",
        maritalStatus: "single",
        nationality: "Việt Nam",
        ethnicity: "Kinh",
        religion: "Phật giáo",
        
        // Identity Documents
        identityNumber: "079096023456",
        identityIssueDate: "2018-09-15",
        identityIssuePlace: "Công an TP.HCM",
        passportNumber: "",
        driverLicense: "",
        
        // Address Information
        address: "567 Đường Lê Hồng Phong, Quận 10, TP.HCM",
        permanentAddress: "789 Đường Nguyễn Trãi, Quận 5, TP.HCM",
        city: "TP.HCM",
        district: "Quận 10",
        ward: "Phường 12",
        
        // Organization Information
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_NV_LV2",
        positionName: "Nhân Viên LV2",
        positionCode: "NV_LV2",
        storeId: "S001",
        storeName: "Cửa hàng 74 Đồng Đen",
        
        // Employment Information
        hireDate: "2020-07-15",
        probationEndDate: "2020-10-14",
        contractType: "full_time",
        contractStartDate: "2020-10-15",
        contractEndDate: "2025-10-14",
        workingStatus: "active",
        
        // Salary Information
        baseSalary: 22000, // 22,000 VNĐ per hour for CH NV LV2
        salaryType: "hourly", // hourly for CH, monthly for VP
        bankAccount: "9876543210",
        bankName: "Techcombank",
        bankBranch: "Chi nhánh Quận 10",
        taxCode: "9876543210",
        insuranceNumber: "9876543210123",
        
        // Work Schedule
        workSchedule: "shift", // shift for CH, fixed for VP
        standardHoursPerWeek: 48,
        
        // Performance & Skills
        performanceRating: "good",
        skills: "Pha chế, Phục vụ, Kỹ năng giao tiếp",
        certifications: "Chứng chỉ Pha chế cơ bản",
        
        // System Information
        permissions: "attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view,profile_edit",
        authToken: "mock_token_nv2",
        status: "active",
        createdAt: "2020-07-15T08:00:00.000Z",
        updatedAt: "2024-11-05T10:00:00.000Z",
        lastLoginAt: "2024-11-05T08:00:00.000Z"
    },

    // CH - Nhân Viên LV1
    nhanvien1: {
        employeeId: "E104",
        username: "nhanvien1",
        password: "123456",
        fullName: "Phạm Văn Đức",
        email: "ducnv@store.com",
        phone: "0914567890",
        dateOfBirth: "1995-07-10",
        gender: "male",
        address: "789 Đường DEF, Quận 10, TP.HCM",
        identityNumber: "079095056789",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        positionId: "CH_NV_LV1",
        positionName: "Nhân Viên LV1",
        storeId: "S001",
        storeName: "Cửa hàng Trung tâm",
        hireDate: "2021-09-01",
        contractType: "full_time",
        baseSalary: 8000000,
        status: "active",
        permissions: "attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view,profile_edit",
        authToken: "mock_token_nv1"
    },

    // CH - Ca Trưởng (Shift Leader)
    catruong: {
        employeeId: "E105",
        username: "catruong",
        password: "123456",
        fullName: "Vũ Thị Mai",
        email: "maict@store.com",
        phone: "0915678901",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_CT",
        positionName: "Ca Trưởng",
        positionCode: "CT",
        permissions: "attendance_self,attendance_approve,schedule_view,shift_manage,timesheet_view,salary_view,request_create,notification_view,profile_view",
        authToken: "mock_token_ct"
    },

    // Testing Users
    test_none: {
        employeeId: "T001",
        username: "test_none",
        password: "123456",
        fullName: "Test None",
        email: "test@test.com",
        phone: "0900000000",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "TEST_NONE",
        positionName: "No Permissions",
        positionCode: "NONE",
        permissions: "",
        authToken: "mock_token_none"
    },

    test_view: {
        employeeId: "T002",
        username: "test_view",
        password: "123456",
        fullName: "Test Viewer",
        email: "viewer@test.com",
        phone: "0900000001",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "TEST_VIEW",
        positionName: "View Only",
        positionCode: "VIEW",
        permissions: "employee_view,timesheet_view,salary_view,schedule_view,notification_view,profile_view",
        authToken: "mock_token_view"
    },

    test_approve: {
        employeeId: "T003",
        username: "test_approve",
        password: "123456",
        fullName: "Test Approver",
        email: "approver@test.com",
        phone: "0900000002",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "TEST_APPROVE",
        positionName: "Approver",
        positionCode: "APPROVE",
        permissions: "registration_approve,timesheet_approve,attendance_approve,request_approve",
        authToken: "mock_token_approve"
    },

    test_create: {
        employeeId: "T004",
        username: "test_create",
        password: "123456",
        fullName: "Test Creator",
        email: "creator@test.com",
        phone: "0900000003",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "TEST_CREATE",
        positionName: "Creator",
        positionCode: "CREATE",
        permissions: "request_create,notification_view",
        authToken: "mock_token_create"
    },

    test_full: {
        employeeId: "T005",
        username: "test_full",
        password: "123456",
        fullName: "Test Full Access",
        email: "full@test.com",
        phone: "0900000004",
        departmentId: "VP",
        departmentName: "Văn Phòng",
        departmentCode: "VP",
        positionId: "TEST_FULL",
        positionName: "Full Access",
        positionCode: "FULL",
        permissions: "employee_manage,employee_view,registration_approve,department_manage,position_manage,salary_manage,salary_view,timesheet_approve,timesheet_view,attendance_self,attendance_approve,schedule_manage,schedule_view,shift_manage,request_create,request_approve,reports_view,system_admin,notification_view,profile_view",
        authToken: "mock_token_full"
    }
};

// Mock Authentication Helper
/**
 * Permission Utilities
 * Manages default permissions and permission checks
 */
const PermissionUtils = {
    /**
     * Default permissions that ALL users have
     */
    getDefaultPermissions() {
        return [
            'salary_view',      // View salary information
            'timesheet_view',   // View timesheet/attendance records
            'attendance_self',  // Check-in/check-out for self
            'schedule_view',    // View work schedule
            'profile_view',     // View own profile
            'profile_edit',     // Edit own profile
            'notifications_view' // View notifications
        ];
    },

    /**
     * Ensure permissions string includes all default permissions
     * @param {string} permissions - Comma-separated permission string
     * @returns {string} Updated permissions with defaults included
     */
    ensureDefaultPermissions(permissions) {
        const defaults = this.getDefaultPermissions();
        const current = permissions ? permissions.split(',').map(p => p.trim()) : [];
        
        // Add defaults that are missing
        defaults.forEach(perm => {
            if (!current.includes(perm)) {
                current.push(perm);
            }
        });
        
        return current.join(',');
    },

    /**
     * Check if user has a specific permission
     * @param {string} userPermissions - User's permission string
     * @param {string} permission - Permission to check
     * @returns {boolean} True if user has permission
     */
    hasPermission(userPermissions, permission) {
        if (!userPermissions) return false;
        const perms = userPermissions.split(',').map(p => p.trim());
        return perms.includes(permission);
    }
};

const MockAuth = {
    /**
     * Get current logged in user from localStorage using SimpleStorage
     */
    getCurrentUser() {
        // Use SimpleStorage if available, otherwise fall back to localStorage
        if (typeof SimpleStorage !== 'undefined') {
            return SimpleStorage.get('userData');
        }
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Switch to a different mock user
     * @param {string} username - Username to switch to
     */
    switchUser(username) {
        const user = MockUsers[username];
        if (!user) {
            console.error('Mock user not found:', username);
            console.log('Available users:', Object.keys(MockUsers));
            return false;
        }

        // Save to localStorage
        localStorage.setItem('authToken', user.authToken);
        localStorage.setItem('userData', JSON.stringify(user));
        
        console.log('✅ Switched to user:', user.fullName);
        console.log('   Department:', user.departmentName);
        console.log('   Position:', user.positionName);
        console.log('   Permissions:', user.permissions);
        
        return true;
    },

    /**
     * Get all available mock users
     */
    getAllUsers() {
        return Object.keys(MockUsers).map(key => {
            const user = MockUsers[key];
            return {
                username: user.username,
                fullName: user.fullName,
                department: user.departmentName,
                position: user.positionName,
                permissionCount: user.permissions ? user.permissions.split(',').length : 0
            };
        });
    },

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('✅ Logged out');
    }
};

// Mock API Client
const MockAPI = {
    /**
     * Simulate login API call
     * Supports both username and employeeId for backward compatibility
     * @param {string} usernameOrEmployeeId - Username or employeeId
     * @param {string} password 
     */
    login(usernameOrEmployeeId, password) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // First try to find by username (for backward compatibility)
                let user = MockUsers[usernameOrEmployeeId];
                
                // If not found by username, search by employeeId
                if (!user) {
                    user = Object.values(MockUsers).find(u => u.employeeId === usernameOrEmployeeId);
                }
                
                if (!user) {
                    reject({
                        success: false,
                        message: 'Mã nhân viên không tồn tại'
                    });
                    return;
                }

                if (user.password !== password) {
                    reject({
                        success: false,
                        message: 'Mật khẩu không đúng'
                    });
                    return;
                }

                // Data will be saved by the login handler using SimpleStorage
                // No need to save here to avoid double storage and encoding issues

                // Ensure user has all default permissions
                const permissionsWithDefaults = PermissionUtils.ensureDefaultPermissions(user.permissions);

                resolve({
                    success: true,
                    message: 'Đăng nhập thành công',
                    token: user.authToken,
                    userData: user,
                    employeeId: user.employeeId,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    departmentId: user.departmentId,
                    departmentName: user.departmentName,
                    departmentCode: user.departmentCode,
                    positionId: user.positionId,
                    positionName: user.positionName,
                    positionCode: user.positionCode,
                    permissions: permissionsWithDefaults  // Always includes default permissions
                });
            }, 500);
        });
    },

    /**
     * Simulate any GET request with comprehensive mock data
     */
    get(endpoint, params) {
        console.log('Mock GET:', endpoint, params);
        
        // Mock data for various endpoints
        if (endpoint.includes('/notifications')) {
            return Promise.resolve({
                success: true,
                data: [
                    {
                        id: 'n1',
                        title: 'Thông báo quan trọng',
                        message: 'Hệ thống sẽ bảo trì vào 10:00 PM hôm nay',
                        type: 'info',
                        isRead: false,
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'n2',
                        title: 'Yêu cầu đã được duyệt',
                        message: 'Yêu cầu nghỉ phép của bạn đã được chấp thuận',
                        type: 'success',
                        isRead: false,
                        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'n3',
                        title: 'Lịch làm việc mới',
                        message: 'Lịch làm việc tuần sau đã được cập nhật',
                        type: 'info',
                        isRead: true,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    }
                ],
                unreadCount: 2
            });
        }
        
        if (endpoint.includes('/attendance')) {
            // Generate comprehensive attendance data for current month
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const currentDay = today.getDate();
            
            const attendanceData = [];
            // Generate attendance records for each day of current month up to today
            for (let day = 1; day <= Math.min(currentDay, daysInMonth); day++) {
                // Skip weekends (Saturday=6, Sunday=0)
                const date = new Date(year, month, day);
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                // Morning check-in (08:00 - 08:30)
                const morningMinutes = Math.floor(Math.random() * 30);
                const morningTime = `08:${morningMinutes.toString().padStart(2, '0')}:00`;
                
                attendanceData.push({
                    attendanceId: `a${day}m`,
                    employeeId: params?.employeeId || 'E101',
                    checkDate: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                    checkTime: morningTime,
                    checkLocation: 'Cửa Hàng 74 Đồng Đen',
                    createdAt: new Date(year, month, day, 8, morningMinutes).toISOString()
                });
                
                // Afternoon check-in (13:00 - 13:30)
                const afternoonMinutes = Math.floor(Math.random() * 30);
                const afternoonTime = `13:${afternoonMinutes.toString().padStart(2, '0')}:00`;
                
                attendanceData.push({
                    attendanceId: `a${day}a`,
                    employeeId: params?.employeeId || 'E101',
                    checkDate: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                    checkTime: afternoonTime,
                    checkLocation: 'Cửa Hàng 74 Đồng Đen',
                    createdAt: new Date(year, month, day, 13, afternoonMinutes).toISOString()
                });
            }
            
            return Promise.resolve({
                success: true,
                data: attendanceData,
                total: attendanceData.length
            });
        }
        
        if (endpoint.includes('/shifts') || endpoint.includes('/schedule')) {
            // Generate schedule data for current month
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const scheduleData = [];
            // Generate shifts for each day of current month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                // Alternate between morning and afternoon shifts
                if (day % 2 === 0) {
                    // Morning shift
                    scheduleData.push({
                        shiftId: `s${day}m`,
                        assignmentId: `a${day}m`,
                        employeeId: params?.employeeId || 'E101',
                        shiftName: 'Ca Sáng',
                        startTime: '08:00:00',
                        endTime: '12:00:00',
                        breakTime: 0,
                        workHours: 4,
                        date: dateStr,
                        status: day <= today.getDate() ? 'completed' : 'scheduled'
                    });
                } else {
                    // Afternoon shift
                    scheduleData.push({
                        shiftId: `s${day}a`,
                        assignmentId: `a${day}a`,
                        employeeId: params?.employeeId || 'E101',
                        shiftName: 'Ca Chiều',
                        startTime: '13:00:00',
                        endTime: '17:00:00',
                        breakTime: 0,
                        workHours: 4,
                        date: dateStr,
                        status: day <= today.getDate() ? 'completed' : 'scheduled'
                    });
                }
            }
            
            return Promise.resolve({
                success: true,
                data: scheduleData,
                total: scheduleData.length
            });
        }
        
        if (endpoint.includes('/salary')) {
            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            
            // Calculate based on position
            const user = MockAuth.getCurrentUser();
            let baseSalary = 8000000; // Default for staff
            if (user && user.positionName) {
                if (user.positionName.includes('Quản Lý')) {
                    baseSalary = 15000000;
                } else if (user.positionName.includes('Nhân Viên LV2')) {
                    baseSalary = 10000000;
                }
            }
            
            return Promise.resolve({
                success: true,
                data: {
                    employeeId: user?.employeeId || 'E101',
                    month: month,
                    year: year,
                    baseSalary: baseSalary,
                    bonus: baseSalary * 0.1, // 10% bonus
                    deduction: baseSalary * 0.05, // 5% deduction (insurance, etc)
                    total: baseSalary + (baseSalary * 0.1) - (baseSalary * 0.05),
                    status: 'calculated',
                    paymentDate: `${year}-${month.toString().padStart(2, '0')}-25`,
                    details: {
                        workDays: 22,
                        presentDays: 20,
                        hoursWorked: 160,
                        overtimeHours: 0
                    }
                }
            });
        }
        
        if (endpoint.includes('/timesheet')) {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const currentDay = today.getDate();
            
            // Count work days (excluding weekends)
            let workDays = 0;
            let presentDays = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                if (date.getDay() !== 0 && date.getDay() !== 6) {
                    workDays++;
                    if (day <= currentDay) {
                        presentDays++;
                    }
                }
            }
            
            return Promise.resolve({
                success: true,
                data: {
                    employeeId: params?.employeeId || 'E101',
                    month: month + 1,
                    year: year,
                    totalDays: workDays,
                    presentDays: presentDays,
                    absentDays: 0,
                    lateDays: Math.floor(presentDays * 0.1), // 10% late
                    totalHours: presentDays * 8,
                    overtimeHours: 0,
                    details: generateTimesheetDetails(year, month, currentDay)
                }
            });
        }
        
        // Helper function to generate detailed timesheet data
        function generateTimesheetDetails(year, month, currentDay) {
            const details = [];
            for (let day = 1; day <= currentDay; day++) {
                const date = new Date(year, month, day);
                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                details.push({
                    date: dateStr,
                    dayOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()],
                    shiftName: day % 2 === 0 ? 'Ca Sáng' : 'Ca Chiều',
                    checkInTime: day % 2 === 0 ? '08:00:00' : '13:00:00',
                    checkOutTime: day % 2 === 0 ? '12:00:00' : '17:00:00',
                    workHours: 4,
                    status: 'present'
                });
            }
            return details;
        }
        
        if (endpoint.includes('/employees')) {
            return Promise.resolve({
                success: true,
                data: [
                    {
                        employeeId: 'E001',
                        fullName: 'Nguyễn Văn A',
                        position: 'Nhân viên',
                        department: 'Cửa hàng',
                        permissions: 'attendance_self,schedule_view'
                    },
                    {
                        employeeId: 'E002',
                        fullName: 'Trần Thị B',
                        position: 'Quản lý',
                        department: 'Văn phòng',
                        permissions: 'employee_manage,salary_view'
                    }
                ]
            });
        }
        
        // Profile endpoints
        if (endpoint.includes('/profile') || endpoint.includes('/employee/')) {
            const userData = SimpleStorage.get('userData');
            // Find user by employeeId since userData stores employeeId, not username
            const currentUser = Object.values(MockAPI.users).find(u => u.employeeId === userData?.employeeId) || MockAPI.users.nhanvien1;
            
            return Promise.resolve({
                success: true,
                data: {
                    employeeId: currentUser.employeeId,
                    fullName: currentUser.fullName,
                    email: currentUser.email,
                    phone: currentUser.phone || '0901234567',
                    dateOfBirth: currentUser.dateOfBirth || '1990-01-15',
                    gender: currentUser.gender || 'male',
                    address: currentUser.address || '123 Đường ABC, Quận 1, TP.HCM',
                    identityNumber: currentUser.identityNumber || '012345678901',
                    positionId: currentUser.positionId,
                    positionName: currentUser.positionName,
                    departmentId: currentUser.departmentId,
                    departmentName: currentUser.departmentName,
                    storeId: currentUser.storeId || 'S001',
                    storeName: currentUser.storeName || 'Cửa hàng Trung tâm',
                    hireDate: currentUser.hireDate || '2020-01-01',
                    contractType: currentUser.contractType || 'full_time',
                    baseSalary: currentUser.baseSalary || 8000000,
                    status: currentUser.status || 'active',
                    permissions: currentUser.permissions
                }
            });
        }
        
        // Requests endpoints
        if (endpoint.includes('/requests') || endpoint.includes('/attendance-requests')) {
            const userData = SimpleStorage.get('userData');
            const currentEmployeeId = userData?.employeeId || 'E101';
            
            return Promise.resolve({
                success: true,
                data: [
                    {
                        requestId: 'R001',
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        type: 'leave',
                        reason: 'Nghỉ phép chăm sóc người thân',
                        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'pending',
                        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        requestId: 'R002',
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        type: 'overtime',
                        reason: 'Đăng ký tăng ca làm thêm giờ cuối tuần',
                        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'approved',
                        reviewedBy: 'E101',
                        reviewerName: 'Nguyễn Thị Lan',
                        reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        reviewNote: 'Đã duyệt',
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        requestId: 'R003',
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        type: 'early_leave',
                        reason: 'Xin về sớm do có việc gia đình đột xuất',
                        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'rejected',
                        reviewedBy: 'E101',
                        reviewerName: 'Nguyễn Thị Lan',
                        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        reviewNote: 'Không đủ lý do chính đáng',
                        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        requestId: 'R004',
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        type: 'shift_change',
                        reason: 'Xin đổi ca với đồng nghiệp',
                        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'approved',
                        reviewedBy: 'E101',
                        reviewerName: 'Nguyễn Thị Lan',
                        reviewedAt: new Date().toISOString(),
                        reviewNote: 'Đã xác nhận với đồng nghiệp',
                        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                    }
                ]
            });
        }
        
        // Registrations endpoints
        if (endpoint.includes('/registrations')) {
            return Promise.resolve({
                success: true,
                data: [
                    {
                        employeeId: 'E999',
                        fullName: 'Nguyễn Văn Mới',
                        email: 'new@company.com',
                        phone: '0909999999',
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    }
                ]
            });
        }
        
        // GPS check endpoint
        if (endpoint.includes('/gps/check')) {
            return Promise.resolve({
                success: true,
                data: {
                    isInRange: true,
                    distance: 50, // meters
                    storeName: 'Cửa hàng chính'
                }
            });
        }
        
        // Available shifts endpoint
        if (endpoint.includes('/shifts/available')) {
            return Promise.resolve({
                success: true,
                data: [
                    {
                        id: 'shift1',
                        date: new Date().toISOString().split('T')[0],
                        shiftType: 'morning',
                        startTime: '08:00',
                        endTime: '12:00',
                        available: true,
                        registered: false
                    },
                    {
                        id: 'shift2',
                        date: new Date().toISOString().split('T')[0],
                        shiftType: 'afternoon',
                        startTime: '13:00',
                        endTime: '17:00',
                        available: true,
                        registered: false
                    }
                ]
            });
        }
        
        // Team schedule endpoint
        if (endpoint.includes('/team-schedule')) {
            return Promise.resolve({
                success: true,
                data: [
                    {
                        employeeId: 'E001',
                        employeeName: 'Nguyễn Văn A',
                        shifts: ['08:00-12:00', '13:00-17:00']
                    }
                ]
            });
        }
        
        // Notification count
        if (endpoint.includes('/notification-count')) {
            return Promise.resolve({
                success: true,
                data: { count: 2, unreadCount: 2 }
            });
        }
        
        // Default response
        return Promise.resolve({ success: true, data: [], message: 'Mock data' });
    },

    /**
     * Simulate any POST request
     */
    post(endpoint, data) {
        console.log('Mock POST:', endpoint, data);
        
        if (endpoint.includes('/attendance/check-in')) {
            return Promise.resolve({
                success: true,
                message: 'Chấm công vào thành công',
                data: {
                    checkIn: new Date().toTimeString().split(' ')[0],
                    status: 'checked_in'
                }
            });
        }
        
        if (endpoint.includes('/attendance/check-out')) {
            return Promise.resolve({
                success: true,
                message: 'Chấm công ra thành công',
                data: {
                    checkOut: new Date().toTimeString().split(' ')[0],
                    status: 'checked_out'
                }
            });
        }
        
        // Shift registration
        if (endpoint.includes('/shifts/register') || endpoint.includes('/register-shift')) {
            return Promise.resolve({
                success: true,
                message: 'Đăng ký ca làm việc thành công',
                data: { registered: true }
            });
        }
        
        // Request submissions (handle both /requests and /requests/submit)
        if (endpoint.includes('/requests') && !endpoint.includes('/requests/')) {
            return Promise.resolve({
                success: true,
                message: 'Gửi yêu cầu thành công',
                data: { 
                    requestId: 'R' + Date.now(),
                    ...data,
                    createdAt: new Date().toISOString()
                }
            });
        }
        
        // Request approvals
        if (endpoint.includes('/requests/') && (endpoint.includes('/approve') || endpoint.includes('/reject'))) {
            return Promise.resolve({
                success: true,
                message: endpoint.includes('/approve') ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu',
                data: { 
                    status: endpoint.includes('/approve') ? 'approved' : 'rejected',
                    reviewedAt: new Date().toISOString()
                }
            });
        }
        
        // Legacy attendance-request endpoint
        if (endpoint.includes('/attendance-request')) {
            return Promise.resolve({
                success: true,
                message: 'Gửi yêu cầu thành công',
                data: { requestId: 'R' + Date.now() }
            });
        }
        
        // Approve/reject actions
        if (endpoint.includes('/approve') || endpoint.includes('/reject')) {
            return Promise.resolve({
                success: true,
                message: endpoint.includes('/approve') ? 'Đã duyệt thành công' : 'Đã từ chối',
                data: { status: endpoint.includes('/approve') ? 'approved' : 'rejected' }
            });
        }
        
        // Profile updates
        if (endpoint.includes('/profile/update') || endpoint.includes('/employee/update')) {
            return Promise.resolve({
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: { updated: true }
            });
        }
        
        // Permission updates
        if (endpoint.includes('/permissions/update')) {
            return Promise.resolve({
                success: true,
                message: 'Cập nhật quyền thành công',
                data: { updated: true }
            });
        }
        
        // Mark notifications as read
        if (endpoint.includes('/notifications/read') || endpoint.includes('/mark-read')) {
            return Promise.resolve({
                success: true,
                message: 'Đánh dấu đã đọc thành công',
                data: { marked: true }
            });
        }
        
        // GPS check
        if (endpoint.includes('/gps/check')) {
            return Promise.resolve({
                success: true,
                data: {
                    isInRange: true,
                    distance: 50,
                    storeName: 'Cửa hàng chính'
                }
            });
        }
        
        return Promise.resolve({ success: true, message: 'Mock success' });
    },
    
    /**
     * Simulate PUT request
     */
    put(endpoint, data) {
        console.log('Mock PUT:', endpoint, data);
        return this.post(endpoint, data); // Reuse POST logic
    },
    
    /**
     * Simulate DELETE request  
     */
    delete(endpoint) {
        console.log('Mock DELETE:', endpoint);
        return Promise.resolve({ success: true, message: 'Mock delete success' });
    }
};

// Auto-initialize mock mode message
if (typeof window !== 'undefined') {
    console.log('%c📋 Mock Users System Loaded', 'color: #5b9ff9; font-size: 16px; font-weight: bold');
    console.log('%cAvailable commands:', 'color: #8b949e; font-size: 14px');
    console.log('  MockAuth.switchUser("username") - Switch to different user');
    console.log('  MockAuth.getAllUsers() - List all available users');
    console.log('  MockAuth.getCurrentUser() - Show current user');
    console.log('  MockAuth.logout() - Logout');
    console.log('  MockAPI.login(username, password) - Simulate login');
    console.log('%cDefault password for all users: 123456', 'color: #f9826c; font-size: 12px');
    console.log('\n%cQuick Start:', 'color: #5b9ff9; font-size: 14px');
    console.log('  MockAuth.switchUser("admin"); location.reload(); - Admin');
    console.log('  MockAuth.switchUser("quanly2"); location.reload(); - Store Manager');
    console.log('  MockAuth.switchUser("nhanvien1"); location.reload(); - Staff');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MockUsers, MockAuth, MockAPI };
}
