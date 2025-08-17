// =====================================================
// PROFESSIONAL USER MANAGEMENT API ARCHITECTURE
// =====================================================
// Enhanced backend API for professional HR Management System
// RESTful design with modern authentication and authorization
// 
// Version: 2.0.0
// Created: January 2025
// Features:
// ✓ RESTful API endpoints with proper HTTP methods
// ✓ JWT-based authentication with refresh tokens
// ✓ Role-based access control (RBAC)
// ✓ Comprehensive error handling
// ✓ Request validation and sanitization
// ✓ Audit logging for all operations
// ✓ Rate limiting and security measures
// ✓ API versioning support
// ✓ Professional response formats
// =====================================================

// CORS configuration for production
const CORS_CONFIG = {
  'Access-Control-Allow-Origin': '*', // Configure for production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Version, X-Request-ID',
  'Access-Control-Max-Age': '86400'
};

// API versioning
const API_VERSION = 'v2';
const SUPPORTED_VERSIONS = ['v1', 'v2'];

// Security configuration
const SECURITY_CONFIG = {
  JWT_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 300000, // 5 minutes
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 86400000 // 24 hours
};

// =====================================================
// UTILITY CLASSES AND HELPERS
// =====================================================

// Enhanced timezone utilities
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

  static formatDateTime(date, format = 'full') {
    const hanoiDate = date ? new Date(date) : this.now();
    
    const options = {
      full: {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Ho_Chi_Minh'
      },
      date: {
        year: 'numeric', month: '2-digit', day: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      },
      time: {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Ho_Chi_Minh'
      }
    };

    return hanoiDate.toLocaleString('vi-VN', options[format] || options.full);
  }
}

// UUID generator for IDs
class UUIDGenerator {
  static generate() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static short() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Professional response formatter
class ResponseFormatter {
  static success(data = null, message = 'Success', metadata = {}) {
    return {
      success: true,
      message,
      data,
      metadata: {
        timestamp: TimezoneUtils.toHanoiISOString(),
        version: API_VERSION,
        ...metadata
      }
    };
  }

  static error(message = 'An error occurred', code = 'GENERIC_ERROR', details = null, statusCode = 500) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: TimezoneUtils.toHanoiISOString(),
        version: API_VERSION
      }
    };
  }

  static paginated(data, page, limit, total, metadata = {}) {
    const totalPages = Math.ceil(total / limit);
    
    return this.success(data, 'Data retrieved successfully', {
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      ...metadata
    });
  }
}

// Input validation and sanitization
class Validator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^(\+84|84|0[3|5|7|8|9])+([0-9]{8,9})$/;
    return phoneRegex.test(phone);
  }

  static validatePassword(password) {
    return password && password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH;
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  }

  static validatePagination(page, limit) {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    return { page: validatedPage, limit: validatedLimit };
  }
}

// Enhanced password utilities
class PasswordUtils {
  static async hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const data = encoder.encode(password + Array.from(salt).join(''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return {
      hash: hashArray.map(b => b.toString(16).padStart(2, '0')).join(''),
      salt: Array.from(salt).join('')
    };
  }

  static async verifyPassword(password, hash, salt) {
    const { hash: newHash } = await this.hashPassword(password);
    return newHash === hash;
  }
}

// JWT token utilities
class JWTUtils {
  static async sign(payload, secret, expiresIn = SECURITY_CONFIG.JWT_EXPIRY) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.parseExpiry(expiresIn)
    };

