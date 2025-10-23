# HR Management System - RESTful API Documentation

## Overview
This document provides comprehensive documentation for the RESTful API endpoints in the HR Management System. The API now follows REST architectural principles with clean URL structures and proper HTTP methods.

## Base Configuration
- **Base URL**: `https://hrm-api.tocotoco.workers.dev`
- **API Version**: RESTful v1.0
- **Content-Type**: `application/json`
- **CORS**: `*` (All origins allowed)
- **Database**: Enhanced HR Database Schema v2.3
- **Timezone**: Asia/Ho_Chi_Minh (+07:00)

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

Token can also be passed as a query parameter (legacy support):
```
?token=<your-token>
```

---

## API Endpoints

### Authentication & User Management

#### POST /api/auth/login
**Description**: User login

**Request Body**:
```json
{
  "employeeId": "NV001",
  "password": "password123",
  "rememberMe": true
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "token": "eyJhbGc...",
  "userData": {
    "employeeId": "NV001",
    "fullName": "Nguyễn Văn A",
    "email": "nva@example.com",
    "position": "QL",
    "storeId": "ST001"
  }
}
```

#### POST /api/auth/register
**Description**: User registration

**Request Body**:
```json
{
  "employeeId": "NV002",
  "fullName": "Trần Thị B",
  "email": "ttb@example.com",
  "password": "password123",
  "phone": "0901234567",
  "storeName": "Cửa hàng A",
  "position": "NV"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
  "requiresVerification": true,
  "employeeId": "NV002"
}
```

#### POST /api/auth/verify-email
**Description**: Verify email with verification code

**Request Body**:
```json
{
  "employeeId": "NV002",
  "verificationCode": "ABC12345"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Xác nhận email thành công!"
}
```

---

### Store Management

#### GET /api/stores
**Description**: Get all stores

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "storeId": "ST001",
      "storeName": "Cửa hàng A",
      "address": "123 Đường ABC",
      "city": "Hà Nội",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "radius": 50.0
    }
  ]
}
```

#### POST /api/stores
**Description**: Create new store (Admin only)

**Request Body**:
```json
{
  "storeId": "ST002",
  "storeName": "Cửa hàng B",
  "address": "456 Đường XYZ",
  "city": "TP.HCM",
  "latitude": 10.8231,
  "longitude": 106.6297,
  "radius": 40.0
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Tạo cửa hàng thành công!",
  "data": {
    "storeId": "ST002",
    "storeName": "Cửa hàng B"
  }
}
```

---

### Employee Management

#### GET /api/employees
**Description**: Get all employees (with optional filters)

**Query Parameters**:
- `includeInactive` (boolean): Include inactive employees

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "NV001",
      "fullName": "Nguyễn Văn A",
      "email": "nva@example.com",
      "position": "QL",
      "storeId": "ST001",
      "is_active": 1
    }
  ]
}
```

#### GET /api/employees/:employeeId
**Description**: Get specific employee details

**URL Parameters**:
- `employeeId` (string): Employee ID

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "employeeId": "NV001",
    "fullName": "Nguyễn Văn A",
    "email": "nva@example.com",
    "phone": "0901234567",
    "position": "QL",
    "storeId": "ST001",
    "is_active": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login_at": "2024-10-22T10:30:00.000Z"
  }
}
```

#### POST /api/employees
**Description**: Create new employee (Admin only)

**Request Body**:
```json
{
  "employeeId": "NV003",
  "fullName": "Lê Văn C",
  "email": "lvc@example.com",
  "password": "password123",
  "phone": "0901234568",
  "storeId": "ST001",
  "position": "NV"
}
```

#### PUT /api/employees/:employeeId
**Description**: Update employee information

**Request Body**:
```json
{
  "fullName": "Nguyễn Văn A Updated",
  "phone": "0901234569",
  "email": "nva_new@example.com"
}
```

#### GET /api/employees/:employeeId/history
**Description**: Get employee change history

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "NV001",
      "field_name": "position",
      "old_value": "NV",
      "new_value": "QL",
      "changed_by": "AD001",
      "changed_at": "2024-10-20T14:30:00.000Z"
    }
  ]
}
```

