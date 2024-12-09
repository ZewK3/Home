const transactionInput = document.getElementById("transaction-input");
const addTransactionBtn = document.getElementById("add-transaction-btn");
const displayImage = document.getElementById("display-image");
const imageError = document.getElementById("image-error");
const totalValue = document.getElementById("total-value");
const transactionHistory = document.getElementById("transaction-history");

const confirmBtn = document.createElement("button");
const backBtn = document.createElement("button");

let total = 0;

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
    confirmBtn.textContent = "Xác nhận";
    confirmBtn.className = "action-button";

    backBtn.textContent = "Quay lại";
    backBtn.className = "action-button";

    addTransactionBtn.style.display = "none";
    transactionInput.style.display = "none";

    const parent = addTransactionBtn.parentElement;
    parent.appendChild(confirmBtn);
    parent.appendChild(backBtn);
};

// Hàm khôi phục giao diện ban đầu
const resetInterface = () => {
    displayImage.style.display = "none";
    imageError.style.display = "none";

    confirmBtn.remove();
    backBtn.remove();

    addTransactionBtn.style.display = "inline-block";
    transactionInput.style.display = "block";
    transactionInput.value = "";
};

// Xử lý sự kiện khi nhấn "Add Transaction"
addTransactionBtn.addEventListener("click", () => {
    const transactionValue = transactionInput.value.trim();

    if (!transactionValue) {
        alert("Vui lòng nhập giá trị giao dịch!");
        return;
    }

    // Hiển thị ảnh dựa vào giá trị nhập
    const imagePath = `Payment/${transactionValue}.jpg`;
    displayImage.src = imagePath;

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

        // Lấy ngày giờ hiện tại
        const now = new Date();
        const dateTime = now.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        // Thêm giao dịch vào lịch sử
        const listItem = document.createElement("li");
        listItem.textContent = `${dateTime} - Giao dịch: ${formatCurrency(transactionAmount)}`;
        transactionHistory.appendChild(listItem);
    } else {
        alert("Giá trị giao dịch không hợp lệ!");
    }

    resetInterface();
});

// Xử lý khi nhấn "Quay lại"
backBtn.addEventListener("click", resetInterface);
