# RESTful API Migration Guide

## Overview
This document describes the migration from action-based query parameter API to RESTful API architecture for the HR Management System.

## What Changed

### Before (Action-Based)
```javascript
// Old way - action in query parameter
fetch('https://api.example.com/?action=login', {
  method: 'POST',
  body: JSON.stringify({ employeeId: 'NV001', password: 'pass' })
});

fetch('https://api.example.com/?action=getUser&employeeId=NV001&token=abc');
```

### After (RESTful)
```javascript
// New way - RESTful endpoints
fetch('https://api.example.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ employeeId: 'NV001', password: 'pass' })
});

fetch('https://api.example.com/api/employees/NV001', {
  headers: { 'Authorization': 'Bearer abc123' }
});
```

## Architecture Changes

### Backend (worker-service.js)

**New Features:**
1. **RestfulRouter Class**: Pattern-matching router for clean URL routing
2. **RESTful Endpoints**: 40+ endpoints following REST principles
3. **Legacy Support**: Backward compatibility via `/api/legacy` endpoint
4. **Proper HTTP Methods**: GET, POST, PUT, PATCH, DELETE
5. **Path Parameters**: e.g., `/api/employees/:employeeId`

**Key Components:**
```javascript
// Router initialization
const router = new RestfulRouter();
router.addRoute('GET', '/api/employees/:employeeId', handleGetUserById, true);
router.addRoute('POST', '/api/auth/login', handleLogin, false);

// Request handling
const route = router.match(request.method, pathname);
if (route) {
  return await route.handler(url, route.params, db, ALLOWED_ORIGIN, userId);
}
```

### Frontend

**New Files:**
1. **api-client.js**: Comprehensive API client with all methods
   - `apiClient.login(credentials)`
   - `apiClient.getEmployee(employeeId)`
   - `apiClient.checkGPS(gpsData)`
   - etc.

2. **utils.js**: Backward compatibility wrapper
   - Wraps apiClient for legacy code
   - Converts action-based calls to RESTful
   - `utils.fetchAPI()` works with both old and new formats

**Updated Files:**
1. **script.js**: Updated auth functions to use apiClient
2. **dashboard-api.js**: Updated to use apiClient methods
3. **config.js**: Added API_VERSION configuration
4. **HTML files**: Added api-client.js and utils.js scripts

## Endpoint Mapping

### Authentication
| Old | New | Method |
|-----|-----|--------|
| ?action=login | /api/auth/login | POST |
| ?action=register | /api/auth/register | POST |
| ?action=verifyEmail | /api/auth/verify-email | POST |

### Employees
| Old | New | Method |
|-----|-----|--------|
| ?action=getUsers | /api/employees | GET |
| ?action=getUser&employeeId=X | /api/employees/X | GET |
| ?action=createEmployee | /api/employees | POST |
| ?action=updatePersonalInfo | /api/employees/:id | PUT |
| ?action=getUserHistory&employeeId=X | /api/employees/X/history | GET |
| ?action=getPermissions&employeeId=X | /api/employees/X/permissions | GET |
| ?action=getPersonalStats&employeeId=X | /api/employees/X/stats | GET |

### Stores
| Old | New | Method |
|-----|-----|--------|
| ?action=getStores | /api/stores | GET |
| ?action=createStore | /api/stores | POST |
| ?action=getEmployeesByStore&storeId=X | /api/stores/X/employees | GET |

### Attendance
| Old | New | Method |
|-----|-----|--------|
| ?action=checkGPS | /api/attendance/check | POST |
| ?action=getAttendanceData | /api/attendance | GET |
| ?action=processAttendance | /api/attendance/process | POST |
| ?action=getAttendanceHistory | /api/attendance/history | GET |
| ?action=createAttendanceRequest | /api/attendance/requests | POST |
| ?action=getAttendanceRequests | /api/attendance/requests | GET |
| ?action=approveAttendanceRequest | /api/attendance/requests/:id/approve | POST |
| ?action=rejectAttendanceRequest | /api/attendance/requests/:id/reject | POST |

### Shifts
| Old | New | Method |
|-----|-----|--------|
| ?action=getShifts | /api/shifts | GET |
| ?action=getCurrentShift | /api/shifts/current | GET |
| ?action=getWeeklyShifts | /api/shifts/weekly | GET |
| ?action=getShiftAssignments | /api/shifts/assignments | GET |
| ?action=saveShiftAssignments | /api/shifts/assignments | POST |
| ?action=assignShift | /api/shifts/assign | POST |
| ?action=getShiftRequests | /api/shifts/requests | GET |
| ?action=approveShiftRequest | /api/shifts/requests/:id/approve | POST |
| ?action=rejectShiftRequest | /api/shifts/requests/:id/reject | POST |

### Dashboard
| Old | New | Method |
|-----|-----|--------|
| ?action=getDashboardStats | /api/dashboard/stats | GET |

### Registrations
| Old | New | Method |
|-----|-----|--------|
| ?action=getPendingRegistrations | /api/registrations/pending | GET |
| ?action=approveRegistration | /api/registrations/:id/approve | POST |
| ?action=approveRegistrationWithHistory | /api/registrations/approve-with-history | POST |

### Requests
| Old | New | Method |
|-----|-----|--------|
| ?action=getPendingRequests | /api/requests/pending | GET |
| ?action=getPendingRequestsCount | /api/requests/pending/count | GET |
| ?action=completeRequest | /api/requests/:id/complete | POST |

