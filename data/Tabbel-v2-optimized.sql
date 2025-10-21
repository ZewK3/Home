-- =====================================================
-- OPTIMIZED DATABASE SCHEMA V2.3 (Further Simplified)
-- Professional HR Management System
-- Simplified schema: employeeId only, position-based permissions
-- No roles/user_roles tables - use position field directly
-- GPS checking on backend with 40m radius validation
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

-- Employees table - Simplified with position-based permissions
CREATE TABLE employees (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    salt TEXT,
    storeId TEXT,
    position TEXT DEFAULT 'NV' CHECK(position IN ('NV', 'QL', 'AD')),
    approval_status TEXT DEFAULT 'approved' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (storeId) REFERENCES stores(storeId)
);

-- Email verification (unchanged)
CREATE TABLE email_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    expiresAt TEXT NOT NULL,
    FOREIGN KEY (email) REFERENCES employees(email) ON DELETE CASCADE
);

-- Stores table - Streamlined for GPS validation
CREATE TABLE stores (
    storeId TEXT PRIMARY KEY,           -- Example: MC001
    storeName TEXT NOT NULL,             -- Example: MayCha 74 Đồng Đen
    address TEXT,                        -- Full address: MayCha 74 Đồng Đen, Quận..., TP..., Việt Nam
    city TEXT,                           -- Example: HCM
    latitude REAL,
    longitude REAL,
    radius REAL DEFAULT 50.0,            -- GPS validation radius in meters
    createdAt TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- ATTENDANCE & WORK MANAGEMENT - OPTIMIZED
-- =====================================================

-- Attendance table - MERGED with gps_attendance (GPS columns added)
-- Attendance table - Simplified (GPS checking moved to frontend)
CREATE TABLE attendance (
    attendanceId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    checkDate TEXT NOT NULL,
    checkTime TEXT NOT NULL,
    checkLocation TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);

-- Timesheets table (unchanged - monthly summaries)
CREATE TABLE timesheets (
    timesheetId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
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
    UNIQUE(employeeId, month, year)
);

-- Shift assignments - Links employees to shifts
CREATE TABLE shift_assignments (
    assignmentId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    shiftId INTEGER NOT NULL,
    date TEXT NOT NULL,
    assignedBy TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (shiftId) REFERENCES shifts(shiftId) ON DELETE CASCADE,
    FOREIGN KEY (assignedBy) REFERENCES employees(employeeId)
);

-- Employee requests - MERGED attendance_requests + shift_requests + requests
CREATE TABLE employee_requests (
    requestId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    requestType TEXT NOT NULL CHECK(requestType IN ('leave', 'overtime', 'forgot_checkin', 'forgot_checkout', 'shift_change', 'shift_swap', 'general')),
    title TEXT NOT NULL,
    description TEXT,
    -- Leave/Attendance request fields
    requestDate TEXT,
    fromDate TEXT,
    toDate TEXT,
    reason TEXT,
    -- Shift change/swap fields
    currentShiftDate TEXT,
    requestedShiftDate TEXT,
    swapWithEmployeeId TEXT,
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    reviewedBy TEXT,
    reviewedAt TEXT,
    rejectionReason TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (reviewedBy) REFERENCES employees(employeeId),
    FOREIGN KEY (swapWithEmployeeId) REFERENCES employees(employeeId)
);

-- =====================================================
-- SHIFT MANAGEMENT
-- =====================================================

-- Shifts table - Predefined work shifts
CREATE TABLE shifts (
    shiftId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    timeName TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
);

-- Insert default shift data
INSERT INTO shifts (name, startTime, endTime, timeName) VALUES 
('Ca 8 Tiếng 8-16', 8, 16, '08:00-16:00');

-- =====================================================
-- USER MANAGEMENT & REGISTRATION
-- =====================================================

-- Pending registrations table
CREATE TABLE pending_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    fullName TEXT,
    phone TEXT,
    storeId TEXT,
    storeName TEXT,
    department TEXT,
    position TEXT DEFAULT 'NV',
    verification_code TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'approved', 'rejected')),
    created_at TEXT DEFAULT (datetime('now')),
    verified_at TEXT,
    approved_at TEXT,
    approved_by TEXT
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

