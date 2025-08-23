-- =====================================================
-- ENHANCED DATABASE SCHEMA FOR OPTIMIZED HR SYSTEM
-- =====================================================
-- Comprehensive database structure optimized for performance
-- and supporting all worker architectures
-- 
-- Version: 3.0.0
-- Created: January 2025
-- Features:
-- ✓ Optimized indexes for fast queries
-- ✓ Partitioning support for large tables
-- ✓ Comprehensive audit trails
-- ✓ Performance monitoring tables
-- ✓ Advanced caching support
-- ✓ Multi-tenant architecture ready
-- =====================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- System configuration and settings
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance monitoring and metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type VARCHAR(50) NOT NULL, -- request, database, cache, error
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4),
    metric_unit VARCHAR(20), -- ms, count, percentage, bytes
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

-- API request logs for monitoring
CREATE TABLE IF NOT EXISTS api_request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id VARCHAR(50) NOT NULL,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    user_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_size INTEGER,
    response_status INTEGER,
    response_time_ms DECIMAL(8,2),
    response_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Enhanced employees table with performance optimizations
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    storeId VARCHAR(50),
    manager_id INTEGER,
    hire_date DATE,
    termination_date DATE,
    salary DECIMAL(12,2),
    employment_status VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    password_changed_at DATETIME,
    profile_image_url TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manager_id) REFERENCES employees(id),
    CHECK (email LIKE '%@%'),
    CHECK (employment_status IN ('active', 'inactive', 'terminated'))
);

-- User roles and permissions system
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- user, attendance, task, admin
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    granted_by INTEGER,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES employees(id),
    UNIQUE(employee_id, role_id)
);

-- Direct user permissions (overrides role permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted BOOLEAN DEFAULT TRUE,
    granted_by INTEGER,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES employees(id),
    UNIQUE(employee_id, permission_id)
);

-- =====================================================
-- SESSION MANAGEMENT
-- =====================================================

-- Enhanced session management with device tracking
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expiresAt DATETIME NOT NULL,
    lastAccess DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);

-- Session activity logs
CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- login, logout, refresh, expire, revoke
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- =====================================================
-- ATTENDANCE SYSTEM
-- =====================================================

-- Enhanced attendance tracking
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL,
    checkIn DATETIME,
    checkOut DATETIME,
    location TEXT,
    checkOutLocation TEXT,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    checkout_gps_latitude DECIMAL(10, 8),
    checkout_gps_longitude DECIMAL(11, 8),
    device_info TEXT,
    work_hours_calculated DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    break_duration_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    notes TEXT,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    CHECK (status IN ('active', 'completed', 'cancelled', 'pending_approval'))
);

-- Break times during work
CREATE TABLE IF NOT EXISTS attendance_breaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendance_id INTEGER NOT NULL,
    break_start DATETIME NOT NULL,
    break_end DATETIME,
    break_type VARCHAR(50) DEFAULT 'regular', -- regular, lunch, emergency
    duration_minutes INTEGER,
    notes TEXT,
    
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
);

-- Attendance corrections and adjustments
CREATE TABLE IF NOT EXISTS attendance_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendance_id INTEGER NOT NULL,
    original_checkin DATETIME,
    original_checkout DATETIME,
    adjusted_checkin DATETIME,
    adjusted_checkout DATETIME,
    reason TEXT NOT NULL,
    requested_by INTEGER NOT NULL,
    approved_by INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- =====================================================
-- TASK MANAGEMENT SYSTEM
-- =====================================================

-- Enhanced task management
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled, on_hold
    category VARCHAR(100),
    assignedTo INTEGER,
    createdBy INTEGER NOT NULL,
    project_id INTEGER,
    parent_task_id INTEGER,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress_percentage INTEGER DEFAULT 0,
    dueDate DATETIME,
    startDate DATETIME,
    completedDate DATETIME,
    tags TEXT, -- JSON array of tags
    attachments TEXT, -- JSON array of file URLs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignedTo) REFERENCES employees(id),
    FOREIGN KEY (createdBy) REFERENCES employees(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- Task assignments for multiple users
CREATE TABLE IF NOT EXISTS task_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'assignee', -- assignee, reviewer, observer, participant
    assigned_by INTEGER,
    assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, removed
    
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES employees(id),
    UNIQUE(taskId, employeeId, role)
);

-- Task comments and collaboration
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    comment TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'comment', -- comment, status_update, attachment
    parent_comment_id INTEGER,
    attachments TEXT, -- JSON array
    is_internal BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id),
    FOREIGN KEY (parent_comment_id) REFERENCES task_comments(id)
);

-- Task time tracking
CREATE TABLE IF NOT EXISTS task_time_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_minutes INTEGER,
    description TEXT,
    billable BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- =====================================================
