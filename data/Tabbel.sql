
-- Table for authentication sessions
CREATE TABLE sessions (
    employeeId TEXT NOT NULL,
    token TEXT PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    lastAccess TEXT NOT NULL
);

-- Table for employees (staff members)
CREATE TABLE employees (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    joinDate TEXT,
    phone TEXT,
    email TEXT,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
);

-- Table for employee registration queue (pending approvals)
CREATE TABLE queue (
    employeeId TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    joinDate TEXT,
    phone TEXT,
    email TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Wait'
);

-- Table for email verification during registration
CREATE TABLE email_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    email TEXT NOT NULL,
    verificationCode TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    joinDate TEXT,
    phone TEXT,
    passwordHash TEXT NOT NULL,
    passwordSalt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL
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

-- =====================================================
-- HR MANAGEMENT
-- =====================================================

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


-- Enhanced table for task/request management (legacy format)
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
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

-- Sample employee positions and default permissions
-- Admin permissions
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

-- Sample store data with GPS coordinates (Ho Chi Minh City locations)
INSERT INTO stores (storeId, storeName, region, address, latitude, longitude, managerEmployeeId) VALUES
('MC001', 'TOCOToco Nguyễn Huệ', '1', '123 Đường Nguyễn Huệ, Quận 1, TP.HCM', 10.773996, 106.705070, 'ADMIN'),
('MC002', 'TOCOToco Bitexco', '1', '2 Hai Trieu, Ben Nghe Ward, District 1, Ho Chi Minh City', 10.771971, 106.704324, 'ADMIN'),
('MC003', 'TOCOToco Landmark 81', '1', '208 Nguyen Huu Canh, Binh Thanh District, Ho Chi Minh City', 10.794593, 106.721439, 'ADMIN'),
('MC004', 'TOCOToco Aeon Mall', '2', '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM', 10.819252, 106.618639, 'ADMIN'),
('MC005', 'TOCOToco Vincom Center', '2', '70-72 Le Thanh Ton, Ben Nghe Ward, District 1, Ho Chi Minh City', 10.779738, 106.700554, 'ADMIN');

-- Sample employees for testing GPS attendance
INSERT INTO employees (employeeId, fullName, storeName, position, joinDate, phone, email, password, salt) VALUES
('EMP001', 'Nguyễn Văn Test', 'TOCOToco Nguyễn Huệ', 'NV', '2024-01-01', '0901234567', 'test@tocotoco.com', 'hashed_password', 'salt123'),
('EMP002', 'Trần Thị Demo', 'TOCOToco Bitexco', 'NV', '2024-01-01', '0902345678', 'demo@tocotoco.com', 'hashed_password', 'salt456');

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
