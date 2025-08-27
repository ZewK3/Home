-- =====================================================
-- COMPREHENSIVE SAMPLE DATA FOR ENHANCED HR DATABASE SCHEMA V3.1
-- =====================================================
-- Professional-grade sample data with realistic business scenarios
-- Compatible with Enhanced_HR_Database_Schema_v3.sql (Professional Edition)
-- 
-- Features:
-- ✓ Complete organizational structure with 7 stores
-- ✓ 20+ employees across all roles and departments
-- ✓ Realistic attendance, task, and performance data
-- ✓ Customer support conversations and chat data
-- ✓ Professional business analytics and metrics
-- ✓ All passwords are SHA-256 hashed for security
-- =====================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =====================================================
-- DEPARTMENTS AND STORES DATA
-- =====================================================

-- Insert departments
INSERT OR IGNORE INTO departments (departmentId, departmentName, description, is_active) VALUES
('ADMIN', 'Administration', 'Executive and administrative management', TRUE),
('HR', 'Human Resources', 'Human resources and employee relations', TRUE),
('IT', 'Information Technology', 'IT support and system administration', TRUE),
('SALES', 'Sales', 'Sales and customer relations', TRUE),
('OPS', 'Operations', 'Daily operations and logistics', TRUE),
('CS', 'Customer Service', 'Customer support and service', TRUE);

-- Insert stores
INSERT OR IGNORE INTO stores (storeId, storeName, storeType, address, city, province, phone, region, gps_latitude, gps_longitude, is_active, opening_date) VALUES
('HQ001', 'Headquarters', 'headquarters', '123 Nguyễn Huệ, District 1', 'Ho Chi Minh City', 'Ho Chi Minh', '+84-28-1234-5678', 'South', 10.7769, 106.7009, TRUE, '2020-01-01'),
('MC001', 'MayCha Store Q1', 'retail', '456 Lê Lợi, District 1', 'Ho Chi Minh City', 'Ho Chi Minh', '+84-28-2345-6789', 'South', 10.7731, 106.6992, TRUE, '2020-03-15'),
('MC002', 'MayCha Store Q3', 'retail', '789 Võ Văn Tần, District 3', 'Ho Chi Minh City', 'Ho Chi Minh', '+84-28-3456-7890', 'South', 10.7786, 106.6947, TRUE, '2020-06-01'),
('MC003', 'MayCha Store Hanoi', 'retail', '321 Hoàn Kiếm, Hoàn Kiếm District', 'Hanoi', 'Hanoi', '+84-24-4567-8901', 'North', 21.0285, 105.8542, TRUE, '2020-09-10'),
('MC004', 'MayCha Store Da Nang', 'retail', '654 Trần Phú, Hải Châu District', 'Da Nang', 'Da Nang', '+84-236-5678-9012', 'Central', 16.0544, 108.2022, TRUE, '2021-01-20'),
('MC005', 'MayCha Store Can Tho', 'retail', '987 Ninh Kiều, Ninh Kiều District', 'Can Tho', 'Can Tho', '+84-292-6789-0123', 'Mekong', 10.0452, 105.7469, TRUE, '2021-04-15'),
('MC006', 'MayCha Store Hai Phong', 'retail', '147 Lê Chân, Lê Chân District', 'Hai Phong', 'Hai Phong', '+84-225-7890-1234', 'North', 20.8449, 106.6881, TRUE, '2021-07-01');

-- =====================================================
-- EMPLOYEE DATA WITH SHA-256 HASHED PASSWORDS
-- =====================================================

-- All passwords are "password123" hashed with SHA-256
-- SHA-256 hash of "password123" = ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

INSERT OR IGNORE INTO employees (
    employeeId, email, password, name, first_name, last_name, phone, 
    department_id, storeId, position, job_title, employment_type, 
    employment_status, hire_date, salary, manager_id, is_active,
    address, emergency_contact_name, emergency_contact_phone, 
    performance_rating, education_level
) VALUES

