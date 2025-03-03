const API_URL = "https://zewk.tocotoco.workers.dev";
const SUCCESS_STATUS = 200;
const ACCOUNT_EXISTS_STATUS = 209;
const PHONE_EXISTS_STATUS = 210;
const EMAIL_EXISTS_STATUS = 211;

const loginFormContainer = document.getElementById("loginFormContainer");
const registerFormContainer = document.getElementById("registerFormContainer");
const notification = document.getElementById("notification");

document.getElementById("goToRegister").addEventListener("click", showRegisterForm);
document.getElementById("backToLogin").addEventListener("click", showLoginForm);
document.getElementById("registerForm").addEventListener("submit", handleRegister);
document.getElementById("loginForm").addEventListener("submit", handleLogin);
window.addEventListener("DOMContentLoaded", prefillLoginForm);
document.addEventListener("keydown", disableDevTools);
document.addEventListener("contextmenu", disableRightClick);

// Hàm hiển thị form đăng ký và tải danh sách cửa hàng
function showRegisterForm() {
  loginFormContainer.style.display = "none";
  registerFormContainer.style.display = "block";
  loadStoreNames(); // Tải danh sách storeName từ server
}

// Hàm hiển thị form đăng nhập
function showLoginForm() {
  registerFormContainer.style.display = "none";
  loginFormContainer.style.display = "block";
}

// Hàm hiển thị thông báo
function showNotification(message, type = "success", duration = 3000) {
  notification.className = `notification ${type} show`;
  notification.innerText = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.style.display = "none";
    }, 500);
  }, duration);
}

// Hàm tải danh sách cửa hàng với Select2
async function loadStoreNames() {
  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = "block";

  try {
    const response = await fetch(`${API_URL}?action=getStores`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const stores = await response.json();
      const storeSelect = document.getElementById("storeName");
      storeSelect.innerHTML = '<option value="" disabled selected>Chọn cửa hàng</option>';

      // Thêm các option
      stores.forEach(store => {
        const option = document.createElement("option");
        option.value = store.storeId;
        option.text = store.storeName;
        storeSelect.appendChild(option);
      });

      // Khởi tạo Select2 sau khi điền dữ liệu
      if (!storeSelect.hasAttribute("data-select2-initialized")) {
        $(storeSelect).select2({
          placeholder: "Tìm kiếm cửa hàng...",
          allowClear: true,
          width: "100%",
        });
        storeSelect.setAttribute("data-select2-initialized", "true"); // Đánh dấu đã khởi tạo
      } else {
        $(storeSelect).trigger("change"); // Cập nhật nếu đã khởi tạo
      }
    } else {
      showNotification("Không thể tải danh sách cửa hàng!", "error");
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách cửa hàng:", error.message);
    showNotification("Có lỗi khi tải danh sách cửa hàng!", "error");
  } finally {
    spinner.style.display = "none";
  }
}

// Hàm xử lý đăng ký
async function handleRegister(event) {
  event.preventDefault();
  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = "block";

  const employeeId = document.getElementById("employeeId").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const storeName = document.getElementById("storeName").value; // Lấy storeId
  const position = "NV";
  const joinDate = document.getElementById("joinDate").value;
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!isValidName(fullName)) {
    showNotification("Tên nhân viên không chứa ký tự đặc biệt và không dài quá 30 ký tự", "warning");
    spinner.style.display = "none";
    return;
  }
  if (!isValidEmployeeId(employeeId)) {
    showNotification("Mã nhân viên không hợp lệ", "warning");
    spinner.style.display = "none";
    return;
  }
  if (!isValidPassword(password)) {
    showNotification("Mật khẩu phải có ít nhất 6 ký tự và chứa chữ cái in hoa", "warning");
    spinner.style.display = "none";
    return;
  }

  // Thêm kiểm tra storeName hợp lệ (tùy chọn)
  const stores = await (await fetch(`${API_URL}?action=getStores`)).json();
  if (!stores.some(store => store.storeId === storeName)) {
    showNotification("Vui lòng chọn cửa hàng hợp lệ!", "warning");
    spinner.style.display = "none";
    return;
  }

  const data = { employeeId, password, fullName, storeName, position, joinDate, phone, email };
  try {
    const registerResponse = await fetch(`${API_URL}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    switch (registerResponse.status) {
      case ACCOUNT_EXISTS_STATUS:
        showNotification("Tài khoản đã tồn tại!", "warning");
        break;
      case PHONE_EXISTS_STATUS:
        showNotification("Số điện thoại đã tồn tại!", "warning");
        break;
      case EMAIL_EXISTS_STATUS:
        showNotification("Email đã tồn tại!", "warning");
        break;
      case SUCCESS_STATUS:
        const result = await registerResponse.json();
        showNotification(result.message, "success");
        showLoginForm();
        break;
      default:
        showNotification("Đăng ký thất bại, vui lòng thử lại!", "error");
    }
  } catch (error) {
    console.error("Lỗi xảy ra:", error.message);
    showNotification("Có lỗi khi gửi yêu cầu. Vui lòng thử lại", "error");
  } finally {
    spinner.style.display = "none";
  }
}

// Hàm xử lý đăng nhập
async function handleLogin(event) {
  event.preventDefault();
  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = "block";

  const loginEmployeeId = document.getElementById("loginEmployeeId").value.trim();
  const loginPassword = document.getElementById("loginPassword").value.trim();
  const rememberMe = document.getElementById("rememberMe").checked;
  const data = { loginEmployeeId, loginPassword };

  try {
    const loginResponse = await fetch(`${API_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (loginResponse.ok) {
      const result = await loginResponse.json();
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }
      showNotification("Đăng nhập thành công", "success");
      localStorage.setItem("loggedInUser", JSON.stringify(data));
      if (rememberMe) {
        localStorage.setItem("rememberedEmployeeId", loginEmployeeId);
        localStorage.setItem("rememberedPassword", loginPassword);
      } else {
        localStorage.removeItem("rememberedEmployeeId");
        localStorage.removeItem("rememberedPassword");
      }
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 3000);
    } else {
      handleLoginErrors(loginResponse.status);
    }
  } catch (error) {
    console.error("Lỗi xảy ra:", error.message);
    showNotification("Có lỗi khi gửi yêu cầu. Vui lòng thử lại", "error");
  } finally {
    spinner.style.display = "none";
  }
}

