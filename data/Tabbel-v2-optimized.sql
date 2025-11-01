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

-- Attendance table - Enhanced to support multiple shifts per day
-- Now links to shift_assignments to track which shift the check-in belongs to
CREATE TABLE attendance (
    attendanceId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    checkDate TEXT NOT NULL,
    checkTime TEXT NOT NULL,
    checkLocation TEXT,
    shiftId INTEGER,                    -- NEW: Link to shift for per-shift tracking
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (shiftId) REFERENCES shifts(shiftId) ON DELETE SET NULL,
    UNIQUE(employeeId, checkDate, shiftId)  -- Allow multiple check-ins per day (one per shift)
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
    shiftCode TEXT UNIQUE NOT NULL,     -- NEW: Unique code for easy reference (e.g., 'S4_8-12', 'S8_8-16')
    name TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    timeName TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
);

-- Insert default shift data with various shift lengths
-- 4-hour shifts (8:00 to 23:00)
INSERT INTO shifts (shiftCode, name, startTime, endTime, timeName) VALUES 
('S4_08-12', 'Ca 4 Tiếng 8-12', 8, 12, '08:00-12:00'),
('S4_09-13', 'Ca 4 Tiếng 9-13', 9, 13, '09:00-13:00'),
('S4_10-14', 'Ca 4 Tiếng 10-14', 10, 14, '10:00-14:00'),
('S4_11-15', 'Ca 4 Tiếng 11-15', 11, 15, '11:00-15:00'),
('S4_12-16', 'Ca 4 Tiếng 12-16', 12, 16, '12:00-16:00'),
('S4_13-17', 'Ca 4 Tiếng 13-17', 13, 17, '13:00-17:00'),
('S4_14-18', 'Ca 4 Tiếng 14-18', 14, 18, '14:00-18:00'),
('S4_15-19', 'Ca 4 Tiếng 15-19', 15, 19, '15:00-19:00'),
('S4_16-20', 'Ca 4 Tiếng 16-20', 16, 20, '16:00-20:00'),
('S4_17-21', 'Ca 4 Tiếng 17-21', 17, 21, '17:00-21:00'),
('S4_18-22', 'Ca 4 Tiếng 18-22', 18, 22, '18:00-22:00'),
('S4_19-23', 'Ca 4 Tiếng 19-23', 19, 23, '19:00-23:00'),

-- 5-hour shifts
('S5_08-13', 'Ca 5 Tiếng 8-13', 8, 13, '08:00-13:00'),
('S5_09-14', 'Ca 5 Tiếng 9-14', 9, 14, '09:00-14:00'),
('S5_10-15', 'Ca 5 Tiếng 10-15', 10, 15, '10:00-15:00'),
('S5_11-16', 'Ca 5 Tiếng 11-16', 11, 16, '11:00-16:00'),
('S5_12-17', 'Ca 5 Tiếng 12-17', 12, 17, '12:00-17:00'),
('S5_13-18', 'Ca 5 Tiếng 13-18', 13, 18, '13:00-18:00'),
('S5_14-19', 'Ca 5 Tiếng 14-19', 14, 19, '14:00-19:00'),
('S5_15-20', 'Ca 5 Tiếng 15-20', 15, 20, '15:00-20:00'),

-- 6-hour shifts
('S6_08-14', 'Ca 6 Tiếng 8-14', 8, 14, '08:00-14:00'),
('S6_09-15', 'Ca 6 Tiếng 9-15', 9, 15, '09:00-15:00'),
('S6_10-16', 'Ca 6 Tiếng 10-16', 10, 16, '10:00-16:00'),
('S6_11-17', 'Ca 6 Tiếng 11-17', 11, 17, '11:00-17:00'),
('S6_12-18', 'Ca 6 Tiếng 12-18', 12, 18, '12:00-18:00'),
('S6_13-19', 'Ca 6 Tiếng 13-19', 13, 19, '13:00-19:00'),
('S6_14-20', 'Ca 6 Tiếng 14-20', 14, 20, '14:00-20:00'),
('S6_15-21', 'Ca 6 Tiếng 15-21', 15, 21, '15:00-21:00'),

