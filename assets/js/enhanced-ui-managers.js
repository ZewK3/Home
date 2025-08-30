// Enhanced Sidebar Manager - Advanced Parent-Child Menu System
class EnhancedSidebarManager {
    constructor() {
        this.sidebar = null;
        this.sidebarBackdrop = null;
        this.isCollapsed = false;
        this.isMobile = window.innerWidth <= 1024;
        this.expandedMenus = new Set();
        this.activeItem = null;
        this.menuState = {};
        
        this.initialize();
    }
    
    initialize() {
        this.setupElements();
        this.setupEventListeners();
        this.loadSavedState();
        this.updateMobileState();
        this.setupKeyboardNavigation();
        
        console.log('✅ Enhanced Sidebar Manager initialized');
    }
    
    setupElements() {
        this.sidebar = document.querySelector('.app-sidebar');
        
        if (!this.sidebar) {
            console.warn('Sidebar element not found');
            return;
        }
        
        // Create mobile backdrop if it doesn't exist
        this.createMobileBackdrop();
        
        // Setup ARIA attributes
        this.setupAccessibility();
    }
    
    createMobileBackdrop() {
        if (!document.querySelector('.sidebar-backdrop')) {
            this.sidebarBackdrop = document.createElement('div');
            this.sidebarBackdrop.className = 'sidebar-backdrop';
            this.sidebarBackdrop.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this.sidebarBackdrop);
        } else {
            this.sidebarBackdrop = document.querySelector('.sidebar-backdrop');
        }
    }
    
    setupAccessibility() {
        // Set up ARIA attributes for screen readers
        this.sidebar.setAttribute('role', 'navigation');
        this.sidebar.setAttribute('aria-label', 'Main navigation');
        
        // Setup parent menu items
        document.querySelectorAll('.nav-item-parent').forEach((parent, index) => {
            const title = parent.querySelector('.nav-title');
            const submenu = parent.querySelector('.nav-submenu');
            
            if (title && submenu) {
                const menuId = `submenu-${index}`;
                title.setAttribute('aria-expanded', 'false');
                title.setAttribute('aria-controls', menuId);
                title.setAttribute('role', 'button');
                title.setAttribute('tabindex', '0');
                submenu.setAttribute('id', menuId);
                submenu.setAttribute('role', 'menu');
            }
        });
    }
    
    setupEventListeners() {
        // Window resize listener
        window.addEventListener('resize', () => {
            this.updateMobileState();
        });
        
        // Sidebar toggle button
        const sidebarToggle = document.getElementById('btnSidebar');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Parent menu clicks
        document.querySelectorAll('.nav-item-parent .nav-title').forEach(title => {
            title.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleParentMenu(title);
            });
        });
        
        // Submenu item clicks
        document.querySelectorAll('.nav-submenu a').forEach(link => {
            link.addEventListener('click', (e) => {
                this.setActiveItem(link);
                
                // If mobile, close sidebar after selection
                if (this.isMobile) {
                    this.closeMobileSidebar();
                }
            });
        });
        
        // Single navigation item clicks
        document.querySelectorAll('.nav-item-single a').forEach(link => {
            link.addEventListener('click', (e) => {
                this.setActiveItem(link);
                
                if (this.isMobile) {
                    this.closeMobileSidebar();
                }
            });
        });
        
        // Mobile backdrop click
        if (this.sidebarBackdrop) {
            this.sidebarBackdrop.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
        
        // Escape key to close mobile sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile && this.sidebar.classList.contains('mobile-open')) {
                this.closeMobileSidebar();
            }
        });
    }
    
    setupKeyboardNavigation() {
        // Add keyboard support for expandable menu items
        document.querySelectorAll('.nav-title').forEach(title => {
            title.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleParentMenu(title);
                }
                
                // Arrow navigation
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.focusNextItem(title);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.focusPreviousItem(title);
                }
            });
        });
    }
    
    toggleSidebar() {
        if (this.isMobile) {
            this.toggleMobileSidebar();
        } else {
            this.toggleDesktopSidebar();
        }
    }
    
    toggleMobileSidebar() {
        const isOpen = this.sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        this.sidebar.classList.add('mobile-open');
        this.sidebarBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusableElement = this.sidebar.querySelector('.nav-title, .nav-item-single a');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
        
        // Update button ARIA
        const toggleBtn = document.getElementById('btnSidebar');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    }
    
    closeMobileSidebar() {
        this.sidebar.classList.remove('mobile-open');
        this.sidebarBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to toggle button
        const toggleBtn = document.getElementById('btnSidebar');
        if (toggleBtn) {
            toggleBtn.focus();
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }
    
    toggleDesktopSidebar() {
        this.isCollapsed = !this.isCollapsed;
        this.sidebar.classList.toggle('collapsed', this.isCollapsed);
        
        // Save state
        localStorage.setItem('sidebar-collapsed', this.isCollapsed);
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('sidebar-toggle', {
            detail: { collapsed: this.isCollapsed }
        }));
    }
    
    toggleParentMenu(titleElement) {
        const parentItem = titleElement.closest('.nav-item-parent');
        const submenu = parentItem.querySelector('.nav-submenu');
        const menuToggle = titleElement.getAttribute('data-menu-toggle') || 
                          parentItem.getAttribute('data-menu-toggle');
        
        if (!submenu) return;
        
        const isExpanded = titleElement.classList.contains('expanded');
        
        if (isExpanded) {
            this.collapseMenu(titleElement, submenu, menuToggle);
        } else {
            this.expandMenu(titleElement, submenu, menuToggle);
        }
        
        this.saveMenuState();
    }
    
    expandMenu(titleElement, submenu, menuId) {
        // Add expanding classes
        titleElement.classList.add('expanded');
        submenu.classList.add('expanded', 'submenu-entering');
        
        // Update ARIA
        titleElement.setAttribute('aria-expanded', 'true');
        
        // Add to expanded set
        if (menuId) {
            this.expandedMenus.add(menuId);
        }
        
        // Remove animation class after transition
        setTimeout(() => {
            submenu.classList.remove('submenu-entering');
        }, 300);
        
        // Smooth scroll into view if needed
        setTimeout(() => {
            if (!this.isElementInViewport(submenu)) {
                submenu.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }, 150);
        
        console.log(`📂 Expanded menu: ${menuId || 'unknown'}`);
    }
    
    collapseMenu(titleElement, submenu, menuId) {
        // Add collapsing classes
        titleElement.classList.remove('expanded');
        submenu.classList.add('submenu-leaving');
        
        // Update ARIA
        titleElement.setAttribute('aria-expanded', 'false');
        
        // Remove from expanded set
        if (menuId) {
            this.expandedMenus.delete(menuId);
        }
        
        // Complete collapse after animation
        setTimeout(() => {
            submenu.classList.remove('expanded', 'submenu-leaving');
        }, 300);
        
        console.log(`📁 Collapsed menu: ${menuId || 'unknown'}`);
    }
    
    setActiveItem(element) {
        // Remove active from all items
        document.querySelectorAll('.nav-title.active, .nav-submenu a.active, .nav-item-single a.active')
            .forEach(item => item.classList.remove('active'));
        
        // Set new active item
        element.classList.add('active');
        this.activeItem = element;
        
        // If it's a submenu item, also mark its parent as active
        const parentMenu = element.closest('.nav-item-parent');
        if (parentMenu) {
            const parentTitle = parentMenu.querySelector('.nav-title');
            if (parentTitle) {
                parentTitle.classList.add('active');
                
                // Ensure parent menu is expanded
                if (!parentTitle.classList.contains('expanded')) {
                    const submenu = parentMenu.querySelector('.nav-submenu');
                    const menuToggle = parentTitle.getAttribute('data-menu-toggle') || 
                                     parentMenu.getAttribute('data-menu-toggle');
                    this.expandMenu(parentTitle, submenu, menuToggle);
                }
            }
        }
        
        // Save active state
        const itemId = element.id || element.getAttribute('data-nav-id');
        if (itemId) {
            localStorage.setItem('sidebar-active-item', itemId);
            console.log(`🎯 Active item set: ${itemId}`);
        }
    }
    
    loadSavedState() {
        // Load collapsed state
        const savedCollapsed = localStorage.getItem('sidebar-collapsed');
        if (savedCollapsed === 'true' && !this.isMobile) {
            this.isCollapsed = true;
            this.sidebar.classList.add('collapsed');
        }
        
        // Load expanded menus
        const savedMenus = localStorage.getItem('sidebar-expanded-menus');
        if (savedMenus) {
            try {
                const expandedMenus = JSON.parse(savedMenus);
                expandedMenus.forEach(menuId => {
                    this.expandedMenus.add(menuId);
                    const menuElement = document.querySelector(`[data-menu-toggle="${menuId}"]`);
                    if (menuElement) {
                        const titleElement = menuElement.querySelector('.nav-title') || menuElement;
                        const submenu = menuElement.querySelector('.nav-submenu');
                        if (titleElement && submenu) {
                            this.expandMenu(titleElement, submenu, menuId);
                        }
                    }
                });
            } catch (e) {
                console.warn('Failed to load saved menu state:', e);
            }
        }
        
        // Load active item
        const savedActiveItem = localStorage.getItem('sidebar-active-item');
        if (savedActiveItem) {
            const activeElement = document.getElementById(savedActiveItem) || 
                                 document.querySelector(`[data-nav-id="${savedActiveItem}"]`);
            if (activeElement) {
                this.setActiveItem(activeElement);
            }
        }
    }
    
    saveMenuState() {
        // Save expanded menus
        const expandedArray = Array.from(this.expandedMenus);
        localStorage.setItem('sidebar-expanded-menus', JSON.stringify(expandedArray));
    }
    
    updateMobileState() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 1024;
        
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                // Switched to mobile
                this.sidebar.classList.remove('collapsed');
                this.closeMobileSidebar();
            } else {
                // Switched to desktop
                this.closeMobileSidebar();
                if (this.isCollapsed) {
                    this.sidebar.classList.add('collapsed');
                }
            }
        }
    }
    
    // Utility methods
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const sidebarRect = this.sidebar.getBoundingClientRect();
        
        return (
            rect.top >= sidebarRect.top &&
            rect.bottom <= sidebarRect.bottom
        );
    }
    
    focusNextItem(currentElement) {
        const focusableElements = this.sidebar.querySelectorAll('.nav-title, .nav-submenu a, .nav-item-single a');
        const currentIndex = Array.from(focusableElements).indexOf(currentElement);
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
    }
    
    focusPreviousItem(currentElement) {
        const focusableElements = this.sidebar.querySelectorAll('.nav-title, .nav-submenu a, .nav-item-single a');
        const currentIndex = Array.from(focusableElements).indexOf(currentElement);
        const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex].focus();
    }
    
    // Public API methods
    expandMenuById(menuId) {
        const menuElement = document.querySelector(`[data-menu-toggle="${menuId}"]`);
        if (menuElement) {
            const titleElement = menuElement.querySelector('.nav-title') || menuElement;
            const submenu = menuElement.querySelector('.nav-submenu');
            if (titleElement && submenu && !titleElement.classList.contains('expanded')) {
                this.expandMenu(titleElement, submenu, menuId);
                this.saveMenuState();
            }
        }
    }
    
    collapseMenuById(menuId) {
        const menuElement = document.querySelector(`[data-menu-toggle="${menuId}"]`);
        if (menuElement) {
            const titleElement = menuElement.querySelector('.nav-title') || menuElement;
            const submenu = menuElement.querySelector('.nav-submenu');
            if (titleElement && submenu && titleElement.classList.contains('expanded')) {
                this.collapseMenu(titleElement, submenu, menuId);
                this.saveMenuState();
            }
        }
    }
    
    setActiveItemById(itemId) {
        const element = document.getElementById(itemId) || 
                       document.querySelector(`[data-nav-id="${itemId}"]`);
        if (element) {
            this.setActiveItem(element);
        }
    }
    
    collapseAll() {
        document.querySelectorAll('.nav-title.expanded').forEach(title => {
            const parentItem = title.closest('.nav-item-parent');
            const submenu = parentItem.querySelector('.nav-submenu');
            const menuToggle = title.getAttribute('data-menu-toggle') || 
                              parentItem.getAttribute('data-menu-toggle');
            this.collapseMenu(title, submenu, menuToggle);
        });
        this.expandedMenus.clear();
        this.saveMenuState();
    }
    
    destroy() {
        // Clean up event listeners and remove elements
        if (this.sidebarBackdrop && this.sidebarBackdrop.parentNode) {
            this.sidebarBackdrop.parentNode.removeChild(this.sidebarBackdrop);
        }
        
        // Reset body styles
        document.body.style.overflow = '';
        
        console.log('🗑️ Enhanced Sidebar Manager destroyed');
    }
}

