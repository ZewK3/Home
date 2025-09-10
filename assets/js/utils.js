// Utility Functions
const utils = {
    showNotification(message, type = "success", duration = 3000) {
        const notification = document.getElementById("notification");
        if (!notification) {
            console.warn("Notification element not found");
            return;
        }

        const icons = {
            success: '✓',
            error: '✕', 
            warning: '⚠'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || '✓'}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
        `;
        
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            if (notification) {
                notification.classList.remove("show");
            }
        }, duration);
    },

    formatDate(date) {
        return new Date(date).toLocaleString({
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString({
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // API rate limiting - 1 call per minute per API endpoint
    apiCallTimestamps: {},

    isApiCallAllowed(apiAction) {
        const now = Date.now();
        const lastCall = this.apiCallTimestamps[apiAction];
        const oneMinute = 60 * 1000; // 60 seconds in milliseconds
        
        if (!lastCall || (now - lastCall) >= oneMinute) {
            this.apiCallTimestamps[apiAction] = now;
            return true;
        }
        
        const remainingTime = Math.ceil((oneMinute - (now - lastCall)) / 1000);
        console.warn(`API call ${apiAction} blocked. Try again in ${remainingTime} seconds.`);
        return false;
    },

    async fetchAPI(endpoint, options = {}) {
        // Extract API action from endpoint for rate limiting
        const urlParams = new URLSearchParams(endpoint.substring(1)); // Remove '?' prefix
        const apiAction = urlParams.get('action');
        
        // Apply rate limiting only if it's a recognized API action
        if (apiAction && !this.isApiCallAllowed(apiAction)) {
            throw new Error(`API call ${apiAction} rate limited. Please wait before trying again.`);
        }

        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const requestId = crypto.randomUUID().substring(0, 8);
        const startTime = performance.now();
        
        console.log(`[${requestId}] API Call: ${endpoint}`); // Debug logging for API tracking
        
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': requestId,
                    'X-Client-Version': '3.0.0',
                    ...options.headers
                }
            });

            const responseTime = performance.now() - startTime;
            
            if (!response.ok) {
                console.error(`[${requestId}] API request failed: ${response.status} ${response.statusText}`);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Log performance metrics
            console.log(`[${requestId}] API response: ${response.status} (${responseTime.toFixed(2)}ms)`);
            
            // Update performance tracking
            this.updatePerformanceMetrics(apiAction, responseTime, response.status === 200);
            
            return result;
        } catch (error) {
            const responseTime = performance.now() - startTime;
            console.error(`[${requestId}] API Error (${responseTime.toFixed(2)}ms):`, error);
            
            // Update performance tracking for errors
            this.updatePerformanceMetrics(apiAction, responseTime, false);
            
            throw error;
        }
    },

    // Performance metrics tracking
    performanceMetrics: {
        totalCalls: 0,
        totalResponseTime: 0,
        errorCount: 0,
        actionMetrics: {}
    },

    updatePerformanceMetrics(action, responseTime, success) {
        this.performanceMetrics.totalCalls++;
        this.performanceMetrics.totalResponseTime += responseTime;
        
        if (!success) {
            this.performanceMetrics.errorCount++;
        }

        // Track per-action metrics
        if (action) {
            if (!this.performanceMetrics.actionMetrics[action]) {
                this.performanceMetrics.actionMetrics[action] = {
                    calls: 0,
                    totalTime: 0,
                    errors: 0,
                    avgTime: 0
                };
            }

            const actionStats = this.performanceMetrics.actionMetrics[action];
            actionStats.calls++;
            actionStats.totalTime += responseTime;
            actionStats.avgTime = actionStats.totalTime / actionStats.calls;
            
            if (!success) {
                actionStats.errors++;
            }
        }
    },

    getPerformanceReport() {
        const total = this.performanceMetrics.totalCalls;
        return {
            ...this.performanceMetrics,
            averageResponseTime: total > 0 ? (this.performanceMetrics.totalResponseTime / total).toFixed(2) : 0,
            errorRate: total > 0 ? ((this.performanceMetrics.errorCount / total) * 100).toFixed(2) + '%' : '0%'
        };
    },

    // Enhanced API retry mechanism
    async fetchAPIWithRetry(endpoint, options = {}, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.fetchAPI(endpoint, options);
            } catch (error) {
                lastError = error;
                console.warn(`API call attempt ${attempt} failed:`, error);
                
                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`All ${maxRetries} attempts failed for ${endpoint}`);
                }
            }
        }
        
        throw lastError;
    },

    // =====================================================
    // ENHANCED DATABASE SCHEMA V3.0 API HELPERS
    // =====================================================

    // Customer Support API Functions
    async getSupportConversations() {
        try {
            return await this.fetchAPI('?action=getSupportConversations');
        } catch (error) {
            console.error('Error fetching support conversations:', error);
            throw error;
        }
    },

    async getSupportMessages(conversationId) {
        try {
            return await this.fetchAPI(`?action=getSupportMessages&conversationId=${conversationId}`);
        } catch (error) {
            console.error('Error fetching support messages:', error);
            throw error;
        }
    },

    async sendSupportMessage(conversationId, message, isEmployee = true) {
        try {
            return await this.fetchAPI('?action=sendSupportMessage', {
                method: 'POST',
                body: JSON.stringify({
                    conversationId,
                    message,
                    isEmployee
                })
            });
        } catch (error) {
            console.error('Error sending support message:', error);
            throw error;
        }
    },

    async updateSupportStatus(conversationId, status) {
        try {
            return await this.fetchAPI('?action=updateSupportStatus', {
                method: 'POST',
                body: JSON.stringify({
                    conversationId,
                    status
                })
            });
        } catch (error) {
            console.error('Error updating support status:', error);
            throw error;
        }
    },

    async createSupportConversation(customerName, customerEmail, message) {
        try {
            return await this.fetchAPI('?action=createSupportConversation', {
                method: 'POST',
                body: JSON.stringify({
                    customerName,
                    customerEmail,
                    message
                })
            });
        } catch (error) {
            console.error('Error creating support conversation:', error);
            throw error;
        }
    },

    // Enhanced Database Schema v3.0 User Management Functions
    async updatePersonalInfo(userData) {
        try {
            return await this.fetchAPI('?action=updatePersonalInfo', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        } catch (error) {
            console.error('Error updating personal info:', error);
            throw error;
        }
    },

    async updateUserWithHistory(userData) {
        try {
            return await this.fetchAPI('?action=updateUserWithHistory', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        } catch (error) {
            console.error('Error updating user with history:', error);
            throw error;
        }
    },

    async getPersonalStats(employeeId) {
        try {
            return await this.fetchAPI(`?action=getPersonalStats&employeeId=${employeeId}`);
        } catch (error) {
            console.error('Error fetching personal stats:', error);
            throw error;
        }
    },

    // Enhanced Task Management Functions
    async getWorkTasks(employeeId, page = 1, limit = 15) {
        try {
            return await this.fetchAPI(`?action=getWorkTasks&employeeId=${employeeId}&page=${page}&limit=${limit}`);
        } catch (error) {
            console.error('Error fetching work tasks:', error);
            throw error;
        }
    },

    async getTaskDetail(taskId) {
        try {
            return await this.fetchAPI(`?action=getTaskDetail&taskId=${taskId}`);
        } catch (error) {
            console.error('Error fetching task detail:', error);
            throw error;
        }
    },

    async addTaskComment(taskId, comment) {
        try {
            return await this.fetchAPI('?action=addTaskComment', {
                method: 'POST',
                body: JSON.stringify({ taskId, comment })
            });
        } catch (error) {
            console.error('Error adding task comment:', error);
            throw error;
        }
    },

    async replyToComment(commentId, reply) {
        try {
            return await this.fetchAPI('?action=replyToComment', {
                method: 'POST',
                body: JSON.stringify({ commentId, reply })
            });
        } catch (error) {
            console.error('Error replying to comment:', error);
            throw error;
        }
    },

    // Enhanced Attendance Management Functions
    async processAttendance(attendanceData) {
        try {
            return await this.fetchAPI('?action=processAttendance', {
                method: 'POST',
                body: JSON.stringify(attendanceData)
            });
        } catch (error) {
            console.error('Error processing attendance:', error);
            throw error;
        }
    },

    async createAttendanceRequest(requestData) {
        try {
            return await this.fetchAPI('?action=createAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
        } catch (error) {
            console.error('Error creating attendance request:', error);
            throw error;
        }
    },

    async getAttendanceRequests() {
        try {
            return await this.fetchAPI('?action=getAttendanceRequests');
        } catch (error) {
            console.error('Error fetching attendance requests:', error);
            throw error;
        }
    },

    async approveAttendanceRequest(requestId) {
        try {
            return await this.fetchAPI('?action=approveAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify({ requestId })
            });
        } catch (error) {
            console.error('Error approving attendance request:', error);
            throw error;
        }
    },

    async rejectAttendanceRequest(requestId, reason) {
        try {
            return await this.fetchAPI('?action=rejectAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify({ requestId, reason })
            });
        } catch (error) {
            console.error('Error rejecting attendance request:', error);
            throw error;
        }
    },

    async getAttendanceHistory(employeeId, startDate, endDate) {
        try {
            return await this.fetchAPI(`?action=getAttendanceHistory&employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`);
        } catch (error) {
            console.error('Error fetching attendance history:', error);
            throw error;
        }
    },

    // Enhanced Shift Management Functions
    async saveShiftAssignments(shiftData) {
        try {
            return await this.fetchAPI('?action=saveShiftAssignments', {
                method: 'POST',
                body: JSON.stringify(shiftData)
            });
        } catch (error) {
            console.error('Error saving shift assignments:', error);
            throw error;
        }
    },

    async getShiftRequests() {
        try {
            return await this.fetchAPI('?action=getShiftRequests');
        } catch (error) {
            console.error('Error fetching shift requests:', error);
            throw error;
        }
    },

    async approveShiftRequest(requestId) {
        try {
            return await this.fetchAPI('?action=approveShiftRequest', {
                method: 'POST',
                body: JSON.stringify({ requestId })
            });
        } catch (error) {
            console.error('Error approving shift request:', error);
            throw error;
        }
    },

    async rejectShiftRequest(requestId, reason) {
        try {
            return await this.fetchAPI('?action=rejectShiftRequest', {
                method: 'POST',
                body: JSON.stringify({ requestId, reason })
            });
        } catch (error) {
            console.error('Error rejecting shift request:', error);
            throw error;
        }
    },

    // Enhanced Registration and User Management Functions
    async getAllUsers() {
        try {
            return await this.fetchAPI('?action=getAllUsers');
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    async getApprovalTasks() {
        try {
            return await this.fetchAPI('?action=getApprovalTasks');
        } catch (error) {
            console.error('Error fetching approval tasks:', error);
            throw error;
        }
    },

    async finalApproveTask(taskId) {
        try {
            return await this.fetchAPI('?action=finalApproveTask', {
                method: 'POST',
                body: JSON.stringify({ taskId })
            });
        } catch (error) {
            console.error('Error final approving task:', error);
            throw error;
        }
    },

    async finalRejectTask(taskId, reason) {
        try {
            return await this.fetchAPI('?action=finalRejectTask', {
                method: 'POST',
                body: JSON.stringify({ taskId, reason })
            });
        } catch (error) {
            console.error('Error final rejecting task:', error);
            throw error;
        }
    },

    async completeRequest(requestId) {
        try {
            return await this.fetchAPI('?action=completeRequest', {
                method: 'POST',
                body: JSON.stringify({ requestId })
            });
        } catch (error) {
            console.error('Error completing request:', error);
            throw error;
        }
    },

    async checkdk(employeeId) {
        try {
            return await this.fetchAPI(`?action=checkdk&employeeId=${employeeId}`);
        } catch (error) {
            console.error('Error checking DK:', error);
            throw error;
        }
    },

    async getPendingRequestsCount() {
        try {
            return await this.fetchAPI('?action=getPendingRequestsCount');
        } catch (error) {
            console.error('Error fetching pending requests count:', error);
            throw error;
        }
    },

    async getEmployeesByStore(storeId) {
        try {
            return await this.fetchAPI(`?action=getEmployeesByStore&storeId=${storeId}`);
        } catch (error) {
            console.error('Error fetching employees by store:', error);
            throw error;
        }
    },

    // Enhanced Email Verification Functions
    async verifyEmail(token) {
        try {
            return await this.fetchAPI('?action=verifyEmail', {
                method: 'POST',
                body: JSON.stringify({ token })
            });
        } catch (error) {
            console.error('Error verifying email:', error);
            throw error;
        }
    },

    async approveRegistrationWithHistory(registrationData) {
        try {
            return await this.fetchAPI('?action=approveRegistrationWithHistory', {
                method: 'POST',
                body: JSON.stringify(registrationData)
            });
        } catch (error) {
            console.error('Error approving registration with history:', error);
            throw error;
        }
    },

    // Enhanced Database Schema v3.0 Field Mapping Utilities
    mapUserDataFromEnhancedSchema(userData) {
        if (!userData) return null;
        
        // Map Enhanced Database Schema v3.0 fields to frontend expected format
        return {
            employeeId: userData.employeeId,
            fullName: userData.name || userData.fullName,
            email: userData.email,
            position: userData.position || userData.role,
            storeId: userData.storeId,
            storeName: userData.storeName,
            phone: userData.phone,
            address: userData.address,
            avatar: userData.avatar,
            isActive: userData.is_active !== undefined ? userData.is_active : userData.isActive,
            createdAt: userData.created_at || userData.createdAt,
            updatedAt: userData.updated_at || userData.updatedAt,
            department: userData.department,
            departmentId: userData.department_id,
            salary: userData.salary,
            hireDate: userData.hire_date || userData.hireDate,
            birthDate: userData.birth_date || userData.birthDate,
            gender: userData.gender,
            emergencyContact: userData.emergency_contact || userData.emergencyContact,
            permissions: userData.permissions,
            employmentStatus: userData.employment_status,
            lastLoginAt: userData.last_login_at,
            notes: userData.notes,
            // Role information from Enhanced Database Schema v3.0
            roleCode: userData.role_code,
            roleName: userData.role_name,
            // Legacy compatibility: map position to equivalent role codes
            roles: this.mapPositionToRoles(userData.position, userData.role_code)
        };
    },

    // Map position names to role codes for dashboard compatibility
    // Updated to match Enhanced HR Database Schema v3.1
    mapPositionToRoles(position, roleCode) {
        // Position to role code mapping based on Enhanced Database Schema v3.1
        const positionRoleMap = {
            // Administrative positions
            'System Administrator': ['SUPER_ADMIN', 'ADMIN'],
            'Admin': ['ADMIN'],
            'HR Manager': ['HR_MANAGER', 'ADMIN'],
            
            // Management positions  
            'Store Manager': ['STORE_MANAGER', 'MANAGER'],
            'Area Manager': ['AREA_MANAGER', 'MANAGER'],
            'Department Head': ['DEPT_HEAD', 'MANAGER'],
            'Team Leader': ['TEAM_LEADER'],
            
            // Employee positions
            'Senior Employee': ['SENIOR_EMP', 'EMPLOYEE'],
            'Employee': ['EMPLOYEE'],
            'Intern': ['INTERN', 'EMPLOYEE'],
            'Customer Support': ['CUST_SUPPORT', 'EMPLOYEE'],
            
            // Legacy compatibility (old role codes still supported)
            'AD': ['ADMIN', 'AD'],
            'QL': ['MANAGER', 'QL'], 
            'AM': ['AREA_MANAGER', 'AM'],
            'NV': ['EMPLOYEE', 'NV']
        };

        // Start with role codes from database if available
        let roles = [];
        if (roleCode) {
            roles.push(roleCode);
        }

        // Also handle cases where position is already a role code
        const roleCodeMapping = {
            'SUPER_ADMIN': ['SUPER_ADMIN', 'ADMIN', 'AD'],
            'ADMIN': ['ADMIN', 'AD'],
            'HR_MANAGER': ['HR_MANAGER', 'ADMIN', 'AD'],
            'STORE_MANAGER': ['STORE_MANAGER', 'QL'],
            'AREA_MANAGER': ['AREA_MANAGER', 'AM'],
            'DEPT_HEAD': ['DEPT_HEAD'],
            'TEAM_LEADER': ['TEAM_LEADER'],
            'SENIOR_EMP': ['SENIOR_EMP', 'EMPLOYEE', 'NV'],
            'EMPLOYEE': ['EMPLOYEE', 'NV'],
            'INTERN': ['INTERN', 'NV'],
            'CUST_SUPPORT': ['CUST_SUPPORT', 'NV']
        };

        // Add mapped roles based on position (could be position name or role code)
        if (position) {
            if (positionRoleMap[position]) {
                roles = roles.concat(positionRoleMap[position]);
            } else if (roleCodeMapping[position]) {
                roles = roles.concat(roleCodeMapping[position]);
            } else {
                // If position is already a role code, just add it
                roles.push(position);
            }
        }

        // Remove duplicates and return
        return [...new Set(roles)];
    },

    // Check if user has access based on role (supports both new and legacy role codes)
    checkRoleAccess(userPosition, allowedRoles) {
        if (!userPosition || !allowedRoles || allowedRoles.length === 0) {
            return false;
        }

        // Convert to array if string
        const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        // Get all user roles based on position
        const userRoles = this.mapPositionToRoles(userPosition);
        
        // Check if user has any of the allowed roles
        return allowedRolesArray.some(allowedRole => {
            const trimmedRole = allowedRole.trim();
            // Direct position match or role match
            return userPosition === trimmedRole || userRoles.includes(trimmedRole);
        });
    },

    mapTaskDataFromEnhancedSchema(taskData) {
        if (!taskData) return null;
        
        return {
            taskId: taskData.task_id || taskData.taskId,
            title: taskData.title,
            description: taskData.description,
            assignedTo: taskData.assigned_to || taskData.assignedTo,
            assignedBy: taskData.assigned_by || taskData.assignedBy,
            status: taskData.status,
            priority: taskData.priority,
            dueDate: taskData.due_date || taskData.dueDate,
            createdAt: taskData.created_at || taskData.createdAt,
            updatedAt: taskData.updated_at || taskData.updatedAt,
            completedAt: taskData.completed_at || taskData.completedAt,
            comments: taskData.comments || []
        };
    },

    mapAttendanceDataFromEnhancedSchema(attendanceData) {
        if (!attendanceData) return null;
        
        return {
            attendanceId: attendanceData.attendance_id || attendanceData.attendanceId,
            employeeId: attendanceData.employee_id || attendanceData.employeeId,
            checkInTime: attendanceData.check_in_time || attendanceData.checkInTime,
            checkOutTime: attendanceData.check_out_time || attendanceData.checkOutTime,
            workDate: attendanceData.work_date || attendanceData.workDate,
            status: attendanceData.status,
            totalHours: attendanceData.total_hours || attendanceData.totalHours,
            overtimeHours: attendanceData.overtime_hours || attendanceData.overtimeHours,
            notes: attendanceData.notes,
            location: attendanceData.location,
            createdAt: attendanceData.created_at || attendanceData.createdAt
        };
    }
};

// Global notification function for backward compatibility
function showNotification(message, type, duration) {
    utils.showNotification(message, type, duration);
}