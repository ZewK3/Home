/**
 * Dashboard Service
 * Handles API calls for dashboard functionality
 */

class DashboardService {
    constructor() {
        this.apiUrl = 'https://zewk.tocotoco.workers.dev';
    }

    // Dashboard Statistics
    async getDashboardStats() {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/dashboard/stats`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            throw error;
        }
    }

    // Recent Activities
    async getRecentActivities(limit = 10) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/dashboard/activities?limit=${limit}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch recent activities:', error);
            throw error;
        }
    }

    // User Management
    async getUsers(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/users?${queryString}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/users/${userId}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/users`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/users/${userId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/users/${userId}`,
                {
                    method: 'DELETE'
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    }

    // Attendance Management
    async checkIn(data) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/attendance/checkin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to check in:', error);
            throw error;
        }
    }

    async checkOut(data) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/attendance/checkout`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to check out:', error);
            throw error;
        }
    }

    async getTodayAttendance() {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/attendance/today`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch today attendance:', error);
            throw error;
        }
    }

    async getAttendanceHistory(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/attendance/history?${queryString}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch attendance history:', error);
            throw error;
        }
    }

    // Payroll Management
    async calculatePayroll(data) {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/payroll/calculate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to calculate payroll:', error);
            throw error;
        }
    }

    async getPayrollHistory(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/payroll/history?${queryString}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch payroll history:', error);
            throw error;
        }
    }

    // File Management
    async uploadFile(file, type = 'document') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/files/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to upload file:', error);
            throw error;
        }
    }

    // Reports
    async getAttendanceReport(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/reports/attendance?${queryString}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch attendance report:', error);
            throw error;
        }
    }

    async getPayrollReport(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await authService.makeAuthenticatedRequest(
                `${this.apiUrl}/api/v1/reports/payroll?${queryString}`
            );
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch payroll report:', error);
            throw error;
        }
    }
}

// Export singleton instance
window.dashboardService = new DashboardService();