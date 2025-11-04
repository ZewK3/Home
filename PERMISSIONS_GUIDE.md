# Permission System Guide

## Overview

This F&B HRM system uses a **permission-based access control** system instead of simple level-based permissions. Each position can have a custom set of permissions that determine which features and modules the user can access.

## How Permissions Work

### 1. Database Structure

Permissions are stored in the `positions` table:

```sql
CREATE TABLE positions (
    positionId TEXT PRIMARY KEY,
    departmentId TEXT NOT NULL,
    positionName TEXT NOT NULL,
    positionCode TEXT UNIQUE NOT NULL,
    positionLevel INTEGER DEFAULT 1,     -- Keep for backward compatibility
    baseSalaryRate REAL DEFAULT 0,
    salaryType TEXT,
    description TEXT,
    permissions TEXT,                    -- Comma-separated permissions: "employee_manage,salary_view,reports_view"
    isActive INTEGER DEFAULT 1,
    createdAt TEXT
);
```

### 2. Permission Strings

Permissions are stored as comma-separated strings in the `permissions` field. For example:

```
"employee_manage,salary_view,timesheet_approve,reports_view"
```

### 3. Module-Permission Mapping

Each module in the system requires specific permissions:

#### VP (Office) Modules:

| Module | Required Permission | Description |
|--------|-------------------|-------------|
| Dashboard | *(none)* | Everyone can access |
| Employee Management | `employee_manage` | Manage employees |
| Approve Registration | `registration_approve` | Approve new registrations |
| Departments | `department_manage` | Manage departments |
| Positions | `position_manage` | Manage positions |
| Salary Management | `salary_manage` | Manage salaries |
| Timesheet Approval | `timesheet_approve` | Approve timesheets |
| Reports | `reports_view` | View reports |

#### CH (Store) Modules:

| Module | Required Permission | Description |
|--------|-------------------|-------------|
| Dashboard | *(none)* | Everyone can access |
| Attendance | `attendance_self` | Clock in/out |
| Schedule | `schedule_view` | View work schedule |
| Timesheet | `timesheet_view` | View own timesheet |
| Salary | `salary_view` | View own salary |
| Requests | `request_create` | Create requests |
| Notifications | `notification_view` | View notifications |
| Profile | `profile_view` | View own profile |

## Available Permissions

### Core Permissions

- `employee_manage` - Create, edit, delete employees
- `employee_view` - View employee information
- `registration_approve` - Approve/reject new registrations
- `department_manage` - Create, edit departments
- `position_manage` - Create, edit positions
- `salary_manage` - Calculate, approve, mark paid salaries
- `salary_view` - View own salary records
- `timesheet_approve` - Approve employee timesheets
- `timesheet_view` - View own timesheet
- `attendance_self` - Clock in/out for self
- `attendance_approve` - Approve attendance records
- `schedule_manage` - Create, edit work schedules
- `schedule_view` - View work schedules
- `shift_manage` - Create, edit shifts
- `request_create` - Create leave/other requests
- `request_approve` - Approve/reject requests
- `reports_view` - View reports and analytics
- `notification_view` - View notifications
- `profile_view` - View own profile
- `system_admin` - Access system settings

## Setting Up Positions with Permissions

### Example 1: Kế Toán (Accountant) - VP

```sql
INSERT INTO positions VALUES (
    'VP_KT',                           -- positionId
    'VP',                              -- departmentId
    'Kế Toán',                         -- positionName
    'KT',                              -- positionCode
    2,                                 -- positionLevel (kept for compatibility)
    8000000,                           -- baseSalaryRate
    'monthly',                         -- salaryType
    'Nhân viên kế toán',               -- description
    'employee_view,salary_manage,reports_view,timesheet_view',  -- permissions
    1,                                 -- isActive
    datetime('now')                    -- createdAt
);
```

**Access**: Can view employees, manage salaries, view reports, view timesheets

### Example 2: Quản Lý Khu Vực (Area Manager) - VP

```sql
INSERT INTO positions VALUES (
    'VP_QLKV',
    'VP',
    'Quản Lý Khu Vực',
    'QLKV',
    3,
    12000000,
    'monthly',
    'Quản lý khu vực',
    'employee_manage,salary_view,timesheet_approve,reports_view,schedule_manage,shift_manage,request_approve',
    1,
    datetime('now')
);
```

**Access**: Full employee management, approve timesheets, manage schedules/shifts, approve requests

### Example 3: Admin - VP

```sql
INSERT INTO positions VALUES (
    'VP_ADMIN',
    'VP',
    'Quản Trị Viên',
    'ADMIN',
    4,
    15000000,
    'monthly',
    'Quản trị viên hệ thống',
    'employee_manage,registration_approve,department_manage,position_manage,salary_manage,timesheet_approve,reports_view,system_admin',
    1,
    datetime('now')
);
```

**Access**: Full system access

### Example 4: Nhân Viên LV1 (Staff Level 1) - CH

