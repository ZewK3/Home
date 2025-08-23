// =====================================================
// MICROSERVICE-STYLE WORKER ARCHITECTURE
// =====================================================
// Route-based microservice approach with middleware pipeline
// Features:
// ✓ Express-like routing with middleware
// ✓ Pipeline processing
// ✓ Request/Response interceptors
// ✓ Advanced rate limiting
// ✓ Request validation middleware
// ✓ Response compression simulation
// =====================================================

const ALLOWED_ORIGIN = "*";

// =====================================================
// MIDDLEWARE SYSTEM
// =====================================================

class MiddlewareStack {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(context) {
    let index = 0;

    const next = async () => {
      if (index >= this.middlewares.length) return;
      
      const middleware = this.middlewares[index++];
      await middleware(context, next);
    };

    await next();
    return context;
  }
}

// =====================================================
// CORE MIDDLEWARE FUNCTIONS
// =====================================================

const corsMiddleware = async (ctx, next) => {
  ctx.response.headers = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
    "Access-Control-Max-Age": "86400",
    ...ctx.response.headers
  };
  await next();
};

const requestLoggingMiddleware = async (ctx, next) => {
  const start = performance.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  
  ctx.requestId = requestId;
  ctx.startTime = start;
  
  console.log(`[${requestId}] ${ctx.request.method} ${ctx.url.pathname} - Started`);
  
  await next();
  
  const duration = performance.now() - start;
  console.log(`[${requestId}] ${ctx.request.method} ${ctx.url.pathname} - ${ctx.response.status} (${duration.toFixed(2)}ms)`);
};

