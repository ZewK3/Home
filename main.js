const LOGOUT_TIME = 10 * 60 * 1000; // Thời gian không hoạt động tối đa: 10 phút (ms)

// Lấy thông tin người dùng từ localStorage
const user = JSON.parse(localStorage.getItem("loggedInUser"));
const lastActivity = localStorage.getItem("lastActivity");

// Kiểm tra nếu có thông tin người dùng và hoạt động gần nhất
if (user && lastActivity) {
    const now = new Date().getTime();

    // Nếu chênh lệch thời gian lớn hơn LOGOUT_TIME, xóa thông tin và reload trang
    if (now - lastActivity > LOGOUT_TIME) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("lastActivity");
        showNotification("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "index.html";
    } else {
        // Nếu chưa hết hạn, cập nhật lại thời gian hoạt động cuối
        localStorage.setItem("lastActivity", now);
        document.getElementById("userInfo").innerText = `Chào ${user.fullName}, mã nhân viên: ${user.employeeId}`;
    }
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
// Lắng nghe sự kiện click vào "Đăng ký lịch làm"
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

    // Lấy phần tử main
    const mainContent = document.querySelector(".main");

    // Cập nhật nội dung của main
    mainContent.innerHTML = `
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
                showNotification(`Giờ vào phải nhỏ hơn giờ ra cho ${day}!`);
            }

            shifts.push({
                day,
                start: start || "Không chọn",
                end: end || "Không chọn"
            });
        });

        if (isValid) {
            console.log("Lịch làm việc đã chọn:", shifts);
            alert("Lịch làm đã được gửi!");
        }
    });
  document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("lastActivity");
        window.location.href = "index.html";
    });
});

