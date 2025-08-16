-- =====================================================
-- PROFESSIONAL USER MANAGEMENT SYSTEM DATABASE SCHEMA
-- =====================================================
-- Enhanced database structure for modern HR Management System
-- Designed for professional user management, scalability, and security
-- 
-- Version: 2.0.0
-- Created: January 2025
-- Features:
-- ✓ Professional user management with detailed profiles
-- ✓ Advanced role-based access control (RBAC)
-- ✓ Comprehensive audit logging
-- ✓ Multi-tenant organization support
-- ✓ Enhanced security with encryption support
-- ✓ Performance optimization with proper indexing
-- ✓ Data integrity with foreign key constraints
-- ✓ Scalable architecture for enterprise use
-- =====================================================

-- Drop existing tables for clean migration (CAUTION: Data will be lost)
-- Uncomment only when migrating to new schema
/*
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS history_logs;
DROP TABLE IF EXISTS comment_replies;
DROP TABLE IF EXISTS task_comments;
DROP TABLE IF EXISTS task_assignments;
DROP TABLE IF EXISTS attendance_requests;
DROP TABLE IF EXISTS shift_requests;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS gps_attendance;
DROP TABLE IF EXISTS attendance_summary;
DROP TABLE IF EXISTS shift_assignments;
DROP TABLE IF EXISTS timesheets;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS workSchedules;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS queue;
DROP TABLE IF EXISTS email_verification;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS transaction;
DROP TABLE IF EXISTS hr_settings;
*/

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Organizations table for multi-tenant support
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    domain TEXT UNIQUE,
    logo_url TEXT,
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    locale TEXT DEFAULT 'vi_VN',
    subscription_plan TEXT DEFAULT 'basic',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settings TEXT -- JSON configuration
);

-- Enhanced user profiles table
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN middle_name IS NOT NULL 
            THEN first_name || ' ' || middle_name || ' ' || last_name
            ELSE first_name || ' ' || last_name
        END
    ) STORED,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    nationality TEXT DEFAULT 'Vietnamese',
    
    -- Contact Information
    personal_email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    
    -- Address Information
    current_address TEXT,
    permanent_address TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Vietnam',
    
    -- Profile Settings
    avatar_url TEXT,
    bio TEXT,
    preferred_language TEXT DEFAULT 'vi',
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- System Fields
    is_active INTEGER DEFAULT 1,
    email_verified_at DATETIME,
    phone_verified_at DATETIME,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Enhanced authentication table
CREATE TABLE user_authentication (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    backup_codes TEXT, -- JSON array of backup codes
    last_password_change DATETIME DEFAULT CURRENT_TIMESTAMP,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Enhanced sessions with device tracking
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    device_info TEXT, -- JSON with browser, OS, device info
    ip_address TEXT,
    location TEXT, -- JSON with country, city, etc.
    is_active INTEGER DEFAULT 1,
    expires_at DATETIME NOT NULL,
    refresh_expires_at DATETIME,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- ROLE-BASED ACCESS CONTROL (RBAC)
-- =====================================================

-- System roles with hierarchical support
CREATE TABLE system_roles (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 0, -- Hierarchy level (0=highest)
    is_system_role INTEGER DEFAULT 0, -- Cannot be deleted
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, name),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- System permissions
CREATE TABLE system_permissions (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- e.g., 'user', 'system', 'reports'
    resource TEXT, -- Resource this permission applies to
    action TEXT, -- Action this permission allows (create, read, update, delete)
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Role-permission relationships
CREATE TABLE role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    granted INTEGER DEFAULT 1,
    granted_by TEXT,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES system_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES system_permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES user_profiles(id)
);

-- User role assignments
CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME, -- Optional role expiration
    is_active INTEGER DEFAULT 1,
    
    UNIQUE(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES system_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES user_profiles(id)
);

-- Direct user permissions (overrides/exceptions)
CREATE TABLE user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    granted INTEGER DEFAULT 1, -- 1=granted, 0=denied (overrides role)
    granted_by TEXT,
    reason TEXT,
    expires_at DATETIME,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES system_permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- ORGANIZATION & WORKPLACE MANAGEMENT
-- =====================================================

-- Enhanced departments/divisions
CREATE TABLE departments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    parent_department_id TEXT, -- For nested departments
    department_head_id TEXT,
    cost_center TEXT,
    budget_allocation REAL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, name),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    FOREIGN KEY (department_head_id) REFERENCES user_profiles(id)
);

