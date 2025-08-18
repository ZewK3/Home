-- =====================================================
-- COMPLETE D1 DATABASE SCHEMA FOR HR MANAGEMENT SYSTEM
-- =====================================================
-- This file contains ALL tables currently being used in the HR Management System
-- Updated to reflect actual implementation and database queries
-- 
-- Last Updated: January 2025 - Fixed table consistency issues
-- Features Included:
-- ✓ Core authentication and user management
-- ✓ Business operations (orders, stores)  
-- ✓ HR management (schedules, task assignments, permissions)
-- ✓ GPS-based attendance tracking system
-- ✓ Professional timesheet with monthly calendar
-- ✓ Advanced request system (attendance requests using attendance_requests table)
-- ✓ System notifications and settings
-- ✓ Comprehensive analytics and reporting
-- =====================================================

-- CURRENT TABLES IN USE (Updated August 2025):
-- ✅ employees - Employee data and authentication  
-- ✅ sessions - Authentication sessions
-- ✅ stores - Store locations with GPS coordinates
-- ✅ attendance - GPS attendance tracking
-- ✅ timesheets - Monthly timesheet data
-- ✅ shift_assignments - Required for attendance validation
-- ✅ attendance_requests - Attendance-related requests (Đơn Từ) - PRIMARY TABLE FOR REQUESTS
-- ✅ shift_requests - Shift change requests (Store management)
-- ✅ tasks - Work tasks and assignments (Updated schema with foreign key fixes)
-- ✅ task_assignments - Task assignment relationships (Fixed foreign key to reference tasks.id)
-- ✅ task_comments - Task comments and discussions (Fixed foreign key to reference tasks.id)
-- ✅ comment_replies - Comment replies for task discussions
-- ✅ notifications - System notifications
-- ✅ hr_settings - System configuration
-- ✅ users - Customer user accounts (for order system)
-- ✅ queue - Employee registration queue
-- ✅ email_verification - Email verification during registration
-- ✅ workSchedules - Employee work schedules
-- ✅ permissions - Role-based permissions
-- ✅ attendance_summary - Monthly attendance statistics
-- ✅ gps_attendance - Detailed GPS attendance logs
-- ✅ requests - General requests (backward compatibility - DEPRECATED, use attendance_requests)
-- ✅ history_logs - Action history tracking
-- ✅ messages - Chat messages
-- ✅ payment - Payment records
-- ✅ transaction - Transaction records
-- ✅ orders - Customer orders

-- DEPRECATED TABLES (No longer used):
-- ❌ rewards - Replaced with Work Tasks system (tasks/task_assignments)

-- SCHEMA FIXES APPLIED:
-- ✅ task_assignments.taskId now references tasks.id (not tasks.taskId)
-- ✅ task_comments.taskId now references tasks.id (not tasks.taskId)  
-- ✅ All attendance request functions use attendance_requests table consistently
-- ✅ Tasks table includes both id (primary key) and taskId (legacy compatibility)
-- ✅ Foreign key constraints aligned with actual database structure
-- =====================================================

-- D1 Database Table Creation SQL Scripts
-- Created for HR Management System
-- All tables required for the application

-- =====================================================
-- AUTHENTICATION & USER MANAGEMENT
-- =====================================================

-- Table for customer users (people who place orders)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    exp INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Đồng'
);

-- Table for authentication sessions
CREATE TABLE sessions (
    employeeId TEXT NOT NULL,
    token TEXT PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    lastAccess TEXT NOT NULL
);

-- Table for employees (staff members) - Enhanced with hierarchical ranks
CREATE TABLE employees (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    storeId TEXT, -- Reference to assigned store
    position TEXT DEFAULT 'NV',
    positionLevel TEXT DEFAULT 'LV1', -- Hierarchical level: LV1, LV2, LV3, etc.
    rank TEXT DEFAULT 'Đồng', -- Overall rank system: Đồng, Bạc, Vàng, Kim Cương
    experience INTEGER DEFAULT 0, -- Experience points
    joinDate TEXT,
    phone TEXT,
    email TEXT,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    isActive INTEGER DEFAULT 1, -- Active status
    lastPromotionDate TEXT, -- Track promotion history
    FOREIGN KEY (storeId) REFERENCES stores(storeId)
);

-- Table for employee registration queue (pending approvals) - Enhanced with hierarchical ranks
CREATE TABLE queue (
    employeeId TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    storeId TEXT, -- Reference to assigned store
    position TEXT DEFAULT 'NV',
    positionLevel TEXT DEFAULT 'LV1', -- Hierarchical level
    rank TEXT DEFAULT 'Đồng', -- Overall rank system
    joinDate TEXT,
    phone TEXT,
    email TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Wait',
    FOREIGN KEY (storeId) REFERENCES stores(storeId)
);

