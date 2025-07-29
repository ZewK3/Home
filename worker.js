const ALLOWED_ORIGIN = "*";

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
                Thời gian đăng ký: ${new Date().toLocaleString('vi-VN')}
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
function jsonResponse(body, status, origin = ALLOWED_ORIGIN) {
  const responseBody = typeof body === 'string' ? { message: body } : body;
  
  return new Response(JSON.stringify({
    ...responseBody,
    timestamp: new Date().toISOString(),
    status: status
  }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block"
    },
  });
}

// Hàm tiện ích xử lý CORS cho OPTIONS request
function handleOptionsRequest() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Hàm mã hóa mật khẩu bằng SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Enhanced session middleware with rate limiting awareness
async function checkSessionMiddleware(token, db, allowedOrigin) {
  if (!token) {
    return jsonResponse("Yêu cầu xác thực - vui lòng đăng nhập", 401, allowedOrigin);
  }

  try {
    const session = await db
      .prepare("SELECT employeeId, expiresAt, lastAccess FROM sessions WHERE token = ?")
      .bind(token)
      .first();

    if (!session) {
      return jsonResponse("Phiên làm việc không hợp lệ - vui lòng đăng nhập lại", 401, allowedOrigin);
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    // Thêm buffer time 5 phút để tránh lỗi timezone
    const bufferTime = 5 * 60 * 1000; // 5 phút tính bằng milliseconds
    if (now.getTime() > (expiresAt.getTime() + bufferTime)) {
      // Clean up expired session
      await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
      return jsonResponse("Phiên làm việc đã hết hạn - vui lòng đăng nhập lại", 401, allowedOrigin);
    }

    // Cập nhật thời gian truy cập cuối để theo dõi session
    await db
      .prepare("UPDATE sessions SET lastAccess = ? WHERE token = ?")
      .bind(now.toISOString(), token)
      .run();

    return { employeeId: session.employeeId, valid: true };
  } catch (error) {
    console.error("Lỗi kiểm tra phiên:", error);
    return jsonResponse("Lỗi hệ thống - vui lòng thử lại sau", 500, allowedOrigin);
  }
}

// Hàm tạo hoặc cập nhật phiên người dùng
async function createSession(employeeId, db, allowedOrigin) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8); // Phiên hết hạn sau 8 giờ (tăng thời gian để tránh hết hạn sớm)
  const now = new Date().toISOString();

  try {
    // Xóa session cũ của user này trước
    await db.prepare("DELETE FROM sessions WHERE employeeId = ?").bind(employeeId).run();

    // Tạo session mới
    await db
      .prepare("INSERT INTO sessions (employeeId, token, expiresAt, lastAccess) VALUES (?, ?, ?, ?)")
      .bind(employeeId, token, expiresAt.toISOString(), now)
      .run();

    // Trả về dữ liệu session trực tiếp
    return {
      token,
      employeeId,
      expiresAt: expiresAt.toISOString(),
      lastAccess: now,
      success: true
    };
  } catch (error) {
    console.error("Lỗi tạo hoặc cập nhật phiên:", error);
    return { success: false, message: "Lỗi tạo hoặc cập nhật phiên!", error: error.message };
  }
}

// Hàm tính rank dựa trên điểm kinh nghiệm
// Hàm đăng nhập người dùng (khách hàng)
async function loginUser(body, db, origin) {
  const { email, password } = body;
  if (!email || email.trim() === "" || !password || password.trim() === "") {
    return jsonResponse({ message: "Thiếu email hoặc mật khẩu!" }, 400, origin);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!emailRegex.test(email) && !phoneRegex.test(email)) {
    return jsonResponse({ message: "Email hoặc số điện thoại không hợp lệ!" }, 400, origin);
  }

  const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (!user) return jsonResponse({ message: "Tài khoản không tồn tại!" }, 404, origin);

  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    return jsonResponse({ message: "Mật khẩu không đúng!" }, 401, origin);
  }

  const sessionResult = await createSession(user.id, db, origin);
  if (sessionResult.success) {
    return jsonResponse(sessionResult, 200, origin);
  } else {
    return jsonResponse({ message: "Lỗi tạo phiên làm việc!", error: sessionResult.error }, 500, origin);
  }
}

