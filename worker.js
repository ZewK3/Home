const ALLOWED_ORIGIN = "https://zewk.fun";

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
    
    if (now > expiresAt) {
      // Clean up expired session
      await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
      return jsonResponse("Phiên làm việc đã hết hạn - vui lòng đăng nhập lại", 401, allowedOrigin);
    }

    // Update last access time for session tracking
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
  expiresAt.setHours(expiresAt.getHours() + 1); // Phiên hết hạn sau 1 giờ

  try {
    const existingSession = await db
      .prepare("SELECT * FROM sessions WHERE employeeId = ?")
      .bind(employeeId)
      .first();

    const query = existingSession
      ? "UPDATE sessions SET token = ?, expiresAt = ? WHERE employeeId = ?"
      : "INSERT INTO sessions (employeeId, token, expiresAt) VALUES (?, ?, ?)";
    const params = existingSession
      ? [token, expiresAt.toISOString(), employeeId]
      : [employeeId, token, expiresAt.toISOString()];

    await db.prepare(query).bind(...params).run();

    return jsonResponse({ token, expiresAt: expiresAt.toISOString() }, 200, allowedOrigin);
  } catch (error) {
    console.error("Lỗi tạo hoặc cập nhật phiên:", error);
    return jsonResponse({ message: "Lỗi tạo hoặc cập nhật phiên!", error: error.message }, 500, allowedOrigin);
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

  return await createSession(id, db, origin);
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

  return await createSession(user.id, db, origin);
}

// Hàm lấy thông tin người dùng (khách hàng)
async function getUser(url, db, origin) {
  const token = url.searchParams.get("token");
  const session = await checkSessionMiddleware(token, db, origin);
  if (session instanceof Response) return session;

  const user = await db
    .prepare("SELECT name, email, exp, rank FROM users WHERE id = ?")
    .bind(session.employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Người dùng không tồn tại!" }, 404, origin);

  return jsonResponse({ name: user.name, email: user.email, exp: user.exp, rank: user.rank }, 200, origin);
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
  const stores = await db.prepare("SELECT storeId, storeName FROM stores").all();
  if (!stores.results || stores.results.length === 0) {
    return jsonResponse({ message: "Không tìm thấy cửa hàng nào!" }, 404, origin);
  }
  return jsonResponse(stores.results, 200, origin);
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

  const user = await db
    .prepare("SELECT password, salt FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();

  if (!user) return jsonResponse({ message: "Mã nhân viên không tồn tại!" }, 404, origin);

  const storedHash = Uint8Array.from(user.password.split(",").map(Number));
  const storedSalt = Uint8Array.from(user.salt.split(",").map(Number));
  const isPasswordCorrect = await verifyPassword(storedHash, storedSalt, password);

  if (!isPasswordCorrect) return jsonResponse({ message: "Mật khẩu không chính xác!" }, 401, origin);

  const session = await createSession(employeeId, db, origin);
  if (session instanceof Response && session.status === 200) {
    const token = await db
      .prepare("SELECT * FROM sessions WHERE employeeId = ?")
      .bind(employeeId)
      .first();
    return jsonResponse(token, 200, origin);
  }
  return jsonResponse({ message: "Lỗi tạo phiên làm việc!" }, 500, origin);
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
async function handleRegister(body, db, origin) {
  const { employeeId, fullName, storeName, password, phone, email, position, joinDate, pstatus } = body;
  if (!employeeId || !fullName || !storeName || !password) {
    return jsonResponse({ message: "Dữ liệu không hợp lệ!" }, 400, origin);
  }

  const existingUser = await db
    .prepare("SELECT employeeId FROM employees WHERE employeeId = ?")
    .bind(employeeId)
    .first();
  if (existingUser) return jsonResponse({ message: "Mã nhân viên đã tồn tại!" }, 209, origin);

  const existingPhone = await db
    .prepare("SELECT employeeId FROM employees WHERE phone = ?")
    .bind(phone)
    .first();
  if (existingPhone) return jsonResponse({ message: "Số điện thoại đã tồn tại!" }, 210, origin);

  const existingEmail = await db
    .prepare("SELECT employeeId FROM employees WHERE email = ?")
    .bind(email)
    .first();
  if (existingEmail) return jsonResponse({ message: "Email đã tồn tại!" }, 211, origin);

  const { hash, salt } = await hashPasswordPBKDF2(password);
  await db
    .prepare(
      "INSERT INTO queue (employeeId, password, salt, fullName, storeName, position, joinDate, phone, email, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)"
    )
    .bind(
      employeeId,
      Array.from(hash).join(","),
      Array.from(salt).join(","),
      fullName,
      storeName,
      position || "NV",
      joinDate || null,
      phone || null,
      email || null,
      pstatus || "Wait"
    )
    .run();

  return jsonResponse({ message: "Yêu cầu của bạn đã được gửi" }, 200, origin);
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
        "getOrderById", "updateUser", "adjustUserExp"
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
          case "login":
            return await handleLogin(body, db, ALLOWED_ORIGIN);
          case "register":
            return await handleRegister(body, db, ALLOWED_ORIGIN);
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
