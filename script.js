// Hiển thị form đăng ký
document.getElementById("registerBtn").addEventListener("click", function () {
  document.getElementById("welcomeContainer").style.display = "none";
  document.getElementById("registerFormContainer").style.display = "block";
});
// Hiển thị form đăng nhập
document.getElementById("loginBtn").addEventListener("click", function () {
  document.getElementById("welcomeContainer").style.display = "none";
  document.getElementById("loginFormContainer").style.display = "block";
});
// Quay lại màn hình chào mừng từ đăng ký
document.getElementById("backToWelcome").addEventListener("click", function () {
  document.getElementById("registerFormContainer").style.display = "none";
  document.getElementById("welcomeContainer").style.display = "block";
});
// Quay lại màn hình chào mừng từ đăng nhập
document.getElementById("backToWelcomeLogin").addEventListener("click", function () {
  document.getElementById("loginFormContainer").style.display = "none";
  document.getElementById("welcomeContainer").style.display = "block";
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
  
  if (!employeeId.includes("CHMN") && !employeeId.includes("VP")) {
     showNotification("Mã nhân viên phải chứa 'CHMN' hoặc 'VP'!", "warning");
     return;
 }
  // Kiểm tra mật khẩu: phải có ít nhất 6 ký tự và có ít nhất một chữ cái in hoa
  const passwordPattern = /^(?=.*[A-Z]).{6,}$/; // Biểu thức chính quy để kiểm tra
  if (!passwordPattern.test(password)) {
    alert("Mật khẩu >= 6 ký tự và chứa chữ cái in hoa.");
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
      showNotification("Mã nhân viên đã tồn tại!", "warning");
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
        document.getElementById("successMessage").style.display = "block";
        document.getElementById("registerFormContainer").style.display = "none";
        document.getElementById("loginFormContainer").style.display = "block";
      } else {
        showNotification("Đăng ký thất bại! Vui lòng thử lại", "error");
      }
    } else {
      showNotification("Có lỗi xảy ra khi kiểm tra mã nhân viên", "error");
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
      
      if (isPasswordCorrect) {
        // Đăng nhập thành công
        showNotification("Đăng nhập thành công!", "success");
      // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));
      // Chuyển hướng sang dashboard.html
         window.location.href = "dashboard.html";
      } else {
        // Mật khẩu sai
        showNotification("Mật khẩu không đúng!", "error");
      }
    } else if (loginResponse.status === 404) {
      // Mã nhân viên không tồn tại
      showNotification("Mã nhân viên không tồn tại!", "warning");
    } else {
      showNotification("Có lỗi xảy ra khi kiểm tra đăng nhập", "error");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});

function showNotification(message, type = "success", duration = 3000) {
  const notification = document.getElementById("notification");
  // Xóa các class cũ và thêm class mới
  notification.className = type;
  notification.innerText = message;
  // Hiển thị thông báo
  notification.style.display = "block";
  // Ẩn thông báo sau một thời gian
  setTimeout(() => {
    notification.style.display = "none";
  }, duration);
}
