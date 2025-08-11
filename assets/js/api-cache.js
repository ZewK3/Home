// Global cache for API data with enhanced call tracking
const API_CACHE = {
    userData: null,
    usersData: null,
    storesData: null,
    dashboardStats: null,
    timesheetData: null,
    attendanceRequestsData: null,
    workTasksData: null,
    lastUserDataFetch: null,
    lastUsersDataFetch: null,
    lastStoresDataFetch: null,
    lastDashboardStatsFetch: null,
    lastTimesheetDataFetch: null,
    lastAttendanceRequestsDataFetch: null,
    lastWorkTasksDataFetch: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // Track ongoing API calls to prevent duplicates
    ongoingCalls: new Map(),
    
    // Clear cache
    clear() {
        this.userData = null;
        this.usersData = null;
        this.storesData = null;
        this.dashboardStats = null;
        this.timesheetData = null;
        this.attendanceRequestsData = null;
        this.workTasksData = null;
        this.lastUserDataFetch = null;
        this.lastUsersDataFetch = null;
        this.lastStoresDataFetch = null;
        this.lastDashboardStatsFetch = null;
        this.lastTimesheetDataFetch = null;
        this.lastAttendanceRequestsDataFetch = null;
        this.lastWorkTasksDataFetch = null;
        this.ongoingCalls.clear();
    },
    
    // Check if cache is valid
    isCacheValid(timestamp) {
        return timestamp && (Date.now() - timestamp < this.CACHE_DURATION);
    },
    
    // Enhanced API call tracker to prevent duplicates
    async safeAPICall(endpoint, apiFunction) {
        // If call is already in progress, wait for it
        if (this.ongoingCalls.has(endpoint)) {
            console.log(`API call for ${endpoint} already in progress, waiting...`);
            return await this.ongoingCalls.get(endpoint);
        }
        
        // Start new API call
        const promise = apiFunction();
        this.ongoingCalls.set(endpoint, promise);
        
        try {
            const result = await promise;
            return result;
        } finally {
            // Clean up regardless of success/failure
            this.ongoingCalls.delete(endpoint);
        }
    },
    
    // Get cached user data or fetch new with duplicate call prevention
    async getUserData() {
        if (this.userData && this.isCacheValid(this.lastUserDataFetch)) {
            return this.userData;
        }
        
        const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const employeeId = userData.employeeId || userData.loginEmployeeId;
        
        if (!employeeId) {
            throw new Error('No employee ID found');
        }
        
        const endpoint = `getUser_${employeeId}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.userData = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
                this.lastUserDataFetch = Date.now();
                return this.userData;
            } catch (error) {
                console.warn('API not available, using localStorage data for testing:', error.message);
                // Fallback to localStorage data for testing
                this.userData = userData;
                this.lastUserDataFetch = Date.now();
                return this.userData;
            }
        });
    },
    
    // Get cached stores data or fetch new with duplicate call prevention
    async getStoresData() {
        if (this.storesData && this.isCacheValid(this.lastStoresDataFetch)) {
            return this.storesData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getStores_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.storesData = await utils.fetchAPI(`?action=getStores&token=${token}`);
                this.lastStoresDataFetch = Date.now();
                return this.storesData;
            } catch (error) {
                console.error('Failed to fetch stores data:', error);
                throw error;
            }
        });
    },
    
    // Get cached users data or fetch new with duplicate call prevention
    async getUsersData() {
        if (this.usersData && this.isCacheValid(this.lastUsersDataFetch)) {
            return this.usersData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getUsers_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.usersData = await utils.fetchAPI(`?action=getUsers&token=${token}`);
                this.lastUsersDataFetch = Date.now();
                return this.usersData;
            } catch (error) {
                console.error('Failed to fetch users data:', error);
                throw error;
            }
        });
    },
    
    // Get cached dashboard stats or fetch new with duplicate call prevention
    async getDashboardStats() {
        if (this.dashboardStats && this.isCacheValid(this.lastDashboardStatsFetch)) {
            return this.dashboardStats;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getDashboardStats_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.dashboardStats = await utils.fetchAPI(`?action=getDashboardStats&token=${token}`);
                this.lastDashboardStatsFetch = Date.now();
                return this.dashboardStats;
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                throw error;
            }
        });
    },
    
    // Get cached timesheet data or fetch new with duplicate call prevention
    async getTimesheetData() {
        if (this.timesheetData && this.isCacheValid(this.lastTimesheetDataFetch)) {
            return this.timesheetData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getTimesheet_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.timesheetData = await utils.fetchAPI(`?action=getTimesheet&token=${token}`);
                this.lastTimesheetDataFetch = Date.now();
                return this.timesheetData;
            } catch (error) {
                console.error('Failed to fetch timesheet data:', error);
                throw error;
            }
        });
    },
    
    // Get cached attendance requests data or fetch new with duplicate call prevention
    async getAttendanceRequestsData() {
        if (this.attendanceRequestsData && this.isCacheValid(this.lastAttendanceRequestsDataFetch)) {
            return this.attendanceRequestsData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getAttendanceRequests_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.attendanceRequestsData = await utils.fetchAPI(`?action=getAttendanceRequests&token=${token}`);
                this.lastAttendanceRequestsDataFetch = Date.now();
                return this.attendanceRequestsData;
            } catch (error) {
                console.error('Failed to fetch attendance requests data:', error);
                throw error;
            }
        });
    },
    
    // Get cached work tasks data or fetch new with duplicate call prevention
    async getWorkTasksData() {
        if (this.workTasksData && this.isCacheValid(this.lastWorkTasksDataFetch)) {
            return this.workTasksData;
        }
        
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            throw new Error('No auth token found');
        }
        
        const endpoint = `getWorkTasks_${token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                this.workTasksData = await utils.fetchAPI(`?action=getWorkTasks&token=${token}`);
                this.lastWorkTasksDataFetch = Date.now();
                return this.workTasksData;
            } catch (error) {
                console.error('Failed to fetch work tasks data:', error);
                throw error;
            }
        });
    },
    
    // Clear specific cache type and force refresh
    clearSpecificCache(cacheType) {
        switch(cacheType) {
            case 'timesheet':
                this.timesheetData = null;
                this.lastTimesheetDataFetch = null;
                break;
            case 'attendanceRequests':
                this.attendanceRequestsData = null;
                this.lastAttendanceRequestsDataFetch = null;
                break;
            case 'workTasks':
                this.workTasksData = null;
                this.lastWorkTasksDataFetch = null;
                break;
            case 'userData':
                this.userData = null;
                this.lastUserDataFetch = null;
                break;
            case 'storesData':
                this.storesData = null;
                this.lastStoresDataFetch = null;
                break;
            default:
                console.warn(`Unknown cache type: ${cacheType}`);
        }
    }
};