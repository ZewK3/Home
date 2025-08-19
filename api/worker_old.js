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
  const origin = request.headers.get('Origin');
  const allowedOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin) 
    ? (allowedOrigins.includes('*') ? '*' : origin) 
    : '*';
    
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    },
  });
}


// ===== SENDGRID EMAIL =====
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
// PBKDF2 password hashing for employees
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

  // Helper methods for different HTTP methods
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

    // Check for parameterized routes (basic implementation)
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
        // Parameter
        params[routePart.substring(1)] = pathPart;
      } else if (routePart !== pathPart) {
        // Literal doesn't match
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

  try {
    const body = await request.json();
    const { loginEmployeeId: employeeId, loginPassword: password } = body;
    
    if (!employeeId || !password) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing employee ID or password'), 400, allowedOrigin);
    }

    // Check if user is in the queue (pending approval)
    const queueUser = await env.D1_BINDING
      .prepare("SELECT * FROM queue WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (queueUser && queueUser.status === "Wait") {
      return jsonResponse(fail('PENDING_APPROVAL', 'Your account is pending approval from store management'), 403, allowedOrigin);
    }

    const user = await env.D1_BINDING
      .prepare("SELECT password, salt FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!user) {
      return jsonResponse(fail('USER_NOT_FOUND', 'Employee ID not found'), 404, allowedOrigin);
    }

    const storedHash = Uint8Array.from(user.password.split(",").map(Number));
    const storedSalt = Uint8Array.from(user.salt.split(",").map(Number));
    const isPasswordCorrect = await verifyPassword(storedHash, storedSalt, password);

    if (!isPasswordCorrect) {
      return jsonResponse(fail('INVALID_PASSWORD', 'Incorrect password'), 401, allowedOrigin);
    }

    // Create session
    const sessionData = await createSession(employeeId, env);
    return jsonResponse(ok(sessionData), 200, allowedOrigin);

  } catch (error) {
    console.error("Login error:", error);
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

    // Check for existing employee ID
    const existingUser = await env.D1_BINDING
      .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();
    if (existingUser) {
      return jsonResponse(fail('EMPLOYEE_ID_EXISTS', 'Employee ID already exists'), 409, allowedOrigin);
    }

    // Check for existing queue entry
    const existingQueue = await env.D1_BINDING
      .prepare("SELECT employeeId, status FROM queue WHERE employeeId = ?")
      .bind(employeeId)
      .first();
    if (existingQueue) {
      if (existingQueue.status === "Wait") {
        return jsonResponse(fail('PENDING_APPROVAL', 'Your account is already pending approval'), 403, allowedOrigin);
      }
      return jsonResponse(fail('EMPLOYEE_ID_EXISTS', 'Employee ID already exists'), 409, allowedOrigin);
    }

    // Check for duplicate phone and email
    if (phone) {
      const existingPhone = await env.D1_BINDING
        .prepare("SELECT employeeId FROM employees WHERE phone = ? UNION SELECT employeeId FROM queue WHERE phone = ?")
        .bind(phone, phone)
        .first();
      if (existingPhone) {
        return jsonResponse(fail('PHONE_EXISTS', 'Phone number already exists'), 409, allowedOrigin);
      }
    }

    if (email) {
      const existingEmail = await env.D1_BINDING
        .prepare("SELECT employeeId FROM employees WHERE email = ? UNION SELECT employeeId FROM queue WHERE email = ?")
        .bind(email, email)
        .first();
      if (existingEmail) {
        return jsonResponse(fail('EMAIL_EXISTS', 'Email already exists'), 409, allowedOrigin);
      }
    }

    // Send verification email and store data
    const sentVerificationCode = await sendVerificationEmail(email, employeeId, fullName, env);
    const { hash, salt } = await hashPasswordPBKDF2(password);
    
    // Clean up existing verification entries
    await env.D1_BINDING.prepare("DELETE FROM email_verification WHERE email = ? OR employeeId = ?")
            .bind(email, employeeId).run();
    
    // Store verification data
    await env.D1_BINDING
      .prepare(
        "INSERT INTO email_verification (employeeId, email, verificationCode, fullName, storeName, position, joinDate, phone, passwordHash, passwordSalt, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+15 minutes'))"
      )
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
    .prepare(
      "INSERT INTO queue (employeeId, password, salt, fullName, storeName, position, joinDate, phone, email, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)"
    )
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

// ===== STORES ENDPOINTS =====
async function handleGetStores(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q'); // search query
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 50;
    const offset = (page - 1) * pageSize;

    let query = "SELECT storeId, storeName, region, address, latitude, longitude FROM stores";
    let params = [];

    if (q) {
      query += " WHERE storeName LIKE ? OR region LIKE ? OR address LIKE ?";
      params = [`%${q}%`, `%${q}%`, `%${q}%`];
    }

    query += " ORDER BY storeName LIMIT ? OFFSET ?";
    params.push(pageSize, offset);

    const stores = await env.D1_BINDING.prepare(query).bind(...params).all();
    const storesList = stores.results || stores;
    
    if (!storesList || storesList.length === 0) {
      return jsonResponse(ok([]), 200, allowedOrigin);
    }
    
    return jsonResponse(ok(storesList), 200, allowedOrigin);
  } catch (error) {
    console.error("Get stores error:", error);
    return jsonResponse(fail('GET_STORES_ERROR', 'Error retrieving stores', 500), 500, allowedOrigin);
  }
}

// ===== USERS ENDPOINTS =====
async function handleGetUsers(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 50;
    const offset = (page - 1) * pageSize;

    let query = "SELECT employeeId, fullName, storeName, position, phone, email, joinDate FROM employees";
    let params = [];

    if (role) {
      query += " WHERE position = ?";
      params.push(role);
    }

    query += " ORDER BY fullName LIMIT ? OFFSET ?";
    params.push(pageSize, offset);

    const users = await env.D1_BINDING.prepare(query).bind(...params).all();
    const usersList = users.results || users;

    if (!usersList || usersList.length === 0) {
      return jsonResponse(ok([]), 200, allowedOrigin);
    }

    return jsonResponse(ok(usersList), 200, allowedOrigin);
  } catch (error) {
    console.error("Get users error:", error);
    return jsonResponse(fail('GET_USERS_ERROR', 'Error retrieving users', 500), 500, allowedOrigin);
  }
}

async function handleGetUserById(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const employeeId = request.params.employeeId;
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Employee ID is required'), 400, allowedOrigin);
    }

    const user = await env.D1_BINDING
      .prepare("SELECT employeeId, fullName, storeName, position, joinDate, phone, email FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!user) {
      return jsonResponse(fail('USER_NOT_FOUND', 'User not found'), 404, allowedOrigin);
    }

    return jsonResponse(ok(user), 200, allowedOrigin);
  } catch (error) {
    console.error("Get user by ID error:", error);
    return jsonResponse(fail('GET_USER_ERROR', 'Error retrieving user', 500), 500, allowedOrigin);
  }
}

async function handleUpdateUser(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const employeeId = request.params.employeeId;
    const body = await request.json();
    const { fullName, storeName, position, phone, email, joinDate, changes, reason } = body;
    
    if (!employeeId || !fullName || !storeName) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing required fields'), 400, allowedOrigin);
    }

    const updated = await env.D1_BINDING
      .prepare("UPDATE employees SET fullName = ?, storeName = ?, position = ?, phone = ?, email = ?, joinDate = ? WHERE employeeId = ?")
      .bind(fullName, storeName, position || "NV", phone || null, email || null, joinDate || null, employeeId)
      .run();

    if (updated.meta.changes === 0) {
      return jsonResponse(fail('UPDATE_FAILED', 'Update failed, employee ID not found'), 404, allowedOrigin);
    }

    // Log changes to history if provided
    if (changes && Array.isArray(changes)) {
      const actionByUser = await env.D1_BINDING
        .prepare("SELECT fullName FROM employees WHERE employeeId = ?")
        .bind(authResult.employeeId)
        .first();
      
      const timestamp = new Date().toISOString();
      
      for (const change of changes) {
        let actionType = 'user_data_change';
        if (change.field === 'position') {
          actionType = 'permission_change';
        }
        
        await env.D1_BINDING
          .prepare("INSERT INTO history_logs (action_type, target_employee_id, action_by_employee_id, action_by_name, old_value, new_value, field_name, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(actionType, employeeId, authResult.employeeId, actionByUser?.fullName || 'System', 
                change.oldValue, change.newValue, change.field, reason, timestamp)
          .run();
      }
    }

    return jsonResponse(ok({ 
      message: "User updated successfully",
      changes: changes?.length || 0 
    }), 200, allowedOrigin);
    
  } catch (error) {
    console.error('Update user error:', error);
    return jsonResponse(fail('UPDATE_USER_ERROR', 'Error updating user', 500), 500, allowedOrigin);
  }
}

async function handleUpdateUserPermissions(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const employeeId = request.params.employeeId;
    const body = await request.json();
    const { permissions } = body;
    
    if (!employeeId || !permissions) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing employee ID or permissions'), 400, allowedOrigin);
    }

    // Check if employee exists
    const employee = await env.D1_BINDING
      .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!employee) {
      return jsonResponse(fail('USER_NOT_FOUND', 'Employee not found'), 404, allowedOrigin);
    }

    // Delete old permissions
    await env.D1_BINDING
      .prepare("DELETE FROM permissions WHERE employeeId = ?")
      .bind(employeeId)
      .run();

    // Add new permissions
    const now = new Date().toISOString();
    for (const [permission, granted] of Object.entries(permissions)) {
      if (granted) {
        await env.D1_BINDING
          .prepare("INSERT INTO permissions (employeeId, permission, granted, createdAt) VALUES (?, ?, ?, ?)")
          .bind(employeeId, permission, granted, now)
          .run();
      }
    }

    return jsonResponse(ok({ message: "Permissions updated successfully" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Update permissions error:", error);
    return jsonResponse(fail('UPDATE_PERMISSIONS_ERROR', 'Error updating permissions', 500), 500, allowedOrigin);
  }
}

async function handleGetUserHistory(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const employeeId = request.params.employeeId;
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Employee ID is required'), 400, allowedOrigin);
    }

    const history = await env.D1_BINDING
      .prepare("SELECT * FROM history_logs WHERE target_employee_id = ? ORDER BY created_at DESC LIMIT 50")
      .bind(employeeId)
      .all();

    const historyList = history.results || history;
    return jsonResponse(ok(historyList), 200, allowedOrigin);
    
  } catch (error) {
    console.error('Get user history error:', error);
    return jsonResponse(fail('GET_HISTORY_ERROR', 'Error retrieving user history', 500), 500, allowedOrigin);
  }
}

