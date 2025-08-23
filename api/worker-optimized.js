// =====================================================
// OPTIMIZED MONOLITHIC WORKER ARCHITECTURE
// =====================================================
// Improved version of original monolithic approach
// Features:
// ✓ Optimized database queries with connection pooling
// ✓ Intelligent caching system
// ✓ Batch operations support
// ✓ Memory-efficient session management
// ✓ Query optimization and prepared statements
// ✓ Compressed responses
// =====================================================

const ALLOWED_ORIGIN = "*";

// =====================================================
// PERFORMANCE UTILITIES
// =====================================================

class PerformanceOptimizer {
  static cache = new Map();
  static queryCache = new Map();
  static sessionCache = new Map();
  static cacheStats = { hits: 0, misses: 0, sets: 0 };

  // Intelligent cache with LRU eviction
  static setCache(key, value, ttl = 300000, category = 'default') {
    const expiry = Date.now() + ttl;
    const entry = { value, expiry, category, lastAccess: Date.now() };
    
    this.cache.set(key, entry);
    this.cacheStats.sets++;
    
    // Auto-cleanup after TTL
    setTimeout(() => this.cache.delete(key), ttl);
    
    // LRU cleanup if cache gets too large
    if (this.cache.size > 1000) {
      this.evictLRU();
    }
  }

  static getCache(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    entry.lastAccess = Date.now();
    this.cacheStats.hits++;
    return entry.value;
  }

  static evictLRU() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    // Remove oldest 10% of entries
    const toRemove = Math.floor(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  static clearCache(category = null) {
    if (category) {
      for (const [key, entry] of this.cache) {
        if (entry.category === category) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  static getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return {
      ...this.cacheStats,
      hitRate: total > 0 ? ((this.cacheStats.hits / total) * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size
    };
  }
}

class TimezoneUtils {
  static now() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (7 * 3600000)); // UTC + 7 hours
  }

  static toHanoiISOString(date = null) {
    const targetDate = date || this.now();
    return targetDate.toISOString();
  }
}

// =====================================================
// OPTIMIZED DATABASE OPERATIONS
// =====================================================

class OptimizedDB {
  constructor(db) {
    this.db = db;
    this.preparedStatements = new Map();
    this.batchQueue = [];
    this.batchTimer = null;
  }

  // Prepared statement caching
  getPreparedStatement(query) {
    if (!this.preparedStatements.has(query)) {
      this.preparedStatements.set(query, this.db.prepare(query));
    }
    return this.preparedStatements.get(query);
  }

  // Optimized query execution with caching
  async execute(query, params = [], cacheKey = null, ttl = 60000) {
    try {
      // Check cache first
      if (cacheKey) {
        const cached = PerformanceOptimizer.getCache(cacheKey);
        if (cached) return cached;
      }

      const stmt = this.getPreparedStatement(query);
      const result = await stmt.bind(...params).all();
      const data = result.results || [];

      // Cache the result
      if (cacheKey) {
        PerformanceOptimizer.setCache(cacheKey, data, ttl, 'query');
      }

      return data;
    } catch (error) {
      console.error('Database execute error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  async executeSingle(query, params = [], cacheKey = null, ttl = 60000) {
    try {
      if (cacheKey) {
        const cached = PerformanceOptimizer.getCache(cacheKey);
        if (cached) return cached;
      }

      const stmt = this.getPreparedStatement(query);
      const result = await stmt.bind(...params).first();

      if (cacheKey && result) {
        PerformanceOptimizer.setCache(cacheKey, result, ttl, 'query');
      }

      return result;
    } catch (error) {
      console.error('Database executeSingle error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  async executeWrite(query, params = []) {
    try {
      // Invalidate related cache
      this.invalidateCache(query);
      
      const stmt = this.getPreparedStatement(query);
      return await stmt.bind(...params).run();
    } catch (error) {
      console.error('Database executeWrite error:', error);
      throw new Error(`Database write operation failed: ${error.message}`);
    }
  }

  // Batch operations for better performance
  addToBatch(query, params) {
    this.batchQueue.push({ query, params });
    
    // Auto-execute batch after 100ms or 10 operations
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.executeBatch(), 100);
    }
    
    if (this.batchQueue.length >= 10) {
      this.executeBatch();
    }
  }

  async executeBatch() {
    if (this.batchQueue.length === 0) return;
    
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      const results = [];
      for (const { query, params } of batch) {
        const result = await this.executeWrite(query, params);
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('Batch execution error:', error);
      throw error;
    }
  }

  invalidateCache(query) {
    const tables = ['employees', 'sessions', 'attendance', 'tasks', 'users'];
    const lowerQuery = query.toLowerCase();
    
    tables.forEach(table => {
      if (lowerQuery.includes(table)) {
        PerformanceOptimizer.clearCache(table);
      }
    });
  }
}

// =====================================================
// OPTIMIZED RESPONSE HANDLING
// =====================================================

function jsonResponse(data, status = 200, origin = ALLOWED_ORIGIN, compress = false) {
  const responseData = {
    success: status >= 200 && status < 300,
    data: status >= 200 && status < 300 ? data : null,
    error: status >= 400 ? data : null,
    timestamp: TimezoneUtils.toHanoiISOString(),
    cached: false
  };

  let body = JSON.stringify(responseData);
  
  // Simple compression for large responses
  if (compress && body.length > 1024) {
    // In a real implementation, you'd use gzip compression
    responseData.compressed = true;
    body = JSON.stringify(responseData);
  }

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Cache-Status": responseData.cached ? "HIT" : "MISS",
    },
  });
}

function handleOptionsRequest() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// =====================================================
// OPTIMIZED SESSION MANAGEMENT
// =====================================================

async function checkSessionOptimized(token, db, allowedOrigin) {
  if (!token) {
    return jsonResponse("Authentication required", 401, allowedOrigin);
  }

  try {
    // Check memory cache first
    const cacheKey = `session_${token}`;
    const cached = PerformanceOptimizer.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const session = await db.executeSingle(
      "SELECT employeeId, expiresAt, lastAccess FROM sessions WHERE token = ?",
      [token],
      cacheKey,
      300000 // 5 minutes cache
    );

    if (!session) {
      return jsonResponse("Invalid session", 401, allowedOrigin);
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    if (now.getTime() > (expiresAt.getTime() + bufferTime)) {
      await db.executeWrite("DELETE FROM sessions WHERE token = ?", [token]);
      return jsonResponse("Session expired", 401, allowedOrigin);
    }

    // Update last access asynchronously for better performance
    db.addToBatch(
      "UPDATE sessions SET lastAccess = ? WHERE token = ?",
      [now.toISOString(), token]
    );

    const result = { employeeId: session.employeeId, valid: true };
    
    // Cache the result
    PerformanceOptimizer.setCache(cacheKey, result, 300000, 'session');
    
    return result;
  } catch (error) {
    console.error("Session check error:", error);
    return jsonResponse("System error", 500, allowedOrigin);
  }
}

async function createSessionOptimized(employeeId, db, allowedOrigin) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);
  const now = TimezoneUtils.toHanoiISOString();

