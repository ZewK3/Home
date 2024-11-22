// Hàm mã hóa mật khẩu
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hàm gửi dữ liệu
async function submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email) {
  const proxyURL = "https://noisy-sound-fe4a.dailoi1106.workers.dev/";

  const hashedPassword = await hashPassword(password); // Mã hóa mật khẩu

  const data = {
    employeeId: String(employeeId || ""),
    password: hashedPassword,
    fullName: String(fullName || ""),
    storeName: String(storeName || ""),
    position: String(position || ""),
    joinDate: String(joinDate || ""),
    phone: String(phone || ""),
    email: String(email || ""),
  };

  console.log("Sending data:", data);

  // Trạng thái loading
  const submitButton = document.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Đang gửi...";

  try {
    const response = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Network response was not ok: ${responseText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      alert("Dữ liệu đã được gửi thành công!");
      showSuccessMessage("Đăng ký thành công!");
    } else {
      showError(`Lỗi: ${result.message}`);
    }
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
    showError("Đã có lỗi xảy ra. Vui lòng thử lại.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Gửi";
  }
}

// Hàm kiểm tra tính hợp lệ của mã nhân viên
function isValidEmployeeId(employeeId) {
  return employeeId.includes("CHMN") || employeeId.includes("VP");
}

// Hiển thị thông báo lỗi
function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.style.display = "block";
  errorContainer.textContent = message;
}

// Hiển thị form
function showForm(formId) {
  document.querySelectorAll(".form-container").forEach((form) => {
    form.style.display = "none";
  });
  document.getElementById(formId).style.display = "block";
}

// Chuyển đổi giữa các form
document.getElementById("registerBtn").addEventListener("click", () => showForm("registerFormContainer"));
document.getElementById("loginBtn").addEventListener("click", () => showForm("loginFormContainer"));
document.getElementById("backToWelcome").addEventListener("click", () => showForm("welcomeContainer"));
document.getElementById("backToWelcomeLogin").addEventListener("click", () => showForm("welcomeContainer"));

// Xử lý đăng ký
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const employeeId = document.getElementById("employeeId").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("fullName").value;
  const storeName = document.getElementById("storeName").value;
  const position = document.getElementById("position").value;
  const joinDate = document.getElementById("joinDate").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;

  if (!isValidEmployeeId(employeeId)) {
    document.getElementById("employeeIdError").style.display = "block";
    return;
  } else {
    document.getElementById("employeeIdError").style.display = "none";
  }

  if (!email || !phone || !password) {
    showError("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  await submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email);
});

// Xử lý đăng nhập
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const loginEmployeeId = document.getElementById("loginEmployeeId").value;
  const loginPassword = document.getElementById("loginPassword").value;

  if (!isValidEmployeeId(loginEmployeeId)) {
    showError("Mã nhân viên không hợp lệ!");
    return;
  }

  alert("Đăng nhập thành công!");
});