-- Departments table (optional - for organizational structure)
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_code TEXT UNIQUE NOT NULL,
    department_name TEXT NOT NULL,
    description TEXT,
    managerEmployeeId TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (managerEmployeeId) REFERENCES employees(employeeId)
);

-- =====================================================
-- SYSTEM MANAGEMENT
-- =====================================================

-- Permissions table (unchanged)
CREATE TABLE permissions (
    permissionId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    permission TEXT NOT NULL,
    granted INTEGER DEFAULT 0,
    grantedBy TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (grantedBy) REFERENCES employees(employeeId),
    UNIQUE(employeeId, permission)
);

-- Notifications (unchanged)
CREATE TABLE notifications (
    notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'request', 'task', 'system')),
    isRead INTEGER DEFAULT 0,
    actionUrl TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);

-- HR settings (unchanged)
CREATE TABLE hr_settings (
    settingId INTEGER PRIMARY KEY AUTOINCREMENT,
    settingKey TEXT NOT NULL UNIQUE,
    settingValue TEXT,
    category TEXT,
    description TEXT,
    updatedBy TEXT,
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (updatedBy) REFERENCES employees(employeeId)
);

-- History logs (unchanged)
CREATE TABLE history_logs (
    logId INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    action_by_employee_id TEXT NOT NULL,
    target_employee_id TEXT,
    description TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (action_by_employee_id) REFERENCES employees(employeeId),
    FOREIGN KEY (target_employee_id) REFERENCES employees(employeeId)
);

-- Messages table (unchanged - for internal messaging)
CREATE TABLE messages (
    messageId INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId TEXT NOT NULL,
    receiverId TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    sentAt TEXT DEFAULT (datetime('now')),
    readAt TEXT,
    FOREIGN KEY (senderId) REFERENCES employees(employeeId),
    FOREIGN KEY (receiverId) REFERENCES employees(employeeId)
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
CREATE INDEX idx_employees_position ON employees(position);
CREATE INDEX idx_employees_approval_status ON employees(approval_status);
CREATE INDEX idx_employees_storeId ON employees(storeId);
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Attendance indexes (simplified)
CREATE INDEX idx_attendance_employeeId ON attendance(employeeId);
CREATE INDEX idx_attendance_checkDate ON attendance(checkDate);
CREATE INDEX idx_attendance_checkLocation ON attendance(checkLocation);

-- Timesheet indexes
CREATE INDEX idx_timesheets_employee_period ON timesheets(employeeId, year DESC, month DESC);

-- Shift assignment indexes
CREATE INDEX idx_shift_assignments_employee_date ON shift_assignments(employeeId, date DESC);
CREATE INDEX idx_shift_assignments_date ON shift_assignments(date);
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shiftId);

-- Employee requests indexes (covers all request types)
CREATE INDEX idx_employee_requests_employee ON employee_requests(employeeId);
CREATE INDEX idx_employee_requests_type ON employee_requests(requestType);
CREATE INDEX idx_employee_requests_status ON employee_requests(status);
CREATE INDEX idx_employee_requests_date ON employee_requests(createdAt DESC);

-- Shift indexes
CREATE INDEX idx_shifts_start_time ON shifts(startTime);
CREATE INDEX idx_shifts_end_time ON shifts(endTime);

