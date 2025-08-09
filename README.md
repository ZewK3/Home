# HR Management System - React Version

Hệ thống quản lý nhân sự được xây dựng bằng ReactJS với kiến trúc hiện đại và giao diện chuyên nghiệp.

## 🚀 Cấu Trúc Dự Án

```
Home/
├── node_modules/         # Thư viện cài qua npm
├── public/               # Chứa file tĩnh, index.html, favicon...
│   ├── index.html        # File HTML gốc
│   └── favicon-32x32.png # Icon ứng dụng
├── src/                  # Toàn bộ mã nguồn React
│   ├── assets/           # Hình ảnh, CSS, fonts, JS utils...
│   │   ├── css/          # CSS modules
│   │   ├── js/           # JavaScript utilities
│   │   ├── icons/        # Icons và hình ảnh
│   │   ├── api/          # API backend files
│   │   └── data/         # Database schema và test data
│   ├── components/       # Các Component dùng chung
│   │   ├── AuthContext.jsx     # Context quản lý authentication
│   │   ├── ProtectedRoute.jsx  # Component bảo vệ route
│   │   ├── Header.jsx          # Header component
│   │   ├── Sidebar.jsx         # Sidebar navigation
│   │   ├── MobileNavigation.jsx # Mobile menu
│   │   ├── MainContent.jsx     # Main content router
│   │   ├── TestingPanel.jsx    # Development testing panel
│   │   └── sections/           # Các section components
│   │       ├── DashboardHome.jsx
│   │       ├── Timesheet.jsx
│   │       ├── Attendance.jsx
│   │       ├── WorkTasks.jsx
│   │       ├── AttendanceRequest.jsx
│   │       ├── TaskAssignment.jsx
│   │       ├── ShiftAssignment.jsx
│   │       ├── PermissionManagement.jsx
│   │       └── Analytics.jsx
│   ├── pages/            # Các trang chính
│   │   ├── Login.jsx     # Trang đăng nhập
│   │   └── Dashboard.jsx # Trang dashboard chính
│   ├── App.jsx           # Component gốc
│   ├── main.jsx          # File khởi tạo React
│   ├── App.css           # CSS của App
│   └── index.css         # CSS chung
├── api/                  # Backend API files (preserved)
├── legacy-html/          # Backup của HTML/JS cũ
├── .github/              # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml    # Auto deployment to GitHub Pages
├── .gitignore
├── package.json          # Danh sách dependencies, scripts
├── README.md             # Mô tả project
└── vite.config.js        # Cấu hình Vite với GitHub Pages support

```

## 🛠 Công Nghệ Sử Dụng

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.0
- **Routing**: React Router DOM 7.8.0
- **HTTP Client**: Axios 1.11.0
- **Icons**: Material Icons Round + Lucide React
- **Styling**: CSS Modules + CSS Variables

## 📦 Cài Đặt và Chạy

### Prerequisites
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: http://localhost:3000

### Build for Cloudflare Pages
```bash
npm run build:cloudflare
```

### Preview production build
```bash
npm run preview
```

## 🔐 Tài Khoản Test

Hệ thống có sẵn các tài khoản test với các quyền khác nhau:

| Loại tài khoản | Username | Password | Quyền hạn |
|----------------|----------|----------|-----------|
| **Admin** | ADMIN001 | password123 | Toàn quyền hệ thống |
| **Area Manager** | AM001-AM004 | password123 | Quản lý khu vực |
| **Store Leader** | QL001-QL003 | password123 | Quản lý cửa hàng |
| **Employee** | NV001-NV006 | password123 | Nhân viên cơ bản |

## 🌟 Tính Năng Chính

### ✅ Đã Triển Khai
- **Authentication System**: Đăng nhập/đăng xuất với JWT
- **Responsive Design**: Hỗ trợ mobile và desktop
- **Dark/Light Mode**: Chuyển đổi theme
- **Role-based Access**: Phân quyền theo vai trò
- **Dashboard Overview**: Thống kê tổng quan
- **Navigation System**: Menu sidebar và mobile
- **Testing Panel**: Panel test cho mobile debugging

### 🚧 Đang Phát Triển
- **Timesheet Management**: Quản lý bảng công
- **Attendance Tracking**: Chấm công GPS
- **Task Management**: Quản lý công việc
- **Request System**: Hệ thống đơn từ
- **Analytics & Reports**: Báo cáo và thống kê
- **User Management**: Quản lý người dùng
- **Permission Management**: Phân quyền chi tiết

## 🎨 Kiến Trúc CSS

CSS được tổ chức theo module:

- **base.css**: Variables, themes, typography
- **components.css**: Buttons, forms, cards, tables
- **navigation.css**: Sidebar, header, mobile menu
- **modals.css**: Modal components
- **containers.css**: Container layouts
- **react-dashboard.css**: React-specific dashboard styles

## 🔧 API Integration

Backend API sử dụng Cloudflare Workers:
- **Endpoint**: https://zewk.tocotoco.workers.dev/
- **Database**: SQL với schema từ `Tabbel.sql`
- **Authentication**: JWT tokens

## 📱 Mobile Support

- Responsive design cho tất cả screen sizes
- Mobile navigation menu
- Touch-friendly interfaces
- Mobile console logging cho debugging

## 🧪 Testing & Debugging

### Testing Panel
- Accessible via red button (bottom-right)
- Test functions cho navigation, API, auth
- Mobile console logging
- Real-time error tracking

### Development Features
- Hot reload với Vite
- ESLint cho code quality
- Source maps cho debugging
- Development mode indicators

## 🚀 Deployment

### Cloudflare Pages (Recommended)
Dự án được cấu hình để deploy trên Cloudflare Pages:
- **Build Command**: `npm run build:cloudflare`
- **Output Directory**: `dist`
- **SPA Routing**: Được hỗ trợ với `_redirects` file
- **Security Headers**: Được cấu hình trong `_headers` file

Chi tiết deployment: Xem [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

### GitHub Pages (Backup)
GitHub Actions workflow được backup để sử dụng khi cần:
- Rename `deploy-github.yml.backup` thành `deploy.yml`
- Update `vite.config.js` base path về `/Home/`
- Update React Router basename về `/Home`

### Vercel (Alternative)
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Netlify (Alternative)  
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

## 📞 Hỗ Trợ

- **Bugs**: Tạo issue trong GitHub repository
- **Features**: Đề xuất tính năng mới
- **Documentation**: Xem thêm trong `/docs`

## 📄 License

Copyright © 2025 ZewK3. All rights reserved.

---

*Dự án được migrate từ vanilla HTML/JS/CSS sang React architecture để cải thiện maintainability và developer experience.*
