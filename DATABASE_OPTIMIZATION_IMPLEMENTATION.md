# Database Optimization Implementation Guide

## 📋 Ready-to-Use SQL Migration Scripts

This guide provides production-ready SQL scripts for implementing database optimizations.

---

## Phase 1: Quick Wins (Compound Indexes)

### Migration 001: Add Compound Indexes

```sql
-- =====================================================
-- MIGRATION 001: COMPOUND INDEXES FOR COMMON QUERIES
-- Expected Impact: 40-60% faster filtered queries
-- Effort: Low | Risk: Low
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
```

**Rollback Script:**
```sql
DROP INDEX IF EXISTS idx_attendance_employee_date_range;
DROP INDEX IF EXISTS idx_shift_assignments_employee_specific_date;
DROP INDEX IF EXISTS idx_employee_requests_status_employee;
DROP INDEX IF EXISTS idx_sessions_token_active;
DROP INDEX IF EXISTS idx_employees_store_position;
DROP INDEX IF EXISTS idx_employees_store_active;
DROP INDEX IF EXISTS idx_timesheets_employee_exact_period;
DROP INDEX IF EXISTS idx_notifications_employee_unread;
DROP INDEX IF EXISTS idx_shift_assignments_date_shift;
DROP INDEX IF EXISTS idx_employee_requests_type_status;
```

---

### Migration 002: Covering Indexes

```sql
-- =====================================================
-- MIGRATION 002: COVERING INDEXES
-- Expected Impact: 20-30% faster for list queries
-- Effort: Low | Risk: Low
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
```

**Rollback Script:**
```sql
DROP INDEX IF EXISTS idx_employees_list_covering;
DROP INDEX IF EXISTS idx_attendance_dashboard_covering;
DROP INDEX IF EXISTS idx_shift_assignments_list_covering;
DROP INDEX IF EXISTS idx_employee_requests_list_covering;
```

---

## Phase 2: Summary Tables & Caching

### Migration 003: Employee Stats Cache Table

```sql
-- =====================================================
-- MIGRATION 003: EMPLOYEE STATS CACHE
-- Expected Impact: 60-80% faster for dashboard stats
-- Effort: Medium | Risk: Low
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
CREATE TRIGGER IF NOT EXISTS update_employee_stats_after_attendance_insert
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
CREATE TRIGGER IF NOT EXISTS update_employee_stats_after_attendance_update
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
CREATE TRIGGER IF NOT EXISTS update_employee_stats_after_attendance_delete
AFTER DELETE ON attendance
BEGIN
  UPDATE employee_stats_cache 
  SET 
    totalAttendanceDays = totalAttendanceDays - 1,
    lastUpdated = datetime('now')
  WHERE employeeId = OLD.employeeId;
END;
```

**Usage in Controller:**
```javascript
// BEFORE: Expensive aggregation
const stats = await db.prepare(`
  SELECT 
    COUNT(*) as totalDays,
    MAX(checkDate) as lastCheck
  FROM attendance 
  WHERE employeeId = ?
`).bind(employeeId).first();

// AFTER: Instant lookup
const stats = await db.prepare(`
  SELECT * FROM employee_stats_cache WHERE employeeId = ?
`).bind(employeeId).first();
```

**Rollback Script:**
```sql
DROP TRIGGER IF EXISTS update_employee_stats_after_attendance_insert;
DROP TRIGGER IF EXISTS update_employee_stats_after_attendance_update;
DROP TRIGGER IF EXISTS update_employee_stats_after_attendance_delete;
DROP INDEX IF EXISTS idx_employee_stats_updated;
DROP INDEX IF EXISTS idx_employee_stats_employee;
DROP TABLE IF EXISTS employee_stats_cache;
```

---

### Migration 004: Daily Attendance Summary

```sql
-- =====================================================
-- MIGRATION 004: DAILY ATTENDANCE SUMMARY
-- Expected Impact: 70-90% faster for manager dashboards
-- Effort: Medium | Risk: Low
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

-- Function to rebuild daily summary (call periodically or on-demand)
-- Note: Execute via worker-service.js
```

