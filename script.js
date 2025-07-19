// Constants
const API_URL = "https://zewk.tocotoco.workers.dev";
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
    loginContainer: document.getElementById("loginFormContainer"),
    registerContainer: document.getElementById("registerFormContainer"),
    notification: document.getElementById("notification"),
    themeSwitch: document.getElementById("themeSwitch"),
    strengthMeter: document.querySelector(".strength-meter div"),
    strengthText: document.querySelector(".strength-text")
};

// Form Transitions - Fixed with null checks
function showRegisterForm() {
    if (elements.loginContainer && elements.registerContainer) {
        elements.loginContainer.classList.remove('active');
        elements.registerContainer.classList.add('active');
        if (elements.registerForm) {
            elements.registerForm.reset();
        }
    }
}

function showLoginForm() {
    if (elements.registerContainer && elements.loginContainer) {
        elements.registerContainer.classList.remove('active');
        elements.loginContainer.classList.add('active');
        if (elements.loginForm) {
            elements.loginForm.reset();
        }
    }
}

// Notification System - Fixed with null checks
function showNotification(message, type = "success", duration = 3000) {
    if (!elements.notification) {
        console.warn("Notification element not found");
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
        console.warn("Password strength elements not found");
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
async function handleLogin(event) {
    event.preventDefault();
    
    if (!elements.loginForm) {
        showNotification("Form không tồn tại", "error");
        return;
    }
    
    const button = elements.loginForm.querySelector("button");
    const buttonText = button?.querySelector(".btn-text");
    
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
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

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
            
            setTimeout(() => window.location.href = "dashboard.html", 1500);
        } else {
            const errorData = await response.json().catch(() => ({}));
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
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    if (!elements.registerForm) {
        showNotification("Form không tồn tại", "error");
        return;
    }
    
    const button = elements.registerForm.querySelector("button");
    if (button) {
        button.classList.add("loading");
    }
    
    const formData = {
        employeeId: elements.registerForm.employeeId?.value.trim() || "",
        password: elements.registerForm.password?.value || "",
        fullName: elements.registerForm.fullName?.value.trim() || "",
        phone: elements.registerForm.phone?.value.trim() || "",
        email: elements.registerForm.email?.value.trim() || "",
        position: "NV"
    };

    if (!isValidForm(formData)) {
        if (button) button.classList.remove("loading");
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        switch (response.status) {
            case SUCCESS_STATUS:
                showNotification("Đăng ký thành công!");
                setTimeout(showLoginForm, 1500);
                break;
            case ACCOUNT_EXISTS_STATUS:
                showNotification("Tài khoản đã tồn tại!", "warning");
                break;
            case PHONE_EXISTS_STATUS:
                showNotification("Số điện thoại đã được sử dụng!", "warning");
                break;
            case EMAIL_EXISTS_STATUS:
                showNotification("Email đã được sử dụng!", "warning");
                break;
            default:
                throw new Error("Đăng ký thất bại");
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        if (button) button.classList.remove("loading");
    }
}

// Event Listeners - Fixed with null checks
document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle
    const themeSwitch = document.getElementById("themeSwitch");
    if (themeSwitch) {
        themeSwitch.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
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

    // Form submissions
    if (elements.loginForm) {
        elements.loginForm.addEventListener("submit", handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener("submit", handleRegister);
    }
});

// Security Features
document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
    }
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