-- Table for email verification during registration - Enhanced with hierarchical ranks
CREATE TABLE email_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    email TEXT NOT NULL,
    verificationCode TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    storeId TEXT, -- Reference to assigned store
    position TEXT DEFAULT 'NV',
    positionLevel TEXT DEFAULT 'LV1', -- Hierarchical level
    rank TEXT DEFAULT 'Đồng', -- Overall rank system
    joinDate TEXT,
    phone TEXT,
    passwordHash TEXT NOT NULL,
    passwordSalt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY (storeId) REFERENCES stores(storeId)
);

-- =====================================================
-- BUSINESS OPERATIONS
-- =====================================================

-- Table for store information (enhanced with regions for AM management)
CREATE TABLE stores (
    storeId TEXT PRIMARY KEY,
    storeName TEXT NOT NULL,
    region TEXT NOT NULL, -- Area/region for AM management (1, 2, 3, 4)
    address TEXT,
    latitude REAL, -- GPS latitude coordinate
    longitude REAL, -- GPS longitude coordinate  
    managerEmployeeId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for customer orders
CREATE TABLE orders (
    orderId TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    cart TEXT NOT NULL,  -- JSON string
    status TEXT NOT NULL,
    total REAL NOT NULL,
    createdAt TEXT NOT NULL,
    deliveryAddress TEXT,
    distance REAL,
    duration REAL,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Table for employee rank progression and hierarchy
CREATE TABLE employee_ranks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    position TEXT NOT NULL, -- NV, QL, AM, AD
    positionLevel TEXT NOT NULL, -- LV1, LV2, LV3, LV4, LV5
    rank TEXT NOT NULL, -- Đồng, Bạc, Vàng, Kim Cương
    experienceRequired INTEGER NOT NULL, -- Experience points needed for this level
    permissions TEXT, -- JSON string of permissions for this rank
    salaryMultiplier REAL DEFAULT 1.0, -- Salary multiplier for this rank
    benefits TEXT, -- JSON string of benefits
    promotionCriteria TEXT, -- Criteria for promotion to next level
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    isActive INTEGER DEFAULT 1,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for rank progression history
CREATE TABLE rank_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    oldPosition TEXT,
    oldPositionLevel TEXT,
    oldRank TEXT,
    newPosition TEXT NOT NULL,
    newPositionLevel TEXT NOT NULL,
    newRank TEXT NOT NULL,
    promotedBy TEXT, -- Who promoted them
    reason TEXT, -- Reason for promotion/demotion
    experienceGained INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId),
    FOREIGN KEY (promotedBy) REFERENCES employees(employeeId)
);

-- Table for work schedules
CREATE TABLE workSchedules (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    T2 TEXT,  -- Monday schedule
    T3 TEXT,  -- Tuesday schedule
    T4 TEXT,  -- Wednesday schedule
    T5 TEXT,  -- Thursday schedule
    T6 TEXT,  -- Friday schedule
    T7 TEXT,  -- Saturday schedule
    CN TEXT,  -- Sunday schedule
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for rewards and penalties (REMOVED - replaced with Work Tasks system)
-- CREATE TABLE rewards (
--     id TEXT PRIMARY KEY,
--     employeeId TEXT NOT NULL,
--     employeeName TEXT NOT NULL,
--     type TEXT NOT NULL CHECK (type IN ('reward', 'penalty')),
--     amount REAL NOT NULL,
--     reason TEXT NOT NULL,
--     createdAt TEXT NOT NULL,
--     FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
-- );

-- Enhanced table for task/request management (legacy format) - Enhanced with hierarchical ranks
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    positionLevel TEXT DEFAULT 'LV1', -- Hierarchical level
    rank TEXT DEFAULT 'Đồng', -- Overall rank system
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
    createdAt TEXT NOT NULL,
    updatedAt TEXT,
    note TEXT,
    -- New fields for enhanced task management
    taskId TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    deadline TEXT,
    createdBy TEXT,
    data TEXT,  -- JSON string for additional data
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for role-based permissions
CREATE TABLE permissions (
    employeeId TEXT NOT NULL,
    permission TEXT NOT NULL,
    granted INTEGER DEFAULT 1 CHECK (granted IN (0, 1)),
    createdAt TEXT NOT NULL,
    PRIMARY KEY (employeeId, permission),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- =====================================================
-- ATTENDANCE & TIMESHEET SYSTEM
-- =====================================================

-- Table for GPS-based attendance tracking
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    checkIn TEXT,  -- ISO timestamp for check-in
    checkOut TEXT,  -- ISO timestamp for check-out
    location TEXT,  -- JSON string with GPS coordinates
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    workHours REAL,  -- Calculated work hours
    overtimeHours REAL,  -- Overtime hours
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for monthly timesheet data
CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    date TEXT NOT NULL,  -- YYYY-MM-DD format
    checkIn TEXT,  -- Time of check-in
    checkOut TEXT,  -- Time of check-out
    workHours REAL DEFAULT 0,
    overtimeHours REAL DEFAULT 0,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'early_departure')),
    isNightShift INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employeeId, date),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for shift assignments (required for attendance validation)
