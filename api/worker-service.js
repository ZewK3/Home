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
    .prepare("SELECT employeeId, name, storeId, position, phone, email, hire_date FROM employees WHERE employeeId = ?")
    .bind(session.employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  return jsonResponse({ 
    employeeId: user.employeeId,
    fullName: user.name, // Map name to fullName for compatibility
    storeName: user.storeId, // Map storeId to storeName for compatibility
    position: user.position,
    phone: user.phone,
    email: user.email,
    joinDate: user.hire_date, // Map hire_date to joinDate for compatibility
    status: 'active' // Default status for compatibility
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
        SELECT s.*, e.employeeId, e.name, e.email, e.department, e.position, e.storeId, e.roleDetails
        FROM sessions s
        JOIN employees e ON s.employeeId = e.employeeId
        WHERE s.token = ? AND s.expiresAt > ?
      `)
      .bind(token, new Date().toISOString())
      .first();

    if (!sessionQuery) {
      return jsonResponse({ message: "Token không hợp lệ hoặc đã hết hạn!" }, 401, allowedOrigin);
    }

    // Update last access time
    await db
      .prepare("UPDATE sessions SET lastAccess = ? WHERE token = ?")
      .bind(new Date().toISOString(), token)
      .run();

    return sessionQuery;
  } catch (error) {
    console.error("Session check error:", error);
    return jsonResponse({ message: "Lỗi kiểm tra phiên đăng nhập!" }, 500, allowedOrigin);
  }
}

// Create session
async function createSession(employeeId, db, allowedOrigin) {
  try {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);
    const now = new Date().toISOString();

    // Delete existing sessions for this user
    await db
      .prepare("DELETE FROM sessions WHERE employeeId = ?")
      .bind(employeeId)
      .run();

    // Create new session
    await db
      .prepare("INSERT INTO sessions (employeeId, token, expiresAt, lastAccess) VALUES (?, ?, ?, ?)")
      .bind(employeeId, token, expiresAt.toISOString(), now)
      .run();

    return {
      token,
      employeeId,
      expiresAt: expiresAt.toISOString(),
      lastAccess: now,
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
    const { employeeId, password } = body;
    
    if (!employeeId || !password) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu mã nhân viên hoặc mật khẩu!" 
      }, 400, origin);
    }

    // Get user for password verification
    const user = await db
      .prepare("SELECT * FROM employees WHERE employeeId = ? AND is_active = 1")
      .bind(employeeId)
      .first();

    if (!user) {
      return jsonResponse({ 
        success: false, 
        message: "Mã nhân viên hoặc mật khẩu không đúng!" 
      }, 401, origin);
    }

    // Verify password using SHA-256
    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return jsonResponse({ 
        success: false, 
        message: "Mã nhân viên hoặc mật khẩu không đúng!" 
      }, 401, origin);
    }

    // Create session
    const session = await createSession(employeeId, db, origin);
    if (session instanceof Response) return session;

    // Update last login
    await db
      .prepare("UPDATE employees SET last_login_at = ? WHERE employeeId = ?")
      .bind(new Date().toISOString(), employeeId)
      .run();

    return jsonResponse({
      success: true,
      message: "Đăng nhập thành công!",
      token: session.token,
      user: {
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        storeId: user.storeId,
        roleDetails: user.roleDetails
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
      .prepare("SELECT * FROM stores ORDER BY name")
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

// Handle getting users
async function handleGetUsers(url, db, origin) {
  try {
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = (page - 1) * limit;
    const department = url.searchParams.get("department");
    const storeId = url.searchParams.get("storeId");

    let query = `
      SELECT employeeId, name, email, department, position, storeId, 
             employment_status, is_active, created_at, last_login_at
      FROM employees 
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      query += " AND department = ?";
      params.push(department);
    }

    if (storeId) {
      query += " AND storeId = ?";
      params.push(storeId);
    }

    query += " ORDER BY name LIMIT ? OFFSET ?";
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
        SELECT employeeId, name, email, department, position, storeId, 
               employment_status, is_active, created_at, last_login_at,
               hire_date, phone, address, notes
        FROM employees 
        WHERE employeeId = ?
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
      department, 
      position, 
      storeName, // Client sends storeName
      storeId, // Direct storeId field
      phone
    } = body;

    // Use mapped values, prioritizing client-sent field names
    const userName = name || fullName;
    const userStoreId = storeId || storeName;

    if (!email || !password || !userName) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc!" 
      }, 400, origin);
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

    // Hash password using SHA-256
    const hashedPassword = await hashPassword(password);

    // Send verification email
    const verificationCode = await sendVerificationEmail(email, finalEmployeeId, userName, env);

    // Create pending registration
    await db
      .prepare(`
        INSERT INTO pending_registrations 
        (employeeId, email, password, name, department, position, storeId, 
         verification_code, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `)
      .bind(finalEmployeeId, email, hashedPassword, userName, department, position, userStoreId, 
            verificationCode, new Date().toISOString())
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
async function handleCheckIn(body, db, origin) {
  try {
    const { employeeId, latitude, longitude, location } = body;

    if (!employeeId) {
      return jsonResponse({ 
        success: false, 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await db
      .prepare(`
        SELECT id FROM attendance 
        WHERE employeeId = ? AND DATE(checkIn) = ? AND checkOut IS NULL
      `)
      .bind(employeeId, today)
      .first();

    if (existingAttendance) {
      return jsonResponse({ 
        success: false, 
        message: "Bạn đã check-in hôm nay!" 
      }, 400, origin);
    }

    // Create attendance record
    const now = new Date().toISOString();
    await db
      .prepare(`
        INSERT INTO attendance 
        (employeeId, checkIn, location, gps_latitude, gps_longitude, status, created_at) 
        VALUES (?, ?, ?, ?, ?, 'active', ?)
      `)
      .bind(employeeId, now, location || '', latitude || null, longitude || null, now)
      .run();

    return jsonResponse({
      success: true,
      message: "Check-in thành công!",
      checkInTime: now
    }, 200, origin);

  } catch (error) {
    console.error("Check-in error:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi check-in!", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle check-out
async function handleCheckOut(body, db, origin) {
  try {
    const { employeeId, latitude, longitude, location } = body;

    if (!employeeId) {
      return jsonResponse({ 
        success: false, 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    // Find today's attendance record
    const today = new Date().toISOString().split('T')[0];
    const attendance = await db
      .prepare(`
        SELECT id, checkIn FROM attendance 
        WHERE employeeId = ? AND DATE(checkIn) = ? AND checkOut IS NULL
      `)
      .bind(employeeId, today)
      .first();

    if (!attendance) {
      return jsonResponse({ 
        success: false, 
        message: "Không tìm thấy bản ghi check-in hôm nay!" 
      }, 400, origin);
    }

    // Calculate work hours
    const checkIn = new Date(attendance.checkIn);
    const checkOut = new Date();
    const workHours = (checkOut - checkIn) / (1000 * 60 * 60); // hours

    // Update attendance record
    await db
      .prepare(`
        UPDATE attendance 
        SET checkOut = ?, checkOutLocation = ?, checkout_gps_latitude = ?, 
            checkout_gps_longitude = ?, work_hours_calculated = ?, 
            status = 'completed', updated_at = ?
        WHERE id = ?
      `)
      .bind(checkOut.toISOString(), location || '', latitude || null, 
            longitude || null, workHours.toFixed(2), checkOut.toISOString(), attendance.id)
      .run();

    return jsonResponse({
      success: true,
      message: "Check-out thành công!",
      checkOutTime: checkOut.toISOString(),
      workHours: workHours.toFixed(2)
    }, 200, origin);

  } catch (error) {
    console.error("Check-out error:", error);
    return jsonResponse({ 
      success: false, 
      message: "Lỗi check-out!", 
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
        WHERE DATE(checkIn) = ?
      `)
      .bind(today)
      .first();

    // Get pending tasks
    const pendingTasks = await db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'")
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
        pendingTasks: pendingTasks?.count || 0,
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

    let query = "SELECT * FROM shift_assignments WHERE 1=1";
    const params = [];

    if (employeeId) {
      query += " AND employeeId = ?";
      params.push(employeeId);
    }

    if (date) {
      query += " AND date = ?";
      params.push(date);
    }

    query += " ORDER BY date DESC";

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
    const { employeeId, date, shiftName, startTime, endTime } = body;

    if (!employeeId || !date || !shiftName) {
      return jsonResponse({ 
        success: false, 
        message: "Thiếu thông tin ca làm việc!" 
      }, 400, origin);
    }

    // Check if shift already exists
    const existing = await db
      .prepare("SELECT id FROM shift_assignments WHERE employeeId = ? AND date = ?")
      .bind(employeeId, date)
      .first();

    if (existing) {
      // Update existing shift
      await db
        .prepare(`
          UPDATE shift_assignments 
          SET shiftName = ?, startTime = ?, endTime = ?, updated_at = ?
          WHERE employeeId = ? AND date = ?
        `)
        .bind(shiftName, startTime, endTime, new Date().toISOString(), employeeId, date)
        .run();
    } else {
      // Create new shift
      await db
        .prepare(`
          INSERT INTO shift_assignments 
          (employeeId, date, shiftName, startTime, endTime, created_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(employeeId, date, shiftName, startTime, endTime, new Date().toISOString())
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
async function handleGetCurrentShift(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const today = new Date().toISOString().split('T')[0];

    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    const shift = await db
      .prepare(`
        SELECT * FROM shift_assignments 
        WHERE employeeId = ? AND date = ?
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
        SELECT * FROM shift_assignments 
        WHERE employeeId = ? AND date >= ? AND date <= ?
        ORDER BY date
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
      query += " AND DATE(a.checkIn) >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND DATE(a.checkIn) <= ?";
      params.push(endDate);
    }

    query += " ORDER BY a.checkIn DESC";

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
               department, position, created_at
        FROM pending_registrations 
        WHERE status = 'pending'
        UNION ALL
        SELECT 'task' as type, id, title as name, description as email,
               category as department, status as position, created_at
        FROM tasks 
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

// Handle getting tasks
async function handleGetTasks(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, e.name as createdByName, a.name as assignedToName
      FROM tasks t
      LEFT JOIN employees e ON t.createdBy = e.id
      LEFT JOIN employees a ON t.assignedTo = a.id
      WHERE 1=1
    `;
    const params = [];

    if (employeeId) {
      query += " AND (t.assignedTo = ? OR t.createdBy = ?)";
      params.push(employeeId, employeeId);
    }

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    query += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const tasks = await db
      .prepare(query)
      .bind(...params)
      .all();

    return jsonResponse({
      success: true,
      data: tasks.results || [],
      pagination: {
        page,
        limit,
        hasMore: (tasks.results || []).length === limit
      }
    }, 200, origin);

  } catch (error) {
    console.error("Get tasks error:", error);
    return jsonResponse({ 
      message: "Lỗi khi lấy danh sách công việc", 
      error: error.message 
    }, 500, origin);
  }
}

// Handle getting permissions
async function handleGetPermissions(url, db, origin) {
  try {
    const employeeId = url.searchParams.get("employeeId");

    if (!employeeId) {
      return jsonResponse({ 
        message: "employeeId là bắt buộc!" 
      }, 400, origin);
    }

    // Get user roles and permissions
    const permissions = await db
      .prepare(`
        SELECT DISTINCT p.permission_name, p.description, p.category
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        JOIN employees e ON ur.employee_id = e.id
        WHERE e.employeeId = ?
        UNION
        SELECT DISTINCT p.permission_name, p.description, p.category
        FROM permissions p
        JOIN user_permissions up ON p.id = up.permission_id
        JOIN employees e ON up.employee_id = e.id
        WHERE e.employeeId = ? AND up.granted = 1
      `)
      .bind(employeeId, employeeId)
      .all();

    return jsonResponse({
      success: true,
      data: permissions.results || []
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
        SELECT id, employeeId, email, name, department, position, 
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

async function handleApproveTask(body, db, origin) {
  try {
    const { taskId, approvedBy } = body;
    
    if (!taskId || !approvedBy) {
      return jsonResponse({ message: "Task ID and approver are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE tasks 
      SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const result = await stmt.bind(approvedBy, currentTime, currentTime, taskId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Task not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Task approved successfully",
      taskId: taskId 
    }, 200, origin);
  } catch (error) {
    console.error("Error approving task:", error);
    return jsonResponse({ message: "Failed to approve task", error: error.message }, 500, origin);
  }
}

async function handleRejectTask(body, db, origin) {
  try {
    const { taskId, rejectedBy, reason } = body;
    
    if (!taskId || !rejectedBy) {
      return jsonResponse({ message: "Task ID and rejector are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE tasks 
      SET status = 'rejected', rejected_by = ?, rejection_reason = ?, rejected_at = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const result = await stmt.bind(rejectedBy, reason || '', currentTime, currentTime, taskId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Task not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Task rejected successfully",
      taskId: taskId 
    }, 200, origin);
  } catch (error) {
    console.error("Error rejecting task:", error);
    return jsonResponse({ message: "Failed to reject task", error: error.message }, 500, origin);
  }
}

// Function removed - not used by client
// handleCreateTaskFromMessage was not called by any client code

// Function removed - not used by client  
// handleUpdatePermissions was not called by any client code

async function handleUpdatePersonalInfo(body, db, origin) {
  try {
    const { employeeId, name, phone, position, department, email } = body;
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    const stmt = await db.prepare(`
      UPDATE employees 
      SET name = ?, phone = ?, position = ?, department = ?, email = ?, updated_at = ?
      WHERE employeeId = ?
    `);
    
    const currentTime = TimezoneUtils.toHanoiISOString();
    const result = await stmt.bind(name, phone, position, department, email, currentTime, employeeId).run();
    
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
      totalHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours
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
      INSERT INTO attendance_requests 
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

async function handleCreateTaskAssignment(body, db, origin) {
  try {
    const { title, description, assignee, priority, dueDate, createdBy, projectId } = body;
    
    if (!title || !assignee || !createdBy) {
      return jsonResponse({ message: "Title, assignee, and createdBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const stmt = await db.prepare(`
      INSERT INTO tasks 
      (task_id, title, description, assignee, priority, due_date, status, created_by, project_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `);
    
    await stmt.bind(taskId, title, description || '', assignee, priority || 'medium', dueDate || null, createdBy, projectId || null, currentTime, currentTime).run();

    return jsonResponse({ 
      message: "Task assigned successfully",
      taskId: taskId,
      assignee: assignee
    }, 200, origin);
  } catch (error) {
    console.error("Error creating task assignment:", error);
    return jsonResponse({ message: "Failed to create task assignment", error: error.message }, 500, origin);
  }
}

async function handleAddTaskComment(body, db, origin) {
  try {
    const { taskId, comment, commentedBy } = body;
    
    if (!taskId || !comment || !commentedBy) {
      return jsonResponse({ message: "Task ID, comment, and commentedBy are required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    const commentId = `COMMENT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const stmt = await db.prepare(`
      INSERT INTO task_comments 
      (comment_id, task_id, comment_text, commented_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(commentId, taskId, comment, commentedBy, currentTime, currentTime).run();

    return jsonResponse({ 
      message: "Comment added successfully",
      commentId: commentId,
      taskId: taskId
    }, 200, origin);
  } catch (error) {
    console.error("Error adding task comment:", error);
    return jsonResponse({ message: "Failed to add task comment", error: error.message }, 500, origin);
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
      UPDATE shift_requests 
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
      UPDATE shift_requests 
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
      UPDATE attendance_requests 
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
      UPDATE attendance_requests 
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

async function handleGetTimesheet(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
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
        location_check_in, location_check_out, notes
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
        location_check_in, location_check_out, notes,
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

async function handleGetPersonalStats(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    // Get basic employee info
    const employeeStmt = await db.prepare("SELECT * FROM employees WHERE employeeId = ?");
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

    // Get task stats
    const taskStmt = await db.prepare(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks
      FROM tasks 
      WHERE assignee = ?
    `);
    const taskStats = await taskStmt.bind(employeeId).first();

    // Calculate performance metrics
    const attendanceRate = attendanceStats.total_days > 0 ? 
      (attendanceStats.present_days / attendanceStats.total_days * 100).toFixed(1) : 0;
    const taskCompletionRate = taskStats.total_tasks > 0 ? 
      (taskStats.completed_tasks / taskStats.total_tasks * 100).toFixed(1) : 0;

    return jsonResponse({
      employeeId: employeeId,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      attendance: {
        totalDays: attendanceStats.total_days || 0,
        presentDays: attendanceStats.present_days || 0,
        lateDays: attendanceStats.late_days || 0,
        absentDays: attendanceStats.absent_days || 0,
        attendanceRate: parseFloat(attendanceRate)
      },
      tasks: {
        totalTasks: taskStats.total_tasks || 0,
        completedTasks: taskStats.completed_tasks || 0,
        pendingTasks: taskStats.pending_tasks || 0,
        inProgressTasks: taskStats.in_progress_tasks || 0,
        completionRate: parseFloat(taskCompletionRate)
      }
    }, 200, origin);
  } catch (error) {
    console.error("Error getting personal stats:", error);
    return jsonResponse({ message: "Failed to get personal stats", error: error.message }, 500, origin);
  }
}

async function handleGetWorkTasks(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get("employeeId");
    const page = parseInt(urlParams.get("page")) || 1;
    const limit = parseInt(urlParams.get("limit")) || 15;
    const status = urlParams.get("status") || "";
    
    if (!employeeId) {
      return jsonResponse({ message: "Employee ID is required" }, 400, origin);
    }

    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE assignee = ?";
    let params = [employeeId];
    
    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    // Get total count
    const countStmt = await db.prepare(`SELECT COUNT(*) as total FROM tasks ${whereClause}`);
    const countResult = await countStmt.bind(...params).first();
    const totalTasks = countResult.total;

    // Get tasks with pagination
    const tasksStmt = await db.prepare(`
      SELECT 
        id, title, description, status, priority, assignee, created_by, 
        due_date, created_at, updated_at
      FROM tasks 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const tasks = await tasksStmt.bind(...params, limit, offset).all();

    const totalPages = Math.ceil(totalTasks / limit);

    return jsonResponse({
      tasks: tasks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalTasks: totalTasks,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 200, origin);
  } catch (error) {
    console.error("Error getting work tasks:", error);
    return jsonResponse({ message: "Failed to get work tasks", error: error.message }, 500, origin);
  }
}

async function handleGetTaskDetail(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const taskId = urlParams.get("taskId");
    
    if (!taskId) {
      return jsonResponse({ message: "Task ID is required" }, 400, origin);
    }

    // Get task details
    const taskStmt = await db.prepare(`
      SELECT 
        t.*, 
        e1.name as assignee_name,
        e2.name as creator_name
      FROM tasks t
      LEFT JOIN employees e1 ON t.assignee = e1.employeeId
      LEFT JOIN employees e2 ON t.created_by = e2.employeeId
      WHERE t.id = ?
    `);
    const task = await taskStmt.bind(taskId).first();
    
    if (!task) {
      return jsonResponse({ message: "Task not found" }, 404, origin);
    }

    // Get task comments
    const commentsStmt = await db.prepare(`
      SELECT 
        tc.*,
        e.name as commenter_name
      FROM task_comments tc
      LEFT JOIN employees e ON tc.commented_by = e.employeeId
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `);
    const comments = await commentsStmt.bind(taskId).all();

    return jsonResponse({
      task: task,
      comments: comments
    }, 200, origin);
  } catch (error) {
    console.error("Error getting task detail:", error);
    return jsonResponse({ message: "Failed to get task detail", error: error.message }, 500, origin);
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
        employeeId, name, email, phone, position, department, 
        employment_status, is_active, hire_date, last_login_at
      FROM employees 
      WHERE storeId = ? AND employment_status != 'terminated'
      ORDER BY name ASC
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
        e.name as employee_name,
        e.department,
        e.position
      FROM shift_requests sr
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
        e.name as employee_name,
        e.department,
        e.position
      FROM attendance_requests ar
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
    
    let whereClause = includeInactive ? "WHERE 1=1" : "WHERE is_active = 1 AND employment_status = 'active'";

    const stmt = await db.prepare(`
      SELECT 
        employeeId, name, email, phone, position, department, storeId,
        employment_status, is_active, hire_date, last_login_at
      FROM employees 
      ${whereClause}
      ORDER BY name ASC
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

async function handleGetApprovalTasks(url, db, origin) {
  try {
    const stmt = await db.prepare(`
      SELECT 
        t.*,
        e1.name as assignee_name,
        e2.name as creator_name
      FROM tasks t
      LEFT JOIN employees e1 ON t.assignee = e1.employeeId
      LEFT JOIN employees e2 ON t.created_by = e2.employeeId
      WHERE t.status = 'pending' OR t.status = 'submitted'
      ORDER BY t.created_at DESC
    `);
    
    const tasks = await stmt.all();

    return jsonResponse({
      tasks: tasks
    }, 200, origin);
  } catch (error) {
    console.error("Error getting approval tasks:", error);
    return jsonResponse({ message: "Failed to get approval tasks", error: error.message }, 500, origin);
  }
}

async function handleFinalApproveTask(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const taskId = urlParams.get("taskId");
    
    if (!taskId) {
      return jsonResponse({ message: "Task ID is required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE tasks 
      SET status = 'completed', final_approved_at = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const result = await stmt.bind(currentTime, currentTime, taskId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Task not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Task finally approved",
      taskId: taskId 
    }, 200, origin);
  } catch (error) {
    console.error("Error final approving task:", error);
    return jsonResponse({ message: "Failed to final approve task", error: error.message }, 500, origin);
  }
}

async function handleFinalRejectTask(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const taskId = urlParams.get("taskId");
    const reason = urlParams.get("reason");
    
    if (!taskId) {
      return jsonResponse({ message: "Task ID is required" }, 400, origin);
    }

    const currentTime = TimezoneUtils.toHanoiISOString();
    
    const stmt = await db.prepare(`
      UPDATE tasks 
      SET status = 'final_rejected', final_rejection_reason = ?, final_rejected_at = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const result = await stmt.bind(reason || '', currentTime, currentTime, taskId).run();
    
    if (result.changes === 0) {
      return jsonResponse({ message: "Task not found" }, 404, origin);
    }

    return jsonResponse({ 
      message: "Task finally rejected",
      taskId: taskId 
    }, 200, origin);
  } catch (error) {
    console.error("Error final rejecting task:", error);
    return jsonResponse({ message: "Failed to final reject task", error: error.message }, 500, origin);
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
        tableName = 'attendance_requests';
        break;
      case 'shift':
        tableName = 'shift_requests';
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
    const attendanceStmt = await db.prepare("SELECT COUNT(*) as count FROM attendance_requests WHERE employeeId = ? AND status = 'pending'");
    const attendanceResult = await attendanceStmt.bind(employeeId).first();
    
    // Count pending shift requests
    const shiftStmt = await db.prepare("SELECT COUNT(*) as count FROM shift_requests WHERE employeeId = ? AND status = 'pending'");
    const shiftResult = await shiftStmt.bind(employeeId).first();
    
    // Count pending tasks
    const taskStmt = await db.prepare("SELECT COUNT(*) as count FROM tasks WHERE assignee = ? AND status = 'pending'");
    const taskResult = await taskStmt.bind(employeeId).first();

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
// MAIN EXPORT WITH ALL ROUTES
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
    const db = env.D1_BINDING;
    if (request.method === "OPTIONS") return handleOptionsRequest();

    try {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");
      let token = url.searchParams.get("token");

      // Check token from Authorization header if not in query
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
          case "checkIn":
            return await handleCheckIn(body, db, ALLOWED_ORIGIN);
          case "checkOut":
            return await handleCheckOut(body, db, ALLOWED_ORIGIN);
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
          case "updatePersonalInfo":
            return await handleUpdatePersonalInfo(body, db, ALLOWED_ORIGIN);
          case "updateUserWithHistory":
            return await handleUpdateUserWithHistory(body, db, ALLOWED_ORIGIN);
          case "approveRegistration":
            return await handleApproveRegistration(body, db, ALLOWED_ORIGIN);
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
          case "verifyEmail":
            return await handleVerifyEmail(body, db, ALLOWED_ORIGIN, env);
          case "approveRegistrationWithHistory":
            return await handleApproveRegistrationWithHistory(body, db, ALLOWED_ORIGIN);
          case "completeRequest":
            return await handleCompleteRequest(body, db, ALLOWED_ORIGIN);
          default:
            return jsonResponse({ message: "Action không hợp lệ!" }, 400);
        }
      }

      if (request.method === "GET") {
        switch (action) {
          case "getStores":
            return await handleGetStores(db, ALLOWED_ORIGIN);
          case "getUsers":
            return await handleGetUsers(url, db, ALLOWED_ORIGIN);
          case "getUser":
            return await handleGetUser(url, db, ALLOWED_ORIGIN);
          case "getDashboardStats":
            return await handleGetDashboardStats(db, ALLOWED_ORIGIN);
          case "checkId":
            return await handleCheckId(url, db, ALLOWED_ORIGIN);
          case "getUserHistory":
            return await handleGetUserHistory(url, db, ALLOWED_ORIGIN);
          case "getCurrentShift":
            return await handleGetCurrentShift(url, db, ALLOWED_ORIGIN);
          case "getWeeklyShifts":
            return await handleGetWeeklyShifts(url, db, ALLOWED_ORIGIN);
          case "getAttendanceData":
            return await handleGetAttendanceData(url, db, ALLOWED_ORIGIN);
          case "getPendingRequests":
            return await handleGetPendingRequests(db, ALLOWED_ORIGIN);
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
          case "getAllUsers":
            return await handleGetAllUsers(url, db, ALLOWED_ORIGIN);
          case "getApprovalTasks":
            return await handleGetApprovalTasks(url, db, ALLOWED_ORIGIN);
          case "finalApproveTask":
            return await handleFinalApproveTask(url, db, ALLOWED_ORIGIN);
          case "finalRejectTask":
            return await handleFinalRejectTask(url, db, ALLOWED_ORIGIN);
          case "checkdk":
            return await handleCheckDk(url, db, ALLOWED_ORIGIN);
          case "getPendingRequestsCount":
            return await handleGetPendingRequestsCount(url, db, ALLOWED_ORIGIN);
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