-- System Administrator
('ADMIN001', 'admin@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 
 'Trần Văn Admin', 'Trần', 'Admin', '+84-901-234-567', 
 1, 'HQ001', 'System Administrator', 'System Administrator', 'full_time', 
 'active', '2020-01-01', 25000000.00, NULL, TRUE,
 '123 Admin Street, District 1, Ho Chi Minh City', 'Nguyễn Thị An', '+84-901-111-222',
 'excellent', 'bachelor'),

-- HR Manager
('HR001', 'hr@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Lê Thị Nhân Sự', 'Lê', 'Nhân Sự', '+84-902-345-678',
 2, 'HQ001', 'HR Manager', 'Human Resources Manager', 'full_time',
 'active', '2020-01-15', 20000000.00, 1, TRUE,
 '456 HR Avenue, District 1, Ho Chi Minh City', 'Trần Văn Bình', '+84-902-222-333',
 'excellent', 'master'),

-- IT Manager
('IT001', 'it@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Phạm Văn IT', 'Phạm', 'IT', '+84-903-456-789',
 3, 'HQ001', 'IT Manager', 'Information Technology Manager', 'full_time',
 'active', '2020-02-01', 22000000.00, 1, TRUE,
 '789 Tech Street, District 1, Ho Chi Minh City', 'Lê Thị Cường', '+84-903-333-444',
 'excellent', 'bachelor'),

-- Area Managers
('AM001', 'am.south@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Nguyễn Văn Nam', 'Nguyễn', 'Nam', '+84-904-567-890',
 4, 'HQ001', 'Area Manager', 'Southern Region Area Manager', 'full_time',
 'active', '2020-02-15', 18000000.00, 1, TRUE,
 '321 South Street, District 1, Ho Chi Minh City', 'Trần Thị Đức', '+84-904-444-555',
 'excellent', 'bachelor'),

('AM002', 'am.north@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Vũ Thị Bắc', 'Vũ', 'Bắc', '+84-905-678-901',
 4, 'MC003', 'Area Manager', 'Northern Region Area Manager', 'full_time',
 'active', '2020-03-01', 18000000.00, 1, TRUE,
 '654 North Avenue, Hoàn Kiếm, Hanoi', 'Nguyễn Văn Em', '+84-905-555-666',
 'good', 'bachelor'),

('AM003', 'am.central@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Hoàng Văn Trung', 'Hoàng', 'Trung', '+84-906-789-012',
 4, 'MC004', 'Area Manager', 'Central Region Area Manager', 'full_time',
 'active', '2020-04-01', 18000000.00, 1, TRUE,
 '987 Central Road, Hải Châu, Da Nang', 'Lê Thị Phát', '+84-906-666-777',
 'good', 'bachelor'),

('AM004', 'am.mekong@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Đặng Thị Mê Kong', 'Đặng', 'Mê Kong', '+84-907-890-123',
 4, 'MC005', 'Area Manager', 'Mekong Region Area Manager', 'full_time',
 'active', '2020-05-01', 18000000.00, 1, TRUE,
 '147 Mekong Street, Ninh Kiều, Can Tho', 'Võ Văn Giang', '+84-907-777-888',
 'excellent', 'bachelor'),

-- Store Managers
('QL001', 'ql.q1@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Trương Văn Quản Lý 1', 'Trương', 'Quản Lý 1', '+84-908-901-234',
 5, 'MC001', 'Store Manager', 'Store Manager Q1', 'full_time',
 'active', '2020-03-15', 15000000.00, 4, TRUE,
 '456 Manager Street, District 1, Ho Chi Minh City', 'Phạm Thị Hạnh', '+84-908-888-999',
 'good', 'bachelor'),

('QL002', 'ql.q3@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Lý Thị Quản Lý 3', 'Lý', 'Quản Lý 3', '+84-909-012-345',
 5, 'MC002', 'Store Manager', 'Store Manager Q3', 'full_time',
 'active', '2020-06-01', 15000000.00, 4, TRUE,
 '789 Management Road, District 3, Ho Chi Minh City', 'Trần Văn Ích', '+84-909-999-000',
 'good', 'bachelor'),

('QL003', 'ql.hanoi@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Đỗ Văn Hà Nội', 'Đỗ', 'Hà Nội', '+84-910-123-456',
 5, 'MC003', 'Store Manager', 'Store Manager Hanoi', 'full_time',
 'active', '2020-09-10', 15000000.00, 5, TRUE,
 '321 Capital Street, Hoàn Kiếm, Hanoi', 'Nguyễn Thị Kế', '+84-910-000-111',
 'excellent', 'bachelor'),