#### GET /api/employees/:employeeId/permissions
**Description**: Get employee permissions

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "position": "QL",
    "permissions": {
      "isAdmin": false,
      "isManager": true,
      "isWorker": false
    }
  }
}
```

#### GET /api/employees/:employeeId/stats
**Description**: Get employee personal statistics

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "employeeId": "NV001",
    "fullName": "Nguyễn Văn A",
    "position": "QL",
    "storeId": "ST001",
    "attendance": {
      "totalDays": 20,
      "presentDays": 18,
      "lateDays": 1,
      "absentDays": 1,
      "attendanceRate": 90.0
    }
  }
}
```

#### GET /api/employees/check/:employeeId
**Description**: Check if employee ID exists

**Response Success (200)**:
```json
{
  "employeeId": "NV001",
  "exists": true
}
```

#### GET /api/stores/:storeId/employees
**Description**: Get all employees for a specific store

**Response Success (200)**:
```json
{
  "success": true,
  "storeId": "ST001",
  "employees": [...],
  "totalEmployees": 15
}
```

---

### Attendance Management

#### POST /api/attendance/check
**Description**: GPS check-in/check-out

**Request Body**:
```json
{
  "employeeId": "NV001",
  "checkDate": "22/10/2024",
  "checkTime": "08:30:00",
  "latitude": 21.0285,
  "longitude": 105.8542
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Chấm công thành công!",
  "checkDate": "22/10/2024",
  "checkTime": "08:30:00",
  "distance": 15
}
```

#### GET /api/attendance
**Description**: Get attendance records

**Query Parameters**:
- `employeeId` (string): Employee ID
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "NV001",
      "checkDate": "22/10/2024",
      "checkTime": "08:30:00",
      "checkLocation": "ST001",
      "createdAt": "2024-10-22T08:30:00.000Z"
    }
  ]
}
```

#### POST /api/attendance/process
**Description**: Process attendance record (Admin/Manager)

**Request Body**:
```json
{
  "employeeId": "NV001",
  "date": "2024-10-22",
  "checkInTime": "08:30:00",
  "checkOutTime": "17:30:00",
  "status": "present",
  "notes": ""
}
```

#### GET /api/attendance/history
**Description**: Get attendance history

**Query Parameters**:
- `employeeId` (string): Employee ID
- `startDate` (string): Start date
- `endDate` (string): End date
- `date` (string): Specific date

---

### Attendance Requests

#### POST /api/attendance/requests
**Description**: Create attendance request

**Request Body**:
```json
{
  "employeeId": "NV001",
  "requestType": "FORGOT_CHECKIN",
  "date": "2024-10-22",
  "reason": "Quên chấm công",
  "startTime": "08:30:00",
  "endTime": null,
  "requestedBy": "NV001"
}
```

#### GET /api/attendance/requests
**Description**: Get attendance requests

**Query Parameters**:
- `employeeId` (string): Filter by employee
- `status` (string): Filter by status (pending, approved, rejected)
- `month` (string): Filter by month (YYYY-MM)

#### POST /api/attendance/requests/:requestId/approve
**Description**: Approve attendance request

**URL Parameters**:
- `requestId` (string): Request ID

**Request Body**:
```json
{
  "approvedBy": "QL001",
  "approvalNotes": "Đã xác nhận"
}
```

#### POST /api/attendance/requests/:requestId/reject
**Description**: Reject attendance request

**Request Body**:
```json
{
  "rejectedBy": "QL001",
  "rejectionReason": "Không hợp lệ"
}
```

---

### Shift Management

#### GET /api/shifts
**Description**: Get all available shifts

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "shiftId": "S001",
      "name": "Ca sáng",
      "startTime": "08:00:00",
      "endTime": "16:00:00",
      "timeName": "Morning"
    }
  ]
}
```

#### GET /api/shifts/current
**Description**: Get current user's shift for today (requires authentication)

#### GET /api/shifts/weekly
**Description**: Get weekly shifts

**Query Parameters**:
- `employeeId` (string): Employee ID
- `weekStart` (string): Week start date (YYYY-MM-DD)

#### GET /api/shifts/assignments
**Description**: Get shift assignments

**Query Parameters**:
- `employeeId` (string): Employee ID
- `date` (string): Specific date

#### POST /api/shifts/assignments
**Description**: Save multiple shift assignments

**Request Body**:
```json
{
  "assignments": [
    {
      "employeeId": "NV001",
      "shiftDate": "2024-10-22",
      "shiftType": "S001",
      "startTime": "08:00:00",
      "endTime": "16:00:00",
      "storeId": "ST001"
    }
  ],
  "assignedBy": "QL001"
}
```

#### POST /api/shifts/assign
**Description**: Assign single shift

**Request Body**:
```json
{
  "employeeId": "NV001",
  "date": "2024-10-22",
  "shiftId": "S001"
}
```

#### GET /api/shifts/requests
**Description**: Get shift change requests

**Query Parameters**:
- `employeeId` (string): Filter by employee
- `status` (string): Filter by status

#### POST /api/shifts/requests/:requestId/approve
**Description**: Approve shift request

#### POST /api/shifts/requests/:requestId/reject
**Description**: Reject shift request

---

### Timesheet

#### GET /api/timesheet
**Description**: Get timesheet data

**Query Parameters**:
- `employeeId` (string): Employee ID (optional if authenticated)
- `month` (string): Month (YYYY-MM)
- `startDate` (string): Start date
- `endDate` (string): End date

**Response Success (200)**:
```json
{
  "employeeId": "NV001",
  "period": "2024-10",
  "records": [...],
  "summary": {
    "totalHours": "160.00",
    "totalDays": 20,
    "presentDays": 18,
    "lateDays": 1,
    "absentDays": 1,
    "attendanceRate": "90.0"
  }
}
```

---

### Registration & Approval

#### GET /api/registrations/pending
**Description**: Get pending registrations (Admin/Manager)

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page

#### POST /api/registrations/:employeeId/approve
**Description**: Approve registration

**URL Parameters**:
- `employeeId` (string): Employee ID

**Request Body**:
```json
{
  "approvedBy": "AD001"
}
```

#### POST /api/registrations/approve-with-history
**Description**: Approve/reject registration with history tracking

**Request Body**:
```json
{
  "employeeId": "NV002",
  "approved": true,
  "reason": "Approved after verification",
  "actionBy": "AD001"
}
```

---

### Request Management

#### GET /api/requests/pending
**Description**: Get all pending requests

#### GET /api/requests/pending/count
**Description**: Get pending requests count

**Query Parameters**:
- `employeeId` (string): Employee ID

**Response Success (200)**:
```json
{
  "employeeId": "NV001",
  "pendingRequests": {
    "attendance": 2,
    "shift": 1,
    "tasks": 0,
    "total": 3
  }
}
```

#### POST /api/requests/:requestId/complete
**Description**: Complete/close a request

**Request Body**:
```json
{
  "requestType": "attendance",
  "completedBy": "QL001"
}
```

---

### Dashboard & Statistics

#### GET /api/dashboard/stats
**Description**: Get dashboard statistics

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 50,
    "todayAttendance": 45,
    "pendingRegistrations": 3
  }
}
```

---

## Legacy Support

For backward compatibility, all old action-based endpoints are still supported via:

#### GET /api/legacy?action=<action_name>
#### POST /api/legacy?action=<action_name>

Example:
```
GET /api/legacy?action=getStores
POST /api/legacy?action=login
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Migration Guide

### From Action-Based to RESTful

**Old (Action-based)**:
```javascript
const response = await fetch('https://api.example.com/?action=getUsers&token=abc123');
```

**New (RESTful)**:
```javascript
const response = await apiClient.getAllEmployees();
// or
const response = await fetch('https://api.example.com/api/employees', {
  headers: {
    'Authorization': 'Bearer abc123'
  }
});
```

### Common Conversions

| Old Action | New RESTful Endpoint | Method |
|-----------|---------------------|--------|
| ?action=login | /api/auth/login | POST |
| ?action=register | /api/auth/register | POST |
| ?action=getStores | /api/stores | GET |
| ?action=getUsers | /api/employees | GET |
| ?action=getUser&employeeId=X | /api/employees/X | GET |
| ?action=checkGPS | /api/attendance/check | POST |
| ?action=getCurrentShift | /api/shifts/current | GET |
| ?action=getDashboardStats | /api/dashboard/stats | GET |

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All dates are in YYYY-MM-DD format unless specified otherwise
- The API uses position-based permissions: AD (Admin), QL (Manager), NV (Worker)
- GPS validation uses Haversine formula with configurable radius (default 40-50m)
- Sessions support "remember me" feature with extended expiration (10 years)

---

## Support

For issues or questions, please contact the system administrator.