CREATE TABLE shift_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    date TEXT NOT NULL,  -- YYYY-MM-DD format
    shiftName TEXT NOT NULL,  -- e.g., 'Ca sáng', 'Ca chiều', 'Ca tối'
    startTime TEXT NOT NULL,  -- HH:MM format e.g., '08:00'
    endTime TEXT NOT NULL,    -- HH:MM format e.g., '16:00'
    storeId TEXT,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'cancelled')),
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employeeId, date),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for attendance summary statistics
CREATE TABLE attendance_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    month TEXT NOT NULL,  -- YYYY-MM format
    totalWorkDays INTEGER DEFAULT 0,
    totalWorkHours REAL DEFAULT 0,
    totalOvertimeHours REAL DEFAULT 0,
    totalNightHours REAL DEFAULT 0,
    totalDayHours REAL DEFAULT 0,
    lateArrivals INTEGER DEFAULT 0,
    earlyDepartures INTEGER DEFAULT 0,
    absences INTEGER DEFAULT 0,
    forgottenCheckIns INTEGER DEFAULT 0,
    actualWorkDays REAL DEFAULT 0,
    actualNightWorkHours REAL DEFAULT 0,
    extraWorkHours REAL DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employeeId, month),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for GPS attendance logs (detailed location tracking)
CREATE TABLE gps_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    address TEXT,
    storeId TEXT,
    distance REAL,  -- Distance from store in meters
    type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out')),
    isValid INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId),
    FOREIGN KEY (storeId) REFERENCES stores(storeId)
);

-- =====================================================
-- PROFESSIONAL REQUEST SYSTEM
-- =====================================================

-- Table for shift change requests (Store management)
CREATE TABLE shift_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId TEXT UNIQUE NOT NULL,
    employeeId TEXT NOT NULL,
    currentShift TEXT NOT NULL,
    requestedShift TEXT NOT NULL,
    date TEXT NOT NULL,  -- YYYY-MM-DD format
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approvedBy TEXT,
    approvedAt TEXT,
    note TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for attendance-related requests (Đơn Từ)
CREATE TABLE attendance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId TEXT UNIQUE NOT NULL,
    employeeId TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('forgot_checkin', 'forgot_checkout', 'shift_change', 'absence', 'leave')),
    requestDate TEXT NOT NULL,
    targetDate TEXT,  -- Date the request applies to
    targetTime TEXT,  -- Time for forgot check-in/out requests
    currentShift TEXT,  -- For shift change requests
    requestedShift TEXT,  -- For shift change requests
    reason TEXT NOT NULL,
    leaveType TEXT,  -- For leave requests
    startDate TEXT,  -- For leave requests
    endDate TEXT,  -- For leave requests
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approvedBy TEXT,
    approvedAt TEXT,
    note TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for general requests (backward compatibility)
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId TEXT UNIQUE NOT NULL,
    employeeId TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    data TEXT,  -- JSON string for request data
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    approvedBy TEXT,
    approvedAt TEXT,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for task assignments (Nhiệm Vụ) 
CREATE TABLE task_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId TEXT NOT NULL,
    employeeId TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('participant', 'supporter', 'assigner')),
    assignedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    FOREIGN KEY (taskId) REFERENCES tasks(id),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for task comments
CREATE TABLE task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commentId TEXT UNIQUE NOT NULL,
    taskId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id),
    FOREIGN KEY (authorId) REFERENCES employees(employeeId)
);

-- Table for comment replies
CREATE TABLE comment_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    replyId TEXT UNIQUE NOT NULL,
    commentId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commentId) REFERENCES task_comments(commentId),
    FOREIGN KEY (authorId) REFERENCES employees(employeeId)
);

-- =====================================================
-- SYSTEM MANAGEMENT
-- =====================================================