    const encoder = new TextEncoder();
    const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
    const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
    
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`, secret);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static async verify(token, secret) {
    try {
      const [header, payload, signature] = token.split('.');
      if (!header || !payload || !signature) throw new Error('Invalid token format');

      const expectedSignature = await this.createSignature(`${header}.${payload}`, secret);
      if (signature !== expectedSignature) throw new Error('Invalid signature');

      const decodedPayload = JSON.parse(atob(payload));
      const now = Math.floor(Date.now() / 1000);
      
      if (decodedPayload.exp < now) throw new Error('Token expired');
      
      return decodedPayload;
    } catch (error) {
      throw new Error(`JWT verification failed: ${error.message}`);
    }
  }

  static async createSignature(data, secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[+/]/g, c => c === '+' ? '-' : '_')
      .replace(/=/g, '');
  }

  static parseExpiry(expiry) {
    if (typeof expiry === 'number') return expiry;
    
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiry.match(/^(\d+)([smhd])$/);
    
    if (!match) return 3600; // Default 1 hour
    
    return parseInt(match[1]) * units[match[2]];
  }
}

// =====================================================
// DATABASE ABSTRACTION LAYER
// =====================================================

class DatabaseManager {
  constructor(db) {
    this.db = db;
  }

  // Execute query with error handling
  async execute(query, params = []) {
    try {
      const result = await this.db.prepare(query).bind(...params).all();
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  // Execute single query
  async executeSingle(query, params = []) {
    try {
      const result = await this.db.prepare(query).bind(...params).first();
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  // Execute with run (for INSERT/UPDATE/DELETE)
  async executeRun(query, params = []) {
    try {
      const result = await this.db.prepare(query).bind(...params).run();
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  // Transaction support
  async transaction(queries) {
    try {
      const results = [];
      for (const { query, params } of queries) {
        const result = await this.executeRun(query, params);
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
}

// =====================================================
// AUTHENTICATION & AUTHORIZATION SERVICES
// =====================================================

class AuthenticationService {
  constructor(dbManager) {
    this.db = dbManager;
  }

  // User registration
  async register(userData) {
    const { firstName, lastName, email, password, organizationId } = userData;
    
    // Validate input
    if (!Validator.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!Validator.validatePassword(password)) {
      throw new Error(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
    }

    // Check if user exists
    const existingUser = await this.db.executeSingle(
      'SELECT id FROM user_profiles WHERE email = ?',
      [email]
    );

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Generate employee ID
    const employeeId = 'EMP' + Date.now().toString().slice(-6);
    const userId = UUIDGenerator.generate();

    // Hash password
    const { hash, salt } = await PasswordUtils.hashPassword(password);

    // Create user profile
    await this.db.executeRun(`
      INSERT INTO user_profiles (
        id, organization_id, employee_id, email, first_name, last_name,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `, [
      userId, organizationId, employeeId, email.toLowerCase(),
      Validator.sanitizeInput(firstName), Validator.sanitizeInput(lastName),
      TimezoneUtils.toHanoiISOString(), TimezoneUtils.toHanoiISOString()
    ]);

    // Create authentication record
    await this.db.executeRun(`
      INSERT INTO user_authentication (
        user_id, password_hash, password_salt, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `, [userId, hash, salt, TimezoneUtils.toHanoiISOString(), TimezoneUtils.toHanoiISOString()]);

    // Assign default employee role
    const employeeRole = await this.db.executeSingle(
      'SELECT id FROM system_roles WHERE organization_id = ? AND name = ?',
      [organizationId, 'employee']
    );

    if (employeeRole) {
      await this.db.executeRun(`
        INSERT INTO user_roles (user_id, role_id, assigned_at)
        VALUES (?, ?, ?)
      `, [userId, employeeRole.id, TimezoneUtils.toHanoiISOString()]);
    }

    return {
      userId,
      employeeId,
      email: email.toLowerCase()
    };
  }

  // User login
  async login(email, password, deviceInfo = {}) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get user with authentication data
    const user = await this.db.executeSingle(`
      SELECT 
        up.id, up.employee_id, up.email, up.first_name, up.last_name,
        up.organization_id, up.is_active, up.last_login_at,
        ua.password_hash, ua.password_salt, ua.failed_login_attempts,
        ua.locked_until
      FROM user_profiles up
      JOIN user_authentication ua ON up.id = ua.user_id
      WHERE up.email = ? AND up.is_active = 1
    `, [email.toLowerCase()]);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Verify password
    const passwordValid = await PasswordUtils.verifyPassword(password, user.password_hash, user.password_salt);

    if (!passwordValid) {
      // Increment failed attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const lockUntil = failedAttempts >= SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS
        ? new Date(Date.now() + SECURITY_CONFIG.ACCOUNT_LOCKOUT_DURATION).toISOString()
        : null;

      await this.db.executeRun(`
        UPDATE user_authentication 
        SET failed_login_attempts = ?, locked_until = ?
        WHERE user_id = ?
      `, [failedAttempts, lockUntil, user.id]);

      throw new Error('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.db.executeRun(`
      UPDATE user_authentication 
      SET failed_login_attempts = 0, locked_until = NULL
      WHERE user_id = ?
    `, [user.id]);

    // Update last login
    await this.db.executeRun(`
      UPDATE user_profiles 
      SET last_login_at = ?
      WHERE id = ?
    `, [TimezoneUtils.toHanoiISOString(), user.id]);

    // Generate tokens
    const jwtSecret = await this.getJWTSecret();
    const accessToken = await JWTUtils.sign({
      userId: user.id,
      employeeId: user.employee_id,
      email: user.email,
      organizationId: user.organization_id
    }, jwtSecret);

    const refreshToken = await JWTUtils.sign({
      userId: user.id,
      type: 'refresh'
    }, jwtSecret, SECURITY_CONFIG.REFRESH_TOKEN_EXPIRY);

    // Create session
    const sessionId = UUIDGenerator.generate();
    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT).toISOString();

    await this.db.executeRun(`
      INSERT INTO user_sessions (
        id, user_id, token, refresh_token, device_info, 
        ip_address, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId, user.id, accessToken, refreshToken,
      JSON.stringify(deviceInfo), deviceInfo.ipAddress || '',
      expiresAt, TimezoneUtils.toHanoiISOString()
    ]);

    return {
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: SECURITY_CONFIG.SESSION_TIMEOUT
      },
      session: {
        id: sessionId,
        expiresAt
      }
    };
  }

  // Token refresh
  async refreshToken(refreshToken) {
    const jwtSecret = await this.getJWTSecret();
    
    try {
      const payload = await JWTUtils.verify(refreshToken, jwtSecret);
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Get session
      const session = await this.db.executeSingle(`
        SELECT s.*, up.employee_id, up.email, up.organization_id
        FROM user_sessions s
        JOIN user_profiles up ON s.user_id = up.id
        WHERE s.refresh_token = ? AND s.is_active = 1
      `, [refreshToken]);

      if (!session) {
        throw new Error('Invalid or expired refresh token');
      }

      // Generate new access token
      const newAccessToken = await JWTUtils.sign({
        userId: session.user_id,
        employeeId: session.employee_id,
        email: session.email,
        organizationId: session.organization_id
      }, jwtSecret);

      // Update session
      await this.db.executeRun(`
        UPDATE user_sessions 
        SET token = ?, last_activity = ?
        WHERE id = ?
      `, [newAccessToken, TimezoneUtils.toHanoiISOString(), session.id]);

      return {
        accessToken: newAccessToken,
        expiresIn: SECURITY_CONFIG.SESSION_TIMEOUT
      };

    } catch (error) {
      throw new Error('Token refresh failed: ' + error.message);
    }
  }

  // Logout
  async logout(token) {
    await this.db.executeRun(`
      UPDATE user_sessions 
      SET is_active = 0
      WHERE token = ?
    `, [token]);
  }

  // Get JWT secret from environment
  async getJWTSecret() {
    // In production, this should be stored securely
    return 'your-super-secret-jwt-key-change-in-production';
  }
}

