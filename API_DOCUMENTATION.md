# 📡 API Documentation - ZewK HRM System

## Base URL
```
http://localhost:3000/api
```

## Authentication
Tất cả APIs (trừ login, register, verify) yêu cầu header:
```
Authorization: Bearer <authToken>
```

---

## 🔐 Authentication APIs

### 1. Register
```http
POST /api/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0901234567",
  "password": "password123",
  "departmentId": "CH"  // Tự động gán bởi frontend
}

Response 200:
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
  "pendingId": 1
}
```

### 2. Verify Email
```http
POST /api/verify-code
Content-Type: application/json

{
  "email": "nguyenvana@example.com",
  "code": "123456"
}

Response 200:
{
  "success": true,
  "message": "Xác thực thành công. Vui lòng chờ admin phê duyệt."
}
```

### 3. Login
```http
POST /api/login
Content-Type: application/json

{
  "employeeId": "E001",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employee": {
    "employeeId": "E001",
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "departmentId": "VP",
    "departmentName": "Văn Phòng",
    "departmentCode": "VP",
    "positionId": "VP_KT",
    "positionName": "Kế Toán",
    "positionCode": "KT",
    "positionLevel": 2,
    "permissions": "finance,reports"
  }
}
```

---

## 🏢 Department APIs

### 1. Get All Departments
```http
GET /api/departments

Response 200:
{
  "success": true,
  "data": [
    {
      "departmentId": "VP",
      "departmentName": "Văn Phòng",
      "departmentCode": "VP",
      "description": "Office department",
      "workHoursPerDay": 8,
      "workDaysPerMonth": 26,
      "requiresShiftAssignment": 0,
      "employeeCount": 12
    },
    {
      "departmentId": "CH",
      "departmentName": "Cửa Hàng",
      "departmentCode": "CH",
      "description": "Store department",
      "workHoursPerDay": 8,
      "workDaysPerMonth": 26,
      "requiresShiftAssignment": 1,
      "employeeCount": 45
    }
  ]
}
```

### 2. Get Department by ID
```http
GET /api/departments/VP

Response 200:
{
  "success": true,
  "data": {
    "departmentId": "VP",
    "departmentName": "Văn Phòng",
    "departmentCode": "VP",
    "description": "Office department",
    "workHoursPerDay": 8,
    "workDaysPerMonth": 26,
    "requiresShiftAssignment": 0,
    "employeeCount": 12
  }
}
```

---

## 👔 Position APIs

### 1. Get All Positions (with filter)
```http
GET /api/positions?departmentId=CH

Response 200:
{
  "success": true,
  "data": [
    {
      "positionId": "CH_NV_LV1",
      "departmentId": "CH",
      "positionName": "Nhân Viên LV1",
      "positionCode": "NV_LV1",
      "positionLevel": 1,
      "baseSalaryRate": 25000,
      "salaryType": "hourly",
      "description": "Entry level staff",
      "permissions": "",
      "employeeCount": 20
    },
    {
      "positionId": "CH_QL_LV1",
      "departmentId": "CH",
      "positionName": "Quản Lý LV1",
      "positionCode": "QL_LV1",
      "positionLevel": 2,
      "baseSalaryRate": 35000,
      "salaryType": "hourly",
      "description": "Shift supervisor",
      "permissions": "shift_management",
      "employeeCount": 8
    }
  ]
}
```

### 2. Get Position by ID
```http
GET /api/positions/VP_KT

Response 200:
{
  "success": true,
  "data": {
    "positionId": "VP_KT",
    "departmentId": "VP",
    "positionName": "Kế Toán",
    "positionCode": "KT",
    "positionLevel": 2,
    "baseSalaryRate": 8000000,
    "salaryType": "monthly",
    "description": "Accounting staff",
    "permissions": "finance,reports",
    "employeeCount": 3
  }
}
```

---

## 💰 Salary APIs

### 1. Get Salary Records
```http
GET /api/salary/records?employeeId=E001&month=11&year=2024&status=approved

Response 200:
{
  "success": true,
  "data": [
    {
      "salaryId": 1,
      "employeeId": "E001",
      "employeeName": "Nguyễn Văn A",
      "month": 11,
      "year": 2024,
      "departmentId": "VP",
      "departmentName": "Văn Phòng",
      "positionId": "VP_KT",
      "positionName": "Kế Toán",
      "baseSalary": 7384615.38,
      "workDays": 24,
      "workHours": 0,
      "overtimeHours": 0,
      "overtimePay": 0,
      "bonus": 0,
      "deduction": 0,
      "totalSalary": 7384615.38,
      "status": "approved",
      "approvedAt": "2024-11-30T10:00:00Z",
      "createdAt": "2024-11-30T09:00:00Z"
    }
  ]
}
```

### 2. Calculate Salary
```http
POST /api/salary/calculate
Content-Type: application/json

{
  "employeeId": "E001",
  "month": 11,
  "year": 2024,
  "bonus": 0,
  "deduction": 0
}

Response 200:
{
  "success": true,
  "message": "Tính lương thành công",
  "salaryId": 1,
  "data": {
    "baseSalary": 7384615.38,
    "workDays": 24,
    "standardDays": 26,
    "workHours": 0,
    "overtimeHours": 0,
    "overtimePay": 0,
    "bonus": 0,
    "deduction": 0,
    "totalSalary": 7384615.38,
    "salaryType": "monthly"
  }
}
```

### 3. Approve Salary
```http
POST /api/salary/approve
Content-Type: application/json

{
  "salaryId": 1
}

Response 200:
{
  "success": true,
  "message": "Đã duyệt lương thành công"
}
```

