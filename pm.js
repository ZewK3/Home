class TransactionTracker {
    constructor() {
        this.elements = {
            transactionInput: document.getElementById("transaction-input"),
            addTransactionBtn: document.getElementById("add-transaction-btn"),
            displayImage: document.getElementById("display-image"),
            defaultImage: document.getElementById("dimage"),
            imageError: document.getElementById("image-error"),
            totalValue: document.getElementById("total-value"),
            transactionHistory: document.getElementById("transaction-history"),
            notification: document.getElementById("notification"),
            qrPopup: document.getElementById("qr-popup"),
            popupQrImage: document.getElementById("popup-qr-image"),
            countdown: document.getElementById("countdown")
        };

        this.state = {
            total: 0,
            currentTransactionId: '',
            baseQRUrl: 'https://api.vietqr.io/image/970407-MS00T04064919780688-sIxhggL.jpg?accountName=LE%20DAI%20LOI',
            countdownTimer: null,
            checkInterval: null
        };

        this.initializeEventListeners();
        this.fetchTodayTransactions();
    }

    formatDateTime() {
        const date = new Date();
        return date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount).replace("₫", " VNĐ");
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

    async fetchTodayTransactions() {
        try {
            const today = new Date().toLocaleDateString('en-GB', {
                timeZone: "Asia/Ho_Chi_Minh"
            }).split('/').reverse().join('-');
            
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=getTransaction&startDate=${today}`
            );
            
            if (!response.ok) throw new Error("Failed to fetch transactions");
            
            const data = await response.json();
            this.updateTransactionHistory(data.results);
        } catch (error) {
            this.showNotification("Không thể tải dữ liệu giao dịch", "error");
            console.error(error);
        }
    }

    updateTransactionHistory(transactions) {
        const { transactionHistory, totalValue } = this.elements;
        transactionHistory.innerHTML = '';
        
        const totalAmount = transactions.reduce((sum, transaction) => {
            if (transaction.status === "success") {
                return sum + Number(transaction.amount);
            }
            return sum;
        }, 0);

        transactions.forEach(transaction => {
            const li = document.createElement("li");
            li.textContent = `Mã: ${transaction.id} - GĐ: ${this.formatCurrency(transaction.amount)} - TT: ${transaction.status}`;
            transactionHistory.appendChild(li);
        });

        this.state.total = totalAmount;
        totalValue.textContent = this.formatCurrency(totalAmount);
    }

    generateQRCode(amount) {
        this.state.currentTransactionId = this.formatDateTime();
        return `${this.state.baseQRUrl}&amount=${amount}&addInfo=ID${this.state.currentTransactionId}`;
    }

    startCountdown() {
        let timeLeft = 300; // 5 phút = 300 giây
        this.elements.countdown.textContent = "5:00";

        this.state.countdownTimer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            this.elements.countdown.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeLeft <= 0) {
                this.handleTransactionTimeout();
            }
        }, 1000);
    }

    async checkTransactionStatus() {
        try {
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=getTransaction&transactionId=ID${this.state.currentTransactionId}`
            );
            if (!response.ok) return false;

            const data = await response.json();
            return data.results && data.results.length > 0 && data.results[0].status === "success";
        } catch (error) {
            console.error("Error checking transaction:", error);
            return false;
        }
    }

    startTransactionCheck() {
        this.state.checkInterval = setInterval(async () => {
            const isSuccess = await this.checkTransactionStatus();
            if (isSuccess) {
                this.handleTransactionSuccess();
            }
        }, 5000); // Kiểm tra mỗi 5 giây
    }

    async saveTransaction(status) {
        const amount = Number(this.elements.transactionInput.value);
        const today = new Date().toLocaleDateString('en-GB', {
            timeZone: "Asia/Ho_Chi_Minh"
        }).split('/').reverse().join('-');

        const transactionData = {
            id: `ID${this.state.currentTransactionId}`,
            amount: amount,
            status: status,
            date: today
        };

        try {
            const response = await fetch('https://zewk.tocotoco.workers.dev?action=saveTransaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) throw new Error("Failed to save transaction");

            if (status === "success") {
                this.state.total += amount;
                this.elements.totalValue.textContent = this.formatCurrency(this.state.total);
            }

            const li = document.createElement("li");
            li.textContent = `Mã: ${transactionData.id} - GĐ: ${this.formatCurrency(amount)} - TT: ${status}`;
            this.elements.transactionHistory.appendChild(li);

            this.showNotification(
                status === "success" ? "Giao dịch thành công" : "Giao dịch thất bại",
                status === "success" ? "success" : "error"
            );
        } catch (error) {
            this.showNotification("Không thể lưu giao dịch", "error");
            console.error(error);
        }
    }

    resetInterface() {
        clearInterval(this.state.countdownTimer);
        clearInterval(this.state.checkInterval);
        this.elements.qrPopup.classList.add("hidden");
        this.elements.transactionInput.value = "";
        this.elements.displayImage.style.display = "none";
        this.elements.defaultImage.style.display = "block";
        this.elements.addTransactionBtn.disabled = false;
    }

    handleTransactionSuccess() {
        this.saveTransaction("success").then(() => this.resetInterface());
    }

    handleTransactionTimeout() {
        this.saveTransaction("failed").then(() => this.resetInterface());
    }

    initializeEventListeners() {
        this.elements.addTransactionBtn.addEventListener("click", () => {
            const amount = this.elements.transactionInput.value.trim();
            if (!amount || Number(amount) <= 0) {
                this.showNotification("Vui lòng nhập số tiền hợp lệ", "warning");
                return;
            }

            const qrUrl = this.generateQRCode(amount);
            this.elements.popupQrImage.src = qrUrl;
            this.elements.qrPopup.classList.remove("hidden");
            this.elements.addTransactionBtn.disabled = true;

            this.elements.popupQrImage.onload = () => {
                this.startCountdown();
                this.startTransactionCheck();
            };

            this.elements.popupQrImage.onerror = () => {
                this.showNotification("Không thể tạo mã QR", "error");
                this.resetInterface();
            };
        });
    }
}

document.addEventListener("DOMContentLoaded", () => new TransactionTracker());
