// Main application initialization
// This file coordinates the initialization of all modules

// Global instances
let authManager;
let contentManager;

// Mobile testing panel functionality
class MobileTestingPanel {
    constructor() {
        this.panel = null;
        this.logsContainer = null;
        this.isExpanded = false;
        this.originalConsole = {};
        this.init();
    }

    init() {
        // Only initialize on mobile
        if (window.innerWidth > 768) return;

        this.panel = document.getElementById('mobileTestingPanel');
        this.logsContainer = document.getElementById('consoleLogsList');
        
        if (!this.panel || !this.logsContainer) return;

        this.setupEventListeners();
        this.interceptConsole();
        this.addInitialLog('Mobile Testing Panel initialized', 'info');
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggleTestingBtn');
        const clearBtn = document.getElementById('clearLogsBtn');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearLogs());
        }
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        if (this.panel) {
            this.panel.classList.toggle('expanded', this.isExpanded);
            
            const toggleBtn = document.getElementById('toggleTestingBtn');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('.material-icons-round');
                if (icon) {
                    icon.textContent = this.isExpanded ? 'expand_less' : 'expand_more';
                }
            }
        }
    }

    clearLogs() {
        if (this.logsContainer) {
            this.logsContainer.innerHTML = '';
            this.addInitialLog('Console cleared', 'info');
        }
    }

    interceptConsole() {
        // Store original console methods
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        // Override console methods
        console.log = (...args) => {
            this.originalConsole.log.apply(console, args);
            this.addLog(args.join(' '), 'debug');
        };

        console.error = (...args) => {
            this.originalConsole.error.apply(console, args);
            this.addLog(args.join(' '), 'error');
        };

        console.warn = (...args) => {
            this.originalConsole.warn.apply(console, args);
            this.addLog(args.join(' '), 'warn');
        };

        console.info = (...args) => {
            this.originalConsole.info.apply(console, args);
            this.addLog(args.join(' '), 'info');
        };

        // Capture uncaught errors
        window.addEventListener('error', (event) => {
            this.addLog(`Error: ${event.message} at ${event.filename}:${event.lineno}`, 'error');
        });

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.addLog(`Unhandled Promise Rejection: ${event.reason}`, 'error');
        });
    }

    addLog(message, type = 'debug') {
        if (!this.logsContainer) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-message">${this.escapeHtml(String(message))}</span>
        `;

        this.logsContainer.appendChild(logEntry);
        
        // Auto-scroll to bottom
        this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
        
        // Limit log entries to prevent memory issues
        const entries = this.logsContainer.children;
        if (entries.length > 100) {
            this.logsContainer.removeChild(entries[0]);
        }
    }

    addInitialLog(message, type = 'info') {
        this.addLog(message, type);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Main initialization function
async function initializeApplication() {
    try {
        console.log('Initializing HR Management System...');
        
        // Initialize mobile testing panel first
        if (window.innerWidth <= 768) {
            window.mobileTestingPanel = new MobileTestingPanel();
        }
        
        // Initialize theme manager
        ThemeManager.initialize();
        
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