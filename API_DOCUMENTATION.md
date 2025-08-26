# HR Management System - API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints available in the HR Management System worker-service.js. The API uses HTTP methods (GET/POST) with JSON request/response format.

## Base Configuration
- **Base URL**: `https://zewk.tocotoco.workers.dev/`
- **Content-Type**: `application/json`
- **CORS**: `*` (All origins allowed)
- **Database**: Enhanced HR Database Schema v3.0
- **Timezone**: Asia/Ho_Chi_Minh (+07:00)

## Authentication
Many endpoints require authentication via token or user verification. Include authorization headers where needed.

---

# POST Endpoints

## Authentication & User Management

### 1. POST `/login`
**Mô tả**: Đăng nhập người dùng

**Request Body**:
```json
{
  "employeeId": "string",
  "password": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "user": {
    "employeeId": "NV001", 
    "name": "Nguyễn Văn A",
    "role": "NV",
    "storeId": "ST001",
    "storeName": "Cửa hàng A",
    "is_active": 1
  },
  "token": "jwt_token_here"
}
```

**Response Error (400/401)**:
```json
{
  "success": false,
  "message": "Mã nhân viên hoặc mật khẩu không đúng!"
}
```

### 2. POST `/register`
**Mô tả**: Đăng ký tài khoản mới

**Request Body**:
```json
{
  "employeeId": "string",
  "name": "string", 
  "email": "string",
  "password": "string",
  "phone": "string",
  "storeId": "string",
  "role": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đăng ký thành công! Kiểm tra email để xác nhận.",
  "verificationRequired": true
}
```

### 3. POST `/verifyEmail`
**Mô tả**: Xác thực email với mã xác nhận

**Request Body**:
```json
{
  "employeeId": "string",
  "verificationCode": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Xác thực email thành công!"
}
```

### 4. POST `/updatePersonalInfo`
**Mô tả**: Cập nhật thông tin cá nhân

**Request Body**:
```json
{
  "employeeId": "string",
  "name": "string",
  "email": "string", 
  "phone": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công!",
  "updatedUser": {
    "employeeId": "NV001",
    "name": "Nguyễn Văn A Updated",
    "email": "updated@email.com",
    "phone": "0123456789"
  }
}
```

### 5. POST `/updateUserWithHistory`
**Mô tả**: Cập nhật người dùng với lưu lịch sử thay đổi

**Request Body**:
```json
{
  "employeeId": "string",
  "updates": {
    "name": "string",
    "email": "string",
    "role": "string",
    "storeId": "string"
  },
  "changedBy": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật thành công!",
  "historyId": 123
}
```

## Attendance Management

### 6. POST `/checkIn`
**Mô tả**: Chấm công vào ca

**Request Body**:
```json
{
  "employeeId": "string",
  "latitude": "number",
  "longitude": "number",
  "address": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Chấm công vào ca thành công!",
  "attendance": {
    "id": 123,
    "employeeId": "NV001",
    "checkInTime": "2025-01-01T08:00:00.000Z",
    "checkInLocation": "10.7756, 106.7004"
  }
}
```

### 7. POST `/checkOut`  
**Mô tả**: Chấm công ra ca

**Request Body**:
```json
{
  "employeeId": "string",
  "latitude": "number", 
  "longitude": "number",
  "address": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Chấm công ra ca thành công!",
  "attendance": {
    "id": 123,
    "employeeId": "NV001",
    "checkOutTime": "2025-01-01T17:00:00.000Z",
    "totalHours": 9,
    "overtimeHours": 1
  }
}
```

### 8. POST `/processAttendance`
**Mô tả**: Xử lý dữ liệu chấm công với tính toán giờ làm

**Request Body**:
```json
{
  "employeeId": "string",
  "date": "string",
  "checkInTime": "string",
  "checkOutTime": "string",
  "workHours": "number",
  "overtimeHours": "number"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Xử lý chấm công thành công!",
  "processedData": {
    "totalHours": 8.5,
    "regularHours": 8,
    "overtimeHours": 0.5,
    "status": "completed"
  }
}
```

### 9. POST `/createAttendanceRequest`
**Mô tả**: Tạo đơn yêu cầu chấm công (quên chấm công, nghỉ phép)

