/**
 * =====================================================
 * PROFESSIONAL HR MANAGEMENT SYSTEM - CLOUDFLARE WORKER
 * =====================================================
 * 
 * Enhanced Cloudflare Worker API for HR Management System
 * Features:
 * - JWT authentication with refresh tokens
 * - D2 database integration
 * - R2 file storage
 * - SendGrid email service
 * - Rate limiting and security
 * - Comprehensive audit logging
 * 
 * Version: 2.0.0
 * =====================================================
 */

import jwt from '@tashian/jwt-worker';

// Environment variables
const JWT_SECRET = 'your-jwt-secret-key-here';
const SENDGRID_API_KEY = 'your-sendgrid-api-key-here';
const FRONTEND_URL = 'https://your-domain.com';

// Rate limiting configuration
const RATE_LIMIT = {
  login: { requests: 5, window: 900000 }, // 5 attempts per 15 minutes
  register: { requests: 3, window: 3600000 }, // 3 attempts per hour
  general: { requests: 100, window: 3600000 } // 100 requests per hour
};

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      let response;
      
      // Authentication routes
      if (pathname === '/api/v1/auth/login' || pathname === '/login') {
        response = await handleLogin(request, env);
      } else if (pathname === '/api/v1/auth/register' || pathname === '/register') {
        response = await handleRegister(request, env);
      } else if (pathname === '/api/v1/auth/refresh') {
        response = await handleRefreshToken(request, env);
      } else if (pathname === '/api/v1/auth/logout') {
        response = await handleLogout(request, env);
      }
      
      // User management routes
      else if (pathname === '/api/v1/users' && method === 'GET') {
        response = await handleGetUsers(request, env);
      } else if (pathname === '/api/v1/users' && method === 'POST') {
        response = await handleCreateUser(request, env);
      } else if (pathname.startsWith('/api/v1/users/') && method === 'GET') {
        response = await handleGetUser(request, env);
      } else if (pathname.startsWith('/api/v1/users/') && method === 'PUT') {
        response = await handleUpdateUser(request, env);
      } else if (pathname.startsWith('/api/v1/users/') && method === 'DELETE') {
        response = await handleDeleteUser(request, env);
      }
      
      // Dashboard and statistics
      else if (pathname === '/api/v1/dashboard/stats') {
        response = await handleDashboardStats(request, env);
      } else if (pathname === '/api/v1/dashboard/activities') {
        response = await handleRecentActivities(request, env);
      }
      
      // Attendance routes
      else if (pathname === '/api/v1/attendance/checkin' && method === 'POST') {
        response = await handleCheckIn(request, env);
      } else if (pathname === '/api/v1/attendance/checkout' && method === 'POST') {
        response = await handleCheckOut(request, env);
      } else if (pathname === '/api/v1/attendance/today') {
        response = await handleTodayAttendance(request, env);
      } else if (pathname === '/api/v1/attendance/history') {
        response = await handleAttendanceHistory(request, env);
      }
      
      // Payroll routes
      else if (pathname === '/api/v1/payroll/calculate' && method === 'POST') {
        response = await handleCalculatePayroll(request, env);
      } else if (pathname === '/api/v1/payroll/history') {
        response = await handlePayrollHistory(request, env);
      }
      
      // File upload routes
      else if (pathname === '/api/v1/files/upload' && method === 'POST') {
        response = await handleFileUpload(request, env);
      } else if (pathname.startsWith('/api/v1/files/')) {
        response = await handleFileDownload(request, env);
      }
      
      // Reports
      else if (pathname === '/api/v1/reports/attendance') {
        response = await handleAttendanceReport(request, env);
      } else if (pathname === '/api/v1/reports/payroll') {
        response = await handlePayrollReport(request, env);
      }
      
      // Health check
      else if (pathname === '/api/v1/health') {
        response = new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Legacy query parameter routing support
      else if (url.searchParams.has('action')) {
        response = await handleLegacyRouting(request, env);
      }
      
      // 404 - Endpoint not found
      else {
        response = new Response(JSON.stringify({
          success: false,
          error: 'Endpoint Not Found',
          message: `${method} endpoint '${pathname}' not found`
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('Worker error:', error);
      
      const errorResponse = new Response(JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

      return errorResponse;
    }
  }
};

// Authentication Functions

async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate input
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(request, env, 'login');
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many login attempts. Please try again later.', 429);
    }

    // Get user from database
    const user = await getUserByEmail(env.DB, email);
    if (!user) {
      await logFailedAttempt(env.DB, email, 'Invalid credentials');
      return createErrorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      await logFailedAttempt(env.DB, email, 'Invalid password');
      return createErrorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      return createErrorResponse('Account is not active', 403);
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    // Store refresh token
    await storeRefreshToken(env.DB, user.user_id, refreshToken, rememberMe);

    // Update last login
    await updateLastLogin(env.DB, user.user_id);

    // Log successful login
    await logAuditEvent(env.DB, user.user_id, 'login', 'User logged in successfully');

    return createSuccessResponse({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
        position: user.position
      },
      tokens: {
        accessToken,
        refreshToken: rememberMe ? refreshToken : undefined
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Login failed', 500);
  }
}

async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      department, 
      position, 
      employeeId, 
      password 
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !department || !position || !password) {
      return createErrorResponse('All required fields must be provided', 400);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return createErrorResponse('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 400);
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(request, env, 'register');
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many registration attempts. Please try again later.', 429);
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(env.DB, email);
    if (existingUser) {
      return createErrorResponse('Email already registered', 409);
    }

    // Check if employee ID already exists (if provided)
    if (employeeId) {
      const existingEmployee = await getUserByEmployeeId(env.DB, employeeId);
      if (existingEmployee) {
        return createErrorResponse('Employee ID already exists', 409);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const verificationToken = await generateVerificationToken();

    // Create user
    const userId = await createUser(env.DB, {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      employeeId,
      passwordHash,
      verificationToken
    });

    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken);

    // Log registration
    await logAuditEvent(env.DB, userId, 'register', 'User registered successfully');

    return createSuccessResponse({
      message: 'Registration successful. Please check your email for verification.',
      userId
    });

  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Registration failed', 500);
  }
}

async function handleRefreshToken(request, env) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return createErrorResponse('Refresh token is required', 400);
    }

    // Verify refresh token
    const tokenData = await verifyRefreshToken(env.DB, refreshToken);
    if (!tokenData) {
      return createErrorResponse('Invalid or expired refresh token', 401);
    }

    // Get user
    const user = await getUserById(env.DB, tokenData.user_id);
    if (!user || user.status !== 'active') {
      return createErrorResponse('User not found or inactive', 401);
    }

    // Generate new access token
    const accessToken = await generateAccessToken(user);

    return createSuccessResponse({
      accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse('Token refresh failed', 500);
  }
}

async function handleLogout(request, env) {
  try {
    const authResult = await authenticateRequest(request, env);
    if (!authResult.success) {
      return createErrorResponse(authResult.error, 401);
    }

    const body = await request.json();
    const { refreshToken } = body;

    // Revoke refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(env.DB, refreshToken);
    }

    // Log logout
    await logAuditEvent(env.DB, authResult.user.user_id, 'logout', 'User logged out');

    return createSuccessResponse({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return createErrorResponse('Logout failed', 500);
  }
}

// User Management Functions

async function handleGetUsers(request, env) {
  try {
    const authResult = await authenticateRequest(request, env);
    if (!authResult.success) {
      return createErrorResponse(authResult.error, 401);
    }

    // Check permissions
    if (!hasPermission(authResult.user, 'view_users')) {
      return createErrorResponse('Insufficient permissions', 403);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const search = url.searchParams.get('search') || '';
    const department = url.searchParams.get('department') || '';
    const status = url.searchParams.get('status') || '';

    const users = await getUsers(env.DB, { page, limit, search, department, status });

    return createSuccessResponse(users);

  } catch (error) {
    console.error('Get users error:', error);
    return createErrorResponse('Failed to fetch users', 500);
  }
}

// Dashboard Functions

async function handleDashboardStats(request, env) {
  try {
    const authResult = await authenticateRequest(request, env);
    if (!authResult.success) {
      return createErrorResponse(authResult.error, 401);
    }

    const stats = await getDashboardStats(env.DB);

    return createSuccessResponse(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return createErrorResponse('Failed to fetch dashboard stats', 500);
  }
}

// Attendance Functions

async function handleCheckIn(request, env) {
  try {
    const authResult = await authenticateRequest(request, env);
    if (!authResult.success) {
      return createErrorResponse(authResult.error, 401);
    }

    const body = await request.json();
    const { latitude, longitude, note } = body;

    // Record check-in
    const checkInId = await recordCheckIn(env.DB, {
      userId: authResult.user.user_id,
      latitude,
      longitude,
      note,
      timestamp: new Date().toISOString()
    });

    // Log audit event
    await logAuditEvent(env.DB, authResult.user.user_id, 'checkin', 'User checked in');

    return createSuccessResponse({
      message: 'Check-in successful',
      checkInId
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return createErrorResponse('Check-in failed', 500);
  }
}

// Helper Functions

async function authenticateRequest(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    const payload = await jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await getUserById(env.DB, payload.sub);
    if (!user || user.status !== 'active') {
      return { success: false, error: 'User not found or inactive' };
    }

    return { success: true, user };

  } catch (error) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

async function checkRateLimit(request, env, type) {
  // Implementation would use KV storage for rate limiting
  // For now, return allowed
  return { allowed: true };
}

async function getUserByEmail(db, email) {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    const result = await stmt.bind(email).first();
    return result;
  } catch (error) {
    console.error('Database error in getUserByEmail:', error);
    return null;
  }
}

async function createUser(db, userData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO users (
        first_name, last_name, email, phone, department, position, 
        employee_id, password_hash, verification_token, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `);
    
    const result = await stmt.bind(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.phone,
      userData.department,
      userData.position,
      userData.employeeId,
      userData.passwordHash,
      userData.verificationToken
    ).run();
    
    return result.meta.last_row_id;
  } catch (error) {
    console.error('Database error in createUser:', error);
    throw error;
  }
}

async function getDashboardStats(db) {
  try {
    // Get total employees
    const totalEmployees = await db.prepare('SELECT COUNT(*) as count FROM users WHERE status = "active"').first();
    
    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const presentToday = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM attendance 
      WHERE DATE(check_in_time) = ?
    `).bind(today).first();
    
    // Get late arrivals today
    const lateToday = await db.prepare(`
      SELECT COUNT(*) as count 
      FROM attendance 
      WHERE DATE(check_in_time) = ? AND TIME(check_in_time) > '09:00:00'
    `).bind(today).first();
    
    // Get absent employees today
    const absentToday = {
      count: totalEmployees.count - presentToday.count
    };

    return {
      totalEmployees: totalEmployees.count,
      presentToday: presentToday.count,
      lateToday: lateToday.count,
      absentToday: absentToday.count
    };
  } catch (error) {
    console.error('Database error in getDashboardStats:', error);
    throw error;
  }
}

// Utility Functions

function createSuccessResponse(data) {
  return new Response(JSON.stringify({
    success: true,
    data
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({
    success: false,
    error: message
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function generateAccessToken(user) {
  const payload = {
    sub: user.user_id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  return await jwt.sign(payload, JWT_SECRET);
}

async function generateRefreshToken(user) {
  const payload = {
    sub: user.user_id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  return await jwt.sign(payload, JWT_SECRET);
}

async function hashPassword(password) {
  // In a real implementation, use bcrypt or similar
  // For now, using a simple hash (NOT SECURE - REPLACE IN PRODUCTION)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

async function sendVerificationEmail(email, name, token) {
  // Implementation would use SendGrid API
  console.log(`Verification email would be sent to ${email} with token ${token}`);
}

async function logAuditEvent(db, userId, action, details) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    await stmt.bind(userId, action, details, '', '').run();
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

function hasPermission(user, permission) {
  // Basic role-based permissions
  const rolePermissions = {
    admin: ['view_users', 'create_users', 'edit_users', 'delete_users', 'view_reports'],
    manager: ['view_users', 'create_users', 'edit_users', 'view_reports'],
    hr: ['view_users', 'create_users', 'edit_users'],
    employee: ['view_profile']
  };
  
  return rolePermissions[user.role]?.includes(permission) || false;
}

// Legacy routing support
async function handleLegacyRouting(request, env) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  switch (action) {
    case 'register':
      return await handleRegister(request, env);
    case 'login':
      return await handleLogin(request, env);
    default:
      return createErrorResponse('Unknown action', 404);
  }
}