// Enhanced Sidebar Manager with Parent-Child Menu Support
class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.mobileSidebar = null;
        this.sidebarToggle = null;
        this.expandedMenus = new Set();
        this.activeMenuItem = null;
        this.isMobile = window.innerWidth <= 1024;
        
        this.initialize();
    }
    
    initialize() {
        this.setupSidebarElements();
        this.setupEventListeners();
        this.setupMenuAccordion();
        this.setupResizeHandler();
        this.loadSavedState();
        
        console.log('SidebarManager initialized');
    }
    
    setupSidebarElements() {
        this.sidebar = document.querySelector('.app-sidebar.permanent');
        this.mobileSidebar = document.querySelector('.app-sidebar:not(.permanent)');
        this.sidebarToggle = document.getElementById('btnSidebar');
        this.mobileOverlay = document.querySelector('.mobile-sidebar-overlay');
        
        // Create mobile overlay if it doesn't exist
        if (!this.mobileOverlay && this.mobileSidebar) {
            this.createMobileOverlay();
        }
    }
    
    createMobileOverlay() {
        this.mobileOverlay = document.createElement('div');
        this.mobileOverlay.className = 'mobile-sidebar-overlay';
        document.body.appendChild(this.mobileOverlay);
        
        this.mobileOverlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
    }
    
    setupEventListeners() {
        // Sidebar toggle
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close mobile sidebar button
        const closeBtn = document.querySelector('[data-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileSidebarOpen()) {
                this.closeMobileSidebar();
            }
        });
    }
    
    setupMenuAccordion() {
        // Desktop menu accordion
        this.setupDesktopAccordion();
        
        // Mobile menu accordion
        this.setupMobileAccordion();
    }
    
    setupDesktopAccordion() {
        const parentItems = document.querySelectorAll('.nav-item-parent[data-menu-toggle]');
        
        parentItems.forEach(parentItem => {
            const menuId = parentItem.getAttribute('data-menu-toggle');
            const navTitle = parentItem.querySelector('.nav-title');
            const submenu = document.getElementById(menuId);
            
            if (navTitle && submenu) {
                // Mark as expandable
                navTitle.classList.add('expandable');
                
                // Add click handler
                navTitle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleSubmenu(menuId, navTitle, submenu);
                });
                
                // Set initial state
                if (this.expandedMenus.has(menuId)) {
                    this.expandSubmenu(menuId, navTitle, submenu, false);
                } else {
                    this.collapseSubmenu(menuId, navTitle, submenu, false);
                }
            }
        });
        
        // Setup submenu item clicks
        this.setupSubmenuItems();
    }
    
    setupMobileAccordion() {
        const mobileParentItems = document.querySelectorAll('.mobile-nav-item-parent[data-mobile-menu-toggle]');
        
        mobileParentItems.forEach(parentItem => {
            const menuId = parentItem.getAttribute('data-mobile-menu-toggle');
            const navTitle = parentItem.querySelector('.mobile-nav-title');
            const submenu = document.getElementById(menuId);
            
            if (navTitle && submenu) {
                navTitle.classList.add('expandable');
                
                navTitle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMobileSubmenu(menuId, navTitle, submenu);
                });
                
                // Set initial state
                this.collapseMobileSubmenu(menuId, navTitle, submenu, false);
            }
        });
    }
    
    setupSubmenuItems() {
        const submenuItems = document.querySelectorAll('.nav-submenu a, .nav-submenu button');
        
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                submenuItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                this.activeMenuItem = item;
                
                // Save active state
                this.saveActiveState(item);
            });
        });
    }
    
    toggleSubmenu(menuId, navTitle, submenu) {
        if (this.expandedMenus.has(menuId)) {
            this.collapseSubmenu(menuId, navTitle, submenu);
        } else {
            this.expandSubmenu(menuId, navTitle, submenu);
        }
        
        this.saveExpandedState();
    }
    
    expandSubmenu(menuId, navTitle, submenu, animated = true) {
        this.expandedMenus.add(menuId);
        navTitle.classList.add('expanded');
        submenu.classList.remove('collapsed');
        submenu.classList.add('expanded');
        
        if (animated) {
            submenu.classList.add('submenu-entering');
            setTimeout(() => {
                submenu.classList.remove('submenu-entering');
            }, 300);
        }
        
        // Update ARIA attributes
        navTitle.setAttribute('aria-expanded', 'true');
        submenu.setAttribute('aria-hidden', 'false');
    }
    
    collapseSubmenu(menuId, navTitle, submenu, animated = true) {
        this.expandedMenus.delete(menuId);
        navTitle.classList.remove('expanded');
        submenu.classList.remove('expanded');
        
        if (animated) {
            submenu.classList.add('submenu-leaving');
            setTimeout(() => {
                submenu.classList.add('collapsed');
                submenu.classList.remove('submenu-leaving');
            }, 300);
        } else {
            submenu.classList.add('collapsed');
        }
        
        // Update ARIA attributes
        navTitle.setAttribute('aria-expanded', 'false');
        submenu.setAttribute('aria-hidden', 'true');
    }
    
    toggleMobileSubmenu(menuId, navTitle, submenu) {
        const isExpanded = navTitle.classList.contains('expanded');
        
        if (isExpanded) {
            this.collapseMobileSubmenu(menuId, navTitle, submenu);
        } else {
            this.expandMobileSubmenu(menuId, navTitle, submenu);
        }
    }
    
    expandMobileSubmenu(menuId, navTitle, submenu, animated = true) {
        navTitle.classList.add('expanded');
        submenu.classList.add('expanded');
        navTitle.setAttribute('aria-expanded', 'true');
        submenu.setAttribute('aria-hidden', 'false');
    }
    
    collapseMobileSubmenu(menuId, navTitle, submenu, animated = true) {
        navTitle.classList.remove('expanded');
        submenu.classList.remove('expanded');
        navTitle.setAttribute('aria-expanded', 'false');
        submenu.setAttribute('aria-hidden', 'true');
    }
    
    toggleSidebar() {
        if (this.isMobile) {
            this.toggleMobileSidebar();
        } else {
            this.toggleDesktopSidebar();
        }
    }
    
    toggleMobileSidebar() {
        if (this.isMobileSidebarOpen()) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        if (this.mobileSidebar) {
            this.mobileSidebar.classList.add('active');
            document.body.classList.add('sidebar-open');
            
            if (this.mobileOverlay) {
                this.mobileOverlay.classList.add('active');
            }
            
            // Update toggle button
            if (this.sidebarToggle) {
                this.sidebarToggle.setAttribute('aria-expanded', 'true');
            }
            
            // Focus first menu item for accessibility
            const firstMenuItem = this.mobileSidebar.querySelector('a, button');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }
    }
    
    closeMobileSidebar() {
        if (this.mobileSidebar) {
            this.mobileSidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            
            if (this.mobileOverlay) {
                this.mobileOverlay.classList.remove('active');
            }
            
            // Update toggle button
            if (this.sidebarToggle) {
                this.sidebarToggle.setAttribute('aria-expanded', 'false');
                this.sidebarToggle.focus(); // Return focus to toggle button
            }
        }
    }
    
    isMobileSidebarOpen() {
        return this.mobileSidebar && this.mobileSidebar.classList.contains('active');
    }
    
    toggleDesktopSidebar() {
        // For future implementation of collapsible desktop sidebar
        console.log('Desktop sidebar toggle - feature coming soon');
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 1024;
            
            // Close mobile sidebar if switching to desktop
            if (wasMobile && !this.isMobile && this.isMobileSidebarOpen()) {
                this.closeMobileSidebar();
            }
        });
    }
    
    saveExpandedState() {
        localStorage.setItem('sidebarExpandedMenus', JSON.stringify([...this.expandedMenus]));
    }
    
    saveActiveState(item) {
        const itemId = item.id || item.getAttribute('data-content') || '';
        localStorage.setItem('sidebarActiveItem', itemId);
    }
    
    loadSavedState() {
        // Load expanded menus
        try {
            const saved = localStorage.getItem('sidebarExpandedMenus');
            if (saved) {
                const expandedMenus = JSON.parse(saved);
                this.expandedMenus = new Set(expandedMenus);
            }
        } catch (e) {
            console.warn('Failed to load sidebar expanded state:', e);
        }
        
        // Load active item
        try {
            const activeItemId = localStorage.getItem('sidebarActiveItem');
            if (activeItemId) {
                const activeItem = document.getElementById(activeItemId) || 
                                 document.querySelector(`[data-content="${activeItemId}"]`);
                if (activeItem) {
                    activeItem.classList.add('active');
                    this.activeMenuItem = activeItem;
                }
            }
        } catch (e) {
            console.warn('Failed to load sidebar active state:', e);
        }
    }
    
    // Public API methods
    expandMenu(menuId) {
        const parentItem = document.querySelector(`[data-menu-toggle="${menuId}"]`);
        const submenu = document.getElementById(menuId);
        const navTitle = parentItem?.querySelector('.nav-title');
        
        if (navTitle && submenu) {
            this.expandSubmenu(menuId, navTitle, submenu);
            this.saveExpandedState();
        }
    }
    
    collapseMenu(menuId) {
        const parentItem = document.querySelector(`[data-menu-toggle="${menuId}"]`);
        const submenu = document.getElementById(menuId);
        const navTitle = parentItem?.querySelector('.nav-title');
        
        if (navTitle && submenu) {
            this.collapseSubmenu(menuId, navTitle, submenu);
            this.saveExpandedState();
        }
    }
    
    setActiveItem(itemId) {
        // Remove active from all items
        document.querySelectorAll('.nav-submenu a, .nav-submenu button').forEach(item => {
            item.classList.remove('active');
        });
        
        // Set new active item
        const item = document.getElementById(itemId) || 
                    document.querySelector(`[data-content="${itemId}"]`);
        if (item) {
            item.classList.add('active');
            this.activeMenuItem = item;
            this.saveActiveState(item);
        }
    }
}

// Initialize sidebar manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarManager = new SidebarManager();
    });
} else {
    window.sidebarManager = new SidebarManager();
}