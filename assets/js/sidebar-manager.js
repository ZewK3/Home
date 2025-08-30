/* ==========================================================================
   Enhanced Sidebar Manager
   Professional HR Management System Dashboard
   ========================================================================== */

class EnhancedSidebarManager {
    constructor() {
        this.activeItem = null;
        this.expandedMenus = new Set();
        this.sidebar = null;
        this.mobileOverlay = null;
        this.isMobile = false;
        
        this.init();
    }

    init() {
        this.sidebar = document.querySelector('.app-sidebar');
        if (!this.sidebar) {
            console.warn('Sidebar not found');
            return;
        }

        // Initialize parent-child menu functionality
        this.initializeParentChildMenus();
        
        // Initialize mobile functionality
        this.initializeMobileNavigation();
        
        // Load saved state
        this.loadSavedState();
        
        // Setup responsive behavior
        this.setupResponsiveBehavior();
        
        console.log('Enhanced Sidebar Manager initialized');
    }

    initializeParentChildMenus() {
        // Find all nav items with children
        const parentItems = this.sidebar.querySelectorAll('.nav-item.has-children');
        
        parentItems.forEach(item => {
            const navLink = item.querySelector('.nav-link');
            const subMenu = item.querySelector('.sub-menu');
            
            if (navLink && subMenu) {
                // Add click event for parent menu toggle
                navLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleParentMenu(item);
                });

                // Add keyboard support
                navLink.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleParentMenu(item);
                    }
                });

                // Initialize submenu items
                const subItems = subMenu.querySelectorAll('.nav-link');
                subItems.forEach(subLink => {
                    subLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.setActiveItem(subLink);
                        this.handleSubMenuClick(subLink);
                    });
                });
            }
        });
    }

    toggleParentMenu(parentItem) {
        const menuId = parentItem.getAttribute('data-menu-id') || parentItem.querySelector('.nav-link').textContent.trim();
        const isExpanded = parentItem.classList.contains('expanded');
        
        if (isExpanded) {
            this.collapseMenu(parentItem, menuId);
        } else {
            this.expandMenu(parentItem, menuId);
        }
        
        // Save state
        this.saveState();
    }

    expandMenu(parentItem, menuId) {
        parentItem.classList.add('expanded');
        this.expandedMenus.add(menuId);
        
        // Update ARIA attributes
        const navLink = parentItem.querySelector('.nav-link');
        if (navLink) {
            navLink.setAttribute('aria-expanded', 'true');
        }
        
        const subMenu = parentItem.querySelector('.sub-menu');
        if (subMenu) {
            subMenu.setAttribute('aria-hidden', 'false');
        }
        
        console.log(`Expanded menu: ${menuId}`);
    }

    collapseMenu(parentItem, menuId) {
        parentItem.classList.remove('expanded');
        this.expandedMenus.delete(menuId);
        
        // Update ARIA attributes
        const navLink = parentItem.querySelector('.nav-link');
        if (navLink) {
            navLink.setAttribute('aria-expanded', 'false');
        }
        
        const subMenu = parentItem.querySelector('.sub-menu');
        if (subMenu) {
            subMenu.setAttribute('aria-hidden', 'true');
        }
        
        console.log(`Collapsed menu: ${menuId}`);
    }

    setActiveItem(navLink) {
        // Remove active class from all nav links
        this.sidebar.querySelectorAll('.nav-link.active').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        
        // Add active class to selected item
        navLink.classList.add('active');
        navLink.setAttribute('aria-current', 'page');
        
        this.activeItem = navLink.getAttribute('data-item-id') || navLink.textContent.trim();
        
        // Save state
        this.saveState();
        
        console.log(`Active item set to: ${this.activeItem}`);
    }

    handleSubMenuClick(subLink) {
        const itemId = subLink.getAttribute('data-item-id');
        const href = subLink.getAttribute('href');
        
        // Dispatch custom event for content loading
        const event = new CustomEvent('sidebarItemClick', {
            detail: {
                itemId: itemId,
                href: href,
                element: subLink,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    initializeMobileNavigation() {
        // Create mobile overlay
        this.createMobileOverlay();
        
        // Mobile menu toggle button
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }
        
        // Close on overlay click
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileOpen()) {
                this.closeMobileSidebar();
            }
        });
    }

    createMobileOverlay() {
        this.mobileOverlay = document.createElement('div');
        this.mobileOverlay.className = 'sidebar-mobile-overlay';
        this.mobileOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: var(--z-modal-backdrop);
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-normal);
        `;
        
        document.body.appendChild(this.mobileOverlay);
    }

    toggleMobileSidebar() {
        if (this.isMobileOpen()) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }

    openMobileSidebar() {
        this.sidebar.classList.add('mobile-open');
        this.mobileOverlay.style.opacity = '1';
        this.mobileOverlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        const firstFocusable = this.sidebar.querySelector('.nav-link');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    closeMobileSidebar() {
        this.sidebar.classList.remove('mobile-open');
        this.mobileOverlay.style.opacity = '0';
        this.mobileOverlay.style.visibility = 'hidden';
        document.body.style.overflow = '';
    }

    isMobileOpen() {
        return this.sidebar.classList.contains('mobile-open');
    }

    setupResponsiveBehavior() {
        const checkMobile = () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 1024;
            
            // Close mobile sidebar when switching to desktop
            if (wasMobile && !this.isMobile && this.isMobileOpen()) {
                this.closeMobileSidebar();
            }
        };
        
        // Check on load
        checkMobile();
        
        // Check on resize
        window.addEventListener('resize', checkMobile);
    }

    saveState() {
        const state = {
            activeItem: this.activeItem,
            expandedMenus: Array.from(this.expandedMenus)
        };
        
        localStorage.setItem('hr-sidebar-state', JSON.stringify(state));
    }

    loadSavedState() {
        try {
            const savedState = localStorage.getItem('hr-sidebar-state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore expanded menus
                if (state.expandedMenus) {
                    state.expandedMenus.forEach(menuId => {
                        const parentItem = this.findParentItemByMenuId(menuId);
                        if (parentItem) {
                            this.expandMenu(parentItem, menuId);
                        }
                    });
                }
                
                // Restore active item
                if (state.activeItem) {
                    const activeLink = this.findNavLinkByItemId(state.activeItem);
                    if (activeLink) {
                        this.setActiveItem(activeLink);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load sidebar state:', error);
        }
    }

    findParentItemByMenuId(menuId) {
        return this.sidebar.querySelector(`[data-menu-id="${menuId}"]`) ||
               Array.from(this.sidebar.querySelectorAll('.nav-item.has-children')).find(item => {
                   const navLink = item.querySelector('.nav-link');
                   return navLink && navLink.textContent.trim() === menuId;
               });
    }

    findNavLinkByItemId(itemId) {
        return this.sidebar.querySelector(`[data-item-id="${itemId}"]`) ||
               Array.from(this.sidebar.querySelectorAll('.nav-link')).find(link => {
                   return link.textContent.trim() === itemId;
               });
    }

    // Public API methods
    expandMenuById(menuId) {
        const parentItem = this.findParentItemByMenuId(menuId);
        if (parentItem) {
            this.expandMenu(parentItem, menuId);
        }
    }

    collapseMenuById(menuId) {
        const parentItem = this.findParentItemByMenuId(menuId);
        if (parentItem) {
            this.collapseMenu(parentItem, menuId);
        }
    }

    setActiveItemById(itemId) {
        const navLink = this.findNavLinkByItemId(itemId);
        if (navLink) {
            this.setActiveItem(navLink);
        }
    }

    getActiveItem() {
        return this.activeItem;
    }

    getExpandedMenus() {
        return Array.from(this.expandedMenus);
    }

    clearState() {
        localStorage.removeItem('hr-sidebar-state');
        this.activeItem = null;
        this.expandedMenus.clear();
        
        // Reset UI
        this.sidebar.querySelectorAll('.nav-link.active').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        
        this.sidebar.querySelectorAll('.nav-item.has-children.expanded').forEach(item => {
            const menuId = item.getAttribute('data-menu-id') || item.querySelector('.nav-link').textContent.trim();
            this.collapseMenu(item, menuId);
        });
    }
}

/* ==========================================================================
   Auto-initialization
   ========================================================================== */
let sidebarManager;

function initializeSidebarManager() {
    if (!sidebarManager && document.querySelector('.app-sidebar')) {
        sidebarManager = new EnhancedSidebarManager();
        
        // Make it globally accessible
        window.sidebarManager = sidebarManager;
    }
    
    return sidebarManager;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSidebarManager);
} else {
    initializeSidebarManager();
}

/* ==========================================================================
   Export for module systems
   ========================================================================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSidebarManager;
}

if (typeof window !== 'undefined') {
    window.EnhancedSidebarManager = EnhancedSidebarManager;
}