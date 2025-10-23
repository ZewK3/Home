// Constants
const API_URL = "https://hrm-api.tocotoco.workers.dev/";
const TOKEN_KEY = "authToken";
const REMEMBER_ME_KEY = "rememberedEmployeeId";
const THEME_KEY = "theme";
const SUCCESS_STATUS = 200;
const ACCOUNT_EXISTS_STATUS = 209;
const PHONE_EXISTS_STATUS = 210;
const EMAIL_EXISTS_STATUS = 211;


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
    
    // Add null check to prevent errors
    if (!stars) {
        console.warn('Stars container not found');
        return;
    }
    
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
    
    // Add null check to prevent errors
    if (!container) {
        console.warn('Light streaks container not found');
        return;
    }
    
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
    forgotPasswordForm: document.getElementById("forgotPasswordForm"),
    resetPasswordForm: document.getElementById("resetPasswordForm"),
    loginContainer: document.getElementById("loginFormContainer"),
    registerContainer: document.getElementById("registerFormContainer"),
    verificationContainer: document.getElementById("verificationFormContainer"),
    forgotPasswordContainer: document.getElementById("forgotPasswordFormContainer"),
    resetPasswordContainer: document.getElementById("resetPasswordFormContainer"),
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
        if (elements.forgotPasswordContainer) {
            elements.forgotPasswordContainer.classList.remove('active');
        }
        if (elements.resetPasswordContainer) {
            elements.resetPasswordContainer.classList.remove('active');
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
        if (elements.forgotPasswordContainer) {
            elements.forgotPasswordContainer.classList.remove('active');
        }
        if (elements.resetPasswordContainer) {
            elements.resetPasswordContainer.classList.remove('active');
        }
        if (elements.loginForm) {
            elements.loginForm.reset();
        }
    }
}

function showForgotPasswordForm() {
    if (elements.loginContainer && elements.forgotPasswordContainer) {
        elements.loginContainer.classList.remove('active');
        elements.registerContainer.classList.remove('active');
        elements.forgotPasswordContainer.classList.add('active');
        if (elements.resetPasswordContainer) {
            elements.resetPasswordContainer.classList.remove('active');
        }
        if (elements.forgotPasswordForm) {
            elements.forgotPasswordForm.reset();
        }
    }
}

