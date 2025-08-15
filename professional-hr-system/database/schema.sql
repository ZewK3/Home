-- Professional HR Management System Database Schema
-- Designed for Cloudflare D2 SQL Database
-- Enhanced security, performance, and data integrity

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS security_logs;
DROP TABLE IF EXISTS file_attachments;
DROP TABLE IF EXISTS attendance_requests;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

-- Organizations table (for multi-tenant support)
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    logo_url TEXT,
    settings TEXT, -- JSON configuration
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Roles table (hierarchical role system)
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1, -- Role hierarchy level
    permissions TEXT, -- JSON array of permissions
    organization_id TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Permissions table (granular permission system)
CREATE TABLE permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_system_permission BOOLEAN DEFAULT false,
    created_at TEXT NOT NULL
);

-- Users table (comprehensive user management)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    date_of_birth TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Contact Information
    phone TEXT,
    mobile_phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Vietnam',
    
    -- Employment Information
    employee_id TEXT UNIQUE,
    department TEXT,
    position TEXT,
    job_title TEXT,
    manager_id TEXT,
    hire_date TEXT,
    employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
    salary DECIMAL(15,2),
    currency TEXT DEFAULT 'VND',
    
    -- System Information
    role TEXT NOT NULL DEFAULT 'NV',
    permissions TEXT, -- JSON array of additional permissions
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    locale TEXT DEFAULT 'vi_VN',
    
    -- Account Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    email_verification_expires TEXT,
    
    -- Security
    password_reset_token TEXT,
    password_reset_expires TEXT,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TEXT,
    
    -- Metadata
    organization_id TEXT,
    last_login TEXT,
    last_login_ip TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- User roles junction table (many-to-many relationship)
CREATE TABLE user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at TEXT NOT NULL,
    expires_at TEXT,
    is_active BOOLEAN DEFAULT true,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- User sessions table (device and session management)
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    device_info TEXT, -- JSON with device/browser info
    ip_address TEXT,
    location TEXT, -- Geolocation info
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_accessed_at TEXT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attendance requests table (enhanced leave/attendance management)
CREATE TABLE attendance_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('leave', 'overtime', 'remote_work', 'late_arrival', 'early_departure')),
    
    -- Request Details
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    total_hours DECIMAL(5,2),
    
    -- Leave Specific
    leave_type TEXT CHECK (leave_type IN ('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency')),
    is_paid BOOLEAN DEFAULT true,
    
    -- Approval Workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'withdrawn')),
    submitted_at TEXT NOT NULL,
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_comments TEXT,
    
    -- Attachments
    supporting_documents TEXT, -- JSON array of file URLs
    
    -- Metadata
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- File attachments table (R2 storage integration)
CREATE TABLE file_attachments (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- For integrity verification
    
    -- R2 Storage Information
    r2_bucket TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    r2_url TEXT,
    
    -- Metadata
    uploaded_by TEXT NOT NULL,
    related_entity_type TEXT, -- 'user', 'attendance_request', etc.
    related_entity_id TEXT,
    is_public BOOLEAN DEFAULT false,
    upload_ip TEXT,
    
    -- Security
    virus_scan_status TEXT DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
    access_permissions TEXT, -- JSON array of permissions
    
    created_at TEXT NOT NULL,
    expires_at TEXT, -- For temporary files
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Security logs table (audit trail and security monitoring)
CREATE TABLE security_logs (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Event Details
    resource_type TEXT, -- 'user', 'file', 'system', etc.
    resource_id TEXT,
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'login', etc.
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'warning')),
    
    -- Context Information
    details TEXT, -- JSON with additional event details
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Geolocation and Device
    location TEXT, -- JSON with location data
    device_fingerprint TEXT,
    
    timestamp TEXT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES user_sessions(id)
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager ON users(manager_id);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX idx_attendance_user_id ON attendance_requests(user_id);
CREATE INDEX idx_attendance_status ON attendance_requests(status);
CREATE INDEX idx_attendance_type ON attendance_requests(request_type);
CREATE INDEX idx_attendance_dates ON attendance_requests(start_date, end_date);

CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX idx_security_logs_risk_level ON security_logs(risk_level);

CREATE INDEX idx_file_attachments_entity ON file_attachments(related_entity_type, related_entity_id);
CREATE INDEX idx_file_attachments_uploaded_by ON file_attachments(uploaded_by);

