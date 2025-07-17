// Constants and Configuration
const CONFIG = {
    API_URL: "https://zewk.tocotoco.workers.dev",
    STORAGE_KEYS: {
        AUTH_TOKEN: "authToken",
        USER_DATA: "loggedInUser",
        THEME: "theme",
        REMEMBER_ME: "rememberedEmployeeId"
    },
    POLLING_INTERVAL: 3000,
    MAX_RETRY_ATTEMPTS: 3,
    DEFAULT_NOTIFICATION_DURATION: 3000
};

// Utility Functions
const utils = {
    showNotification(message, type = "success", duration = CONFIG.DEFAULT_NOTIFICATION_DURATION) {
        const notification = document.getElementById("notification");
        if (!notification) return;

        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
        `;
        
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove("show");
        }, duration);
    },

    formatDate(date) {
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    validateInput(value, type) {
        const patterns = {
            employeeId: /^(MC|VP|ADMIN)\d*$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[0-9]{10}$/,
            password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/
        };

        return patterns[type]?.test(value) ?? true;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    async fetchWithRetry(url, options = {}, retries = CONFIG.MAX_RETRY_ATTEMPTS) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.fetchWithRetry(url, options, retries - 1);
            }
            throw error;
        }
    }
};

// Auth Manager
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA));
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE_KEYS.AUTH_TOKEN && !e.newValue) {
                this.logout();
            }
        });
    }

    async checkAuthentication() {
        if (!this.userData || !this.token) {
            window.location.href = "index.html";
            return null;
        }

        try {
            const user = await utils.fetchWithRetry(
                `${CONFIG.API_URL}?action=getUser&employeeId=${this.userData.loginEmployeeId}&token=${this.token}`
            );

            if (user) {
                document.getElementById("userInfo").textContent = 
                    `Chào ${user.fullName} - ${user.employeeId}`;
                MenuManager.updateMenuByRole(user.position);
                return user;
            }
            throw new Error("Invalid session");
        } catch (error) {
            utils.showNotification("Phiên hết hạn, vui lòng đăng nhập lại", "warning");
            this.logout();
            return null;
        }
    }

    async refreshToken() {
        try {
            const response = await utils.fetchWithRetry(
                `${CONFIG.API_URL}?action=refreshToken`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            if (response.token) {
                this.token = response.token;
                localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, this.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    setupLogoutHandler() {
        document.getElementById("logout")?.addEventListener("click", () => this.logout());
    }

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        window.location.href = "index.html";
    }
}

// Menu Manager
class MenuManager {
    static updateMenuByRole(userRole) {
        document.querySelectorAll("#menuList .menu-item").forEach(item => {
            const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
            item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
        });
        this.updateSubmenusByRole(userRole);
    }

    static updateSubmenusByRole(userRole) {
        ['#openSchedule', '#openTaskProcessing'].forEach(selector => {
            const menuItem = document.querySelector(selector)?.closest('.menu-item');
            if (menuItem) {
                const submenu = menuItem.querySelector('.submenu');
                if (submenu) {
                    submenu.querySelectorAll('.submenu-item').forEach(item => {
                        const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                        item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
                    });
                }
            }
        });
    }

    static setupMenuInteractions() {
        // Close all submenus initially
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.style.display = 'none';
        });

        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Close all other submenus
                    document.querySelectorAll('.submenu').forEach(other => {
                        if (other !== submenu) {
                            other.style.display = 'none';
                        }
                    });
                    // Toggle current submenu
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                });
            }
        });

        // Close submenus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.submenu').forEach(submenu => {
                    submenu.style.display = 'none';
                });
            }
        });
    }
}

// Schedule Manager
class ScheduleManager {
    constructor(user) {
        this.user = user;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('openScheduleRegistration')?.addEventListener('click', () => {
            this.showScheduleRegistration();
        });

        document.getElementById('openScheduleWork')?.addEventListener('click', () => {
            this.showScheduleWork();
        });

        document.getElementById('openOfficialworkschedule')?.addEventListener('click', () => {
            this.showOfficialSchedule();
        });
    }

    async showScheduleRegistration() {
        try {
            const response = await utils.fetchWithRetry(
                `${CONFIG.API_URL}?action=checkdk&employeeId=${this.user.employeeId}&token=${this.token}`
            );

            const mainContent = document.querySelector('.main');
            mainContent.innerHTML = `
                <h2>Đăng Ký Lịch Làm</h2>
                <form id="scheduleForm">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Giờ vào</th>
                                <th>Giờ ra</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateScheduleRows(response.shifts)}
                        </tbody>
                    </table>
                    <button type="submit" class="btn btn-primary">Lưu Lịch</button>
                </form>
            `;

            this.setupScheduleForm();
        } catch (error) {
            utils.showNotification("Không thể tải lịch làm việc", "error");
        }
    }

    generateScheduleRows(shifts = []) {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        return days.map(day => {
            const shift = shifts.find(s => s.day === day) || {};
            return `
                <tr>
                    <td>${day}</td>
                    <td>
                        <select name="${day}-start" class="time-select">
                            ${this.generateTimeOptions(8, 19, shift.startTime)}
                        </select>
                    </td>
                    <td>
                        <select name="${day}-end" class="time-select">
                            ${this.generateTimeOptions(12, 23, shift.endTime)}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    }

    generateTimeOptions(start, end, selected) {
        let options = '<option value="">Chọn giờ</option>';
        for (let i = start; i <= end; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            options += `<option value="${time}" ${selected === time ? 'selected' : ''}>${time}</option>`;
        }
        return options;
    }

    setupScheduleForm() {
        document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = this.collectScheduleFormData();
                await this.submitSchedule(formData);
                utils.showNotification("Lịch làm việc đã được lưu thành công!", "success");
            } catch (error) {
                utils.showNotification("Không thể lưu lịch làm việc", "error");
            }
        });
    }

    collectScheduleFormData() {
        const shifts = [];
        document.querySelectorAll('.schedule-table tbody tr').forEach(row => {
            const day = row.cells[0].textContent;
            const start = row.querySelector('[name$="-start"]').value;
            const end = row.querySelector('[name$="-end"]').value;
            if (start && end) {
                shifts.push({ day, startTime: start, endTime: end });
            }
        });
        return { employeeId: this.user.employeeId, shifts };
    }

    async submitSchedule(data) {
        return utils.fetchWithRetry(
            `${CONFIG.API_URL}?action=savedk&token=${this.token}`,
            {
                method: 'POST',
                body: JSON.stringify(data)
            }
        );
    }

    // Similar methods for showScheduleWork and showOfficialSchedule...
}

