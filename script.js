// Chuyển đổi giữa giao diện đăng ký và đăng nhập
document.getElementById("goToRegister").addEventListener("click", function () {
  document.getElementById("loginFormContainer").style.display = "none";
  document.getElementById("registerFormContainer").style.display = "block";
});

document.getElementById("backToLogin").addEventListener("click", function () {
  document.getElementById("registerFormContainer").style.display = "none";
  document.getElementById("loginFormContainer").style.display = "block";
});
// Xử lý đăng ký
document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn reload trang
  // Lấy dữ liệu từ form
  const employeeId = document.getElementById("employeeId").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const storeName = document.getElementById("storeName").value;
  const position = document.getElementById("position").value;
  const joinDate = document.getElementById("joinDate").value;
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  
  if (!isValidName(fullName)) {
        showNotification("Tên nhân viên Không chứa ký tự đặc biệt và không dài quá 30 ký tự","warning");
        return;
    }
  if (!employeeId.includes("CHMN") && !employeeId.includes("VP")) {
     showNotification("Mã nhân viên phải chứa 'CHMN' hoặc 'VP'!", "warning");
     return;
 }
  // Kiểm tra mật khẩu: phải có ít nhất 6 ký tự và có ít nhất một chữ cái in hoa
  const passwordPattern = /^(?=.*[A-Z]).{6,}$/; // Biểu thức chính quy để kiểm tra
  if (!passwordPattern.test(password)) {
    showNotification("Mật khẩu >= 6 ký tự và chứa chữ cái in hoa","warning");
    return;
  }
  const data = { employeeId, password, fullName, storeName, position, joinDate, phone, email, };

  try {
    // Kiểm tra employeeId có tồn tại
    const checkResponse = await fetch(
      `https://zewk.tocotoco.workers.dev/register?employeeId=${employeeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (checkResponse.ok) {
      const existingUser = await checkResponse.json();
      showNotification("Mã nhân viên đã tồn tại!", "warning",3000);
      return;
    }

    if (checkResponse.status === 404) {
      // Mã nhân viên chưa tồn tại, thực hiện đăng ký
      const registerResponse = await fetch("https://zewk.tocotoco.workers.dev/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (registerResponse.ok) {
        const result = await registerResponse.json();
        showNotification(result.message, "success"); // Hiển thị thông báo thành công
        document.getElementById("registerFormContainer").style.display = "none";
        document.getElementById("loginFormContainer").style.display = "block";
      } else {
        showNotification("Đăng ký thất bại! Vui lòng thử lại", "error",3000);
      }
    } else {
      showNotification("Có lỗi xảy ra khi kiểm tra mã nhân viên", "error",3000);
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});
// Xử lý đăng nhập
document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn reload trang
  // Lấy dữ liệu từ form đăng nhập
  const loginEmployeeId = document.getElementById("loginEmployeeId").value.trim();
  const loginPassword = document.getElementById("loginPassword").value.trim();

  try {
    // Kiểm tra thông tin đăng nhập
    const loginResponse = await fetch(
      `https://zewk.tocotoco.workers.dev/register?employeeId=${loginEmployeeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (loginResponse.ok) {
      const user = await loginResponse.json();
      // Lấy password hash và salt đã lưu
      const storedHash = new Uint8Array(user.password); // Hash đã lưu trong KV
      const storedSalt = new Uint8Array(user.salt); // Salt đã lưu trong KV
      // Hàm để mã hóa mật khẩu nhập vào và so sánh với hash đã lưu
      async function verifyPassword(storedHash, storedSalt, inputPassword) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(inputPassword); // Mật khẩu nhập vào
        // Tạo lại hash từ salt đã lưu và mật khẩu nhập vào
        const hashedInputPassword = await crypto.subtle.importKey(
          "raw",
          passwordBuffer,
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
        ).then(key => {
          return crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt: storedSalt,
              iterations: 100000,
              hash: "SHA-256",
            },
            key,
            { name: "HMAC", hash: "SHA-256", length: 256 },
            false,
            ["sign"]
          );
        });

        const hashedInputPasswordBuffer = await crypto.subtle.sign("HMAC", hashedInputPassword, passwordBuffer);
        // So sánh hash của mật khẩu nhập vào với hash đã lưu
        return storedHash.every((val, index) => val === new Uint8Array(hashedInputPasswordBuffer)[index]);
      }
      // Kiểm tra mật khẩu
      const isPasswordCorrect = await verifyPassword(storedHash, storedSalt, loginPassword);
      const rememberMe = document.getElementById("rememberMe").checked;
      if (isPasswordCorrect) {
        // Đăng nhập thành công
        document.getElementById("loginFormContainer").style.display = "none";
        if (rememberMe) {
          localStorage.setItem(
            "rememberedLogin",
            JSON.stringify({ employeeId: loginEmployeeId, password: loginPassword })
          );
        } else {
          localStorage.removeItem("rememberedLogin");
        }
        showNotification("Đăng nhập thành công!", "success",3000);
      // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));
      // Chuyển hướng sang dashboard.html
        setTimeout(() => {
           window.location.href = "dashboard.html";
        }, 3000);
         
      } else {
        // Mật khẩu sai
        showNotification("Mật khẩu không đúng!", "error",3000);
      }
    } else if (loginResponse.status === 404) {
      // Mã nhân viên không tồn tại
      showNotification("Mã nhân viên không tồn tại!", "warning",3000);
    } else {
      showNotification("Có lỗi xảy ra khi kiểm tra đăng nhập", "error",3000);
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});
function isValidName(name) {
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{1,30}$/;
    return regex.test(name);
  }
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
});

