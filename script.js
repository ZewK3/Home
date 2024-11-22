async function submitData(employeeId, password, fullName, storeName, position, joinDate, phone, email) {
  const proxyURL = "https://noisy-sound-fe4a.dailoi1106.workers.dev/"; // URL của Cloudflare Worker

  // Tạo dữ liệu để gửi, đảm bảo tất cả các giá trị là chuỗi
  const data = {
    employeeId: String(employeeId || ""),  // Chuyển đổi sang chuỗi
    password: String(password || ""),      // Chuyển đổi sang chuỗi
    fullName: String(fullName || ""),      // Chuyển đổi sang chuỗi
    storeName: String(storeName || ""),    // Chuyển đổi sang chuỗi
    position: String(position || ""),      // Chuyển đổi sang chuỗi
    joinDate: String(joinDate || ""),      // Chuyển đổi sang chuỗi
    phone: String(phone || ""),            // Chuyển đổi sang chuỗi
    email: String(email || ""),            // Chuyển đổi sang chuỗi
  };

  // In dữ liệu ra console để kiểm tra
  console.log("Sending data as strings:", data); // Xem dữ liệu trong console trước khi gửi

  try {
    const response = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // Chuyển đổi đối tượng thành JSON string
    });

    if (!response.ok) {
      const responseText = await response.text(); // Lấy phản hồi chi tiết lỗi
      throw new Error(`Network response was not ok: ${responseText}`);
    }

    const result = await response.json(); // Đọc phản hồi từ server

    if (result.status === "success") {
      alert("Dữ liệu đã được gửi thành công!");
      // Ẩn form đăng ký và hiển thị thông báo thành công
      document.getElementById('registerFormContainer').style.display = 'none';
      document.getElementById('successMessage').innerHTML = 'Đăng ký thành công!';
      document.getElementById('successMessage').style.display = 'block';
    } else {
      alert(`Lỗi: ${result.message}`);
    }
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
    alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
}
