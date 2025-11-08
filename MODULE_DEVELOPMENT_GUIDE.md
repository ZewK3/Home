# Module Development Guide - Hướng Dẫn Phát Triển Module

## Tổng Quan

Hệ thống dashboard sử dụng kiến trúc **Single Page Application (SPA)** với routing dựa trên hash (`#`). Mỗi chức năng được gọi là một **module** và được render động vào `#mainContent`.

## Kiến Trúc Module

### 1. Các Files Liên Quan

```
/assets/js/
├── dashboard-main.js         # Navigation và routing
├── dashboard-content.js      # Content renderer cho tất cả modules
├── hrm-modules.js           # Modules đặc thù cho VP và CH
├── hrm-router.js            # Permission routing
└── dashboard-loader.js      # Script loader
```

### 2. Luồng Hoạt Động

```
User Click Menu
    ↓
navigateToFunction(functionName)
    ↓
Update URL hash (#functionName)
    ↓
Update header title
    ↓
renderContent(functionName)
    ↓
Call DashboardContent[methodName]()
    ↓
Render HTML to #mainContent
    ↓
Call init method (if exists)
```

## Modules Hiện Có

### Dashboard Functions (18 modules)

| Function Name | Title | Render Method | Init Method | Status |
|---------------|-------|---------------|-------------|---------|
| `home` | Dashboard | `renderHome` | - | ✅ Working |
| `schedule` | Lịch Làm | `renderSchedule` | - | ✅ Working |
| `shifts` | Ca làm | `renderShifts` | - | ⚠️ Basic |
| `timesheet` | Bảng Công | `renderTimesheet` | `initTimesheet` | ✅ Working |
| `salary` | Bảng Lương | `renderSalary` | - | ⚠️ Basic |
| `profile` | Cá Nhân | `renderProfile` | - | ✅ Working |
| `attendance` | Chấm công | `renderAttendance` | - | ✅ Working |
| `schedule-registration` | Đăng ký lịch | `renderScheduleRegistration` | - | ⚠️ Basic |
| `leave-request` | Đơn Từ | `renderLeaveRequest` | - | ✅ Fixed |
| `process-requests` | Xử lý yêu cầu | `renderProcessRequests` | `initProcessRequests` | ✅ Working |
| `registration-approval` | Duyệt đăng ký | `renderApproveRegistration` | - | ⚠️ Missing |
| `attendance-approval` | Duyệt chấm công | - | - | ❌ Missing |
| `timesheet-approval` | Duyệt bảng công | - | - | ❌ Missing |
| `salary-management` | Quản lý lương | - | - | ❌ Missing |
| `employee-management` | Quản lý nhân viên | - | - | ❌ Missing |
| `schedule-management` | Xếp lịch làm việc | - | - | ❌ Missing |
| `departments` | Phòng ban | - | - | ❌ Missing |
| `positions` | Chức vụ | - | - | ❌ Missing |
| `system-settings` | Cài đặt hệ thống | - | - | ❌ Missing |
| `reports` | Báo cáo | - | - | ❌ Missing |

**Legend**:
- ✅ **Working**: Module hoàn chỉnh, đầy đủ chức năng
- ⚠️ **Basic**: Module cơ bản, cần cải thiện
- ❌ **Missing**: Module chưa có, cần phát triển

## Cách Tạo Module Mới

### Bước 1: Thêm Vào Menu (pages/dashboard.html)

```html
<button class="menu-item" data-function="new-module" data-required-permission="module_permission">
    <span class="menu-icon">
        <span class="material-icons-round">icon_name</span>
    </span>
    <span class="menu-label">Tên Module</span>
</button>
```

### Bước 2: Thêm Title Mapping (dashboard-main.js)

```javascript
// Line ~264
const titles = {
    'home': 'Dashboard',
    'new-module': 'Tên Module',  // ← Thêm dòng này
    // ... other titles
};
```

### Bước 3: Thêm Content Method Mapping (dashboard-main.js)

```javascript
// Line ~288
const contentMethods = {
    'home': 'renderHome',
    'new-module': 'renderNewModule',  // ← Thêm dòng này
    // ... other methods
};
```

### Bước 4: Thêm Init Method (nếu cần) (dashboard-main.js)

```javascript
// Line ~304
const initMethods = {
    'process-requests': 'initProcessRequests',
    'new-module': 'initNewModule',  // ← Thêm dòng này (nếu cần)
    // ... other init methods
};
```

### Bước 5: Tạo Render Method (dashboard-content.js hoặc hrm-modules.js)