('QL004', 'ql.danang@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Võ Thị Đà Nẵng', 'Võ', 'Đà Nẵng', '+84-911-234-567',
 5, 'MC004', 'Store Manager', 'Store Manager Da Nang', 'full_time',
 'active', '2021-01-20', 15000000.00, 6, TRUE,
 '654 Beach Road, Hải Châu, Da Nang', 'Lê Văn Liêu', '+84-911-111-222',
 'good', 'bachelor'),

('QL005', 'ql.cantho@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Huỳnh Văn Cần Thơ', 'Huỳnh', 'Cần Thơ', '+84-912-345-678',
 5, 'MC005', 'Store Manager', 'Store Manager Can Tho', 'full_time',
 'active', '2021-04-15', 15000000.00, 7, TRUE,
 '987 River Street, Ninh Kiều, Can Tho', 'Trần Thị Minh', '+84-912-222-333',
 'excellent', 'bachelor'),

('QL006', 'ql.haiphong@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Bùi Thị Hải Phòng', 'Bùi', 'Hải Phòng', '+84-913-456-789',
 5, 'MC006', 'Store Manager', 'Store Manager Hai Phong', 'full_time',
 'active', '2021-07-01', 15000000.00, 5, TRUE,
 '147 Port Avenue, Lê Chân, Hai Phong', 'Võ Văn Nhân', '+84-913-333-444',
 'good', 'bachelor'),

-- Regular Employees
('NV001', 'nv001@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Nguyễn Văn Một', 'Nguyễn', 'Một', '+84-914-567-890',
 4, 'MC001', 'Sales Associate', 'Sales Associate', 'full_time',
 'active', '2020-04-01', 12000000.00, 8, TRUE,
 '123 Employee Street, District 1, Ho Chi Minh City', 'Lê Thị Ơn', '+84-914-444-555',
 'good', 'high_school'),

('NV002', 'nv002@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Trần Thị Hai', 'Trần', 'Hai', '+84-915-678-901',
 4, 'MC002', 'Sales Associate', 'Sales Associate', 'full_time',
 'active', '2020-07-01', 12000000.00, 9, TRUE,
 '456 Worker Road, District 3, Ho Chi Minh City', 'Phạm Văn Phong', '+84-915-555-666',
 'satisfactory', 'high_school'),

('NV003', 'nv003@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Lê Văn Ba', 'Lê', 'Ba', '+84-916-789-012',
 5, 'MC003', 'Operations Clerk', 'Operations Clerk', 'full_time',
 'active', '2020-10-01', 11000000.00, 10, TRUE,
 '789 Staff Avenue, Hoàn Kiếm, Hanoi', 'Nguyễn Thị Quý', '+84-916-666-777',
 'good', 'bachelor'),

('NV004', 'nv004@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Phạm Thị Bốn', 'Phạm', 'Bốn', '+84-917-890-123',
 5, 'MC004', 'Operations Clerk', 'Operations Clerk', 'full_time',
 'active', '2021-02-01', 11000000.00, 11, TRUE,
 '321 Team Street, Hải Châu, Da Nang', 'Võ Văn Rộng', '+84-917-777-888',
 'satisfactory', 'high_school'),

('NV005', 'nv005@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Võ Văn Năm', 'Võ', 'Năm', '+84-918-901-234',
 4, 'MC005', 'Sales Associate', 'Sales Associate', 'full_time',
 'active', '2021-05-01', 12000000.00, 12, TRUE,
 '654 Crew Road, Ninh Kiều, Can Tho', 'Lê Thị Sang', '+84-918-888-999',
 'good', 'bachelor'),

('NV006', 'nv006@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Đặng Thị Sáu', 'Đặng', 'Sáu', '+84-919-012-345',
 6, 'MC006', 'Customer Service Rep', 'Customer Service Representative', 'full_time',
 'active', '2021-08-01', 11500000.00, 13, TRUE,
 '987 Service Street, Lê Chân, Hai Phong', 'Trần Văn Tám', '+84-919-999-000',
 'excellent', 'bachelor'),