```sql
INSERT INTO positions VALUES (
    'CH_NV_LV1',
    'CH',
    'Nhân Viên LV1',
    'NV_LV1',
    1,
    25000,
    'hourly',
    'Nhân viên cửa hàng level 1',
    'attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view',
    1,
    datetime('now')
);
```

**Access**: Basic store employee permissions

### Example 5: Quản Lý LV2 (Manager Level 2) - CH

```sql
INSERT INTO positions VALUES (
    'CH_QL_LV2',
    'CH',
    'Quản Lý LV2',
    'QL_LV2',
    3,
    40000,
    'hourly',
    'Quản lý cửa hàng level 2',
    'attendance_self,attendance_approve,schedule_manage,shift_manage,timesheet_view,timesheet_approve,salary_view,request_create,request_approve,notification_view,profile_view',
    1,
    datetime('now')
);
```

**Access**: Store manager with approval powers

## How to Add New Permissions

### Step 1: Add Permission String to Positions

```sql
UPDATE positions
SET permissions = permissions || ',new_permission'
WHERE positionId = 'VP_KT';
```

### Step 2: Map Permission to Module

Edit `/assets/js/permission-manager.js`:

```javascript
modulePermissions: {
    VP: {
        'new-module': { 
            required: ['new_permission'], 
            label: 'New Module Name' 
        },
        // ... other modules
    }
}
```

### Step 3: Update Menu (if needed)

In `applyVPMenuPermissions()` or `applyCHMenuPermissions()`:

```javascript
const menuItems = {
    'new-module': { 
        selector: '[data-function="new-module"]', 
        permissions: ['new_permission'] 
    },
    // ... other menu items
};
```

## Testing Permissions

### In Browser Console:

```javascript
// View current user permissions
const userData = JSON.parse(localStorage.getItem('userData'));
console.log('Current permissions:', userData.permissions);

// Test changing permissions (for testing only)
userData.permissions = 'employee_manage,salary_view,reports_view';
localStorage.setItem('userData', JSON.stringify(userData));
location.reload();
```

### Via API:

When a user logs in, the API should return:

```json
{
    "employeeId": "E001",
    "fullName": "Nguyễn Văn A",
    "departmentId": "VP",
    "positionId": "VP_KT",
    "positionLevel": 2,
    "permissions": "employee_view,salary_manage,reports_view,timesheet_view"
}
```

## Permission Checking Flow

```
1. User logs in
   ↓
2. API returns user data with permissions string
   ↓
3. Frontend stores in localStorage
   ↓
4. PermissionManager.getUserPermissions() parses string into array
   ↓
5. User clicks menu/module
   ↓
6. PermissionManager.hasAccess() checks if user has required permission
   ↓
7. If YES → Show module
   If NO → Show "Access Denied"
```

## Migration from Level-Based to Permission-Based

If you have existing positions with only `positionLevel`:

```sql
-- Update VP positions
UPDATE positions 
SET permissions = CASE positionLevel
    WHEN 1 THEN 'timesheet_view,salary_view,notification_view,profile_view'
    WHEN 2 THEN 'timesheet_approve,shift_manage,request_approve,timesheet_view,salary_view'
    WHEN 3 THEN 'employee_manage,salary_manage,reports_view,schedule_manage,timesheet_approve'
    WHEN 4 THEN 'employee_manage,registration_approve,department_manage,position_manage,salary_manage,timesheet_approve,reports_view,system_admin'
END
WHERE departmentId = 'VP' AND (permissions IS NULL OR permissions = '');

-- Update CH positions  
UPDATE positions
SET permissions = 'attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view'
WHERE departmentId = 'CH' AND (permissions IS NULL OR permissions = '');
```

## Best Practices

1. **Principle of Least Privilege**: Only grant permissions users actually need
2. **Descriptive Names**: Use clear permission names like `employee_manage` not `emp_m`
3. **Group Related Permissions**: Keep related permissions together (e.g., all salary permissions start with `salary_`)
4. **Document Changes**: Always document when you add new permissions
5. **Test Thoroughly**: Test each permission combination
6. **Regular Audits**: Periodically review who has what permissions

## Security Notes

- Permissions are checked on **both client and server**
- Client-side checks improve UX (hide unavailable features)
- Server-side checks ensure security (prevent API abuse)
- Never trust client-side permission checks alone
- Always validate permissions in API endpoints

## Common Permission Combinations

### For New Employees (Level 1):
```
attendance_self,schedule_view,timesheet_view,salary_view,request_create,notification_view,profile_view
```

### For Supervisors (Level 2):
```
attendance_self,timesheet_approve,shift_manage,request_approve,schedule_view,timesheet_view,salary_view,notification_view,profile_view
```

### For Managers (Level 3):
```
employee_manage,salary_manage,reports_view,schedule_manage,shift_manage,timesheet_approve,request_approve,attendance_approve
```

### For Admins (Level 4):
```
employee_manage,registration_approve,department_manage,position_manage,salary_manage,timesheet_approve,reports_view,system_admin
```
