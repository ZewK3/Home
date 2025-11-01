# Cơ Chế Chấm Công và Phân Ca

## Nguyên Tắc Hoạt Động

### 1. Chấm Công Độc Lập (Attendance)

Nhân viên có thể chấm công **bất kỳ lúc nào**, không cần phải có ca được phân trước.

```sql
-- Bảng attendance: Lưu tất cả lần chấm công
CREATE TABLE attendance (
    attendanceId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    checkDate TEXT NOT NULL,
    checkTime TEXT NOT NULL,
    checkLocation TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    UNIQUE(employeeId, checkDate, checkTime)  -- Cho phép nhiều lần/ngày
);
```

**Đặc điểm:**
- ✅ Không có `shiftId` - nhân viên tự do chấm công
- ✅ Có thể chấm công nhiều lần trong ngày
- ✅ Không bị chặn nếu chưa có ca được phân

### 2. Phân Ca (Shift Assignments)

Quản lý phân ca cho nhân viên sau (hoặc trước).

```sql
-- Bảng shift_assignments: Quản lý phân ca
CREATE TABLE shift_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    shiftId INTEGER NOT NULL,
    date TEXT NOT NULL,
    assignedBy TEXT,
    assignedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (shiftId) REFERENCES shifts(shiftId) ON DELETE CASCADE,
    UNIQUE(employeeId, date, shiftId)  -- 1 nhân viên có thể có nhiều ca/ngày
);
```

**Đặc điểm:**
- ✅ Quản lý có thể phân ca trước hoặc sau khi nhân viên chấm công
- ✅ Một nhân viên có thể được phân nhiều ca trong 1 ngày
- ✅ Linh hoạt trong việc quản lý

### 3. Tính Công (Work Hours Calculation)

**Chỉ tính công khi:**
1. Có attendance record (nhân viên đã chấm công)
2. VÀ có shift assignment (đã được phân ca)

```sql
-- Query: Tính số ngày làm việc có hiệu lực
SELECT 
    a.employeeId,
    e.fullName,
    COUNT(DISTINCT a.checkDate) as validWorkDays
FROM attendance a
INNER JOIN shift_assignments sa 
    ON a.employeeId = sa.employeeId 
    AND a.checkDate = sa.date
INNER JOIN employees e 
    ON a.employeeId = e.employeeId
WHERE a.employeeId = 'NV001'
  AND a.checkDate BETWEEN '2025-11-01' AND '2025-11-30'
GROUP BY a.employeeId;
```

## Ví Dụ Chi Tiết

### Scenario 1: Chấm Công Trước, Phân Ca Sau

**Bước 1: Nhân viên chấm công (01/11/2025)**
```sql
INSERT INTO attendance (employeeId, checkDate, checkTime, checkLocation)
VALUES ('NV001', '2025-11-01', '08:05:00', 'MC001');
```

**Tình trạng:** 
- ✅ Chấm công thành công
- ❌ Chưa tính công (chưa có shift assignment)

**Bước 2: Quản lý phân ca (sau đó)**
```sql
INSERT INTO shift_assignments (employeeId, shiftId, date, assignedBy)
VALUES ('NV001', 1, '2025-11-01', 'QL001');  -- shiftId 1 = Ca 8-12
```

**Tình trạng:**
- ✅ Có attendance
- ✅ Có shift assignment
- ✅ **BÂY GIỜ MỚI TÍNH CÔNG!**

### Scenario 2: Phân Ca Trước, Chấm Công Sau

**Bước 1: Quản lý phân ca trước (31/10/2025)**
```sql
INSERT INTO shift_assignments (employeeId, shiftId, date, assignedBy)
VALUES ('NV002', 7, '2025-11-01', 'QL001');  -- shiftId 7 = Ca 14-18
```

**Bước 2: Nhân viên chấm công (01/11/2025)**
```sql
INSERT INTO attendance (employeeId, checkDate, checkTime, checkLocation)
VALUES ('NV002', '2025-11-01', '14:02:00', 'MC001');
```

