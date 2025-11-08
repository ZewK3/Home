/**
 * Mock Users System for Frontend Testing
 * Provides sample users with all permission combinations for testing without backend
 * 
 * Usage:
 * 1. Set CONFIG.MOCK_MODE = true in config.js
 * 2. Use MockAuth.switchUser('username') to change user
 * 3. MockAPI.login(username, password) to simulate login
 */

// Shift Definitions - Matches shifts table schema exactly
// shiftId: INTEGER PRIMARY KEY, name: TEXT, shiftCode: TEXT, startTime: INTEGER, endTime: INTEGER, timeName: TEXT
const SHIFT_DEFINITIONS = {
    1: { shiftId: 1, name: "Ca 4 Tiếng 8-12", shiftCode: "S4_08-12", startTime: 8, endTime: 12, timeName: "08:00-12:00" },
    2: { shiftId: 2, name: "Ca 8 Tiếng 8-17", shiftCode: "S8_08-17", startTime: 8, endTime: 17, timeName: "08:00-17:00" },
    3: { shiftId: 3, name: "Ca 8 Tiếng 13-22", shiftCode: "S8_13-22", startTime: 13, endTime: 22, timeName: "13:00-22:00" },
    4: { shiftId: 4, name: "Ca 8 Tiếng 22-06", shiftCode: "S8_22-06", startTime: 22, endTime: 6, timeName: "22:00-06:00" }
};

