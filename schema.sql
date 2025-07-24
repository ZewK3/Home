-- HR Management System Database Schema
-- Compatible with Cloudflare D1

-- Employees table for storing employee data
CREATE TABLE IF NOT EXISTS employees (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phoneNumber TEXT,
    position TEXT DEFAULT 'NV',
    store TEXT,
    status TEXT DEFAULT 'Chờ duyệt',
    verificationCode TEXT,
    isVerified BOOLEAN DEFAULT 0,
    isApproved BOOLEAN DEFAULT 0,
    registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedBy TEXT,
    approvalDate DATETIME,
    lastLogin DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_store ON employees(store);
CREATE INDEX IF NOT EXISTS idx_employees_verification ON employees(verificationCode);

-- Activities table for logging system activities
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT,
    activity TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

CREATE INDEX IF NOT EXISTS idx_activities_employee ON activities(employeeId);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);

-- Sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
);

CREATE INDEX IF NOT EXISTS idx_sessions_employee ON sessions(employeeId);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expiresAt);

-- Insert sample admin user (optional - for testing)
INSERT OR IGNORE INTO employees (
    employeeId, 
    fullName, 
    email, 
    phoneNumber, 
    position, 
    store, 
    status, 
    isVerified, 
    isApproved,
    registrationDate
) VALUES (
    'ADMIN001',
    'Administrator',
    'admin@zewk.fun',
    '0123456789',
    'AD',
    'Trụ sở chính',
    'Đã duyệt',
    1,
    1,
    CURRENT_TIMESTAMP
);