class TransactionTracker {
    constructor() {
        this.elements = {
            transactionInput: document.getElementById("transaction-input"),
            addTransactionBtn: document.getElementById("add-transaction-btn"),
            displayImage: document.getElementById("display-image"),
            defaultImage: document.getElementById("dimage"),
            totalValue: document.getElementById("total-value"),
            transactionHistory: document.getElementById("transaction-history"),
            notification: document.getElementById("notification"),
            qrPopup: document.getElementById("qr-popup"),
            popupQrImage: document.getElementById("popup-qr-image"),
            countdown: document.getElementById("countdown"),
            pauseBtn: document.getElementById("pause-transaction"),
            cancelBtn: document.getElementById("cancel-transaction")
        };

        this.state = {
            total: 0,
            baseQRUrl: 'https://api.vietqr.io/image/970403-062611062003-sIxhggL.jpg?accountName=LE%20DAI%20LOI&amount=0',
            activeTransactions: new Map()
        };

        this.initializeEventListeners();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount).replace("₫", " VNĐ");
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    showNotification(message, type = "success", duration = 3000) {
        const { notification } = this.elements;
        notification.textContent = message;
        notification.className = type;
        notification.style.display = "block";

        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                notification.style.display = "none";
                notification.style.opacity = "1";
            }, 300);
        }, duration);
    }

    generateTransactionId() {
        return `ID${Math.floor(10000 + Math.random() * 90000)}`; // Tạo ID ngẫu nhiên từ ID10000 đến ID99999
    }

    generateQRCode(amount, transactionId) {
        return `${this.state.baseQRUrl}&amount=${amount}&addInfo=${transactionId}`;
    }

    async checkTransactionStatus(transactionId) {
        try {
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=checkTransactionStatus&transactionId=${transactionId}`
            );
            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
                return false;
            }

            const data = await response.json();
            console.log(`Check status for ${transactionId}:`, data); // Debug log
            return data.success === true;
        } catch (error) {
            console.error("Error checking transaction:", error);
            return false;
        }
    }

    startTransaction(amount, transactionId) {
        const transaction = {
            amount: Number(amount),
            timeLeft: 300,
            countdownTimer: null,
            checkInterval: null,
            listItem: null
        };

        const li = document.createElement("li");
        li.textContent = `Mã: ${transactionId} - GĐ: ${this.formatCurrency(amount)} - TT: pending - Còn: ${this.formatTime(transaction.timeLeft)}`;
        transaction.listItem = li;
        this.elements.transactionHistory.appendChild(li);

        transaction.countdownTimer = setInterval(() => {
            transaction.timeLeft--;
            if (transaction.timeLeft >= 0) {
                li.textContent = `Mã: ${transactionId} - GĐ: ${this.formatCurrency(amount)} - TT: pending - Còn: ${this.formatTime(transaction.timeLeft)}`;
            }
            if (transaction.timeLeft <= 0) {
                this.handleTransactionTimeout(transactionId);
            }
        }, 1000);

        transaction.checkInterval = setInterval(async () => {
            const isSuccess = await this.checkTransactionStatus(transactionId);
            if (isSuccess && this.state.activeTransactions.has(transactionId)) {
                this.handleTransactionSuccess(transactionId);
            }
        }, 5000);

        this.state.activeTransactions.set(transactionId, transaction);
    }

    handleTransactionSuccess(transactionId) {
        const transaction = this.state.activeTransactions.get(transactionId);
        if (!transaction) {
            console.log(`Transaction ${transactionId} not found in active transactions`);
            return;
        }

        this.state.total += transaction.amount;
        this.elements.totalValue.textContent = this.formatCurrency(this.state.total);
        transaction.listItem.textContent = `Mã: ${transactionId} - GĐ: ${this.formatCurrency(transaction.amount)} - TT: success`;
        this.showNotification("Giao dịch thành công", "success");

        clearInterval(transaction.countdownTimer);
        clearInterval(transaction.checkInterval);
        this.state.activeTransactions.delete(transactionId);
    }

    handleTransactionTimeout(transactionId) {
        const transaction = this.state.activeTransactions.get(transactionId);
        if (!transaction) return;

        transaction.listItem.textContent = `Mã: ${transactionId} - GĐ: ${this.formatCurrency(transaction.amount)} - TT: failed`;
        this.showNotification("Giao dịch thất bại", "error");

        clearInterval(transaction.countdownTimer);
        clearInterval(transaction.checkInterval);
        this.state.activeTransactions.delete(transactionId);
    }

    resetPopup() {
        this.elements.qrPopup.classList.add("hidden");
        this.elements.transactionInput.value = "";
        this.elements.displayImage.style.display = "none";
        this.elements.defaultImage.style.display = "block";
        this.elements.addTransactionBtn.disabled = false;
    }

    initializeEventListeners() {
        this.elements.addTransactionBtn.addEventListener("click", () => {
            const amount = this.elements.transactionInput.value.trim();
            if (!amount || Number(amount) <= 0) {
                this.showNotification("Vui lòng nhập số tiền hợp lệ", "warning");
                return;
            }

            const transactionId = this.generateTransactionId();
            const qrUrl = this.generateQRCode(amount, transactionId);
            this.elements.popupQrImage.src = qrUrl;
            this.elements.qrPopup.classList.remove("hidden");
            this.elements.addTransactionBtn.disabled = true;

            this.elements.popupQrImage.onload = () => {
                this.startTransaction(amount, transactionId);
            };

            this.elements.popupQrImage.onerror = () => {
                this.showNotification("Không thể tạo mã QR", "error");
                this.resetPopup();
            };
        });

        this.elements.pauseBtn.addEventListener("click", () => {
            this.showNotification("Giao dịch đã được treo và tiếp tục chạy ngầm", "warning");
            this.resetPopup();
        });

        this.elements.cancelBtn.addEventListener("click", () => {
            const transactionId = this.elements.popupQrImage.src.match(/ID(\d+)/)?.[0];
            if (transactionId && this.state.activeTransactions.has(transactionId)) {
                this.handleTransactionTimeout(transactionId);
            }
            this.resetPopup();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => new TransactionTracker());
