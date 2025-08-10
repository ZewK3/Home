// Utility Functions
const utils = {
    showNotification(message, type = "success", duration = 4000, autoHide = true) {
        const notification = document.getElementById("notification");
        if (!notification) {
            console.warn("Notification element not found");
            return;
        }

        const icons = {
            success: '✓',
            error: '✕', 
            warning: '⚠',
            info: 'ℹ'
        };

        // Check if we're on dashboard or auth page and use appropriate classes
        const isDashboard = notification.classList.contains('notification-container') || 
                           window.location.pathname.includes('dashboard');
        
        if (isDashboard) {
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${icons[type] || '✓'}</span>
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="utils.hideNotification()" aria-label="Close notification">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
            `;
            notification.className = `notification-container ${type} show`;
        } else {
            // Auth page format
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${icons[type] || '✓'}</span>
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="utils.hideNotification()" aria-label="Close notification">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
            `;
            notification.className = `notification ${type} show`;
        }
        
        // Auto-hide notification after specified duration (default 4 seconds)
        if (autoHide && duration > 0) {
            setTimeout(() => {
                this.hideNotification();
            }, duration);
        }
    },

    hideNotification() {
        const notification = document.getElementById("notification");
        if (notification) {
            notification.classList.remove("show");
            setTimeout(() => {
                notification.innerHTML = '';
            }, 300); // Wait for transition to complete
        }
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

    async fetchAPI(endpoint, options = {}) {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        console.log(`API Call: ${endpoint}`); // Debug logging for API tracking
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Global notification function for backward compatibility
function showNotification(message, type, duration) {
    utils.showNotification(message, type, duration);
}