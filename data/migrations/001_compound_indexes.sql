-- =====================================================
-- MIGRATION 001: COMPOUND INDEXES FOR COMMON QUERIES
-- Expected Impact: 40-60% faster filtered queries
-- Effort: Low | Risk: Low
-- Priority: HIGH - Quick Win
-- =====================================================

-- Attendance queries by employee + date range
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date_range 
ON attendance(employeeId, checkDate DESC);

-- Shift assignments by employee + specific date  
CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_specific_date 
ON shift_assignments(employeeId, date);

-- Employee requests filtered by status + employee
CREATE INDEX IF NOT EXISTS idx_employee_requests_status_employee 
ON employee_requests(status, employeeId, createdAt DESC);

-- Session lookups by token + active status
CREATE INDEX IF NOT EXISTS idx_sessions_token_active 
ON sessions(session_token, is_active, expires_at);

-- Employees by store + position (for manager queries)
CREATE INDEX IF NOT EXISTS idx_employees_store_position 
ON employees(storeId, position, is_active);

-- Employees by store + active status
CREATE INDEX IF NOT EXISTS idx_employees_store_active 
ON employees(storeId, is_active, employeeId);

-- Timesheets by employee + exact period
CREATE INDEX IF NOT EXISTS idx_timesheets_employee_exact_period 
ON timesheets(employeeId, year, month);

-- Notifications by employee + unread status
CREATE INDEX IF NOT EXISTS idx_notifications_employee_unread 
ON notifications(employeeId, isRead, createdAt DESC);

-- Shift assignments by date + shift (for schedules)
CREATE INDEX IF NOT EXISTS idx_shift_assignments_date_shift 
ON shift_assignments(date, shiftId);

-- Employee requests by type + status
CREATE INDEX IF NOT EXISTS idx_employee_requests_type_status 
ON employee_requests(requestType, status, createdAt DESC);
