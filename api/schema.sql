-- HR Management System Database Schema for Cloudflare D1

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    employeeId TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    joinDate TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    lastAccess TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Roles and user role mapping
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    employeeId TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (employeeId, role_id),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO roles (name) VALUES ('AD'),('QL'),('AM'),('NV');

-- Registration queue for pending approvals
CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    position TEXT DEFAULT 'NV',
    joinDate TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'Wait',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification for registration
CREATE TABLE IF NOT EXISTS email_verification (
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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiresAt TIMESTAMP NOT NULL
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    storeId TEXT PRIMARY KEY,
    storeName TEXT NOT NULL,
    region TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table for work assignments and requests
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    taskId TEXT,
    employeeId TEXT NOT NULL,
    employeeName TEXT,
    position TEXT,
    type TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending',
    note TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- History logs for audit trail
CREATE TABLE IF NOT EXISTS history_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    target_employee_id TEXT,
    action_by_employee_id TEXT,
    action_by_name TEXT,
    old_value TEXT,
    new_value TEXT,
    field_name TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    permission TEXT NOT NULL,
    granted BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    checkIn TIMESTAMP,
    checkOut TIMESTAMP,
    location TEXT,
    status TEXT DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Attendance requests table
CREATE TABLE IF NOT EXISTS attendance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId TEXT UNIQUE NOT NULL,
    employeeId TEXT NOT NULL,
    type TEXT NOT NULL,
    requestDate TIMESTAMP,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    targetDate TEXT,
    targetTime TEXT,
    currentShift TEXT,
    requestedShift TEXT,
    leaveType TEXT,
    startDate TEXT,
    endDate TEXT,
    approvedBy TEXT,
    note TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Shift assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    storeId TEXT NOT NULL,
    date TEXT NOT NULL,
    shiftName TEXT,
    startTime TEXT,
    endTime TEXT,
    shiftType TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Shift requests table
CREATE TABLE IF NOT EXISTS shift_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    storeId TEXT NOT NULL,
    requestDate TEXT NOT NULL,
    shiftType TEXT NOT NULL,
    requestedBy TEXT,
    requestedAt TIMESTAMP,
    status TEXT DEFAULT 'pending',
    approvedBy TEXT,
    approvedAt TIMESTAMP,
    approvalNote TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Task assignments table for work management
CREATE TABLE IF NOT EXISTS task_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId TEXT NOT NULL,
    employeeId TEXT NOT NULL,
    role TEXT NOT NULL, -- 'participant', 'supporter', 'assigner'
    assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commentId TEXT UNIQUE NOT NULL,
    taskId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id),
    FOREIGN KEY (authorId) REFERENCES employees(employeeId)
);

-- Comment replies table
CREATE TABLE IF NOT EXISTS comment_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    replyId TEXT UNIQUE NOT NULL,
    commentId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commentId) REFERENCES task_comments(commentId),
    FOREIGN KEY (authorId) REFERENCES employees(employeeId)
);

-- HR settings table
CREATE TABLE IF NOT EXISTS hr_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settingKey TEXT UNIQUE NOT NULL,
    settingValue TEXT NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default HR settings
INSERT OR IGNORE INTO hr_settings (settingKey, settingValue, description) VALUES 
('attendance_radius_meters', '50', 'Allowed radius in meters for GPS attendance'),
('session_duration_hours', '8', 'Session duration in hours'),
('email_verification_minutes', '15', 'Email verification code expiry in minutes');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_employee ON sessions(employeeId);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_phone ON employees(phone);
CREATE INDEX IF NOT EXISTS idx_tasks_employee ON tasks(employeeId);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employeeId, checkIn);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_date ON shift_assignments(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_user_roles_employee ON user_roles(employeeId);