**Request Body**:
```json
{
  "employeeId": "string",
  "requestType": "attendance",
  "date": "string",
  "reason": "string",
  "checkInTime": "string",
  "checkOutTime": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Tạo đơn yêu cầu thành công!",
  "requestId": 456
}
```

### 10. POST `/approveAttendanceRequest`
**Mô tả**: Phê duyệt đơn yêu cầu chấm công

**Request Body**:
```json
{
  "requestId": "number",
  "approvedBy": "string",
  "comments": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phê duyệt đơn yêu cầu thành công!"
}
```

### 11. POST `/rejectAttendanceRequest`
**Mô tả**: Từ chối đơn yêu cầu chấm công

**Request Body**:
```json
{
  "requestId": "number",
  "rejectedBy": "string",
  "reason": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Từ chối đơn yêu cầu thành công!"
}
```

## Task Management

### 12. POST `/createTaskAssignment`
**Mô tả**: Tạo và phân công nhiệm vụ

**Request Body**:
```json
{
  "title": "string",
  "description": "string", 
  "assignedTo": "string",
  "assignedBy": "string",
  "priority": "string",
  "dueDate": "string",
  "storeId": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Tạo nhiệm vụ thành công!",
  "taskId": 789
}
```

### 13. POST `/approveTask`
**Mô tả**: Phê duyệt nhiệm vụ

**Request Body**:
```json
{
  "taskId": "number",
  "approvedBy": "string",
  "comments": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phê duyệt nhiệm vụ thành công!"
}
```

### 14. POST `/rejectTask`
**Mô tả**: Từ chối nhiệm vụ

**Request Body**:
```json
{
  "taskId": "number",
  "rejectedBy": "string",
  "reason": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Từ chối nhiệm vụ thành công!"
}
```

### 15. POST `/addTaskComment`
**Mô tả**: Thêm bình luận vào nhiệm vụ

**Request Body**:
```json
{
  "taskId": "number",
  "employeeId": "string", 
  "comment": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Thêm bình luận thành công!",
  "commentId": 321
}
```

### 16. POST `/replyToComment`
**Mô tả**: Trả lời bình luận

**Request Body**:
```json
{
  "commentId": "number",
  "employeeId": "string",
  "reply": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Trả lời bình luận thành công!"
}
```

## Shift Management

### 17. POST `/assignShift`
**Mô tả**: Phân ca làm việc cho nhân viên

**Request Body**:
```json
{
  "employeeId": "string",
  "shiftType": "string",
  "startTime": "string",
  "endTime": "string",
  "date": "string",
  "storeId": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phân ca thành công!",
  "shiftId": 654
}
```

### 18. POST `/saveShiftAssignments`
**Mô tả**: Lưu phân ca hàng loạt

**Request Body**:
```json
{
  "assignments": [
    {
      "employeeId": "string",
      "date": "string", 
      "shiftType": "string",
      "startTime": "string",
      "endTime": "string"
    }
  ],
  "assignedBy": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Lưu phân ca thành công!",
  "assignedCount": 10
}
```

### 19. POST `/approveShiftRequest`
**Mô tả**: Phê duyệt yêu cầu đổi ca

**Request Body**:
```json
{
  "requestId": "number",
  "approvedBy": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phê duyệt đổi ca thành công!"
}
```

### 20. POST `/rejectShiftRequest`
**Mô tả**: Từ chối yêu cầu đổi ca

**Request Body**:
```json
{
  "requestId": "number",
  "rejectedBy": "string",
  "reason": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Từ chối đổi ca thành công!"
}
```

## Administrative Functions

### 21. POST `/approveRegistration`
**Mô tả**: Phê duyệt đăng ký tài khoản

**Request Body**:
```json
{
  "employeeId": "string",
  "approvedBy": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phê duyệt tài khoản thành công!"
}
```

### 22. POST `/approveRegistrationWithHistory`
**Mô tả**: Phê duyệt đăng ký với lưu lịch sử

**Request Body**:
```json
{
  "employeeId": "string",
  "approvedBy": "string",
  "comments": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phê duyệt tài khoản thành công!",
  "historyRecorded": true
}
```

