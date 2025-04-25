const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxseIrDGsm0EN5t6GWCi8-lHO-WJccNl3pR5s2DzSrLRxf5nYje9xUdLlOT0ZkGxlmw0tMZZNKFa8a/pub?output=csv';
const apiBase = "https://zewk.tocotoco.workers.dev/";
const storeCoords = { lng: 106.650467, lat: 10.782461 }; // Tọa độ quán Lạc Long Quân, Tân Bình
const mapboxAccessToken = "pk.eyJ1IjoiemV3azExMDYiLCJhIjoiY205d3MwYjI5MHZzaTJtcjBmajl5dWI5diJ9.dP89zeG92u7AeHigH4tJwg"; // Token của bạn
const geocodeBase = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const directionsBase = "https://api.mapbox.com/directions/v5/mapbox/driving/";
let allData = [];
let toppings = [];
let currentProduct = {};
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Khởi tạo giỏ hàng từ localStorage
let editingGroupKey = null;
let isRegisterMode = false;
let pendingOrder = null;
let map = null; // Biến lưu trữ bản đồ Mapbox GL
let marker = null; // Biến lưu trữ marker trên bản đồ
let selectedCoords = null; // Tọa độ được chọn từ bản đồ

// Tạo phần tử notification
const notification = document.createElement("div");
notification.className = "notification";
document.body.appendChild(notification);

// Hàm hiển thị thông báo
function showNotification(message, type = "success", duration = 3000) {
  notification.className = `notification ${type} show`;
  notification.innerText = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.style.display = "none";
    }, 500);
  }, duration);
}

// Transaction Tracker for QR Payment
const transactionTracker = {
  state: {
    baseQRUrl: 'https://api.vietqr.io/image/970403-062611062003-sIxhggL.jpg?accountName=LE%20DAI%20LOI',
    activeTransactions: new Map(),
    transactionDetails: JSON.parse(localStorage.getItem('transactionDetails') || '{}')
  },
  elements: {
    qrPopup: document.getElementById("qr-popup"),
    popupQrImage: document.getElementById("popup-qr-image"),
    qrAmount: document.getElementById("qr-amount"),
    countdown: document.getElementById("countdown"),
    downloadBtn: document.getElementById("download-qr"),
    cancelBtn: document.getElementById("cancel-transaction")
  },
  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount).replace("₫", " VNĐ");
  },
  formatDateTime() {
    const date = new Date();
    return date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  },
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  },
  generateQRCode(amount, transactionId) {
    return `${this.state.baseQRUrl}&amount=${amount}&addInfo=ID${transactionId}`;
  },
  async checkTransactionStatus(transactionId) {
    try {
      const response = await fetch(`${apiBase}?action=checkTransaction&transactionId=ID${transactionId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.success === true ? data : false;
    } catch (error) {
      console.error("Error checking transaction:", error);
      return false;
    }
  },
  async downloadQRCode() {
    const qrImageSrc = this.elements.popupQrImage.src;
    try {
      const response = await fetch(qrImageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Payment_${this.formatDateTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      showNotification("Không thể tải QR code. Vui lòng thử lại!", "error");
    }
  },
  startTransaction(amount, transactionId, orderId) {
    const startTime = Date.now(); // Lưu thời gian bắt đầu giao dịch
    const duration = 900 * 1000; // 15 phút (900 giây) tính bằng milliseconds
    const endTime = startTime + duration; // Thời gian kết thúc giao dịch

    const transaction = {
      amount: Number(amount),
      startTime: startTime,
      endTime: endTime,
      countdownTimer: null,
      checkInterval: null,
      orderId: orderId
    };

    // Lưu transaction vào localStorage để khôi phục khi reload
    this.state.transactionDetails[orderId] = {
      transactionId,
      amount,
      startTime,
      endTime
    };
    localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));

    this.elements.qrAmount.textContent = `Số tiền: ${this.formatCurrency(amount)}`;

    // Cập nhật countdown dựa trên thời gian thực
    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((transaction.endTime - now) / 1000)); // Tính thời gian còn lại
      this.elements.countdown.textContent = this.formatTime(timeLeft);

      if (timeLeft <= 0) {
        this.handleTransactionTimeout(transactionId);
      }
    };

    // Cập nhật countdown ngay lập tức
    updateCountdown();

    // Cập nhật countdown mỗi giây
    transaction.countdownTimer = setInterval(updateCountdown, 1000);

    // Kiểm tra trạng thái giao dịch
    transaction.checkInterval = setInterval(async () => {
      const serverData = await this.checkTransactionStatus(transactionId);
      if (serverData && this.state.activeTransactions.has(transactionId)) {
        const clientAmount = transaction.amount;
        const serverAmount = Number(serverData.amount);
        if (clientAmount === serverAmount) {
          this.handleTransactionSuccess(transactionId, orderId);
        } else {
          showNotification(`Số tiền không khớp: Client ${this.formatCurrency(clientAmount)} != Server ${this.formatCurrency(serverAmount)}`, "error");
          this.handleTransactionTimeout(transactionId);
        }
      }
    }, 5000);

    this.state.activeTransactions.set(transactionId, transaction);
    this.elements.downloadBtn.onclick = () => this.downloadQRCode();
  },
  async handleTransactionSuccess(transactionId, tempOrderId) {
    const transaction = this.state.activeTransactions.get(transactionId);
    if (!transaction) return;

    if (!pendingOrder || pendingOrder.orderId !== tempOrderId) {
      showNotification("Không tìm thấy đơn hàng tạm thời!", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!", "error");
      this.resetPopup();
      return;
    }

    try {
      const response = await fetch(`${apiBase}?action=saveOrder&token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingOrder)
      });
      const data = await response.json();

      if (data.orderId) {
        const updateResponse = await fetch(`${apiBase}?action=updateOrderStatus&token=${token}&orderId=${data.orderId}&status=success`);
        const updateData = await updateResponse.json();

        if (updateData.success) {
          showNotification(
            `🎉 Thanh toán thành công! Đơn hàng ${data.orderId} đã được xác nhận.\nĐiểm tích lũy: +${updateData.gainedExp}\nTổng điểm: ${updateData.newExp}\nHạng: ${updateData.newRank}`,
            "success",
            5000
          );
          updateUserInfo(data.name, updateData.newExp, updateData.newRank);
          cart = []; // Xóa giỏ hàng khi thanh toán thành công
          localStorage.setItem('cart', JSON.stringify(cart)); // Cập nhật localStorage
          updateCartCount();
        } else {
          showNotification("Lỗi khi cập nhật trạng thái đơn hàng!", "error");
        }
      } else {
        showNotification(data.message || "Lỗi khi lưu đơn hàng!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng:", error);
      showNotification("Đã có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại!", "error");
    } finally {
      clearInterval(transaction.countdownTimer);
      clearInterval(transaction.checkInterval);
      this.state.activeTransactions.delete(transactionId);
      delete this.state.transactionDetails[transaction.orderId];
      localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));
      this.resetPopup();
      pendingOrder = null;
    }
  },
  handleTransactionTimeout(transactionId) {
    const transaction = this.state.activeTransactions.get(transactionId);
    if (!transaction) return;

    clearInterval(transaction.countdownTimer);
    clearInterval(transaction.checkInterval);
    this.state.activeTransactions.delete(transactionId);
    delete this.state.transactionDetails[transaction.orderId];
    localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));
    this.resetPopup();
    showNotification("Giao dịch hết hạn! Đơn hàng không được lưu.", "error");
    pendingOrder = null;
  },
  resetPopup() {
    this.elements.qrPopup.style.display = "none";
  },
  restoreTransactions() {
    const transactions = this.state.transactionDetails;
    for (const orderId in transactions) {
      const { transactionId, amount, startTime, endTime } = transactions[orderId];
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

      if (timeLeft <= 0) {
        delete this.state.transactionDetails[orderId];
        localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));
        continue;
      }

      if (pendingOrder && pendingOrder.orderId === orderId) {
        const transaction = {
          amount: Number(amount),
          startTime: startTime,
          endTime: endTime,
          countdownTimer: null,
          checkInterval: null,
          orderId: orderId
        };

        this.elements.qrAmount.textContent = `Số tiền: ${this.formatCurrency(amount)}`;

        const updateCountdown = () => {
          const now = Date.now();
          const timeLeft = Math.max(0, Math.floor((transaction.endTime - now) / 1000));
          this.elements.countdown.textContent = this.formatTime(timeLeft);

          if (timeLeft <= 0) {
            this.handleTransactionTimeout(transactionId);
          }
        };

        updateCountdown();
        transaction.countdownTimer = setInterval(updateCountdown, 1000);

        transaction.checkInterval = setInterval(async () => {
          const serverData = await this.checkTransactionStatus(transactionId);
          if (serverData && this.state.activeTransactions.has(transactionId)) {
            const clientAmount = transaction.amount;
            const serverAmount = Number(serverData.amount);
            if (clientAmount === serverAmount) {
              this.handleTransactionSuccess(transactionId, orderId);
            } else {
              showNotification(`Số tiền không khớp: Client ${this.formatCurrency(clientAmount)} != Server ${this.formatCurrency(serverAmount)}`, "error");
              this.handleTransactionTimeout(transactionId);
            }
          }
        }, 5000);

        this.state.activeTransactions.set(transactionId, transaction);
        this.elements.downloadBtn.onclick = () => this.downloadQRCode();
      }
    }
  }
};

