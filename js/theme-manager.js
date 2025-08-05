// Automatic Time-Based Theme Manager
class ThemeManager {
    static initialize() {
        // Set automatic theme based on time
        this.setAutomaticTheme();
        
        // Update theme every minute
        setInterval(() => this.setAutomaticTheme(), 60000);
    }
    
    static setAutomaticTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        // Dark mode: 18:00 (6 PM) to 06:59 (7 AM)
        // Light mode: 07:00 (7 AM) to 17:59 (6 PM)
        const isDarkTime = hour >= 18 || hour < 7;
        const newTheme = isDarkTime ? "dark" : "light";
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
        
        return newTheme;
    }
}

// ThemeManager will be initialized by main-init.js