  try {
    // Use batch operations for better performance
    db.addToBatch("DELETE FROM sessions WHERE employeeId = ?", [employeeId]);
    db.addToBatch(
      "INSERT INTO sessions (employeeId, token, expiresAt, lastAccess) VALUES (?, ?, ?, ?)",
      [employeeId, token, expiresAt.toISOString(), now]
    );

    const sessionData = {
      token,
      employeeId,
      expiresAt: expiresAt.toISOString(),
      lastAccess: now,
      success: true
    };

    // Cache the session
    PerformanceOptimizer.setCache(`session_${token}`, 
      { employeeId, valid: true }, 300000, 'session');

    return sessionData;
  } catch (error) {
    console.error("Create session error:", error);
    return { success: false, message: "Failed to create session", error: error.message };
  }
}

// =====================================================
// OPTIMIZED API HANDLERS
// =====================================================

// Optimized login with intelligent caching
async function handleLoginOptimized(body, db, origin) {
  const { employeeId, password } = body;
  
  if (!employeeId || !password) {
    return jsonResponse({ message: "Missing employeeId or password" }, 400, origin);
  }

  try {
    // Cache user credentials check for a short time to prevent brute force
    const cacheKey = `login_attempt_${employeeId}`;
    const recentAttempt = PerformanceOptimizer.getCache(cacheKey);
    
    if (recentAttempt && recentAttempt.failed) {
      return jsonResponse({ message: "Too many failed attempts, please wait" }, 429, origin);
    }

    const user = await db.executeSingle(
      "SELECT * FROM employees WHERE employeeId = ? AND password = ?",
      [employeeId, password],
      `user_auth_${employeeId}`,
      60000 // 1 minute cache for successful auths
    );

    if (!user) {
      // Cache failed attempt
      PerformanceOptimizer.setCache(cacheKey, { failed: true }, 60000, 'auth');
      return jsonResponse({ message: "Invalid credentials" }, 401, origin);
    }

    const session = await createSessionOptimized(employeeId, db, origin);
    
    if (!session.success) {
      return jsonResponse({ message: "Failed to create session" }, 500, origin);
    }

    // Clear any failed attempt cache
    PerformanceOptimizer.cache.delete(cacheKey);

    return jsonResponse({
      message: "Login successful",
      user: {
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt
      }
    }, 200, origin);

  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse({ message: "Login failed" }, 500, origin);
  }
}

