async function submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email) {
  const proxyURL = "https://noisy-sound-fe4a.dailoi1106.workers.dev/"; // Cloudflare Worker URL (consider using a secure environment variable for production)

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
    const response = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");   

    }

    const result = await response.json();   

    alert(result.message); // Show the server response message

    // Optionally hide the form and show a success message with a clear indicator
    document.getElementById('registerFormContainer').style.display = 'none';
    document.getElementById('successMessage').innerHTML = 'Registration successful!'; // Use innerHTML for clear messaging
    document.getElementById('successMessage').style.display = 'block'; // Show success message
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
    alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
}
// Function to validate employee ID
function isValidEmployeeId(employeeId) {
  return employeeId.includes("CHMN") || employeeId.includes("VP");
}

// Show register form
document.getElementById('registerBtn').addEventListener('click', function() {
  document.getElementById('welcomeContainer').style.display = 'none';  // Hide welcome screen
  document.getElementById('registerFormContainer').style.display = 'block';  // Show register form
});

// Show login form
document.getElementById('loginBtn').addEventListener('click', function() {
  document.getElementById('welcomeContainer').style.display = 'none';  // Hide welcome screen
  document.getElementById('loginFormContainer').style.display = 'block';  // Show login form
});

// Back to welcome screen from register
document.getElementById('backToWelcome').addEventListener('click', function() {
  document.getElementById('registerFormContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'block';
});

// Back to welcome screen from login
document.getElementById('backToWelcomeLogin').addEventListener('click', function() {
  document.getElementById('loginFormContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'block';
});

// Handle register form submission
// Handle register form submission
document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission

  // Get values from the form fields
  const employeeId = document.getElementById('employeeId').value;
  const password = document.getElementById('password').value;
  const fullName = document.getElementById('fullName').value;
  const storeName = document.getElementById('storeName').value;
  const position = document.getElementById('position').value;
  const joinDate = document.getElementById('joinDate').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;

  // Validate employee ID
  if (!isValidEmployeeId(employeeId)) {
    document.getElementById('employeeIdError').style.display = 'block';
    return;
  } else {
    document.getElementById('employeeIdError').style.display = 'none';
  }

  // Optional: Validate other fields (email, phone, password)
  if (!email || !phone || !password) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  // Proceed with submitting data to Cloudflare Worker
  await submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email);
});
// Validate email format
// function isValidEmail(email) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }

// // Validate phone number format (Vietnamese numbers as an example)
// function isValidPhone(phone) {
//   const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/;
//   return phoneRegex.test(phone);
// }

// Example usage during form validation
// if (!isValidEmail(email)) {
//   alert("Email không hợp lệ.");
//   return;
// }

// if (!isValidPhone(phone)) {
//   alert("Số điện thoại không hợp lệ.");
//   return;
// }


// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission

  const loginEmployeeId = document.getElementById('loginEmployeeId').value;
  const loginPassword = document.getElementById('loginPassword').value;

  // Validate employee ID
  if (!isValidEmployeeId(loginEmployeeId)) {
    document.getElementById('loginEmployeeIdError').style.display = 'block';
    return;
  } else {
    document.getElementById('loginEmployeeIdError').style.display = 'none';
  }

  // Simulate login success (replace with actual authentication logic)
  alert('Đăng nhập thành công!');
});
