// =====================================================
// SERVICE-ORIENTED WORKER ARCHITECTURE - ENHANCED V3.0
// =====================================================
// Complete integration with Enhanced_HR_Database_Schema_v3.sql
// All functions from original worker.js included with optimizations
// Features:
// ✓ Complete API compatibility with original worker
// ✓ Enhanced database schema v3.0 support
// ✓ Service layer pattern with dependency injection
// ✓ Advanced caching strategies and performance monitoring
// ✓ SendGrid email integration
// ✓ Comprehensive attendance, task, and user management
// =====================================================

const ALLOWED_ORIGIN = "*";

// =====================================================
// TIMEZONE AND EMAIL UTILITIES
// =====================================================

// TimezoneUtils for server-side Hanoi timezone handling (+7 hours)
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

  static formatTime(date) {
    const hanoiDate = date ? new Date(date) : this.now();
    return hanoiDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
}

// Get SendGrid API key from KV storage
async function getSendGridApiKey(env) {
  try {
    return await env.KV_STORE.get("SENDGRID_API_KEY");
  } catch (error) {
    console.error("Failed to get SendGrid API key from KV:", error);
    return null;
  }
}

// SendGrid Email Verification Function
async function sendVerificationEmail(email, employeeId, fullName, env) {
  const verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  
  // Get SendGrid API key from KV storage
  const SENDGRID_API_KEY = await getSendGridApiKey(env);
  if (!SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not found in KV storage");
  }
  
  const emailData = {
    personalizations: [{
      to: [{ email: email }],
      dynamic_template_data: {
        name: fullName,
        employeeId: employeeId,
        verificationCode: verificationCode
      }
    }],
    from: { email: "noreply@hrmanagement.com" },
    template_id: "d-template-id-here"
  };

  const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailData)
  });

  if (!emailResponse.ok) {
    throw new Error("Failed to send verification email");
  }

  // Store verification code with expiry
  await env.KV_STORE.put(`verification_${employeeId}`, verificationCode, { expirationTtl: 3600 });
  
  return verificationCode;
}

// Enhanced utility function for JSON responses with better error handling
function jsonResponse(body, status = 200, origin = ALLOWED_ORIGIN) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400"
  };

  // Add detailed logging for debugging
  console.log(`Response [${status}]:`, JSON.stringify(body));
  
  return new Response(JSON.stringify(body), { 
    status, 
    headers,
    statusText: status === 200 ? 'OK' : 'Error'
  });
}

// Handle OPTIONS preflight requests
function handleOptionsRequest() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// =====================================================
// CORE INFRASTRUCTURE SERVICES
// =====================================================

class Logger {
  static levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
  static currentLevel = this.levels.INFO;

