# HR Management System - Complete Project Documentation

## 📁 Project Directory Structure

```
HR-Management-System/
├── index.html                 # Main landing page with system overview
├── API_DOCUMENTATION.md       # Complete API documentation with examples
├── assets/                    # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── dash.css           # Main dashboard styles
│   │   └── reg&log.css        # Authentication page styles
│   ├── js/                    # JavaScript modules
│   │   ├── auth-manager.js    # Authentication management
│   │   ├── config.js          # Application configuration
│   │   ├── content-manager.js # Main content and feature management
│   │   ├── dashboard-handler.js # Dashboard initialization
│   │   ├── enhanced-auth-manager.js # Advanced authentication
│   │   ├── landing.js         # Landing page functionality
│   │   ├── main-init.js       # Application initialization
│   │   ├── menu-manager.js    # Menu and navigation setup
│   │   ├── script.js          # Additional utilities
│   │   ├── secure-storage.js  # Secure data storage
│   │   ├── security-examples.js # Security implementations
│   │   ├── theme-manager.js   # Light/dark theme management
│   │   └── utils.js           # Utility functions
│   ├── icons/                 # Icons and favicons
│   │   └── favicon-32x32.png
│   ├── images/                # Images (for future use)
│   └── fonts/                 # Custom fonts (for future use)
├── pages/                     # Application pages
│   ├── auth/                  # Authentication pages
│   │   └── index.html         # Login/register page
│   ├── dashboard/             # Main dashboard
│   │   └── dashboard.html     # HR management dashboard
│   ├── reports/               # Reports (for future use)
│   └── admin/                 # Admin pages (for future use)
├── components/                # Reusable UI components (for future use)
│   ├── forms/
│   ├── modals/
│   ├── widgets/
│   └── charts/
├── api/                       # Backend API (Service-Oriented Architecture)
│   ├── worker.js              # Original Cloudflare Workers handler
│   └── worker-service.js      # Enhanced service-oriented API (MAIN)
├── data/                      # Database and test data
│   ├── Tabbel.sql             # Main database schema
│   ├── Table.txt              # Additional table information
│   └── test-users.sql         # Test users with AD permissions
├── config/                    # Configuration files (for future use)
├── tests/                     # Test files (for future use)
└── docs/                      # Documentation (for future use)
```

## 🚀 Latest Updates (v3.0)

### ✅ **Complete API Integration**
- **Primary API**: `api/worker-service.js` - Service-oriented architecture with 54+ endpoints
- **Enhanced Database Schema v3.0** compatibility 
- **Full client-server synchronization** achieved
- **Production-ready** with transaction support and audit trails

### ✅ **API Documentation**
- **Comprehensive documentation**: `API_DOCUMENTATION.md` 
- **54+ API endpoints** documented with examples
- **Request/Response formats** for all functions
- **Error handling guide** and usage examples

## 🚀 Getting Started

### 1. Project Setup

1. **Clone or download** the project files
2. **Configure API**: Update `assets/js/config.js` with your Cloudflare Workers URL
3. **Deploy API**: Upload `api/worker-service.js` to Cloudflare Workers
4. **Database**: Import Enhanced HR Database Schema v3.0 
5. **Open** `index.html` in a web browser to access the landing page
6. **Navigate** to authentication via the landing page or directly open `pages/auth/index.html`
7. **Login** with test credentials (see Test Users section below)

### 2. API Configuration

**Primary Endpoint**: `https://your-worker.workers.dev/`  
**Documentation**: See `API_DOCUMENTATION.md` for complete API reference

### 2. Test Users & Permissions

The system includes comprehensive test users with different permission levels:

#### System Administrator (Full Access)
- **ID:** `ADMIN001`
- **Name:** Nguyễn System Admin
- **Role:** AD (Administrator)
- **Password:** `password123`
- **Permissions:** All system functions including API management

#### Area Managers (Regional Management)
- **IDs:** `AM001`, `AM002`, `AM003`, `AM004`
- **Role:** AM (Area Manager)
- **Password:** `password123`
- **Permissions:** Regional management, scheduling, reports, task approval

#### Store Managers (Store Management)
- **IDs:** `QL001`, `QL002`, `QL003`
- **Role:** QL (Store Manager)
- **Password:** `password123`
- **Permissions:** Store-level management, scheduling, attendance, employee oversight

#### Employees (Basic Access)
- **IDs:** `NV001`, `NV002`, `NV003`, `NV004`, `NV005`, `NV006`
- **Role:** NV (Employee)
- **Password:** `password123`
- **Permissions:** Basic attendance, task viewing, request submission

## 🔧 Navigation & Features

### Main Navigation Areas

1. **📊 Dashboard**
   - System overview
   - Quick stats and KPIs
   - Recent activities

2. **⏰ Quản Lý Công (Work Management)**
   - **Bảng Công (Timesheet):** Monthly calendar view with attendance data
   - **Chấm Công (Attendance):** GPS-based check-in/out system

3. **💼 Công Việc (Work Tasks)**
   - Task assignments and management
   - Collaborative work tracking
   - Progress monitoring

4. **📝 Gửi Yêu Cầu (Submit Requests)**
   - **Đơn Từ (Attendance Requests):** Leave, forgot check-in/out requests
   - **Nhiệm Vụ (Task Assignment):** Create and assign tasks
   - **Phân Ca (Shift Assignment):** Schedule management (QL/AM only)

5. **📈 Báo Cáo (Reports)**
   - Analytics and statistics
   - Performance metrics
   - Export functionality

### 🧪 Testing Interface

The system includes a comprehensive testing interface accessible via the red "Test Navigation" button in the bottom-right corner of the dashboard.