-- Table for system notifications
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    isRead INTEGER DEFAULT 0,
    relatedId TEXT,  -- Related task/request ID
    relatedType TEXT,  -- Type of related object
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Table for HR system settings
CREATE TABLE hr_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settingKey TEXT UNIQUE NOT NULL,
    settingValue TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table for history tracking (from schema.sql)
CREATE TABLE history_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL, -- 'permission_change', 'approval_action', 'user_data_change'
    target_employee_id TEXT NOT NULL,
    action_by_employee_id TEXT NOT NULL,
    action_by_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    field_name TEXT, -- for user data changes: 'position', 'fullName', 'storeName', 'employeeId'
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    additional_data TEXT -- JSON string for extra data
);

-- =====================================================
-- COMMUNICATION
-- =====================================================

-- Table for chat messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    fullName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    message TEXT NOT NULL,
    time TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- =====================================================
-- FINANCIAL MANAGEMENT
-- =====================================================

-- Table for payment records
CREATE TABLE payment (
    extractedID TEXT PRIMARY KEY,
    "transaction" REAL NOT NULL,  -- Amount
    accountNumber TEXT,
    dateTime TEXT NOT NULL,
    description TEXT
);

-- Table for transaction records
CREATE TABLE "transaction" (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    date TEXT NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core system indexes
CREATE INDEX idx_sessions_employee ON sessions(employeeId);
CREATE INDEX idx_sessions_expires ON sessions(expiresAt);
CREATE INDEX idx_orders_user ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(createdAt);
CREATE INDEX idx_workSchedules_employee ON workSchedules(employeeId);
CREATE INDEX idx_rewards_employee ON rewards(employeeId);
CREATE INDEX idx_rewards_type ON rewards(type);
CREATE INDEX idx_rewards_created ON rewards(createdAt);
CREATE INDEX idx_tasks_employee ON tasks(employeeId);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created ON tasks(createdAt);
CREATE INDEX idx_permissions_employee ON permissions(employeeId);
CREATE INDEX idx_payment_datetime ON payment(dateTime);
CREATE INDEX idx_transaction_date ON transaction(date);
CREATE INDEX idx_transaction_status ON transaction(status);

-- Attendance system indexes
CREATE INDEX idx_attendance_employee ON attendance(employeeId);
CREATE INDEX idx_attendance_checkin ON attendance(checkIn);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_timesheets_employee ON timesheets(employeeId);
CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_timesheets_employee_date ON timesheets(employeeId, date);
CREATE INDEX idx_attendance_summary_employee ON attendance_summary(employeeId);
CREATE INDEX idx_attendance_summary_month ON attendance_summary(month);
CREATE INDEX idx_gps_attendance_employee ON gps_attendance(employeeId);
CREATE INDEX idx_gps_attendance_timestamp ON gps_attendance(timestamp);
CREATE INDEX idx_gps_attendance_type ON gps_attendance(type);

-- Request system indexes
CREATE INDEX idx_attendance_requests_employee ON attendance_requests(employeeId);
CREATE INDEX idx_attendance_requests_type ON attendance_requests(type);
CREATE INDEX idx_attendance_requests_status ON attendance_requests(status);
CREATE INDEX idx_attendance_requests_date ON attendance_requests(requestDate);
CREATE INDEX idx_requests_employee ON requests(employeeId);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_task_assignments_task ON task_assignments(taskId);
CREATE INDEX idx_task_assignments_employee ON task_assignments(employeeId);
CREATE INDEX idx_task_assignments_role ON task_assignments(role);
CREATE INDEX idx_task_comments_task ON task_comments(taskId);
CREATE INDEX idx_task_comments_author ON task_comments(authorId);
CREATE INDEX idx_task_comments_created ON task_comments(createdAt);
CREATE INDEX idx_comment_replies_comment ON comment_replies(commentId);
CREATE INDEX idx_comment_replies_author ON comment_replies(authorId);
CREATE INDEX idx_comment_replies_created ON comment_replies(createdAt);

-- System management indexes
CREATE INDEX idx_notifications_employee ON notifications(employeeId);
CREATE INDEX idx_notifications_read ON notifications(isRead);
CREATE INDEX idx_notifications_created ON notifications(createdAt);
CREATE INDEX idx_hr_settings_key ON hr_settings(settingKey);
CREATE INDEX idx_hr_settings_category ON hr_settings(category);
CREATE INDEX idx_history_logs_target ON history_logs(target_employee_id);
CREATE INDEX idx_history_logs_action_by ON history_logs(action_by_employee_id);
CREATE INDEX idx_history_logs_type ON history_logs(action_type);
CREATE INDEX idx_history_logs_created ON history_logs(created_at);

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Sample store data (enhanced with GPS coordinates for attendance verification)
INSERT OR IGNORE INTO stores (storeId, storeName, region, address) VALUES 
-- Khu vực 1 (TP.HCM)
('MC001', 'MayCha Quận 1', '1', '123 Đường Nguyễn Du, Quận 1, TP.HCM'),
('MC002', 'MayCha Quận 3', '1', '456 Đường Võ Văn Tần, Quận 3, TP.HCM'),
('MC003', 'MayCha Bình Thạnh', '1', '789 Đường Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM'),
('MC004', 'MayCha Tân Bình', '1', '321 Đường Cộng Hòa, Tân Bình, TP.HCM'),
('MC005', 'MayCha Thủ Đức', '1', '654 Đường Võ Văn Ngân, Thủ Đức, TP.HCM'),

-- Khu vực 2 (Miền Bắc) 
('MC006', 'MayCha Hà Nội - Ba Đình', '2', '987 Đường Hoàng Diệu, Ba Đình, Hà Nội'),
('MC007', 'MayCha Hà Nội - Đống Đa', '2', '147 Đường Láng, Đống Đa, Hà Nội'),
('MC008', 'MayCha Hà Nội - Cầu Giấy', '2', '258 Đường Xuân Thủy, Cầu Giấy, Hà Nội'),
('MC009', 'MayCha Hải Phòng', '2', '369 Đường Lê Thánh Tông, Ngô Quyền, Hải Phòng'),
('MC010', 'MayCha Thái Nguyên', '2', '741 Đường Hoàng Văn Thụ, Thái Nguyên'),

-- Khu vực 3 (Miền Trung)
('MC011', 'MayCha Đà Nẵng - Hải Châu', '3', '852 Đường Trần Phú, Hải Châu, Đà Nẵng'),
('MC012', 'MayCha Đà Nẵng - Thanh Khê', '3', '963 Đường Nguyễn Lương Bằng, Thanh Khê, Đà Nẵng'),
('MC013', 'MayCha Huế', '3', '159 Đường Lê Lợi, Thành phố Huế, Thừa Thiên Huế'),
('MC014', 'MayCha Quảng Nam', '3', '753 Đường Phan Chu Trinh, Hội An, Quảng Nam'),
('MC015', 'MayCha Nha Trang', '3', '486 Đường Trần Phú, Nha Trang, Khánh Hòa'),

-- Khu vực 4 (Miền Nam)
('MC016', 'MayCha Cần Thơ', '4', '357 Đường 3 Tháng 2, Ninh Kiều, Cần Thơ'),
('MC017', 'MayCha An Giang', '4', '951 Đường Tôn Đức Thắng, Long Xuyên, An Giang'),
('MC018', 'MayCha Vũng Tàu', '4', '624 Đường Hạ Long, Vũng Tàu, Bà Rịa - Vũng Tàu'),
('MC019', 'MayCha Đồng Tháp', '4', '735 Đường Nguyễn Huệ, Cao Lãnh, Đồng Tháp'),
('MC020', 'MayCha Tiền Giang', '4', '148 Đường Đinh Bộ Lĩnh, Mỹ Tho, Tiền Giang');

-- Sample employee positions and default permissions with hierarchical ranks
-- Admin permissions with enhanced rank system
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) 
SELECT 'ADMIN001', 'schedule', 1, datetime('now') WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE employeeId = 'ADMIN001' AND permission = 'schedule'
);
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) 
SELECT 'ADMIN001', 'tasks', 1, datetime('now') WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE employeeId = 'ADMIN001' AND permission = 'tasks'
);
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) 
SELECT 'ADMIN001', 'rewards', 1, datetime('now') WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE employeeId = 'ADMIN001' AND permission = 'rewards'
);
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) 
SELECT 'ADMIN001', 'admin', 1, datetime('now') WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE employeeId = 'ADMIN001' AND permission = 'admin'
);
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) 
SELECT 'ADMIN001', 'finance', 1, datetime('now') WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE employeeId = 'ADMIN001' AND permission = 'finance'
);

