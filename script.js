async function submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email) {
  const proxyURL = "https://noisy-sound-fe4a.dailoi1106.workers.dev/";

  // Tạo dữ liệu để gửi, đảm bảo tất cả các giá trị là chuỗi
  const data = {
    employeeId: String(employeeId || ""),
    password: String(password || ""),
    fullName: String(fullName || ""),
    storeName: String(storeName || ""),
    position: String(position || ""),
    joinDate: String(joinDate || ""),
    phone: String(phone || ""),
    email: String(email || ""),
  };

  console.log("Sending data:", data);

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
      alert(`Lỗi: ${result.message}`);
    }
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
    alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
}

function isValidEmployeeId(employeeId) {
  return employeeId.includes("CHMN") || employeeId.includes("VP");
}

function showForm(formId) {
  document.querySelectorAll(".form-container").forEach((form) => {
    form.style.display = "none";
  });
  document.getElementById(formId).style.display = "block";
}

function showSuccessMessage(message) {
  document.getElementById("successMessage").innerHTML = message;
  document.getElementById("registerFormContainer").style.display = "none";
  document.getElementById("successMessage").style.display = "block";
}

document.getElementById("registerBtn").addEventListener("click", () => showForm("registerFormContainer"));
document.getElementById("loginBtn").addEventListener("click", () => showForm("loginFormContainer"));
document.getElementById("backToWelcome").addEventListener("click", () => showForm("welcomeContainer"));
document.getElementById("backToWelcomeLogin").addEventListener("click", () => showForm("welcomeContainer"));

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
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  await submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email);
});

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const loginEmployeeId = document.getElementById("loginEmployeeId").value;
  const loginPassword = document.getElementById("loginPassword").value;

  if (!isValidEmployeeId(loginEmployeeId)) {
    document.getElementById("loginEmployeeIdError").style.display = "block";
    return;
  } else {
    document.getElementById("loginEmployeeIdError").style.display = "none";
  }

  alert("Đăng nhập thành công!");
});
