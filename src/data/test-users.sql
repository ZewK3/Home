-- =====================================================
-- TEST USERS WITH AD PERMISSIONS FOR HR MANAGEMENT SYSTEM
-- =====================================================
-- This file creates comprehensive test users with different roles and permissions
-- Based on the main Tabbel.sql structure
-- Created for testing purposes
-- =====================================================

-- Sample employees with different roles for comprehensive testing
INSERT OR IGNORE INTO employees (employeeId, fullName, storeName, position, joinDate, phone, email, password, salt) VALUES
-- System Administrator (Full Access)
('ADMIN001', 'Nguyễn System Admin', 'HQ - Headquarters', 'AD', '2024-01-01', '0901000001', 'admin@hrms.com', '$2a$10$example.hash.admin', 'salt_admin_001'),

-- Regional Area Managers (AM Role)
('AM001', 'Trần Quản Lý Vùng 1', 'Khu vực 1 - TP.HCM', 'AM', '2024-01-01', '0901000002', 'am1@hrms.com', '$2a$10$example.hash.am1', 'salt_am_001'),
('AM002', 'Lê Quản Lý Vùng 2', 'Khu vực 2 - Miền Bắc', 'AM', '2024-01-01', '0901000003', 'am2@hrms.com', '$2a$10$example.hash.am2', 'salt_am_002'),
('AM003', 'Phạm Quản Lý Vùng 3', 'Khu vực 3 - Miền Trung', 'AM', '2024-01-01', '0901000004', 'am3@hrms.com', '$2a$10$example.hash.am3', 'salt_am_003'),
('AM004', 'Võ Quản Lý Vùng 4', 'Khu vực 4 - Miền Nam', 'AM', '2024-01-01', '0901000005', 'am4@hrms.com', '$2a$10$example.hash.am4', 'salt_am_004'),

-- Store Managers (QL Role)
('QL001', 'Hoàng Quản Lý Shop', 'MayCha Quận 1', 'QL', '2024-01-01', '0901000006', 'ql1@hrms.com', '$2a$10$example.hash.ql1', 'salt_ql_001'),
('QL002', 'Đặng Quản Lý Bitexco', 'MayCha Bitexco', 'QL', '2024-01-01', '0901000007', 'ql2@hrms.com', '$2a$10$example.hash.ql2', 'salt_ql_002'),
('QL003', 'Bùi Quản Lý Landmark', 'MayCha Landmark 81', 'QL', '2024-01-01', '0901000008', 'ql3@hrms.com', '$2a$10$example.hash.ql3', 'salt_ql_003'),

-- Regular Employees (NV Role)
('NV001', 'Nguyễn Nhân Viên 1', 'MayCha Quận 1', 'NV', '2024-01-01', '0901000009', 'nv1@hrms.com', '$2a$10$example.hash.nv1', 'salt_nv_001'),
('NV002', 'Trần Nhân Viên 2', 'MayCha Bitexco', 'NV', '2024-01-01', '0901000010', 'nv2@hrms.com', '$2a$10$example.hash.nv2', 'salt_nv_002'),
('NV003', 'Lê Nhân Viên 3', 'MayCha Landmark 81', 'NV', '2024-01-01', '0901000011', 'nv3@hrms.com', '$2a$10$example.hash.nv3', 'salt_nv_003'),
('NV004', 'Phạm Nhân Viên Hà Nội', 'MayCha Hà Nội - Ba Đình', 'NV', '2024-01-01', '0901000012', 'nv4@hrms.com', '$2a$10$example.hash.nv4', 'salt_nv_004'),
('NV005', 'Võ Nhân Viên Đà Nẵng', 'MayCha Đà Nẵng - Hải Châu', 'NV', '2024-01-01', '0901000013', 'nv5@hrms.com', '$2a$10$example.hash.nv5', 'salt_nv_005'),
('NV006', 'Hoàng Nhân Viên Cần Thơ', 'MayCha Cần Thơ', 'NV', '2024-01-01', '0901000014', 'nv6@hrms.com', '$2a$10$example.hash.nv6', 'salt_nv_006');