-- Customer Support Staff
('CS001', 'cs001@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Hoàng Văn Support', 'Hoàng', 'Support', '+84-920-123-456',
 6, 'HQ001', 'Customer Support', 'Senior Customer Support Specialist', 'full_time',
 'active', '2020-02-01', 13000000.00, 2, TRUE,
 '147 Support Avenue, District 1, Ho Chi Minh City', 'Nguyễn Thị Ủng hộ', '+84-920-000-111',
 'excellent', 'bachelor'),

('CS002', 'cs002@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Lý Thị Chat', 'Lý', 'Chat', '+84-921-234-567',
 6, 'HQ001', 'Customer Support', 'Customer Support Specialist', 'full_time',
 'active', '2020-08-01', 12000000.00, 18, TRUE,
 '258 Chat Street, District 1, Ho Chi Minh City', 'Phạm Văn Văn', '+84-921-111-222',
 'good', 'bachelor'),

-- Part-time and Intern employees
('PT001', 'pt001@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Trần Văn Part Time', 'Trần', 'Part Time', '+84-922-345-678',
 4, 'MC001', 'Sales Associate', 'Part-time Sales Associate', 'part_time',
 'active', '2023-01-15', 8000000.00, 8, TRUE,
 '369 Part Time Road, District 1, Ho Chi Minh City', 'Lê Thị Xin', '+84-922-222-333',
 'good', 'high_school'),

('INT001', 'int001@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Nguyễn Thị Intern', 'Nguyễn', 'Intern', '+84-923-456-789',
 3, 'HQ001', 'IT Intern', 'Information Technology Intern', 'intern',
 'active', '2024-01-01', 5000000.00, 3, TRUE,
 '741 Intern Avenue, District 1, Ho Chi Minh City', 'Võ Văn Ý', '+84-923-333-444',
 'satisfactory', 'bachelor');

-- =====================================================
-- USER ROLES ASSIGNMENT
-- =====================================================

INSERT OR IGNORE INTO user_roles (employee_id, role_id, is_primary_role) VALUES
-- Super Admin
(1, 1, TRUE),   -- ADMIN001 -> Super Admin

-- Admins
(2, 3, TRUE),   -- HR001 -> HR Manager
(3, 2, TRUE),   -- IT001 -> Admin

-- Area Managers
(4, 5, TRUE),   -- AM001 -> Area Manager
(5, 5, TRUE),   -- AM002 -> Area Manager  
(6, 5, TRUE),   -- AM003 -> Area Manager
(7, 5, TRUE),   -- AM004 -> Area Manager

-- Store Managers
(8, 4, TRUE),   -- QL001 -> Store Manager
(9, 4, TRUE),   -- QL002 -> Store Manager
(10, 4, TRUE),  -- QL003 -> Store Manager
(11, 4, TRUE),  -- QL004 -> Store Manager
(12, 4, TRUE),  -- QL005 -> Store Manager
(13, 4, TRUE),  -- QL006 -> Store Manager

-- Regular Employees
(14, 9, TRUE),  -- NV001 -> Employee
(15, 9, TRUE),  -- NV002 -> Employee
(16, 9, TRUE),  -- NV003 -> Employee
(17, 9, TRUE),  -- NV004 -> Employee
(18, 9, TRUE),  -- NV005 -> Employee
(19, 9, TRUE),  -- NV006 -> Employee

-- Customer Support
(20, 11, TRUE), -- CS001 -> Customer Support
(21, 11, TRUE), -- CS002 -> Customer Support

-- Part-time and Interns
(22, 9, TRUE),  -- PT001 -> Employee
(23, 10, TRUE); -- INT001 -> Intern

-- =====================================================
-- ATTENDANCE DATA WITH REALISTIC PATTERNS
-- =====================================================

INSERT OR IGNORE INTO attendance (
    employee_id, employeeId, date, check_in_time, check_out_time, 
    total_hours, status, check_in_location, check_out_location, work_location
) VALUES

-- Recent attendance data (last 7 days)
(1, 'ADMIN001', '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:30:00', 9.5, 'present', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 'office'),

