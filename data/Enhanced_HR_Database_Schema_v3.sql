-- =====================================================
-- ENHANCED HR DATABASE SCHEMA V3.1 - PROFESSIONAL EDITION
-- =====================================================
-- Comprehensive enterprise-grade database structure optimized for
-- professional HR management systems with high performance and security
-- 
-- Version: 3.1.0 Professional
-- Created: January 2025
-- Author: HR Management System Development Team
-- 
-- Features:
-- ✓ Enterprise-grade table design with proper normalization
-- ✓ Advanced indexing strategy for optimal performance
-- ✓ Comprehensive audit trails and change tracking
-- ✓ Role-based access control (RBAC) system
-- ✓ Advanced security and data integrity constraints
-- ✓ Multi-store and department management
-- ✓ Comprehensive attendance and task management
-- ✓ Performance monitoring and analytics
-- ✓ Professional notifications and messaging system
-- ✓ Complete employee lifecycle management
-- =====================================================

-- Enable foreign key constraints and performance optimizations
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;

-- =====================================================
-- CORE SYSTEM CONFIGURATION TABLES
-- =====================================================

-- System configuration and settings management
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_system_setting BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance monitoring and metrics tracking
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type VARCHAR(50) NOT NULL, -- request, database, cache, error, business
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4),
    metric_unit VARCHAR(20), -- ms, count, percentage, bytes, currency
    entity_type VARCHAR(50), -- user, store, department, system
    entity_id VARCHAR(50),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    tags VARCHAR(255) -- comma-separated tags for filtering
);

-- Comprehensive API request logging for monitoring and analytics
CREATE TABLE IF NOT EXISTS api_request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id VARCHAR(50) NOT NULL UNIQUE,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    user_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_size INTEGER,
    response_status INTEGER,
    response_time_ms DECIMAL(8,2),
    response_size INTEGER,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System audit logs for compliance and security
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, LOGOUT
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    change_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORGANIZATION STRUCTURE TABLES
-- =====================================================

-- Companies and organizations management
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_code VARCHAR(20) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores and locations management
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storeId VARCHAR(50) NOT NULL UNIQUE,
    storeName VARCHAR(255) NOT NULL,
    company_id INTEGER NOT NULL DEFAULT 1,
    storeType VARCHAR(50) DEFAULT 'retail', -- retail, warehouse, office, headquarters
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id INTEGER,
    area_manager_id INTEGER,
    region VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    operating_hours JSON, -- Store operating schedule
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    opening_date DATE,
    closing_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id),
    FOREIGN KEY (area_manager_id) REFERENCES employees(id)
);

-- Departments and organizational units
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    departmentId VARCHAR(50) NOT NULL UNIQUE,
    departmentName VARCHAR(255) NOT NULL,
    company_id INTEGER NOT NULL DEFAULT 1,
    parent_department_id INTEGER,
    department_head_id INTEGER,
    description TEXT,
    cost_center VARCHAR(50),
    budget_allocation DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    FOREIGN KEY (department_head_id) REFERENCES employees(id)
);

-- =====================================================
-- EMPLOYEE MANAGEMENT TABLES
-- =====================================================

