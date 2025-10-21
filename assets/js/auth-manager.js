// Auth Manager with integrated API caching system and enhanced security options
class AuthManager {
    constructor(options = {}) {
        // Initialize secure storage if available
        this.useSecureStorage = options.useSecureStorage && window.SecureStorageManager;
        if (this.useSecureStorage) {
            this.secureStorage = new SecureStorageManager({
                useEncryption: options.useEncryption !== false,
                secure: options.secure !== false,
                sameSite: options.sameSite || 'Strict'
            });
            console.log('🔐 AuthManager initialized with secure storage');
        }
        
        // Get token from storage (secure or regular)
        this.token = this.getFromStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        console.log('AuthManager initialized - Token found:', !!this.token);
        
        // Safely parse user data from storage
        try {
            this.userData = this.getFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
            console.log('AuthManager initialized - User data found:', !!this.userData);
        } catch (error) {
            console.warn('Failed to parse user data from storage:', error);
            this.userData = null;
        }
        
        // Initialize the cache system
        this.initializeCacheSystem();
    }
    
    // Enhanced storage methods that support both secure and regular storage
    setToStorage(key, value) {
        if (this.useSecureStorage) {
            // Use secure cookies for sensitive data like tokens
            if (key === CONFIG.STORAGE_KEYS.AUTH_TOKEN) {
                this.secureStorage.setCookie(key, value, { httpOnly: false }); // httpOnly must be false for client access
            } else {
                this.secureStorage.setLocalStorage(key, value);
            }
        } else {
            // Fallback to regular localStorage
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
    }
    
    getFromStorage(key) {
        if (this.useSecureStorage) {
            // Try secure cookie first for tokens, then secure localStorage
            if (key === CONFIG.STORAGE_KEYS.AUTH_TOKEN) {
                return this.secureStorage.getCookie(key) || this.secureStorage.getLocalStorage(key);
            } else {
                return this.secureStorage.getLocalStorage(key);
            }
        } else {
            // Fallback to regular localStorage
            const value = localStorage.getItem(key);
            if (!value) return null;
            try {
                return JSON.parse(value);
            } catch {
                return value; // Return as string if not JSON
            }
        }
    }
    
    removeFromStorage(key) {
        if (this.useSecureStorage) {
            this.secureStorage.deleteCookie(key);
            localStorage.removeItem(key); // Also clear from localStorage for safety
        } else {
            localStorage.removeItem(key);
        }
    }
    
    // Initialize cache and enhanced security features  
    initializeCacheSystem() {
        // Enhanced cache system integrated from API_CACHE
        this.cachedStores = null;
        this.cachedUser = null;
        this.cachedUsers = null;
        this.cachedDashboardStats = null;
        this.cachedTimesheet = null;
        this.cachedAttendanceRequests = null;
        this.cachedWorkTasks = null;
        this.cachedPersonalStats = null;
        this.cachedPendingRegistrations = null;
        
        this.cacheTimestamp = {
            stores: null,
            user: null,
            users: null,
            dashboardStats: null,
            timesheet: null,
            attendanceRequests: null,
            workTasks: null,
            personalStats: null,
            pendingRegistrations: null
        };
        
        this.cacheTimeout = 60 * 60 * 1000; // 1 hour
        
        // Track ongoing API calls to prevent duplicates (from API_CACHE)
        this.ongoingCalls = new Map();
        
        // Initialize cache with localStorage data to reduce API calls during initialization
        this.initializeCacheFromLocalStorage();
    }
    
    // Initialize cache with storage data to avoid unnecessary API calls during page load
    initializeCacheFromLocalStorage() {
        if (this.userData && this.userData.employeeId) {
            this.cachedUser = this.userData;
            this.cacheTimestamp.user = Date.now();
            console.log('Cache initialized with stored user data:', this.userData.fullName);
        } else {
            console.log('No valid userData found in storage for cache initialization');
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

        // Then check storage
        const userData = this.userData || this.getFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
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
                const response = await utils.fetchAPI(`?action=getUser&employeeId=${employeeId}&token=${this.token}`);
                
                // Extract user data from API response structure
                const userData = response.data || response;
                
                if (userData && userData.employeeId) {
                    // Map Enhanced Database Schema v3.0 fields
                    const mappedUser = utils.mapUserDataFromEnhancedSchema(userData);
                    this.cachedUser = mappedUser;
                    this.cacheTimestamp.user = Date.now();
                    // Update storage
                    this.setToStorage(CONFIG.STORAGE_KEYS.USER_DATA, mappedUser);
                    this.userData = mappedUser;
                    return mappedUser;
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
    async getWorkTasksData(employeeId) {
        if (this.cachedWorkTasks && this.isCacheValid('workTasks')) {
            console.log('Using cached work tasks data');
            return this.cachedWorkTasks;
        }

        const endpoint = `getWorkTasks_${employeeId}_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh work tasks data');
                const workTasks = await utils.fetchAPI(`?action=getWorkTasks&employeeId=${employeeId}&token=${this.token}&page=1&limit=15`);
                
                // Map Enhanced Database Schema v3.0 fields for each task
                const mappedTasks = Array.isArray(workTasks) ? 
                    workTasks.map(task => utils.mapTaskDataFromEnhancedSchema(task)) : [];
                
                this.cachedWorkTasks = mappedTasks;
                this.cacheTimestamp.workTasks = Date.now();
                return mappedTasks;
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

    // Get personal stats data with enhanced caching and duplicate call prevention
    async getPersonalStatsData(employeeId) {
        if (this.cachedPersonalStats && this.isCacheValid('personalStats')) {
            console.log('Using cached personal stats data');
            return this.cachedPersonalStats;
        }

        const endpoint = `getPersonalStats_${employeeId}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh personal stats data');
                const personalStats = await utils.fetchAPI(`?action=getPersonalStats&employeeId=${employeeId}&token=${this.token}`);
                
                // Enhanced Database Schema v3.0 personal stats mapping
                const mappedStats = {
                    workDaysThisMonth: personalStats.work_days_this_month || personalStats.workDaysThisMonth || 0,
                    totalHoursThisMonth: personalStats.total_hours_this_month || personalStats.totalHoursThisMonth || 0,
                    attendanceRate: personalStats.attendance_rate || personalStats.attendanceRate || 0,
                    overtimeHours: personalStats.overtime_hours || personalStats.overtimeHours || 0,
                    averageRating: personalStats.average_rating || personalStats.averageRating || 0
                };
                
                this.cachedPersonalStats = mappedStats;
                this.cacheTimestamp.personalStats = Date.now();
                return mappedStats;
            } catch (error) {
                console.error('Error fetching personal stats:', error);
                return this.cachedPersonalStats || {
                    workDaysThisMonth: 0,
                    totalHoursThisMonth: 0,
                    attendanceRate: 0,
                    overtimeHours: 0,
                    averageRating: 0
                };
            }
        });
    }

    // Get pending registrations data with enhanced caching and duplicate call prevention
    async getPendingRegistrationsData() {
        if (this.cachedPendingRegistrations && this.isCacheValid('pendingRegistrations')) {
            console.log('Using cached pending registrations data');
            return this.cachedPendingRegistrations;
        }

        const endpoint = `getPendingRegistrations_${this.token}`;
        return await this.safeAPICall(endpoint, async () => {
            try {
                console.log('Fetching fresh pending registrations data');
                const pendingRegistrations = await utils.fetchAPI(`?action=getPendingRegistrations&token=${this.token}`);
                this.cachedPendingRegistrations = pendingRegistrations;
                this.cacheTimestamp.pendingRegistrations = Date.now();
                return pendingRegistrations;
            } catch (error) {
                console.error('Error fetching pending registrations:', error);
                return this.cachedPendingRegistrations || [];
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
                case 'personalStats':
                    this.cachedPersonalStats = null;
                    this.cacheTimestamp.personalStats = null;
                    break;
                case 'pendingRegistrations':
                    this.cachedPendingRegistrations = null;
                    this.cacheTimestamp.pendingRegistrations = null;
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
            this.cachedPersonalStats = null;
            this.cachedPendingRegistrations = null;
            this.cacheTimestamp = {
                stores: null,
                user: null,
                users: null,
                dashboardStats: null,
                timesheet: null,
                attendanceRequests: null,
                workTasks: null,
                personalStats: null,
                pendingRegistrations: null
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
            console.log('No token found, redirecting to login');
            window.location.href = "../../index.html";
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
                if (typeof MenuManager !== 'undefined') {
                    MenuManager.updateMenuByRole(user.roles || [user.position]);
                }
                return user;
            }

            // If no cached data, check storage first
            const userData = this.userData || this.getFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
            if (userData && userData.employeeId && userData.fullName) {
                console.log('Using localStorage user data for authentication');
                // Set as cached data to prevent future API calls
                this.cachedUser = userData;
                this.cacheTimestamp.user = Date.now();
                
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${userData.fullName} - ${userData.employeeId}`;
                }
                if (typeof MenuManager !== 'undefined') {
                    MenuManager.updateMenuByRole(userData.roles || [userData.position]);
                }
                return userData;
            }

            // If no valid localStorage data, try to fetch from API to establish authentication
            console.log('No valid cached/localStorage data found, attempting to fetch user data from API');
            const user = await this.getUserData();
            if (user && user.employeeId && user.fullName) {
                console.log('Successfully authenticated via API call:', user.fullName);
                
                // Update storage for future use
                this.setToStorage(CONFIG.STORAGE_KEYS.USER_DATA, user);
                this.userData = user;
                
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${user.fullName} - ${user.employeeId}`;
                }
                if (typeof MenuManager !== 'undefined') {
                    MenuManager.updateMenuByRole(user.roles || [user.position]);
                }
                return user;
            }

            throw new Error("No valid user data found in cache, localStorage, or API");
        } catch (error) {
            console.error('Authentication check failed:', error);
            if (typeof utils !== 'undefined') {
                utils.showNotification("Phiên hết hạn, vui lòng đăng nhập lại", "warning");
            }
            this.logout();
            return null;
        }
    }



    setupLogoutHandler() {
        document.getElementById("logout")?.addEventListener("click", () => this.logout());
    }

    logout() {
        this.clearCache(); // Clear all cached data
        
        // Use enhanced storage removal
        this.removeFromStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.removeFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
        
        // Clear secure storage if available
        if (this.useSecureStorage) {
            this.secureStorage.clearAllData();
        }
        
        console.log('Logout completed, redirecting to login');
        window.location.href = "../../index.html";
    }
}

// Initialize authentication page handlers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthPage);
} else {
    initAuthPage();
}

function initAuthPage() {
    // Only run on auth page
    if (!window.location.pathname.includes('/auth/')) return;
    
    console.log('Initializing auth page...');
    
    // Form switching handlers
    const goToRegister = document.getElementById('goToRegister');
    const goToLogin = document.getElementById('goToLogin');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const goToLoginFromForgot = document.getElementById('goToLoginFromForgot');
    const goToForgotFromReset = document.getElementById('goToForgotFromReset');
    
    if (goToRegister) {
        goToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('register');
        });
    }
    
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('forgot');
        });
    }
    
    if (goToLoginFromForgot) {
        goToLoginFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });
    }
    
    if (goToForgotFromReset) {
        goToForgotFromReset.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('forgot');
        });
    }
    
    // Password toggle handlers
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('.material-icons-round');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin(e);
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister(e);
        });
    }
    
    // Forgot password form handler
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleForgotPassword(e);
        });
    }
    
    // Reset password form handler
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleResetPassword(e);
        });
    }
    
    // Load stores for registration
    loadStores();
}