**Kết quả:**
- ✅ Có attendance
- ✅ Có shift assignment
- ✅ **Tính công ngay!**

### Scenario 3: Chấm Công Nhưng Không Được Phân Ca

**Nhân viên chấm công:**
```sql
INSERT INTO attendance (employeeId, checkDate, checkTime, checkLocation)
VALUES ('NV003', '2025-11-01', '09:00:00', 'MC001');
```

**Không có shift assignment:**
```sql
-- Không có record nào trong shift_assignments cho NV003 ngày 01/11
```

**Kết quả:**
- ✅ Attendance record tồn tại
- ❌ KHÔNG tính công (không có shift assignment)
- ⚠️ Dashboard hiện: "Chưa được phân ca"

## Queries Hữu Ích

### Query 1: Xem Attendance Chưa Có Ca

```sql
-- Tìm các lần chấm công chưa được phân ca
SELECT 
    a.employeeId,
    e.fullName,
    a.checkDate,
    a.checkTime,
    'Chưa được phân ca' as status
FROM attendance a
INNER JOIN employees e ON a.employeeId = e.employeeId
LEFT JOIN shift_assignments sa 
    ON a.employeeId = sa.employeeId 
    AND a.checkDate = sa.date
WHERE sa.id IS NULL
ORDER BY a.checkDate DESC, a.checkTime DESC;
```

**Kết quả:**
```
employeeId | fullName     | checkDate   | checkTime | status
-----------|--------------|-------------|-----------|--------------------
NV003      | Phạm Thị C   | 2025-11-01  | 09:00:00  | Chưa được phân ca
NV005      | Trần Văn E   | 2025-11-01  | 13:30:00  | Chưa được phân ca
```

### Query 2: Tính Giờ Làm Có Hiệu Lực

```sql
-- Tính tổng giờ làm dựa trên ca được phân
SELECT 
    a.employeeId,
    e.fullName,
    COUNT(DISTINCT sa.id) as totalShiftsAssigned,
    COUNT(DISTINCT a.checkDate) as daysCheckedIn,
    SUM(s.endTime - s.startTime) as totalHours
FROM shift_assignments sa
INNER JOIN attendance a 
    ON sa.employeeId = a.employeeId 
    AND sa.date = a.checkDate
INNER JOIN shifts s ON sa.shiftId = s.shiftId
INNER JOIN employees e ON a.employeeId = e.employeeId
WHERE a.employeeId = 'NV001'
  AND a.checkDate BETWEEN '2025-11-01' AND '2025-11-30'
GROUP BY a.employeeId;
```

**Kết quả:**
```
employeeId | fullName      | totalShiftsAssigned | daysCheckedIn | totalHours
-----------|---------------|---------------------|---------------|------------
NV001      | Nguyễn Văn A  | 22                  | 20            | 176
```
*Giải thích: Được phân 22 ca, chấm công 20 ngày, tổng 176 giờ*

### Query 3: Báo Cáo Chấm Công Theo Ca

```sql
-- Xem chi tiết attendance + shift assignment
SELECT 
    a.checkDate,
    a.checkTime,
    s.shiftCode,
    s.name as shiftName,
    s.startTime,
    s.endTime,
    CASE 
        WHEN TIME(a.checkTime) <= TIME(printf('%02d:%02d:00', s.startTime, 30))
        THEN 'Đúng giờ'
        ELSE 'Trễ'
    END as checkInStatus
FROM attendance a
INNER JOIN shift_assignments sa 
    ON a.employeeId = sa.employeeId 
    AND a.checkDate = sa.date
INNER JOIN shifts s ON sa.shiftId = s.shiftId
WHERE a.employeeId = 'NV001'
  AND a.checkDate = '2025-11-01'
ORDER BY a.checkTime;
```

**Kết quả:**
```
checkDate   | checkTime | shiftCode | shiftName        | startTime | endTime | checkInStatus
------------|-----------|-----------|------------------|-----------|---------|---------------
2025-11-01  | 08:05:00  | S4_08-12  | Ca 4 Tiếng 8-12  | 8         | 12      | Đúng giờ
2025-11-01  | 14:02:00  | S4_14-18  | Ca 4 Tiếng 14-18 | 14        | 18      | Đúng giờ
```

