/**
 * Dashboard API Integration
 * Handles all API calls for dashboard functionality
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

    async getRecentMessagesCount() {
        try {
            const response = await utils.fetchAPI('?action=getRecentMessagesCount');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching messages count:', error);
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

    /**
     * Task Management
     */
    async getUserTasks(employeeId) {
        try {
            const response = await utils.fetchAPI(`?action=getUserTasks&employeeId=${employeeId}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching user tasks:', error);
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
     * Request Management
     */
    async submitAttendanceRequest(requestData) {
        try {
            const response = await utils.fetchAPI('?action=submitAttendanceRequest', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            return response;
        } catch (error) {
            console.error('Error submitting attendance request:', error);
            return { success: false, message: error.message };
        }
    },

    async getAttendanceRequests(employeeId) {
        try {
            const response = await utils.fetchAPI(`?action=getAttendanceRequests&employeeId=${employeeId}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching attendance requests:', error);
            return null;
        }
    },

    async getPendingRequests() {
        try {
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
     * Registration Management (Admin only)
     */
    async getPendingRegistrations() {
        try {
            const response = await utils.fetchAPI('?action=getPendingRegistrations');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching pending registrations:', error);
            return null;
        }
    },

    async approveRegistration(employeeId) {
        try {
            const response = await utils.fetchAPI('?action=approveRegistration', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    status: 'approved'
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
            const response = await utils.fetchAPI('?action=approveRegistration', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId,
                    status: 'rejected',
                    reason
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

};
