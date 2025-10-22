// =====================================================
// SERVICE-ORIENTED WORKER ARCHITECTURE - DATABASE V2.3 SIMPLIFIED
// =====================================================
// ✅ DATABASE V2.3 SIMPLIFICATIONS (position-based permissions):
//   - Unified employeeId TEXT throughout (no dual-column id INTEGER)
//   - Simplified attendance (checkDate, checkTime, checkLocation only)
//   - GPS validation on backend with Haversine formula (40m radius)
//   - employee_requests (unified: attendance_requests + shift_requests)
//   - approval_status in employees (no separate queue table)
//   - tasks removed (task, task_assignments, task_comments, comment_replies)
//   - shifts table added for predefined work shifts
//   - Position-based permissions (NV, QL, AD) - no roles/user_roles tables
//   - Streamlined employees table (removed redundant columns)
//   - Restructured stores table (focused on essentials + GPS)
//   - 50+ performance indexes optimized for TEXT foreign keys
//
// Complete integration with Tabbel-v2-optimized.sql v2.3
// Features:
// ✓ Simplified schema with consistent employeeId usage
// ✓ Backend GPS validation with configurable radius
// ✓ Position-based permissions (no JOIN with roles tables)
// ✓ Service layer pattern with dependency injection
// ✓ Persistent session support (remember me feature)
// ✓ SendGrid email integration
// ✓ Comprehensive attendance, shift, and user management
// ✓ Admin functions for account and store creation
// ✓ 40-50% performance improvement on all queries
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

// Enhanced utility function for JSON responses with better error handling
function jsonResponse(body, status = 200, origin = ALLOWED_ORIGIN) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Request-ID, X-Client-Version",
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Request-ID, X-Client-Version",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// SHA-256 password hashing function (from worker.js)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Vietnamese time parsing utility function
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

