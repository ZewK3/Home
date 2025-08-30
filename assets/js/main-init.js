// Main application initialization
// This file coordinates the initialization of all modules
// Updated to use consolidated ContentManager (replaces dashboard-handler.js)

// Global instances
let authManager;
let contentManager;

// Main initialization function
async function initializeApplication() {
    try {
        console.log('Initializing HR Management System...');
        
        // Initialize theme manager
        ThemeManager.initialize();
        
        // Initialize auth manager
        authManager = new AuthManager();
        window.authManager = authManager;
        
        // Check authentication and setup
        const user = await authManager.checkAuthentication();
        if (user) {
            authManager.setupLogoutHandler();
            console.log('User authenticated:', user.name || user.fullName);
            
            // Initialize consolidated ContentManager with user data
            contentManager = new ContentManager(user);
            window.contentManager = contentManager;
            
            // Initialize dashboard components using ContentManager
            await contentManager.initialize();
            
        } else {
            console.warn('Authentication failed, redirecting to login');
            return;
        }
        
        // Initialize professional CSS styles
        initializeProfessionalStyles();
        
        console.log('HR Management System initialized successfully');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        utils.showNotification('Lỗi khởi tạo ứng dụng', 'error');
    }
}

// Initialize professional styles (placeholder for future enhancements)
function initializeProfessionalStyles() {
    // Professional styles are already loaded via dash.css
    console.log('Professional styles initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApplication);