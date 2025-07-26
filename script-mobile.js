/* Mobile-Specific JavaScript */
/* ========================== */

// Mobile-specific configurations
const MOBILE_CONFIG = {
    TOUCH_DELAY: 300,
    SWIPE_THRESHOLD: 50,
    HAPTIC_FEEDBACK: true,
    PREVENT_ZOOM: true,
    ORIENTATION_LOCK: false
};

// Mobile utilities
const MobileUtils = {
    // Detect if device is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    },

    // Prevent zoom on input focus (iOS Safari)
    preventZoom() {
        if (MOBILE_CONFIG.PREVENT_ZOOM && this.isMobile()) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
            }
        }
    },

    // Add touch feedback
    addTouchFeedback(element) {
        if (!element) return;

        element.addEventListener('touchstart', (e) => {
            element.style.transform = 'scale(0.95)';
            element.style.opacity = '0.8';
            
            // Haptic feedback (if supported)
            if (MOBILE_CONFIG.HAPTIC_FEEDBACK && navigator.vibrate) {
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
    },

    // Enhanced tap handling
    addTapHandler(element, callback) {
        if (!element || typeof callback !== 'function') return;

        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };

        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            if (touchDuration < MOBILE_CONFIG.TOUCH_DELAY) {
                const touch = e.changedTouches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                const deltaY = Math.abs(touch.clientY - touchStartPos.y);
                
                // Check if it's a tap (not a swipe)
                if (deltaX < MOBILE_CONFIG.SWIPE_THRESHOLD && deltaY < MOBILE_CONFIG.SWIPE_THRESHOLD) {
                    e.preventDefault();
                    callback(e);
                }
            }
        }, { passive: false });
    },

    // Virtual keyboard handling
    handleVirtualKeyboard() {
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const diff = initialViewportHeight - currentHeight;
            
            // If height difference is significant, virtual keyboard is likely open
            if (diff > 150) {
                document.body.classList.add('keyboard-open');
                // Scroll active input into view
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'INPUT') {
                    setTimeout(() => {
                        activeElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                }
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
    },

    // Optimize form interactions for mobile
    optimizeFormInputs() {
        const inputs = document.querySelectorAll('.mobile-input input, .mobile-input select');
        
        inputs.forEach(input => {
            // Prevent zoom on focus for iOS
            if (this.isMobile() && input.type !== 'file') {
                input.addEventListener('focus', (e) => {
                    // Ensure minimum font size to prevent zoom
                    if (window.getComputedStyle(input).fontSize === '16px') {
                        input.style.fontSize = '16px';
                    }
                });
            }

            // Enhanced touch feedback for inputs
            this.addTouchFeedback(input);

            // Auto-scroll to input when focused
            input.addEventListener('focus', (e) => {
                setTimeout(() => {
                    e.target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 100);
            });
        });
    },

    // Enhanced button interactions
    optimizeButtons() {
        const buttons = document.querySelectorAll('.mobile-btn, .mobile-btn-outline, .mobile-toggle');
        
        buttons.forEach(button => {
            this.addTouchFeedback(button);
            
            // Prevent double-tap zoom
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    },

    // Optimize notifications for mobile
    optimizeNotifications() {
        const notification = document.getElementById('notification');
        if (!notification) return;

        // Add swipe to dismiss
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
            
            if (deltaY < -50) { // Swipe up threshold
                notification.classList.remove('show');
            } else {
                notification.style.transform = '';
            }
        }, { passive: true });
    },

    // Handle orientation changes
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Delay to ensure orientation change is complete
            setTimeout(() => {
                // Refresh viewport
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    const content = viewport.getAttribute('content');
                    viewport.setAttribute('content', content);
                }
                
                // Re-center active element if any
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'INPUT') {
                    activeElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 500);
        });
    },

    // Enhanced accessibility for mobile
    enhanceAccessibility() {
        // Increase touch targets
        const touchTargets = document.querySelectorAll('.mobile-link, .mobile-toggle, .mobile-checkmark');
        touchTargets.forEach(target => {
            const computedStyle = window.getComputedStyle(target);
            const width = parseInt(computedStyle.width);
            const height = parseInt(computedStyle.height);
            
            // Ensure minimum 44px touch target (Apple guidelines)
            if (width < 44 || height < 44) {
                target.style.minWidth = '44px';
                target.style.minHeight = '44px';
                target.style.display = 'inline-flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
            }
        });

        // Add aria labels for better screen reader support
        const passwordToggles = document.querySelectorAll('.mobile-toggle');
        passwordToggles.forEach(toggle => {
            toggle.setAttribute('aria-label', 'Toggle password visibility');
            toggle.setAttribute('role', 'button');
        });
    },

    // Performance optimizations for mobile
    optimizePerformance() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            document.body.classList.add('reduced-motion');
        }

        // Optimize touch event handling
        const passiveEvents = ['touchstart', 'touchmove', 'wheel'];
        passiveEvents.forEach(eventName => {
            document.addEventListener(eventName, () => {}, { passive: true });
        });

        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Handle resize-dependent operations
                this.handleVirtualKeyboard();
            }, 250);
        });
    }
};

// Initialize mobile optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (MobileUtils.isMobile()) {
        console.log('Initializing mobile optimizations...');
        
        // Initialize all mobile optimizations
        MobileUtils.preventZoom();
        MobileUtils.handleVirtualKeyboard();
        MobileUtils.optimizeFormInputs();
        MobileUtils.optimizeButtons();
        MobileUtils.optimizeNotifications();
        MobileUtils.handleOrientationChange();
        MobileUtils.enhanceAccessibility();
        MobileUtils.optimizePerformance();
        
        // Add mobile class to body
        document.body.classList.add('mobile-optimized');
        
        console.log('Mobile optimizations initialized successfully');
    }
});

// Mobile-specific form enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Enhanced mobile form validation
    const forms = document.querySelectorAll('.mobile-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // Add loading state to submit button
            const submitBtn = form.querySelector('.mobile-btn[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
        
        // Auto-advance to next field on mobile
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && index < inputs.length - 1) {
                    e.preventDefault();
                    inputs[index + 1].focus();
                }
            });
        });
    });
});

// Mobile-specific notification handling
function showMobileNotification(message, type = 'info', duration = 4000) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification mobile-notification ${type}`;
    notification.classList.add('show');
    
    // Add haptic feedback for errors
    if (type === 'error' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
    
    // Auto-hide notification
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Export mobile utilities for use in main script
window.MobileUtils = MobileUtils;
window.showMobileNotification = showMobileNotification;

// Mobile debug information
if (window.location.search.includes('debug=mobile')) {
    console.log('Mobile Debug Info:', {
        userAgent: navigator.userAgent,
        screenSize: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        touchSupport: 'ontouchstart' in window,
        orientation: screen.orientation ? screen.orientation.angle : 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    });
}