// Hàm lấy tọa độ từ địa chỉ bằng Mapbox Geocoding API
async function getCoordinates(address) {
  try {
    const response = await fetch(
      `${geocodeBase}/${encodeURIComponent(address)}.json?country=vn&access_token=${mapboxAccessToken}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        lat: feature.center[1],
        lon: feature.center[0],
        display_name: feature.place_name
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates from Mapbox:", error);
    return null;
  }
}

// Hàm lấy địa chỉ từ tọa độ (reverse geocoding)
async function getAddressFromCoords(lng, lat) {
  try {
    const response = await fetch(
      `${geocodeBase}/${lng},${lat}.json?country=vn&access_token=${mapboxAccessToken}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return "Không tìm thấy địa chỉ";
  } catch (error) {
    console.error("Error fetching address from coordinates:", error);
    return "Không tìm thấy địa chỉ";
  }
}

// Hàm tính khoảng cách và thời gian bằng Mapbox Directions API
async function calculateDistance(deliveryCoords) {
  if (!deliveryCoords) {
    showNotification("Vui lòng chọn địa chỉ giao hàng trên bản đồ!", "error");
    document.getElementById('distance-info').innerHTML = '';
    document.getElementById('confirm-delivery-btn').disabled = true;
    return;
  }

  try {
    const coordinates = `${storeCoords.lng}%2C${storeCoords.lat}%3B${deliveryCoords.lon}%2C${deliveryCoords.lat}`;
    const response = await fetch(
      `${directionsBase}${coordinates}?alternatives=false&continue_straight=false&geometries=geojson&overview=simplified&steps=false&notifications=none&access_token=${mapboxAccessToken}`
    );
    const data = await response.json();

    if (data.code === "Ok" && data.routes.length > 0) {
      const distance = (data.routes[0].distance / 1000).toFixed(1); // km
      const duration = Math.round(data.routes[0].duration / 60); // phút
      document.getElementById('distance-info').innerHTML = `Khoảng cách: ${distance} km | Thời gian di chuyển: ${duration} phút`;
      document.getElementById('confirm-delivery-btn').disabled = false;
      pendingOrder.deliveryAddress = deliveryCoords.display_name;
      pendingOrder.distance = `${distance} km`;
      pendingOrder.duration = `${duration} phút`;
    } else {
      document.getElementById('distance-info').innerHTML = 'Không thể tính khoảng cách. Vui lòng chọn địa chỉ khác!';
      document.getElementById('confirm-delivery-btn').disabled = true;
    }
  } catch (error) {
    console.error("Error calculating distance with Mapbox Directions API:", error);
    let errorMessage = "Lỗi khi tính khoảng cách. Vui lòng thử lại!";
    if (error.message.includes("400")) {
      errorMessage = "Yêu cầu không hợp lệ. Vui lòng kiểm tra địa chỉ!";
    } else if (error.message.includes("429")) {
      errorMessage = "Vượt quá giới hạn yêu cầu API!";
    }
    showNotification(errorMessage, "error");
    document.getElementById('distance-info').innerHTML = '';
    document.getElementById('confirm-delivery-btn').disabled = true;
  }
}

// Khởi tạo bản đồ Mapbox GL trong delivery-popup
function initMap() {
  mapboxgl.accessToken = mapboxAccessToken;
  map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [storeCoords.lng, storeCoords.lat],
    zoom: 14
  });

  // Thêm marker tại vị trí cửa hàng
  new mapboxgl.Marker({ color: '#FF0000' })
    .setLngLat([storeCoords.lng, storeCoords.lat])
    .setPopup(new mapboxgl.Popup().setText('Cửa hàng TocoToco'))
    .addTo(map);

  // Sự kiện nhấp chuột lên bản đồ để chọn địa chỉ
  map.on('click', async (e) => {
    const { lng, lat } = e.lngLat;
    selectedCoords = { lon: lng, lat: lat };

    // Xóa marker cũ nếu có
    if (marker) marker.remove();

    // Thêm marker mới tại vị trí được chọn
    marker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(map);

    // Lấy địa chỉ từ tọa độ (reverse geocoding)
    const address = await getAddressFromCoords(lng, lat);
    selectedCoords.display_name = address;
    document.getElementById('delivery-address-display').innerHTML = `Địa chỉ: ${address}`;
    document.getElementById('map-search').value = address;

    // Tính khoảng cách
    await calculateDistance(selectedCoords);
  });

  // Thêm tìm kiếm địa chỉ trên bản đồ
  const searchInput = document.getElementById('map-search');
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 3) return;

    const coords = await getCoordinates(query);
    if (coords) {
      selectedCoords = coords;

      // Di chuyển bản đồ đến vị trí tìm kiếm
      map.flyTo({ center: [coords.lon, coords.lat], zoom: 14 });

      // Xóa marker cũ nếu có
      if (marker) marker.remove();

      // Thêm marker mới tại vị trí tìm kiếm
      marker = new mapboxgl.Marker()
        .setLngLat([coords.lon, coords.lat])
        .addTo(map);

      document.getElementById('delivery-address-display').innerHTML = `Địa chỉ: ${coords.display_name}`;
      await calculateDistance(selectedCoords);
    }
  });

  // Thêm autocomplete cho ô tìm kiếm
  $("#map-search").autocomplete({
    source: async function(request, response) {
      try {
        const res = await fetch(
          `${geocodeBase}/${encodeURIComponent(request.term)}.json?country=vn&autocomplete=true&access_token=${mapboxAccessToken}`
        );
        const data = await res.json();
        response(data.features.map(feature => ({
          label: feature.place_name,
          value: feature.place_name
        })));
      } catch (error) {
        console.error("Error fetching autocomplete from Mapbox:", error);
        response([]);
      }
    },
    minLength: 3,
    appendTo: ".delivery-content",
    select: async function(event, ui) {
      const coords = await getCoordinates(ui.item.value);
      if (coords) {
        selectedCoords = coords;
        map.flyTo({ center: [coords.lon, coords.lat], zoom: 14 });

        if (marker) marker.remove();
        marker = new mapboxgl.Marker()
          .setLngLat([coords.lon, coords.lat])
          .addTo(map);

        document.getElementById('delivery-address-display').innerHTML = `Địa chỉ: ${coords.display_name}`;
        await calculateDistance(selectedCoords);
      }
    },
    open: function() {
      $(this).autocomplete("widget").css({
        "width": $("#map-search").outerWidth(),
        "z-index": 3000
      });
    }
  });
}

