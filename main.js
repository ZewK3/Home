// Constants and initial setup
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const menuList = document.getElementById("menuList");
const token = localStorage.getItem("authToken");
const mainContent = document.querySelector(".main");
const sidebar = document.querySelector(".sidebar");

menuList.style.display = 'none';

// Utility functions
const showNotification = (message, type = "success", duration = 3000) => {
    const notification = document.getElementById("notification");
    if (!notification) return console.warn("Notification element not found!");

    notification.classList.add(type);
    notification.classList.remove("hidden");
    notification.textContent = message;
    notification.style.cssText = "display: block; opacity: 1;";

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
            notification.classList.remove(type);
        }, 500);
    }, duration);
};

const isMobile = () => window.innerWidth <= 768;

// Authentication check
const checkAuthentication = async () => {
    if (!loggedInUser) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(
            `https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${loggedInUser.loginEmployeeId}&token=${token}`,
            { headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) {
            throw new Error("Invalid session");
        }

        const user = await response.json();
        document.getElementById("userInfo").textContent = `Chào ${user.fullName} - ${user.employeeId}`;
        updateMenuByRole(user.position);
        menuList.style.display = 'block';
        return user;
    } catch (error) {
        showNotification("Phiên hết hạn, vui lòng đăng nhập lại", "warning", 3000);
        window.location.href = "index.html";
    }
};

// Logout handler
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

// Personal Information Section
const renderPersonalInfo = (user) => {
    const allowedRoles = ["AD", "NV", "QL", "AM"];
    document.getElementById("openPersonalInformation").addEventListener("click", (e) => {
        e.preventDefault();

        if (!allowedRoles.includes(user.position)) {
            return showNotification("Bạn không có quyền truy cập", "error", 3000);
        }

        const originalContent = mainContent.innerHTML;
        if (isMobile()) {
            sidebar.classList.add("hidden");
            mainContent.classList.remove("hidden");
        }

        mainContent.innerHTML = `
            ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
            <h1>Thông Tin Cá Nhân</h1>
            <form id="personalInfoForm">
                <table class="personal-info-table">
                    <tbody>
                        ${["Mã Nhân Viên:employeeId", "Họ Tên:fullName", "Email:email", 
                           "Số Điện Thoại:phone", "Vị Trí:position", "Cửa Hàng:storeName", 
                           "Ngày Tham Gia:joinDate"].map(field => {
                            const [label, key] = field.split(":");
                            return `<tr><th>${label}</th><td>${user[key] || "N/A"}</td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
                <div class="button-container">
                    <button type="button" id="editPass" class="btn">Đổi Mật Khẩu</button>
                </div>
            </form>
        `;

        setupBackButton(originalContent);
        document.getElementById("editPass").addEventListener("click", () => renderPasswordForm(originalContent));
    });
};

// Password Change Section
const renderPasswordForm = (originalContent) => {
    if (isMobile()) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    mainContent.innerHTML = `
        ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1>Đổi Mật Khẩu</h1>
        <form id="changePasswordForm">
            <div><label>Mật khẩu hiện tại:</label><input type="password" id="currentPassword" required /></div>
            <div><label>Mật khẩu mới:</label><input type="password" id="newPassword" required /></div>
            <div><label>Xác nhận mật khẩu:</label><input type="password" id="confirmPassword" required /></div>
            <div class="button-container">
                <button type="submit" class="btn">Lưu</button>
                <button type="button" id="cancelChangePassword" class="btn">Hủy</button>
            </div>
        </form>
    `;

    setupBackButton(originalContent);
    document.getElementById("cancelChangePassword").addEventListener("click", () => {
        mainContent.innerHTML = originalContent;
    });

    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const [current, newPass, confirm] = ["currentPassword", "newPassword", "confirmPassword"]
            .map(id => document.getElementById(id).value);

        if (newPass !== confirm) {
            return showNotification("Mật khẩu xác nhận không khớp", "error", 3000);
        }

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: current, newPassword: newPass })
            });
            const data = await response.json();
            showNotification(data.success ? "Đổi mật khẩu thành công" : (data.message || "Có lỗi xảy ra"), 
                data.success ? "success" : "error", 3000);
        } catch (error) {
            showNotification("Có lỗi xảy ra, vui lòng thử lại", "error", 3000);
        }
    });
};

// Schedule Registration Section
const createHourOptions = (start, end, selected = "") => {
    return `<option value="">Chọn giờ</option>` + 
        Array.from({ length: end - start + 1 }, (_, i) => start + i)
            .map(h => {
                const time = `${h < 10 ? "0" : ""}${h}:00`;
                return `<option value="${time}" ${time === selected ? "selected" : ""}>${time}</option>`;
            }).join('');
};

const renderScheduleRegistration = (user) => {
    document.getElementById("openScheduleRegistration").addEventListener("click", async (e) => {
        e.preventDefault();
        if (!["AD", "NV", "QL"].includes(user.position)) {
            return showNotification("Bạn không có quyền truy cập", "error", 3000);
        }

        const originalContent = mainContent.innerHTML;
        if (isMobile()) {
            sidebar.classList.add("hidden");
            mainContent.classList.remove("hidden");
        }

        try {
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=checkdk&employeeId=${user.employeeId}&token=${token}`,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!response.ok) throw new Error("Failed to check schedule");

            const result = await response.json();
            const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
            let scheduleHtml;

            if (response.status === 200 && result.message === "Nhân viên đã đăng ký lịch làm!") {
                scheduleHtml = result.shifts.map(day => {
                    const [start, end] = (day.time || "--:-- - --:--").split("-").map(t => t.trim());
                    return `
                        <tr>
                            <td>${day.day === "CN" ? "Chủ Nhật" : `Thứ ${day.day.slice(1)}`}</td>
                            <td><select name="${day.day}-start" class="time-select start-select" data-day="${day.day}">
                                ${createHourOptions(8, 19, start)}
                            </select></td>
                            <td><select name="${day.day}-end" class="time-select end-select" data-day="${day.day}">
                                ${createHourOptions(12, 23, end)}
                            </select></td>
                        </tr>
                    `;
                }).join('');
            } else {
                scheduleHtml = days.map(day => `
                    <tr>
                        <td>${day}</td>
                        <td><select name="${day}-start" class="time-select start-select" data-day="${day}">
                            ${createHourOptions(8, 19)}
                        </select></td>
                        <td><select name="${day}-end" class="time-select end-select" data-day="${day}">
                            ${createHourOptions(12, 23)}
                        </select></td>
                    </tr>
                `).join('');
            }

            mainContent.innerHTML = `
                ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
                <h1>${response.status === 200 ? "Bạn đã đăng ký Lịch Làm" : "Đăng ký lịch làm"}</h1>
                <form id="scheduleForm">
                    <table class="schedule-table">
                        <thead><tr><th>Ngày</th><th>Giờ vào</th><th>Giờ ra</th></tr></thead>
                        <tbody>${scheduleHtml}</tbody>
                    </table>
                    <div class="button-container">
                        <button type="submit" class="btn">${response.status === 200 ? "Gửi Lại" : "Gửi"}</button>
                    </div>
                </form>
            `;

            setupBackButton(originalContent);
            setupScheduleForm(user.employeeId);
        } catch (error) {
            showNotification("Lỗi khi kiểm tra trạng thái lịch làm!", "error", 3000);
        }
    });
};

