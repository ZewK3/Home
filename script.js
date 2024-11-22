

// Hiển thị form đăng ký
document.getElementById("registerBtn").addEventListener("click", function() {
  document.getElementById("welcomeContainer").style.display = "none";
  document.getElementById("registerFormContainer").style.display = "block";
});

// Hiển thị form đăng nhập
document.getElementById("loginBtn").addEventListener("click", function(){
  document.getElementById("welcomeContainer").style.display = "none";
  document.getElementById("loginFormContainer").style.display = "block";
});

// Quay lại màn hình chào mừng từ đăng ký
document.getElementById("backToWelcome").addEventListener("click", function() {
  document.getElementById("registerFormContainer").style.display = "none";
  document.getElementById("welcomeContainer").style.display = "block";
});

// Quay lại màn hình chào mừng từ đăng nhập
document.getElementById("backToWelcomeLogin").addEventListener("click", (function() {
  document.getElementById("loginFormContainer").style.display = "none";
  document.getElementById("welcomeContainer").style.display = "block";
});

document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn chặn hành động mặc định (reload trang)

  // Lấy dữ liệu từ form
  const employeeId = document.getElementById("employeeId").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("fullName").value;
  const storeName = document.getElementById("storeName").value;
  const position = document.getElementById("position").value;
  const joinDate = document.getElementById("joinDate").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;

  // Dữ liệu gửi đến Worker
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
    // Gửi yêu cầu POST tới Worker
    const response = await fetch("https://<your-worker-url>/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message); // Thông báo thành công
      document.getElementById("successMessage").style.display = "block";
      document.getElementById("registerFormContainer").style.display = "none";
    } else {
      console.error("Lỗi khi gửi dữ liệu:", response.statusText);
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});


