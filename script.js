// Hiển thị form đăng ký
document.getElementById("registerBtn").addEventListener("click", function() {
  document.getElementById("welcomeContainer").style.display = "none";
  document.getElementById("registerFormContainer").style.display = "block";
});

// Quay lại màn hình chào mừng từ đăng ký
document.getElementById("backToWelcome").addEventListener("click", function() {
  document.getElementById("registerFormContainer").style.display = "none";
  document.getElementById("welcomeContainer").style.display = "block";
});

// Gửi dữ liệu đăng ký
document.getElementById("registerForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Ngăn chặn reload trang

  // Lấy dữ liệu từ form
  const data = {
    employeeId: document.getElementById("employeeId").value.trim(),
    password: document.getElementById("password").value.trim(),
    fullName: document.getElementById("fullName").value.trim(),
    storeName: document.getElementById("storeName").value.trim(),
    position: document.getElementById("position").value.trim(),
    joinDate: document.getElementById("joinDate").value,
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
  };

  // Kiểm tra dữ liệu hợp lệ
  if (!data.employeeId || !data.password || !data.fullName || !data.storeName ||
      !data.position || !data.joinDate || !data.phone || !data.email) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  try {
    // Gửi dữ liệu tới Worker
    const response = await fetch("https://tocotoco.dailoi1106.workers.dev/register", {
      method: "POST",
      mode: 'no-cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Đăng ký thành công!");
      document.getElementById("registerFormContainer").style.display = "none";
      document.getElementById("successMessage").style.display = "block";
    } else {
      const error = await response.text();
      alert(`Lỗi đăng ký: ${error}`);
      console.error("Lỗi:", error);
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
});

// Làm mới trang khi đăng ký thành công
function reloadPage() {
  window.location.reload();
}