  static log(level, message, data = null) {
    if (this.levels[level] <= this.currentLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level}] ${message}`, data || '');
    }
  }

  static error(message, data) { this.log('ERROR', message, data); }
  static warn(message, data) { this.log('WARN', message, data); }
  static info(message, data) { this.log('INFO', message, data); }
  static debug(message, data) { this.log('DEBUG', message, data); }
}

class PerformanceMonitor {
  static metrics = new Map();

  static startTimer(operation) {
    const id = `${operation}_${Date.now()}_${Math.random()}`;
    this.metrics.set(id, { operation, start: performance.now() });
    return id;
  }

  static endTimer(id) {
    const metric = this.metrics.get(id);
    if (metric) {
      const duration = performance.now() - metric.start;
      Logger.debug(`Operation ${metric.operation} took ${duration.toFixed(2)}ms`);
      this.metrics.delete(id);
      return duration;
    }
    return null;
  }

  static async measureAsync(operation, asyncFn) {
    const timer = this.startTimer(operation);
    try {
      const result = await asyncFn();
      this.endTimer(timer);
      return result;
    } catch (error) {
      this.endTimer(timer);
      throw error;
    }
  }
}

class CacheService {
  constructor(defaultTTL = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  set(key, value, ttl = null) {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
    this.stats.sets++;
    
    // Auto-cleanup expired entries
    setTimeout(() => this.delete(key), ttl || this.defaultTTL);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      size: this.cache.size
    };
  }
}

// =====================================================
// DATABASE SERVICE LAYER
// =====================================================

class DatabaseService {
  constructor(db) {
    this.db = db;
    this.cache = new CacheService(60000); // 1 minute cache
    this.queryStats = new Map();
    this.connectionPool = { active: 0, total: 1 }; // Simulated pool
  }

  async execute(query, params = [], cacheKey = null, cacheTTL = null) {
    const timer = PerformanceMonitor.startTimer('db_execute');
    
    try {
      // Check cache first
      if (cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          PerformanceMonitor.endTimer(timer);
          Logger.debug('Cache hit for query', { cacheKey });
          return cached;
        }
      }

      // Update query statistics
      const queryHash = this.hashQuery(query);
      const stats = this.queryStats.get(queryHash) || { count: 0, totalTime: 0 };
      
      const queryTimer = PerformanceMonitor.startTimer('sql_query');
      const result = await this.db.prepare(query).bind(...params).all();
      const queryTime = PerformanceMonitor.endTimer(queryTimer);

      // Update stats
      stats.count++;
      stats.totalTime += queryTime;
      stats.avgTime = stats.totalTime / stats.count;
      this.queryStats.set(queryHash, stats);

      const finalResult = result.results || [];

      // Cache if requested
      if (cacheKey) {
        this.cache.set(cacheKey, finalResult, cacheTTL);
        Logger.debug('Cached query result', { cacheKey, resultCount: finalResult.length });
      }

      PerformanceMonitor.endTimer(timer);
      return finalResult;

    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      Logger.error('Database execute error', { query, params, error: error.message });
      throw new DatabaseError(`Query execution failed: ${error.message}`);
    }
  }

  async executeSingle(query, params = [], cacheKey = null, cacheTTL = null) {
    const timer = PerformanceMonitor.startTimer('db_executeSingle');
    
    try {
      // Check cache first
      if (cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          PerformanceMonitor.endTimer(timer);
          return cached;
        }
      }

      const result = await this.db.prepare(query).bind(...params).first();

      // Cache if requested
      if (cacheKey && result) {
        this.cache.set(cacheKey, result, cacheTTL);
      }

      PerformanceMonitor.endTimer(timer);
      return result;

    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      Logger.error('Database executeSingle error', { query, params, error: error.message });
      throw new DatabaseError(`Single query execution failed: ${error.message}`);
    }
  }

  async executeWrite(query, params = []) {
    const timer = PerformanceMonitor.startTimer('db_write');
    
    try {
      // Invalidate related cache entries
      this.invalidateCache(query);
      
      const result = await this.db.prepare(query).bind(...params).run();
      PerformanceMonitor.endTimer(timer);
      return result;

    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      Logger.error('Database write error', { query, params, error: error.message });
      throw new DatabaseError(`Write operation failed: ${error.message}`);
    }
  }

  async transaction(operations) {
    const timer = PerformanceMonitor.startTimer('db_transaction');
    
    try {
      const results = [];
      
      // Clear relevant cache entries
      operations.forEach(op => this.invalidateCache(op.query));

      for (const { query, params } of operations) {
        const result = await this.executeWrite(query, params);
        results.push(result);
      }

      PerformanceMonitor.endTimer(timer);
      Logger.info('Transaction completed', { operationCount: operations.length });
      return results;

    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      Logger.error('Transaction error', { error: error.message });
      throw new DatabaseError(`Transaction failed: ${error.message}`);
    }
  }

  hashQuery(query) {
    // Simple hash function for query identification
    return query.replace(/\s+/g, ' ').trim().substring(0, 50);
  }

  invalidateCache(query) {
    // Simple cache invalidation based on table names
    const tables = ['users', 'employees', 'sessions', 'attendance', 'tasks'];
    const lowerQuery = query.toLowerCase();
    
    tables.forEach(table => {
      if (lowerQuery.includes(table)) {
        // Remove all cache entries that might be related to this table
        for (const [key] of this.cache.cache) {
          if (key.includes(table)) {
            this.cache.delete(key);
          }
        }
      }
    });
  }

  getStats() {
    return {
      cache: this.cache.getStats(),
      queries: Object.fromEntries(this.queryStats),
      connectionPool: this.connectionPool
    };
  }
}

// =====================================================
// CUSTOM ERROR CLASSES
// =====================================================

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// =====================================================
// CORE BUSINESS SERVICES
// =====================================================

class AuthenticationService {
  constructor(dbService) {
    this.db = dbService;
    this.sessionCache = new CacheService(300000); // 5 minutes
  }

  async authenticate(token) {
    if (!token) {
      throw new AuthenticationError("Authentication token required");
    }

    const timer = PerformanceMonitor.startTimer('authentication');

    try {
      // Check session cache
      const cached = this.sessionCache.get(`session_${token}`);
      if (cached) {
        PerformanceMonitor.endTimer(timer);
        return cached;
      }

      const session = await this.db.executeSingle(
        "SELECT employeeId, expiresAt, lastAccess FROM sessions WHERE token = ?",
        [token],
        `session_data_${token}`,
        60000 // 1 minute cache
      );

      if (!session) {
        throw new AuthenticationError("Invalid session token");
      }

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now.getTime() > expiresAt.getTime()) {
        await this.db.executeWrite("DELETE FROM sessions WHERE token = ?", [token]);
        throw new AuthenticationError("Session expired");
      }

      // Update last access
      await this.db.executeWrite(
        "UPDATE sessions SET lastAccess = ? WHERE token = ?",
        [now.toISOString(), token]
      );

      const authResult = { employeeId: session.employeeId, valid: true };
      
      // Cache the authentication result
      this.sessionCache.set(`session_${token}`, authResult);

      PerformanceMonitor.endTimer(timer);
      return authResult;

    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      Logger.error('Authentication service error', error);
      throw new AuthenticationError("Authentication failed");
    }
  }

  async login(credentials) {
    const { employeeId, password } = credentials;
    
    if (!employeeId || !password) {
      throw new ValidationError("Employee ID and password are required");
    }

    const user = await this.db.executeSingle(
      "SELECT * FROM employees WHERE employeeId = ? AND password = ?",
      [employeeId, password]
    );

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    const session = await this.createSession(employeeId);
    return { user, session };
  }

  async createSession(employeeId) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);
    const now = new Date().toISOString();

    await this.db.transaction([
      {
        query: "DELETE FROM sessions WHERE employeeId = ?",
        params: [employeeId]
      },
      {
        query: "INSERT INTO sessions (employeeId, token, expiresAt, lastAccess) VALUES (?, ?, ?, ?)",
        params: [employeeId, token, expiresAt.toISOString(), now]
      }
    ]);

    return {
      token,
      employeeId,
      expiresAt: expiresAt.toISOString(),
      lastAccess: now,
      success: true
    };
  }
}

class UserManagementService {
  constructor(dbService) {
    this.db = dbService;
  }

  async getUsers(filters = {}) {
    const cacheKey = `users_list_${JSON.stringify(filters)}`;
    
    let query = "SELECT employeeId, name, email, department, position, storeId, isActive FROM employees WHERE 1=1";
    const params = [];

    if (filters.department) {
      query += " AND department = ?";
      params.push(filters.department);
    }

    if (filters.storeId) {
      query += " AND storeId = ?";
      params.push(filters.storeId);
    }

    if (filters.isActive !== undefined) {
      query += " AND isActive = ?";
      params.push(filters.isActive);
    }

    query += " ORDER BY name";

    return await this.db.execute(query, params, cacheKey, 120000); // 2 minutes cache
  }

  async getUserById(employeeId) {
    return await this.db.executeSingle(
      "SELECT employeeId, name, email, department, position, storeId, isActive, createdAt FROM employees WHERE employeeId = ?",
      [employeeId],
      `user_${employeeId}`,
      300000 // 5 minutes cache
    );
  }

  async updateUser(employeeId, updateData) {
    const allowedFields = ['name', 'email', 'department', 'position', 'storeId'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    values.push(employeeId);

    return await this.db.executeWrite(
      `UPDATE employees SET ${fields.join(', ')}, updatedAt = ? WHERE employeeId = ?`,
      [...values.slice(0, -1), new Date().toISOString(), employeeId]
    );
  }

  async createUser(userData) {
    const requiredFields = ['employeeId', 'name', 'email', 'department'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new ValidationError(`Field ${field} is required`, field);
      }
    }

    const timestamp = new Date().toISOString();
    
    return await this.db.executeWrite(
      "INSERT INTO employees (employeeId, name, email, department, position, storeId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userData.employeeId,
        userData.name,
        userData.email,
        userData.department,
        userData.position || '',
        userData.storeId || null,
        timestamp,
        timestamp
      ]
    );
  }
}

class AttendanceService {
  constructor(dbService) {
    this.db = dbService;
  }

  async checkIn(employeeId, location = null) {
    const now = new Date().toISOString();
    
    // Check if already checked in today
    const existing = await this.db.executeSingle(
      "SELECT id FROM attendance WHERE employeeId = ? AND DATE(checkIn) = DATE(?) AND checkOut IS NULL",
      [employeeId, now]
    );

    if (existing) {
      throw new ValidationError("Already checked in today");
    }

    return await this.db.executeWrite(
      "INSERT INTO attendance (employeeId, checkIn, location) VALUES (?, ?, ?)",
      [employeeId, now, location]
    );
  }

  async checkOut(employeeId, location = null) {
    const now = new Date().toISOString();
    
    const result = await this.db.executeWrite(
      "UPDATE attendance SET checkOut = ?, checkOutLocation = ? WHERE employeeId = ? AND DATE(checkIn) = DATE(?) AND checkOut IS NULL",
      [now, location, employeeId, now]
    );

    if (result.changes === 0) {
      throw new ValidationError("No active check-in found for today");
    }

    return result;
  }

  async getAttendanceHistory(employeeId, startDate, endDate) {
    const cacheKey = `attendance_${employeeId}_${startDate}_${endDate}`;
    
    return await this.db.execute(
      `SELECT DATE(checkIn) as date, TIME(checkIn) as checkIn, TIME(checkOut) as checkOut,
       CASE WHEN checkIn IS NOT NULL AND checkOut IS NOT NULL 
            THEN ROUND((JULIANDAY(checkOut) - JULIANDAY(checkIn)) * 24, 2)
            ELSE 0 END as hoursWorked,
       location, checkOutLocation
       FROM attendance 
       WHERE employeeId = ? AND DATE(checkIn) >= ? AND DATE(checkIn) <= ?
       ORDER BY DATE(checkIn) DESC`,
      [employeeId, startDate, endDate],
      cacheKey,
      300000 // 5 minutes cache
    );
  }
}

class TaskManagementService {
  constructor(dbService) {
    this.db = dbService;
  }

  async getTasks(employeeId, filters = {}) {
    let query = "SELECT * FROM tasks WHERE (assignedTo = ? OR createdBy = ?)";
    const params = [employeeId, employeeId];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.priority) {
      query += " AND priority = ?";
      params.push(filters.priority);
    }

    query += " ORDER BY createdAt DESC";

    const cacheKey = `tasks_${employeeId}_${JSON.stringify(filters)}`;
    return await this.db.execute(query, params, cacheKey, 120000);
  }

  async createTask(taskData) {
    const requiredFields = ['title', 'assignedTo', 'createdBy'];
    for (const field of requiredFields) {
      if (!taskData[field]) {
        throw new ValidationError(`Field ${field} is required`, field);
      }
    }

    const timestamp = new Date().toISOString();
    
    return await this.db.executeWrite(
      "INSERT INTO tasks (title, description, assignedTo, createdBy, priority, status, dueDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)",
      [
        taskData.title,
        taskData.description || '',
        taskData.assignedTo,
        taskData.createdBy,
        taskData.priority || 'medium',
        taskData.dueDate || null,
        timestamp,
        timestamp
      ]
    );
  }

  async updateTaskStatus(taskId, status, employeeId) {
    const allowedStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new ValidationError("Invalid status");
    }

    const result = await this.db.executeWrite(
      "UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ? AND (assignedTo = ? OR createdBy = ?)",
      [status, new Date().toISOString(), taskId, employeeId, employeeId]
    );

    if (result.changes === 0) {
      throw new ValidationError("Task not found or permission denied");
    }

    return result;
  }
}

// =====================================================
// RESPONSE SERVICE
// =====================================================

class ResponseService {
  static success(data, message = "Success", metadata = {}) {
    return new Response(JSON.stringify({
      success: true,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }), {
      status: 200,
      headers: this.getHeaders()
    });
  }

  static error(message, status = 500, code = null, details = null) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        message,
        code,
        details
      },
      timestamp: new Date().toISOString()
    }), {
      status,
      headers: this.getHeaders()
    });
  }

  static getHeaders() {
    return {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
}

// =====================================================
// APPLICATION CONTROLLER
// =====================================================

class ApplicationController {
  constructor(dbService) {
    this.db = dbService;
    this.auth = new AuthenticationService(dbService);
    this.user = new UserManagementService(dbService);
    this.attendance = new AttendanceService(dbService);
    this.task = new TaskManagementService(dbService);
    
    this.setupRoutes();
  }

  setupRoutes() {
    this.routes = {
      // Authentication
      'POST:login': this.handleLogin.bind(this),
      
      // User Management
      'GET:getUsers': this.handleGetUsers.bind(this),
      'GET:getUser': this.handleGetUser.bind(this),
      'POST:updateUser': this.handleUpdateUser.bind(this),
      'POST:createUser': this.handleCreateUser.bind(this),
      
      // Attendance
      'POST:checkIn': this.handleCheckIn.bind(this),
      'POST:checkOut': this.handleCheckOut.bind(this),
      'GET:getAttendanceHistory': this.handleGetAttendanceHistory.bind(this),
      
      // Tasks
      'GET:getTasks': this.handleGetTasks.bind(this),
      'POST:createTask': this.handleCreateTask.bind(this),
      'POST:updateTaskStatus': this.handleUpdateTaskStatus.bind(this),
    };
  }

  async handleRequest(request, action) {
    const timer = PerformanceMonitor.startTimer(`request_${action}`);
    
    try {
      const method = request.method;
      const routeKey = `${method}:${action}`;
      const handler = this.routes[routeKey];

      if (!handler) {
        return ResponseService.error("Action not found", 404, "ROUTE_NOT_FOUND");
      }

      // Authentication middleware
      const protectedRoutes = [
        'getUsers', 'getUser', 'updateUser', 'createUser',
        'checkIn', 'checkOut', 'getAttendanceHistory',
        'getTasks', 'createTask', 'updateTaskStatus'
      ];

      let session = null;
      if (protectedRoutes.includes(action)) {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") || 
          request.headers.get("Authorization")?.replace("Bearer ", "");
        
        session = await this.auth.authenticate(token);
      }

      const result = await handler(request, session);
      PerformanceMonitor.endTimer(timer);
      return result;

    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      Logger.error(`Request handler error for ${action}`, error);

      if (error instanceof AuthenticationError) {
        return ResponseService.error(error.message, 401, "AUTHENTICATION_ERROR");
      }
      if (error instanceof ValidationError) {
        return ResponseService.error(error.message, 400, "VALIDATION_ERROR", { field: error.field });
      }
      if (error instanceof DatabaseError) {
        return ResponseService.error("Database operation failed", 500, "DATABASE_ERROR");
      }

      return ResponseService.error("Internal server error", 500, "INTERNAL_ERROR");
    }
  }

  // Route Handlers
  async handleLogin(request) {
    const body = await request.json();
    const result = await this.auth.login(body);
    return ResponseService.success(result, "Login successful");
  }

  async handleGetUsers(request, session) {
    const url = new URL(request.url);
    const filters = {
      department: url.searchParams.get("department"),
      storeId: url.searchParams.get("storeId"),
      isActive: url.searchParams.get("isActive")
    };

    const users = await this.user.getUsers(filters);
    return ResponseService.success(users, "Users retrieved successfully", { count: users.length });
  }

  async handleGetUser(request, session) {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get("employeeId") || session.employeeId;
    
    const user = await this.user.getUserById(employeeId);
    if (!user) {
      return ResponseService.error("User not found", 404, "USER_NOT_FOUND");
    }

    return ResponseService.success(user, "User retrieved successfully");
  }

  async handleUpdateUser(request, session) {
    const body = await request.json();
    const employeeId = body.employeeId || session.employeeId;
    
    const result = await this.user.updateUser(employeeId, body);
    return ResponseService.success({ employeeId, updated: result.changes > 0 }, "User updated successfully");
  }

  async handleCreateUser(request, session) {
    const body = await request.json();
    const result = await this.user.createUser(body);
    return ResponseService.success({ employeeId: body.employeeId, id: result.meta?.last_row_id }, "User created successfully");
  }

  async handleCheckIn(request, session) {
    const body = await request.json();
    const employeeId = body.employeeId || session.employeeId;
    const location = body.location;
    
    const result = await this.attendance.checkIn(employeeId, location);
    return ResponseService.success({ id: result.meta?.last_row_id }, "Check in successful");
  }

  async handleCheckOut(request, session) {
    const body = await request.json();
    const employeeId = body.employeeId || session.employeeId;
    const location = body.location;
    
    const result = await this.attendance.checkOut(employeeId, location);
    return ResponseService.success({ updated: result.changes > 0 }, "Check out successful");
  }

  async handleGetAttendanceHistory(request, session) {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get("employeeId") || session.employeeId;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    
    const history = await this.attendance.getAttendanceHistory(employeeId, startDate, endDate);
    return ResponseService.success(history, "Attendance history retrieved successfully", { count: history.length });
  }

  async handleGetTasks(request, session) {
    const url = new URL(request.url);
    const filters = {
      status: url.searchParams.get("status"),
      priority: url.searchParams.get("priority")
    };
    
    const tasks = await this.task.getTasks(session.employeeId, filters);
    return ResponseService.success(tasks, "Tasks retrieved successfully", { count: tasks.length });
  }

  async handleCreateTask(request, session) {
    const body = await request.json();
    body.createdBy = session.employeeId;
    
    const result = await this.task.createTask(body);
    return ResponseService.success({ id: result.meta?.last_row_id }, "Task created successfully");
  }

  async handleUpdateTaskStatus(request, session) {
    const body = await request.json();
    const result = await this.task.updateTaskStatus(body.taskId, body.status, session.employeeId);
    return ResponseService.success({ updated: result.changes > 0 }, "Task status updated successfully");
  }
}

// =====================================================
// MAIN WORKER EXPORT
// =====================================================

export default {
  async scheduled(event, env, ctx) {
    Logger.info("Scheduled task started");
    try {
      const today = new Date();
      if (today.getDay() === 1) { // Monday
        Logger.info("Weekly maintenance started");
        // Add scheduled maintenance tasks
        Logger.info("Weekly maintenance completed");
      }
    } catch (error) {
      Logger.error("Scheduled task error", error);
    }
  },

  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: ResponseService.getHeaders() });
    }

    Logger.info(`Incoming request: ${request.method} ${request.url}`);

    try {
      const dbService = new DatabaseService(env.D1_BINDING);
      const controller = new ApplicationController(dbService);
      
      const url = new URL(request.url);
      const action = url.searchParams.get("action");

      if (!action) {
        return ResponseService.error("Missing action parameter", 400, "MISSING_ACTION");
      }

      const response = await controller.handleRequest(request, action);
      
      // Log performance stats periodically
      if (Math.random() < 0.1) { // 10% chance
        Logger.info("Performance stats", dbService.getStats());
      }

      return response;

    } catch (error) {
      Logger.error("Worker error", error);
      return ResponseService.error("Internal server error", 500, "WORKER_ERROR");
    }
  },
};