-- =====================================================
-- COMPREHENSIVE PERMISSIONS SETUP
-- =====================================================

-- Admin Permissions (Full Access)
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) VALUES
('ADMIN001', 'admin', 1, datetime('now')),
('ADMIN001', 'schedule', 1, datetime('now')),
('ADMIN001', 'tasks', 1, datetime('now')),
('ADMIN001', 'rewards', 1, datetime('now')),
('ADMIN001', 'finance', 1, datetime('now')),
('ADMIN001', 'attendance', 1, datetime('now')),
('ADMIN001', 'reports', 1, datetime('now')),
('ADMIN001', 'user_management', 1, datetime('now')),
('ADMIN001', 'system_settings', 1, datetime('now')),
('ADMIN001', 'data_export', 1, datetime('now'));

-- Area Manager Permissions (Regional Management)
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) VALUES
('AM001', 'schedule', 1, datetime('now')),
('AM001', 'tasks', 1, datetime('now')),
('AM001', 'attendance', 1, datetime('now')),
('AM001', 'reports', 1, datetime('now')),
('AM001', 'user_management', 1, datetime('now')),
('AM002', 'schedule', 1, datetime('now')),
('AM002', 'tasks', 1, datetime('now')),
('AM002', 'attendance', 1, datetime('now')),
('AM002', 'reports', 1, datetime('now')),
('AM002', 'user_management', 1, datetime('now')),
('AM003', 'schedule', 1, datetime('now')),
('AM003', 'tasks', 1, datetime('now')),
('AM003', 'attendance', 1, datetime('now')),
('AM003', 'reports', 1, datetime('now')),
('AM003', 'user_management', 1, datetime('now')),
('AM004', 'schedule', 1, datetime('now')),
('AM004', 'tasks', 1, datetime('now')),
('AM004', 'attendance', 1, datetime('now')),
('AM004', 'reports', 1, datetime('now')),
('AM004', 'user_management', 1, datetime('now'));

-- Store Manager Permissions (Store Level Management)
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) VALUES
('QL001', 'schedule', 1, datetime('now')),
('QL001', 'tasks', 1, datetime('now')),
('QL001', 'attendance', 1, datetime('now')),
('QL001', 'reports', 1, datetime('now')),
('QL002', 'schedule', 1, datetime('now')),
('QL002', 'tasks', 1, datetime('now')),
('QL002', 'attendance', 1, datetime('now')),
('QL002', 'reports', 1, datetime('now')),
('QL003', 'schedule', 1, datetime('now')),
('QL003', 'tasks', 1, datetime('now')),
('QL003', 'attendance', 1, datetime('now')),
('QL003', 'reports', 1, datetime('now'));

-- Employee Permissions (Basic Access)
INSERT OR IGNORE INTO permissions (employeeId, permission, granted, createdAt) VALUES
('NV001', 'attendance', 1, datetime('now')),
('NV001', 'tasks', 1, datetime('now')),
('NV002', 'attendance', 1, datetime('now')),
('NV002', 'tasks', 1, datetime('now')),
('NV003', 'attendance', 1, datetime('now')),
('NV003', 'tasks', 1, datetime('now')),
('NV004', 'attendance', 1, datetime('now')),
('NV004', 'tasks', 1, datetime('now')),
('NV005', 'attendance', 1, datetime('now')),
('NV005', 'tasks', 1, datetime('now')),
('NV006', 'attendance', 1, datetime('now')),
('NV006', 'tasks', 1, datetime('now'));

-- =====================================================
-- SAMPLE WORK SCHEDULES FOR TESTING
-- =====================================================