-- Notification indexes
CREATE INDEX idx_notifications_employee_read ON notifications(employeeId, isRead);
CREATE INDEX idx_notifications_created ON notifications(createdAt DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Permission indexes
CREATE INDEX idx_permissions_employee_permission ON permissions(employeeId, permission);

-- History log indexes
CREATE INDEX idx_history_logs_action_by ON history_logs(action_by_employee_id);
CREATE INDEX idx_history_logs_target ON history_logs(target_employee_id);
CREATE INDEX idx_history_logs_type ON history_logs(action_type);
CREATE INDEX idx_history_logs_created ON history_logs(created_at DESC);

-- Message indexes
CREATE INDEX idx_messages_sender ON messages(senderId);
CREATE INDEX idx_messages_receiver ON messages(receiverId);
CREATE INDEX idx_messages_read ON messages(isRead);
CREATE INDEX idx_messages_sent ON messages(sentAt DESC);

-- Pending registrations indexes
CREATE INDEX idx_pending_reg_employeeId ON pending_registrations(employeeId);
CREATE INDEX idx_pending_reg_email ON pending_registrations(email);
CREATE INDEX idx_pending_reg_status ON pending_registrations(status);

-- User change history indexes
CREATE INDEX idx_user_change_employeeId ON user_change_history(employeeId);
CREATE INDEX idx_user_change_changed_at ON user_change_history(changed_at DESC);

-- Position-based permissions (no separate roles tables needed)

-- Departments indexes
CREATE INDEX idx_departments_code ON departments(department_code);
CREATE INDEX idx_departments_manager ON departments(managerEmployeeId);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Default admin permissions
INSERT OR IGNORE INTO permissions (employeeId, permission, granted) 
VALUES 
    ('ADMIN001', 'schedule', 1),
    ('ADMIN001', 'rewards', 1),
    ('ADMIN001', 'admin', 1),
    ('ADMIN001', 'finance', 1);

-- Default HR settings
INSERT OR IGNORE INTO hr_settings (settingKey, settingValue, category, description) 
VALUES 
    ('work_hours_per_day', '8', 'attendance', 'Standard work hours per day'),
    ('overtime_multiplier', '1.5', 'payroll', 'Overtime pay multiplier'),
    ('max_gps_distance', '50', 'attendance', 'Maximum GPS distance in meters for check-in'),
    ('late_threshold_minutes', '15', 'attendance', 'Minutes after scheduled time considered late'),
    ('auto_approve_leave_days', '3', 'requests', 'Auto-approve leave requests under N days');

-- =====================================================
-- OPTIMIZATION SUMMARY
-- =====================================================
-- 
-- SCHEMA SIMPLIFIED (V2.3):
-- 
-- KEY CHANGES:
-- 1. Unified to employeeId TEXT throughout (removed dual-column id INTEGER approach)
-- 2. Simplified attendance table - only checkDate, checkTime, checkLocation
-- 3. GPS validation on backend with Haversine formula (40m radius)
-- 4. All foreign keys now reference employeeId TEXT or storeId TEXT
-- 5. Position-based permissions (no separate roles/user_roles tables)
-- 6. Streamlined employees table (removed redundant columns)
-- 7. Restructured stores table (focused on essentials + GPS)
--
-- MERGED:
-- 1. attendance + gps_attendance → attendance (GPS checking on backend)
-- 2. attendance_requests + shift_requests + requests → employee_requests (type field)
-- 3. queue → employees (approval_status column added)
--
-- REMOVED:
-- 1. attendance_summary (calculate real-time from attendance table)
-- 2. workSchedules (functionality covered by shift_assignments)
-- 3. tasks, task_assignments, task_comments, comment_replies (task management removed)
-- 4. Dual-column approach (id INTEGER removed)
-- 5. roles table (use position field directly: NV, QL, AD)
-- 6. user_roles table (use position field directly)
-- 7. Redundant columns from employees (name, storeName, joinDate, hire_date, etc.)
-- 8. Non-essential columns from stores (province, postalCode, phone, email)
--
-- ADDED:
-- 1. shifts table - predefined work shifts for better shift management
-- 2. pending_registrations - user registration workflow
-- 3. user_change_history - audit trail for user changes
-- 4. departments - organizational structure (optional)
--
-- BENEFITS:
-- - Simplified schema with consistent employeeId usage
-- - Backend GPS validation with configurable radius per store
-- - Position-based permissions (NV, QL, AD) - no JOIN needed
-- - Streamlined employees table (only essential fields)
-- - Focused stores table (name, address, city, GPS coordinates)
-- - Enhanced authentication with proper session management
-- - Better user management with registration workflow
-- - Audit trail with user_change_history
-- - Improved query performance with optimized indexes
-- - Cleaner foreign key relationships
--
-- =====================================================
