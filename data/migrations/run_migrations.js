// =====================================================
// DATABASE MIGRATION RUNNER
// Run high-priority database optimizations
// =====================================================

/**
 * Apply database migrations in order
 * @param {D1Database} db - Cloudflare D1 database instance
 * @param {Array<string>} migrations - Array of migration numbers to run (e.g., ['001', '002'])
 */
export async function runMigrations(db, migrations = ['001', '002', '003', '004']) {
  const results = [];
  
  for (const migrationNumber of migrations) {
    try {
      console.log(`Running migration ${migrationNumber}...`);
      const sqlContent = await getMigrationSQL(migrationNumber);
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      // Execute each statement
      for (const statement of statements) {
        try {
          await db.prepare(statement).run();
        } catch (error) {
          console.error(`Error in statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
      
      results.push({
        migration: migrationNumber,
        status: 'success',
        message: `Migration ${migrationNumber} completed successfully`
      });
      
      console.log(`✅ Migration ${migrationNumber} completed`);
    } catch (error) {
      results.push({
        migration: migrationNumber,
        status: 'error',
        message: error.message
      });
      
      console.error(`❌ Migration ${migrationNumber} failed:`, error);
      // Continue with other migrations
    }
  }
  
  return results;
}

/**
 * Get SQL content for a migration (placeholder - actual content should be in worker-service.js)
 */
function getMigrationSQL(migrationNumber) {
  const migrations = {
    '001': MIGRATION_001_COMPOUND_INDEXES,
    '002': MIGRATION_002_COVERING_INDEXES,
    '003': MIGRATION_003_STATS_CACHE,
    '004': MIGRATION_004_DAILY_SUMMARY
  };
  
  return migrations[migrationNumber] || '';
}

// =====================================================
// MIGRATION SQL CONTENT
// =====================================================

const MIGRATION_001_COMPOUND_INDEXES = `
-- Compound Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date_range ON attendance(employeeId, checkDate DESC);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_specific_date ON shift_assignments(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_employee_requests_status_employee ON employee_requests(status, employeeId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_token_active ON sessions(session_token, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_employees_store_position ON employees(storeId, position, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_store_active ON employees(storeId, is_active, employeeId);
CREATE INDEX IF NOT EXISTS idx_timesheets_employee_exact_period ON timesheets(employeeId, year, month);
CREATE INDEX IF NOT EXISTS idx_notifications_employee_unread ON notifications(employeeId, isRead, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_date_shift ON shift_assignments(date, shiftId);
CREATE INDEX IF NOT EXISTS idx_employee_requests_type_status ON employee_requests(requestType, status, createdAt DESC);
`;

const MIGRATION_002_COVERING_INDEXES = `
-- Covering Indexes
CREATE INDEX IF NOT EXISTS idx_employees_list_covering ON employees(is_active, position, storeId, employeeId, fullName, email);
CREATE INDEX IF NOT EXISTS idx_attendance_dashboard_covering ON attendance(employeeId, checkDate, checkTime, checkLocation, attendanceId);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_list_covering ON shift_assignments(date, employeeId, shiftId, assignmentId);
CREATE INDEX IF NOT EXISTS idx_employee_requests_list_covering ON employee_requests(status, employeeId, requestType, title, createdAt, requestId);
`;

const MIGRATION_003_STATS_CACHE = `
-- Employee Stats Cache Table
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
CREATE INDEX IF NOT EXISTS idx_employee_stats_updated ON employee_stats_cache(lastUpdated);
CREATE INDEX IF NOT EXISTS idx_employee_stats_employee ON employee_stats_cache(employeeId, lastUpdated);
`;

const MIGRATION_004_DAILY_SUMMARY = `
-- Daily Attendance Summary Table
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
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_attendance_summary(summaryDate DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summary_store_date ON daily_attendance_summary(storeId, summaryDate DESC);
`;

export { MIGRATION_001_COMPOUND_INDEXES, MIGRATION_002_COVERING_INDEXES, MIGRATION_003_STATS_CACHE, MIGRATION_004_DAILY_SUMMARY };
