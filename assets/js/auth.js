/**
 * Professional HR Management System - Authentication Module
 * Handles login, registration, and form validation
 */

// TEST ACCOUNTS - Remove when deploying to production
const TEST_ACCOUNTS = {
    ADMIN: {
        username: 'ADMIN',
        password: 'ADMIN123',
        role: 'admin',
        permissions: ['all']
    }
};
// END TEST ACCOUNTS

class AuthManager {
    constructor() {
        this.apiUrl = 'https://zewk.tocotoco.workers.dev';
        this.currentLanguage = this.getStoredLanguage();
        this.translations = {};
        
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setupEventListeners();
        this.setupFormValidation();
        this.applyStoredLanguage();
    }

    // Event Listeners
    setupEventListeners() {
        // Language toggle with dropdown
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
        } else {
            // Fallback for old language toggle
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const lang = e.currentTarget.dataset.lang;
                    this.changeLanguage(lang);
                });
            });
        }

        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', this.togglePasswordVisibility.bind(this));
        });

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
    }

    // Form Validation
    setupFormValidation() {
        // Real-time validation for all forms
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(input) {
        const fieldName = input.name;
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(input);

        // TEST ACCOUNT EXCEPTION - Remove when deploying to production
        if (value === 'ADMIN' || value === 'ADMIN123') {
            return true;
        }
        // END TEST ACCOUNT EXCEPTION

        // Required field validation
        if (input.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = this.translate('field_required');
        }
        // Email validation
        else if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = this.translate('invalid_email');
            }
        }
        // Phone validation
        else if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = this.translate('invalid_phone');
            }
        }
        // Password validation
        else if (fieldName === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = this.translate('password_too_short');
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
                isValid = false;
                errorMessage = this.translate('password_weak');
            }
        }
        // Confirm password validation
        else if (fieldName === 'confirmPassword' && value) {
            const passwordField = document.getElementById('password');
            if (passwordField && value !== passwordField.value) {
                isValid = false;
                errorMessage = this.translate('passwords_no_match');
            }
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        }

        return isValid;
    }

    showFieldError(input, message) {
        const errorElement = document.getElementById(input.name + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        input.classList.add('error');
    }

    clearFieldError(input) {
        const errorElement = document.getElementById(input.name + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        input.classList.remove('error');
    }

    // Authentication Handlers
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const formData = new FormData(form);
        
        // Validate form
        let isValid = true;
        form.querySelectorAll('.form-input[required]').forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification(this.translate('fix_errors'), 'error');
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        // TEST ACCOUNT LOGIN - Remove when deploying to production
        const email = formData.get('email');
        const password = formData.get('password');
        
        if (email === 'ADMIN' && password === 'ADMIN123') {
            // Mock successful admin login
            const mockUserData = {
                id: 1,
                email: 'admin@hrms.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                permissions: ['all'],
                avatar: null
            };
            
            // Mock tokens
            localStorage.setItem('accessToken', 'mock_admin_token_' + Date.now());
            localStorage.setItem('refreshToken', 'mock_admin_refresh_' + Date.now());
            localStorage.setItem('userData', JSON.stringify(mockUserData));
            
            this.showNotification(this.translate('login_success'), 'success');
            
            setTimeout(() => {
                window.location.href = '../dashboard/index.html';
            }, 1000);
            
            this.setButtonLoading(submitBtn, false);
            return;
        }
        // END TEST ACCOUNT LOGIN

        try {
            const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    rememberMe: formData.get('rememberMe') === 'on'
                })
            });

            const result = await response.json();

            if (result.success) {
                // Store tokens
                localStorage.setItem('accessToken', result.data.tokens.accessToken);
                if (result.data.tokens.refreshToken) {
                    localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
                }

                // Store user data
                localStorage.setItem('userData', JSON.stringify(result.data.user));

                this.showNotification(this.translate('login_success'), 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../dashboard/index.html';
                }, 1000);

            } else {
                this.showNotification(result.error || this.translate('login_failed'), 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(this.translate('network_error'), 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const formData = new FormData(form);
        
        // Validate form
        let isValid = true;
        form.querySelectorAll('.form-input').forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Check if terms are agreed
        const agreeTerms = form.querySelector('#agreeTerms');
        if (!agreeTerms.checked) {
            this.showNotification(this.translate('agree_terms_required'), 'error');
            isValid = false;
        }

        if (!isValid) {
            this.showNotification(this.translate('fix_errors'), 'error');
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            const response = await fetch(`${this.apiUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    department: formData.get('department'),
                    position: formData.get('position'),
                    employeeId: formData.get('employeeId'),
                    password: formData.get('password')
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(this.translate('register_success'), 'success');
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } else {
                this.showNotification(result.error || this.translate('register_failed'), 'error');
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification(this.translate('network_error'), 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // UI Helper Functions
    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = button.parentElement.querySelector('.form-input');
        const icon = button.querySelector('.icon use');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('href', '#icon-eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('href', '#icon-eye');
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = notification.querySelector('.notification-message');
        const iconElement = notification.querySelector('.notification-icon');

        // Set message
        messageElement.textContent = message;

        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        iconElement.textContent = icons[type] || icons.info;

        // Set classes
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    // Language Management
    loadTranslations() {
        this.translations = {
            vi: {
                // Form validation
                field_required: 'Trường này là bắt buộc',
                invalid_email: 'Email không hợp lệ',
                invalid_phone: 'Số điện thoại không hợp lệ',
                password_too_short: 'Mật khẩu phải có ít nhất 8 ký tự',
                password_weak: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
                passwords_no_match: 'Mật khẩu xác nhận không khớp',
                agree_terms_required: 'Bạn phải đồng ý với điều khoản sử dụng',
                fix_errors: 'Vui lòng sửa các lỗi trong form',
                
                // Auth messages
                login_success: 'Đăng nhập thành công!',
                login_failed: 'Đăng nhập thất bại',
                register_success: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
                register_failed: 'Đăng ký thất bại',
                network_error: 'Lỗi kết nối mạng',
                
                // UI elements
                app_title: 'Professional HR',
                login_subtitle: 'Hệ thống quản lý nhân sự chuyên nghiệp',
                register_subtitle: 'Tạo tài khoản quản lý nhân sự',
                login_title: 'Đăng nhập',
                register_title: 'Đăng ký tài khoản',
                email: 'Email',
                password: 'Mật khẩu',
                first_name: 'Họ',
                last_name: 'Tên',
                phone: 'Số điện thoại',
                department: 'Phòng ban',
                position: 'Chức vụ',
                employee_id: 'Mã nhân viên (Tùy chọn)',
                confirm_password: 'Xác nhận mật khẩu',
                remember_me: 'Ghi nhớ đăng nhập',
                forgot_password: 'Quên mật khẩu?',
                login_button: 'Đăng nhập',
                register_button: 'Đăng ký',
                or: 'hoặc',
                no_account: 'Chưa có tài khoản?',
                have_account: 'Đã có tài khoản?',
                register_link: 'Đăng ký ngay',
                login_link: 'Đăng nhập ngay',
                agree_terms: 'Tôi đồng ý với điều khoản sử dụng',
                help: 'Hỗ trợ',
                contact: 'Liên hệ',
                privacy: 'Bảo mật',
                copyright: '© 2024 Professional HR Management System. Đã đăng ký bản quyền.',
                
                // Departments
                dept_hr: 'Nhân sự',
                dept_it: 'Công nghệ thông tin',
                dept_accounting: 'Kế toán',
                dept_sales: 'Kinh doanh',
                dept_marketing: 'Marketing',
                dept_operations: 'Vận hành',
                
                // Positions
                pos_staff: 'Nhân viên',
                pos_leader: 'Trưởng nhóm',
                pos_manager: 'Quản lý',
                pos_director: 'Giám đốc'
            },
            en: {
                // Form validation
                field_required: 'This field is required',
                invalid_email: 'Invalid email format',
                invalid_phone: 'Invalid phone number',
                password_too_short: 'Password must be at least 8 characters',
                password_weak: 'Password must contain uppercase, lowercase, number and special character',
                passwords_no_match: 'Passwords do not match',
                agree_terms_required: 'You must agree to the terms of service',
                fix_errors: 'Please fix errors in the form',
                
                // Auth messages
                login_success: 'Login successful!',
                login_failed: 'Login failed',
                register_success: 'Registration successful! Please check your email for verification.',
                register_failed: 'Registration failed',
                network_error: 'Network connection error',
                
                // UI elements
                app_title: 'Professional HR',
                login_subtitle: 'Professional Human Resource Management System',
                register_subtitle: 'Create HR management account',
                login_title: 'Sign In',
                register_title: 'Create Account',
                email: 'Email',
                password: 'Password',
                first_name: 'First Name',
                last_name: 'Last Name',
                phone: 'Phone Number',
                department: 'Department',
                position: 'Position',
                employee_id: 'Employee ID (Optional)',
                confirm_password: 'Confirm Password',
                remember_me: 'Remember me',
                forgot_password: 'Forgot password?',
                login_button: 'Sign In',
                register_button: 'Sign Up',
                or: 'or',
                no_account: "Don't have an account?",
                have_account: 'Already have an account?',
                register_link: 'Sign up now',
                login_link: 'Sign in now',
                agree_terms: 'I agree to the terms of service',
                help: 'Help',
                contact: 'Contact',
                privacy: 'Privacy',
                copyright: '© 2024 Professional HR Management System. All rights reserved.',
                
                // Departments
                dept_hr: 'Human Resources',
                dept_it: 'Information Technology',
                dept_accounting: 'Accounting',
                dept_sales: 'Sales',
                dept_marketing: 'Marketing',
                dept_operations: 'Operations',
                
                // Positions
                pos_staff: 'Staff',
                pos_leader: 'Team Leader',
                pos_manager: 'Manager',
                pos_director: 'Director'
            }
        };
    }

    translate(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        this.applyLanguage();
        this.updateLanguageButtons();
    }

    applyLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update select options
        document.querySelectorAll('option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            option.textContent = this.translate(key);
        });
    }

    setupLanguageDropdownEvents() {
        const langDropdown = document.getElementById('langDropdown');
        if (langDropdown) {
            const dropdownBtn = langDropdown.querySelector('.lang-btn');
            if (dropdownBtn) {
                dropdownBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = dropdownBtn.dataset.lang;
                    this.changeLanguage(lang);
                    langDropdown.style.display = 'none';
                });
            }
        }
    }

    updateLanguageButtons() {
        const currentLangBtn = document.getElementById('currentLangBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (currentLangBtn && langDropdown) {
            // Update current language button
            const flagImg = this.currentLanguage === 'vi' 
                ? '../../public/images/flag-vn.png' 
                : '../../public/images/flag-us.png';
            const flagAlt = this.currentLanguage === 'vi' ? 'Vietnamese' : 'English';
            const langText = this.currentLanguage.toUpperCase();
            
            currentLangBtn.innerHTML = `
                <img src="${flagImg}" alt="${flagAlt}" class="flag-icon">
                ${langText}
            `;
            
            // Update dropdown to show other language
            const otherLang = this.currentLanguage === 'vi' ? 'en' : 'vi';
            const otherFlag = otherLang === 'vi' 
                ? '../../public/images/flag-vn.png' 
                : '../../public/images/flag-us.png';
            const otherAlt = otherLang === 'vi' ? 'Vietnamese' : 'English';
            const otherText = otherLang.toUpperCase();
            
            langDropdown.innerHTML = `
                <button class="lang-btn" data-lang="${otherLang}">
                    <img src="${otherFlag}" alt="${otherAlt}" class="flag-icon">
                    ${otherText}
                </button>
            `;
            
            // Re-setup dropdown events
            this.setupLanguageDropdownEvents();
        } else {
            // Fallback for old language toggle
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
            });
        }
    }

    getStoredLanguage() {
        return localStorage.getItem('preferredLanguage') || 'vi';
    }

    applyStoredLanguage() {
        this.applyLanguage();
        this.updateLanguageButtons();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Add eye-off icon to SVG
document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('svg[style="display: none;"]');
    if (svg) {
        const defs = svg.querySelector('defs');
        if (defs) {
            const eyeOffSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
            eyeOffSymbol.id = 'icon-eye-off';
            eyeOffSymbol.setAttribute('viewBox', '0 0 24 24');
            eyeOffSymbol.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
            defs.appendChild(eyeOffSymbol);
        }
    }
});