-- Comprehensive employees table with professional fields
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- SHA-256 hashed password
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    preferred_name VARCHAR(100),
    phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    personal_email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10), -- male, female, other, prefer_not_to_say
    nationality VARCHAR(100),
    national_id VARCHAR(50),
    passport_number VARCHAR(50),
    marital_status VARCHAR(20), -- single, married, divorced, widowed
    
    -- Work Information
    department_id INTEGER,
    storeId VARCHAR(50),
    position VARCHAR(100),
    job_title VARCHAR(150),
    employment_type VARCHAR(30) DEFAULT 'full_time', -- full_time, part_time, contract, intern
    employment_status VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated, suspended
    manager_id INTEGER,
    direct_reports_count INTEGER DEFAULT 0,
    hire_date DATE,
    probation_end_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    
    -- Compensation
    salary DECIMAL(15,2),
    salary_currency VARCHAR(3) DEFAULT 'VND',
    hourly_rate DECIMAL(8,2),
    salary_grade VARCHAR(20),
    next_review_date DATE,
    
    -- Contact & Emergency Information
    address TEXT,
    address_city VARCHAR(100),
    address_province VARCHAR(100),
    address_postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- System & Security
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until DATETIME,
    must_change_password BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    employee_badge_number VARCHAR(50),
    access_card_number VARCHAR(50),
    
    -- Professional Development
    education_level VARCHAR(50), -- high_school, bachelor, master, phd, other
    certifications TEXT, -- JSON array of certifications
    skills TEXT, -- JSON array of skills
    languages TEXT, -- JSON array of languages with proficiency
    
    -- HR Information
    notes TEXT,
    performance_rating VARCHAR(20), -- excellent, good, satisfactory, needs_improvement
    attendance_score DECIMAL(5,2),
    disciplinary_actions INTEGER DEFAULT 0,
    commendations INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id),
    CHECK (email LIKE '%@%'),
    CHECK (employment_status IN ('active', 'inactive', 'terminated', 'suspended')),
    CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
    CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    CHECK (performance_rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement') OR performance_rating IS NULL)
);

-- Employee change history for comprehensive audit trail
CREATE TABLE IF NOT EXISTS employee_change_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(50), -- field_update, promotion, transfer, salary_change, status_change
    changed_by INTEGER,
    change_reason TEXT,
    effective_date DATE,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- =====================================================
-- ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
-- =====================================================

-- System roles with hierarchical structure
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    role_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_management_role BOOLEAN DEFAULT FALSE,
    role_level INTEGER DEFAULT 1, -- Higher number = higher authority
    parent_role_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_role_id) REFERENCES roles(id)
);

-- Granular permissions system
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    permission_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- user, attendance, task, admin, finance, hr
    resource VARCHAR(100), -- What resource this permission applies to
    action VARCHAR(50), -- create, read, update, delete, approve, etc.
    is_system_permission BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Role-permission mapping with conditions
CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    conditions JSON, -- Additional conditions for permission
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES employees(id),
    UNIQUE(role_id, permission_id)
);

-- User role assignments with time-based controls
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    granted_by INTEGER,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    effective_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_primary_role BOOLEAN DEFAULT FALSE,
    
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
    granted BOOLEAN DEFAULT TRUE, -- TRUE = grant, FALSE = deny
    granted_by INTEGER,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    reason TEXT,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES employees(id),
    UNIQUE(employee_id, permission_id)
);

-- =====================================================
-- SESSION AND SECURITY MANAGEMENT
-- =====================================================

-- Enhanced session management with security features
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    employee_id INTEGER NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    is_mobile BOOLEAN DEFAULT FALSE,
    location_info JSON, -- Country, city, etc. if available
    logout_time DATETIME,
    logout_reason VARCHAR(50), -- user_logout, session_timeout, forced_logout, security_logout
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Session activity logs for security monitoring
CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- login, logout, page_view, api_call, security_event
    activity_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Security events and alerts
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type VARCHAR(50) NOT NULL, -- failed_login, suspicious_activity, data_breach, unauthorized_access
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    employee_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    event_details JSON,
    resolution_status VARCHAR(20) DEFAULT 'open', -- open, investigating, resolved, false_positive
    resolved_by INTEGER,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (resolved_by) REFERENCES employees(id)
);

-- =====================================================
-- ATTENDANCE MANAGEMENT SYSTEM
-- =====================================================

-- Comprehensive attendance tracking
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL,
    employee_id INTEGER NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    date DATE NOT NULL,
    total_hours DECIMAL(5,2),
    regular_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    break_duration_minutes INTEGER DEFAULT 0,
    
    -- Location tracking
    check_in_location JSON, -- {lat, lng, address}
    check_out_location JSON,
    work_location VARCHAR(100), -- office, remote, field, client_site
    
    -- Status and approval
    status VARCHAR(20) DEFAULT 'present', -- present, absent, late, early_departure, sick_leave, vacation
    approval_status VARCHAR(20) DEFAULT 'auto_approved', -- auto_approved, pending, approved, rejected
    approved_by INTEGER,
    approved_at DATETIME,
    
    -- Additional information
    late_minutes INTEGER DEFAULT 0,
    early_departure_minutes INTEGER DEFAULT 0,
    notes TEXT,
    attendance_type VARCHAR(30) DEFAULT 'regular', -- regular, makeup, overtime, holiday
    
    -- System fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    UNIQUE(employee_id, date)
);

