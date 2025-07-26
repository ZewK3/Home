/* Desktop-Specific JavaScript */
/* =========================== */

// Desktop-specific configurations
const DESKTOP_CONFIG = {
    ANIMATION_DURATION: 300,
    HOVER_DELAY: 100,
    KEYBOARD_SHORTCUTS: true,
    SMOOTH_SCROLLING: true,
    AUTO_FOCUS: true
};

// Desktop utilities
const DesktopUtils = {
    // Detect if device is desktop
    isDesktop() {
        return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) &&
               window.innerWidth > 768 && !('ontouchstart' in window);
    },

    // Enhanced hover effects
    addHoverEffects() {
        const hoverElements = document.querySelectorAll('.desktop-btn, .desktop-link, .desktop-input input, .desktop-toggle');
        
        hoverElements.forEach(element => {
            // Mouse enter effect
            element.addEventListener('mouseenter', (e) => {
                if (element.classList.contains('desktop-btn')) {
                    element.style.transform = 'translateY(-1px)';
                } else if (element.classList.contains('desktop-input') || element.tagName === 'INPUT') {
                    element.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }
            });

            // Mouse leave effect
            element.addEventListener('mouseleave', (e) => {
                if (element.classList.contains('desktop-btn')) {
                    element.style.transform = '';
                } else if (element.classList.contains('desktop-input') || element.tagName === 'INPUT') {
                    if (!element.matches(':focus')) {
                        element.style.borderColor = '';
                    }
                }
            });
        });
    },

    // Keyboard navigation enhancements
    enhanceKeyboardNavigation() {
        if (!DESKTOP_CONFIG.KEYBOARD_SHORTCUTS) return;

        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }

            // Enter key handling for buttons
            if (e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.classList.contains('desktop-btn')) {
                    e.preventDefault();
                    activeElement.click();
                }
            }

            // Escape key handling
            if (e.key === 'Escape') {
                // Clear any active focus
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
                
                // Hide notifications
                const notification = document.getElementById('notification');
                if (notification && notification.classList.contains('show')) {
                    notification.classList.remove('show');
                }
            }

            // Form shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        // Quick form submission
                        const form = document.querySelector('.form-container.active form');
                        if (form) {
                            e.preventDefault();
                            form.dispatchEvent(new Event('submit', { bubbles: true }));
                        }
                        break;
                }
            }
        });

        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    // Auto-focus management
    manageAutoFocus() {
        if (!DESKTOP_CONFIG.AUTO_FOCUS) return;

        // Focus first input when form becomes active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('form-container') && target.classList.contains('active')) {
                        const firstInput = target.querySelector('input:not([type="checkbox"]):not([type="hidden"])');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 100);
                        }
                    }
                }
            });
        });

        const formContainers = document.querySelectorAll('.form-container');
        formContainers.forEach(container => {
            observer.observe(container, { attributes: true });
        });
    },

    // Enhanced form interactions
    enhanceFormInteractions() {
        const inputs = document.querySelectorAll('.desktop-input input, .desktop-input select');
        
        inputs.forEach(input => {
            // Smooth focus transitions
            input.addEventListener('focus', (e) => {
                const inputGroup = e.target.closest('.desktop-input');
                if (inputGroup) {
                    inputGroup.style.transform = 'translateY(-1px)';
                }
            });

            input.addEventListener('blur', (e) => {
                const inputGroup = e.target.closest('.desktop-input');
                if (inputGroup) {
                    inputGroup.style.transform = '';
                }
            });

            // Auto-select text on focus for certain input types
            if (input.type === 'text' || input.type === 'email') {
                input.addEventListener('focus', (e) => {
                    if (e.target.value) {
                        setTimeout(() => e.target.select(), 50);
                    }
                });
            }

            // Smart Enter key handling
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    // Find next focusable input
                    const form = input.closest('form');
                    if (form) {
                        const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), button:not([disabled])'));
                        const currentIndex = inputs.indexOf(input);
                        
                        if (currentIndex < inputs.length - 1) {
                            inputs[currentIndex + 1].focus();
                        } else {
                            // Submit form if on last input
                            const submitBtn = form.querySelector('button[type="submit"]');
                            if (submitBtn) {
                                submitBtn.click();
                            }
                        }
                    }
                }
            });
        });
    },

    // Enhanced button interactions
    enhanceButtonInteractions() {
        const buttons = document.querySelectorAll('.desktop-btn, .desktop-btn-outline');
        
        buttons.forEach(button => {
            // Ripple effect on click
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    background-color: rgba(255, 255, 255, 0.3);
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });

            // Loading state management
            button.addEventListener('click', (e) => {
                if (button.type === 'submit') {
                    button.classList.add('loading');
                    button.disabled = true;
                    
                    // Re-enable after timeout as fallback
                    setTimeout(() => {
                        button.classList.remove('loading');
                        button.disabled = false;
                    }, 10000);
                }
            });
        });
    },

    // Smart notification positioning
    optimizeNotifications() {
        const notification = document.getElementById('notification');
        if (!notification) return;

        // Position based on available space
        const positionNotification = () => {
            const rect = notification.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Adjust position if notification goes outside viewport
            if (rect.right > viewportWidth) {
                notification.style.right = '1rem';
                notification.style.left = 'auto';
            }
            
            if (rect.bottom > viewportHeight) {
                notification.style.bottom = '1rem';
                notification.style.top = 'auto';
            }
        };

        // Observe notification visibility changes
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

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
        });

        // Auto-position on window resize
        window.addEventListener('resize', positionNotification);
    },

    // Performance optimizations for desktop
    optimizePerformance() {
        // Enable smooth scrolling
        if (DESKTOP_CONFIG.SMOOTH_SCROLLING) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }

        // Optimize animations for desktop
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        }

        // Efficient event delegation
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.desktop-btn, .desktop-link, .desktop-toggle')) {
                e.target.style.willChange = 'transform';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('.desktop-btn, .desktop-link, .desktop-toggle')) {
                e.target.style.willChange = 'auto';
            }
        });
    },

    // Enhanced accessibility for desktop
    enhanceAccessibility() {
        // Improve focus visibility
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);

        // ARIA enhancements
        const passwordToggles = document.querySelectorAll('.desktop-toggle');
        passwordToggles.forEach(toggle => {
            toggle.setAttribute('aria-label', 'Toggle password visibility');
            toggle.setAttribute('role', 'button');
            toggle.setAttribute('tabindex', '0');
        });

        // Form validation announcements
        const forms = document.querySelectorAll('.desktop-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const invalidFields = form.querySelectorAll(':invalid');
                if (invalidFields.length > 0) {
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.setAttribute('aria-atomic', 'true');
                    announcement.style.position = 'absolute';
                    announcement.style.left = '-10000px';
                    announcement.textContent = `Form has ${invalidFields.length} invalid field${invalidFields.length > 1 ? 's' : ''}`;
                    document.body.appendChild(announcement);
                    
                    setTimeout(() => announcement.remove(), 1000);
                }
            });
        });
    },

    // Context menu enhancements
    enhanceContextMenu() {
        // Custom right-click handling for form elements
        const formElements = document.querySelectorAll('.desktop-input input, .desktop-input select');
        
        formElements.forEach(element => {
            element.addEventListener('contextmenu', (e) => {
                // Allow default context menu but add custom styling
                setTimeout(() => {
                    element.focus();
                }, 10);
            });
        });
    },

    // Window management
    manageWindow() {
        // Handle window focus/blur
        window.addEventListener('focus', () => {
            document.body.classList.add('window-focused');
        });

        window.addEventListener('blur', () => {
            document.body.classList.remove('window-focused');
        });

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Re-focus last active element if appropriate
                const lastActive = document.querySelector('input:focus, button:focus');
                if (lastActive) {
                    lastActive.focus();
                }
            }
        });
    }
};

