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

    // Kiểm tra nếu là thiết bị di động
    const isMobile = window.innerWidth <= 768;

    // Ẩn sidebar và hiển thị main trên thiết bị di động
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    // Kiểm tra xem người dùng đã có lịch làm chưa
    const employeeId = user.employeeId; // Lấy employeeId từ thông tin người dùng
    const response = await fetch(`https://zewk.tocotoco.workers.dev?action=checkSchedule&employeeId=${employeeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    const result = await response.json();

    // Nếu người dùng đã có lịch làm, hiển thị lịch làm
        if (result.schedule && result.schedule.length > 0) {
        // Nếu đã có lịch làm, hiển thị thông tin lịch làm của người dùng
        const scheduleContent = `
            ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
            <h1>Lịch làm của bạn</h1>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Giờ vào</th>
                        <th>Giờ ra</th>
                        <th>Chỉnh sửa</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.schedule.map(daySchedule => {
                        const dayName = daySchedule.day === "CN" ? "Chủ Nhật" : `Thứ ${daySchedule.day.slice(1)}`;
                        const startTime = daySchedule.start ? daySchedule.start : "--:--";
                        const endTime = daySchedule.end ? daySchedule.end : "--:--";
                        return `
                            <tr>
                                <td>${dayName}</td>
                                <td>${startTime}</td>
                                <td>${endTime}</td>
                                <td><button class="edit-schedule-btn" data-day="${daySchedule.day}">Chỉnh sửa</button></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        mainContent.innerHTML = scheduleContent;

        // Gắn sự kiện chỉnh sửa lịch làm
        document.querySelectorAll(".edit-schedule-btn").forEach(button => {
            button.addEventListener("click", function () {
                const day = this.getAttribute("data-day");
                // Tạo form chỉnh sửa lịch cho ngày đã chọn
                // Ví dụ: Chuyển hướng tới form chỉnh sửa hoặc hiển thị form chỉnh sửa ở đây
                editScheduleForm(day);
            });
        });

    } else {
        / Cập nhật nội dung của main
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

    // Gắn sự kiện click cho nút "Quay lại" nếu có
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function () {
            mainContent.classList.add("hidden");
            sidebar.classList.remove("hidden");
        });
    }

    // Gắn sự kiện tự động cập nhật giờ ra khi chọn giờ vào
    document.querySelectorAll(".start-select").forEach(select => {
        select.addEventListener("change", function () {
            const day = this.getAttribute("data-day"); // Lấy ngày hiện tại
            const endSelect = document.querySelector(`[name="${day}-end"]`); // Lấy ô giờ ra
            const startValue = parseInt(this.value); // Giá trị giờ vào
    
            // Nếu giá trị giờ vào hợp lệ, cập nhật danh sách giờ ra
            if (!isNaN(startValue)) {
                const newOptions = createHourOptions(startValue + 4, 23); // Tạo danh sách giờ ra từ (start + 4) đến 23
                endSelect.innerHTML = newOptions; // Gán lại danh sách giờ ra
            } else {
                // Nếu không có giờ vào, đặt lại danh sách giờ ra mặc định
                endSelect.innerHTML = createHourOptions(12, 23);
            }
        });
   });

    // Gắn sự kiện submit cho form
    document.getElementById("scheduleForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const shifts = [];
        let isValid = true;

        // Duyệt qua tất cả các cặp giờ vào và giờ ra
        document.querySelectorAll("tbody tr").forEach(row => {
            const day = row.cells[0].innerText; // Tên ngày (Thứ 2, Thứ 3, ..., Chủ Nhật)
            const formattedDay = day === "Chủ Nhật" ? "CN" : day.replace("Thứ ", "T"); // Chuyển đổi ngày
            const start = row.querySelector(`[name="${day}-start"]`).value; // Giờ bắt đầu
            const end = row.querySelector(`[name="${day}-end"]`).value; // Giờ kết thúc
        
            // Kiểm tra nếu chỉ có giờ vào hoặc giờ ra
            if ((start && !end) || (!start && end)) {
                isValid = false;
                showNotification(`Cần nhập đầy đủ cả giờ vào và giờ ra cho ${day}!`, "warning", 3000);
                return;
            }
        
            // Kiểm tra nếu giờ vào >= giờ ra
            if (start && end && parseInt(start) >= parseInt(end)) {
                isValid = false;
                showNotification(`Giờ vào phải nhỏ hơn giờ ra cho ${day}!`, "warning", 3000);
                return;
            }

            // Thêm ca làm vào mảng shifts nếu hợp lệ
            if (start && end) {
                shifts.push({
                    day: formattedDay, // Sử dụng ngày đã định dạng
                    start: parseInt(start),
                    end: parseInt(end),
                });
            }
        });


        const employeeId = user.employeeId; // Lấy employeeId từ thông tin người dùng
        const data = { employeeId, shifts };
        if (isValid) {
            console.log("Lịch làm việc đã chọn:", shifts);
            showNotification("Lịch làm đã được gửi!", "success", 3000);

            // Gửi yêu cầu POST đến Cloudflare Worker
            try {
                const response = await fetch("https://zewk.tocotoco.workers.dev?action=savedk", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                if (response.ok) {
                    showNotification("Lịch làm việc đã được lưu thành công!", "success", 3000);
                } else {
                    showNotification("Có lỗi xảy ra khi lưu lịch làm việc!", "error", 3000);
                }
            } catch (error) {
                showNotification("Lỗi khi gửi yêu cầu!", "error", 3000);
            }
        }
    });
        
    }
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
