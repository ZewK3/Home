# Ví Dụ Tính Công Với Nhiều Ca Làm/Ngày

## Schema Changes Implemented

### 1. Attendance Table - Enhanced for Multiple Shifts

```sql
CREATE TABLE attendance (
    attendanceId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    checkDate TEXT NOT NULL,
    checkTime TEXT NOT NULL,
    checkLocation TEXT,
    shiftId INTEGER,                    -- NEW: Link to shift
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (shiftId) REFERENCES shifts(shiftId) ON DELETE SET NULL,
    UNIQUE(employeeId, checkDate, shiftId)  -- Allow multiple per day
);
```

### 2. Shifts Table - Added shiftCode

```sql
CREATE TABLE shifts (
    shiftId INTEGER PRIMARY KEY AUTOINCREMENT,
    shiftCode TEXT UNIQUE NOT NULL,     -- NEW: 'S4_08-12', 'S8_08-16', etc.
    name TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    timeName TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
);
```

## Ví Dụ Thực Tế: User A Làm 2 Ca/Ngày

### Scenario: Nhân viên A làm 2 ca ngày 01/11/2025

**Ca 1: Sáng 8h-12h (4 giờ)**
**Ca 2: Chiều 14h-18h (4 giờ)**

### Data trong Database

#### 1. Shift Assignments (Gán ca trước)
```sql
INSERT INTO shift_assignments (employeeId, shiftId, date, assignedBy) VALUES
('NV001', 1, '2025-11-01', 'QL001'),  -- Ca sáng S4_08-12
('NV001', 7, '2025-11-01', 'QL001');  -- Ca chiều S4_14-18
```

#### 2. Attendance Records (Chấm công thực tế)
```sql
-- Chấm công ca sáng
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-01', '08:05:00', 1, 'MC001');  -- Check-in ca sáng

-- Chấm công ca chiều
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-01', '14:02:00', 7, 'MC001');  -- Check-in ca chiều
```

### Query Để Tính Công

#### Query 1: Xem tất cả ca làm trong ngày
```sql
SELECT 
    a.employeeId,
    a.checkDate,
    a.checkTime,
    s.shiftCode,
    s.name as shiftName,
    s.startTime,
    s.endTime,
    (s.endTime - s.startTime) as shiftHours,
    a.checkLocation
FROM attendance a
JOIN shifts s ON a.shiftId = s.shiftId
WHERE a.employeeId = 'NV001' 
  AND a.checkDate = '2025-11-01'
ORDER BY a.checkTime;
```

**Kết quả:**
```
employeeId | checkDate   | checkTime | shiftCode | shiftName        | startTime | endTime | shiftHours | checkLocation
-----------|-------------|-----------|-----------|------------------|-----------|---------|------------|---------------
NV001      | 2025-11-01  | 08:05:00  | S4_08-12  | Ca 4 Tiếng 8-12  | 8         | 12      | 4          | MC001
NV001      | 2025-11-01  | 14:02:00  | S4_14-18  | Ca 4 Tiếng 14-18 | 14        | 18      | 4          | MC001
```

#### Query 2: Tính tổng giờ làm trong ngày
```sql
SELECT 
    a.employeeId,
    e.fullName,
    a.checkDate,
    COUNT(DISTINCT a.shiftId) as totalShifts,
    SUM(s.endTime - s.startTime) as totalHours,
    GROUP_CONCAT(s.shiftCode, ', ') as shifts
FROM attendance a
JOIN shifts s ON a.shiftId = s.shiftId
JOIN employees e ON a.employeeId = e.employeeId
WHERE a.employeeId = 'NV001' 
  AND a.checkDate = '2025-11-01'
GROUP BY a.employeeId, a.checkDate;
```

**Kết quả:**
```
employeeId | fullName      | checkDate   | totalShifts | totalHours | shifts
-----------|---------------|-------------|-------------|------------|-------------------
NV001      | Nguyễn Văn A  | 2025-11-01  | 2           | 8          | S4_08-12, S4_14-18
```

