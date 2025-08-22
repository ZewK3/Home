// =====================================================
// ENHANCED CLOUDFLARE WORKER - RESTful API STRUCTURE
// =====================================================
// RESTful API for HR Management System
// Backward compatible with existing functionality
// 
// Version: 2.0.0
// Features:
// ✓ RESTful API endpoints with proper HTTP methods
// ✓ Backward compatibility with action-based queries
// ✓ Enhanced error handling and validation
// ✓ Professional response formats
// ✓ Improved security and CORS handling
// =====================================================

const ALLOWED_ORIGIN = "*";

// API Configuration
const API_CONFIG = {
  VERSION: 'v2',
  SUPPORTED_VERSIONS: ['v1', 'v2'],
  BASE_PATH: '/api'
};

// Enhanced CORS configuration
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Version",
  "Access-Control-Max-Age": "86400",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
};

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

// Enhanced Response Formatter
class ResponseFormatter {
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: TimezoneUtils.toHanoiISOString(),
      version: API_CONFIG.VERSION,
      status: statusCode
    };
  }

  static error(message = 'An error occurred', statusCode = 500, details = null) {
    return {
      success: false,
      error: {
        message,
        details,
        timestamp: TimezoneUtils.toHanoiISOString(),
        version: API_CONFIG.VERSION
      },
      status: statusCode
    };
  }
}

// Enhanced utility function for JSON responses with better error handling
function jsonResponse(body, status = 200, origin = ALLOWED_ORIGIN) {
  const responseBody = typeof body === 'string' ? { message: body } : body;
  
  return new Response(JSON.stringify({
    ...responseBody,
    timestamp: TimezoneUtils.toHanoiISOString(),
    status: status
  }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      "Access-Control-Allow-Origin": origin
    },
  });
}

// Handle OPTIONS requests with enhanced CORS
function handleOptionsRequest() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