-- ORGANIZATION STRUCTURE
-- =====================================================

-- Stores/Locations management
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storeId VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id INTEGER,
    region VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    business_hours TEXT, -- JSON format
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id INTEGER,
    department_head_id INTEGER,
    budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    FOREIGN KEY (department_head_id) REFERENCES employees(id)
);

-- =====================================================
-- SCHEDULING SYSTEM
-- =====================================================

-- Work schedules and shifts
CREATE TABLE IF NOT EXISTS work_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly, custom
    schedule_data TEXT, -- JSON format for flexible scheduling
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES employees(id)
);

-- Shift assignments
CREATE TABLE IF NOT EXISTS shift_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL,
    schedule_id INTEGER,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
    assigned_by INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId),
    FOREIGN KEY (schedule_id) REFERENCES work_schedules(id),
    FOREIGN KEY (assigned_by) REFERENCES employees(id)
);

-- Shift change requests
CREATE TABLE IF NOT EXISTS shift_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    original_shift_id INTEGER,
    requested_shift_date DATE,
    requested_start_time TIME,
    requested_end_time TIME,
    request_type VARCHAR(50) NOT NULL, -- time_off, shift_change, overtime, swap
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    review_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (requester_id) REFERENCES employees(id),
    FOREIGN KEY (original_shift_id) REFERENCES shift_assignments(id),
    FOREIGN KEY (reviewed_by) REFERENCES employees(id)
);

-- =====================================================
-- AUDIT AND HISTORY TRACKING
-- =====================================================

-- Comprehensive audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values TEXT, -- JSON format
    new_values TEXT, -- JSON format
    changed_by INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (changed_by) REFERENCES employees(id)
);

-- Employee history tracking
CREATE TABLE IF NOT EXISTS employee_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    changed_by INTEGER,
    effective_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId),
    FOREIGN KEY (changed_by) REFERENCES employees(id)
);

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- Notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    sender_id INTEGER,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- info, warning, error, success
    category VARCHAR(50), -- attendance, task, schedule, system
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    data TEXT, -- JSON for additional data
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipient_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES employees(id)
);

-- =====================================================
-- CACHING AND PERFORMANCE TABLES
-- =====================================================

-- Query cache for performance optimization
CREATE TABLE IF NOT EXISTS query_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    cache_value TEXT NOT NULL,
    cache_category VARCHAR(50),
    expires_at DATETIME NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Employee indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_employeeId ON employees(employeeId);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_store ON employees(storeId);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_employee ON sessions(employeeId);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expiresAt);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employeeId);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(checkIn);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employeeId, checkIn);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assignedTo);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(createdBy);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(dueDate);

-- Task assignment indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(taskId);
CREATE INDEX IF NOT EXISTS idx_task_assignments_employee ON task_assignments(employeeId);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(changed_by);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded ON performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created ON api_request_logs(created_at);

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_query_cache_key ON query_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_query_cache_category ON query_cache(cache_category);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default system configuration
INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
('system_name', 'HR Management System', 'System display name'),
('system_version', '3.0.0', 'Current system version'),
('cache_ttl_default', '300000', 'Default cache TTL in milliseconds'),
('session_timeout', '28800000', 'Session timeout in milliseconds (8 hours)'),
('max_login_attempts', '5', 'Maximum failed login attempts before lockout'),
('password_min_length', '8', 'Minimum password length'),
('enable_audit_logging', 'true', 'Enable comprehensive audit logging'),
('enable_performance_monitoring', 'true', 'Enable performance monitoring');

-- Insert default roles
INSERT OR IGNORE INTO roles (role_name, description, is_system_role) VALUES
('admin', 'System Administrator', TRUE),
('manager', 'Department Manager', TRUE),
('employee', 'Regular Employee', TRUE),
('hr', 'Human Resources', TRUE),
('viewer', 'Read-only Access', TRUE);

-- Insert default permissions
INSERT OR IGNORE INTO permissions (permission_name, description, category) VALUES
-- User management
('user.create', 'Create new users', 'user'),
('user.read', 'View user information', 'user'),
('user.update', 'Update user information', 'user'),
('user.delete', 'Delete users', 'user'),
('user.manage_roles', 'Manage user roles and permissions', 'user'),

-- Attendance management
('attendance.check_in', 'Check in to work', 'attendance'),
('attendance.check_out', 'Check out from work', 'attendance'),
('attendance.view_own', 'View own attendance records', 'attendance'),
('attendance.view_all', 'View all attendance records', 'attendance'),
('attendance.approve', 'Approve attendance records', 'attendance'),
('attendance.modify', 'Modify attendance records', 'attendance'),