-- Attendance break tracking
CREATE TABLE IF NOT EXISTS attendance_breaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendance_id INTEGER NOT NULL,
    break_start DATETIME NOT NULL,
    break_end DATETIME,
    break_type VARCHAR(30) DEFAULT 'regular', -- regular, lunch, personal, emergency
    duration_minutes INTEGER,
    location JSON,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
);

-- Attendance adjustment requests and approvals
CREATE TABLE IF NOT EXISTS attendance_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendance_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL, -- time_correction, status_change, add_hours, deduct_hours
    
    -- Original values
    original_check_in DATETIME,
    original_check_out DATETIME,
    original_status VARCHAR(20),
    
    -- Requested values
    requested_check_in DATETIME,
    requested_check_out DATETIME,
    requested_status VARCHAR(20),
    
    -- Request information
    reason TEXT NOT NULL,
    supporting_documents JSON, -- URLs to uploaded documents
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Approval workflow
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    review_comments TEXT,
    
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id)
);

-- Leave management system
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- annual, sick, maternity, paternity, personal, emergency, unpaid
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1),
    reason TEXT,
    emergency_contact VARCHAR(255),
    
    -- Approval workflow
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    approved_by INTEGER,
    approved_at DATETIME,
    rejection_reason TEXT,
    
    -- HR processing
    hr_processed_by INTEGER,
    hr_processed_at DATETIME,
    hr_comments TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    FOREIGN KEY (hr_processed_by) REFERENCES employees(id)
);

-- =====================================================
-- TASK AND PROJECT MANAGEMENT
-- =====================================================

-- Comprehensive task management system
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Assignment and ownership
    created_by INTEGER NOT NULL,
    assigned_to INTEGER,
    assignedTo VARCHAR(50), -- Backward compatibility
    department_id INTEGER,
    store_id VARCHAR(50),
    
    -- Task categorization
    task_type VARCHAR(50) DEFAULT 'general', -- general, project, maintenance, training, meeting
    category VARCHAR(100),
    tags JSON, -- Array of tags for better organization
    
    -- Priority and scheduling
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent, critical
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    
    -- Progress and status
    status VARCHAR(30) DEFAULT 'pending', -- pending, in_progress, completed, cancelled, on_hold
    progress_percentage INTEGER DEFAULT 0,
    completion_quality VARCHAR(20), -- excellent, good, satisfactory, needs_improvement
    
    -- Dependencies and relationships
    parent_task_id INTEGER,
    project_id INTEGER,
    dependencies JSON, -- Array of task IDs this task depends on
    
    -- Collaboration features
    collaborators JSON, -- Array of employee IDs who can collaborate
    attachments JSON, -- Array of file URLs
    external_links JSON, -- Array of external resources
    
    -- Review and approval
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by INTEGER,
    approved_at DATETIME,
    
    -- System fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES employees(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- Task assignment tracking for history
CREATE TABLE IF NOT EXISTS task_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    assigned_from INTEGER,
    assigned_to INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,
    assignment_reason TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unassigned_at DATETIME,
    unassignment_reason TEXT,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_from) REFERENCES employees(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id),
    FOREIGN KEY (assigned_by) REFERENCES employees(id)
);

-- Task comments and communication
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    parent_comment_id INTEGER, -- For threaded comments
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(30) DEFAULT 'comment', -- comment, status_update, file_attachment, mention
    attachments JSON, -- Array of file URLs
    mentions JSON, -- Array of mentioned employee IDs
    is_internal BOOLEAN DEFAULT FALSE, -- Internal comments not visible to assignee
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
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
    activity_description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- =====================================================
-- NOTIFICATIONS AND MESSAGING SYSTEM
-- =====================================================