INSERT OR IGNORE INTO workSchedules (employeeId, fullName, storeName, T2, T3, T4, T5, T6, T7, CN) VALUES
('ADMIN001', 'Nguyễn System Admin', 'HQ - Headquarters', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', 'OFF', 'OFF'),
('AM001', 'Trần Quản Lý Vùng 1', 'Khu vực 1 - TP.HCM', '09:00-18:00', '09:00-18:00', '09:00-18:00', '09:00-18:00', '09:00-18:00', '09:00-15:00', 'OFF'),
('QL001', 'Hoàng Quản Lý Shop', 'MayCha Quận 1', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-14:00', 'OFF'),
('NV001', 'Nguyễn Nhân Viên 1', 'MayCha Quận 1', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', 'OFF', 'OFF'),
('NV002', 'Trần Nhân Viên 2', 'MayCha Bitexco', '13:00-22:00', '13:00-22:00', '13:00-22:00', '13:00-22:00', '13:00-22:00', 'OFF', 'OFF'),
('NV003', 'Lê Nhân Viên 3', 'MayCha Landmark 81', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', 'OFF', 'OFF');

-- =====================================================
-- SAMPLE SHIFT ASSIGNMENTS FOR CURRENT MONTH
-- =====================================================

INSERT OR IGNORE INTO shift_assignments (employeeId, date, shiftName, startTime, endTime, storeId, status) VALUES
-- Admin assignments
('ADMIN001', '2025-01-30', 'Ca hành chính', '08:00', '17:00', 'HQ001', 'confirmed'),
('ADMIN001', '2025-01-31', 'Ca hành chính', '08:00', '17:00', 'HQ001', 'confirmed'),
('ADMIN001', '2025-02-01', 'Ca hành chính', '08:00', '17:00', 'HQ001', 'assigned'),

-- Store manager assignments
('QL001', '2025-01-30', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('QL001', '2025-01-31', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('QL001', '2025-02-01', 'Ca sáng', '08:00', '17:00', 'MC001', 'assigned'),

-- Employee assignments
('NV001', '2025-01-30', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('NV001', '2025-01-31', 'Ca sáng', '08:00', '17:00', 'MC001', 'confirmed'),
('NV002', '2025-01-30', 'Ca chiều', '13:00', '22:00', 'MC002', 'confirmed'),
('NV002', '2025-01-31', 'Ca chiều', '13:00', '22:00', 'MC002', 'confirmed'),
('NV003', '2025-01-30', 'Ca sáng', '08:00', '17:00', 'MC003', 'confirmed'),
('NV003', '2025-01-31', 'Ca sáng', '08:00', '17:00', 'MC003', 'confirmed');

-- =====================================================
-- SAMPLE TASKS FOR TESTING TASK MANAGEMENT
-- =====================================================

INSERT OR IGNORE INTO tasks (id, employeeId, employeeName, position, type, content, status, createdAt, taskId, title, description, priority, deadline, createdBy) VALUES
('TASK_TEST_001', 'ADMIN001', 'Nguyễn System Admin', 'AD', 'system', 'Kiểm tra hệ thống chấm công GPS toàn bộ cửa hàng', 'active', datetime('now'), 'TASK_TEST_001', 'Kiểm tra hệ thống GPS', 'Đảm bảo tất cả cửa hàng có hệ thống chấm công GPS hoạt động chính xác', 'High', date('now', '+7 days'), 'ADMIN001'),

('TASK_TEST_002', 'QL001', 'Hoàng Quản Lý Shop', 'QL', 'management', 'Tổ chức họp team weekly và báo cáo doanh số', 'active', datetime('now'), 'TASK_TEST_002', 'Họp team weekly', 'Tổ chức cuộc họp tuần và tổng kết doanh số cửa hàng', 'Medium', date('now', '+3 days'), 'AM001'),

('TASK_TEST_003', 'NV001', 'Nguyễn Nhân Viên 1', 'NV', 'daily', 'Kiểm tra và cập nhật inventory hàng hóa', 'active', datetime('now'), 'TASK_TEST_003', 'Cập nhật inventory', 'Kiểm tra số lượng hàng hóa và cập nhật vào hệ thống', 'Low', date('now', '+1 day'), 'QL001');

-- =====================================================
-- SAMPLE TASK ASSIGNMENTS FOR COLLABORATION
-- =====================================================

INSERT OR IGNORE INTO task_assignments (taskId, employeeId, role, assignedAt, status) VALUES
('TASK_TEST_001', 'ADMIN001', 'assigner', datetime('now'), 'active'),
('TASK_TEST_001', 'AM001', 'participant', datetime('now'), 'active'),
('TASK_TEST_001', 'AM002', 'participant', datetime('now'), 'active'),
('TASK_TEST_001', 'QL001', 'supporter', datetime('now'), 'active'),

('TASK_TEST_002', 'AM001', 'assigner', datetime('now'), 'active'),
('TASK_TEST_002', 'QL001', 'participant', datetime('now'), 'active'),
('TASK_TEST_002', 'NV001', 'participant', datetime('now'), 'active'),

('TASK_TEST_003', 'QL001', 'assigner', datetime('now'), 'active'),
('TASK_TEST_003', 'NV001', 'participant', datetime('now'), 'active');

-- =====================================================
-- SAMPLE ATTENDANCE REQUESTS FOR TESTING
-- =====================================================

INSERT OR IGNORE INTO attendance_requests (requestId, employeeId, type, requestDate, targetDate, reason, status, createdAt) VALUES
('REQ_ATT_001', 'NV001', 'forgot_checkin', date('now'), date('now', '-1 day'), 'Quên chấm công vào sáng do tắc đường', 'pending', datetime('now')),
('REQ_ATT_002', 'NV002', 'shift_change', date('now'), date('now', '+2 days'), 'Xin đổi ca do có việc gia đình', 'pending', datetime('now')),
('REQ_ATT_003', 'NV003', 'leave', date('now'), date('now', '+5 days'), 'Xin nghỉ phép năm', 'approved', datetime('now', '-1 day'));

-- =====================================================
-- SAMPLE NOTIFICATIONS FOR USERS
-- =====================================================

INSERT OR IGNORE INTO notifications (employeeId, title, message, type, relatedId, relatedType, createdAt) VALUES
('ADMIN001', 'Hệ thống khởi động', 'Hệ thống HR Management đã được khởi động thành công với tài khoản test đầy đủ', 'success', NULL, 'system', datetime('now')),
('AM001', 'Nhiệm vụ mới', 'Bạn được giao nhiệm vụ kiểm tra hệ thống GPS', 'info', 'TASK_TEST_001', 'task', datetime('now')),
('QL001', 'Yêu cầu chờ duyệt', 'Có yêu cầu đổi ca cần được xem xét', 'warning', 'REQ_ATT_002', 'request', datetime('now')),
('NV001', 'Đơn từ đã gửi', 'Đơn xin quên chấm công đã được gửi thành công', 'info', 'REQ_ATT_001', 'request', datetime('now'));

-- =====================================================
-- DEFAULT LOGIN CREDENTIALS FOR TESTING
-- =====================================================

/*
SAMPLE LOGIN CREDENTIALS (All use password: "password123")
Note: In production, these would be properly hashed

1. System Administrator:
   - ID: ADMIN001
   - Role: AD (Full Access)
   - Password: password123

2. Area Managers:
   - ID: AM001, AM002, AM003, AM004  
   - Role: AM (Regional Management)
   - Password: password123

3. Store Managers:
   - ID: QL001, QL002, QL003
   - Role: QL (Store Management) 
   - Password: password123

4. Employees:
   - ID: NV001, NV002, NV003, NV004, NV005, NV006
   - Role: NV (Basic Access)
   - Password: password123

Each user has appropriate permissions based on their role level.
*/

-- =====================================================
-- TESTING VALIDATION QUERIES
-- =====================================================

/*
-- Verify users were created:
SELECT employeeId, fullName, position, storeName FROM employees WHERE employeeId LIKE '%001';

-- Check permissions:
SELECT e.employeeId, e.fullName, e.position, p.permission 
FROM employees e 
LEFT JOIN permissions p ON e.employeeId = p.employeeId 
WHERE e.employeeId IN ('ADMIN001', 'AM001', 'QL001', 'NV001')
ORDER BY e.position, p.permission;

-- View sample tasks:
SELECT taskId, title, priority, status, employeeName FROM tasks WHERE taskId LIKE 'TASK_TEST_%';

-- Check attendance requests:
SELECT requestId, employeeId, type, reason, status FROM attendance_requests WHERE requestId LIKE 'REQ_ATT_%';
*/