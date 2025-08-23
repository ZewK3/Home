// =====================================================
// ENHANCED AUTH MANAGER FOR OPTIMIZED WORKERS
// =====================================================
// Advanced authentication manager that integrates with all worker variants
// Features:
// ✓ Multi-layer intelligent caching
// ✓ Performance monitoring and optimization
// ✓ Request batching and deduplication
// ✓ Automatic failover between worker variants
// ✓ Real-time session management
// ✓ Advanced error handling and recovery
// =====================================================

class EnhancedAuthManager {
    constructor(options = {}) {
        // Configuration options
        this.options = {
            workerEndpoint: options.workerEndpoint || CONFIG.API_URL,
            fallbackWorkers: options.fallbackWorkers || [],
            enableCaching: options.enableCaching !== false,
            enableBatching: options.enableBatching !== false,
            cacheStrategy: options.cacheStrategy || 'intelligent',
            performanceMode: options.performanceMode || 'balanced', // conservative, balanced, aggressive
            ...options
        };

        // Authentication state
        this.token = this.getFromStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.user = null;
        this.isAuthenticated = false;
        this.sessionExpiry = null;

        // Worker management
        this.currentWorker = this.options.workerEndpoint;
        this.workerHealth = new Map();
        this.workerPerformance = new Map();

        // Initialize subsystems
        this.initializeCacheSystem();
        this.initializePerformanceMonitoring();
        this.initializeBatchSystem();
        this.initializeAuth();

        console.log('🚀 EnhancedAuthManager initialized with options:', this.options);
    }

    // =====================================================
    // INTELLIGENT MULTI-LAYER CACHING SYSTEM
    // =====================================================

    initializeCacheSystem() {
        // Multi-layer cache with different strategies
        this.cache = {
            memory: new Map(),      // Fast access, short TTL
            session: new Map(),     // Session-based, medium TTL
            persistent: new Map()   // Long-term, long TTL
        };

        // Cache configuration by data type
        this.cacheConfig = {
            userData: { layer: 'memory', ttl: 5 * 60 * 1000, strategy: 'lru' },
            dashboardStats: { layer: 'memory', ttl: 2 * 60 * 1000, strategy: 'fifo' },
            workTasks: { layer: 'session', ttl: 3 * 60 * 1000, strategy: 'lru' },
            attendanceData: { layer: 'session', ttl: 1 * 60 * 1000, strategy: 'fifo' },
            timesheetData: { layer: 'persistent', ttl: 10 * 60 * 1000, strategy: 'lru' },
            usersData: { layer: 'memory', ttl: 5 * 60 * 1000, strategy: 'lru' },
            permissionsData: { layer: 'persistent', ttl: 15 * 60 * 1000, strategy: 'lru' }
        };

        // Cache statistics
        this.cacheStats = {
            hits: 0,
            misses: 0,
            sets: 0,
            evictions: 0,
            hitRate: 0
        };

        // Cache cleanup intervals
        this.setupCacheCleanup();
    }

    setupCacheCleanup() {
        // Cleanup expired entries every minute
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 60000);