const rateLimitMiddleware = async (ctx, next) => {
  const clientId = ctx.request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit_${clientId}`;
  
  // Simple in-memory rate limiting (in production, use Redis)
  if (!rateLimitMiddleware.cache) {
    rateLimitMiddleware.cache = new Map();
  }
  
  const now = Date.now();
  const windowSize = 60000; // 1 minute
  const maxRequests = 100;
  
  const clientData = rateLimitMiddleware.cache.get(key) || { count: 0, resetTime: now + windowSize };
  
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + windowSize;
  }
  
  clientData.count++;
  rateLimitMiddleware.cache.set(key, clientData);
  
  if (clientData.count > maxRequests) {
    ctx.response.status = 429;
    ctx.response.body = { error: "Rate limit exceeded", retryAfter: Math.ceil((clientData.resetTime - now) / 1000) };
    return;
  }
  
  ctx.response.headers['X-RateLimit-Limit'] = maxRequests.toString();
  ctx.response.headers['X-RateLimit-Remaining'] = Math.max(0, maxRequests - clientData.count).toString();
  ctx.response.headers['X-RateLimit-Reset'] = Math.ceil(clientData.resetTime / 1000).toString();
  
  await next();
};

const validationMiddleware = async (ctx, next) => {
  if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
    const contentType = ctx.request.headers.get('Content-Type') || '';
    
    if (!contentType.includes('application/json')) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Content-Type must be application/json" };
      return;
    }
    
    try {
      ctx.requestBody = await ctx.request.json();
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid JSON in request body" };
      return;
    }
  }
  
  await next();
};

const authMiddleware = async (ctx, next) => {
  const protectedRoutes = [
    '/users', '/attendance', '/tasks', '/profile'
  ];
  
  const isProtected = protectedRoutes.some(route => ctx.url.pathname.startsWith(route));
  
  if (isProtected) {
    const token = ctx.url.searchParams.get('token') || 
      ctx.request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Authentication required" };
      return;
    }
    
    try {
      ctx.user = await ctx.services.auth.authenticate(token);
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = { error: error.message };
      return;
    }
  }
  
  await next();
};

const errorHandlerMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error(`[${ctx.requestId}] Error:`, error);
    
    ctx.response.status = error.status || 500;
    ctx.response.body = {
      error: error.message || "Internal server error",
      requestId: ctx.requestId,
      timestamp: new Date().toISOString()
    };
    
    if (error.details) {
      ctx.response.body.details = error.details;
    }
  }
};

const responseFormatterMiddleware = async (ctx, next) => {
  await next();
  
  // Only format if body is not already formatted
  if (ctx.response.body && typeof ctx.response.body === 'object' && !ctx.response.body.success && !ctx.response.body.error) {
    ctx.response.body = {
      success: true,
      data: ctx.response.body,
      meta: {
        requestId: ctx.requestId,
        timestamp: new Date().toISOString(),
        executionTime: `${(performance.now() - ctx.startTime).toFixed(2)}ms`
      }
    };
  }
};

// =====================================================
// ROUTER SYSTEM
// =====================================================

class Router {
  constructor() {
    this.routes = new Map();
    this.middlewareStack = new MiddlewareStack();
  }

  use(middleware) {
    this.middlewareStack.use(middleware);
    return this;
  }

  addRoute(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
    return this;
  }

  get(path, handler) {
    return this.addRoute('GET', path, handler);
  }

  post(path, handler) {
    return this.addRoute('POST', path, handler);
  }

  put(path, handler) {
    return this.addRoute('PUT', path, handler);
  }

  delete(path, handler) {
    return this.addRoute('DELETE', path, handler);
  }

  async route(request, services) {
    const url = new URL(request.url);
    const method = request.method;
    
    // Create context
    const context = {
      request,
      url,
      response: {
        status: 200,
        headers: {},
        body: null
      },
      services,
      user: null,
      requestBody: null,
      requestId: null,
      startTime: null
    };

    // Execute middleware stack
    await this.middlewareStack.execute(context);

    // If middleware set a response, return it
    if (context.response.body !== null) {
      return this.createResponse(context);
    }

    // Route matching
    const routeKey = `${method}:${url.pathname}`;
    const handler = this.routes.get(routeKey);

    if (!handler) {
      context.response.status = 404;
      context.response.body = { error: "Route not found" };
      return this.createResponse(context);
    }

    // Execute route handler
    try {
      const result = await handler(context);
      if (result !== undefined) {
        context.response.body = result;
      }
    } catch (error) {
      throw error; // Let error middleware handle it
    }

    return this.createResponse(context);
  }

  createResponse(context) {
    const headers = {
      'Content-Type': 'application/json',
      ...context.response.headers
    };

    return new Response(JSON.stringify(context.response.body), {
      status: context.response.status,
      headers
    });
  }
}

// =====================================================
// DATABASE SERVICE
// =====================================================

class DatabaseService {
  constructor(db) {
    this.db = db;
    this.queryCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  async query(sql, params = [], cacheKey = null) {
    if (cacheKey) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const result = await this.db.prepare(sql).bind(...params).all();
      const data = result.results || [];

      if (cacheKey) {
        this.queryCache.set(cacheKey, { data, timestamp: Date.now() });
        // Auto-cleanup
        setTimeout(() => this.queryCache.delete(cacheKey), this.cacheTimeout);
      }

      return data;
    } catch (error) {
      throw new DatabaseError(`Query failed: ${error.message}`);
    }
  }

  async queryFirst(sql, params = []) {
    try {
      return await this.db.prepare(sql).bind(...params).first();
    } catch (error) {
      throw new DatabaseError(`Query failed: ${error.message}`);
    }
  }

  async execute(sql, params = []) {
    try {
      // Invalidate related cache
      this.invalidateCache(sql);
      return await this.db.prepare(sql).bind(...params).run();
    } catch (error) {
      throw new DatabaseError(`Execute failed: ${error.message}`);
    }
  }

  invalidateCache(sql) {
    const tables = ['users', 'employees', 'sessions', 'attendance', 'tasks'];
    const lowerSql = sql.toLowerCase();
    
    tables.forEach(table => {
      if (lowerSql.includes(table)) {
        for (const [key] of this.queryCache) {
          if (key.includes(table)) {
            this.queryCache.delete(key);
          }
        }
      }
    });
  }
}

// =====================================================
// BUSINESS SERVICES
// =====================================================

class AuthService {
  constructor(db) {
    this.db = db;
    this.sessionCache = new Map();
  }

  async authenticate(token) {
    // Check cache first
    const cached = this.sessionCache.get(token);
    if (cached && Date.now() < cached.expires) {
      return cached.user;
    }

    const session = await this.db.queryFirst(
      "SELECT employeeId, expiresAt FROM sessions WHERE token = ?",
      [token]
    );

    if (!session) {
      throw new AuthError("Invalid session");
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      await this.db.execute("DELETE FROM sessions WHERE token = ?", [token]);
      throw new AuthError("Session expired");
    }

    // Update last access
    await this.db.execute(
      "UPDATE sessions SET lastAccess = ? WHERE token = ?",
      [now.toISOString(), token]
    );

    const user = { employeeId: session.employeeId };
    
    // Cache for 5 minutes
    this.sessionCache.set(token, {
      user,
      expires: Date.now() + 300000
    });

    return user;
  }

  async login(credentials) {
    const { employeeId, password } = credentials;

    const user = await this.db.queryFirst(
      "SELECT * FROM employees WHERE employeeId = ? AND password = ?",
      [employeeId, password]
    );

    if (!user) {
      throw new AuthError("Invalid credentials");
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    await this.db.execute("DELETE FROM sessions WHERE employeeId = ?", [employeeId]);
    await this.db.execute(
      "INSERT INTO sessions (employeeId, token, expiresAt, lastAccess) VALUES (?, ?, ?, ?)",
      [employeeId, token, expiresAt.toISOString(), new Date().toISOString()]
    );

    return { user, token, expiresAt: expiresAt.toISOString() };
  }
}

class UserService {
  constructor(db) {
    this.db = db;
  }

  async getUsers(filters = {}) {
    let sql = "SELECT employeeId, name, email, department, position FROM employees WHERE 1=1";
    const params = [];

    if (filters.department) {
      sql += " AND department = ?";
      params.push(filters.department);
    }

    const cacheKey = `users_${JSON.stringify(filters)}`;
    return await this.db.query(sql, params, cacheKey);
  }

  async getUserById(employeeId) {
    return await this.db.queryFirst(
      "SELECT employeeId, name, email, department, position FROM employees WHERE employeeId = ?",
      [employeeId]
    );
  }

  async updateUser(employeeId, data) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'email', 'department', 'position'];
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    values.push(employeeId);

    return await this.db.execute(
      `UPDATE employees SET ${fields.join(', ')} WHERE employeeId = ?`,
      values
    );
  }
}

class AttendanceService {
  constructor(db) {
    this.db = db;
  }

  async checkIn(employeeId) {
    const now = new Date().toISOString();
    
    const existing = await this.db.queryFirst(
      "SELECT id FROM attendance WHERE employeeId = ? AND DATE(checkIn) = DATE(?) AND checkOut IS NULL",
      [employeeId, now]
    );

    if (existing) {
      throw new ValidationError("Already checked in today");
    }

    return await this.db.execute(
      "INSERT INTO attendance (employeeId, checkIn) VALUES (?, ?)",
      [employeeId, now]
    );
  }

  async checkOut(employeeId) {
    const now = new Date().toISOString();
    
    const result = await this.db.execute(
      "UPDATE attendance SET checkOut = ? WHERE employeeId = ? AND DATE(checkIn) = DATE(?) AND checkOut IS NULL",
      [now, employeeId, now]
    );

    if (result.changes === 0) {
      throw new ValidationError("No active check-in found");
    }

    return result;
  }

  async getHistory(employeeId, startDate, endDate) {
    const cacheKey = `attendance_${employeeId}_${startDate}_${endDate}`;
    
    return await this.db.query(
      `SELECT DATE(checkIn) as date, TIME(checkIn) as checkIn, TIME(checkOut) as checkOut,
       CASE WHEN checkOut IS NOT NULL 
            THEN ROUND((JULIANDAY(checkOut) - JULIANDAY(checkIn)) * 24, 2)
            ELSE 0 END as hoursWorked
       FROM attendance 
       WHERE employeeId = ? AND DATE(checkIn) >= ? AND DATE(checkIn) <= ?
       ORDER BY DATE(checkIn) DESC`,
      [employeeId, startDate, endDate],
      cacheKey
    );
  }
}

class TaskService {
  constructor(db) {
    this.db = db;
  }

  async getTasks(employeeId, filters = {}) {
    let sql = "SELECT * FROM tasks WHERE assignedTo = ? OR createdBy = ?";
    const params = [employeeId, employeeId];

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    sql += " ORDER BY createdAt DESC";

    const cacheKey = `tasks_${employeeId}_${JSON.stringify(filters)}`;
    return await this.db.query(sql, params, cacheKey);
  }

  async createTask(data) {
    const timestamp = new Date().toISOString();
    
    return await this.db.execute(
      "INSERT INTO tasks (title, description, assignedTo, createdBy, priority, status, dueDate, createdAt) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)",
      [
        data.title,
        data.description || '',
        data.assignedTo,
        data.createdBy,
        data.priority || 'medium',
        data.dueDate,
        timestamp
      ]
    );
  }

  async updateStatus(taskId, status, employeeId) {
    const result = await this.db.execute(
      "UPDATE tasks SET status = ? WHERE id = ? AND (assignedTo = ? OR createdBy = ?)",
      [status, taskId, employeeId, employeeId]
    );

    if (result.changes === 0) {
      throw new ValidationError("Task not found or access denied");
    }

    return result;
  }
}

// =====================================================
// ERROR CLASSES
// =====================================================

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
  }
}

class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.field = field;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
  }
}

// =====================================================
// ROUTE HANDLERS
// =====================================================

const authRoutes = {
  async login(ctx) {
    const result = await ctx.services.auth.login(ctx.requestBody);
    return result;
  }
};

const userRoutes = {
  async getUsers(ctx) {
    const filters = {
      department: ctx.url.searchParams.get('department')
    };
    return await ctx.services.user.getUsers(filters);
  },

  async getUser(ctx) {
    const employeeId = ctx.url.searchParams.get('employeeId') || ctx.user.employeeId;
    const user = await ctx.services.user.getUserById(employeeId);
    
    if (!user) {
      ctx.response.status = 404;
      return { error: "User not found" };
    }
    
    return user;
  },

  async updateUser(ctx) {
    const employeeId = ctx.requestBody.employeeId || ctx.user.employeeId;
    const result = await ctx.services.user.updateUser(employeeId, ctx.requestBody);
    return { updated: result.changes > 0 };
  }
};

const attendanceRoutes = {
  async checkIn(ctx) {
    const employeeId = ctx.requestBody.employeeId || ctx.user.employeeId;
    const result = await ctx.services.attendance.checkIn(employeeId);
    return { success: true, id: result.meta?.last_row_id };
  },

  async checkOut(ctx) {
    const employeeId = ctx.requestBody.employeeId || ctx.user.employeeId;
    const result = await ctx.services.attendance.checkOut(employeeId);
    return { success: true, updated: result.changes > 0 };
  },

  async getHistory(ctx) {
    const employeeId = ctx.url.searchParams.get('employeeId') || ctx.user.employeeId;
    const startDate = ctx.url.searchParams.get('startDate');
    const endDate = ctx.url.searchParams.get('endDate');
    
    return await ctx.services.attendance.getHistory(employeeId, startDate, endDate);
  }
};

const taskRoutes = {
  async getTasks(ctx) {
    const filters = {
      status: ctx.url.searchParams.get('status')
    };
    return await ctx.services.task.getTasks(ctx.user.employeeId, filters);
  },

  async createTask(ctx) {
    ctx.requestBody.createdBy = ctx.user.employeeId;
    const result = await ctx.services.task.createTask(ctx.requestBody);
    return { success: true, id: result.meta?.last_row_id };
  },

  async updateStatus(ctx) {
    const result = await ctx.services.task.updateStatus(
      ctx.requestBody.taskId,
      ctx.requestBody.status,
      ctx.user.employeeId
    );
    return { updated: result.changes > 0 };
  }
};

// =====================================================
// APPLICATION SETUP
// =====================================================

function setupApplication(services) {
  const router = new Router();

  // Setup middleware pipeline
  router
    .use(errorHandlerMiddleware)
    .use(requestLoggingMiddleware)
    .use(corsMiddleware)
    .use(rateLimitMiddleware)
    .use(validationMiddleware)
    .use(authMiddleware)
    .use(responseFormatterMiddleware);

  // Setup routes
  router.post('/auth/login', authRoutes.login);
  
  router.get('/users', userRoutes.getUsers);
  router.get('/users/profile', userRoutes.getUser);
  router.put('/users/profile', userRoutes.updateUser);
  
  router.post('/attendance/checkin', attendanceRoutes.checkIn);
  router.post('/attendance/checkout', attendanceRoutes.checkOut);
  router.get('/attendance/history', attendanceRoutes.getHistory);
  
  router.get('/tasks', taskRoutes.getTasks);
  router.post('/tasks', taskRoutes.createTask);
  router.put('/tasks/status', taskRoutes.updateStatus);

  return router;
}

// =====================================================
// MAIN WORKER EXPORT
// =====================================================

export default {
  async scheduled(event, env, ctx) {
    console.log("Scheduled task executed");
    // Add scheduled maintenance tasks
  },

  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
        }
      });
    }

    try {
      // Initialize services
      const db = new DatabaseService(env.D1_BINDING);
      const services = {
        auth: new AuthService(db),
        user: new UserService(db),
        attendance: new AttendanceService(db),
        task: new TaskService(db)
      };

      // Setup application
      const app = setupApplication(services);

      // Route request
      return await app.route(request, services);

    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({
        error: "Internal server error",
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};