-- Comprehensive notification system
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    sender_id INTEGER,
    
    -- Message content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- task, attendance, leave, system, announcement, reminder
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Categorization and targeting
    category VARCHAR(100),
    tags JSON,
    related_entity_type VARCHAR(50), -- task, attendance, leave_request, employee
    related_entity_id VARCHAR(50),
    
    -- Delivery and tracking
    delivery_method VARCHAR(30) DEFAULT 'in_app', -- in_app, email, sms, push
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, read
    sent_at DATETIME,
    read_at DATETIME,
    
    -- Scheduling and expiration
    scheduled_for DATETIME,
    expires_at DATETIME,
    
    -- System fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipient_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES employees(id)
);

-- Chat and messaging system
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id VARCHAR(50) NOT NULL UNIQUE,
    conversation_id VARCHAR(50) NOT NULL,
    sender_id INTEGER,
    sender_type VARCHAR(20) DEFAULT 'employee', -- employee, customer, system, bot
    
    -- Message content
    message_text TEXT,
    message_type VARCHAR(30) DEFAULT 'text', -- text, image, file, system, quick_reply
    attachments JSON,
    
    -- Customer information (for customer support)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, failed
    replied_to_message_id VARCHAR(50),
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    location_info JSON,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES employees(id)
);

-- Customer support conversations
CREATE TABLE IF NOT EXISTS support_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Customer information
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_ip VARCHAR(45),
    
    -- Conversation details
    subject VARCHAR(255),
    category VARCHAR(100) DEFAULT 'general', -- general, technical, billing, complaint, suggestion
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(30) DEFAULT 'open', -- open, in_progress, waiting_customer, resolved, closed
    
    -- Assignment
    assigned_to INTEGER,
    assigned_at DATETIME,
    first_response_at DATETIME,
    resolved_at DATETIME,
    
    -- Metrics
    response_time_minutes INTEGER,
    resolution_time_hours DECIMAL(8,2),
    customer_satisfaction_rating INTEGER, -- 1-5 scale
    customer_feedback TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- =====================================================
-- SHIFT AND SCHEDULE MANAGEMENT
-- =====================================================

-- Work shift definitions
CREATE TABLE IF NOT EXISTS work_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_name VARCHAR(100) NOT NULL,
    shift_code VARCHAR(20) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 60,
    is_overnight BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employee shift assignments
CREATE TABLE IF NOT EXISTS shift_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    assignment_date DATE NOT NULL,
    
    -- Override default shift times if needed
    actual_start_time TIME,
    actual_end_time TIME,
    
    -- Status and tracking
    status VARCHAR(30) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show, modified
    completion_status VARCHAR(20), -- on_time, late, early, partial
    notes TEXT,
    
    -- Assignment management
    assigned_by INTEGER,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified_by INTEGER,
    last_modified_at DATETIME,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES work_shifts(id),
    FOREIGN KEY (assigned_by) REFERENCES employees(id),
    FOREIGN KEY (last_modified_by) REFERENCES employees(id),
    UNIQUE(employee_id, assignment_date)
);

-- =====================================================
-- USER REGISTRATION AND ONBOARDING
-- =====================================================

-- Pending employee registrations
CREATE TABLE IF NOT EXISTS pending_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    storeId VARCHAR(50),
    phone VARCHAR(20),
    
    -- Registration process
    verification_code VARCHAR(20),
    verification_sent_at DATETIME,
    verification_expires_at DATETIME,
    verification_attempts INTEGER DEFAULT 0,
    
    -- Approval workflow
    status VARCHAR(30) DEFAULT 'pending', -- pending, verified, approved, rejected, expired
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    approved_by INTEGER,
    rejection_reason TEXT,
    
    -- Additional data for onboarding
    requested_start_date DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    CHECK (status IN ('pending', 'verified', 'approved', 'rejected', 'expired'))
);

-- Employee onboarding checklist
CREATE TABLE IF NOT EXISTS onboarding_checklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    checklist_item VARCHAR(255) NOT NULL,
    item_category VARCHAR(50), -- documentation, training, equipment, access, orientation
    is_required BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by INTEGER,
    completed_at DATETIME,
    due_date DATE,
    notes TEXT,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES employees(id)
);