// Hàm lấy thông tin người dùng (khách hàng)
async function getUser(url, db, origin) {
  const token = url.searchParams.get("token");
  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const user = await db
    .prepare("SELECT employeeId, fullName, storeName, position, phone, email, joinDate FROM employees WHERE employeeId = ?")
    .bind(session.employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  return jsonResponse({ 
    employeeId: user.employeeId,
    fullName: user.fullName,
    storeName: user.storeName,
    position: user.position,
    phone: user.phone,
    email: user.email,
    joinDate: user.joinDate,
    status: 'active' // Default status for compatibility
  }, 200, origin);
}

// Hàm cập nhật thông tin người dùng (khách hàng)
async function updateUser(body, userId, db, origin) {
  const { name, email, password } = body;

  if (!name && !email && !password) {
    return jsonResponse({ message: "Không có thông tin nào để cập nhật!" }, 400, origin);
  }

  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  const updates = {};
  if (name && name.trim() !== "") updates.name = name.trim();
  if (email && email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!emailRegex.test(email) && !phoneRegex.test(email)) {
      return jsonResponse({ message: "Email hoặc số điện thoại không hợp lệ!" }, 400, origin);
    }
    const existing = await db.prepare("SELECT * FROM users WHERE email = ? AND id != ?").bind(email, userId).first();
    if (existing) return jsonResponse({ message: "Email đã tồn tại!" }, 409, origin);
    updates.email = email.trim();
  }
  if (password && password.trim() !== "") {
    if (password.length < 6) {
      return jsonResponse({ message: "Mật khẩu phải có ít nhất 6 ký tự!" }, 400, origin);
    }
    updates.password = await hashPassword(password);
  }

  try {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates).concat(userId);
    if (setClause) {
      await db
        .prepare(`UPDATE users SET ${setClause} WHERE id = ?`)
        .bind(...values)
        .run();
    }
    return jsonResponse({ message: "Cập nhật thông tin người dùng thành công!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    return jsonResponse({ message: "Lỗi cập nhật thông tin!", error: error.message }, 500, origin);
  }
}

// Hàm lấy danh sách cửa hàng
async function handleGetStores(db, origin) {
  try {
    const stores = await db.prepare("SELECT storeId, storeName, region, address FROM stores").all();
    console.log("Raw stores query result:", stores);
    
    // D1 database returns {results: [...], success: true}
    const storesList = stores.results || stores;
    
    if (!storesList || storesList.length === 0) {
      return jsonResponse({ message: "Không tìm thấy cửa hàng nào!" }, 404, origin);
    }
    
    // Return stores in a format that the frontend can parse
    return jsonResponse(storesList, 200, origin);
  } catch (error) {
    console.error("Error getting stores:", error);
    return jsonResponse({ message: "Lỗi lấy danh sách cửa hàng!", error: error.message }, 500, origin);
  }
}

// Hàm lấy danh sách nhân viên
async function handleGetUsers(url, db, origin) {
  const users = await db
    .prepare("SELECT employeeId, fullName, storeName, position FROM employees")
    .all();

  if (!users.results || users.results.length === 0) {
    return jsonResponse({ message: "Không tìm thấy người dùng!" }, 404, origin);
  }
  return jsonResponse(users.results, 200, origin);
}

// Hàm kiểm tra ID nhân viên
async function handleCheckId(url, db, origin) {
  const employeeId = url.searchParams.get("employeeId");
  if (!employeeId) return jsonResponse({ message: "Thiếu mã nhân viên!" }, 400, origin);

  const user = await db
    .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  return user
    ? jsonResponse({ message: "Tài Khoản Đã Tồn Tại!" }, 400, origin)
    : jsonResponse({ message: "Tài Khoản Hợp Lệ!" }, 200, origin);
}

// Hàm kiểm tra lịch làm việc
// Shift Management Functions
async function handleGetShiftAssignments(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const store = urlParams.get('store');
    const week = urlParams.get('week');
    
    if (!store || !week) {
      return jsonResponse({ error: "Missing store or week parameter" }, 400, origin);
    }

    // Get shift assignments for the specified store and week
    // For now, return sample data since we haven't created the tables yet
    const assignments = {
      store: store,
      week: week,
      employees: [
        { employeeId: 'EMP001', fullName: 'Nguyễn Văn A', shifts: [] },
        { employeeId: 'EMP002', fullName: 'Trần Thị B', shifts: [] }
      ]
    };

    return jsonResponse(assignments, 200, origin);
  } catch (error) {
    console.error("Get shift assignments error:", error);
    return jsonResponse({ error: "Failed to get shift assignments" }, 500, origin);
  }
}

