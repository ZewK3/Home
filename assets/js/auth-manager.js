// Auth Manager with integrated API caching system
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        
        // Safely parse user data from localStorage
        try {
            const userDataString = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
            this.userData = userDataString ? JSON.parse(userDataString) : null;
        } catch (error) {
            console.warn('Failed to parse user data from localStorage:', error);
            this.userData = null;
        }
        
        // Enhanced cache system integrated from API_CACHE
        this.cachedStores = null;
        this.cachedUser = null;
        this.cachedUsers = null;
        this.cachedDashboardStats = null;
        this.cachedTimesheet = null;
        this.cachedAttendanceRequests = null;
        this.cachedWorkTasks = null;
        
        this.cacheTimestamp = {
            stores: null,
            user: null,
            users: null,
            dashboardStats: null,
            timesheet: null,
            attendanceRequests: null,
            workTasks: null
        };
        
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Track ongoing API calls to prevent duplicates (from API_CACHE)
        this.ongoingCalls = new Map();
        
        // Initialize cache with localStorage data to reduce API calls during initialization
        this.initializeCacheFromLocalStorage();
    }
    
    // Initialize cache with localStorage data to avoid unnecessary API calls during page load
    initializeCacheFromLocalStorage() {
        if (this.userData && this.userData.employeeId) {
            this.cachedUser = this.userData;
            this.cacheTimestamp.user = Date.now();
            console.log('Cache initialized with localStorage user data:', this.userData.fullName);
        } else {
            console.log('No valid userData found in localStorage for cache initialization');
        }
    }

    // Check if cache is valid
    isCacheValid(cacheType) {
        const timestamp = this.cacheTimestamp[cacheType];
        return timestamp && (Date.now() - timestamp) < this.cacheTimeout;
    }

    // Enhanced API call tracker to prevent duplicates (from API_CACHE)
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
    }

    // Get stores data with enhanced caching and duplicate call prevention
    async getStoresData() {
        if (this.cachedStores && this.isCacheValid('stores')) {
            console.log('Using cached stores data');
            return this.cachedStores;
        }

        const endpoint = `getStores_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh stores data');
                const stores = await utils.fetchAPI(`?action=getStores&token=${this.token}`);
                this.cachedStores = stores;
                this.cacheTimestamp.stores = Date.now();
                return stores;
            } catch (error) {
                console.error('Error fetching stores:', error);
                // Return cached data if available, even if expired
                return this.cachedStores || [];
            }
        });
    }

    // Get user data with enhanced caching and duplicate call prevention
    // Prioritizes cached and localStorage data, falls back to API when necessary
    async getUserData() {
        // First check cache
        if (this.cachedUser && this.isCacheValid('user')) {
            console.log('Using cached user data');
            return this.cachedUser;
        }

        // Then check localStorage
        const userData = this.userData || JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        if (userData && userData.employeeId && userData.fullName) {
            console.log('Using localStorage user data');
            // Update cache with localStorage data
            this.cachedUser = userData;
            this.cacheTimestamp.user = Date.now();
            return userData;
        }

        // If no cached or localStorage data, and we have an employeeId from token/login, fetch from API
        const employeeId = userData?.employeeId || userData?.loginEmployeeId;
        if (!employeeId) {
            throw new Error('No employee ID found for API call');
        }

        const endpoint = `getUser_${employeeId}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh user data from API');
                const user = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
                if (user && user.employeeId) {
                    this.cachedUser = user;
                    this.cacheTimestamp.user = Date.now();
                    // Update localStorage
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
                    this.userData = user;
                    return user;
                }
                throw new Error("Invalid user data received from API");
            } catch (error) {
                console.warn('API call failed, no fallback data available:', error.message);
                throw new Error("No user data available from any source");
            }
        });
    }

    // Get dashboard stats with enhanced caching and duplicate call prevention
    async getDashboardStats() {
        if (this.cachedDashboardStats && this.isCacheValid('dashboardStats')) {
            console.log('Using cached dashboard stats');
            return this.cachedDashboardStats;
        }

        const endpoint = `getDashboardStats_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh dashboard stats');
                const stats = await utils.fetchAPI(`?action=getDashboardStats&token=${this.token}`);
                this.cachedDashboardStats = stats;
                this.cacheTimestamp.dashboardStats = Date.now();
                return stats;
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                // Return cached data if available, even if expired
                return this.cachedDashboardStats || {
                    totalEmployees: 0,
                    todayShifts: 0,
                    pendingRequests: 0
                };
            }
        });
    }

    // Get timesheet data with enhanced caching and duplicate call prevention
    async getTimesheetData() {
        if (this.cachedTimesheet && this.isCacheValid('timesheet')) {
            console.log('Using cached timesheet data');
            return this.cachedTimesheet;
        }

        const endpoint = `getTimesheet_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh timesheet data');
                const timesheet = await utils.fetchAPI(`?action=getTimesheet&token=${this.token}`);
                this.cachedTimesheet = timesheet;
                this.cacheTimestamp.timesheet = Date.now();
                return timesheet;
            } catch (error) {
                console.error('Error fetching timesheet:', error);
                return this.cachedTimesheet || [];
            }
        });
    }

    // Get attendance requests data with enhanced caching and duplicate call prevention
    async getAttendanceRequestsData() {
        if (this.cachedAttendanceRequests && this.isCacheValid('attendanceRequests')) {
            console.log('Using cached attendance requests data');
            return this.cachedAttendanceRequests;
        }

        const endpoint = `getAttendanceRequests_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh attendance requests data');
                const attendanceRequests = await utils.fetchAPI(`?action=getAttendanceRequests&token=${this.token}`);
                this.cachedAttendanceRequests = attendanceRequests;
                this.cacheTimestamp.attendanceRequests = Date.now();
                return attendanceRequests;
            } catch (error) {
                console.error('Error fetching attendance requests:', error);
                return this.cachedAttendanceRequests || [];
            }
        });
    }

    // Get work tasks data with enhanced caching and duplicate call prevention
    async getWorkTasksData() {
        if (this.cachedWorkTasks && this.isCacheValid('workTasks')) {
            console.log('Using cached work tasks data');
            return this.cachedWorkTasks;
        }

        const endpoint = `getWorkTasks_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh work tasks data');
                const workTasks = await utils.fetchAPI(`?action=getWorkTasks&token=${this.token}`);
                this.cachedWorkTasks = workTasks;
                this.cacheTimestamp.workTasks = Date.now();
                return workTasks;
            } catch (error) {
                console.error('Error fetching work tasks:', error);
                return this.cachedWorkTasks || [];
            }
        });
    }

    // Get users data with enhanced caching and duplicate call prevention (from API_CACHE)
    async getUsersData() {
        if (this.cachedUsers && this.isCacheValid('users')) {
            console.log('Using cached users data');
            return this.cachedUsers;
        }

        const endpoint = `getUsers_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh users data');
                const users = await utils.fetchAPI(`?action=getUsers&token=${this.token}`);
                this.cachedUsers = users;
                this.cacheTimestamp.users = Date.now();
                return users;
            } catch (error) {
                console.error('Error fetching users data:', error);
                return this.cachedUsers || [];
            }
        });
    }

    // Enhanced cache clearing with specific cache type support (from API_CACHE)
    clearCache(cacheType = null) {
        if (cacheType) {
            // Clear specific cache type
            switch(cacheType) {
                case 'timesheet':
                    this.cachedTimesheet = null;
                    this.cacheTimestamp.timesheet = null;
                    break;
                case 'attendanceRequests':
                    this.cachedAttendanceRequests = null;
                    this.cacheTimestamp.attendanceRequests = null;
                    break;
                case 'workTasks':
                    this.cachedWorkTasks = null;
                    this.cacheTimestamp.workTasks = null;
                    break;
                case 'user':
                case 'userData':
                    this.cachedUser = null;
                    this.cacheTimestamp.user = null;
                    break;
                case 'users':
                    this.cachedUsers = null;
                    this.cacheTimestamp.users = null;
                    break;
                case 'stores':
                case 'storesData':
                    this.cachedStores = null;
                    this.cacheTimestamp.stores = null;
                    break;
                case 'dashboardStats':
                    this.cachedDashboardStats = null;
                    this.cacheTimestamp.dashboardStats = null;
                    break;
                default:
                    console.warn(`Unknown cache type: ${cacheType}`);
            }
        } else {
            // Clear all cache
            this.cachedStores = null;
            this.cachedUser = null;
            this.cachedUsers = null;
            this.cachedDashboardStats = null;
            this.cachedTimesheet = null;
            this.cachedAttendanceRequests = null;
            this.cachedWorkTasks = null;
            this.cacheTimestamp = {
                stores: null,
                user: null,
                users: null,
                dashboardStats: null,
                timesheet: null,
                attendanceRequests: null,
                workTasks: null
            };
            this.ongoingCalls.clear();
        }
    }

    // Alias for backward compatibility with API_CACHE
    clearSpecificCache(cacheType) {
        this.clearCache(cacheType);
    }

    async checkAuthentication() {
        if (!this.token) {
            // window.location.href = "index.html"; // Commented for testing
            return null;
        }

        try {
            // First try to use cached data if available
            if (this.cachedUser && this.isCacheValid('user')) {
                console.log('Using cached user data for authentication');
                const user = this.cachedUser;
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${user.fullName} - ${user.employeeId}`;
                }
                MenuManager.updateMenuByRole(user.position);
                return user;
            }

            // If no cached data, check localStorage first
            const userData = this.userData || JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
            if (userData && userData.employeeId && userData.fullName) {
                console.log('Using localStorage user data for authentication');
                // Set as cached data to prevent future API calls
                this.cachedUser = userData;
                this.cacheTimestamp.user = Date.now();
                
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${userData.fullName} - ${userData.employeeId}`;
                }
                MenuManager.updateMenuByRole(userData.position);
                return userData;
            }

            // If no valid localStorage data, try to fetch from API to establish authentication
            console.log('No valid cached/localStorage data found, attempting to fetch user data from API');
            const user = await this.getUserData();
            if (user && user.employeeId && user.fullName) {
                console.log('Successfully authenticated via API call:', user.fullName);
                
                // Update localStorage for future use
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
                this.userData = user;
                
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${user.fullName} - ${user.employeeId}`;
                }
                MenuManager.updateMenuByRole(user.position);
                return user;
            }

            throw new Error("No valid user data found in cache, localStorage, or API");
        } catch (error) {
            console.error('Authentication check failed:', error);
            utils.showNotification("Phiên hết hạn, vui lòng đăng nhập lại", "warning");
            this.logout();
            return null;
        }
    }

    setupLogoutHandler() {
        document.getElementById("logout")?.addEventListener("click", () => this.logout());
    }

    logout() {
        this.clearCache(); // Clear all cached data
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        // window.location.href = "index.html"; // Commented for testing
    }
}

// Global authManager instance will be initialized by main-init.js