-- Sample rank definitions for the new hierarchical system
INSERT OR IGNORE INTO employee_ranks (employeeId, position, positionLevel, rank, experienceRequired, permissions, salaryMultiplier, benefits, promotionCriteria) VALUES 
-- Employee levels (NV - Nhân Viên)
('SYSTEM', 'NV', 'LV1', 'Đồng', 0, '["basic_access", "attendance", "view_schedule"]', 1.0, '["basic_benefits"]', 'Complete 500 hours, no major violations'),
('SYSTEM', 'NV', 'LV2', 'Đồng', 500, '["basic_access", "attendance", "view_schedule", "submit_requests"]', 1.1, '["basic_benefits", "overtime_bonus"]', 'Complete 1200 hours, demonstrate leadership'),
('SYSTEM', 'NV', 'LV3', 'Bạc', 1200, '["basic_access", "attendance", "view_schedule", "submit_requests", "mentor_new"]', 1.2, '["basic_benefits", "overtime_bonus", "health_insurance"]', 'Complete 2000 hours, train new employees'),

-- Manager levels (QL - Quản Lý)  
('SYSTEM', 'QL', 'LV1', 'Bạc', 2000, '["basic_access", "attendance", "manage_schedule", "approve_requests", "view_reports"]', 1.5, '["manager_benefits", "health_insurance", "performance_bonus"]', 'Complete 3000 hours, successful team management'),
('SYSTEM', 'QL', 'LV2', 'Vàng', 3000, '["basic_access", "attendance", "manage_schedule", "approve_requests", "view_reports", "manage_staff"]', 1.7, '["manager_benefits", "health_insurance", "performance_bonus", "training_budget"]', 'Complete 4500 hours, exceed targets'),
('SYSTEM', 'QL', 'LV3', 'Vàng', 4500, '["basic_access", "attendance", "manage_schedule", "approve_requests", "view_reports", "manage_staff", "budget_control"]', 2.0, '["manager_benefits", "health_insurance", "performance_bonus", "training_budget", "car_allowance"]', 'Complete 6000 hours, regional excellence'),

