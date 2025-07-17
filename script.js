// Constants
const API_URL = "https://zewk.tocotoco.workers.dev";
const TOKEN_KEY = "authToken";
const REMEMBER_ME_KEY = "rememberedEmployeeId";
const THEME_KEY = "theme";
const SUCCESS_STATUS = 200;
const ACCOUNT_EXISTS_STATUS = 209;
const PHONE_EXISTS_STATUS = 210;
const EMAIL_EXISTS_STATUS = 211;


// Create stars
function createStars(count) {
    const stars = document.querySelector('.stars');
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        
        stars.appendChild(star);
    }
}

// Create light streaks
function createLightStreaks(count) {
    const container = document.querySelector('.light-streaks');
    
    for (let i = 0; i < count; i++) {
        const streak = document.createElement('div');
        streak.className = 'light-streak';
        
        // Random position and delay
        streak.style.left = `${Math.random() * 100}%`;
        streak.style.animationDelay = `${Math.random() * 8}s`;
        streak.style.height = `${Math.random() * 200 + 100}px`;
        
        container.appendChild(streak);
    }
}

// Initialize background effects
document.addEventListener('DOMContentLoaded', () => {
    createStars(100);  // Create 100 stars
    createLightStreaks(20);  // Create 20 light streaks
});
// DOM Elements
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

// Form Transitions
function showRegisterForm() {
    elements.loginContainer.classList.remove('active');
    elements.registerContainer.classList.add('active');
    elements.registerForm.reset();
}

function showLoginForm() {
    elements.registerContainer.classList.remove('active');
    elements.loginContainer.classList.add('active');
    elements.loginForm.reset();
}

// Notification System
function showNotification(message, type = "success", duration = 3000) {
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
        elements.notification.classList.remove("show");
    }, duration);
}

// Password Strength Checker
function checkPasswordStrength(password) {
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

// Form Validation
function isValidForm(data) {
    const patterns = {
        employeeId: /^(MC|VP|ADMIN)\d*$/,
        password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[0-9]{10}$/,
        fullName: /^[A-Za-zÀ-ỹ\s]{2,30}$/
    };

    const messages = {
        employeeId: "Mã nhân viên không hợp lệ",
        password: "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường và 1 số",
        email: "Email không hợp lệ",
        phone: "Số điện thoại không hợp lệ",
        fullName: "Họ tên không hợp lệ"
    };

    for (const [field, value] of Object.entries(data)) {
        if (patterns[field] && !patterns[field].test(value)) {
            showNotification(messages[field], "warning");
            return false;
        }
    }

    return true;
}

// API Calls
async function handleLogin(event) {
    event.preventDefault();
    
    const button = elements.loginForm.querySelector("button");
    button.classList.add("loading");
    
    const formData = {
        loginEmployeeId: elements.loginForm.loginEmployeeId.value.trim(),
        loginPassword: elements.loginForm.loginPassword.value
    };

    try {
        const response = await fetch(`${API_URL}?action=login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem(TOKEN_KEY, result.token);
            
            if (elements.loginForm.rememberMe.checked) {
                localStorage.setItem(REMEMBER_ME_KEY, formData.loginEmployeeId);
            }

            showNotification("Đăng nhập thành công!");
            setTimeout(() => window.location.href = "dashboard.html", 1500);
        } else {
            throw new Error(response.status === 401 ? "Mật khẩu không đúng" : "Mã nhân viên không tồn tại");
        }
    } catch (error) {
        showNotification(error.message, "error");
    } finally {
        button.classList.remove("loading");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const button = elements.registerForm.querySelector("button");
    button.classList.add("loading");
    
    const formData = {
        employeeId: elements.registerForm.employeeId.value.trim(),
        password: elements.registerForm.password.value,
        fullName: elements.registerForm.fullName.value.trim(),
        phone: elements.registerForm.phone.value.trim(),
        email: elements.registerForm.email.value.trim(),
        position: "NV"
    };

    if (!isValidForm(formData)) {
        button.classList.remove("loading");
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
        button.classList.remove("loading");
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle
    document.getElementById("themeSwitch").addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    });

    // Remember me
    const rememberedId = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberedId) {
        document.getElementById("loginEmployeeId").value = rememberedId;
        document.getElementById("rememberMe").checked = true;
    }

    // Password strength
    document.getElementById("password").addEventListener("input", (e) => {
        checkPasswordStrength(e.target.value);
    });

    // Password visibility toggle
    document.querySelectorAll(".password-toggle").forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            const input = e.target.closest(".input-group").querySelector("input");
            const icon = toggle.querySelector(".material-icons-round");
            if (input.type === "password") {
                input.type = "text";
                icon.textContent = "visibility_off";
            } else {
                input.type = "password";
                icon.textContent = "visibility";
            }
        });
    });

    // Form switching
    document.getElementById("goToRegister").addEventListener("click", (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    document.getElementById("backToLogin").addEventListener("click", (e) => {
        e.preventDefault();
        showLoginForm();
    });

    // Form submissions
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.registerForm.addEventListener("submit", handleRegister);
});

// Security Features
document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
    }
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