```javascript
// Trong DashboardContent object
async renderNewModule() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-icons-round">icon_name</span>
                    Tên Module
                </h2>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="DashboardContent.performAction()">
                        <span class="material-icons-round">add</span>
                        Hành Động
                    </button>
                </div>
            </div>
            <div class="card-body" id="moduleContent">
                <!-- Content sẽ được load ở đây -->
                <div class="loading-container">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
},
```

### Bước 6: Tạo Init Method (nếu cần)

```javascript
async initNewModule() {
    // Load dữ liệu ban đầu
    await this.loadModuleData();
    
    // Setup event listeners
    const actionBtn = document.getElementById('actionBtn');
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            this.handleAction();
        });
    }
},

async loadModuleData() {
    const container = document.getElementById('moduleContent');
    if (!container) return;
    
    try {
        const data = await apiClient.get('/api/module-data');
        
        if (data && data.data) {
            container.innerHTML = this.renderModuleList(data.data);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-round">inbox</span>
                    <p>Không có dữ liệu</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading module data:', error);
        container.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
    }
},
```

### Bước 7: Thêm Permission Routing (hrm-router.js)

```javascript
// Line ~30+
'new-module': ['module_permission'],
```

## Template Patterns

### 1. List Module (Danh Sách)

```javascript
async renderListModule() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-icons-round">list</span>
                    Danh Sách
                </h2>
                <div class="filters">
                    <select id="statusFilter" class="form-select">
                        <option value="">Tất cả</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Ngưng hoạt động</option>
                    </select>
                    <button class="btn btn-primary" onclick="DashboardContent.showCreateForm()">
                        <span class="material-icons-round">add</span>
                        Thêm mới
                    </button>
                </div>
            </div>
            <div class="card-body" id="listContainer">
                <div class="loading-container">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
},

async initListModule() {
    await this.loadList();
    
    // Filter change handler
    const filter = document.getElementById('statusFilter');
    if (filter) {
        filter.addEventListener('change', () => this.loadList());
    }
},

async loadList() {
    const container = document.getElementById('listContainer');
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    if (!container) return;
    
    try {
        const response = await apiClient.get('/api/items', {
            status: statusFilter,
            limit: 100
        });
        
        if (response.data && response.data.length > 0) {
            container.innerHTML = `
                <div class="list-grid">
                    ${response.data.map(item => `
                        <div class="list-item" data-id="${item.id}">
                            <div class="list-item-header">
                                <h3>${item.name}</h3>
                                <span class="badge badge-${item.status === 'active' ? 'success' : 'secondary'}">
                                    ${item.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                                </span>
                            </div>
                            <div class="list-item-body">
                                <p>${item.description}</p>
                            </div>
                            <div class="list-item-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DashboardContent.editItem('${item.id}')">
                                    <span class="material-icons-round">edit</span>
                                    Sửa
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="DashboardContent.deleteItem('${item.id}')">
                                    <span class="material-icons-round">delete</span>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-round">inbox</span>
                    <p>Chưa có dữ liệu</p>
                    <button class="btn btn-primary" onclick="DashboardContent.showCreateForm()">
                        Thêm mới
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading list:', error);
        container.innerHTML = '<p class="text-error">Lỗi khi tải dữ liệu</p>';
    }
},
```

### 2. Form Module (Biểu Mẫu)

```javascript
async renderFormModule() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-icons-round">edit</span>
                    Biểu Mẫu
                </h2>
            </div>
            <div class="card-body">
                <form id="moduleForm" class="form">
                    <div class="form-group">
                        <label for="fieldName">Tên trường *</label>
                        <input type="text" id="fieldName" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="fieldSelect">Chọn *</label>
                        <select id="fieldSelect" class="form-control" required>
                            <option value="">Chọn...</option>
                            <option value="option1">Lựa chọn 1</option>
                            <option value="option2">Lựa chọn 2</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="fieldTextarea">Mô tả</label>
                        <textarea id="fieldTextarea" class="form-control" rows="4"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="history.back()">
                            Hủy
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
},

async initFormModule() {
    const form = document.getElementById('moduleForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }
},

async submitForm() {
    const fieldName = document.getElementById('fieldName').value;
    const fieldSelect = document.getElementById('fieldSelect').value;
    const fieldTextarea = document.getElementById('fieldTextarea').value;
    
    if (!fieldName || !fieldSelect) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    try {
        await apiClient.post('/api/items', {
            name: fieldName,
            type: fieldSelect,
            description: fieldTextarea
        });
        
        alert('Lưu thành công!');
        navigateToFunction('list-module');
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Lỗi khi lưu: ' + error.message);
    }
},
```

### 3. Dashboard/Stats Module (Thống Kê)

```javascript
async renderStatsModule() {
    try {
        const stats = await apiClient.get('/api/stats');
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #3b82f6;">
                        <span class="material-icons-round">people</span>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.data.total || 0}</h3>
                        <p>Tổng số</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #10b981;">
                        <span class="material-icons-round">check_circle</span>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.data.active || 0}</h3>
                        <p>Hoạt động</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f59e0b;">
                        <span class="material-icons-round">pending</span>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.data.pending || 0}</h3>
                        <p>Chờ xử lý</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #ef4444;">
                        <span class="material-icons-round">cancel</span>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.data.inactive || 0}</h3>
                        <p>Ngưng hoạt động</p>
                    </div>
                </div>
            </div>
            
            <div class="card mt-4">
                <div class="card-header">
                    <h3>Hoạt Động Gần Đây</h3>
                </div>
                <div class="card-body" id="recentActivity">
                    <div class="loading-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
        return '<p class="text-error">Lỗi khi tải thống kê</p>';
    }
},

async initStatsModule() {
    await this.loadRecentActivity();
},

async loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    try {
        const response = await apiClient.get('/api/recent-activity', { limit: 10 });
        
        if (response.data && response.data.length > 0) {
            container.innerHTML = `
                <div class="activity-list">
                    ${response.data.map(activity => `
                        <div class="activity-item">
                            <span class="activity-icon">
                                <span class="material-icons-round">${activity.icon}</span>
                            </span>
                            <div class="activity-content">
                                <p>${activity.description}</p>
                                <small>${new Date(activity.createdAt).toLocaleString('vi-VN')}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-muted">Không có hoạt động gần đây</p>';
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
        container.innerHTML = '<p class="text-error">Lỗi khi tải hoạt động</p>';
    }
},
```

### 4. Approval Module (Xét Duyệt)

```javascript
async renderApprovalModule() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-icons-round">approval</span>
                    Xét Duyệt
                </h2>
                <div class="filters">
                    <select id="approvalFilter" class="form-select">
                        <option value="">Tất cả</option>
                        <option value="pending" selected>Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                </div>
            </div>
            <div class="card-body" id="approvalList">
                <div class="loading-container">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
        
        <!-- Approval Modal -->
        <div id="approvalModal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="DashboardContent.closeApprovalModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Xét Duyệt</h3>
                    <button class="modal-close" onclick="DashboardContent.closeApprovalModal()">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="approvalDetails"></div>
                    <form id="approvalForm">
                        <input type="hidden" id="approvalItemId">
                        <div class="form-group">
                            <label>Ghi chú (tùy chọn)</label>
                            <textarea id="approvalNote" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-danger" onclick="DashboardContent.processApproval('rejected')">
                                Từ chối
                            </button>
                            <button type="button" class="btn btn-success" onclick="DashboardContent.processApproval('approved')">
                                Phê duyệt
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
},

async initApprovalModule() {
    await this.loadApprovalList();
    
    const filter = document.getElementById('approvalFilter');
    if (filter) {
        filter.addEventListener('change', () => this.loadApprovalList());
    }
},

async loadApprovalList() {
    const container = document.getElementById('approvalList');
    const statusFilter = document.getElementById('approvalFilter')?.value || 'pending';
    
    if (!container) return;
    
    try {
        const response = await apiClient.get('/api/approvals', {
            status: statusFilter,
            limit: 100
        });
        
        if (response.data && response.data.length > 0) {
            container.innerHTML = `
                <div class="approval-list">
                    ${response.data.map(item => `
                        <div class="approval-item ${item.status}">
                            <div class="approval-header">
                                <h3>${item.title}</h3>
                                <span class="badge badge-${item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}">
                                    ${item.status === 'approved' ? 'Đã duyệt' : item.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                                </span>
                            </div>
                            <div class="approval-body">
                                <p><strong>Người yêu cầu:</strong> ${item.requesterName}</p>
                                <p><strong>Nội dung:</strong> ${item.description}</p>
                                <p><small>Tạo lúc: ${new Date(item.createdAt).toLocaleString('vi-VN')}</small></p>
                            </div>
                            ${item.status === 'pending' ? `
                            <div class="approval-actions">
                                <button class="btn btn-sm btn-primary" onclick="DashboardContent.showApprovalModal('${item.id}')">
                                    Xét duyệt
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-round">done_all</span>
                    <p>Không có yêu cầu ${statusFilter === 'pending' ? 'chờ duyệt' : statusFilter === 'approved' ? 'đã duyệt' : 'đã từ chối'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading approval list:', error);
        container.innerHTML = '<p class="text-error">Lỗi khi tải danh sách</p>';
    }
},

showApprovalModal(itemId) {
    const modal = document.getElementById('approvalModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('approvalItemId').value = itemId;
        // Load and display item details...
    }
},

closeApprovalModal() {
    const modal = document.getElementById('approvalModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('approvalForm').reset();
    }
},

async processApproval(status) {
    const itemId = document.getElementById('approvalItemId').value;
    const note = document.getElementById('approvalNote').value;
    
    try {
        await apiClient.put(`/api/approvals/${itemId}`, {
            status,
            note,
            reviewedBy: SimpleStorage.get('userData')?.employeeId
        });
        
        alert(status === 'approved' ? 'Đã phê duyệt thành công!' : 'Đã từ chối!');
        this.closeApprovalModal();
        await this.loadApprovalList();
    } catch (error) {
        console.error('Error processing approval:', error);
        alert('Lỗi khi xét duyệt: ' + error.message);
    }
},
```

## Common Utilities

### 1. Show/Hide Loading
```javascript
showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
            </div>
        `;
    }
},
```

### 2. Show Empty State
```javascript
showEmptyState(containerId, message, icon = 'inbox', actionButton = null) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">${icon}</span>
                <p>${message}</p>
                ${actionButton ? actionButton : ''}
            </div>
        `;
    }
},
```

### 3. Show Error
```javascript
showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<p class="text-error">${message}</p>`;
    }
},
```

### 4. Format Date/Time
```javascript
formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
},

formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
},
```

## Best Practices

### 1. Error Handling
```javascript
try {
    const data = await apiClient.get('/api/endpoint');
    // Handle success
} catch (error) {
    console.error('Error:', error);
    // Show user-friendly error message
    this.showError('containerId', 'Lỗi khi tải dữ liệu');
}
```

### 2. Loading States
```javascript
async loadData() {
    this.showLoading('containerId');
    
    try {
        const data = await apiClient.get('/api/endpoint');
        // Render data
    } catch (error) {
        this.showError('containerId', 'Lỗi khi tải dữ liệu');
    }
}
```

### 3. Event Listeners
```javascript
// Always check if element exists
const button = document.getElementById('myButton');
if (button) {
    button.addEventListener('click', () => {
        this.handleClick();
    });
}
```

### 4. Data Validation
```javascript
async submitForm() {
    const value = document.getElementById('input').value;
    
    if (!value || value.trim() === '') {
        alert('Vui lòng nhập giá trị');
        return;
    }
    
    // Continue with submission
}
```

### 5. Responsive Design
- Use CSS Grid/Flexbox
- Mobile-first approach
- Test on different screen sizes
- Use `@media` queries when needed

### 6. Accessibility
- Use semantic HTML
- Add ARIA labels when needed
- Keyboard navigation support
- Clear focus states

## Modules Cần Phát Triển (Priority Order)

### High Priority (Cần gấp)
1. **attendance-approval**: Duyệt chấm công (manager function)
2. **timesheet-approval**: Duyệt bảng công (manager function)
3. **salary-management**: Quản lý lương (admin function)
4. **employee-management**: Quản lý nhân viên (admin function)
5. **schedule-management**: Xếp lịch làm việc (manager function)

### Medium Priority (Quan trọng)
6. **departments**: Quản lý phòng ban (admin function)
7. **positions**: Quản lý chức vụ (admin function)
8. **registration-approval**: Duyệt đăng ký (admin function)
9. **reports**: Báo cáo tổng hợp (manager/admin function)

### Low Priority (Bổ sung)
10. **system-settings**: Cài đặt hệ thống (admin function)
11. **shifts** (improve): Nâng cấp quản lý ca làm
12. **salary** (improve): Nâng cấp xem bảng lương
13. **schedule-registration** (improve): Nâng cấp đăng ký lịch

## Testing Checklist

- [ ] Module renders without errors
- [ ] Data loads correctly from API
- [ ] Forms validate input properly
- [ ] Modals open/close correctly
- [ ] Event listeners work
- [ ] Error handling works
- [ ] Loading states display
- [ ] Empty states display
- [ ] Responsive on mobile
- [ ] Permissions checked correctly
- [ ] Navigation works (back button, hash)
- [ ] No console errors

## Debugging Tips

1. **Check console**: Press F12 → Console tab
2. **Verify API calls**: Network tab in DevTools
3. **Check element IDs**: Make sure IDs match in HTML and JS
4. **Test in mock mode**: Set `MOCK_MODE = true` in config.js
5. **Use console.log**: Add logging to track execution flow
6. **Check permissions**: Verify user has required permissions

## Deployment

1. **Test locally**: Test all functionality
2. **Minify JS/CSS**: Use build tools (optional)
3. **Update version**: Increment version in config.js
4. **Commit changes**: Git commit with descriptive message
5. **Push to repo**: Push to GitHub
6. **Verify production**: Test on live site

---

Để phát triển module mới, hãy follow template patterns phía trên và đảm bảo tuân thủ schema database trong `Tabbel-v2-optimized.sql`.