-- Assistant Manager levels (AM - Assistant Manager)
('SYSTEM', 'AM', 'LV1', 'Vàng', 6000, '["basic_access", "attendance", "manage_schedule", "approve_requests", "view_reports", "manage_staff", "budget_control", "regional_oversight"]', 2.2, '["senior_benefits", "full_insurance", "performance_bonus", "training_budget", "car_allowance"]', 'Complete 8000 hours, multi-store management'),
('SYSTEM', 'AM', 'LV2', 'Kim Cương', 8000, '["basic_access", "attendance", "manage_schedule", "approve_requests", "view_reports", "manage_staff", "budget_control", "regional_oversight", "strategic_planning"]', 2.5, '["senior_benefits", "full_insurance", "performance_bonus", "training_budget", "car_allowance", "profit_sharing"]', 'Complete 10000 hours, strategic impact'),

-- Admin levels (AD - Administrator)
('SYSTEM', 'AD', 'LV1', 'Kim Cương', 10000, '["full_access", "system_admin", "user_management", "data_access", "financial_control"]', 3.0, '["executive_benefits", "full_insurance", "profit_sharing", "stock_options"]', 'System administration excellence');

-- Default HR system settings
INSERT OR IGNORE INTO hr_settings (settingKey, settingValue, description, category) VALUES 
('attendance_radius', '50', 'GPS verification radius in meters for attendance check-in/out', 'attendance'),
('work_day_start', '08:00', 'Standard work day start time', 'schedule'),
('work_day_end', '17:00', 'Standard work day end time', 'schedule'),
('overtime_threshold', '8', 'Hours after which overtime is calculated', 'attendance'),
('night_shift_start', '22:00', 'Time when night shift starts', 'schedule'),
('night_shift_end', '06:00', 'Time when night shift ends', 'schedule'),
('max_late_minutes', '15', 'Maximum minutes late before marking as late arrival', 'attendance'),
('notification_retention_days', '30', 'Days to keep notifications before cleanup', 'system'),
('task_default_priority', 'Medium', 'Default priority for new tasks', 'tasks'),
('leave_approval_required', '1', 'Whether leave requests require approval (1=yes, 0=no)', 'requests');

-- Sample notifications for system features
INSERT OR IGNORE INTO notifications (employeeId, title, message, type, relatedType) VALUES 
('SYSTEM', 'Hệ thống chấm công GPS', 'Hệ thống chấm công GPS đã được kích hoạt. Vui lòng chấm công trong bán kính 50m từ cửa hàng.', 'info', 'attendance'),
('SYSTEM', 'Bảng công mới', 'Bảng công điện tử đã được triển khai. Xem chi tiết thống kê công việc hàng tháng.', 'success', 'timesheet'),
('SYSTEM', 'Hệ thống đơn từ', 'Hệ thống đơn từ chuyên nghiệp đã sẵn sàng. Gửi yêu cầu nghỉ phép, đổi ca qua menu Gửi Yêu Cầu.', 'info', 'requests');

-- =====================================================
-- INITIAL DATA SETUP PROCEDURES  
-- =====================================================