### 23. POST `/completeRequest`
**Mô tả**: Hoàn thành yêu cầu

**Request Body**:
```json
{
  "requestId": "number",
  "completedBy": "string",
  "result": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Hoàn thành yêu cầu thành công!"
}
```

### 24. POST `/update`
**Mô tả**: Cập nhật thông tin chung

**Request Body**:
```json
{
  "table": "string",
  "data": "object",
  "conditions": "object"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật thành công!"
}
```

### 25. POST `/loginUser`
**Mô tả**: Đăng nhập người dùng (phiên bản mở rộng)

**Request Body**:
```json
{
  "employeeId": "string",
  "password": "string",
  "deviceInfo": "object"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "user": "object",
  "sessionId": "string"
}
```

### 26. POST `/updateUser`
**Mô tả**: Cập nhật thông tin người dùng

**Request Body**:
```json
{
  "employeeId": "string",
  "updates": "object"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật người dùng thành công!"
}
```

---

# GET Endpoints

## General Information

### 27. GET `/getStores`
**Mô tả**: Lấy danh sách cửa hàng

**Parameters**: None

**Response Success (200)**:
```json
{
  "success": true,
  "stores": [
    {
      "storeId": "ST001",
      "storeName": "Cửa hàng A", 
      "address": "123 Đường ABC",
      "latitude": 10.7756,
      "longitude": 106.7004,
      "manager": "QL001"
    }
  ]
}
```

### 28. GET `/getDashboardStats`
**Mô tả**: Lấy thống kê dashboard

**Parameters**: None

**Response Success (200)**:
```json
{
  "success": true,
  "stats": {
    "totalEmployees": 100,
    "presentToday": 85,
    "pendingRequests": 5,
    "completedTasks": 50,
    "todayAttendance": 85.5
  }
}
```

## User Management

### 29. GET `/getUsers?storeId=string&role=string&page=number&limit=number`
**Mô tả**: Lấy danh sách người dùng với phân trang

**Parameters**:
- `storeId` (optional): ID cửa hàng
- `role` (optional): Vai trò 
- `page` (optional): Trang (default: 1)
- `limit` (optional): Số lượng (default: 20)

