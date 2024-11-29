// Chuyển đổi giữa giao diện đăng ký và đăng nhập
document.getElementById("goToRegister").addEventListener("click", function () {
    document.getElementById("loginFormContainer").style.display = "none";
    document.getElementById("registerFormContainer").style.display = "block";
});

document.getElementById("backToLogin").addEventListener("click", function () {
    document.getElementById("registerFormContainer").style.display = "none";
    document.getElementById("loginFormContainer").style.display = "block";
});

// Xử lý đăng ký
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn reload trang

    // Lấy dữ liệu từ form
    const employeeId = document.getElementById("employeeId").value.trim();
    const password = document.getElementById("password").value.trim();
    const fullName = document.getElementById("fullName").value.trim();
    const storeName = document.getElementById("storeName").value;
    const position = "NV";
    const joinDate = document.getElementById("joinDate").value;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    // Kiểm tra tên hợp lệ
    if (!isValidName(fullName)) {
        showNotification("Tên nhân viên không chứa ký tự đặc biệt và không dài quá 30 ký tự", "warning");
        return;
    }

    // Hàm kiểm tra tên hợp lệ
    function isValidName(name) {
    // Khai báo và gán giá trị
    const trimmedName = name.trim();

    // Kiểm tra độ dài của tên (tên phải dài hơn 0 và nhỏ hơn hoặc bằng 30 ký tự)
    if (trimmedName.length === 0 || trimmedName.length > 30) {
        return false;
    }

    // Kiểm tra xem tên có chứa ký tự đặc biệt không
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/g;
    if (specialCharRegex.test(trimmedName)) {
        return false;
    }

    return true;
}


    // Kiểm tra mã nhân viên hợp lệ
    if (!employeeId.includes("CHMN") && !employeeId.includes("VP")) {
        showNotification("Mã nhân viên phải chứa 'CHMN' hoặc 'VP'!", "warning");
        return;
    }

    // Kiểm tra mật khẩu hợp lệ
    const passwordPattern = /^(?=.*[A-Z]).{6,}$/;
    if (!passwordPattern.test(password)) {
        showNotification("Mật khẩu phải có ít nhất 6 ký tự và chứa chữ cái in hoa", "warning");
        return;
    }

    const data = { employeeId, password, fullName, storeName, position, joinDate, phone, email };

    try {
        // Kiểm tra mã nhân viên tồn tại
        const checkResponse = await fetch(
            "https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${employeeId}",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (checkResponse.ok) {
            const existingUser = await checkResponse.json();
            showNotification("Mã nhân viên đã tồn tại!", "warning", 3000);
            return;
        }

        if (checkResponse.status === 404) {
            // Đăng ký nếu mã nhân viên chưa tồn tại
            const registerResponse = await fetch(
                "https://zewk.tocotoco.workers.dev?action=register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            if (registerResponse.ok) {
                const result = await registerResponse.json();
                showNotification(result.message, "success");
                document.getElementById("registerFormContainer").style.display = "none";
                document.getElementById("loginFormContainer").style.display = "block";
            } else {
                showNotification(errorResult.message || "Đăng ký thất bại! Vui lòng thử lại", "error", 3000);
            }
        } else {
            showNotification(errorResult.message || "Có lỗi xảy ra khi kiểm tra mã nhân viên", "error", 3000);
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
});

// Xử lý đăng nhập
document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn reload trang

    // Lấy dữ liệu từ form đăng nhập
    const loginEmployeeId = document.getElementById("loginEmployeeId").value.trim();
    const loginPassword = document.getElementById("loginPassword").value.trim();

    try {
        const loginResponse = await fetch(
            "https://zewk.tocotoco.workers.dev/?action=login&employeeId=${loginEmployeeId}&password=${password}",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (loginResponse.ok) {
            const user = await loginResponse.json();
            const isPasswordCorrect = loginPassword === user.password; // Demo chỉ kiểm tra đơn giản

            if (isPasswordCorrect) {
                showNotification("Đăng nhập thành công!", "success", 3000);
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 3000);
            } else {
                showNotification("Mật khẩu không đúng!", "error", 3000);
            }
        } else if (loginResponse.status === 404) {
            showNotification("Mã nhân viên không tồn tại!", "warning", 3000);
        } else {
            showNotification("Có lỗi xảy ra khi kiểm tra đăng nhập", "error", 3000);
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
});

// Hàm hiển thị thông báo
function showNotification(message, type = "success", duration = 3000) {
    const notification = document.getElementById("notification");

    notification.className = `notification ${type}`;
    notification.innerText = message;
    notification.style.display = "block";
    notification.style.opacity = "1";
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
        }, 500);
    }, duration);
}