-- Enhanced job positions/titles
CREATE TABLE job_positions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    department_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    job_level TEXT, -- Junior, Senior, Manager, etc.
    min_salary REAL,
    max_salary REAL,
    currency TEXT DEFAULT 'VND',
    required_skills TEXT, -- JSON array
    responsibilities TEXT, -- JSON array
    requirements TEXT, -- JSON array
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Enhanced store/location management
CREATE TABLE workplace_locations (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    type TEXT DEFAULT 'store', -- store, office, warehouse, remote
    region TEXT,
    address TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'Vietnam',
    postal_code TEXT,
    
    -- GPS coordinates for attendance
    latitude REAL,
    longitude REAL,
    attendance_radius INTEGER DEFAULT 50, -- meters
    
    -- Contact information
    phone TEXT,
    email TEXT,
    manager_id TEXT,
    
    -- Operational details
    operating_hours TEXT, -- JSON with daily hours
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    capacity INTEGER, -- Number of employees
    
    -- Status
    is_active INTEGER DEFAULT 1,
    opened_date DATE,
    closed_date DATE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES user_profiles(id)
);

-- Employee assignments to locations/departments
CREATE TABLE employee_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    department_id TEXT,
    job_position_id TEXT,
    workplace_location_id TEXT,
    manager_id TEXT,
    
    -- Employment details
    employee_type TEXT DEFAULT 'full-time', -- full-time, part-time, contract, intern
    employment_status TEXT DEFAULT 'active', -- active, inactive, terminated, on-leave
    hire_date DATE NOT NULL,
    termination_date DATE,
    probation_end_date DATE,
    
    -- Compensation
    base_salary REAL,
    currency TEXT DEFAULT 'VND',
    pay_frequency TEXT DEFAULT 'monthly', -- hourly, daily, weekly, monthly, yearly
    
    -- Assignment status
    is_primary INTEGER DEFAULT 1, -- Primary assignment
    is_active INTEGER DEFAULT 1,
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (job_position_id) REFERENCES job_positions(id),
    FOREIGN KEY (workplace_location_id) REFERENCES workplace_locations(id),
    FOREIGN KEY (manager_id) REFERENCES user_profiles(id),
    FOREIGN KEY (assigned_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- ENHANCED ATTENDANCE & TIME MANAGEMENT
-- =====================================================

-- Flexible work schedules
CREATE TABLE work_schedules (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    schedule_type TEXT DEFAULT 'fixed', -- fixed, flexible, shift-based
    
    -- Default weekly schedule (JSON)
    weekly_schedule TEXT, -- {"monday": {"start": "08:00", "end": "17:00"}, ...}
    
    -- Schedule rules
    total_hours_per_week REAL DEFAULT 40,
    max_hours_per_day REAL DEFAULT 8,
    break_duration_minutes INTEGER DEFAULT 60,
    overtime_threshold_daily REAL DEFAULT 8,
    overtime_threshold_weekly REAL DEFAULT 40,
    
    -- Attendance rules
    grace_period_minutes INTEGER DEFAULT 15,
    late_threshold_minutes INTEGER DEFAULT 30,
    
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- User schedule assignments
CREATE TABLE user_work_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    work_schedule_id TEXT NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE,
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (work_schedule_id) REFERENCES work_schedules(id),
    FOREIGN KEY (assigned_by) REFERENCES user_profiles(id)
);

-- Enhanced attendance records
CREATE TABLE attendance_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workplace_location_id TEXT,
    date DATE NOT NULL,
    
    -- Clock in/out times
    clock_in_time DATETIME,
    clock_out_time DATETIME,
    
    -- GPS location data (JSON)
    clock_in_location TEXT,
    clock_out_location TEXT,
    
    -- Calculated hours
    total_hours REAL DEFAULT 0,
    regular_hours REAL DEFAULT 0,
    overtime_hours REAL DEFAULT 0,
    break_hours REAL DEFAULT 0,
    
    -- Status and flags
    status TEXT DEFAULT 'present', -- present, absent, late, early_departure, partial
    is_holiday INTEGER DEFAULT 0,
    is_weekend INTEGER DEFAULT 0,
    
    -- Approval workflow
    requires_approval INTEGER DEFAULT 0,
    approved_by TEXT,
    approved_at DATETIME,
    approval_notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (workplace_location_id) REFERENCES workplace_locations(id),
    FOREIGN KEY (approved_by) REFERENCES user_profiles(id)
);