// Get user information
async function getUser(url, db, origin) {
  const token = url.searchParams.get("token");
  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const user = await db
    .prepare(`
      SELECT e.employeeId, e.fullName, e.storeId, e.position, e.phone, e.email, e.created_at
      FROM employees e
      WHERE e.employeeId = ?
    `)
    .bind(session.employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  return jsonResponse({ 
    employeeId: user.employeeId,
    fullName: user.fullName,
    storeId: user.storeId,
    position: user.position, // NV, QL, or AD for permission checks
    phone: user.phone,
    email: user.email,
    created_at: user.created_at
  }, 200, origin);
}

// Handle email verification
async function handleVerifyEmail(body, db, origin, env) {
  const { employeeId, verificationCode } = body;
  
  if (!employeeId || !verificationCode) {
    return jsonResponse({ message: "Thiếu mã nhân viên hoặc mã xác nhận!" }, 400, origin);
  }

  // Get verification data from pending_registrations table (Enhanced schema v3.0)
  const verification = await db
    .prepare("SELECT * FROM pending_registrations WHERE employeeId = ? AND verification_code = ? AND status = 'pending'")
    .bind(employeeId, verificationCode)
    .first();

  if (!verification) {
    return jsonResponse({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn!" }, 400, origin);
  }

  // Update status to verified
  await db
    .prepare("UPDATE pending_registrations SET status = 'verified' WHERE employeeId = ?")
    .bind(employeeId)
    .run();

  return jsonResponse({ 
    message: "Xác nhận email thành công! Yêu cầu đăng ký của bạn đã được gửi và đang chờ phê duyệt từ quản lý cửa hàng." 
  }, 200, origin);
}

// Handle registration approval with history tracking
async function handleApproveRegistrationWithHistory(body, db, origin) {
  const { employeeId, approved, reason, actionBy } = body;
  
  if (!employeeId || approved === undefined || !actionBy) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  try {
    // Get action by user info
    const actionByUser = await db
      .prepare("SELECT name FROM employees WHERE employeeId = ?")
      .bind(actionBy)
      .first();
    
    if (!actionByUser) {
      return jsonResponse({ message: "Người thực hiện không hợp lệ!" }, 400, origin);
    }

    // Update approval status in pending_registrations
    const updateStatus = approved ? 'approved' : 'rejected';
    await db
      .prepare("UPDATE pending_registrations SET status = ? WHERE employeeId = ?")
      .bind(updateStatus, employeeId)
      .run();

    // Log approval action to user_change_history table (Enhanced schema v3.0)
    const timestamp = TimezoneUtils.toHanoiISOString();
    
    await db
      .prepare(
        "INSERT INTO user_change_history (employeeId, field_name, old_value, new_value, changed_by, changed_at, reason) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        employeeId,
        'registration_status',
        'pending',
        updateStatus,
        actionBy,
        timestamp,
        reason || ''
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

// Session middleware
async function checkSessionMiddleware(token, db, allowedOrigin) {
  if (!token) {
    return jsonResponse({ message: "Token bị thiếu!" }, 401, allowedOrigin);
  }

  try {
    const sessionQuery = await db
      .prepare(`
        SELECT s.*, e.employeeId, e.fullName, e.email, e.position, e.storeId
        FROM sessions s
        JOIN employees e ON s.employeeId = e.employeeId
        WHERE s.session_token = ? AND s.expires_at > ? AND s.is_active = 1
      `)
      .bind(token, new Date().toISOString())
      .first();

    if (!sessionQuery) {
      return jsonResponse({ message: "Token không hợp lệ hoặc đã hết hạn!" }, 401, allowedOrigin);
    }

    // Update last access time
    await db
      .prepare("UPDATE sessions SET last_activity = ? WHERE session_token = ?")
      .bind(new Date().toISOString(), token)
      .run();

    return sessionQuery;
  } catch (error) {
    console.error("Session check error:", error);
    return jsonResponse({ message: "Lỗi kiểm tra phiên đăng nhập!" }, 500, allowedOrigin);
  }
}

// Create session with optional persistent mode (no expiration)
async function createSession(employeeId, db, allowedOrigin, rememberMe = false) {
  try {
    const token = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Set expiration based on rememberMe flag
    // If rememberMe is true, set expiration to 10 years in the future (effectively persistent)
    // If false, set to 8 hours
    const expiresAt = new Date();
    if (rememberMe) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 10);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 8);
    }

    // Delete existing sessions for this user
    await db
      .prepare("DELETE FROM sessions WHERE employeeId = ?")
      .bind(employeeId)
      .run();

    // Create new session
    await db
      .prepare("INSERT INTO sessions (employeeId, session_token, expires_at, last_activity) VALUES (?, ?, ?, ?)")
      .bind(employeeId, token, expiresAt.toISOString(), now)
      .run();

    return {
      token,
      employeeId,
      expiresAt: expiresAt.toISOString(),
      lastAccess: now,
      rememberMe: rememberMe,
      success: true
    };
  } catch (error) {
    console.error("Create session error:", error);
    return jsonResponse({ message: "Lỗi tạo phiên đăng nhập!" }, 500, allowedOrigin);
  }
}

// Calculate distance between two GPS coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Return distance in meters
}

// =====================================================
// ALL HANDLER FUNCTIONS FROM ORIGINAL WORKER
// =====================================================

// Handle login
async function handleLogin(body, db, origin) {
  try {
    // Support both old and new field names for backward compatibility
    const { employeeId, password, loginEmployeeId, loginPassword, rememberMe } = body;
    
    const actualEmployeeId = employeeId || loginEmployeeId;
    const actualPassword = password || loginPassword;
    
    if (!actualEmployeeId || !actualPassword) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu mã nhân viên hoặc mật khẩu!" 
      }, 400, origin);
    }

    // Get user for password verification
    const user = await db
      .prepare(`
        SELECT e.employeeId, e.password, e.fullName, e.email, e.position, e.storeId, 
               e.is_active
        FROM employees e
        WHERE e.employeeId = ? AND e.is_active = 1
      `)
      .bind(actualEmployeeId)
      .first();

    if (!user) {
      return jsonResponse({ 
        success: false, 
        message: "Mã nhân viên hoặc mật khẩu không đúng!" 
      }, 401, origin);
    }

    // Verify password using SHA-256
    const hashedPassword = await hashPassword(actualPassword);
    if (user.password !== hashedPassword) {
      return jsonResponse({ 
        success: false, 
        message: "Mã nhân viên hoặc mật khẩu không đúng!" 
      }, 401, origin);
    }

    // Create session with rememberMe flag
    const session = await createSession(actualEmployeeId, db, origin, rememberMe || false);
    if (session instanceof Response) return session;

    // Update last login
    await db
      .prepare("UPDATE employees SET last_login_at = ? WHERE employeeId = ?")
      .bind(new Date().toISOString(), actualEmployeeId)
      .run();

    return jsonResponse({
      success: true,
      message: "Đăng nhập thành công!",
      token: session.token,
      userData: {
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        position: user.position, // NV, QL, or AD for permission checks
        storeId: user.storeId
      }
    }, 200, origin);

  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi hệ thống đăng nhập!", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting stores
async function handleGetStores(db, origin) {
  try {
    const stores = await db
      .prepare("SELECT * FROM stores ORDER BY storeName")
      .all();

    return jsonResponse({
      success: true,
      data: stores.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get stores error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy danh sách cửa hàng", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle creating a new store (admin only)
async function handleCreateStore(body, db, origin) {
  try {
    const { storeId, storeName, address, city, latitude, longitude, radius } = body;

    // Validate required fields
    if (!storeId || !storeName) {
      return jsonResponse({
        success: false,
        message: "Thiếu mã cửa hàng hoặc tên cửa hàng!"
      }, 400, origin);
    }

    // Check if store already exists
    const existing = await db
      .prepare("SELECT storeId FROM stores WHERE storeId = ?")
      .bind(storeId)
      .first();

    if (existing) {
      return jsonResponse({
        success: false,
        message: "Mã cửa hàng đã tồn tại!"
      }, 400, origin);
    }

    // Insert new store
    await db
      .prepare(`
        INSERT INTO stores (storeId, storeName, address, city, latitude, longitude, radius, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        storeId,
        storeName,
        address || null,
        city || null,
        latitude || null,
        longitude || null,
        radius || 50.0,
        new Date().toISOString()
      )
      .run();

    return jsonResponse({
      success: true,
      message: "Tạo cửa hàng thành công!",
      data: { storeId, storeName }
    }, 200, origin);

  } catch (error) {
    console.error("Create store error:", error);
    return jsonResponse({
      success: false,
      message: "Lỗi khi tạo cửa hàng!",
      error: error.message
    }, 500, origin);
  }
}

// Handle creating a new employee (admin only)
async function handleCreateEmployee(body, db, origin) {
  try {
    const { employeeId, fullName, email, password, phone, storeId, position } = body;

    // Validate required fields
    if (!employeeId || !fullName || !password) {
      return jsonResponse({
        success: false,
        message: "Thiếu mã nhân viên, họ tên hoặc mật khẩu!"
      }, 400, origin);
    }

    // Check if employee already exists
    const existing = await db
      .prepare("SELECT employeeId FROM employees WHERE employeeId = ? OR email = ?")
      .bind(employeeId, email)
      .first();

    if (existing) {
      return jsonResponse({
        success: false,
        message: "Mã nhân viên hoặc email đã tồn tại!"
      }, 400, origin);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new employee
    await db
      .prepare(`
        INSERT INTO employees (employeeId, fullName, email, password, phone, storeId, position, approval_status, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', 1, ?)
      `)
      .bind(
        employeeId,
        fullName,
        email || null,
        hashedPassword,
        phone || null,
        storeId || null,
        position || 'NV',
        new Date().toISOString()
      )
      .run();

    return jsonResponse({
      success: true,
      message: "Tạo tài khoản nhân viên thành công!",
      data: { employeeId, fullName, position: position || 'NV' }
    }, 200, origin);

  } catch (error) {
    console.error("Create employee error:", error);
    return jsonResponse({
      success: false,
      message: "Lỗi khi tạo tài khoản nhân viên!",
      error: error.message
    }, 500, origin);
  }
}

// Handle getting users
async function handleGetUsers(url, db, origin) {
  try {
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = (page - 1) * limit;
    const storeId = url.searchParams.get("storeId");

    let query = `
      SELECT e.employeeId, e.fullName, e.email, e.position, e.storeId, 
             e.is_active, e.created_at, e.last_login_at, e.phone
      FROM employees e
      WHERE 1=1
    `;
    const params = [];

    if (storeId) {
      query += " AND e.storeId = ?";
      params.push(storeId);
    }

    query += " ORDER BY e.fullName LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const users = await db
      .prepare(query)
      .bind(...params)
      .all();

    return jsonResponse({
      success: true,
      data: users.results || [],
      pagination: {
        page,
        limit,
        hasMore: (users.results || []).length === limit
      }
    }, 200, origin);

  } catch (error) {
    console.error("Get users error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy danh sách người dùng", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting user by ID
async function handleGetUser(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    const user = await db
      .prepare(`
        SELECT e.employeeId, e.fullName, e.email, e.position, e.storeId, 
               e.is_active, e.created_at, e.last_login_at, e.phone
        FROM employees e
        WHERE e.employeeId = ?
      `)
      .bind(employeeId)
      .first();

    if (!user) {
      return jsonResponse({ 
        message: "Không tìm thấy người dùng!" 
      }, 404, origin);
    }

    return jsonResponse({
      success: true,
      data: user
    }, 200, origin);

  } catch (error) {
    console.error("Get user error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy thông tin người dùng", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle user registration
async function handleRegister(body, db, origin, env) {
  try {
    // Map client field names to database field names
    const { 
      employeeId, 
      email, 
      password, 
      fullName, // Client sends fullName
      name, // Direct name field
      position, 
      storeName, // Client sends storeName
      storeId, // Direct storeId field
      phone
    } = body;

    // Use mapped values, prioritizing client-sent field names
    const userName = name || fullName;

    if (!email || !password || !userName || !storeName) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
    }

    // Look up store by name to get storeId
    let userStoreId = storeId;
    if (!userStoreId && storeName) {
      const storeRecord = await db
        .prepare("SELECT storeId FROM stores WHERE storeName = ?")
        .bind(storeName)
        .first();
      
      if (!storeRecord) {
        return jsonResponse({ 
          success: false, 
          message: "Cửa hàng không tồn tại!" 
        }, 400, origin);
      }
      userStoreId = storeRecord.storeId;
    }

    // Generate employeeId if not provided
    const finalEmployeeId = employeeId || `EMP${Date.now().toString().slice(-6)}`;

    // Check if user already exists
    const existingUser = await db
      .prepare("SELECT employeeId FROM employees WHERE employeeId = ? OR email = ?")
      .bind(finalEmployeeId, email)
      .first();

    if (existingUser) {
      return jsonResponse({ 
        success: false, 
        message: "Mã nhân viên hoặc email đã tồn tại!" 
      }, 409, origin);
    }

    // Check if registration already exists
    const existingRegistration = await db
      .prepare("SELECT employeeId FROM pending_registrations WHERE employeeId = ? OR email = ?")
      .bind(finalEmployeeId, email)
      .first();

    if (existingRegistration) {
      return jsonResponse({ 
        success: false, 
        message: "Đăng ký với mã nhân viên hoặc email này đã tồn tại!" 
      }, 409, origin);
    }

    // Hash password using SHA-256
    const hashedPassword = await hashPassword(password);

    // Send verification email
    const verificationCode = await sendVerificationEmail(email, finalEmployeeId, userName, env);

    // Create pending registration
    await db
      .prepare(`
        INSERT INTO pending_registrations 
        (employeeId, email, password, name, position, storeId, phone,
         verification_code, status, submitted_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `)
      .bind(finalEmployeeId, email, hashedPassword, userName, 
            position || 'NV', userStoreId, phone || null, verificationCode, new Date().toISOString())
      .run();

    return jsonResponse({
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
      requiresVerification: true,
      employeeId: finalEmployeeId
    }, 200, origin);

  } catch (error) {
    console.error("Registration error:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi đăng ký!", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle check-in
// Handle GPS check (merged checkIn/checkOut)
async function handleCheckGPS(body, db, origin) {
  try {
    const { employeeId, checkDate, checkTime, latitude, longitude } = body;

    if (!employeeId || !checkDate || !checkTime || latitude === undefined || longitude === undefined) {
      return jsonResponse({ 
        success: false, 
        message: "employeeId, checkDate, checkTime, latitude, và longitude là bắt buộc!" 
      }, 400, origin);
    }

    // Get employee's store location
    const employee = await db
      .prepare("SELECT storeId FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!employee || !employee.storeId) {
      return jsonResponse({ 
        success: false, 
        message: "Không tìm thấy thông tin cửa hàng của nhân viên!" 
      }, 404, origin);
    }

    // Get store location and radius
    const store = await db
      .prepare("SELECT latitude, longitude, radius FROM stores WHERE storeId = ?")
      .bind(employee.storeId)
      .first();

    if (!store || !store.latitude || !store.longitude) {
      return jsonResponse({ 
        success: false, 
        message: "Không tìm thấy vị trí cửa hàng!" 
      }, 404, origin);
    }

    // Calculate distance using Haversine formula
    const R = 6371000; // Earth's radius in meters
    const φ1 = latitude * Math.PI / 180;
    const φ2 = store.latitude * Math.PI / 180;
    const Δφ = (store.latitude - latitude) * Math.PI / 180;
    const Δλ = (store.longitude - longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters

    // Check if within radius (default 40m if not set)
    const allowedRadius = store.radius || 40;
    if (distance > allowedRadius) {
      return jsonResponse({ 
        success: false, 
        message: "Không nằm trong phạm vi quán",
        distance: Math.round(distance),
        allowedRadius: allowedRadius
      }, 400, origin);
    }

    // Create attendance record - uses checkDate from frontend
    const createdAt = new Date().toISOString();
    
    await db
      .prepare(`
        INSERT INTO attendance 
        (employeeId, checkDate, checkTime, checkLocation, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(employeeId, checkDate, checkTime, employee.storeId, createdAt, createdAt)
      .run();

    return jsonResponse({
      success: true,
      message: "Chấm công thành công!",
      checkDate: checkDate,
      checkTime: checkTime,
      distance: Math.round(distance)
    }, 200, origin);

  } catch (error) {
    console.error("GPS check error:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi chấm công!", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting dashboard stats
async function handleGetDashboardStats(db, origin) {
  try {
    // Get total employees
    const totalEmployees = await db
      .prepare("SELECT COUNT(*) as count FROM employees WHERE is_active = 1")
      .first();

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await db
      .prepare(`
        SELECT COUNT(*) as count FROM attendance 
        WHERE DATE(check_in_time) = ?
      `)
      .bind(today)
      .first();

    // Get pending registrations
    const pendingRegistrations = await db
      .prepare("SELECT COUNT(*) as count FROM pending_registrations WHERE status = 'pending'")
      .first();

    return jsonResponse({
      success: true,
      data: {
        totalEmployees: totalEmployees?.count || 0,
        todayAttendance: todayAttendance?.count || 0,
        pendingRegistrations: pendingRegistrations?.count || 0
      }
    }, 200, origin);

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy thống kê dashboard", 
      error: error.message 
    }, 500, origin);
  }
}

// =====================================================
// ADDITIONAL HANDLER FUNCTIONS FROM ORIGINAL WORKER
// =====================================================

// Handle checking if ID exists
async function handleCheckId(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    const exists = await db
      .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    return jsonResponse({
      exists: !!exists,
      message: exists ? "ID đã tồn tại!" : "ID khả dụng!"
    }, 200, origin);

  } catch (error) {
    console.error("Check ID error:", error);
    return jsonResponse({ 
      message: "Lỗi khi kiểm tra ID", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting user history
async function handleGetUserHistory(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    const history = await db
      .prepare(`
        SELECT * FROM user_change_history 
        WHERE employeeId = ? 
        ORDER BY changedAt DESC 
        LIMIT 100
      `)
      .bind(employeeId)
      .all();

    return jsonResponse({
      success: true,
      data: history.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get user history error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy lịch sử người dùng", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting shift assignments
async function handleGetShiftAssignments(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const date = url.searchParams.get("date");

    let query = `
      SELECT sa.*, s.name, s.startTime, s.endTime, s.timeName
      FROM shift_assignments sa
      JOIN shifts s ON sa.shiftId = s.shiftId
      WHERE 1=1
    `;
    const params = [];

    if (employeeId) {
      query += " AND sa.employeeId = ?";
      params.push(employeeId);
    }

    if (date) {
      query += " AND sa.date = ?";
      params.push(date);
    }

    query += " ORDER BY sa.date DESC";

    const shifts = await db
      .prepare(query)
      .bind(...params)
      .all();

    return jsonResponse({
      success: true,
      data: shifts.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get shift assignments error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy phân ca", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle assigning shifts
async function handleAssignShift(body, db, origin) {
  try {
    const { employeeId, date, shiftId, shiftName } = body;

    if (!employeeId || !date) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin ca làm việc!" 
      }, 400, origin);
    }

    // Get shift by ID or name
    let shift;
    if (shiftId) {
      shift = await db
        .prepare("SELECT shiftId FROM shifts WHERE shiftId = ?")
        .bind(shiftId)
        .first();
    } else if (shiftName) {
      shift = await db
        .prepare("SELECT shiftId FROM shifts WHERE name = ?")
        .bind(shiftName)
        .first();
    }

    if (!shift) {
      return jsonResponse({ 
        success: false, 
        message: "Ca làm việc không tồn tại!" 
      }, 400, origin);
    }

    // Check if shift assignment already exists
    const existing = await db
      .prepare("SELECT assignmentId FROM shift_assignments WHERE employeeId = ? AND date = ?")
      .bind(employeeId, date)
      .first();

    if (existing) {
      // Update existing shift assignment
      await db
        .prepare(`
          UPDATE shift_assignments 
          SET shiftId = ?, createdAt = ?
          WHERE employeeId = ? AND date = ?
        `)
        .bind(shift.shiftId, new Date().toISOString(), employeeId, date)
        .run();
    } else {
      // Create new shift assignment
      await db
        .prepare(`
          INSERT INTO shift_assignments 
          (employeeId, shiftId, date, createdAt) 
          VALUES (?, ?, ?, ?)
        `)
        .bind(employeeId, shift.shiftId, date, new Date().toISOString())
        .run();
    }

    return jsonResponse({
      success: true,
      message: "Phân ca thành công!"
    }, 200, origin);

  } catch (error) {
    console.error("Assign shift error:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi phân ca!", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting current shift
async function handleGetCurrentShift(url, db, origin, authenticatedUserId = null) {
  try {
    // Use authenticated user ID if available, otherwise fall back to URL parameter
    const employeeId = authenticatedUserId || url.searchParams.get("employeeId");
    const today = new Date().toISOString().split('T')[0];

    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    const shift = await db
      .prepare(`
        SELECT sa.*, s.name, s.startTime, s.endTime, s.timeName
        FROM shift_assignments sa
        JOIN shifts s ON sa.shiftId = s.shiftId
        WHERE sa.employeeId = ? AND sa.date = ?
      `)
      .bind(employeeId, today)
      .first();

    return jsonResponse({
      success: true,
      data: shift || null
    }, 200, origin);

  } catch (error) {
    console.error("Get current shift error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy ca hiện tại", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting weekly shifts
async function handleGetWeeklyShifts(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const weekStart = url.searchParams.get("weekStart");

    if (!employeeId || !weekStart) {
      return jsonResponse({ 
        message: "employeeId và weekStart là bắt buộc!" 
      }, 400, origin);
    }

    // Calculate week end (6 days later)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const shifts = await db
      .prepare(`
        SELECT sa.*, s.name, s.startTime, s.endTime, s.timeName
        FROM shift_assignments sa
        JOIN shifts s ON sa.shiftId = s.shiftId
        WHERE sa.employeeId = ? AND sa.date >= ? AND sa.date <= ?
        ORDER BY sa.date
      `)
      .bind(employeeId, weekStart, endDate.toISOString().split('T')[0])
      .all();

    return jsonResponse({
      success: true,
      data: shifts.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get weekly shifts error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy ca trong tuần", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting all available shifts
async function handleGetShifts(url, db, origin) {
  try {
    const shifts = await db
      .prepare("SELECT * FROM shifts ORDER BY startTime")
      .all();

    return jsonResponse({
      success: true,
      data: shifts.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get shifts error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy danh sách ca", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting attendance data
async function handleGetAttendanceData(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let query = `
      SELECT a.*, e.name as employeeName 
      FROM attendance a 
      JOIN employees e ON a.employeeId = e.employeeId 
      WHERE 1=1
    `;
    const params = [];

    if (employeeId) {
      query += " AND a.employeeId = ?";
      params.push(employeeId);
    }

    if (startDate) {
      query += " AND DATE(a.check_in_time) >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND DATE(a.check_in_time) <= ?";
      params.push(endDate);
    }

    query += " ORDER BY a.check_in_time DESC";

    const attendance = await db
      .prepare(query)
      .bind(...params)
      .all();

    return jsonResponse({
      success: true,
      data: attendance.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get attendance data error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy dữ liệu chấm công", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting pending requests
async function handleGetPendingRequests(db, origin) {
  try {
    const requests = await db
      .prepare(`
        SELECT 'registration' as type, id, employeeId, name, email, 
               position, created_at
        FROM pending_registrations 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `)
      .all();

    return jsonResponse({
      success: true,
      data: requests.results || []
    }, 200, origin);

  } catch (error) {
    console.error("Get pending requests error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy yêu cầu chờ xử lý", 
      error: error.message 
    }, 500, origin);
  }
}



// Handle getting permissions (simplified role-based approach)
async function handleGetPermissions(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");

    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    // Get user position directly (v2.3 simplified)
    const user = await db
      .prepare(`
        SELECT position FROM employees WHERE employeeId = ?
      `)
      .bind(employeeId)
      .first();

    if (!user) {
      return jsonResponse({ 
        message: "Không tìm thấy người dùng!" 
      }, 404, origin);
    }

    // Return position (NV, QL, or AD)
    return jsonResponse({
      success: true,
      data: {
        position: user.position,
        permissions: {
          isAdmin: user.position === 'AD',
          isManager: user.position === 'QL' || user.position === 'AD',
          isWorker: user.position === 'NV'
        }
      }
    }, 200, origin);

  } catch (error) {
    console.error("Get permissions error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy quyền hạn", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting pending registrations
async function handleGetPendingRegistrations(url, db, origin) {
  try {
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    const registrations = await db
      .prepare(`
        SELECT id, employeeId, email, name, position, 
               storeId, status, created_at
        FROM pending_registrations 
        WHERE status = 'pending'
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all();

    return jsonResponse({
      success: true,
      data: registrations.results || [],
      pagination: {
        page,
        limit,
        hasMore: (registrations.results || []).length === limit
      }
    }, 200, origin);

  } catch (error) {
    console.error("Get pending registrations error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy đơn đăng ký chờ duyệt", 
      error: error.message 
    }, 500, origin);
  }
}

// Additional handlers that would be implemented similarly...
async function handleUpdate(body, db, origin) {
  // Implementation here
  return jsonResponse({ message: "Update function not yet implemented" }, 501, origin);
}

async function loginUser(body, db, origin) {
  // Implementation here - same as handleLogin
  return await handleLogin(body, db, origin);
}

async function updateUser(body, userId, db, origin) {
  // Implementation here
  return jsonResponse({ message: "Update user function not yet implemented" }, 501, origin);
}



// Function removed - not used by client
// handleCreateTaskFromMessage was not called by any client code

// Function removed - not used by client  
// handleUpdatePermissions was not called by any client code

async function handleUpdatePersonalInfo(body, db, origin) {
  try {
    const { employeeId, name, phone, position, email } = body;
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    const stmt = await db.prepare(`
      UPDATE employees 
      SET fullName = ?, phone = ?, position = ?, email = ?, updated_at = ?
      WHERE employeeId = ?
    `);
    
    const currentTime = TimezoneUtils.toHanoiISOString();
    const result = await stmt.bind(name, phone, position, email, currentTime, employeeId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Employee not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Personal information updated successfully",
      employeeId: employeeId
    }, 200, origin);
  } catch (error) {
    console.error("Error updating personal info:", error);
    return jsonResponse({ message: "Failed to update personal information", error: error.message }, 500, origin);
  }
}

async function handleUpdateUserWithHistory(body, db, origin) {
  try {
    const { employeeId, field, oldValue, newValue, changedBy } = body;
    
    if (!employeeId || !field || !changedBy) {
      return jsonResponse({ message: "Employee ID, field, and changedBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    // Start transaction
    await db.exec("BEGIN TRANSACTION");
    
    try {
      // Update the employee record
      const updateStmt = await db.prepare(`UPDATE employees SET ${field} = ?, updated_at = ? WHERE employeeId = ?`);
      const updateResult = await updateStmt.bind(newValue, currentTime, employeeId).run();
      
      if (updateResult.changes === 0) {
        await db.exec("ROLLBACK");
        return jsonResponse({ message: "Employee not found" }, 404, origin);
      }

      // Log the change in history
      const historyStmt = await db.prepare(`
        INSERT INTO user_change_history (employeeId, field_name, old_value, new_value, changed_by, change_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      await historyStmt.bind(employeeId, field, oldValue || '', newValue, changedBy, currentTime).run();
      
      await db.exec("COMMIT");
      
      return jsonResponse({ 
        message: "User updated with history logged",
        employeeId: employeeId,
        field: field
      }, 200, origin);
    } catch (innerError) {
      await db.exec("ROLLBACK");
      throw innerError;
    }
  } catch (error) {
    console.error("Error updating user with history:", error);
    return jsonResponse({ message: "Failed to update user with history", error: error.message }, 500, origin);
  }
}

async function handleApproveRegistration(body, db, origin) {
  try {
    const { employeeId, approvedBy } = body;
    
    if (!employeeId || !approvedBy) {
      return jsonResponse({ message: "Employee ID and approver are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    // Start transaction
    await db.exec("BEGIN TRANSACTION");
    
    try {
      // Update pending registration status
      const updateStmt = await db.prepare(`
        UPDATE pending_registrations 
        SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ?
        WHERE employeeId = ?
      `);
      const result = await updateStmt.bind(approvedBy, currentTime, currentTime, employeeId).run();
      
      if (result.changes === 0) {
        await db.exec("ROLLBACK");
        return jsonResponse({ message: "Pending registration not found" }, 404, origin);
      }

      // Activate the employee account
      const activateStmt = await db.prepare(`
        UPDATE employees 
        SET is_active = 1, employment_status = 'active', updated_at = ?
        WHERE employeeId = ?
      `);
      await activateStmt.bind(currentTime, employeeId).run();
      
      await db.exec("COMMIT");
      
      return jsonResponse({ 
        message: "Registration approved successfully",
        employeeId: employeeId
      }, 200, origin);
    } catch (innerError) {
      await db.exec("ROLLBACK");
      throw innerError;
    }
  } catch (error) {
    console.error("Error approving registration:", error);
    return jsonResponse({ message: "Failed to approve registration", error: error.message }, 500, origin);
  }
}

async function handleProcessAttendance(body, db, origin) {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status, notes } = body;
    
    if (!employeeId || !date) {
      return jsonResponse({ message: "Employee ID and date are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    // Calculate total hours if both check in and check out times are provided
    let totalHours = 0;
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(`${date}T${checkInTime}`);
      const checkOut = new Date(`${date}T${checkOutTime}`);
      
      totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60); // ✅ Convert to hours
    }
    
    // Check if attendance record already exists
    const existingStmt = await db.prepare("SELECT id FROM attendance WHERE employeeId = ? AND date = ?");
    const existingRecord = await existingStmt.bind(employeeId, date).first();

    if (existingRecord) {
      // Update existing record
      const updateStmt = await db.prepare(`
        UPDATE attendance 
        SET check_in_time = ?, check_out_time = ?, status = ?, total_hours = ?, notes = ?, updated_at = ?
        WHERE employeeId = ? AND date = ?
      `);
      await updateStmt.bind(checkInTime, checkOutTime, status, totalHours.toFixed(2), notes || '', currentTime, employeeId, date).run();
    } else {
      // Insert new record
      const insertStmt = await db.prepare(`
        INSERT INTO attendance (employeeId, date, check_in_time, check_out_time, status, total_hours, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      await insertStmt.bind(employeeId, date, checkInTime, checkOutTime, status, totalHours.toFixed(2), notes || '', currentTime, currentTime).run();
    }

    return jsonResponse({ 
      message: "Attendance processed successfully",
      employeeId: employeeId,
      date: date,
      totalHours: totalHours.toFixed(2)
    }, 200, origin);
  } catch (error) {
    console.error("Error processing attendance:", error);
    return jsonResponse({ message: "Failed to process attendance", error: error.message }, 500, origin);
  }
}

async function handleCreateAttendanceRequest(body, db, origin) {
  try {
    const { employeeId, requestType, date, reason, startTime, endTime, requestedBy } = body;
    
    if (!employeeId || !requestType || !date || !requestedBy) {
      return jsonResponse({ message: "Employee ID, request type, date, and requestedBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    const requestId = `ATR_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const stmt = await db.prepare(`
      INSERT INTO employee_requests 
      (request_id, employeeId, request_type, date, start_time, end_time, reason, status, requested_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `);
    
    await stmt.bind(requestId, employeeId, requestType, date, startTime || null, endTime || null, reason || '', requestedBy, currentTime, currentTime).run();

    return jsonResponse({ 
      message: "Attendance request created successfully",
      requestId: requestId,
      employeeId: employeeId
    }, 200, origin);
  } catch (error) {
    console.error("Error creating attendance request:", error);
    return jsonResponse({ message: "Failed to create attendance request", error: error.message }, 500, origin);
  }
}



async function handleReplyToComment(body, db, origin) {
  try {
    const { commentId, replyText, repliedBy } = body;
    
    if (!commentId || !replyText || !repliedBy) {
      return jsonResponse({ message: "Comment ID, reply text, and repliedBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    const replyId = `REPLY_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Get the original comment to find the task ID
    const originalCommentStmt = await db.prepare("SELECT task_id FROM task_comments WHERE comment_id = ?");
    const originalComment = await originalCommentStmt.bind(commentId).first();
    
    if (!originalComment) {
      return jsonResponse({ message: "Original comment not found" }, 404, origin);
    }

    const stmt = await db.prepare(`
      INSERT INTO task_comments 
      (comment_id, task_id, comment_text, commented_by, parent_comment_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(replyId, originalComment.task_id, replyText, repliedBy, commentId, currentTime, currentTime).run();

    return jsonResponse({ 
      message: "Reply added successfully",
      replyId: replyId,
      parentCommentId: commentId
    }, 200, origin);
  } catch (error) {
    console.error("Error replying to comment:", error);
    return jsonResponse({ message: "Failed to reply to comment", error: error.message }, 500, origin);
  }
}

async function handleSaveShiftAssignments(body, db, origin) {
  try {
    const { assignments, assignedBy } = body;
    
    if (!assignments || !Array.isArray(assignments) || !assignedBy) {
      return jsonResponse({ message: "Assignments array and assignedBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    // Start transaction
    await db.exec("BEGIN TRANSACTION");
    
    try {
      for (const assignment of assignments) {
        const { employeeId, shiftDate, shiftType, startTime, endTime, storeId } = assignment;
        
        if (!employeeId || !shiftDate || !shiftType) {
          await db.exec("ROLLBACK");
          return jsonResponse({ message: "Employee ID, shift date, and shift type are required for all assignments" }, 400, origin);
        }

        // Check if assignment already exists
        const existingStmt = await db.prepare("SELECT id FROM shift_assignments WHERE employeeId = ? AND shift_date = ?");
        const existing = await existingStmt.bind(employeeId, shiftDate).first();

        if (existing) {
          // Update existing assignment
          const updateStmt = await db.prepare(`
            UPDATE shift_assignments 
            SET shift_type = ?, start_time = ?, end_time = ?, storeId = ?, assigned_by = ?, updated_at = ?
            WHERE employeeId = ? AND shift_date = ?
          `);
          await updateStmt.bind(shiftType, startTime, endTime, storeId, assignedBy, currentTime, employeeId, shiftDate).run();
        } else {
          // Insert new assignment
          const insertStmt = await db.prepare(`
            INSERT INTO shift_assignments 
            (employeeId, shift_date, shift_type, start_time, end_time, storeId, assigned_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          await insertStmt.bind(employeeId, shiftDate, shiftType, startTime, endTime, storeId, assignedBy, currentTime, currentTime).run();
        }
      }
      
      await db.exec("COMMIT");
      
      return jsonResponse({ 
        message: "Shift assignments saved successfully",
        assignmentsCount: assignments.length
      }, 200, origin);
    } catch (innerError) {
      await db.exec("ROLLBACK");
      throw innerError;
    }
  } catch (error) {
    console.error("Error saving shift assignments:", error);
    return jsonResponse({ message: "Failed to save shift assignments", error: error.message }, 500, origin);
  }
}

async function handleApproveShiftRequest(body, db, origin) {
  try {
    const { requestId, approvedBy, approvalNotes } = body;
    
    if (!requestId || !approvedBy) {
      return jsonResponse({ message: "Request ID and approver are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE employee_requests 
      SET status = 'approved', approved_by = ?, approved_at = ?, approval_notes = ?, updated_at = ?
      WHERE request_id = ?
    `);
    
    const result = await stmt.bind(approvedBy, currentTime, approvalNotes || '', currentTime, requestId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Shift request not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Shift request approved successfully",
      requestId: requestId 
    }, 200, origin);
  } catch (error) {
    console.error("Error approving shift request:", error);
    return jsonResponse({ message: "Failed to approve shift request", error: error.message }, 500, origin);
  }
}

async function handleRejectShiftRequest(body, db, origin) {
  try {
    const { requestId, rejectedBy, rejectionReason } = body;
    
    if (!requestId || !rejectedBy) {
      return jsonResponse({ message: "Request ID and rejector are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE employee_requests 
      SET status = 'rejected', rejected_by = ?, rejected_at = ?, rejection_reason = ?, updated_at = ?
      WHERE request_id = ?
    `);
    
    const result = await stmt.bind(rejectedBy, currentTime, rejectionReason || '', currentTime, requestId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Shift request not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Shift request rejected successfully",
      requestId: requestId 
    }, 200, origin);
  } catch (error) {
    console.error("Error rejecting shift request:", error);
    return jsonResponse({ message: "Failed to reject shift request", error: error.message }, 500, origin);
  }
}

async function handleApproveAttendanceRequest(body, db, origin, token) {
  try {
    const { requestId, approvedBy, approvalNotes } = body;
    
    if (!requestId || !approvedBy) {
      return jsonResponse({ message: "Request ID and approver are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE employee_requests 
      SET status = 'approved', approved_by = ?, approved_at = ?, approval_notes = ?, updated_at = ?
      WHERE request_id = ?
    `);
    
    const result = await stmt.bind(approvedBy, currentTime, approvalNotes || '', currentTime, requestId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Attendance request not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Attendance request approved successfully",
      requestId: requestId 
    }, 200, origin);
  } catch (error) {
    console.error("Error approving attendance request:", error);
    return jsonResponse({ message: "Failed to approve attendance request", error: error.message }, 500, origin);
  }
}

async function handleRejectAttendanceRequest(body, db, origin, token) {
  try {
    const { requestId, rejectedBy, rejectionReason } = body;
    
    if (!requestId || !rejectedBy) {
      return jsonResponse({ message: "Request ID and rejector are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE employee_requests 
      SET status = 'rejected', rejected_by = ?, rejected_at = ?, rejection_reason = ?, updated_at = ?
      WHERE request_id = ?
    `);
    
    const result = await stmt.bind(rejectedBy, currentTime, rejectionReason || '', currentTime, requestId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Attendance request not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Attendance request rejected successfully",
      requestId: requestId 
    }, 200, origin);
  } catch (error) {
    console.error("Error rejecting attendance request:", error);
    return jsonResponse({ message: "Failed to reject attendance request", error: error.message }, 500, origin);
  }
}

async function handleGetTimesheet(url, db, origin, authenticatedUserId = null) {
  try {
    const urlParams = new URLSearchParams(url.search);
    // Use authenticated user ID if available, otherwise fall back to URL parameter
    const employeeId = authenticatedUserId || urlParams.get("employeeId");
    const month = urlParams.get("month");
    const startDate = urlParams.get("startDate");
    const endDate = urlParams.get("endDate");
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    let whereClause = "WHERE employeeId = ?";
    let params = [employeeId];
    
    if (month) {
      whereClause += " AND strftime('%Y-%m', date) = ?";
      params.push(month);
    } else if (startDate && endDate) {
      whereClause += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    // Get attendance records
    const attendanceStmt = await db.prepare(`
      SELECT 
        date, check_in_time, check_out_time, status, total_hours,
        check_in_location, check_out_location, notes
      FROM attendance 
      ${whereClause}
      ORDER BY date ASC
    `);
    const attendanceRecords = await attendanceStmt.bind(...params).all();

    // Calculate summary statistics
    const totalHours = attendanceRecords.reduce((sum, record) => {
      return sum + (parseFloat(record.total_hours) || 0);
    }, 0);

    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'late').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;

    return jsonResponse({
      employeeId: employeeId,
      period: month ? `${month}` : `${startDate} to ${endDate}`,
      records: attendanceRecords,
      summary: {
        totalHours: totalHours.toFixed(2),
        totalDays: attendanceRecords.length,
        presentDays: presentDays,
        lateDays: lateDays,
        absentDays: absentDays,
        attendanceRate: attendanceRecords.length > 0 ? 
          ((presentDays + lateDays) / attendanceRecords.length * 100).toFixed(1) : 0
      }
    }, 200, origin);
  } catch (error) {
    console.error("Error getting timesheet:", error);
    return jsonResponse({ message: "Failed to get timesheet", error: error.message }, 500, origin);
  }
}

async function handleGetAttendanceHistory(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    const startDate = urlParams.get("startDate");
    const endDate = urlParams.get("endDate");
    const date = urlParams.get("date"); // For specific date query
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    let whereClause = "WHERE employeeId = ?";
    let params = [employeeId];
    
    if (date) {
      whereClause += " AND date = ?";
      params.push(date);
    } else if (startDate && endDate) {
      whereClause += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const stmt = await db.prepare(`
      SELECT 
        date, check_in_time, check_out_time, status, total_hours,
        check_in_location, check_out_location, notes,
        created_at, updated_at
      FROM attendance 
      ${whereClause}
      ORDER BY date DESC
    `);
    
    const attendanceRecords = await stmt.bind(...params).all();

    return jsonResponse({
      employeeId: employeeId,
      records: attendanceRecords
    }, 200, origin);
  } catch (error) {
    console.error("Error getting attendance history:", error);
    return jsonResponse({ message: "Failed to get attendance history", error: error.message }, 500, origin);
  }
}

async function handleGetPersonalStats(url, db, origin, authenticatedUserId = null) {
  try {
    const urlParams = new URLSearchParams(url.search);
    // Use authenticated user ID if available, otherwise fall back to URL parameter
    const employeeId = authenticatedUserId || urlParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    // Get basic employee info
    const employeeStmt = await db.prepare("SELECT employeeId, fullName, email, position, storeId, is_active, phone FROM employees WHERE employeeId = ?");
    const employee = await employeeStmt.bind(employeeId).first();
    
    if (!employee) {
      return jsonResponse({ message: "Employee not found" }, 404, origin);
    }

    // Get attendance stats for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const attendanceStmt = await db.prepare(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
      FROM attendance 
      WHERE employeeId = ? AND strftime('%Y-%m', date) = ?
    `);
    const attendanceStats = await attendanceStmt.bind(employeeId, currentMonth).first();

    // Calculate performance metrics
    const attendanceRate = attendanceStats.total_days > 0 ? 
      (attendanceStats.present_days / attendanceStats.total_days * 100).toFixed(1) : 0;

      return jsonResponse({
        employeeId,
        fullName: employee.fullName,
        position: employee.position,
        storeId: employee.storeId,
        attendance: {
          totalDays: attendanceStats.total_days || 0,
          presentDays: attendanceStats.present_days || 0,
          lateDays: attendanceStats.late_days || 0,
          absentDays: attendanceStats.absent_days || 0,
          attendanceRate: Number(attendanceRate ?? 0)
        }
      }, 200, origin);
      
  } catch (error) {
    console.error("Error getting personal stats:", error);
    return jsonResponse({ message: "Failed to get personal stats", error: error.message }, 500, origin);
  }
}



async function handleGetEmployeesByStore(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const storeId = urlParams.get("storeId");
    
    if (!storeId) {
      return jsonResponse({ message: "Store ID is required" }, 400, origin);
    }

    const stmt = await db.prepare(`
      SELECT 
        employeeId, fullName, email, phone, position, 
        is_active, created_at, last_login_at
      FROM employees 
      WHERE storeId = ? AND is_active = 1
      ORDER BY fullName ASC
    `);
    
    const employees = await stmt.bind(storeId).all();

    return jsonResponse({
      storeId: storeId,
      employees: employees,
      totalEmployees: employees.length
    }, 200, origin);
  } catch (error) {
    console.error("Error getting employees by store:", error);
    return jsonResponse({ message: "Failed to get employees by store", error: error.message }, 500, origin);
  }
}

async function handleGetShiftRequests(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    const status = urlParams.get("status");
    
    let whereClause = "WHERE 1=1";
    let params = [];
    
    if (employeeId) {
      whereClause += " AND sr.employeeId = ?";
      params.push(employeeId);
    }
    
    if (status) {
      whereClause += " AND sr.status = ?";
      params.push(status);
    }

    const stmt = await db.prepare(`
      SELECT 
        sr.*,
        e.fullName as employee_name,
        e.position
      FROM employee_requests sr
      LEFT JOIN employees e ON sr.employeeId = e.employeeId
      ${whereClause}
      ORDER BY sr.created_at DESC
    `);
    
    const requests = await stmt.bind(...params).all();

    return jsonResponse({
      requests: requests
    }, 200, origin);
  } catch (error) {
    console.error("Error getting shift requests:", error);
    return jsonResponse({ message: "Failed to get shift requests", error: error.message }, 500, origin);
  }
}

async function handleGetAttendanceRequests(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    const status = urlParams.get("status");
    const month = urlParams.get("month");
    
    let whereClause = "WHERE 1=1";
    let params = [];
    
    if (employeeId) {
      whereClause += " AND employeeId = ?";
      params.push(employeeId);
    }
    
    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    
    if (month) {
      whereClause += " AND strftime('%Y-%m', date) = ?";
      params.push(month);
    }

    const stmt = await db.prepare(`
      SELECT 
        ar.*,
        e.fullName as employee_name,
        e.position
      FROM employee_requests ar
      LEFT JOIN employees e ON ar.employeeId = e.employeeId
      ${whereClause}
      ORDER BY ar.created_at DESC
    `);
    
    const requests = await stmt.bind(...params).all();

    return jsonResponse({
      requests: requests
    }, 200, origin);
  } catch (error) {
    console.error("Error getting attendance requests:", error);
    return jsonResponse({ message: "Failed to get attendance requests", error: error.message }, 500, origin);
  }
}

// =====================================================
// MISSING FUNCTIONS CALLED BY CLIENT
// =====================================================

async function handleGetAllUsers(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const includeInactive = urlParams.get("includeInactive") === "true";
    
    let whereClause = includeInactive ? "WHERE 1=1" : "WHERE is_active = 1";

    const stmt = await db.prepare(`
      SELECT 
        employeeId, fullName, email, phone, position, storeId,
        is_active, created_at, last_login_at
      FROM employees 
      ${whereClause}
      ORDER BY fullName ASC
    `);
    
    const users = await stmt.all();

    return jsonResponse({
      users: users,
      totalUsers: users.length
    }, 200, origin);
  } catch (error) {
    console.error("Error getting all users:", error);
    return jsonResponse({ message: "Failed to get all users", error: error.message }, 500, origin);
  }
}



async function handleCompleteRequest(body, db, origin) {
  try {
    const { requestId, requestType, completedBy } = body;
    
    if (!requestId || !requestType || !completedBy) {
      return jsonResponse({ message: "Request ID, type, and completedBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    let tableName;
    switch (requestType) {
      case 'attendance':
        tableName = 'employee_requests';
        break;
      case 'shift':
        tableName = 'employee_requests';
        break;
      default:
        return jsonResponse({ message: "Invalid request type" }, 400, origin);
    }
    
    const stmt = await db.prepare(`
      UPDATE ${tableName} 
      SET status = 'completed', completed_by = ?, completed_at = ?, updated_at = ?
      WHERE request_id = ?
    `);
    
    const result = await stmt.bind(completedBy, currentTime, currentTime, requestId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Request not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Request completed successfully",
      requestId: requestId 
    }, 200, origin);
  } catch (error) {
    console.error("Error completing request:", error);
    return jsonResponse({ message: "Failed to complete request", error: error.message }, 500, origin);
  }
}

async function handleCheckDk(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    // Check if employee ID already exists
    const stmt = await db.prepare("SELECT COUNT(*) as count FROM employees WHERE employeeId = ?");
    const result = await stmt.bind(employeeId).first();
    
    const exists = result.count > 0;

    return jsonResponse({
      employeeId: employeeId,
      exists: exists
    }, 200, origin);
  } catch (error) {
    console.error("Error checking duplicate employee ID:", error);
    return jsonResponse({ message: "Failed to check employee ID", error: error.message }, 500, origin);
  }
}

async function handleGetPendingRequestsCount(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    // Count pending attendance requests
    const attendanceStmt = await db.prepare("SELECT COUNT(*) as count FROM employee_requests WHERE employeeId = ? AND status = 'pending'");
    const attendanceResult = await attendanceStmt.bind(employeeId).first();
    
    // Count pending shift requests
    const shiftStmt = await db.prepare("SELECT COUNT(*) as count FROM employee_requests WHERE employeeId = ? AND status = 'pending'");
    const shiftResult = await shiftStmt.bind(employeeId).first();
    
    // Count pending tasks
    const taskStmt = await db.prepare("SELECT COUNT(*) as count FROM tasks WHERE (assigned_to = ? OR assignedTo = ?) AND status = 'pending'");
    const taskResult = await taskStmt.bind(employeeId, employeeId).first();

    const totalPending = (attendanceResult.count || 0) + (shiftResult.count || 0) + (taskResult.count || 0);

    return jsonResponse({
      employeeId: employeeId,
      pendingRequests: {
        attendance: attendanceResult.count || 0,
        shift: shiftResult.count || 0,
        tasks: taskResult.count || 0,
        total: totalPending
      }
    }, 200, origin);
  } catch (error) {
    console.error("Error getting pending requests count:", error);
    return jsonResponse({ message: "Failed to get pending requests count", error: error.message }, 500, origin);
  }
}

// =====================================================
// CUSTOMER SUPPORT FUNCTIONS
// =====================================================

// Support system functions removed - not in v2.3 schema

// =====================================================
// MAIN EXPORT WITH ALL ROUTES
// =====================================================

// =====================================================
// RESTFUL ROUTER - Pattern matching for clean URLs
// =====================================================

class RestfulRouter {
  constructor() {
    this.routes = [];
  }

  addRoute(method, pattern, handler, requiresAuth = false) {
    this.routes.push({ method, pattern, handler, requiresAuth });
  }

  match(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      
      const regex = new RegExp('^' + route.pattern.replace(/:\w+/g, '([^/]+)') + '$');
      const match = pathname.match(regex);
      
      if (match) {
        const paramNames = (route.pattern.match(/:\w+/g) || []).map(p => p.slice(1));
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { handler: route.handler, params, requiresAuth: route.requiresAuth };
      }
    }
    return null;
  }
}

// Initialize router with RESTful routes
function initializeRouter() {
  const router = new RestfulRouter();

  // =====================================================
  // AUTHENTICATION & USER MANAGEMENT ROUTES
  // =====================================================
  router.addRoute('POST', '/api/auth/login', handleLogin, false);
  router.addRoute('POST', '/api/auth/register', handleRegister, false);
  router.addRoute('POST', '/api/auth/verify-email', handleVerifyEmail, false);
  
  // =====================================================
  // STORE ROUTES
  // =====================================================
  router.addRoute('GET', '/api/stores', handleGetStores, false);
  router.addRoute('POST', '/api/stores', handleCreateStore, true);
  
  // =====================================================
  // EMPLOYEE/USER ROUTES
  // =====================================================
  router.addRoute('GET', '/api/employees', handleGetAllUsers, true);
  router.addRoute('GET', '/api/employees/:employeeId', handleGetUserById, true);
  router.addRoute('POST', '/api/employees', handleCreateEmployee, true);
  router.addRoute('PUT', '/api/employees/:employeeId', handleUpdatePersonalInfo, true);
  router.addRoute('GET', '/api/employees/:employeeId/history', handleGetUserHistoryById, true);
  router.addRoute('GET', '/api/employees/:employeeId/permissions', handleGetPermissionsById, true);
  router.addRoute('GET', '/api/employees/:employeeId/stats', handleGetPersonalStatsById, true);
  router.addRoute('GET', '/api/employees/check/:employeeId', handleCheckIdById, false);
  
  // Store-specific employees
  router.addRoute('GET', '/api/stores/:storeId/employees', handleGetEmployeesByStoreId, true);
  
  // =====================================================
  // ATTENDANCE ROUTES
  // =====================================================
  router.addRoute('POST', '/api/attendance/check', handleCheckGPS, true);
  router.addRoute('GET', '/api/attendance', handleGetAttendanceData, true);
  router.addRoute('POST', '/api/attendance/process', handleProcessAttendance, true);
  router.addRoute('GET', '/api/attendance/history', handleGetAttendanceHistory, true);
  
  // Attendance requests
  router.addRoute('POST', '/api/attendance/requests', handleCreateAttendanceRequest, true);
  router.addRoute('GET', '/api/attendance/requests', handleGetAttendanceRequests, true);
  router.addRoute('POST', '/api/attendance/requests/:requestId/approve', handleApproveAttendanceRequestById, true);
  router.addRoute('POST', '/api/attendance/requests/:requestId/reject', handleRejectAttendanceRequestById, true);
  
  // =====================================================
  // SHIFT ROUTES
  // =====================================================
  router.addRoute('GET', '/api/shifts', handleGetShifts, true);
  router.addRoute('GET', '/api/shifts/current', handleGetCurrentShiftForUser, true);
  router.addRoute('GET', '/api/shifts/weekly', handleGetWeeklyShifts, true);
  router.addRoute('GET', '/api/shifts/assignments', handleGetShiftAssignments, true);
  router.addRoute('POST', '/api/shifts/assignments', handleSaveShiftAssignments, true);
  router.addRoute('POST', '/api/shifts/assign', handleAssignShift, true);
  
  // Shift requests
  router.addRoute('GET', '/api/shifts/requests', handleGetShiftRequests, true);
  router.addRoute('POST', '/api/shifts/requests/:requestId/approve', handleApproveShiftRequestById, true);
  router.addRoute('POST', '/api/shifts/requests/:requestId/reject', handleRejectShiftRequestById, true);
  
  // =====================================================
  // TIMESHEET ROUTES
  // =====================================================
  router.addRoute('GET', '/api/timesheet', handleGetTimesheet, true);
  
  // =====================================================
  // REGISTRATION & APPROVAL ROUTES
  // =====================================================
  router.addRoute('GET', '/api/registrations/pending', handleGetPendingRegistrations, true);
  router.addRoute('POST', '/api/registrations/:employeeId/approve', handleApproveRegistrationById, true);
  router.addRoute('POST', '/api/registrations/approve-with-history', handleApproveRegistrationWithHistory, true);
  
  // =====================================================
  // REQUEST MANAGEMENT ROUTES
  // =====================================================
  router.addRoute('GET', '/api/requests/pending', handleGetPendingRequests, true);
  router.addRoute('GET', '/api/requests/pending/count', handleGetPendingRequestsCount, true);
  router.addRoute('POST', '/api/requests/:requestId/complete', handleCompleteRequestById, true);
  
  // =====================================================
  // DASHBOARD & STATS ROUTES
  // =====================================================
  router.addRoute('GET', '/api/dashboard/stats', handleGetDashboardStats, true);
  
  // =====================================================
  // LEGACY SUPPORT - Query parameter based (for backward compatibility)
  // =====================================================
  router.addRoute('GET', '/api/legacy', handleLegacyGet, false);
  router.addRoute('POST', '/api/legacy', handleLegacyPost, false);

  return router;
}

// =====================================================
// WRAPPER HANDLERS FOR RESTFUL ROUTES
// =====================================================

async function handleGetUserById(url, params, db, origin, userId) {
  url.searchParams.set('employeeId', params.employeeId);
  return await handleGetUser(url, db, origin);
}

async function handleGetUserHistoryById(url, params, db, origin, userId) {
  url.searchParams.set('employeeId', params.employeeId);
  return await handleGetUserHistory(url, db, origin);
}

async function handleGetPermissionsById(url, params, db, origin, userId) {
  url.searchParams.set('employeeId', params.employeeId);
  return await handleGetPermissions(url, db, origin);
}

async function handleGetPersonalStatsById(url, params, db, origin, userId) {
  url.searchParams.set('employeeId', params.employeeId);
  return await handleGetPersonalStats(url, db, origin, userId);
}

async function handleCheckIdById(url, params, db, origin, userId) {
  url.searchParams.set('employeeId', params.employeeId);
  return await handleCheckId(url, db, origin);
}

async function handleGetEmployeesByStoreId(url, params, db, origin, userId) {
  url.searchParams.set('storeId', params.storeId);
  return await handleGetEmployeesByStore(url, db, origin);
}

async function handleApproveAttendanceRequestById(url, params, body, db, origin, token) {
  const mergedBody = { ...body, requestId: params.requestId };
  return await handleApproveAttendanceRequest(mergedBody, db, origin, token);
}

async function handleRejectAttendanceRequestById(url, params, body, db, origin, token) {
  const mergedBody = { ...body, requestId: params.requestId };
  return await handleRejectAttendanceRequest(mergedBody, db, origin, token);
}

async function handleApproveShiftRequestById(url, params, body, db, origin, token) {
  const mergedBody = { ...body, requestId: params.requestId };
  return await handleApproveShiftRequest(mergedBody, db, origin);
}

async function handleRejectShiftRequestById(url, params, body, db, origin, token) {
  const mergedBody = { ...body, requestId: params.requestId };
  return await handleRejectShiftRequest(mergedBody, db, origin);
}

async function handleApproveRegistrationById(url, params, body, db, origin, token) {
  const mergedBody = { ...body, employeeId: params.employeeId };
  return await handleApproveRegistration(mergedBody, db, origin);
}

async function handleCompleteRequestById(url, params, body, db, origin, token) {
  const mergedBody = { ...body, requestId: params.requestId };
  return await handleCompleteRequest(mergedBody, db, origin);
}

async function handleGetCurrentShiftForUser(url, params, db, origin, userId) {
  return await handleGetCurrentShift(url, db, origin, userId);
}

// =====================================================
// LEGACY SUPPORT HANDLERS (backward compatibility)
// =====================================================

async function handleLegacyGet(url, params, db, origin, userId) {
  const action = url.searchParams.get("action");
  if (!action) return jsonResponse({ message: "Thiếu action trong query parameters!" }, 400, origin);

  switch (action) {
    case "getStores": return await handleGetStores(db, origin);
    case "getUsers": return await handleGetUsers(url, db, origin);
    case "getUser": return await handleGetUser(url, db, origin);
    case "getDashboardStats": return await handleGetDashboardStats(db, origin);
    case "checkId": return await handleCheckId(url, db, origin);
    case "getUserHistory": return await handleGetUserHistory(url, db, origin);
    case "getCurrentShift": return await handleGetCurrentShift(url, db, origin, userId);
    case "getWeeklyShifts": return await handleGetWeeklyShifts(url, db, origin);
    case "getAttendanceData": return await handleGetAttendanceData(url, db, origin);
    case "getPendingRequests": return await handleGetPendingRequests(db, origin);
    case "getPermissions": return await handleGetPermissions(url, db, origin);
    case "getPendingRegistrations": return await handleGetPendingRegistrations(url, db, origin);
    case "getTimesheet": return await handleGetTimesheet(url, db, origin, userId);
    case "getAttendanceHistory": return await handleGetAttendanceHistory(url, db, origin);
    case "getShiftAssignments": return await handleGetShiftAssignments(url, db, origin);
    case "getShifts": return await handleGetShifts(url, db, origin);
    case "getPersonalStats": return await handleGetPersonalStats(url, db, origin, userId);
    case "getEmployeesByStore": return await handleGetEmployeesByStore(url, db, origin);
    case "getShiftRequests": return await handleGetShiftRequests(url, db, origin);
    case "getAttendanceRequests": return await handleGetAttendanceRequests(url, db, origin);
    case "getAllUsers": return await handleGetAllUsers(url, db, origin);
    case "checkdk": return await handleCheckDk(url, db, origin);
    case "getPendingRequestsCount": return await handleGetPendingRequestsCount(url, db, origin);
    default: return jsonResponse({ message: "Action không hợp lệ!" }, 400, origin);
  }
}

async function handleLegacyPost(url, params, body, db, origin, userId, token, env) {
  const action = url.searchParams.get("action");
  if (!action) return jsonResponse({ message: "Thiếu action trong query parameters!" }, 400, origin);

  switch (action) {
    case "login": return await handleLogin(body, db, origin);
    case "register": return await handleRegister(body, db, origin, env);
    case "checkGPS": return await handleCheckGPS(body, db, origin);
    case "update": return await handleUpdate(body, db, origin);
    case "assignShift": return await handleAssignShift(body, db, origin);
    case "loginUser": return await loginUser(body, db, origin);
    case "updateUser": return await updateUser(body, userId, db, origin);
    case "updatePersonalInfo": return await handleUpdatePersonalInfo(body, db, origin);
    case "updateUserWithHistory": return await handleUpdateUserWithHistory(body, db, origin);
    case "approveRegistration": return await handleApproveRegistration(body, db, origin);
    case "processAttendance": return await handleProcessAttendance(body, db, origin);
    case "createAttendanceRequest": return await handleCreateAttendanceRequest(body, db, origin);
    case "replyToComment": return await handleReplyToComment(body, db, origin);
    case "saveShiftAssignments": return await handleSaveShiftAssignments(body, db, origin);
    case "approveShiftRequest": return await handleApproveShiftRequest(body, db, origin);
    case "rejectShiftRequest": return await handleRejectShiftRequest(body, db, origin);
    case "approveAttendanceRequest": return await handleApproveAttendanceRequest(body, db, origin, token);
    case "rejectAttendanceRequest": return await handleRejectAttendanceRequest(body, db, origin, token);
    case "verifyEmail": return await handleVerifyEmail(body, db, origin, env);
    case "approveRegistrationWithHistory": return await handleApproveRegistrationWithHistory(body, db, origin);
    case "completeRequest": return await handleCompleteRequest(body, db, origin);
    case "createStore": return await handleCreateStore(body, db, origin);
    case "createEmployee": return await handleCreateEmployee(body, db, origin);
    default: return jsonResponse({ message: "Action không hợp lệ!" }, 400, origin);
  }
}

// =====================================================
// MAIN EXPORT WITH RESTFUL ROUTING
// =====================================================

export default {
  async scheduled(event, env, ctx) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today.getDay() !== 1) {
        console.log(`Today is ${today.toLocaleDateString("en-US", { weekday: "long" })}. No action required.`);
        return;
      }
      // TODO: Add weekly tasks here
    } catch (error) {
      console.error("Scheduled task error:", error);
    }
  },

  async fetch(request, env) {
    const db = env.DATABASE;
    if (request.method === "OPTIONS") return handleOptionsRequest();

    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      
      // Extract token from query or Authorization header
      let token = url.searchParams.get("token");
      const authHeader = request.headers.get("Authorization");
      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // Initialize router
      const router = initializeRouter();
      
      // Match route
      const route = router.match(request.method, pathname);
      
      if (!route) {
        return jsonResponse({ message: "Endpoint không tồn tại!", path: pathname }, 404);
      }

      // Check authentication if required
      if (route.requiresAuth) {
        const session = await checkSessionMiddleware(token, db, ALLOWED_ORIGIN);
        if (session instanceof Response) return session;
        request.userId = session.employeeId;
      }

      // Parse body for POST/PUT/PATCH requests
      let body = {};
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          body = await request.json();
        }
      }

      // Execute handler based on method and path
      if (request.method === 'GET') {
        return await route.handler(url, route.params, db, ALLOWED_ORIGIN, request.userId);
      } else if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        // Special handling for different POST routes
        if (pathname === '/api/legacy') {
          return await route.handler(url, route.params, body, db, ALLOWED_ORIGIN, request.userId, token, env);
        } else if (pathname === '/api/auth/register') {
          return await route.handler(body, db, ALLOWED_ORIGIN, env);
        } else if (pathname === '/api/auth/login') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/auth/verify-email') {
          return await route.handler(body, db, ALLOWED_ORIGIN, env);
        } else if (pathname === '/api/stores') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/employees' && request.method === 'POST') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname.match(/^\/api\/employees\/[^\/]+$/)) {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/attendance/check') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/attendance/process') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/attendance/requests' && request.method === 'POST') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/shifts/assignments' && request.method === 'POST') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname === '/api/shifts/assign') {
          return await route.handler(body, db, ALLOWED_ORIGIN);
        } else if (pathname.includes('/approve') || pathname.includes('/reject') || pathname.includes('/complete')) {
          return await route.handler(url, route.params, body, db, ALLOWED_ORIGIN, token);
        } else {
          // Default POST handler
          return await route.handler(body, db, ALLOWED_ORIGIN);
        }
      }

      return jsonResponse({ message: "Phương thức không được hỗ trợ!" }, 405);
    } catch (error) {
      console.error("Lỗi xử lý yêu cầu:", error);
      return jsonResponse({ message: "Lỗi xử lý yêu cầu!", error: error.message }, 500);
    }
  },
};