// Hàm mở popup chọn địa chỉ
function openDeliveryPopup() {
  document.getElementById('delivery-popup').style.display = 'flex';
  document.getElementById('map-search').value = '';
  document.getElementById('delivery-address-display').innerHTML = '';
  document.getElementById('distance-info').innerHTML = '';
  document.getElementById('confirm-delivery-btn').disabled = true;
  selectedCoords = null;

  // Khởi tạo bản đồ nếu chưa có
  if (!map) {
    initMap();
  } else {
    // Nếu bản đồ đã được khởi tạo, chỉ cần resize để hiển thị đúng
    map.resize();
    map.flyTo({ center: [storeCoords.lng, storeCoords.lat], zoom: 14 });
  }

  // Xóa marker cũ nếu có
  if (marker) {
    marker.remove();
    marker = null;
  }
}

// Hàm đóng popup chọn địa chỉ
function closeDeliveryPopup() {
  document.getElementById('delivery-popup').style.display = 'none';
  pendingOrder.deliveryAddress = null;
  pendingOrder.distance = null;
  pendingOrder.duration = null;
  selectedCoords = null;
}

// Hàm xử lý CSV
function csvToJson(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length) continue;
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    if (obj['Tên món']) result.push(obj);
  }
  return result;
}

// Hàm preload hình ảnh
function preloadImages(imageUrls) {
  const uniqueUrls = [...new Set(imageUrls.filter(url => url && url !== 'https://via.placeholder.com/180'))];
  uniqueUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// Lấy dữ liệu từ Google Sheets và preload hình ảnh
fetch(csvUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu từ Google Sheets');
    return response.text();
  })
  .then(csv => {
    allData = csvToJson(csv);
    toppings = allData.filter(item => item['Danh mục'] === 'Topping').map(item => ({
      name: item['Tên món'],
      price: Number(item['Giá tiền']) || 0
    }));

    const imageUrls = allData.map(item => item['URL hình ảnh'] || 'https://via.placeholder.com/180');
    preloadImages(imageUrls);

    const categoryList = document.getElementById('category-list');
    const categories = [...new Set(allData.map(item => item['Danh mục']))].filter(cat => cat !== 'Topping');
    categories.forEach(category => {
      const li = document.createElement('li');
      li.textContent = category;
      li.onclick = () => {
        filterProducts(category);
        if (window.innerWidth <= 768) toggleMenu();
      };
      categoryList.appendChild(li);
    });
    filterProducts(categories[0] || 'Trà Sữa');
    categoryList.children[0].classList.add('active');
  })
  .catch(error => {
    console.error('Lỗi:', error);
    showNotification('Không thể tải menu. Vui lòng kiểm tra kết nối hoặc Google Sheets.', "error");
  });

