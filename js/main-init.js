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
        
        // Initialize auth manager
        authManager = new AuthManager();
        window.authManager = authManager;
        
        // Initialize content manager
        contentManager = new ContentManager();
        window.contentManager = contentManager;
        
        // Setup menu interactions
        MenuManager.setupMenuInteractions();
        
        // Check authentication and setup
        const user = await authManager.checkAuthentication();
        if (user) {
            authManager.setupLogoutHandler();
            console.log('User authenticated:', user.fullName);
        }
        
        // Setup modal close handlers
        setupModalCloseHandlers();
        
        // Show dashboard loader immediately
        showDashboardLoader();
        
        // Set initial CSS classes for dashboard elements
        const dashboardContent = document.getElementById('dashboardContent');
        if (dashboardContent) {
            dashboardContent.classList.add('dashboard-hidden');
        }
        
        // Initialize other dashboard components
        initializeTimeDisplay();
        setupMobileMenu();
        
        // Setup security features
        document.addEventListener("keydown", (e) => {
            if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
                e.preventDefault();
            }
        });
        document.addEventListener("contextmenu", (e) => e.preventDefault());
        
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