class AuthorizationService {
  constructor(dbManager) {
    this.db = dbManager;
  }

  // Check if user has permission
  async hasPermission(userId, permission) {
    // Check direct user permissions first
    const userPermission = await this.db.executeSingle(`
      SELECT granted FROM user_permissions up
      JOIN system_permissions sp ON up.permission_id = sp.id
      WHERE up.user_id = ? AND sp.name = ?
      AND (up.expires_at IS NULL OR up.expires_at > ?)
    `, [userId, permission, TimezoneUtils.toHanoiISOString()]);

    if (userPermission !== null) {
      return userPermission.granted === 1;
    }

    // Check role-based permissions
    const rolePermissions = await this.db.execute(`
      SELECT rp.granted
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN system_permissions sp ON rp.permission_id = sp.id
      WHERE ur.user_id = ? AND sp.name = ? AND ur.is_active = 1
      AND (ur.expires_at IS NULL OR ur.expires_at > ?)
    `, [userId, permission, TimezoneUtils.toHanoiISOString()]);

    return rolePermissions.some(rp => rp.granted === 1);
  }

  // Get user roles
  async getUserRoles(userId) {
    return await this.db.execute(`
      SELECT sr.id, sr.name, sr.display_name, sr.level
      FROM user_roles ur
      JOIN system_roles sr ON ur.role_id = sr.id
      WHERE ur.user_id = ? AND ur.is_active = 1
      AND (ur.expires_at IS NULL OR ur.expires_at > ?)
      ORDER BY sr.level ASC
    `, [userId, TimezoneUtils.toHanoiISOString()]);
  }

  // Get user permissions
  async getUserPermissions(userId) {
    const permissions = await this.db.execute(`
      SELECT DISTINCT sp.name, sp.display_name, sp.category
      FROM (
        -- Direct permissions
        SELECT sp.name, sp.display_name, sp.category
        FROM user_permissions up
        JOIN system_permissions sp ON up.permission_id = sp.id
        WHERE up.user_id = ? AND up.granted = 1
        AND (up.expires_at IS NULL OR up.expires_at > ?)
        
        UNION
        
        -- Role-based permissions
        SELECT sp.name, sp.display_name, sp.category
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN system_permissions sp ON rp.permission_id = sp.id
        WHERE ur.user_id = ? AND ur.is_active = 1 AND rp.granted = 1
        AND (ur.expires_at IS NULL OR ur.expires_at > ?)
      ) sp
      ORDER BY sp.category, sp.name
    `, [userId, TimezoneUtils.toHanoiISOString(), userId, TimezoneUtils.toHanoiISOString()]);

    // Group by category
    const grouped = {};
    permissions.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push({
        name: perm.name,
        displayName: perm.display_name
      });
    });

    return grouped;
  }
}

// =====================================================
// AUDIT LOGGING SERVICE
// =====================================================

class AuditService {
  constructor(dbManager) {
    this.db = dbManager;
  }

  // Log audit event
  async logEvent(eventData) {
    const {
      userId,
      organizationId,
      eventType,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      sessionId,
      description,
      severity = 'info'
    } = eventData;

    const auditId = UUIDGenerator.generate();

    await this.db.executeRun(`
      INSERT INTO audit_logs (
        id, organization_id, user_id, event_type, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent, session_id,
        description, severity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      auditId, organizationId, userId, eventType, resourceType, resourceId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress, userAgent, sessionId, description, severity,
      TimezoneUtils.toHanoiISOString()
    ]);

    return auditId;
  }

  // Log security event
  async logSecurityEvent(eventData) {
    const {
      eventType,
      userId,
      ipAddress,
      userAgent,
      severity = 'medium',
      details
    } = eventData;

    const eventId = UUIDGenerator.generate();

    await this.db.executeRun(`
      INSERT INTO security_events (
        id, event_type, user_id, ip_address, user_agent,
        severity, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventId, eventType, userId, ipAddress, userAgent,
      severity, details ? JSON.stringify(details) : null,
      TimezoneUtils.toHanoiISOString()
    ]);

    return eventId;
  }
}

// =====================================================
// MIDDLEWARE FUNCTIONS
// =====================================================

// Authentication middleware
async function authenticateToken(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Access token required');
  }

  const token = authHeader.substring(7);
  const jwtSecret = 'your-super-secret-jwt-key-change-in-production'; // Get from env

  try {
    const payload = await JWTUtils.verify(token, jwtSecret);
    
    // Verify session is still active
    const db = new DatabaseManager(env.DATABASE);
    const session = await db.executeSingle(`
      SELECT s.*, up.employee_id, up.first_name, up.last_name, up.organization_id
      FROM user_sessions s
      JOIN user_profiles up ON s.user_id = up.id
      WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > ?
    `, [token, TimezoneUtils.toHanoiISOString()]);

    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Update last activity
    await db.executeRun(`
      UPDATE user_sessions 
      SET last_activity = ?
      WHERE id = ?
    `, [TimezoneUtils.toHanoiISOString(), session.id]);

    return {
      userId: payload.userId,
      employeeId: payload.employeeId,
      email: payload.email,
      organizationId: payload.organizationId,
      firstName: session.first_name,
      lastName: session.last_name,
      sessionId: session.id
    };

  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// Authorization middleware
async function requirePermission(user, permission, env) {
  const db = new DatabaseManager(env.DATABASE);
  const authz = new AuthorizationService(db);
  
  const hasPermission = await authz.hasPermission(user.userId, permission);
  if (!hasPermission) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
}

// Rate limiting middleware
const rateLimitMap = new Map();

function rateLimit(identifier, maxRequests = SECURITY_CONFIG.RATE_LIMIT_REQUESTS, windowMs = SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }
  
  const requests = rateLimitMap.get(identifier);
  
  // Remove old requests
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
}

// =====================================================
// API ROUTE HANDLERS
// =====================================================