### Query 4: Dashboard Manager View

```sql
-- Xem tất cả nhân viên: có chấm công, có/chưa phân ca
SELECT 
    e.employeeId,
    e.fullName,
    a.checkDate,
    a.checkTime,
    COALESCE(s.shiftCode, 'Chưa phân ca') as shiftAssigned,
    CASE 
        WHEN sa.id IS NOT NULL THEN 'Có hiệu lực'
        ELSE 'Chưa tính công'
    END as status
FROM employees e
LEFT JOIN attendance a ON e.employeeId = a.employeeId
LEFT JOIN shift_assignments sa 
    ON a.employeeId = sa.employeeId 
    AND a.checkDate = sa.date
LEFT JOIN shifts s ON sa.shiftId = s.shiftId
WHERE a.checkDate = '2025-11-01'
  AND e.storeId = 'MC001'
ORDER BY e.fullName, a.checkTime;
```

## Validation Logic (Backend/Frontend)

### Check-in Validation

```javascript
// Backend: Validate check-in time against shift (if assigned)
async function validateCheckIn(employeeId, checkDate, checkTime) {
  // 1. Allow check-in regardless of shift assignment
  const attendanceId = await db.insert('attendance', {
    employeeId,
    checkDate,
    checkTime,
    checkLocation
  });
  
  // 2. Check if there's a shift assignment
  const shiftAssignments = await db.query(`
    SELECT sa.*, s.*
    FROM shift_assignments sa
    JOIN shifts s ON sa.shiftId = s.shiftId
    WHERE sa.employeeId = ? AND sa.date = ?
  `, [employeeId, checkDate]);
  
  // 3. Return info about shift match
  if (shiftAssignments.length === 0) {
    return {
      success: true,
      attendanceId,
      warning: 'Chưa được phân ca - chưa tính công'
    };
  }
  
  // 4. Check if check-in time matches any assigned shift
  const matchedShift = shiftAssignments.find(sa => {
    const shiftStart = sa.startTime;
    const checkHour = parseInt(checkTime.split(':')[0]);
    const checkMin = parseInt(checkTime.split(':')[1]);
    const checkInMinutes = checkHour * 60 + checkMin;
    const shiftStartMinutes = shiftStart * 60;
    const lateThreshold = shiftStartMinutes + 30; // 30 minutes late allowed
    
    return checkInMinutes <= lateThreshold;
  });
  
  if (matchedShift) {
    return {
      success: true,
      attendanceId,
      shiftCode: matchedShift.shiftCode,
      status: 'Hợp lệ - đã tính công'
    };
  } else {
    return {
      success: true,
      attendanceId,
      warning: 'Chấm công trễ hoặc không khớp ca được phân'
    };
  }
}
```

### Frontend Display Logic

```javascript
// Dashboard: Show attendance status
async function showAttendanceStatus(employeeId, date) {
  const result = await api.get(`/api/attendance/status?employeeId=${employeeId}&date=${date}`);
  
  // result = {
  //   hasAttendance: true,
  //   hasShiftAssignment: false,
  //   checkTimes: ['08:05:00', '12:10:00'],
  //   shifts: [],
  //   worksHoursCounted: 0
  // }
  
  if (result.hasAttendance && !result.hasShiftAssignment) {
    showWarning('Bạn đã chấm công nhưng chưa được phân ca. Vui lòng liên hệ quản lý.');
  }
  
  if (result.hasAttendance && result.hasShiftAssignment) {
    showSuccess(`Đã tính công: ${result.workHoursCounted} giờ`);
  }
}
```

## UI Mockups

### Employee Dashboard