// Initialize desktop optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (DesktopUtils.isDesktop()) {
        console.log('Initializing desktop optimizations...');
        
        // Initialize all desktop optimizations
        DesktopUtils.addHoverEffects();
        DesktopUtils.enhanceKeyboardNavigation();
        DesktopUtils.manageAutoFocus();
        DesktopUtils.enhanceFormInteractions();
        DesktopUtils.enhanceButtonInteractions();
        DesktopUtils.optimizeNotifications();
        DesktopUtils.optimizePerformance();
        DesktopUtils.enhanceAccessibility();
        DesktopUtils.enhanceContextMenu();
        DesktopUtils.manageWindow();
        
        // Add desktop class to body
        document.body.classList.add('desktop-optimized');
        
        console.log('Desktop optimizations initialized successfully');
    }
});

// Desktop-specific notification handling
function showDesktopNotification(message, type = 'info', duration = 5000) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification desktop-notification ${type}`;
    notification.classList.add('show');
    
    // Auto-hide notification
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
    
    // Add click to dismiss hint
    notification.title = 'Click to dismiss';
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Export desktop utilities for use in main script
window.DesktopUtils = DesktopUtils;
window.showDesktopNotification = showDesktopNotification;

// Desktop debug information
if (window.location.search.includes('debug=desktop')) {
    console.log('Desktop Debug Info:', {
        userAgent: navigator.userAgent,
        screenSize: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        mouseSupport: !('ontouchstart' in window),
        keyboardSupport: true,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    });
}