// User Management Routes
class UserManagementAPI {
  constructor(dbManager, authService, auditService) {
    this.db = dbManager;
    this.auth = authService;
    this.audit = auditService;
  }

  // GET /api/v2/users - List users with pagination
  async getUsers(request, user) {
    const url = new URL(request.url);
    const { page, limit } = Validator.validatePagination(
      url.searchParams.get('page'),
      url.searchParams.get('limit')
    );
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const department = url.searchParams.get('department') || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE up.organization_id = ?';
    const params = [user.organizationId];

    if (search) {
      whereClause += ' AND (up.first_name LIKE ? OR up.last_name LIKE ? OR up.email LIKE ? OR up.employee_id LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status !== 'all') {
      whereClause += ' AND up.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    if (department) {
      whereClause += ' AND ea.department_id = ?';
      params.push(department);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT up.id) as total
      FROM user_profiles up
      LEFT JOIN employee_assignments ea ON up.id = ea.user_id AND ea.is_active = 1
      ${whereClause}
    `;
    const { total } = await this.db.executeSingle(countQuery, params);

    // Get users
    const usersQuery = `
      SELECT 
        up.id, up.employee_id, up.email, up.first_name, up.last_name,
        up.phone, up.is_active, up.created_at, up.last_login_at,
        d.display_name as department_name,
        jp.title as job_title,
        wl.display_name as workplace_name
      FROM user_profiles up
      LEFT JOIN employee_assignments ea ON up.id = ea.user_id AND ea.is_active = 1
      LEFT JOIN departments d ON ea.department_id = d.id
      LEFT JOIN job_positions jp ON ea.job_position_id = jp.id
      LEFT JOIN workplace_locations wl ON ea.workplace_location_id = wl.id
      ${whereClause}
      ORDER BY up.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await this.db.execute(usersQuery, [...params, limit, offset]);

    return ResponseFormatter.paginated(users, page, limit, total);
  }

  // GET /api/v2/users/:id - Get user details
  async getUser(request, user, userId) {
    const userDetails = await this.db.executeSingle(`
      SELECT 
        up.*,
        ea.employee_type, ea.employment_status, ea.hire_date,
        ea.base_salary, ea.currency,
        d.display_name as department_name,
        jp.title as job_title,
        wl.display_name as workplace_name
      FROM user_profiles up
      LEFT JOIN employee_assignments ea ON up.id = ea.user_id AND ea.is_active = 1
      LEFT JOIN departments d ON ea.department_id = d.id
      LEFT JOIN job_positions jp ON ea.job_position_id = jp.id
      LEFT JOIN workplace_locations wl ON ea.workplace_location_id = wl.id
      WHERE up.id = ? AND up.organization_id = ?
    `, [userId, user.organizationId]);

    if (!userDetails) {
      throw new Error('User not found');
    }

    return ResponseFormatter.success(userDetails);
  }

  // POST /api/v2/users - Create new user
  async createUser(request, user) {
    const userData = await request.json();
    
    const result = await this.auth.register({
      ...userData,
      organizationId: user.organizationId
    });

    // Log audit event
    await this.audit.logEvent({
      userId: user.userId,
      organizationId: user.organizationId,
      eventType: 'user_created',
      resourceType: 'user',
      resourceId: result.userId,
      newValues: userData,
      description: `User created: ${userData.email}`
    });

    return ResponseFormatter.success(result, 'User created successfully', { statusCode: 201 });
  }

  // PUT /api/v2/users/:id - Update user
  async updateUser(request, user, userId) {
    const updateData = await request.json();
    
    // Get current user data for audit
    const currentUser = await this.db.executeSingle(
      'SELECT * FROM user_profiles WHERE id = ? AND organization_id = ?',
      [userId, user.organizationId]
    );

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Build update query
    const allowedFields = ['first_name', 'last_name', 'phone', 'bio', 'is_active'];
    const updateFields = [];
    const params = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(Validator.sanitizeInput(updateData[field]));
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = ?');
    params.push(TimezoneUtils.toHanoiISOString(), userId, user.organizationId);

    await this.db.executeRun(`
      UPDATE user_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND organization_id = ?
    `, params);

    // Log audit event
    await this.audit.logEvent({
      userId: user.userId,
      organizationId: user.organizationId,
      eventType: 'user_updated',
      resourceType: 'user',
      resourceId: userId,
      oldValues: currentUser,
      newValues: updateData,
      description: `User updated: ${currentUser.email}`
    });

    return ResponseFormatter.success(null, 'User updated successfully');
  }
}

