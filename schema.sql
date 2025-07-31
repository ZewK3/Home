-- HR Management System Database Schema

-- Drop old messaging table (no longer needed since messaging system removed)
DROP TABLE IF EXISTS messages;

-- Drop and recreate stores table with MayCha store codes and regions
DROP TABLE IF EXISTS stores;

-- Enhanced stores table with area/region for AM management
CREATE TABLE IF NOT EXISTS stores (
    storeId TEXT PRIMARY KEY,
    storeName TEXT NOT NULL,
    region TEXT NOT NULL, -- Area/region for AM management (1, 2, 3, 4)
    address TEXT,
    managerEmployeeId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert MayCha store data with proper regions
INSERT OR IGNORE INTO stores (storeId, storeName, region, address) VALUES 
-- Khu vực 1 (TP.HCM)
('MC001', 'MayCha Quận 1', '1', '123 Đường Nguyễn Du, Quận 1, TP.HCM'),
('MC002', 'MayCha Quận 3', '1', '456 Đường Võ Văn Tần, Quận 3, TP.HCM'),
('MC003', 'MayCha Bình Thạnh', '1', '789 Đường Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM'),
('MC004', 'MayCha Tân Bình', '1', '321 Đường Cộng Hòa, Tân Bình, TP.HCM'),
('MC005', 'MayCha Thủ Đức', '1', '654 Đường Võ Văn Ngân, Thủ Đức, TP.HCM'),

-- Khu vực 2 (Miền Bắc)
('MC006', 'MayCha Hà Nội - Ba Đình', '2', '987 Đường Hoàng Diệu, Ba Đình, Hà Nội'),
('MC007', 'MayCha Hà Nội - Đống Đa', '2', '147 Đường Láng, Đống Đa, Hà Nội'),
('MC008', 'MayCha Hà Nội - Cầu Giấy', '2', '258 Đường Xuân Thủy, Cầu Giấy, Hà Nội'),
('MC009', 'MayCha Hải Phòng', '2', '369 Đường Lê Thánh Tông, Ngô Quyền, Hải Phòng'),
('MC010', 'MayCha Thái Nguyên', '2', '741 Đường Hoàng Văn Thụ, Thái Nguyên'),

-- Khu vực 3 (Miền Trung)
('MC011', 'MayCha Đà Nẵng - Hải Châu', '3', '852 Đường Trần Phú, Hải Châu, Đà Nẵng'),
('MC012', 'MayCha Đà Nẵng - Thanh Khê', '3', '963 Đường Nguyễn Lương Bằng, Thanh Khê, Đà Nẵng'),
('MC013', 'MayCha Huế', '3', '159 Đường Lê Lợi, Thành phố Huế, Thừa Thiên Huế'),
('MC014', 'MayCha Quảng Nam', '3', '753 Đường Phan Chu Trinh, Hội An, Quảng Nam'),
('MC015', 'MayCha Nha Trang', '3', '486 Đường Trần Phú, Nha Trang, Khánh Hòa'),

-- Khu vực 4 (Miền Nam)
('MC016', 'MayCha Cần Thơ', '4', '357 Đường 3 Tháng 2, Ninh Kiều, Cần Thơ'),
('MC017', 'MayCha An Giang', '4', '951 Đường Tôn Đức Thắng, Long Xuyên, An Giang'),
('MC018', 'MayCha Vũng Tàu', '4', '624 Đường Hạ Long, Vũng Tàu, Bà Rịa - Vũng Tàu'),
('MC019', 'MayCha Đồng Tháp', '4', '735 Đường Nguyễn Huệ, Cao Lãnh, Đồng Tháp'),
('MC020', 'MayCha Tiền Giang', '4', '148 Đường Đinh Bộ Lĩnh, Mỹ Tho, Tiền Giang');

-- History tracking table for permission changes and approval actions
CREATE TABLE IF NOT EXISTS history_logs (
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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_history_logs_target ON history_logs(target_employee_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_action_by ON history_logs(action_by_employee_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_type ON history_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_history_logs_created ON history_logs(created_at);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    employeeId TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    fullName TEXT NOT NULL,
    storeName TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT 'NV',
    joinDate DATE NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Shift requests table for handling shift change requests
CREATE TABLE IF NOT EXISTS shift_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    storeId TEXT NOT NULL,
    requestType TEXT NOT NULL, -- 'shift_change', 'schedule_modification'
    currentShift TEXT,
    requestedShift TEXT,
    requestDate DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approvedBy TEXT,
    approverNote TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId),
    FOREIGN KEY (storeId) REFERENCES stores(storeId),
    FOREIGN KEY (approvedBy) REFERENCES employees(employeeId)
);

-- Attendance requests table for handling attendance-related requests
CREATE TABLE IF NOT EXISTS attendance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    requestType TEXT NOT NULL, -- 'forgot_checkin', 'forgot_checkout', 'leave_request', 'sick_leave'
    requestDate DATE NOT NULL,
    requestTime TIME,
    reason TEXT NOT NULL,
    supportingDocument TEXT, -- file path or URL
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approvedBy TEXT,
    approverNote TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId),
    FOREIGN KEY (approvedBy) REFERENCES employees(employeeId)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shift_requests_employee ON shift_requests(employeeId);
CREATE INDEX IF NOT EXISTS idx_shift_requests_store ON shift_requests(storeId);
CREATE INDEX IF NOT EXISTS idx_shift_requests_status ON shift_requests(status);
CREATE INDEX IF NOT EXISTS idx_attendance_requests_employee ON attendance_requests(employeeId);
CREATE INDEX IF NOT EXISTS idx_attendance_requests_status ON attendance_requests(status);