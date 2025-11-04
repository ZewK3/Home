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

    // CH - Quản Lý LV2 (Store Manager)
    quanly2: {
        employeeId: "E101",
        username: "quanly2",
        password: "123456",
        fullName: "Nguyễn Thị Lan",
        email: "lanql@store.com",
        phone: "0911234567",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_QL_LV2",
        positionName: "Quản Lý LV2",
        positionCode: "QL_LV2",
        permissions: "attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,timesheet_approve,salary_view,request_create,request_approve,notification_view,profile_view",
        authToken: "mock_token_ql2"
    },

    // CH - Quản Lý LV1
    quanly1: {
        employeeId: "E102",
        username: "quanly1",
        password: "123456",
        fullName: "Trần Văn Minh",
        email: "minhql@store.com",
        phone: "0912345678",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_QL_LV1",
        positionName: "Quản Lý LV1",
        positionCode: "QL_LV1",
        permissions: "attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,salary_view,request_create,request_approve,notification_view",
        authToken: "mock_token_ql1"
    },

    // CH - Nhân Viên LV2
    nhanvien2: {
        employeeId: "E103",
        username: "nhanvien2",
        password: "123456",
        fullName: "Lê Thị Hoa",
        email: "hoanv@store.com",
        phone: "0913456789",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_NV_LV2",
        positionName: "Nhân Viên LV2",
        positionCode: "NV_LV2",
        permissions: "attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view",
        authToken: "mock_token_nv2"
    },

    // CH - Nhân Viên LV1
    nhanvien1: {
        employeeId: "E104",
        username: "nhanvien1",
        password: "123456",
        fullName: "Phạm Văn Đức",
        email: "ducnv@store.com",
        phone: "0914567890",
        departmentId: "CH",
        departmentName: "Cửa Hàng",
        departmentCode: "CH",
        positionId: "CH_NV_LV1",
        positionName: "Nhân Viên LV1",
        positionCode: "NV_LV1",
        permissions: "attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view",
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
     * @param {string} username 
     * @param {string} password 
     */
    login(username, password) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                const user = MockUsers[username];
                
                if (!user) {
                    reject({
                        success: false,
                        message: 'Tên đăng nhập không tồn tại'
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
                    permissions: user.permissions
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
            return Promise.resolve({
                success: true,
                data: [
                    {
                        id: 'a1',
                        employeeId: 'E001',
                        date: new Date().toISOString().split('T')[0],
                        checkIn: '08:30:00',
                        checkOut: null,
                        status: 'present',
                        hoursWorked: 0
                    }
                ]
            });
        }
        
        if (endpoint.includes('/shifts') || endpoint.includes('/schedule')) {
            return Promise.resolve({
                success: true,
                data: [
                    {
                        id: 's1',
                        name: 'Ca Sáng',
                        startTime: '08:00',
                        endTime: '12:00',
                        date: new Date().toISOString().split('T')[0]
                    },
                    {
                        id: 's2',
                        name: 'Ca Chiều',
                        startTime: '13:00',
                        endTime: '17:00',
                        date: new Date().toISOString().split('T')[0]
                    }
                ]
            });
        }
        
        if (endpoint.includes('/salary')) {
            return Promise.resolve({
                success: true,
                data: {
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    baseSalary: 10000000,
                    bonus: 1000000,
                    deduction: 500000,
                    total: 10500000,
                    status: 'calculated'
                }
            });
        }
        
        if (endpoint.includes('/timesheet')) {
            return Promise.resolve({
                success: true,
                data: {
                    totalDays: 22,
                    presentDays: 20,
                    absentDays: 1,
                    lateDays: 1,
                    totalHours: 160
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
                        department: 'Cửa hàng'
                    }
                ]
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
        
        return Promise.resolve({ success: true, message: 'Mock success' });
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