async function handleAssignShift(body, db, origin) {
  try {
    const { employeeId, storeId, date, shiftType, startTime, endTime } = body;
    
    if (!employeeId || !storeId || !date || !shiftType) {
      return jsonResponse({ error: "Missing required parameters" }, 400, origin);
    }

    // For now, just return success (we'll implement the database logic later)
    return jsonResponse({ message: "Shift assigned successfully" }, 200, origin);
  } catch (error) {
    console.error("Assign shift error:", error);
    return jsonResponse({ error: "Failed to assign shift" }, 500, origin);
  }
}

async function handleGetCurrentShift(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get('employeeId');
    
    if (!employeeId) {
      return jsonResponse({ error: "Missing employeeId parameter" }, 400, origin);
    }

    // For now, return sample current shift data
    const currentShift = {
      startTime: "08:00",
      endTime: "17:00",
      storeName: "Cửa hàng A",
      checkedIn: false,
      checkedOut: false
    };

    return jsonResponse({ currentShift }, 200, origin);
  } catch (error) {
    console.error("Get current shift error:", error);
    return jsonResponse({ error: "Failed to get current shift" }, 500, origin);
  }
}

async function handleGetWeeklyShifts(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const employeeId = urlParams.get('employeeId');
    
    if (!employeeId) {
      return jsonResponse({ error: "Missing employeeId parameter" }, 400, origin);
    }

    // Return sample weekly shifts data
    const shifts = [
      { date: '2024-01-15', shiftName: 'Ca sáng', startTime: '08:00', endTime: '17:00', storeName: 'Cửa hàng A', status: 'assigned' },
      { date: '2024-01-16', shiftName: 'Ca chiều', startTime: '13:00', endTime: '22:00', storeName: 'Cửa hàng A', status: 'confirmed' }
    ];

    return jsonResponse({ shifts }, 200, origin);
  } catch (error) {
    console.error("Get weekly shifts error:", error);
    return jsonResponse({ error: "Failed to get weekly shifts" }, 500, origin);
  }
}

