// Professional Theme Manager - Single Dark Theme
class ThemeManager {
    static initialize() {
        // Set professional dark theme permanently
        this.setProfessionalTheme();
    }
    
    static setProfessionalTheme() {
        // Remove any existing theme attributes and use unified dark theme
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
        
        // Add professional theme class
        document.documentElement.classList.add('professional-theme');
        
        return 'professional';
    }
}

// ThemeManager will be initialized by main-init.js