### 4. Mark Salary as Paid
```http
POST /api/salary/mark-paid
Content-Type: application/json

{
  "salaryId": 1
}

Response 200:
{
  "success": true,
  "message": "Đã đánh dấu lương đã thanh toán"
}
```

---

## 📋 Timesheet APIs

### 1. Get Monthly Timesheet
```http
GET /api/timesheets/monthly?employeeId=E001&month=11&year=2024

Response 200:
{
  "success": true,
  "data": {
    "timesheetId": 1,
    "employeeId": "E001",
    "employeeName": "Nguyễn Văn A",
    "month": 11,
    "year": 2024,
    "totalDays": 26,
    "presentDays": 24,
    "absentDays": 2,
    "lateDays": 1,
    "totalHours": 192,
    "overtimeHours": 0,
    "createdAt": "2024-11-30T09:00:00Z"
  }
}
```

**Lưu ý**: API tự động tạo timesheet từ attendance data nếu chưa tồn tại.

---

## 🔔 Notification APIs

### 1. Get Notifications
```http
GET /api/notifications?employeeId=E001&unreadOnly=true&limit=50&offset=0

Response 200:
{
  "success": true,
  "data": [
    {
      "notificationId": 1,
      "employeeId": "E001",
      "title": "Lương tháng 11 đã được duyệt",
      "message": "Lương tháng 11/2024 của bạn đã được phê duyệt. Tổng: 7,384,615 VNĐ",
      "type": "success",
      "isRead": 0,
      "actionUrl": "#/salary",
      "createdAt": "2024-11-30T10:00:00Z"
    }
  ],
  "unreadCount": 5,
  "total": 20
}
```

### 2. Create Notification
```http
POST /api/notifications
Content-Type: application/json

{
  "employeeId": "E001",
  "title": "Yêu cầu nghỉ phép được duyệt",
  "message": "Yêu cầu nghỉ phép ngày 15/11 của bạn đã được phê duyệt",
  "type": "success",
  "actionUrl": "#/requests"
}

Response 200:
{
  "success": true,
  "message": "Tạo thông báo thành công",
  "notificationId": 2
}
```

### 3. Mark as Read
```http
POST /api/notifications/mark-read
Content-Type: application/json

{
  "notificationId": 1,
  "employeeId": "E001"
}

Response 200:
{
  "success": true,
  "message": "Đã đánh dấu đọc thông báo"
}
```

### 4. Mark All as Read
```http
POST /api/notifications/mark-all-read
Content-Type: application/json

{
  "employeeId": "E001"
}

Response 200:
{
  "success": true,
  "message": "Đã đánh dấu đọc tất cả thông báo"
}
```

---

## 👥 Employee APIs

### 1. Get Employees (with filters)
```http
GET /api/employees?departmentId=VP&positionId=VP_KT&limit=10&page=1

Response 200:
{
  "success": true,
  "data": [
    {
      "employeeId": "E001",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "departmentId": "VP",
      "departmentName": "Văn Phòng",
      "positionId": "VP_KT",
      "positionName": "Kế Toán",
      "positionLevel": 2,
      "hire_date": "2024-01-15",
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## 📝 Registration APIs

### 1. Get Pending Registrations
```http
GET /api/registrations/pending

Response 200:
{
  "success": true,
  "data": [
    {
      "pendingId": 1,
      "fullName": "Trần Thị B",
      "email": "tranthib@example.com",
      "phone": "0912345678",
      "departmentId": "CH",
      "positionId": null,
      "status": "verified",
      "verificationCode": "123456",
      "createdAt": "2024-11-30T08:00:00Z"
    }
  ]
}
```

### 2. Approve Registration
```http
POST /api/registrations/approve
Content-Type: application/json

{
  "pendingId": 1,
  "departmentId": "CH",
  "positionId": "CH_NV_LV1"
}

Response 200:
{
  "success": true,
  "message": "Đã phê duyệt đăng ký",
  "employeeId": "E002"
}
```

### 3. Reject Registration
```http
POST /api/registrations/reject
Content-Type: application/json

{
  "pendingId": 1,
  "reason": "Thông tin không hợp lệ"
}

Response 200:
{
  "success": true,
  "message": "Đã từ chối đăng ký"
}
```

---

## 🔄 Attendance APIs

### 1. Clock In
```http
POST /api/attendance/clock-in
Content-Type: application/json

{
  "employeeId": "E001",
  "storeId": "STORE001"
}

Response 200:
{
  "success": true,
  "message": "Chấm công vào thành công",
  "attendanceId": 1,
  "checkInTime": "2024-11-30T08:00:00Z"
}
```

### 2. Clock Out
```http
POST /api/attendance/clock-out
Content-Type: application/json

{
  "employeeId": "E001",
  "attendanceId": 1
}

Response 200:
{
  "success": true,
  "message": "Chấm công ra thành công",
  "checkOutTime": "2024-11-30T17:00:00Z",
  "totalHours": 9
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập chức năng này"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy dữ liệu"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi hệ thống. Vui lòng thử lại sau"
}
```

---

## 📊 Rate Limiting

- **Authentication APIs**: 5 requests/minute
- **Other APIs**: 100 requests/minute

## 🔒 Security Notes

1. Tất cả mật khẩu được hash bằng bcrypt
2. JWT token hết hạn sau 24 giờ
3. Email verification code hết hạn sau 10 phút
4. Tất cả APIs yêu cầu HTTPS trong production
5. CORS được cấu hình chỉ cho phép origin được phép

---

© 2024 ZewK Management System. All rights reserved.
