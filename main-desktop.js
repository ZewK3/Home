/* Desktop Dashboard JavaScript */
/* ============================= */

// Desktop Dashboard Configuration
const DESKTOP_DASHBOARD_CONFIG = {
    ANIMATION_DURATION: 300,
    HOVER_DELAY: 100,
    KEYBOARD_SHORTCUTS: true,
    AUTO_REFRESH: true,
    REFRESH_INTERVAL: 60000, // 60 seconds
    CHART_ANIMATIONS: true
};

// Desktop Dashboard Utils
const DesktopDashboardUtils = {
    // Initialize desktop dashboard
    init() {
        this.setupDesktopMenu();
        this.setupKeyboardShortcuts();
        this.setupHoverEffects();
        this.setupDesktopNotifications();
        this.setupAutoRefresh();
        this.setupWindowManagement();
        this.enhanceDesktopAccessibility();
        console.log('Desktop dashboard initialized');
    },

    // Setup desktop menu functionality
    setupDesktopMenu() {
        const menuItems = document.querySelectorAll('.desktop-menu-item');
        const submenuLinks = document.querySelectorAll('.desktop-submenu-link');
        
        // Enhanced menu item interactions
        menuItems.forEach(item => {
            const menuLink = item.querySelector('.desktop-menu-link');
            const submenu = item.querySelector('.desktop-submenu');
            
            if (menuLink && submenu) {
                // Smooth submenu expand/collapse
                menuLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const isExpanded = submenu.style.maxHeight && submenu.style.maxHeight !== '0px';
                    
                    // Close other submenus
                    document.querySelectorAll('.desktop-submenu').forEach(otherSubmenu => {
                        if (otherSubmenu !== submenu) {
                            otherSubmenu.style.maxHeight = '0px';
                            otherSubmenu.style.opacity = '0';
                        }
                    });
                    
                    if (isExpanded) {
                        submenu.style.maxHeight = '0px';
                        submenu.style.opacity = '0';
                    } else {
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                        submenu.style.opacity = '1';
                    }
                });
            }
        });

        // Active state management
        submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active class from all links
                document.querySelectorAll('.desktop-menu-link, .desktop-submenu-link').forEach(l => {
                    l.classList.remove('active');
                });
                
                // Add active class to clicked link and parent
                link.classList.add('active');
                const parentMenuLink = link.closest('.desktop-menu-item').querySelector('.desktop-menu-link');
                if (parentMenuLink) {
                    parentMenuLink.classList.add('active');
                }
            });
        });
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        if (!DESKTOP_DASHBOARD_CONFIG.KEYBOARD_SHORTCUTS) return;

        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshDashboard();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                        break;
                    case '/':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                }
            }

            // Alt + number shortcuts for menu navigation
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const menuIndex = parseInt(e.key) - 1;
                const menuLinks = document.querySelectorAll('.desktop-menu-link');
                if (menuLinks[menuIndex]) {
                    menuLinks[menuIndex].click();
                    menuLinks[menuIndex].focus();
                }
            }

            // Escape key handling
            if (e.key === 'Escape') {
                // Close any open notifications
                const notification = document.getElementById('notification');
                if (notification && notification.classList.contains('show')) {
                    notification.classList.remove('show');
                }
                
                // Clear focus
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
            }

            // F5 for refresh
            if (e.key === 'F5') {
                e.preventDefault();
                this.refreshDashboard();
            }
        });

        // Show keyboard navigation indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    // Setup hover effects
    setupHoverEffects() {
        const statCards = document.querySelectorAll('.desktop-stat-card');
        const menuLinks = document.querySelectorAll('.desktop-menu-link, .desktop-submenu-link');

        // Enhanced stat card hover effects
        statCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                // Add glow effect
                card.style.boxShadow = 'var(--shadow-glow)';
                
                // Animate icon
                const icon = card.querySelector('.material-icons-round');
                if (icon) {
                    icon.style.transform = 'rotate(5deg) scale(1.1)';
                }
                
                // Show additional info if available
                this.showCardTooltip(card, e);
            });

            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
                
                const icon = card.querySelector('.material-icons-round');
                if (icon) {
                    icon.style.transform = '';
                }
                
                this.hideCardTooltip();
            });

            // Click animation
            card.addEventListener('click', (e) => {
                const ripple = this.createRippleEffect(e, card);
                card.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Enhanced menu link hover effects
        menuLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.willChange = 'transform';
            });

            link.addEventListener('mouseleave', () => {
                link.style.willChange = 'auto';
            });
        });
    },

    // Setup desktop notifications
    setupDesktopNotifications() {
        const notification = document.getElementById('notification');
        if (!notification) return;

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
        });

        // Auto-position based on available space
        const positionNotification = () => {
            const rect = notification.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            if (rect.right > viewportWidth) {
                notification.style.right = '1rem';
                notification.style.left = 'auto';
            }
            
            if (rect.bottom > viewportHeight) {
                notification.style.bottom = '1rem';
                notification.style.top = 'auto';
            }
        };

        // Observe notification changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (notification.classList.contains('show')) {
                        setTimeout(positionNotification, 50);
                    }
                }
            });
        });

        observer.observe(notification, { attributes: true });
        window.addEventListener('resize', positionNotification);
    },

    // Setup auto refresh
    setupAutoRefresh() {
        if (!DESKTOP_DASHBOARD_CONFIG.AUTO_REFRESH) return;

        // Auto-refresh dashboard data
        setInterval(() => {
            if (document.visibilityState === 'visible' && !document.hidden) {
                this.refreshStats();
            }
        }, DESKTOP_DASHBOARD_CONFIG.REFRESH_INTERVAL);

        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshStats();
            }
        });

        // Refresh on window focus
        window.addEventListener('focus', () => {
            this.refreshStats();
        });
    },

    // Setup window management
    setupWindowManagement() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 250);
        });

        // Handle window focus/blur
        window.addEventListener('focus', () => {
            document.body.classList.add('window-focused');
            this.resumeAnimations();
        });

        window.addEventListener('blur', () => {
            document.body.classList.remove('window-focused');
            this.pauseAnimations();
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.resumeAnimations();
            } else {
                this.pauseAnimations();
            }
        });
    },

    // Handle window resize
    handleWindowResize() {
        const sidebar = document.querySelector('.desktop-sidebar');
        const content = document.querySelector('.desktop-content');
        
        if (window.innerWidth < 1024 && sidebar && content) {
            // Switch to mobile layout if window becomes too small
            if (window.innerWidth <= 768) {
                window.location.href = 'dashboard-mobile.html';
            }
        }
        
        // Reposition notifications
        const notification = document.getElementById('notification');
        if (notification && notification.classList.contains('show')) {
            this.repositionNotification(notification);
        }
    },

    // Enhance desktop accessibility
    enhanceDesktopAccessibility() {
        // Add focus indicators
        const focusableElements = document.querySelectorAll('.desktop-menu-link, .desktop-submenu-link, .desktop-stat-card');
        
        focusableElements.forEach(element => {
            element.setAttribute('tabindex', '0');
            
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--primary)';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });

        // Add ARIA labels
        const menuItems = document.querySelectorAll('.desktop-menu-item');
        menuItems.forEach((item, index) => {
            const link = item.querySelector('.desktop-menu-link');
            if (link) {
                link.setAttribute('aria-label', `Menu item ${index + 1}: ${link.textContent.trim()}`);
            }
        });

        // Add role attributes
        const sidebar = document.querySelector('.desktop-sidebar');
        if (sidebar) {
            sidebar.setAttribute('role', 'navigation');
            sidebar.setAttribute('aria-label', 'Main navigation');
        }

        const mainContent = document.querySelector('.desktop-content');
        if (mainContent) {
            mainContent.setAttribute('role', 'main');
            mainContent.setAttribute('aria-label', 'Dashboard content');
        }
    },

    // Refresh dashboard
    async refreshDashboard() {
        try {
            this.showDesktopLoading('Đang làm mới dữ liệu...');
            
            // Clear API cache
            if (window.API_CACHE) {
                window.API_CACHE.clear();
            }
            
            // Refresh stats
            await this.refreshStats();
            
            this.showDesktopNotification('Dữ liệu đã được cập nhật', 'success');
            
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            this.showDesktopNotification('Không thể làm mới dữ liệu', 'error');
        } finally {
            this.hideDesktopLoading();
        }
    },

    // Refresh stats
    async refreshStats() {
        try {
            if (window.ContentManager && window.ContentManager.loadDashboardStats) {
                await window.ContentManager.loadDashboardStats();
            }
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        }
    },

    // Show desktop loading
    showDesktopLoading(text = 'Đang tải...') {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            const loadingText = loading.querySelector('.desktop-loading-text');
            if (loadingText) {
                loadingText.textContent = text;
            }
            loading.classList.remove('hidden');
        }
    },

    // Hide desktop loading
    hideDesktopLoading() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.add('hidden');
        }
    },

    // Show desktop notification
    showDesktopNotification(message, type = 'info', duration = 5000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification desktop-notification ${type}`;
        notification.classList.add('show');
        
        // Auto-hide notification
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    },

    // Create ripple effect
    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(37, 99, 235, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
        `;
        
        return ripple;
    },

    // Show card tooltip
    showCardTooltip(card, event) {
        const tooltip = document.createElement('div');
        tooltip.className = 'desktop-card-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>Thông tin chi tiết</strong>
                <p>Click để xem thêm thông tin</p>
            </div>
        `;
        
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.75rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-size: 0.875rem;
            max-width: 200px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = card.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';
        
        // Animate in
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 10);
        
        this.currentTooltip = tooltip;
    },

    // Hide card tooltip
    hideCardTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.opacity = '0';
            this.currentTooltip.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 300);
        }
    },

    // Show keyboard shortcuts
    showKeyboardShortcuts() {
        const shortcuts = {
            'Ctrl+R / F5': 'Làm mới dữ liệu',
            'Ctrl+H': 'Hiển thị phím tắt',
            'Alt+1-9': 'Chuyển đến mục menu',
            'Tab': 'Điều hướng bằng bàn phím',
            'Esc': 'Đóng thông báo'
        };
        
        let shortcutsList = '<ul>';
        for (const [key, description] of Object.entries(shortcuts)) {
            shortcutsList += `<li><kbd>${key}</kbd> - ${description}</li>`;
        }
        shortcutsList += '</ul>';
        
        this.showDesktopNotification(`Phím tắt: ${shortcutsList}`, 'info', 10000);
    },

    // Focus search (if exists)
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    },

    // Reposition notification
    repositionNotification(notification) {
        const rect = notification.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (rect.right > viewportWidth) {
            notification.style.right = '1rem';
            notification.style.left = 'auto';
        }
        
        if (rect.bottom > viewportHeight) {
            notification.style.bottom = '1rem';
            notification.style.top = 'auto';
        }
    },

    // Pause animations for performance
    pauseAnimations() {
        document.body.classList.add('animations-paused');
    },

    // Resume animations
    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }
};

// Initialize desktop dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is desktop environment
    const isDesktop = window.innerWidth > 768 && !('ontouchstart' in window);
    
    if (isDesktop && document.body.classList.contains('desktop-dashboard')) {
        DesktopDashboardUtils.init();
        
        // Add desktop-specific CSS class
        document.body.classList.add('desktop-optimized');
        
        console.log('Desktop dashboard fully initialized');
    }
});

// Export for global access
window.DesktopDashboardUtils = DesktopDashboardUtils;

// Add desktop-specific CSS for tooltips and animations
const desktopEnhancementCSS = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .desktop-card-tooltip {
        z-index: 1000;
    }
    
    .desktop-card-tooltip .tooltip-content {
        color: var(--text-primary);
    }
    
    .desktop-card-tooltip .tooltip-content strong {
        display: block;
        margin-bottom: 0.25rem;
        color: var(--primary);
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid var(--primary) !important;
        outline-offset: 2px !important;
    }
    
    .animations-paused * {
        animation-play-state: paused !important;
        transition: none !important;
    }
    
    kbd {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: monospace;
        font-size: 0.875rem;
        margin: 0 0.25rem;
    }
    
    .desktop-notification ul {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
    }
    
    .desktop-notification li {
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

// Inject desktop-specific CSS
const desktopStyle = document.createElement('style');
desktopStyle.textContent = desktopEnhancementCSS;
document.head.appendChild(desktopStyle);