// ===== REGISTRATIONS ENDPOINTS =====
async function handleGetPendingRegistrations(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    // Get current user's position and store
    const currentUser = await env.D1_BINDING
      .prepare("SELECT position, storeName FROM employees WHERE employeeId = ?")
      .bind(authResult.employeeId)
      .first();

    if (!currentUser) {
      return jsonResponse(fail('USER_NOT_FOUND', 'User not found'), 404, allowedOrigin);
    }

    let query = "SELECT * FROM queue WHERE status = 'Wait'";
    let params = [];

    // Apply filtering based on position
    if (currentUser.position === 'AD') {
      // Admin can see all pending registrations
    } else if (currentUser.position === 'AM') {
      // Area Manager - filter by region
      const userStore = await env.D1_BINDING
        .prepare("SELECT region FROM stores WHERE storeName = ?")
        .bind(currentUser.storeName)
        .first();
      
      if (userStore) {
        const regionStores = await env.D1_BINDING
          .prepare("SELECT storeName FROM stores WHERE region = ?")
          .bind(userStore.region)
          .all();
        
        if (regionStores.results && regionStores.results.length > 0) {
          const storeNames = regionStores.results.map(s => s.storeName);
          query += ` AND storeName IN (${storeNames.map(() => '?').join(',')})`;
          params.push(...storeNames);
        }
      }
    } else if (currentUser.position === 'QL') {
      // Store Manager - filter by store
      query += " AND storeName = ?";
      params.push(currentUser.storeName);
    } else {
      // Other positions cannot see registrations
      return jsonResponse(ok([]), 200, allowedOrigin);
    }

    query += " ORDER BY createdAt DESC";

    const registrations = await env.D1_BINDING.prepare(query).bind(...params).all();
    const registrationsList = registrations.results || [];

    // Format response without sensitive data
    const pendingRequests = registrationsList.map(reg => ({
      employeeId: reg.employeeId,
      fullName: reg.fullName,
      storeName: reg.storeName,
      position: reg.position,
      phone: reg.phone,
      email: reg.email,
      joinDate: reg.joinDate,
      createdAt: reg.createdAt,
      status: reg.status
    }));

    return jsonResponse(ok(pendingRequests), 200, allowedOrigin);
  } catch (error) {
    console.error("Get pending registrations error:", error);
    return jsonResponse(fail('GET_REGISTRATIONS_ERROR', 'Error retrieving pending registrations', 500), 500, allowedOrigin);
  }
}

async function handleApproveRegistration(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { employeeId } = body;
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Employee ID is required'), 400, allowedOrigin);
    }

    // Get registration data from queue
    const registration = await env.D1_BINDING
      .prepare("SELECT * FROM queue WHERE employeeId = ? AND status = 'Wait'")
      .bind(employeeId)
      .first();

    if (!registration) {
      return jsonResponse(fail('REGISTRATION_NOT_FOUND', 'Registration request not found'), 404, allowedOrigin);
    }

    // Move from queue to employees table
    await env.D1_BINDING
      .prepare("INSERT INTO employees (employeeId, password, salt, fullName, storeName, position, joinDate, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(
        registration.employeeId, registration.password, registration.salt,
        registration.fullName, registration.storeName, registration.position || "NV",
        registration.joinDate, registration.phone, registration.email
      )
      .run();

    // Remove from queue
    await env.D1_BINDING.prepare("DELETE FROM queue WHERE employeeId = ?").bind(employeeId).run();

    return jsonResponse(ok({ 
      message: `Registration approved for employee ${registration.fullName} (${employeeId})` 
    }), 200, allowedOrigin);

  } catch (error) {
    console.error("Approve registration error:", error);
    return jsonResponse(fail('APPROVE_REGISTRATION_ERROR', 'Error approving registration', 500), 500, allowedOrigin);
  }
}

async function handleRejectRegistration(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { employeeId } = body;
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Employee ID is required'), 400, allowedOrigin);
    }

    // Get registration data for response
    const registration = await env.D1_BINDING
      .prepare("SELECT fullName FROM queue WHERE employeeId = ? AND status = 'Wait'")
      .bind(employeeId)
      .first();

    if (!registration) {
      return jsonResponse(fail('REGISTRATION_NOT_FOUND', 'Registration request not found'), 404, allowedOrigin);
    }

    // Remove from queue (reject)
    await env.D1_BINDING.prepare("DELETE FROM queue WHERE employeeId = ?").bind(employeeId).run();
    
    return jsonResponse(ok({ 
      message: `Registration rejected for ${registration.fullName} (${employeeId})` 
    }), 200, allowedOrigin);

  } catch (error) {
    console.error("Reject registration error:", error);
    return jsonResponse(fail('REJECT_REGISTRATION_ERROR', 'Error rejecting registration', 500), 500, allowedOrigin);
  }
}

// ===== TASKS ENDPOINTS =====
async function handleGetTasks(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    // Get current user's position and store
    const currentUser = await env.D1_BINDING
      .prepare("SELECT position, storeName FROM employees WHERE employeeId = ?")
      .bind(authResult.employeeId)
      .first();

    if (!currentUser) {
      return jsonResponse(fail('USER_NOT_FOUND', 'User not found'), 404, allowedOrigin);
    }

    let query = `
      SELECT t.*, e.storeName 
      FROM tasks t 
      JOIN employees e ON t.employeeId = e.employeeId 
      WHERE 1=1
    `;
    let params = [];

    // Filter by store if user is not Admin
    if (currentUser.position !== 'AD') {
      query += " AND e.storeName = ?";
      params.push(currentUser.storeName);
    }

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    if (type) {
      query += " AND t.type = ?";
      params.push(type);
    }

    query += " ORDER BY t.createdAt DESC LIMIT ?";
    params.push(limit);

    const tasks = await env.D1_BINDING.prepare(query).bind(...params).all();
    const tasksList = tasks.results || [];

    return jsonResponse(ok(tasksList), 200, allowedOrigin);
  } catch (error) {
    console.error("Get tasks error:", error);
    return jsonResponse(fail('GET_TASKS_ERROR', 'Error retrieving tasks', 500), 500, allowedOrigin);
  }
}

async function handleCreateTask(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { employeeId, fullName, position, taskType, content } = body;
    
    if (!employeeId || !taskType || !content) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing required fields'), 400, allowedOrigin);
    }

    const taskId = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.D1_BINDING
      .prepare("INSERT INTO tasks (id, employeeId, employeeName, position, type, content, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(taskId, employeeId, fullName || 'Employee', position || 'NV', taskType, content, 'pending', now)
      .run();

    return jsonResponse(ok({ message: "Task created successfully", taskId }), 200, allowedOrigin);
  } catch (error) {
    console.error("Create task error:", error);
    return jsonResponse(fail('CREATE_TASK_ERROR', 'Error creating task', 500), 500, allowedOrigin);
  }
}

async function handleApproveTask(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const taskId = request.params.taskId;
    const body = await request.json();
    const { note } = body;
    
    if (!taskId) {
      return jsonResponse(fail('MISSING_TASK_ID', 'Task ID is required'), 400, allowedOrigin);
    }

    const taskExists = await env.D1_BINDING
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .bind(taskId)
      .first();

    if (!taskExists) {
      return jsonResponse(fail('TASK_NOT_FOUND', 'Task not found'), 404, allowedOrigin);
    }

    await env.D1_BINDING
      .prepare("UPDATE tasks SET status = 'approved', note = ?, updatedAt = ? WHERE id = ?")
      .bind(note || '', new Date().toISOString(), taskId)
      .run();

    return jsonResponse(ok({ message: "Task approved successfully" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Approve task error:", error);
    return jsonResponse(fail('APPROVE_TASK_ERROR', 'Error approving task', 500), 500, allowedOrigin);
  }
}

async function handleRejectTask(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const taskId = request.params.taskId;
    const body = await request.json();
    const { note } = body;
    
    if (!taskId) {
      return jsonResponse(fail('MISSING_TASK_ID', 'Task ID is required'), 400, allowedOrigin);
    }

    const taskExists = await env.D1_BINDING
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .bind(taskId)
      .first();

    if (!taskExists) {
      return jsonResponse(fail('TASK_NOT_FOUND', 'Task not found'), 404, allowedOrigin);
    }

    await env.D1_BINDING
      .prepare("UPDATE tasks SET status = 'rejected', note = ?, updatedAt = ? WHERE id = ?")
      .bind(note || '', new Date().toISOString(), taskId)
      .run();

    return jsonResponse(ok({ message: "Task rejected successfully" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Reject task error:", error);
    return jsonResponse(fail('REJECT_TASK_ERROR', 'Error rejecting task', 500), 500, allowedOrigin);
  }
}
// ===== SHIFTS & ATTENDANCE ENDPOINTS =====
async function handleGetShiftAssignments(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const store = url.searchParams.get('store');
    const week = url.searchParams.get('week');
    
    if (!store || !week) {
      return jsonResponse(fail('MISSING_PARAMS', 'Missing store or week parameter'), 400, allowedOrigin);
    }

    // For now, return sample data since table structure may not be complete
    const assignments = {
      store: store,
      week: week,
      employees: [
        { employeeId: 'EMP001', fullName: 'Nguyễn Văn A', shifts: [] },
        { employeeId: 'EMP002', fullName: 'Trần Thị B', shifts: [] }
      ]
    };

    return jsonResponse(ok(assignments), 200, allowedOrigin);
  } catch (error) {
    console.error("Get shift assignments error:", error);
    return jsonResponse(fail('GET_SHIFTS_ERROR', 'Error retrieving shift assignments', 500), 500, allowedOrigin);
  }
}

async function handleAssignShift(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { employeeId, storeId, date, shiftType, startTime, endTime } = body;
    
    if (!employeeId || !storeId || !date || !shiftType) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing required parameters'), 400, allowedOrigin);
    }

    // Implementation would depend on your shift_assignments table structure
    return jsonResponse(ok({ message: "Shift assigned successfully" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Assign shift error:", error);
    return jsonResponse(fail('ASSIGN_SHIFT_ERROR', 'Error assigning shift', 500), 500, allowedOrigin);
  }
}

async function handleGetCurrentShift(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Missing employeeId parameter'), 400, allowedOrigin);
    }

    // Return sample current shift data
    const currentShift = {
      startTime: "08:00",
      endTime: "17:00",
      storeName: "Cửa hàng A",
      checkedIn: false,
      checkedOut: false
    };

    return jsonResponse(ok({ currentShift }), 200, allowedOrigin);
  } catch (error) {
    console.error("Get current shift error:", error);
    return jsonResponse(fail('GET_CURRENT_SHIFT_ERROR', 'Error retrieving current shift', 500), 500, allowedOrigin);
  }
}

async function handleGetWeeklyShifts(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Missing employeeId parameter'), 400, allowedOrigin);
    }

    // Return sample weekly shifts data
    const shifts = [
      { date: '2024-01-15', shiftName: 'Ca sáng', startTime: '08:00', endTime: '17:00', storeName: 'Cửa hàng A', status: 'assigned' },
      { date: '2024-01-16', shiftName: 'Ca chiều', startTime: '13:00', endTime: '22:00', storeName: 'Cửa hàng A', status: 'confirmed' }
    ];

    return jsonResponse(ok({ shifts }), 200, allowedOrigin);
  } catch (error) {
    console.error("Get weekly shifts error:", error);
    return jsonResponse(fail('GET_WEEKLY_SHIFTS_ERROR', 'Error retrieving weekly shifts', 500), 500, allowedOrigin);
  }
}

