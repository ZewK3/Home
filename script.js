// Chuyển đổi giữa giao diện đăng ký và đăng nhập
document.getElementById("switchToRegister").onclick = function () {
  document.getElementById("loginFormContainer").classList.add("hidden");
  document.getElementById("registerFormContainer").classList.remove("hidden");
};

document.getElementById("switchToLogin").onclick = function () {
  document.getElementById("registerFormContainer").classList.add("hidden");
  document.getElementById("loginFormContainer").classList.remove("hidden");
};

// Hàm hiển thị thông báo
function showNotification(message, type = "success", duration = 3000) {
  const notification = document.getElementById("notification");
  notification.className = `notification ${type}`;
  notification.innerText = message;
  notification.style.display = "block";
  notification.style.opacity = "1";

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      notification.style.display = "none";
    }, 500);
  }, duration);
}

// Kiểm tra và tự động điền thông tin nếu người dùng đã chọn "Nhớ đăng nhập"
window.onload = function () {
  const rememberedLogin = JSON.parse(localStorage.getItem("rememberedLogin"));
  if (rememberedLogin) {
    document.getElementById("loginEmployeeId").value = rememberedLogin.employeeId;
    document.getElementById("loginPassword").value = rememberedLogin.password;
    document.getElementById("rememberMe").checked = true;
  }
};

// Xử lý đăng ký
document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn reload trang

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

  const passwordPattern = /^(?=.*[A-Z]).{6,}$/;
  if (!passwordPattern.test(password)) {
    showNotification("Mật khẩu phải >= 6 ký tự và chứa ít nhất một chữ in hoa.", "warning");
    return;
  }

  const data = { employeeId, password, fullName, storeName, position, joinDate, phone, email };

  try {
    const checkResponse = await fetch(
      `https://zewk.tocotoco.workers.dev/register?employeeId=${employeeId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (checkResponse.ok) {
      showNotification("Mã nhân viên đã tồn tại!", "warning");
      return;
    }

    if (checkResponse.status === 404) {
      const registerResponse = await fetch("https://zewk.tocotoco.workers.dev/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (registerResponse.ok) {
        const result = await registerResponse.json();
        showNotification(result.message, "success");
        document.getElementById("registerFormContainer").classList.add("hidden");
        document.getElementById("loginFormContainer").classList.remove("hidden");
      } else {
        showNotification("Đăng ký thất bại! Vui lòng thử lại.", "error");
      }
    }
  } catch (error) {
    showNotification("Lỗi khi kết nối tới máy chủ. Vui lòng thử lại!", "error");
  }
});

// Xử lý đăng nhập
document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn reload trang

  const loginEmployeeId = document.getElementById("loginEmployeeId").value.trim();
  const loginPassword = document.getElementById("loginPassword").value.trim();
  const rememberMe = document.getElementById("rememberMe").checked;

  try {
    const loginResponse = await fetch(
      `https://zewk.tocotoco.workers.dev/register?employeeId=${loginEmployeeId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (loginResponse.ok) {
      const user = await loginResponse.json();

      if (user.password === loginPassword) {
        showNotification("Đăng nhập thành công!", "success");

        if (rememberMe) {
          localStorage.setItem(
            "rememberedLogin",
            JSON.stringify({ employeeId: loginEmployeeId, password: loginPassword })
          );
        } else {
          localStorage.removeItem("rememberedLogin");
        }

        localStorage.setItem("loggedInUser", JSON.stringify(user));
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 3000);
      } else {
        showNotification("Mật khẩu không đúng!", "error");
      }
    } else if (loginResponse.status === 404) {
      showNotification("Mã nhân viên không tồn tại!", "warning");
    } else {
      showNotification("Có lỗi xảy ra khi kiểm tra đăng nhập!", "error");
    }
  } catch (error) {
    showNotification("Không thể kết nối tới máy chủ. Vui lòng thử lại!", "error");
  }
});
