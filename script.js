// Sửa lại async function submitData để sử dụng proxyURL đúng và thêm kiểm tra lỗi
async function submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email) {
  const proxyURL = "https://tocotoco.dailoi1106.workers.dev"; // URL của Cloudflare Worker
  const apiURL = `${proxyURL}/register`; // Đảm bảo có endpoint API đúng

  // Tạo dữ liệu để gửi
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
  console.log("Sending data:", data); // In ra dữ liệu để kiểm tra

  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Gửi yêu cầu JSON
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi từ server: ${errorText}`);
    }

    const result = await response.json();
    if (result && result.message) {
      alert(result.message); // Hiển thị thông báo từ API
    } else {
      throw new Error("Không có thông báo từ API.");
    }
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
    alert("Không thể gửi dữ liệu. Vui lòng thử lại sau.\nChi tiết lỗi: " + error.message);
  }
}

// Xác thực mã nhân viên (ID)
function isValidEmployeeId(employeeId) {
  return employeeId.includes("CHMN") || employeeId.includes("VP");
}

// Hiển thị form đăng ký
document.getElementById('registerBtn').addEventListener('click', function () {
  document.getElementById('welcomeContainer').style.display = 'none'; // Ẩn màn hình chào mừng
  document.getElementById('registerFormContainer').style.display = 'block'; // Hiển thị form đăng ký
});

// Hiển thị form đăng nhập
document.getElementById('loginBtn').addEventListener('click', function () {
  document.getElementById('welcomeContainer').style.display = 'none'; // Ẩn màn hình chào mừng
  document.getElementById('loginFormContainer').style.display = 'block'; // Hiển thị form đăng nhập
});

// Quay lại màn hình chào mừng từ đăng ký
document.getElementById('backToWelcome').addEventListener('click', function () {
  document.getElementById('registerFormContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'block';
});

// Quay lại màn hình chào mừng từ đăng nhập
document.getElementById('backToWelcomeLogin').addEventListener('click', function () {
  document.getElementById('loginFormContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'block';
});

// Xử lý gửi form đăng ký
document.getElementById('registerForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Ngăn form gửi đi theo cách mặc định

  // Lấy giá trị từ các trường input
  const employeeId = document.getElementById('employeeId').value;
  const password = document.getElementById('password').value;
  const fullName = document.getElementById('fullName').value;
  const storeName = document.getElementById('storeName').value;
  const position = document.getElementById('position').value;
  const joinDate = document.getElementById('joinDate').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;

  // Kiểm tra ID hợp lệ
  if (!isValidEmployeeId(employeeId)) {
    document.getElementById('employeeIdError').style.display = 'block';
    return;
  } else {
    document.getElementById('employeeIdError').style.display = 'none';
  }

  // Kiểm tra các trường bắt buộc khác
  if (!email || !phone || !password) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  // Gửi dữ liệu
  await submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email);
});

// Xử lý gửi form đăng nhập
document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Ngăn form gửi đi theo cách mặc định

  const loginEmployeeId = document.getElementById('loginEmployeeId').value;
  const loginPassword = document.getElementById('loginPassword').value;

  // Kiểm tra ID hợp lệ
  if (!isValidEmployeeId(loginEmployeeId)) {
    document.getElementById('loginEmployeeIdError').style.display = 'block';
    return;
  } else {
    document.getElementById('loginEmployeeIdError').style.display = 'none';
  }

  // Mô phỏng đăng nhập thành công
  alert('Đăng nhập thành công!');
});