(2, 'HR001', '2024-01-15', '2024-01-15 08:15:00', '2024-01-15 17:45:00', 9.5, 'present',
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 'office'),

(8, 'QL001', '2024-01-15', '2024-01-15 07:45:00', '2024-01-15 18:00:00', 10.25, 'present',
 '{"lat": 10.7731, "lng": 106.6992, "address": "MC001 Store"}', 
 '{"lat": 10.7731, "lng": 106.6992, "address": "MC001 Store"}', 'office'),

(14, 'NV001', '2024-01-15', '2024-01-15 08:30:00', '2024-01-15 17:15:00', 8.75, 'late',
 '{"lat": 10.7731, "lng": 106.6992, "address": "MC001 Store"}', 
 '{"lat": 10.7731, "lng": 106.6992, "address": "MC001 Store"}', 'office'),

(15, 'NV002', '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:00:00', 9.0, 'present',
 '{"lat": 10.7786, "lng": 106.6947, "address": "MC002 Store"}', 
 '{"lat": 10.7786, "lng": 106.6947, "address": "MC002 Store"}', 'office'),

-- Previous day data
(1, 'ADMIN001', '2024-01-14', '2024-01-14 08:00:00', '2024-01-14 17:00:00', 9.0, 'present', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 'office'),

(20, 'CS001', '2024-01-14', '2024-01-14 09:00:00', '2024-01-14 18:00:00', 9.0, 'present',
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 'office'),

(21, 'CS002', '2024-01-14', '2024-01-14 14:00:00', '2024-01-14 23:00:00', 9.0, 'present',
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 
 '{"lat": 10.7769, "lng": 106.7009, "address": "HQ Office"}', 'office');

-- =====================================================
-- TASK MANAGEMENT DATA
-- =====================================================

INSERT OR IGNORE INTO tasks (
    task_id, title, description, created_by, assigned_to, assignedTo, 
    priority, status, progress_percentage, due_date, 
    category, estimated_hours, created_at
) VALUES

('TASK001', 'Triển khai hệ thống HR mới', 
 'Triển khai và cấu hình hệ thống quản lý nhân sự mới cho toàn công ty', 
 3, 23, 'INT001', 'high', 'in_progress', 75, '2024-01-25',
 'IT Project', 40.0, '2024-01-10 09:00:00'),

('TASK002', 'Đào tạo nhân viên sử dụng hệ thống mới',
 'Tổ chức các buổi đào tạo cho nhân viên về cách sử dụng hệ thống HR mới',
 2, 2, 'HR001', 'medium', 'pending', 0, '2024-01-30',
 'Training', 16.0, '2024-01-12 10:30:00'),

('TASK003', 'Cập nhật quy trình chấm công',
 'Cập nhật và chuẩn hóa quy trình chấm công điện tử tại các cửa hàng',
 1, 4, 'AM001', 'medium', 'in_progress', 50, '2024-01-20',
 'Process Improvement', 8.0, '2024-01-08 14:15:00'),

('TASK004', 'Kiểm tra báo cáo doanh thu tháng 12',
 'Xem xét và phê duyệt báo cáo doanh thu của tất cả các cửa hàng trong tháng 12',
 4, 8, 'QL001', 'high', 'completed', 100, '2024-01-15',
 'Financial Review', 4.0, '2024-01-05 08:00:00'),

('TASK005', 'Tối ưu hóa quy trình chăm sóc khách hàng',
 'Nghiên cứu và đề xuất cải tiến quy trình chăm sóc khách hàng qua chat',
 20, 21, 'CS002', 'medium', 'in_progress', 30, '2024-01-28',
 'Customer Service', 12.0, '2024-01-11 11:45:00'),

('TASK006', 'Phân tích hiệu suất bán hàng Q4',
 'Tạo báo cáo phân tích hiệu suất bán hàng quý 4 và đề xuất kế hoạch cải thiện',
 1, 14, 'NV001', 'low', 'pending', 10, '2024-02-05',
 'Analytics', 20.0, '2024-01-13 16:20:00');

-- =====================================================
-- TASK COMMENTS AND COLLABORATION
-- =====================================================

INSERT OR IGNORE INTO task_comments (
    task_id, employee_id, comment_text, comment_type, created_at
) VALUES