async function handleGetAttendanceTimesheet(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const employeeId = url.searchParams.get('employeeId');
    
    if (!month) {
      return jsonResponse(fail('MISSING_MONTH', 'Missing month parameter'), 400, allowedOrigin);
    }

    // Return sample attendance data
    const summary = {
      totalHours: 160,
      workDays: 20,
      lateCount: 2,
      absentCount: 1
    };

    const records = [
      { date: '2024-01-15', employeeName: 'Nguyễn Văn A', shiftName: 'Ca sáng', checkIn: '08:00', checkOut: '17:00', totalHours: '8', status: 'present' },
      { date: '2024-01-16', employeeName: 'Nguyễn Văn A', shiftName: 'Ca chiều', checkIn: '13:05', checkOut: '22:00', totalHours: '8', status: 'late' }
    ];

    return jsonResponse(ok({ summary, records }), 200, allowedOrigin);
  } catch (error) {
    console.error("Get attendance timesheet error:", error);
    return jsonResponse(fail('GET_TIMESHEET_ERROR', 'Error retrieving attendance timesheet', 500), 500, allowedOrigin);
  }
}

async function handleGetAttendanceHistory(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    
    // Implementation would query actual attendance table
    // For now return empty array
    return jsonResponse(ok([]), 200, allowedOrigin);
  } catch (error) {
    console.error("Get attendance history error:", error);
    return jsonResponse(fail('GET_ATTENDANCE_HISTORY_ERROR', 'Error retrieving attendance history', 500), 500, allowedOrigin);
  }
}

async function handleCheckIn(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { employeeId, location } = body;
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Missing employeeId'), 400, allowedOrigin);
    }

    // Implementation would process GPS and create attendance record
    return jsonResponse(ok({ message: "Check in successful" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Check in error:", error);
    return jsonResponse(fail('CHECK_IN_ERROR', 'Error during check in', 500), 500, allowedOrigin);
  }
}

async function handleCheckOut(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { employeeId, location } = body;
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Missing employeeId'), 400, allowedOrigin);
    }

    // Implementation would process GPS and update attendance record
    return jsonResponse(ok({ message: "Check out successful" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Check out error:", error);
    return jsonResponse(fail('CHECK_OUT_ERROR', 'Error during check out', 500), 500, allowedOrigin);
  }
}

async function handleCreateAttendanceRequest(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { type, employeeId, reason } = body;
    
    if (!type || !employeeId || !reason) {
      return jsonResponse(fail('MISSING_FIELDS', 'Missing required fields'), 400, allowedOrigin);
    }

    // Implementation would create attendance request
    return jsonResponse(ok({ message: "Attendance request created successfully" }), 200, allowedOrigin);
  } catch (error) {
    console.error("Create attendance request error:", error);
    return jsonResponse(fail('CREATE_ATTENDANCE_REQUEST_ERROR', 'Error creating attendance request', 500), 500, allowedOrigin);
  }
}

// ===== DASHBOARD ENDPOINTS =====
async function handleGetDashboardStats(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    // Count total employees
    const totalEmployees = await env.D1_BINDING.prepare("SELECT COUNT(*) as count FROM employees").first();
    
    // Count active shifts today
    const today = new Date();
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][today.getDay()];
    const todayShifts = { count: 0 }; // Placeholder

    // Count pending tasks
    const pendingRequests = await env.D1_BINDING
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'")
      .first();

    // Count recent history logs (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentActivities = await env.D1_BINDING
      .prepare("SELECT COUNT(*) as count FROM history_logs WHERE created_at >= ?")
      .bind(twentyFourHoursAgo)
      .first();

    const stats = {
      totalEmployees: totalEmployees?.count || 0,
      todayShifts: todayShifts?.count || 0,
      recentMessages: recentActivities?.count || 0,
      pendingRequests: pendingRequests?.count || 0,
      currentDay: dayName
    };

    return jsonResponse(ok(stats), 200, allowedOrigin);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return jsonResponse(ok({
      totalEmployees: 0,
      todayShifts: 0,
      recentMessages: 0,
      pendingRequests: 0,
      currentDay: 'T2'
    }), 200, allowedOrigin);
  }
}

async function handleGetPersonalStats(request, env) {
  const allowedOrigin = handleCors(request, env);
  if (allowedOrigin instanceof Response) return allowedOrigin;

  const authResult = await requireAuth(request, env);
  if (authResult.error) {
    return jsonResponse(authResult, authResult.status, allowedOrigin);
  }

  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    if (!employeeId) {
      return jsonResponse(fail('MISSING_EMPLOYEE_ID', 'Employee ID is required'), 400, allowedOrigin);
    }

    // Generate basic personal stats
    const stats = {
      workDaysThisMonth: Math.floor(Math.random() * 22) + 8, // 8-30 days
      totalHoursThisMonth: Math.floor(Math.random() * 160) + 40, // 40-200 hours
      attendanceRate: Math.floor(Math.random() * 20) + 80 // 80-100%
    };

    return jsonResponse(ok({ stats }), 200, allowedOrigin);
  } catch (error) {
    console.error("Get personal stats error:", error);
    return jsonResponse(fail('GET_PERSONAL_STATS_ERROR', 'Error retrieving personal stats', 500), 500, allowedOrigin);
  }
}

// ===== HEALTH ENDPOINT =====
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

      // Weekly maintenance tasks can be added here
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

      // ===== USERS & EMPLOYEES ROUTES =====
      router.get('/users', handleGetUsers);
      router.get('/users/:employeeId', handleGetUserById);
      router.put('/users/:employeeId', handleUpdateUser);
      router.put('/users/:employeeId/permissions', handleUpdateUserPermissions);
      router.get('/users/:employeeId/history', handleGetUserHistory);

      // ===== STORES ROUTES =====
      router.get('/stores', handleGetStores);

      // ===== REGISTRATIONS ROUTES =====
      router.get('/registrations/pending', handleGetPendingRegistrations);
      router.post('/registrations/approve', handleApproveRegistration);
      router.post('/registrations/reject', handleRejectRegistration);

      // ===== TASKS ROUTES =====
      router.get('/tasks', handleGetTasks);
      router.post('/tasks', handleCreateTask);
      router.post('/tasks/:taskId/approve', handleApproveTask);
      router.post('/tasks/:taskId/reject', handleRejectTask);

      // ===== SHIFTS & ATTENDANCE ROUTES =====
      router.get('/shifts/assignments', handleGetShiftAssignments);
      router.post('/shifts/assignments', handleAssignShift);
      router.get('/shifts/current', handleGetCurrentShift);
      router.get('/shifts/weekly', handleGetWeeklyShifts);
      router.get('/attendance/timesheet', handleGetAttendanceTimesheet);
      router.get('/attendance/history', handleGetAttendanceHistory);
      router.post('/attendance/check-in', handleCheckIn);
      router.post('/attendance/check-out', handleCheckOut);
      router.post('/attendance/requests', handleCreateAttendanceRequest);

      // ===== DASHBOARD ROUTES =====
      router.get('/dashboard/stats', handleGetDashboardStats);
      router.get('/dashboard/personal-stats', handleGetPersonalStats);

      // ===== HEALTH ROUTE =====
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



// Hàm cập nhật thông tin nhân viên
// Enhanced user update with history tracking
async function handleUpdateUserWithHistory(body, db, origin) {
  const { employeeId, fullName, storeName, position, phone, email, joinDate, changes, reason, actionBy } = body;
  
  if (!employeeId || !fullName || !storeName || !actionBy) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  try {
    // Get action by user info
    const actionByUser = await db
      .prepare("SELECT fullName FROM employees WHERE employeeId = ?")
      .bind(actionBy)
      .first();
    
    if (!actionByUser) {
      return jsonResponse({ message: "Người thực hiện không hợp lệ!" }, 400, origin);
    }

    // Update user data
    const updated = await db
      .prepare(
        "UPDATE employees SET fullName = ?, storeName = ?, position = ?, phone = ?, email = ?, joinDate = ? WHERE employeeId = ?"
      )
      .bind(fullName, storeName, position || "NV", phone || null, email || null, joinDate || null, employeeId)
      .run();

    if (updated.meta.changes === 0) {
      return jsonResponse({ message: "Cập nhật thất bại, mã nhân viên không tồn tại!" }, 404, origin);
    }

    // Log changes to history
    const timestamp = new Date().toISOString();
    
    if (changes && Array.isArray(changes)) {
      for (const change of changes) {
        let actionType = 'user_data_change';
        if (change.field === 'position') {
          actionType = 'permission_change';
        }
        
        await db
          .prepare(
            "INSERT INTO history_logs (action_type, target_employee_id, action_by_employee_id, action_by_name, old_value, new_value, field_name, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(
            actionType,
            employeeId,
            actionBy,
            actionByUser.fullName,
            change.oldValue,
            change.newValue,
            change.field,
            reason,
            timestamp
          )
          .run();
      }
    }

    return jsonResponse({ 
      message: "Cập nhật thành công!",
      changes: changes?.length || 0 
    }, 200, origin);
    
  } catch (error) {
    console.error('Error updating user with history:', error);
    return jsonResponse({ message: "Lỗi hệ thống khi cập nhật!" }, 500, origin);
  }
}

// Get user history
async function handleGetUserHistory(url, db, origin) {
  const employeeId = url.searchParams.get("employeeId");
  
  if (!employeeId) {
    return jsonResponse({ message: "Thiếu mã nhân viên!" }, 400, origin);
  }

  try {
    const history = await db
      .prepare(
        "SELECT * FROM history_logs WHERE target_employee_id = ? ORDER BY created_at DESC LIMIT 50"
      )
      .bind(employeeId)
      .all();

    // D1 database returns {results: [...], success: true}
    const historyList = history.results || history;
    
    return jsonResponse(historyList, 200, origin);
    
  } catch (error) {
    console.error('Error getting user history:', error);
    return jsonResponse({ message: "Lỗi tải lịch sử!" }, 500, origin);
  }
}