#### Query 3: Tính công theo tháng
```sql
SELECT 
    a.employeeId,
    e.fullName,
    strftime('%Y-%m', a.checkDate) as month,
    COUNT(DISTINCT a.checkDate) as daysWorked,
    COUNT(*) as totalCheckIns,
    SUM(s.endTime - s.startTime) as totalHours
FROM attendance a
JOIN shifts s ON a.shiftId = s.shiftId
JOIN employees e ON a.employeeId = e.employeeId
WHERE a.employeeId = 'NV001' 
  AND strftime('%Y-%m', a.checkDate) = '2025-11'
GROUP BY a.employeeId, strftime('%Y-%m', a.checkDate);
```

**Kết quả:**
```
employeeId | fullName      | month   | daysWorked | totalCheckIns | totalHours
-----------|---------------|---------|------------|---------------|------------
NV001      | Nguyễn Văn A  | 2025-11 | 20         | 35            | 160
```
*Giải thích: 20 ngày làm, 35 lần chấm công (một số ngày làm 2 ca), tổng 160 giờ*

## Ví Dụ Phức Tạp: Tuần Làm Việc

### User A - Lịch làm việc tuần 01-05/11/2025

| Ngày       | Ca 1        | Giờ 1    | Ca 2        | Giờ 2    | Tổng giờ/ngày |
|------------|-------------|----------|-------------|----------|---------------|
| 01/11 (T2) | S4_08-12    | 4h       | S4_14-18    | 4h       | 8h            |
| 02/11 (T3) | S8_08-16    | 8h       | -           | -        | 8h            |
| 03/11 (T4) | S4_08-12    | 4h       | S6_14-20    | 6h       | 10h           |
| 04/11 (T5) | S8_08-16    | 8h       | -           | -        | 8h            |
| 05/11 (T6) | S5_08-13    | 5h       | S4_15-19    | 4h       | 9h            |
| **Tổng**   |             |          |             |          | **43h**       |

### SQL Insert Statements

```sql
-- Thứ 2 (01/11): 2 ca
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-01', '08:03:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S4_08-12'), 'MC001'),
('NV001', '2025-11-01', '14:01:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S4_14-18'), 'MC001');

-- Thứ 3 (02/11): 1 ca
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-02', '08:05:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S8_08-16'), 'MC001');

-- Thứ 4 (03/11): 2 ca khác nhau
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-03', '08:02:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S4_08-12'), 'MC001'),
('NV001', '2025-11-03', '14:00:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S6_14-20'), 'MC001');

-- Thứ 5 (04/11): 1 ca
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-04', '08:10:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S8_08-16'), 'MC001');

-- Thứ 6 (05/11): 2 ca
INSERT INTO attendance (employeeId, checkDate, checkTime, shiftId, checkLocation) VALUES
('NV001', '2025-11-05', '08:00:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S5_08-13'), 'MC001'),
('NV001', '2025-11-05', '15:02:00', (SELECT shiftId FROM shifts WHERE shiftCode = 'S4_15-19'), 'MC001');
```

### Query Báo Cáo Tuần

```sql
SELECT 
    a.checkDate as date,
    strftime('%w', a.checkDate) as dayOfWeek,
    CASE strftime('%w', a.checkDate)
        WHEN '0' THEN 'CN'
        WHEN '1' THEN 'T2'
        WHEN '2' THEN 'T3'
        WHEN '3' THEN 'T4'
        WHEN '4' THEN 'T5'
        WHEN '5' THEN 'T6'
        WHEN '6' THEN 'T7'
    END as day,
    COUNT(DISTINCT a.shiftId) as numberOfShifts,
    GROUP_CONCAT(s.shiftCode, ' + ') as shiftCodes,
    SUM(s.endTime - s.startTime) as dailyHours
FROM attendance a
JOIN shifts s ON a.shiftId = s.shiftId
WHERE a.employeeId = 'NV001' 
  AND a.checkDate BETWEEN '2025-11-01' AND '2025-11-05'
GROUP BY a.checkDate
ORDER BY a.checkDate;
```

