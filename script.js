// Constants
const API_URL = "https://zewk.tocotoco.workers.dev/";
const TOKEN_KEY = "authToken";
const REMEMBER_ME_KEY = "rememberedEmployeeId";
const THEME_KEY = "theme";
const SUCCESS_STATUS = 200;
const ACCOUNT_EXISTS_STATUS = 209;
const PHONE_EXISTS_STATUS = 210;
const EMAIL_EXISTS_STATUS = 211;
// Testing mode configuration
const TESTING_MODE = true; // Set to false for production

// Thêm đoạn này vào cuối file hoặc sau khi DOMContentLoaded
document.addEventListener('DOMContentLoaded', function(){
    var flag = document.querySelector('.flag-vn');
    if(flag){
        var w = flag.offsetWidth;
        for(var i = 0; i < w; i++){
            var el = document.createElement('div');
            el.className = 'flag-element';
            el.style.backgroundPosition = -i + "px 0";
            el.style.animationDelay = (i * 10) + "ms";
            el.style.webkitAnimationDelay = (i * 10) + "ms";
            el.style.mozAnimationDelay = (i * 10) + "ms";
            el.style.msAnimationDelay = (i * 10) + "ms";
            flag.appendChild(el);
        }
    }
});
// Create stars with professional appearance
function createStars(count) {
    const stars = document.querySelector('.stars');
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Professional animation duration
        star.style.setProperty('--duration', `${Math.random() * 4 + 3}s`);
        
        stars.appendChild(star);
    }
}

// Create professional light effects
function createLightStreaks(count) {
    const container = document.querySelector('.light-streaks');
    
    for (let i = 0; i < count; i++) {
        const streak = document.createElement('div');
        streak.className = 'light-streak';
        
        // Professional positioning and timing
        streak.style.left = `${Math.random() * 100}%`;
        streak.style.animationDelay = `${Math.random() * 12}s`;
        streak.style.height = `${Math.random() * 150 + 80}px`;
        
        container.appendChild(streak);
    }
}

// Initialize professional background effects
document.addEventListener('DOMContentLoaded', () => {
    createStars(60);  // Reduced for more professional look
    createLightStreaks(15);  // Reduced for subtlety
});
// DOM Elements - with null safety
const elements = {
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    verificationForm: document.getElementById("verificationForm"),
    loginContainer: document.getElementById("loginFormContainer"),
    registerContainer: document.getElementById("registerFormContainer"),
    verificationContainer: document.getElementById("verificationFormContainer"),
    notification: document.getElementById("notification"),
    themeSwitch: document.getElementById("themeSwitch"),
    strengthMeter: document.querySelector(".strength-meter div"),
    strengthText: document.querySelector(".strength-text")
};

// Stored registration data for verification
let registrationData = null;

// Form Transitions - Fixed with null checks
function showRegisterForm() {
    if (elements.loginContainer && elements.registerContainer) {
        elements.loginContainer.classList.remove('active');
        elements.registerContainer.classList.add('active');
        if (elements.verificationContainer) {
            elements.verificationContainer.classList.remove('active');
        }
        if (elements.registerForm) {
            elements.registerForm.reset();
        }
    }
}

function showLoginForm() {
    if (elements.registerContainer && elements.loginContainer) {
        elements.registerContainer.classList.remove('active');
        elements.loginContainer.classList.add('active');
        if (elements.verificationContainer) {
            elements.verificationContainer.classList.remove('active');
        }
        if (elements.loginForm) {
            elements.loginForm.reset();
        }
    }
}

function showVerificationForm() {
    if (elements.registerContainer && elements.verificationContainer) {
        elements.registerContainer.classList.remove('active');
        elements.verificationContainer.classList.add('active');
        elements.loginContainer.classList.remove('active');
        
        // Focus on verification code input
        setTimeout(() => {
            const verificationInput = document.getElementById('verificationCode');
            if (verificationInput) {
                verificationInput.focus();
            }
        }, 300);
    }
}

