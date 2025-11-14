-- =====================================================
-- OPTIMIZED DATABASE SCHEMA V3.0 (Company-Centric Architecture)
-- Professional HR Management System
-- Major refactor: Companies replace departments, simplified structure
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Sessions table - for authentication
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    last_activity TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);

-- Companies table - Replaces departments table
CREATE TABLE companies (
    companyId TEXT PRIMARY KEY,          -- Example: COMP001, COMP002
    companyName TEXT NOT NULL,            -- Example: MayCha Tea Company
    description TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
);

-- Stores table - Enhanced with company support
CREATE TABLE stores (
    storeId TEXT PRIMARY KEY,            -- Example: MC001
    storeName TEXT NOT NULL,              -- Example: MayCha 74 Đồng Đen
    companyId TEXT,                       -- FK to companies
    address TEXT,                         -- Full address
    city TEXT,                            -- Example: HCM
    latitude REAL,
    longitude REAL,
    radius REAL DEFAULT 50.0,             -- GPS validation radius in meters
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (companyId) REFERENCES companies(companyId)
);

-- Employees table - Enhanced with company support
CREATE TABLE employees (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT NOT NULL,               -- SHA-256 hashed
    storeId TEXT,
    companyId TEXT,                       -- FK to companies
    positionId TEXT,                      -- FK to positions
    contract TEXT DEFAULT 'fulltime' CHECK(contract IN ('fulltime', 'parttime')),
    birthdate TEXT,                       -- Date of birth (YYYY-MM-DD)
    hire_date TEXT,                       -- Hire date (YYYY-MM-DD)
    approval_status TEXT DEFAULT 'approved' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (storeId) REFERENCES stores(storeId),
    FOREIGN KEY (companyId) REFERENCES companies(companyId),
    FOREIGN KEY (positionId) REFERENCES positions(positionId)
);

-- Positions table - Simplified (removed positionCode)
CREATE TABLE positions (
    positionId TEXT PRIMARY KEY,          -- Example: ADMIN, MANAGER, STAFF
    companyId TEXT,                       -- FK to companies (NULL = all companies)
    positionName TEXT NOT NULL,           -- Example: Quản Trị Viên
    baseSalaryRate REAL DEFAULT 0,        -- Base salary rate
    salaryType TEXT DEFAULT 'hourly' CHECK(salaryType IN ('hourly', 'daily', 'monthly')),
    description TEXT,
    permissions TEXT,                     -- JSON or comma-separated permissions
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (companyId) REFERENCES companies(companyId)
);

-- =====================================================
-- ATTENDANCE & WORK MANAGEMENT
-- =====================================================

-- Attendance table - With company support
CREATE TABLE attendance (
    attendanceId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    companyId TEXT,                       -- FK to companies
    checkDate TEXT NOT NULL,
    checkTime TEXT NOT NULL,
    checkLocation TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(companyId)
);

-- Timesheets table - With company support
CREATE TABLE timesheets (
    timesheetId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    companyId TEXT,                       -- FK to companies
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    totalDays INTEGER DEFAULT 0,
    presentDays INTEGER DEFAULT 0,
    absentDays INTEGER DEFAULT 0,
    lateDays INTEGER DEFAULT 0,
    totalHours REAL DEFAULT 0,
    overtimeHours REAL DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(companyId),
    UNIQUE(employeeId, month, year)
);

-- Shifts table - COMPLETELY RESTRUCTURED
CREATE TABLE shifts (
    shiftId TEXT PRIMARY KEY,             -- e.g., 'S4_1', 'S8_1', 'S12_1'
    shiftName TEXT NOT NULL,              -- e.g., 'Ca 08:00-12:00'
    startTime INTEGER NOT NULL,           -- e.g., 8 (for 08:00)
    endTime INTEGER NOT NULL,             -- e.g., 12 (for 12:00)
    totalTime INTEGER NOT NULL,           -- e.g., 4 (total hours)
    companyId TEXT,                       -- FK to companies (NULL = all companies)
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (companyId) REFERENCES companies(companyId)
);

-- Shift assignments - With company support
CREATE TABLE shift_assignments (
    assignmentId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    companyId TEXT,                       -- FK to companies
    shiftId TEXT NOT NULL,
    date TEXT NOT NULL,
    assignedBy TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(companyId),
    FOREIGN KEY (shiftId) REFERENCES shifts(shiftId) ON DELETE CASCADE,
    FOREIGN KEY (assignedBy) REFERENCES employees(employeeId)
);