// Chat Manager
class ChatManager {
    constructor(user) {
        this.user = user;
        this.lastMessageId = 0;
        this.messageQueue = [];
        this.isProcessing = false;
        
        this.elements = {
            openButton: document.getElementById("openChatButton"),
            popup: document.getElementById("chatPopup"),
            messages: document.getElementById("chatMessages"),
            input: document.getElementById("messageInput"),
            sendButton: document.getElementById("sendButton")
        };

        this.initialize();
    }

    initialize() {
        if (!this.elements.openButton || !this.elements.popup) {
            console.error('Chat elements not found');
            return;
        }

        this.setupEventListeners();
        this.startMessagePolling();
    }

    setupEventListeners() {
        this.elements.openButton.addEventListener("click", () => this.toggleChat());

        this.elements.sendButton?.addEventListener("click", () => this.sendMessage());

        this.elements.input?.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Add scroll handler for lazy loading
        this.elements.messages?.addEventListener('scroll', utils.debounce(() => {
            if (this.elements.messages.scrollTop === 0) {
                this.loadMoreMessages();
            }
        }, 200));
    }

    toggleChat() {
        if (!this.elements.popup) return;
        
        const isVisible = this.elements.popup.style.display === "flex";
        this.elements.popup.style.display = isVisible ? "none" : "flex";
        
        if (!isVisible) {
            this.elements.input?.focus();
            this.loadInitialMessages();
        }
    }

    async sendMessage() {
        const message = this.elements.input?.value.trim();
        if (!message) return;

        this.messageQueue.push({
            content: message,
            timestamp: new Date().toISOString()
        });

        if (!this.isProcessing) {
            this.processMessageQueue();
        }

        this.elements.input.value = "";
    }