// Notification System - Fixed with null checks
function showNotification(message, type = "success", duration = 3000) {
    if (!elements.notification) {
        showNotification("Warning", "Notification element not found", "warning");
        return;
    }

    const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠"
    };

    elements.notification.innerHTML = `
        <span class="notification-icon">${icons[type]}</span>
        <span class="notification-message">${message}</span>
    `;
    
    elements.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        if (elements.notification) {
            elements.notification.classList.remove("show");
        }
    }, duration);
}

// Password Strength Checker - Fixed with null checks
function checkPasswordStrength(password) {
    if (!elements.strengthMeter || !elements.strengthText) {
        // Password strength elements not found - silent fail for better UX
        return;
    }

    let strength = 0;
    let message = "";

    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    Object.values(checks).forEach(check => strength += check ? 1 : 0);

    const colors = {
        0: "#ef4444",
        1: "#f59e0b",
        2: "#f59e0b",
        3: "#22c55e",
        4: "#15803d",
        5: "#15803d"
    };

    switch (strength) {
        case 0: message = "Rất yếu"; break;
        case 1: message = "Yếu"; break;
        case 2: message = "Trung bình"; break;
        case 3: message = "Khá"; break;
        case 4: message = "Mạnh"; break;
        case 5: message = "Rất mạnh"; break;
    }

    elements.strengthMeter.style.width = `${(strength / 5) * 100}%`;
    elements.strengthMeter.style.backgroundColor = colors[strength];
    elements.strengthText.textContent = message;
}

// Enhanced Form Validation with Professional Messages
function isValidForm(data) {
    const patterns = {
        employeeId: /^(MC|VP|ADMIN)\d*$/,
        password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[0-9]{10}$/,
        fullName: /^[A-Za-zÀ-ỹ\s]{2,30}$/
    };

    const messages = {
        employeeId: "Mã nhân viên phải bắt đầu bằng MC, VP hoặc ADMIN theo sau bởi số",
        password: "Mật khẩu cần ít nhất 8 ký tự, bao gồm: chữ hoa, chữ thường và số",
        email: "Vui lòng nhập địa chỉ email hợp lệ",
        phone: "Số điện thoại phải có đúng 10 chữ số",
        fullName: "Họ tên chỉ được chứa chữ cái và khoảng trắng (2-30 ký tự)"
    };

    for (const [field, value] of Object.entries(data)) {
        if (patterns[field] && value && !patterns[field].test(value)) {
            showNotification(messages[field], "warning", 4000);
            return false;
        }
    }

    return true;
}

// Enhanced API Calls with Better Error Handling