```
┌──────────────────────────────────────────────────────┐
│ Chấm Công Hôm Nay - 01/11/2025                      │
├──────────────────────────────────────────────────────┤
│ ✅ 08:05 - Đã chấm công                              │
│    ⚠️  Chưa được phân ca - chưa tính công           │
│                                                      │
│ ✅ 12:10 - Đã chấm công                              │
│    ⚠️  Chưa được phân ca - chưa tính công           │
├──────────────────────────────────────────────────────┤
│ Tổng giờ làm: 0 giờ (chưa được phân ca)             │
└──────────────────────────────────────────────────────┘
```

**Sau khi được phân ca:**
```
┌──────────────────────────────────────────────────────┐
│ Chấm Công Hôm Nay - 01/11/2025                      │
├──────────────────────────────────────────────────────┤
│ ✅ 08:05 - Ca 8:00-12:00 (4h)                        │
│    ✓ Đúng giờ, đã tính công                         │
│                                                      │
│ ✅ 12:10 - Check-out ca sáng                         │
│    ✓ Đã hoàn thành ca                               │
├──────────────────────────────────────────────────────┤
│ Tổng giờ làm: 4 giờ (1 ca)                          │
└──────────────────────────────────────────────────────┘
```

### Manager Dashboard

```
┌───────────────────────────────────────────────────────────────────┐
│ Quản Lý Chấm Công - 01/11/2025                                   │
├────────────┬──────────────┬────────────┬─────────────────────────┤
│ Nhân viên  │ Chấm công    │ Ca phân    │ Trạng thái              │
├────────────┼──────────────┼────────────┼─────────────────────────┤
│ Nguyễn V A │ 08:05, 12:10 │ 8-12, 14-18│ ✅ Tính công (8h)       │
├────────────┼──────────────┼────────────┼─────────────────────────┤
│ Trần T B   │ 08:00        │ 8-16       │ ✅ Tính công (8h)       │
├────────────┼──────────────┼────────────┼─────────────────────────┤
│ Phạm T C   │ 09:00, 13:00 │ --         │ ⚠️  Chưa phân ca        │
│            │              │            │ [Phân ca ngay] button   │
└────────────┴──────────────┴────────────┴─────────────────────────┘
```

## Lợi Ích Của Cơ Chế Này

### 1. Linh Hoạt Cho Nhân Viên
- ✅ Không bị chặn khi chấm công
- ✅ Có thể chấm công trước khi được phân ca
- ✅ Không lo lỡ chấm công vì quản lý chưa kịp phân

### 2. Linh Hoạt Cho Quản Lý
- ✅ Có thể phân ca sau khi nhân viên đã làm
- ✅ Điều chỉnh ca làm linh hoạt
- ✅ Dễ quản lý nhân viên làm thêm giờ

### 3. Minh Bạch
- ✅ Nhân viên thấy rõ có được tính công hay chưa
- ✅ Quản lý thấy ai chưa được phân ca
- ✅ Dễ phát hiện bất thường

### 4. Công Bằng
- ✅ Chỉ tính công khi CÓ attendance VÀ shift assignment
- ✅ Không tính nhầm công
- ✅ Audit trail đầy đủ

## Migration Từ Schema Cũ

Nếu đã có dữ liệu với `shiftId` trong attendance:

```sql
-- Bước 1: Backup
CREATE TABLE attendance_backup AS SELECT * FROM attendance;

-- Bước 2: Tạo shift_assignments từ attendance cũ (nếu có shiftId)
INSERT INTO shift_assignments (employeeId, shiftId, date, assignedBy)
SELECT DISTINCT 
    employeeId,
    shiftId,
    checkDate,
    'MIGRATION' as assignedBy
FROM attendance_backup
WHERE shiftId IS NOT NULL;

-- Bước 3: Drop column shiftId (nếu cần)
-- SQLite không hỗ trợ DROP COLUMN trực tiếp
-- Cần recreate table hoặc ignore column
```

## Kết Luận

**Nguyên tắc vàng:**
- Attendance = Ghi nhận có mặt
- Shift Assignment = Quyết định tính công
- Work Hours = Attendance ∩ Shift Assignment

Cơ chế này cân bằng giữa tính linh hoạt và độ chính xác trong quản lý công.
