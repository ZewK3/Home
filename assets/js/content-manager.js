/**
 * Content Manager - Streamlined Version
 * Manages dashboard content, user interactions, and core functionality
 */
class ContentManager {
    constructor(user) {
        this.user = user;
        this.attendanceRequests = [];
        this.initialize();
    }

    initialize() {
        this.setupMenuHandlers();
        this.makeGloballyAccessible();
        this.setupUserSearch();
        console.log('✅ ContentManager initialized successfully');
    }

    // Global accessibility for onclick handlers
    makeGloballyAccessible() {
        window.showSectionContent = (section) => this.showSectionContent(section);
        window.showInformationRequest = () => this.showInformationRequest();
        window.showAttendanceRequest = () => this.showAttendanceRequest();
        window.showTaskManagement = () => this.showTaskManagement();
        window.showPersonnelRequests = () => this.showPersonnelRequests();
        window.submitInformationRequest = () => this.submitInformationRequest();
        window.submitAttendanceRequest = () => this.submitAttendanceRequest();
        window.submitTaskForm = () => this.submitTaskForm();
    }

    // Menu and navigation handlers
    setupMenuHandlers() {
        this.setupQuickActionHandlers();
        this.setupFormSubmissions();
    }

    setupQuickActionHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-action-btn')) {
                const action = e.target.closest('.quick-action-btn').dataset.action;
                this.handleQuickAction(action);
            }
        });
    }

    handleQuickAction(action) {
        const actions = {
            'attendance': () => this.showAttendanceRequest(),
            'request': () => this.showInformationRequest(),
            'task': () => this.showTaskManagement(),
            'personnel': () => this.showPersonnelRequests()
        };
        
        if (actions[action]) {
            actions[action]();
        }
    }

    // User search functionality
    setupUserSearch() {
        const searchInputs = document.querySelectorAll('.user-search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.filterUsers(e.target.value, e.target.closest('.user-list-component'));
            });
        });
    }

    filterUsers(searchTerm, container) {
        if (!container) return;
        
        const userItems = container.querySelectorAll('.user-item');
        userItems.forEach(item => {
            const name = item.textContent.toLowerCase();
            const matches = name.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    // Content section management
    showSectionContent(section) {
        // Hide all content sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(s => s.classList.add('element-hidden'));
        
        // Show selected section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.remove('element-hidden');
            targetSection.classList.add('element-visible');
        }
        
        console.log(`Showing section: ${section}`);
    }

    // Information request functionality
    showInformationRequest() {
        this.showSectionContent('informationRequestContent');
        this.loadUserData();
    }

    submitInformationRequest() {
        const form = document.getElementById('informationRequestForm');
        if (!form) return;

        const formData = new FormData(form);
        const requestData = {
            employeeId: this.user?.employeeId || '',
            requestType: formData.get('requestType'),
            details: formData.get('details'),
            timestamp: new Date().toISOString()
        };

        this.processRequest('information', requestData);
    }

    // Attendance request functionality
    showAttendanceRequest() {
        this.showSectionContent('attendanceRequestContent');
        this.setupAttendanceForm();
    }

    setupAttendanceForm() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('attendanceDate');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    submitAttendanceRequest() {
        const form = document.getElementById('attendanceRequestForm');
        if (!form) return;

        const formData = new FormData(form);
        const requestData = {
            employeeId: this.user?.employeeId || '',
            date: formData.get('date'),
            type: formData.get('type'),
            reason: formData.get('reason'),
            timestamp: new Date().toISOString()
        };

        this.processRequest('attendance', requestData);
    }

    // Task management functionality
    showTaskManagement() {
        this.showSectionContent('taskManagementContent');
        this.loadTasks();
    }

    submitTaskForm() {
        const form = document.getElementById('taskForm');
        if (!form) return;

        const formData = new FormData(form);
        const taskData = {
            title: formData.get('taskTitle'),
            description: formData.get('taskDescription'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            assignedBy: this.user?.employeeId || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.processTask(taskData);
    }

    // Personnel requests functionality
    showPersonnelRequests() {
        this.showSectionContent('personnelRequestsContent');
        this.loadPersonnelRequests();
    }

    // Form submission handlers
    setupFormSubmissions() {
        const forms = ['informationRequestForm', 'attendanceRequestForm', 'taskForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmission(formId);
                });
            }
        });
    }

    handleFormSubmission(formId) {
        const handlers = {
            'informationRequestForm': () => this.submitInformationRequest(),
            'attendanceRequestForm': () => this.submitAttendanceRequest(),
            'taskForm': () => this.submitTaskForm()
        };

        if (handlers[formId]) {
            handlers[formId]();
        }
    }

    // Data processing methods
    processRequest(type, data) {
        console.log(`Processing ${type} request:`, data);
        
        // Simulate API call
        setTimeout(() => {
            this.showNotification(`${type} request submitted successfully`, 'success');
            this.clearForm(type);
        }, 1000);
    }

    processTask(data) {
        console.log('Processing task:', data);
        
        // Simulate API call
        setTimeout(() => {
            this.showNotification('Task created successfully', 'success');
            this.clearForm('task');
            this.loadTasks();
        }, 1000);
    }

    // Data loading methods
    loadUserData() {
        if (this.user) {
            const fields = {
                'employeeId': this.user.employeeId,
                'fullName': this.user.fullName,
                'department': this.user.department
            };

            Object.entries(fields).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field) field.value = value || '';
            });
        }
    }

    // Load real tasks from API instead of sample data
    async loadTasks() {
        const tasksContainer = document.getElementById('tasksContainer');
        if (tasksContainer) {
            try {
                const tasks = await utils.fetchAPI(`?action=getUserTasks&employeeId=${this.user.employeeId}&status=pending&limit=5`);
                
                if (tasks && tasks.success && Array.isArray(tasks.data) && tasks.data.length > 0) {
                    const tasksHTML = tasks.data.map(task => `
                        <div class="task-item" data-task-id="${task.id}">
                            <h4>${task.title || 'Untitled Task'}</h4>
                            <p>${task.description || 'No description available'}</p>
                            <span class="task-status ${task.status || 'pending'}">${task.status || 'Pending'}</span>
                            <span class="task-date">${task.created_at ? utils.formatDate(task.created_at) : ''}</span>
                        </div>
                    `).join('');
                    tasksContainer.innerHTML = tasksHTML;
                } else {
                    tasksContainer.innerHTML = `
                        <div class="no-data-message">
                            <p>Không có công việc nào được giao</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading tasks:', error);
                tasksContainer.innerHTML = `
                    <div class="error-message">
                        <p>Không thể tải danh sách công việc</p>
                    </div>
                `;
            }
        }
    }

    // Load real personnel requests from API instead of sample data
    async loadPersonnelRequests() {
        const requestsContainer = document.getElementById('personnelRequestsContainer');
        if (requestsContainer) {
            try {
                const requests = await utils.fetchAPI(`?action=getPersonnelRequests&employeeId=${this.user.employeeId}&status=pending&limit=5`);
                
                if (requests && requests.success && Array.isArray(requests.data) && requests.data.length > 0) {
                    const requestsHTML = requests.data.map(request => `
                        <div class="request-item" data-request-id="${request.id}">
                            <h4>${request.type || 'Personnel Request'}</h4>
                            <p>${request.description || 'No description available'}</p>
                            <span class="request-status ${request.status || 'pending'}">${request.status || 'Pending Review'}</span>
                            <span class="request-date">${request.created_at ? utils.formatDate(request.created_at) : ''}</span>
                        </div>
                    `).join('');
                    requestsContainer.innerHTML = requestsHTML;
                } else {
                    requestsContainer.innerHTML = `
                        <div class="no-data-message">
                            <p>Không có yêu cầu nào chờ xử lý</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading personnel requests:', error);
                requestsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Không thể tải danh sách yêu cầu</p>
                    </div>
                `;
            }
        }
    }

    // Utility methods
    clearForm(type) {
        const formMap = {
            'information': 'informationRequestForm',
            'attendance': 'attendanceRequestForm',
            'task': 'taskForm'
        };

        const formId = formMap[type];
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Date utility methods
    getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
        return {
            start: startOfWeek.toISOString().split('T')[0],
            end: endOfWeek.toISOString().split('T')[0]
        };
    }

    getCurrentMonth() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            monthName: now.toLocaleDateString('vi-VN', { month: 'long' })
        };
    }

    // Text editor functionality (simplified)
    initializeTextEditor() {
        const textareas = document.querySelectorAll('.rich-text-editor');
        textareas.forEach(textarea => {
            this.enhanceTextarea(textarea);
        });
    }

    enhanceTextarea(textarea) {
        // Simple text enhancement
        textarea.addEventListener('input', (e) => {
            const value = e.target.value;
            // Auto-resize
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        });
    }
}

// Export for global use
window.ContentManager = ContentManager;