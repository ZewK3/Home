# Request Forms Guide - Hướng Dẫn Các Loại Đơn Từ

## Tổng Quan

Hệ thống hỗ trợ **7 loại đơn từ** chính theo schema database `Tabbel-v2-optimized.sql`. Mỗi loại đơn từ có các trường dữ liệu riêng biệt phù hợp với mục đích sử dụng.

## Cấu Trúc Database

### Bảng `employee_requests`
```sql
CREATE TABLE employee_requests (
    requestId INT PRIMARY KEY AUTO_INCREMENT,
    employeeId VARCHAR(20) NOT NULL,
    requestType ENUM('leave', 'overtime', 'shift_change', 'forgot_checkin', 'forgot_checkout', 'shift_swap', 'general') NOT NULL,
    
    -- Thời gian (tùy loại đơn từ)
    fromDate DATE,                  -- Ngày bắt đầu (leave)
    toDate DATE,                    -- Ngày kết thúc (leave)
    requestDate DATE,               -- Ngày đơn lẻ (overtime, forgot_*, general)
    currentShiftDate DATE,          -- Ngày ca hiện tại (shift_change, shift_swap)
    requestedShiftDate DATE,        -- Ngày ca mong muốn (shift_change, shift_swap)
    
    -- Thông tin ca làm việc
    currentShiftId VARCHAR(20),     -- Ca hiện tại (shift_change)
    requestedShiftId VARCHAR(20),   -- Ca mong muốn (shift_change)
    swapWithEmployeeId VARCHAR(20), -- Đổi ca với nhân viên (shift_swap)
    
    -- Nội dung đơn từ
    reason TEXT NOT NULL,           -- Lý do
    description TEXT,               -- Mô tả chi tiết
    
    -- Trạng thái
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    
    -- Xét duyệt
    reviewedBy VARCHAR(20),         -- Người duyệt
    reviewedAt DATETIME,            -- Thời gian duyệt
    rejectionReason TEXT,           -- Lý do từ chối
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 1. Nghỉ Phép (Leave)

### Mô Tả
Đơn xin nghỉ phép có lương hoặc không lương trong một khoảng thời gian.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'leave'` |
| `fromDate` | DATE | ✅ | Ngày bắt đầu nghỉ |
| `toDate` | DATE | ✅ | Ngày kết thúc nghỉ |
| `reason` | TEXT | ✅ | Lý do nghỉ phép |
| `description` | TEXT | ❌ | Mô tả chi tiết (nếu cần) |

### Ví Dụ Mock Data
```javascript
{
    requestId: 1,
    employeeId: 'E101',
    requestType: 'leave',
    fromDate: '2025-11-09',
    toDate: '2025-11-10',
    reason: 'Nghỉ phép chăm sóc người thân',
    description: 'Cha mẹ ốm, cần về quê chăm sóc',
    status: 'pending',
    createdAt: '2025-11-07T11:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày bắt đầu *</label>
    <input type="date" id="fromDate" required>
</div>
<div class="form-group">
    <label>Ngày kết thúc *</label>
    <input type="date" id="toDate" required>
</div>
<div class="form-group">
    <label>Lý do *</label>
    <textarea id="reason" required></textarea>
</div>
```

## 2. Tăng Ca (Overtime)