-- 7-hour shifts
('S7_08-15', 'Ca 7 Tiếng 8-15', 8, 15, '08:00-15:00'),
('S7_09-16', 'Ca 7 Tiếng 9-16', 9, 16, '09:00-16:00'),
('S7_10-17', 'Ca 7 Tiếng 10-17', 10, 17, '10:00-17:00'),
('S7_11-18', 'Ca 7 Tiếng 11-18', 11, 18, '11:00-18:00'),
('S7_12-19', 'Ca 7 Tiếng 12-19', 12, 19, '12:00-19:00'),
('S7_13-20', 'Ca 7 Tiếng 13-20', 13, 20, '13:00-20:00'),
('S7_14-21', 'Ca 7 Tiếng 14-21', 14, 21, '14:00-21:00'),
('S7_15-22', 'Ca 7 Tiếng 15-22', 15, 22, '15:00-22:00'),

-- 8-hour shifts (standard full-time)
('S8_08-16', 'Ca 8 Tiếng 8-16', 8, 16, '08:00-16:00'),
('S8_09-17', 'Ca 8 Tiếng 9-17', 9, 17, '09:00-17:00'),
('S8_10-18', 'Ca 8 Tiếng 10-18', 10, 18, '10:00-18:00'),
('S8_11-19', 'Ca 8 Tiếng 11-19', 11, 19, '11:00-19:00'),
('S8_12-20', 'Ca 8 Tiếng 12-20', 12, 20, '12:00-20:00'),
('S8_13-21', 'Ca 8 Tiếng 13-21', 13, 21, '13:00-21:00'),
('S8_14-22', 'Ca 8 Tiếng 14-22', 14, 22, '14:00-22:00'),
('S8_15-23', 'Ca 8 Tiếng 15-23', 15, 23, '15:00-23:00'),

-- 14-hour shifts
('S14_08-22', 'Ca 14 Tiếng 8-22', 8, 22, '08:00-22:00'),
('S14_09-23', 'Ca 14 Tiếng 9-23', 9, 23, '09:00-23:00'),

-- 15-hour shifts
('S15_08-23', 'Ca 15 Tiếng 8-23', 8, 23, '08:00-23:00');

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
-- =====================================================
-- MIGRATION 001: COMPOUND INDEXES FOR COMMON QUERIES
-- Expected Impact: 40-60% faster filtered queries
-- Effort: Low | Risk: Low
-- Priority: HIGH - Quick Win
-- =====================================================

-- Attendance queries by employee + date range
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date_range 
ON attendance(employeeId, checkDate DESC);

-- Shift assignments by employee + specific date  
CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_specific_date 
ON shift_assignments(employeeId, date);

-- Employee requests filtered by status + employee
CREATE INDEX IF NOT EXISTS idx_employee_requests_status_employee 
ON employee_requests(status, employeeId, createdAt DESC);

-- Session lookups by token + active status
CREATE INDEX IF NOT EXISTS idx_sessions_token_active 
ON sessions(session_token, is_active, expires_at);

-- Employees by store + position (for manager queries)
CREATE INDEX IF NOT EXISTS idx_employees_store_position 
ON employees(storeId, position, is_active);

-- Employees by store + active status
CREATE INDEX IF NOT EXISTS idx_employees_store_active 
ON employees(storeId, is_active, employeeId);

-- Timesheets by employee + exact period
CREATE INDEX IF NOT EXISTS idx_timesheets_employee_exact_period 
ON timesheets(employeeId, year, month);

-- Notifications by employee + unread status
CREATE INDEX IF NOT EXISTS idx_notifications_employee_unread 
ON notifications(employeeId, isRead, createdAt DESC);

-- Shift assignments by date + shift (for schedules)
CREATE INDEX IF NOT EXISTS idx_shift_assignments_date_shift 
ON shift_assignments(date, shiftId);

-- Employee requests by type + status
CREATE INDEX IF NOT EXISTS idx_employee_requests_type_status 
ON employee_requests(requestType, status, createdAt DESC);
-- =====================================================
-- MIGRATION 002: COVERING INDEXES
-- Expected Impact: 20-30% faster for list queries
-- Effort: Low | Risk: Low
-- Priority: HIGH - Quick Win
-- =====================================================

-- Cover common employee list queries (no table lookup needed)
CREATE INDEX IF NOT EXISTS idx_employees_list_covering 
ON employees(is_active, position, storeId, employeeId, fullName, email);

-- Cover attendance dashboard queries
CREATE INDEX IF NOT EXISTS idx_attendance_dashboard_covering 
ON attendance(employeeId, checkDate, checkTime, checkLocation, attendanceId);

-- Cover shift assignment list queries
CREATE INDEX IF NOT EXISTS idx_shift_assignments_list_covering 
ON shift_assignments(date, employeeId, shiftId, assignmentId);

