// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBYKq7cfWvR7Ex7CB2O43ql12mEIu_tJD4",
  authDomain: "tocotoco-9b6d7.firebaseapp.com",
  projectId: "tocotoco-9b6d7",
  storageBucket: "tocotoco-9b6d7.appspot.com",
  messagingSenderId: "238255895493",
  appId: "1:238255895493:web:90aaf46d56ab60ee3911ac",
  measurementId: "G-NPLLCJHZMQ",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Kiểm tra Employee ID hợp lệ
function isValidEmployeeId(id) {
  return id && id.length >= 5;
}

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

// Xử lý đăng ký
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const employeeId = document.getElementById("employeeId").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const storeName = document.getElementById("storeName").value.trim();
  const position = document.getElementById("position").value.trim();
  const joinDate = document.getElementById("joinDate").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!isValidEmployeeId(employeeId)) {
    document.getElementById("employeeIdError").style.display = "block";
    return;
  } else {
    document.getElementById("employeeIdError").style.display = "none";
  }

  try {
    await db.collection("employees").doc(employeeId).set({
      employeeId,
      password,
      fullName,
      storeName,
      position,
      joinDate,
      phone,
      email,
      createdAt: new Date().toISOString(),
    });

    alert("Đăng ký thành công!");
    document.getElementById("registerForm").reset();
  } catch (error) {
    console.error("Lỗi:", error);
    alert("Đã xảy ra lỗi khi đăng ký!");
  }
});/-strong/-heart:>:o:-((:-h // Xử lý đăng nhập
document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const loginEmployeeId = document.getElementById("loginEmployeeId").value.trim();
  const loginPassword = document.getElementById("loginPassword").value.trim();

  if (!isValidEmployeeId(loginEmployeeId)) {
    document.getElementById("loginEmployeeIdError").style.display = "block";
    return;
  } else {
    document.getElementById("loginEmployeeIdError").style.display = "none";
  }

  try {
    const doc = await db.collection("employees").doc(loginEmployeeId).get();
    if (doc.exists && doc.data().password === loginPassword) {
      alert("Đăng nhập thành công!");
    } else {
      alert("ID hoặc mật khẩu không đúng!");
    }
  } catch (error) {
    console.error("Lỗi:", error);
    alert("Đã xảy ra lỗi khi đăng nhập!");
  }
});​18:54/-strong/-heart:>:o:-((:-hĐã gửi Xem trước khi gửiThả Files vào đây để xem lại trước khi gửi