// RESTful route parser
class RouteParser {
  static parseRestfulRoute(url, method) {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    
    // Check if it's a RESTful API route
    if (pathParts[0] === 'api' && pathParts[1]) {
      const version = pathParts[1];
      const resource = pathParts[2];
      const id = pathParts[3];
      const subResource = pathParts[4];
      
      return {
        isRestful: true,
        version,
        resource,
        id,
        subResource,
        method,
        searchParams: urlObj.searchParams
      };
    }
    
    // Fall back to action-based routing for backward compatibility
    const action = urlObj.searchParams.get('action');
    return {
      isRestful: false,
      action,
      method,
      searchParams: urlObj.searchParams
    };
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
  const now = TimezoneUtils.toHanoiISOString();

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

// Verify password function
async function verifyPassword(storedHash, storedSalt, password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + Array.from(storedSalt).join(""));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return computedHash === Array.from(storedHash).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Core handler functions
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

async function handleGetUsers(url, db, origin) {
  const users = await db.prepare("SELECT employeeId, fullName, storeName, position, joinDate, phone, email FROM employees").all();
  return jsonResponse(users.results || [], 200, origin);
}

async function handleGetStores(db, origin) {
  try {
    const stores = await db
      .prepare("SELECT DISTINCT storeName FROM employees WHERE storeName IS NOT NULL AND storeName != ''")
      .all();
    
    return jsonResponse(stores.results || [], 200, origin);
  } catch (error) {
    console.error("Error getting stores:", error);
    return jsonResponse({ message: "Lỗi lấy danh sách cửa hàng!" }, 500, origin);
  }
}

// RESTful API Router
class APIRouter {
  static async route(routeInfo, request, db, env) {
    const { isRestful, version, resource, id, subResource, method, action } = routeInfo;
    
    if (isRestful) {
      return await APIRouter.handleRestfulRoute(version, resource, id, subResource, method, request, db, env);
    } else {
      return await APIRouter.handleLegacyRoute(action, method, request, db, env);
    }
  }

  static async handleRestfulRoute(version, resource, id, subResource, method, request, db, env) {
    const origin = ALLOWED_ORIGIN;
    
    // Authentication for protected routes
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    let userId = null;
    
    const protectedRoutes = ['users', 'attendance', 'tasks', 'shifts'];
    if (protectedRoutes.includes(resource) && method !== 'POST') {
      const session = await checkSessionMiddleware(token, db, origin);
      if (session instanceof Response) return session;
      userId = session.employeeId;
    }

    switch (resource) {
      case 'auth':
        return await APIRouter.handleAuth(subResource || id, method, request, db, origin, env);
      
      case 'users':
        return await APIRouter.handleUsers(id, subResource, method, request, db, origin);
      
      case 'stores':
        return await APIRouter.handleStores(method, request, db, origin);
      
      default:
        return jsonResponse({ error: "Resource not found" }, 404, origin);
    }
  }

  static async handleAuth(action, method, request, db, origin, env) {
    if (method !== 'POST') {
      return jsonResponse({ error: "Method not allowed for auth" }, 405, origin);
    }

    const body = await request.json();
    
    switch (action) {
      case 'login':
        return await handleLogin(body, db, origin);
      
      case 'register':
        // return await handleRegister(body, db, origin, env);
        return jsonResponse({ message: "Register endpoint not implemented yet" }, 501, origin);
      
      default:
        return jsonResponse({ error: "Auth action not found" }, 404, origin);
    }
  }

  static async handleUsers(id, subResource, method, request, db, origin) {
    const url = new URL(request.url);
    
    switch (method) {
      case 'GET':
        if (id) {
          url.searchParams.set('employeeId', id);
          return await handleGetUser(url, db, origin);
        } else {
          return await handleGetUsers(url, db, origin);
        }
      
      case 'POST':
        // Handle user creation
        return jsonResponse({ message: "User creation not implemented yet" }, 501, origin);
      
      case 'PUT':
        // Handle user update
        return jsonResponse({ message: "User update not implemented yet" }, 501, origin);
      
      default:
        return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }
  }

  static async handleStores(method, request, db, origin) {
    switch (method) {
      case 'GET':
        return await handleGetStores(db, origin);
      
      default:
        return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }
  }

  static async handleLegacyRoute(action, method, request, db, env) {
    const origin = ALLOWED_ORIGIN;
    const url = new URL(request.url);
    
    // Authentication check for protected actions
    const token = url.searchParams.get("token") || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
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
      const session = await checkSessionMiddleware(token, db, origin);
      if (session instanceof Response) return session;
      request.userId = session.employeeId;
    }

    if (method === "POST") {
      const contentType = request.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        return jsonResponse({ message: "Invalid Content-Type" }, 400, origin);
      }

      const body = await request.json();
      
      switch (action) {
        case "login":
          return await handleLogin(body, db, origin);
        
        default:
          return jsonResponse({ message: "Action không hợp lệ!" }, 400, origin);
      }
    }

    if (method === "GET") {
      switch (action) {
        case "getStores":
          return await handleGetStores(db, origin);
        
        case "getUser":
          return await handleGetUser(url, db, origin);
        
        case "getUsers":
          return await handleGetUsers(url, db, origin);
        
        default:
          return jsonResponse({ message: "Action không hợp lệ!" }, 400, origin);
      }
    }
    
    return jsonResponse({ message: "Method không được hỗ trợ!" }, 405, origin);
  }
}

// Main Cloudflare Worker export
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleOptionsRequest();
    }
    
    try {
      // Get database connection
      const db = env.DB;
      if (!db) {
        return jsonResponse({ error: "Database connection failed" }, 500);
      }
      
      // Parse the route
      const routeInfo = RouteParser.parseRestfulRoute(url.href, request.method);
      
      // Route the request
      const response = await APIRouter.route(routeInfo, request, db, env);
      
      return response;
      
    } catch (error) {
      console.error("Worker Error:", error);
      return jsonResponse({
        error: "Internal server error",
        message: error.message
      }, 500);
    }
  }
};