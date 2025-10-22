-- =====================================================
-- MIGRATION 003: EMPLOYEE STATS CACHE
-- Expected Impact: 60-80% faster for dashboard stats
-- Effort: Medium | Risk: Low
-- Priority: HIGH - Dashboard Performance
-- =====================================================

-- Create cached stats table
CREATE TABLE IF NOT EXISTS employee_stats_cache (
  employeeId TEXT PRIMARY KEY,
  totalAttendanceDays INTEGER DEFAULT 0,
  totalWorkHours REAL DEFAULT 0,
  totalLateCheckins INTEGER DEFAULT 0,
  totalEarlyCheckouts INTEGER DEFAULT 0,
  lastCheckDate TEXT,
  lastCheckTime TEXT,
  currentMonthDays INTEGER DEFAULT 0,
  lastUpdated TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_stats_updated 
ON employee_stats_cache(lastUpdated);

CREATE INDEX IF NOT EXISTS idx_employee_stats_employee 
ON employee_stats_cache(employeeId, lastUpdated);

-- Initialize with current data
INSERT OR IGNORE INTO employee_stats_cache (employeeId, totalAttendanceDays, lastCheckDate, lastUpdated)
SELECT 
  employeeId,
  COUNT(*) as totalAttendanceDays,
  MAX(checkDate) as lastCheckDate,
  datetime('now') as lastUpdated
FROM attendance
GROUP BY employeeId;

-- Trigger: Update stats after attendance insert
CREATE TRIGGER IF NOT EXISTS trg_update_stats_after_attendance_insert
AFTER INSERT ON attendance
BEGIN
  INSERT INTO employee_stats_cache (employeeId, totalAttendanceDays, lastCheckDate, lastCheckTime, lastUpdated)
  VALUES (NEW.employeeId, 1, NEW.checkDate, NEW.checkTime, datetime('now'))
  ON CONFLICT(employeeId) DO UPDATE SET
    totalAttendanceDays = totalAttendanceDays + 1,
    lastCheckDate = NEW.checkDate,
    lastCheckTime = NEW.checkTime,
    lastUpdated = datetime('now');
END;

-- Trigger: Update stats after attendance update
CREATE TRIGGER IF NOT EXISTS trg_update_stats_after_attendance_update
AFTER UPDATE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    lastCheckDate = NEW.checkDate,
    lastCheckTime = NEW.checkTime,
    lastUpdated = datetime('now')
  WHERE employeeId = NEW.employeeId;
END;

-- Trigger: Update stats after attendance delete
CREATE TRIGGER IF NOT EXISTS trg_update_stats_after_attendance_delete
AFTER DELETE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    totalAttendanceDays = totalAttendanceDays - 1,
    lastUpdated = datetime('now')
  WHERE employeeId = OLD.employeeId;
END;
