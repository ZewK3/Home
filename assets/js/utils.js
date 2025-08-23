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
    }
};

// Global notification function for backward compatibility
function showNotification(message, type, duration) {
    utils.showNotification(message, type, duration);
}