**Response Success (200)**:
```json
{
  "success": true,
  "users": [
    {
      "employeeId": "NV001",
      "name": "Nguyễn Văn A",
      "role": "NV", 
      "storeId": "ST001",
      "email": "a@example.com",
      "is_active": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 30. GET `/getAllUsers?page=number&limit=number`
**Mô tả**: Lấy tất cả người dùng (Admin only)

**Parameters**:
- `page` (optional): Trang
- `limit` (optional): Số lượng

**Response Success (200)**:
```json
{
  "success": true,
  "users": "array",
  "pagination": "object"
}
```

### 31. GET `/getUser?employeeId=string`
**Mô tả**: Lấy thông tin người dùng theo ID

**Parameters**:
- `employeeId`: Mã nhân viên

**Response Success (200)**:
```json
{
  "success": true,
  "user": {
    "employeeId": "NV001",
    "name": "Nguyễn Văn A",
    "email": "a@example.com",
    "role": "NV",
    "storeId": "ST001",
    "storeName": "Cửa hàng A"
  }
}
```

### 32. GET `/checkId?employeeId=string`
**Mô tả**: Kiểm tra ID nhân viên có tồn tại

**Parameters**:
- `employeeId`: Mã nhân viên

**Response Success (200)**:
```json
{
  "success": true,
  "exists": true,
  "message": "ID đã tồn tại"
}
```

### 33. GET `/checkdk?employeeId=string`
**Mô tả**: Kiểm tra trùng lặp đăng ký

**Parameters**:
- `employeeId`: Mã nhân viên

**Response Success (200)**:
```json
{
  "success": true,
  "isDuplicate": false,
  "message": "ID có thể sử dụng"
}
```

### 34. GET `/getUserHistory?employeeId=string&page=number&limit=number`
**Mô tả**: Lấy lịch sử thay đổi của người dùng

**Parameters**:
- `employeeId`: Mã nhân viên
- `page` (optional): Trang
- `limit` (optional): Số lượng

**Response Success (200)**:
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "employeeId": "NV001",
      "changeType": "update_profile",
      "oldValue": "Old Name",
      "newValue": "New Name", 
      "changedBy": "QL001",
      "changeTime": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

### 35. GET `/getPersonalStats?employeeId=string`
**Mô tả**: Lấy thống kê cá nhân của nhân viên

**Parameters**:
- `employeeId`: Mã nhân viên

**Response Success (200)**:
```json
{
  "success": true,
  "stats": {
    "totalWorkDays": 22,
    "presentDays": 20,
    "lateDays": 2,
    "overtimeHours": 15,
    "completedTasks": 25,
    "attendanceRate": 90.9
  }
}
```

### 36. GET `/getEmployeesByStore?storeId=string`
**Mô tả**: Lấy danh sách nhân viên theo cửa hàng

**Parameters**:
- `storeId`: ID cửa hàng

**Response Success (200)**:
```json
{
  "success": true,
  "employees": [
    {
      "employeeId": "NV001",
      "name": "Nguyễn Văn A",
      "role": "NV",
      "email": "a@example.com"
    }
  ]
}
```

## Attendance & Timesheet

### 37. GET `/getAttendanceData?employeeId=string&month=number&year=number`
**Mô tả**: Lấy dữ liệu chấm công theo tháng

**Parameters**:
- `employeeId`: Mã nhân viên
- `month`: Tháng (1-12)
- `year`: Năm

**Response Success (200)**:
```json
{
  "success": true,
  "attendance": [
    {
      "date": "2025-01-01",
      "checkInTime": "08:00:00",
      "checkOutTime": "17:00:00", 
      "workHours": 8,
      "status": "present"
    }
  ]
}
```

### 38. GET `/getTimesheet?employeeId=string&month=number&year=number`
**Mô tả**: Lấy bảng chấm công chi tiết

**Parameters**:
- `employeeId`: Mã nhân viên
- `month`: Tháng
- `year`: Năm

**Response Success (200)**:
```json
{
  "success": true,
  "timesheet": {
    "employeeId": "NV001",
    "month": 1,
    "year": 2025,
    "totalWorkDays": 22,
    "totalWorkHours": 176,
    "overtimeHours": 8,
    "dailyRecords": "array"
  }
}
```

### 39. GET `/getAttendanceHistory?employeeId=string&startDate=string&endDate=string`
**Mô tả**: Lấy lịch sử chấm công theo khoảng thời gian

**Parameters**:
- `employeeId`: Mã nhân viên  
- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)

**Response Success (200)**:
```json
{
  "success": true,
  "history": [
    {
      "date": "2025-01-01",
      "checkInTime": "08:00:00",
      "checkOutTime": "17:00:00",
      "totalHours": 8,
      "location": "Cửa hàng A"
    }
  ]
}
```

### 40. GET `/getAttendanceRequests?storeId=string&status=string&page=number`
**Mô tả**: Lấy danh sách đơn yêu cầu chấm công

**Parameters**:
- `storeId` (optional): ID cửa hàng
- `status` (optional): Trạng thái (pending/approved/rejected)
- `page` (optional): Trang

**Response Success (200)**:
```json
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "employeeId": "NV001",
      "requestType": "attendance",
      "date": "2025-01-01",
      "reason": "Quên chấm công",
      "status": "pending",
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

## Task Management

### 41. GET `/getTasks?employeeId=string&status=string&page=number`
**Mô tả**: Lấy danh sách nhiệm vụ

**Parameters**:
- `employeeId` (optional): Mã nhân viên
- `status` (optional): Trạng thái
- `page` (optional): Trang

