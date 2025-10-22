-- =====================================================
-- MIGRATION 004: DAILY ATTENDANCE SUMMARY
-- Expected Impact: 70-90% faster for manager dashboards
-- Effort: Medium | Risk: Low
-- Priority: HIGH - Manager Performance
-- =====================================================

-- Create daily summary table
CREATE TABLE IF NOT EXISTS daily_attendance_summary (
  summaryDate TEXT NOT NULL,
  storeId TEXT NOT NULL,
  totalEmployees INTEGER DEFAULT 0,
  presentEmployees INTEGER DEFAULT 0,
  absentEmployees INTEGER DEFAULT 0,
  lateEmployees INTEGER DEFAULT 0,
  averageCheckInTime TEXT,
  lastUpdated TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (summaryDate, storeId),
  FOREIGN KEY (storeId) REFERENCES stores(storeId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_summary_date 
ON daily_attendance_summary(summaryDate DESC);

CREATE INDEX IF NOT EXISTS idx_daily_summary_store_date 
ON daily_attendance_summary(storeId, summaryDate DESC);

-- Initialize with recent data (last 90 days)
INSERT OR IGNORE INTO daily_attendance_summary (summaryDate, storeId, totalEmployees, presentEmployees, lastUpdated)
SELECT 
  a.checkDate as summaryDate,
  e.storeId,
  (SELECT COUNT(DISTINCT employeeId) FROM employees WHERE storeId = e.storeId AND is_active = 1) as totalEmployees,
  COUNT(DISTINCT a.employeeId) as presentEmployees,
  datetime('now') as lastUpdated
FROM attendance a
JOIN employees e ON a.employeeId = e.employeeId
WHERE a.checkDate >= date('now', '-90 days')
GROUP BY a.checkDate, e.storeId;

-- Trigger: Update daily summary after attendance insert
CREATE TRIGGER IF NOT EXISTS trg_update_daily_summary_after_insert
AFTER INSERT ON attendance
BEGIN
  INSERT INTO daily_attendance_summary (
    summaryDate, 
    storeId, 
    totalEmployees, 
    presentEmployees,
    lastUpdated
  )
  SELECT 
    NEW.checkDate,
    e.storeId,
    (SELECT COUNT(*) FROM employees WHERE storeId = e.storeId AND is_active = 1),
    1,
    datetime('now')
  FROM employees e
  WHERE e.employeeId = NEW.employeeId
  ON CONFLICT(summaryDate, storeId) DO UPDATE SET
    presentEmployees = presentEmployees + 1,
    lastUpdated = datetime('now');
END;