function showResetPasswordForm() {
    if (elements.forgotPasswordContainer && elements.resetPasswordContainer) {
        elements.forgotPasswordContainer.classList.remove('active');
        elements.resetPasswordContainer.classList.add('active');
        if (elements.resetPasswordForm) {
            elements.resetPasswordForm.reset();
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
        // Skip employeeId validation for registration (auto-generated by server)
        if (field === 'employeeId' && !value) continue;
        
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
        // Loading stores from API using RESTful endpoint
        const data = await apiClient.getStores();
        
        if (data && data.success) {
            // Stores data processed successfully
            
            // Check multiple possible data formats
            let stores = [];
            if (Array.isArray(data.data)) {
                stores = data.data;
            } else if (data.results && Array.isArray(data.results)) {
                stores = data.results;
            } else if (data.stores && Array.isArray(data.stores)) {
                stores = data.stores;
            } else if (Array.isArray(data)) {
                stores = data;
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
        // Use RESTful API login endpoint
        const result = await apiClient.login(formData);
        
        // Store authToken encrypted
        SecureStorage.set(TOKEN_KEY, result.token);
        
        // Store userData encrypted (get from response)
        if (result.userData) {
            SecureStorage.set('userData', result.userData);
        }
        
        const rememberMe = elements.loginForm.rememberMe;
        if (rememberMe && rememberMe.checked) {
            SecureStorage.set(REMEMBER_ME_KEY, formData.loginEmployeeId);
        }
        
        showNotification("Đăng nhập thành công! Đang chuyển hướng...", "success");
        if (buttonText) buttonText.textContent = "Thành công!";
        
        // Hide loginFormContainer to prevent user interaction during redirect
        if (elements.loginContainer) {
            elements.loginContainer.style.display = "none";
        }
        
        setTimeout(() => window.location.href = "../pages/dashboard.html", 1500);
    } catch (error) {
        // Handle pending approval case
        if (error.message && error.message.includes('phê duyệt')) {
            showNotification("Tài khoản của bạn đang chờ phê duyệt từ quản lý cửa hàng. Vui lòng đợi thông báo.", "error");
        } else {
            showNotification(error.message || "Đăng nhập thất bại", "error");
        }
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
        // employeeId is now auto-generated by server (removed from form)
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
        const data = await apiClient.register(formData);

        if (data.success) {
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
        } else {
            // Handle various error cases
            if (data.message && data.message.includes("đã tồn tại")) {
                showNotification(data.message, "warning");
            } else {
                throw new Error(data.message || "Đăng ký thất bại");
            }
        }
    } catch (error) {
        showNotification(error.message || "Đăng ký thất bại", "error");
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
        const data = await apiClient.verifyEmail({
            employeeId: registrationData.employeeId,
            verificationCode: verificationCode
        });

        if (data.success || data.message.includes("thành công")) {
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
        showNotification(error.message || "Mã xác nhận không hợp lệ", "error");
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
        const data = await apiClient.register(registrationData);

        if (data.success) {
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
        showNotification(error.message || "Không thể gửi lại mã xác nhận", "error");
        if (button) {
            button.disabled = false;
        }
        if (buttonText) {
            buttonText.textContent = "Gửi lại mã";
        }
    }
}

// Handle forgot password form submission
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const button = elements.forgotPasswordForm.querySelector("button[type='submit']");
    const buttonText = button?.querySelector(".btn-text");
    const buttonLoader = button?.querySelector(".btn-loader");
    
    if (button) {
        button.disabled = true;
        button.classList.add("loading");
    }
    if (buttonText) {
        buttonText.textContent = "Đang gửi...";
    }
    if (buttonLoader) {
        buttonLoader.style.display = "block";
    }

    try {
        const formData = new FormData(elements.forgotPasswordForm);
        const email = formData.get("forgotEmail");

        const response = await fetch(`${API_URL}?action=forgotPassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        
        if (response.status === SUCCESS_STATUS) {
            showNotification("Mã đặt lại mật khẩu đã được gửi đến email của bạn!", "success");
            showResetPasswordForm();
        } else {
            throw new Error(result.message || "Không thể gửi mã đặt lại mật khẩu");
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        if (button) {
            button.disabled = false;
            button.classList.remove("loading");
        }
        if (buttonText) {
            buttonText.textContent = "Lấy mã đổi mật khẩu";
        }
        if (buttonLoader) {
            buttonLoader.style.display = "none";
        }
    }
}

// Handle reset password form submission
async function handleResetPassword(e) {
    e.preventDefault();
    
    const button = elements.resetPasswordForm.querySelector("button[type='submit']");
    const buttonText = button?.querySelector(".btn-text");
    const buttonLoader = button?.querySelector(".btn-loader");
    
    if (button) {
        button.disabled = true;
        button.classList.add("loading");
    }
    if (buttonText) {
        buttonText.textContent = "Đang xử lý...";
    }
    if (buttonLoader) {
        buttonLoader.style.display = "block";
    }

    try {
        const formData = new FormData(elements.resetPasswordForm);
        const resetCode = formData.get("resetCode");
        const newPassword = formData.get("newPassword");
        const confirmNewPassword = formData.get("confirmNewPassword");

        // Validate passwords match
        if (newPassword !== confirmNewPassword) {
            throw new Error("Mật khẩu xác nhận không khớp");
        }

        // Validate password strength
        if (newPassword.length < 6) {
            throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
        }

        const response = await fetch(`${API_URL}?action=resetPassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                resetCode, 
                newPassword 
            })
        });

        const result = await response.json();
        
        if (response.status === SUCCESS_STATUS) {
            showNotification("Mật khẩu đã được đặt lại thành công!", "success");
            setTimeout(() => {
                showLoginForm();
            }, 2000);
        } else {
            throw new Error(result.message || "Không thể đặt lại mật khẩu");
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        if (button) {
            button.disabled = false;
            button.classList.remove("loading");
        }
        if (buttonText) {
            buttonText.textContent = "Đặt lại mật khẩu";
        }
        if (buttonLoader) {
            buttonLoader.style.display = "none";
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
    const rememberedId = SecureStorage.get(REMEMBER_ME_KEY);
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
    const goToLoginBtn = document.getElementById("goToLogin");
    const backToLoginBtn = document.getElementById("backToLogin");
    const backToRegisterBtn = document.getElementById("backToRegister");
    const resendCodeBtn = document.getElementById("resendCodeBtn");
    const forgotPasswordBtn = document.querySelector(".forgot-password");
    const goToLoginFromForgotBtn = document.getElementById("goToLoginFromForgot");
    const goToForgotFromResetBtn = document.getElementById("goToForgotFromReset");
    
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    if (goToLoginBtn) {
        goToLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showLoginForm();
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

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showForgotPasswordForm();
        });
    }

    if (goToLoginFromForgotBtn) {
        goToLoginFromForgotBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    if (goToForgotFromResetBtn) {
        goToForgotFromResetBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showForgotPasswordForm();
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

    if (elements.forgotPasswordForm) {
        elements.forgotPasswordForm.addEventListener("submit", handleForgotPassword);
    }

    if (elements.resetPasswordForm) {
        elements.resetPasswordForm.addEventListener("submit", handleResetPassword);
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

// Terms of Use and Privacy Policy Modals
function showTermsModal() {
    const modal = document.createElement('div');
    modal.className = 'terms-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeTermsModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Điều Khoản Sử Dụng</h2>
                <button class="modal-close" onclick="closeTermsModal()">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
            <div class="modal-body">
                <h3>1. Chấp Nhận Điều Khoản</h3>
                <p>Bằng việc truy cập và sử dụng hệ thống ZewK Management System, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng này.</p>
                
                <h3>2. Quyền và Nghĩa Vụ Người Dùng</h3>
                <p>• Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình</p>
                <p>• Không được chia sẻ tài khoản cho người khác sử dụng</p>
                <p>• Tuân thủ các quy định nội bộ của công ty</p>
                <p>• Sử dụng hệ thống đúng mục đích và phạm vi được phép</p>
                
                <h3>3. Bảo Mật Thông Tin</h3>
                <p>• Tất cả thông tin cá nhân và dữ liệu công việc được bảo mật tuyệt đối</p>
                <p>• Hệ thống sử dụng công nghệ mã hóa hiện đại để bảo vệ dữ liệu</p>
                <p>• Chỉ nhân viên có thẩm quyền mới được truy cập thông tin tương ứng</p>
                
                <h3>4. Giới Hạn Trách Nhiệm</h3>
                <p>ZewK Management System không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng sai quy định hoặc vi phạm bảo mật từ phía người dùng.</p>
                
                <h3>5. Thay Đổi Điều Khoản</h3>
                <p>Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào. Người dùng sẽ được thông báo về những thay đổi quan trọng.</p>
                
                <p class="terms-date"><strong>Ngày có hiệu lực:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeTermsModal()">Đã hiểu</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showPrivacyModal() {
    const modal = document.createElement('div');
    modal.className = 'terms-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeTermsModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Chính Sách Bảo Mật</h2>
                <button class="modal-close" onclick="closeTermsModal()">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
            <div class="modal-body">
                <h3>1. Thu Thập Thông Tin</h3>
                <p>Chúng tôi thu thập các thông tin sau:</p>
                <p>• Thông tin cá nhân: Họ tên, email, số điện thoại</p>
                <p>• Thông tin công việc: Mã nhân viên, vị trí, cửa hàng</p>
                <p>• Dữ liệu hoạt động: Chấm công, yêu cầu nghỉ phép, báo cáo</p>
                
                <h3>2. Sử Dụng Thông Tin</h3>
                <p>Thông tin được thu thập để:</p>
                <p>• Quản lý nhân sự và hoạt động của công ty</p>
                <p>• Tạo báo cáo và phân tích hiệu suất</p>
                <p>• Liên lạc về công việc và thông báo quan trọng</p>
                <p>• Cải thiện trải nghiệm sử dụng hệ thống</p>
                
                <h3>3. Bảo Vệ Dữ Liệu</h3>
                <p>• Mã hóa end-to-end cho tất cả dữ liệu nhạy cảm</p>
                <p>• Hệ thống xác thực 2 lớp (2FA) cho tài khoản quan trọng</p>
                <p>• Backup định kỳ và khôi phục dữ liệu an toàn</p>
                <p>• Kiểm soát truy cập dựa trên vai trò và quyền hạn</p>
                
                <h3>4. Chia Sẻ Thông Tin</h3>
                <p>Chúng tôi KHÔNG chia sẻ thông tin cá nhân cho bên thứ ba trừ khi:</p>
                <p>• Có yêu cầu từ cơ quan pháp luật có thẩm quyền</p>
                <p>• Được sự đồng ý rõ ràng từ người dùng</p>
                <p>• Cần thiết để bảo vệ quyền lợi hợp pháp của công ty</p>
                
                <h3>5. Quyền Của Người Dùng</h3>
                <p>Bạn có quyền:</p>
                <p>• Truy cập và cập nhật thông tin cá nhân</p>
                <p>• Yêu cầu xóa tài khoản và dữ liệu liên quan</p>
                <p>• Từ chối nhận thông báo không bắt buộc</p>
                <p>• Khiếu nại về việc xử lý dữ liệu cá nhân</p>
                
                <p class="terms-date"><strong>Cập nhật lần cuối:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeTermsModal()">Đã hiểu</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeTermsModal() {
    const modal = document.querySelector('.terms-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}