// Load stores for registration form
async function loadStores() {
    const storeSelect = document.getElementById("storeName");
    if (!storeSelect) {
        // Store select element not found - silent fail for better UX
        return;
    }
    
    // Show loading state
    storeSelect.innerHTML = '<option value="">Đang tải danh sách cửa hàng...</option>';
    storeSelect.disabled = true;
    
    try {
        // Loading stores from API silently
        const response = await fetch(`${API_URL}?action=getStores`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        
        // Store API response received
        
        if (response.ok) {
            const data = await response.json();
            // Stores data processed successfully
            
            // Check multiple possible data formats
            let stores = [];
            if (Array.isArray(data)) {
                stores = data;
            } else if (data.results && Array.isArray(data.results)) {
                stores = data.results;
            } else if (data.stores && Array.isArray(data.stores)) {
                stores = data.stores;
            } else if (data.data && Array.isArray(data.data)) {
                stores = data.data;
            } else if (typeof data === 'object' && data !== null) {
                // Handle case where data is object with numeric keys
                stores = Object.values(data).filter(item => 
                    item && typeof item === 'object' && 
                    (item.storeId || item.storeName)
                );
                // Converted object to stores array successfully
            }
            
            if (stores && stores.length > 0) {
                storeSelect.innerHTML = '<option value="">Chọn cửa hàng</option>';
                
                stores.forEach((store, index) => {
                    const option = document.createElement("option");
                    // Try multiple possible property names
                    const storeId = store.storeId || store.id || `ST${index + 1}`;
                    const storeName = store.storeName || store.name || storeId;
                    option.value = storeId;
                    option.textContent = storeName;
                    storeSelect.appendChild(option);
                    // Store added to dropdown
                });
                
                storeSelect.disabled = false;
                // All stores loaded successfully
                // Stores loaded successfully - silent completion for better UX
            } else {
                // No stores found in response
                storeSelect.innerHTML = '<option value="">Không có cửa hàng nào</option>';
                showNotification("Không tìm thấy cửa hàng nào", "warning", 3000);
            }
        } else {
            const errorText = await response.text();
            // Store API error - silent handling for better UX
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        // Error loading stores - using fallback
        
        // Fallback: Use static stores data for testing when API is blocked
        const fallbackStores = [
            { storeId: "ST001", storeName: "Cửa hàng Trung tâm" },
            { storeId: "ST002", storeName: "Cửa hàng Quận 1" },
            { storeId: "ST003", storeName: "Cửa hàng Thủ Đức" },
            { storeId: "ST004", storeName: "Cửa hàng Tân Bình" }
        ];
        
        // Using fallback stores data for testing
        storeSelect.innerHTML = '<option value="">Chọn cửa hàng</option>';
        
        fallbackStores.forEach(store => {
            const option = document.createElement("option");
            option.value = store.storeId;
            option.textContent = store.storeName;
            storeSelect.appendChild(option);
        });
        
        storeSelect.disabled = false;
        showNotification("Đang sử dụng dữ liệu mẫu cho cửa hàng", "warning", 5000);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    if (!elements.loginForm) {
        showNotification("Form không tồn tại", "error");
        return;
    }
    
    const button = elements.loginForm.querySelector("button");
    const buttonText = button?.querySelector(".btn-text");
    
    // Add loading state to loginFormContainer to prevent user interaction
    if (elements.loginContainer) {
        elements.loginContainer.classList.add("loading");
    }
    
    if (button) {
        button.classList.add("loading");
    }
    if (buttonText) {
        buttonText.textContent = "Đang đăng nhập...";
    }
    
    const formData = {
        loginEmployeeId: elements.loginForm.loginEmployeeId?.value.trim() || "",
        loginPassword: elements.loginForm.loginPassword?.value || ""
    };

    // Validate form data
    if (!formData.loginEmployeeId || !formData.loginPassword) {
        showNotification("Vui lòng nhập đầy đủ thông tin đăng nhập", "warning");
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Đăng nhập";
        if (elements.loginContainer) elements.loginContainer.classList.remove("loading");
        return;
    }

    try {
        let response;
        
        // Testing mode simulation
        if (TESTING_MODE) {
            // Simulate successful login for testing credentials
            if (formData.loginEmployeeId === "TEST001" && formData.loginPassword === "lock") {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                response = {
                    ok: true,
                    json: async () => ({
                        token: "test-token-" + Date.now(),
                        user: {
                            employeeId: "TEST001",
                            fullName: "Test User",
                            position: "AD",
                            email: "test@example.com"
                        }
                    })
                };
            } else {
                // Simulate login failure
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error("Mật khẩu không chính xác");
            }
        } else {
            // Production API call
            response = await fetch(`${API_URL}?action=login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem(TOKEN_KEY, result.token);
            
            const rememberMe = elements.loginForm.rememberMe;
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem(REMEMBER_ME_KEY, formData.loginEmployeeId);
            }
            localStorage.setItem("loggedInUser", JSON.stringify(formData));
            
            showNotification("Đăng nhập thành công! Đang chuyển hướng...", "success");
            if (buttonText) buttonText.textContent = "Thành công!";
            
            // Hide loginFormContainer to prevent user interaction during redirect
            if (elements.loginContainer) {
                elements.loginContainer.style.display = "none";
            }
            
            setTimeout(() => window.location.href = "dashboard.html", 1500);
        } else {
            const errorData = await response.json().catch(() => ({}));
            
            // Handle pending approval case
            if (response.status === 403) {
                throw new Error("Tài khoản của bạn đang chờ phê duyệt từ quản lý cửa hàng. Vui lòng đợi thông báo.");
            }
            
            throw new Error(
                response.status === 401 ? "Mật khẩu không chính xác" : 
                response.status === 404 ? "Mã nhân viên không tồn tại" :
                errorData.message || "Đăng nhập thất bại"
            );
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Đăng nhập";
        if (elements.loginContainer) elements.loginContainer.classList.remove("loading");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    if (!elements.registerForm) {
        showNotification("Form không tồn tại", "error");
        return;
    }
    
    const button = elements.registerForm.querySelector("button");
    const buttonText = button?.querySelector(".btn-text");
    
    if (button) {
        button.classList.add("loading");
    }
    if (buttonText) {
        buttonText.textContent = "Đang xử lý...";
    }
    
    const formData = {
        employeeId: elements.registerForm.employeeId?.value.trim() || "",
        password: elements.registerForm.password?.value || "",
        fullName: elements.registerForm.fullName?.value.trim() || "",
        phone: elements.registerForm.phone?.value.trim() || "",
        email: elements.registerForm.email?.value.trim() || "",
        storeName: elements.registerForm.storeName?.value || "",
        position: "NV"
    };

    // Validate store selection
    if (!formData.storeName) {
        showNotification("Vui lòng chọn cửa hàng", "warning");
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Đăng ký";
        return;
    }

    if (!isValidForm(formData)) {
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Đăng ký";
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        switch (response.status) {
            case SUCCESS_STATUS:
                if (data.requiresVerification) {
                    // Store registration data for verification step
                    registrationData = formData;
                    showNotification("Mã xác nhận đã được gửi tới email của bạn!", "success", 5000);
                    showVerificationForm();
                } else {
                    showNotification("Đăng ký thành công! Yêu cầu của bạn đang chờ phê duyệt từ quản lý cửa hàng.", "success", 5000);
                    if (buttonText) buttonText.textContent = "Chờ phê duyệt";
                    setTimeout(showLoginForm, 2500);
                }
                break;
            case ACCOUNT_EXISTS_STATUS:
                showNotification("Mã nhân viên đã tồn tại!", "warning");
                break;
            case PHONE_EXISTS_STATUS:
                showNotification("Số điện thoại đã được sử dụng!", "warning");
                break;
            case EMAIL_EXISTS_STATUS:
                showNotification("Email đã được sử dụng!", "warning");
                break;
            default:
                throw new Error(data.message || "Đăng ký thất bại");
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Đăng ký";
    }
}

// Handle email verification
async function handleVerification(event) {
    event.preventDefault();
    
    if (!elements.verificationForm || !registrationData) {
        showNotification("Dữ liệu xác thực không hợp lệ", "error");
        return;
    }
    
    const button = elements.verificationForm.querySelector("button[type='submit']");
    const buttonText = button?.querySelector(".btn-text");
    
    if (button) {
        button.classList.add("loading");
    }
    if (buttonText) {
        buttonText.textContent = "Đang xác thực...";
    }
    
    const verificationCode = elements.verificationForm.verificationCode?.value.trim().toUpperCase() || "";
    
    if (!verificationCode || verificationCode.length !== 8) {
        showNotification("Vui lòng nhập mã xác nhận 8 ký tự", "warning");
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Xác nhận";
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...registrationData,
                verificationCode: verificationCode
            })
        });

        const data = await response.json();

        if (response.status === SUCCESS_STATUS) {
            elements.verificationContainer?.classList.add('verification-success');
            showNotification("Xác nhận thành công! Tài khoản đang chờ phê duyệt từ quản lý.", "success", 5000);
            
            // Clear stored data
            registrationData = null;
            
            // Redirect to login after delay
            setTimeout(() => {
                showLoginForm();
                elements.verificationContainer?.classList.remove('verification-success');
            }, 2500);
        } else {
            throw new Error(data.message || "Xác thực thất bại");
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        if (button) button.classList.remove("loading");
        if (buttonText) buttonText.textContent = "Xác nhận";
    }
}

// Resend verification code
async function resendVerificationCode() {
    if (!registrationData) {
        showNotification("Không có dữ liệu để gửi lại mã", "error");
        return;
    }

    const button = document.getElementById('resendCodeBtn');
    const buttonText = button?.querySelector(".btn-text");
    
    if (button) {
        button.disabled = true;
    }
    if (buttonText) {
        buttonText.textContent = "Đang gửi...";
    }

    try {
        const response = await fetch(`${API_URL}?action=register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData)
        });

        if (response.status === SUCCESS_STATUS) {
            showNotification("Mã xác nhận mới đã được gửi!", "success");
            
            // Start countdown
            let countdown = 60;
            const countdownInterval = setInterval(() => {
                if (buttonText) {
                    buttonText.textContent = `Gửi lại (${countdown}s)`;
                }
                countdown--;
                
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    if (button) {
                        button.disabled = false;
                    }
                    if (buttonText) {
                        buttonText.textContent = "Gửi lại mã";
                    }
                }
            }, 1000);
        } else {
            throw new Error("Không thể gửi lại mã xác nhận");
        }
    } catch (error) {
        showNotification(error.message, "error");
        if (button) {
            button.disabled = false;
        }
        if (buttonText) {
            buttonText.textContent = "Gửi lại mã";
        }
    }
}

// Event Listeners - Fixed with null checks
document.addEventListener("DOMContentLoaded", () => {
    // Load stores for registration form
    loadStores();

    // Automatic time-based theme system
    function setAutomaticTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        // Dark mode: 18:00 (6 PM) to 06:59 (7 AM)
        // Light mode: 07:00 (7 AM) to 17:59 (6 PM)
        const isDarkTime = hour >= 18 || hour < 7;
        const newTheme = isDarkTime ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        
        // Update theme switch icon if it exists
        const themeSwitch = document.getElementById("themeSwitch");
        if (themeSwitch) {
            const icon = themeSwitch.querySelector(".material-icons-round");
            if (icon) {
                icon.textContent = newTheme === "light" ? "dark_mode" : "light_mode";
            }
        }
        
        return newTheme;
    }
    
    // Initialize automatic theme
    setAutomaticTheme();
    
    // Update theme every minute to catch time changes
    setInterval(setAutomaticTheme, 60000);
    
    // Remove manual theme toggle functionality - now automatic
    const themeSwitch = document.getElementById("themeSwitch");
    if (themeSwitch) {
        // Display current time-based theme info on click
        themeSwitch.addEventListener("click", () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const message = currentTheme === "dark" 
                ? `🌙 Chế độ tối (${timeString}) - Tự động từ 6:00 PM đến 7:00 AM`
                : `☀️ Chế độ sáng (${timeString}) - Tự động từ 7:00 AM đến 6:00 PM`;
            
            showNotification(message, "info", 3000);
        });
    }

    // Remember me
    const rememberedId = localStorage.getItem(REMEMBER_ME_KEY);
    const loginEmployeeIdInput = document.getElementById("loginEmployeeId");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    
    if (rememberedId && loginEmployeeIdInput && rememberMeCheckbox) {
        loginEmployeeIdInput.value = rememberedId;
        rememberMeCheckbox.checked = true;
    }

    // Password strength
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener("input", (e) => {
            checkPasswordStrength(e.target.value);
        });
    }

    // Password visibility toggle
    document.querySelectorAll(".password-toggle").forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            const inputGroup = e.target.closest(".input-group");
            if (!inputGroup) return;
            
            const input = inputGroup.querySelector("input");
            const icon = toggle.querySelector(".material-icons-round");
            
            if (input && icon) {
                if (input.type === "password") {
                    input.type = "text";
                    icon.textContent = "visibility_off";
                } else {
                    input.type = "password";
                    icon.textContent = "visibility";
                }
            }
        });
    });

    // Form switching
    const goToRegisterBtn = document.getElementById("goToRegister");
    const backToLoginBtn = document.getElementById("backToLogin");
    const backToRegisterBtn = document.getElementById("backToRegister");
    const resendCodeBtn = document.getElementById("resendCodeBtn");
    
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    if (backToRegisterBtn) {
        backToRegisterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    if (resendCodeBtn) {
        resendCodeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            resendVerificationCode();
        });
    }

    // Verification code input formatting
    const verificationCodeInput = document.getElementById("verificationCode");
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener("input", (e) => {
            // Convert to uppercase and limit to 8 characters
            e.target.value = e.target.value.toUpperCase().slice(0, 8);
        });
    }

    // Form submissions
    if (elements.loginForm) {
        elements.loginForm.addEventListener("submit", handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener("submit", handleRegister);
    }

    if (elements.verificationForm) {
        elements.verificationForm.addEventListener("submit", handleVerification);
    }
});

