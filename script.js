
async function submitData() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  const data = { name, email, message };
  const proxyURL = "https://noisy-sound-fe4a.dailoi1106.workers.dev/"; // URL Cloudflare Worker

  try {
    const response = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Kiểm tra nếu dữ liệu trả về có phải JSON không
    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
  }
}

// Kiểm tra mã nhân viên
function isValidEmployeeId(employeeId) {
    return employeeId.includes("CHMN") || employeeId.includes("VP");
}

// Hiển thị giao diện Đăng Ký khi nhấn nút Đăng Ký
document.getElementById('registerBtn').addEventListener('click', function() {
    document.getElementById('welcomeContainer').style.display = 'none';  // Ẩn màn hình welcome
    document.getElementById('registerFormContainer').style.display = 'block';  // Hiển thị form đăng ký
});

// Hiển thị giao diện Đăng Nhập khi nhấn nút Đăng Nhập
document.getElementById('loginBtn').addEventListener('click', function() {
    document.getElementById('welcomeContainer').style.display = 'none';  // Ẩn màn hình welcome
    document.getElementById('loginFormContainer').style.display = 'block';  // Hiển thị form đăng nhập
});

// Quay lại màn hình chính từ Đăng Ký
document.getElementById('backToWelcome').addEventListener('click', function() {
    document.getElementById('registerFormContainer').style.display = 'none';
    document.getElementById('welcomeContainer').style.display = 'block';
});

// Quay lại màn hình chính từ Đăng Nhập
document.getElementById('backToWelcomeLogin').addEventListener('click', function() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('welcomeContainer').style.display = 'block';
});

// Đăng ký
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngừng gửi form

    const employeeId = document.getElementById('employeeId').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;
    const storeName = document.getElementById('storeName').value;
    const position = document.getElementById('position').value;
    const joinDate = document.getElementById('joinDate').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    // Kiểm tra mã nhân viên
    if (!isValidEmployeeId(employeeId)) {
        document.getElementById('employeeIdError').style.display = 'block';
        return;
    } else {
        document.getElementById('employeeIdError').style.display = 'none';
    }

    // Xử lý đăng ký ở đây (ví dụ: gửi thông tin lên server)

    alert('Đăng ký thành công!');
});

// Đăng nhập
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngừng gửi form

    const loginEmployeeId = document.getElementById('loginEmployeeId').value;
    const loginPassword = document.getElementById('loginPassword').value;

    // Kiểm tra mã nhân viên đăng nhập
    if (!isValidEmployeeId(loginEmployeeId)) {
        document.getElementById('loginEmployeeIdError').style.display = 'block';
        return;
    } else {
        document.getElementById('loginEmployeeIdError').style.display = 'none';
    }

    // Kiểm tra thông tin đăng nhập
    alert('Đăng nhập thành công!');
});