// Enhanced Theme Manager with Ripple Effects
class EnhancedThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themeToggle = null;
        this.isTransitioning = false;
        this.ripplePosition = { x: 50, y: 50 };
        
        this.initialize();
    }
    
    initialize() {
        // Load saved theme preference
        this.currentTheme = this.getInitialTheme();
        this.applyTheme(this.currentTheme, false);
        
        // Initialize theme toggle
        this.initializeThemeToggle();
        
        // Watch for system theme changes
        this.watchSystemTheme();
        
        // Set up meta theme color for mobile browsers
        this.updateMetaThemeColor();
        
        console.log('✅ Enhanced Theme Manager initialized with theme:', this.currentTheme);
    }
    
    getInitialTheme() {
        // Check saved preference first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }
    
    initializeThemeToggle() {
        this.themeToggle = document.getElementById('themeToggle');
        if (this.themeToggle) {
            this.updateThemeToggleIcon();
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleThemeToggleClick(e);
            });
        }
    }
    
    handleThemeToggleClick(event) {
        if (this.isTransitioning) return;
        
        // Calculate ripple position from click coordinates
        const rect = this.themeToggle.getBoundingClientRect();
        this.ripplePosition = {
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100
        };
        
        this.toggleTheme();
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.switchToTheme(newTheme);
    }
    
    switchToTheme(theme) {
        if (this.currentTheme === theme || this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Add transition classes
        document.body.classList.add('theme-switching');
        if (this.themeToggle) {
            this.themeToggle.classList.add('switching');
        }
        
        // Set CSS custom properties for ripple position
        document.documentElement.style.setProperty('--ripple-x', `${this.ripplePosition.x}%`);
        document.documentElement.style.setProperty('--ripple-y', `${this.ripplePosition.y}%`);
        
        // Apply the new theme
        setTimeout(() => {
            this.applyTheme(theme, true);
        }, 50);
        
        // Clean up transition classes
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
            if (this.themeToggle) {
                this.themeToggle.classList.remove('switching');
            }
            this.isTransitioning = false;
        }, 500);
    }
    
    applyTheme(theme, save = true) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        if (save) {
            localStorage.setItem('theme', theme);
        }
        
        this.updateThemeToggleIcon();
        this.updateMetaThemeColor();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { theme: this.currentTheme }
        }));
        
        console.log('🎨 Theme applied:', theme);
    }
    
    updateThemeToggleIcon() {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('.material-icons-round');
        const isDark = this.currentTheme === 'dark';
        
        if (icon) {
            icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
        
        this.themeToggle.setAttribute('aria-label', 
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );
        this.themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    
    updateMetaThemeColor() {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const color = this.currentTheme === 'dark' ? '#0d1117' : '#ffffff';
            metaThemeColor.setAttribute('content', color);
        }
    }
    
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    const preferredTheme = e.matches ? 'dark' : 'light';
                    this.switchToTheme(preferredTheme);
                }
            });
        }
    }
    
    // Public API
    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.switchToTheme(theme);
        }
    }
    
    getTheme() {
        return this.currentTheme;
    }
    
    isDark() {
        return this.currentTheme === 'dark';
    }
    
    isLight() {
        return this.currentTheme === 'light';
    }
}

// Initialize managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with slight delay to ensure all elements are ready
    setTimeout(() => {
        window.sidebarManager = new EnhancedSidebarManager();
        window.themeManager = new EnhancedThemeManager();
    }, 100);
});

// Global export for backward compatibility
window.EnhancedSidebarManager = EnhancedSidebarManager;
window.EnhancedThemeManager = EnhancedThemeManager;