-- Time tracking entries (for detailed logging)
CREATE TABLE time_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    attendance_record_id TEXT,
    entry_type TEXT NOT NULL, -- clock_in, clock_out, break_start, break_end
    timestamp DATETIME NOT NULL,
    
    -- Location data
    location_data TEXT, -- JSON with GPS, IP, etc.
    device_info TEXT, -- JSON with device details
    
    -- Verification status
    is_verified INTEGER DEFAULT 0,
    verification_method TEXT, -- gps, manual, biometric, etc.
    verification_confidence REAL, -- 0.0 to 1.0
    
    -- Manual entry details
    is_manual_entry INTEGER DEFAULT 0,
    entered_by TEXT,
    entry_reason TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id),
    FOREIGN KEY (entered_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- REQUEST & APPROVAL SYSTEM
-- =====================================================

-- Request categories
CREATE TABLE request_categories (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    requires_approval INTEGER DEFAULT 1,
    auto_approve_conditions TEXT, -- JSON rules for auto-approval
    approval_workflow_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Approval workflows
CREATE TABLE approval_workflows (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    workflow_steps TEXT, -- JSON array of approval steps
    is_parallel INTEGER DEFAULT 0, -- All approvers at once vs sequential
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Enhanced requests system
CREATE TABLE user_requests (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Request data (flexible JSON structure)
    request_data TEXT, -- JSON with request-specific fields
    
    -- Dates and time
    request_start_date DATE,
    request_end_date DATE,
    request_duration_hours REAL,
    
    -- Status tracking
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled, in_review
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Approval workflow
    approval_workflow_id TEXT,
    current_approval_step INTEGER DEFAULT 0,
    requires_approval INTEGER DEFAULT 1,
    
    -- Final approval
    final_approved_by TEXT,
    final_approved_at DATETIME,
    rejection_reason TEXT,
    
    -- System fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES request_categories(id),
    FOREIGN KEY (approval_workflow_id) REFERENCES approval_workflows(id),
    FOREIGN KEY (final_approved_by) REFERENCES user_profiles(id)
);

-- Request approval steps tracking
CREATE TABLE request_approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    approver_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    decision_notes TEXT,
    decision_at DATETIME,
    is_required INTEGER DEFAULT 1,
    
    UNIQUE(request_id, step_number, approver_id),
    FOREIGN KEY (request_id) REFERENCES user_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES user_profiles(id)
);

-- =====================================================
-- TASK & PROJECT MANAGEMENT
-- =====================================================

-- Project management
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_manager_id TEXT,
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    estimated_hours REAL,
    
    -- Status
    status TEXT DEFAULT 'planning', -- planning, active, on_hold, completed, cancelled
    priority TEXT DEFAULT 'normal',
    
    -- Budget
    budget_amount REAL,
    currency TEXT DEFAULT 'VND',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_manager_id) REFERENCES user_profiles(id)
);

-- Enhanced task management
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    project_id TEXT,
    parent_task_id TEXT, -- For subtasks
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Assignment
    assigned_to TEXT,
    created_by TEXT NOT NULL,
    
    -- Timeline
    start_date DATE,
    due_date DATE,
    estimated_hours REAL,
    actual_hours REAL,
    
    -- Status and priority
    status TEXT DEFAULT 'todo', -- todo, in_progress, review, completed, cancelled
    priority TEXT DEFAULT 'normal',
    completion_percentage INTEGER DEFAULT 0,
    
    -- Task metadata
    tags TEXT, -- JSON array
    labels TEXT, -- JSON array
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (assigned_to) REFERENCES user_profiles(id),
    FOREIGN KEY (created_by) REFERENCES user_profiles(id)
);

