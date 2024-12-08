const LOGOUT_TIME = 10 * 60 * 1000; // Thời gian không hoạt động tối đa: 10 phút (ms)
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let user;
const menuList = document.getElementById("menuList");
menuList.style.display = 'none';
// Kiểm tra xem người dùng có thông tin đăng nhập không
if (loggedInUser) {
    const employeeId = loggedInUser.loginEmployeeId;
    const sloading = document.getElementById("loading-container");
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
            sloading.style.display = 'none';
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


// Mở giao diện đăng ký lịch làm
document.getElementById("openScheduleRegistration").addEventListener("click", async function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>
    
    const employeeId = user.employeeId; // Lấy employeeId từ thông tin người dùng
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;

    const originalMainContentHTML = mainContent.innerHTML;
    // Kiểm tra xem user đã gửi lịch làm trước đó hay chưa
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }
    try {
    const checkResponse = await fetch(`https://zewk.tocotoco.workers.dev?action=checkdk&employeeId=${employeeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    
    if (checkResponse.status === 500) {
        throw new Error("Lỗi khi gửi yêu cầu kiểm tra trạng thái lịch làm!");
    }

    const checkResult = await checkResponse.json();

    if (checkResponse.status === 200 && checkResult.message === "Nhân viên đã đăng ký lịch làm!") {
        // Nếu nhân viên đã đăng ký lịch làm
        const schedule = checkResult.shifts || [];
        mainContent.innerHTML = ` ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1>Lịch đã đăng ký</h1>
        <form id="scheduleForm">
            <table class="schedule-table">
                <thead>
                    <tr>
                       <th>Ngày</th>
                       <th>Ca làm</th>
                       <th>Chỉnh sửa</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedule.map(daySchedule => {
                    const dayName = daySchedule.day === "CN" ? "Chủ Nhật" : `Thứ ${daySchedule.day.slice(1)}`;
                    const time = daySchedule.time || "--:--";  // Dữ liệu đã định dạng sẵn
                    return `
                        <tr>
                            <td>${dayName}</td>
                            <td>${time}</td> <!-- Gộp giờ vào và giờ ra thành một cột -->
                            <td><button class="edit-schedule-btn" data-day="${daySchedule.day}">Chỉnh sửa</button></td>
                        </tr>
                    `;
                }).join('')}
                </tbody>
            </table>
            <div class="button-container">
                <button type="submit" class="btn">Gửi</button>
            </div>
        </form>
    `;
    } else if(checkResponse.status === 400){
        // Nếu nhân viên chưa đăng ký lịch làm, tiếp tục cho phép thực hiện đăng ký
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
    }
} catch (error) {
    console.error("Lỗi kiểm tra trạng thái lịch làm:", error);
    showNotification("Lỗi khi kiểm tra trạng thái lịch làm! Vui lòng thử lại sau.", "error", 3000);
    return;
}


    // Cập nhật nội dung của main

const backButton = document.getElementById("backButton");
if (backButton) {
    backButton.addEventListener("click", function () {
        if (isMobile) {
            // Nếu là thiết bị di động
            mainContent.classList.add("hidden");
            sidebar.classList.remove("hidden");
        } else {
            // Nếu không phải thiết bị di động
            mainContent.innerHTML = originalMainContentHTML;
        }
    });
}


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
                shifts.push({
                    day: formattedDay,
                    start: parseInt(start),
                    end: parseInt(end),
                });
            }
        });

        if (isValid) {
            try {
                const response = await fetch("https://zewk.tocotoco.workers.dev?action=savedk", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ employeeId, shifts }),
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
});

window.onload = function() {
    const popup = document.getElementById('popup');
    
    // Show the popup
    popup.style.visibility = 'visible';
    
    // Hide the popup after 5 seconds
    setTimeout(function() {
        popup.style.visibility = 'hidden';
    }, 5000); // 5000 milliseconds = 5 seconds
};


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
const snowflakes = document.querySelectorAll('.snowflake');

// Gán kích thước ngẫu nhiên từ 10px đến 50px
snowflakes.forEach(snowflake => {
  const randomFontSize = Math.floor(Math.random() * (50 - 10 + 1)) + 10; // Random từ 10 đến 50
  snowflake.style.fontSize = `${randomFontSize}px`;
});
function updateSidebarAndMainColor() {
    const currentMonth = new Date().getMonth(); // Lấy tháng hiện tại (0 = tháng 1, 11 = tháng 12)

    // Lấy các phần tử cần thay đổi
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main');
    const showUser = document.querySelector('.showUser');
    const snowflakes = document.querySelector('.snowflakes');

    // Xóa tất cả các lớp trước khi thêm mới
    sidebar?.classList.remove('christmas', 'newyear');
    mainContent?.classList.remove('christmas', 'newyear');
    showUser?.classList.remove('christmas', 'newyear');
    snowflakes?.classList.remove('hidden');

    // Xử lý các mùa lễ
    if (currentMonth === 11 ) { // Tháng 12 và tháng 1
        sidebar?.classList.add('christmas');
        mainContent?.classList.add('christmas');
        showUser?.classList.add('christmas');
    } else if (currentMonth >= 1 && currentMonth <= 3) { // Tháng 2 đến tháng 4
        sidebar?.classList.add('newyear');
        mainContent?.classList.add('newyear');
        showUser?.classList.add('newyear');
    } else {
        // Ẩn tuyết nếu không phải mùa lễ
        snowflakes?.classList.add('hidden');
    }
}

// Gọi hàm ngay khi tải trang
updateSidebarAndMainColor();

// Đặt lịch kiểm tra mỗi ngày để tự động thay đổi nếu cần
setInterval(updateSidebarAndMainColor, 60000 * 60 * 24); // Kiểm tra mỗi 24 giờ
