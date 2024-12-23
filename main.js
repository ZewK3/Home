const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let user;
const menuList = document.getElementById("menuList");
menuList.style.display = 'none';
const token = localStorage.getItem("authToken");
// Kiểm tra xem người dùng có thông tin đăng nhập không
if (loggedInUser) {
    const employeeId = loggedInUser.loginEmployeeId;
    try {
        // Gửi yêu cầu GET để lấy thông tin người dùng
        const response = await fetch(`https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${employeeId}&token=${token}`, {
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
        } else {
            showNotification("Không tìm thấy người dùng với mã nhân viên này", "warning", 3000);
        }
    } catch (error) {
        showNotification("Lỗi khi gửi yêu cầu", "error", 3000);
    }
} else {
    window.location.href = "index.html";
}

// Xử lý logout
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

// mở giao diện xếp lịch
document.getElementById("openPersonalInformation").addEventListener("click", async function (e) {
    e.preventDefault();

    const role = user.position;
    const allowedRoles = ["AD", "NV", "QL", "AM"];
    if (!allowedRoles.includes(role)) {
        showNotification("Bạn Không Có Quyền Truy Cập", "error", 3000);
        return;
    }

    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;
    const originalMainContentHTML = mainContent.innerHTML;

    // Ẩn sidebar trên giao diện mobile
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    // Hiển thị thông tin cá nhân
    mainContent.innerHTML = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1>Thông Tin Cá Nhân</h1>
        <form id="personalInfoForm">
            <table class="personal-info-table">
                <tbody>
                    <tr>
                        <th>Mã Nhân Viên</th>
                        <td>${user.employeeId || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Họ Tên</th>
                        <td>${user.fullName || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${user.email || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Số Điện Thoại</th>
                        <td>${user.phone || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Vị Trí</th>
                        <td>${user.position || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Cửa Hàng</th>
                        <td>${user.store || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Ngày Tham Gia</th>
                        <td>${user.joinDate || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
            <div class="button-container">
                <button type="button" id="editInfo" class="btn">Chỉnh sửa</button>
                <button type="button" id="saveInfo" class="btn hidden">Lưu</button>
            </div>
        </form>
    `;
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
    // Xử lý sự kiện nút "Chỉnh sửa"
    document.getElementById("editInfo").addEventListener("click", () => {
        document.querySelectorAll(".personal-info-table td").forEach((cell, index) => {
            if (index > 0) { // Bỏ qua tiêu đề
                const value = cell.textContent;
                cell.innerHTML = `<input type="text" value="${value}" class="edit-input">`;
            }
        });
        document.getElementById("editInfo").classList.add("hidden");
        document.getElementById("saveInfo").classList.remove("hidden");
    });

    // Xử lý sự kiện nút "Lưu"
    document.getElementById("saveInfo").addEventListener("click", () => {
        const updatedInfo = {};
        document.querySelectorAll(".personal-info-table input.edit-input").forEach((input, index) => {
            const key = ["employeeId", "fullName", "email", "phone", "position", "store", "joinDate"][index];
            updatedInfo[key] = input.value;
        });

        // Cập nhật giao diện sau khi lưu
        document.querySelectorAll(".personal-info-table td").forEach((cell, index) => {
            if (index > 0) { // Bỏ qua tiêu đề
                const input = cell.querySelector("input");
                if (input) {
                    cell.textContent = input.value;
                }
            }
        });

        // Ẩn nút "Lưu", hiển thị lại nút "Chỉnh sửa"
        document.getElementById("editInfo").classList.remove("hidden");
        document.getElementById("saveInfo").classList.add("hidden");

        // Gửi thông tin cập nhật tới server (nếu cần)
        console.log("Thông tin đã cập nhật:", updatedInfo);
    });
});


// Mở giao diện đăng ký lịch làm
document.getElementById("openScheduleRegistration").addEventListener("click", async function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>

    // Kiểm tra quyền
    const role = user.position;
    if (!["AD", "NV", "QL"].includes(role)) {
        showNotification("Bạn Không Có Quyền Truy Cập", "error", 3000);
        return;
    }

    const employeeId = user.employeeId; // Lấy employeeId từ thông tin người dùng
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;

    const originalMainContentHTML = mainContent.innerHTML;

    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    try {
        // Gửi yêu cầu kiểm tra trạng thái
        const checkResponse = await fetch(`https://zewk.tocotoco.workers.dev?action=checkdk&employeeId=${employeeId}&token=${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!checkResponse.ok) {
            throw new Error("Lỗi khi gửi yêu cầu kiểm tra trạng thái lịch làm!");
        }

        const checkResult = await checkResponse.json();

        // Nếu nhân viên đã đăng ký lịch làm
        if (checkResponse.status === 200 && checkResult.message === "Nhân viên đã đăng ký lịch làm!") {
            const schedule = checkResult.shifts || [];
            mainContent.innerHTML = `
                ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
                <h1>Lịch đã đăng ký</h1>
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
                            ${schedule.map(daySchedule => {
                                const dayName = daySchedule.day === "CN" ? "Chủ Nhật" : `Thứ ${daySchedule.day.slice(1)}`;
                                const [startTime, endTime] = (daySchedule.time || "--:-- - --:--")
                                    .split("-")
                                    .map(t => t.trim() || "--:--");

                                return `
                                    <tr>
                                        <td>${dayName}</td>
                                        <td>
                                            <select name="${daySchedule.day}-start" class="time-select start-select" data-day="${daySchedule.day}">
                                                ${createHourOptions(8, 19, startTime)}
                                            </select>
                                        </td>
                                        <td>
                                            <select name="${daySchedule.day}-end" class="time-select end-select" data-day="${daySchedule.day}">
                                                ${createHourOptions(12, 23, endTime)}
                                            </select>
                                        </td>
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
        } 
        // Nếu nhân viên chưa đăng ký lịch làm
        else if (checkResponse.status === 202) {
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

// Hàm tạo danh sách giờ
function createHourOptions(start, end, selectedValue = "") {
    let options = '<option value="">Chọn giờ</option>';
    for (let hour = start; hour <= end; hour++) {
        const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        const isSelected = formattedHour === selectedValue ? 'selected' : '';
        options += `<option value="${formattedHour}" ${isSelected}>${formattedHour}</option>`;
    }
    return options;
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
                const response = await fetch(`https://zewk.tocotoco.workers.dev?action=savedk&token=${token}`, {
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
    const audioPlayer = document.getElementById('audioPlayer');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main');
    const showUser = document.querySelector('.showUser');
    const snowflakes = document.querySelector('.snowflakes');
    snowflakes?.classList.add('hidden');
    // Xóa tất cả các lớp trước khi thêm mới
    sidebar?.classList.remove('christmas', 'newyear');
    mainContent?.classList.remove('christmas', 'newyear');
    showUser?.classList.remove('christmas', 'newyear');

    // Xử lý các mùa lễ
    if (currentMonth === 11 ) { // Tháng 12 và tháng 1
        sidebar?.classList.add('christmas');
        mainContent?.classList.add('christmas');
        showUser?.classList.add('christmas');
        snowflakes?.classList.remove('hidden');
        
        audioPlayer.querySelector('source').src = 'Music/songmc.mp3'; // Đổi nguồn nhạc
        audioPlayer.load(); // Tải lại nhạc mới
        audioPlayer.play(); // Phát nhạc mới
    } else if (currentMonth >= 0 && currentMonth <= 2) { // Tháng 1 đến tháng 3
        sidebar?.classList.add('newyear');
        mainContent?.classList.add('newyear');
        showUser?.classList.add('newyear');
        audioPlayer.querySelector('source').src = 'Music/songny.mp3'; // Đổi nguồn nhạc
        audioPlayer.load(); // Tải lại nhạc mới
        audioPlayer.play(); // Phát nhạc mới
    } else {
        // Ẩn tuyết nếu không phải mùa lễ
    }
}
// Gọi hàm ngay khi tải trang
updateSidebarAndMainColor();

function getAuthToken() {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const [key, value] = cookies[i].split('=');
        if (key === 'authToken') {
            return value;
        }
    }
    return null; // Nếu không tìm thấy authToken
}

const timeout = 10 * 60 * 1000;

let hiddenStartTime = null;
let timeoutId = null;

  // Theo dõi sự kiện thay đổi trạng thái hiển thị của trang
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
    // Người dùng rời khỏi trang
    hiddenStartTime = Date.now();
    // Thiết lập bộ đếm để reload sau 10 phút
    timeoutId = setTimeout(() => {
        location.reload();
    }, timeout);
      } else {
    // Người dùng quay lại trang
    if (hiddenStartTime) {
        const elapsed = Date.now() - hiddenStartTime;

        if (elapsed >= timeout) {
      location.reload(); // Reload ngay nếu thời gian rời khỏi đủ lâu
        } else {
      clearTimeout(timeoutId); // Hủy bộ đếm nếu quay lại trước 10 phút
        }
    }
    hiddenStartTime = null; // Reset trạng thái
    }
});


document.addEventListener('keydown', function(e) {
    // Chặn F12 hoặc Ctrl + Shift + I
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});

// Chặn click chuột phải
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
