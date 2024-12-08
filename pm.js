const transactionInput = document.getElementById("transaction-input");
const addTransactionBtn = document.getElementById("add-transaction-btn");
const displayImage = document.getElementById("display-image");
const imageError = document.getElementById("image-error");
const totalValue = document.getElementById("total-value");
const transactionHistory = document.getElementById("transaction-history");

const confirmBtn = document.createElement("button");
const backBtn = document.createElement("button");

let total = 0;

// Hàm định dạng số theo VNĐ
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

addTransactionBtn.addEventListener("click", () => {
    const transactionValue = transactionInput.value.trim();

    if (!transactionValue) {
        alert("Vui lòng nhập giá trị giao dịch!");
        return;
    }

    // Hiển thị ảnh dựa vào giá trị nhập
    const imagePath = `/Payment/${transactionValue}.jpg`;
    displayImage.src = imagePath;

    displayImage.onload = () => {
        displayImage.style.display = "block";
        imageError.style.display = "none";
        setupConfirmationButtons();
    };

    displayImage.onerror = () => {
        displayImage.style.display = "none";
        imageError.style.display = "block";
    };
});

confirmBtn.addEventListener("click", () => {
    const transactionValue = transactionInput.value.trim();
    const transactionAmount = parseFloat(transactionValue);

    if (!isNaN(transactionAmount)) {
        total += transactionAmount;
        totalValue.textContent = formatCurrency(total);

        const listItem = document.createElement("li");
        listItem.textContent = `Giao dịch: ${formatCurrency(transactionAmount)}`;
        transactionHistory.appendChild(listItem);
    }

    resetInterface();
});

backBtn.addEventListener("click", resetInterface);
