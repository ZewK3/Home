/**
 * Professional HR Management System - Authentication JavaScript
 * Modern, secure, and feature-rich authentication handling
 */

class ProfessionalAuthSystem {
    constructor() {
        this.apiBaseUrl = 'https://your-cloudflare-worker.your-domain.workers.dev/api/v1';
        this.currentTab = 'login';
        this.isLoading = false;
        this.particles = [];
        this.animationFrameId = null;
        
        this.init();
    }

    /**
     * Initialize the authentication system
     */
    init() {
        this.setupEventListeners();
        this.initializeParticleSystem();
        this.setupRealTimeValidation();
        this.initializeAnimations();
        this.checkExistingSession();
        
        console.log('🚀 Professional HR Authentication System initialized');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form switch buttons
        document.querySelectorAll('[data-switch]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.switch));
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePassword(e.target.closest('.password-toggle')));
        });

        // Password strength checker
        document.getElementById('register-password').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // Real-time validation
        this.setupRealTimeValidation();

        // Modal handling
        this.setupModalHandlers();

        // Language switching
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLanguage(e.target.dataset.lang));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Vietnamese flag interaction
        document.querySelector('.vietnamese-flag').addEventListener('click', () => {
            this.showPatrioticMessage();
        });

        // Responsive updates
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Switch between login and register tabs
     */
    switchTab(tab) {
        if (this.isLoading) return;

        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab indicator
        const indicator = document.querySelector('.tab-indicator');
        indicator.classList.toggle('register-active', tab === 'register');

        // Switch form containers
        document.querySelectorAll('.auth-form-container').forEach(container => {
            container.classList.toggle('active', container.id === `${tab}-form`);
        });

        // Focus first input
        setTimeout(() => {
            const firstInput = document.querySelector(`#${tab}-form input`);
            if (firstInput) firstInput.focus();
        }, 300);

        // Analytics
        this.trackEvent('tab_switch', { tab });
    }

    /**
     * Handle login form submission
     */
    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email').trim(),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        // Validate
        if (!this.validateLoginForm(loginData)) return;

        this.setLoading(true, 'login-btn');

        try {
            const response = await this.makeApiRequest('login', 'POST', loginData);
            
            if (response.success) {
                // Store authentication data
                this.storeAuthData(response.data);
                
                // Show success message
                this.showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
                
                // Analytics
                this.trackEvent('login_success', { 
                    email: loginData.email,
                    rememberMe: loginData.rememberMe 
                });
            } else {
                this.showNotification(response.message || 'Đăng nhập thất bại', 'error');
                this.trackEvent('login_failure', { email: loginData.email });
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Có lỗi xảy ra trong quá trình đăng nhập', 'error');
            this.trackEvent('login_error', { error: error.message });
        } finally {
            this.setLoading(false, 'login-btn');
        }
    }

    /**
     * Handle registration form submission
     */
    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const formData = new FormData(e.target);
        const registerData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            department: formData.get('department').trim(),
            position: formData.get('position').trim(),
            employeeId: formData.get('employeeId').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            termsAgreement: formData.get('termsAgreement') === 'on'
        };

        // Validate
        if (!this.validateRegisterForm(registerData)) return;

        this.setLoading(true, 'register-btn');

        try {
            const response = await this.makeApiRequest('register', 'POST', registerData);
            
            if (response.success) {
                // Clear form
                e.target.reset();
                this.updatePasswordStrength(0);
                
                // Show success message
                this.showNotification('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', 'success');
                
                // Switch to login tab
                setTimeout(() => {
                    this.switchTab('login');
                    // Pre-fill email in login form
                    document.getElementById('login-email').value = registerData.email;
                }, 2000);
                
                // Analytics
                this.trackEvent('registration_success', { 
                    email: registerData.email,
                    department: registerData.department 
                });
            } else {
                this.showNotification(response.message || 'Đăng ký thất bại', 'error');
                this.trackEvent('registration_failure', { email: registerData.email });
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Có lỗi xảy ra trong quá trình đăng ký', 'error');
            this.trackEvent('registration_error', { error: error.message });
        } finally {
            this.setLoading(false, 'register-btn');
        }
    }

    /**
     * Validate login form
     */
    validateLoginForm(data) {
        this.clearFieldErrors('login');
        let isValid = true;

        // Email validation
        if (!data.email) {
            this.showFieldError('login-email', 'Email là bắt buộc');
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showFieldError('login-email', 'Email không hợp lệ');
            isValid = false;
        }

        // Password validation
        if (!data.password) {
            this.showFieldError('login-password', 'Mật khẩu là bắt buộc');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate registration form
     */
    validateRegisterForm(data) {
        this.clearFieldErrors('register');
        let isValid = true;

        // Required fields
        const requiredFields = [
            { field: 'firstName', message: 'Họ là bắt buộc' },
            { field: 'lastName', message: 'Tên là bắt buộc' },
            { field: 'email', message: 'Email là bắt buộc' },
            { field: 'password', message: 'Mật khẩu là bắt buộc' },
            { field: 'confirmPassword', message: 'Xác nhận mật khẩu là bắt buộc' }
        ];

        requiredFields.forEach(({ field, message }) => {
            if (!data[field]) {
                this.showFieldError(`register-${field}`, message);
                isValid = false;
            }
        });

        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            this.showFieldError('register-email', 'Email không hợp lệ');
            isValid = false;
        }

        // Phone validation
        if (data.phone && !this.isValidPhone(data.phone)) {
            this.showFieldError('register-phone', 'Số điện thoại không hợp lệ');
            isValid = false;
        }

        // Password validation
        if (data.password && !this.isStrongPassword(data.password)) {
            this.showFieldError('register-password', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
            isValid = false;
        }

        // Password confirmation
        if (data.password !== data.confirmPassword) {
            this.showFieldError('register-confirmPassword', 'Mật khẩu xác nhận không khớp');
            isValid = false;
        }

        // Terms agreement
        if (!data.termsAgreement) {
            this.showNotification('Bạn phải đồng ý với điều khoản sử dụng', 'warning');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        // Email validation
        ['login-email', 'register-email'].forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('blur', () => {
                const email = input.value.trim();
                if (email && !this.isValidEmail(email)) {
                    this.showFieldError(id, 'Email không hợp lệ');
                } else {
                    this.clearFieldError(id);
                }
            });
        });

        // Phone validation
        const phoneInput = document.getElementById('register-phone');
        phoneInput.addEventListener('input', (e) => {
            // Format phone number
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + '-' + value.slice(3);
                } else {
                    value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
                }
            }
            e.target.value = value;
        });

        // Password confirmation validation
        const confirmPasswordInput = document.getElementById('register-confirmPassword');
        confirmPasswordInput.addEventListener('input', () => {
            const password = document.getElementById('register-password').value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                this.showFieldError('register-confirmPassword', 'Mật khẩu xác nhận không khớp');
            } else {
                this.clearFieldError('register-confirmPassword');
            }
        });
    }

    /**
     * Password strength checker
     */
    checkPasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        this.updatePasswordStrength(strength);
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 15;
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[0-9]/.test(password)) score += 15;
        if (/[^A-Za-z0-9]/.test(password)) score += 15;
        
        return Math.min(score, 100);
    }

    updatePasswordStrength(strength) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        strengthFill.style.width = `${strength}%`;
        
        if (strength < 30) {
            strengthFill.style.background = 'var(--error-color)';
            strengthText.textContent = 'Mật khẩu yếu';
        } else if (strength < 60) {
            strengthFill.style.background = 'var(--warning-color)';
            strengthText.textContent = 'Mật khẩu trung bình';
        } else if (strength < 80) {
            strengthFill.style.background = 'var(--info-color)';
            strengthText.textContent = 'Mật khẩu khá mạnh';
        } else {
            strengthFill.style.background = 'var(--success-color)';
            strengthText.textContent = 'Mật khẩu rất mạnh';
        }
    }

    /**
     * Toggle password visibility
     */
    togglePassword(toggleBtn) {
        const targetId = toggleBtn.dataset.target;
        const input = document.getElementById(targetId);
        const icon = toggleBtn.querySelector('.toggle-icon');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = '🙈';
        } else {
            input.type = 'password';
            icon.textContent = '👁️';
        }
    }

    /**
     * Show field error
     */
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.opacity = '1';
        }
        
        // Add error styling to input
        const input = document.getElementById(fieldId);
        if (input) {
            input.style.borderColor = 'var(--error-color)';
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.opacity = '0';
        }
        
        // Remove error styling from input
        const input = document.getElementById(fieldId);
        if (input) {
            input.style.borderColor = '';
        }
    }

    /**
     * Clear all field errors for a form
     */
    clearFieldErrors(formType) {
        document.querySelectorAll(`#${formType}-form .field-error`).forEach(error => {
            error.textContent = '';
            error.style.opacity = '0';
        });
        
        document.querySelectorAll(`#${formType}-form input`).forEach(input => {
            input.style.borderColor = '';
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'notification-exit 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    /**
     * Set loading state
     */
    setLoading(loading, buttonId) {
        this.isLoading = loading;
        const button = document.getElementById(buttonId);
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    /**
     * Make API request
     */
    async makeApiRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Store authentication data
     */
    storeAuthData(authData) {
        // Store in localStorage
        localStorage.setItem('hr_auth_token', authData.accessToken);
        localStorage.setItem('hr_refresh_token', authData.refreshToken);
        localStorage.setItem('hr_user_data', JSON.stringify(authData.user));
        localStorage.setItem('hr_expires_in', authData.expiresIn);
        
        // Store in sessionStorage for current session
        sessionStorage.setItem('hr_session_active', 'true');
    }

    /**
     * Check existing session
     */
    checkExistingSession() {
        const token = localStorage.getItem('hr_auth_token');
        const userData = localStorage.getItem('hr_user_data');
        
        if (token && userData) {
            // Verify token is still valid
            this.verifyTokenValidity(token).then(isValid => {
                if (isValid) {
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                }
            }).catch(() => {
                // Token is invalid, clear storage
                this.clearAuthData();
            });
        }
    }

    /**
     * Verify token validity
     */
    async verifyTokenValidity(token) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        localStorage.removeItem('hr_auth_token');
        localStorage.removeItem('hr_refresh_token');
        localStorage.removeItem('hr_user_data');
        localStorage.removeItem('hr_expires_in');
        sessionStorage.removeItem('hr_session_active');
    }

    /**
     * Initialize particle system
     */
    initializeParticleSystem() {
        const container = document.getElementById('particles');
        
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, 25000);
        };
        
        // Create initial particles
        for (let i = 0; i < 20; i++) {
            setTimeout(createParticle, i * 500);
        }
        
        // Continue creating particles
        setInterval(createParticle, 2000);
    }

    /**
     * Setup modal handlers
     */
    setupModalHandlers() {
        // Terms modal
        document.getElementById('terms-link').addEventListener('click', () => {
            this.showModal('terms-modal');
        });
        
        // Privacy modal
        document.getElementById('privacy-link').addEventListener('click', () => {
            this.showModal('privacy-modal');
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideModal(e.target.dataset.modal);
            });
        });
        
        // Modal backdrop click
        document.getElementById('modal-backdrop').addEventListener('click', () => {
            this.hideAllModals();
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modal-backdrop');
        
        backdrop.classList.add('active');
        modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modal-backdrop');
        
        modal.classList.remove('active');
        
        // Check if any other modals are open
        const openModals = document.querySelectorAll('.modal.active');
        if (openModals.length === 0) {
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Hide all modals
     */
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modal-backdrop').classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        // Floating label animations
        document.querySelectorAll('.input-container input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
            
            // Check initial state
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to submit current form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeForm = document.querySelector('.auth-form-container.active form');
            if (activeForm && !this.isLoading) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Tab to switch between login/register (when not in input)
        if (e.key === 'Tab' && !e.target.matches('input, button, textarea')) {
            e.preventDefault();
            this.switchTab(this.currentTab === 'login' ? 'register' : 'login');
        }
    }

    /**
     * Switch language
     */
    switchLanguage(lang) {
        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Store language preference
        localStorage.setItem('hr_language', lang);
        
        // You can implement translation logic here
        this.trackEvent('language_change', { language: lang });
    }

    /**
     * Show patriotic message when flag is clicked
     */
    showPatrioticMessage() {
        const messages = [
            '🇻🇳 Tự hào Việt Nam! 🇻🇳',
            '❤️ Yêu Tổ quốc Việt Nam ❤️',
            '🌟 Việt Nam tiến lên! 🌟',
            '🚀 Công nghệ Việt Nam! 🚀'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showNotification(randomMessage, 'success', 3000);
        
        // Add sparkle effect to flag
        const flag = document.querySelector('.vietnamese-flag');
        flag.style.animation = 'none';
        setTimeout(() => {
            flag.style.animation = 'sparkle 1s ease-in-out';
        }, 10);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust particle system for mobile
        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 10 : 20;
        
        // You can adjust particle density based on screen size
    }

    /**
     * Track analytics events
     */
    trackEvent(eventName, properties = {}) {
        // Implement your analytics tracking here
        console.log(`📊 Event: ${eventName}`, properties);
        
        // Example: Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Example: Custom analytics
        if (typeof analytics !== 'undefined') {
            analytics.track(eventName, properties);
        }
    }

    /**
     * Validation helper methods
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\d\-\+\(\)\s]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    isStrongPassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }
}

// Initialize the authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new ProfessionalAuthSystem();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalAuthSystem;
}