-- Employee requests - With company support
CREATE TABLE employee_requests (
    requestId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    companyId TEXT,                       -- FK to companies
    requestType TEXT NOT NULL CHECK(requestType IN ('leave', 'overtime', 'forgot_checkin', 'forgot_checkout', 'shift_change', 'shift_swap', 'general')),
    title TEXT NOT NULL,
    description TEXT,
    requestDate TEXT,
    fromDate TEXT,
    toDate TEXT,
    reason TEXT,
    currentShiftDate TEXT,
    requestedShiftDate TEXT,
    swapWithEmployeeId TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    reviewedBy TEXT,
    reviewedAt TEXT,
    rejectionReason TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(companyId),
    FOREIGN KEY (reviewedBy) REFERENCES employees(employeeId),
    FOREIGN KEY (swapWithEmployeeId) REFERENCES employees(employeeId)
);

-- =====================================================
-- USER MANAGEMENT & REGISTRATION
-- =====================================================

-- Pending registrations table - With company support
CREATE TABLE pending_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullName TEXT NOT NULL,
    phone TEXT,
    storeId TEXT,
    companyId TEXT,                       -- FK to companies
    positionId TEXT,
    verification_code TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'approved', 'rejected')),
    created_at TEXT DEFAULT (datetime('now')),
    verified_at TEXT,
    approved_at TEXT,
    approved_by TEXT,
    FOREIGN KEY (storeId) REFERENCES stores(storeId),
    FOREIGN KEY (companyId) REFERENCES companies(companyId),
    FOREIGN KEY (positionId) REFERENCES positions(positionId),
    FOREIGN KEY (approved_by) REFERENCES employees(employeeId)
);

-- User change history
CREATE TABLE user_change_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT,
    changed_at TEXT DEFAULT (datetime('now')),
    change_date TEXT,
    reason TEXT,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Salary records - With company support
CREATE TABLE salary_records (
    salaryId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    companyId TEXT,                       -- FK to companies
    positionId TEXT,
    baseSalary REAL DEFAULT 0,
    workDays INTEGER DEFAULT 0,
    standardDays INTEGER DEFAULT 26,
    workHours REAL DEFAULT 0,
    overtimeHours REAL DEFAULT 0,
    overtimePay REAL DEFAULT 0,
    bonus REAL DEFAULT 0,
    deduction REAL DEFAULT 0,
    totalSalary REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'paid')),
    calculatedAt TEXT DEFAULT (datetime('now')),
    approvedBy TEXT,
    approvedAt TEXT,
    paidAt TEXT,
    notes TEXT,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(companyId),
    FOREIGN KEY (positionId) REFERENCES positions(positionId),
    FOREIGN KEY (approvedBy) REFERENCES employees(employeeId),
    UNIQUE(employeeId, month, year)
);

-- Notifications - With company support
CREATE TABLE notifications (
    notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    companyId TEXT,                       -- FK to companies
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'request', 'task', 'system')),
    isRead INTEGER DEFAULT 0,
    actionUrl TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(companyId)
);

-- =====================================================
-- OPTIMIZED INDEXES FOR PERFORMANCE
-- =====================================================

-- Authentication & Session indexes
CREATE INDEX idx_sessions_employeeId ON sessions(employeeId);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- Employee indexes
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_companyId ON employees(companyId);
CREATE INDEX idx_employees_positionId ON employees(positionId);
CREATE INDEX idx_employees_approval_status ON employees(approval_status);
CREATE INDEX idx_employees_storeId ON employees(storeId);
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Company indexes
CREATE INDEX idx_companies_name ON companies(companyName);

-- Store indexes
CREATE INDEX idx_stores_companyId ON stores(companyId);
CREATE INDEX idx_stores_city ON stores(city);

-- Attendance indexes
CREATE INDEX idx_attendance_employeeId ON attendance(employeeId);
CREATE INDEX idx_attendance_checkDate ON attendance(checkDate);
CREATE INDEX idx_attendance_companyId ON attendance(companyId);

-- Timesheet indexes
CREATE INDEX idx_timesheets_employee_period ON timesheets(employeeId, year DESC, month DESC);
CREATE INDEX idx_timesheets_companyId ON timesheets(companyId);

-- Shift indexes
CREATE INDEX idx_shifts_start_time ON shifts(startTime);
CREATE INDEX idx_shifts_end_time ON shifts(endTime);
CREATE INDEX idx_shifts_companyId ON shifts(companyId);