-- Task collaborators/watchers
CREATE TABLE task_collaborators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'collaborator', -- assignee, collaborator, watcher
    added_by TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES user_profiles(id)
);

-- Task comments and updates
CREATE TABLE task_activities (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- comment, status_change, assignment, etc.
    content TEXT,
    old_value TEXT,
    new_value TEXT,
    attachments TEXT, -- JSON array of file URLs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- =====================================================
-- COMPREHENSIVE AUDIT & LOGGING
-- =====================================================

-- System audit logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    user_id TEXT,
    
    -- Event details
    event_type TEXT NOT NULL, -- login, logout, create, update, delete, etc.
    resource_type TEXT, -- user, role, permission, attendance, etc.
    resource_id TEXT,
    
    -- Change tracking
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    
    -- Metadata
    severity TEXT DEFAULT 'info', -- debug, info, warning, error, critical
    description TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- Security events
CREATE TABLE security_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- failed_login, password_reset, permission_change, etc.
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    details TEXT, -- JSON with event-specific data
    resolved INTEGER DEFAULT 0,
    resolved_by TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id),
    FOREIGN KEY (resolved_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- NOTIFICATIONS & COMMUNICATIONS
-- =====================================================

-- Enhanced notification system
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    category TEXT, -- system, task, approval, announcement
    
    -- Targeting
    target_url TEXT,
    action_required INTEGER DEFAULT 0,
    
    -- Status
    is_read INTEGER DEFAULT 0,
    read_at DATETIME,
    
    -- Delivery
    delivery_method TEXT DEFAULT 'in_app', -- in_app, email, sms, push
    delivered_at DATETIME,
    
    -- Expiration
    expires_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- Enhanced system settings
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id TEXT,
    category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    data_type TEXT DEFAULT 'string', -- string, integer, boolean, json
    description TEXT,
    is_secret INTEGER DEFAULT 0, -- For sensitive settings
    is_user_configurable INTEGER DEFAULT 1,
    validation_rules TEXT, -- JSON schema for validation
    default_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, category, setting_key),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- User preferences
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value TEXT NOT NULL,
    data_type TEXT DEFAULT 'string',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, preference_key),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- User profile indexes
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_employee_id ON user_profiles(employee_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login_at);

-- Authentication indexes
CREATE INDEX idx_user_auth_password_changed ON user_authentication(password_changed_at);
CREATE INDEX idx_user_auth_failed_attempts ON user_authentication(failed_login_attempts);

-- Session indexes
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- RBAC indexes
CREATE INDEX idx_system_roles_org ON system_roles(organization_id);
CREATE INDEX idx_system_roles_level ON system_roles(level);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission_id);

-- Organization indexes
CREATE INDEX idx_departments_org ON departments(organization_id);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);
CREATE INDEX idx_job_positions_org ON job_positions(organization_id);
CREATE INDEX idx_job_positions_dept ON job_positions(department_id);
CREATE INDEX idx_workplace_locations_org ON workplace_locations(organization_id);
CREATE INDEX idx_employee_assignments_user ON employee_assignments(user_id);
CREATE INDEX idx_employee_assignments_dept ON employee_assignments(department_id);
CREATE INDEX idx_employee_assignments_location ON employee_assignments(workplace_location_id);

-- Attendance indexes
CREATE INDEX idx_work_schedules_org ON work_schedules(organization_id);
CREATE INDEX idx_user_work_schedules_user ON user_work_schedules(user_id);
CREATE INDEX idx_attendance_records_user ON attendance_records(user_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_attendance_records_user_date ON attendance_records(user_id, date);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_attendance ON time_entries(attendance_record_id);
CREATE INDEX idx_time_entries_timestamp ON time_entries(timestamp);

-- Request indexes
CREATE INDEX idx_request_categories_org ON request_categories(organization_id);
CREATE INDEX idx_user_requests_org ON user_requests(organization_id);
CREATE INDEX idx_user_requests_user ON user_requests(user_id);
CREATE INDEX idx_user_requests_category ON user_requests(category_id);
CREATE INDEX idx_user_requests_status ON user_requests(status);
CREATE INDEX idx_user_requests_dates ON user_requests(request_start_date, request_end_date);
CREATE INDEX idx_request_approvals_request ON request_approvals(request_id);
CREATE INDEX idx_request_approvals_approver ON request_approvals(approver_id);

-- Task indexes
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_collaborators_task ON task_collaborators(task_id);
CREATE INDEX idx_task_collaborators_user ON task_collaborators(user_id);
CREATE INDEX idx_task_activities_task ON task_activities(task_id);

-- Audit indexes
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);

