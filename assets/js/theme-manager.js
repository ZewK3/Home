// Enhanced Theme Manager with Dark/Light Mode Support
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default to dark theme
        this.themeToggle = null;
        this.isTransitioning = false;
        
        this.initialize();
    }
    
    initialize() {
        // Load saved theme or default to dark
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(this.currentTheme, false);
        
        // Initialize theme toggle button
        this.initializeThemeToggle();
        
        // Listen for system theme changes
        this.watchSystemTheme();
        
        console.log('ThemeManager initialized with theme:', this.currentTheme);
    }
    
    initializeThemeToggle() {
        this.themeToggle = document.getElementById('themeToggle');
        if (this.themeToggle) {
            this.updateThemeToggleIcon();
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }
    
    toggleTheme() {
        if (this.isTransitioning) return;
        
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.switchToTheme(newTheme);
    }
    
    switchToTheme(theme) {
        if (this.currentTheme === theme || this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Add transition class to body
        document.body.classList.add('theme-switching');
        
        // Apply ripple effect if theme toggle exists
        if (this.themeToggle) {
            const rect = this.themeToggle.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            document.documentElement.style.setProperty('--ripple-x', `${x}px`);
            document.documentElement.style.setProperty('--ripple-y', `${y}px`);
            
            this.themeToggle.classList.add('switching');
        }
        
        // Apply theme after short delay for smooth transition
        setTimeout(() => {
            this.applyTheme(theme, true);
            this.currentTheme = theme;
            this.updateThemeToggleIcon();
            
            // Save preference
            localStorage.setItem('theme', theme);
            
            // Dispatch theme change event
            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: theme }
            }));
            
            // Remove transition classes
            setTimeout(() => {
                document.body.classList.remove('theme-switching');
                if (this.themeToggle) {
                    this.themeToggle.classList.remove('switching');
                }
                this.isTransitioning = false;
            }, 300);
            
        }, 150);
    }
    
    applyTheme(theme, animated = true) {
        const html = document.documentElement;
        
        // Remove existing theme classes
        html.classList.remove('theme-dark', 'theme-light');
        
        // Set data attribute for CSS
        html.setAttribute('data-theme', theme);
        
        // Add theme class for additional styling if needed
        html.classList.add(`theme-${theme}`);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        console.log(`Theme applied: ${theme}`);
    }
    
    updateThemeToggleIcon() {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('.material-icons-round');
        if (icon) {
            icon.textContent = this.currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
        }
        
        // Update aria-label for accessibility
        this.themeToggle.setAttribute('aria-label', 
            `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`
        );
    }
    
    updateMetaThemeColor(theme) {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }
        
        const colors = {
            dark: '#0d1117',
            light: '#ffffff'
        };
        
        themeColorMeta.content = colors[theme] || colors.dark;
    }
    
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Listen for changes in system theme preference
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.switchToTheme(systemTheme);
                }
            });
        }
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    setTheme(theme) {
        if (['dark', 'light'].includes(theme)) {
            this.switchToTheme(theme);
        }
    }
    
    // Static methods for backwards compatibility
    static initialize() {
        if (!window.themeManager) {
            window.themeManager = new ThemeManager();
        }
    }
    
    static setLightTheme() {
        if (window.themeManager) {
            window.themeManager.setTheme('light');
        }
        return 'light';
    }
    
    static setDarkTheme() {
        if (window.themeManager) {
            window.themeManager.setTheme('dark');
        }
        return 'dark';
    }
    
    static getCurrentTheme() {
        return window.themeManager ? window.themeManager.getCurrentTheme() : 'dark';
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.initialize());
} else {
    ThemeManager.initialize();
}