-- Create default attendance summary for current month (run for existing employees)
-- INSERT OR IGNORE INTO attendance_summary (employeeId, month, totalWorkDays, totalWorkHours)
-- SELECT employeeId, strftime('%Y-%m', 'now'), 0, 0 FROM employees;

-- Create sample timesheet data for testing (optional)
-- INSERT OR IGNORE INTO timesheets (employeeId, date, checkIn, checkOut, workHours, status)
-- VALUES ('ADMIN001', date('now'), '08:00', '17:00', 8.0, 'present');

-- =====================================================
-- DATABASE MAINTENANCE PROCEDURES
-- =====================================================

-- Clean up expired sessions (run this periodically)
-- DELETE FROM sessions WHERE datetime(expiresAt) < datetime('now');

-- Clean up old notifications (keep only last 30 days)
-- DELETE FROM notifications WHERE datetime(createdAt) < datetime('now', '-30 days');

-- Clean up old GPS attendance logs (keep only last 90 days)
-- DELETE FROM gps_attendance WHERE datetime(createdAt) < datetime('now', '-90 days');

-- Update attendance summary for current month (run monthly)
-- This should be automated via worker.js functions

-- Archive old completed tasks (keep only last 6 months)
-- DELETE FROM tasks WHERE status = 'completed' AND datetime(createdAt) < datetime('now', '-6 months');

-- Archive old orders (move to archive table if needed)
-- You can create an archive_orders table and move old completed orders there

-- =====================================================
-- NOTES & DOCUMENTATION
-- =====================================================

-- ROLE CODES WITH HIERARCHICAL LEVELS:
-- AD = Admin (Administrator) - Full system access
--   - LV1: System Administrator - Kim Cương rank
-- AM = Assistant Manager - Regional management capabilities  
--   - LV1: Regional Assistant Manager - Vàng rank
--   - LV2: Senior Assistant Manager - Kim Cương rank
-- QL = Quản lý (Manager) - Store management, employee oversight
--   - LV1: Store Manager - Bạc rank
--   - LV2: Senior Manager - Vàng rank  
--   - LV3: Regional Manager - Vàng rank
-- NV = Nhân viên (Employee) - Basic employee access
--   - LV1: Junior Employee - Đồng rank
--   - LV2: Employee - Đồng rank
--   - LV3: Senior Employee - Bạc rank

-- RANK SYSTEM:
-- Đồng (Bronze): Entry level employees, basic access
-- Bạc (Silver): Experienced employees, some management duties
-- Vàng (Gold): Management level, significant responsibilities
-- Kim Cương (Diamond): Executive level, strategic oversight

-- EXPERIENCE POINT SYSTEM:
-- Experience points are earned through:
-- - Working hours (1 point per hour)
-- - Task completion bonuses
-- - Performance reviews
-- - Training completion
-- - Leadership activities

-- PERMISSION TYPES:
-- schedule = Manage work schedules and shift assignments
-- tasks = Handle task requests and assignments  
-- rewards = Manage rewards/penalties system
-- admin = Administrative functions and user management
-- finance = Financial management and payment processing
-- attendance = Attendance system management

-- ATTENDANCE SYSTEM:
-- GPS Verification: 50-meter radius from registered store locations
-- Check-in/out tracked in 'attendance' table with location data
-- Monthly statistics calculated in 'attendance_summary' table
-- Detailed timesheet view in 'timesheets' table

-- REQUEST SYSTEM TYPES:
-- Attendance Requests (attendance_requests table):
--   - forgot_checkin: Forgotten check-in requests
--   - forgot_checkout: Forgotten check-out requests  
--   - shift_change: Shift change requests
--   - absence: Absence notification
--   - leave: Leave/vacation requests
-- 
-- Task Assignments (task_assignments table):
--   - participant: Primary task participants
--   - supporter: Task supporters/helpers
--   - assigner: Task assigners/managers

-- TASK MANAGEMENT:
-- Tasks support multi-user assignments with visibility controls
-- Only involved users (participants, supporters, assigners) can see tasks
-- Priority levels: Low, Medium, High, Urgent
-- Status tracking: active, completed, cancelled

-- TIMESHEET FEATURES:
-- Monthly calendar view with daily work hours
-- Comprehensive statistics (15+ metrics)
-- Real-time data loading with month/year selection
-- Responsive design for mobile and desktop

-- SCHEDULE TIME FORMAT: 
-- "HH:MM-HH:MM" (e.g., "08:00-17:00")
-- Days: T2=Monday, T3=Tuesday, T4=Wednesday, T5=Thursday, T6=Friday, T7=Saturday, CN=Sunday

