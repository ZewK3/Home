-- =====================================================
-- ENHANCED HR DATABASE SAMPLE DATA v3.0
-- =====================================================
-- Comprehensive sample data for Enhanced_HR_Database_Schema_v3.sql
-- Includes realistic data for all major tables with proper relationships
-- Created: January 2025
-- Compatible with: Enhanced Database Schema v3.0
-- Features:
-- ✓ Complete organizational structure
-- ✓ Sample employees with different roles
-- ✓ Realistic attendance data
-- ✓ Task management examples
-- ✓ Shift scheduling samples
-- ✓ Notification examples
-- ✓ Audit trail data
-- =====================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =====================================================
-- STORES AND ORGANIZATIONAL DATA
-- =====================================================

-- Sample stores/locations
INSERT OR IGNORE INTO stores (storeId, name, address, phone, email, region, timezone, business_hours, gps_latitude, gps_longitude, is_active) VALUES
('HQ001', 'Trụ sở chính', '123 Nguyễn Huệ, Quận 1, TP.HCM', '028-1234-5678', 'hq@hrms.com', 'TP.HCM', 'Asia/Ho_Chi_Minh', '{"mon":"08:00-17:00","tue":"08:00-17:00","wed":"08:00-17:00","thu":"08:00-17:00","fri":"08:00-17:00","sat":"08:00-12:00","sun":"closed"}', 10.7769, 106.7009, TRUE),
('MC001', 'MayCha Quận 1', '456 Lê Lợi, Quận 1, TP.HCM', '028-2345-6789', 'q1@maycha.com', 'TP.HCM', 'Asia/Ho_Chi_Minh', '{"mon":"08:00-22:00","tue":"08:00-22:00","wed":"08:00-22:00","thu":"08:00-22:00","fri":"08:00-22:00","sat":"08:00-22:00","sun":"08:00-22:00"}', 10.7747, 106.6990, TRUE),
('MC002', 'MayCha Bitexco', 'Tầng 2, Bitexco Financial Tower', '028-3456-7890', 'bitexco@maycha.com', 'TP.HCM', 'Asia/Ho_Chi_Minh', '{"mon":"09:00-21:00","tue":"09:00-21:00","wed":"09:00-21:00","thu":"09:00-21:00","fri":"09:00-21:00","sat":"09:00-21:00","sun":"09:00-21:00"}', 10.7719, 106.7046, TRUE),
('MC003', 'MayCha Landmark 81', 'Tầng B1, Landmark 81, Bình Thạnh', '028-4567-8901', 'landmark@maycha.com', 'TP.HCM', 'Asia/Ho_Chi_Minh', '{"mon":"10:00-22:00","tue":"10:00-22:00","wed":"10:00-22:00","thu":"10:00-22:00","fri":"10:00-22:00","sat":"10:00-22:00","sun":"10:00-22:00"}', 10.7954, 106.7218, TRUE),
('MC004', 'MayCha Hà Nội - Ba Đình', '789 Hoàng Diệu, Ba Đình, Hà Nội', '024-5678-9012', 'hanoi@maycha.com', 'Miền Bắc', 'Asia/Ho_Chi_Minh', '{"mon":"08:00-21:00","tue":"08:00-21:00","wed":"08:00-21:00","thu":"08:00-21:00","fri":"08:00-21:00","sat":"08:00-21:00","sun":"08:00-21:00"}', 21.0245, 105.8412, TRUE),
('MC005', 'MayCha Đà Nẵng - Hải Châu', '321 Trần Phú, Hải Châu, Đà Nẵng', '0236-6789-0123', 'danang@maycha.com', 'Miền Trung', 'Asia/Ho_Chi_Minh', '{"mon":"08:00-21:00","tue":"08:00-21:00","wed":"08:00-21:00","thu":"08:00-21:00","fri":"08:00-21:00","sat":"08:00-21:00","sun":"08:00-21:00"}', 16.0544, 108.2022, TRUE),
('MC006', 'MayCha Cần Thơ', '654 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ', '0292-7890-1234', 'cantho@maycha.com', 'Miền Nam', 'Asia/Ho_Chi_Minh', '{"mon":"08:00-21:00","tue":"08:00-21:00","wed":"08:00-21:00","thu":"08:00-21:00","fri":"08:00-21:00","sat":"08:00-21:00","sun":"08:00-21:00"}', 10.0452, 105.7469, TRUE);

-- Sample departments
INSERT OR IGNORE INTO departments (name, description, is_active) VALUES
('Quản trị hệ thống', 'Bộ phận quản trị và vận hành hệ thống', TRUE),
('Nhân sự', 'Bộ phận quản lý nhân sự và tuyển dụng', TRUE),
('Kinh doanh', 'Bộ phận kinh doanh và bán hàng', TRUE),
('Kỹ thuật', 'Bộ phận kỹ thuật và công nghệ thông tin', TRUE),
('Tài chính', 'Bộ phận tài chính và kế toán', TRUE),
('Marketing', 'Bộ phận tiếp thị và truyền thông', TRUE);

-- =====================================================
-- EMPLOYEE DATA WITH PROPER RELATIONSHIPS
-- =====================================================