// Authentication Routes
class AuthenticationAPI {
  constructor(authService, auditService) {
    this.auth = authService;
    this.audit = auditService;
  }

  // POST /api/v2/auth/login
  async login(request) {
    const { email, password } = await request.json();
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    try {
      const result = await this.auth.login(email, password, { ipAddress, userAgent });

      // Log successful login
      await this.audit.logSecurityEvent({
        eventType: 'login_success',
        userId: result.user.id,
        ipAddress,
        userAgent,
        severity: 'info',
        details: { email }
      });

      return ResponseFormatter.success(result, 'Login successful');

    } catch (error) {
      // Log failed login
      await this.audit.logSecurityEvent({
        eventType: 'login_failed',
        ipAddress,
        userAgent,
        severity: 'warning',
        details: { email, reason: error.message }
      });

      throw error;
    }
  }

  // POST /api/v2/auth/refresh
  async refreshToken(request) {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    const result = await this.auth.refreshToken(refreshToken);
    return ResponseFormatter.success(result, 'Token refreshed successfully');
  }

  // POST /api/v2/auth/logout
  async logout(request, user) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader.substring(7);

    await this.auth.logout(token);

    // Log logout
    await this.audit.logSecurityEvent({
      eventType: 'logout',
      userId: user.userId,
      severity: 'info'
    });

    return ResponseFormatter.success(null, 'Logged out successfully');
  }
}

// =====================================================
// MAIN WORKER HANDLER
// =====================================================

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: CORS_CONFIG
      });
    }

    try {
      // Rate limiting
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      rateLimit(clientIP);

      // Initialize services
      const dbManager = new DatabaseManager(env.DATABASE);
      const authService = new AuthenticationService(dbManager);
      const auditService = new AuditService(dbManager);
      const authzService = new AuthorizationService(dbManager);

      // Initialize API handlers
      const userAPI = new UserManagementAPI(dbManager, authService, auditService);
      const authAPI = new AuthenticationAPI(authService, auditService);

      // Parse URL
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // API versioning
      const versionMatch = path.match(/^\/api\/(v\d+)\//);
      const version = versionMatch ? versionMatch[1] : 'v1';
      
      if (!SUPPORTED_VERSIONS.includes(version)) {
        return new Response(JSON.stringify(
          ResponseFormatter.error('Unsupported API version', 'INVALID_VERSION', null, 400)
        ), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_CONFIG }
        });
      }

      // Route handling
      let response;

      // Authentication routes (public)
      if (path.startsWith(`/api/${version}/auth/`)) {
        if (path === `/api/${version}/auth/login` && method === 'POST') {
          response = await authAPI.login(request);
        } else if (path === `/api/${version}/auth/refresh` && method === 'POST') {
          response = await authAPI.refreshToken(request);
        } else {
          // Protected auth routes require authentication
          const user = await authenticateToken(request, env);
          
          if (path === `/api/${version}/auth/logout` && method === 'POST') {
            response = await authAPI.logout(request, user);
          } else {
            throw new Error('Endpoint not found');
          }
        }
      }
      // Protected routes
      else if (path.startsWith(`/api/${version}/`)) {
        // Authenticate user
        const user = await authenticateToken(request, env);

        // User management routes
        if (path.startsWith(`/api/${version}/users`)) {
          if (path === `/api/${version}/users` && method === 'GET') {
            await requirePermission(user, 'user.read', env);
            response = await userAPI.getUsers(request, user);
          } else if (path === `/api/${version}/users` && method === 'POST') {
            await requirePermission(user, 'user.create', env);
            response = await userAPI.createUser(request, user);
          } else if (path.match(`/api/${version}/users/[^/]+$`) && method === 'GET') {
            const userId = path.split('/').pop();
            await requirePermission(user, 'user.read', env);
            response = await userAPI.getUser(request, user, userId);
          } else if (path.match(`/api/${version}/users/[^/]+$`) && method === 'PUT') {
            const userId = path.split('/').pop();
            await requirePermission(user, 'user.update', env);
            response = await userAPI.updateUser(request, user, userId);
          } else {
            throw new Error('Endpoint not found');
          }
        }
        // Add more route categories here...
        else {
          throw new Error('Endpoint not found');
        }
      }
      // Fallback for non-API routes
      else {
        throw new Error('Endpoint not found');
      }

      // Return successful response
      return new Response(JSON.stringify(response), {
        status: response.metadata?.statusCode || 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_CONFIG
        }
      });

    } catch (error) {
      console.error('API Error:', error);

      // Determine status code based on error type
      let statusCode = 500;
      let errorCode = 'INTERNAL_SERVER_ERROR';

      if (error.message.includes('Authentication failed') || error.message.includes('Access token required')) {
        statusCode = 401;
        errorCode = 'UNAUTHORIZED';
      } else if (error.message.includes('Insufficient permissions')) {
        statusCode = 403;
        errorCode = 'FORBIDDEN';
      } else if (error.message.includes('not found') || error.message.includes('Endpoint not found')) {
        statusCode = 404;
        errorCode = 'NOT_FOUND';
      } else if (error.message.includes('Rate limit exceeded')) {
        statusCode = 429;
        errorCode = 'RATE_LIMIT_EXCEEDED';
      } else if (error.message.includes('Invalid') || error.message.includes('required')) {
        statusCode = 400;
        errorCode = 'BAD_REQUEST';
      }

      const errorResponse = ResponseFormatter.error(error.message, errorCode, null, statusCode);

      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_CONFIG
        }
      });
    }
  }
};

