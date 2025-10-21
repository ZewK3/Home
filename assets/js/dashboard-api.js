/**
 * Dashboard API Integration
 * Handles all API calls for dashboard functionality
 * 
 * DATABASE v2 COMPATIBLE:
 * - Works with optimized schema (17 tables instead of 23)
 * - Attendance includes GPS data (no separate gps_attendance table)
 * - All requests go to employee_requests table (unified)
 * - Employee approval_status in employees table (no queue table)
 */

const DashboardAPI = {
    /**
     * Dashboard Statistics
     */
    async getEmployeeCount() {
        try {
            const response = await utils.fetchAPI('?action=getEmployeeCount');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching employee count:', error);
            return null;
        }
    },

    async getTodayShift() {
        try {
            const response = await utils.fetchAPI('?action=getTodayShift');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching today shift:', error);
            return null;
        }
    },

    async getPendingTasks() {
        try {
            const response = await utils.fetchAPI('?action=getPendingTasks');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching pending tasks:', error);
            return null;
        }
    },



    /**
     * Attendance Management
     */
    async getAttendance(employeeId, startDate, endDate) {
        try {
            const response = await utils.fetchAPI(`?action=getAttendance&employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return null;
        }
    },

    async clockIn(employeeId, latitude, longitude) {
        try {
            // DATABASE v2: GPS data stored directly in attendance table
            // No separate gps_attendance insert needed
            const response = await utils.fetchAPI('?action=clockIn', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                })
            });
            return response;
        } catch (error) {
            console.error('Error clocking in:', error);
            return { success: false, message: error.message };
        }
    },

    async clockOut(employeeId, latitude, longitude) {
        try {
            // DATABASE v2: GPS data stored directly in attendance table
            // checkOutLatitude, checkOutLongitude columns used
            const response = await utils.fetchAPI('?action=clockOut', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                })
            });
            return response;
        } catch (error) {
            console.error('Error clocking out:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Shift Management
     */
    async getShiftAssignments(employeeId, month, year) {
        try {
            const response = await utils.fetchAPI(`?action=getShiftAssignments&employeeId=${employeeId}&month=${month}&year=${year}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching shift assignments:', error);
            return null;
        }
    },

    async getTimesheet(employeeId, month, year) {
        try {
            const response = await utils.fetchAPI(`?action=getTimesheet&employeeId=${employeeId}&month=${month}&year=${year}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching timesheet:', error);
            return null;
        }
    },



    async updateTaskStatus(taskId, status) {
        try {
            const response = await utils.fetchAPI('?action=updateTaskStatus', {
                method: 'POST',
                body: JSON.stringify({
                    taskId,
                    status
                })
            });
            return response;
        } catch (error) {
            console.error('Error updating task status:', error);
            return { success: false, message: error.message };
        }
    },

    async createTask(taskData) {
        try {
            const response = await utils.fetchAPI('?action=createTask', {
                method: 'POST',
                body: JSON.stringify(taskData)
            });
            return response;
        } catch (error) {
            console.error('Error creating task:', error);
            return { success: false, message: error.message };
        }
    },

    async assignTask(taskId, employeeId) {
        try {
            const response = await utils.fetchAPI('?action=assignTask', {
                method: 'POST',
                body: JSON.stringify({
                    taskId,
                    employeeId
                })
            });
            return response;
        } catch (error) {
            console.error('Error assigning task:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Request Management - DATABASE v2 COMPATIBLE
     * All requests now go to unified employee_requests table
     * Request types: LEAVE, OVERTIME, FORGOT_CHECKIN, FORGOT_CHECKOUT, SHIFT_CHANGE, OTHER
     */
    async submitAttendanceRequest(requestData) {
        try {
            // DATABASE v2: Submits to employee_requests table with requestType field
            const response = await utils.fetchAPI('?action=submitEmployeeRequest', {
                method: 'POST',
                body: JSON.stringify({
                    ...requestData,
                    requestType: requestData.requestType || 'LEAVE' // Default to LEAVE if not specified
                })
            });
            return response;
        } catch (error) {
            console.error('Error submitting attendance request:', error);
            return { success: false, message: error.message };
        }
    },

    async getAttendanceRequests(employeeId) {
        try {
            // DATABASE v2: Queries employee_requests table filtering by requestType
            const response = await utils.fetchAPI(`?action=getEmployeeRequests&employeeId=${employeeId}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching attendance requests:', error);
            return null;
        }
    },

    async getPendingRequests() {
        try {
            // DATABASE v2: Gets all pending requests from employee_requests table
            const response = await utils.fetchAPI('?action=getPendingRequests');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            return null;
        }
    },

    async approveRequest(requestId, approverNotes) {
        try {
            const response = await utils.fetchAPI('?action=approveRequest', {
                method: 'POST',
                body: JSON.stringify({
                    requestId,
                    status: 'approved',
                    approverNotes
                })
            });
            return response;
        } catch (error) {
            console.error('Error approving request:', error);
            return { success: false, message: error.message };
        }
    },

    async rejectRequest(requestId, approverNotes) {
        try {
            const response = await utils.fetchAPI('?action=approveRequest', {
                method: 'POST',
                body: JSON.stringify({
                    requestId,
                    status: 'rejected',
                    approverNotes
                })
            });
            return response;
        } catch (error) {
            console.error('Error rejecting request:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Employee Management
     */
    async getEmployeeProfile(employeeId) {
        try {
            const response = await utils.fetchAPI(`?action=getEmployeeProfile&employeeId=${employeeId}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching employee profile:', error);
            return null;
        }
    },

    async updateEmployeeProfile(employeeId, profileData) {
        try {
            const response = await utils.fetchAPI('?action=updateEmployeeProfile', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    ...profileData
                })
            });
            return response;
        } catch (error) {
            console.error('Error updating employee profile:', error);
            return { success: false, message: error.message };
        }
    },

    async getAllEmployees() {
        try {
            const response = await utils.fetchAPI('?action=getAllEmployees');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching all employees:', error);
            return null;
        }
    },

    /**
     * Registration Management (Admin only) - DATABASE v2 COMPATIBLE
     * No separate queue table - approval_status field in employees table
     */
    async getPendingRegistrations() {
        try {
            // DATABASE v2: Queries employees WHERE approval_status = 'PENDING'
            // No separate queue table needed
            const response = await utils.fetchAPI('?action=getPendingRegistrations');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching pending registrations:', error);
            return null;
        }
    },

    async approveRegistration(employeeId) {
        try {
            // DATABASE v2: Updates approval_status to 'APPROVED' in employees table
            const response = await utils.fetchAPI('?action=approveRegistration', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    status: 'APPROVED', // Updated to match schema
                    approved_by: JSON.parse(localStorage.getItem('userData'))?.employeeId,
                    approved_at: new Date().toISOString()
                })
            });
            return response;
        } catch (error) {
            console.error('Error approving registration:', error);
            return { success: false, message: error.message };
        }
    },

    async rejectRegistration(employeeId, reason) {
        try {
            // DATABASE v2: Updates approval_status to 'REJECTED' in employees table
            const response = await utils.fetchAPI('?action=approveRegistration', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    status: 'REJECTED', // Updated to match schema
                    rejected_reason: reason
                })
            });
            return response;
        } catch (error) {
            console.error('Error rejecting registration:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Permission Management (Admin only)
     */
    async updateEmployeePermissions(employeeId, position) {
        try {
            const response = await utils.fetchAPI('?action=updatePermissions', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    position
                })
            });
            return response;
        } catch (error) {
            console.error('Error updating permissions:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Store Management
     */
    async getStores() {
        try {
            const response = await utils.fetchAPI('?action=getStores');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching stores:', error);
            return null;
        }
    },

    /**
     * Notification System (Phase 3)
     */
    async getNotifications() {
        try {
            const response = await utils.fetchAPI('?action=getNotifications');
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async getNotificationCount() {
        try {
            const response = await utils.fetchAPI('?action=getNotificationCount');
            return response.success ? response.count : 0;
        } catch (error) {
            console.error('Error fetching notification count:', error);
            return 0;
        }
    },

    async markNotificationRead(notificationId) {
        try {
            const response = await utils.fetchAPI('?action=markNotificationRead', {
                method: 'POST',
                body: JSON.stringify({ notificationId })
            });
            return response;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, message: error.message };
        }
    },

    async markAllNotificationsRead() {
        try {
            const response = await utils.fetchAPI('?action=markAllNotificationsRead', {
                method: 'POST'
            });
            return response;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Cloudflare Analytics (Phase 3 - Admin Only)
     */
    async getCloudflareStats() {
        try {
            const response = await utils.fetchAPI('?action=getCloudflareStats');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching Cloudflare stats:', error);
            return null;
        }
    },

    async getSystemMetrics() {
        try {
            const response = await utils.fetchAPI('?action=getSystemMetrics');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            return null;
        }
    },

    async getEmployeeCount() {
        try {
            const response = await utils.fetchAPI('?action=getEmployeeCount');
            return response.success ? response.count : 0;
        } catch (error) {
            console.error('Error fetching employee count:', error);
            return 0;
        }
    },

    /**
     * Schedule Management (Phase 4)
     */
    async getAvailableShifts(weekStart) {
        try {
            const response = await utils.fetchAPI(`?action=getAvailableShifts&weekStart=${weekStart}`);
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching available shifts:', error);
            return [];
        }
    },

    async registerForShift(shiftId) {
        try {
            const response = await utils.fetchAPI('?action=registerForShift', {
                method: 'POST',
                body: JSON.stringify({ shiftId })
            });
            return response;
        } catch (error) {
            console.error('Error registering for shift:', error);
            return { success: false, message: error.message };
        }
    },

    async assignShift(employeeId, shiftId, date) {
        try {
            const response = await utils.fetchAPI('?action=assignShift', {
                method: 'POST',
                body: JSON.stringify({ employeeId, shiftId, date })
            });
            return response;
        } catch (error) {
            console.error('Error assigning shift:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * PHASE 3: Notification System APIs
     */
    async getNotifications() {
        try {
            const response = await utils.fetchAPI('?action=getNotifications');
            return response.notifications || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async getNotificationCount() {
        try {
            const response = await utils.fetchAPI('?action=getNotificationCount');
            return response.count || 0;
        } catch (error) {
            console.error('Error fetching notification count:', error);
            return 0;
        }
    },

    async markNotificationRead(notificationId) {
        try {
            const response = await utils.fetchAPI('?action=markNotificationRead', {
                method: 'POST',
                body: JSON.stringify({ notificationId })
            });
            return response;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false };
        }
    },

    async markAllNotificationsRead() {
        try {
            const response = await utils.fetchAPI('?action=markAllNotificationsRead', {
                method: 'POST'
            });
            return response;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false };
        }
    },

    /**
     * PHASE 4: Enhanced Schedule Management APIs
     */
    async getAvailableShifts(weekStart) {
        try {
            const response = await utils.fetchAPI(`?action=getAvailableShifts&weekStart=${encodeURIComponent(weekStart)}`);
            return response.shifts || [];
        } catch (error) {
            console.error('Error fetching available shifts:', error);
            return [];
        }
    },

    async registerForShift(shiftId) {
        try {
            const response = await utils.fetchAPI('?action=registerForShift', {
                method: 'POST',
                body: JSON.stringify({ shiftId })
            });
            return response;
        } catch (error) {
            console.error('Error registering for shift:', error);
            return { success: false, error: error.message };
        }
    },

    async assignShift(employeeId, shiftId, date, shiftType) {
        try {
            const response = await utils.fetchAPI('?action=assignShift', {
                method: 'POST',
                body: JSON.stringify({ employeeId, shiftId, date, shiftType })
            });
            return response;
        } catch (error) {
            console.error('Error assigning shift:', error);
            return { success: false, error: error.message };
        }
    },

    async getWeekSchedule(weekStart) {
        try {
            const response = await utils.fetchAPI(`?action=getWeekSchedule&weekStart=${encodeURIComponent(weekStart)}`);
            return response.schedule || [];
        } catch (error) {
            console.error('Error fetching week schedule:', error);
            return [];
        }
    },

    async getTeamSchedule(weekStart) {
        try {
            const response = await utils.fetchAPI(`?action=getTeamSchedule&weekStart=${encodeURIComponent(weekStart)}`);
            return response.teamSchedule || [];
        } catch (error) {
            console.error('Error fetching team schedule:', error);
            return [];
        }
    }

};
