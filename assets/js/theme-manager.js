// Light Theme Only Manager
class ThemeManager {
    static initialize() {
        // Set light theme permanently
        this.setLightTheme();
    }
    
    static setLightTheme() {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, 'light');
        
        return 'light';
    }
}

// ThemeManager will be initialized by main-init.js