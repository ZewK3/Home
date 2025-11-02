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
    password TEXT NOT NULL,              -- SHA-256 hashed, no salt needed
    storeId TEXT,
    position TEXT DEFAULT 'NV' CHECK(position IN ('NV', 'QL', 'AD')),
    approval_status TEXT DEFAULT 'approved' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (storeId) REFERENCES stores(storeId)
);

-- Email verification table (Legacy - NOT USED)
-- NOTE: This table exists for backward compatibility but is NOT actively used.
-- The system now uses the 'pending_registrations' table for email verification.
-- pending_registrations.verification_code stores the verification code
-- pending_registrations.status tracks verification state (pending/verified/approved/rejected)
-- This design is more efficient as it combines registration and verification in one table.

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
    shiftCode TEXT UNIQUE,              -- NEW: Unique code for easy reference (e.g., 'S4_08-12', 'S8_08-16')
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    timeName TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
);

-- Insert default shift data with various shift lengths
-- 4-hour shifts (8:00 to 23:00)
INSERT INTO shifts (name, shiftCode, startTime, endTime, timeName) VALUES 
('Ca 4 Tiếng 8-12', 'S4_08-12', 8, 12, '08:00-12:00'),
('Ca 4 Tiếng 9-13', 'S4_09-13', 9, 13, '09:00-13:00'),
('Ca 4 Tiếng 10-14', 'S4_10-14', 10, 14, '10:00-14:00'),
('Ca 4 Tiếng 11-15', 'S4_11-15', 11, 15, '11:00-15:00'),
('Ca 4 Tiếng 12-16', 'S4_12-16', 12, 16, '12:00-16:00'),
('Ca 4 Tiếng 13-17', 'S4_13-17', 13, 17, '13:00-17:00'),
('Ca 4 Tiếng 14-18', 'S4_14-18', 14, 18, '14:00-18:00'),
('Ca 4 Tiếng 15-19', 'S4_15-19', 15, 19, '15:00-19:00'),
('Ca 4 Tiếng 16-20', 'S4_16-20', 16, 20, '16:00-20:00'),
('Ca 4 Tiếng 17-21', 'S4_17-21', 17, 21, '17:00-21:00'),
('Ca 4 Tiếng 18-22', 'S4_18-22', 18, 22, '18:00-22:00'),
('Ca 4 Tiếng 19-23', 'S4_19-23', 19, 23, '19:00-23:00'),

-- 5-hour shifts
('Ca 5 Tiếng 8-13', 'S5_08-13', 8, 13, '08:00-13:00'),
('Ca 5 Tiếng 9-14', 'S5_09-14', 9, 14, '09:00-14:00'),
('Ca 5 Tiếng 10-15', 'S5_10-15', 10, 15, '10:00-15:00'),
('Ca 5 Tiếng 11-16', 'S5_11-16', 11, 16, '11:00-16:00'),
('Ca 5 Tiếng 12-17', 'S5_12-17', 12, 17, '12:00-17:00'),
('Ca 5 Tiếng 13-18', 'S5_13-18', 13, 18, '13:00-18:00'),
('Ca 5 Tiếng 14-19', 'S5_14-19', 14, 19, '14:00-19:00'),
('Ca 5 Tiếng 15-20', 'S5_15-20', 15, 20, '15:00-20:00'),

-- 6-hour shifts
('Ca 6 Tiếng 8-14', 'S6_08-14', 8, 14, '08:00-14:00'),
('Ca 6 Tiếng 9-15', 'S6_09-15', 9, 15, '09:00-15:00'),
('Ca 6 Tiếng 10-16', 'S6_10-16', 10, 16, '10:00-16:00'),
('Ca 6 Tiếng 11-17', 'S6_11-17', 11, 17, '11:00-17:00'),
('Ca 6 Tiếng 12-18', 'S6_12-18', 12, 18, '12:00-18:00'),
('Ca 6 Tiếng 13-19', 'S6_13-19', 13, 19, '13:00-19:00'),
('Ca 6 Tiếng 14-20', 'S6_14-20', 14, 20, '14:00-20:00'),
('Ca 6 Tiếng 15-21', 'S6_15-21', 15, 21, '15:00-21:00'),

-- 7-hour shifts
('Ca 7 Tiếng 8-15', 'S7_08-15', 8, 15, '08:00-15:00'),
('Ca 7 Tiếng 9-16', 'S7_09-16', 9, 16, '09:00-16:00'),
('Ca 7 Tiếng 10-17', 'S7_10-17', 10, 17, '10:00-17:00'),
('Ca 7 Tiếng 11-18', 'S7_11-18', 11, 18, '11:00-18:00'),
('Ca 7 Tiếng 12-19', 'S7_12-19', 12, 19, '12:00-19:00'),
('Ca 7 Tiếng 13-20', 'S7_13-20', 13, 20, '13:00-20:00'),
('Ca 7 Tiếng 14-21', 'S7_14-21', 14, 21, '14:00-21:00'),
('Ca 7 Tiếng 15-22', 'S7_15-22', 15, 22, '15:00-22:00'),