**Kết quả:**
```
date       | dayOfWeek | day | numberOfShifts | shiftCodes              | dailyHours
-----------|-----------|-----|----------------|-------------------------|------------
2025-11-01 | 1         | T2  | 2              | S4_08-12 + S4_14-18     | 8
2025-11-02 | 2         | T3  | 1              | S8_08-16                | 8
2025-11-03 | 3         | T4  | 2              | S4_08-12 + S6_14-20     | 10
2025-11-04 | 4         | T5  | 1              | S8_08-16                | 8
2025-11-05 | 5         | T6  | 2              | S5_08-13 + S4_15-19     | 9
```

## Hiển Thị Trên Dashboard

### 1. Dashboard Nhân Viên (Employee View)

```javascript
// API Response for today's shifts
GET /api/attendance/my-shifts?date=2025-11-01

Response:
{
  "employeeId": "NV001",
  "date": "2025-11-01",
  "shifts": [
    {
      "shiftId": 1,
      "shiftCode": "S4_08-12",
      "shiftName": "Ca 4 Tiếng 8-12",
      "startTime": 8,
      "endTime": 12,
      "hours": 4,
      "checkTime": "08:05:00",
      "status": "checked_in"
    },
    {
      "shiftId": 7,
      "shiftCode": "S4_14-18",
      "shiftName": "Ca 4 Tiếng 14-18",
      "startTime": 14,
      "endTime": 18,
      "hours": 4,
      "checkTime": "14:02:00",
      "status": "checked_in"
    }
  ],
  "totalHours": 8
}
```

**UI Display:**
```
┌─────────────────────────────────────┐
│ Chấm Công Hôm Nay - 01/11/2025     │
├─────────────────────────────────────┤
│ ✅ Ca 1: 08:00-12:00 (4h)           │
│    Chấm công: 08:05 ✓               │
│                                     │
│ ✅ Ca 2: 14:00-18:00 (4h)           │
│    Chấm công: 14:02 ✓               │
├─────────────────────────────────────┤
│ Tổng: 8 giờ (2 ca)                  │
└─────────────────────────────────────┘
```

### 2. Manager Dashboard (Manager View)

```javascript
// API Response for team attendance
GET /api/attendance/team-summary?date=2025-11-01&storeId=MC001

Response:
{
  "date": "2025-11-01",
  "storeId": "MC001",
  "summary": {
    "totalEmployees": 10,
    "totalShifts": 15,
    "checkedIn": 12,
    "notCheckedIn": 3,
    "totalHours": 96
  },
  "employees": [
    {
      "employeeId": "NV001",
      "fullName": "Nguyễn Văn A",
      "shifts": [
        { "shiftCode": "S4_08-12", "checked": true, "time": "08:05" },
        { "shiftCode": "S4_14-18", "checked": true, "time": "14:02" }
      ],
      "hoursToday": 8
    },
    {
      "employeeId": "NV002",
      "fullName": "Trần Thị B",
      "shifts": [
        { "shiftCode": "S8_08-16", "checked": true, "time": "08:00" }
      ],
      "hoursToday": 8
    }
    // ... more employees
  ]
}
```

**UI Display:**
```
┌──────────────────────────────────────────────────────────┐
│ Quản Lý Chấm Công - 01/11/2025                          │
├──────────────────────────────────────────────────────────┤
│ Nhân viên    │ Ca làm              │ Giờ   │ Trạng thái │
├──────────────┼─────────────────────┼───────┼────────────┤
│ Nguyễn Văn A │ 08:00-12:00 ✓       │ 8h    │ ✅ Đủ ca   │
│              │ 14:00-18:00 ✓       │       │            │
├──────────────┼─────────────────────┼───────┼────────────┤
│ Trần Thị B   │ 08:00-16:00 ✓       │ 8h    │ ✅ Đúng giờ│
├──────────────┼─────────────────────┼───────┼────────────┤
│ Lê Văn C     │ 08:00-12:00 ✓       │ 4h    │ ⚠️ Thiếu ca │
│              │ 14:00-18:00 ✗       │       │   chiều    │
└──────────────┴─────────────────────┴───────┴────────────┘
```

## Tính Lương Dựa Trên Giờ Làm

### Query Tính Lương Tháng

```sql
SELECT 
    e.employeeId,
    e.fullName,
    e.position,
    COUNT(DISTINCT a.checkDate) as daysWorked,
    COUNT(DISTINCT CASE 
        WHEN (SELECT COUNT(*) FROM attendance a2 
              WHERE a2.employeeId = a.employeeId 
              AND a2.checkDate = a.checkDate) >= 2 
        THEN a.checkDate 
    END) as daysWithMultipleShifts,
    SUM(s.endTime - s.startTime) as totalHours,
    CASE 
        WHEN e.position = 'NV' THEN SUM(s.endTime - s.startTime) * 25000
        WHEN e.position = 'QL' THEN SUM(s.endTime - s.startTime) * 35000
        WHEN e.position = 'AD' THEN SUM(s.endTime - s.startTime) * 50000
    END as estimatedSalary
FROM attendance a
JOIN shifts s ON a.shiftId = s.shiftId
JOIN employees e ON a.employeeId = e.employeeId
WHERE strftime('%Y-%m', a.checkDate) = '2025-11'
  AND a.employeeId = 'NV001'
GROUP BY e.employeeId;
```

**Kết quả:**
```
employeeId | fullName     | position | daysWorked | daysWithMultipleShifts | totalHours | estimatedSalary
-----------|--------------|----------|------------|------------------------|------------|----------------
NV001      | Nguyễn Văn A | NV       | 20         | 8                      | 160        | 4,000,000 VNĐ
```

*Giải thích:*
- Làm 20 ngày, trong đó 8 ngày làm 2 ca
- Tổng 160 giờ
- Lương 25,000 VNĐ/giờ × 160 giờ = 4,000,000 VNĐ

## Migration Script: Cập Nhật Dữ Liệu Cũ

```sql
-- Step 1: Add shiftId column (if not exists - already in schema)
-- ALTER TABLE attendance ADD COLUMN shiftId INTEGER;

-- Step 2: Link existing attendance to default shift
-- Giả định: dữ liệu cũ không có shift, gán vào ca 8h (S8_08-16)
UPDATE attendance 
SET shiftId = (SELECT shiftId FROM shifts WHERE shiftCode = 'S8_08-16' LIMIT 1)
WHERE shiftId IS NULL;

-- Step 3: Verify data
SELECT 
    COUNT(*) as totalRecords,
    COUNT(shiftId) as recordsWithShift,
    COUNT(*) - COUNT(shiftId) as recordsWithoutShift
FROM attendance;
```

## Best Practices

### 1. Gán Ca Trước Khi Chấm Công
```sql
-- Manager gán ca cho nhân viên
INSERT INTO shift_assignments (employeeId, shiftId, date, assignedBy) 
VALUES ('NV001', 1, '2025-11-01', 'QL001');
```

### 2. Validate Shift Khi Chấm Công
```javascript
// Frontend: Check if employee has this shift assigned
async function validateCheckIn(employeeId, date, shiftId) {
  const assignment = await db.query(`
    SELECT * FROM shift_assignments 
    WHERE employeeId = ? AND date = ? AND shiftId = ?
  `, [employeeId, date, shiftId]);
  
  if (!assignment) {
    throw new Error("Bạn không được gán ca này!");
  }
  
  // Proceed with check-in
  await checkIn(employeeId, date, shiftId);
}
```

### 3. Prevent Duplicate Check-ins
```sql
-- UNIQUE constraint prevents same employee checking in twice for same shift/date
UNIQUE(employeeId, checkDate, shiftId)
```

## Kết Luận

**Ưu điểm của cơ chế mới:**
1. ✅ Hỗ trợ nhiều ca/ngày
2. ✅ Tính công chính xác theo từng ca
3. ✅ Linh hoạt với các loại ca khác nhau
4. ✅ Dễ báo cáo và quản lý
5. ✅ shiftCode giúp dễ reference và debug

**Công thức tính:**
```
Tổng giờ làm = SUM(endTime - startTime) của tất cả shifts đã chấm công
Lương = Tổng giờ làm × Đơn giá/giờ
```
