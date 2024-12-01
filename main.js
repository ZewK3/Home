const LOGOUT_TIME = 10 * 60 * 1000; // Thời gian không hoạt động tối đa: 10 phút (ms)
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let user;
// Kiểm tra xem người dùng có thông tin đăng nhập không
if (loggedInUser) {
    const employeeId = loggedInUser.loginEmployeeId;

    // Hiển thị giao diện loading và ẩn sidebar/main
    document.querySelector(".sidebar").style.display = "none";
    document.getElementById("loading").style.display = "flex";
    document.querySelector(".main").style.display = "none";

    const loadingBar = document.getElementById("loadingBar");
    const loadingText = document.getElementById("loadingText");

    // Hàm cập nhật thanh tiến độ
    const updateProgress = () => {
        let progress = 0;
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                progress += 5;
                loadingBar.style.width = `${progress}%`;
                loadingText.innerText = `Đang tải... ${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    resolve(); // Hoàn tất tiến trình
                }
            }, 100); // Tăng mỗi 100ms
        });
    };

    // Hàm tải thông tin người dùng
    const fetchUserData = async () => {
        try {
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${employeeId}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                showNotification("Không tìm thấy người dùng với mã nhân viên này", "warning", 3000);
                throw new Error("User not found");
            }

            const user = await response.json();
            document.getElementById("userInfo").innerText = `Chào ${user.fullName} - ${user.employeeId}`;
            updateMenuByRole(user.position);

            // Kiểm tra thời gian hoạt động
            const lastActivity = localStorage.getItem("lastActivity");
            const now = new Date().getTime();

            if (lastActivity && now - lastActivity > LOGOUT_TIME) {
                localStorage.removeItem("lastActivity");
                showNotification("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
                window.location.href = "index.html";
            } else {
                localStorage.setItem("lastActivity", now);
            }
        } catch (error) {
            showNotification("Lỗi khi tải dữ liệu: " + error.message, "error", 3000);
            throw error;
        }
    };

    // Chạy tiến trình
    (async () => {
        try {
            await updateProgress();
            await fetchUserData();

            // Ẩn loading và hiển thị giao diện
            document.getElementById("loading").style.display = "none";
            document.querySelector(".sidebar").style.display = "block";
            document.querySelector(".main").style.display = "block";
        } catch {
            // Đảm bảo ẩn loading nếu có lỗi
            document.getElementById("loading").style.display = "none";
        }
    })();
} else {
    showNotification("Chưa có thông tin người dùng đăng nhập", "warning", 3000);
    document.getElementById("loading").style.display = "none";
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
        options += `<option value="${hour}">${hour}:00</option>`;
    }
    return options;
}

// Mở giao diện đăng ký lịch làm
document.getElementById("openScheduleRegistration").addEventListener("click", function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>

    // Lấy phần tử main và sidebar
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");

    // Kiểm tra nếu là thiết bị di động
    const isMobile = window.innerWidth <= 768;

    // Ẩn sidebar và hiển thị main trên thiết bị di động
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    // Cập nhật nội dung của main
    mainContent.innerHTML = `
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
                                <select name="${day}-start" class="time-select">
                                    ${createHourOptions(8, 19)}
                                </select>
                            </td>
                            <td>
                                <select name="${day}-end" class="time-select">
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

    // Gắn sự kiện click cho nút "Quay lại" nếu có
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function () {
            mainContent.classList.add("hidden");
            sidebar.classList.remove("hidden");
        });
    }

    // Gắn sự kiện submit cho form
    document.getElementById("scheduleForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const shifts = [];
        let isValid = true;

        // Duyệt qua tất cả các cặp giờ vào và giờ ra
        document.querySelectorAll("tbody tr").forEach(row => {
            const day = row.cells[0].innerText;
            const start = row.querySelector(`[name="${day}-start"]`).value;
            const end = row.querySelector(`[name="${day}-end"]`).value;

            if (start && end && parseInt(start) >= parseInt(end)) {
                isValid = false;
                showNotification("Giờ vào phải nhỏ hơn giờ ra cho ${day}!","warning",3000);
            }

            shifts.push({
                day,
                start: start || "Không chọn",
                end: end || "Không chọn"
            });
        });

        if (isValid) {
            console.log("Lịch làm việc đã chọn:", shifts);
            showNotification("Lịch làm đã được gửi!","success",3000);
        }
    });
});

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

    // Thêm hiệu ứng hiển thị
    notification.className = `notification ${type}`;
    notification.innerText = message;
    notification.style.display = "block";
    notification.style.opacity = "1";

    // Ẩn thông báo sau một thời gian
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
        }, 500); // Thời gian animation
    }, duration);
}
