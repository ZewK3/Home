/**
 * Enhanced Landing Page JavaScript
 * Modern interactive effects and animations
 */

class EnhancedLanding {
    constructor() {
        this.init();
    }

    init() {
        this.animateCounters();
        this.setupIntersectionObserver();
        this.setupTiltEffect();
        this.setupScrollAnimations();
        this.initializeParallax();
        this.setupChatToggle();
        console.log('Enhanced landing page initialized');
    }

    // Animate counter numbers
    animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }

    // Setup intersection observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observe feature cards
        const featureCards = document.querySelectorAll('.interactive-card');
        featureCards.forEach((card, index) => {
            card.classList.add('animate-on-scroll');
            card.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(card);
        });

        // Observe other elements
        const animateElements = document.querySelectorAll('.hero-stats, .testimonial-content');
        animateElements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    }

    // Setup tilt effect for cards
    setupTiltEffect() {
        const tiltCards = document.querySelectorAll('[data-tilt]');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', this.handleTilt.bind(this));
            card.addEventListener('mouseleave', this.resetTilt.bind(this));
        });
    }

    handleTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    resetTilt(e) {
        const card = e.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }

    // Setup scroll-based animations
    setupScrollAnimations() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-element');
        
        parallaxElements.forEach((element, index) => {
            const speed = element.dataset.speed || 1;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    // Initialize parallax effects
    initializeParallax() {
        const parallaxElements = document.querySelectorAll('.floating-element');
        
        parallaxElements.forEach((element, index) => {
            // Random positioning
            element.style.left = Math.random() * 80 + 10 + '%';
            element.style.top = Math.random() * 80 + 10 + '%';
            
            // Random size
            const size = Math.random() * 40 + 20;
            element.style.width = size + 'px';
            element.style.height = size + 'px';
            
            // Random animation delay
            element.style.animationDelay = Math.random() * 6 + 's';
        });
    }

    // Setup modern chat toggle functionality
    setupChatToggle() {
        const chatToggle = document.getElementById('chatToggle');
        const chatPanel = document.getElementById('chatPanel');
        const closeChat = document.getElementById('closeChat');
        const chatTabs = document.querySelectorAll('.chat-tab');
        const chatViews = document.querySelectorAll('.chat-view');

        if (chatToggle && chatPanel) {
            chatToggle.addEventListener('click', () => {
                chatPanel.classList.toggle('active');
            });
        }

        if (closeChat) {
            closeChat.addEventListener('click', () => {
                chatPanel.classList.remove('active');
            });
        }

        // Chat tab switching
        chatTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const chatType = tab.dataset.chatType;
                
                // Update active tab
                chatTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active view
                chatViews.forEach(view => {
                    view.classList.remove('active');
                    if (view.id === chatType + 'Chat') {
                        view.classList.add('active');
                    }
                });
            });
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (chatPanel && !chatPanel.contains(e.target) && !chatToggle.contains(e.target)) {
                chatPanel.classList.remove('active');
            }
        });
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Enhanced notification system
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            border-left: 4px solid ${this.getColor(type)};
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">${this.getIcon(type)}</span>
                <span style="color: #495057; font-weight: 500;">${message}</span>
            </div>
        `;

        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    remove(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Language switching functionality
function initLanguageToggle() {
    const langBtn = document.getElementById('currentLangBtn');
    const langDropdown = document.getElementById('langDropdown');
    
    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.style.display = langDropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            langDropdown.style.display = 'none';
        });

        // Language selection
        const langOptions = langDropdown.querySelectorAll('.lang-btn');
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                const flagEmoji = option.querySelector('.flag-emoji').textContent;
                const langText = option.textContent.trim();
                
                langBtn.innerHTML = `<span class="flag-emoji">${flagEmoji}</span> ${langText}`;
                langDropdown.style.display = 'none';
                
                // Here you would implement actual language switching
                console.log('Language switched to:', lang);
            });
        });
    }
}

// Mobile navigation
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main enhanced landing functionality
    new EnhancedLanding();
    
    // Initialize other features
    initSmoothScrolling();
    initLanguageToggle();
    initMobileNavigation();
    
    // Create global notification manager
    window.notificationManager = new NotificationManager();
    
    // Add CSS for mobile navigation
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 0;
                right: -100%;
                width: 80%;
                height: 100vh;
                background: white;
                box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                padding: 80px 20px 20px;
                z-index: 1000;
            }
            
            .nav-menu.active {
                right: 0;
            }
            
            .nav-toggle {
                display: flex;
                flex-direction: column;
                cursor: pointer;
                gap: 4px;
            }
            
            .nav-toggle-line {
                width: 25px;
                height: 3px;
                background: #495057;
                transition: all 0.3s ease;
            }
            
            .nav-toggle.active .nav-toggle-line:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .nav-toggle.active .nav-toggle-line:nth-child(2) {
                opacity: 0;
            }
            
            .nav-toggle.active .nav-toggle-line:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
            
            .nav-link {
                padding: 15px 0;
                border-bottom: 1px solid #e9ecef;
                font-weight: 500;
            }
        }
        
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        }
    `;
    document.head.appendChild(mobileStyles);
    
    console.log('Enhanced landing page fully loaded');
});

// Export for global access
window.EnhancedLanding = EnhancedLanding;