-- Sample employees with comprehensive information
INSERT OR IGNORE INTO employees (employeeId, email, password, salt, name, first_name, last_name, phone, department, position, storeId, hire_date, salary, employment_status, is_active, emergency_contact_name, emergency_contact_phone, address) VALUES
-- System Administrator
('ADMIN001', 'admin@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_admin_001', 'Nguyễn Văn Admin', 'Nguyễn Văn', 'Admin', '0901000001', 'Quản trị hệ thống', 'AD', 'HQ001', '2024-01-01', 25000000.00, 'active', TRUE, 'Nguyễn Thị Lan', '0987654321', '123 Lê Duẩn, Quận 1, TP.HCM'),

-- Area Managers  
('AM001', 'am.hcm@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_am_001', 'Trần Thị Quản Lý HCM', 'Trần Thị', 'Quản Lý', '0901000002', 'Kinh doanh', 'AM', 'MC001', '2024-01-01', 20000000.00, 'active', TRUE, 'Trần Văn Hùng', '0987654322', '456 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'),
('AM002', 'am.hanoi@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_am_002', 'Lê Văn Quản Lý Miền Bắc', 'Lê Văn', 'Quản Lý', '0901000003', 'Kinh doanh', 'AM', 'MC004', '2024-01-01', 18000000.00, 'active', TRUE, 'Lê Thị Mai', '0987654323', '789 Điện Biên Phủ, Ba Đình, Hà Nội'),
('AM003', 'am.danang@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_am_003', 'Phạm Thị Quản Lý Miền Trung', 'Phạm Thị', 'Quản Lý', '0901000004', 'Kinh doanh', 'AM', 'MC005', '2024-01-01', 17000000.00, 'active', TRUE, 'Phạm Văn Đức', '0987654324', '321 Lê Duẩn, Hải Châu, Đà Nẵng'),
('AM004', 'am.cantho@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_am_004', 'Võ Văn Quản Lý Miền Nam', 'Võ Văn', 'Quản Lý', '0901000005', 'Kinh doanh', 'AM', 'MC006', '2024-01-01', 17000000.00, 'active', TRUE, 'Võ Thị Hương', '0987654325', '654 Trần Hưng Đạo, Ninh Kiều, Cần Thơ'),

-- Store Managers
('QL001', 'ql.q1@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_ql_001', 'Hoàng Văn Quản Lý Q1', 'Hoàng Văn', 'Quản Lý', '0901000006', 'Kinh doanh', 'QL', 'MC001', '2024-01-01', 15000000.00, 'active', TRUE, 'Hoàng Thị Linh', '0987654326', '456 Lê Lợi, Quận 1, TP.HCM'),
('QL002', 'ql.bitexco@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_ql_002', 'Đặng Thị Quản Lý Bitexco', 'Đặng Thị', 'Quản Lý', '0901000007', 'Kinh doanh', 'QL', 'MC002', '2024-01-01', 15000000.00, 'active', TRUE, 'Đặng Văn Thắng', '0987654327', 'Bitexco Financial Tower, Quận 1, TP.HCM'),
('QL003', 'ql.landmark@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_ql_003', 'Bùi Văn Quản Lý Landmark', 'Bùi Văn', 'Quản Lý', '0901000008', 'Kinh doanh', 'QL', 'MC003', '2024-01-01', 15000000.00, 'active', TRUE, 'Bùi Thị Nga', '0987654328', 'Landmark 81, Bình Thạnh, TP.HCM'),
('QL004', 'ql.hanoi@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_ql_004', 'Nguyễn Thị Quản Lý Hà Nội', 'Nguyễn Thị', 'Quản Lý', '0901000009', 'Kinh doanh', 'QL', 'MC004', '2024-01-01', 14000000.00, 'active', TRUE, 'Nguyễn Văn Minh', '0987654329', '789 Hoàng Diệu, Ba Đình, Hà Nội'),

-- Regular Employees
('NV001', 'nv001@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_nv_001', 'Nguyễn Thị Nhân Viên 1', 'Nguyễn Thị', 'Nhân Viên', '0901000010', 'Kinh doanh', 'NV', 'MC001', '2024-01-15', 8000000.00, 'active', TRUE, 'Nguyễn Văn Phúc', '0987654330', '123 Pasteur, Quận 1, TP.HCM'),
('NV002', 'nv002@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_nv_002', 'Trần Văn Nhân Viên 2', 'Trần Văn', 'Nhân Viên', '0901000011', 'Kinh doanh', 'NV', 'MC002', '2024-01-20', 8000000.00, 'active', TRUE, 'Trần Thị Hoa', '0987654331', '456 Đồng Khởi, Quận 1, TP.HCM'),
('NV003', 'nv003@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_nv_003', 'Lê Thị Nhân Viên 3', 'Lê Thị', 'Nhân Viên', '0901000012', 'Kinh doanh', 'NV', 'MC003', '2024-02-01', 8000000.00, 'active', TRUE, 'Lê Văn Hòa', '0987654332', '789 Nguyễn Huệ, Bình Thạnh, TP.HCM'),
('NV004', 'nv004@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_nv_004', 'Phạm Văn Nhân Viên Hà Nội', 'Phạm Văn', 'Nhân Viên', '0901000013', 'Kinh doanh', 'NV', 'MC004', '2024-02-10', 7500000.00, 'active', TRUE, 'Phạm Thị Lan', '0987654333', '321 Lý Thường Kiệt, Ba Đình, Hà Nội'),
('NV005', 'nv005@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_nv_005', 'Võ Thị Nhân Viên Đà Nẵng', 'Võ Thị', 'Nhân Viên', '0901000014', 'Kinh doanh', 'NV', 'MC005', '2024-02-15', 7500000.00, 'active', TRUE, 'Võ Văn Khang', '0987654334', '654 Nguyễn Văn Linh, Hải Châu, Đà Nẵng'),
('NV006', 'nv006@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_nv_006', 'Hoàng Văn Nhân Viên Cần Thơ', 'Hoàng Văn', 'Nhân Viên', '0901000015', 'Kinh doanh', 'NV', 'MC006', '2024-02-20', 7500000.00, 'active', TRUE, 'Hoàng Thị Thu', '0987654335', '987 Trần Hưng Đạo, Ninh Kiều, Cần Thơ'),

