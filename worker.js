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
function calculateRank(exp) {
  if (exp >= 5000) return "Kim Cương";
  if (exp >= 2000) return "Bạch Kim";
  if (exp >= 1000) return "Vàng";
  if (exp >= 500) return "Bạc";
  return "Đồng";
}

// Hàm đăng ký người dùng (khách hàng)
async function registerUser(body, db, origin) {
  const { name, email, password } = body;
  if (!name || name.trim() === "" || !email || email.trim() === "" || !password || password.trim() === "") {
    return jsonResponse({ message: "Thiếu thông tin hoặc thông tin không hợp lệ!" }, 400, origin);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!emailRegex.test(email) && !phoneRegex.test(email)) {
    return jsonResponse({ message: "Email hoặc số điện thoại không hợp lệ!" }, 400, origin);
  }

  if (password.length < 6) {
    return jsonResponse({ message: "Mật khẩu phải có ít nhất 6 ký tự!" }, 400, origin);
  }

  const existing = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (existing) return jsonResponse({ message: "Email đã tồn tại!" }, 409, origin);

  const hashedPassword = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await db
      .prepare("INSERT INTO users (id, name, email, password, createdAt, exp, rank) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, name, email, hashedPassword, now, 0, "Đồng")
      .run();
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return jsonResponse({ message: "Lỗi tạo người dùng!", error: error.message }, 500, origin);
  }

  const sessionResult = await createSession(id, db, origin);
  if (sessionResult.success) {
    return jsonResponse(sessionResult, 200, origin);
  } else {
    return jsonResponse({ message: "Lỗi tạo phiên làm việc!", error: sessionResult.error }, 500, origin);
  }
}

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

// Hàm điều chỉnh điểm kinh nghiệm người dùng (dành cho admin)
async function adjustUserExp(body, db, origin) {
  const { userId, expChange } = body;

  if (!userId || typeof expChange !== "number") {
    return jsonResponse({ message: "Thiếu userId hoặc expChange không hợp lệ!" }, 400, origin);
  }

  const user = await db.prepare("SELECT exp FROM users WHERE id = ?").bind(userId).first();
  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  const newExp = Math.max(0, (user.exp || 0) + expChange); // Đảm bảo điểm không âm
  const newRank = calculateRank(newExp);

  try {
    await db
      .prepare("UPDATE users SET exp = ?, rank = ? WHERE id = ?")
      .bind(newExp, newRank, userId)
      .run();
    return jsonResponse({ success: true, newExp, newRank }, 200, origin);
  } catch (error) {
    console.error("Lỗi điều chỉnh điểm:", error);
    return jsonResponse({ message: "Lỗi điều chỉnh điểm!", error: error.message }, 500, origin);
  }
}

