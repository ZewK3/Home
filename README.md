# 🏢 ZewK HRM System - Hệ Thống Quản Lý Nhân Sự F&B

## 📋 Tổng Quan

Hệ thống quản lý nhân sự (HRM) được thiết kế đặc biệt cho ngành F&B (Food & Beverage) với kiến trúc Single Page Application (SPA), hỗ trợ quản lý 2 phòng ban chính:
- **VP (Văn Phòng/Office)**: Bộ phận hành chính, IT, kế toán
- **CH (Cửa Hàng/Store)**: Nhân viên trực tiếp làm việc tại cửa hàng

## 🎯 Luồng Truy Cập Hệ Thống

### 1. Đăng Ký Tài Khoản (index.html)
```
Người dùng truy cập index.html
    ↓
Điền form đăng ký (fullName, email, phone, password)
    ↓
Hệ thống tự động gán departmentId = 'CH' (Cửa Hàng)
    ↓
Gửi email xác thực với mã 6 số
    ↓
Nhập mã xác thực (90 giây để làm mới mã)
    ↓
Trạng thái: pending → verified
```

**Lưu ý**: 
- Tất cả đăng ký mặc định là CH (Cửa Hàng)
- Không cần chọn phòng ban khi đăng ký
- Admin VP sẽ phê duyệt và có thể chuyển sang VP nếu cần

### 2. Phê Duyệt Đăng Ký (HRMSystem.html - Admin VP)
```
Admin VP đăng nhập HRMSystem.html
    ↓
Xem danh sách đăng ký chờ duyệt
    ↓
Kiểm tra thông tin: email, phone, fullName
    ↓
Chọn phòng ban (VP/CH) và chức vụ (position)
    ↓
Phê duyệt: verified → approved
    ↓
Tạo tài khoản employee với employeeId
```

**Quyền truy cập**:
- Chỉ VP Admin (position level 4) mới được phê duyệt
- Có thể reject nếu thông tin không hợp lệ

### 3. Đăng Nhập Hệ Thống (index.html)
```
Người dùng đăng nhập với employeeId + password
    ↓
API trả về: authToken + employee data + department + position
    ↓
Lưu vào localStorage: 
  - authToken
  - employeeId
  - departmentId
  - positionId
  - permissions (từ position.permissions)
    ↓
Redirect dựa trên department:
  - departmentId === 'VP' → HRMSystem.html
  - departmentId === 'CH' → dashboard.html
```

### 4. Sử Dụng HRM System

#### A. HRMSystem.html (VP - Văn Phòng)
```
VP User đăng nhập
    ↓
Kiểm tra permissions từ position
    ↓
Hiển thị menu theo permissions:
  - Dashboard (all)
  - Employee Management (level >= 3)
  - Approve Registration (level >= 4)
  - Departments (level >= 3)
  - Positions (level >= 3)
  - Salary Management (level >= 3)
  - Timesheet Approval (level >= 2)
  - Reports (level >= 3)
    ↓
Click menu → HRMRouter.navigateTo(module)
    ↓
Render module vào #mainContent (không reload page)
```

**VP Positions & Permissions**:
- **Admin (Level 4)**: Full access, phê duyệt đăng ký
- **Quản Lý Khu Vực (Level 3)**: Quản lý NV, lương, báo cáo
- **IT (Level 2)**: Hỗ trợ kỹ thuật, xem timesheet
- **Kế Toán (Level 2)**: Quản lý lương, báo cáo tài chính

#### B. dashboard.html (CH - Cửa Hàng)
```
CH User đăng nhập
    ↓
Kiểm tra permissions từ position
    ↓
Hiển thị menu theo permissions:
  - Dashboard (all)
  - Attendance (all) - Chấm công
  - Schedule (all) - Lịch làm việc
  - Timesheet (all) - Bảng công
  - Salary (all) - Bảng lương
  - Requests (all) - Yêu cầu nghỉ phép
  - Notifications (all) - Thông báo
  - Profile (all) - Thông tin cá nhân
    ↓
Click menu → HRMRouter.navigateTo(module)
    ↓
Render module vào #mainContent (không reload page)
```

**CH Positions & Permissions**:
- **Quản Lý LV2 (Level 3)**: Quản lý ca, duyệt yêu cầu
- **Quản Lý LV1 (Level 2)**: Quản lý ca trong shift
- **Nhân Viên LV2 (Level 1)**: Chấm công, xem lương
- **Nhân Viên LV1 (Level 1)**: Chấm công, xem lương

### 5. Quy Trình Chấm Công

#### VP (Văn Phòng) - 8 giờ/ngày, 26 ngày/tháng
```
VP Employee đăng nhập HRMSystem.html
    ↓
Không cần phân ca (workHoursPerDay = 8 cố định)
    ↓
Chấm công vào/ra mỗi ngày
    ↓
Hệ thống tự động tính:
  - Tổng ngày làm việc
  - Tổng giờ làm việc
  - Ngày nghỉ/muộn
```

#### CH (Cửa Hàng) - Theo ca làm việc
```
CH Employee đăng nhập dashboard.html
    ↓
Xem lịch ca được phân (Schedule module)
    ↓
Đến giờ làm việc → Chấm công vào
    ↓
Kết thúc ca → Chấm công ra
    ↓
Hệ thống tự động tính:
  - Số giờ làm theo ca
  - Giờ tăng ca (overtime)
  - Số ca trong tháng
```

**Lưu ý**: 
- CH có 71 loại ca khác nhau (từ 4-15 giờ)
- Ca làm việc được Admin/Manager phân công trước
- Chấm công dựa trên shift_assignments table

### 6. Quy Trình Tính Lương