-- HR Staff
('HR001', 'hr@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_hr_001', 'Đinh Thị Nhân Sự', 'Đinh Thị', 'Nhân Sự', '0901000016', 'Nhân sự', 'HR', 'HQ001', '2024-01-05', 12000000.00, 'active', TRUE, 'Đinh Văn Tâm', '0987654336', '159 Cao Thắng, Quận 3, TP.HCM'),

-- IT Staff
('IT001', 'it@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_it_001', 'Lý Văn Công Nghệ', 'Lý Văn', 'Công Nghệ', '0901000017', 'Kỹ thuật', 'IT', 'HQ001', '2024-01-10', 15000000.00, 'active', TRUE, 'Lý Thị Phương', '0987654337', '753 Võ Văn Tần, Quận 3, TP.HCM');

-- Update manager relationships
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'ADMIN001') WHERE employeeId IN ('AM001', 'AM002', 'AM003', 'AM004', 'HR001', 'IT001');
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'AM001') WHERE employeeId IN ('QL001', 'QL002', 'QL003');
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'AM002') WHERE employeeId = 'QL004';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL001') WHERE employeeId = 'NV001';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL002') WHERE employeeId = 'NV002';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL003') WHERE employeeId = 'NV003';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL004') WHERE employeeId = 'NV004';

-- Update store managers
UPDATE stores SET manager_id = (SELECT id FROM employees WHERE employeeId = 'ADMIN001') WHERE storeId = 'HQ001';
UPDATE stores SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL001') WHERE storeId = 'MC001';
UPDATE stores SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL002') WHERE storeId = 'MC002';
UPDATE stores SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL003') WHERE storeId = 'MC003';
UPDATE stores SET manager_id = (SELECT id FROM employees WHERE employeeId = 'QL004') WHERE storeId = 'MC004';

-- =====================================================
-- USER ROLES AND PERMISSIONS
-- =====================================================

-- Assign roles to users
INSERT OR IGNORE INTO user_roles (employee_id, role_id, granted_by) 
SELECT e.id, r.id, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')
FROM employees e, roles r 
WHERE e.employeeId = 'ADMIN001' AND r.role_name = 'admin';

INSERT OR IGNORE INTO user_roles (employee_id, role_id, granted_by)
SELECT e.id, r.id, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')
FROM employees e, roles r 
WHERE e.employeeId IN ('AM001', 'AM002', 'AM003', 'AM004') AND r.role_name = 'manager';

INSERT OR IGNORE INTO user_roles (employee_id, role_id, granted_by)
SELECT e.id, r.id, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')
FROM employees e, roles r 
WHERE e.employeeId IN ('QL001', 'QL002', 'QL003', 'QL004') AND r.role_name = 'manager';

INSERT OR IGNORE INTO user_roles (employee_id, role_id, granted_by)
SELECT e.id, r.id, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')
FROM employees e, roles r 
WHERE e.employeeId = 'HR001' AND r.role_name = 'hr';

INSERT OR IGNORE INTO user_roles (employee_id, role_id, granted_by)
SELECT e.id, r.id, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')
FROM employees e, roles r 
WHERE e.employeeId IN ('NV001', 'NV002', 'NV003', 'NV004', 'NV005', 'NV006', 'IT001') AND r.role_name = 'employee';

-- =====================================================
-- WORK SCHEDULES AND SHIFT ASSIGNMENTS
-- =====================================================

