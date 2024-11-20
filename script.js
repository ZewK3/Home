const proxyURL = "https://noisy-sound-fe4a.dailoi1106.workers.dev/"; // URL Cloudflare Worker

async function submitData() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  const data = { name, email, message };

  try {
    const response = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
    alert("Không thể gửi dữ liệu. Vui lòng thử lại.");
  }
}