function switchForm(formType) {
    const forms = {
        login: document.getElementById('loginFormContainer'),
        register: document.getElementById('registerFormContainer'),
        forgot: document.getElementById('forgotPasswordFormContainer'),
        reset: document.getElementById('resetPasswordFormContainer')
    };
    
    // Hide all forms
    Object.values(forms).forEach(form => form?.classList.remove('active'));
    
    // Show requested form
    forms[formType]?.classList.add('active');
}

async function handleLogin(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    const employeeId = document.getElementById('loginEmployeeId').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!employeeId || !password) {
        showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    try {
        console.log('Attempting login with:', employeeId);
        
        const response = await utils.fetchAPI('?action=login', {
            method: 'POST',
            body: JSON.stringify({
                employeeId: employeeId,
                password: password,
                rememberMe: rememberMe
            })
        });
        
        console.log('Login response:', response);
        
        if (response.success && response.token) {
            // Store auth data
            localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.userData || response.data));
            
            showNotification('Đăng nhập thành công!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.html';
            }, 1000);
        } else {
            showNotification(response.message || 'Đăng nhập thất bại', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

async function handleRegister(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const storeName = document.getElementById('storeName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validation
    if (!fullName || !phone || !email || !storeName || !password || !confirmPassword) {
        showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    if (!acceptTerms) {
        showNotification('Vui lòng đồng ý với điều khoản sử dụng', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    try {
        const response = await utils.fetchAPI('?action=register', {
            method: 'POST',
            body: JSON.stringify({
                fullName,
                phone,
                email,
                storeName,
                password
            })
        });
        
        if (response.success) {
            showNotification('Đăng ký thành công! Vui lòng chờ quản trị viên phê duyệt.', 'success');
            setTimeout(() => {
                switchForm('login');
                form.reset();
            }, 2000);
        } else {
            showNotification(response.message || 'Đăng ký thất bại', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showNotification('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

async function handleForgotPassword(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showNotification('Vui lòng nhập email', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    try {
        const response = await utils.fetchAPI('?action=forgotPassword', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        
        if (response.success) {
            showNotification('Mã xác thực đã được gửi đến email của bạn', 'success');
            setTimeout(() => {
                switchForm('reset');
            }, 1500);
        } else {
            showNotification(response.message || 'Gửi mã thất bại', 'error');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showNotification('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

async function handleResetPassword(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    const resetCode = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!resetCode || !newPassword || !confirmNewPassword) {
        showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    try {
        const response = await utils.fetchAPI('?action=resetPassword', {
            method: 'POST',
            body: JSON.stringify({
                resetCode,
                newPassword
            })
        });
        
        if (response.success) {
            showNotification('Đặt lại mật khẩu thành công!', 'success');
            setTimeout(() => {
                switchForm('login');
                form.reset();
            }, 1500);
        } else {
            showNotification(response.message || 'Đặt lại mật khẩu thất bại', 'error');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showNotification('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

async function loadStores() {
    try {
        const stores = await utils.fetchAPI('?action=getStores');
        const storeSelect = document.getElementById('storeName');
        
        if (stores && Array.isArray(stores)) {
            stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store.storeName || store.name;
                option.textContent = store.storeName || store.name;
                storeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading stores:', error);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}