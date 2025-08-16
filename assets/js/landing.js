/* =====================================================
   PROFESSIONAL HR MANAGEMENT SYSTEM - LANDING JS
   ===================================================== */

class LandingPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupMobileMenu();
        this.setupStatsAnimation();
        this.setupDemoFeatures();
        this.setupLanguageToggle();
    }

    setupNavigation() {
        // Smooth scrolling for anchor links
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });
    }

    setupScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });

        // Observe benefit items
        const benefitItems = document.querySelectorAll('.benefit-item');
        benefitItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
            observer.observe(item);
        });
    }

    setupAnimations() {
        // Add stagger animation to hero elements
        const heroElements = [
            '.hero-title',
            '.hero-description', 
            '.hero-actions'
        ];

        heroElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.animationDelay = `${0.2 + index * 0.2}s`;
            }
        });

        // Parallax effect for hero background
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero) {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    setupStatsAnimation() {
        const stats = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => {
            observer.observe(stat);
        });
    }

    animateNumber(element) {
        const text = element.textContent;
        const hasPercent = text.includes('%');
        const hasPlus = text.includes('+');
        const hasStar = text.includes('⭐');
        const hasSlash = text.includes('/');
        
        if (hasStar || hasSlash) {
            // Special cases for ratings and fractions
            element.style.opacity = '0';
            element.style.transform = 'scale(0.5)';
            element.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            }, 100);
            return;
        }
        
        const numericValue = parseFloat(text.replace(/[^\d.]/g, ''));
        if (isNaN(numericValue)) return;
        
        const duration = 2000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            
            let displayValue = current.toFixed(numericValue % 1 === 0 ? 0 : 1);
            if (hasPercent) displayValue += '%';
            if (hasPlus) displayValue += '+';
            
            element.textContent = displayValue;
        }, duration / steps);
    }

    setupDemoFeatures() {
        // Add click animation to demo credentials
        const credentialValues = document.querySelectorAll('.credential-item .value');
        credentialValues.forEach(value => {
            value.addEventListener('click', () => {
                // Copy to clipboard
                navigator.clipboard.writeText(value.textContent).then(() => {
                    // Show copied feedback
                    const originalText = value.textContent;
                    value.textContent = 'Đã sao chép!';
                    value.style.background = 'var(--success-color)';
                    value.style.color = 'var(--white)';
                    
                    setTimeout(() => {
                        value.textContent = originalText;
                        value.style.background = 'rgba(255, 255, 255, 0.8)';
                        value.style.color = 'var(--primary-color)';
                    }, 1500);
                }).catch(() => {
                    // Fallback for older browsers
                    value.style.animation = 'pulse 0.3s ease-in-out';
                    setTimeout(() => {
                        value.style.animation = '';
                    }, 300);
                });
            });
            
            value.style.cursor = 'pointer';
            value.title = 'Click để sao chép';
        });

        // Add demo button enhancement
        const demoBtn = document.querySelector('.btn-demo');
        if (demoBtn) {
            demoBtn.addEventListener('mouseenter', () => {
                demoBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            });
            
            demoBtn.addEventListener('mouseleave', () => {
                demoBtn.style.background = 'linear-gradient(135deg, var(--success-color), #10b981)';
            });
        }
    }

    setupLanguageToggle() {
        this.currentLanguage = localStorage.getItem('language') || 'vi';
        
        const currentLangBtn = document.getElementById('currentLangBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (currentLangBtn && langDropdown) {
            // Toggle dropdown visibility
            currentLangBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = langDropdown.style.display !== 'none';
                langDropdown.style.display = isVisible ? 'none' : 'block';
            });
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.style.display = 'none';
            });
            
            // Handle language selection from dropdown
            this.setupLanguageDropdownEvents();
            this.updateLanguageUI();
        }
    }

    setupLanguageDropdownEvents() {
        const langDropdown = document.getElementById('langDropdown');
        if (langDropdown) {
            const dropdownBtn = langDropdown.querySelector('.lang-btn');
            if (dropdownBtn) {
                dropdownBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedLang = dropdownBtn.getAttribute('data-lang');
                    
                    if (selectedLang && selectedLang !== this.currentLanguage) {
                        this.currentLanguage = selectedLang;
                        localStorage.setItem('language', this.currentLanguage);
                        this.updateLanguageUI();
                        this.updatePageLanguage();
                        langDropdown.style.display = 'none';
                    }
                });
            }
        }
    }

    updateLanguageUI() {
        const currentLangBtn = document.getElementById('currentLangBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (currentLangBtn && langDropdown) {
            // Update current language button
            const flagEmoji = this.currentLanguage === 'vi' ? '🇻🇳' : '🇺🇸';
            const langText = this.currentLanguage.toUpperCase();
            
            currentLangBtn.innerHTML = `
                <span class="flag-emoji">${flagEmoji}</span>
                ${langText}
            `;
            
            // Update dropdown to show other language
            const otherLang = this.currentLanguage === 'vi' ? 'en' : 'vi';
            const otherFlag = otherLang === 'vi' ? '🇻🇳' : '🇺🇸';
            const otherText = otherLang.toUpperCase();
            
            langDropdown.innerHTML = `
                <button class="lang-btn" data-lang="${otherLang}">
                    <span class="flag-emoji">${otherFlag}</span>
                    ${otherText}
                </button>
            `;
            
            // Re-setup dropdown events
            this.setupLanguageDropdownEvents();
        }
    }

    updatePageLanguage() {
        // Update page content based on selected language
        // This is a simplified version - in a real application you'd have complete translations
        const elements = {
            'hero-title': {
                'vi': 'Hệ thống quản lý <span class="hero-highlight">nhân sự</span> chuyên nghiệp',
                'en': 'Professional <span class="hero-highlight">HR Management</span> System'
            },
            'hero-description': {
                'vi': 'Giải pháp toàn diện cho quản lý nhân sự, chấm công, tính lương và báo cáo với công nghệ cloud hiện đại',
                'en': 'Complete solution for HR management, attendance tracking, payroll calculation and reporting with modern cloud technology'
            }
        };
        
        Object.keys(elements).forEach(id => {
            const element = document.querySelector(`.${id}`);
            if (element && elements[id][this.currentLanguage]) {
                element.innerHTML = elements[id][this.currentLanguage];
            }
        });
        
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        const navTexts = {
            'vi': ['Tính năng', 'Lợi ích', 'Liên hệ', 'Đăng nhập'],
            'en': ['Features', 'Benefits', 'Contact', 'Sign In']
        };
        
        navLinks.forEach((link, index) => {
            if (index < navTexts[this.currentLanguage].length) {
                link.textContent = navTexts[this.currentLanguage][index];
            }
        });
    }
}

// Performance optimized scroll handler
let ticking = false;

function updateScrollEffects() {
    // Header background update
    const header = document.querySelector('.header');
    if (header) {
        const scrollY = window.scrollY;
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    ticking = false;
}

function requestScrollUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
    
    // Optimized scroll listener
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Preload critical resources
const preloadResources = () => {
    const criticalImages = [
        'frontend/public/images/hero-dashboard.png',
        'frontend/public/images/benefits.png'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
};

// Call preload when page starts loading
if (document.readyState === 'loading') {
    preloadResources();
} else {
    preloadResources();
}

// Add CSS classes for mobile menu animation
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: var(--spacing-lg);
            flex-direction: column;
            align-items: stretch;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease-out;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
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
        
        .header.scrolled {
            background: rgba(255, 255, 255, 0.98) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
        }
    }
    
    body.loaded {
        opacity: 1;
    }
    
    body {
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }
`;
document.head.appendChild(style);