async function handleGetAttendanceData(url, db, origin) {
  try {
    const urlParams = new URLSearchParams(url.search);
    const month = urlParams.get('month');
    const employeeId = urlParams.get('employeeId');
    
    if (!month) {
      return jsonResponse({ error: "Missing month parameter" }, 400, origin);
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

    return jsonResponse({ summary, records }, 200, origin);
  } catch (error) {
    console.error("Get attendance data error:", error);
    return jsonResponse({ error: "Failed to get attendance data" }, 500, origin);
  }
}

async function handleCheckIn(body, db, origin) {
  try {
    const { employeeId } = body;
    
    if (!employeeId) {
      return jsonResponse({ error: "Missing employeeId" }, 400, origin);
    }

    // For now, just return success
    return jsonResponse({ message: "Check in successful" }, 200, origin);
  } catch (error) {
    console.error("Check in error:", error);
    return jsonResponse({ error: "Failed to check in" }, 500, origin);
  }
}

async function handleCheckOut(body, db, origin) {
  try {
    const { employeeId } = body;
    
    if (!employeeId) {
      return jsonResponse({ error: "Missing employeeId" }, 400, origin);
    }

    // For now, just return success
    return jsonResponse({ message: "Check out successful" }, 200, origin);
  } catch (error) {
    console.error("Check out error:", error);
    return jsonResponse({ error: "Failed to check out" }, 500, origin);
  }
}

// Hàm đăng nhập nhân viên
async function handleLogin(body, db, origin) {
  const { loginEmployeeId: employeeId, loginPassword: password } = body;
  if (!employeeId || !password) {
    return jsonResponse({ message: "Thiếu mã nhân viên hoặc mật khẩu!" }, 400, origin);
  }

  // First check if user is in the queue (pending approval)
  const queueUser = await db
    .prepare("SELECT * FROM queue WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  if (queueUser) {
    if (queueUser.status === "Wait") {
      return jsonResponse({ message: "Tài khoản của bạn đang chờ phê duyệt từ quản lý cửa hàng. Vui lòng đợi thông báo." }, 403, origin);
    }
  }

  const user = await db
    .prepare("SELECT password, salt FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Mã nhân viên không tồn tại!" }, 404, origin);

  const storedHash = Uint8Array.from(user.password.split(",").map(Number));
  const storedSalt = Uint8Array.from(user.salt.split(",").map(Number));
  const isPasswordCorrect = await verifyPassword(storedHash, storedSalt, password);

  if (!isPasswordCorrect) return jsonResponse({ message: "Mật khẩu không chính xác!" }, 401, origin);

  // Tạo session mới
  const sessionResult = await createSession(employeeId, db, origin);
  if (sessionResult.success) {
    return jsonResponse(sessionResult, 200, origin);
  } else {
    return jsonResponse({ message: "Lỗi tạo phiên làm việc!", error: sessionResult.error }, 500, origin);
  }
}