// Enhanced approval with history tracking
async function handleApproveRegistrationWithHistory(body, db, origin) {
  const { employeeId, approved, reason, actionBy } = body;
  
  if (!employeeId || approved === undefined || !actionBy) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  try {
    // Get action by user info
    const actionByUser = await db
      .prepare("SELECT fullName FROM employees WHERE employeeId = ?")
      .bind(actionBy)
      .first();
    
    if (!actionByUser) {
      return jsonResponse({ message: "Người thực hiện không hợp lệ!" }, 400, origin);
    }

    // Update approval status (this would depend on your existing approval logic)
    // Add your approval logic here...

    // Log approval action to history
    const timestamp = new Date().toISOString();
    
    await db
      .prepare(
        "INSERT INTO history_logs (action_type, target_employee_id, action_by_employee_id, action_by_name, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        'approval_action',
        employeeId,
        actionBy,
        actionByUser.fullName,
        approved ? 'Phê duyệt' : 'Từ chối',
        'đăng ký',
        reason || '',
        timestamp
      )
      .run();

    return jsonResponse({ 
      message: approved ? "Đã phê duyệt đăng ký!" : "Đã từ chối đăng ký!" 
    }, 200, origin);
    
  } catch (error) {
    console.error('Error processing approval with history:', error);
    return jsonResponse({ message: "Lỗi hệ thống khi xử lý!" }, 500, origin);
  }
}

async function handleUpdate(body, db, origin) {
  const { employeeId, fullName, storeName, position, phone, email, joinDate } = body;
  if (!employeeId || !fullName || !storeName) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  const updated = await db
    .prepare(
      "UPDATE employees SET fullName = ?, storeName = ?, position = ?, phone = ?, email = ?, joinDate = ? WHERE employeeId = ?"
    )
    .bind(fullName, storeName, position || "NV", phone || null, email || null, joinDate || null, employeeId)
    .run();

  if (updated.meta.changes === 0) {
    return jsonResponse({ message: "Cập nhật thất bại, mã nhân viên không tồn tại!" }, 404, origin);
  }
  return jsonResponse({ message: "Cập nhật thành công!" }, 200, origin);
}

// Handle personal information update with password verification
async function handleUpdatePersonalInfo(body, db, origin) {
  const { employeeId, email, phone, password } = body;
  
  if (!employeeId || !password) {
    return jsonResponse({ message: "Thiếu thông tin cần thiết!" }, 400, origin);
  }

  // Verify current password first
  const user = await db
    .prepare("SELECT password, salt FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  if (!user) {
    return jsonResponse({ message: "Mã nhân viên không tồn tại!" }, 404, origin);
  }

  const storedHash = Uint8Array.from(user.password.split(",").map(Number));
  const storedSalt = Uint8Array.from(user.salt.split(",").map(Number));
  const isPasswordCorrect = await verifyPassword(storedHash, storedSalt, password);

  if (!isPasswordCorrect) {
    return jsonResponse({ message: "Mật khẩu không chính xác!" }, 401, origin);
  }

  // Check for duplicate email and phone
  if (email) {
    const existingEmail = await db
      .prepare("SELECT employeeId FROM employees WHERE email = ? AND employeeId != ?")
      .bind(email, employeeId)
      .first();
    if (existingEmail) {
      return jsonResponse({ message: "Email đã được sử dụng bởi nhân viên khác!" }, 409, origin);
    }
  }

  if (phone) {
    const existingPhone = await db
      .prepare("SELECT employeeId FROM employees WHERE phone = ? AND employeeId != ?")
      .bind(phone, employeeId)
      .first();
    if (existingPhone) {
      return jsonResponse({ message: "Số điện thoại đã được sử dụng bởi nhân viên khác!" }, 409, origin);
    }
  }

  // Update only email and phone
  const updated = await db
    .prepare("UPDATE employees SET email = ?, phone = ? WHERE employeeId = ?")
    .bind(email || null, phone || null, employeeId)
    .run();

  if (updated.meta.changes === 0) {
    return jsonResponse({ message: "Cập nhật thất bại!" }, 400, origin);
  }

  return jsonResponse({ message: "Đã cập nhật thông tin cá nhân thành công!" }, 200, origin);
}

// Hàm mã hóa mật khẩu (dành cho nhân viên) sử dụng PBKDF2
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

// Hàm xác minh mật khẩu (dành cho nhân viên)
async function verifyPassword(storedHash, storedSalt, password) {
  const { hash } = await hashPasswordPBKDF2(password, storedSalt);
  return storedHash.length === hash.length && storedHash.every((byte, index) => byte === hash[index]);
}