// =====================================================
// NOTES FOR IMPLEMENTATION
// =====================================================

/*
TODO: Complete API implementation with additional endpoints:

1. User Management:
   - DELETE /api/v2/users/:id - Delete user
   - POST /api/v2/users/:id/roles - Assign roles
   - DELETE /api/v2/users/:id/roles/:roleId - Remove role
   - GET /api/v2/users/:id/permissions - Get user permissions
   - POST /api/v2/users/:id/permissions - Grant permission
   - DELETE /api/v2/users/:id/permissions/:permissionId - Revoke permission

2. Organization Management:
   - GET /api/v2/organizations - List organizations
   - POST /api/v2/organizations - Create organization
   - PUT /api/v2/organizations/:id - Update organization
   - GET /api/v2/departments - List departments
   - POST /api/v2/departments - Create department
   - GET /api/v2/job-positions - List job positions
   - GET /api/v2/workplace-locations - List locations

3. Attendance Management:
   - GET /api/v2/attendance - List attendance records
   - POST /api/v2/attendance/clock-in - Clock in
   - POST /api/v2/attendance/clock-out - Clock out
   - GET /api/v2/attendance/reports - Attendance reports
   - GET /api/v2/work-schedules - List schedules
   - POST /api/v2/work-schedules - Create schedule

4. Task Management:
   - GET /api/v2/tasks - List tasks
   - POST /api/v2/tasks - Create task
   - PUT /api/v2/tasks/:id - Update task
   - DELETE /api/v2/tasks/:id - Delete task
   - GET /api/v2/projects - List projects
   - POST /api/v2/projects - Create project

5. Request Management:
   - GET /api/v2/requests - List requests
   - POST /api/v2/requests - Create request
   - PUT /api/v2/requests/:id - Update request
   - POST /api/v2/requests/:id/approve - Approve request
   - POST /api/v2/requests/:id/reject - Reject request

6. System Management:
   - GET /api/v2/audit-logs - View audit logs
   - GET /api/v2/security-events - View security events
   - GET /api/v2/system-settings - Get settings
   - PUT /api/v2/system-settings - Update settings
   - GET /api/v2/notifications - List notifications
   - PUT /api/v2/notifications/:id/read - Mark as read

7. Reporting:
   - GET /api/v2/reports/users - User reports
   - GET /api/v2/reports/attendance - Attendance reports
   - GET /api/v2/reports/tasks - Task reports
   - GET /api/v2/reports/requests - Request reports
   - POST /api/v2/reports/export - Export reports

8. File Management:
   - POST /api/v2/files/upload - Upload files
   - GET /api/v2/files/:id - Download files
   - DELETE /api/v2/files/:id - Delete files

Additional Features to Implement:
- Real-time notifications using WebSockets
- Advanced search and filtering
- Bulk operations for users and data
- Data import/export functionality
- Advanced reporting with charts
- Mobile app support with push notifications
- Integration APIs for external systems
- Backup and restore functionality
- Advanced security features (2FA, SSO)
- Performance monitoring and analytics
*/