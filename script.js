// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYKq7cfWvR7Ex7CB2O43ql12mEIu_tJD4",
  authDomain: "tocotoco-9b6d7.firebaseapp.com",
  projectId: "tocotoco-9b6d7",
  storageBucket: "tocotoco-9b6d7.firebasestorage.app",
  messagingSenderId: "238255895493",
  appId: "1:238255895493:web:90aaf46d56ab60ee3911ac",
  measurementId: "G-NPLLCJHZMQ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Hàm kiểm tra Employee ID hợp lệ
function isValidEmployeeId(id) {
  return id && id.length >= 5; // Employee ID phải có ít nhất 5 ký tự
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
  const employeeId = document.getElementById('employeeId').value.trim();
  const password = document.getElementById('password').value.trim();
  const fullName = document.getElementById('fullName').value.trim();
  const storeName = document.getElementById('storeName').value.trim();
  const position = document.getElementById('position').value.trim();
  const joinDate = document.getElementById('joinDate').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  // Kiểm tra Employee ID hợp lệ
  if (!isValidEmployeeId(employeeId)) {
    document.getElementById('employeeIdError').style.display = 'block';
    return;
  } else {
    document.getElementById('employeeIdError').style.display = 'none';
  }

  // Kiểm tra các trường bắt buộc
  if (!email || !phone || !password) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  try {
    // Lưu dữ liệu vào Firestore
    await db.collection('employees').doc(employeeId).set({
      employeeId,
      password,
      fullName,
      storeName,
      position,
      joinDate,
      phone,
      email,
      createdAt: new Date().toISOString()
    });

    alert('Đăng ký thành công!');
    document.getElementById('registerForm').reset(); // Reset form sau khi đăng ký thành công
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu vào Firestore:', error);
    alert('Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại.');
  }
});
// Xử lý gửi form đăng nhập
document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Ngăn form gửi đi theo cách mặc định

  const loginEmployeeId = document.getElementById('loginEmployeeId').value.trim();
  const loginPassword = document.getElementById('loginPassword').value.trim();

  // Kiểm tra Employee ID hợp lệ
  if (!isValidEmployeeId(loginEmployeeId)) {
    document.getElementById('loginEmployeeIdError').style.display = 'block';
    return;
  } else {
    document.getElementById('loginEmployeeIdError').style.display = 'none';
  }
  try {
    // Lấy dữ liệu từ Firestore
    const doc = await db.collection('employees').doc(loginEmployeeId).get();
    if (doc.exists && doc.data().password === loginPassword) {
      alert('Đăng nhập thành công!');
    } else {
      alert('ID hoặc mật khẩu không đúng.');
    }
  } catch (error) {
    console.error('Lỗi khi truy vấn Firestore:', error);
    alert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
  }
});