(1, 3, 'Dự án đang tiến triển tốt. Đã hoàn thành cài đặt cơ sở dữ liệu.', 'status_update', '2024-01-14 10:00:00'),
(1, 23, 'Em đã test xong module đăng nhập. Chức năng hoạt động ổn định.', 'comment', '2024-01-14 14:30:00'),
(1, 1, 'Tuyệt vời! Hãy tiếp tục với module quản lý nhân viên.', 'comment', '2024-01-14 15:00:00'),

(3, 4, 'Đã khảo sát quy trình tại 3 cửa hàng. Cần thống nhất thêm một số điểm.', 'status_update', '2024-01-12 09:15:00'),
(3, 8, 'Cửa hàng Q1 sẵn sàng áp dụng quy trình mới.', 'comment', '2024-01-12 16:45:00'),

(5, 21, 'Đã thu thập feedback từ 20 khách hàng về trải nghiệm chat.', 'status_update', '2024-01-13 11:30:00'),
(5, 20, 'Rất tốt! Hãy tập trung vào việc cải thiện thời gian phản hồi.', 'comment', '2024-01-13 13:20:00');

-- =====================================================
-- CUSTOMER SUPPORT CONVERSATIONS
-- =====================================================

INSERT OR IGNORE INTO support_conversations (
    conversation_id, customer_name, customer_email, customer_phone,
    subject, category, priority, status, assigned_to, 
    response_time_minutes, customer_satisfaction_rating, created_at
) VALUES

('CONV001', 'Nguyễn Văn Khách', 'khach1@email.com', '+84-987-654-321',
 'Hỏi về sản phẩm mới', 'general', 'medium', 'resolved', 20,
 5, 5, '2024-01-14 09:30:00'),

('CONV002', 'Trần Thị Mua', 'mua2@email.com', '+84-976-543-210',
 'Khiếu nại về chất lượng sản phẩm', 'complaint', 'high', 'resolved', 21,
 15, 4, '2024-01-14 14:20:00'),

('CONV003', 'Lê Văn Hỏi', 'hoi3@email.com', '+84-965-432-109',
 'Hướng dẫn sử dụng website', 'technical', 'low', 'open', 20,
 NULL, NULL, '2024-01-15 10:15:00'),

('CONV004', 'Phạm Thị Góp Ý', 'gopy4@email.com', '+84-954-321-098',
 'Đề xuất cải tiến dịch vụ', 'suggestion', 'medium', 'in_progress', 21,
 NULL, NULL, '2024-01-15 13:45:00');

-- =====================================================
-- CHAT MESSAGES
-- =====================================================

INSERT OR IGNORE INTO chat_messages (
    message_id, conversation_id, sender_id, sender_type, message_text,
    customer_name, customer_email, status, created_at
) VALUES

('MSG001', 'CONV001', NULL, 'customer', 'Chào anh/chị, tôi muốn hỏi về sản phẩm mới ra mắt.',
 'Nguyễn Văn Khách', 'khach1@email.com', 'read', '2024-01-14 09:30:00'),

('MSG002', 'CONV001', 20, 'employee', 'Xin chào anh/chị! Tôi là Hoàng từ đội hỗ trợ khách hàng. Anh/chị có thể cho tôi biết cụ thể sản phẩm nào anh/chị quan tâm không?',
 NULL, NULL, 'read', '2024-01-14 09:35:00'),

('MSG003', 'CONV001', NULL, 'customer', 'Tôi quan tâm đến dòng sản phẩm MayCha mới. Có những loại nào và giá cả như thế nào?',
 'Nguyễn Văn Khách', 'khach1@email.com', 'read', '2024-01-14 09:37:00'),

('MSG004', 'CONV001', 20, 'employee', 'Dạ, chúng tôi có 3 dòng sản phẩm MayCha mới: Premium (500K), Standard (300K), và Basic (150K). Tất cả đều có chế độ bảo hành 12 tháng.',
 NULL, NULL, 'read', '2024-01-14 09:40:00'),

('MSG005', 'CONV002', NULL, 'customer', 'Tôi mua sản phẩm của cửa hàng nhưng có vấn đề về chất lượng. Tôi muốn khiếu nại.',
 'Trần Thị Mua', 'mua2@email.com', 'read', '2024-01-14 14:20:00'),