// Hàm lấy yêu cầu đang chờ xử lý
async function handleGetPendingRequests(db, origin) {
  try {
    // Use tasks table instead of messages for pending requests
    const pendingTasks = await db
      .prepare("SELECT * FROM tasks WHERE status = 'pending' ORDER BY createdAt DESC LIMIT 10")
      .all();

    if (!pendingTasks.results) {
      return jsonResponse([], 200, origin);
    }

    const pendingRequests = pendingTasks.results.map(task => ({
      id: task.id,
      employeeId: task.employeeId,
      employeeName: task.fullName,
      message: `${task.taskType}: ${task.content}`,
      time: task.createdAt,
      status: 'pending'
    }));

    return jsonResponse(pendingRequests, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy yêu cầu đang chờ:", error);
    return jsonResponse([], 200, origin);
  }
}

// Hàm lấy thống kê tổng quan dashboard
async function handleGetDashboardStats(db, origin) {
  try {
    // Đếm tổng số nhân viên
    const totalEmployees = await db.prepare("SELECT COUNT(*) as count FROM employees").first();
    
    // Count active shifts today (replacing old schedule system)
    const today = new Date();
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][today.getDay()];
    // TODO: Replace with actual shift assignments table when created
    const todayShifts = { count: 0 }; // Placeholder for now

    // Đếm tasks đang chờ xử lý thay vì tin nhắn
    const pendingRequests = await db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'")
      .first();

    // Đếm history logs trong 24h qua thay vì tin nhắn
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentActivities = await db
      .prepare("SELECT COUNT(*) as count FROM history_logs WHERE created_at >= ?")
      .bind(twentyFourHoursAgo)
      .first();

    const stats = {
      totalEmployees: totalEmployees?.count || 0,
      todayShifts: todayShifts?.count || 0,
      recentMessages: recentActivities?.count || 0,
      pendingRequests: pendingRequests?.count || 0,
      currentDay: dayName
    };

    return jsonResponse(stats, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy thống kê dashboard:", error);
    return jsonResponse({
      totalEmployees: 0,
      todayShifts: 0,
      recentMessages: 0,
      pendingRequests: 0,
      currentDay: 'T2'
    }, 200, origin);
  }
}







// Hàm xử lý yêu cầu - duyệt
async function handleApproveTask(body, db, origin) {
  const { taskId, note } = body;
  
  if (!taskId) {
    return jsonResponse({ message: "Thiếu taskId!" }, 400, origin);
  }

  try {
    // Cập nhật trạng thái yêu cầu (sử dụng bảng tasks nếu có, hoặc tạo mới)
    const taskExists = await db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .bind(taskId)
      .first();

    if (taskExists) {
      await db
        .prepare("UPDATE tasks SET status = 'approved', note = ?, updatedAt = ? WHERE id = ?")
        .bind(note || '', new Date().toISOString(), taskId)
        .run();
    } else {
      // Task không tồn tại trong bảng tasks
      return jsonResponse({ message: "Yêu cầu không tồn tại!" }, 404, origin);
    }

    return jsonResponse({ message: "Đã duyệt yêu cầu!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi duyệt yêu cầu:", error);
    return jsonResponse({ message: "Lỗi duyệt yêu cầu!", error: error.message }, 500, origin);
  }
}

// Hàm xử lý yêu cầu - từ chối  
async function handleRejectTask(body, db, origin) {
  const { taskId, note } = body;
  
  if (!taskId) {
    return jsonResponse({ message: "Thiếu taskId!" }, 400, origin);
  }

  try {
    const taskExists = await db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .bind(taskId)
      .first();

    if (taskExists) {
      await db
        .prepare("UPDATE tasks SET status = 'rejected', note = ?, updatedAt = ? WHERE id = ?")
        .bind(note || '', new Date().toISOString(), taskId)
        .run();
    } else {
      return jsonResponse({ message: "Yêu cầu không tồn tại!" }, 404, origin);
    }

    return jsonResponse({ message: "Đã từ chối yêu cầu!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi từ chối yêu cầu:", error);
    return jsonResponse({ message: "Lỗi từ chối yêu cầu!", error: error.message }, 500, origin);
  }
}

// Hàm tạo yêu cầu từ tin nhắn
async function handleCreateTaskFromMessage(body, db, origin) {
  const { employeeId, fullName, position, taskType, content } = body;
  
  if (!employeeId || !taskType || !content) {
    return jsonResponse({ message: "Thiếu thông tin cần thiết!" }, 400, origin);
  }

  try {
    const taskId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Tạo task mới
    await db
      .prepare("INSERT INTO tasks (id, employeeId, employeeName, position, type, content, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(taskId, employeeId, fullName || 'Nhân viên', position || 'NV', taskType, content, 'pending', now)
      .run();

    return jsonResponse({ message: "Đã tạo yêu cầu!", taskId }, 200, origin);
  } catch (error) {
    console.error("Lỗi tạo yêu cầu:", error);
    return jsonResponse({ message: "Lỗi tạo yêu cầu!", error: error.message }, 500, origin);
  }
}

// Hàm lấy danh sách yêu cầu
async function handleGetTasks(url, db, origin) {
  try {
    // Check user session and get their role
    const token = url.searchParams.get("token");
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    // Get current user's position/role and store
    const currentUser = await db
      .prepare("SELECT position, storeName FROM employees WHERE employeeId = ?")
      .bind(session.employeeId)
      .first();

    if (!currentUser) {
      return jsonResponse({ message: "Không tìm thấy thông tin người dùng!" }, 404, origin);
    }

    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    // Build query with JOIN to get store information
    let query = `
      SELECT t.*, e.storeName 
      FROM tasks t 
      JOIN employees e ON t.employeeId = e.employeeId 
      WHERE 1=1
    `;
    let params = [];

    // Only filter by store if user is NOT Admin (AD)
    if (currentUser.position !== 'AD') {
      query += " AND e.storeName = ?";
      params.push(currentUser.storeName);
    }

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    if (type) {
      query += " AND t.type = ?";
      params.push(type);
    }

    query += " ORDER BY t.createdAt DESC LIMIT ?";
    params.push(limit);

    const tasks = await db.prepare(query).bind(...params).all();

    if (!tasks.results) {
      return jsonResponse([], 200, origin);
    }

    return jsonResponse(tasks.results, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy danh sách yêu cầu:", error);
    return jsonResponse([], 200, origin);
  }
}

// Hàm cập nhật quyền hạn
async function handleUpdatePermissions(body, db, origin) {
  const { employeeId, permissions } = body;
  
  if (!employeeId || !permissions) {
    return jsonResponse({ message: "Thiếu thông tin cần thiết!" }, 400, origin);
  }

  try {
    // Kiểm tra nhân viên tồn tại
    const employee = await db
      .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!employee) {
      return jsonResponse({ message: "Nhân viên không tồn tại!" }, 404, origin);
    }

    // Xóa quyền cũ
    await db
      .prepare("DELETE FROM permissions WHERE employeeId = ?")
      .bind(employeeId)
      .run();

    // Thêm quyền mới
    const now = new Date().toISOString();
    for (const [permission, granted] of Object.entries(permissions)) {
      if (granted) {
        await db
          .prepare("INSERT INTO permissions (employeeId, permission, granted, createdAt) VALUES (?, ?, ?, ?)")
          .bind(employeeId, permission, granted, now)
          .run();
      }
    }

    return jsonResponse({ message: "Đã cập nhật quyền hạn!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi cập nhật quyền hạn:", error);
    return jsonResponse({ message: "Lỗi cập nhật quyền hạn!", error: error.message }, 500, origin);
  }
}

// Hàm lấy danh sách yêu cầu đăng ký đang chờ duyệt
async function handleGetPendingRegistrations(url, db, origin) {
  try {
    // Check user session and get their role
    const token = url.searchParams.get("token");
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    // Get current user's position/role and storeName
    const currentUser = await db
      .prepare("SELECT position, storeName FROM employees WHERE employeeId = ?")
      .bind(session.employeeId)
      .first();

    if (!currentUser) {
      return jsonResponse({ message: "Không tìm thấy thông tin người dùng!" }, 404, origin);
    }

    const store = url.searchParams.get("store");
    let query = "SELECT * FROM queue WHERE status = 'Wait'";
    let params = [];

    // Apply filtering based on position hierarchy:
    // AD (Administrator) - Can see all registrations
    // AM (Area Manager) - Can see registrations from their region
    // QL (Store Manager) - Can see registrations from their specific store(s)
    if (currentUser.position === 'AD') {
      // Admin can see all pending registrations - no additional filtering
    } else if (currentUser.position === 'AM') {
      // Area Manager - filter by region
      // Get stores in their region based on their store assignment
      const userStore = await db
        .prepare("SELECT region FROM stores WHERE storeName = ?")
        .bind(currentUser.storeName)
        .first();
      
      if (userStore) {
        const regionStores = await db
          .prepare("SELECT storeName FROM stores WHERE region = ?")
          .bind(userStore.region)
          .all();
        
        if (regionStores.results && regionStores.results.length > 0) {
          const storeNames = regionStores.results.map(s => s.storeName);
          query += ` AND storeName IN (${storeNames.map(() => '?').join(',')})`;
          params.push(...storeNames);
        }
      }
    } else if (currentUser.position === 'QL') {
      // Store Manager - filter by their specific store(s)
      if (currentUser.storeName) {
        query += " AND storeName = ?";
        params.push(currentUser.storeName);
      }
    } else {
      // Other positions cannot see any registrations
      return jsonResponse([], 200, origin);
    }

    // Apply additional store filter if provided
    if (store && !params.includes(store)) {
      query += " AND storeName = ?";
      params.push(store);
    }

    query += " ORDER BY createdAt DESC";

    const registrations = await db.prepare(query).bind(...params).all();

    if (!registrations.results) {
      return jsonResponse([], 200, origin);
    }

    // Format response without sensitive data and include store information
    const pendingRequests = registrations.results.map(reg => ({
      employeeId: reg.employeeId,
      fullName: reg.fullName,
      storeName: reg.storeName,
      storeId: reg.storeId || 'N/A',
      position: reg.position,
      phone: reg.phone,
      email: reg.email,
      joinDate: reg.joinDate,
      createdAt: reg.createdAt,
      status: reg.status
    }));

    return jsonResponse(pendingRequests, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy yêu cầu đăng ký:", error);
    return jsonResponse({ message: "Lỗi lấy yêu cầu đăng ký!", error: error.message }, 500, origin);
  }
}

// Hàm phê duyệt đăng ký
async function handleApproveRegistration(body, db, origin) {
  const { employeeId, action } = body; // action: 'approve' or 'reject'
  
  if (!employeeId || !action) {
    return jsonResponse({ message: "Thiếu thông tin cần thiết!" }, 400, origin);
  }

  if (!['approve', 'reject'].includes(action)) {
    return jsonResponse({ message: "Hành động không hợp lệ!" }, 400, origin);
  }

  try {
    // Get registration data from queue
    const registration = await db
      .prepare("SELECT * FROM queue WHERE employeeId = ? AND status = 'Wait'")
      .bind(employeeId)
      .first();

    if (!registration) {
      return jsonResponse({ message: "Không tìm thấy yêu cầu đăng ký!" }, 404, origin);
    }

    if (action === 'approve') {
      // Move from queue to employees table
      await db
        .prepare(
          "INSERT INTO employees (employeeId, password, salt, fullName, storeName, position, joinDate, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          registration.employeeId,
          registration.password,
          registration.salt,
          registration.fullName,
          registration.storeName,
          registration.position || "NV",
          registration.joinDate,
          registration.phone,
          registration.email
        )
        .run();

      // Remove from queue
      await db.prepare("DELETE FROM queue WHERE employeeId = ?").bind(employeeId).run();

      return jsonResponse({ 
        message: `Đã phê duyệt đăng ký cho nhân viên ${registration.fullName} (${employeeId})` 
      }, 200, origin);
    } else {
      // Reject - just remove from queue
      await db.prepare("DELETE FROM queue WHERE employeeId = ?").bind(employeeId).run();
      
      return jsonResponse({ 
        message: `Đã từ chối đăng ký cho ${registration.fullName} (${employeeId})` 
      }, 200, origin);
    }
  } catch (error) {
    console.error("Lỗi xử lý đăng ký:", error);
    return jsonResponse({ message: "Lỗi xử lý đăng ký!", error: error.message }, 500, origin);
  }
}

// Hàm lấy quyền hạn của nhân viên
async function handleGetPermissions(url, db, origin) {
  const employeeId = url.searchParams.get("employeeId");
  
  if (!employeeId) {
    return jsonResponse({ message: "Thiếu employeeId!" }, 400, origin);
  }

  try {
    const permissions = await db
      .prepare("SELECT permission, granted FROM permissions WHERE employeeId = ?")
      .bind(employeeId)
      .all();

    const permissionMap = {};
    if (permissions.results) {
      permissions.results.forEach(perm => {
        permissionMap[perm.permission] = perm.granted;
      });
    }

    return jsonResponse(permissionMap, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy quyền hạn:", error);
    return jsonResponse({}, 200, origin);
  }
}

// Hàm lấy thống kê cá nhân
async function handleGetPersonalStats(url, db, origin) {
  const employeeId = url.searchParams.get("employeeId");
  
  if (!employeeId) {
    return jsonResponse({ message: "Thiếu employeeId!" }, 400, origin);
  }

  try {
    // Generate some basic personal stats
    // You can modify this based on your actual data structure
    const stats = {
      workDaysThisMonth: Math.floor(Math.random() * 22) + 8, // 8-30 days
      totalHoursThisMonth: Math.floor(Math.random() * 160) + 40, // 40-200 hours
      attendanceRate: Math.floor(Math.random() * 20) + 80 // 80-100%
    };

    return jsonResponse({ stats }, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy thống kê cá nhân:", error);
    return jsonResponse({ message: "Lỗi lấy thống kê cá nhân!", error: error.message }, 500, origin);
  }
}

export default {
  async scheduled(event, env, ctx) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today.getDay() !== 1) {
        console.log(`Today is ${today.toLocaleDateString("en-US", { weekday: "long" })}. No action required.`);
        return;
      }

      // TODO: Add weekly shift management tasks here if needed
      console.log("Monday maintenance completed");
    } catch (error) {
      console.error("Error in scheduled worker:", error);
    }
  },

  async fetch(request, env) {
    const db = env.D1_BINDING;
    if (request.method === "OPTIONS") return handleOptionsRequest();

    try {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");
      let token = url.searchParams.get("token");

      // Kiểm tra token từ header Authorization nếu không có trong query
      const authHeader = request.headers.get("Authorization");
      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!action) return jsonResponse({ message: "Thiếu action trong query parameters!" }, 400);

      const protectedActions = [
        "update", "getUser", "getUsers", 
        "updateUser", "getPendingRegistrations",
        "getPendingRequests", "getTasks", "getPermissions",
        "getShiftAssignments", "assignShift", "getCurrentShift", "getWeeklyShifts",
        "getAttendanceData", "checkIn", "checkOut", "getTimesheet", "processAttendance",
        "getAttendanceHistory", "createAttendanceRequest", "createTaskAssignment",
        "getWorkTasks", "getTaskDetail", "addTaskComment", "replyToComment",
        "getEmployeesByStore", "saveShiftAssignments", "getShiftRequests",
        "approveShiftRequest", "rejectShiftRequest", "getAttendanceRequests",
        "approveAttendanceRequest", "rejectAttendanceRequest"
      ];
      if (protectedActions.includes(action)) {
        const session = await checkSessionMiddleware(token, db, ALLOWED_ORIGIN);
        if (session instanceof Response) return session;
        request.userId = session.employeeId;
      }

      if (request.method === "POST") {
        const contentType = request.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
          return jsonResponse({ message: "Invalid Content-Type" }, 400);
        }

        const body = await request.json();
        switch (action) {
          case "login":
            return await handleLogin(body, db, ALLOWED_ORIGIN);
          case "register":
            return await handleRegister(body, db, ALLOWED_ORIGIN, env);
          case "update":
            return await handleUpdate(body, db, ALLOWED_ORIGIN);
          case "assignShift":
            return await handleAssignShift(body, db, ALLOWED_ORIGIN);
          case "loginUser":
            return await loginUser(body, db, ALLOWED_ORIGIN);
          case "updateUser":
            return await updateUser(body, request.userId, db, ALLOWED_ORIGIN);
          case "approveTask":
            return await handleApproveTask(body, db, ALLOWED_ORIGIN);
          case "rejectTask":
            return await handleRejectTask(body, db, ALLOWED_ORIGIN);
          case "createTask":
            return await handleCreateTaskFromMessage(body, db, ALLOWED_ORIGIN);
          case "updatePermissions":
            return await handleUpdatePermissions(body, db, ALLOWED_ORIGIN);
          case "updatePersonalInfo":
            return await handleUpdatePersonalInfo(body, db, ALLOWED_ORIGIN);
          case "updateUserWithHistory":
            return await handleUpdateUserWithHistory(body, db, ALLOWED_ORIGIN);
          case "approveRegistration":
            return await handleApproveRegistration(body, db, ALLOWED_ORIGIN);
          case "checkIn":
            return await handleCheckIn(body, db, ALLOWED_ORIGIN);
          case "checkOut":
            return await handleCheckOut(body, db, ALLOWED_ORIGIN);
          case "processAttendance":
            return await handleProcessAttendance(body, db, ALLOWED_ORIGIN);
          case "createAttendanceRequest":
            return await handleCreateAttendanceRequest(body, db, ALLOWED_ORIGIN);
          case "createTaskAssignment":
            return await handleCreateTaskAssignment(body, db, ALLOWED_ORIGIN);
          case "addTaskComment":
            return await handleAddTaskComment(body, db, ALLOWED_ORIGIN);
          case "replyToComment":
            return await handleReplyToComment(body, db, ALLOWED_ORIGIN);
          case "saveShiftAssignments":
            return await handleSaveShiftAssignments(body, db, ALLOWED_ORIGIN);
          case "approveShiftRequest":
            return await handleApproveShiftRequest(body, db, ALLOWED_ORIGIN);
          case "rejectShiftRequest":
            return await handleRejectShiftRequest(body, db, ALLOWED_ORIGIN);
          case "approveAttendanceRequest":
            return await handleApproveAttendanceRequest(body, db, ALLOWED_ORIGIN, token);
          case "rejectAttendanceRequest":
            return await handleRejectAttendanceRequest(body, db, ALLOWED_ORIGIN, token);
          default:
            return jsonResponse({ message: "Action không hợp lệ!" }, 400);
        }
      }

      if (request.method === "GET") {
        switch (action) {
          case "getStores":
            return await handleGetStores(db, ALLOWED_ORIGIN);
          case "checkId":
            return await handleCheckId(url, db, ALLOWED_ORIGIN);
          case "getUser":
            return await handleGetUser(url, db, ALLOWED_ORIGIN);
          case "getUserHistory":
            return await handleGetUserHistory(url, db, ALLOWED_ORIGIN);
          case "getUsers":
            return await handleGetUsers(url, db, ALLOWED_ORIGIN);
          case "getCurrentShift":
            return await handleGetCurrentShift(url, db, ALLOWED_ORIGIN);
          case "getWeeklyShifts":
            return await handleGetWeeklyShifts(url, db, ALLOWED_ORIGIN);
          case "getAttendanceData":
            return await handleGetAttendanceData(url, db, ALLOWED_ORIGIN);
          case "getPendingRequests":
            return await handleGetPendingRequests(db, ALLOWED_ORIGIN);
          case "getDashboardStats":
            return await handleGetDashboardStats(db, ALLOWED_ORIGIN);
          case "getTasks":
            return await handleGetTasks(url, db, ALLOWED_ORIGIN);
          case "getPermissions":
            return await handleGetPermissions(url, db, ALLOWED_ORIGIN);
          case "getPendingRegistrations":
            return await handleGetPendingRegistrations(url, db, ALLOWED_ORIGIN);
          case "getTimesheet":
            return await handleGetTimesheet(url, db, ALLOWED_ORIGIN);
          case "getAttendanceHistory":
            return await handleGetAttendanceHistory(url, db, ALLOWED_ORIGIN);
          case "getShiftAssignments":
            return await handleGetShiftAssignments(url, db, ALLOWED_ORIGIN);
          case "getPersonalStats":
            return await handleGetPersonalStats(url, db, ALLOWED_ORIGIN);
          case "getWorkTasks":
            return await handleGetWorkTasks(url, db, ALLOWED_ORIGIN);
          case "getTaskDetail":
            return await handleGetTaskDetail(url, db, ALLOWED_ORIGIN);
          case "getEmployeesByStore":
            return await handleGetEmployeesByStore(url, db, ALLOWED_ORIGIN);
          case "getShiftRequests":
            return await handleGetShiftRequests(url, db, ALLOWED_ORIGIN);
          case "getAttendanceRequests":
            return await handleGetAttendanceRequests(url, db, ALLOWED_ORIGIN);
          default:
            return jsonResponse({ message: "Action không hợp lệ!" }, 400);
        }
      }

      return jsonResponse({ message: "Phương thức không được hỗ trợ!" }, 405);
    } catch (error) {
      console.error("Lỗi xử lý yêu cầu:", error);
      return jsonResponse({ message: "Lỗi xử lý yêu cầu!", error: error.message }, 500);
    }
  },
};

// New API Handlers for HR Management System

// Handle timesheet data retrieval with enhanced attendance_requests integration
async function handleGetTimesheet(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const month = url.searchParams.get("month");
    
    if (!employeeId || !month) {
      return jsonResponse({ message: "employeeId và month là bắt buộc!" }, 400, origin);
    }

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${(monthNum + 1).toString().padStart(2, '0')}-01`;

    // First, get shift assignments for the month
    const shiftQuery = await db
      .prepare(`
        SELECT 
          date,
          shiftName,
          startTime,
          endTime
        FROM shift_assignments 
        WHERE employeeId = ? AND date >= ? AND date < ?
        ORDER BY date
      `)
      .bind(employeeId, startDate, endDate)
      .all();

    const shiftAssignments = shiftQuery.results || [];

    // Get attendance data for the month
    const attendanceQuery = await db
      .prepare(`
        SELECT 
          DATE(checkIn) as date,
          TIME(checkIn) as checkIn,
          TIME(checkOut) as checkOut,
          checkIn as fullCheckIn,
          checkOut as fullCheckOut,
          CASE 
            WHEN checkIn IS NOT NULL AND checkOut IS NOT NULL 
            THEN ROUND((JULIANDAY(checkOut) - JULIANDAY(checkIn)) * 24, 2)
            ELSE 0 
          END as hoursWorked
        FROM attendance 
        WHERE employeeId = ? AND DATE(checkIn) >= ? AND DATE(checkIn) < ?
        ORDER BY DATE(checkIn)
      `)
      .bind(employeeId, startDate, endDate)
      .all();

    const attendanceData = attendanceQuery.results || [];

    // Get approved attendance requests for forgotten check-ins
    const requestsQuery = await db
      .prepare(`
        SELECT 
          DATE(targetTime) as date,
          targetTime,
          requestType,
          status
        FROM attendance_requests 
        WHERE employeeId = ? AND status = 'approved' 
        AND DATE(targetTime) >= ? AND DATE(targetTime) < ?
        ORDER BY DATE(targetTime)
      `)
      .bind(employeeId, startDate, endDate)
      .all();

    const approvedRequests = requestsQuery.results || [];

    // Function to parse Vietnamese time format
    function parseVietnameseTime(targetTime) {
      const timeData = { checkIn: null, checkOut: null };
      
      if (!targetTime) return timeData;
      
      // Parse formats like "Giờ vào: 02:03" or "Giờ vào: 01:43, Giờ ra: 09:43"
      const checkInMatch = targetTime.match(/Giờ vào:\s*(\d{2}:\d{2})/);
      const checkOutMatch = targetTime.match(/Giờ ra:\s*(\d{2}:\d{2})/);
      
      if (checkInMatch) {
        timeData.checkIn = checkInMatch[1];
      }
      
      if (checkOutMatch) {
        timeData.checkOut = checkOutMatch[1];
      }
      
      return timeData;
    }

    // Merge attendance data with approved requests
    const mergedAttendanceData = [];
    const processedDates = new Set();

    // Process regular attendance data first
    for (const attendance of attendanceData) {
      mergedAttendanceData.push({
        ...attendance,
        source: 'attendance'
      });
      processedDates.add(attendance.date);
    }

    // Process approved attendance requests for missing dates
    for (const request of approvedRequests) {
      if (!processedDates.has(request.date)) {
        const timeData = parseVietnameseTime(request.targetTime);
        
        if (timeData.checkIn) {
          // Calculate hours worked if both times are available
          let hoursWorked = 0;
          if (timeData.checkIn && timeData.checkOut) {
            const [checkInHour, checkInMin] = timeData.checkIn.split(':').map(Number);
            const [checkOutHour, checkOutMin] = timeData.checkOut.split(':').map(Number);
            
            const checkInMinutes = checkInHour * 60 + checkInMin;
            const checkOutMinutes = checkOutHour * 60 + checkOutMin;
            
            hoursWorked = (checkOutMinutes - checkInMinutes) / 60;
            if (hoursWorked < 0) hoursWorked += 24; // Handle overnight shifts
          }
          
          mergedAttendanceData.push({
            date: request.date,
            checkIn: timeData.checkIn,
            checkOut: timeData.checkOut || null,
            fullCheckIn: `${request.date}T${timeData.checkIn}:00`,
            fullCheckOut: timeData.checkOut ? `${request.date}T${timeData.checkOut}:00` : null,
            hoursWorked: hoursWorked,
            source: 'approved_request'
          });
          
          processedDates.add(request.date);
        }
      }
    }

    // Sort merged data by date
    mergedAttendanceData.sort((a, b) => a.date.localeCompare(b.date));

    // Process attendance data with shift assignment validation
    const validAttendanceData = [];
    
    for (const attendance of mergedAttendanceData) {
      // Find shift assignment for this date
      const shift = shiftAssignments.find(s => s.date === attendance.date);
      
      if (!shift) {
        // No shift assigned for this day, skip attendance record
        continue;
      }

      // Apply 60-minute tolerance rules for regular attendance only
      if (attendance.source === 'attendance') {
        const shiftStart = new Date(`${attendance.date}T${shift.startTime}`);
        const shiftEnd = new Date(`${attendance.date}T${shift.endTime}`);
        const checkInTime = new Date(attendance.fullCheckIn);
        const checkOutTime = attendance.fullCheckOut ? new Date(attendance.fullCheckOut) : null;
        
        const checkInDiff = (checkInTime instanceof Date && shiftStart instanceof Date)
          ? (checkInTime.getTime() - shiftStart.getTime()) / 60000
          : 0;
        
        let isValidCheckIn = checkInDiff <= 60;
        
        let isValidCheckOut = true;
        let checkOutDiff = 0;
        if (checkOutTime && shiftEnd instanceof Date) {
          checkOutDiff = (checkOutTime.getTime() - shiftEnd.getTime()) / 60000;
          isValidCheckOut = checkOutDiff <= 60;
        }

        // Only include attendance if both check-in and check-out (if present) are valid
        if (isValidCheckIn && isValidCheckOut) {
          validAttendanceData.push({
            ...attendance,
            shiftName: shift.shiftName,
            shiftStart: shift.startTime,
            shiftEnd: shift.endTime
          });
        }
      } else {
        // For approved requests, include without validation
        validAttendanceData.push({
          ...attendance,
          shiftName: shift.shiftName,
          shiftStart: shift.startTime,
          shiftEnd: shift.endTime
        });
      }
    }

    // Calculate statistics based on valid attendance only
    const totalDays = validAttendanceData.length;
    const totalHours = validAttendanceData.reduce((sum, day) => sum + (day.hoursWorked || 0), 0);
    const totalShiftDays = shiftAssignments.length; // Total days with shift assignments
    const standardHours = totalShiftDays * 8;

    const statistics = {
      actualDays: `${totalDays}/${totalShiftDays}`,
      actualHours: `${Math.round(totalHours)}/${standardHours}`,
      workDays: totalDays.toString(),
      actualWorkHours: Math.round(totalHours).toString(),
      standardDays: totalShiftDays.toString(),
      lateDays: "0", // Could be calculated based on shift start times
      earlyLeave: "0", // Could be calculated based on shift end times
      lateMinutes: "0",
      earlyMinutes: "0",
      absentDays: Math.max(0, totalShiftDays - totalDays).toString(),
      forgotCheckin: "0",
      nightHours: "0", // Could be calculated based on time ranges
      dayHours: Math.round(totalHours).toString(),
      overtimeDays: "0",
      overtimeHours: "0"
    };

    return jsonResponse({
      success: true,
      data: validAttendanceData,
      statistics: statistics
    }, 200, origin);

  } catch (error) {
    console.error("Error getting timesheet:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi lấy dữ liệu bảng công", 
      error: error.message 
    }, 500, origin);
  }
}

// Calculate distance between two GPS coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c; // in meters
  return distance;
}

// Handle GPS attendance processing
async function handleProcessAttendance(body, db, origin) {
  try {
    const { employeeId, location } = body;
    
    if (!employeeId || !location) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
    }

    // Check if user exists and get their store
    const employee = await db
      .prepare("SELECT * FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!employee) {
      return jsonResponse({ 
        success: false, 
        message: "Nhân viên không tồn tại!" 
      }, 404, origin);
    }

    // Get store location for GPS verification - Fixed structure
    const storeQuery = await db
      .prepare("SELECT latitude, longitude, storeName FROM stores WHERE storeId = ?")
      .bind(employee.storeName)
      .first();

    if (!storeQuery || !storeQuery.latitude || !storeQuery.longitude) {
      return jsonResponse({ 
        success: false, 
        message: "Không tìm thấy thông tin vị trí cửa hàng!" 
      }, 400, origin);
    }

    // Get attendance radius setting (default 50m)
    const radiusSetting = await db
      .prepare("SELECT settingValue FROM hr_settings WHERE settingKey = 'attendance_radius_meters' AND isActive = 1")
      .first();
    
    const allowedRadius = radiusSetting ? parseInt(radiusSetting.settingValue) : 50;

    // Calculate distance between user location and store
    const distance = calculateDistance(
      location.latitude, location.longitude,
      storeQuery.latitude, storeQuery.longitude
    );

    // Check if user is within allowed radius
    if (distance > allowedRadius) {
      return jsonResponse({ 
        success: false, 
        message: `Bạn cần ở gần cửa hàng trong bán kính ${allowedRadius}m để chấm công. Khoảng cách hiện tại: ${Math.round(distance)}m`,
        distance: Math.round(distance),
        allowedRadius: allowedRadius
      }, 400, origin);
    }

    // Get today's attendance records using Hanoi timezone (+7)  
    const serverTime = TimezoneUtils.now(); // Use Hanoi timezone (+7 hours)
    const today = serverTime.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const existingRecordsQuery = await db
      .prepare(`
        SELECT * FROM attendance 
        WHERE employeeId = ? AND DATE(checkIn) = ?
        ORDER BY checkIn DESC
      `)
      .bind(employeeId, today)
      .all();
      
    const existingRecords = existingRecordsQuery.results || [];

    // Determine if this should be check-in or check-out
    const lastRecord = existingRecords[0];
    const isCheckIn = !lastRecord || lastRecord.checkOut;

    if (isCheckIn) {
      // Process check-in using Hanoi timezone
      const timestamp = TimezoneUtils.toHanoiISOString();
      await db
        .prepare(`
          INSERT INTO attendance (employeeId, checkIn, location, status)
          VALUES (?, ?, ?, 'active')
        `)
        .bind(employeeId, timestamp, JSON.stringify(location))
        .run();

      return jsonResponse({
        success: true,
        message: "Chấm công vào ca thành công!",
        type: "check-in",
        timestamp: hanoiTimestamp,
        distance: Math.round(distance),
        store: employee.storeName
      }, 200, origin);

    } else {
      // Process check-out using Hanoi timezone  
      const timestamp = TimezoneUtils.toHanoiISOString();
      await db
        .prepare(`
          UPDATE attendance 
          SET checkOut = ?, status = 'completed'
          WHERE employeeId = ? AND DATE(checkIn) = ? AND checkOut IS NULL
        `)
        .bind(timestamp, employeeId, today)
        .run();

      return jsonResponse({
        success: true,
        message: "Chấm công tan ca thành công!",
        type: "check-out",
        timestamp: timestamp,
        distance: Math.round(distance),
        store: employee.storeName
      }, 200, origin);
    }

  } catch (error) {
    console.error("Error processing attendance:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi xử lý chấm công", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle attendance history retrieval
async function handleGetAttendanceHistory(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const date = url.searchParams.get("date");
    
    if (!employeeId || !date) {
      return jsonResponse({ message: "employeeId và date là bắt buộc!" }, 400, origin);
    }

    const recordsQuery = await db
      .prepare(`
        SELECT 
          'check_in' as type,
          checkIn as timestamp,
          location
        FROM attendance 
        WHERE employeeId = ? AND DATE(checkIn) = ?
        UNION ALL
        SELECT 
          'check_out' as type,
          checkOut as timestamp,
          location
        FROM attendance 
        WHERE employeeId = ? AND DATE(checkIn) = ? AND checkOut IS NOT NULL
        ORDER BY timestamp
      `)
      .bind(employeeId, date, employeeId, date)
      .all();

    // Handle D1 database response format
    const records = recordsQuery.results || [];

    return jsonResponse(records, 200, origin);

  } catch (error) {
    console.error("Error getting attendance history:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy lịch sử chấm công", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle attendance request creation
async function handleCreateAttendanceRequest(body, db, origin) {
  try {
    const { type, employeeId, timestamp, ...requestData } = body;
    
    if (!type || !employeeId) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
    }

    // Create attendance request record in attendance_requests table
    const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentTime = new Date().toISOString();
    
    // Handle forgotten check-in/out times properly
    let targetTime = null;
    let reason = requestData.forgotReason || requestData.reason || '';
    
    // Store time data based on request type and form data
    if (requestData.forgotType) {
      if (requestData.forgotType === 'check-in' && requestData.forgotCheckinTime) {
        targetTime = `Giờ vào: ${requestData.forgotCheckinTime}`;
      } else if (requestData.forgotType === 'check-out' && requestData.forgotCheckoutTime) {
        targetTime = `Giờ ra: ${requestData.forgotCheckoutTime}`;
      } else if (requestData.forgotType === 'both') {
        const times = [];
        if (requestData.forgotCheckinTime) times.push(`Giờ vào: ${requestData.forgotCheckinTime}`);
        if (requestData.forgotCheckoutTime) times.push(`Giờ ra: ${requestData.forgotCheckoutTime}`);
        targetTime = times.join(', ');
      }
    }
    
    await db
      .prepare(`
        INSERT INTO attendance_requests (
          requestId, employeeId, type, requestDate, reason, status, createdAt,
          targetDate, targetTime, currentShift, requestedShift, leaveType, startDate, endDate
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        requestId,
        employeeId,
        type,
        currentTime,
        reason,
        currentTime,
        requestData.forgotDate || requestData.targetDate || null,
        targetTime, 
        requestData.currentShift || null,
        requestData.requestedShift || null,
        requestData.leaveType || null,
        requestData.startDate || null,
        requestData.endDate || null
      )
      .run();

    return jsonResponse({
      success: true,
      message: "Đơn từ đã được gửi thành công!",
      requestId: requestId
    }, 200, origin);

  } catch (error) {
    console.error("Error creating attendance request:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi tạo đơn từ", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle task assignment creation
async function handleCreateTaskAssignment(body, db, origin) {
  try {
    const { 
      title, description, priority, deadline, 
      participants, supporters, assigners, createdBy, timestamp 
    } = body;
    
    if (!title || !description || !participants || participants.length === 0) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
    }

    // Create task record first, then task assignments in a transaction
    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentTimestamp = timestamp || TimezoneUtils.toHanoiISOString();
    
    // Start transaction by inserting task first
    const taskInsert = await db
      .prepare(`
        INSERT INTO tasks (
          id, taskId, title, description, priority, deadline, status,
          createdBy, createdAt, data, employeeId, employeeName, position, type, content
        ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, 'task_assignment', ?)
      `)
      .bind(
        taskId, // Use taskId as the primary key 'id'
        taskId, // Also store in taskId field for backward compatibility
        title,
        description,
        priority,
        deadline,
        createdBy,
        currentTimestamp,
        JSON.stringify({
          participants,
          supporters,
          assigners
        }),
        createdBy, // Set employeeId to createdBy to satisfy NOT NULL constraint
        'Task Creator', // Default employeeName  
        'SYSTEM', // Default position for task creation
        description // Use description as content
      )
      .run();

    // Verify task was created successfully before proceeding
    if (!taskInsert.success) {
      throw new Error('Failed to create task record');
    }

    // Create task assignments for participants
    for (const participantId of participants) {
      await db
        .prepare(`
          INSERT INTO task_assignments (
            taskId, employeeId, role, assignedAt
          ) VALUES (?, ?, 'participant', ?)
        `)
        .bind(taskId, participantId, currentTimestamp)
        .run();
    }

    // Create task assignments for supporters
    for (const supporterId of supporters || []) {
      await db
        .prepare(`
          INSERT INTO task_assignments (
            taskId, employeeId, role, assignedAt
          ) VALUES (?, ?, 'supporter', ?)
        `)
        .bind(taskId, supporterId, currentTimestamp)
        .run();
    }

    // Create task assignments for assigners
    for (const assignerId of assigners || []) {
      await db
        .prepare(`
          INSERT INTO task_assignments (
            taskId, employeeId, role, assignedAt
          ) VALUES (?, ?, 'assigner', ?)
        `)
        .bind(taskId, assignerId, timestamp || TimezoneUtils.toHanoiISOString())
        .run();
    }

    return jsonResponse({
      success: true,
      message: "Nhiệm vụ đã được tạo thành công!",
      taskId: taskId
    }, 200, origin);

  } catch (error) {
    console.error("Error creating task assignment:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi tạo nhiệm vụ", 
      error: error.message 
    }, 500, origin);
  }
}

// New API Handlers for Enhanced HR Management System

// Handle getting work tasks for a user
async function handleGetWorkTasks(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 15;
    const offset = (page - 1) * limit;
    
    if (!employeeId) {
      return jsonResponse({ message: "employeeId là bắt buộc!" }, 400, origin);
    }

    const tasksQuery = await db
      .prepare(`
        SELECT t.*, ta.role, 
               GROUP_CONCAT(DISTINCT CASE WHEN ta2.role = 'assigner' THEN e2.fullName END) as assignerNames,
               GROUP_CONCAT(DISTINCT CASE WHEN ta2.role = 'participant' THEN e2.fullName END) as participantNames,
               GROUP_CONCAT(DISTINCT CASE WHEN ta2.role = 'supporter' THEN e2.fullName END) as supporterNames
        FROM tasks t
        JOIN task_assignments ta ON t.taskId = ta.taskId
        LEFT JOIN task_assignments ta2 ON t.taskId = ta2.taskId
        LEFT JOIN employees e2 ON ta2.employeeId = e2.employeeId
        WHERE ta.employeeId = ?
        GROUP BY t.taskId
        ORDER BY t.createdAt DESC
        LIMIT ? OFFSET ?
      `)
      .bind(employeeId, limit, offset)
      .all();

    const tasks = tasksQuery.results || [];
    
    // Return with pagination metadata
    return jsonResponse({
      data: tasks,
      pagination: {
        page,
        limit,
        hasMore: tasks.length === limit
      }
    }, 200, origin);

  } catch (error) {
    console.error("Error getting work tasks:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy danh sách công việc", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting task detail with comments
async function handleGetTaskDetail(url, db, origin) {
  try {
    const taskId = url.searchParams.get("taskId");
    
    if (!taskId) {
      return jsonResponse({ message: "taskId là bắt buộc!" }, 400, origin);
    }

    // Get task details
    const taskQuery = await db
      .prepare(`
        SELECT t.*, 
               GROUP_CONCAT(DISTINCT CASE WHEN ta.role = 'assigner' THEN e.fullName END) as assignerNames,
               GROUP_CONCAT(DISTINCT CASE WHEN ta.role = 'participant' THEN e.fullName END) as participantNames,
               GROUP_CONCAT(DISTINCT CASE WHEN ta.role = 'supporter' THEN e.fullName END) as supporterNames
        FROM tasks t
        LEFT JOIN task_assignments ta ON t.taskId = ta.taskId
        LEFT JOIN employees e ON ta.employeeId = e.employeeId
        WHERE t.taskId = ?
        GROUP BY t.taskId
      `)
      .bind(taskId)
      .first();

    if (!taskQuery) {
      return jsonResponse({ message: "Không tìm thấy nhiệm vụ!" }, 404, origin);
    }

    // Get comments
    const commentsQuery = await db
      .prepare(`
        SELECT tc.*, e.fullName as authorName
        FROM task_comments tc
        LEFT JOIN employees e ON tc.authorId = e.employeeId
        WHERE tc.taskId = ?
        ORDER BY tc.createdAt ASC
      `)
      .bind(taskId)
      .all();

    const task = taskQuery;
    task.comments = commentsQuery.results || [];

    // Add timestamp without overriding task status
    const responseData = {
      ...task,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });

  } catch (error) {
    console.error("Error getting task detail:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy chi tiết nhiệm vụ", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle adding task comment
async function handleAddTaskComment(body, db, origin) {
  try {
    const { taskId, content } = body;
    
    if (!taskId || !content) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
    }

    // Get current user from session
    const token = body.token || '';
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    const commentId = `COMMENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db
      .prepare(`
        INSERT INTO task_comments (
          commentId, taskId, authorId, content, createdAt
        ) VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        commentId,
        taskId,
        session.employeeId,
        content,
        new Date().toISOString()
      )
      .run();

    return jsonResponse({
      success: true,
      message: "Đã thêm bình luận thành công!",
      commentId: commentId
    }, 200, origin);

  } catch (error) {
    console.error("Error adding task comment:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi thêm bình luận", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle replying to comment
async function handleReplyToComment(body, db, origin) {
  try {
    const { commentId, content } = body;
    
    if (!commentId || !content) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
     }

    // Get current user from session
    const token = body.token || '';
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    const replyId = `REPLY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db
      .prepare(`
        INSERT INTO comment_replies (
          replyId, commentId, authorId, content, createdAt
        ) VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        replyId,
        commentId,
        session.employeeId,
        content,
        new Date().toISOString()
      )
      .run();

    return jsonResponse({
      success: true,
      message: "Đã trả lời bình luận thành công!",
      replyId: replyId
    }, 200, origin);

  } catch (error) {
    console.error("Error replying to comment:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi trả lời bình luận", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting employees by store
async function handleGetEmployeesByStore(url, db, origin) {
  try {
    const storeId = url.searchParams.get("storeId");
    
    if (!storeId) {
      return jsonResponse({ message: "storeId là bắt buộc!" }, 400, origin);
    }

    const employeesQuery = await db
      .prepare(`
        SELECT employeeId, fullName, position, email, storeName
        FROM employees 
        WHERE storeName = ?
        ORDER BY fullName
      `)
      .bind(storeId)
      .all();

    const employees = employeesQuery.results || [];
    return jsonResponse(employees, 200, origin);

  } catch (error) {
    console.error("Error getting employees by store:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy danh sách nhân viên", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle saving shift assignments
async function handleSaveShiftAssignments(body, db, origin) {
  try {
    const { storeId, week, shifts } = body;
    
    if (!storeId || !week || !Array.isArray(shifts)) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
    }

    // Get current user from session
    const token = body.token || '';
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    // Clear existing assignments for the week
    await db
      .prepare(`
        DELETE FROM shift_assignments 
        WHERE storeId = ? AND strftime('%Y-W%W', date) = ?
      `)
      .bind(storeId, week)
      .run();

    // Insert new assignments
    for (const shift of shifts) {
      // Validate shift data for undefined values
      if (!shift.employeeId || !shift.storeId || !shift.date || !shift.shiftType) {
        console.error("Invalid shift data:", shift);
        continue; // Skip invalid shifts
      }

      await db
        .prepare(`
          INSERT INTO shift_requests (
            employeeId, storeId, requestDate, shiftType, requestedBy, requestedAt, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          shift.employeeId,
          shift.storeId,
          shift.date,
          shift.shiftType,
          session.employeeId,
          new Date().toISOString(),
          'pending'
        )
        .run();
    }

    return jsonResponse({
      success: true,
      message: "Đã lưu phân ca thành công!",
      shiftsCount: shifts.length
    }, 200, origin);

  } catch (error) {
    console.error("Error saving shift assignments:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi lưu phân ca", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting shift requests
async function handleGetShiftRequests(url, db, origin) {
  try {
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 15;
    const offset = (page - 1) * limit;

    const shiftRequestsQuery = await db
      .prepare(`
        SELECT sr.*, e.fullName as employeeName
        FROM shift_requests sr
        LEFT JOIN employees e ON sr.employeeId = e.employeeId
        ORDER BY sr.createdAt DESC
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all();

    const requests = shiftRequestsQuery.results || [];
    return jsonResponse({
      data: requests,
      pagination: {
        page,
        limit,
        hasMore: requests.length === limit
      }
    }, 200, origin);

  } catch (error) {
    console.error("Error getting shift requests:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy yêu cầu phân ca", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle approving shift request
async function handleApproveShiftRequest(body, db, origin) {
  try {
    const { requestId, note } = body;
    
    if (!requestId) {
      return jsonResponse({ 
        success: false, 
        message: "requestId là bắt buộc!" 
      }, 400, origin);
    }

    // Get current user from session
    const token = body.token || '';
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    await db
      .prepare(`
        UPDATE shift_requests 
        SET status = 'approved', approvedBy = ?, approvedAt = ?, approvalNote = ?
        WHERE id = ?
      `)
      .bind(session.employeeId, new Date().toISOString(), note || '', requestId)
      .run();

    return jsonResponse({
      success: true,
      message: "Đã duyệt yêu cầu phân ca thành công!"
    }, 200, origin);

  } catch (error) {
    console.error("Error approving shift request:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi duyệt yêu cầu", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle rejecting shift request
async function handleRejectShiftRequest(body, db, origin) {
  try {
    const { requestId, note } = body;
    
    if (!requestId || !note) {
      return jsonResponse({ 
        success: false, 
        message: "requestId và note là bắt buộc!" 
      }, 400, origin);
    }

    // Get current user from session
    const token = body.token || '';
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    await db
      .prepare(`
        UPDATE shift_requests 
        SET status = 'rejected', approvedBy = ?, approvedAt = ?, approvalNote = ?
        WHERE id = ?
      `)
      .bind(session.employeeId, new Date().toISOString(), note, requestId)
      .run();

    return jsonResponse({
      success: true,
      message: "Đã từ chối yêu cầu phân ca!"
    }, 200, origin);

  } catch (error) {
    console.error("Error rejecting shift request:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi từ chối yêu cầu", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting attendance requests
async function handleGetAttendanceRequests(url, db, origin) {
  try {
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 15;
    const offset = (page - 1) * limit;

    const attendanceRequestsQuery = await db
      .prepare(`
        SELECT ar.*, e.fullName as employeeName, e.storeName,
               approver.fullName as approverName
        FROM attendance_requests ar
        LEFT JOIN employees e ON ar.employeeId = e.employeeId
        LEFT JOIN employees approver ON ar.approvedBy = approver.employeeId
        ORDER BY ar.createdAt DESC
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all();

    const requests = attendanceRequestsQuery.results || [];
    return jsonResponse({
      data: requests,
      pagination: {
        page,
        limit,
        hasMore: requests.length === limit
      }
    }, 200, origin);

  } catch (error) {
    console.error("Error getting attendance requests:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy yêu cầu chấm công", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle approving attendance request
async function handleApproveAttendanceRequest(body, db, origin, token) {
  try {
    const { requestId, note } = body;
    
    if (!requestId) {
      return jsonResponse({ 
        success: false, 
        message: "requestId là bắt buộc!" 
      }, 400, origin);
    }

    // Use the token passed from the main handler
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    await db
      .prepare(`
        UPDATE attendance_requests 
        SET status = 'approved', approvedBy = ?, approvedAt = ?, note = ?
        WHERE id = ?
      `)
      .bind(session.employeeId, new Date().toISOString(), note || '', requestId)
      .run();

    return jsonResponse({
      success: true,
      message: "Đã duyệt đơn từ thành công!"
    }, 200, origin);

  } catch (error) {
    console.error("Error approving attendance request:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi duyệt đơn từ", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle rejecting attendance request
async function handleRejectAttendanceRequest(body, db, origin, token) {
  try {
    const { requestId, note } = body;
    
    if (!requestId || !note) {
      return jsonResponse({ 
        success: false, 
        message: "requestId và note là bắt buộc!" 
      }, 400, origin);
    }

    // Use the token passed from the main handler
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    await db
      .prepare(`
        UPDATE attendance_requests 
        SET status = 'rejected', approvedBy = ?, approvedAt = ?, note = ?
        WHERE id = ?
      `)
      .bind(session.employeeId, new Date().toISOString(), note, requestId)
      .run();

    return jsonResponse({
      success: true,
      message: "Đã từ chối đơn từ!"
    }, 200, origin);

  } catch (error) {
    console.error("Error rejecting attendance request:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi khi từ chối đơn từ", 
      error: error.message 
    }, 500, origin);
  }
}