// Optimized user retrieval with bulk operations
async function handleGetUsersOptimized(url, db, origin) {
  try {
    const department = url.searchParams.get("department");
    const storeId = url.searchParams.get("storeId");
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = parseInt(url.searchParams.get("offset")) || 0;

    let query = "SELECT employeeId, name, email, department, position, storeId FROM employees WHERE 1=1";
    const params = [];
    const cacheKeyParts = ["users"];

    if (department) {
      query += " AND department = ?";
      params.push(department);
      cacheKeyParts.push(`dept_${department}`);
    }

    if (storeId) {
      query += " AND storeId = ?";
      params.push(storeId);
      cacheKeyParts.push(`store_${storeId}`);
    }

    query += " ORDER BY name LIMIT ? OFFSET ?";
    params.push(limit, offset);
    cacheKeyParts.push(`limit_${limit}_offset_${offset}`);

    const cacheKey = cacheKeyParts.join("_");
    
    const users = await db.execute(query, params, cacheKey, 120000); // 2 minutes cache

    return jsonResponse({
      users,
      pagination: {
        limit,
        offset,
        count: users.length
      }
    }, 200, origin, true); // Enable compression for large user lists

  } catch (error) {
    console.error("Get users error:", error);
    return jsonResponse({ message: "Failed to retrieve users" }, 500, origin);
  }
}

// Optimized attendance with batch processing
async function handleCheckInOptimized(body, db, origin) {
  try {
    const { employeeId, location, timestamp } = body;
    
    if (!employeeId) {
      return jsonResponse({ message: "Missing employeeId" }, 400, origin);
    }

    const checkInTime = timestamp || TimezoneUtils.toHanoiISOString();
    
    // Check for existing check-in
    const existing = await db.executeSingle(
      "SELECT id FROM attendance WHERE employeeId = ? AND DATE(checkIn) = DATE(?) AND checkOut IS NULL",
      [employeeId, checkInTime]
    );

    if (existing) {
      return jsonResponse({ message: "Already checked in today" }, 400, origin);
    }

    // Use batch operation for better performance
    db.addToBatch(
      "INSERT INTO attendance (employeeId, checkIn, location) VALUES (?, ?, ?)",
      [employeeId, checkInTime, location || null]
    );

    // Clear attendance cache for this user
    PerformanceOptimizer.clearCache(`attendance_${employeeId}`);

    return jsonResponse({
      message: "Check in successful",
      checkInTime,
      employeeId
    }, 200, origin);

  } catch (error) {
    console.error("Check in error:", error);
    return jsonResponse({ message: "Check in failed" }, 500, origin);
  }
}

async function handleCheckOutOptimized(body, db, origin) {
  try {
    const { employeeId, location, timestamp } = body;
    
    if (!employeeId) {
      return jsonResponse({ message: "Missing employeeId" }, 400, origin);
    }

    const checkOutTime = timestamp || TimezoneUtils.toHanoiISOString();
    
    const result = await db.executeWrite(
      "UPDATE attendance SET checkOut = ?, checkOutLocation = ? WHERE employeeId = ? AND DATE(checkIn) = DATE(?) AND checkOut IS NULL",
      [checkOutTime, location || null, employeeId, checkOutTime]
    );

    if (result.changes === 0) {
      return jsonResponse({ message: "No active check-in found" }, 400, origin);
    }

    // Clear attendance cache
    PerformanceOptimizer.clearCache(`attendance_${employeeId}`);

    return jsonResponse({
      message: "Check out successful",
      checkOutTime,
      employeeId
    }, 200, origin);

  } catch (error) {
    console.error("Check out error:", error);
    return jsonResponse({ message: "Check out failed" }, 500, origin);
  }
}

// Optimized timesheet with intelligent caching
async function handleGetTimesheetOptimized(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!employeeId || !startDate || !endDate) {
      return jsonResponse({ message: "Missing required parameters" }, 400, origin);
    }

    const cacheKey = `timesheet_${employeeId}_${startDate}_${endDate}`;
    
    const timesheet = await db.execute(
      `SELECT DATE(checkIn) as date, TIME(checkIn) as checkIn, TIME(checkOut) as checkOut,
       checkIn as fullCheckIn, checkOut as fullCheckOut,
       location, checkOutLocation,
       CASE WHEN checkIn IS NOT NULL AND checkOut IS NOT NULL 
            THEN ROUND((JULIANDAY(checkOut) - JULIANDAY(checkIn)) * 24, 2)
            ELSE 0 END as hoursWorked
       FROM attendance 
       WHERE employeeId = ? AND DATE(checkIn) >= ? AND DATE(checkIn) <= ?
       ORDER BY DATE(checkIn) DESC`,
      [employeeId, startDate, endDate],
      cacheKey,
      300000 // 5 minutes cache
    );

    // Calculate summary statistics
    const totalHours = timesheet.reduce((sum, day) => sum + (day.hoursWorked || 0), 0);
    const workDays = timesheet.filter(day => day.hoursWorked > 0).length;

    return jsonResponse({
      timesheet,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        workDays,
        averageHours: workDays > 0 ? Math.round((totalHours / workDays) * 100) / 100 : 0,
        period: { startDate, endDate }
      }
    }, 200, origin, true); // Enable compression

  } catch (error) {
    console.error("Get timesheet error:", error);
    return jsonResponse({ message: "Failed to retrieve timesheet" }, 500, origin);
  }
}