// Security Features
document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
    }
});

document.addEventListener("contextmenu", (e) => e.preventDefault());

// Modern CSS Animation System (GSAP Replacement)
function initializeModernAnimations() {
    // CSS-based animations initialized for login page

    // Add entrance animation class to elements
    const authContainer = document.querySelector('.auth-container');
    const formContainers = document.querySelectorAll('.form-container');
    const glassCircles = document.querySelectorAll('.glass-circle');
    const stars = document.querySelectorAll('.star');

    // Apply entrance animations
    if (authContainer) {
        authContainer.classList.add('animate-entrance');
    }

    formContainers.forEach((container, index) => {
        setTimeout(() => {
            container.classList.add('animate-entrance-delayed');
        }, index * 100);
    });

    glassCircles.forEach((circle, index) => {
        setTimeout(() => {
            circle.classList.add('animate-float');
        }, index * 300);
    });

    stars.forEach((star, index) => {
        setTimeout(() => {
            star.classList.add('animate-twinkle');
        }, index * 50);
    });

    // Enhanced input focus effects
    const inputs = document.querySelectorAll('.input-group input, .input-group select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const inputGroup = input.closest('.input-group');
            const icon = inputGroup?.querySelector('.input-icon');
            
            inputGroup?.classList.add('input-focused');
            icon?.classList.add('icon-focused');
        });

        input.addEventListener('blur', () => {
            const inputGroup = input.closest('.input-group');
            const icon = inputGroup?.querySelector('.input-icon');
            
            inputGroup?.classList.remove('input-focused');
            icon?.classList.remove('icon-focused');
        });
    });

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.classList.add('btn-pressed');
        });

        button.addEventListener('mouseup', () => {
            button.classList.remove('btn-pressed');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('btn-pressed');
        });
    });

    // CSS-based animations initialized successfully
}

// CSS-based form transition system
function animateFormTransition(hideElement, showElement) {
    if (!hideElement || !showElement) return;

    // Hide current form
    hideElement.classList.add('form-slide-out');
    
    setTimeout(() => {
        hideElement.classList.remove('active', 'form-slide-out');
        showElement.classList.add('active');
        showElement.classList.add('form-slide-in');
        
        setTimeout(() => {
            showElement.classList.remove('form-slide-in');
        }, 300);
    }, 300);
}

// Enhanced notification system without GSAP
function enhanceNotificationSystem() {
    const originalShowNotification = window.showNotification;
    if (typeof originalShowNotification === 'function') {
        window.showNotification = function(message, type = 'info', duration = 3000) {
            const notification = document.getElementById('notification');
            if (notification) {
                // Set content first
                originalShowNotification(message, type, duration);
                
                // Add CSS animation class
                notification.classList.add('notification-bounce-in');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    notification.classList.remove('notification-bounce-in');
                }, 600);
                
                // Add slide-out animation before hiding
                setTimeout(() => {
                    notification.classList.add('notification-slide-out');
                }, duration - 300);
            }
        };
    }
}

// Initialize modern animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        initializeModernAnimations();
        enhanceNotificationSystem();
    }, 100);
});