// Lọc và hiển thị sản phẩm
function filterProducts(category) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  const filteredData = allData.filter(item => item['Danh mục'] === category);
  filteredData.forEach(item => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <img src="${item['URL hình ảnh'] || 'https://via.placeholder.com/180'}" alt="${item['Tên món']}">
      <h3>${item['Tên món']}</h3>
      <p>${Number(item['Giá tiền']).toLocaleString('vi-VN')} VNĐ</p>
      <button onclick="openPopup('${item['Tên món']}', '${item['Danh mục']}', '${item['Size'] || 'M,L'}', ${item['Giá tiền']}, '${item['Đường'] || '30%,50%,70%,100%'}', '${item['Đá'] || 'Không đá,Ít đá,Thường,Nhiều đá'}')">Thêm</button>
    `;
    productDiv.onclick = (e) => {
      if (e.target.tagName !== 'BUTTON') {
        openZoomPopup(item['URL hình ảnh'] || 'https://via.placeholder.com/180', item['Tên món'], Number(item['Giá tiền']));
      }
    };
    productList.appendChild(productDiv);
  });

  const categoryItems = document.querySelectorAll('#category-list li');
  categoryItems.forEach(item => item.classList.remove('active'));
  const selectedCategory = Array.from(categoryItems).find(item => item.textContent === category);
  if (selectedCategory) selectedCategory.classList.add('active');
}

// Mở popup phóng to
function openZoomPopup(imageUrl, name, price) {
  document.getElementById('zoom-image').src = imageUrl;
  document.getElementById('zoom-product-name').textContent = name;
  document.getElementById('zoom-product-price').textContent = `${price.toLocaleString('vi-VN')} VNĐ`;
  document.getElementById('zoom-popup').style.display = 'flex';
}

// Đóng popup phóng to
function closeZoomPopup() {
  document.getElementById('zoom-popup').style.display = 'none';
}

// Mở popup chọn tùy chọn
function openPopup(name, category, sizeOptions, price, sugarOptions = '30%,50%,70%,100%', iceOptions = 'Không đá,Ít đá,Thường,Nhiều đá', groupKey = null, existingItem = null) {
  editingGroupKey = groupKey;
  currentProduct = existingItem ? { ...existingItem, price: Number(price), toppingPrice: 0 } : { 
    name, 
    category, 
    size: '', 
    toppings: [], 
    sugar: '', 
    ice: '', 
    price: Number(price), 
    toppingPrice: 0, 
    quantity: 1, 
    note: '' 
  };
  
  document.getElementById('popup-product-name').textContent = name;
  document.getElementById('popup-title').textContent = existingItem ? 'Chỉnh sửa sản phẩm' : 'Chọn tùy chọn';
  const actionBtn = document.getElementById('popup-action-btn');
  actionBtn.textContent = existingItem ? 'Cập nhật' : 'Thêm vào giỏ';
  actionBtn.onclick = existingItem ? updateCartItem : addToCart;

  // Điều chỉnh hiển thị tùy chọn dựa trên danh mục
  const isSimpleCategory = category === 'Món thêm' || category === 'Kem';
  
  // Ẩn các section không cần thiết cho Món thêm và Kem
  document.getElementById('size-section').style.display = isSimpleCategory ? 'none' : 'flex';
  document.getElementById('topping-section').style.display = isSimpleCategory ? 'none' : 'flex';
  document.getElementById('sugar-section').style.display = isSimpleCategory ? 'none' : 'flex';
  document.getElementById('ice-section').style.display = isSimpleCategory ? 'none' : 'flex';

  // Chỉ hiển thị tùy chọn cho các danh mục không phải Món thêm hoặc Kem
  if (!isSimpleCategory) {
    const sizeContainer = document.getElementById('size-options');
    sizeContainer.innerHTML = '';
    const sizes = sizeOptions.split(',').map(size => size.trim()).filter(size => size);
    let defaultSize = sizes.includes('M') ? 'M' : (sizes.includes('XL') ? 'XL' : sizes[0] || '');
    sizes.forEach(size => {
      const sizeTrimmed = size.trim();
      const label = document.createElement('label');
      const isChecked = (existingItem && existingItem.size === sizeTrimmed) || (!existingItem && sizeTrimmed === defaultSize);
      label.innerHTML = `
        <input type="radio" name="size" value="${sizeTrimmed}" ${isChecked ? 'checked' : ''}> ${sizeTrimmed}
      `;
      sizeContainer.appendChild(label);
    });

    const toppingContainer = document.getElementById('topping-options');
    toppingContainer.innerHTML = '';
    toppings.forEach(topping => {
      const label = document.createElement('label');
      const isChecked = existingItem && existingItem.toppings.some(t => t.name === topping.name);
      label.innerHTML = `
        <input type="checkbox" name="topping" value="${topping.name}" data-price="${topping.price}" ${isChecked ? 'checked' : ''}> 
        ${topping.name} (+${topping.price.toLocaleString('vi-VN')} VNĐ)
      `;
      toppingContainer.appendChild(label);
    });

    const sugarContainer = document.getElementById('sugar-options');
    sugarContainer.innerHTML = '';
    const sugars = sugarOptions.split(',').map(sugar => sugar.trim()).filter(sugar => sugar);
    let defaultSugar = sugars.includes('100%') ? '100%' : sugars[0] || '';
    sugars.forEach(sugar => {
      const sugarTrimmed = sugar.trim();
      const label = document.createElement('label');
      const isChecked = (existingItem && existingItem.sugar === sugarTrimmed) || (!existingItem && sugarTrimmed === defaultSugar);
      label.innerHTML = `
        <input type="radio" name="sugar" value="${sugarTrimmed}" ${isChecked ? 'checked' : ''}> ${sugarTrimmed}
      `;
      sugarContainer.appendChild(label);
    });

    const iceContainer = document.getElementById('ice-options');
    iceContainer.innerHTML = '';
    const ices = iceOptions.split(',').map(ice => ice.trim()).filter(ice => ice);
    let defaultIce = ices.includes('Thường') ? 'Thường' : ices[0] || '';
    ices.forEach(ice => {
      const iceTrimmed = ice.trim();
      const label = document.createElement('label');
      const isChecked = (existingItem && existingItem.ice === iceTrimmed) || (!existingItem && iceTrimmed === defaultIce);
      label.innerHTML = `
        <input type="radio" name="ice" value="${iceTrimmed}" ${isChecked ? 'checked' : ''}> ${iceTrimmed}
      `;
      iceContainer.appendChild(label);
    });
  }

  document.getElementById('quantity-input').value = existingItem ? existingItem.quantity : 1;
  document.getElementById('note-input').value = existingItem ? existingItem.note : '';

  if (groupKey) {
    closeCart();
  }

  document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
  editingGroupKey = null;
}

function addToCart() {
  const quantity = document.getElementById('quantity-input').value;
  const note = document.getElementById('note-input').value;
  const isSimpleCategory = currentProduct.category === 'Món thêm' || currentProduct.category === 'Kem';

  if (quantity < 1) {
    showNotification("Số lượng phải lớn hơn 0!", "error");
    return;
  }

  if (!isSimpleCategory) {
    const size = document.querySelector('input[name="size"]:checked');
    const selectedToppings = document.querySelectorAll('input[name="topping"]:checked');
    const sugar = document.querySelector('input[name="sugar"]:checked');
    const ice = document.querySelector('input[name="ice"]:checked');

    if (!size) {
      showNotification("Vui lòng chọn size!", "error");
      return;
    }
    if (!sugar) {
      showNotification("Vui lòng chọn mức đường!", "error");
      return;
    }
    if (!ice) {
      showNotification("Vui lòng chọn mức đá!", "error");
      return;
    }

    currentProduct.size = size.value;
    currentProduct.toppings = Array.from(selectedToppings).map(topping => ({
      name: topping.value,
      price: Number(topping.dataset.price)
    }));
    currentProduct.sugar = sugar.value;
    currentProduct.ice = ice.value;
    currentProduct.toppingPrice = currentProduct.toppings.reduce((sum, t) => sum + t.price, 0);

    if (currentProduct.size === 'L') {
      currentProduct.price += 5000;
    }
  } else {
    currentProduct.size = 'N/A';
    currentProduct.toppings = [];
    currentProduct.sugar = 'N/A';
    currentProduct.ice = 'N/A';
    currentProduct.toppingPrice = 0;
  }

  currentProduct.quantity = Number(quantity);
  currentProduct.note = note;

  cart.push({ ...currentProduct });
  updateCartCount();
  closePopup();
  showNotification("Đã thêm vào giỏ hàng!", "success");
}

function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
  localStorage.setItem('cart', JSON.stringify(cart)); // Lưu vào localStorage
}

function groupCartItems() {
  const groupedCart = {};
  cart.forEach((item, index) => {
    const key = `${item.name}-${item.size}-${item.sugar}-${item.ice}-${JSON.stringify(item.toppings)}-${item.note}`;
    if (!groupedCart[key]) {
      groupedCart[key] = {
        name: item.name,
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        key: key,
        category: item.category
      };
    }
    groupedCart[key].items.push({ ...item, originalIndex: index });
    groupedCart[key].totalPrice += (item.price + item.toppingPrice) * item.quantity;
    groupedCart[key].totalQuantity += item.quantity;
  });
  return Object.values(groupedCart);
}

function showCartTab() {
  document.getElementById('cart-tab').style.display = 'block';
  document.getElementById('history-tab').style.display = 'none';
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.tab-button[onclick="showCartTab()"]').classList.add('active');
  viewCart();
}

function showHistoryTab() {
  document.getElementById('cart-tab').style.display = 'none';
  document.getElementById('history-tab').style.display = 'block';
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.tab-button[onclick="showHistoryTab()"]').classList.add('active');
  viewOrderHistory();
}

function viewCart() {
  const cartPopup = document.getElementById('cart-popup');
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<li>Giỏ hàng trống</li>';
  } else {
    const groupedCart = groupCartItems();
    groupedCart.forEach((group, index) => {
      const li = document.createElement('li');
      const productName = document.createElement('div');
      productName.className = 'product-name';
      productName.textContent = `${index + 1}. ${group.name}`;
      li.appendChild(productName);

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = 'Chỉnh sửa';
      editBtn.onclick = () => {
        const item = group.items[0];
        const productData = allData.find(data => data['Tên món'] === group.name);
        if (productData) {
          openPopup(
            group.name,
            productData['Danh mục'],
            productData['Size'] || 'M,L',
            productData['Giá tiền'],
            productData['Đường'] || '30%,50%,70%,100%',
            productData['Đá'] || 'Không đá,Ít đá,Thường,Nhiều đá',
            group.key,
            item
          );
        }
      };
      li.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Xóa';
      deleteBtn.onclick = () => {
        cart = cart.filter(item => {
          const key = `${item.name}-${item.size}-${item.sugar}-${item.ice}-${JSON.stringify(item.toppings)}-${item.note}`;
          return key !== group.key;
        });
        updateCartCount();
        viewCart();
      };
      li.appendChild(deleteBtn);

      group.items.forEach(item => {
        const isSimpleCategory = item.category === 'Món thêm' || item.category === 'Kem';

        if (!isSimpleCategory) {
          const toppingNames = item.toppings.map(t => t.name).join(', ') || 'Không';

          const sizeRow = document.createElement('div');
          sizeRow.className = 'detail-row';
          sizeRow.innerHTML = `<label>Size:</label><span>${item.size}</span>`;
          li.appendChild(sizeRow);

          const toppingRow = document.createElement('div');
          toppingRow.className = 'detail-row vertical';
          toppingRow.innerHTML = `<label>Topping:</label><span>${toppingNames}</span>`;
          li.appendChild(toppingRow);

          const sugarRow = document.createElement('div');
          sugarRow.className = 'detail-row';
          sugarRow.innerHTML = `<label>Mức đường:</label><span>${item.sugar}</span>`;
          li.appendChild(sugarRow);

          const iceRow = document.createElement('div');
          iceRow.className = 'detail-row';
          iceRow.innerHTML = `<label>Mức đá:</label><span>${item.ice}</span>`;
          li.appendChild(iceRow);
        }

        const quantityRow = document.createElement('div');
        quantityRow.className = 'detail-row';
        quantityRow.innerHTML = `<label>Số lượng:</label><span>${item.quantity}</span>`;
        li.appendChild(quantityRow);

        const noteRow = document.createElement('div');
        noteRow.className = 'detail-row vertical';
        noteRow.innerHTML = `<label>Ghi chú:</label><span>${item.note || 'Không có'}</span>`;
        li.appendChild(noteRow);

        const priceRow = document.createElement('div');
        priceRow.className = 'detail-row';
        priceRow.innerHTML = `<label>Giá tiền:</label><span>${((item.price + item.toppingPrice) * item.quantity).toLocaleString('vi-VN')} VNĐ</span>`;
        li.appendChild(priceRow);
      });

      cartItems.appendChild(li);
    });

    // Hiển thị nút "Tiếp tục giao dịch" nếu có pendingOrder
    if (pendingOrder && transactionTracker.state.transactionDetails[pendingOrder.orderId]) {
      const continueBtn = document.createElement('button');
      continueBtn.id = 'continue-transaction';
      continueBtn.textContent = 'Tiếp tục giao dịch';
      continueBtn.onclick = () => {
        const { transactionId, amount } = transactionTracker.state.transactionDetails[pendingOrder.orderId];
        const qrUrl = transactionTracker.generateQRCode(amount, transactionId);
        transactionTracker.elements.popupQrImage.src = qrUrl;
        transactionTracker.elements.qrAmount.textContent = `Số tiền: ${transactionTracker.formatCurrency(amount)}`;

        const existingTransaction = transactionTracker.state.activeTransactions.get(transactionId);
        if (existingTransaction) {
          transactionTracker.elements.countdown.textContent = transactionTracker.formatTime(Math.max(0, Math.floor((existingTransaction.endTime - Date.now()) / 1000)));
          transactionTracker.elements.qrPopup.style.display = 'flex';
        } else {
          transactionTracker.elements.qrPopup.style.display = 'flex';
          transactionTracker.startTransaction(amount, transactionId, pendingOrder.orderId);
        }
      };
      cartItems.appendChild(continueBtn);
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price + item.toppingPrice) * item.quantity, 0);
  document.getElementById('cart-total').textContent = `Tổng cộng: ${total.toLocaleString('vi-VN')} VNĐ`;
  cartPopup.style.display = 'flex';

  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('active');
  }
}

function updateCartItem() {
  const quantity = document.getElementById('quantity-input').value;
  const note = document.getElementById('note-input').value;
  const isSimpleCategory = currentProduct.category === 'Món thêm' || currentProduct.category === 'Kem';

  if (quantity < 1) {
    showNotification("Số lượng phải lớn hơn 0!", "error");
    return;
  }

  cart = cart.filter(item => {
    const key = `${item.name}-${item.size}-${item.sugar}-${item.ice}-${JSON.stringify(item.toppings)}-${item.note}`;
    return key !== editingGroupKey;
  });

  if (!isSimpleCategory) {
    const size = document.querySelector('input[name="size"]:checked');
    const selectedToppings = document.querySelectorAll('input[name="topping"]:checked');
    const sugar = document.querySelector('input[name="sugar"]:checked');
    const ice = document.querySelector('input[name="ice"]:checked');

    if (!size) {
      showNotification("Vui lòng chọn size!", "error");
      return;
    }
    if (!sugar) {
      showNotification("Vui lòng chọn mức đường!", "error");
      return;
    }
    if (!ice) {
      showNotification("Vui lòng chọn mức đá!", "error");
      return;
    }

    currentProduct.size = size.value;
    currentProduct.toppings = Array.from(selectedToppings).map(topping => ({
      name: topping.value,
      price: Number(topping.dataset.price)
    }));
    currentProduct.sugar = sugar.value;
    currentProduct.ice = ice.value;
    currentProduct.toppingPrice = currentProduct.toppings.reduce((sum, t) => sum + t.price, 0);

    if (currentProduct.size === 'L') {
      currentProduct.price += 5000;
    }
  } else {
    currentProduct.size = 'N/A';
    currentProduct.toppings = [];
    currentProduct.sugar = 'N/A';
    currentProduct.ice = 'N/A';
    currentProduct.toppingPrice = 0;
  }

  currentProduct.quantity = Number(quantity);
  currentProduct.note = note;

  cart.push({ ...currentProduct });
  updateCartCount();
  closePopup();
  viewCart();
  showNotification("Đã cập nhật sản phẩm trong giỏ hàng!", "success");
}

function closeCart() {
  document.getElementById('cart-popup').style.display = 'none';
}

function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
}

async function placeOrder() {
  if (cart.length === 0) {
    showNotification("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng!", "error");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Vui lòng đăng nhập trước khi đặt hàng!", "error");
    showLoginPopup(false);
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price + item.toppingPrice) * item.quantity, 0);
  pendingOrder = {
    cart: [...cart],
    status: "pending",
    total,
    orderId: `TEMP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    deliveryAddress: null,
    distance: null,
    duration: null
  };

  openDeliveryPopup();
  closeCart();
}