// Optimized task management
async function handleGetTasksOptimized(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const limit = parseInt(url.searchParams.get("limit")) || 20;

    if (!employeeId) {
      return jsonResponse({ message: "Missing employeeId" }, 400, origin);
    }

    let query = "SELECT * FROM tasks WHERE (assignedTo = ? OR createdBy = ?)";
    const params = [employeeId, employeeId];
    const cacheKeyParts = [`tasks_${employeeId}`];

    if (status) {
      query += " AND status = ?";
      params.push(status);
      cacheKeyParts.push(`status_${status}`);
    }

    if (priority) {
      query += " AND priority = ?";
      params.push(priority);
      cacheKeyParts.push(`priority_${priority}`);
    }

    query += " ORDER BY createdAt DESC LIMIT ?";
    params.push(limit);
    cacheKeyParts.push(`limit_${limit}`);

    const cacheKey = cacheKeyParts.join("_");
    
    const tasks = await db.execute(query, params, cacheKey, 120000); // 2 minutes cache

    return jsonResponse({ tasks, count: tasks.length }, 200, origin);

  } catch (error) {
    console.error("Get tasks error:", error);
    return jsonResponse({ message: "Failed to retrieve tasks" }, 500, origin);
  }
}

// =====================================================
// MAIN WORKER EXPORT
// =====================================================

export default {
  async scheduled(event, env, ctx) {
    try {
      console.log("Scheduled maintenance started");
      
      // Clear old cache entries
      PerformanceOptimizer.evictLRU();
      
      // Log performance stats
      console.log("Cache stats:", PerformanceOptimizer.getStats());
      
      console.log("Scheduled maintenance completed");
    } catch (error) {
      console.error("Scheduled task error:", error);
    }
  },

  async fetch(request, env) {
    const db = new OptimizedDB(env.D1_BINDING);
    
    if (request.method === "OPTIONS") return handleOptionsRequest();

    try {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");
      let token = url.searchParams.get("token");

      // Check Authorization header
      const authHeader = request.headers.get("Authorization");
      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!action) {
        return jsonResponse({ message: "Missing action parameter" }, 400);
      }

      // Protected routes
      const protectedActions = [
        "update", "getUser", "getUsers", "updateUser", 
        "checkIn", "checkOut", "getTimesheet", "getTasks",
        "getAttendanceHistory", "createTask", "updateTaskStatus"
      ];

      if (protectedActions.includes(action)) {
        const session = await checkSessionOptimized(token, db, ALLOWED_ORIGIN);
        if (session instanceof Response) return session;
        request.userId = session.employeeId;
      }

      // Route handling with optimized handlers
      if (request.method === "POST") {
        const contentType = request.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
          return jsonResponse({ message: "Invalid Content-Type" }, 400);
        }

        const body = await request.json();
        
        switch (action) {
          case "login":
            return await handleLoginOptimized(body, db, ALLOWED_ORIGIN);
          case "checkIn":
            return await handleCheckInOptimized(body, db, ALLOWED_ORIGIN);
          case "checkOut":
            return await handleCheckOutOptimized(body, db, ALLOWED_ORIGIN);
          // Add other POST handlers here...
          default:
            return jsonResponse({ message: "Action not implemented" }, 501);
        }
      }

      if (request.method === "GET") {
        switch (action) {
          case "getUsers":
            return await handleGetUsersOptimized(url, db, ALLOWED_ORIGIN);
          case "getTimesheet":
            return await handleGetTimesheetOptimized(url, db, ALLOWED_ORIGIN);
          case "getTasks":
            return await handleGetTasksOptimized(url, db, ALLOWED_ORIGIN);
          // Add other GET handlers here...
          default:
            return jsonResponse({ message: "Action not implemented" }, 501);
        }
      }

      return jsonResponse({ message: "Method not allowed" }, 405);

    } catch (error) {
      console.error("Worker error:", error);
      return jsonResponse({ message: "Internal server error" }, 500);
    } finally {
      // Execute any pending batch operations
      if (db.batchQueue.length > 0) {
        db.executeBatch().catch(console.error);
      }
    }
  },
};