const transactionInput = document.getElementById("transaction-input");
const addTransactionBtn = document.getElementById("add-transaction-btn");
const displayImage = document.getElementById("display-image");
const dImage = document.getElementById("dimage");
const imageError = document.getElementById("image-error");
const totalValue = document.getElementById("total-value");
const transactionHistory = document.getElementById("transaction-history");

let sto = ''; // Khai báo đúng kiểu biến
const confirmBtn = document.createElement("button");
const backBtn = document.createElement("button");

let total = 0;

// Hàm định dạng thời gian theo yêu cầu
function formatDateTime() {
  var date = new Date(); // Ngày giờ hiện tại
  
  // Lấy ngày, tháng, năm, giờ, phút và giây
  var day = ("0" + date.getDate()).slice(-2); // Đảm bảo ngày có 2 chữ số
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // Đảm bảo tháng có 2 chữ số (lưu ý getMonth() bắt đầu từ 0)
  var year = date.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
  var hours = ("0" + date.getHours()).slice(-2); // Đảm bảo giờ có 2 chữ số
  var minutes = ("0" + date.getMinutes()).slice(-2); // Đảm bảo phút có 2 chữ số
  var seconds = ("0" + date.getSeconds()).slice(-2); // Đảm bảo giây có 2 chữ số
  
  // Nối các phần lại thành chuỗi theo định dạng yêu cầu
  var formattedDate = day + month + year + hours + minutes + seconds;

  return formattedDate;
}

// Hàm định dạng số liệu theo VNĐ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    })
        .format(amount)
        .replace("₫", " VNĐ");
};

// Hàm thiết lập các nút sau khi nhấn Add Transaction
const setupConfirmationButtons = () => {
    confirmBtn.textContent = "Xác nhận giao dịch";
    confirmBtn.className = "action-button";

    backBtn.textContent = "Huỷ giao dịch";
    backBtn.className = "action-button-exit";

    addTransactionBtn.style.display = "none";
    transactionInput.style.display = "none";

    const parent = addTransactionBtn.parentElement;
    parent.appendChild(confirmBtn);
    parent.appendChild(backBtn);
};

// Hàm khôi phục giao diện ban đầu
const resetInterface = () => {
    sto = ''; // Reset lại biến 'sto'
    displayImage.style.display = "none";
    imageError.style.display = "none";

    confirmBtn.remove();
    backBtn.remove();

    addTransactionBtn.style.display = "inline-block";
    transactionInput.style.display = "block";
    transactionInput.value = "";
	dImage.style.display = "block";
};

// Xử lý sự kiện khi nhấn "Add Transaction"
addTransactionBtn.addEventListener("click", () => {
    const transactionValue = transactionInput.value.trim();
    sto = formatDateTime(); // Cập nhật giá trị cho 'sto'
    dImage.style.display = "none";
    if (!transactionValue) {
        alert("Vui lòng nhập giá trị giao dịch!");
        return;
    }

    // Cập nhật URL mã QR với số tiền đã nhập
    const qrUrl = `https://api.vietqr.io/image/970407-MS00T04064919780688-sIxhggL.jpg?accountName=LE%20DAI%20LOI&amount=${transactionValue}&addInfo=ID${sto}`;
    displayImage.src = qrUrl;

    displayImage.onload = () => {
        displayImage.style.display = "block";
        imageError.style.display = "none";
        setupConfirmationButtons();
    };

    displayImage.onerror = () => {
        displayImage.style.display = "none";
        imageError.style.display = "block";
        imageError.textContent = "Không tìm thấy ảnh phù hợp!";
    };
});

// Xử lý khi nhấn "Xác nhận"
confirmBtn.addEventListener("click", () => {
    const transactionValue = transactionInput.value.trim();
    const transactionAmount = parseFloat(transactionValue);

    if (!isNaN(transactionAmount)) {
        total += transactionAmount;
        totalValue.textContent = formatCurrency(total);
       
        // Thêm giao dịch vào lịch sử
        const listItem = document.createElement("li");
        listItem.textContent = `Mã: ${sto} - Giao dịch: ${formatCurrency(transactionAmount)} `;
        transactionHistory.appendChild(listItem);
    } else {
        alert("Giá trị giao dịch không hợp lệ!");
    }

    resetInterface();
});

// Xử lý khi nhấn "Quay lại"
backBtn.addEventListener("click", resetInterface);
