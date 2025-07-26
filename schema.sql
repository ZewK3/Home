-- HR Management System Database Schema

-- Drop old messaging table (no longer needed since messaging system removed)
DROP TABLE IF EXISTS messages;

-- Enhanced stores table with area/region for AM management
CREATE TABLE IF NOT EXISTS stores (
    storeId TEXT PRIMARY KEY,
    storeName TEXT NOT NULL,
    region TEXT NOT NULL, -- Area/region for AM management
    address TEXT,
    managerEmployeeId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default store data if not exists
INSERT OR IGNORE INTO stores (storeId, storeName, region, address) VALUES 
('STORE001', 'Cửa hàng Quận 1', 'TP.HCM', 'Quận 1, TP.HCM'),
('STORE002', 'Cửa hàng Quận 3', 'TP.HCM', 'Quận 3, TP.HCM'),
('STORE003', 'Cửa hàng Hà Nội', 'Miền Bắc', 'Quận Ba Đình, Hà Nội'),
('STORE004', 'Cửa hàng Đà Nẵng', 'Miền Trung', 'Quận Hải Châu, Đà Nẵng');

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