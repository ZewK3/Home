// ===== CLOUDFLARE WORKER HR MANAGEMENT SYSTEM - RESTFUL API =====
// Environment-based CORS origins (CSV format in ALLOWED_ORIGINS env var)
// Example: "http://localhost:5173,https://yourdomain.com"
function getAllowedOrigins(env) {
  return env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['*'];
}

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

// ===== RESPONSE HELPERS =====
function ok(data, status = 200) {
  return {
    ok: true,
    data,
    timestamp: new Date().toISOString(),
    status
  };
}

function fail(code, message, status = 400, details = null) {
  return {
    ok: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    status
  };
}

function jsonResponse(responseData, status = 200, allowedOrigin = '*') {
  return new Response(JSON.stringify(responseData), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block"
    },
  });
}

const loginAttempts = new Map();
function isRateLimited(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, first: now };
  if (now - entry.first > windowMs) {
    entry.count = 0;
    entry.first = now;
  }
  entry.count++;
  loginAttempts.set(ip, entry);
  return entry.count > limit;
}

// ===== CORS HANDLING =====
function handleCors(request, env) {
  const allowedOrigins = getAllowedOrigins(env);
  const origin = request.headers.get('Origin');
  
  // Check if origin is allowed
  const allowedOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin) 
    ? (allowedOrigins.includes('*') ? '*' : origin) 
    : null;
    
  if (!allowedOrigin && origin) {
    return jsonResponse(fail('CORS_BLOCKED', 'Origin not allowed'), 403);
  }
  
  return allowedOrigin || '*';
}

function handleOptionsRequest(env) {
  const allowedOrigins = getAllowedOrigins(env);
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigins.includes('*') ? '*' : (allowedOrigins[0] || '*'),
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    },
  });
}

// ===== SENDGRID EMAIL =====
async function getSendGridApiKey(env) {
  try {
    return await env.KV_STORE.get("SENDGRID_API_KEY");
  } catch (error) {
    console.error("Failed to get SendGrid API key from KV:", error);
    return null;
  }
}

