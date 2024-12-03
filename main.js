const LOGOUT_TIME = 10 * 60 * 1000; // Thời gian không hoạt động tối đa: 10 phút (ms)
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let user;
const menuList = document.getElementById("menuList");
menuList.style.display = 'none';
// Kiểm tra xem người dùng có thông tin đăng nhập không
if (loggedInUser) {
    const employeeId = loggedInUser.loginEmployeeId;
    try {
        // Gửi yêu cầu GET để lấy thông tin người dùng
        const response = await fetch(`https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${employeeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            user = await response.json();  // Lưu dữ liệu trả về vào biến user
            // Hiển thị thông tin người dùng
            document.getElementById("userInfo").innerText = `Chào ${user.fullName} - ${user.employeeId}`;
            updateMenuByRole(user.position);
            menuList.style.display = 'block';
            // Kiểm tra thời gian hoạt động
            const lastActivity = localStorage.getItem("lastActivity");
            if (lastActivity) {
                const now = new Date().getTime();
                // Nếu chênh lệch thời gian lớn hơn LOGOUT_TIME, xóa thông tin và reload trang
                if (now - lastActivity > LOGOUT_TIME) {
                    localStorage.removeItem("lastActivity");
                    showNotification("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
                    window.location.href = "index.html";
                } else {
                    // Nếu chưa hết hạn, cập nhật lại thời gian hoạt động cuối
                    localStorage.setItem("lastActivity", now);
                }
            }
        } else {
            showNotification("Không tìm thấy người dùng với mã nhân viên này", "warning", 3000);
        }
    } catch (error) {
        showNotification("Lỗi khi gửi yêu cầu:", "error", 3000);
    }
} else {
    showNotification("Chưa có thông tin người dùng đăng nhập", "warning", 3000);
}

// Cập nhật thời gian hoạt động cuối cùng mỗi khi người dùng thực hiện hành động
const updateLastActivity = () => {
    localStorage.setItem("lastActivity", new Date().getTime());
};

// Lắng nghe sự kiện hoạt động của người dùng (di chuột, nhấn phím, cuộn)
window.addEventListener("mousemove", updateLastActivity);
window.addEventListener("keydown", updateLastActivity);
window.addEventListener("scroll", updateLastActivity);

// Xử lý logout
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("lastActivity");
    window.location.href = "index.html";
});


// Hàm tạo danh sách giờ
function createHourOptions(start, end) {
    let options = '<option value="">Chọn giờ</option>';
    for (let hour = start; hour <= end; hour++) {
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`; // Định dạng giờ
        options += `<option value="${formattedHour}">${formattedHour}:00</option>`;
    }
    return options;
}


document.getElementById("openScheduleRegistration").addEventListener("click", async function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>
    
    // Lấy phần tử main và sidebar
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");

    // Kiểm tra nếu là thiết bị di động và thay đổi giao diện
    const isMobile = window.innerWidth <= 768;
    toggleMobileView(isMobile, sidebar, mainContent);

    // Lấy thông tin lịch làm từ API
    const employeeId = user.employeeId;
    const result = await fetchSchedule(employeeId);

    // Cập nhật giao diện dựa trên kết quả
    if (result.ok) {
        renderSchedule(mainContent, isMobile, result.schedule);
    } else {
        renderScheduleForm(mainContent, isMobile);
    }

    // Gắn sự kiện quay lại
    setupBackButton(mainContent, sidebar);

    // Gắn sự kiện cập nhật giờ ra khi chọn giờ vào
    setupStartSelectEvent();

    // Gắn sự kiện gửi form
    setupSubmitForm();
});

// Hàm toggle giao diện cho thiết bị di động
function toggleMobileView(isMobile, sidebar, mainContent) {
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }
}

