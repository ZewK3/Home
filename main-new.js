// Main application entry point
// Import all modules in correct order

// Core modules
import './js/config.js';
import './js/utils.js';
import './js/api-cache.js';

// Manager classes
import './js/auth-manager.js';
import './js/theme-manager.js';
import './js/menu-manager.js';
import './js/content-manager.js';

// Additional functionality
import './js/dashboard-handler.js';

// Initialize global instances
let authManager;
let contentManager;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize theme manager
        ThemeManager.initialize();
        
        // Initialize auth manager
        authManager = new AuthManager();
        
        // Initialize content manager
        contentManager = new ContentManager();
        
        // Setup menu interactions
        MenuManager.setupMenuInteractions();
        
        // Check authentication
        await authManager.checkAuthentication();
        
        // Setup logout handler
        authManager.setupLogoutHandler();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        utils.showNotification('Lỗi khởi tạo ứng dụng', 'error');
    }
});

// Export global instances for backward compatibility
window.authManager = authManager;
window.contentManager = contentManager;