-- Sample work schedules
INSERT OR IGNORE INTO work_schedules (name, description, schedule_type, schedule_data, is_default, created_by) VALUES
('Ca hành chính', 'Ca làm việc hành chính từ 8h-17h', 'weekly', '{"mon":"08:00-17:00","tue":"08:00-17:00","wed":"08:00-17:00","thu":"08:00-17:00","fri":"08:00-17:00","sat":"08:00-12:00","sun":"off"}', TRUE, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')),
('Ca sáng', 'Ca làm việc sáng từ 8h-17h', 'weekly', '{"mon":"08:00-17:00","tue":"08:00-17:00","wed":"08:00-17:00","thu":"08:00-17:00","fri":"08:00-17:00","sat":"08:00-17:00","sun":"off"}', FALSE, (SELECT id FROM employees WHERE employeeId = 'ADMIN001')),
('Ca chiều', 'Ca làm việc chiều từ 13h-22h', 'weekly', '{"mon":"13:00-22:00","tue":"13:00-22:00","wed":"13:00-22:00","thu":"13:00-22:00","fri":"13:00-22:00","sat":"13:00-22:00","sun":"off"}', FALSE, (SELECT id FROM employees WHERE employeeId = 'ADMIN001'));

-- Sample shift assignments for current week  
INSERT OR IGNORE INTO shift_assignments (employeeId, schedule_id, shift_date, start_time, end_time, location, status, assigned_by) VALUES
-- Admin shifts
('ADMIN001', 1, date('now'), '08:00', '17:00', 'HQ001', 'confirmed', (SELECT id FROM employees WHERE employeeId = 'ADMIN001')),
('ADMIN001', 1, date('now', '+1 day'), '08:00', '17:00', 'HQ001', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'ADMIN001')),
('ADMIN001', 1, date('now', '+2 days'), '08:00', '17:00', 'HQ001', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'ADMIN001')),

-- Manager shifts
('QL001', 2, date('now'), '08:00', '17:00', 'MC001', 'confirmed', (SELECT id FROM employees WHERE employeeId = 'AM001')),
('QL001', 2, date('now', '+1 day'), '08:00', '17:00', 'MC001', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'AM001')),
('QL002', 2, date('now'), '08:00', '17:00', 'MC002', 'confirmed', (SELECT id FROM employees WHERE employeeId = 'AM001')),
('QL002', 2, date('now', '+1 day'), '08:00', '17:00', 'MC002', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'AM001')),

-- Employee shifts  
('NV001', 2, date('now'), '08:00', '17:00', 'MC001', 'confirmed', (SELECT id FROM employees WHERE employeeId = 'QL001')),
('NV001', 2, date('now', '+1 day'), '08:00', '17:00', 'MC001', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'QL001')),
('NV002', 3, date('now'), '13:00', '22:00', 'MC002', 'confirmed', (SELECT id FROM employees WHERE employeeId = 'QL002')),
('NV002', 3, date('now', '+1 day'), '13:00', '22:00', 'MC002', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'QL002')),
('NV003', 2, date('now'), '08:00', '17:00', 'MC003', 'confirmed', (SELECT id FROM employees WHERE employeeId = 'QL003')),
('NV003', 2, date('now', '+1 day'), '08:00', '17:00', 'MC003', 'scheduled', (SELECT id FROM employees WHERE employeeId = 'QL003'));

-- =====================================================
-- ATTENDANCE DATA
-- =====================================================