    async processMessageQueue() {
        if (this.isProcessing || this.messageQueue.length === 0) return;

        this.isProcessing = true;

        while (this.messageQueue.length > 0) {
            const { content, timestamp } = this.messageQueue.shift();
            try {
                await utils.fetchWithRetry(`${CONFIG.API_URL}?action=sendMessage`, {
                    method: "POST",
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
                        fullName: this.user.fullName,
                        position: this.user.position,
                        message: content,
                        timestamp
                    })
                });

                this.appendMessage({
                    message: content,
                    employeeId: this.user.employeeId,
                    fullName: this.user.fullName,
                    position: this.user.position,
                    time: timestamp
                });
            } catch (error) {
                console.error('Failed to send message:', error);
                this.messageQueue.unshift({ content, timestamp });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.isProcessing = false;
    }

    appendMessage(msg) {
        if (!this.elements.messages) return;

        const messageEl = document.createElement("div");
        messageEl.className = "message-wrapper";
        
        messageEl.innerHTML = `
            ${msg.employeeId !== this.user.employeeId ? 
                `<div class="message-sender">${msg.position}-${msg.fullName}</div>` : ''}
            <div class="message ${msg.employeeId === this.user.employeeId ? 'user-message' : 'bot-message'}">
                ${utils.escapeHtml(msg.message)}
            </div>
            <div class="message-time">${utils.formatDate(msg.time)}</div>
        `;

        this.elements.messages.appendChild(messageEl);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    async loadInitialMessages() {
        try {
            const messages = await utils.fetchWithRetry(`${CONFIG.API_URL}?action=getMessages`);
            this.elements.messages.innerHTML = '';
            messages.forEach(msg => this.appendMessage(msg));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }

    async loadMoreMessages() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const firstMessage = this.elements.messages.firstChild;
            const messages = await utils.fetchWithRetry(
                `${CONFIG.API_URL}?action=getMessages&before=${firstMessage?.dataset.timestamp}`
            );

            messages.reverse().forEach(msg => {
                const messageEl = this.createMessageElement(msg);
                this.elements.messages.insertBefore(messageEl, this.elements.messages.firstChild);
            });
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            this.isLoading = false;
        }
    }

    startMessagePolling() {
        setInterval(async () => {
            if (this.elements.popup.style.display !== "flex") return;

            try {
                const messages = await utils.fetchWithRetry(
                    `${CONFIG.API_URL}?action=getMessages&after=${this.lastMessageId}`
                );
                
                messages.forEach(msg => {
                    if (msg.id > this.lastMessageId) {
                        this.lastMessageId = msg.id;
                        this.appendMessage(msg);
                    }
                });
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, CONFIG.POLLING_INTERVAL);
    }
}

// Theme Manager
class ThemeManager {
    static initialize() {
        const themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;

        // Set initial theme
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Setup theme toggle
        themeSwitch.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
            this.updateThemeIcon(newTheme);
        });

        // Watch for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (!localStorage.getItem(CONFIG.STORAGE_KEYS.THEME)) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                this.updateThemeIcon(newTheme);
            }
        });
    }

    static updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-switch .material-icons-round');
        if (icon) {
            icon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
        }
    }
}

// Initialize Application
(async () => {
    // Setup security
    document.addEventListener("keydown", (e) => {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
            e.preventDefault();
        }
    });
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Initialize managers
    const authManager = new AuthManager();
    const user = await authManager.checkAuthentication();

    if (user) {
        authManager.setupLogoutHandler();
        MenuManager.setupMenuInteractions();
        ThemeManager.initialize();

        // Initialize features
        new ChatManager(user);
        new ScheduleManager(user);

        // Setup seasonal themes
        const currentMonth = new Date().getMonth();
        if (currentMonth === 11) { // December
            document.body.classList.add("christmas-theme");
        } else if (currentMonth === 0) { // January
            document.body.classList.add("new-year-theme");
        }

        // Mobile optimization
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector(".sidebar");
            document.addEventListener("click", (e) => {
                if (!sidebar.contains(e.target) && 
                    !e.target.closest(".menu-toggle")) {
                    sidebar.classList.remove("active");
                }
            });
        }
    }
})();