#### VP (Lương Tháng) - HRMSystem.html
```
Cuối tháng → Admin VP vào Salary Management
    ↓
Click "Tính Lương Tháng X/Y"
    ↓
Hệ thống tự động:
  1. Lấy baseSalaryRate từ position (VD: 8,000,000 VNĐ)
  2. Lấy workDays từ timesheet
  3. Tính: (baseSalary / 26) × workDays
  4. Cộng bonus - trừ deduction
  5. Tạo salary_record với status = 'pending'
    ↓
Admin duyệt lương: pending → approved
    ↓
Kế toán đánh dấu đã thanh toán: approved → paid
```

**Công thức VP**:
```
totalSalary = (baseSalaryRate / standardDays) × workDays + bonus - deduction
VD: (8,000,000 / 26) × 24 + 0 - 0 = 7,384,615 VNĐ
```

#### CH (Lương Giờ) - HRMSystem.html
```
Cuối tháng → Admin VP vào Salary Management
    ↓
Click "Tính Lương Tháng X/Y"
    ↓
Hệ thống tự động:
  1. Lấy baseSalaryRate từ position (VD: 25,000 VNĐ/giờ)
  2. Lấy workHours + overtimeHours từ timesheet
  3. Tính: (rate × workHours) + (rate × 1.5 × overtimeHours)
  4. Cộng bonus - trừ deduction
  5. Tạo salary_record với status = 'pending'
    ↓
Admin duyệt lương: pending → approved
    ↓
Kế toán đánh dấu đã thanh toán: approved → paid
```

**Công thức CH**:
```
baseSalary = baseSalaryRate × workHours
overtimePay = baseSalaryRate × 1.5 × overtimeHours
totalSalary = baseSalary + overtimePay + bonus - deduction
VD: (25,000 × 200) + (25,000 × 1.5 × 10) + 0 - 0 = 5,375,000 VNĐ
```

### 7. Bảo Mật & Session

#### Kiểm Tra Xác Thực
```
User truy cập HRMSystem.html hoặc dashboard.html
    ↓
JavaScript kiểm tra localStorage.authToken
    ↓
Nếu không có token → Redirect về index.html
    ↓
Nếu có token → Gọi API với Authorization header
    ↓
API trả về 401/403 (token hết hạn/không hợp lệ)
    ↓
Xóa localStorage và redirect về index.html
```

#### Phân Quyền Theo Module
```
User click vào menu item
    ↓
HRMRouter.navigateTo(moduleName)
    ↓
Kiểm tra permissions từ localStorage
    ↓
So sánh với required permissions của module
    ↓
Nếu có quyền → Render module
    ↓
Nếu không có quyền → Hiển thị "Access Denied"
```

### 8. Maintenance Mode & 404

#### Maintenance Mode (config.js)
```
Admin bật: CONFIG.MAINTENANCE_MODE = true
    ↓
Tất cả trang redirect đến maintenance.html
    ↓
Hiển thị: "Đang bảo trì, vui lòng quay lại sau"
    ↓
Auto-refresh mỗi 5 phút để kiểm tra
    ↓
Admin tắt: CONFIG.MAINTENANCE_MODE = false
    ↓
Hệ thống hoạt động bình thường
```

#### 404 Page
```
User truy cập URL không tồn tại
    ↓
Web server redirect đến 404.html
    ↓
Hiển thị: "Không tìm thấy trang"
    ↓
Gợi ý: Kiểm tra URL, về trang chủ, quay lại
    ↓
Buttons: "Về Trang Chủ" / "Quay Lại"
```

## 🔐 Hệ Thống Permissions

### Permission Levels
- **Level 1 (Staff)**: Chỉ xem và thao tác cá nhân
- **Level 2 (Supervisor)**: Quản lý ca, duyệt timesheet
- **Level 3 (Manager)**: Quản lý nhân viên, lương, báo cáo
- **Level 4 (Admin)**: Full access, phê duyệt đăng ký

### Modules & Required Permissions

#### HRMSystem.html (VP)
```
Dashboard → Level >= 1
Employee Management → Level >= 3
Approve Registration → Level >= 4  
Departments → Level >= 3
Positions → Level >= 3
Salary Management → Level >= 3
Timesheet Approval → Level >= 2
Reports → Level >= 3
```

#### dashboard.html (CH)
```
Dashboard → Level >= 1
Attendance → Level >= 1
Schedule → Level >= 1
Timesheet → Level >= 1
Salary → Level >= 1
Requests → Level >= 1
Notifications → Level >= 1
Profile → Level >= 1
```

## 📊 Kiến Trúc Kỹ Thuật

### Frontend (SPA)
- **HRMSystem.html**: VP dashboard
- **dashboard.html**: CH dashboard
- **hrm-router.js**: Hash-based routing (#/module-name)
- **hrm-modules.js**: 16 modules (8 VP + 8 CH)
- **api-client.js**: API wrapper với authentication
- **No page reloads**: Tất cả render vào #mainContent

### Backend (Node.js + Express)
- **worker-service.js**: RESTful API server
- **42 API endpoints**: Auth, Departments, Positions, Salary, Employees, Attendance, etc.
- **Authentication**: JWT token-based
- **Database**: SQLite with 17 tables

### Database Schema
```
departments → positions → employees
                            ↓
                    attendance + shifts
                            ↓
                       timesheets
                            ↓
                      salary_records
```

## 🚀 Triển Khai

1. **Clone repository**
2. **Cài đặt dependencies**: `npm install`
3. **Tạo database**: Chạy `data/Tabbel-v2-optimized.sql`
4. **Start server**: `npm start`
5. **Truy cập**: `http://localhost:3000`

## 📞 Hỗ Trợ

- Email: support@zewk.com
- GitHub Issues: [ZewK3/Home](https://github.com/ZewK3/Home)

---

© 2024 ZewK Management System. All rights reserved.