-- Shift assignment indexes
CREATE INDEX idx_shift_assignments_employee_date ON shift_assignments(employeeId, date DESC);
CREATE INDEX idx_shift_assignments_date ON shift_assignments(date);
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shiftId);
CREATE INDEX idx_shift_assignments_companyId ON shift_assignments(companyId);

-- Employee requests indexes
CREATE INDEX idx_employee_requests_employee ON employee_requests(employeeId);
CREATE INDEX idx_employee_requests_type ON employee_requests(requestType);
CREATE INDEX idx_employee_requests_status ON employee_requests(status);
CREATE INDEX idx_employee_requests_date ON employee_requests(createdAt DESC);
CREATE INDEX idx_employee_requests_companyId ON employee_requests(companyId);

-- Notification indexes
CREATE INDEX idx_notifications_employee_read ON notifications(employeeId, isRead);
CREATE INDEX idx_notifications_created ON notifications(createdAt DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_companyId ON notifications(companyId);

-- Pending registrations indexes
CREATE INDEX idx_pending_reg_employeeId ON pending_registrations(employeeId);
CREATE INDEX idx_pending_reg_email ON pending_registrations(email);
CREATE INDEX idx_pending_reg_status ON pending_registrations(status);
CREATE INDEX idx_pending_reg_companyId ON pending_registrations(companyId);

-- User change history indexes
CREATE INDEX idx_user_change_employeeId ON user_change_history(employeeId);
CREATE INDEX idx_user_change_changed_at ON user_change_history(changed_at DESC);

-- Positions indexes
CREATE INDEX idx_positions_companyId ON positions(companyId);
CREATE INDEX idx_positions_active ON positions(isActive);

-- Salary records indexes
CREATE INDEX idx_salary_employeeId ON salary_records(employeeId);
CREATE INDEX idx_salary_period ON salary_records(year DESC, month DESC);
CREATE INDEX idx_salary_status ON salary_records(status);
CREATE INDEX idx_salary_companyId ON salary_records(companyId);
CREATE INDEX idx_salary_position ON salary_records(positionId);

-- =====================================================
-- COMPOUND INDEXES FOR COMMON QUERIES
-- =====================================================

CREATE INDEX idx_attendance_employee_date_range ON attendance(employeeId, checkDate DESC);
CREATE INDEX idx_shift_assignments_employee_specific_date ON shift_assignments(employeeId, date);
CREATE INDEX idx_employee_requests_status_employee ON employee_requests(status, employeeId, createdAt DESC);
CREATE INDEX idx_sessions_token_active ON sessions(session_token, is_active, expires_at);
CREATE INDEX idx_employees_store_company_position ON employees(storeId, companyId, positionId, is_active);
CREATE INDEX idx_employees_store_active ON employees(storeId, is_active, employeeId);
CREATE INDEX idx_timesheets_employee_exact_period ON timesheets(employeeId, year, month);
CREATE INDEX idx_notifications_employee_unread ON notifications(employeeId, isRead, createdAt DESC);
CREATE INDEX idx_shift_assignments_date_shift ON shift_assignments(date, shiftId);
CREATE INDEX idx_employee_requests_type_status ON employee_requests(requestType, status, createdAt DESC);

-- =====================================================
-- COVERING INDEXES
-- =====================================================

CREATE INDEX idx_employees_list_covering ON employees(is_active, companyId, positionId, storeId, employeeId, fullName, email);
CREATE INDEX idx_attendance_dashboard_covering ON attendance(employeeId, checkDate, checkTime, checkLocation, attendanceId);
CREATE INDEX idx_shift_assignments_list_covering ON shift_assignments(date, employeeId, shiftId, assignmentId);
CREATE INDEX idx_employee_requests_list_covering ON employee_requests(status, employeeId, requestType, title, createdAt, requestId);

-- =====================================================
-- INITIAL DATA - COMPANIES
-- =====================================================

INSERT INTO companies (companyId, companyName, description) VALUES
('COMP001', 'MayCha Tea Company', 'Công ty trà sữa MayCha'),
('COMP002', 'Highlands Coffee Company', 'Công ty cà phê Highlands');

-- =====================================================
-- INITIAL DATA - STORES
-- =====================================================

INSERT INTO stores (storeId, storeName, companyId, address, city, latitude, longitude, radius) VALUES
('MC001', 'MayCha 74 Đồng Đen', 'COMP001', '74 Đồng Đen, Quận Tân Bình, TP.HCM', 'HCM', 10.799862, 106.654368, 50.0),
('MC002', 'MayCha 123 Nguyễn Thị Minh Khai', 'COMP001', '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', 'HCM', 10.788295, 106.691901, 50.0),
('MC003', 'MayCha 456 Lê Văn Sỹ', 'COMP001', '456 Lê Văn Sỹ, Quận 3, TP.HCM', 'HCM', 10.783933, 106.678321, 50.0),
('HL001', 'Highlands 789 Cộng Hòa', 'COMP002', '789 Cộng Hòa, Quận Tân Bình, TP.HCM', 'HCM', 10.802349, 106.637626, 50.0),
('HL002', 'Highlands 321 Hoàng Văn Thụ', 'COMP002', '321 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM', 'HCM', 10.800251, 106.652503, 50.0),
('HL003', 'Highlands 654 Phan Xích Long', 'COMP002', '654 Phan Xích Long, Quận Phú Nhuận, TP.HCM', 'HCM', 10.800000, 106.683000, 50.0);

-- =====================================================
-- INITIAL DATA - POSITIONS
-- =====================================================

-- Company-independent positions
INSERT INTO positions (positionId, companyId, positionName, baseSalaryRate, salaryType, description, permissions) VALUES
('ADMIN', NULL, 'Quản Trị Viên', 15000000, 'monthly', 'Quản trị viên hệ thống', 'employee_manage,registration_approve,company_manage,position_manage,salary_manage,timesheet_approve,reports_view,system_admin'),
('MANAGER', NULL, 'Quản Lý Khu Vực', 12000000, 'monthly', 'Quản lý khu vực', 'employee_manage,salary_view,timesheet_approve,reports_view,schedule_manage,shift_manage,request_approve'),
('ACCOUNTANT', NULL, 'Kế Toán', 8000000, 'monthly', 'Nhân viên kế toán', 'employee_view,salary_manage,reports_view,timesheet_view'),
('IT', NULL, 'Nhân Viên IT', 9000000, 'monthly', 'Nhân viên công nghệ thông tin', 'employee_view,system_admin,reports_view');

-- Store positions with hourly rates
INSERT INTO positions (positionId, companyId, positionName, baseSalaryRate, salaryType, description, permissions) VALUES
('STAFF_LV1', NULL, 'Nhân Viên LV1', 25000, 'hourly', 'Nhân viên cửa hàng cấp 1', 'attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view'),
('STAFF_LV2', NULL, 'Nhân Viên LV2', 28000, 'hourly', 'Nhân viên cửa hàng cấp 2', 'attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view'),
('SUPERVISOR', NULL, 'Quản Lý Ca', 35000, 'hourly', 'Quản lý ca cửa hàng', 'attendance_self,timesheet_approve,shift_manage,request_approve,schedule_view,timesheet_view,salary_view,notification_view,profile_view'),
('STORE_MANAGER', NULL, 'Quản Lý Cửa Hàng', 40000, 'hourly', 'Quản lý cửa hàng', 'attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,timesheet_approve,salary_view,request_create,request_approve,notification_view,profile_view');

-- =====================================================
-- INITIAL DATA - SHIFTS
-- =====================================================

-- 4-hour shifts (12 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S4_1', 'Ca 08:00-12:00', 8, 12, 4, NULL),
('S4_2', 'Ca 09:00-13:00', 9, 13, 4, NULL),
('S4_3', 'Ca 10:00-14:00', 10, 14, 4, NULL),
('S4_4', 'Ca 11:00-15:00', 11, 15, 4, NULL),
('S4_5', 'Ca 12:00-16:00', 12, 16, 4, NULL),
('S4_6', 'Ca 13:00-17:00', 13, 17, 4, NULL),
('S4_7', 'Ca 14:00-18:00', 14, 18, 4, NULL),
('S4_8', 'Ca 15:00-19:00', 15, 19, 4, NULL),
('S4_9', 'Ca 16:00-20:00', 16, 20, 4, NULL),
('S4_10', 'Ca 17:00-21:00', 17, 21, 4, NULL),
('S4_11', 'Ca 18:00-22:00', 18, 22, 4, NULL),
('S4_12', 'Ca 19:00-23:00', 19, 23, 4, NULL);

-- 5-hour shifts (11 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S5_1', 'Ca 08:00-13:00', 8, 13, 5, NULL),
('S5_2', 'Ca 09:00-14:00', 9, 14, 5, NULL),
('S5_3', 'Ca 10:00-15:00', 10, 15, 5, NULL),
('S5_4', 'Ca 11:00-16:00', 11, 16, 5, NULL),
('S5_5', 'Ca 12:00-17:00', 12, 17, 5, NULL),
('S5_6', 'Ca 13:00-18:00', 13, 18, 5, NULL),
('S5_7', 'Ca 14:00-19:00', 14, 19, 5, NULL),
('S5_8', 'Ca 15:00-20:00', 15, 20, 5, NULL),
('S5_9', 'Ca 16:00-21:00', 16, 21, 5, NULL),
('S5_10', 'Ca 17:00-22:00', 17, 22, 5, NULL),
('S5_11', 'Ca 18:00-23:00', 18, 23, 5, NULL);

-- 6-hour shifts (10 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S6_1', 'Ca 08:00-14:00', 8, 14, 6, NULL),
('S6_2', 'Ca 09:00-15:00', 9, 15, 6, NULL),
('S6_3', 'Ca 10:00-16:00', 10, 16, 6, NULL),
('S6_4', 'Ca 11:00-17:00', 11, 17, 6, NULL),
('S6_5', 'Ca 12:00-18:00', 12, 18, 6, NULL),
('S6_6', 'Ca 13:00-19:00', 13, 19, 6, NULL),
('S6_7', 'Ca 14:00-20:00', 14, 20, 6, NULL),
('S6_8', 'Ca 15:00-21:00', 15, 21, 6, NULL),
('S6_9', 'Ca 16:00-22:00', 16, 22, 6, NULL),
('S6_10', 'Ca 17:00-23:00', 17, 23, 6, NULL);

-- 7-hour shifts (9 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S7_1', 'Ca 08:00-15:00', 8, 15, 7, NULL),
('S7_2', 'Ca 09:00-16:00', 9, 16, 7, NULL),
('S7_3', 'Ca 10:00-17:00', 10, 17, 7, NULL),
('S7_4', 'Ca 11:00-18:00', 11, 18, 7, NULL),
('S7_5', 'Ca 12:00-19:00', 12, 19, 7, NULL),
('S7_6', 'Ca 13:00-20:00', 13, 20, 7, NULL),
('S7_7', 'Ca 14:00-21:00', 14, 21, 7, NULL),
('S7_8', 'Ca 15:00-22:00', 15, 22, 7, NULL),
('S7_9', 'Ca 16:00-23:00', 16, 23, 7, NULL);

-- 8-hour shifts (8 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S8_1', 'Ca 08:00-16:00', 8, 16, 8, NULL),
('S8_2', 'Ca 09:00-17:00', 9, 17, 8, NULL),
('S8_3', 'Ca 10:00-18:00', 10, 18, 8, NULL),
('S8_4', 'Ca 11:00-19:00', 11, 19, 8, NULL),
('S8_5', 'Ca 12:00-20:00', 12, 20, 8, NULL),
('S8_6', 'Ca 13:00-21:00', 13, 21, 8, NULL),
('S8_7', 'Ca 14:00-22:00', 14, 22, 8, NULL),
('S8_8', 'Ca 15:00-23:00', 15, 23, 8, NULL);

-- 9-hour shifts (7 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S9_1', 'Ca 08:00-17:00', 8, 17, 9, NULL),
('S9_2', 'Ca 09:00-18:00', 9, 18, 9, NULL),
('S9_3', 'Ca 10:00-19:00', 10, 19, 9, NULL),
('S9_4', 'Ca 11:00-20:00', 11, 20, 9, NULL),
('S9_5', 'Ca 12:00-21:00', 12, 21, 9, NULL),
('S9_6', 'Ca 13:00-22:00', 13, 22, 9, NULL),
('S9_7', 'Ca 14:00-23:00', 14, 23, 9, NULL);

-- 10-hour shifts (6 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S10_1', 'Ca 08:00-18:00', 8, 18, 10, NULL),
('S10_2', 'Ca 09:00-19:00', 9, 19, 10, NULL),
('S10_3', 'Ca 10:00-20:00', 10, 20, 10, NULL),
('S10_4', 'Ca 11:00-21:00', 11, 21, 10, NULL),
('S10_5', 'Ca 12:00-22:00', 12, 22, 10, NULL),
('S10_6', 'Ca 13:00-23:00', 13, 23, 10, NULL);

-- 11-hour shifts (5 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S11_1', 'Ca 08:00-19:00', 8, 19, 11, NULL),
('S11_2', 'Ca 09:00-20:00', 9, 20, 11, NULL),
('S11_3', 'Ca 10:00-21:00', 10, 21, 11, NULL),
('S11_4', 'Ca 11:00-22:00', 11, 22, 11, NULL),
('S11_5', 'Ca 12:00-23:00', 12, 23, 11, NULL);

-- 12-hour shifts (4 shifts)
INSERT INTO shifts (shiftId, shiftName, startTime, endTime, totalTime, companyId) VALUES 
('S12_1', 'Ca 08:00-20:00', 8, 20, 12, NULL),
('S12_2', 'Ca 09:00-21:00', 9, 21, 12, NULL),
('S12_3', 'Ca 10:00-22:00', 10, 22, 12, NULL),
('S12_4', 'Ca 11:00-23:00', 11, 23, 12, NULL);

-- =====================================================
-- EMPLOYEE STATS CACHE
-- =====================================================

CREATE TABLE employee_stats_cache (
  employeeId TEXT PRIMARY KEY,
  totalAttendanceDays INTEGER DEFAULT 0,
  totalWorkHours REAL DEFAULT 0,
  totalLateCheckins INTEGER DEFAULT 0,
  totalEarlyCheckouts INTEGER DEFAULT 0,
  lastCheckDate TEXT,
  lastCheckTime TEXT,
  currentMonthDays INTEGER DEFAULT 0,
  lastUpdated TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);

CREATE INDEX idx_employee_stats_updated ON employee_stats_cache(lastUpdated);
CREATE INDEX idx_employee_stats_employee ON employee_stats_cache(employeeId, lastUpdated);

-- =====================================================
-- DAILY ATTENDANCE SUMMARY
-- =====================================================

CREATE TABLE daily_attendance_summary (
  summaryDate TEXT NOT NULL,
  storeId TEXT NOT NULL,
  companyId TEXT,
  totalEmployees INTEGER DEFAULT 0,
  presentEmployees INTEGER DEFAULT 0,
  absentEmployees INTEGER DEFAULT 0,
  lateEmployees INTEGER DEFAULT 0,
  averageCheckInTime TEXT,
  lastUpdated TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (summaryDate, storeId),
  FOREIGN KEY (storeId) REFERENCES stores(storeId) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES companies(companyId)
);

CREATE INDEX idx_daily_summary_date ON daily_attendance_summary(summaryDate DESC);
CREATE INDEX idx_daily_summary_store_date ON daily_attendance_summary(storeId, summaryDate DESC);
CREATE INDEX idx_daily_summary_companyId ON daily_attendance_summary(companyId);

-- =====================================================
-- TRIGGERS FOR STATS CACHE
-- =====================================================

CREATE TRIGGER trg_update_stats_after_attendance_insert
AFTER INSERT ON attendance
BEGIN
  INSERT INTO employee_stats_cache (employeeId, totalAttendanceDays, lastCheckDate, lastCheckTime, lastUpdated)
  VALUES (NEW.employeeId, 1, NEW.checkDate, NEW.checkTime, datetime('now'))
  ON CONFLICT(employeeId) DO UPDATE SET
    totalAttendanceDays = totalAttendanceDays + 1,
    lastCheckDate = NEW.checkDate,
    lastCheckTime = NEW.checkTime,
    lastUpdated = datetime('now');
END;

CREATE TRIGGER trg_update_stats_after_attendance_update
AFTER UPDATE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    lastCheckDate = NEW.checkDate,
    lastCheckTime = NEW.checkTime,
    lastUpdated = datetime('now')
  WHERE employeeId = NEW.employeeId;
END;

CREATE TRIGGER trg_update_stats_after_attendance_delete
AFTER DELETE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    totalAttendanceDays = totalAttendanceDays - 1,
    lastUpdated = datetime('now')
  WHERE employeeId = OLD.employeeId;
END;

-- =====================================================
-- SCHEMA V3.0 SUMMARY
-- =====================================================
-- 
-- MAJOR CHANGES:
-- 1. Departments → Companies (complete refactor)
-- 2. Removed all *Code fields (positionCode, shiftCode, etc.)
-- 3. Restructured shifts table with totalTime field
-- 4. Added companyId to all major tables (10 tables total)
-- 5. Updated all foreign keys to reference companies
-- 6. Optimized indexes for company-based queries
-- 7. New sample data for multi-company setup
--
-- BENEFITS:
-- - Scalable multi-company architecture
-- - Simplified field structure
-- - Better data segregation
-- - Clearer organizational hierarchy
-- - Improved query performance
--
-- =====================================================