('MSG006', 'CONV002', 21, 'employee', 'Tôi rất xin lỗi về sự bất tiện này. Tôi là Lý từ bộ phận chăm sóc khách hàng. Anh/chị có thể mô tả cụ thể vấn đề và gửi hình ảnh sản phẩm được không?',
 NULL, NULL, 'read', '2024-01-14 14:25:00'),

('MSG007', 'CONV003', NULL, 'customer', 'Tôi không biết cách đặt hàng trên website. Có thể hướng dẫn giúp tôi không?',
 'Lê Văn Hỏi', 'hoi3@email.com', 'sent', '2024-01-15 10:15:00'),

('MSG008', 'CONV004', NULL, 'customer', 'Tôi nghĩ các bạn nên có thêm tính năng chat video để hỗ trợ khách hàng tốt hơn.',
 'Phạm Thị Góp Ý', 'gopy4@email.com', 'sent', '2024-01-15 13:45:00');

-- =====================================================
-- NOTIFICATIONS SYSTEM
-- =====================================================

INSERT OR IGNORE INTO notifications (
    recipient_id, sender_id, title, message, notification_type, 
    priority, category, related_entity_type, related_entity_id,
    delivery_status, sent_at, created_at
) VALUES

(23, 3, 'Task Assignment', 'Bạn được giao nhiệm vụ mới: Triển khai hệ thống HR mới', 
 'task', 'high', 'work', 'task', 'TASK001', 'read', '2024-01-10 09:05:00', '2024-01-10 09:00:00'),

(2, 1, 'Training Schedule', 'Vui lòng chuẩn bị kế hoạch đào tạo cho hệ thống mới',
 'task', 'medium', 'training', 'task', 'TASK002', 'read', '2024-01-12 10:35:00', '2024-01-12 10:30:00'),

(20, NULL, 'New Customer Inquiry', 'Có khách hàng mới cần hỗ trợ về sản phẩm',
 'customer_support', 'medium', 'support', 'conversation', 'CONV003', 'delivered', '2024-01-15 10:16:00', '2024-01-15 10:15:00'),

(21, NULL, 'Customer Feedback', 'Khách hàng gửi góp ý về cải tiến dịch vụ',
 'customer_support', 'low', 'feedback', 'conversation', 'CONV004', 'sent', '2024-01-15 13:46:00', '2024-01-15 13:45:00'),

(1, NULL, 'System Alert', 'Hệ thống đã xử lý thành công 1000+ yêu cầu hôm nay',
 'system', 'low', 'performance', 'system', 'daily_stats', 'delivered', '2024-01-15 18:00:00', '2024-01-15 18:00:00');

-- =====================================================
-- PERFORMANCE METRICS AND ANALYTICS
-- =====================================================

INSERT OR IGNORE INTO performance_metrics (
    metric_type, metric_name, metric_value, metric_unit, 
    entity_type, entity_id, recorded_at, tags
) VALUES

('business', 'daily_active_users', 18, 'count', 'system', 'overall', '2024-01-15 09:00:00', 'daily,users'),
('business', 'tasks_completed_today', 1, 'count', 'system', 'overall', '2024-01-15 18:00:00', 'daily,tasks'),
('business', 'customer_satisfaction_avg', 4.5, 'rating', 'system', 'overall', '2024-01-15 18:00:00', 'daily,satisfaction'),
('business', 'response_time_avg', 12.5, 'minutes', 'department', 'CS', '2024-01-15 18:00:00', 'daily,support'),

('attendance', 'attendance_rate', 94.4, 'percentage', 'system', 'overall', '2024-01-15 18:00:00', 'daily,attendance'),
('attendance', 'late_arrivals', 1, 'count', 'system', 'overall', '2024-01-15 18:00:00', 'daily,late'),

('request', 'api_requests_total', 1247, 'count', 'system', 'overall', '2024-01-15 18:00:00', 'daily,api'),
('request', 'average_response_time', 245.6, 'ms', 'system', 'overall', '2024-01-15 18:00:00', 'daily,performance');

