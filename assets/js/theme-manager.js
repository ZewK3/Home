// Light Theme Only Manager
class ThemeManager {
    static initialize() {
        // Set light theme permanently
        this.setLightTheme();
    }
    
    static setLightTheme() {
        document.documentElement.setAttribute('data-theme', 'light');
        // Use SimpleStorage for UTF-8 support
        if (typeof SimpleStorage !== 'undefined') {
            SimpleStorage.set(CONFIG.STORAGE_KEYS.THEME, 'light');
        } else {
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, 'light');
        }
        
        return 'light';
    }
}

// ThemeManager will be initialized by main-init.js