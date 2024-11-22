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

  const data = {
    employeeId,
    password,
    fullName,
    storeName,
    position,
    joinDate,
    phone,
    email,
  };

  try {
    // Kiểm tra employeeId có tồn tại
    const checkResponse = await fetch(
      `https://tocotoco.dailoi1106.workers.dev/register?employeeId=${employeeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (checkResponse.ok) {
      const existingUser = await checkResponse.json();
      alert("Mã nhân viên đã tồn tại! Vui lòng sử dụng mã khác.");
      return;
    }

    if (checkResponse.status === 404) {
      // Mã nhân viên chưa tồn tại, thực hiện đăng ký
      const registerResponse = await fetch("https://tocotoco.dailoi1106.workers.dev/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (registerResponse.ok) {
        const result = await registerResponse.json();
        alert(result.message); // Hiển thị thông báo thành công
        document.getElementById("successMessage").style.display = "block";
        document.getElementById("registerFormContainer").style.display = "none";
      } else {
        alert("Đăng ký thất bại! Vui lòng thử lại.");
      }
    } else {
      alert("Có lỗi xảy ra khi kiểm tra mã nhân viên!");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});