**Rebuild Function (JavaScript):**
```javascript
async function rebuildDailySummary(db, date, storeId) {
  const summary = await db.prepare(`
    SELECT 
      ? as summaryDate,
      e.storeId,
      COUNT(DISTINCT e.employeeId) as totalEmployees,
      COUNT(DISTINCT a.employeeId) as presentEmployees,
      (COUNT(DISTINCT e.employeeId) - COUNT(DISTINCT a.employeeId)) as absentEmployees,
      SUM(CASE WHEN TIME(a.checkTime) > '09:00:00' THEN 1 ELSE 0 END) as lateEmployees,
      AVG(TIME(a.checkTime)) as averageCheckInTime
    FROM employees e
    LEFT JOIN attendance a ON e.employeeId = a.employeeId AND a.checkDate = ?
    WHERE e.storeId = ? AND e.is_active = 1
    GROUP BY e.storeId
  `).bind(date, date, storeId).first();

  await db.prepare(`
    INSERT OR REPLACE INTO daily_attendance_summary 
    (summaryDate, storeId, totalEmployees, presentEmployees, absentEmployees, lateEmployees, averageCheckInTime, lastUpdated)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    summary.summaryDate,
    summary.storeId,
    summary.totalEmployees,
    summary.presentEmployees,
    summary.absentEmployees,
    summary.lateEmployees,
    summary.averageCheckInTime
  ).run();
}
```

**Rollback Script:**
```sql
DROP INDEX IF EXISTS idx_daily_summary_date;
DROP INDEX IF EXISTS idx_daily_summary_store_date;
DROP TABLE IF EXISTS daily_attendance_summary;
```

---

## Phase 3: Advanced Optimizations

### Migration 005: Data Archiving Tables

```sql
-- =====================================================
-- MIGRATION 005: DATA ARCHIVING
-- Expected Impact: 30-50% faster for current data queries
-- Effort: Medium | Risk: Medium
-- =====================================================