-- =====================================================
-- PERFORMANCE AND ANALYTICS TABLES
-- =====================================================

-- Employee performance reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    
    -- Review scores (1-5 scale)
    overall_rating DECIMAL(3,2),
    technical_skills_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    teamwork_rating DECIMAL(3,2),
    leadership_rating DECIMAL(3,2),
    punctuality_rating DECIMAL(3,2),
    
    -- Detailed feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,
    
    -- Process tracking
    status VARCHAR(30) DEFAULT 'draft', -- draft, submitted, reviewed, approved, signed
    submitted_at DATETIME,
    approved_by INTEGER,
    approved_at DATETIME,
    employee_acknowledged BOOLEAN DEFAULT FALSE,
    employee_acknowledged_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- Business analytics and KPIs
CREATE TABLE IF NOT EXISTS business_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    store_id VARCHAR(50),
    department_id INTEGER,
    
    -- Attendance metrics
    total_employees INTEGER,
    present_employees INTEGER,
    absent_employees INTEGER,
    late_employees INTEGER,
    attendance_rate DECIMAL(5,2),
    
    -- Performance metrics
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    average_task_completion_time DECIMAL(8,2),
    overdue_tasks INTEGER DEFAULT 0,
    
    -- HR metrics
    new_hires INTEGER DEFAULT 0,
    terminations INTEGER DEFAULT 0,
    employee_satisfaction_score DECIMAL(3,2),
    
    -- Financial metrics (if applicable)
    labor_cost DECIMAL(15,2),
    productivity_score DECIMAL(5,2),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- =====================================================
-- PROFESSIONAL INDEXING STRATEGY
-- =====================================================

-- Employee table indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_employees_employeeId ON employees(employeeId);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department_store ON employees(department_id, storeId);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_date_status ON attendance(date, status);
CREATE INDEX IF NOT EXISTS idx_attendance_approval ON attendance(approval_status, approved_by);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);