-- GPS ATTENDANCE VALIDATION:
-- Location must be within 50 meters of registered store
-- Coordinates stored in JSON format in 'location' field
-- Distance calculation performed on server-side
-- Invalid locations marked with isValid=0

-- NOTIFICATION SYSTEM:
-- System-wide notifications for important updates
-- User-specific notifications for task/request updates  
-- Auto-cleanup after retention period (default 30 days)
-- Different types: info, warning, success, error

-- HR SETTINGS:
-- Configurable system parameters in hr_settings table
-- Settings categories: attendance, schedule, tasks, requests, system
-- Active/inactive setting control with isActive flag

-- DATA RETENTION POLICIES:
-- Sessions: Clean up expired automatically
-- Notifications: 30 days (configurable)
-- GPS logs: 90 days recommended
-- Task history: 6 months for completed tasks

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Sample store data with GPS coordinates (Ho Chi Minh City locations)
INSERT INTO stores (storeId, storeName, region, address, latitude, longitude, managerEmployeeId) VALUES
('MC001', 'TOCOToco Nguyễn Huệ', '1', '123 Đường Nguyễn Huệ, Quận 1, TP.HCM', 10.773996, 106.705070, 'ADMIN'),
('MC002', 'TOCOToco Bitexco', '1', '2 Hai Trieu, Ben Nghe Ward, District 1, Ho Chi Minh City', 10.771971, 106.704324, 'ADMIN'),
('MC003', 'TOCOToco Landmark 81', '1', '208 Nguyen Huu Canh, Binh Thanh District, Ho Chi Minh City', 10.794593, 106.721439, 'ADMIN'),
('MC004', 'TOCOToco Aeon Mall', '2', '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM', 10.819252, 106.618639, 'ADMIN'),
('MC005', 'TOCOToco Vincom Center', '2', '70-72 Le Thanh Ton, Ben Nghe Ward, District 1, Ho Chi Minh City', 10.779738, 106.700554, 'ADMIN');

-- Sample employees for testing GPS attendance - Enhanced with hierarchical ranks
INSERT INTO employees (employeeId, fullName, storeName, storeId, position, positionLevel, rank, experience, joinDate, phone, email, password, salt) VALUES
('EMP001', 'Nguyễn Văn Test', 'TOCOToco Nguyễn Huệ', 'MC001', 'NV', 'LV1', 'Đồng', 150, '2024-01-01', '0901234567', 'test@tocotoco.com', 'hashed_password', 'salt123'),
('EMP002', 'Trần Thị Demo', 'TOCOToco Bitexco', 'MC002', 'NV', 'LV2', 'Đồng', 650, '2024-01-01', '0902345678', 'demo@tocotoco.com', 'hashed_password', 'salt456');

-- Sample attendance data for testing timesheet
INSERT INTO attendance (employeeId, checkIn, checkOut, location, status) VALUES
('ADMIN', '2025-01-29 08:00:00', '2025-01-29 17:00:00', '{"latitude": 10.773996, "longitude": 106.705070}', 'completed'),
('ADMIN', '2025-01-28 08:15:00', '2025-01-28 17:30:00', '{"latitude": 10.773996, "longitude": 106.705070}', 'completed'),
('ADMIN', '2025-01-27 07:45:00', '2025-01-27 16:45:00', '{"latitude": 10.773996, "longitude": 106.705070}', 'completed');

-- Sample shift assignments (required for timesheet display)
INSERT INTO shift_assignments (employeeId, date, shiftName, startTime, endTime, storeId, status) VALUES
('ADMIN', '2025-01-29', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('ADMIN', '2025-01-28', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('ADMIN', '2025-01-27', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('ADMIN', '2025-01-30', 'Ca sáng', '08:00', '17:00', 'MC001', 'assigned'),
('ADMIN', '2025-01-31', 'Ca sáng', '08:00', '17:00', 'MC001', 'assigned'),
('ADMIN', '2025-02-01', 'Ca chiều', '13:00', '22:00', 'MC001', 'assigned'),
('ADMIN', '2025-02-02', 'Ca chiều', '13:00', '22:00', 'MC001', 'assigned');

-- Sample HR settings for GPS attendance radius
INSERT INTO hr_settings (settingKey, settingValue, category, description, dataType, isActive) VALUES
('attendance_radius_meters', '50', 'attendance', 'GPS verification radius in meters for check-in/out', 'integer', 1),
('work_hours_per_day', '8', 'attendance', 'Standard work hours per day', 'integer', 1),
('work_days_per_month', '26', 'attendance', 'Standard work days per month', 'integer', 1);
-- Attendance data: Permanent retention for compliance