async function sendVerificationEmail(email, employeeId, fullName, env) {
  const verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  
  const SENDGRID_API_KEY = await getSendGridApiKey(env);
  if (!SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not found in KV storage");
  }
  
  const emailData = {
    personalizations: [{
      to: [{ email: email }],
      subject: "Xác nhận đăng ký tài khoản HR Management System"
    }],
    from: { 
      email: "noreply@zewk.fun",
      name: "HR Management System"
    },
    content: [{
      type: "text/html",
      value: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 30px; border-radius: 8px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">HR Management System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Xác nhận đăng ký tài khoản</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Xin chào ${fullName}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Cảm ơn bạn đã đăng ký tài khoản với HR Management System. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác nhận dưới đây:
            </p>
            
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin-bottom: 10px; font-size: 14px;">Mã xác nhận của bạn:</p>
              <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 4px; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Lưu ý quan trọng:</strong> Sau khi nhập mã xác nhận, tài khoản của bạn sẽ được gửi tới quản lý cửa hàng để phê duyệt. Bạn sẽ nhận được thông báo khi tài khoản được kích hoạt.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Thông tin đăng ký:</strong><br>
                Mã nhân viên: ${employeeId}<br>
                Email: ${email}<br>
                Thời gian đăng ký: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email này.
            </p>
          </div>
        </div>
      `
    }]
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    return verificationCode;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

// ===== AUTHENTICATION MIDDLEWARE =====
async function requireAuth(request, env) {
  // Extract token from Authorization header or query parameter
  let token = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    const url = new URL(request.url);
    token = url.searchParams.get("token");
  }

  if (!token) {
    return fail('AUTH_REQUIRED', 'Authentication required - please login', 401);
  }

  try {
    const session = await env.D1_BINDING
      .prepare("SELECT employeeId, expiresAt, lastAccess FROM sessions WHERE token = ?")
      .bind(token)
      .first();

    if (!session) {
      return fail('INVALID_SESSION', 'Invalid session - please login again', 401);
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    // Add buffer time 5 minutes to avoid timezone errors
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (now.getTime() > (expiresAt.getTime() + bufferTime)) {
      // Clean up expired session
      await env.D1_BINDING.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
      return fail('SESSION_EXPIRED', 'Session expired - please login again', 401);
    }

    // Update last access time
    await env.D1_BINDING
      .prepare("UPDATE sessions SET lastAccess = ? WHERE token = ?")
      .bind(now.toISOString(), token)
      .run();

    return { employeeId: session.employeeId };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return fail('AUTH_ERROR', 'Authentication system error', 500);
  }
}

async function createSession(employeeId, env) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8); // Session expires after 8 hours
  const now = TimezoneUtils.toHanoiISOString();

  try {
    // Remove old sessions for this user
    await env.D1_BINDING.prepare("DELETE FROM sessions WHERE employeeId = ?").bind(employeeId).run();

    // Create new session
    await env.D1_BINDING
      .prepare("INSERT INTO sessions (employeeId, token, expiresAt, lastAccess) VALUES (?, ?, ?, ?)")
      .bind(employeeId, token, expiresAt.toISOString(), now)
      .run();

    return {
      token,
      employeeId,
      expiresAt: expiresAt.toISOString(),
      lastAccess: now
    };
  } catch (error) {
    console.error("Session creation error:", error);
    throw error;
  }
}

// ===== PASSWORD HASHING =====
async function hashPasswordPBKDF2(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );

  return { hash: new Uint8Array(hashBuffer), salt };
}

async function verifyPassword(storedHash, storedSalt, password) {
  const { hash } = await hashPasswordPBKDF2(password, storedSalt);
  return storedHash.length === hash.length && storedHash.every((byte, index) => byte === hash[index]);
}

// ===== ROUTER =====
class Router {
  constructor() {
    this.routes = new Map();
  }

  addRoute(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler);
  }

  get(path, handler) { this.addRoute('GET', path, handler); }
  post(path, handler) { this.addRoute('POST', path, handler); }
  put(path, handler) { this.addRoute('PUT', path, handler); }
  delete(path, handler) { this.addRoute('DELETE', path, handler); }

  async route(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // Strip /Home/api prefix
    if (pathname.startsWith('/Home/api')) {
      pathname = pathname.substring('/Home/api'.length) || '/';
    }

    const method = request.method.toUpperCase();
    const key = `${method}:${pathname}`;
    
    // Check for exact match first
    if (this.routes.has(key)) {
      const handler = this.routes.get(key);
      return await handler(request, env);
    }

    // Check for parameterized routes
    for (const [routeKey, handler] of this.routes.entries()) {
      const [routeMethod, routePath] = routeKey.split(':');
      if (routeMethod !== method) continue;
      
      const match = this.matchPath(routePath, pathname);
      if (match) {
        request.params = match.params;
        return await handler(request, env);
      }
    }

    // Route not found
    const allowedOrigin = handleCors(request, env);
    if (allowedOrigin instanceof Response) return allowedOrigin;
    
    return jsonResponse(fail('NOT_FOUND', `Route ${method} ${pathname} not found`, 404), 404, allowedOrigin);
  }

  matchPath(routePath, pathname) {
    const routeParts = routePath.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    
    if (routeParts.length !== pathParts.length) return null;
    
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      
      if (routePart.startsWith(':')) {
        params[routePart.substring(1)] = pathPart;
      } else if (routePart !== pathPart) {
        return null;
      }
    }
    
    return { params };
  }
}

// ===== AUTH ENDPOINTS =====
async function handleAuthLogin(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return jsonResponse(fail('RATE_LIMIT', 'Too many login attempts', 429), 429, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { loginEmployeeId: employeeId, loginPassword: password } = body;

    if (!employeeId || !password) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing employee ID or password'), 400, allowedOrigin);
    }

    // Check if user is in the queue (pending approval)
    const queueUser = await env.D1_BINDING
      .prepare('SELECT * FROM queue WHERE employeeId = ?')
      .bind(employeeId)
      .first();

    if (queueUser && queueUser.status === 'Wait') {
      return jsonResponse(fail('PENDING_APPROVAL', 'Your account is pending approval from store management'), 403, allowedOrigin);
    }

    const user = await env.D1_BINDING
      .prepare('SELECT password, salt FROM employees WHERE employeeId = ?')
      .bind(employeeId)
      .first();

    if (!user) {
      return jsonResponse(fail('USER_NOT_FOUND', 'Employee ID not found'), 404, allowedOrigin);
    }

    const storedHash = Uint8Array.from(user.password.split(',').map(Number));
    const storedSalt = Uint8Array.from(user.salt.split(',').map(Number));
    const isPasswordCorrect = await verifyPassword(storedHash, storedSalt, password);

    if (!isPasswordCorrect) {
      return jsonResponse(fail('INVALID_PASSWORD', 'Incorrect password'), 401, allowedOrigin);
    }

    const sessionData = await createSession(employeeId, env);
    return jsonResponse(ok(sessionData), 200, allowedOrigin);

  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse(fail('LOGIN_ERROR', 'Login system error', 500), 500, allowedOrigin);
  }
}

async function handleAuthRegister(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  try {
    const body = await request.json();
    const { employeeId, fullName, storeName, password, phone, email, position, joinDate, verificationCode } = body;
    
    if (!employeeId || !fullName || !storeName || !password) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing required fields'), 400, allowedOrigin);
    }

    // If verification code is provided, this is step 2 (verification)
    if (verificationCode) {
      return await handleVerifyEmail(body, env, allowedOrigin);
    }

    // Step 1: Send verification email
    if (!email) {
      return jsonResponse(fail('EMAIL_REQUIRED', 'Email is required for account verification'), 400, allowedOrigin);
    }

    // Check for existing employee ID, phone, email
    const checks = await Promise.all([
      env.D1_BINDING.prepare("SELECT employeeId FROM employees WHERE employeeId = ?").bind(employeeId).first(),
      env.D1_BINDING.prepare("SELECT employeeId FROM queue WHERE employeeId = ?").bind(employeeId).first(),
      phone ? env.D1_BINDING.prepare("SELECT employeeId FROM employees WHERE phone = ? UNION SELECT employeeId FROM queue WHERE phone = ?").bind(phone, phone).first() : null,
      env.D1_BINDING.prepare("SELECT employeeId FROM employees WHERE email = ? UNION SELECT employeeId FROM queue WHERE email = ?").bind(email, email).first()
    ]);

    if (checks[0]) return jsonResponse(fail('EMPLOYEE_ID_EXISTS', 'Employee ID already exists'), 409, allowedOrigin);
    if (checks[1] && checks[1].status === "Wait") return jsonResponse(fail('PENDING_APPROVAL', 'Account already pending approval'), 403, allowedOrigin);
    if (checks[2]) return jsonResponse(fail('PHONE_EXISTS', 'Phone number already exists'), 409, allowedOrigin);
    if (checks[3]) return jsonResponse(fail('EMAIL_EXISTS', 'Email already exists'), 409, allowedOrigin);

    // Send verification email and store data
    const sentVerificationCode = await sendVerificationEmail(email, employeeId, fullName, env);
    const { hash, salt } = await hashPasswordPBKDF2(password);
    
    // Clean up existing verification entries
    await env.D1_BINDING.prepare("DELETE FROM email_verification WHERE email = ? OR employeeId = ?")
            .bind(email, employeeId).run();
    
    // Store verification data
    await env.D1_BINDING
      .prepare("INSERT INTO email_verification (employeeId, email, verificationCode, fullName, storeName, position, joinDate, phone, passwordHash, passwordSalt, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+15 minutes'))")
      .bind(
        employeeId, email, sentVerificationCode, fullName, storeName,
        position || "NV", joinDate || null, phone || null,
        Array.from(hash).join(","), Array.from(salt).join(",")
      )
      .run();

    return jsonResponse(ok({
      message: "Verification code sent to your email. Please check and enter the code.",
      requiresVerification: true
    }), 200, allowedOrigin);

  } catch (error) {
    console.error("Register error:", error);
    return jsonResponse(fail('REGISTER_ERROR', 'Registration system error', 500), 500, allowedOrigin);
  }
}

async function handleVerifyEmail(body, env, allowedOrigin) {
  const { employeeId, verificationCode } = body;
  
  if (!employeeId || !verificationCode) {
    return jsonResponse(fail('MISSING_FIELDS', 'Missing employee ID or verification code'), 400, allowedOrigin);
  }

  // Get verification data
  const verification = await env.D1_BINDING
    .prepare("SELECT * FROM email_verification WHERE employeeId = ? AND verificationCode = ? AND expiresAt > datetime('now')")
    .bind(employeeId, verificationCode)
    .first();

  if (!verification) {
    return jsonResponse(fail('INVALID_CODE', 'Invalid or expired verification code'), 400, allowedOrigin);
  }

  // Move to queue for approval
  await env.D1_BINDING
    .prepare("INSERT INTO queue (employeeId, password, salt, fullName, storeName, position, joinDate, phone, email, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)")
    .bind(
      verification.employeeId, verification.passwordHash, verification.passwordSalt,
      verification.fullName, verification.storeName, verification.position,
      verification.joinDate, verification.phone, verification.email, "Wait"
    )
    .run();

  // Clean up verification data
  await env.D1_BINDING.prepare("DELETE FROM email_verification WHERE employeeId = ?")
          .bind(employeeId).run();

  return jsonResponse(ok({
    message: "Email verification successful! Your registration request has been sent and is pending approval from store management."
  }), 200, allowedOrigin);
}

async function handleAuthMe(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const user = await env.D1_BINDING
      .prepare("SELECT employeeId, fullName, storeName, position, phone, email, joinDate FROM employees WHERE employeeId = ?")
      .bind(authResult.employeeId)
      .first();

    if (!user) {
      return jsonResponse(fail('USER_NOT_FOUND', 'User not found'), 404, allowedOrigin);
    }

    return jsonResponse(ok({
      employeeId: user.employeeId,
      fullName: user.fullName,
      storeName: user.storeName,
      position: user.position,
      phone: user.phone,
      email: user.email,
      joinDate: user.joinDate,
      status: 'active'
    }), 200, allowedOrigin);

  } catch (error) {
    console.error("Get user error:", error);
    return jsonResponse(fail('GET_USER_ERROR', 'Error retrieving user information', 500), 500, allowedOrigin);
  }
}

async function handleAuthLogout(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  try {
    // Extract token
    let token = null;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const url = new URL(request.url);
      token = url.searchParams.get("token");
    }

    if (token) {
      await env.D1_BINDING.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    }

    return jsonResponse(ok({ message: "Logged out successfully" }), 200, allowedOrigin);

  } catch (error) {
    console.error("Logout error:", error);
    return jsonResponse(fail('LOGOUT_ERROR', 'Logout system error', 500), 500, allowedOrigin);
  }
}

// ===== SIMPLIFIED ENDPOINTS =====
// For brevity, I'll include key endpoints with simplified implementations

async function handleGetStores(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  try {
    const stores = await env.D1_BINDING.prepare("SELECT storeId, storeName, region, address, latitude, longitude FROM stores").all();
    return jsonResponse(ok(stores.results || []), 200, allowedOrigin);
  } catch (error) {
    console.error("Get stores error:", error);
    return jsonResponse(fail('GET_STORES_ERROR', 'Error retrieving stores', 500), 500, allowedOrigin);
  }
}

async function handleGetUsers(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) return jsonResponse(authResult, authResult.status, allowedOrigin);

  try {
    const users = await env.D1_BINDING.prepare("SELECT employeeId, fullName, storeName, position, phone, email, joinDate FROM employees ORDER BY fullName").all();
    return jsonResponse(ok(users.results || []), 200, allowedOrigin);
  } catch (error) {
    console.error("Get users error:", error);
    return jsonResponse(fail('GET_USERS_ERROR', 'Error retrieving users', 500), 500, allowedOrigin);
  }
}

async function handleGetDashboardStats(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) return jsonResponse(authResult, authResult.status, allowedOrigin);

  try {
    const totalEmployees = await env.D1_BINDING.prepare("SELECT COUNT(*) as count FROM employees").first();
    const pendingRequests = await env.D1_BINDING.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").first();
    
    const stats = {
      totalEmployees: totalEmployees?.count || 0,
      todayShifts: 0,
      recentMessages: 0,
      pendingRequests: pendingRequests?.count || 0,
      currentDay: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date().getDay()]
    };

    return jsonResponse(ok(stats), 200, allowedOrigin);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return jsonResponse(ok({
      totalEmployees: 0, todayShifts: 0, recentMessages: 0, pendingRequests: 0, currentDay: 'T2'
    }), 200, allowedOrigin);
  }
}

async function handleHealth(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  return jsonResponse(ok({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  }), 200, allowedOrigin);
}

// ===== MAIN WORKER EXPORT =====
export default {
  async scheduled(event, env, ctx) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today.getDay() !== 1) {
        console.log(`Today is ${today.toLocaleDateString("en-US", { weekday: "long" })}. No action required.`);
        return;
      }
      console.log("Monday maintenance completed");
    } catch (error) {
      console.error("Error in scheduled worker:", error);
    }
  },

  async fetch(request, env) {
    try {
      // Handle CORS preflight requests
      if (request.method === "OPTIONS") {
        return handleOptionsRequest(env);
      }

      // Create router and define all routes
      const router = new Router();

      // ===== AUTH ROUTES =====
      router.post('/auth/login', handleAuthLogin);
      router.post('/auth/register', handleAuthRegister);
      router.post('/auth/register/verify', async (request, env) => {
        const body = await request.json();
        const allowedOrigin = handleCors(request, env);
        if (allowedOrigin instanceof Response) return allowedOrigin;
        return await handleVerifyEmail(body, env, allowedOrigin);
      });
      router.get('/auth/me', handleAuthMe);
      router.post('/auth/logout', handleAuthLogout);

      // ===== BASIC ROUTES =====
      router.get('/stores', handleGetStores);
      router.get('/users', handleGetUsers);
      router.get('/dashboard/stats', handleGetDashboardStats);
      router.get('/health', handleHealth);

      // Route the request
      return await router.route(request, env);

    } catch (error) {
      console.error("Worker error:", error);
      const allowedOrigin = handleCors(request, env);
      const origin = allowedOrigin instanceof Response ? '*' : allowedOrigin;
      return jsonResponse(fail('WORKER_ERROR', 'Internal server error', 500), 500, origin);
    }
  },
};