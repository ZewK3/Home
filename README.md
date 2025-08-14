# HR Management System - Project Structure Documentation

## 📁 Project Directory Structure

```
HR-Management-System/
├── index.html                 # Main landing page with system overview
├── assets/                    # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── dash.css           # Main dashboard styles
│   │   ├── professional-auth.css # Professional authentication styles
│   │   └── professional-user-management.css # Professional UI components
│   ├── js/                    # JavaScript modules
│   │   ├── api-cache.js       # API caching and data management
│   │   ├── auth-manager.js    # Authentication management
│   │   ├── config.js          # Application configuration
│   │   ├── content-manager.js # Main content and feature management
│   │   ├── dashboard-handler.js # Dashboard initialization
│   │   ├── main-init.js       # Application initialization
│   │   ├── menu-manager.js    # Menu and navigation setup
│   │   ├── navigation-manager.js # Enhanced navigation with testing
│   │   ├── script.js          # Additional utilities
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
├── api/                       # Backend API
│   └── worker.js              # Cloudflare Workers API handler
├── data/                      # Database and test data
│   ├── Tabbel.sql             # Main database schema
│   ├── Table.txt              # Additional table information
│   └── test-users.sql         # Test users with AD permissions
├── config/                    # Configuration files (for future use)
├── tests/                     # Test files (for future use)
└── docs/                      # Documentation (for future use)
```

## 🚀 Getting Started

### 1. Project Setup

1. **Clone or download** the project files
2. **Open** `index.html` in a web browser to access the landing page
3. **Navigate** to authentication via the landing page or directly open `pages/auth/index.html`
4. **Login** with test credentials (see Test Users section below)

### 2. Test Users & Permissions

The system includes comprehensive test users with different permission levels:

#### System Administrator (Full Access)
- **ID:** `ADMIN001`
- **Name:** Nguyễn System Admin
- **Role:** AD (Administrator)
- **Password:** `password123`
- **Permissions:** All system functions

#### Area Managers (Regional Management)
- **IDs:** `AM001`, `AM002`, `AM003`, `AM004`
- **Role:** AM (Area Manager)
- **Password:** `password123`
- **Permissions:** Regional management, scheduling, reports

#### Store Managers (Store Management)
- **IDs:** `QL001`, `QL002`, `QL003`
- **Role:** QL (Store Manager)
- **Password:** `password123`
- **Permissions:** Store-level management, scheduling, attendance

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

### Core Tables
- **employees:** User accounts and authentication
- **permissions:** Role-based access control
- **stores:** Store locations with GPS coordinates
- **attendance:** GPS-based attendance tracking
- **timesheets:** Monthly timesheet data
- **tasks:** Work tasks and assignments
- **attendance_requests:** Leave and attendance requests
- **notifications:** System notifications

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
1. **Components:** Add reusable components to `components/` directory
2. **Pages:** Create new pages in `pages/` with appropriate subdirectories
3. **Styles:** Add component-specific styles or extend `assets/css/`
4. **Navigation:** Update `navigation-manager.js` for new routes

### File Organization
- **Keep assets organized:** CSS in `assets/css/`, JS in `assets/js/`
- **Separate concerns:** Business logic in separate JS modules
- **Use consistent naming:** Follow kebab-case for files, camelCase for functions
- **Document changes:** Update this README when adding major features

## 📞 Support

For issues or questions:
1. **Check the testing interface** for immediate diagnostics
2. **Review browser console** for error messages
3. **Verify user permissions** match required access levels
4. **Test with different user roles** to isolate permission issues

---

**Last Updated:** January 2025  
**Version:** 2.0.0  
**License:** Internal Use Only