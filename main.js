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
    MAX_RETRY_ATTEMPTS: 3
};

// Utility Functions
const utils = {
    showNotification(message, type = "success", duration = 3000) {
        const notification = document.getElementById("notification");
        if (!notification) {
            console.warn("Notification element not found");
            return;
        }

        const icons = {
            success: '✓',
            error: '✕', 
            warning: '⚠'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || '✓'}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
        `;
        
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            if (notification) {
                notification.classList.remove("show");
            }
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

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    async fetchAPI(endpoint, options = {}) {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Global notification function for backward compatibility
function showNotification(message, type, duration) {
    utils.showNotification(message, type, duration);
}

// Advanced Chat Manager Implementation
class ChatManager {
    constructor(user) {
        this.user = user;
        this.apiUrl = CONFIG.API_URL;
        this.offset = 0;
        this.limit = 50;
        this.lastId = 0;
        this.loading = false;

        this.openChatButton = document.getElementById("openChatButton");
        this.chatPopup = document.getElementById("chatPopup");
        this.messageInput = document.getElementById("messageInput");
        this.chatMessages = document.getElementById("chatMessages");
        this.sendButton = document.getElementById("sendButton");

        // Check if chat elements exist
        if (!this.openChatButton || !this.chatPopup || !this.messageInput || !this.chatMessages || !this.sendButton) {
            console.warn("Chat elements not found. Chat functionality may not work properly.");
            this.createChatElements();
        }

        this.initialize();
    }

    createChatElements() {
        // Create missing chat elements if they don't exist
        if (!this.openChatButton) {
            this.openChatButton = document.createElement('div');
            this.openChatButton.id = 'openChatButton';
            this.openChatButton.innerHTML = '<span>💬</span>';
            this.openChatButton.className = 'chat-button';
            document.body.appendChild(this.openChatButton);
        }

        if (!this.chatPopup) {
            const chatHTML = `
                <div id="chatPopup" class="chat-popup" style="display: none;">
                    <div class="chat-header">Chat with Support</div>
                    <div id="chatMessages" class="chat-messages"></div>
                    <div class="chat-input">
                        <input type="text" id="messageInput" placeholder="Type a message...">
                        <button id="sendButton">Send</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', chatHTML);
            
            // Re-get references
            this.chatPopup = document.getElementById("chatPopup");
            this.messageInput = document.getElementById("messageInput");
            this.chatMessages = document.getElementById("chatMessages");
            this.sendButton = document.getElementById("sendButton");
        }
    }

    initialize() {
        this.setupEventListeners();
        this.startMessagePolling();
    }

    setupEventListeners() {
        this.openChatButton?.addEventListener("click", () => this.toggleChatPopup());
        this.sendButton?.addEventListener("click", () => this.sendMessage());
        this.messageInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });
    }

    toggleChatPopup() {
        const isHidden = this.chatPopup.style.display === "none" || this.chatPopup.style.display === "";
        this.chatPopup.style.display = isHidden ? "flex" : "none";
        if (isHidden) this.loadInitialMessages();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        const payload = {
            employeeId: this.user.employeeId,
            fullName: this.user.fullName,
            position: this.user.position,
            message
        };

        try {
            const response = await fetch(`${this.apiUrl}?action=sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                this.messageInput.value = "";
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Send message error:", error);
            showNotification("Không thể gửi tin nhắn", "error", 3000);
        }
    }

    createMessageElement(msg, prepend = false) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper");

        if (msg.employeeId !== this.user.employeeId) {
            const sender = document.createElement("p");
            sender.textContent = `${msg.position || 'NV'}-${msg.fullName}`;
            sender.classList.add("message-sender");
            this.addSenderClickHandler(sender, msg.employeeId);
            wrapper.appendChild(sender);
        }

        const container = document.createElement("div");
        container.classList.add("message-container");

        const content = document.createElement("p");
        content.textContent = msg.message;
        content.classList.add(msg.employeeId === this.user.employeeId ? "user-message" : "bot-message");
        container.appendChild(content);

        if (msg.employeeId === this.user.employeeId) {
            const deleteBtn = this.createDeleteButton(msg.id, wrapper, msg.time);
            container.appendChild(deleteBtn);
            this.addHoverEffects(wrapper, deleteBtn, msg.time);
        }

        wrapper.appendChild(container);

        const time = document.createElement("p");
        time.textContent = msg.time;
        time.classList.add("message-time");
        wrapper.appendChild(time);

        this.chatMessages[prepend ? "prepend" : "appendChild"](wrapper);
        if (!prepend) this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    createDeleteButton(messageId, wrapper, messageTime) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Xóa";
        deleteBtn.classList.add("delete-button");
        deleteBtn.style.display = "none";

        deleteBtn.addEventListener("click", async () => {
            if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) return;

            try {
                const response = await fetch(`${this.apiUrl}?action=deleteMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messageId })
                });

                if (response.ok) {
                    wrapper.remove();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Delete failed");
                }
            } catch (error) {
                console.error("Delete message error:", error);
                showNotification(error.message || "Không thể xóa tin nhắn", "error", 3000);
            }
        });

        return deleteBtn;
    }

    addHoverEffects(wrapper, deleteBtn, messageTime) {
        wrapper.addEventListener("mouseover", () => {
            // Lấy thời gian hiện tại
            const currentTime = new Date();
            
            // Parse messageTime từ định dạng "yyyy-mm-dd hh:mm:ss" hoặc "dd-mm-yyyy hh:mm"
            let messageDate;
            try {
                if (messageTime.includes('-') && messageTime.includes(' ') && messageTime.includes(':')) {
                    // Try different date formats
                    if (messageTime.split('-')[0].length === 4) {
                        // Format: yyyy-mm-dd hh:mm:ss
                        messageDate = new Date(messageTime);
                    } else {
                        // Format: dd-mm-yyyy hh:mm
                        const [datePart, timePart] = messageTime.split(' ');
                        const [day, month, year] = datePart.split('-');
                        const [hours, minutes] = timePart.split(':');
                        messageDate = new Date(year, month - 1, day, hours, minutes);
                    }
                } else {
                    messageDate = new Date(messageTime);
                }
            } catch (e) {
                messageDate = new Date();
            }
            
            const timeDiff = (currentTime - messageDate) / 1000; // Chuyển sang giây

            if (timeDiff < 300) { // 5 phút = 300 giây
                deleteBtn.style.display = "inline-block";
            }
        });

        wrapper.addEventListener("mouseleave", () => {
            deleteBtn.style.display = "none";
        });
    }

    async addSenderClickHandler(sender, employeeId) {
        sender.addEventListener("click", async () => {
            try {
                const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                const response = await fetch(
                    `${this.apiUrl}?action=getUser&employeeId=${employeeId}&token=${token}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch user info");
                const userInfo = await response.json();
                this.showUserInfoPopup(userInfo);
            } catch (error) {
                console.error("Fetch user info error:", error);
                showNotification("Không thể tải thông tin người dùng", "error", 3000);
            }
        });
    }

    showUserInfoPopup(userInfo) {
        let infoDiv = document.getElementById("botInfoDiv");
        if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.id = "botInfoDiv";
            infoDiv.classList.add("bot-info-div");
            infoDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 20px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
            `;
            document.body.appendChild(infoDiv);
        }

        infoDiv.innerHTML = `
            <table class="bot-info-table" style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Tên:</td><td style="padding: 8px;">${userInfo.fullName || "N/A"}</td></tr>
                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">ID:</td><td style="padding: 8px;">${userInfo.employeeId || "N/A"}</td></tr>
                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Chức vụ:</td><td style="padding: 8px;">${userInfo.position || "N/A"}</td></tr>
                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${userInfo.email || "N/A"}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Số điện thoại:</td><td style="padding: 8px;">${userInfo.phone || "N/A"}</td></tr>
            </table>
            <button onclick="this.parentElement.style.display='none'" style="margin-top: 15px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Đóng</button>
        `;

        infoDiv.style.display = "block";

        const hidePopup = (e) => {
            if (!infoDiv.contains(e.target)) {
                infoDiv.style.display = "none";
                document.removeEventListener("click", hidePopup);
            }
        };

        setTimeout(() => document.addEventListener("click", hidePopup), 0);
    }

    async loadInitialMessages() {
        if (this.loading) return;
        this.loading = true;

        try {
            const url = new URL(this.apiUrl);
            url.searchParams.append("action", "getMessages");
            url.searchParams.append("offset", this.offset);
            url.searchParams.append("limit", this.limit);

            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const messages = await response.json();
                this.chatMessages.innerHTML = ''; // Clear existing messages
                if (Array.isArray(messages)) {
                    messages.forEach(msg => this.createMessageElement(msg, true));
                    this.offset += messages.length;
                    this.lastId = messages.length > 0 ? Math.max(...messages.map(m => m.id || 0)) : 0;
                }
            }
        } catch (error) {
            console.error("Load messages error:", error);
            showNotification("Không thể tải tin nhắn", "error", 3000);
        } finally {
            this.loading = false;
        }
    }

    startMessagePolling() {
        setInterval(async () => {
            try {
                const url = new URL(this.apiUrl);
                url.searchParams.append("action", "getMessages");
                url.searchParams.append("lastId", this.lastId);

                const response = await fetch(url, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.ok) {
                    const newMessages = await response.json();
                    if (Array.isArray(newMessages) && newMessages.length > 0) {
                        newMessages.forEach(msg => {
                            if (msg.id > this.lastId) {
                                this.createMessageElement(msg);
                                this.lastId = Math.max(this.lastId, msg.id);
                            }
                        });
                    }
                }
            } catch (error) {
                // Silent fail for polling
            }
        }, CONFIG.POLLING_INTERVAL);
    }
}

// Content Manager - Handles all menu functionality
class ContentManager {
    constructor(user) {
        this.user = user;
        this.setupMenuHandlers();
    }

    setupMenuHandlers() {
        // Schedule Management
        document.getElementById('openScheduleRegistration')?.addEventListener('click', () => 
            this.showScheduleRegistration());
        document.getElementById('openScheduleWork')?.addEventListener('click', () => 
            this.showScheduleWork());
        document.getElementById('openOfficialworkschedule')?.addEventListener('click', () => 
            this.showOfficialSchedule());

        // Tasks
        document.getElementById('openSubmitTask')?.addEventListener('click', () => 
            this.showSubmitTask());
        document.getElementById('taskPersonnel')?.addEventListener('click', () => 
            this.showTaskPersonnel());
        document.getElementById('taskStore')?.addEventListener('click', () => 
            this.showTaskStore());
        document.getElementById('taskFinance')?.addEventListener('click', () => 
            this.showTaskFinance());
        document.getElementById('taskApproval')?.addEventListener('click', () => 
            this.showTaskApproval());

        // Other functionality
        document.getElementById('openReward')?.addEventListener('click', () => 
            this.showRewards());
        document.getElementById('openGrantAccess')?.addEventListener('click', () => 
            this.showGrantAccess());
        document.getElementById('openPersonalInformation')?.addEventListener('click', () => 
            this.showPersonalInfo());
        
        // Registration Approval
        document.getElementById('openRegistrationApproval')?.addEventListener('click', () =>
            this.showRegistrationApproval());
    }

    // Schedule Management Functions
    async showScheduleRegistration() {
        const content = document.getElementById('content');
        try {
            // Use checkdk API to get existing schedule
            const response = await utils.fetchAPI(`?action=checkdk&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Đăng Ký Lịch Làm</h2>
                    </div>
                    <div class="card-body">
                        <form id="scheduleForm">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Ca làm</th>
                                        <th>Giờ vào</th>
                                        <th>Giờ ra</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateScheduleRows(response.shifts || [])}
                                </tbody>
                            </table>
                            <button type="submit" class="btn btn-primary">Lưu lịch làm việc</button>
                        </form>
                    </div>
                </div>
            `;

            this.setupScheduleForm();
        } catch (error) {
            console.error('Schedule error:', error);
            // Show basic form even if no existing schedule
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Đăng Ký Lịch Làm</h2>
                    </div>
                    <div class="card-body">
                        <form id="scheduleForm">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Ca làm</th>
                                        <th>Giờ vào</th>
                                        <th>Giờ ra</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateScheduleRows([])}
                                </tbody>
                            </table>
                            <button type="submit" class="btn btn-primary">Lưu lịch làm việc</button>
                        </form>
                    </div>
                </div>
            `;
            this.setupScheduleForm();
        }
    }

    generateScheduleRows(schedule = []) {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        return days.map(day => `
            <tr>
                <td>${day}</td>
                <td>
                    <select name="shift_${day}" class="form-control">
                        <option value="">Chọn ca</option>
                        <option value="morning">Ca sáng</option>
                        <option value="afternoon">Ca chiều</option>
                        <option value="evening">Ca tối</option>
                    </select>
                </td>
                <td>
                    <input type="time" name="start_${day}" class="form-control">
                </td>
                <td>
                    <input type="time" name="end_${day}" class="form-control">
                </td>
            </tr>
        `).join('');
    }

    setupScheduleForm() {
        document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const scheduleData = Object.fromEntries(formData);
                
                // Convert form data to the format expected by savedk API
                const shifts = [];
                const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                
                days.forEach(day => {
                    const start = scheduleData[`start_${day}`];
                    const end = scheduleData[`end_${day}`];
                    if (start && end) {
                        const startHour = parseInt(start.split(':')[0]);
                        const endHour = parseInt(end.split(':')[0]);
                        if (endHour > startHour) {
                            shifts.push({
                                day: day,
                                start: startHour,
                                end: endHour
                            });
                        }
                    }
                });

                if (shifts.length === 0) {
                    utils.showNotification("Vui lòng chọn ít nhất một ca làm việc", "warning");
                    return;
                }

                await utils.fetchAPI('?action=savedk', {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
                        shifts: shifts
                    })
                });
                
                utils.showNotification("Lịch làm việc đã được lưu", "success");
            } catch (error) {
                console.error('Save schedule error:', error);
                utils.showNotification("Không thể lưu lịch làm việc", "error");
            }
        });
    }

    // Task Management Functions
    async showSubmitTask() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Gửi Yêu Cầu</h2>
                </div>
                <div class="card-body">
                    <form id="taskForm">
                        <div class="form-group">
                            <label>Loại yêu cầu</label>
                            <select name="taskType" class="form-control" required>
                                <option value="">Chọn loại yêu cầu</option>
                                <option value="leave">Nghỉ phép</option>
                                <option value="overtime">Tăng ca</option>
                                <option value="equipment">Thiết bị</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nội dung</label>
                            <textarea name="content" class="form-control" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Gửi yêu cầu</button>
                    </form>
                </div>
            </div>
        `;

        this.setupTaskForm();
    }

    setupTaskForm() {
        document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const taskData = Object.fromEntries(formData);
                
                // For now, use sendMessage API to send the task as a message
                await utils.fetchAPI('?action=sendMessage', {
                    method: 'POST',
                    body: JSON.stringify({
                        employeeId: this.user.employeeId,
                        fullName: this.user.fullName || 'Nhân viên',
                        position: this.user.position || 'NV',
                        message: `[YÊU CẦU] ${taskData.taskType}: ${taskData.content}`
                    })
                });
                
                utils.showNotification("Yêu cầu đã được gửi", "success");
                document.getElementById('taskForm').reset();
            } catch (error) {
                console.error('Submit task error:', error);
                utils.showNotification("Không thể gửi yêu cầu", "error");
            }
        });
    }

    async showScheduleWork() {
        const content = document.getElementById('content');
        try {
            // Use getUsers to get employee list
            const employees = await utils.fetchAPI('?action=getUsers');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xếp Lịch Làm Việc</h2>
                    </div>
                    <div class="card-body">
                        <div class="schedule-filters">
                            <select id="employeeFilter" class="form-control">
                                <option value="">Tất cả nhân viên</option>
                                ${Array.isArray(employees) ? employees.map(emp => 
                                    `<option value="${emp.employeeId}">${emp.fullName} - ${emp.employeeId}</option>`
                                ).join('') : ''}
                            </select>
                            <select id="weekFilter" class="form-control">
                                <option value="current">Tuần hiện tại</option>
                                <option value="next">Tuần tới</option>
                            </select>
                        </div>
                        <div id="scheduleTable" class="schedule-table">
                            <p>Chọn nhân viên để xem lịch làm việc</p>
                        </div>
                        <button id="saveScheduleChanges" class="btn btn-primary">Lưu thay đổi</button>
                    </div>
                </div>
            `;

            this.setupScheduleWorkHandlers();
        } catch (error) {
            console.error('Schedule work error:', error);
            utils.showNotification("Không thể tải danh sách nhân viên", "error");
        }
    }

    async showOfficialSchedule() {
        const content = document.getElementById('content');
        try {
            // Use checkdk API to get official schedule
            const response = await utils.fetchAPI(`?action=checkdk&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Lịch Làm Việc Chính Thức</h2>
                    </div>
                    <div class="card-body">
                        <div class="schedule-view">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Ca làm</th>
                                        <th>Giờ vào</th>
                                        <th>Giờ ra</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateOfficialScheduleRows(response.shifts || [])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Official schedule error:', error);
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Lịch Làm Việc Chính Thức</h2>
                    </div>
                    <div class="card-body">
                        <p>Chưa có lịch làm việc được đăng ký. Vui lòng đăng ký lịch làm việc trước.</p>
                    </div>
                </div>
            `;
        }
    }

    async showTaskPersonnel() {
        const content = document.getElementById('content');
        try {
            // Use getMessages as a placeholder for task data
            const messages = await utils.fetchAPI('?action=getMessages');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Nhân Sự</h2>
                    </div>
                    <div class="card-body">
                        <div class="task-filters">
                            <select id="taskStatusFilter" class="form-control">
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>
                        <div class="task-list">
                            <p>Chức năng xử lý yêu cầu nhân sự. Hiện tại hệ thống có ${Array.isArray(messages) ? messages.length : 0} tin nhắn chưa xử lý.</p>
                            <div class="placeholder-content">
                                <p>📋 Danh sách yêu cầu nhân sự sẽ được hiển thị ở đây</p>
                                <p>💬 Các yêu cầu nghỉ phép, tăng ca, thay đổi lịch làm việc</p>
                                <p>⏳ Trạng thái: Chờ phát triển chức năng</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('personnel');
        } catch (error) {
            console.error('Personnel tasks error:', error);
            utils.showNotification("Không thể tải yêu cầu nhân sự", "error");
        }
    }

    async showTaskStore() {
        const content = document.getElementById('content');
        try {
            // Use getStores API to show store information
            const stores = await utils.fetchAPI('?action=getStores');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Cửa Hàng</h2>
                    </div>
                    <div class="card-body">
                        <div class="task-filters">
                            <select id="taskStatusFilter" class="form-control">
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>
                        <div class="task-list">
                            <p>Quản lý yêu cầu từ ${Array.isArray(stores) ? stores.length : 0} cửa hàng trong hệ thống.</p>
                            <div class="store-list">
                                ${Array.isArray(stores) ? stores.map(store => `
                                    <div class="store-card">
                                        <h4>${store.storeName || store.storeId}</h4>
                                        <p>Mã cửa hàng: ${store.storeId}</p>
                                        <p>Trạng thái: Hoạt động</p>
                                    </div>
                                `).join('') : '<p>Không có cửa hàng nào</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('store');
        } catch (error) {
            console.error('Store tasks error:', error);
            utils.showNotification("Không thể tải thông tin cửa hàng", "error");
        }
    }

    async showTaskFinance() {
        const content = document.getElementById('content');
        try {
            // Use a placeholder for finance tasks
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xử Lý Yêu Cầu Tài Chính</h2>
                    </div>
                    <div class="card-body">
                        <div class="task-filters">
                            <select id="taskStatusFilter" class="form-control">
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>
                        <div class="task-list">
                            <div class="finance-overview">
                                <h3>📊 Tổng quan tài chính</h3>
                                <div class="finance-stats">
                                    <div class="finance-stat">
                                        <span class="stat-label">💰 Tổng thu:</span>
                                        <span class="stat-value">0 VNĐ</span>
                                    </div>
                                    <div class="finance-stat">
                                        <span class="stat-label">💸 Tổng chi:</span>
                                        <span class="stat-value">0 VNĐ</span>
                                    </div>
                                    <div class="finance-stat">
                                        <span class="stat-label">📈 Lợi nhuận:</span>
                                        <span class="stat-value">0 VNĐ</span>
                                    </div>
                                </div>
                                <p>⏳ Chức năng quản lý tài chính đang được phát triển</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTaskHandlers('finance');
        } catch (error) {
            console.error('Finance tasks error:', error);
            utils.showNotification("Không thể tải thông tin tài chính", "error");
        }
    }

    async showTaskApproval() {
        const content = document.getElementById('content');
        try {
            const response = await utils.fetchAPI('?action=getApprovalTasks');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Xét Duyệt Yêu Cầu</h2>
                    </div>
                    <div class="card-body">
                        <div class="task-filters">
                            <select id="taskTypeFilter" class="form-control">
                                <option value="">Tất cả loại</option>
                                <option value="leave">Nghỉ phép</option>
                                <option value="overtime">Tăng ca</option>
                                <option value="equipment">Thiết bị</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div class="approval-list">
                            ${this.generateApprovalList(response.tasks)}
                        </div>
                    </div>
                </div>
            `;

            this.setupApprovalHandlers();
        } catch (error) {
            utils.showNotification("Không thể tải yêu cầu xét duyệt", "error");
        }
    }

    async showRewards() {
        const content = document.getElementById('content');
        try {
            // Use getUsers API to populate employee dropdown
            const employees = await utils.fetchAPI('?action=getUsers');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Quản Lý Thưởng/Phạt</h2>
                    </div>
                    <div class="card-body">
                        <form id="rewardForm" class="reward-form">
                            <div class="form-group">
                                <label>Nhân viên</label>
                                <select name="employeeId" class="form-control" required>
                                    <option value="">Chọn nhân viên</option>
                                    ${Array.isArray(employees) ? employees.map(emp => 
                                        `<option value="${emp.employeeId}">${emp.fullName} - ${emp.employeeId}</option>`
                                    ).join('') : ''}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Loại</label>
                                <select name="type" class="form-control" required>
                                    <option value="reward">Thưởng</option>
                                    <option value="penalty">Phạt</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Số tiền</label>
                                <input type="number" name="amount" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Lý do</label>
                                <textarea name="reason" class="form-control" rows="3" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Thêm thưởng/phạt</button>
                        </form>
                        
                        <div class="reward-history">
                            <h3>Lịch sử thưởng/phạt</h3>
                            <p>⏳ Chức năng lịch sử thưởng/phạt đang được phát triển</p>
                            <div class="placeholder-history">
                                <p>📋 Danh sách thưởng/phạt sẽ được hiển thị ở đây</p>
                                <p>💰 Theo dõi các khoản thưởng và phạt của nhân viên</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupRewardHandlers();
        } catch (error) {
            console.error('Rewards error:', error);
            utils.showNotification("Không thể tải thông tin thưởng/phạt", "error");
        }
    }

    async showGrantAccess() {
        const content = document.getElementById('content');
        try {
            // Use getUsers API to get user list
            const users = await utils.fetchAPI('?action=getUsers');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Phân Quyền Người Dùng</h2>
                    </div>
                    <div class="card-body">
                        <div class="permission-management">
                            <div class="user-selection">
                                <select id="userSelect" class="form-control">
                                    <option value="">Chọn nhân viên</option>
                                    ${Array.isArray(users) ? users.map(user => 
                                        `<option value="${user.employeeId}">${user.fullName} - ${user.employeeId}</option>`
                                    ).join('') : ''}
                                </select>
                            </div>
                            
                            <div id="permissionForm" class="permission-form" style="display: none;">
                                <h3>Quyền hạn</h3>
                                <div class="permission-list">
                                    <label class="permission-item">
                                        <input type="checkbox" name="schedule" value="schedule">
                                        <span>Quản lý lịch làm</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="tasks" value="tasks">
                                        <span>Xử lý yêu cầu</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="rewards" value="rewards">
                                        <span>Quản lý thưởng/phạt</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="admin" value="admin">
                                        <span>Quyền quản trị</span>
                                    </label>
                                </div>
                                <button id="savePermissions" class="btn btn-primary">Lưu quyền hạn</button>
                                <p class="permission-note">⏳ Chức năng phân quyền đang được phát triển</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupAccessHandlers();
        } catch (error) {
            console.error('Access management error:', error);
            utils.showNotification("Không thể tải thông tin phân quyền", "error");
        }
    }

    async showPersonalInfo() {
        const content = document.getElementById('content');
        try {
            // Use getUser API to get personal information
            const response = await utils.fetchAPI(`?action=getUser&employeeId=${this.user.employeeId}`);
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Thông Tin Cá Nhân</h2>
                        <p class="card-subtitle">Bạn chỉ có thể cập nhật Email và Số điện thoại. Các thông tin khác cần gửi yêu cầu để được duyệt.</p>
                    </div>
                    <div class="card-body">
                        <form id="personalInfoForm" class="personal-info-form">
                            <div class="form-group">
                                <label>Mã nhân viên</label>
                                <input type="text" name="employeeId" class="form-control readonly-field" value="${response.employeeId || ''}" readonly>
                                <small class="field-note">Không thể thay đổi</small>
                            </div>
                            <div class="form-group">
                                <label>Họ và tên</label>
                                <input type="text" name="fullName" class="form-control request-field" value="${response.fullName || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="fullName">Gửi yêu cầu thay đổi</button>
                            </div>
                            <div class="form-group editable-field">
                                <label>Email <span class="editable-badge">Có thể chỉnh sửa</span></label>
                                <input type="email" name="email" class="form-control" value="${response.email || ''}" required>
                            </div>
                            <div class="form-group editable-field">
                                <label>Số điện thoại <span class="editable-badge">Có thể chỉnh sửa</span></label>
                                <input type="tel" name="phone" class="form-control" value="${response.phone || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Chức vụ</label>
                                <input type="text" name="position" class="form-control request-field" value="${response.position || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="position">Gửi yêu cầu thay đổi</button>
                            </div>
                            <div class="form-group">
                                <label>Cửa hàng</label>
                                <input type="text" name="storeName" class="form-control request-field" value="${response.storeName || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="storeName">Gửi yêu cầu thay đổi</button>
                            </div>
                            <div class="form-group">
                                <label>Ngày gia nhập</label>
                                <input type="text" name="joinDate" class="form-control request-field" value="${response.joinDate || ''}" readonly>
                                <small class="field-note">Cần gửi yêu cầu để thay đổi</small>
                                <button type="button" class="btn-request" data-field="joinDate">Gửi yêu cầu thay đổi</button>
                            </div>
                            
                            <div class="password-confirmation-section" style="display: none;">
                                <hr>
                                <h3>Xác nhận mật khẩu để cập nhật</h3>
                                <div class="form-group">
                                    <label>Nhập mật khẩu hiện tại</label>
                                    <input type="password" id="confirmPassword" class="form-control" required>
                                    <small class="text-danger">Bắt buộc nhập mật khẩu để xác nhận thay đổi</small>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" disabled>
                                    <span class="btn-text">Cập nhật thông tin</span>
                                    <span class="btn-loader"></span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset(); this.updateButtonState()">Hoàn tác</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Change Request Modal -->
                <div id="changeRequestModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Gửi yêu cầu thay đổi thông tin</h3>
                            <button type="button" class="modal-close">&times;</button>
                        </div>
                        <form id="changeRequestForm">
                            <div class="modal-body">
                                <div class="form-group">
                                    <label id="changeFieldLabel">Trường cần thay đổi</label>
                                    <input type="text" id="currentValue" class="form-control" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Giá trị mới</label>
                                    <input type="text" id="newValue" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>Lý do thay đổi</label>
                                    <textarea id="changeReason" class="form-control" rows="3" required placeholder="Vui lòng nêu rõ lý do cần thay đổi thông tin này..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="closeChangeRequestModal()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Gửi yêu cầu</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            this.setupPersonalInfoHandlers();
        } catch (error) {
            console.error('Personal info error:', error);
            utils.showNotification("Không thể tải thông tin cá nhân", "error");
        }
    }

    // Helper functions for the above methods
    generateScheduleTable(schedules = []) {
        if (!schedules.length) return '<p>Không có lịch làm việc nào.</p>';
        
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Ngày</th>
                        <th>Ca làm</th>
                        <th>Giờ vào</th>
                        <th>Giờ ra</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedules.map(schedule => `
                        <tr data-schedule-id="${schedule.id}">
                            <td>${schedule.employeeName}</td>
                            <td>${utils.formatDate(schedule.date)}</td>
                            <td>${schedule.shift}</td>
                            <td>${schedule.startTime}</td>
                            <td>${schedule.endTime}</td>
                            <td>
                                <button class="btn btn-sm btn-edit" onclick="editSchedule('${schedule.id}')">Sửa</button>
                                <button class="btn btn-sm btn-delete" onclick="deleteSchedule('${schedule.id}')">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    generateOfficialScheduleRows(shifts = []) {
        if (!Array.isArray(shifts) || shifts.length === 0) {
            return '<tr><td colspan="5">Không có lịch làm việc.</td></tr>';
        }
        
        return shifts.map(shift => {
            // Extract time from format like "08:00-17:00"
            const timeRange = shift.time && shift.time !== 'Off' ? shift.time.split('-') : ['', ''];
            const startTime = timeRange[0] || '';
            const endTime = timeRange[1] || '';
            
            return `
                <tr>
                    <td>${shift.day || ''}</td>
                    <td>${shift.time === 'Off' ? 'Nghỉ' : (startTime && endTime ? 'Ca làm' : 'Chưa xác định')}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td><span class="status confirmed">Đã xác nhận</span></td>
                </tr>
            `;
        }).join('');
    }

    generateTaskList(tasks = [], type) {
        if (!tasks.length) return '<p>Không có yêu cầu nào.</p>';
        
        return `
            <div class="task-grid">
                ${tasks.map(task => `
                    <div class="task-card" data-task-id="${task.id}">
                        <h4>${task.title}</h4>
                        <p><strong>Nhân viên:</strong> ${task.employeeName}</p>
                        <p><strong>Loại:</strong> ${task.type}</p>
                        <p><strong>Nội dung:</strong> ${task.content}</p>
                        <p><strong>Ngày gửi:</strong> ${utils.formatDate(task.createdAt)}</p>
                        <div class="task-actions">
                            <button class="btn btn-sm btn-approve" onclick="approveTask('${task.id}')">Duyệt</button>
                            <button class="btn btn-sm btn-reject" onclick="rejectTask('${task.id}')">Từ chối</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateApprovalList(tasks = []) {
        if (!tasks.length) return '<p>Không có yêu cầu cần xét duyệt.</p>';
        
        return `
            <div class="approval-grid">
                ${tasks.map(task => `
                    <div class="approval-card" data-task-id="${task.id}">
                        <h4>${task.title}</h4>
                        <p><strong>Nhân viên:</strong> ${task.employeeName}</p>
                        <p><strong>Loại:</strong> ${task.type}</p>
                        <p><strong>Nội dung:</strong> ${task.content}</p>
                        <p><strong>Ngày gửi:</strong> ${utils.formatDate(task.createdAt)}</p>
                        <div class="approval-form">
                            <textarea placeholder="Ghi chú phê duyệt..." rows="2"></textarea>
                            <div class="approval-actions">
                                <button class="btn btn-sm btn-approve" onclick="finalApprove('${task.id}')">Phê duyệt</button>
                                <button class="btn btn-sm btn-reject" onclick="finalReject('${task.id}')">Từ chối</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateRewardHistory(rewards = []) {
        if (!rewards.length) return '<p>Chưa có lịch sử thưởng/phạt.</p>';
        
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Loại</th>
                        <th>Số tiền</th>
                        <th>Lý do</th>
                        <th>Ngày</th>
                    </tr>
                </thead>
                <tbody>
                    ${rewards.map(reward => `
                        <tr>
                            <td>${reward.employeeName}</td>
                            <td><span class="reward-type ${reward.type}">${reward.type === 'reward' ? 'Thưởng' : 'Phạt'}</span></td>
                            <td>${reward.amount.toLocaleString('vi-VN')} VNĐ</td>
                            <td>${reward.reason}</td>
                            <td>${utils.formatDate(reward.createdAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Setup handlers for the new functions
    setupScheduleWorkHandlers() {
        document.getElementById('saveScheduleChanges')?.addEventListener('click', async () => {
            try {
                // Implementation for saving schedule changes
                await utils.fetchAPI('?action=saveScheduleChanges', {
                    method: 'POST',
                    body: JSON.stringify({ scheduleData: 'data' })
                });
                utils.showNotification("Lịch làm việc đã được cập nhật", "success");
            } catch (error) {
                utils.showNotification("Không thể lưu thay đổi", "error");
            }
        });
    }

    setupTaskHandlers(type) {
        // Implementation for task handlers would go here
        window.approveTask = async (taskId) => {
            try {
                await utils.fetchAPI('?action=approveTask', {
                    method: 'POST',
                    body: JSON.stringify({ taskId, type })
                });
                utils.showNotification("Đã duyệt yêu cầu", "success");
                // Refresh the view
                if (type === 'personnel') this.showTaskPersonnel();
                else if (type === 'store') this.showTaskStore();
                else if (type === 'finance') this.showTaskFinance();
            } catch (error) {
                utils.showNotification("Không thể duyệt yêu cầu", "error");
            }
        };

        window.rejectTask = async (taskId) => {
            try {
                await utils.fetchAPI('?action=rejectTask', {
                    method: 'POST',
                    body: JSON.stringify({ taskId, type })
                });
                utils.showNotification("Đã từ chối yêu cầu", "success");
                // Refresh the view
                if (type === 'personnel') this.showTaskPersonnel();
                else if (type === 'store') this.showTaskStore();
                else if (type === 'finance') this.showTaskFinance();
            } catch (error) {
                utils.showNotification("Không thể từ chối yêu cầu", "error");
            }
        };
    }

    setupApprovalHandlers() {
        window.finalApprove = async (taskId) => {
            try {
                await utils.fetchAPI('?action=finalApprove', {
                    method: 'POST',
                    body: JSON.stringify({ taskId })
                });
                utils.showNotification("Đã phê duyệt yêu cầu", "success");
                this.showTaskApproval();
            } catch (error) {
                utils.showNotification("Không thể phê duyệt", "error");
            }
        };

        window.finalReject = async (taskId) => {
            try {
                await utils.fetchAPI('?action=finalReject', {
                    method: 'POST',
                    body: JSON.stringify({ taskId })
                });
                utils.showNotification("Đã từ chối yêu cầu", "success");
                this.showTaskApproval();
            } catch (error) {
                utils.showNotification("Không thể từ chối", "error");
            }
        };
    }

    setupRewardHandlers() {
        document.getElementById('rewardForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                await utils.fetchAPI('?action=addReward', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                utils.showNotification("Đã thêm thưởng/phạt", "success");
                this.showRewards();
            } catch (error) {
                utils.showNotification("Không thể thêm thưởng/phạt", "error");
            }
        });
    }

    setupAccessHandlers() {
        document.getElementById('userSelect')?.addEventListener('change', async (e) => {
            const employeeId = e.target.value;
            if (employeeId) {
                try {
                    // For now, just show the permission form without loading existing permissions
                    document.getElementById('permissionForm').style.display = 'block';
                    
                    // Reset all checkboxes
                    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                        checkbox.checked = false;
                    });
                } catch (error) {
                    console.error('Load permissions error:', error);
                    utils.showNotification("Không thể tải quyền hạn", "error");
                }
            } else {
                document.getElementById('permissionForm').style.display = 'none';
            }
        });

        document.getElementById('savePermissions')?.addEventListener('click', async () => {
            try {
                const employeeId = document.getElementById('userSelect').value;
                if (!employeeId) {
                    utils.showNotification("Vui lòng chọn nhân viên", "warning");
                    return;
                }

                const permissions = {};
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    permissions[checkbox.name] = checkbox.checked;
                });

                // For now, just show success message as the API doesn't exist
                utils.showNotification("Đã cập nhật quyền hạn (demo)", "success");
                console.log('Permissions would be saved:', { employeeId, permissions });
            } catch (error) {
                console.error('Update permissions error:', error);
                utils.showNotification("Không thể cập nhật quyền hạn", "error");
            }
        });
    }

    setupPersonalInfoHandlers() {
        const form = document.getElementById('personalInfoForm');
        const submitButton = form?.querySelector('button[type="submit"]');
        const passwordSection = document.querySelector('.password-confirmation-section');
        
        // Track if editable fields have changed
        let hasChanges = false;
        const originalData = {};
        
        // Store original values
        form?.querySelectorAll('.editable-field input').forEach(input => {
            originalData[input.name] = input.value;
        });
        
        // Monitor changes in editable fields
        form?.querySelectorAll('.editable-field input').forEach(input => {
            input.addEventListener('input', () => {
                hasChanges = Object.keys(originalData).some(key => {
                    const currentInput = form.querySelector(`[name="${key}"]`);
                    return currentInput && currentInput.value !== originalData[key];
                });
                
                if (hasChanges) {
                    passwordSection.style.display = 'block';
                    submitButton.disabled = false;
                } else {
                    passwordSection.style.display = 'none';
                    submitButton.disabled = true;
                }
            });
        });
        
        // Handle form submission with password confirmation
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!hasChanges) {
                utils.showNotification("Không có thay đổi nào để cập nhật", "warning");
                return;
            }
            
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            if (!confirmPassword) {
                utils.showNotification("Vui lòng nhập mật khẩu để xác nhận", "error");
                return;
            }
            
            const button = submitButton;
            const buttonText = button?.querySelector('.btn-text');
            
            if (button) button.classList.add('loading');
            if (buttonText) buttonText.textContent = 'Đang cập nhật...';
            
            try {
                const formData = new FormData(e.target);
                const updateData = Object.fromEntries(formData);
                
                // Only include editable fields
                const editableData = {
                    employeeId: updateData.employeeId,
                    email: updateData.email,
                    phone: updateData.phone,
                    password: confirmPassword // For verification
                };
                
                // Use update API to update personal information
                await utils.fetchAPI('?action=updatePersonalInfo', {
                    method: 'POST',
                    body: JSON.stringify(editableData)
                });
                
                utils.showNotification("Đã cập nhật thông tin cá nhân", "success");
                
                // Reset form state
                hasChanges = false;
                passwordSection.style.display = 'none';
                submitButton.disabled = true;
                document.getElementById('confirmPassword').value = '';
                
                // Update original data
                Object.keys(originalData).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) originalData[key] = input.value;
                });
                
            } catch (error) {
                console.error('Update personal info error:', error);
                utils.showNotification(error.message || "Không thể cập nhật thông tin", "error");
            } finally {
                if (button) button.classList.remove('loading');
                if (buttonText) buttonText.textContent = 'Cập nhật thông tin';
            }
        });
        
        // Handle change request buttons
        document.querySelectorAll('.btn-request').forEach(button => {
            button.addEventListener('click', (e) => {
                const field = e.target.getAttribute('data-field');
                const currentValue = form.querySelector(`[name="${field}"]`)?.value;
                openChangeRequestModal(field, currentValue);
            });
        });
        
        // Handle change request form submission
        document.getElementById('changeRequestForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const requestData = {
                employeeId: this.user.employeeId,
                field: document.getElementById('changeRequestForm').dataset.field,
                currentValue: formData.get('currentValue'),
                newValue: formData.get('newValue'),
                reason: formData.get('reason'),
                type: 'personal_info_change'
            };
            
            try {
                await utils.fetchAPI('?action=createTask', {
                    method: 'POST',
                    body: JSON.stringify(requestData)
                });
                
                utils.showNotification("Yêu cầu thay đổi đã được gửi", "success");
                closeChangeRequestModal();
            } catch (error) {
                console.error('Change request error:', error);
                utils.showNotification("Không thể gửi yêu cầu", "error");
            }
        });
        
        // Handle modal close
        document.querySelector('.modal-close')?.addEventListener('click', closeChangeRequestModal);
    }

    // Registration Approval Management
    async showRegistrationApproval() {
        const content = document.getElementById('content');
        try {
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Duyệt Đăng Ký Nhân Viên</h2>
                    </div>
                    <div class="card-body">
                        <div class="approval-filters">
                            <select id="storeFilterSelect" class="form-control">
                                <option value="">Tất cả cửa hàng</option>
                            </select>
                            <button id="refreshPendingRegistrations" class="btn btn-secondary">
                                <span class="material-icons-round">refresh</span>
                                Làm mới
                            </button>
                        </div>
                        <div id="pendingRegistrationsList" class="registrations-container">
                            <p class="loading-text">Đang tải danh sách...</p>
                        </div>
                    </div>
                </div>
            `;

            await this.loadStoresForFilter();
            await this.loadPendingRegistrations();
            this.setupRegistrationApprovalHandlers();
        } catch (error) {
            console.error('Registration approval error:', error);
            utils.showNotification("Không thể tải danh sách đăng ký", "error");
        }
    }

    async loadStoresForFilter() {
        try {
            const stores = await utils.fetchAPI('?action=getStores');
            const storeFilter = document.getElementById('storeFilterSelect');
            if (storeFilter && stores.length) {
                storeFilter.innerHTML = '<option value="">Tất cả cửa hàng</option>' +
                    stores.map(store => `<option value="${store.storeName}">${store.storeName}</option>`).join('');
            }
        } catch (error) {
            console.error('Load stores error:', error);
        }
    }

    async loadPendingRegistrations(store = '') {
        try {
            const url = store ? `?action=getPendingRegistrations&store=${encodeURIComponent(store)}` : '?action=getPendingRegistrations';
            const registrations = await utils.fetchAPI(url);
            
            const container = document.getElementById('pendingRegistrationsList');
            if (!registrations.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <div class="empty-text">Không có yêu cầu đăng ký nào</div>
                        <div class="empty-subtext">Tất cả yêu cầu đăng ký đã được xử lý</div>
                    </div>
                `;
                return;
            }

            container.innerHTML = registrations.map(reg => `
                <div class="registration-item" data-employee-id="${reg.employeeId}">
                    <div class="registration-header">
                        <div class="registration-info">
                            <div class="employee-name">${reg.fullName}</div>
                            <div class="employee-details">
                                <div class="detail-item">
                                    <span class="detail-icon">🆔</span>
                                    <span>Mã NV: ${reg.employeeId}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">🏪</span>
                                    <span>Cửa hàng: ${reg.storeName}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">👔</span>
                                    <span>Chức vụ: ${reg.position}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">📞</span>
                                    <span>SĐT: ${reg.phone || 'Chưa có'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">📧</span>
                                    <span>Email: ${reg.email || 'Chưa có'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">📅</span>
                                    <span>Ngày gửi: ${utils.formatDate(reg.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="registration-actions">
                            <button class="approve-btn" onclick="window.approveRegistration('${reg.employeeId}')">
                                <span class="material-icons-round">check</span>
                                Duyệt
                            </button>
                            <button class="reject-btn" onclick="window.rejectRegistration('${reg.employeeId}')">
                                <span class="material-icons-round">close</span>
                                Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Load pending registrations error:', error);
            const container = document.getElementById('pendingRegistrationsList');
            container.innerHTML = '<p class="error-text">Không thể tải danh sách đăng ký</p>';
        }
    }

    setupRegistrationApprovalHandlers() {
        // Filter by store
        document.getElementById('storeFilterSelect')?.addEventListener('change', (e) => {
            this.loadPendingRegistrations(e.target.value);
        });

        // Refresh button
        document.getElementById('refreshPendingRegistrations')?.addEventListener('click', () => {
            const store = document.getElementById('storeFilterSelect')?.value || '';
            this.loadPendingRegistrations(store);
        });

        // Global functions for approval/rejection
        window.approveRegistration = async (employeeId) => {
            if (!confirm('Bạn có chắc chắn muốn duyệt đăng ký này?')) return;
            
            try {
                await utils.fetchAPI('?action=approveRegistration', {
                    method: 'POST',
                    body: JSON.stringify({ employeeId, action: 'approve' })
                });
                
                utils.showNotification("Đã duyệt đăng ký thành công!", "success");
                
                // Refresh the list
                const store = document.getElementById('storeFilterSelect')?.value || '';
                await this.loadPendingRegistrations(store);
            } catch (error) {
                console.error('Approve registration error:', error);
                utils.showNotification("Không thể duyệt đăng ký", "error");
            }
        };

        window.rejectRegistration = async (employeeId) => {
            if (!confirm('Bạn có chắc chắn muốn từ chối đăng ký này?')) return;
            
            try {
                await utils.fetchAPI('?action=approveRegistration', {
                    method: 'POST',
                    body: JSON.stringify({ employeeId, action: 'reject' })
                });
                
                utils.showNotification("Đã từ chối đăng ký", "success");
                
                // Refresh the list
                const store = document.getElementById('storeFilterSelect')?.value || '';
                await this.loadPendingRegistrations(store);
            } catch (error) {
                console.error('Reject registration error:', error);
                utils.showNotification("Không thể từ chối đăng ký", "error");
            }
        };
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
                menuItem.querySelectorAll('.submenu-item').forEach(item => {
                    const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                    item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
                });
            }
        });
    }

    static setupMenuInteractions() {
        // Remove active class from all menu items initially
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close all other submenus by removing active class
                    document.querySelectorAll('.menu-item').forEach(other => {
                        if (other !== item) {
                            other.classList.remove('active');
                        }
                    });
                    
                    // Toggle current submenu by adding/removing active class
                    item.classList.toggle('active');
                });
            }
        });

        // Close submenus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }
}

// Theme Manager - Single Instance
class ThemeManager {
    static initialize() {
        const themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;

        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update icon based on current theme
        const icon = themeSwitch.querySelector('.material-icons-round');
        if (icon) {
            icon.textContent = savedTheme === 'light' ? 'dark_mode' : 'light_mode';
        }

        themeSwitch.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
            
            if (icon) {
                icon.textContent = newTheme === 'light' ? 'dark_mode' : 'light_mode';
            }
        });
    }
}

// Auth Manager
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        this.userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA));
    }

    async checkAuthentication() {
        if (!this.token || !this.userData) {
            window.location.href = "index.html";
            return null;
        }

        try {
            const user = await utils.fetchAPI(`?action=getUser&employeeId=${this.userData.loginEmployeeId}`);
            if (user) {
                const userInfoElement = document.getElementById("userInfo");
                if (userInfoElement) {
                    userInfoElement.textContent = `Chào ${user.fullName} - ${user.employeeId}`;
                }
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

    setupLogoutHandler() {
        document.getElementById("logout")?.addEventListener("click", () => this.logout());
    }

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        window.location.href = "index.html";
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
        new ContentManager(user);

        // Initialize enhanced dashboard
        await initializeEnhancedDashboard();

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

// Enhanced Dashboard Stats Initialization - Using unified dashboard API
async function initializeDashboardStats() {
    const elements = {
        totalEmployees: document.getElementById('totalEmployees'),
        todaySchedule: document.getElementById('todaySchedule'), 
        pendingRequests: document.getElementById('pendingRequests'),
        recentMessages: document.getElementById('recentMessages'),
        todayScheduleDay: document.getElementById('todayScheduleDay')
    };

    try {
        // Use the new unified dashboard stats API
        const stats = await utils.fetchAPI('?action=getDashboardStats');
        
        if (stats && typeof stats === 'object') {
            // Update dashboard statistics
            if (elements.totalEmployees) {
                elements.totalEmployees.textContent = stats.totalEmployees?.toString() || '0';
            }
            
            if (elements.todaySchedule) {
                elements.todaySchedule.textContent = stats.todaySchedules?.toString() || '0';
            }
            
            if (elements.pendingRequests) {
                elements.pendingRequests.textContent = stats.pendingRequests?.toString() || '0';
            }

            if (elements.recentMessages) {
                elements.recentMessages.textContent = stats.recentMessages?.toString() || '0';
            }
            
            // Update day info
            if (elements.todayScheduleDay) {
                const dayNames = {
                    'T2': 'Thứ 2', 'T3': 'Thứ 3', 'T4': 'Thứ 4', 
                    'T5': 'Thứ 5', 'T6': 'Thứ 6', 'T7': 'Thứ 7', 'CN': 'Chủ Nhật'
                };
                elements.todayScheduleDay.textContent = dayNames[stats.currentDay] || 'Hôm nay';
            }
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set fallback values only if elements exist
        Object.values(elements).forEach(element => {
            if (element) element.textContent = '-';
        });
        
        // Optionally show a user-friendly notification
        utils.showNotification('Không thể tải thống kê dashboard', 'warning', 5000);
    }
}

// Initialize Recent Activities
async function initializeRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;

    try {
        const activities = await utils.fetchAPI('?action=getRecentActivities');
        
        if (activities && Array.isArray(activities)) {
            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-avatar">${activity.employeeName?.substring(0, 2) || 'NV'}</div>
                    <div class="activity-content">
                        <div class="activity-header">
                            <span class="activity-author">${activity.employeeName || 'Nhân viên'}</span>
                            <span class="activity-time">${utils.formatDate(activity.time)}</span>
                        </div>
                        <div class="activity-message">${activity.action}</div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="loading-text">Không có hoạt động gần đây</p>';
        }
    } catch (error) {
        console.error('Failed to load recent activities:', error);
        container.innerHTML = '<p class="loading-text">Không thể tải hoạt động</p>';
    }
}

// Role-based UI Management
function initializeRoleBasedUI() {
    const loggedInUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    const userPosition = loggedInUser.position || 'NV';
    
    // Map positions to roles
    const roleMap = {
        'AD': ['AD'],
        'QL': ['QL', 'AD'], 
        'AM': ['AM', 'QL', 'AD'],
        'NV': ['NV', 'AM', 'QL', 'AD']
    };
    
    const userRoles = roleMap[userPosition] || ['NV'];
    
    // Show/hide elements based on roles
    document.querySelectorAll('[data-role]').forEach(element => {
        const requiredRoles = element.dataset.role.split(',');
        const hasAccess = requiredRoles.some(role => userRoles.includes(role));
        
        if (hasAccess) {
            element.classList.add('role-visible');
            element.style.display = '';
        } else {
            element.classList.remove('role-visible');
            element.style.display = 'none';
        }
    });
}

// Quick Actions Handler
function initializeQuickActions() {
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleQuickAction(action);
        });
    });
}

// Handle Quick Actions
function handleQuickAction(action) {
    switch (action) {
        case 'addEmployee':
            openModal('register');
            break;
        case 'createSchedule':
            openModal('scheduleWork');
            break;
        case 'manageRewards':
            openModal('reward');
            break;
        case 'viewReports':
            generateReports();
            break;
        default:
            utils.showNotification('Tính năng đang phát triển', 'warning');
    }
}

// Store Management Functions
function manageStore(storeId) {
    utils.showNotification(`Quản lý cửa hàng ${storeId}`, 'info');
    // Implement store management logic here
}

function viewStoreSchedule(storeId) {
    utils.showNotification(`Xem lịch cửa hàng ${storeId}`, 'info');
    // Implement schedule viewing logic here
}

// Load More Activities
function loadMoreActivities() {
    utils.showNotification('Đang tải thêm hoạt động...', 'info');
    // Implement load more logic here
}

// Generate Reports (Admin only)
function generateReports() {
    utils.showNotification('Đang tạo báo cáo...', 'info');
    // Implement report generation logic here
}

// Initialize Personal Dashboard for Employees
async function initializePersonalDashboard() {
    const userInfo = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    const position = userInfo.position;
    
    if (['NV', 'AM'].includes(position)) {
        await loadPersonalSchedule();
        await loadPersonalRewards();
        await loadPersonalTasks();
    }
}

// Load Personal Schedule
async function loadPersonalSchedule() {
    const container = document.getElementById('personalSchedule');
    if (!container) return;

    try {
        const userInfo = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const response = await utils.fetchAPI(`?action=checkdk&employeeId=${userInfo.employeeId}`);
        
        if (response && response.shifts) {
            const scheduleHTML = response.shifts.map(shift => `
                <div class="schedule-day">
                    <span class="day-name">${shift.day}:</span>
                    <span class="day-time">${shift.time}</span>
                </div>
            `).join('');
            container.innerHTML = scheduleHTML;
        } else {
            container.innerHTML = '<p>Chưa đăng ký lịch làm</p>';
        }
    } catch (error) {
        console.error('Failed to load personal schedule:', error);
        container.innerHTML = '<p>Không thể tải lịch làm</p>';
    }
}

// Load Personal Rewards
async function loadPersonalRewards() {
    const container = document.getElementById('personalRewards');
    if (!container) return;

    try {
        const userInfo = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
        const rewards = await utils.fetchAPI(`?action=getRewards&employeeId=${userInfo.employeeId}&limit=5`);
        
        if (rewards && Array.isArray(rewards) && rewards.length > 0) {
            const rewardsHTML = rewards.map(reward => `
                <div class="reward-item ${reward.type}">
                    <span class="reward-type">${reward.type === 'reward' ? '🏆 Thưởng' : '⚠️ Phạt'}:</span>
                    <span class="reward-amount">${reward.amount.toLocaleString('vi-VN')} ₫</span>
                    <span class="reward-reason">${reward.reason}</span>
                </div>
            `).join('');
            container.innerHTML = rewardsHTML;
        } else {
            container.innerHTML = '<p>Chưa có thưởng/phạt</p>';
        }
    } catch (error) {
        console.error('Failed to load personal rewards:', error);
        container.innerHTML = '<p>Không thể tải thưởng/phạt</p>';
    }
}

// Load Personal Tasks
async function loadPersonalTasks() {
    const container = document.getElementById('personalTasks');
    if (!container) return;

    try {
        const tasks = await utils.fetchAPI('?action=getTasks&status=pending&limit=5');
        
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            const tasksHTML = tasks.map(task => `
                <div class="task-item">
                    <span class="task-type">${task.type}</span>
                    <span class="task-status status-${task.status}">${task.status}</span>
                    <span class="task-date">${utils.formatDate(task.createdAt)}</span>
                </div>
            `).join('');
            container.innerHTML = tasksHTML;
        } else {
            container.innerHTML = '<p>Không có yêu cầu nào</p>';
        }
    } catch (error) {
        console.error('Failed to load personal tasks:', error);
        container.innerHTML = '<p>Không thể tải yêu cầu</p>';
    }
}

// Initialize Finance Dashboard (Admin only)
async function initializeFinanceDashboard() {
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    const monthlyExpense = document.getElementById('monthlyExpense');
    const monthlyProfit = document.getElementById('monthlyProfit');
    const monthlyPayroll = document.getElementById('monthlyPayroll');

    // Mock data for demo - replace with real API calls
    if (monthlyRevenue) monthlyRevenue.textContent = '125,000,000 ₫';
    if (monthlyExpense) monthlyExpense.textContent = '85,000,000 ₫';
    if (monthlyProfit) monthlyProfit.textContent = '40,000,000 ₫';
    if (monthlyPayroll) monthlyPayroll.textContent = '35,000,000 ₫';
}

// Enhanced Mobile Menu Setup
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Enhanced Dashboard Initialization
async function initializeEnhancedDashboard() {
    try {
        // Initialize all dashboard components
        await initializeDashboardStats();
        await initializeRecentActivities();
        initializeRoleBasedUI();
        initializeQuickActions();
        await initializePersonalDashboard();
        await initializeFinanceDashboard();
        
        // Setup UI enhancements
        setupMobileMenu();
        // Theme switching is handled by ThemeManager.initialize()
        
        utils.showNotification('Dashboard đã được tải thành công', 'success');
    } catch (error) {
        console.error('Failed to initialize enhanced dashboard:', error);
        utils.showNotification('Có lỗi khi tải dashboard', 'error');
    }
}

// Auto-refresh dashboard stats every 30 seconds
setInterval(() => {
    initializeDashboardStats();
    initializeRecentActivities();
}, 30000);

// Global functions for change request modal
function openChangeRequestModal(field, currentValue) {
    const modal = document.getElementById('changeRequestModal');
    const form = document.getElementById('changeRequestForm');
    const fieldLabel = document.getElementById('changeFieldLabel');
    const currentValueInput = document.getElementById('currentValue');
    const newValueInput = document.getElementById('newValue');
    const reasonTextarea = document.getElementById('changeReason');
    
    // Set field information
    form.dataset.field = field;
    fieldLabel.textContent = getFieldDisplayName(field);
    currentValueInput.value = currentValue;
    newValueInput.value = '';
    reasonTextarea.value = '';
    
    modal.style.display = 'flex';
    newValueInput.focus();
}

function closeChangeRequestModal() {
    const modal = document.getElementById('changeRequestModal');
    modal.style.display = 'none';
}

function getFieldDisplayName(field) {
    const displayNames = {
        'fullName': 'Họ và tên',
        'position': 'Chức vụ',
        'storeName': 'Cửa hàng',
        'joinDate': 'Ngày gia nhập'
    };
    return displayNames[field] || field;
}
