// Enhanced Theme Manager with Manual Override Support
class ThemeManager {
    static isManualMode = false;
    static currentTheme = 'light';
    
    static initialize() {
        // Check for saved manual preference
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        const manualMode = localStorage.getItem(CONFIG.STORAGE_KEYS.MANUAL_THEME) === 'true';
        
        if (manualMode && savedTheme) {
            this.isManualMode = true;
            this.setTheme(savedTheme);
        } else {
            // Set automatic theme based on time
            this.setAutomaticTheme();
        }
        
        // Update theme every minute if not in manual mode
        setInterval(() => {
            if (!this.isManualMode) {
                this.setAutomaticTheme();
            }
        }, 60000);
        
        // Initialize theme toggle if on dashboard
        if (document.querySelector('.show-user')) {
            this.initializeThemeToggle();
        }
    }
    
    static setAutomaticTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        // Dark mode: 18:00 (6 PM) to 06:59 (7 AM)
        // Light mode: 07:00 (7 AM) to 17:59 (6 PM)
        const isDarkTime = hour >= 18 || hour < 7;
        const newTheme = isDarkTime ? "dark" : "light";
        
        this.setTheme(newTheme);
        return newTheme;
    }
    
    static setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        
        // Update theme toggle button if it exists
        this.updateThemeToggleButton();
        
        // Update time icon based on theme
        this.updateTimeIcon();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    static toggleTheme() {
        this.isManualMode = true;
        localStorage.setItem(CONFIG.STORAGE_KEYS.MANUAL_THEME, 'true');
        
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Show notification
        const message = newTheme === 'dark' ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng';
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification(message, 'success');
        }
    }
    
    static resetToAutomatic() {
        this.isManualMode = false;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.MANUAL_THEME);
        this.setAutomaticTheme();
        
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Đã chuyển về chế độ tự động theo giờ', 'info');
        }
    }
    
    static initializeThemeToggle() {
        // Add theme toggle button to header
        const headerActions = document.querySelector('.AppHeader-actions');
        if (headerActions && !document.querySelector('#themeToggle')) {
            const themeToggleHTML = `
                <div class="theme-toggle-container">
                    <button id="themeToggle" class="theme-toggle-btn" title="Chuyển đổi chủ đề">
                        <span class="theme-icon material-icons-round">brightness_6</span>
                    </button>
                    <button id="themeReset" class="theme-reset-btn" title="Tự động theo giờ">
                        <span class="material-icons-round">schedule</span>
                    </button>
                </div>
            `;
            
            headerActions.insertAdjacentHTML('afterbegin', themeToggleHTML);
            
            // Add event listeners
            document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
            document.getElementById('themeReset').addEventListener('click', () => this.resetToAutomatic());
            
            // Initialize button states
            this.updateThemeToggleButton();
        }
    }
    
    static updateThemeToggleButton() {
        const themeIcon = document.querySelector('.theme-icon');
        const themeToggle = document.querySelector('#themeToggle');
        const themeReset = document.querySelector('#themeReset');
        
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'light' ? 'dark_mode' : 'light_mode';
        }
        
        if (themeToggle) {
            themeToggle.title = this.currentTheme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng';
        }
        
        if (themeReset) {
            themeReset.classList.toggle('active', !this.isManualMode);
            themeReset.title = this.isManualMode ? 'Chuyển về tự động theo giờ' : 'Đang tự động theo giờ';
        }
    }
    
    static updateTimeIcon() {
        const timeIcon = document.querySelector('#timeIcon');
        if (timeIcon) {
            const hour = new Date().getHours();
            const isDayTime = hour >= 6 && hour < 18;
            const iconName = this.currentTheme === 'dark' ? 'nights_stay' : (isDayTime ? 'wb_sunny' : 'nights_stay');
            timeIcon.textContent = iconName;
            
            // Add appropriate class for styling
            timeIcon.className = `time-icon material-icons-round ${this.currentTheme === 'dark' || !isDayTime ? 'moon' : ''}`;
        }
    }
}

// ThemeManager will be initialized by main-init.js