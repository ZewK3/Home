/**
 * RESTful API Client
 * Provides clean API methods for all backend endpoints
 * Handles authentication, error handling, and response parsing
 */

class APIClient {
    constructor(baseURL = CONFIG.API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Get authentication token from storage
     */
    getToken() {
        return SimpleStorage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN) || SimpleStorage.get('authToken');
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // =====================================================
    // AUTHENTICATION ENDPOINTS
    // =====================================================

    async login(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(userData) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async verifyEmail(verificationData) {
        return this.request('/api/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify(verificationData),
        });
    }

    // =====================================================
    // STORE ENDPOINTS
    // =====================================================

    async getStores() {
        return this.request('/api/stores', { method: 'GET' });
    }

    async createStore(storeData) {
        return this.request('/api/stores', {
            method: 'POST',
            body: JSON.stringify(storeData),
        });
    }

    // =====================================================
    // EMPLOYEE ENDPOINTS
    // =====================================================

    async getAllEmployees(includeInactive = false) {
        const params = includeInactive ? '?includeInactive=true' : '';
        return this.request(`/api/employees${params}`, { method: 'GET' });
    }

    async getEmployee(employeeId) {
        return this.request(`/api/employees/${employeeId}`, { method: 'GET' });
    }

    async createEmployee(employeeData) {
        return this.request('/api/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData),
        });
    }

    async updateEmployee(employeeId, employeeData) {
        return this.request(`/api/employees/${employeeId}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData),
        });
    }

    async getEmployeeHistory(employeeId) {
        return this.request(`/api/employees/${employeeId}/history`, { method: 'GET' });
    }

    async getEmployeePermissions(employeeId) {
        return this.request(`/api/employees/${employeeId}/permissions`, { method: 'GET' });
    }

    async getEmployeeStats(employeeId) {
        return this.request(`/api/employees/${employeeId}/stats`, { method: 'GET' });
    }

    async checkEmployeeId(employeeId) {
        return this.request(`/api/employees/check/${employeeId}`, { method: 'GET' });
    }

    async getEmployeesByStore(storeId) {
        return this.request(`/api/stores/${storeId}/employees`, { method: 'GET' });
    }

    // =====================================================
    // ATTENDANCE ENDPOINTS
    // =====================================================

    async checkGPS(gpsData) {
        return this.request('/api/attendance/check', {
            method: 'POST',
            body: JSON.stringify(gpsData),
        });
    }

    async getAttendance(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/attendance?${queryString}`, { method: 'GET' });
    }

    async processAttendance(attendanceData) {
        return this.request('/api/attendance/process', {
            method: 'POST',
            body: JSON.stringify(attendanceData),
        });
    }

    async getAttendanceHistory(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/attendance/history?${queryString}`, { method: 'GET' });
    }

    async createAttendanceRequest(requestData) {
        return this.request('/api/attendance/requests', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    }

    async getAttendanceRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/attendance/requests?${queryString}`, { method: 'GET' });
    }

    async approveAttendanceRequest(requestId, approvalData) {
        return this.request(`/api/attendance/requests/${requestId}/approve`, {
            method: 'POST',
            body: JSON.stringify(approvalData),
        });
    }

    async rejectAttendanceRequest(requestId, rejectionData) {
        return this.request(`/api/attendance/requests/${requestId}/reject`, {
            method: 'POST',
            body: JSON.stringify(rejectionData),
        });
    }

    // =====================================================
    // SHIFT ENDPOINTS
    // =====================================================

    async getShifts() {
        return this.request('/api/shifts', { method: 'GET' });
    }

    async getCurrentShift() {
        return this.request('/api/shifts/current', { method: 'GET' });
    }

    async getWeeklyShifts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/shifts/weekly?${queryString}`, { method: 'GET' });
    }

    async getShiftAssignments(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/shifts/assignments?${queryString}`, { method: 'GET' });
    }

    async saveShiftAssignments(assignmentData) {
        return this.request('/api/shifts/assignments', {
            method: 'POST',
            body: JSON.stringify(assignmentData),
        });
    }

    async assignShift(shiftData) {
        return this.request('/api/shifts/assign', {
            method: 'POST',
            body: JSON.stringify(shiftData),
        });
    }

    async getShiftRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/shifts/requests?${queryString}`, { method: 'GET' });
    }

    async approveShiftRequest(requestId, approvalData) {
        return this.request(`/api/shifts/requests/${requestId}/approve`, {
            method: 'POST',
            body: JSON.stringify(approvalData),
        });
    }

    async rejectShiftRequest(requestId, rejectionData) {
        return this.request(`/api/shifts/requests/${requestId}/reject`, {
            method: 'POST',
            body: JSON.stringify(rejectionData),
        });
    }

    // =====================================================
    // TIMESHEET ENDPOINTS
    // =====================================================

    async getTimesheet(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/timesheet?${queryString}`, { method: 'GET' });
    }

    // =====================================================
    // REGISTRATION & APPROVAL ENDPOINTS
    // =====================================================

    async getPendingRegistrations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/registrations/pending?${queryString}`, { method: 'GET' });
    }

    async approveRegistration(employeeId, approvalData) {
        return this.request(`/api/registrations/${employeeId}/approve`, {
            method: 'POST',
            body: JSON.stringify(approvalData),
        });
    }

    async approveRegistrationWithHistory(registrationData) {
        return this.request('/api/registrations/approve-with-history', {
            method: 'POST',
            body: JSON.stringify(registrationData),
        });
    }

    // =====================================================
    // REQUEST MANAGEMENT ENDPOINTS
    // =====================================================

    async getPendingRequests() {
        return this.request('/api/requests/pending', { method: 'GET' });
    }

    async getPendingRequestsCount(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/requests/pending/count?${queryString}`, { method: 'GET' });
    }

    async completeRequest(requestId, completionData) {
        return this.request(`/api/requests/${requestId}/complete`, {
            method: 'POST',
            body: JSON.stringify(completionData),
        });
    }

    // =====================================================
    // DASHBOARD & STATS ENDPOINTS
    // =====================================================

    async getDashboardStats() {
        return this.request('/api/dashboard/stats', { method: 'GET' });
    }

    // =====================================================
    // LEGACY SUPPORT (for backward compatibility)
    // =====================================================

    async legacyRequest(action, method = 'GET', body = null) {
        const endpoint = `/api/legacy?action=${action}`;
        const options = { method };
        
        if (body && method === 'POST') {
            options.body = JSON.stringify(body);
        }
        
        return this.request(endpoint, options);
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Make it globally available
if (typeof window !== 'undefined') {
    window.apiClient = apiClient;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
