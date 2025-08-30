/* ==========================================================================
   Enhanced Theme Manager
   Professional HR Management System
   ========================================================================== */

class EnhancedThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.systemTheme = 'light';
        this.toggleButton = null;
        this.rippleTimeout = null;
        
        this.init();
    }

    init() {
        // Detect system theme preference
        this.detectSystemTheme();
        
        // Load saved theme or use system preference
        this.loadTheme();
        
        // Initialize theme toggle button
        this.initializeToggleButton();
        
        // Listen for system theme changes
        this.listenForSystemChanges();
        
        // Update meta theme color
        this.updateMetaThemeColor();
        
        console.log('Enhanced Theme Manager initialized');
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.systemTheme = 'dark';
        } else {
            this.systemTheme = 'light';
        }
    }

    loadTheme() {
        // Check for saved theme in localStorage
        const savedTheme = localStorage.getItem('hr-theme');
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
        } else {
            // Use system preference if no saved theme
            this.currentTheme = this.systemTheme;
        }
        
        this.applyTheme(this.currentTheme, false);
    }

    initializeToggleButton() {
        this.toggleButton = document.getElementById('themeToggle');
        
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
            
            // Update button icon
            this.updateToggleButton();
        }
    }

    listenForSystemChanges() {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            darkModeQuery.addListener((e) => {
                this.systemTheme = e.matches ? 'dark' : 'light';
                
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('hr-theme')) {
                    this.applyTheme(this.systemTheme, true);
                }
            });
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, true);
    }

    applyTheme(theme, animate = false) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Invalid theme:', theme);
            return;
        }

        const previousTheme = this.currentTheme;
        this.currentTheme = theme;

        // Add ripple effect if animating
        if (animate && this.toggleButton) {
            this.addRippleEffect();
        }

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save theme preference
        localStorage.setItem('hr-theme', theme);
        
        // Update toggle button
        this.updateToggleButton();
        
        // Update meta theme color
        this.updateMetaThemeColor();
        
        // Dispatch theme change event
        this.dispatchThemeChangeEvent(theme, previousTheme);
        
        console.log(`Theme changed to: ${theme}`);
    }

    addRippleEffect() {
        if (!this.toggleButton) return;

        // Clear any existing timeout
        if (this.rippleTimeout) {
            clearTimeout(this.rippleTimeout);
        }

        // Add ripple class
        this.toggleButton.classList.add('ripple');

        // Remove ripple class after animation
        this.rippleTimeout = setTimeout(() => {
            this.toggleButton.classList.remove('ripple');
        }, 600);
    }

    updateToggleButton() {
        if (!this.toggleButton) return;

        const icon = this.toggleButton.querySelector('.material-icons-round');
        if (icon) {
            icon.textContent = this.currentTheme === 'light' ? 'dark_mode' : 'light_mode';
        }

        // Update aria-label for accessibility
        this.toggleButton.setAttribute(
            'aria-label', 
            `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} mode`
        );
    }

    updateMetaThemeColor() {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }

        // Set appropriate theme color for mobile browsers
        const themeColor = this.currentTheme === 'dark' ? '#0d1117' : '#ffffff';
        themeColorMeta.content = themeColor;
    }

    dispatchThemeChangeEvent(newTheme, previousTheme) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: newTheme,
                previousTheme: previousTheme,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    // Public API methods
    setTheme(theme) {
        this.applyTheme(theme, true);
    }

    getTheme() {
        return this.currentTheme;
    }

    getSystemTheme() {
        return this.systemTheme;
    }

    resetToSystemTheme() {
        localStorage.removeItem('hr-theme');
        this.applyTheme(this.systemTheme, true);
    }

    // Utility methods
    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    isLightMode() {
        return this.currentTheme === 'light';
    }
}

/* ==========================================================================
   Auto-initialization
   ========================================================================== */
let themeManager;

function initializeThemeManager() {
    if (!themeManager) {
        themeManager = new EnhancedThemeManager();
        
        // Make it globally accessible
        window.themeManager = themeManager;
    }
    
    return themeManager;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeManager);
} else {
    initializeThemeManager();
}

// Initialize immediately if called after DOM is loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeThemeManager();
}

/* ==========================================================================
   Export for module systems
   ========================================================================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedThemeManager;
}

if (typeof window !== 'undefined') {
    window.EnhancedThemeManager = EnhancedThemeManager;
}