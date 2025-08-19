# HR Management System - RESTful API Refactor

Complete conversion from query-based routing (`?action=`) to modern RESTful API with proper CORS, authentication middleware, and React integration.

## 🎯 What Changed

### **FROM: Query-based Routing**
```
POST /worker.js?action=login
GET /worker.js?action=getUsers&token=abc123
```

### **TO: RESTful API with `/Home/api` prefix**
```
POST /Home/api/auth/login
GET /Home/api/users
Authorization: Bearer abc123
```

## 🏗️ Architecture Overview

### **Backend: Cloudflare Worker**
- **File**: `/Home/api/worker.js`
- **Router**: Custom router with parameterized path support
- **Authentication**: Bearer token middleware with D1 session storage
- **CORS**: Environment-based whitelist (supports development & production)
- **JSON Responses**: Standardized `{ok: true, data}` or `{ok: false, error}` format

### **Frontend: React + Vite**
- **API Client**: `/react-hr-system/src/lib/apiClient.js`
- **Services**: Organized by domain (auth, users, stores, dashboard, etc.)
- **Integration**: Updated hooks to use real API endpoints

## 📁 File Structure

```
/Home/api/
├── worker.js              # 🆕 RESTful Cloudflare Worker
├── wrangler.toml          # 🆕 Cloudflare configuration
├── schema.sql             # 🆕 D1 database schema
├── test-api.sh            # 🆕 API testing script
├── worker_old.js          # 📦 Backup of original worker
└── worker_backup.js       # 📦 Another backup

/react-hr-system/src/lib/
├── apiClient.js           # 🆕 Base API client with auth interceptor
├── services/              # 🆕 Service layer
│   ├── auth.service.js    # Authentication endpoints
│   ├── users.service.js   # User management endpoints  
│   ├── stores.service.js  # Store listing endpoints
│   ├── dashboard.service.js # Dashboard statistics
│   └── index.js          # Service exports
└── auth.js               # ✏️ Updated to use real API
```

## 🛠️ Setup Instructions

### **1. Cloudflare Worker Setup**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create hr-management-db

# Create KV namespace
wrangler kv:namespace create "KV_STORE"

# Update wrangler.toml with your IDs
# (Replace placeholders with actual IDs from above commands)
```

### **2. Database Setup**

```bash
# Apply database schema
wrangler d1 execute hr-management-db --file=schema.sql

# Add SendGrid API key to KV
wrangler kv:key put --binding=KV_STORE "SENDGRID_API_KEY" "your-sendgrid-api-key"
```

### **3. Environment Configuration**

Update `wrangler.toml`:
```toml
[env.development]
vars = { ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:3000" }

[env.production] 
vars = { ALLOWED_ORIGINS = "https://yourdomain.com" }
```

### **4. Deploy Worker**

```bash
# Development deployment
wrangler deploy --env development

# Production deployment  
wrangler deploy --env production
```

### **5. React App Setup**

```bash
cd react-hr-system

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your worker URL
echo "VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev/Home/api" > .env.local

# Start development server
npm run dev
```

## 🔗 API Endpoints

### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Employee login |
| POST | `/auth/register` | Send verification email |
| POST | `/auth/register/verify` | Complete registration |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/logout` | Logout and clear session |

### **Users & Employees**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List employees (with role/pagination) |
| GET | `/users/:employeeId` | Get employee details |
| PUT | `/users/:employeeId` | Update employee info |
| PUT | `/users/:employeeId/permissions` | Update permissions |
| GET | `/users/:employeeId/history` | Get change history |

### **Stores**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stores` | List stores (with search/pagination) |

### **Registration Queue**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/registrations/pending` | Get pending registrations (role-filtered) |
| POST | `/registrations/approve` | Approve registration |
| POST | `/registrations/reject` | Reject registration |

### **Tasks**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (with filters) |
| POST | `/tasks` | Create new task |
| POST | `/tasks/:taskId/approve` | Approve task |
| POST | `/tasks/:taskId/reject` | Reject task |

### **Dashboard**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |
| GET | `/dashboard/personal-stats` | Get personal statistics |

### **Health Check**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health status |

## 🧪 Testing

### **Automated API Testing**
```bash
# Make script executable
chmod +x /Home/api/test-api.sh

# Run comprehensive API tests
./test-api.sh
```

### **Manual Testing with curl**
```bash
# Health check
curl -X GET "http://localhost:8787/Home/api/health"

# CORS preflight
curl -X OPTIONS "http://localhost:8787/Home/api/auth/login" \
  -H "Origin: http://localhost:5173"

# Login
curl -X POST "http://localhost:8787/Home/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"loginEmployeeId": "TEST001", "loginPassword": "password123"}'

# Authenticated request
curl -X GET "http://localhost:8787/Home/api/auth/me" \
  -H "Authorization: Bearer your-token-here"
```

## ✅ Migration Checklist

- [x] **CORS Whitelist**: Environment-based origins (dev/prod)
- [x] **RESTful Routes**: `/Home/api` prefix with proper HTTP methods
- [x] **Authentication Middleware**: Bearer token with session validation  
- [x] **JSON Standards**: Consistent `{ok, data|error}` response format
- [x] **SendGrid Integration**: Preserved email verification system
- [x] **Session Management**: 8-hour expiry with 5-minute buffer
- [x] **Password Security**: PBKDF2 with 100,000 iterations
- [x] **React Integration**: API client + services + updated hooks
- [x] **Database Schema**: Complete D1 schema with indexes
- [x] **Error Handling**: Proper HTTP status codes and error details
- [x] **Development Tools**: Test script + environment templates

## 🚀 Key Features Preserved

✅ **SendGrid Email Verification**: Complete 2-step registration flow  
✅ **Role-based Access Control**: AD/AM/QL/NV permission hierarchy  
✅ **Session Security**: D1-based session storage with timezone handling  
✅ **GPS Attendance**: Location-based check-in/check-out (ready for integration)  
✅ **Task Management**: Work assignments with approval workflows  
✅ **Audit Trail**: History logging for all user changes  
✅ **Store Management**: Multi-location support with regional filtering  

## 🔧 Production Considerations

### **Security**
- Set proper `ALLOWED_ORIGINS` for production domains
- Rotate SendGrid API key periodically
- Monitor D1 database access patterns
- Implement rate limiting if needed

### **Performance**
- D1 indexes are configured for optimal query performance
- Session cleanup runs weekly (configurable)
- API responses are optimized for minimal data transfer

### **Monitoring**
- All errors are logged with structured data
- Health endpoint provides system status
- Authentication failures are tracked

## 📞 Support

The refactored system maintains 100% functional compatibility while providing:
- Better developer experience with RESTful endpoints
- Improved security with proper CORS and token handling
- Enhanced maintainability with organized service architecture
- Future-ready foundation for additional features

All original functionality is preserved and enhanced! 🎉