-- Sample attendance records for today and yesterday
INSERT OR IGNORE INTO attendance (employeeId, checkIn, checkOut, location, checkOutLocation, gps_latitude, gps_longitude, checkout_gps_latitude, checkout_gps_longitude, work_hours_calculated, status, approved_by) VALUES
-- Yesterday's completed attendance
('ADMIN001', datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+17 hours'), 'HQ001', 'HQ001', 10.7769, 106.7009, 10.7769, 106.7009, 9.0, 'completed', (SELECT id FROM employees WHERE employeeId = 'ADMIN001')),
('QL001', datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+17 hours'), 'MC001', 'MC001', 10.7747, 106.6990, 10.7747, 106.6990, 9.0, 'completed', (SELECT id FROM employees WHERE employeeId = 'AM001')),
('NV001', datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+17 hours'), 'MC001', 'MC001', 10.7747, 106.6990, 10.7747, 106.6990, 9.0, 'completed', (SELECT id FROM employees WHERE employeeId = 'QL001')),
('NV002', datetime('now', '-1 day', '+13 hours'), datetime('now', '-1 day', '+22 hours'), 'MC002', 'MC002', 10.7719, 106.7046, 10.7719, 106.7046, 9.0, 'completed', (SELECT id FROM employees WHERE employeeId = 'QL002')),

-- Today's ongoing attendance
('ADMIN001', datetime('now', '+8 hours'), NULL, 'HQ001', NULL, 10.7769, 106.7009, NULL, NULL, NULL, 'active', NULL),
('QL001', datetime('now', '+8 hours'), NULL, 'MC001', NULL, 10.7747, 106.6990, NULL, NULL, NULL, 'active', NULL),
('NV001', datetime('now', '+8 hours'), NULL, 'MC001', NULL, 10.7747, 106.6990, NULL, NULL, NULL, 'active', NULL);

-- Sample attendance breaks
INSERT OR IGNORE INTO attendance_breaks (attendance_id, break_start, break_end, break_type, duration_minutes) VALUES
(1, datetime('now', '-1 day', '+12 hours'), datetime('now', '-1 day', '+13 hours'), 'lunch', 60),
(2, datetime('now', '-1 day', '+12 hours'), datetime('now', '-1 day', '+13 hours'), 'lunch', 60),
(3, datetime('now', '-1 day', '+12 hours'), datetime('now', '-1 day', '+13 hours'), 'lunch', 60),
(4, datetime('now', '-1 day', '+17 hours'), datetime('now', '-1 day', '+18 hours'), 'lunch', 60);

-- =====================================================
-- TASK MANAGEMENT DATA  
-- =====================================================

-- Sample tasks with different priorities and statuses
INSERT OR IGNORE INTO tasks (title, description, priority, status, category, assignedTo, createdBy, estimated_hours, progress_percentage, dueDate, tags, created_at) VALUES
('Kiểm tra hệ thống chấm công GPS', 'Đảm bảo tất cả cửa hàng có hệ thống chấm công GPS hoạt động chính xác và ổn định', 'high', 'in_progress', 'System Maintenance', (SELECT id FROM employees WHERE employeeId = 'IT001'), (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 8.0, 65, date('now', '+7 days'), '["gps","attendance","system"]', datetime('now', '-3 days')),

('Báo cáo doanh số tháng 1', 'Tổng hợp và phân tích doanh số bán hàng của tất cả cửa hàng trong tháng 1/2025', 'medium', 'pending', 'Reporting', (SELECT id FROM employees WHERE employeeId = 'QL001'), (SELECT id FROM employees WHERE employeeId = 'AM001'), 4.0, 0, date('now', '+3 days'), '["sales","report","monthly"]', datetime('now', '-1 day')),

('Đào tạo nhân viên mới', 'Tổ chức chương trình đào tạo cho nhân viên mới tuyển dụng về quy trình làm việc và sử dụng hệ thống', 'medium', 'in_progress', 'Training', (SELECT id FROM employees WHERE employeeId = 'HR001'), (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 12.0, 30, date('now', '+10 days'), '["training","hr","onboarding"]', datetime('now', '-5 days')),

('Cập nhật inventory cửa hàng Q1', 'Kiểm tra và cập nhật số lượng hàng hóa tại cửa hàng Quận 1', 'low', 'pending', 'Inventory', (SELECT id FROM employees WHERE employeeId = 'NV001'), (SELECT id FROM employees WHERE employeeId = 'QL001'), 2.0, 0, date('now', '+1 day'), '["inventory","store"]', datetime('now')),

('Maintenance hệ thống database', 'Thực hiện bảo trì định kỳ database và tối ưu hóa performance', 'urgent', 'pending', 'System Maintenance', (SELECT id FROM employees WHERE employeeId = 'IT001'), (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 6.0, 0, date('now', '+2 days'), '["database","maintenance","performance"]', datetime('now')),

('Họp review quý 1', 'Tổ chức cuộc họp đánh giá kết quả kinh doanh quý 1 và lập kế hoạch quý 2', 'high', 'completed', 'Meeting', (SELECT id FROM employees WHERE employeeId = 'AM001'), (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 3.0, 100, date('now', '-2 days'), '["meeting","review","quarterly"]', datetime('now', '-10 days'));

-- Sample task assignments for collaboration
INSERT OR IGNORE INTO task_assignments (taskId, employeeId, role, assigned_by, status) VALUES
(1, (SELECT id FROM employees WHERE employeeId = 'IT001'), 'assignee', (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'active'),
(1, (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'reviewer', (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'active'),
(1, (SELECT id FROM employees WHERE employeeId = 'QL001'), 'participant', (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'active'),

(2, (SELECT id FROM employees WHERE employeeId = 'QL001'), 'assignee', (SELECT id FROM employees WHERE employeeId = 'AM001'), 'active'),
(2, (SELECT id FROM employees WHERE employeeId = 'AM001'), 'reviewer', (SELECT id FROM employees WHERE employeeId = 'AM001'), 'active'),
(2, (SELECT id FROM employees WHERE employeeId = 'NV001'), 'participant', (SELECT id FROM employees WHERE employeeId = 'AM001'), 'active'),

(3, (SELECT id FROM employees WHERE employeeId = 'HR001'), 'assignee', (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'active'),
(3, (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'reviewer', (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'active');

-- Sample task comments
INSERT OR IGNORE INTO task_comments (taskId, employeeId, comment, comment_type, created_at) VALUES
(1, (SELECT id FROM employees WHERE employeeId = 'IT001'), 'Đã kiểm tra 3/7 cửa hàng. Hệ thống GPS tại MC001 và MC002 hoạt động tốt. MC003 cần cập nhật firmware.', 'status_update', datetime('now', '-2 hours')),
(1, (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'Cảm ơn update. Hãy ưu tiên MC003 và báo cáo khi hoàn thành.', 'comment', datetime('now', '-1 hour')),
(2, (SELECT id FROM employees WHERE employeeId = 'QL001'), 'Đang thu thập dữ liệu từ hệ thống POS. Dự kiến hoàn thành vào cuối ngày mai.', 'status_update', datetime('now', '-3 hours')),
(3, (SELECT id FROM employees WHERE employeeId = 'HR001'), 'Đã chuẩn bị tài liệu đào tạo và lên lịch cho 5 nhân viên mới.', 'status_update', datetime('now', '-6 hours'));

-- Sample task time logs
INSERT OR IGNORE INTO task_time_logs (task_id, employee_id, start_time, end_time, duration_minutes, description, billable) VALUES
(1, (SELECT id FROM employees WHERE employeeId = 'IT001'), datetime('now', '-4 hours'), datetime('now', '-2 hours'), 120, 'Kiểm tra GPS tại MC001 và MC002', TRUE),
(1, (SELECT id FROM employees WHERE employeeId = 'IT001'), datetime('now', '-1 day', '+9 hours'), datetime('now', '-1 day', '+12 hours'), 180, 'Phân tích log hệ thống và chuẩn bị checklist', TRUE),
(2, (SELECT id FROM employees WHERE employeeId = 'QL001'), datetime('now', '-5 hours'), datetime('now', '-3 hours'), 120, 'Thu thập dữ liệu doanh số từ POS', TRUE),
(3, (SELECT id FROM employees WHERE employeeId = 'HR001'), datetime('now', '-1 day', '+14 hours'), datetime('now', '-1 day', '+17 hours'), 180, 'Chuẩn bị tài liệu và lên kế hoạch đào tạo', TRUE);

-- =====================================================
-- SHIFT REQUESTS AND ATTENDANCE ADJUSTMENTS
-- =====================================================

-- Sample shift requests
INSERT OR IGNORE INTO shift_requests (requester_id, original_shift_id, requested_shift_date, requested_start_time, requested_end_time, request_type, reason, status, created_at) VALUES
((SELECT id FROM employees WHERE employeeId = 'NV001'), 1, date('now', '+3 days'), '13:00', '22:00', 'shift_change', 'Có việc gia đình buổi sáng, xin đổi sang ca chiều', 'pending', datetime('now', '-2 hours')),
((SELECT id FROM employees WHERE employeeId = 'NV002'), 2, date('now', '+5 days'), NULL, NULL, 'time_off', 'Xin nghỉ phép năm', 'approved', datetime('now', '-1 day')),
((SELECT id FROM employees WHERE employeeId = 'NV003'), NULL, date('now', '+1 day'), '06:00', '15:00', 'overtime', 'Xin làm thêm giờ để hoàn thành dự án', 'pending', datetime('now', '-3 hours'));

-- Sample attendance adjustments
INSERT OR IGNORE INTO attendance_adjustments (attendance_id, original_checkin, original_checkout, adjusted_checkin, adjusted_checkout, reason, requested_by, status, created_at) VALUES
(2, datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+17 hours'), datetime('now', '-1 day', '+7:45 hours'), datetime('now', '-1 day', '+17 hours'), 'Đến sớm 15 phút để chuẩn bị mở cửa hàng', (SELECT id FROM employees WHERE employeeId = 'QL001'), 'approved', datetime('now', '-12 hours')),
(3, datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+17 hours'), datetime('now', '-1 day', '+8:15 hours'), datetime('now', '-1 day', '+17 hours'), 'Muộn 15 phút do tắc đường', (SELECT id FROM employees WHERE employeeId = 'NV001'), 'pending', datetime('now', '-6 hours'));

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Sample notifications for different users
INSERT OR IGNORE INTO notifications (recipient_id, sender_id, title, message, notification_type, category, priority, is_read, data, created_at) VALUES
((SELECT id FROM employees WHERE employeeId = 'ADMIN001'), NULL, 'Hệ thống khởi động thành công', 'Hệ thống HR Management v3.0 đã được khởi động với dữ liệu mẫu đầy đủ', 'success', 'system', 'normal', FALSE, '{"version":"3.0","startup_time":"' || datetime('now') || '"}', datetime('now')),

((SELECT id FROM employees WHERE employeeId = 'IT001'), (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'Nhiệm vụ mới được giao', 'Bạn được giao nhiệm vụ "Kiểm tra hệ thống chấm công GPS"', 'info', 'task', 'high', FALSE, '{"task_id":1,"due_date":"' || date('now', '+7 days') || '"}', datetime('now', '-3 days')),

((SELECT id FROM employees WHERE employeeId = 'QL001'), (SELECT id FROM employees WHERE employeeId = 'AM001'), 'Yêu cầu báo cáo', 'Cần hoàn thành báo cáo doanh số tháng 1 trong 3 ngày tới', 'warning', 'task', 'normal', FALSE, '{"task_id":2,"deadline":"' || date('now', '+3 days') || '"}', datetime('now', '-1 day')),

((SELECT id FROM employees WHERE employeeId = 'QL001'), (SELECT id FROM employees WHERE employeeId = 'NV001'), 'Yêu cầu đổi ca', 'NV001 xin đổi ca làm việc ngày ' || date('now', '+3 days'), 'info', 'schedule', 'normal', TRUE, '{"request_id":1,"type":"shift_change"}', datetime('now', '-2 hours')),

((SELECT id FROM employees WHERE employeeId = 'NV001'), (SELECT id FROM employees WHERE employeeId = 'QL001'), 'Yêu cầu chỉnh sửa chấm công', 'Yêu cầu chỉnh sửa thời gian chấm công đã được gửi', 'info', 'attendance', 'normal', FALSE, '{"adjustment_id":2,"date":"' || date('now', '-1 day') || '"}', datetime('now', '-6 hours')),

((SELECT id FROM employees WHERE employeeId = 'HR001'), (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), 'Tiến độ đào tạo', 'Chương trình đào tạo nhân viên mới đang đạt 30% tiến độ', 'info', 'task', 'normal', FALSE, '{"task_id":3,"progress":30}', datetime('now', '-1 hour'));

-- =====================================================
-- PENDING REGISTRATIONS FOR TESTING
-- =====================================================

-- Sample pending registrations
INSERT OR IGNORE INTO pending_registrations (employeeId, email, password, salt, name, first_name, last_name, phone, department, position, storeId, verification_code, status, notes, created_at) VALUES
('NV007', 'pending1@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_pending_001', 'Trần Thị Ứng Viên 1', 'Trần Thị', 'Ứng Viên', '0901000018', 'Kinh doanh', 'NV', 'MC001', 'VER123456', 'pending', 'Ứng viên mới từ website tuyển dụng', datetime('now', '-2 hours')),
('NV008', 'pending2@hrms.com', '$pbkdf2-sha256$29000$2VuL8V4rxfh/T.nd.z/H.A$JjjJrYs9h2dS1/6TUn8DYpKKKWXqWoLW.NqnNmAqkEo', 'salt_pending_002', 'Nguyễn Văn Ứng Viên 2', 'Nguyễn Văn', 'Ứng Viên', '0901000019', 'Kỹ thuật', 'NV', 'HQ001', 'VER789012', 'pending', 'Ứng viên có kinh nghiệm IT', datetime('now', '-1 day'));

-- =====================================================
-- AUDIT LOGS AND HISTORY
-- =====================================================

-- Sample audit logs
INSERT OR IGNORE INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, ip_address, created_at) VALUES
('employees', 1, 'UPDATE', '{"salary":20000000}', '{"salary":25000000}', (SELECT id FROM employees WHERE employeeId = 'ADMIN001'), '192.168.1.100', datetime('now', '-5 days')),
('tasks', 1, 'UPDATE', '{"status":"pending","progress_percentage":0}', '{"status":"in_progress","progress_percentage":65}', (SELECT id FROM employees WHERE employeeId = 'IT001'), '192.168.1.101', datetime('now', '-2 hours')),
('attendance', 3, 'INSERT', NULL, '{"employeeId":"NV001","checkIn":"' || datetime('now', '+8 hours') || '","location":"MC001"}', (SELECT id FROM employees WHERE employeeId = 'NV001'), '192.168.1.102', datetime('now'));

-- Sample employee history
INSERT OR IGNORE INTO employee_history (employeeId, field_name, old_value, new_value, change_reason, changed_by, effective_date, created_at) VALUES
('ADMIN001', 'salary', '20000000', '25000000', 'Tăng lương định kỳ theo hiệu suất làm việc', 'ADMIN001', date('now', '-5 days'), datetime('now', '-5 days')),
('NV001', 'department', 'Thực tập sinh', 'Kinh doanh', 'Chuyển từ thực tập sinh thành nhân viên chính thức', 'HR001', date('now', '-30 days'), datetime('now', '-30 days')),
('QL001', 'position', 'NV', 'QL', 'Thăng chức lên quản lý cửa hàng', 'AM001', date('now', '-60 days'), datetime('now', '-60 days'));

-- =====================================================
-- PERFORMANCE METRICS
-- =====================================================

-- Sample performance metrics
INSERT OR IGNORE INTO performance_metrics (metric_type, metric_name, metric_value, metric_unit, metadata, recorded_at) VALUES
('request', 'api_response_time', 150.5, 'ms', '{"endpoint":"/api/attendance/checkin","method":"POST"}', datetime('now', '-1 hour')),
('request', 'api_response_time', 89.2, 'ms', '{"endpoint":"/api/tasks/list","method":"GET"}', datetime('now', '-1 hour')),
('database', 'query_execution_time', 45.8, 'ms', '{"query":"SELECT * FROM employees WHERE is_active = 1","table":"employees"}', datetime('now', '-30 minutes')),
('cache', 'cache_hit_rate', 85.5, 'percentage', '{"cache_type":"query_cache","period":"1hour"}', datetime('now', '-15 minutes')),
('error', 'error_count', 2, 'count', '{"error_type":"validation","endpoint":"/api/users/create","period":"1hour"}', datetime('now', '-10 minutes'));

-- Sample API request logs
INSERT OR IGNORE INTO api_request_logs (request_id, method, endpoint, user_id, ip_address, user_agent, request_size, response_status, response_time_ms, response_size, created_at) VALUES
('REQ_001', 'POST', '/api/attendance/checkin', 'NV001', '192.168.1.102', 'Mozilla/5.0 (Mobile)', 256, 200, 150.5, 128, datetime('now', '-1 hour')),
('REQ_002', 'GET', '/api/tasks/list', 'QL001', '192.168.1.103', 'Mozilla/5.0 (Windows)', 0, 200, 89.2, 2048, datetime('now', '-1 hour')),
('REQ_003', 'PUT', '/api/tasks/1/progress', 'IT001', '192.168.1.101', 'Mozilla/5.0 (Windows)', 128, 200, 95.8, 256, datetime('now', '-2 hours')),
('REQ_004', 'GET', '/api/dashboard/stats', 'ADMIN001', '192.168.1.100', 'Mozilla/5.0 (Windows)', 0, 200, 245.3, 4096, datetime('now', '-30 minutes'));

-- =====================================================
-- QUERY CACHE SAMPLES
-- =====================================================

-- Sample cache entries
INSERT OR IGNORE INTO query_cache (cache_key, cache_value, cache_category, expires_at, hit_count, last_accessed) VALUES
('employee_list_active', '{"employees":[{"id":1,"name":"Nguyễn Văn Admin","position":"AD"}]}', 'employees', datetime('now', '+1 hour'), 15, datetime('now', '-5 minutes')),
('store_list_active', '{"stores":[{"id":"MC001","name":"MayCha Quận 1"}]}', 'stores', datetime('now', '+2 hours'), 8, datetime('now', '-10 minutes')),
('task_stats_summary', '{"total":6,"pending":3,"in_progress":2,"completed":1}', 'tasks', datetime('now', '+30 minutes'), 25, datetime('now', '-2 minutes'));

-- =====================================================
-- SESSION DATA
-- =====================================================

-- Sample active sessions
INSERT OR IGNORE INTO sessions (employeeId, token, device_info, ip_address, user_agent, expiresAt, lastAccess, is_active) VALUES
('ADMIN001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin_session_token', 'Windows Desktop', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', datetime('now', '+8 hours'), datetime('now', '-5 minutes'), TRUE),
('QL001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ql001_session_token', 'Android Mobile', '192.168.1.103', 'Mozilla/5.0 (Mobile)', datetime('now', '+6 hours'), datetime('now', '-15 minutes'), TRUE),
('NV001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.nv001_session_token', 'iPhone', '192.168.1.102', 'Mozilla/5.0 (iPhone)', datetime('now', '+4 hours'), datetime('now', '-30 minutes'), TRUE);

-- Sample session logs
INSERT OR IGNORE INTO session_logs (session_id, action, ip_address, user_agent, created_at) VALUES
(1, 'login', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', datetime('now', '-2 hours')),
(1, 'refresh', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', datetime('now', '-1 hour')),
(2, 'login', '192.168.1.103', 'Mozilla/5.0 (Mobile)', datetime('now', '-3 hours')),
(3, 'login', '192.168.1.102', 'Mozilla/5.0 (iPhone)', datetime('now', '-4 hours'));

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Enhanced HR Database Sample Data v3.0 inserted successfully!' as message,
       'Total Employees: ' || (SELECT COUNT(*) FROM employees) as employee_count,
       'Total Stores: ' || (SELECT COUNT(*) FROM stores) as store_count,
       'Total Tasks: ' || (SELECT COUNT(*) FROM tasks) as task_count,
       'Total Attendance Records: ' || (SELECT COUNT(*) FROM attendance) as attendance_count;

-- =====================================================
-- SAMPLE LOGIN CREDENTIALS
-- =====================================================

/*
=== SAMPLE LOGIN CREDENTIALS ===
All users use the same password for testing: "password123"

System Administrator:
- Email: admin@hrms.com
- Employee ID: ADMIN001
- Role: AD (Full Access)

Area Managers:
- Email: am.hcm@hrms.com (ID: AM001)
- Email: am.hanoi@hrms.com (ID: AM002)  
- Email: am.danang@hrms.com (ID: AM003)
- Email: am.cantho@hrms.com (ID: AM004)
- Role: AM (Regional Management)

Store Managers:
- Email: ql.q1@hrms.com (ID: QL001)
- Email: ql.bitexco@hrms.com (ID: QL002)
- Email: ql.landmark@hrms.com (ID: QL003)
- Email: ql.hanoi@hrms.com (ID: QL004)
- Role: QL (Store Management)

Regular Employees:
- Email: nv001@hrms.com (ID: NV001)
- Email: nv002@hrms.com (ID: NV002)
- Email: nv003@hrms.com (ID: NV003)
- Email: nv004@hrms.com (ID: NV004)
- Email: nv005@hrms.com (ID: NV005)  
- Email: nv006@hrms.com (ID: NV006)
- Role: NV (Basic Access)

HR Staff:
- Email: hr@hrms.com (ID: HR001)
- Role: HR (Human Resources)

IT Staff:
- Email: it@hrms.com (ID: IT001)
- Role: IT (Information Technology)

=== TESTING SCENARIOS ===

1. Login and Dashboard Access
2. Attendance Check-in/Check-out
3. Task Management and Assignment
4. Shift Scheduling and Requests
5. User Management and Permissions
6. Reports and Analytics
7. Notification System
8. Audit Trail and History

=== VALIDATION QUERIES ===

-- Check user count by role:
SELECT position, COUNT(*) as count FROM employees GROUP BY position;

-- Check active attendance:
SELECT e.name, a.checkIn, a.location 
FROM employees e 
JOIN attendance a ON e.employeeId = a.employeeId 
WHERE a.checkOut IS NULL;

-- Check pending tasks:
SELECT t.title, e.name as assignee, t.priority, t.dueDate 
FROM tasks t 
JOIN employees e ON t.assignedTo = e.id 
WHERE t.status = 'pending';

-- Check notifications:
SELECT e.name, n.title, n.is_read 
FROM notifications n 
JOIN employees e ON n.recipient_id = e.id 
ORDER BY n.created_at DESC LIMIT 10;
*/
