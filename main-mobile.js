/* Mobile Dashboard JavaScript */
/* ============================ */

// Mobile Dashboard Configuration
const MOBILE_DASHBOARD_CONFIG = {
    SWIPE_THRESHOLD: 50,
    MENU_CLOSE_DELAY: 300,
    TOUCH_FEEDBACK: true,
    AUTO_HIDE_MENU: true,
    REFRESH_INTERVAL: 30000 // 30 seconds
};

// Mobile Dashboard Utils
const MobileDashboardUtils = {
    // Initialize mobile dashboard
    init() {
        this.setupMobileMenu();
        this.setupSwipeGestures();
        this.setupTouchFeedback();
        this.setupRefreshMechanism();
        this.optimizeMobileViewport();
        this.handleOrientationChange();
        console.log('Mobile dashboard initialized');
    },

    // Setup mobile menu functionality
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.querySelector('.mobile-sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        const menuLinks = document.querySelectorAll('.mobile-menu-link, .mobile-submenu-link');

        if (!menuToggle || !sidebar || !overlay) return;

        // Toggle menu
        const toggleMenu = (show) => {
            if (show) {
                sidebar.classList.add('show');
                overlay.classList.add('show');
                menuToggle.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Add haptic feedback
                if (navigator.vibrate && MOBILE_DASHBOARD_CONFIG.TOUCH_FEEDBACK) {
                    navigator.vibrate(10);
                }
            } else {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        // Menu toggle click
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isMenuOpen = sidebar.classList.contains('show');
            toggleMenu(!isMenuOpen);
        });

        // Overlay click to close
        overlay.addEventListener('click', () => {
            toggleMenu(false);
        });

        // Close menu when menu item is clicked
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (MOBILE_DASHBOARD_CONFIG.AUTO_HIDE_MENU) {
                    setTimeout(() => toggleMenu(false), MOBILE_DASHBOARD_CONFIG.MENU_CLOSE_DELAY);
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('show')) {
                toggleMenu(false);
            }
        });

        // Prevent body scroll when menu is open
        sidebar.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    },

    // Setup swipe gestures
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        const sidebar = document.querySelector('.mobile-sidebar');
        if (!sidebar) return;

        // Swipe to open menu from left edge
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = Math.abs(endY - startY);
            
            // Swipe right from left edge to open menu
            if (startX < 20 && deltaX > MOBILE_DASHBOARD_CONFIG.SWIPE_THRESHOLD && deltaY < 100) {
                if (!sidebar.classList.contains('show')) {
                    sidebar.classList.add('show');
                    document.querySelector('.mobile-overlay').classList.add('show');
                    document.getElementById('menuToggle').classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
            
            // Swipe left to close menu
            if (sidebar.classList.contains('show') && deltaX < -MOBILE_DASHBOARD_CONFIG.SWIPE_THRESHOLD && deltaY < 100) {
                sidebar.classList.remove('show');
                document.querySelector('.mobile-overlay').classList.remove('show');
                document.getElementById('menuToggle').classList.remove('active');
                document.body.style.overflow = '';
            }
        }, { passive: true });

        // Swipe down to refresh content
        let refreshStartY = 0;
        let refreshing = false;

        const contentArea = document.querySelector('.mobile-content-area');
        if (contentArea) {
            contentArea.addEventListener('touchstart', (e) => {
                refreshStartY = e.touches[0].clientY;
            }, { passive: true });

            contentArea.addEventListener('touchmove', (e) => {
                if (refreshing) return;
                
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - refreshStartY;
                
                // Pull to refresh gesture
                if (deltaY > 100 && contentArea.scrollTop === 0) {
                    this.showRefreshIndicator();
                }
            }, { passive: true });

            contentArea.addEventListener('touchend', (e) => {
                if (refreshing) return;
                
                const endY = e.changedTouches[0].clientY;
                const deltaY = endY - refreshStartY;
                
                if (deltaY > 100 && contentArea.scrollTop === 0) {
                    this.refreshDashboard();
                }
            }, { passive: true });
        }
    },

    // Setup touch feedback
    setupTouchFeedback() {
        const touchElements = document.querySelectorAll('.mobile-menu-link, .mobile-submenu-link, .mobile-stat-card');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.style.transform = 'scale(0.95)';
                element.style.opacity = '0.8';
                
                if (navigator.vibrate && MOBILE_DASHBOARD_CONFIG.TOUCH_FEEDBACK) {
                    navigator.vibrate(10);
                }
            }, { passive: true });

            element.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.opacity = '';
                }, 150);
            }, { passive: true });

            element.addEventListener('touchcancel', (e) => {
                element.style.transform = '';
                element.style.opacity = '';
            }, { passive: true });
        });
    },

    // Setup refresh mechanism
    setupRefreshMechanism() {
        // Auto-refresh dashboard data
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshStats();
            }
        }, MOBILE_DASHBOARD_CONFIG.REFRESH_INTERVAL);

        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshStats();
            }
        });
    },

    // Show refresh indicator
    showRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'mobile-refresh-indicator';
        indicator.innerHTML = `
            <div class="refresh-spinner"></div>
            <span>Thả để làm mới</span>
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    },

    // Refresh dashboard data
    async refreshDashboard() {
        const refreshing = true;
        
        try {
            // Show loading state
            this.showMobileLoading('Đang làm mới...');
            
            // Refresh stats
            await this.refreshStats();
            
            // Show success notification
            this.showMobileNotification('Dữ liệu đã được cập nhật', 'success');
            
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            this.showMobileNotification('Không thể làm mới dữ liệu', 'error');
        } finally {
            this.hideMobileLoading();
            refreshing = false;
        }
    },

    // Refresh stats
    async refreshStats() {
        try {
            // Clear API cache to force fresh data
            if (window.API_CACHE) {
                window.API_CACHE.clear();
            }
            
            // Reload dashboard stats if function exists
            if (window.ContentManager && window.ContentManager.loadDashboardStats) {
                await window.ContentManager.loadDashboardStats();
            }
            
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        }
    },

    // Optimize mobile viewport
    optimizeMobileViewport() {
        // Prevent zoom on orientation change
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }

        // Optimize body height for mobile browsers
        const updateViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        updateViewportHeight();
        window.addEventListener('resize', updateViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateViewportHeight, 100);
        });
    },

    // Handle orientation changes
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Close menu on orientation change
            const sidebar = document.querySelector('.mobile-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            const menuToggle = document.getElementById('menuToggle');
            
            if (sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }

            // Refresh layout after orientation change
            setTimeout(() => {
                this.optimizeMobileStats();
            }, 300);
        });
    },

    // Optimize mobile stats layout
    optimizeMobileStats() {
        const statsGrid = document.querySelector('.mobile-stats');
        if (!statsGrid) return;

        const screenWidth = window.innerWidth;
        
        // Adjust grid layout based on screen size
        if (screenWidth <= 360) {
            statsGrid.style.gridTemplateColumns = '1fr';
        } else if (screenWidth <= 480) {
            statsGrid.style.gridTemplateColumns = '1fr 1fr';
        } else {
            statsGrid.style.gridTemplateColumns = '1fr 1fr';
        }
    },

    // Show mobile loading
    showMobileLoading(text = 'Đang tải...') {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            const loadingText = loading.querySelector('.mobile-loading-text');
            if (loadingText) {
                loadingText.textContent = text;
            }
            loading.classList.remove('hidden');
        }
    },

    // Hide mobile loading
    hideMobileLoading() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.add('hidden');
        }
    },

    // Show mobile notification
    showMobileNotification(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification mobile-notification ${type}`;
        notification.classList.add('show');
        
        // Add haptic feedback for important notifications
        if ((type === 'error' || type === 'success') && navigator.vibrate && MOBILE_DASHBOARD_CONFIG.TOUCH_FEEDBACK) {
            navigator.vibrate(type === 'error' ? [100, 50, 100] : [200]);
        }
        
        // Auto-hide notification
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);

        // Swipe to dismiss
        this.setupNotificationSwipe(notification);
    },

    // Setup notification swipe to dismiss
    setupNotificationSwipe(notification) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        notification.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            notification.style.transition = 'none';
        }, { passive: true });

        notification.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY < 0) { // Swiping up
                notification.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });

        notification.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const deltaY = currentY - startY;
            isDragging = false;
            notification.style.transition = '';
            
            if (deltaY < -30) { // Swipe up threshold
                notification.classList.remove('show');
            } else {
                notification.style.transform = '';
            }
        }, { passive: true });
    },

    // Handle offline/online states
    handleNetworkState() {
        window.addEventListener('online', () => {
            this.showMobileNotification('Đã kết nối lại internet', 'success');
            this.refreshDashboard();
        });

        window.addEventListener('offline', () => {
            this.showMobileNotification('Mất kết nối internet', 'warning', 5000);
        });
    }
};

// Initialize mobile dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is mobile environment
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && document.body.classList.contains('mobile-dashboard')) {
        MobileDashboardUtils.init();
        MobileDashboardUtils.handleNetworkState();
        
        // Add mobile-specific CSS class
        document.body.classList.add('mobile-optimized');
        
        console.log('Mobile dashboard fully initialized');
    }
});

// Export for global access
window.MobileDashboardUtils = MobileDashboardUtils;

// Add mobile-specific CSS for refresh indicator
const mobileRefreshCSS = `
    .mobile-refresh-indicator {
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(37, 99, 235, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 10004;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        animation: slideInDown 0.3s ease;
    }
    
    .refresh-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    /* Mobile viewport height fix */
    .mobile-dashboard {
        height: calc(var(--vh, 1vh) * 100);
    }
    
    .mobile-content {
        min-height: calc(var(--vh, 1vh) * 100 - 60px);
    }
`;

// Inject mobile-specific CSS
const mobileStyle = document.createElement('style');
mobileStyle.textContent = mobileRefreshCSS;
document.head.appendChild(mobileStyle);