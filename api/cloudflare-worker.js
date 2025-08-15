/**
 * Professional HR Management System - Cloudflare Workers API
 * Enhanced security, D2 Database integration, R2 file storage
 * Built for enterprise-grade performance and scalability
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Initialize response with CORS headers
      const response = await handleRequest(request, env, path, method);
      
      // Ensure response exists and has headers
      if (response && response.headers) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      } else {
        // Return a default response if handleRequest doesn't return proper response
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid Response',
          message: 'Invalid response from request handler'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

/**
 * Main request handler
 */
async function handleRequest(request, env, path, method) {
  const url = new URL(request.url);
  
  // API versioning support
  const apiVersion = path.startsWith('/api/v2') ? 'v2' : 'v1';
  const endpoint = path.replace('/api/v1/', '').replace('/api/v2/', '');

  // Legacy query parameter support
  const action = url.searchParams.get('action');
  const finalEndpoint = action || endpoint;

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(request, env);
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Rate Limit Exceeded',
      message: `Too many requests. Try again in ${rateLimitResult.resetTime} seconds.`,
      retryAfter: rateLimitResult.resetTime
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': rateLimitResult.resetTime.toString() }
    });
  }

  // Route handling
  switch (method) {
    case 'GET':
      return handleGetRequest(finalEndpoint, url, env, request);
    case 'POST':
      return handlePostRequest(finalEndpoint, request, env);
    case 'PUT':
      return handlePutRequest(finalEndpoint, request, env);
    case 'DELETE':
      return handleDeleteRequest(finalEndpoint, url, env, request);
    default:
      return new Response(JSON.stringify({
        success: false,
        error: 'Method Not Allowed',
        message: `HTTP method ${method} is not supported`
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

/**
 * Handle GET requests
 */
async function handleGetRequest(endpoint, url, env, request) {
  const auth = await authenticateRequest(request, env);
  
  switch (endpoint) {
    case 'users':
      return getUsers(url, env, auth);
    case 'user':
      return getUser(url, env, auth);
    case 'dashboard-stats':
    case 'getDashboardStats':
      return getDashboardStats(env, auth);
    case 'personal-stats':
    case 'getPersonalStats':
      return getPersonalStats(url, env, auth);
    case 'work-tasks':
    case 'getWorkTasks':
      return getWorkTasks(url, env, auth);
    case 'timesheet':
    case 'getTimesheet':
      return getTimesheet(url, env, auth);
    case 'attendance-requests':
    case 'getAttendanceRequests':
      return getAttendanceRequests(url, env, auth);
    case 'pending-registrations':
    case 'getPendingRegistrations':
      return getPendingRegistrations(env, auth);
    case 'sendgrid-key':
    case 'getSendGridApiKey':
      return getSendGridApiKey(env, auth);
    case 'health':
      return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }), { headers: { 'Content-Type': 'application/json' } });
    default:
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint Not Found',
        message: `GET endpoint '${endpoint}' not found`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

/**
 * Handle POST requests
 */
async function handlePostRequest(endpoint, request, env) {
  const data = await request.json().catch(() => ({}));
  
  switch (endpoint) {
    case 'login':
      return login(data, env, request);
    case 'register':
      return register(data, env, request);
    case 'logout':
      return logout(request, env);
    case 'verify-email':
      return verifyEmail(data, env);
    case 'send-verification':
    case 'sendVerificationEmail':
      return sendVerificationEmail(data, env);
    case 'forgot-password':
      return forgotPassword(data, env);
    case 'reset-password':
      return resetPassword(data, env);
    case 'change-password':
      return changePassword(data, env, request);
    case 'users':
      return createUser(data, env, request);
    case 'attendance-request':
      return createAttendanceRequest(data, env, request);
    case 'upload-avatar':
      return uploadAvatar(request, env);
    default:
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint Not Found',
        message: `POST endpoint '${endpoint}' not found`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

/**
 * Handle PUT requests
 */
async function handlePutRequest(endpoint, request, env) {
  const auth = await authenticateRequest(request, env);
  const data = await request.json().catch(() => ({}));
  
  switch (endpoint) {
    case 'user':
      return updateUser(data, env, auth);
    case 'user-role':
      return updateUserRole(data, env, auth);
    case 'attendance-request':
      return updateAttendanceRequest(data, env, auth);
    case 'approve-registration':
      return approveRegistration(data, env, auth);
    default:
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint Not Found',
        message: `PUT endpoint '${endpoint}' not found`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

/**
 * Handle DELETE requests
 */
async function handleDeleteRequest(endpoint, url, env, request) {
  const auth = await authenticateRequest(request, env);
  
  switch (endpoint) {
    case 'user':
      const userId = url.searchParams.get('id');
      return deleteUser(userId, env, auth);
    case 'attendance-request':
      const requestId = url.searchParams.get('id');
      return deleteAttendanceRequest(requestId, env, auth);
    default:
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint Not Found',
        message: `DELETE endpoint '${endpoint}' not found`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

/**
 * Authentication Functions
 */
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

async function login(data, env, request) {
  const { email, password, rememberMe } = data;
  
  if (!email || !password) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Validation Error',
      message: 'Email and password are required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check rate limiting for login attempts
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const loginAttempts = await checkLoginAttempts(clientIP, env);
    
    if (loginAttempts.blocked) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Account Locked',
        message: `Too many failed login attempts. Account locked for ${loginAttempts.lockoutTime} minutes.`,
        lockoutTime: loginAttempts.lockoutTime
      }), {
        status: 423,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user from database
    const stmt = env.DB.prepare('SELECT * FROM users WHERE email = ? AND status = "active"');
    const user = await stmt.bind(email).first();
    
    if (!user) {
      await recordFailedLoginAttempt(clientIP, env);
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      await recordFailedLoginAttempt(clientIP, env);
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email Not Verified',
        message: 'Please verify your email address before logging in'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Clear failed login attempts
    await clearFailedLoginAttempts(clientIP, env);

    // Generate JWT tokens
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const accessToken = await generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions ? JSON.parse(user.permissions) : []
    }, env.JWT_SECRET, tokenExpiry);

    const refreshToken = await generateJWT({
      userId: user.id,
      type: 'refresh'
    }, env.JWT_SECRET, '30d');

    // Update last login
    await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(new Date().toISOString(), user.id).run();

    // Log security event
    await logSecurityEvent('login_success', user.id, clientIP, env);

    // Return user data (exclude sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      permissions: user.permissions ? JSON.parse(user.permissions) : [],
      avatar: user.avatar_url,
      status: user.status,
      lastLogin: user.last_login,
      profile: {
        phone: user.phone,
        department: user.department,
        position: user.position,
        employeeId: user.employee_id
      }
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken,
        refreshToken,
        expiresIn: rememberMe ? '30 days' : '24 hours'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred during login'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function register(data, env, request) {
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    phone,
    department,
    position,
    employeeId
  } = data;

  // Validation
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Validation Error',
      message: 'All required fields must be filled'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (password !== confirmPassword) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Validation Error',
      message: 'Passwords do not match'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Password strength validation
  if (!isStrongPassword(password)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Validation Error',
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if user already exists
    const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User Exists',
        message: 'An account with this email already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if employee ID is unique (if provided)
    if (employeeId) {
      const existingEmployee = await env.DB.prepare('SELECT id FROM users WHERE employee_id = ?')
        .bind(employeeId).first();
      
      if (existingEmployee) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Employee ID Exists',
          message: 'An account with this employee ID already exists'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateSecureToken();
    
    // Create user (pending verification)
    const userId = generateUUID();
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone,
        department, position, employee_id, status, email_verified,
        email_verification_token, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', false, ?, ?, ?)
    `).bind(
      userId, email, passwordHash, firstName, lastName, phone || null,
      department || null, position || null, employeeId || null,
      verificationToken, now, now
    ).run();

    // Send verification email
    const emailSent = await sendVerificationEmail({
      email,
      firstName,
      verificationToken
    }, env);

    // Log security event
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    await logSecurityEvent('user_registration', userId, clientIP, env);

    return new Response(JSON.stringify({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        userId,
        email,
        verificationSent: emailSent.success
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred during registration'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Email Service Functions
 */
async function getSendGridApiKey(env, auth) {
  // Only allow admin/manager access
  if (!auth || !['AD', 'Manager'].includes(auth.role)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unauthorized',
      message: 'Insufficient permissions to access SendGrid API key'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    data: {
      apiKey: env.SENDGRID_API_KEY,
      fromEmail: env.FROM_EMAIL || 'noreply@company.com',
      fromName: env.FROM_NAME || 'HR Management System'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sendVerificationEmail(data, env) {
  const { email, firstName, verificationToken } = data;
  
  try {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const emailData = {
      personalizations: [{
        to: [{ email, name: firstName }],
        subject: 'Verify Your Email Address - HR Management System'
      }],
      from: {
        email: env.FROM_EMAIL || 'noreply@company.com',
        name: env.FROM_NAME || 'HR Management System'
      },
      content: [{
        type: 'text/html',
        value: generateVerificationEmailTemplate(firstName, verificationUrl)
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      return { success: true, message: 'Verification email sent successfully' };
    } else {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Email service error' };
  }
}

function generateVerificationEmailTemplate(firstName, verificationUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
            text-align: center;
        }
        .content h2 {
            color: #1F2937;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: 600;
        }
        .content p {
            color: #6B7280;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
        }
        .footer {
            background: #F9FAFB;
            padding: 30px;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
        }
        .security-notice {
            background: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #92400E;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to HR Management System</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering with our professional HR Management System. To complete your registration and secure your account, please verify your email address.</p>
            
            <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
            
            <div class="security-notice">
                <strong>🔒 Security Notice:</strong> This link will expire in 24 hours for your security.
            </div>
            
            <p>If you didn't create this account, please ignore this email or contact our support team.</p>
        </div>
        <div class="footer">
            <p>© 2024 Professional HR Management System. All rights reserved.</p>
            <p>This email was sent from a secure system. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Data Retrieval Functions
 */
async function getDashboardStats(env, auth) {
  if (!auth) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let stats = {};

    if (['AD', 'Manager'].includes(auth.role)) {
      // Admin/Manager dashboard stats
      const totalUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE status != "deleted"').first();
      const activeUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE status = "active"').first();
      const pendingUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE status = "pending"').first();
      const pendingRequests = await env.DB.prepare('SELECT COUNT(*) as count FROM attendance_requests WHERE status = "pending"').first();
      
      stats = {
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        pendingUsers: pendingUsers.count,
        pendingRequests: pendingRequests.count,
        systemHealth: 'excellent'
      };
    } else {
      // Employee dashboard stats
      const userRequests = await env.DB.prepare('SELECT COUNT(*) as count FROM attendance_requests WHERE user_id = ?')
        .bind(auth.userId).first();
      const approvedRequests = await env.DB.prepare('SELECT COUNT(*) as count FROM attendance_requests WHERE user_id = ? AND status = "approved"')
        .bind(auth.userId).first();
      
      stats = {
        totalRequests: userRequests.count,
        approvedRequests: approvedRequests.count,
        pendingRequests: userRequests.count - approvedRequests.count
      };
    }

    return new Response(JSON.stringify({
      success: true,
      data: stats
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve dashboard statistics'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Utility Functions
 */
async function checkRateLimit(request, env) {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${clientIP}`;
  
  try {
    const current = await env.KV.get(key);
    const count = current ? parseInt(current) : 0;
    const limit = 100; // requests per minute
    
    if (count >= limit) {
      return { allowed: false, resetTime: 60 };
    }
    
    await env.KV.put(key, (count + 1).toString(), { expirationTtl: 60 });
    return { allowed: true };
  } catch (error) {
    // If KV is unavailable, allow the request
    return { allowed: true };
  }
}

async function verifyJWT(token, secret) {
  // JWT verification implementation
  // This is a simplified version - use proper JWT library in production
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function generateJWT(payload, secret, expiresIn = '24h') {
  // JWT generation implementation
  // This is a simplified version - use proper JWT library in production
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpirationTime(expiresIn);
  
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: now, exp }));
  const signature = btoa('signature'); // Implement proper HMAC signature
  
  return `${header}.${body}.${signature}`;
}

function parseExpirationTime(expiresIn) {
  const match = expiresIn.match(/(\d+)([hmd])/);
  if (!match) return 86400; // default 24h
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    case 'm': return value * 60;
    default: return 86400;
  }
}

async function hashPassword(password) {
  // Use crypto.subtle for proper password hashing in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

function isStrongPassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateSecureToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

async function logSecurityEvent(event, userId, ip, env) {
  try {
    await env.DB.prepare(`
      INSERT INTO security_logs (id, event_type, user_id, ip_address, timestamp, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      generateUUID(),
      event,
      userId,
      ip,
      new Date().toISOString(),
      JSON.stringify({ userAgent: 'unknown' })
    ).run();
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Placeholder implementations for other functions
async function getUsers(url, env, auth) { /* Implementation */ }
async function getUser(url, env, auth) { /* Implementation */ }
async function getPersonalStats(url, env, auth) { /* Implementation */ }
async function getWorkTasks(url, env, auth) { /* Implementation */ }
async function getTimesheet(url, env, auth) { /* Implementation */ }
async function getAttendanceRequests(url, env, auth) { /* Implementation */ }
async function getPendingRegistrations(env, auth) { /* Implementation */ }
async function logout(request, env) { /* Implementation */ }
async function verifyEmail(data, env) { /* Implementation */ }
async function forgotPassword(data, env) { /* Implementation */ }
async function resetPassword(data, env) { /* Implementation */ }
async function changePassword(data, env, request) { /* Implementation */ }
async function createUser(data, env, request) { /* Implementation */ }
async function createAttendanceRequest(data, env, request) { /* Implementation */ }
async function uploadAvatar(request, env) { /* Implementation */ }
async function updateUser(data, env, auth) { /* Implementation */ }
async function updateUserRole(data, env, auth) { /* Implementation */ }
async function updateAttendanceRequest(data, env, auth) { /* Implementation */ }
async function approveRegistration(data, env, auth) { /* Implementation */ }
async function deleteUser(userId, env, auth) { /* Implementation */ }
async function deleteAttendanceRequest(requestId, env, auth) { /* Implementation */ }
async function checkLoginAttempts(ip, env) {
  try {
    const key = `login_attempts:${ip}`;
    const data = await env.KV.get(key);
    
    if (!data) {
      return { blocked: false, attempts: 0, lockoutTime: 0 };
    }
    
    const attempts = JSON.parse(data);
    const now = Date.now();
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    
    // Check if still in lockout period
    if (attempts.lastAttempt && (now - attempts.lastAttempt) < lockoutDuration && attempts.count >= maxAttempts) {
      const remainingTime = Math.ceil((lockoutDuration - (now - attempts.lastAttempt)) / 60000);
      return { 
        blocked: true, 
        attempts: attempts.count, 
        lockoutTime: remainingTime,
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    // Reset if lockout period has passed
    if (attempts.lastAttempt && (now - attempts.lastAttempt) >= lockoutDuration) {
      await env.KV.delete(key);
      return { blocked: false, attempts: 0, lockoutTime: 0 };
    }
    
    return { 
      blocked: false, 
      attempts: attempts.count || 0, 
      lockoutTime: 0,
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return { blocked: false, attempts: 0, lockoutTime: 0 };
  }
}

async function recordFailedLoginAttempt(ip, env) {
  try {
    const key = `login_attempts:${ip}`;
    const data = await env.KV.get(key);
    
    const attempts = data ? JSON.parse(data) : { count: 0 };
    attempts.count = (attempts.count || 0) + 1;
    attempts.lastAttempt = Date.now();
    
    // Store for 24 hours
    await env.KV.put(key, JSON.stringify(attempts), { expirationTtl: 86400 });
    
    return attempts;
  } catch (error) {
    console.error('Error recording failed login attempt:', error);
    return { count: 0 };
  }
}

async function clearFailedLoginAttempts(ip, env) {
  try {
    const key = `login_attempts:${ip}`;
    await env.KV.delete(key);
    return true;
  } catch (error) {
    console.error('Error clearing failed login attempts:', error);
    return false;
  }
}