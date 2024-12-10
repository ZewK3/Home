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

// Hàm lấy dữ liệu giao dịch từ API
async function fetchTodayTransactions() {
    const apiUrl = 'https://zewk.tocotoco.workers.dev?action=getTransaction';
    const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)

    // Chuẩn bị tham số truy vấn
    const url = `${apiUrl}&status=all&startDate=${today}&endDate=${today}`;

    try {
        // Gọi API với tham số trong URL
        const response = await fetch(url, {
            method: 'GET', // Sử dụng GET vì không có body
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) throw new Error("Lỗi khi gọi API");

        const data = await response.json();

        // Lọc giao dịch trong ngày (dựa trên trường 'date')
        const todayTransactions = data.filter(transaction => 
            transaction.date.startsWith(today) // Kiểm tra ngày giao dịch
        );

        // Tính tổng số tiền chỉ với trạng thái 'success' (dựa trên trường 'amount' và 'status')
        const totalAmount = todayTransactions.reduce((sum, transaction) => {
            if (transaction.status === "success") {
                return sum + transaction.amount; // Cộng dồn chỉ khi trạng thái là 'success'
            }
            return sum;
        }, 0);

        // Hiển thị tổng số tiền
        totalValue.textContent = formatCurrency(totalAmount);

        // Cập nhật lịch sử giao dịch
        transactionHistory.innerHTML = ''; // Làm sạch lịch sử trước khi cập nhật
        todayTransactions.forEach(transaction => {
            const listItem = document.createElement("li");
            listItem.textContent = `Mã: ${transaction.id} - Giao dịch: ${formatCurrency(transaction.amount)} - Trạng thái: ${transaction.status} `;
            transactionHistory.appendChild(listItem);
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu giao dịch:", error);
        alert("Lỗi khi lấy dữ liệu giao dịch");
    }
}

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
confirmBtn.addEventListener("click", async () => {
    const transactionValue = transactionInput.value.trim();
    const transactionAmount = parseFloat(transactionValue);

    if (!transactionValue || isNaN(transactionAmount)) {
        alert("Giá trị giao dịch không hợp lệ!");
        return;
    }

    const transactionData = {
        id: `ID${sto}`, // Định dạng ID
        amount: transactionValue,
        status: "success",
        date: new Date().toISOString() // Lấy ngày giờ hiện tại ở định dạng ISO 8601
    };

    try {
    // Gửi yêu cầu POST đến backend
    const response = await fetch('https://zewk.tocotoco.workers.dev?action=saveTransaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
    });

    // Kiểm tra nếu mã trạng thái HTTP không phải 200 (OK)
    if (!response.ok) {
        const errorDetails = await response.json(); // Trích xuất thông tin lỗi từ response
        throw new Error(errorDetails.message || 'Lỗi khi lưu dữ liệu giao dịch lên backend');
    }

    // Nếu giao dịch thành công
    alert('Giao dịch đã được lưu thành công!');

    // Cập nhật giao diện
    total += transactionAmount; // Cập nhật tổng số tiền
    totalValue.textContent = formatCurrency(total);

    // Thêm giao dịch vào lịch sử giao dịch
    const listItem = document.createElement("li");
    listItem.textContent = `Mã: ${transactionData.id} - Giao dịch: ${formatCurrency(transactionAmount)} `;
    transactionHistory.appendChild(listItem);

    resetInterface(); // Làm mới giao diện sau khi lưu giao dịch
} catch (error) {
    console.error("Lỗi:", error);
    alert('Không thể lưu giao dịch lên backend: ' + error.message);
}

});


// Xử lý khi nhấn "Quay lại"
backBtn.addEventListener("click", async () => {
     const transactionValue = transactionInput.value.trim();
    const transactionAmount = parseFloat(transactionValue);

    if (!transactionValue || isNaN(transactionAmount)) {
        alert("Giá trị giao dịch không hợp lệ!");
        return;
    }

    const transactionData = {
        id: `ID${sto}`, // Định dạng ID
        amount: transactionValue,
        status: "fail",
        date: new Date().toISOString() // Lấy ngày giờ hiện tại ở định dạng ISO 8601
    };

    try {
    // Gửi yêu cầu POST đến backend
    const response = await fetch('https://zewk.tocotoco.workers.dev?action=saveTransaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
    });

    // Kiểm tra nếu mã trạng thái HTTP không phải 200 (OK)
    if (!response.ok) {
        const errorDetails = await response.json(); // Trích xuất thông tin lỗi từ response
        throw new Error(errorDetails.message || 'Lỗi khi lưu dữ liệu giao dịch lên backend');
    }


    resetInterface();
});
// Gọi API khi trang tải
window.onload = fetchTodayTransactions;