// Hàm lấy thông tin nhân viên
async function handleGetUser(url, db, origin) {
  const employeeId = url.searchParams.get("employeeId");
  if (!employeeId) return jsonResponse({ message: "Thiếu mã nhân viên!" }, 400, origin);

  const user = await db
    .prepare(
      "SELECT employeeId, fullName, storeName, position, joinDate, phone, email FROM employees WHERE employeeId = ?"
    )
    .bind(employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Không tìm thấy dữ liệu!" }, 404, origin);
  return jsonResponse(user, 200, origin);
}

// Hàm đăng ký nhân viên
async function handleRegister(body, db, origin, env) {
  const { employeeId, fullName, storeName, password, phone, email, position, joinDate, pstatus, verificationCode } = body;
  if (!employeeId || !fullName || !storeName || !password) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  // If verification code is provided, this is step 2 (verification)
  if (verificationCode) {
    return await handleVerifyEmail(body, db, origin, env);
  }

  // Step 1: Send verification email
  if (!email) {
    return jsonResponse({ message: "Email là bắt buộc để xác thực tài khoản!" }, 400, origin);
  }

  // Check if employeeId already exists in employees table
  const existingUser = await db
    .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();
  if (existingUser) return jsonResponse({ message: "Mã nhân viên đã tồn tại!" }, 209, origin);

  // Check if employeeId already exists in queue table
  const existingQueue = await db
    .prepare("SELECT employeeId, status FROM queue WHERE employeeId = ?")
    .bind(employeeId)
    .first();
  if (existingQueue) {
    if (existingQueue.status === "Wait") {
      return jsonResponse({ message: "Tài khoản của bạn đang chờ phê duyệt từ quản lý cửa hàng." }, 403, origin);
    }
    return jsonResponse({ message: "Mã nhân viên đã tồn tại!" }, 209, origin);
  }

  // Check if phone already exists in employees table
  if (phone) {
    const existingPhone = await db
      .prepare("SELECT employeeId FROM employees WHERE phone = ?")
      .bind(phone)
      .first();
    if (existingPhone) return jsonResponse({ message: "Số điện thoại đã tồn tại!" }, 210, origin);

    // Check if phone already exists in queue table
    const existingQueuePhone = await db
      .prepare("SELECT employeeId FROM queue WHERE phone = ?")
      .bind(phone)
      .first();
    if (existingQueuePhone) return jsonResponse({ message: "Số điện thoại đã tồn tại!" }, 210, origin);
  }

  // Check if email already exists in employees table
  if (email) {
    const existingEmail = await db
      .prepare("SELECT employeeId FROM employees WHERE email = ?")
      .bind(email)
      .first();
    if (existingEmail) return jsonResponse({ message: "Email đã tồn tại!" }, 211, origin);

    // Check if email already exists in queue table
    const existingQueueEmail = await db
      .prepare("SELECT employeeId FROM queue WHERE email = ?")
      .bind(email)
      .first();
    if (existingQueueEmail) return jsonResponse({ message: "Email đã tồn tại!" }, 211, origin);
  }

  try {
    // Send verification email and get code
    const sentVerificationCode = await sendVerificationEmail(email, employeeId, fullName, env);
    
    // Store verification data temporarily
    const { hash, salt } = await hashPasswordPBKDF2(password);
    
    // Clean up any existing verification entries for this email/employeeId
    await db.prepare("DELETE FROM email_verification WHERE email = ? OR employeeId = ?")
            .bind(email, employeeId).run();
    
    // Store verification data
    await db
      .prepare(
        "INSERT INTO email_verification (employeeId, email, verificationCode, fullName, storeName, position, joinDate, phone, passwordHash, passwordSalt, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+15 minutes'))"
      )
      .bind(
        employeeId,
        email,
        sentVerificationCode,
        fullName,
        storeName,
        position || "NV",
        joinDate || null,
        phone || null,
        Array.from(hash).join(","),
        Array.from(salt).join(",")
      )
      .run();

    return jsonResponse({ 
      message: "Mã xác nhận đã được gửi tới email của bạn. Vui lòng kiểm tra email và nhập mã xác nhận.",
      requiresVerification: true
    }, 200, origin);

  } catch (error) {
    console.error("Error sending verification email:", error);
    return jsonResponse({ message: "Lỗi gửi email xác nhận. Vui lòng thử lại sau." }, 500, origin);
  }
}

// New function to handle email verification
async function handleVerifyEmail(body, db, origin, env) {
  const { employeeId, verificationCode } = body;
  
  if (!employeeId || !verificationCode) {
    return jsonResponse({ message: "Thiếu mã nhân viên hoặc mã xác nhận!" }, 400, origin);
  }

  // Get verification data
  const verification = await db
    .prepare("SELECT * FROM email_verification WHERE employeeId = ? AND verificationCode = ? AND expiresAt > datetime('now')")
    .bind(employeeId, verificationCode)
    .first();

  if (!verification) {
    return jsonResponse({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn!" }, 400, origin);
  }

  // Move to queue for approval
  await db
    .prepare(
      "INSERT INTO queue (employeeId, password, salt, fullName, storeName, position, joinDate, phone, email, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)"
    )
    .bind(
      verification.employeeId,
      verification.passwordHash,
      verification.passwordSalt,
      verification.fullName,
      verification.storeName,
      verification.position,
      verification.joinDate,
      verification.phone,
      verification.email,
      "Wait"
    )
    .run();

  // Clean up verification data
  await db.prepare("DELETE FROM email_verification WHERE employeeId = ?")
          .bind(employeeId).run();

  return jsonResponse({ 
    message: "Xác nhận email thành công! Yêu cầu đăng ký của bạn đã được gửi và đang chờ phê duyệt từ quản lý cửa hàng." 
  }, 200, origin);
}

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



// Hàm thêm thưởng/phạt
async function handleAddReward(body, db, origin) {
  const { employeeId, type, amount, reason } = body;
  
  if (!employeeId || !type || !amount || !reason) {
    return jsonResponse({ message: "Thiếu thông tin cần thiết!" }, 400, origin);
  }

  if (!['reward', 'penalty'].includes(type)) {
    return jsonResponse({ message: "Loại thưởng/phạt không hợp lệ!" }, 400, origin);
  }

  try {
    // Kiểm tra nhân viên tồn tại
    const employee = await db
      .prepare("SELECT employeeId, fullName FROM employees WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    if (!employee) {
      return jsonResponse({ message: "Nhân viên không tồn tại!" }, 404, origin);
    }

    // Thêm bản ghi thưởng/phạt
    const rewardId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db
      .prepare("INSERT INTO rewards (id, employeeId, employeeName, type, amount, reason, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(rewardId, employeeId, employee.fullName, type, amount, reason, now)
      .run();

    return jsonResponse({ 
      message: `Đã thêm ${type === 'reward' ? 'thưởng' : 'phạt'} cho nhân viên ${employee.fullName}`,
      rewardId 
    }, 200, origin);
  } catch (error) {
    console.error("Lỗi thêm thưởng/phạt:", error);
    return jsonResponse({ message: "Lỗi thêm thưởng/phạt!", error: error.message }, 500, origin);
  }
}

// Hàm lấy lịch sử thưởng/phạt
async function handleGetRewards(url, db, origin) {
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

    const employeeId = url.searchParams.get("employeeId");
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    // Build query with JOIN to get store information  
    let query = `
      SELECT r.*, e.storeName 
      FROM rewards r 
      JOIN employees e ON r.employeeId = e.employeeId 
      WHERE 1=1
    `;
    let params = [];

    // Only filter by store if user is NOT Admin (AD)
    if (currentUser.position !== 'AD') {
      query += " AND e.storeName = ?";
      params.push(currentUser.storeName);
    }

    if (employeeId) {
      query += " AND r.employeeId = ?";
      params.push(employeeId);
    }

    query += " ORDER BY r.createdAt DESC LIMIT ?";
    params.push(limit);

    const rewards = await db.prepare(query).bind(...params).all();

    if (!rewards.results || rewards.results.length === 0) {
      return jsonResponse([], 200, origin);
    }

    return jsonResponse(rewards.results, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy lịch sử thưởng/phạt:", error);
    return jsonResponse({ message: "Lỗi lấy lịch sử thưởng/phạt!", error: error.message }, 500, origin);
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
      attendanceRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      rewardsCount: Math.floor(Math.random() * 5) // 0-5 rewards
    };

    return jsonResponse({ stats }, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy thống kê cá nhân:", error);
    return jsonResponse({ message: "Lỗi lấy thống kê cá nhân!", error: error.message }, 500, origin);
  }
}

// Enhanced Request System Handlers
async function handleCreateAttendanceRequest(body, db, origin) {
  try {
    const { 
      employeeId, 
      fullName, 
      position, 
      attendanceType, 
      requestDate, 
      requestTime, 
      reason, 
      status = 'pending', 
      submittedAt 
    } = body;

    if (!employeeId || !attendanceType || !requestDate || !reason) {
      return jsonResponse({ message: "Thiếu thông tin bắt buộc!" }, 400, origin);
    }

    // Create attendance_requests table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS attendance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        position TEXT NOT NULL,
        attendance_type TEXT NOT NULL,
        request_date TEXT NOT NULL,
        request_time TEXT,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        submitted_at TEXT NOT NULL,
        processed_at TEXT,
        processed_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert the attendance request
    const result = await db.prepare(`
      INSERT INTO attendance_requests 
      (employee_id, full_name, position, attendance_type, request_date, request_time, reason, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      employeeId, 
      fullName, 
      position, 
      attendanceType, 
      requestDate, 
      requestTime, 
      reason, 
      status, 
      submittedAt
    ).run();

    return jsonResponse({ 
      message: "Đơn từ chấm công đã được gửi thành công!", 
      requestId: result.lastRowId 
    }, 201, origin);

  } catch (error) {
    console.error("Lỗi tạo đơn từ chấm công:", error);
    return jsonResponse({ message: "Lỗi tạo đơn từ chấm công!", error: error.message }, 500, origin);
  }
}

async function handleCreateTaskAssignment(body, db, origin) {
  try {
    const { 
      createdBy, 
      creatorName, 
      title, 
      description, 
      deadline, 
      priority, 
      participants = [], 
      supporters = [], 
      assigners = [], 
      status = 'active', 
      createdAt 
    } = body;

    if (!createdBy || !title || !description || !deadline) {
      return jsonResponse({ message: "Thiếu thông tin bắt buộc!" }, 400, origin);
    }

    // Create task_assignments table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_by TEXT NOT NULL,
        creator_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        deadline TEXT NOT NULL,
        priority TEXT NOT NULL,
        participants TEXT, -- JSON array
        supporters TEXT, -- JSON array
        assigners TEXT, -- JSON array
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      )
    `);

    // Insert the task assignment
    const result = await db.prepare(`
      INSERT INTO task_assignments 
      (created_by, creator_name, title, description, deadline, priority, participants, supporters, assigners, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      createdBy, 
      creatorName, 
      title, 
      description, 
      deadline, 
      priority, 
      JSON.stringify(participants), 
      JSON.stringify(supporters), 
      JSON.stringify(assigners), 
      status, 
      createdAt
    ).run();

    return jsonResponse({ 
      message: "Nhiệm vụ đã được tạo thành công!", 
      taskId: result.lastRowId 
    }, 201, origin);

  } catch (error) {
    console.error("Lỗi tạo nhiệm vụ:", error);
    return jsonResponse({ message: "Lỗi tạo nhiệm vụ!", error: error.message }, 500, origin);
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
        "getPendingRequests", "getTasks", "getRewards", "getPermissions",
        "getShiftAssignments", "assignShift", "getCurrentShift", "getWeeklyShifts",
        "getAttendanceData", "checkIn", "checkOut", "createAttendanceRequest", "createTaskAssignment"
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
          case "getShiftAssignments":
            return await handleGetShiftAssignments(url, db, ALLOWED_ORIGIN);
          case "assignShift":
            return await handleAssignShift(body, db, ALLOWED_ORIGIN);
          case "loginUser":
            return await loginUser(body, db, ALLOWED_ORIGIN);
          case "updateUser":
            return await updateUser(body, request.userId, db, ALLOWED_ORIGIN);
          case "addReward":
            return await handleAddReward(body, db, ALLOWED_ORIGIN);
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
          case "createAttendanceRequest":
            return await handleCreateAttendanceRequest(body, db, ALLOWED_ORIGIN);
          case "createTaskAssignment":
            return await handleCreateTaskAssignment(body, db, ALLOWED_ORIGIN);
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
          case "checkIn":
            return await handleCheckIn(body, db, ALLOWED_ORIGIN);
          case "checkOut":
            return await handleCheckOut(body, db, ALLOWED_ORIGIN);
          case "getPendingRequests":
            return await handleGetPendingRequests(db, ALLOWED_ORIGIN);
          case "getDashboardStats":
            return await handleGetDashboardStats(db, ALLOWED_ORIGIN);
          case "getRewards":
            return await handleGetRewards(url, db, ALLOWED_ORIGIN);
          case "getTasks":
            return await handleGetTasks(url, db, ALLOWED_ORIGIN);
          case "getPermissions":
            return await handleGetPermissions(url, db, ALLOWED_ORIGIN);
          case "getPendingRegistrations":
            return await handleGetPendingRegistrations(url, db, ALLOWED_ORIGIN);
          case "getPersonalStats":
            return await handleGetPersonalStats(url, db, ALLOWED_ORIGIN);
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