-- =====================================================
-- BUSINESS ANALYTICS SUMMARY
-- =====================================================

INSERT OR IGNORE INTO business_analytics (
    metric_date, store_id, total_employees, present_employees, 
    absent_employees, late_employees, attendance_rate,
    tasks_created, tasks_completed, new_hires, terminations
) VALUES

('2024-01-15', 'HQ001', 6, 5, 1, 0, 83.33, 1, 0, 0, 0),
('2024-01-15', 'MC001', 3, 2, 1, 1, 66.67, 0, 1, 0, 0),
('2024-01-15', 'MC002', 2, 1, 1, 0, 50.00, 0, 0, 0, 0),
('2024-01-15', 'MC003', 2, 0, 2, 0, 0.00, 0, 0, 0, 0),
('2024-01-15', NULL, 23, 18, 5, 1, 78.26, 2, 1, 0, 0);

-- =====================================================
-- ACTIVE SESSIONS
-- =====================================================

INSERT OR IGNORE INTO sessions (
    session_token, employee_id, login_time, last_activity, 
    expires_at, ip_address, user_agent, is_mobile, is_active
) VALUES

('token_admin_001_' || strftime('%s', 'now'), 1, '2024-01-15 08:00:00', '2024-01-15 17:30:00',
 '2024-01-16 08:00:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', FALSE, TRUE),

('token_hr_001_' || strftime('%s', 'now'), 2, '2024-01-15 08:15:00', '2024-01-15 17:45:00',
 '2024-01-16 08:15:00', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', FALSE, TRUE),

('token_cs_001_' || strftime('%s', 'now'), 20, '2024-01-15 09:00:00', '2024-01-15 17:30:00',
 '2024-01-16 09:00:00', '192.168.1.120', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', FALSE, TRUE);

-- =====================================================
-- PENDING REGISTRATIONS FOR TESTING
-- =====================================================

INSERT OR IGNORE INTO pending_registrations (
    employeeId, email, password, name, department, position, 
    storeId, verification_code, status, created_at
) VALUES

('TEST001', 'test1@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Nguyễn Văn Test', 'Sales', 'Sales Associate', 'MC001', 
 'TEST1234', 'pending', '2024-01-15 10:00:00'),

('TEST002', 'test2@hrms.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
 'Trần Thị Demo', 'Operations', 'Operations Clerk', 'MC002',
 'DEMO5678', 'verified', '2024-01-15 11:00:00');

-- =====================================================
-- SHIFT ASSIGNMENTS
-- =====================================================

INSERT OR IGNORE INTO shift_assignments (
    employee_id, shift_id, assignment_date, status, assigned_by
) VALUES

(14, 1, '2024-01-16', 'scheduled', 8),  -- NV001 -> Morning Shift
(15, 1, '2024-01-16', 'scheduled', 9),  -- NV002 -> Morning Shift
(20, 1, '2024-01-16', 'scheduled', 2),  -- CS001 -> Morning Shift
(21, 2, '2024-01-16', 'scheduled', 2),  -- CS002 -> Afternoon Shift
(22, 3, '2024-01-16', 'scheduled', 8);  -- PT001 -> Part-time flexible

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Verify data integrity
SELECT 'Total Employees: ' || COUNT(*) as verification FROM employees WHERE is_active = 1;
SELECT 'Total Active Sessions: ' || COUNT(*) as verification FROM sessions WHERE is_active = 1;
SELECT 'Total Tasks: ' || COUNT(*) as verification FROM tasks;
SELECT 'Total Support Conversations: ' || COUNT(*) as verification FROM support_conversations;
SELECT 'Total Chat Messages: ' || COUNT(*) as verification FROM chat_messages;
SELECT 'Attendance Records Today: ' || COUNT(*) as verification FROM attendance WHERE date = '2024-01-15';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

INSERT OR IGNORE INTO system_config (config_key, config_value, description, category)
VALUES ('sample_data.version', '3.1.0', 'Professional sample data version', 'system');

-- Professional HR Management System Sample Data v3.1 Successfully Loaded
-- Total: 23 Active Employees, 7 Stores, 6 Tasks, 4 Support Conversations
-- Ready for comprehensive testing of all system functionality