#### Testing Features:
- **Full Navigation Test:** Verify all navigation functions work
- **Individual Function Tests:** Test specific features independently
- **User Role Switching:** Quick switch between test users
- **Diagnostics:** Real-time system health checks

## 🔒 Permission System

### Role Hierarchy
```
AD (Administrator) > AM (Area Manager) > QL (Store Manager) > NV (Employee)
```

### Permission Types
- `admin`: System administration
- `schedule`: Work schedule management
- `tasks`: Task management
- `attendance`: Attendance system access
- `reports`: Analytics and reporting
- `user_management`: User account management
- `finance`: Financial management
- `system_settings`: System configuration

## 🗄️ Database Schema

### Enhanced HR Database Schema v3.0
**Full compatibility** with Enhanced_HR_Database_Schema_v3.sql

### Core Tables
- **employees:** User accounts and authentication with PBKDF2 hashing
- **permissions:** Role-based access control system
- **stores:** Store locations with GPS coordinates for attendance validation
- **attendance:** GPS-based attendance tracking with hour calculations
- **timesheets:** Monthly timesheet data with overtime tracking
- **tasks:** Work task assignments with approval workflows
- **task_comments:** Threaded commenting system for tasks
- **attendance_requests:** Leave and attendance request workflows
- **shift_assignments:** Bulk shift scheduling system
- **shift_requests:** Shift modification request workflows  
- **user_change_history:** Comprehensive audit logging for all changes
- **pending_registrations:** Registration approval process
- **notifications:** System notification management

### Advanced Features
- **Transaction Support:** Critical operations use database transactions
- **Audit Trails:** All changes logged to user_change_history table
- **PBKDF2 Password Hashing:** Secure password storage with salt
- **GPS Validation:** Location-based attendance verification
- **Timezone Handling:** Asia/Ho_Chi_Minh (+07:00) timezone throughout

### Test Data
The `data/test-users.sql` file contains:
- 15 test users across all role levels
- Sample work schedules and shift assignments
- Test tasks and assignments
- Sample attendance requests
- System notifications

## 🎨 Themes

The system supports light and dark themes:
- **Light Theme:** Professional blue and white color scheme
- **Dark Theme:** Dark backgrounds with high contrast text
- **Auto-switching:** Based on system preference or manual toggle

## 📱 Responsive Design

- **Desktop:** Full feature set with sidebar navigation
- **Tablet:** Collapsible sidebar with touch-friendly controls
- **Mobile:** Mobile-optimized navigation drawer and layouts

## 🔧 Troubleshooting

### Navigation Issues
1. **Use the Testing Interface:** Click the red "Test Navigation" button
2. **Check Console:** Look for JavaScript errors in browser console
3. **Verify User Role:** Ensure current user has appropriate permissions
4. **Clear Cache:** Clear browser cache and localStorage

### Authentication Issues
1. **Use Test Credentials:** Try the provided test user accounts
2. **Check API Connection:** Verify worker.js API is accessible
3. **Clear Storage:** Clear localStorage and cookies

### Performance Issues
1. **Check Network:** Verify internet connection for API calls
2. **Reduce Data Load:** Use pagination for large datasets
3. **Clear Cache:** Clear API cache if data appears stale

## 🚧 Development

### Adding New Features
1. **API Integration:** Update `api/worker-service.js` for new endpoints
2. **Client Integration:** Add corresponding calls in `assets/js/` modules
3. **Components:** Add reusable components to `components/` directory
4. **Pages:** Create new pages in `pages/` with appropriate subdirectories
5. **Styles:** Add component-specific styles or extend `assets/css/`
6. **Navigation:** Update navigation managers for new routes
7. **Documentation:** Update `API_DOCUMENTATION.md` for new endpoints

### API Development Guidelines
- **Service-Oriented:** Follow the pattern in `worker-service.js`
- **Database Transactions:** Use for critical operations
- **Error Handling:** Comprehensive try-catch with detailed responses  
- **Audit Trails:** Log changes to `user_change_history` table
- **Timezone:** Use TimezoneUtils for consistent +07:00 handling
- **Security:** Validate inputs and check permissions

### File Organization
- **Keep assets organized:** CSS in `assets/css/`, JS in `assets/js/`
- **Separate concerns:** Business logic in separate JS modules
- **Use consistent naming:** Follow kebab-case for files, camelCase for functions
- **Document changes:** Update README and API_DOCUMENTATION.md when adding major features
- **API First:** Design API endpoints before implementing client features

## 📞 Support

For issues or questions:
1. **Check the testing interface** for immediate diagnostics
2. **Review browser console** for error messages
3. **Verify user permissions** match required access levels
4. **Test with different user roles** to isolate permission issues

---

## 📚 Documentation

- **API Reference:** `API_DOCUMENTATION.md` - Complete API documentation with examples
- **Database Schema:** `data/Enhanced_HR_Database_Schema_v3.sql`
- **Test Data:** `data/test-users.sql` - Sample users and data

## 🔧 Technical Architecture

### Frontend
- **Vanilla JavaScript** with modular ES6 architecture
- **Responsive CSS** with light/dark theme support
- **Progressive Web App** features for mobile compatibility
- **Client-side routing** with hash-based navigation

### Backend  
- **Cloudflare Workers** with service-oriented architecture
- **D1 Database** (SQLite) with Enhanced Schema v3.0
- **SendGrid Email** integration for notifications
- **JWT Authentication** with secure token management

### Security
- **PBKDF2 Password Hashing** with salt
- **GPS-based Attendance** validation
- **Role-based Access Control** (RBAC)
- **Comprehensive Audit Trails** for all changes
- **Input Validation** and SQL injection prevention

**Last Updated:** January 2025  
**Version:** 3.0.0  
**License:** Internal Use Only