-- Session and security indexes
CREATE INDEX IF NOT EXISTS idx_sessions_employee ON sessions(employee_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(notification_type, priority);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_date ON performance_metrics(metric_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint_date ON api_request_logs(endpoint, created_at DESC);

-- Audit and compliance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_changes_employee ON employee_change_history(employee_id, created_at DESC);

-- Chat and support indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_assigned ON support_conversations(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_support_status_priority ON support_conversations(status, priority);

-- =====================================================
-- INITIAL SYSTEM DATA
-- =====================================================

-- Insert default company
INSERT OR IGNORE INTO companies (company_code, company_name, legal_name, is_active) 
VALUES ('HRMS001', 'HR Management System Company', 'HR Management System Co., Ltd.', TRUE);

-- Insert default roles with proper hierarchy
INSERT OR IGNORE INTO roles (role_name, role_code, description, is_system_role, role_level) VALUES
('Super Admin', 'SUPER_ADMIN', 'Full system access and control', TRUE, 10),
('Admin', 'ADMIN', 'Administrative access to most system functions', TRUE, 9),
('HR Manager', 'HR_MANAGER', 'Human resources management functions', FALSE, 8),
('Store Manager', 'STORE_MANAGER', 'Store-level management and operations', FALSE, 7),
('Area Manager', 'AREA_MANAGER', 'Multi-store area management', FALSE, 7),
('Department Head', 'DEPT_HEAD', 'Department leadership and management', FALSE, 6),
('Team Leader', 'TEAM_LEADER', 'Team leadership and coordination', FALSE, 5),
('Senior Employee', 'SENIOR_EMP', 'Experienced employee with mentor responsibilities', FALSE, 4),
('Employee', 'EMPLOYEE', 'Standard employee access', FALSE, 3),
('Intern', 'INTERN', 'Intern or trainee access', FALSE, 2),
('Customer Support', 'CUST_SUPPORT', 'Customer service and support functions', FALSE, 4);

-- Insert comprehensive permissions
INSERT OR IGNORE INTO permissions (permission_name, permission_code, description, category, resource, action) VALUES
-- User management permissions
('user.create', 'USER_CREATE', 'Create new users', 'user', 'employees', 'create'),
('user.read', 'USER_READ', 'View user information', 'user', 'employees', 'read'),
('user.update', 'USER_UPDATE', 'Update user information', 'user', 'employees', 'update'),
('user.delete', 'USER_DELETE', 'Delete users', 'user', 'employees', 'delete'),
('user.manage_roles', 'USER_MANAGE_ROLES', 'Manage user roles and permissions', 'user', 'user_roles', 'manage'),

-- Attendance management permissions
('attendance.check_in', 'ATT_CHECK_IN', 'Check in to work', 'attendance', 'attendance', 'create'),
('attendance.check_out', 'ATT_CHECK_OUT', 'Check out from work', 'attendance', 'attendance', 'update'),
('attendance.view_own', 'ATT_VIEW_OWN', 'View own attendance records', 'attendance', 'attendance', 'read'),
('attendance.view_all', 'ATT_VIEW_ALL', 'View all attendance records', 'attendance', 'attendance', 'read'),
('attendance.approve', 'ATT_APPROVE', 'Approve attendance records', 'attendance', 'attendance', 'approve'),
('attendance.modify', 'ATT_MODIFY', 'Modify attendance records', 'attendance', 'attendance', 'update'),

-- Task management permissions
('task.create', 'TASK_CREATE', 'Create new tasks', 'task', 'tasks', 'create'),
('task.read', 'TASK_READ', 'View tasks', 'task', 'tasks', 'read'),
('task.update', 'TASK_UPDATE', 'Update tasks', 'task', 'tasks', 'update'),
('task.delete', 'TASK_DELETE', 'Delete tasks', 'task', 'tasks', 'delete'),
('task.assign', 'TASK_ASSIGN', 'Assign tasks to others', 'task', 'task_assignments', 'create'),
('task.manage_all', 'TASK_MANAGE_ALL', 'Manage all tasks in system', 'task', 'tasks', 'manage'),

-- HR management permissions
('hr.view_reports', 'HR_VIEW_REPORTS', 'View HR reports and analytics', 'hr', 'business_analytics', 'read'),
('hr.manage_leave', 'HR_MANAGE_LEAVE', 'Manage leave requests', 'hr', 'leave_requests', 'manage'),
('hr.performance_review', 'HR_PERF_REVIEW', 'Conduct performance reviews', 'hr', 'performance_reviews', 'manage'),
('hr.onboarding', 'HR_ONBOARDING', 'Manage employee onboarding', 'hr', 'onboarding_checklist', 'manage'),

-- Customer support permissions
('support.chat', 'SUPPORT_CHAT', 'Handle customer chat support', 'support', 'chat_messages', 'manage'),
('support.view_conversations', 'SUPPORT_VIEW_CONV', 'View support conversations', 'support', 'support_conversations', 'read'),
('support.assign_tickets', 'SUPPORT_ASSIGN', 'Assign support tickets', 'support', 'support_conversations', 'assign'),

-- System administration permissions
('admin.system_config', 'ADMIN_CONFIG', 'Manage system configuration', 'admin', 'system_config', 'manage'),
('admin.view_logs', 'ADMIN_LOGS', 'View system logs', 'admin', 'audit_logs', 'read'),
('admin.manage_permissions', 'ADMIN_PERMS', 'Manage roles and permissions', 'admin', 'roles', 'manage'),
('admin.performance_monitoring', 'ADMIN_PERF_MON', 'Access performance monitoring', 'admin', 'performance_metrics', 'read');

-- Assign permissions to roles (Super Admin gets all permissions)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'SUPER_ADMIN';

-- Admin role permissions (most permissions except super admin functions)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'ADMIN' AND p.category IN ('user', 'attendance', 'task', 'hr', 'admin');

-- Employee role basic permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'EMPLOYEE' AND p.permission_code IN (
    'ATT_CHECK_IN', 'ATT_CHECK_OUT', 'ATT_VIEW_OWN',
    'TASK_READ', 'TASK_UPDATE', 'USER_READ'
);

-- Customer Support role permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'CUST_SUPPORT' AND p.category = 'support';

-- Insert default work shifts
INSERT OR IGNORE INTO work_shifts (shift_name, shift_code, start_time, end_time, break_duration_minutes, description) VALUES
('Morning Shift', 'MORNING', '08:00', '17:00', 60, 'Standard morning shift 8AM-5PM'),
('Afternoon Shift', 'AFTERNOON', '13:00', '22:00', 60, 'Afternoon shift 1PM-10PM'),
('Night Shift', 'NIGHT', '22:00', '07:00', 60, 'Overnight shift 10PM-7AM'),
('Flexible Shift', 'FLEXIBLE', '09:00', '18:00', 60, 'Flexible working hours');

-- Insert default system configuration
INSERT OR IGNORE INTO system_config (config_key, config_value, config_type, description, category) VALUES
('system.name', 'Professional HR Management System', 'string', 'System display name', 'general'),
('system.version', '3.1.0', 'string', 'Current system version', 'general'),
('timezone.default', 'Asia/Ho_Chi_Minh', 'string', 'Default system timezone', 'general'),
('session.timeout_minutes', '480', 'number', 'Session timeout in minutes (8 hours)', 'security'),
('password.min_length', '8', 'number', 'Minimum password length', 'security'),
('attendance.auto_checkout_hours', '12', 'number', 'Auto checkout after hours', 'attendance'),
('notification.email_enabled', 'true', 'boolean', 'Enable email notifications', 'notifications'),
('chat.support_enabled', 'true', 'boolean', 'Enable customer chat support', 'support');

-- =====================================================
-- PROFESSIONAL TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Employee audit trigger
CREATE TRIGGER IF NOT EXISTS employee_audit_trigger
AFTER UPDATE ON employees
FOR EACH ROW
WHEN OLD.name != NEW.name OR OLD.email != NEW.email OR OLD.department_id != NEW.department_id OR OLD.employment_status != NEW.employment_status
BEGIN
    INSERT INTO employee_change_history (employee_id, field_name, old_value, new_value, changed_by, change_type)
    VALUES (NEW.id, 'profile_update', 
        json_object('name', OLD.name, 'email', OLD.email, 'department_id', OLD.department_id, 'employment_status', OLD.employment_status),
        json_object('name', NEW.name, 'email', NEW.email, 'department_id', NEW.department_id, 'employment_status', NEW.employment_status),
        NULL, 'field_update');
    
    UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Task status change trigger
CREATE TRIGGER IF NOT EXISTS task_status_trigger
AFTER UPDATE ON tasks
FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
    VALUES (
        'tasks',
        NEW.id,
        'STATUS_CHANGE',
        json_object('status', OLD.status, 'progress_percentage', OLD.progress_percentage),
        json_object('status', NEW.status, 'progress_percentage', NEW.progress_percentage)
    );
    
    -- Auto-set completion date when task is completed
    UPDATE tasks 
    SET completion_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND NEW.status = 'completed' AND OLD.status != 'completed';
END;

-- Attendance validation trigger
CREATE TRIGGER IF NOT EXISTS attendance_validation_trigger
BEFORE INSERT ON attendance
FOR EACH ROW
WHEN NEW.check_out_time IS NOT NULL AND NEW.check_in_time IS NOT NULL
BEGIN
    UPDATE attendance 
    SET total_hours = CAST((julianday(NEW.check_out_time) - julianday(NEW.check_in_time)) * 24 AS DECIMAL(5,2))
    WHERE id = NEW.id;
END;

-- Session cleanup trigger
CREATE TRIGGER IF NOT EXISTS session_cleanup_trigger
AFTER UPDATE ON sessions
FOR EACH ROW
WHEN NEW.logout_time IS NOT NULL AND OLD.logout_time IS NULL
BEGIN
    UPDATE sessions SET is_active = FALSE WHERE id = NEW.id;
END;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Insert completion marker
INSERT OR IGNORE INTO system_config (config_key, config_value, description, category)
VALUES ('schema.version', '3.1.0', 'Database schema version for tracking', 'system');

PRAGMA optimize;