-- 8-hour shifts (standard full-time)
('Ca 8 Tiếng 8-16', 'S8_08-16', 8, 16, '08:00-16:00'),
('Ca 8 Tiếng 9-17', 'S8_09-17', 9, 17, '09:00-17:00'),
('Ca 8 Tiếng 10-18', 'S8_10-18', 10, 18, '10:00-18:00'),
('Ca 8 Tiếng 11-19', 'S8_11-19', 11, 19, '11:00-19:00'),
('Ca 8 Tiếng 12-20', 'S8_12-20', 12, 20, '12:00-20:00'),
('Ca 8 Tiếng 13-21', 'S8_13-21', 13, 21, '13:00-21:00'),
('Ca 8 Tiếng 14-22', 'S8_14-22', 14, 22, '14:00-22:00'),
('Ca 8 Tiếng 15-23', 'S8_15-23', 15, 23, '15:00-23:00'),

-- 9-hour shifts
('Ca 9 Tiếng 8-17', 'S9_08-17', 8, 17, '08:00-17:00'),
('Ca 9 Tiếng 9-18', 'S9_09-18', 9, 18, '09:00-18:00'),
('Ca 9 Tiếng 10-19', 'S9_10-19', 10, 19, '10:00-19:00'),
('Ca 9 Tiếng 11-20', 'S9_11-20', 11, 20, '11:00-20:00'),
('Ca 9 Tiếng 12-21', 'S9_12-21', 12, 21, '12:00-21:00'),
('Ca 9 Tiếng 13-22', 'S9_13-22', 13, 22, '13:00-22:00'),
('Ca 9 Tiếng 14-23', 'S9_14-23', 14, 23, '14:00-23:00'),

-- 10-hour shifts
('Ca 10 Tiếng 8-18', 'S10_08-18', 8, 18, '08:00-18:00'),
('Ca 10 Tiếng 9-19', 'S10_09-19', 9, 19, '09:00-19:00'),
('Ca 10 Tiếng 10-20', 'S10_10-20', 10, 20, '10:00-20:00'),
('Ca 10 Tiếng 11-21', 'S10_11-21', 11, 21, '11:00-21:00'),
('Ca 10 Tiếng 12-22', 'S10_12-22', 12, 22, '12:00-22:00'),
('Ca 10 Tiếng 13-23', 'S10_13-23', 13, 23, '13:00-23:00'),

-- 11-hour shifts
('Ca 11 Tiếng 8-19', 'S11_08-19', 8, 19, '08:00-19:00'),
('Ca 11 Tiếng 9-20', 'S11_09-20', 9, 20, '09:00-20:00'),
('Ca 11 Tiếng 10-21', 'S11_10-21', 10, 21, '10:00-21:00'),
('Ca 11 Tiếng 11-22', 'S11_11-22', 11, 22, '11:00-22:00'),
('Ca 11 Tiếng 12-23', 'S11_12-23', 12, 23, '12:00-23:00'),

-- 12-hour shifts
('Ca 12 Tiếng 8-20', 'S12_08-20', 8, 20, '08:00-20:00'),
('Ca 12 Tiếng 9-21', 'S12_09-21', 9, 21, '09:00-21:00'),
('Ca 12 Tiếng 10-22', 'S12_10-22', 10, 22, '10:00-22:00'),
('Ca 12 Tiếng 11-23', 'S12_11-23', 11, 23, '11:00-23:00'),

-- 13-hour shifts
('Ca 13 Tiếng 8-21', 'S13_08-21', 8, 21, '08:00-21:00'),
('Ca 13 Tiếng 9-22', 'S13_09-22', 9, 22, '09:00-22:00'),
('Ca 13 Tiếng 10-23', 'S13_10-23', 10, 23, '10:00-23:00'),

-- 14-hour shifts
('Ca 14 Tiếng 8-22', 'S14_08-22', 8, 22, '08:00-22:00'),
('Ca 14 Tiếng 9-23', 'S14_09-23', 9, 23, '09:00-23:00'),

-- 15-hour shifts
('Ca 15 Tiếng 8-23', 'S15_08-23', 8, 23, '08:00-23:00');

-- =====================================================
-- USER MANAGEMENT & REGISTRATION
-- =====================================================

-- Pending registrations table
CREATE TABLE pending_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,              -- Already hashed with SHA-256
    fullName TEXT NOT NULL,              -- Synchronized with employees.fullName
    phone TEXT,
    storeId TEXT,                        -- FOREIGN KEY to stores(storeId)
    position TEXT DEFAULT 'NV' CHECK(position IN ('NV', 'QL', 'AD')),  -- Match employees position constraint
    verification_code TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'approved', 'rejected')),
    created_at TEXT DEFAULT (datetime('now')),
    verified_at TEXT,
    approved_at TEXT,
    approved_by TEXT,                    -- employeeId of approver
    FOREIGN KEY (storeId) REFERENCES stores(storeId),
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

-- Departments table (optional - for organizational structure)

-- =====================================================
-- SYSTEM MANAGEMENT
-- =====================================================

-- Permissions table (unchanged)

-- Notifications (unchanged)

-- HR settings (unchanged)

-- History logs (unchanged)

-- Messages table (unchanged - for internal messaging)

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

-- Permission indexes

-- History log indexes

-- Message indexes

-- Pending registrations indexes
CREATE INDEX idx_pending_reg_employeeId ON pending_registrations(employeeId);
CREATE INDEX idx_pending_reg_email ON pending_registrations(email);
CREATE INDEX idx_pending_reg_status ON pending_registrations(status);

-- User change history indexes
CREATE INDEX idx_user_change_employeeId ON user_change_history(employeeId);
CREATE INDEX idx_user_change_changed_at ON user_change_history(changed_at DESC);

-- Position-based permissions (no separate roles tables needed)

-- Departments indexes

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Default admin permissions

-- Default HR settings

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

-- Notifications by employee + unread status

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