-- Insert default system data
INSERT INTO organizations (id, name, domain, status, created_at, updated_at) VALUES 
('org_default', 'Default Organization', 'company.com', 'active', datetime('now'), datetime('now'));

-- Insert default roles
INSERT INTO roles (id, name, display_name, description, level, permissions, is_system_role, created_at, updated_at) VALUES 
('role_admin', 'AD', 'Administrator', 'System administrator with full access', 100, '["*"]', true, datetime('now'), datetime('now')),
('role_manager', 'Manager', 'Manager', 'Department manager with team management access', 50, '["user.read", "user.update", "attendance.approve", "reports.view"]', true, datetime('now'), datetime('now')),
('role_hr', 'HR', 'Human Resources', 'HR staff with employee management access', 40, '["user.read", "user.create", "attendance.read", "reports.view"]', true, datetime('now'), datetime('now')),
('role_employee', 'NV', 'Employee', 'Standard employee with basic access', 10, '["profile.read", "profile.update", "attendance.create"]', true, datetime('now'), datetime('now'));

-- Insert default permissions
INSERT INTO permissions (id, name, display_name, description, category, is_system_permission, created_at) VALUES 
('perm_user_create', 'user.create', 'Create Users', 'Create new user accounts', 'User Management', true, datetime('now')),
('perm_user_read', 'user.read', 'View Users', 'View user information', 'User Management', true, datetime('now')),
('perm_user_update', 'user.update', 'Update Users', 'Modify user information', 'User Management', true, datetime('now')),
('perm_user_delete', 'user.delete', 'Delete Users', 'Delete user accounts', 'User Management', true, datetime('now')),
('perm_attendance_create', 'attendance.create', 'Submit Attendance Requests', 'Create attendance/leave requests', 'Attendance', true, datetime('now')),
('perm_attendance_read', 'attendance.read', 'View Attendance', 'View attendance records', 'Attendance', true, datetime('now')),
('perm_attendance_approve', 'attendance.approve', 'Approve Attendance', 'Approve/reject attendance requests', 'Attendance', true, datetime('now')),
('perm_reports_view', 'reports.view', 'View Reports', 'Access system reports', 'Reports', true, datetime('now')),
('perm_profile_read', 'profile.read', 'View Profile', 'View own profile', 'Profile', true, datetime('now')),
('perm_profile_update', 'profile.update', 'Update Profile', 'Update own profile', 'Profile', true, datetime('now'));

-- Insert default admin user (password: Admin@123)
INSERT INTO users (
    id, email, password_hash, first_name, last_name, employee_id, 
    role, status, email_verified, organization_id, created_at, updated_at
) VALUES (
    'user_admin_default',
    'admin@company.com',
    'QWRtaW5AMTIz', -- Base64 encoded for demo - use proper hashing in production
    'System',
    'Administrator',
    'ADMIN001',
    'AD',
    'active',
    true,
    'org_default',
    datetime('now'),
    datetime('now')
);

-- Add admin to admin role
INSERT INTO user_roles (id, user_id, role_id, assigned_by, assigned_at) VALUES 
('ur_admin_default', 'user_admin_default', 'role_admin', 'user_admin_default', datetime('now'));

-- Views for easier data access
CREATE VIEW v_user_details AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.employee_id,
    u.department,
    u.position,
    u.role,
    u.status,
    u.last_login,
    manager.first_name || ' ' || manager.last_name AS manager_name,
    o.name AS organization_name
FROM users u
LEFT JOIN users manager ON u.manager_id = manager.id
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.status != 'deleted';

CREATE VIEW v_attendance_summary AS
SELECT 
    ar.id,
    ar.user_id,
    u.first_name || ' ' || u.last_name AS user_name,
    u.employee_id,
    ar.request_type,
    ar.title,
    ar.start_date,
    ar.end_date,
    ar.status,
    ar.submitted_at,
    reviewer.first_name || ' ' || reviewer.last_name AS reviewer_name,
    ar.reviewed_at
FROM attendance_requests ar
JOIN users u ON ar.user_id = u.id
LEFT JOIN users reviewer ON ar.reviewed_by = reviewer.id;

-- Triggers for automatic timestamp updates
CREATE TRIGGER tr_users_updated_at 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER tr_organizations_updated_at 
AFTER UPDATE ON organizations
BEGIN
    UPDATE organizations SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER tr_attendance_requests_updated_at 
AFTER UPDATE ON attendance_requests
BEGIN
    UPDATE attendance_requests SET updated_at = datetime('now') WHERE id = NEW.id;
END;