// Hàm xử lý lỗi đăng nhập
function handleLoginErrors(status) {
  switch (status) {
    case 401:
      showNotification("Mật khẩu không đúng", "error");
      break;
    case 404:
      showNotification("Mã nhân viên không tồn tại", "warning");
      break;
    default:
      showNotification("Đăng nhập thất bại! Vui lòng thử lại", "error");
  }
}

// Hàm điền thông tin đăng nhập đã lưu
function prefillLoginForm() {
  const rememberedEmployeeId = localStorage.getItem("rememberedEmployeeId");
  const rememberedPassword = localStorage.getItem("rememberedPassword");

  if (rememberedEmployeeId && rememberedPassword) {
    document.getElementById("loginEmployeeId").value = rememberedEmployeeId;
    document.getElementById("loginPassword").value = rememberedPassword;
    document.getElementById("rememberMe").checked = true;
  }
}

// Ngăn chặn mở DevTools
function disableDevTools(e) {
  if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
    e.preventDefault();
  }
}

// Ngăn chặn click phải
function disableRightClick(e) {
  e.preventDefault();
}

// Hàm kiểm tra tên hợp lệ
function isValidName(name) {
  const trimmedName = name.trim();
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/g;
  return trimmedName.length > 0 && trimmedName.length <= 30 && !specialCharRegex.test(trimmedName);
}

// Hàm kiểm tra mã nhân viên hợp lệ
function isValidEmployeeId(employeeId) {
  return employeeId.includes("CHMN") || employeeId.includes("VP") || employeeId.includes("ADMIN");
}

// Hàm kiểm tra mật khẩu hợp lệ
function isValidPassword(password) {
  const passwordPattern = /^(?=.*[A-Z]).{6,}$/;
  return passwordPattern.test(password);
}