// Helper Functions
const setupBackButton = (originalContent) => {
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", () => {
            if (isMobile()) {
                mainContent.classList.add("hidden");
                sidebar.classList.remove("hidden");
            } else {
                mainContent.innerHTML = originalContent;
            }
        });
    }
};

const setupScheduleForm = (employeeId) => {
    document.querySelectorAll(".start-select").forEach(select => {
        select.addEventListener("change", function () {
            const day = this.getAttribute("data-day");
            const endSelect = document.querySelector(`[name="${day}-end"]`);
            const startValue = parseInt(this.value);
            endSelect.innerHTML = createHourOptions(
                isNaN(startValue) ? 12 : Math.max(startValue + 4, 12), 
                23
            );
        });
    });

    document.getElementById("scheduleForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const shifts = [];
        let isValid = true;

        document.querySelectorAll("tbody tr").forEach(row => {
            const day = row.cells[0].textContent;
            const formattedDay = day === "Chủ Nhật" ? "CN" : `T${days.indexOf(day) + 2}`;
            const start = row.querySelector(`[name="${day}-start"]`).value;
            const end = row.querySelector(`[name="${day}-end"]`).value;

            if ((start && !end) || (!start && end)) {
                isValid = false;
                showNotification(`Cần nhập đầy đủ giờ cho ${day}!`, "warning", 3000);
                return;
            }

            if (start && end && parseInt(start) >= parseInt(end)) {
                isValid = false;
                showNotification(`Giờ vào phải nhỏ hơn giờ ra cho ${day}!`, "warning", 3000);
                return;
            }

            if (start && end) {
                shifts.push({ day: formattedDay, start: parseInt(start), end: parseInt(end) });
            }
        });

        if (isValid) {
            try {
                const response = await fetch(
                    `https://zewk.tocotoco.workers.dev?action=savedk&token=${token}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ employeeId, shifts })
                    }
                );
                showNotification(
                    response.ok ? "Lịch làm việc đã được lưu thành công!" : "Có lỗi khi lưu lịch!",
                    response.ok ? "success" : "error",
                    3000
                );
            } catch (error) {
                showNotification("Lỗi khi gửi yêu cầu!", "error", 3000);
            }
        }
    });
};

const updateMenuByRole = (userRole) => {
    document.querySelectorAll("#menuList .menu-item").forEach(item => {
        const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
        item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
    });
};

// Initialize
(async () => {
    const user = await checkAuthentication();
    if (user) {
        renderPersonalInfo(user);
        renderScheduleRegistration(user);
    }
})();