**Response Success (200)**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "title": "Kiểm tra hàng hóa",
      "description": "Kiểm tra hàng hóa mới nhập",
      "assignedTo": "NV001",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-01-01"
    }
  ]
}
```

### 42. GET `/getWorkTasks?employeeId=string&page=number&limit=number`
**Mô tả**: Lấy nhiệm vụ công việc với phân trang

**Parameters**:
- `employeeId`: Mã nhân viên
- `page` (optional): Trang
- `limit` (optional): Số lượng

**Response Success (200)**:
```json
{
  "success": true,
  "tasks": "array",
  "pagination": "object"
}
```

### 43. GET `/getTaskDetail?taskId=number`
**Mô tả**: Lấy chi tiết nhiệm vụ

**Parameters**:
- `taskId`: ID nhiệm vụ

**Response Success (200)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Kiểm tra hàng hóa",
    "description": "Chi tiết nhiệm vụ",
    "assignedTo": "NV001",
    "assignedBy": "QL001",
    "status": "pending",
    "comments": [
      {
        "id": 1,
        "comment": "Đã hoàn thành 50%",
        "createdBy": "NV001",
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 44. GET `/getApprovalTasks?managerId=string&status=string`
**Mô tả**: Lấy nhiệm vụ cần phê duyệt

**Parameters**:
- `managerId`: ID quản lý
- `status` (optional): Trạng thái

**Response Success (200)**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "title": "Nhiệm vụ cần phê duyệt",
      "assignedTo": "NV001",
      "status": "pending_approval",
      "submitDate": "2025-01-01"
    }
  ]
}
```

### 45. GET `/finalApproveTask?taskId=number&managerId=string`
**Mô tả**: Phê duyệt cuối cùng nhiệm vụ

**Parameters**:
- `taskId`: ID nhiệm vụ
- `managerId`: ID quản lý

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Phê duyệt cuối cùng thành công!"
}
```

### 46. GET `/finalRejectTask?taskId=number&managerId=string&reason=string`
**Mô tả**: Từ chối cuối cùng nhiệm vụ

**Parameters**:
- `taskId`: ID nhiệm vụ
- `managerId`: ID quản lý  
- `reason`: Lý do từ chối

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Từ chối cuối cùng thành công!"
}
```

## Shift Management

### 47. GET `/getCurrentShift?employeeId=string`
**Mô tả**: Lấy ca làm việc hiện tại

**Parameters**:
- `employeeId`: Mã nhân viên

**Response Success (200)**:
```json
{
  "success": true,
  "shift": {
    "shiftId": 1,
    "shiftType": "morning",
    "startTime": "08:00:00",
    "endTime": "17:00:00",
    "date": "2025-01-01"
  }
}
```

### 48. GET `/getWeeklyShifts?employeeId=string&weekStart=string`
**Mô tả**: Lấy lịch ca làm việc tuần

**Parameters**:
- `employeeId`: Mã nhân viên
- `weekStart`: Ngày đầu tuần (YYYY-MM-DD)

**Response Success (200)**:
```json
{
  "success": true,
  "shifts": [
    {
      "date": "2025-01-01",
      "shiftType": "morning",
      "startTime": "08:00:00",
      "endTime": "17:00:00"
    }
  ]
}
```

### 49. GET `/getShiftAssignments?storeId=string&date=string`
**Mô tả**: Lấy phân ca theo cửa hàng và ngày

**Parameters**:
- `storeId`: ID cửa hàng
- `date`: Ngày (YYYY-MM-DD)

**Response Success (200)**:
```json
{
  "success": true,
  "assignments": [
    {
      "employeeId": "NV001",
      "name": "Nguyễn Văn A",
      "shiftType": "morning",
      "startTime": "08:00:00",
      "endTime": "17:00:00"
    }
  ]
}
```

### 50. GET `/getShiftRequests?storeId=string&status=string`
**Mô tả**: Lấy yêu cầu đổi ca

**Parameters**:
- `storeId` (optional): ID cửa hàng
- `status` (optional): Trạng thái

**Response Success (200)**:
```json
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "employeeId": "NV001",
      "currentShift": "morning",
      "requestedShift": "evening",
      "date": "2025-01-01",
      "reason": "Có việc cá nhân",
      "status": "pending"
    }
  ]
}
```

## Administrative

### 51. GET `/getPermissions?employeeId=string`
**Mô tả**: Lấy quyền hạn của người dùng

**Parameters**:
- `employeeId`: Mã nhân viên

**Response Success (200)**:
```json
{
  "success": true,
  "permissions": [
    "attendance",
    "tasks",
    "reports"
  ]
}
```

### 52. GET `/getPendingRequests?storeId=string&type=string`
**Mô tả**: Lấy yêu cầu chờ xử lý