-- Cover request list queries
CREATE INDEX IF NOT EXISTS idx_employee_requests_list_covering 
ON employee_requests(status, employeeId, requestType, title, createdAt, requestId);
-- =====================================================
-- MIGRATION 003: EMPLOYEE STATS CACHE
-- Expected Impact: 60-80% faster for dashboard stats
-- Effort: Medium | Risk: Low
-- Priority: HIGH - Dashboard Performance
-- =====================================================

-- Create cached stats table
CREATE TABLE IF NOT EXISTS employee_stats_cache (
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

CREATE INDEX IF NOT EXISTS idx_employee_stats_updated 
ON employee_stats_cache(lastUpdated);

CREATE INDEX IF NOT EXISTS idx_employee_stats_employee 
ON employee_stats_cache(employeeId, lastUpdated);

-- Initialize with current data
INSERT OR IGNORE INTO employee_stats_cache (employeeId, totalAttendanceDays, lastCheckDate, lastUpdated)
SELECT 
  employeeId,
  COUNT(*) as totalAttendanceDays,
  MAX(checkDate) as lastCheckDate,
  datetime('now') as lastUpdated
FROM attendance
GROUP BY employeeId;

-- Trigger: Update stats after attendance insert
CREATE TRIGGER IF NOT EXISTS trg_update_stats_after_attendance_insert
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

-- Trigger: Update stats after attendance update
CREATE TRIGGER IF NOT EXISTS trg_update_stats_after_attendance_update
AFTER UPDATE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    lastCheckDate = NEW.checkDate,
    lastCheckTime = NEW.checkTime,
    lastUpdated = datetime('now')
  WHERE employeeId = NEW.employeeId;
END;

-- Trigger: Update stats after attendance delete
CREATE TRIGGER IF NOT EXISTS trg_update_stats_after_attendance_delete
AFTER DELETE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    totalAttendanceDays = totalAttendanceDays - 1,
    lastUpdated = datetime('now')
  WHERE employeeId = OLD.employeeId;
END;
-- =====================================================
-- MIGRATION 004: DAILY ATTENDANCE SUMMARY
-- Expected Impact: 70-90% faster for manager dashboards
-- Effort: Medium | Risk: Low
-- Priority: HIGH - Manager Performance
-- =====================================================

-- Create daily summary table
CREATE TABLE IF NOT EXISTS daily_attendance_summary (
  summaryDate TEXT NOT NULL,
  storeId TEXT NOT NULL,
  totalEmployees INTEGER DEFAULT 0,
  presentEmployees INTEGER DEFAULT 0,
  absentEmployees INTEGER DEFAULT 0,
  lateEmployees INTEGER DEFAULT 0,
  averageCheckInTime TEXT,
  lastUpdated TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (summaryDate, storeId),
  FOREIGN KEY (storeId) REFERENCES stores(storeId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_summary_date 
ON daily_attendance_summary(summaryDate DESC);

CREATE INDEX IF NOT EXISTS idx_daily_summary_store_date 
ON daily_attendance_summary(storeId, summaryDate DESC);

-- Initialize with recent data (last 90 days)
INSERT OR IGNORE INTO daily_attendance_summary (summaryDate, storeId, totalEmployees, presentEmployees, lastUpdated)
SELECT 
  a.checkDate as summaryDate,
  e.storeId,
  (SELECT COUNT(DISTINCT employeeId) FROM employees WHERE storeId = e.storeId AND is_active = 1) as totalEmployees,
  COUNT(DISTINCT a.employeeId) as presentEmployees,
  datetime('now') as lastUpdated
FROM attendance a
JOIN employees e ON a.employeeId = e.employeeId
WHERE a.checkDate >= date('now', '-90 days')
GROUP BY a.checkDate, e.storeId;

-- Trigger: Update daily summary after attendance insert
CREATE TRIGGER IF NOT EXISTS trg_update_daily_summary_after_insert
AFTER INSERT ON attendance
BEGIN
  INSERT INTO daily_attendance_summary (
    summaryDate, 
    storeId, 
    totalEmployees, 
    presentEmployees,
    lastUpdated
  )
  SELECT 
    NEW.checkDate,
    e.storeId,
    (SELECT COUNT(*) FROM employees WHERE storeId = e.storeId AND is_active = 1),
    1,
    datetime('now')
  FROM employees e
  WHERE e.employeeId = NEW.employeeId
  ON CONFLICT(summaryDate, storeId) DO UPDATE SET
    presentEmployees = presentEmployees + 1,
    lastUpdated = datetime('now');
END;
