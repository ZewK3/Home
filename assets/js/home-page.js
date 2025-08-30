// GitHub-Inspired Home Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeToggle) {
            const icon = themeToggle.querySelector('.material-icons-round');
            icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        }
    }
    
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const headerNavLinks = document.querySelector('.header-nav-links');
    
    if (mobileMenuToggle && headerNavLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            headerNavLinks.classList.toggle('mobile-open');
            const isOpen = headerNavLinks.classList.contains('mobile-open');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
            
            const icon = mobileMenuToggle.querySelector('.material-icons-round');
            icon.textContent = isOpen ? 'close' : 'menu';
        });
    }
    
    // Intersection Observer for Feature Cards Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all feature cards
    const featureCards = document.querySelectorAll('.feature-card.animate-on-scroll');
    featureCards.forEach(function(card) {
        observer.observe(card);
    });
    
    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.github-header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (headerNavLinks && headerNavLinks.classList.contains('mobile-open')) {
                    headerNavLinks.classList.remove('mobile-open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    const icon = mobileMenuToggle.querySelector('.material-icons-round');
                    icon.textContent = 'menu';
                }
            }
        });
    });
    
    // Hero Animation on Load
    setTimeout(function() {
        const heroElements = document.querySelectorAll('.animate-fade-in-up');
        heroElements.forEach(function(element, index) {
            setTimeout(function() {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 100);
    
    // Parallax Effect for Header
    let ticking = false;
    
    function updateHeaderOpacity() {
        const scrollY = window.pageYOffset;
        const header = document.querySelector('.github-header');
        const opacity = Math.max(0.8, 1 - scrollY / 200);
        
        if (header) {
            header.style.backgroundColor = `rgba(13, 17, 23, ${opacity})`;
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeaderOpacity);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Button Hover Effects
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Feature Card Tilt Effect (simplified)
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Social Links Tracking (for analytics)
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Add analytics tracking here if needed
            console.log('Social link clicked:', this.getAttribute('title'));
        });
    });
    
    // Performance optimization: Reduce animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add loading states for better UX
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// CSS for mobile menu (add to github-inspired.css via JavaScript if needed)
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .header-nav-links {
            position: fixed;
            top: 64px;
            right: 0;
            width: 100%;
            max-width: 300px;
            background-color: var(--bg-canvas);
            border: 1px solid var(--border-default);
            border-radius: var(--border-radius-large);
            padding: var(--space-3);
            box-shadow: var(--shadow-large);
            transform: translateX(100%);
            transition: transform var(--transition-duration) var(--transition-easing);
            flex-direction: column;
            gap: var(--space-2);
        }
        
        .header-nav-links.mobile-open {
            transform: translateX(0);
        }
        
        .nav-link {
            width: 100%;
            text-align: left;
        }
    }
`;

// Inject mobile menu styles
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileMenuStyles;
document.head.appendChild(styleSheet);