// Hàm xác nhận địa chỉ giao hàng và mở popup QR
function confirmDelivery() {
  if (!pendingOrder.deliveryAddress) {
    showNotification("Vui lòng chọn địa chỉ giao hàng hợp lệ trên bản đồ!", "error");
    return;
  }

  const total = pendingOrder.total;
  const transactionId = transactionTracker.formatDateTime();
  const qrUrl = transactionTracker.generateQRCode(total, transactionId);
  transactionTracker.elements.popupQrImage.src = qrUrl;
  transactionTracker.elements.qrAmount.textContent = `Số tiền: ${transactionTracker.formatCurrency(total)}`;
  transactionTracker.elements.qrPopup.style.display = 'flex';
  transactionTracker.startTransaction(total, transactionId, pendingOrder.orderId);
  closeDeliveryPopup();
}

function cancelTransaction() {
  const transactionId = transactionTracker.elements.popupQrImage.src.match(/ID(\d+)/)?.[1];
  if (transactionId && transactionTracker.state.activeTransactions.has(transactionId)) {
    const transaction = transactionTracker.state.activeTransactions.get(transactionId);
    clearInterval(transaction.countdownTimer);
    clearInterval(transaction.checkInterval);
    transactionTracker.state.activeTransactions.delete(transactionId);
    delete transactionTracker.state.transactionDetails[transaction.orderId];
    localStorage.setItem('transactionDetails', JSON.stringify(transactionTracker.state.transactionDetails));
    transactionTracker.resetPopup();
    pendingOrder = null;
    showNotification("Đã hủy giao dịch!", "error");
  }
}

