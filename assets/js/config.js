// Constants and Configuration
const CONFIG = {
    API_URL: "https://hrm-api.tocotoco.workers.dev",
    API_BASE_URL: "https://hrm-api.tocotoco.workers.dev",
    STORAGE_KEYS: {
        AUTH_TOKEN: "authToken",
        USER_DATA: "loggedInUser",
        THEME: "theme",
        REMEMBER_ME: "rememberedEmployeeId"
    },
    POLLING_INTERVAL: 3000,
    MAX_RETRY_ATTEMPTS: 3,
    // API Version - set to 'restful' to use new RESTful endpoints, 'legacy' for old action-based
    API_VERSION: 'restful',
    // Maintenance mode - set to true to enable maintenance page
    MAINTENANCE_MODE: false
};

// Check maintenance mode on page load (except for maintenance and 404 pages)
if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const isMaintenancePage = currentPath.includes('maintenance.html');
    const is404Page = currentPath.includes('404.html');
    
    if (CONFIG.MAINTENANCE_MODE && !isMaintenancePage && !is404Page) {
        console.log('Maintenance mode active, redirecting...');
        window.location.href = '/maintenance.html';
    }
}