### Timesheet
| Old | New | Method |
|-----|-----|--------|
| ?action=getTimesheet | /api/timesheet | GET |

## Code Examples

### Using APIClient (Recommended)

```javascript
// Login
const result = await apiClient.login({
  employeeId: 'NV001',
  password: 'password123',
  rememberMe: true
});

// Get employee
const employee = await apiClient.getEmployee('NV001');

// Get all employees
const employees = await apiClient.getAllEmployees();

// Check GPS attendance
const result = await apiClient.checkGPS({
  employeeId: 'NV001',
  checkDate: '22/10/2024',
  checkTime: '08:30:00',
  latitude: 21.0285,
  longitude: 105.8542
});

// Get dashboard stats
const stats = await apiClient.getDashboardStats();

// Approve attendance request
await apiClient.approveAttendanceRequest('REQ001', {
  approvedBy: 'QL001',
  approvalNotes: 'Approved'
});
```

### Using utils.fetchAPI (Backward Compatibility)

```javascript
// Works with legacy action-based calls
const response = await utils.fetchAPI('?action=login', {
  method: 'POST',
  body: JSON.stringify({ employeeId: 'NV001', password: 'pass' })
});

// Also works with new RESTful endpoints
const response = await utils.fetchAPI('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ employeeId: 'NV001', password: 'pass' })
});
```

### Direct Fetch (Low-level)

```javascript
const response = await fetch('https://api.example.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    employeeId: 'NV001',
    password: 'password123'
  })
});

const data = await response.json();
```

## Backward Compatibility

The system maintains 100% backward compatibility:

1. **Legacy Endpoint**: All old action-based calls work via `/api/legacy`
   ```javascript
   GET  /api/legacy?action=getStores
   POST /api/legacy?action=login
   ```

2. **Utils Wrapper**: The `utils.fetchAPI()` function automatically routes:
   - Action-based calls → `/api/legacy` endpoint
   - RESTful calls → Direct to new endpoints

3. **Existing Code**: All existing frontend code continues to work without modification

## Migration Steps for Developers

### Option 1: Use APIClient (Recommended)
```javascript
// Instead of this:
const response = await fetch(`${API_URL}?action=login`, {...});

// Use this:
const response = await apiClient.login(credentials);
```

### Option 2: Use RESTful Endpoints Directly
```javascript
// Instead of this:
const response = await fetch(`${API_URL}?action=getUser&employeeId=${id}`, {...});

// Use this:
const response = await fetch(`${API_URL}/api/employees/${id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Option 3: Keep Using utils.fetchAPI (No Changes Required)
```javascript
// This continues to work:
const response = await utils.fetchAPI('?action=login', {...});

// The utils wrapper handles routing automatically
```

## Benefits of RESTful API

1. **Better Organization**: Clear resource-based URLs
2. **Standard HTTP Methods**: GET, POST, PUT, DELETE
3. **Path Parameters**: Clean URLs like `/api/employees/NV001`
4. **Better Caching**: HTTP caching works better with GET
5. **API Documentation**: Easier to document and understand
6. **Industry Standard**: Follows REST principles
7. **Developer Experience**: More intuitive and predictable

## Testing

### Manual Testing
```bash
# Test login
curl -X POST https://api.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"NV001","password":"pass"}'

# Test get employee
curl https://api.example.com/api/employees/NV001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test legacy endpoint
curl https://api.example.com/api/legacy?action=getStores
```

### Frontend Testing
Open browser console and test:
```javascript
// Test APIClient
await apiClient.login({employeeId: 'NV001', password: 'pass'});
await apiClient.getAllEmployees();

// Test utils wrapper
await utils.fetchAPI('?action=getStores');
```

## Security Considerations

1. **Authentication**: Use Authorization header with Bearer token
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configured to allow all origins (can be restricted)
4. **Input Validation**: All inputs are validated on backend
5. **SQL Injection**: Protected via prepared statements
6. **XSS**: Content-Type properly set for JSON responses

## Performance

- **No Breaking Changes**: All existing code continues to work
- **Backward Compatible**: Legacy endpoints still available
- **Efficient Routing**: Router uses regex pattern matching
- **Same Backend Logic**: Handler functions unchanged

## Troubleshooting

### Issue: "API client not initialized"
**Solution**: Make sure api-client.js is loaded before other scripts in HTML

### Issue: "Token not found"
**Solution**: Ensure token is stored in SecureStorageWrapper or localStorage

### Issue: "Endpoint not found"
**Solution**: Check API_DOCUMENTATION_RESTFUL.md for correct endpoint URL

### Issue: Legacy code not working
**Solution**: Ensure utils.js is loaded and utils.fetchAPI is being used

## Support

For questions or issues:
1. Check API_DOCUMENTATION_RESTFUL.md
2. Review this migration guide
3. Check browser console for errors
4. Contact system administrator

## Checklist for Deployment

- [x] Backend worker-service.js updated with RESTful router
- [x] APIClient class created and tested
- [x] Utils wrapper for backward compatibility
- [x] All HTML files include necessary scripts
- [x] API documentation created
- [x] Migration guide created
- [x] Security check passed (CodeQL)
- [ ] Manual testing of key endpoints
- [ ] User acceptance testing
- [ ] Deploy to production

## Notes

- All timestamps in ISO 8601 format
- Authentication via Bearer token in Authorization header
- Path parameters use `:paramName` syntax
- Query parameters still supported for filtering
- Legacy support will be maintained indefinitely