-- Notification indexes
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);

-- System indexes
CREATE INDEX idx_system_settings_org ON system_settings(organization_id);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =====================================================

-- Sample organization
INSERT OR REPLACE INTO organizations (id, name, display_name, domain, settings) VALUES 
('org_tocotoco', 'tocotoco', 'TOCOTOCO', 'tocotoco.com', '{"theme": "blue", "locale": "vi_VN", "timezone": "Asia/Ho_Chi_Minh"}');

-- System roles
INSERT OR REPLACE INTO system_roles (id, organization_id, name, display_name, description, level, is_system_role) VALUES 
('role_super_admin', 'org_tocotoco', 'super_admin', 'Super Administrator', 'Full system access', 0, 1),
('role_admin', 'org_tocotoco', 'admin', 'Administrator', 'Organization administrator', 1, 1),
('role_manager', 'org_tocotoco', 'manager', 'Manager', 'Department/Store manager', 2, 1),
('role_supervisor', 'org_tocotoco', 'supervisor', 'Supervisor', 'Team supervisor', 3, 1),
('role_employee', 'org_tocotoco', 'employee', 'Employee', 'Regular employee', 4, 1);

-- System permissions
INSERT OR REPLACE INTO system_permissions (id, name, display_name, description, category, resource, action) VALUES 
-- User management
('perm_user_create', 'user.create', 'Create Users', 'Create new user accounts', 'user', 'user', 'create'),
('perm_user_read', 'user.read', 'View Users', 'View user profiles and information', 'user', 'user', 'read'),
('perm_user_update', 'user.update', 'Update Users', 'Update user profiles and information', 'user', 'user', 'update'),
('perm_user_delete', 'user.delete', 'Delete Users', 'Delete user accounts', 'user', 'user', 'delete'),
('perm_user_manage_roles', 'user.manage_roles', 'Manage User Roles', 'Assign/revoke user roles', 'user', 'user', 'manage_roles'),

-- System administration
('perm_system_admin', 'system.admin', 'System Administration', 'Full system administration access', 'system', 'system', 'admin'),
('perm_system_settings', 'system.settings', 'System Settings', 'Manage system configuration', 'system', 'settings', 'manage'),
('perm_system_audit', 'system.audit', 'System Audit', 'View system audit logs', 'system', 'audit', 'read'),

-- Attendance management
('perm_attendance_view_own', 'attendance.view_own', 'View Own Attendance', 'View personal attendance records', 'attendance', 'attendance', 'read_own'),
('perm_attendance_view_team', 'attendance.view_team', 'View Team Attendance', 'View team attendance records', 'attendance', 'attendance', 'read_team'),
('perm_attendance_view_all', 'attendance.view_all', 'View All Attendance', 'View all attendance records', 'attendance', 'attendance', 'read_all'),
('perm_attendance_manage', 'attendance.manage', 'Manage Attendance', 'Manage attendance records and schedules', 'attendance', 'attendance', 'manage'),

-- Task management
('perm_task_create', 'task.create', 'Create Tasks', 'Create new tasks', 'task', 'task', 'create'),
('perm_task_view_assigned', 'task.view_assigned', 'View Assigned Tasks', 'View assigned tasks', 'task', 'task', 'read_assigned'),
('perm_task_view_all', 'task.view_all', 'View All Tasks', 'View all tasks', 'task', 'task', 'read_all'),
('perm_task_manage', 'task.manage', 'Manage Tasks', 'Full task management access', 'task', 'task', 'manage'),

-- Request management
('perm_request_create', 'request.create', 'Create Requests', 'Create new requests', 'request', 'request', 'create'),
('perm_request_approve', 'request.approve', 'Approve Requests', 'Approve/reject requests', 'request', 'request', 'approve'),
('perm_request_manage', 'request.manage', 'Manage Requests', 'Full request management access', 'request', 'request', 'manage'),

