// Main application initialization
// This file coordinates the initialization of all modules

// Global instances
let authManager;
let contentManager;

// Main initialization function
async function initializeApplication() {
    try {
        console.log('Initializing HR Management System...');
        
        // Initialize theme manager
        ThemeManager.initialize();
        
        // Initialize menu manager
        MenuManager.init();
        
        // Initialize auth manager
        authManager = new AuthManager();
        window.authManager = authManager;
        
        // Content manager will be initialized by dashboard handler
        // after authentication is confirmed
        
        // Check authentication and setup
        const user = await authManager.checkAuthentication();
        if (user) {
            authManager.setupLogoutHandler();
            console.log('User authenticated:', user.fullName);
        }
        
        // Initialize dashboard components
        await initializeDashboard();
        
        // Run system data refresh
        await refreshSystemData();
        
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