### Mô Tả
Đơn đăng ký làm thêm giờ ngoài ca làm việc thông thường.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'overtime'` |
| `requestDate` | DATE | ✅ | Ngày làm thêm |
| `reason` | TEXT | ✅ | Lý do làm thêm giờ |
| `description` | TEXT | ❌ | Mô tả công việc (khuyến nghị) |

### Ví Dụ Mock Data
```javascript
{
    requestId: 2,
    employeeId: 'E101',
    requestType: 'overtime',
    requestDate: '2025-11-14',
    reason: 'Đăng ký tăng ca làm thêm giờ cuối tuần',
    description: 'Hoàn thành dự án deadline',
    status: 'approved',
    reviewedBy: 'E101',
    reviewerName: 'Nguyễn Thị Lan',
    reviewedAt: '2025-11-07T10:22:49.000Z',
    createdAt: '2025-11-06T12:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày làm thêm *</label>
    <input type="date" id="requestDate" required>
</div>
<div class="form-group">
    <label>Giờ bắt đầu *</label>
    <input type="time" id="startTime" required>
</div>
<div class="form-group">
    <label>Giờ kết thúc *</label>
    <input type="time" id="endTime" required>
</div>
<div class="form-group">
    <label>Lý do *</label>
    <textarea id="reason" required></textarea>
</div>
```

## 3. Đổi Ca (Shift Change)

### Mô Tả
Đơn xin đổi ca làm việc từ ca hiện tại sang ca khác.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'shift_change'` |
| `currentShiftDate` | DATE | ✅ | Ngày của ca hiện tại |
| `requestedShiftDate` | DATE | ✅ | Ngày của ca mong muốn |
| `currentShiftId` | VARCHAR | ✅ | ID ca hiện tại (ví dụ: `'S8_08-17'`) |
| `requestedShiftId` | VARCHAR | ✅ | ID ca mong muốn (ví dụ: `'S8_13-22'`) |
| `reason` | TEXT | ✅ | Lý do đổi ca |

### Ví Dụ Mock Data
```javascript
{
    requestId: 3,
    employeeId: 'E101',
    requestType: 'shift_change',
    currentShiftDate: '2025-11-08',
    requestedShiftDate: '2025-11-09',
    currentShiftId: 'S8_08-17',
    requestedShiftId: 'S8_13-22',
    reason: 'Có việc cá nhân cần xử lý vào buổi sáng',
    status: 'approved',
    reviewedBy: 'E101',
    reviewerName: 'Nguyễn Thị Lan',
    reviewedAt: '2025-11-07T12:22:49.000Z',
    createdAt: '2025-11-07T00:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày ca hiện tại *</label>
    <input type="date" id="currentShiftDate" required>
</div>
<div class="form-group">
    <label>Ca hiện tại *</label>
    <select id="currentShiftId" required>
        <option value="S4_08-12">Ca 4 (08:00-12:00)</option>
        <option value="S8_08-17">Ca 8 (08:00-17:00)</option>
        <option value="S8_13-22">Ca tối (13:00-22:00)</option>
    </select>
</div>
<div class="form-group">
    <label>Ngày ca mong muốn *</label>
    <input type="date" id="requestedShiftDate" required>
</div>
<div class="form-group">
    <label>Ca mong muốn *</label>
    <select id="requestedShiftId" required>
        <option value="S4_08-12">Ca 4 (08:00-12:00)</option>
        <option value="S8_08-17">Ca 8 (08:00-17:00)</option>
        <option value="S8_13-22">Ca tối (13:00-22:00)</option>
    </select>
</div>
<div class="form-group">
    <label>Lý do *</label>
    <textarea id="reason" required></textarea>
</div>
```

## 4. Quên Chấm Công Vào (Forgot Check-in)

### Mô Tả
Đơn xin bổ sung giờ chấm công vào khi quên chấm công.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'forgot_checkin'` |
| `requestDate` | DATE | ✅ | Ngày quên chấm công |
| `reason` | TEXT | ✅ | Lý do quên chấm công |
| `description` | TEXT | ❌ | Giờ thực tế vào làm (khuyến nghị) |

### Ví Dụ Mock Data
```javascript
{
    requestId: 4,
    employeeId: 'E101',
    requestType: 'forgot_checkin',
    requestDate: '2025-11-02',
    reason: 'Điện thoại hết pin, đã vào làm đúng giờ',
    description: 'Giờ vào thực tế: 08:00',
    status: 'rejected',
    reviewedBy: 'E101',
    reviewerName: 'Nguyễn Thị Lan',
    reviewedAt: '2025-11-03T12:22:49.000Z',
    rejectionReason: 'Không có bằng chứng hỗ trợ',
    createdAt: '2025-11-01T12:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày quên chấm công *</label>
    <input type="date" id="requestDate" required>
</div>
<div class="form-group">
    <label>Giờ vào thực tế *</label>
    <input type="time" id="actualTime" required>
</div>
<div class="form-group">
    <label>Lý do *</label>
    <textarea id="reason" required placeholder="Ví dụ: Điện thoại hết pin, quên mang điện thoại..."></textarea>
</div>
```

## 5. Quên Chấm Công Ra (Forgot Check-out)

### Mô Tả
Đơn xin bổ sung giờ chấm công ra khi quên chấm công.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'forgot_checkout'` |
| `requestDate` | DATE | ✅ | Ngày quên chấm công |
| `reason` | TEXT | ✅ | Lý do quên chấm công |
| `description` | TEXT | ❌ | Giờ thực tế ra về (khuyến nghị) |

### Ví Dụ Mock Data
```javascript
{
    requestId: 5,
    employeeId: 'E101',
    requestType: 'forgot_checkout',
    requestDate: '2025-11-06',
    reason: 'Quên chấm công ra khi rời văn phòng',
    description: 'Giờ ra thực tế: 18:30',
    status: 'pending',
    createdAt: '2025-11-06T14:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày quên chấm công *</label>
    <input type="date" id="requestDate" required>
</div>
<div class="form-group">
    <label>Giờ ra thực tế *</label>
    <input type="time" id="actualTime" required>
</div>
<div class="form-group">
    <label>Lý do *</label>
    <textarea id="reason" required placeholder="Ví dụ: Vội vàng, quên chấm công..."></textarea>
</div>
```

## 6. Đổi Ca Với Đồng Nghiệp (Shift Swap)

### Mô Tả
Đơn xin đổi ca làm việc với một đồng nghiệp khác.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'shift_swap'` |
| `currentShiftDate` | DATE | ✅ | Ngày ca của mình |
| `requestedShiftDate` | DATE | ✅ | Ngày ca của đồng nghiệp |
| `swapWithEmployeeId` | VARCHAR | ✅ | ID nhân viên đổi ca cùng |
| `reason` | TEXT | ✅ | Lý do đổi ca |

### Ví Dụ Mock Data
```javascript
{
    requestId: 6,
    employeeId: 'E101',
    requestType: 'shift_swap',
    currentShiftDate: '2025-11-11',
    requestedShiftDate: '2025-11-12',
    swapWithEmployeeId: 'E102',
    reason: 'Đổi ca ngày 10/11 với đồng nghiệp',
    description: 'Đã thỏa thuận với E102',
    status: 'pending',
    createdAt: '2025-11-07T09:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày ca của bạn *</label>
    <input type="date" id="currentShiftDate" required>
</div>
<div class="form-group">
    <label>Ngày ca muốn đổi *</label>
    <input type="date" id="requestedShiftDate" required>
</div>
<div class="form-group">
    <label>Nhân viên đổi ca *</label>
    <select id="swapWithEmployeeId" required>
        <option value="">Chọn nhân viên</option>
        <option value="E102">E102 - Nguyễn Văn A</option>
        <option value="E103">E103 - Trần Thị B</option>
    </select>
</div>
<div class="form-group">
    <label>Lý do *</label>
    <textarea id="reason" required></textarea>
</div>
```

## 7. Yêu Cầu Chung (General)

### Mô Tả
Đơn yêu cầu chung cho các trường hợp khác không thuộc 6 loại trên.

### Trường Dữ Liệu
| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `requestType` | ENUM | ✅ | Giá trị: `'general'` |
| `requestDate` | DATE | ✅ | Ngày liên quan đến yêu cầu |
| `reason` | TEXT | ✅ | Nội dung yêu cầu |
| `description` | TEXT | ❌ | Mô tả chi tiết |

### Ví Dụ Mock Data
```javascript
{
    requestId: 7,
    employeeId: 'E101',
    requestType: 'general',
    requestDate: '2025-11-04',
    reason: 'Xin cấp lại thẻ nhân viên',
    description: 'Thẻ cũ bị mất',
    status: 'approved',
    reviewedBy: 'E200',
    reviewerName: 'Trần Thị Quản Lý',
    reviewedAt: '2025-11-05T12:22:49.000Z',
    createdAt: '2025-11-04T12:22:49.000Z'
}
```

### Form HTML
```html
<div class="form-group">
    <label>Ngày yêu cầu *</label>
    <input type="date" id="requestDate" required>
</div>
<div class="form-group">
    <label>Nội dung yêu cầu *</label>
    <input type="text" id="reason" required placeholder="Ví dụ: Xin cấp lại thẻ nhân viên">
</div>
<div class="form-group">
    <label>Mô tả chi tiết</label>
    <textarea id="description" rows="4"></textarea>
</div>
```

## Trạng Thái Đơn Từ

### 1. Pending (Chờ Duyệt)
- **Giá trị**: `'pending'`
- **Badge**: `badge-warning` (màu vàng)
- **Mô tả**: Đơn từ đã được gửi, đang chờ quản lý xét duyệt
- **Actions**: Có thể hủy bỏ (nếu hệ thống cho phép)

### 2. Approved (Đã Duyệt)
- **Giá trị**: `'approved'`
- **Badge**: `badge-success` (màu xanh)
- **Mô tả**: Đơn từ đã được phê duyệt
- **Thông tin bổ sung**: `reviewedBy`, `reviewedAt`, `reviewerName`

### 3. Rejected (Đã Từ Chối)
- **Giá trị**: `'rejected'`
- **Badge**: `badge-danger` (màu đỏ)
- **Mô tả**: Đơn từ đã bị từ chối
- **Thông tin bổ sung**: `reviewedBy`, `reviewedAt`, `reviewerName`, `rejectionReason`

## API Endpoints

### 1. Tạo Đơn Từ Mới
```javascript
POST /api/requests

Request Body:
{
    employeeId: 'E101',
    requestType: 'leave',
    fromDate: '2025-11-09',
    toDate: '2025-11-10',
    reason: 'Nghỉ phép chăm sóc người thân',
    description: 'Mô tả chi tiết (optional)'
}

Response:
{
    success: true,
    data: {
        requestId: 1,
        status: 'pending',
        createdAt: '2025-11-07T12:00:00.000Z'
    }
}
```

### 2. Lấy Danh Sách Đơn Từ Của Nhân Viên
```javascript
GET /api/requests?employeeId=E101&limit=50

Response:
{
    success: true,
    data: [
        {
            requestId: 1,
            employeeId: 'E101',
            requestType: 'leave',
            fromDate: '2025-11-09',
            toDate: '2025-11-10',
            reason: 'Nghỉ phép chăm sóc người thân',
            status: 'pending',
            createdAt: '2025-11-07T12:00:00.000Z'
        },
        // ... more requests
    ],
    total: 15
}
```

### 3. Lấy Tất Cả Đơn Từ (Quản Lý)
```javascript
GET /api/requests/all?status=pending&limit=100

Response:
{
    success: true,
    data: [
        {
            requestId: 1,
            employeeId: 'E101',
            employeeName: 'Nguyễn Thị Lan',
            requestType: 'leave',
            fromDate: '2025-11-09',
            toDate: '2025-11-10',
            reason: 'Nghỉ phép chăm sóc người thân',
            status: 'pending',
            createdAt: '2025-11-07T12:00:00.000Z'
        },
        // ... more requests
    ],
    total: 25
}
```

### 4. Xét Duyệt Đơn Từ
```javascript
PUT /api/requests/:requestId/review

Request Body:
{
    status: 'approved', // or 'rejected'
    reviewedBy: 'E200',
    rejectionReason: 'Lý do từ chối (nếu rejected)'
}

Response:
{
    success: true,
    data: {
        requestId: 1,
        status: 'approved',
        reviewedBy: 'E200',
        reviewedAt: '2025-11-07T13:00:00.000Z'
    }
}
```

## UI Components

### Request Badge
```html
<span class="badge badge-${status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}">
    ${status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
</span>
```

### Request Icon
```javascript
const icons = {
    'leave': 'event_busy',
    'overtime': 'schedule',
    'shift_change': 'swap_horiz',
    'forgot_checkin': 'login',
    'forgot_checkout': 'logout',
    'shift_swap': 'swap_calls',
    'general': 'help_outline'
};
```

### Request Type Name
```javascript
const names = {
    'leave': 'Nghỉ phép',
    'overtime': 'Tăng ca',
    'shift_change': 'Đổi ca',
    'forgot_checkin': 'Quên chấm công vào',
    'forgot_checkout': 'Quên chấm công ra',
    'shift_swap': 'Đổi ca với đồng nghiệp',
    'general': 'Yêu cầu chung'
};
```

## Validation Rules

### Common Rules
- `employeeId`: Required, VARCHAR(20)
- `requestType`: Required, must be one of 7 valid values
- `reason`: Required, TEXT, minimum 10 characters
- `description`: Optional, TEXT

### Type-Specific Rules

**Leave:**
- `fromDate`: Required, must be >= today
- `toDate`: Required, must be >= fromDate

**Overtime:**
- `requestDate`: Required, must be >= today
- Recommended: `description` should include work details

**Shift Change:**
- `currentShiftDate`: Required
- `requestedShiftDate`: Required
- `currentShiftId`: Required
- `requestedShiftId`: Required, must be different from currentShiftId

**Forgot Check-in/Check-out:**
- `requestDate`: Required, must be <= today (past or today)
- Recommended: Include actual time in description

**Shift Swap:**
- `currentShiftDate`: Required
- `requestedShiftDate`: Required
- `swapWithEmployeeId`: Required, must be valid employee ID

**General:**
- `requestDate`: Required
- `reason`: Required, should be descriptive

## Best Practices

1. **Validation Client-Side**: Validate all required fields before submission
2. **Error Handling**: Show clear error messages for validation failures
3. **User Feedback**: Show success/error notifications after submission
4. **Disabled Dates**: Disable past dates for future requests (leave, overtime)
5. **Dynamic Forms**: Show/hide fields based on request type selection
6. **Mobile Friendly**: Ensure forms work well on mobile devices
7. **Auto-fill**: Pre-fill employee ID from logged-in user data
8. **Confirmation**: Show confirmation modal before submission

## Error Codes

- `REQ_001`: Missing required fields
- `REQ_002`: Invalid request type
- `REQ_003`: Invalid date range
- `REQ_004`: Invalid employee ID
- `REQ_005`: Employee not found
- `REQ_006`: Shift not found
- `REQ_007`: Swap employee not found
- `REQ_008`: Duplicate request exists
- `REQ_009`: Request already reviewed
- `REQ_010`: Unauthorized action

## Future Enhancements

1. **File Attachments**: Allow uploading supporting documents
2. **Notifications**: Real-time notifications for request status changes
3. **Recurring Requests**: Support for recurring leave/overtime patterns
4. **Approval Workflow**: Multi-level approval process
5. **Request Templates**: Save commonly used requests as templates
6. **Analytics**: Request statistics and reports
7. **Mobile App**: Native mobile app for request submission
8. **Calendar Integration**: Integrate with calendar apps
