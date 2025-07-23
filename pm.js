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
            countdown: document.getElementById("countdown"),
            pauseBtn: document.getElementById("pause-transaction"),
            cancelBtn: document.getElementById("cancel-transaction")
        };

        this.state = {
            total: 0,
            baseQRUrl: 'https://api.vietqr.io/image/970403-062611062003-sIxhggL.jpg?accountName=LE%20DAI%20LOI',
            activeTransactions: new Map()
        };

        this.initializeEventListeners();
        this.fetchTodayTransactions();
        this.preventDeveloperTools(); // Khởi tạo chặn F12 và chuột phải
    }

    // Hàm chặn F12 và chuột phải
    preventDeveloperTools() {
        // Chặn phím F12
        document.addEventListener('keydown', (event) => {
            if (event.key === 'F12') {
                event.preventDefault();
            }
            // Chặn tổ hợp phím phổ biến để mở DevTools (Ctrl+Shift+I, Ctrl+Shift+J)
            if ((event.ctrlKey && event.shiftKey && event.key === 'I') || 
                (event.ctrlKey && event.shiftKey && event.key === 'J')) {
                event.preventDefault();
            }
        });

        // Chặn chuột phải
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.volume = 1.0;
            utterance.rate = 1.0;
            utterance.pitch = 1.5;

            const voices = window.speechSynthesis.getVoices();
            let selectedVoice = voices.find(voice => 
                voice.lang === 'vi-VN' && 
                (voice.name.toLowerCase().includes('female') || voice.name.includes('nữ') || voice.name.includes('Google'))
            );
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang === 'vi-VN');
            }
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log(`Selected voice: ${selectedVoice.name}`);
            } else {
                console.warn("Không tìm thấy giọng tiếng Việt, dùng giọng mặc định");
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.error("Trình duyệt không hỗ trợ Web Speech API");
        }
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

    generateQRCode(amount, transactionId) {
        return `${this.state.baseQRUrl}&amount=${amount}&addInfo=ID${transactionId}`;
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
        li.textContent = `Mã: ID${transactionId} - GĐ: ${this.formatCurrency(amount)} - TT: pending - Còn: ${this.formatTime(transaction.timeLeft)}`;
        transaction.listItem = li;
        this.elements.transactionHistory.appendChild(li);

        this.elements.countdown.textContent = this.formatTime(transaction.timeLeft);

        transaction.countdownTimer = setInterval(() => {
            transaction.timeLeft--;
            if (transaction.timeLeft >= 0) {
                li.textContent = `Mã: ID${transactionId} - GĐ: ${this.formatCurrency(amount)} - TT: pending - Còn: ${this.formatTime(transaction.timeLeft)}`;
                this.elements.countdown.textContent = this.formatTime(transaction.timeLeft);
            }
            if (transaction.timeLeft <= 0) {
                this.handleTransactionTimeout(transactionId);
            }
        }, 1000);

        transaction.checkInterval = setInterval(async () => {
            const serverData = await this.checkTransactionStatus(transactionId);
            if (serverData && this.state.activeTransactions.has(transactionId)) {
                const clientAmount = transaction.amount;
                const serverAmount = Number(serverData.amount);
                if (clientAmount === serverAmount) {
                    this.handleTransactionSuccess(transactionId);
                } else {
                    console.error(`Amount mismatch for ID${transactionId}: Client=${clientAmount}, Server=${serverAmount}`);
                    this.showNotification(`Số tiền không khớp: Client ${this.formatCurrency(clientAmount)} != Server ${this.formatCurrency(serverAmount)}`, "error");
                    this.handleTransactionTimeout(transactionId);
                }
            }
        }, 5000);

        this.state.activeTransactions.set(transactionId, transaction);
    }

    async checkTransactionStatus(transactionId) {
        try {
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=checkTransaction&transactionId=ID${transactionId}`
            );
            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
                return false;
            }

            const data = await response.json();
            console.log(`Check status for ID${transactionId}:`, data);
            return data.success === true ? data : false;
        } catch (error) {
            console.error("Error checking transaction:", error);
            return false;
        }
    }

    async saveTransaction(transactionId, status) {
        const transaction = this.state.activeTransactions.get(transactionId);
        if (!transaction) return;

        const today = new Date().toLocaleDateString('en-GB', {
            timeZone: "Asia/Ho_Chi_Minh"
        }).split('/').reverse().join('-');

        const transactionData = {
            id: `ID${transactionId}`,
            amount: transaction.amount,
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
                this.state.total += transaction.amount;
                this.elements.totalValue.textContent = this.formatCurrency(this.state.total);
                this.speak("Giao dịch thành công");
            }

            transaction.listItem.textContent = `Mã: ID${transactionId} - GĐ: ${this.formatCurrency(transaction.amount)} - TT: ${status}`;
            this.showNotification(
                status === "success" ? "Giao dịch thành công" : "Giao dịch thất bại",
                status === "success" ? "success" : "error"
            );
        } catch (error) {
            this.showNotification("Không thể lưu giao dịch", "error");
            console.error(error);
        }

        clearInterval(transaction.countdownTimer);
        clearInterval(transaction.checkInterval);
        this.state.activeTransactions.delete(transactionId);
        this.resetPopup();
    }

    handleTransactionSuccess(transactionId) {
        this.saveTransaction(transactionId, "success");
    }

    handleTransactionTimeout(transactionId) {
        this.saveTransaction(transactionId, "failed");
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

            const transactionId = this.formatDateTime();
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
            const transactionId = this.elements.popupQrImage.src.match(/ID(\d+)/)?.[1];
            if (transactionId && this.state.activeTransactions.has(transactionId)) {
                this.handleTransactionTimeout(transactionId);
            }
            this.resetPopup();
        });

        window.speechSynthesis.onvoiceschanged = () => {
            console.log("Available voices:", window.speechSynthesis.getVoices());
        };
    }
}

document.addEventListener("DOMContentLoaded", () => new TransactionTracker());