-- Reporting
('perm_reports_view', 'reports.view', 'View Reports', 'View system reports', 'reports', 'reports', 'read'),
('perm_reports_create', 'reports.create', 'Create Reports', 'Create custom reports', 'reports', 'reports', 'create'),
('perm_reports_export', 'reports.export', 'Export Reports', 'Export report data', 'reports', 'reports', 'export');

-- Sample departments
INSERT OR REPLACE INTO departments (id, organization_id, name, display_name, description) VALUES 
('dept_admin', 'org_tocotoco', 'administration', 'Administration', 'Administrative department'),
('dept_operations', 'org_tocotoco', 'operations', 'Operations', 'Store operations'),
('dept_hr', 'org_tocotoco', 'human_resources', 'Human Resources', 'Human resources management'),
('dept_finance', 'org_tocotoco', 'finance', 'Finance', 'Financial management');

-- Sample job positions
INSERT OR REPLACE INTO job_positions (id, organization_id, department_id, title, description, job_level) VALUES 
('pos_ceo', 'org_tocotoco', 'dept_admin', 'Chief Executive Officer', 'Chief Executive Officer', 'Executive'),
('pos_admin', 'org_tocotoco', 'dept_admin', 'Administrator', 'System Administrator', 'Senior'),
('pos_store_manager', 'org_tocotoco', 'dept_operations', 'Store Manager', 'Store Manager', 'Manager'),
('pos_supervisor', 'org_tocotoco', 'dept_operations', 'Supervisor', 'Team Supervisor', 'Supervisor'),
('pos_employee', 'org_tocotoco', 'dept_operations', 'Employee', 'Store Employee', 'Staff'),
('pos_hr_manager', 'org_tocotoco', 'dept_hr', 'HR Manager', 'Human Resources Manager', 'Manager');

-- Default role permissions
INSERT OR REPLACE INTO role_permissions (role_id, permission_id, granted) VALUES 
-- Super Admin - All permissions
('role_super_admin', 'perm_system_admin', 1),
('role_super_admin', 'perm_system_settings', 1),
('role_super_admin', 'perm_system_audit', 1),
('role_super_admin', 'perm_user_create', 1),
('role_super_admin', 'perm_user_read', 1),
('role_super_admin', 'perm_user_update', 1),
('role_super_admin', 'perm_user_delete', 1),
('role_super_admin', 'perm_user_manage_roles', 1),
('role_super_admin', 'perm_attendance_view_all', 1),
('role_super_admin', 'perm_attendance_manage', 1),
('role_super_admin', 'perm_task_manage', 1),
('role_super_admin', 'perm_request_manage', 1),
('role_super_admin', 'perm_reports_create', 1),
('role_super_admin', 'perm_reports_export', 1),

-- Admin - Most permissions
('role_admin', 'perm_user_create', 1),
('role_admin', 'perm_user_read', 1),
('role_admin', 'perm_user_update', 1),
('role_admin', 'perm_user_manage_roles', 1),
('role_admin', 'perm_attendance_view_all', 1),
('role_admin', 'perm_attendance_manage', 1),
('role_admin', 'perm_task_manage', 1),
('role_admin', 'perm_request_manage', 1),
('role_admin', 'perm_reports_view', 1),
('role_admin', 'perm_reports_create', 1),

-- Manager - Team management
('role_manager', 'perm_user_read', 1),
('role_manager', 'perm_attendance_view_team', 1),
('role_manager', 'perm_task_create', 1),
('role_manager', 'perm_task_view_all', 1),
('role_manager', 'perm_request_approve', 1),
('role_manager', 'perm_reports_view', 1),

-- Supervisor - Limited management
('role_supervisor', 'perm_user_read', 1),
('role_supervisor', 'perm_attendance_view_team', 1),
('role_supervisor', 'perm_task_create', 1),
('role_supervisor', 'perm_task_view_assigned', 1),
('role_supervisor', 'perm_request_approve', 1),

-- Employee - Basic access
('role_employee', 'perm_attendance_view_own', 1),
('role_employee', 'perm_task_view_assigned', 1),
('role_employee', 'perm_request_create', 1);