// Hàm lưu đơn hàng (cập nhật để thêm thông tin giao hàng)
async function saveOrder(body, userId, db, origin) {
  const { cart, status, total, deliveryAddress, distance, duration } = body;
  
  if (!Array.isArray(cart) || cart.length === 0 || !status || typeof total !== "number") {
    return jsonResponse({ message: "Dữ liệu đơn hàng không hợp lệ!" }, 400, origin);
  }

  // Kiểm tra dữ liệu cart chi tiết
  for (const item of cart) {
    if (!item.name || typeof item.price !== "number" || typeof item.quantity !== "number") {
      return jsonResponse({ message: "Dữ liệu sản phẩm trong giỏ hàng không hợp lệ!" }, 400, origin);
    }
  }

  const user = await db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  try {
    await db
      .prepare("INSERT INTO orders (orderId, userId, cart, status, total, createdAt, deliveryAddress, distance, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(orderId, userId, JSON.stringify(cart), status, total, now, deliveryAddress || null, distance || null, duration || null)
      .run();
  } catch (error) {
    console.error("Lỗi khi lưu đơn hàng:", error);
    return jsonResponse({ message: "Lỗi lưu đơn hàng!", error: error.message }, 500, origin);
  }

  return jsonResponse({ orderId }, 200, origin);
}

// Hàm hủy đơn hàng
async function cancelOrder(url, db, origin) {
  const token = url.searchParams.get("token");
  const orderId = url.searchParams.get("orderId");

  if (!orderId) return jsonResponse({ message: "Thiếu orderId!" }, 400, origin);

  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const order = await db.prepare("SELECT * FROM orders WHERE orderId = ? AND userId = ?").bind(orderId, session.employeeId).first();
  if (!order) return jsonResponse({ message: "Đơn hàng không tồn tại hoặc không thuộc về bạn!" }, 404, origin);

  if (order.status !== "pending") {
    return jsonResponse({ message: "Chỉ có thể hủy đơn hàng ở trạng thái 'pending'!" }, 400, origin);
  }

  try {
    await db.prepare("UPDATE orders SET status = 'canceled' WHERE orderId = ?").bind(orderId).run();
    return jsonResponse({ success: true, message: "Đơn hàng đã được hủy!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi hủy đơn hàng:", error);
    return jsonResponse({ message: "Lỗi hủy đơn hàng!", error: error.message }, 500, origin);
  }
}

// Hàm lấy chi tiết đơn hàng theo ID
async function getOrderById(url, db, origin) {
  const token = url.searchParams.get("token");
  const orderId = url.searchParams.get("orderId");

  if (!orderId) return jsonResponse({ message: "Thiếu orderId!" }, 400, origin);

  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const order = await db.prepare("SELECT * FROM orders WHERE orderId = ? AND userId = ?").bind(orderId, session.employeeId).first();
  if (!order) return jsonResponse({ message: "Đơn hàng không tồn tại hoặc không thuộc về bạn!" }, 404, origin);

  return jsonResponse({
    orderId: order.orderId,
    cart: JSON.parse(order.cart),
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt,
    deliveryAddress: order.deliveryAddress,
    distance: order.distance,
    duration: order.duration
  }, 200, origin);
}

// Hàm cập nhật trạng thái đơn hàng và tính điểm
async function updateOrderStatus(url, db, origin) {
  const token = url.searchParams.get("token");
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("status");

  if (!orderId || !status) return jsonResponse({ message: "Thiếu orderId hoặc status!" }, 400, origin);
  if (!["pending", "success", "canceled"].includes(status)) {
    return jsonResponse({ message: "Trạng thái không hợp lệ!" }, 400, origin);
  }

  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const order = await db.prepare("SELECT * FROM orders WHERE orderId = ? AND userId = ?").bind(orderId, session.employeeId).first();
  if (!order) return jsonResponse({ message: "Đơn hàng không tồn tại hoặc không thuộc về bạn!" }, 404, origin);

  await db.prepare("UPDATE orders SET status = ? WHERE orderId = ?").bind(status, orderId).run();

  if (status === "success") {
    const total = Number(order.total);
    const expGain = Math.floor(total / 1000);
    const user = await db.prepare("SELECT exp FROM users WHERE id = ?").bind(session.employeeId).first();
    if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

    const newExp = (user.exp || 0) + expGain;
    const newRank = calculateRank(newExp);

    await db
      .prepare("UPDATE users SET exp = ?, rank = ? WHERE id = ?")
      .bind(newExp, newRank, session.employeeId)
      .run();

    return jsonResponse({ success: true, gainedExp: expGain, newExp, newRank }, 200, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
}

// Hàm lấy danh sách đơn hàng
async function getOrders(url, db, origin) {
  const token = url.searchParams.get("token");
  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const orders = await db
    .prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC")
    .bind(session.employeeId)
    .all();

  const result = orders.results.map(order => ({
    orderId: order.orderId,
    cart: JSON.parse(order.cart),
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt,
    deliveryAddress: order.deliveryAddress,
    distance: order.distance,
    duration: order.duration
  }));

  return jsonResponse({ orders: result }, 200, origin);
}

// Hàm lấy danh sách cửa hàng
async function handleGetStores(db, origin) {
  try {
    const stores = await db.prepare("SELECT storeId, storeName FROM stores").all();
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

// Hàm lấy giao dịch
async function handleGetTransaction(url, db, origin) {
  const startDate = url.searchParams.get("startDate");
  if (!startDate) return jsonResponse({ message: "Thiếu startDate!" }, 400, origin);

  try {
    const transactions = await db
      .prepare("SELECT id, amount, status FROM 'transaction' WHERE date = ?")
      .bind(startDate)
      .all();

    if (transactions.results.length === 0) {
      return jsonResponse({ message: "Không tìm thấy giao dịch trong ngày này" }, 404, origin);
    }
    return jsonResponse(transactions.results, 200, origin);
  } catch (error) {
    console.error("Lỗi khi lấy giao dịch:", error);
    return jsonResponse({ message: "Lỗi server", error: error.message }, 500, origin);
  }
}

// Hàm kiểm tra trạng thái giao dịch
async function checkTransactionStatus(transactionId, db) {
  if (!transactionId) {
    console.error("Thiếu transactionId!");
    return { success: false, message: "Thiếu transactionId!" };
  }

  const payment = await db
    .prepare('SELECT extractedID, "transaction", dateTime, description FROM payment WHERE extractedID = ?')
    .bind(transactionId)
    .first();

  if (!payment) {
    console.log(`Không tìm thấy giao dịch với extractedID: ${transactionId}`);
    return { success: false, message: "Giao dịch không tồn tại!" };
  }

  return {
    success: true,
    id: payment.extractedID,
    amount: payment.transaction,
    dateTime: payment.dateTime,
    description: payment.description,
  };
}

// Hàm lưu thanh toán
async function handleSavePayment(body, db, origin) {
  const { emails } = body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  const stmt = db.prepare(
    'INSERT INTO payment ("transaction", accountNumber, dateTime, description, extractedID) VALUES (?, ?, ?, ?, ?)'
  );
  const inserts = emails.map(email =>
    stmt.bind(email.transaction, email.accountNumber, email.dateTime, email.description, email.extractedID)
  );

  await db.batch(inserts);
  return jsonResponse({ message: "Dữ liệu đã được lưu thành công!" }, 200, origin);
}

// Hàm lưu giao dịch
async function handleSaveTransaction(body, db, origin) {
  const { id, amount, status, date } = body;
  if (!id || !amount || !status || !date) {
    return jsonResponse({ message: "Thiếu thông tin giao dịch!" }, 400, origin);
  }

  if (status !== "success" && status !== "failed") {
    return jsonResponse({ message: "Trạng thái không hợp lệ!" }, 400, origin);
  }

  try {
    await db
      .prepare("INSERT INTO 'transaction' (id, amount, status, date) VALUES (?, ?, ?, ?)")
      .bind(id, amount, status, date)
      .run();
    return jsonResponse({ message: "Giao dịch đã được lưu thành công!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi khi lưu giao dịch:", error);
    return jsonResponse({ message: "Lỗi lưu giao dịch!", error: error.message }, 500, origin);
  }
}

// Hàm kiểm tra lịch làm việc
async function handleCheckSchedule(url, db, origin) {
  const employeeId = url.searchParams.get("employeeId");
  if (!employeeId) return jsonResponse({ message: "Mã nhân viên không hợp lệ!" }, 400, origin);

  const result = await db
    .prepare("SELECT createdAt, T2, T3, T4, T5, T6, T7, CN FROM workSchedules WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  if (!result) {
    return jsonResponse({ message: "Nhân viên chưa đăng ký lịch làm!" }, 202, origin);
  }

  const shifts = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(day => ({
    day,
    time: result[day] || "Off",
  }));

  return jsonResponse({ shifts, message: "Nhân viên đã đăng ký lịch làm!" }, 200, origin);
}

// Hàm lưu lịch làm việc
async function handleSaveSchedule(body, db, origin) {
  const { employeeId, shifts } = body;
  if (!employeeId || !shifts || !Array.isArray(shifts) || shifts.length === 0) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 401, origin);
  }

  const employee = await db
    .prepare("SELECT employeeId, fullName, storeName FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  if (!employee) return jsonResponse({ message: "Mã nhân viên không tồn tại!" }, 404, origin);

  const scheduleData = { T2: null, T3: null, T4: null, T5: null, T6: null, T7: null, CN: null };
  for (const shift of shifts) {
    const { day, start, end } = shift;
    if (end - start < 4) return jsonResponse({ message: `Ca làm tối thiểu 4h ${day}!` }, 402, origin);

    const dayColumn = { T2: "T2", T3: "T3", T4: "T4", T5: "T5", T6: "T6", T7: "T7", CN: "CN" }[day];
    if (!dayColumn) return jsonResponse({ message: `Ngày ${day} không hợp lệ!` }, 403, origin);

    scheduleData[dayColumn] = `${String(start).padStart(2, "0")}:00-${String(end).padStart(2, "0")}:00`;
  }

  try {
    await db
      .prepare(
        "INSERT INTO workSchedules (employeeId, fullName, storeName, T2, T3, T4, T5, T6, T7, CN) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        employeeId,
        employee.fullName,
        employee.storeName,
        scheduleData.T2,
        scheduleData.T3,
        scheduleData.T4,
        scheduleData.T5,
        scheduleData.T6,
        scheduleData.T7,
        scheduleData.CN
      )
      .run();
    return jsonResponse({ message: "Lịch làm việc đã được lưu thành công!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi lưu lịch làm việc:", error);
    return jsonResponse({ message: "Lỗi lưu lịch làm việc!", error: error.message }, 500, origin);
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

// Hàm lấy tin nhắn
async function handleGetChat(url, db, origin) {
  const limit = 50;
  const lastId = parseInt(url.searchParams.get("lastId"));

  const query = lastId
    ? "SELECT * FROM messages WHERE id > ? ORDER BY id ASC LIMIT ?"
    : "SELECT * FROM messages ORDER BY id DESC LIMIT ?";
  const params = lastId ? [lastId, limit] : [limit];

  const messages = await db.prepare(query).bind(...params).all();
  if (!messages.results || messages.results.length === 0) {
    return jsonResponse({ message: "Không có tin nhắn nào!" }, 200, origin);
  }

  const sortedMessages = lastId ? messages.results : messages.results.reverse();
  return jsonResponse(sortedMessages, 200, origin);
}

// Hàm lưu tin nhắn
async function handleSaveChat(body, db, origin) {
  const { employeeId, fullName, position, message } = body;
  if (!employeeId || !fullName || !message) {
    return jsonResponse({ message: "Thiếu dữ liệu cần thiết!" }, 400, origin);
  }

  const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const formattedTime = vietnamTime.toISOString().replace(/T/, " ").replace(/\..+/, "");

  try {
    await db
      .prepare("INSERT INTO messages (employeeId, fullName, position, message, time) VALUES (?, ?, ?, ?, ?)")
      .bind(employeeId, fullName, position, message, formattedTime)
      .run();
    return jsonResponse({ message: "Gửi tin nhắn thành công!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi lưu tin nhắn:", error);
    return jsonResponse({ message: "Lỗi lưu tin nhắn!", error: error.message }, 500, origin);
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

// Hàm lấy lịch làm việc hôm nay
async function handleGetTodaySchedule(db, origin) {
  try {
    const today = new Date();
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][today.getDay()];
    
    const schedules = await db
      .prepare(`SELECT employeeId, fullName, ${dayName} as todaySchedule FROM workSchedules WHERE ${dayName} IS NOT NULL AND ${dayName} != 'Off'`)
      .all();

    if (!schedules.results) {
      return jsonResponse([], 200, origin);
    }

    const todaySchedules = schedules.results.map(schedule => ({
      employeeId: schedule.employeeId,
      fullName: schedule.fullName,
      schedule: schedule.todaySchedule,
      day: dayName
    }));

    return jsonResponse(todaySchedules, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy lịch hôm nay:", error);
    return jsonResponse([], 200, origin);
  }
}

// Hàm lấy yêu cầu đang chờ xử lý
async function handleGetPendingRequests(db, origin) {
  try {
    // Sử dụng bảng messages để lấy các tin nhắn có chứa [YÊU CẦU]
    const pendingMessages = await db
      .prepare("SELECT * FROM messages WHERE message LIKE '%[YÊU CẦU]%' ORDER BY time DESC LIMIT 10")
      .all();

    if (!pendingMessages.results) {
      return jsonResponse([], 200, origin);
    }

    const pendingRequests = pendingMessages.results.map(msg => ({
      id: msg.id,
      employeeId: msg.employeeId,
      employeeName: msg.fullName,
      message: msg.message,
      time: msg.time,
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
    
    // Đếm số nhân viên có lịch hôm nay
    const today = new Date();
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][today.getDay()];
    const todaySchedules = await db
      .prepare(`SELECT COUNT(*) as count FROM workSchedules WHERE ${dayName} IS NOT NULL AND ${dayName} != 'Off'`)
      .first();

    // Đếm tin nhắn chưa đọc (tin nhắn trong 24h qua)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentMessages = await db
      .prepare("SELECT COUNT(*) as count FROM messages WHERE time >= ?")
      .bind(twentyFourHoursAgo)
      .first();

    // Đếm yêu cầu đang chờ
    const pendingRequests = await db
      .prepare("SELECT COUNT(*) as count FROM messages WHERE message LIKE '%[YÊU CẦU]%'")
      .first();

    const stats = {
      totalEmployees: totalEmployees?.count || 0,
      todaySchedules: todaySchedules?.count || 0,
      recentMessages: recentMessages?.count || 0,
      pendingRequests: pendingRequests?.count || 0,
      currentDay: dayName
    };

    return jsonResponse(stats, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy thống kê dashboard:", error);
    return jsonResponse({
      totalEmployees: 0,
      todaySchedules: 0,
      recentMessages: 0,
      pendingRequests: 0,
      currentDay: 'T2'
    }, 200, origin);
  }
}

// Hàm lấy hoạt động gần đây
async function handleGetRecentActivities(url, db, origin) {
  try {
    const token = url.searchParams.get("token");
    const session = await checkSessionMiddleware(token, db, origin);
    if (session instanceof Response) return session;

    const activities = await db
      .prepare("SELECT employeeId, fullName, position, message, time FROM messages ORDER BY time DESC LIMIT 15")
      .all();

    if (!activities.results) {
      return jsonResponse([], 200, origin);
    }

    const recentActivities = activities.results.map(activity => ({
      id: activity.id || Math.random(),
      employeeId: activity.employeeId,
      employeeName: activity.fullName,
      position: activity.position || 'NV',
      action: activity.message.substring(0, 100) + (activity.message.length > 100 ? '...' : ''),
      time: activity.time,
      type: activity.message.includes('[YÊU CẦU]') ? 'request' : 'message'
    }));

    return jsonResponse(recentActivities, 200, origin);
  } catch (error) {
    console.error("Lỗi lấy hoạt động gần đây:", error);
    return jsonResponse([], 200, origin);
  }
}

// Hàm xóa tin nhắn với kiểm tra thời gian
async function handleDeleteMessage(body, db, origin) {
  const { messageId } = body;
  if (!messageId) {
    return jsonResponse({ message: "Thiếu messageId!" }, 400, origin);
  }

  try {
    // Lấy thông tin tin nhắn
    const message = await db
      .prepare("SELECT * FROM messages WHERE id = ?")
      .bind(messageId)
      .first();

    if (!message) {
      return jsonResponse({ message: "Tin nhắn không tồn tại!" }, 404, origin);
    }

    // Kiểm tra thời gian (chỉ cho phép xóa trong vòng 5 phút)
    const messageTime = new Date(message.time);
    const currentTime = new Date();
    const timeDiff = (currentTime - messageTime) / 1000; // Chuyển sang giây

    if (timeDiff > 300) { // 5 phút = 300 giây
      return jsonResponse({ message: "Chỉ có thể xóa tin nhắn trong vòng 5 phút!" }, 403, origin);
    }

    // Xóa tin nhắn
    await db.prepare("DELETE FROM messages WHERE id = ?").bind(messageId).run();
    
    return jsonResponse({ message: "Đã xóa tin nhắn!" }, 200, origin);
  } catch (error) {
    console.error("Lỗi xóa tin nhắn:", error);
    return jsonResponse({ message: "Lỗi xóa tin nhắn!", error: error.message }, 500, origin);
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
      // Nếu không có bảng tasks riêng, có thể cập nhật trong messages hoặc tạo entry mới
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

    // Cũng lưu như một tin nhắn để theo dõi
    await db
      .prepare("INSERT INTO messages (employeeId, fullName, position, message, time) VALUES (?, ?, ?, ?, ?)")
      .bind(employeeId, fullName || 'Nhân viên', position || 'NV', `[YÊU CẦU] ${taskType}: ${content}`, now)
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

    // Get current user's position/role
    const currentUser = await db
      .prepare("SELECT position FROM employees WHERE employeeId = ?")
      .bind(session.employeeId)
      .first();

    if (!currentUser) {
      return jsonResponse({ message: "Không tìm thấy thông tin người dùng!" }, 404, origin);
    }

    const store = url.searchParams.get("store");
    let query = "SELECT * FROM queue WHERE status = 'Wait'";
    let params = [];

    // Only apply store filtering if user is NOT Admin (AD)
    // AD can see all pending registrations from all stores
    if (currentUser.position !== 'AD' && store) {
      query += " AND storeName = ?";
      params.push(store);
    }

    query += " ORDER BY createdAt DESC";

    const registrations = await db.prepare(query).bind(...params).all();

    if (!registrations.results) {
      return jsonResponse([], 200, origin);
    }

    // Format response without sensitive data
    const pendingRequests = registrations.results.map(reg => ({
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

export default {
  async scheduled(event, env, ctx) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today.getDay() !== 1) {
        console.log(`Today is ${today.toLocaleDateString("en-US", { weekday: "long" })}. No action required.`);
        return;
      }

      console.log("It's Monday! Clearing workSchedules...");
      const deleteResult = await env.D1_BINDING.prepare("DELETE FROM workSchedules").run();
      console.log(`Deleted ${deleteResult.meta.changes} rows from workSchedules.`);
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
        "update", "savedk", "checkdk", "getUser", "getUsers", 
        "saveOrder", "updateOrderStatus", "getOrders", "cancelOrder", 
        "getOrderById", "updateUser", "adjustUserExp", "getPendingRegistrations",
        "getPendingRequests", "getTasks", "getRewards", "getPermissions"
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
          case "sendMessage":
            return await handleSaveChat(body, db, ALLOWED_ORIGIN);
          case "deleteMessage":
            return await handleDeleteMessage(body, db, ALLOWED_ORIGIN);
          case "login":
            return await handleLogin(body, db, ALLOWED_ORIGIN);
          case "register":
            return await handleRegister(body, db, ALLOWED_ORIGIN, env);
          case "update":
            return await handleUpdate(body, db, ALLOWED_ORIGIN);
          case "savedk":
            return await handleSaveSchedule(body, db, ALLOWED_ORIGIN);
          case "saveTransaction":
            return await handleSaveTransaction(body, db, ALLOWED_ORIGIN);
          case "savePayment":
            return await handleSavePayment(body, db, ALLOWED_ORIGIN);
          case "registerUser":
            return await registerUser(body, db, ALLOWED_ORIGIN);
          case "loginUser":
            return await loginUser(body, db, ALLOWED_ORIGIN);
          case "saveOrder":
            return await saveOrder(body, request.userId, db, ALLOWED_ORIGIN);
          case "updateUser":
            return await updateUser(body, request.userId, db, ALLOWED_ORIGIN);
          case "adjustUserExp":
            return await adjustUserExp(body, db, ALLOWED_ORIGIN);
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
          case "approveRegistration":
            return await handleApproveRegistration(body, db, ALLOWED_ORIGIN);
          default:
            return jsonResponse({ message: "Action không hợp lệ!" }, 400);
        }
      }

      if (request.method === "GET") {
        switch (action) {
          case "getStores":
            return await handleGetStores(db, ALLOWED_ORIGIN);
          case "getMessages":
            return await handleGetChat(url, db, ALLOWED_ORIGIN);
          case "checkId":
            return await handleCheckId(url, db, ALLOWED_ORIGIN);
          case "getTransaction":
            return await handleGetTransaction(url, db, ALLOWED_ORIGIN);
          case "getUser":
            return await handleGetUser(url, db, ALLOWED_ORIGIN);
          case "getUsers":
            return await handleGetUsers(url, db, ALLOWED_ORIGIN);
          case "checkdk":
            return await handleCheckSchedule(url, db, ALLOWED_ORIGIN);
          case "User":
            return await getUser(url, db, ALLOWED_ORIGIN);
          case "updateOrderStatus":
            return await updateOrderStatus(url, db, ALLOWED_ORIGIN);
          case "getOrders":
            return await getOrders(url, db, ALLOWED_ORIGIN);
          case "cancelOrder":
            return await cancelOrder(url, db, ALLOWED_ORIGIN);
          case "getOrderById":
            return await getOrderById(url, db, ALLOWED_ORIGIN);
          case "getTodaySchedule":
            return await handleGetTodaySchedule(db, ALLOWED_ORIGIN);
          case "getPendingRequests":
            return await handleGetPendingRequests(db, ALLOWED_ORIGIN);
          case "getDashboardStats":
            return await handleGetDashboardStats(db, ALLOWED_ORIGIN);
          case "getRecentActivities":
            return await handleGetRecentActivities(url, db, ALLOWED_ORIGIN);
          case "getRewards":
            return await handleGetRewards(url, db, ALLOWED_ORIGIN);
          case "getTasks":
            return await handleGetTasks(url, db, ALLOWED_ORIGIN);
          case "getPermissions":
            return await handleGetPermissions(url, db, ALLOWED_ORIGIN);
          case "getPendingRegistrations":
            return await handleGetPendingRegistrations(url, db, ALLOWED_ORIGIN);
          case "checkTransaction":
            const transactionId = url.searchParams.get("transactionId");
            if (!transactionId) return jsonResponse({ message: "Thiếu transactionId!" }, 400);
            const result = await checkTransactionStatus(transactionId, db);
            return jsonResponse(result, result.success !== undefined ? 200 : 500);
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
