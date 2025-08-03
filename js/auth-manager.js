// Auth Manager
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA));
        // Initialize cache for API data
        this.cachedStores = null;
        this.cachedUser = null;
        this.cachedDashboardStats = null;
        this.cacheTimestamp = {
            stores: null,
            user: null,
            dashboardStats: null
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Check if cache is valid
    isCacheValid(cacheType) {
        const timestamp = this.cacheTimestamp[cacheType];
        return timestamp && (Date.now() - timestamp) < this.cacheTimeout;
    }

    // Get stores data with caching
    async getStoresData() {
        if (this.cachedStores && this.isCacheValid('stores')) {
            console.log('Using cached stores data');
            return this.cachedStores;
        }

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
    }

    // Get user data with caching
    async getUserData() {
        if (this.cachedUser && this.isCacheValid('user')) {
            console.log('Using cached user data');
            return this.cachedUser;
        }

        try {
            const employeeId = this.userData?.employeeId || this.userData?.loginEmployeeId;
            if (!employeeId) {
                throw new Error("No employee ID in user data");
            }
            
            console.log('Fetching fresh user data');
            const user = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}`);
            if (user) {
                this.cachedUser = user;
                this.cacheTimestamp.user = Date.now();
                return user;
            }
            throw new Error("Invalid user data");
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Return cached data if available, even if expired
            return this.cachedUser || this.userData;
        }
    }

    // Get dashboard stats with caching
    async getDashboardStats() {
        if (this.cachedDashboardStats && this.isCacheValid('dashboardStats')) {
            console.log('Using cached dashboard stats');
            return this.cachedDashboardStats;
        }

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
    }

    // Clear specific cache
    clearCache(cacheType = null) {
        if (cacheType) {
            this[`cached${cacheType.charAt(0).toUpperCase() + cacheType.slice(1)}`] = null;
            this.cacheTimestamp[cacheType] = null;
        } else {
            // Clear all cache
            this.cachedStores = null;
            this.cachedUser = null;
            this.cachedDashboardStats = null;
            this.cacheTimestamp = {
                stores: null,
                user: null,
                dashboardStats: null
            };
        }
    }

    async checkAuthentication() {
        if (!this.token || !this.userData) {
            // window.location.href = "index.html"; // Commented for testing
            return null;
        }

        try {
            // Use cached user data method
            const user = await this.getUserData();
            if (user) {
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${user.fullName} - ${user.employeeId}`;
                }
                MenuManager.updateMenuByRole(user.position);
                return user;
            }
            throw new Error("Invalid session");
        } catch (error) {
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