async function viewOrderHistory() {
  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Vui lòng đăng nhập để xem lịch sử đơn hàng!", "error");
    showLoginPopup(false);
    return;
  }

  try {
    const response = await fetch(`${apiBase}?action=getOrders&token=${token}`);
    const data = await response.json();

    const historyItems = document.getElementById('history-items');
    historyItems.innerHTML = '';

    if (!data.orders || data.orders.length === 0) {
      historyItems.innerHTML = '<li>Chưa có đơn hàng nào!</li>';
    } else {
      data.orders.forEach((order, index) => {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';
        const createdAt = new Date(order.createdAt || Date.now()).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        li.innerHTML = `<div class="order-id">${index + 1}. Mã đơn: ${order.orderId} - Trạng thái: ${order.status} - Ngày đặt: ${createdAt}</div>`;
        li.onclick = () => showOrderDetails(order);
        historyItems.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Lỗi khi tải lịch sử đơn hàng:", error);
    showNotification("Đã có lỗi xảy ra khi tải lịch sử đơn hàng!", "error");
  }
}

async function showOrderDetails(order) {
  const detailsContent = document.getElementById('order-details-content');
  detailsContent.innerHTML = '';

  const orderIdDiv = document.createElement('div');
  orderIdDiv.className = 'detail-row';
  orderIdDiv.innerHTML = `<label>Mã đơn:</label><span>${order.orderId}</span>`;
  detailsContent.appendChild(orderIdDiv);

  const statusDiv = document.createElement('div');
  statusDiv.className = 'detail-row';
  statusDiv.innerHTML = `<label>Trạng thái:</label><span>${order.status}</span>`;
  detailsContent.appendChild(statusDiv);

  const createdAt = new Date(order.createdAt || Date.now()).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const createdAtDiv = document.createElement('div');
  createdAtDiv.className = 'detail-row';
  createdAtDiv.innerHTML = `<label>Ngày đặt:</label><span>${createdAt}</span>`;
  detailsContent.appendChild(createdAtDiv);

  if (order.deliveryAddress) {
    const deliveryDiv = document.createElement('div');
    deliveryDiv.className = 'detail-row vertical';
    deliveryDiv.innerHTML = `<label>Địa chỉ giao hàng:</label><span>${order.deliveryAddress}</span>`;
    detailsContent.appendChild(deliveryDiv);

    const distanceDiv = document.createElement('div');
    distanceDiv.className = 'detail-row';
    distanceDiv.innerHTML = `<label>Khoảng cách:</label><span>${order.distance || 'N/A'}</span>`;
    detailsContent.appendChild(distanceDiv);

    const durationDiv = document.createElement('div');
    durationDiv.className = 'detail-row';
    durationDiv.innerHTML = `<label>Thời gian di chuyển:</label><span>${order.duration || 'N/A'}</span>`;
    detailsContent.appendChild(durationDiv);
  }

  order.cart.forEach(item => {
    const isSimpleCategory = item.category === 'Món thêm' || item.category === 'Kem';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'detail-row';
    nameDiv.innerHTML = `<label>Tên món:</label><span>${item.name}</span>`;
    detailsContent.appendChild(nameDiv);

    if (!isSimpleCategory) {
      const sizeDiv = document.createElement('div');
      sizeDiv.className = 'detail-row';
      sizeDiv.innerHTML = `<label>Size:</label><span>${item.size}</span>`;
      detailsContent.appendChild(sizeDiv);

      const toppingNames = item.toppings.map(t => t.name).join(', ') || 'Không';
      const toppingDiv = document.createElement('div');
      toppingDiv.className = 'detail-row vertical';
      toppingDiv.innerHTML = `<label>Topping:</label><span>${toppingNames}</span>`;
      detailsContent.appendChild(toppingDiv);

      const sugarDiv = document.createElement('div');
      sugarDiv.className = 'detail-row';
      sugarDiv.innerHTML = `<label>Mức đường:</label><span>${item.sugar}</span>`;
      detailsContent.appendChild(sugarDiv);

      const iceDiv = document.createElement('div');
      iceDiv.className = 'detail-row';
      iceDiv.innerHTML = `<label>Mức đá:</label><span>${item.ice}</span>`;
      detailsContent.appendChild(iceDiv);
    }

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'detail-row';
    quantityDiv.innerHTML = `<label>Số lượng:</label><span>${item.quantity}</span>`;
    detailsContent.appendChild(quantityDiv);

    const noteDiv = document.createElement('div');
    noteDiv.className = 'detail-row vertical';
    noteDiv.innerHTML = `<label>Ghi chú:</label><span>${item.note || 'Không có'}</span>`;
    detailsContent.appendChild(noteDiv);

    const priceDiv = document.createElement('div');
    priceDiv.className = 'detail-row';
    priceDiv.innerHTML = `<label>Giá tiền:</label><span>${((item.price + item.toppingPrice) * item.quantity).toLocaleString('vi-VN')} VNĐ</span>`;
    detailsContent.appendChild(priceDiv);
  });

  const totalDiv = document.createElement('div');
  totalDiv.className = 'detail-row';
  totalDiv.innerHTML = `<label>Tổng cộng:</label><span>${order.total.toLocaleString('vi-VN')} VNĐ</span>`;
  detailsContent.appendChild(totalDiv);

  if (order.status === 'pending' && transactionTracker.state.transactionDetails[order.orderId]) {
    const { transactionId, amount } = transactionTracker.state.transactionDetails[order.orderId];
    const qrUrl = transactionTracker.generateQRCode(amount, transactionId);
    const qrImg = document.createElement('img');
    qrImg.src = qrUrl;
    qrImg.alt = 'QR Code';
    qrImg.style.marginTop = '10px';
    detailsContent.appendChild(qrImg);

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = "Tải QR";
    downloadBtn.style.marginTop = '10px';
    downloadBtn.onclick = async () => {
      try {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR_Payment_${transactionTracker.formatDateTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading QR code:", error);
        showNotification("Không thể tải QR code. Vui lòng thử lại!", "error");
      }
    };
    detailsContent.appendChild(downloadBtn);
  }

  document.getElementById('order-details-popup').style.display = 'flex';
}

function closeOrderDetailsPopup() {
  document.getElementById('order-details-popup').style.display = 'none';
}

// Auth Functions
function showLoginPopup(isRegister) {
  isRegisterMode = isRegister;
  const authPopup = document.getElementById('auth-popup');
  const authTitle = document.getElementById('auth-title');
  const userNameInput = document.getElementById('user-name');
  authTitle.textContent = isRegister ? 'Đăng ký' : 'Đăng nhập';
  userNameInput.style.display = isRegister ? 'block' : 'none';
  document.getElementById('user-email').value = '';
  document.getElementById('user-password').value = '';
  authPopup.style.display = 'flex';
}

function hidePopup(event) {
  const popups = ['auth-popup', 'qr-popup', 'popup', 'cart-popup', 'order-details-popup', 'zoom-popup', 'delivery-popup'];
  if (popups.includes(event.target.id)) {
    if (event.target.id === 'qr-popup') {
      transactionTracker.resetPopup();
    } else if (event.target.id === 'delivery-popup') {
      closeDeliveryPopup();
    } else {
      event.target.style.display = 'none';
    }
  }
}

// Gắn sự kiện nhấp chuột cho toàn bộ document
document.addEventListener('click', hidePopup);

async function submitAuth() {
  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const password = document.getElementById("user-password").value.trim();

  if (!email || !password || (isRegisterMode && !name)) {
    showNotification("Vui lòng điền đầy đủ thông tin!", "error");
    return;
  }

  try {
    const action = isRegisterMode ? "registerUser" : "loginUser";
    const body = isRegisterMode ? { name, email, password } : { email, password };
    const response = await fetch(`${apiBase}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('auth-popup').style.display = 'none';
      showNotification(isRegisterMode ? "Đăng ký thành công!" : "Đăng nhập thành công!", "success");
      await checkUserSession();
    } else {
      showNotification(data.message || (isRegisterMode ? "Đăng ký thất bại!" : "Đăng nhập thất bại!"), "error");
    }
  } catch (error) {
    console.error('Lỗi:', error);
    showNotification("Đã có lỗi xảy ra. Vui lòng thử lại!", "error");
  }
}

function updateUserInfo(name, exp = 0, rank = 'Bronze') {
  const rankIcon = document.getElementById('rank-icon');
  rankIcon.className = `rank-icon rank-${rank.toLowerCase()}`;
  
  document.getElementById('user-name-display').textContent = `👋 ${name}`;
  document.getElementById('user-points').textContent = `${exp} Points | Rank: ${rank}`;
  
  const expPercentage = Math.min((exp % 1000) / 10, 100);
  document.getElementById('exp-fill').style.width = `${expPercentage}%`;
  
  document.getElementById("login-button").style.display = "none";
  document.getElementById("register-button").style.display = "none";
  document.getElementById("logout-button").style.display = "block";
  document.getElementById("user-info").style.display = "flex";
}

async function checkUserSession() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${apiBase}?action=User&token=${token}`);
    const data = await response.json();

    if (data.name) {
      updateUserInfo(data.name, data.exp || 0, data.rank || 'Bronze');
    } else {
      localStorage.removeItem("token");
      document.getElementById("login-button").style.display = "block";
      document.getElementById("register-button").style.display = "block";
      document.getElementById("logout-button").style.display = "none";
      document.getElementById('user-info').style.display = "none";
      showNotification("Phiên đăng nhập không hợp lệ!", "error");
    }
  } catch (error) {
    console.error("Lỗi kiểm tra phiên:", error);
    localStorage.removeItem("token");
    document.getElementById("login-button").style.display = "block";
    document.getElementById("register-button").style.display = "block";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById('user-info').style.display = "none";
    showNotification("Phiên đăng nhập không hợp lệ!", "error");
  }
}

function logout() {
  localStorage.removeItem("token");
  document.getElementById("login-button").style.display = "block";
  document.getElementById("register-button").style.display = "block";
  document.getElementById("logout-button").style.display = "none";
  document.getElementById('user-info').style.display = "none";
  showNotification("Đã đăng xuất!", "success");
}

window.addEventListener("load", () => {
  checkUserSession();
  updateCartCount(); // Hiển thị số lượng giỏ hàng từ localStorage
  transactionTracker.restoreTransactions(); // Khôi phục giao dịch nếu có
});
