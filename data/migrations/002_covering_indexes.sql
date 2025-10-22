-- =====================================================
-- MIGRATION 002: COVERING INDEXES
-- Expected Impact: 20-30% faster for list queries
-- Effort: Low | Risk: Low
-- Priority: HIGH - Quick Win
-- =====================================================

-- Cover common employee list queries (no table lookup needed)
CREATE INDEX IF NOT EXISTS idx_employees_list_covering 
ON employees(is_active, position, storeId, employeeId, fullName, email);

-- Cover attendance dashboard queries
CREATE INDEX IF NOT EXISTS idx_attendance_dashboard_covering 
ON attendance(employeeId, checkDate, checkTime, checkLocation, attendanceId);

-- Cover shift assignment list queries
CREATE INDEX IF NOT EXISTS idx_shift_assignments_list_covering 
ON shift_assignments(date, employeeId, shiftId, assignmentId);

-- Cover request list queries
CREATE INDEX IF NOT EXISTS idx_employee_requests_list_covering 
ON employee_requests(status, employeeId, requestType, title, createdAt, requestId);
