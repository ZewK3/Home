# Hệ Thống Phân Quyền (Permissions System)

## Tổng Quan

Hệ thống quản lý nhân sự sử dụng phân quyền dựa trên chuỗi permissions, không còn dùng positionLevel. Mỗi nhân viên có một hoặc nhiều quyền được phân cách bằng dấu phẩy.

## Quyền Mặc Định

Tất cả nhân viên đều có các quyền cơ bản sau:

- `salary_view` - Xem bảng lương
- `timesheet_view` - Xem bảng công  
- `attendance_self` - Chấm công cá nhân
- `schedule_view` - Xem lịch làm việc
- `profile_view` - Xem thông tin cá nhân
- `profile_edit` - Chỉnh sửa thông tin cá nhân
- `notifications_view` - Xem thông báo

## Danh Sách Quyền Đầy Đủ

### 1. Quản Lý Nhân Viên
- `employee_view` - Xem danh sách nhân viên
- `employee_manage` - Quản lý nhân viên (thêm, sửa)
- `employee_delete` - Xóa nhân viên

### 2. Chấm Công
- `attendance_self` - Chấm công cá nhân (mặc định)
- `attendance_view` - Xem lịch sử chấm công nhân viên khác
- `attendance_manage` - Quản lý chấm công

### 3. Lịch Làm Việc
- `schedule_view` - Xem lịch cá nhân (mặc định)
- `schedule_register` - Đăng ký ca làm việc
- `schedule_manage` - Xếp lịch cho nhân viên
- `schedule_approve` - Phê duyệt đăng ký ca

### 4. Bảng Lương
- `salary_view` - Xem lương cá nhân (mặc định)
- `salary_manage` - Quản lý lương nhân viên
- `salary_approve` - Phê duyệt bảng lương

### 5. Bảng Công
- `timesheet_view` - Xem bảng công cá nhân (mặc định)
- `timesheet_manage` - Quản lý bảng công
- `timesheet_export` - Xuất báo cáo công

### 6. Yêu Cầu/Đơn Từ
- `request_submit` - Gửi yêu cầu
- `request_view` - Xem yêu cầu của nhân viên khác
- `request_approve` - Phê duyệt/từ chối yêu cầu

### 7. Thông Báo
- `notifications_view` - Xem thông báo (mặc định)
- `notifications_send` - Gửi thông báo

### 8. Thông Tin Cá Nhân
- `profile_view` - Xem thông tin cá nhân (mặc định)
- `profile_edit` - Chỉnh sửa thông tin (mặc định)

### 9. Phân Quyền
- `access_grant` - Cấp quyền cho nhân viên
- `access_revoke` - Thu hồi quyền

### 10. Báo Cáo
- `reports_view` - Xem báo cáo thống kê
- `reports_export` - Xuất báo cáo

## Ma Trận Phân Quyền

### Nhân Viên (Employee)
```
salary_view,timesheet_view,attendance_self,schedule_view,
profile_view,profile_edit,notifications_view,request_submit
```

### Quản Lý (Manager)
```
salary_view,timesheet_view,timesheet_manage,attendance_self,
attendance_view,attendance_manage,schedule_view,schedule_manage,
schedule_approve,profile_view,profile_edit,notifications_view,
notifications_send,request_submit,request_view,request_approve,
employee_view,reports_view
```

### Admin/HR
```
Tất cả các quyền (ALL PERMISSIONS)
```

## Cách Sử Dụng

```javascript
// Kiểm tra quyền
const userData = SimpleStorage.get('userData');
const permissions = (userData?.permissions || '').split(',');

function hasPermission(permission) {
    return permissions.includes(permission);
}

// Ví dụ
if (hasPermission('employee_manage')) {
    showAddEmployeeButton();
}
```

## Lưu Ý

1. **Bảo mật**: Luôn kiểm tra quyền ở cả client và server
2. **Mặc định**: Tất cả user có 7 quyền cơ bản
3. **UI/UX**: Ẩn các chức năng user không có quyền