-- Request categories
INSERT OR REPLACE INTO request_categories (id, organization_id, name, display_name, description, icon, color) VALUES 
('cat_leave', 'org_tocotoco', 'leave', 'Leave Request', 'Annual leave, sick leave, personal leave', 'calendar', '#22c55e'),
('cat_attendance', 'org_tocotoco', 'attendance', 'Attendance Request', 'Forgot check-in/out, attendance corrections', 'clock', '#3b82f6'),
('cat_schedule', 'org_tocotoco', 'schedule', 'Schedule Change', 'Shift change, schedule modification', 'refresh', '#f59e0b'),
('cat_overtime', 'org_tocotoco', 'overtime', 'Overtime Request', 'Overtime work authorization', 'plus', '#8b5cf6'),
('cat_other', 'org_tocotoco', 'other', 'Other Request', 'Other miscellaneous requests', 'help', '#6b7280');

-- Work schedules
INSERT OR REPLACE INTO work_schedules (id, organization_id, name, description, weekly_schedule) VALUES 
('schedule_standard', 'org_tocotoco', 'Standard Schedule', 'Standard 8-hour workday', 
 '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}}'),
('schedule_morning_shift', 'org_tocotoco', 'Morning Shift', 'Morning shift schedule', 
 '{"monday": {"start": "06:00", "end": "14:00"}, "tuesday": {"start": "06:00", "end": "14:00"}, "wednesday": {"start": "06:00", "end": "14:00"}, "thursday": {"start": "06:00", "end": "14:00"}, "friday": {"start": "06:00", "end": "14:00"}, "saturday": {"start": "06:00", "end": "14:00"}}'),
('schedule_evening_shift', 'org_tocotoco', 'Evening Shift', 'Evening shift schedule', 
 '{"monday": {"start": "14:00", "end": "22:00"}, "tuesday": {"start": "14:00", "end": "22:00"}, "wednesday": {"start": "14:00", "end": "22:00"}, "thursday": {"start": "14:00", "end": "22:00"}, "friday": {"start": "14:00", "end": "22:00"}, "saturday": {"start": "14:00", "end": "22:00"}}');

-- System settings
INSERT OR REPLACE INTO system_settings (organization_id, category, setting_key, setting_value, data_type, description) VALUES 
('org_tocotoco', 'attendance', 'gps_radius_meters', '50', 'integer', 'GPS verification radius in meters'),
('org_tocotoco', 'attendance', 'grace_period_minutes', '15', 'integer', 'Grace period for late arrivals'),
('org_tocotoco', 'attendance', 'overtime_threshold_hours', '8', 'integer', 'Daily hours before overtime calculation'),
('org_tocotoco', 'security', 'session_timeout_hours', '24', 'integer', 'User session timeout in hours'),
('org_tocotoco', 'security', 'max_failed_login_attempts', '5', 'integer', 'Maximum failed login attempts before lockout'),
('org_tocotoco', 'security', 'password_min_length', '8', 'integer', 'Minimum password length'),
('org_tocotoco', 'notifications', 'retention_days', '30', 'integer', 'Notification retention period in days'),
('org_tocotoco', 'system', 'default_locale', 'vi_VN', 'string', 'Default system locale'),
('org_tocotoco', 'system', 'default_timezone', 'Asia/Ho_Chi_Minh', 'string', 'Default system timezone');

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- To migrate from the old schema to this new schema:
-- 1. Export existing data from current tables
-- 2. Run this new schema creation
-- 3. Map and import data to new table structure
-- 4. Update application code to use new table structure
-- 5. Update API endpoints to match new schema

-- Key mapping for data migration:
-- employees -> user_profiles (with employee_assignments)
-- sessions -> user_sessions  
-- employees.password/salt -> user_authentication
-- permissions -> role_permissions + user_permissions
-- stores -> workplace_locations
-- attendance -> attendance_records + time_entries
-- timesheets -> attendance_records (consolidated)
-- tasks -> tasks (enhanced structure)
-- requests/attendance_requests -> user_requests
-- notifications -> notifications (enhanced)

-- =====================================================
-- END OF ENHANCED SCHEMA
-- =====================================================
