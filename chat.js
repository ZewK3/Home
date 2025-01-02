<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Popup Chat Room</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        /* Nút mở popup */
        #openChatButton {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Popup */
        #chatPopup {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 300px;
            height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        #chatHeader {
            background-color: #007bff;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 18px;
        }

        #chatMessages {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            border-top: 1px solid #ddd;
        }

        #chatInput {
            display: flex;
            border-top: 1px solid #ddd;
        }

        #messageInput {
            flex: 1;
            padding: 10px;
            border: none;
            outline: none;
        }

        #sendButton {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <!-- Nút mở popup -->
    <button id="openChatButton">💬</button>

    <!-- Popup chat -->
    <div id="chatPopup">
        <div id="chatHeader">Chat Room</div>
        <div id="chatMessages"></div>
        <div id="chatInput">
            <input type="text" id="messageInput" placeholder="Nhập tin nhắn...">
            <button id="sendButton">Gửi</button>
        </div>
    </div>

    <script>
        const openChatButton = document.getElementById('openChatButton');
        const chatPopup = document.getElementById('chatPopup');
        const messageInput = document.getElementById('messageInput');
        const chatMessages = document.getElementById('chatMessages');
        const sendButton = document.getElementById('sendButton');

        // Kết nối WebSocket
        const socket = new WebSocket('wss://chat-room.tocotoco.workers.dev');

        socket.onopen = () => {
            console.log('Đã kết nối với WebSocket');
        };

        socket.onmessage = (event) => {
            const messageElement = document.createElement('p');
            messageElement.textContent = event.data;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        socket.onerror = (error) => {
            console.error('Lỗi WebSocket:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket đã đóng.');
        };

        // Gửi tin nhắn
        const sendMessage = () => {
            const message = messageInput.value.trim();
            if (message) {
                socket.send(message);
                messageInput.value = '';
            }
        };

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        // Mở và đóng popup
        openChatButton.addEventListener('click', () => {
            if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
                chatPopup.style.display = 'flex';
            } else {
                chatPopup.style.display = 'none';
            }
        });
    </script>
</body>
</html>