const MockUsers = {
    // VP - Admin (Full Access)
    // Only fields from SQL schema: employees table + permissions from positions table
    admin: {
        // From employees table
        employeeId: "E001",
        fullName: "Nguyễn Văn Admin",
        phone: "0901234567",
        email: "admin@company.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "VP_ADMIN",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2020-01-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2020-01-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "employee_manage,registration_approve,department_manage,position_manage,salary_manage,timesheet_approve,reports_view,system_admin",
        
        // Mock API only
        username: "admin",
        authToken: "mock_token_admin"
    },

    // VP - Quản Lý Khu Vực (Manager)
    quanly_vp: {
        // From employees table
        employeeId: "E002",
        fullName: "Trần Thị Quản Lý",
        phone: "0902345678",
        email: "quanly@company.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "VP_QLKV",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2020-02-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2020-02-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "employee_manage,salary_manage,timesheet_approve,reports_view,schedule_manage,request_approve",
        
        // Mock API only
        username: "quanly_vp",
        authToken: "mock_token_qlvp"
    },

    // VP - Kế Toán
    ketoan: {
        // From employees table
        employeeId: "E003",
        fullName: "Lê Văn Toán",
        phone: "0903456789",
        email: "ketoan@company.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "VP_KT",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2020-03-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2020-03-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "employee_view,salary_manage,reports_view,timesheet_view",
        
        // Mock API only
        username: "ketoan",
        authToken: "mock_token_ketoan"
    },

    // VP - IT
    it: {
        // From employees table
        employeeId: "E004",
        fullName: "Phạm Thị IT",
        phone: "0904567890",
        email: "it@company.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "VP_IT",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2020-04-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2020-04-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "employee_view,system_admin,department_manage,position_manage,reports_view",
        
        // Mock API only
        username: "it",
        authToken: "mock_token_it"
    },

    // VP - Giám Sát
    giamsat_vp: {
        // From employees table
        employeeId: "E005",
        fullName: "Hoàng Văn Sát",
        phone: "0905678901",
        email: "giamsat@company.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "VP_GS",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2020-05-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2020-05-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "timesheet_approve,request_approve,shift_manage,attendance_approve",
        
        // Mock API only
        username: "giamsat_vp",
        authToken: "mock_token_gsvp"
    },

    // CH - Quản Lý LV2 (Store Manager)
    quanly2: {
        // From employees table
        employeeId: "E101",
        fullName: "Nguyễn Thị Lan",
        phone: "0911234567",
        email: "lanql@store.com",
        password: "123456",
        storeId: "S001",
        companyId: "COMP001",
        positionId: "CH_QL_LV2",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2016-03-01",
        last_login_at: "2024-11-05T08:30:00Z",
        created_at: "2016-03-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,timesheet_approve,salary_view,request_create,request_approve,notification_view,profile_view",
        
        // Mock API only
        username: "quanly2",
        authToken: "mock_token_ql2"
    },

    // CH - Quản Lý LV1
    quanly1: {
        // From employees table
        employeeId: "E102",
        fullName: "Trần Văn Minh",
        phone: "0912345678",
        email: "minhql@store.com",
        password: "123456",
        storeId: "S001",
        companyId: "COMP001",
        positionId: "CH_QL_LV1",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2018-06-15",
        last_login_at: "2024-11-05T07:45:00Z",
        created_at: "2018-06-15T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "attendance_self,timesheet_approve,shift_manage,request_approve,schedule_view,timesheet_view,salary_view,notification_view,profile_view",
        
        // Mock API only
        username: "quanly1",
        authToken: "mock_token_ql1"
    },

    // CH - Nhân Viên LV2
    nhanvien2: {
        // From employees table
        employeeId: "E103",
        fullName: "Lê Thị Hoa",
        phone: "0913456789",
        email: "hoanv@store.com",
        password: "123456",
        storeId: "S001",
        companyId: "COMP001",
        positionId: "CH_NV_LV2",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2020-07-15",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2020-07-15T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view",
        
        // Mock API only
        username: "nhanvien2",
        authToken: "mock_token_nv2"
    },

    // CH - Nhân Viên LV1
    nhanvien1: {
        // From employees table
        employeeId: "E104",
        fullName: "Phạm Văn Đức",
        phone: "0914567890",
        email: "ducnv@store.com",
        password: "123456",
        storeId: "S001",
        companyId: "COMP001",
        positionId: "CH_NV_LV1",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2021-09-01",
        last_login_at: "2024-11-05T07:30:00Z",
        created_at: "2021-09-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view",
        
        // Mock API only
        username: "nhanvien1",
        authToken: "mock_token_nv1"
    },

    // CH - Ca Trưởng (Shift Leader)
    catruong: {
        // From employees table
        employeeId: "E105",
        fullName: "Vũ Thị Mai",
        phone: "0915678901",
        email: "maict@store.com",
        password: "123456",
        storeId: "S001",
        companyId: "COMP001",
        positionId: "CH_CT",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2019-08-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2019-08-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "attendance_self,attendance_approve,schedule_view,shift_manage,timesheet_view,salary_view,request_create,notification_view,profile_view",
        
        // Mock API only
        username: "catruong",
        authToken: "mock_token_ct"
    },

    // Testing Users
    test_none: {
        // From employees table
        employeeId: "T001",
        fullName: "Test None",
        phone: "0900000000",
        email: "test@test.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "TEST_NONE",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2024-01-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2024-01-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "",
        
        // Mock API only
        username: "test_none",
        authToken: "mock_token_none"
    },

    test_view: {
        // From employees table
        employeeId: "T002",
        fullName: "Test Viewer",
        phone: "0900000001",
        email: "viewer@test.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "TEST_VIEW",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2024-01-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2024-01-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "employee_view,timesheet_view,salary_view,schedule_view,notification_view,profile_view",
        
        // Mock API only
        username: "test_view",
        authToken: "mock_token_view"
    },

    test_approve: {
        // From employees table
        employeeId: "T003",
        fullName: "Test Approver",
        phone: "0900000002",
        email: "approver@test.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "TEST_APPROVE",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2024-01-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2024-01-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "registration_approve,timesheet_approve,attendance_approve,request_approve",
        
        // Mock API only
        username: "test_approve",
        authToken: "mock_token_approve"
    },

    test_create: {
        // From employees table
        employeeId: "T004",
        fullName: "Test Creator",
        phone: "0900000003",
        email: "creator@test.com",
        password: "123456",
        storeId: "S001",
        companyId: "COMP001",
        positionId: "TEST_CREATE",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2024-01-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2024-01-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "request_create,notification_view",
        
        // Mock API only
        username: "test_create",
        authToken: "mock_token_create"
    },

    test_full: {
        // From employees table
        employeeId: "T005",
        fullName: "Test Full Access",
        phone: "0900000004",
        email: "full@test.com",
        password: "123456",
        storeId: null,
        companyId: "COMP001",
        positionId: "TEST_FULL",
        approval_status: "approved",
        is_active: 1,
        hire_date: "2024-01-01",
        last_login_at: "2024-11-05T08:00:00Z",
        created_at: "2024-01-01T08:00:00Z",
        
        // From positions table (via JOIN)
        permissions: "employee_manage,employee_view,registration_approve,department_manage,position_manage,salary_manage,salary_view,timesheet_approve,timesheet_view,attendance_self,attendance_approve,schedule_manage,schedule_view,shift_manage,request_create,request_approve,reports_view,system_admin,notification_view,profile_view",
        
        // Mock API only
        username: "test_full",
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
        console.log('   Department ID:', user.companyId);
        console.log('   Position ID:', user.positionId);
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
                companyId: user.companyId,
                positionId: user.positionId,
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

// Mock Attendance Data with Shift Assignments
// Mock Attendance Data - Matches attendance table schema exactly
// attendance table: attendanceId, employeeId, checkDate (TEXT), checkTime (TEXT), checkLocation (TEXT)
// Multiple check records per day (one for check-in, one for check-out)
const MockAttendanceData = {
    // quanly2 (E101) attendance records with 8-hour shifts
    E101: {
        shiftAssignment: {
            monday: 2,    // shiftId for S8_08-17
            tuesday: 2,
            wednesday: 2,
            thursday: 2,
            friday: 2,
            saturday: null,
            sunday: null
        },
        records: [
            // January 2025 records - Each day has array of checkTimes
            { 
                checkDate: "2025-01-02", 
                shiftId: 2,
                checkTimes: [
                    { checkTime: "2025-01-02T08:05:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-02T17:10:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 8 
            },
            { 
                checkDate: "2025-01-03", 
                shiftId: 2,
                checkTimes: [
                    { checkTime: "2025-01-03T08:02:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-03T17:05:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 8 
            },
            { 
                checkDate: "2025-01-06", 
                shiftId: 2,
                checkTimes: [
                    { checkTime: "2025-01-06T08:10:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-06T17:08:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "late", 
                hoursWorked: 8 
            },
            { 
                checkDate: "2025-01-07", 
                shiftId: 2,
                checkTimes: [
                    { checkTime: "2025-01-07T08:00:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-07T17:03:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 8 
            },
            { 
                checkDate: "2025-01-08", 
                shiftId: 2,
                checkTimes: [
                    { checkTime: "2025-01-08T08:03:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-08T17:12:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 8 
            }
        ]
    },
    // nhanvien2 (E103) attendance records with 4-hour shifts
    E103: {
        shiftAssignment: {
            monday: 1,    // shiftId for S4_08-12
            tuesday: 1,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1, // Works on Saturday
            sunday: null
        },
        records: [
            { 
                checkDate: "2025-01-02", 
                shiftId: 1,
                checkTimes: [
                    { checkTime: "2025-01-02T08:02:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-02T12:05:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 4 
            },
            { 
                checkDate: "2025-01-03", 
                shiftId: 1,
                checkTimes: [
                    { checkTime: "2025-01-03T08:01:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-03T12:03:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 4 
            },
            { 
                checkDate: "2025-01-04", 
                shiftId: 1,
                checkTimes: [
                    { checkTime: "2025-01-04T08:03:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-04T12:08:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "present", 
                hoursWorked: 4 
            },
            { 
                checkDate: "2025-01-06", 
                shiftId: 1,
                checkTimes: [
                    { checkTime: "2025-01-06T08:12:00", checkType: "in", checkLocation: "Store entrance" },
                    { checkTime: "2025-01-06T12:06:00", checkType: "out", checkLocation: "Store entrance" }
                ],
                status: "late", 
                hoursWorked: 4 
            }
        ]
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
                        message: 'Thông tin đăng nhập không tồn tại'
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
                    companyId: user.companyId,
                    positionId: user.positionId,
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
            const userData = SimpleStorage.get('userData');
            const employeeId = params?.employeeId || userData?.employeeId;
            const attendanceData = MockAttendanceData[employeeId];
            
            if (attendanceData) {
                return Promise.resolve({
                    success: true,
                    data: attendanceData.records,
                    shiftAssignment: attendanceData.shiftAssignment,
                    total: attendanceData.records.length
                });
            }
            
            // Fallback: generate basic attendance data
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const currentDay = today.getDate();
            
            const records = [];
            for (let day = 1; day <= Math.min(currentDay, daysInMonth); day++) {
                const date = new Date(year, month, day);
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                const morningMinutes = Math.floor(Math.random() * 30);
                const morningTime = `08:${morningMinutes.toString().padStart(2, '0')}:00`;
                
                records.push({
                    attendanceId: `a${day}m`,
                    employeeId: employeeId,
                    checkDate: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                    checkTime: morningTime,
                    checkLocation: 'Cửa Hàng 74 Đồng Đen',
                    createdAt: new Date(year, month, day, 8, morningMinutes).toISOString()
                });
                
                const afternoonMinutes = Math.floor(Math.random() * 30);
                const afternoonTime = `13:${afternoonMinutes.toString().padStart(2, '0')}:00`;
                
                records.push({
                    attendanceId: `a${day}a`,
                    employeeId: employeeId,
                    checkDate: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                    checkTime: afternoonTime,
                    checkLocation: 'Cửa Hàng 74 Đồng Đen',
                    createdAt: new Date(year, month, day, 13, afternoonMinutes).toISOString()
                });
            }
            
            return Promise.resolve({
                success: true,
                data: records,
                total: records.length
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
            // Determine salary based on department and permissions
            if (user) {
                if (user.companyId === 'CH') {
                    // CH department: hourly rate (use default for calculation)
                    baseSalary = 25000 * 160; // Assuming 160 hours/month
                } else if (user.permissions && user.permissions.includes('employee_manage')) {
                    baseSalary = 15000000; // Manager level
                } else if (user.permissions && user.permissions.includes('salary_manage')) {
                    baseSalary = 10000000; // Specialized staff
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
            const userData = SimpleStorage.get('userData');
            const employeeId = params?.employeeId || userData?.employeeId || 'E101';
            const requestedMonth = params?.month || new Date().getMonth() + 1;
            const requestedYear = params?.year || new Date().getFullYear();
            
            // Check if we have specific attendance data for this employee
            const attendanceData = MockAttendanceData[employeeId];
            
            if (attendanceData && requestedYear === 2025 && requestedMonth === 1) {
                // Return actual mock attendance data for January 2025
                const records = attendanceData.records.map(record => ({
                    date: record.date,
                    checkIn: record.checkIn,
                    checkOut: record.checkOut,
                    checkTime: record.checkIn, // For tooltip
                    status: record.status,
                    hoursWorked: record.hoursWorked,
                    shiftId: record.shiftId,
                    shiftName: SHIFT_DEFINITIONS[record.shiftId]?.name || 'Ca làm'
                }));
                
                const presentDays = records.filter(r => r.status === 'present').length;
                const lateDays = records.filter(r => r.status === 'late').length;
                const totalHours = records.reduce((sum, r) => sum + r.hoursWorked, 0);
                
                return Promise.resolve({
                    success: true,
                    data: {
                        employeeId: employeeId,
                        month: requestedMonth,
                        year: requestedYear,
                        totalDays: 22, // Work days in January 2025
                        presentDays: presentDays,
                        absentDays: 0,
                        lateDays: lateDays,
                        totalHours: totalHours,
                        overtimeHours: 0,
                        records: records
                    }
                });
            }
            
            // Fallback: generate timesheet for current or requested month
            const today = new Date();
            const year = requestedYear;
            const month = requestedMonth - 1; // JS months are 0-indexed
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const currentDay = year === today.getFullYear() && month === today.getMonth() ? today.getDate() : daysInMonth;
            
            // Count work days (excluding weekends)
            let workDays = 0;
            let presentDays = 0;
            const records = [];
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                
                // Skip weekends
                if (dayOfWeek === 0 || dayOfWeek === 6) continue;
                
                workDays++;
                if (day <= currentDay) {
                    presentDays++;
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const checkInHour = 8 + Math.floor(Math.random() * 2);
                    const checkInMin = Math.floor(Math.random() * 60);
                    const checkOutHour = 17 + Math.floor(Math.random() * 2);
                    const checkOutMin = Math.floor(Math.random() * 60);
                    
                    // Generate shift information based on timeName format
                    const shiftStart = checkInHour;
                    const shiftEnd = checkOutHour + 1;
                    const shiftTimeName = `${shiftStart.toString().padStart(2, '0')}:00-${shiftEnd.toString().padStart(2, '0')}:00`;
                    const shiftName = `Ca ${shiftEnd - shiftStart} Tiếng ${shiftStart}-${shiftEnd}`;
                    
                    // Generate attendance check times
                    const checkTimes = [
                        {
                            checkTime: `${checkInHour.toString().padStart(2, '0')}:${checkInMin.toString().padStart(2, '0')}`,
                            checkType: 'in'
                        },
                        {
                            checkTime: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMin.toString().padStart(2, '0')}`,
                            checkType: 'out'
                        }
                    ];
                    
                    records.push({
                        date: dateStr,
                        shiftTimeName: shiftTimeName,
                        shiftName: shiftName,
                        checkTimes: checkTimes,
                        checkTime: checkTimes[0].checkTime, // For backward compatibility
                        status: checkInMin > 10 ? 'late' : 'present',
                        hoursWorked: 8,
                        relatedRequests: [] // Will be populated if there are requests for this date
                    });
                }
            }
            
            const lateDays = records.filter(r => r.status === 'late').length;
            
            return Promise.resolve({
                success: true,
                data: {
                    employeeId: employeeId,
                    month: requestedMonth,
                    year: requestedYear,
                    totalDays: workDays,
                    presentDays: presentDays,
                    absentDays: 0,
                    lateDays: lateDays,
                    totalHours: presentDays * 8,
                    overtimeHours: 0,
                    records: records
                }
            });
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
            const currentUser = MockUsers && Object.values(MockUsers).find(u => u.employeeId === userData?.employeeId) || MockUsers.nhanvien1;
            
            return Promise.resolve({
                success: true,
                data: {
                    employeeId: currentUser.employeeId,
                    fullName: currentUser.fullName,
                    email: currentUser.email,
                    phone: currentUser.phone || '0901234567',
                    positionId: currentUser.positionId,
                    companyId: currentUser.companyId,
                    storeId: currentUser.storeId || null,
                    hire_date: currentUser.hire_date || '2020-01-01',
                    approval_status: currentUser.approval_status || 'approved',
                    is_active: currentUser.is_active || 1,
                    created_at: currentUser.created_at || new Date().toISOString(),
                    last_login_at: currentUser.last_login_at || new Date().toISOString(),
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
                    // Request 1: Leave request - Pending
                    {
                        requestId: 1,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'leave',
                        title: 'Nghỉ phép',
                        description: 'Xin nghỉ phép 2 ngày',
                        requestDate: null,
                        fromDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        toDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        reason: 'Nghỉ phép chăm sóc người thân',
                        currentShiftDate: null,
                        requestedShiftDate: null,
                        swapWithEmployeeId: null,
                        status: 'pending',
                        reviewedBy: null,
                        reviewedAt: null,
                        rejectionReason: null,
                        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]
                    },
                    // Request 2: Overtime - Approved
                    {
                        requestId: 2,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'overtime',
                        title: 'Đăng ký tăng ca',
                        description: 'Tăng ca từ 17:00-20:00',
                        requestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        fromDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        toDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        reason: 'Đăng ký tăng ca làm thêm giờ cuối tuần',
                        currentShiftDate: null,
                        requestedShiftDate: null,
                        swapWithEmployeeId: null,
                        status: 'approved',
                        reviewedBy: 'E101',
                        reviewerName: 'Nguyễn Thị Lan',
                        reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        rejectionReason: null,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]
                    },
                    // Request 3: Shift change - Approved
                    {
                        requestId: 3,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'shift_change',
                        title: 'Đổi ca làm việc',
                        description: 'Đổi từ ca sáng sang ca chiều',
                        requestDate: null,
                        fromDate: null,
                        toDate: null,
                        reason: 'Có việc cá nhân cần xử lý vào buổi sáng',
                        currentShiftDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        requestedShiftDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        swapWithEmployeeId: null,
                        status: 'approved',
                        reviewedBy: 'E101',
                        reviewerName: 'Nguyễn Thị Lan',
                        reviewedAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                        rejectionReason: null,
                        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0]
                    },
                    // Request 4: Forgot check-in - Rejected
                    {
                        requestId: 4,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'forgot_checkin',
                        title: 'Quên chấm công vào',
                        description: 'Quên chấm công vào lúc 08:00',
                        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        fromDate: null,
                        toDate: null,
                        reason: 'Điện thoại hết pin, đã vào làm đúng giờ',
                        currentShiftDate: null,
                        requestedShiftDate: null,
                        swapWithEmployeeId: null,
                        status: 'rejected',
                        reviewedBy: 'E101',
                        reviewerName: 'Nguyễn Thị Lan',
                        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        rejectionReason: 'Không có bằng chứng hỗ trợ',
                        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]
                    },
                    // Request 5: Forgot check-out - Pending
                    {
                        requestId: 5,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'forgot_checkout',
                        title: 'Quên chấm công ra',
                        description: 'Quên chấm công ra lúc 17:00',
                        requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        fromDate: null,
                        toDate: null,
                        reason: 'Quên chấm công ra khi rời văn phòng',
                        currentShiftDate: null,
                        requestedShiftDate: null,
                        swapWithEmployeeId: null,
                        status: 'pending',
                        reviewedBy: null,
                        reviewedAt: null,
                        rejectionReason: null,
                        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]
                    },
                    // Request 6: Shift swap with colleague - Pending
                    {
                        requestId: 6,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'shift_swap',
                        title: 'Đổi ca với đồng nghiệp',
                        description: 'Xin đổi ca với Trần Văn Minh',
                        requestDate: null,
                        fromDate: null,
                        toDate: null,
                        reason: 'Đổi ca ngày 10/11 với đồng nghiệp',
                        currentShiftDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        requestedShiftDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        swapWithEmployeeId: 'E102',
                        status: 'pending',
                        reviewedBy: null,
                        reviewedAt: null,
                        rejectionReason: null,
                        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]
                    },
                    // Request 7: General request - Approved
                    {
                        requestId: 7,
                        employeeId: currentEmployeeId,
                        employeeName: userData?.fullName || 'Nhân viên',
                        requestType: 'general',
                        title: 'Yêu cầu chung',
                        description: 'Xin cấp thẻ ra vào mới',
                        requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        fromDate: null,
                        toDate: null,
                        reason: 'Thẻ cũ bị mất',
                        currentShiftDate: null,
                        requestedShiftDate: null,
                        swapWithEmployeeId: null,
                        status: 'approved',
                        reviewedBy: 'E002',
                        reviewerName: 'Trần Thị Quản Lý',
                        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        rejectionReason: null,
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]
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