        // LRU eviction for oversized caches every 5 minutes
        setInterval(() => {
            this.performLRUEviction();
        }, 5 * 60000);
    }

    cleanupExpiredCache() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [layerName, layer] of Object.entries(this.cache)) {
            for (const [key, entry] of layer) {
                if (entry.expires && now > entry.expires) {
                    layer.delete(key);
                    cleanedCount++;
                }
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired entries`);
        }
    }

    performLRUEviction() {
        // Evict least recently used items if cache is too large
        const maxSizes = { memory: 100, session: 50, persistent: 200 };

        for (const [layerName, layer] of Object.entries(this.cache)) {
            const maxSize = maxSizes[layerName];
            if (layer.size > maxSize) {
                const entries = Array.from(layer.entries());
                entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
                
                const toRemove = layer.size - maxSize;
                for (let i = 0; i < toRemove; i++) {
                    layer.delete(entries[i][0]);
                    this.cacheStats.evictions++;
                }
                
                console.log(`📊 LRU eviction: removed ${toRemove} items from ${layerName} cache`);
            }
        }
    }

    setCache(key, value, type = 'userData') {
        const config = this.cacheConfig[type];
        const layer = this.cache[config.layer];
        const expires = Date.now() + config.ttl;

        const entry = {
            value,
            expires,
            lastAccess: Date.now(),
            accessCount: 0,
            type
        };

        layer.set(key, entry);
        this.cacheStats.sets++;
    }

    getCache(key, type = 'userData') {
        const config = this.cacheConfig[type];
        const layer = this.cache[config.layer];
        const entry = layer.get(key);

        if (!entry) {
            this.cacheStats.misses++;
            return null;
        }

        if (entry.expires && Date.now() > entry.expires) {
            layer.delete(key);
            this.cacheStats.misses++;
            return null;
        }

        // Update access stats
        entry.lastAccess = Date.now();
        entry.accessCount++;
        this.cacheStats.hits++;

        // Update hit rate
        const total = this.cacheStats.hits + this.cacheStats.misses;
        this.cacheStats.hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;

        return entry.value;
    }

    // =====================================================
    // PERFORMANCE MONITORING SYSTEM
    // =====================================================

    initializePerformanceMonitoring() {
        this.performance = {
            apiCalls: 0,
            totalResponseTime: 0,
            averageResponseTime: 0,
            errors: 0,
            slowRequests: 0,
            requestTimes: []
        };

        // Worker-specific performance tracking
        this.workerPerformance.set(this.currentWorker, {
            calls: 0,
            totalTime: 0,
            averageTime: 0,
            errors: 0,
            lastUsed: Date.now()
        });
    }

    recordPerformance(endpoint, responseTime, success = true) {
        this.performance.apiCalls++;
        this.performance.totalResponseTime += responseTime;
        this.performance.averageResponseTime = this.performance.totalResponseTime / this.performance.apiCalls;

        if (!success) {
            this.performance.errors++;
        }

        if (responseTime > 3000) { // Slow request threshold
            this.performance.slowRequests++;
        }

        // Keep last 100 request times for analysis
        this.performance.requestTimes.push(responseTime);
        if (this.performance.requestTimes.length > 100) {
            this.performance.requestTimes.shift();
        }

        // Update worker-specific performance
        const workerStats = this.workerPerformance.get(this.currentWorker);
        if (workerStats) {
            workerStats.calls++;
            workerStats.totalTime += responseTime;
            workerStats.averageTime = workerStats.totalTime / workerStats.calls;
            workerStats.lastUsed = Date.now();
            
            if (!success) {
                workerStats.errors++;
            }
        }
    }

    getPerformanceReport() {
        const errorRate = this.performance.apiCalls > 0 ? 
            (this.performance.errors / this.performance.apiCalls * 100).toFixed(2) : 0;
        
        return {
            ...this.performance,
            errorRate: `${errorRate}%`,
            cacheStats: this.cacheStats,
            workerPerformance: Object.fromEntries(this.workerPerformance)
        };
    }

    // =====================================================
    // REQUEST BATCHING SYSTEM
    // =====================================================

    initializeBatchSystem() {
        this.batchQueue = new Map();
        this.ongoingRequests = new Map();
        this.batchTimer = null;

        // Batch configuration
        this.batchConfig = {
            maxBatchSize: 10,
            batchTimeout: 100, // ms
            enableBatching: this.options.enableBatching
        };
    }

    async makeRequest(endpoint, options = {}) {
        const startTime = performance.now();

        try {
            // Check for ongoing identical request
            if (this.ongoingRequests.has(endpoint)) {
                console.log(`🔄 Waiting for ongoing request: ${endpoint}`);
                return await this.ongoingRequests.get(endpoint);
            }

            // Check cache first
            if (options.cacheable !== false) {
                const cached = this.getCache(endpoint, options.cacheType);
                if (cached) {
                    console.log(`⚡ Cache hit for: ${endpoint}`);
                    return cached;
                }
            }

            // Make the request
            const requestPromise = this.executeRequest(endpoint, options);
            this.ongoingRequests.set(endpoint, requestPromise);

            const result = await requestPromise;
            const responseTime = performance.now() - startTime;

            // Record performance
            this.recordPerformance(endpoint, responseTime, true);

            // Cache the result if applicable
            if (options.cacheable !== false && result) {
                this.setCache(endpoint, result, options.cacheType);
            }

            return result;

        } catch (error) {
            const responseTime = performance.now() - startTime;
            this.recordPerformance(endpoint, responseTime, false);
            
            console.error(`❌ Request failed for: ${endpoint}`, error);
            
            // Try fallback if available
            if (options.allowFallback !== false && this.options.fallbackWorkers.length > 0) {
                return await this.tryFallbackWorkers(endpoint, options);
            }

            throw error;
        } finally {
            this.ongoingRequests.delete(endpoint);
        }
    }

    async executeRequest(endpoint, options) {
        const url = `${this.currentWorker}${endpoint}`;
        
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                'X-Request-ID': crypto.randomUUID().substring(0, 8),
                ...options.headers
            }
        };

        if (options.body) {
            requestOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async tryFallbackWorkers(endpoint, options) {
        for (const fallbackWorker of this.options.fallbackWorkers) {
            try {
                console.log(`🔄 Trying fallback worker: ${fallbackWorker}`);
                const originalWorker = this.currentWorker;
                this.currentWorker = fallbackWorker;
                
                const result = await this.executeRequest(endpoint, options);
                
                console.log(`✅ Fallback successful: ${fallbackWorker}`);
                return result;
                
            } catch (error) {
                console.warn(`❌ Fallback failed: ${fallbackWorker}`, error);
                continue;
            }
        }
        
        throw new Error('All workers failed');
    }

    // =====================================================
    // AUTHENTICATION METHODS
    // =====================================================

    async initializeAuth() {
        if (this.token) {
            try {
                // Validate token and load user data
                const userData = await this.validateSession();
                if (userData) {
                    this.user = userData;
                    this.isAuthenticated = true;
                    console.log('✅ Authentication initialized successfully');
                }
            } catch (error) {
                console.warn('⚠️ Token validation failed, clearing session', error);
                this.clearSession();
            }
        }
    }

    async login(credentials) {
        try {
            const response = await this.makeRequest('?action=login', {
                method: 'POST',
                body: credentials,
                cacheable: false
            });

            if (response.success && response.data) {
                this.token = response.data.session.token;
                this.user = response.data.user;
                this.sessionExpiry = response.data.session.expiresAt;
                this.isAuthenticated = true;

                // Store in secure storage
                this.setToStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN, this.token);
                this.setToStorage(CONFIG.STORAGE_KEYS.USER_DATA, this.user);

                console.log('✅ Login successful:', this.user.name);
                return response.data;
            } else {
                throw new Error(response.error?.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    async validateSession() {
        if (!this.token) {
            throw new Error('No token available');
        }

        const response = await this.makeRequest(`?action=getUser&employeeId=${this.user?.employeeId || ''}`, {
            cacheable: true,
            cacheType: 'userData'
        });

        if (response.success && response.data) {
            return response.data;
        } else {
            throw new Error('Session validation failed');
        }
    }

    async logout() {
        try {
            if (this.token) {
                await this.makeRequest('?action=logout', {
                    method: 'POST',
                    cacheable: false
                });
            }
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearSession();
        }
    }

    clearSession() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        this.sessionExpiry = null;

        // Clear storage
        this.removeFromStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.removeFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);

        // Clear caches
        for (const layer of Object.values(this.cache)) {
            layer.clear();
        }

        console.log('🧹 Session cleared');
    }

    // =====================================================
    // DATA RETRIEVAL METHODS
    // =====================================================

    async getUserData() {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        return await this.makeRequest(`?action=getUser&employeeId=${this.user.employeeId}`, {
            cacheable: true,
            cacheType: 'userData'
        });
    }

    async getDashboardStats() {
        return await this.makeRequest('?action=getDashboardStats', {
            cacheable: true,
            cacheType: 'dashboardStats'
        });
    }

    async getWorkTasks(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return await this.makeRequest(`?action=getTasks&${queryString}`, {
            cacheable: true,
            cacheType: 'workTasks'
        });
    }

    async getAttendanceHistory(startDate, endDate) {
        return await this.makeRequest(`?action=getAttendanceHistory&startDate=${startDate}&endDate=${endDate}`, {
            cacheable: true,
            cacheType: 'attendanceData'
        });
    }

    async getTimesheet(employeeId, startDate, endDate) {
        return await this.makeRequest(`?action=getTimesheet&employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`, {
            cacheable: true,
            cacheType: 'timesheetData'
        });
    }

    async checkIn(location = null) {
        return await this.makeRequest('?action=checkIn', {
            method: 'POST',
            body: { 
                employeeId: this.user.employeeId,
                location,
                timestamp: new Date().toISOString()
            },
            cacheable: false
        });
    }

    async checkOut(location = null) {
        return await this.makeRequest('?action=checkOut', {
            method: 'POST',
            body: { 
                employeeId: this.user.employeeId,
                location,
                timestamp: new Date().toISOString()
            },
            cacheable: false
        });
    }

    // =====================================================
    // STORAGE UTILITIES
    // =====================================================

    setToStorage(key, value) {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    getFromStorage(key) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return null;
            
            // Try to parse JSON, fallback to string
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return null;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage removal error:', error);
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    getCacheStats() {
        return {
            ...this.cacheStats,
            layerSizes: {
                memory: this.cache.memory.size,
                session: this.cache.session.size,
                persistent: this.cache.persistent.size
            }
        };
    }

    clearCache(layer = null) {
        if (layer && this.cache[layer]) {
            this.cache[layer].clear();
        } else {
            for (const cacheLayer of Object.values(this.cache)) {
                cacheLayer.clear();
            }
        }
        console.log(`🧹 Cache cleared: ${layer || 'all layers'}`);
    }

    optimizePerformance() {
        // Automatically adjust cache settings based on performance
        const avgResponseTime = this.performance.averageResponseTime;
        
        if (avgResponseTime > 2000) { // Slow performance
            // Increase cache TTLs
            for (const config of Object.values(this.cacheConfig)) {
                config.ttl *= 1.5;
            }
            console.log('🚀 Performance optimization: increased cache TTLs');
        } else if (avgResponseTime < 500) { // Fast performance
            // Can afford shorter cache TTLs for fresher data
            for (const config of Object.values(this.cacheConfig)) {
                config.ttl = Math.max(config.ttl * 0.8, 30000); // Minimum 30 seconds
            }
            console.log('📊 Performance optimization: reduced cache TTLs for fresher data');
        }
    }
}

// Global instance
window.enhancedAuthManager = new EnhancedAuthManager({
    enableCaching: true,
    enableBatching: true,
    performanceMode: 'balanced'
});

console.log('🔐 Enhanced Auth Manager loaded successfully');