-- Archive table for old attendance (> 1 year)
CREATE TABLE IF NOT EXISTS attendance_archive (
  attendanceId INTEGER PRIMARY KEY,
  employeeId TEXT NOT NULL,
  checkDate TEXT NOT NULL,
  checkTime TEXT NOT NULL,
  checkLocation TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  archiveYear INTEGER NOT NULL,
  archivedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_archive_employee 
ON attendance_archive(employeeId, archiveYear);

CREATE INDEX IF NOT EXISTS idx_attendance_archive_year 
ON attendance_archive(archiveYear, checkDate);

-- Archive table for old employee requests
CREATE TABLE IF NOT EXISTS employee_requests_archive (
  requestId INTEGER PRIMARY KEY,
  employeeId TEXT NOT NULL,
  requestType TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT,
  createdAt TEXT,
  archiveYear INTEGER NOT NULL,
  archivedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_employee_requests_archive_employee 
ON employee_requests_archive(employeeId, archiveYear);

CREATE INDEX IF NOT EXISTS idx_employee_requests_archive_year 
ON employee_requests_archive(archiveYear);
```

**Archive Function (JavaScript):**
```javascript
async function archiveOldData(db, cutoffDate = '2024-01-01') {
  // Archive old attendance
  await db.prepare(`
    INSERT INTO attendance_archive 
    SELECT 
      attendanceId, employeeId, checkDate, checkTime, checkLocation,
      createdAt, updatedAt,
      CAST(strftime('%Y', checkDate) AS INTEGER) as archiveYear,
      datetime('now') as archivedAt
    FROM attendance 
    WHERE checkDate < ?
  `).bind(cutoffDate).run();

  await db.prepare(`DELETE FROM attendance WHERE checkDate < ?`).bind(cutoffDate).run();

  console.log(`Archived attendance data older than ${cutoffDate}`);
}
```

**Rollback Script:**
```sql
-- Restore from archive if needed
INSERT INTO attendance SELECT attendanceId, employeeId, checkDate, checkTime, checkLocation, createdAt, updatedAt FROM attendance_archive;

DROP INDEX IF EXISTS idx_attendance_archive_employee;
DROP INDEX IF EXISTS idx_attendance_archive_year;
DROP INDEX IF EXISTS idx_employee_requests_archive_employee;
DROP INDEX IF EXISTS idx_employee_requests_archive_year;
DROP TABLE IF EXISTS attendance_archive;
DROP TABLE IF EXISTS employee_requests_archive;
```

---

### Migration 006: Full-Text Search (FTS5)

```sql
-- =====================================================
-- MIGRATION 006: FULL-TEXT SEARCH
-- Expected Impact: 70-90% faster search queries
-- Effort: Medium | Risk: Low
-- =====================================================

-- Create FTS5 virtual table for employee search
CREATE VIRTUAL TABLE IF NOT EXISTS employees_fts USING fts5(
  employeeId,
  fullName,
  email,
  phone,
  position,
  content='employees',
  content_rowid='rowid'
);

-- Populate FTS table
INSERT INTO employees_fts(rowid, employeeId, fullName, email, phone, position)
SELECT rowid, employeeId, fullName, email, phone, position FROM employees;

-- Trigger: Keep FTS in sync on insert
CREATE TRIGGER IF NOT EXISTS employees_fts_insert 
AFTER INSERT ON employees
BEGIN
  INSERT INTO employees_fts(rowid, employeeId, fullName, email, phone, position)
  VALUES (NEW.rowid, NEW.employeeId, NEW.fullName, NEW.email, NEW.phone, NEW.position);
END;

-- Trigger: Keep FTS in sync on update
CREATE TRIGGER IF NOT EXISTS employees_fts_update 
AFTER UPDATE ON employees
BEGIN
  UPDATE employees_fts SET 
    employeeId = NEW.employeeId,
    fullName = NEW.fullName,
    email = NEW.email,
    phone = NEW.phone,
    position = NEW.position
  WHERE rowid = OLD.rowid;
END;

-- Trigger: Keep FTS in sync on delete
CREATE TRIGGER IF NOT EXISTS employees_fts_delete 
AFTER DELETE ON employees
BEGIN
  DELETE FROM employees_fts WHERE rowid = OLD.rowid;
END;
```

**Usage in Controller:**
```javascript
// BEFORE: Slow LIKE query
const employees = await db.prepare(`
  SELECT * FROM employees 
  WHERE fullName LIKE ? OR email LIKE ? OR employeeId LIKE ?
`).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();

// AFTER: Fast FTS5 search
const employees = await db.prepare(`
  SELECT e.* FROM employees e
  JOIN employees_fts fts ON e.rowid = fts.rowid
  WHERE employees_fts MATCH ?
  ORDER BY rank
  LIMIT 50
`).bind(query + '*').all();
```

**Rollback Script:**
```sql
DROP TRIGGER IF EXISTS employees_fts_insert;
DROP TRIGGER IF EXISTS employees_fts_update;
DROP TRIGGER IF EXISTS employees_fts_delete;
DROP TABLE IF EXISTS employees_fts;
```

---

### Migration 007: Denormalized Fields

```sql
-- =====================================================
-- MIGRATION 007: DENORMALIZATION FOR READ PERFORMANCE
-- Expected Impact: 40-60% faster for complex reads
-- Effort: High | Risk: Medium
-- =====================================================

-- Add denormalized fields to attendance table
ALTER TABLE attendance ADD COLUMN employeeName TEXT;
ALTER TABLE attendance ADD COLUMN storeName TEXT;

-- Populate existing data
UPDATE attendance SET 
  employeeName = (SELECT fullName FROM employees WHERE employees.employeeId = attendance.employeeId),
  storeName = (SELECT s.storeName FROM employees e 
               JOIN stores s ON e.storeId = s.storeId 
               WHERE e.employeeId = attendance.employeeId);

-- Trigger: Sync denormalized data on insert
CREATE TRIGGER IF NOT EXISTS sync_attendance_denorm_insert
AFTER INSERT ON attendance
BEGIN
  UPDATE attendance 
  SET 
    employeeName = (SELECT fullName FROM employees WHERE employeeId = NEW.employeeId),
    storeName = (SELECT s.storeName FROM employees e 
                 JOIN stores s ON e.storeId = s.storeId 
                 WHERE e.employeeId = NEW.employeeId)
  WHERE attendanceId = NEW.attendanceId;
END;

-- Trigger: Sync when employee name changes
CREATE TRIGGER IF NOT EXISTS sync_attendance_denorm_employee_update
AFTER UPDATE OF fullName ON employees
BEGIN
  UPDATE attendance 
  SET employeeName = NEW.fullName
  WHERE employeeId = NEW.employeeId;
END;
```

**Usage:**
```javascript
// BEFORE: JOIN required
SELECT a.*, e.fullName, s.storeName
FROM attendance a
JOIN employees e ON a.employeeId = e.employeeId
JOIN stores s ON e.storeId = s.storeId
WHERE a.checkDate = ?;

// AFTER: Direct select, no JOINs
SELECT * FROM attendance WHERE checkDate = ?;
// employeeName and storeName already in the row!
```

**Rollback Script:**
```sql
DROP TRIGGER IF EXISTS sync_attendance_denorm_insert;
DROP TRIGGER IF EXISTS sync_attendance_denorm_employee_update;

-- Note: Cannot easily remove columns in SQLite
-- Would need to recreate table without these columns
```

---

## 🚀 Deployment Guide

### Step 1: Backup Database
```bash
# Backup before any migration
cloudflare d1 export <database_name> --output backup-$(date +%Y%m%d).sql
```

### Step 2: Apply Migrations Sequentially
```bash
# Apply Phase 1 migrations
cloudflare d1 execute <database_name> --file migration-001-compound-indexes.sql
cloudflare d1 execute <database_name> --file migration-002-covering-indexes.sql

# Test performance improvements
# If satisfied, continue to Phase 2

cloudflare d1 execute <database_name> --file migration-003-stats-cache.sql
cloudflare d1 execute <database_name> --file migration-004-daily-summary.sql
```

### Step 3: Monitor & Validate
```javascript
// Add monitoring to worker-service.js
const perfMonitor = new PerformanceMonitor();

// Before query
const start = Date.now();
const result = await db.prepare(query).bind(...params).all();
const duration = Date.now() - start;

perfMonitor.logQuery(query, duration);

// Review logs for improvements
```

### Step 4: Progressive Rollout
1. Apply to development environment first
2. Run load tests
3. Apply to staging
4. Monitor for 24 hours
5. Apply to production during low-traffic period

---

## 📊 Performance Testing

### Test Script
```javascript
async function benchmarkQueries(db) {
  const tests = [
    {
      name: 'Employee List',
      query: 'SELECT * FROM employees WHERE is_active = 1 LIMIT 100'
    },
    {
      name: 'Attendance History',
      query: 'SELECT * FROM attendance WHERE employeeId = ? ORDER BY checkDate DESC LIMIT 50',
      params: ['NV001']
    },
    {
      name: 'Dashboard Stats',
      query: 'SELECT * FROM employee_stats_cache WHERE employeeId = ?',
      params: ['NV001']
    }
  ];

  for (const test of tests) {
    const start = Date.now();
    await db.prepare(test.query).bind(...(test.params || [])).all();
    const duration = Date.now() - start;
    console.log(`${test.name}: ${duration}ms`);
  }
}
```

---

## ✅ Checklist

### Phase 1 (Week 1-2):
- [ ] Backup database
- [ ] Apply Migration 001 (Compound Indexes)
- [ ] Apply Migration 002 (Covering Indexes)
- [ ] Run performance tests
- [ ] Monitor for 48 hours
- [ ] Document improvements

### Phase 2 (Week 3-4):
- [ ] Apply Migration 003 (Stats Cache)
- [ ] Apply Migration 004 (Daily Summary)
- [ ] Update controller functions to use cache tables
- [ ] Run performance tests
- [ ] Monitor for 1 week
- [ ] Document improvements

### Phase 3 (Week 5-6):
- [ ] Apply Migration 005 (Data Archiving)
- [ ] Apply Migration 006 (FTS5 Search)
- [ ] Apply Migration 007 (Denormalization) - Optional
- [ ] Update search endpoints to use FTS5
- [ ] Set up archiving cron job
- [ ] Run full system tests
- [ ] Monitor for 2 weeks
- [ ] Document final improvements

---

## 🎉 Expected Results

**After Full Implementation:**
- Employee queries: 75% faster
- Attendance queries: 70% faster  
- Dashboard loads: 90% faster
- Search: 90% faster with FTS5
- Overall database performance: **80-90% improvement**

**Combined with Phase 3 optimizations (KV cache, query batching):**
- **Total system improvement: 90-95%** 🚀