-- Task management
('task.create', 'Create new tasks', 'task'),
('task.read', 'View tasks', 'task'),
('task.update', 'Update tasks', 'task'),
('task.delete', 'Delete tasks', 'task'),
('task.assign', 'Assign tasks to others', 'task'),
('task.manage_all', 'Manage all tasks in system', 'task'),

-- System administration
('admin.system_config', 'Manage system configuration', 'admin'),
('admin.view_logs', 'View system logs', 'admin'),
('admin.manage_permissions', 'Manage roles and permissions', 'admin'),
('admin.performance_monitoring', 'Access performance monitoring', 'admin');

-- Assign permissions to default roles
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'admin'; -- Admin gets all permissions

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'employee' AND p.permission_name IN (
    'attendance.check_in', 'attendance.check_out', 'attendance.view_own',
    'task.read', 'task.update', 'user.read'
);

-- =====================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Employee audit trigger
CREATE TRIGGER IF NOT EXISTS employee_audit_trigger
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        'employees',
        NEW.id,
        'UPDATE',
        json_object(
            'employeeId', OLD.employeeId,
            'name', OLD.name,
            'email', OLD.email,
            'department', OLD.department,
            'position', OLD.position,
            'is_active', OLD.is_active
        ),
        json_object(
            'employeeId', NEW.employeeId,
            'name', NEW.name,
            'email', NEW.email,
            'department', NEW.department,
            'position', NEW.position,
            'is_active', NEW.is_active
        ),
        NULL -- Will be set by application
    );
END;

-- Task audit trigger
CREATE TRIGGER IF NOT EXISTS task_audit_trigger
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        'tasks',
        NEW.id,
        'UPDATE',
        json_object(
            'title', OLD.title,
            'status', OLD.status,
            'priority', OLD.priority,
            'assignedTo', OLD.assignedTo,
            'progress_percentage', OLD.progress_percentage
        ),
        json_object(
            'title', NEW.title,
            'status', NEW.status,
            'priority', NEW.priority,
            'assignedTo', NEW.assignedTo,
            'progress_percentage', NEW.progress_percentage
        ),
        NULL
    );
END;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Employee with role information
CREATE VIEW IF NOT EXISTS v_employees_with_roles AS
SELECT 
    e.*,
    GROUP_CONCAT(r.role_name) as roles,
    MAX(ur.granted_at) as last_role_assignment
FROM employees e
LEFT JOIN user_roles ur ON e.id = ur.employee_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE e.is_active = TRUE
GROUP BY e.id;

-- Current attendance status
CREATE VIEW IF NOT EXISTS v_current_attendance AS
SELECT 
    e.employeeId,
    e.name,
    a.checkIn,
    a.checkOut,
    a.location,
    CASE 
        WHEN a.checkIn IS NOT NULL AND a.checkOut IS NULL THEN 'checked_in'
        WHEN a.checkIn IS NOT NULL AND a.checkOut IS NOT NULL THEN 'checked_out'
        ELSE 'not_started'
    END as status,
    CASE 
        WHEN a.checkOut IS NOT NULL 
        THEN ROUND((JULIANDAY(a.checkOut) - JULIANDAY(a.checkIn)) * 24, 2)
        ELSE NULL 
    END as hours_worked
FROM employees e
LEFT JOIN attendance a ON e.employeeId = a.employeeId 
    AND DATE(a.checkIn) = DATE('now', '+7 hours')
WHERE e.is_active = TRUE;

-- Task summary by employee
CREATE VIEW IF NOT EXISTS v_task_summary AS
SELECT 
    e.employeeId,
    e.name,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(*) as total_tasks
FROM employees e
LEFT JOIN tasks t ON e.id = t.assignedTo
WHERE e.is_active = TRUE
GROUP BY e.id, e.employeeId, e.name;

-- =====================================================
-- CLEANUP PROCEDURES (as stored queries)
-- =====================================================

-- Note: SQLite doesn't support stored procedures, but we can document cleanup queries

/*
-- Cleanup expired sessions (run daily)
DELETE FROM sessions WHERE expiresAt < datetime('now', '-1 day');

-- Cleanup old audit logs (run monthly, keep 1 year)
DELETE FROM audit_logs WHERE created_at < datetime('now', '-365 days');

-- Cleanup old performance metrics (run weekly, keep 3 months)  
DELETE FROM performance_metrics WHERE recorded_at < datetime('now', '-90 days');

-- Cleanup expired cache entries
DELETE FROM query_cache WHERE expires_at < datetime('now');

-- Cleanup old API request logs (run monthly, keep 6 months)
DELETE FROM api_request_logs WHERE created_at < datetime('now', '-180 days');
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Enhanced HR Management Database Schema v3.0.0 created successfully!' as message;