// Hàm lấy dữ liệu lịch làm từ API
async function fetchSchedule(employeeId) {
    const response = await fetch(`https://zewk.tocotoco.workers.dev?action=checkSchedule&employeeId=${employeeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    return response.json();
}

// Hàm hiển thị lịch làm
function renderSchedule(mainContent, isMobile, schedule) {
    const scheduleContent = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
<h1>Lịch làm của bạn</h1>
<table class="schedule-table">
    <thead>
        <tr>
            <th>Ngày</th>
            <th>Ca làm</th>
            <th>Chỉnh sửa</th>
        </tr>
    </thead>
    <tbody>
        ${shifts.map(daySchedule => {
            const dayName = daySchedule.day === "CN" ? "Chủ Nhật" : `Thứ ${daySchedule.day.slice(1)}`;
            const time = daySchedule.time || "--:--";  // Dữ liệu đã định dạng sẵn
            return `
                <tr>
                    <td>${dayName}</td>
                    <td>${time}</td>  <!-- Hiển thị ca làm đã định dạng -->
                    <td><button class="edit-schedule-btn" data-day="${daySchedule.day}">Chỉnh sửa</button></td>
                </tr>
            `;
        }).join('')}
    </tbody>
</table>
    `;
    mainContent.innerHTML = scheduleContent;
    setupEditButtons();  // Thiết lập các nút chỉnh sửa
}


// Hàm hiển thị form đăng ký lịch làm
function renderScheduleForm(mainContent, isMobile) {
    const scheduleContent = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1>Đăng ký lịch làm</h1>
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
                    ${['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(day => `
                        <tr>
                            <td>${day}</td>
                            <td>
                                <select name="${day}-start" class="time-select start-select" data-day="${day}">
                                    ${createHourOptions(8, 19)}
                                </select>
                            </td>
                            <td>
                                <select name="${day}-end" class="time-select end-select" data-day="${day}">
                                    ${createHourOptions(12, 23)}
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="button-container">
                <button type="submit" class="btn">Gửi</button>
            </div>
        </form>
    `;
    mainContent.innerHTML = scheduleContent;
}

// Hàm gắn sự kiện cho các nút "Chỉnh sửa"
function setupEditButtons() {
    document.querySelectorAll(".edit-schedule-btn").forEach(button => {
        button.addEventListener("click", function () {
            const day = this.getAttribute("data-day");
            // Xử lý chỉnh sửa lịch cho ngày đã chọn
            editScheduleForm(day);
        });
    });
}

// Hàm xử lý sự kiện "Quay lại"
function setupBackButton(mainContent, sidebar) {
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function () {
            mainContent.classList.add("hidden");
            sidebar.classList.remove("hidden");
        });
    }
}

// Hàm xử lý sự kiện thay đổi giờ vào
function setupStartSelectEvent() {
    document.querySelectorAll(".start-select").forEach(select => {
        select.addEventListener("change", function () {
            const day = this.getAttribute("data-day");
            const endSelect = document.querySelector(`[name="${day}-end"]`);
            const startValue = parseInt(this.value);
            
            if (!isNaN(startValue)) {
                const newOptions = createHourOptions(startValue + 4, 23);
                endSelect.innerHTML = newOptions;
            } else {
                endSelect.innerHTML = createHourOptions(12, 23);
            }
        });
    });
}

// Hàm xử lý sự kiện gửi form
function setupSubmitForm() {
    document.getElementById("scheduleForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const shifts = [];
        let isValid = true;

        document.querySelectorAll("tbody tr").forEach(row => {
            const day = row.cells[0].innerText;
            const formattedDay = day === "Chủ Nhật" ? "CN" : day.replace("Thứ ", "T");
            const start = row.querySelector(`[name="${day}-start"]`).value;
            const end = row.querySelector(`[name="${day}-end"]`).value;

            if ((start && !end) || (!start && end)) {
                isValid = false;
                showNotification(`Cần nhập đầy đủ cả giờ vào và giờ ra cho ${day}!`, "warning", 3000);
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
            const data = { employeeId: user.employeeId, shifts };
            console.log("Lịch làm việc đã chọn:", shifts);
            showNotification("Lịch làm đã được gửi!", "success", 3000);

            try {
                const response = await fetch("https://zewk.tocotoco.workers.dev?action=savedk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                const message = response.ok ? "Lịch làm việc đã được lưu thành công!" : "Có lỗi xảy ra khi lưu lịch làm việc!";
                showNotification(message, response.ok ? "success" : "error", 3000);
            } catch (error) {
                showNotification("Lỗi khi gửi yêu cầu!", "error", 3000);
            }
        }
    });
}





document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main");
    const backButton = document.getElementById("backButton");
    const listItems = document.querySelectorAll(".sidebar ul li a");

    // Kiểm tra nếu đang ở chế độ màn hình nhỏ
    const isMobile = () => window.innerWidth <= 768;

    const handleResize = () => {
        if (!isMobile()) {
            // Nếu không phải trên điện thoại, đảm bảo cả sidebar và main luôn hiển thị
            sidebar.classList.remove("hidden");
            main.classList.remove("hidden");
        }
    };

    // Gắn sự kiện click vào các mục trong sidebar
    listItems.forEach(item => {
        item.addEventListener("click", (e) => {
            if (isMobile()) {
                e.preventDefault();
                sidebar.classList.add("hidden"); // Ẩn sidebar
                main.classList.remove("hidden"); // Hiện main
                backButton.classList.remove("hidden"); // Hiện nút quay lại
            }
        });
    });

    // Gắn sự kiện click vào nút quay lại
    backButton.addEventListener("click", () => {
        if (isMobile()) {
            main.classList.add("hidden"); // Ẩn main
            sidebar.classList.remove("hidden"); // Hiện sidebar
        }
    });

    // Xử lý khi thay đổi kích thước cửa sổ
    window.addEventListener("resize", handleResize);

    // Gọi kiểm tra kích thước ngay khi tải trang
    handleResize();
});

function updateMenuByRole(userRole) {
    const menuItems = document.querySelectorAll("#menuList .menu-item"); // Giả sử các mục menu có class "menu-item"
    menuItems.forEach(item => {
        const allowedRoles = item.getAttribute("data-role")?.split(",") || []; // Lấy danh sách role được phép
        if (!allowedRoles.includes(userRole)) {
            item.style.display = "none"; // Ẩn mục menu nếu vai trò không khớp
        }
    });
}
// Hàm thông báo
function showNotification(message, type = "success", duration = 3000) {
    const notification = document.getElementById("notification");

    if (!notification) {
        console.warn("Không tìm thấy phần tử thông báo!");
        return;
    }

    // Thêm lớp CSS tương ứng với loại thông báo
    notification.classList.add(type);
    notification.classList.remove("hidden");  // Đảm bảo thông báo được hiển thị

    // Cập nhật nội dung thông báo
    notification.innerText = message;

    // Thêm hiệu ứng hiển thị
    notification.style.display = "block";
    notification.style.opacity = "1";

    // Ẩn thông báo sau một thời gian
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
            notification.classList.remove(type);  // Xoá lớp kiểu thông báo
        }, 500); // Thời gian animation
    }, duration);
}