**Parameters**:
- `storeId` (optional): ID cửa hàng
- `type` (optional): Loại yêu cầu

**Response Success (200)**:
```json
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "type": "attendance",
      "employeeId": "NV001",
      "title": "Yêu cầu chấm công",
      "status": "pending",
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

### 53. GET `/getPendingRequestsCount?storeId=string`
**Mô tả**: Lấy số lượng yêu cầu chờ xử lý

**Parameters**:
- `storeId` (optional): ID cửa hàng

**Response Success (200)**:
```json
{
  "success": true,
  "count": 5,
  "breakdown": {
    "attendance": 2,
    "shift": 1,
    "task": 2
  }
}
```

### 54. GET `/getPendingRegistrations?storeId=string`
**Mô tả**: Lấy đăng ký chờ phê duyệt

**Parameters**:
- `storeId` (optional): ID cửa hàng

**Response Success (200)**:
```json
{
  "success": true,
  "registrations": [
    {
      "employeeId": "NV999",
      "name": "Nguyễn Thị B",
      "email": "b@example.com",
      "storeId": "ST001",
      "registeredAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

---

# Error Responses

## Common Error Codes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errors": ["Field employeeId is required"]
}
```

### 401 - Unauthorized  
```json
{
  "success": false,
  "message": "Không có quyền truy cập"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Không đủ quyền hạn để thực hiện thao tác này"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy dữ liệu"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi hệ thống",
  "error": "Database connection failed"
}
```

---

# Usage Examples

## Example 1: Complete Login Flow
```javascript
// 1. Login
const loginResponse = await fetch('https://zewk.tocotoco.workers.dev/?action=login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    employeeId: 'NV001',
    password: 'password123'
  })
});

const loginResult = await loginResponse.json();
if (loginResult.success) {
  localStorage.setItem('authToken', loginResult.token);
  localStorage.setItem('loggedInUser', JSON.stringify(loginResult.user));
}
```

## Example 2: Check-in with GPS
```javascript
// Get user location
navigator.geolocation.getCurrentPosition(async (position) => {
  const checkinResponse = await fetch('https://zewk.tocotoco.workers.dev/?action=checkIn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      employeeId: 'NV001',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      address: 'Cửa hàng A, 123 Đường ABC'
    })
  });
  
  const result = await checkinResponse.json();
  console.log(result.message);
});
```

## Example 3: Get Monthly Timesheet
```javascript
// Get timesheet for current month
const now = new Date();
const response = await fetch(
  `https://zewk.tocotoco.workers.dev/?action=getTimesheet&employeeId=NV001&month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
  {
    method: 'GET'
  }
);

const timesheet = await response.json();
if (timesheet.success) {
  console.log('Total work hours:', timesheet.timesheet.totalWorkHours);
}
```

## Example 4: Create Task Assignment
```javascript
// Create new task
const taskResponse = await fetch('https://zewk.tocotoco.workers.dev/?action=createTaskAssignment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Kiểm tra hàng hóa',
    description: 'Kiểm tra hàng hóa mới nhập kho',
    assignedTo: 'NV001',
    assignedBy: 'QL001', 
    priority: 'high',
    dueDate: '2025-01-15',
    storeId: 'ST001'
  })
});

const taskResult = await taskResponse.json();
console.log('Task created with ID:', taskResult.taskId);
```

---

# Rate Limiting & Performance

- **Rate Limit**: 1000 requests per minute per IP
- **Timeout**: 30 seconds per request
- **Max Payload**: 10MB for file uploads
- **Caching**: 5 minutes for static data (stores, permissions)

# Database Schema Compatibility

This API is fully compatible with **Enhanced HR Database Schema v3.0** including:

- `employees` - Employee management with audit trails
- `attendance` - GPS-based attendance tracking  
- `attendance_requests` - Request workflow management
- `tasks` - Task lifecycle with comments
- `task_comments` - Threaded commenting system
- `shift_assignments` - Bulk shift scheduling
- `shift_requests` - Shift modification workflows
- `user_change_history` - Comprehensive audit logging
- `pending_registrations` - Registration approval process

---

**Last Updated**: January 2025  
**API Version**: 3.0  
**Database Schema**: Enhanced HR Database Schema v3.0