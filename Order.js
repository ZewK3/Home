const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxseIrDGsm0EN5t6GWCi8-lHO-WJccNl3pR5s2DzSrLRxf5nYje9xUdLlOT0ZkGxlmw0tMZZNKFa8a/pub?output=csv';
const API_BASE = "https://zewk.tocotoco.workers.dev/";
const STORE_COORDS = { lng: 106.650467, lat: 10.782461 };
const MAPBOX_TOKEN = "pk.eyJ1IjoiemV3azExMDYiLCJhIjoiY205d3MwYjI5MHZzaTJtcjBmajl5dWI5diJ9.dP89zeG92u7AeHigH4tJwg";
const GEOCODE_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const DIRECTIONS_BASE = "https://api.mapbox.com/directions/v5/mapbox/driving/";

// Global Variables
let allData = [];
let toppings = [];
let currentProduct = {};
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let editingGroupKey = null;
let isRegisterMode = false;
let pendingOrder = null;
let map = null;
let marker = null;
let selectedCoords = null;

// DOM Elements
const elements = {
  notification: createNotificationElement(),
  categoryList: document.getElementById('category-list'),
  productList: document.getElementById('product-list'),
  cartCount: document.getElementById('cart-count'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  popup: document.getElementById('popup'),
  popupProductName: document.getElementById('popup-product-name'),
  popupTitle: document.getElementById('popup-title'),
  popupActionBtn: document.getElementById('popup-action-btn'),
  sizeOptions: document.getElementById('size-options'),
  toppingOptions: document.getElementById('topping-options'),
  sugarOptions: document.getElementById('sugar-options'),
  iceOptions: document.getElementById('ice-options'),
  quantityInput: document.getElementById('quantity-input'),
  noteInput: document.getElementById('note-input'),
  cartPopup: document.getElementById('cart-popup'),
  cartTab: document.getElementById('cart-tab'),
  historyTab: document.getElementById('history-tab'),
  historyItems: document.getElementById('history-items'),
  zoomPopup: document.getElementById('zoom-popup'),
  zoomImage: document.getElementById('zoom-image'),
  zoomProductName: document.getElementById('zoom-product-name'),
  zoomProductPrice: document.getElementById('zoom-product-price'),
  authPopup: document.getElementById('auth-popup'),
  authTitle: document.getElementById('auth-title'),
  userNameInput: document.getElementById('user-name'),
  userEmailInput: document.getElementById('user-email'),
  userPasswordInput: document.getElementById('user-password'),
  userInfo: document.getElementById('user-info'),
  userNameDisplay: document.getElementById('user-name-display'),
  userPoints: document.getElementById('user-points'),
  rankIcon: document.getElementById('rank-icon'),
  expFill: document.getElementById('exp-fill'),
  loginButton: document.getElementById('login-button'),
  registerButton: document.getElementById('register-button'),
  logoutButton: document.getElementById('logout-button'),
  deliveryPopup: document.getElementById('delivery-popup'),
  mapSearch: document.getElementById('map-search'),
  deliveryAddressDisplay: document.getElementById('delivery-address-display'),
  distanceInfo: document.getElementById('distance-info'),
  confirmDeliveryBtn: document.getElementById('confirm-delivery-btn'),
  orderDetailsPopup: document.getElementById('order-details-popup'),
  orderDetailsContent: document.getElementById('order-details-content'),
};

// Transaction Tracker (Giữ nguyên phần đã hoàn thiện)
const transactionTracker = {
  state: {
    baseQRUrl: 'https://api.vietqr.io/image/970403-062611062003-sIxhggL.jpg?accountName=LE%20DAI%20LOI',
    activeTransactions: new Map(),
    transactionDetails: JSON.parse(localStorage.getItem('transactionDetails') || '{}'),
  },
  elements: {
    qrPopup: document.getElementById('qr-popup'),
    popupQrImage: document.getElementById('popup-qr-image'),
    qrAmount: document.getElementById('qr-amount'),
    countdown: document.getElementById('countdown'),
    downloadBtn: document.getElementById('download-qr'),
    cancelBtn: document.getElementById('cancel-transaction'),
  },
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', ' VNĐ');
  },
  formatDateTime() {
    return new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
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
      const response = await fetch(`${API_BASE}?action=checkTransaction&transactionId=ID${transactionId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.success ? data : false;
    } catch (error) {
      console.error('Error checking transaction:', error);
      showNotification('Lỗi kiểm tra giao dịch. Vui lòng thử lại!', 'error');
      return false;
    }
  },
  async downloadQRCode() {
    try {
      const response = await fetch(this.elements.popupQrImage.src);
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
      console.error('Error downloading QR code:', error);
      showNotification('Không thể tải QR code. Vui lòng thử lại!', 'error');
    }
  },
  startTransaction(amount, transactionId, orderId) {
    const startTime = Date.now();
    const duration = 900 * 1000; // 15 minutes
    const endTime = startTime + duration;

    const transaction = {
      amount: Number(amount),
      startTime,
      endTime,
      countdownTimer: null,
      checkInterval: null,
      orderId,
    };

    this.state.transactionDetails[orderId] = { transactionId, amount, startTime, endTime };
    localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));

    this.elements.qrAmount.textContent = `Số tiền: ${this.formatCurrency(amount)}`;

    const updateCountdown = () => {
      const timeLeft = Math.max(0, Math.floor((transaction.endTime - Date.now()) / 1000));
      this.elements.countdown.textContent = this.formatTime(timeLeft);
      if (timeLeft <= 0) this.handleTransactionTimeout(transactionId);
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
          showNotification(`Số tiền không khớp: Client ${this.formatCurrency(clientAmount)} != Server ${this.formatCurrency(serverAmount)}`, 'error');
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
      showNotification('Không tìm thấy đơn hàng tạm thời!', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!', 'error');
      this.resetPopup();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}?action=saveOrder&token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingOrder),
      });
      const data = await response.json();

      if (data.orderId) {
        const updateResponse = await fetch(`${API_BASE}?action=updateOrderStatus&token=${token}&orderId=${data.orderId}&status=success`);
        const updateData = await updateResponse.json();

        if (updateData.success) {
          showNotification(`Thanh toán thành công! Đơn hàng ${data.orderId} đã được xác nhận.\nĐiểm: +${updateData.gainedExp}\nTổng: ${updateData.newExp}\nHạng: ${updateData.newRank}`, 'success', 5000);
          updateUserInfo(data.name, updateData.newExp, updateData.newRank);
          cart = [];
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
        } else {
          showNotification('Lỗi cập nhật trạng thái đơn hàng!', 'error');
        }
      } else {
        showNotification(data.message || 'Lỗi lưu đơn hàng!', 'error');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      showNotification('Lỗi lưu đơn hàng. Vui lòng thử lại!', 'error');
    } finally {
      this.cleanupTransaction(transactionId, transaction);
    }
  },
  handleTransactionTimeout(transactionId) {
    const transaction = this.state.activeTransactions.get(transactionId);
    if (!transaction) return;

    this.cleanupTransaction(transactionId, transaction);
    showNotification('Giao dịch hết hạn! Đơn hàng không được lưu.', 'error');
    pendingOrder = null;
  },
  cleanupTransaction(transactionId, transaction) {
    clearInterval(transaction.countdownTimer);
    clearInterval(transaction.checkInterval);
    this.state.activeTransactions.delete(transactionId);
    delete this.state.transactionDetails[transaction.orderId];
    localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));
    this.resetPopup();
  },
  resetPopup() {
    this.elements.qrPopup.style.display = 'none';
  },
  restoreTransactions() {
    const transactions = this.state.transactionDetails;
    for (const orderId in transactions) {
      const { transactionId, amount, startTime, endTime } = transactions[orderId];
      const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

      if (timeLeft <= 0) {
        delete this.state.transactionDetails[orderId];
        localStorage.setItem('transactionDetails', JSON.stringify(this.state.transactionDetails));
        continue;
      }

      if (pendingOrder && pendingOrder.orderId === orderId) {
        this.elements.qrAmount.textContent = `Số tiền: ${this.formatCurrency(amount)}`;
        const transaction = { amount: Number(amount), startTime, endTime, countdownTimer: null, checkInterval: null, orderId };
        const updateCountdown = () => {
          const timeLeft = Math.max(0, Math.floor((transaction.endTime - Date.now()) / 1000));
          this.elements.countdown.textContent = this.formatTime(timeLeft);
          if (timeLeft <= 0) this.handleTransactionTimeout(transactionId);
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
              showNotification(`Số tiền không khớp: Client ${this.formatCurrency(clientAmount)} != Server ${this.formatCurrency(serverAmount)}`, 'error');
              this.handleTransactionTimeout(transactionId);
            }
          }
        }, 5000);

        this.state.activeTransactions.set(transactionId, transaction);
        this.elements.downloadBtn.onclick = () => this.downloadQRCode();
      }
    }
  },
};

// Utility Functions
function createNotificationElement() {
  const notification = document.createElement('div');
  notification.className = 'notification';
  document.body.appendChild(notification);
  return notification;
}

function showNotification(message, type = 'success', duration = 3000) {
  elements.notification.className = `notification ${type} show`;
  elements.notification.innerText = message;
  elements.notification.style.display = 'block';
  setTimeout(() => {
    elements.notification.classList.remove('show');
    setTimeout(() => (elements.notification.style.display = 'none'), 500);
  }, duration);
}

async function getCoordinates(address) {
  try {
    const response = await fetch(`${GEOCODE_BASE}/${encodeURIComponent(address)}.json?country=vn&access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();
    if (data.features?.length) {
      const feature = data.features[0];
      return { lat: feature.center[1], lon: feature.center[0], display_name: feature.place_name };
    }
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    showNotification('Lỗi tìm kiếm địa chỉ. Vui lòng thử lại!', 'error');
    return null;
  }
}

async function getAddressFromCoords(lng, lat) {
  try {
    const response = await fetch(`${GEOCODE_BASE}/${lng},${lat}.json?country=vn&access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();
    return data.features?.length ? data.features[0].place_name : 'Không tìm thấy địa chỉ';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Không tìm thấy địa chỉ';
  }
}

async function calculateDistance(deliveryCoords) {
  if (!deliveryCoords) {
    showNotification('Vui lòng chọn địa chỉ giao hàng!', 'error');
    elements.distanceInfo.innerHTML = '';
    elements.confirmDeliveryBtn.disabled = true;
    return;
  }

  try {
    const coordinates = `${STORE_COORDS.lng}%2C${STORE_COORDS.lat}%3B${deliveryCoords.lon}%2C${deliveryCoords.lat}`;
    const response = await fetch(`${DIRECTIONS_BASE}${coordinates}?alternatives=false&geometries=geojson&overview=simplified&steps=false&access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes.length) {
      const distance = (data.routes[0].distance / 1000).toFixed(1);
      const duration = Math.round(data.routes[0].duration / 60);
      elements.distanceInfo.innerHTML = `Khoảng cách: ${distance} km | Thời gian: ${duration} phút`;
      elements.confirmDeliveryBtn.disabled = false;
      pendingOrder.deliveryAddress = deliveryCoords.display_name;
      pendingOrder.distance = `${distance} km`;
      pendingOrder.duration = `${duration} phút`;
    } else {
      elements.distanceInfo.innerHTML = 'Không thể tính khoảng cách. Vui lòng chọn địa chỉ khác!';
      elements.confirmDeliveryBtn.disabled = true;
    }
  } catch (error) {
    console.error('Error calculating distance:', error);
    showNotification('Lỗi tính khoảng cách. Vui lòng thử lại!', 'error');
    elements.distanceInfo.innerHTML = '';
    elements.confirmDeliveryBtn.disabled = true;
  }
}

function initMap() {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [STORE_COORDS.lng, STORE_COORDS.lat],
    zoom: 14,
  });

  new mapboxgl.Marker({ color: '#FF0000' })
    .setLngLat([STORE_COORDS.lng, STORE_COORDS.lat])
    .setPopup(new mapboxgl.Popup().setText('Cửa hàng TocoToco'))
    .addTo(map);

  map.on('click', async (e) => {
    const { lng, lat } = e.lngLat;
    selectedCoords = { lon: lng, lat };
    if (marker) marker.remove();
    marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

    const address = await getAddressFromCoords(lng, lat);
    selectedCoords.display_name = address;
    elements.deliveryAddressDisplay.innerHTML = `Địa chỉ: ${address}`;
    elements.mapSearch.value = address;
    await calculateDistance(selectedCoords);
  });

  elements.mapSearch.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 3) return;

    const coords = await getCoordinates(query);
    if (coords) {
      selectedCoords = coords;
      map.flyTo({ center: [coords.lon, coords.lat], zoom: 14 });
      if (marker) marker.remove();
      marker = new mapboxgl.Marker().setLngLat([coords.lon, coords.lat]).addTo(map);
      elements.deliveryAddressDisplay.innerHTML = `Địa chỉ: ${coords.display_name}`;
      await calculateDistance(selectedCoords);
    }
  });

  $("#map-search").autocomplete({
    source: async (request, response) => {
      try {
        const res = await fetch(`${GEOCODE_BASE}/${encodeURIComponent(request.term)}.json?country=vn&autocomplete=true&access_token=${MAPBOX_TOKEN}`);
        const data = await res.json();
        response(data.features.map(feature => ({ label: feature.place_name, value: feature.place_name })));
      } catch (error) {
        console.error('Error fetching autocomplete:', error);
        response([]);
      }
    },
    minLength: 3,
    appendTo: '.delivery-content',
    select: async (event, ui) => {
      const coords = await getCoordinates(ui.item.value);
      if (coords) {
        selectedCoords = coords;
        map.flyTo({ center: [coords.lon, coords.lat], zoom: 14 });
        if (marker) marker.remove();
        marker = new mapboxgl.Marker().setLngLat([coords.lon, coords.lat]).addTo(map);
        elements.deliveryAddressDisplay.innerHTML = `Địa chỉ: ${coords.display_name}`;
        await calculateDistance(selectedCoords);
      }
    },
    open: () => $("#map-search").autocomplete('widget').css({ width: $("#map-search").outerWidth(), 'z-index': 3000 }),
  });
}

function openDeliveryPopup() {
  elements.deliveryPopup.style.display = 'flex';
  elements.mapSearch.value = '';
  elements.deliveryAddressDisplay.innerHTML = '';
  elements.distanceInfo.innerHTML = '';
  elements.confirmDeliveryBtn.disabled = true;
  selectedCoords = null;

  if (!map) {
    initMap();
  } else {
    map.resize();
    map.flyTo({ center: [STORE_COORDS.lng, STORE_COORDS.lat], zoom: 14 });
  }

  if (marker) {
    marker.remove();
    marker = null;
  }
}

function closeDeliveryPopup() {
  elements.deliveryPopup.style.display = 'none';
  pendingOrder.deliveryAddress = null;
  pendingOrder.distance = null;
  pendingOrder.duration = null;
  selectedCoords = null;
}

function csvToJson(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length) continue;
    const obj = {};
    headers.forEach((header, index) => (obj[header] = values[index] || ''));
    if (obj['Tên món']) result.push(obj);
  }
  return result;
}

function preloadImages(imageUrls) {
  const uniqueUrls = [...new Set(imageUrls.filter(url => url && url !== 'https://via.placeholder.com/180'))];
  uniqueUrls.forEach(url => new Image().src = url);
}

async function loadMenu() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Không thể tải dữ liệu từ Google Sheets');
    const csv = await response.text();
    allData = csvToJson(csv);
    toppings = allData.filter(item => item['Danh mục'] === 'Topping').map(item => ({
      name: item['Tên món'],
      price: Number(item['Giá tiền']) || 0,
    }));

    const imageUrls = allData.map(item => item['URL hình ảnh'] || 'https://via.placeholder.com/180');
    preloadImages(imageUrls);

    const categories = [...new Set(allData.map(item => item['Danh mục']))].filter(cat => cat !== 'Topping');
    categories.forEach(category => {
      const li = document.createElement('li');
      li.textContent = category;
      li.onclick = () => {
        filterProducts(category);
        if (window.innerWidth <= 768) toggleMenu();
      };
      elements.categoryList.appendChild(li);
    });

    filterProducts(categories[0] || 'Trà Sữa');
    elements.categoryList.children[0].classList.add('active');
  } catch (error) {
    console.error('Error loading menu:', error);
    showNotification('Không thể tải menu. Vui lòng kiểm tra kết nối!', 'error');
  }
}

function filterProducts(category) {
  elements.productList.innerHTML = '';
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
    elements.productList.appendChild(productDiv);
  });

  const categoryItems = elements.categoryList.querySelectorAll('li');
  categoryItems.forEach(item => item.classList.remove('active'));
  const selectedCategory = Array.from(categoryItems).find(item => item.textContent === category);
  if (selectedCategory) selectedCategory.classList.add('active');
}

function openZoomPopup(imageUrl, name, price) {
  elements.zoomImage.src = imageUrl;
  elements.zoomProductName.textContent = name;
  elements.zoomProductPrice.textContent = `${price.toLocaleString('vi-VN')} VNĐ`;
  elements.zoomPopup.style.display = 'flex';
}

function closeZoomPopup() {
  elements.zoomPopup.style.display = 'none';
}

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
    note: '',
  };

  elements.popupProductName.textContent = name;
  elements.popupTitle.textContent = existingItem ? 'Chỉnh sửa sản phẩm' : 'Chọn tùy chọn';
  elements.popupActionBtn.textContent = existingItem ? 'Cập nhật' : 'Thêm vào giỏ';
  elements.popupActionBtn.onclick = existingItem ? updateCartItem : addToCart;

  const isSimpleCategory = category === 'Món thêm' || category === 'Kem';
  document.getElementById('size-section').style.display = isSimpleCategory ? 'none' : 'flex';
  document.getElementById('topping-section').style.display = isSimpleCategory ? 'none' : 'flex';
  document.getElementById('sugar-section').style.display = isSimpleCategory ? 'none' : 'flex';
  document.getElementById('ice-section').style.display = isSimpleCategory ? 'none' : 'flex';

  if (!isSimpleCategory) {
    elements.sizeOptions.innerHTML = '';
    const sizes = sizeOptions.split(',').map(size => size.trim()).filter(size => size);
    const defaultSize = sizes.includes('M') ? 'M' : (sizes.includes('XL') ? 'XL' : sizes[0] || '');
    sizes.forEach(size => {
      const label = document.createElement('label');
      const isChecked = (existingItem && existingItem.size === size) || (!existingItem && size === defaultSize);
      label.innerHTML = `<input type="radio" name="size" value="${size}" ${isChecked ? 'checked' : ''}> ${size}`;
      elements.sizeOptions.appendChild(label);
    });

    elements.toppingOptions.innerHTML = '';
    toppings.forEach(topping => {
      const label = document.createElement('label');
      const isChecked = existingItem && existingItem.toppings.some(t => t.name === topping.name);
      label.innerHTML = `<input type="checkbox" name="topping" value="${topping.name}" data-price="${topping.price}" ${isChecked ? 'checked' : ''}> ${topping.name} (+${topping.price.toLocaleString('vi-VN')} VNĐ)`;
      elements.toppingOptions.appendChild(label);
    });

    elements.sugarOptions.innerHTML = '';
    const sugars = sugarOptions.split(',').map(sugar => sugar.trim()).filter(sugar => sugar);
    const defaultSugar = sugars.includes('100%') ? '100%' : sugars[0] || '';
    sugars.forEach(sugar => {
      const label = document.createElement('label');
      const isChecked = (existingItem && existingItem.sugar === sugar) || (!existingItem && sugar === defaultSugar);
      label.innerHTML = `<input type="radio" name="sugar" value="${sugar}" ${isChecked ? 'checked' : ''}> ${sugar}`;
      elements.sugarOptions.appendChild(label);
    });

    elements.iceOptions.innerHTML = '';
    const ices = iceOptions.split(',').map(ice => ice.trim()).filter(ice => ice);
    const defaultIce = ices.includes('Thường') ? 'Thường' : ices[0] || '';
    ices.forEach(ice => {
      const label = document.createElement('label');
      const isChecked = (existingItem && existingItem.ice === ice) || (!existingItem && ice === defaultIce);
      label.innerHTML = `<input type="radio" name="ice" value="${ice}" ${isChecked ? 'checked' : ''}> ${ice}`;
      elements.iceOptions.appendChild(label);
    });
  }

  elements.quantityInput.value = existingItem ? existingItem.quantity : 1;
  elements.noteInput.value = existingItem ? existingItem.note : '';
  if (groupKey) closeCart();
  elements.popup.style.display = 'flex';
}

function closePopup() {
  elements.popup.style.display = 'none';
  editingGroupKey = null;
}

function addToCart() {
  const quantity = Number(elements.quantityInput.value);
  const note = elements.noteInput.value;
  const isSimpleCategory = currentProduct.category === 'Món thêm' || currentProduct.category === 'Kem';

  if (quantity < 1) {
    showNotification('Số lượng phải lớn hơn 0!', 'error');
    return;
  }

  if (!isSimpleCategory) {
    const size = document.querySelector('input[name="size"]:checked');
    const selectedToppings = document.querySelectorAll('input[name="topping"]:checked');
    const sugar = document.querySelector('input[name="sugar"]:checked');
    const ice = document.querySelector('input[name="ice"]:checked');

    if (!size) return showNotification('Vui lòng chọn size!', 'error');
    if (!sugar) return showNotification('Vui lòng chọn mức đường!', 'error');
    if (!ice) return showNotification('Vui lòng chọn mức đá!', 'error');

    currentProduct.size = size.value;
    currentProduct.toppings = Array.from(selectedToppings).map(topping => ({
      name: topping.value,
      price: Number(topping.dataset.price),
    }));
    currentProduct.sugar = sugar.value;
    currentProduct.ice = ice.value;
    currentProduct.toppingPrice = currentProduct.toppings.reduce((sum, t) => sum + t.price, 0);
    if (currentProduct.size === 'L') currentProduct.price += 5000;
  } else {
    currentProduct.size = 'N/A';
    currentProduct.toppings = [];
    currentProduct.sugar = 'N/A';
    currentProduct.ice = 'N/A';
    currentProduct.toppingPrice = 0;
  }

  currentProduct.quantity = quantity;
  currentProduct.note = note;
  cart.push({ ...currentProduct });
  updateCartCount();
  closePopup();
  showNotification('Đã thêm vào giỏ hàng!', 'success');
}

function updateCartCount() {
  elements.cartCount.textContent = cart.length;
  localStorage.setItem('cart', JSON.stringify(cart));
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
        key,
        category: item.category,
      };
    }
    groupedCart[key].items.push({ ...item, originalIndex: index });
    groupedCart[key].totalPrice += (item.price + item.toppingPrice) * item.quantity;
    groupedCart[key].totalQuantity += item.quantity;
  });
  return Object.values(groupedCart);
}

function showCartTab() {
  elements.cartTab.style.display = 'block';
  elements.historyTab.style.display = 'none';
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.tab-button[onclick="showCartTab()"]').classList.add('active');
  viewCart();
}

function showHistoryTab() {
  elements.cartTab.style.display = 'none';
  elements.historyTab.style.display = 'block';
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.tab-button[onclick="showHistoryTab()"]').classList.add('active');
  viewOrderHistory();
}

function viewCart() {
  elements.cartItems.innerHTML = '';
  if (cart.length === 0) {
    elements.cartItems.innerHTML = '<li>Giỏ hàng trống</li>';
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
          li.appendChild(createDetailRow('Size:', item.size));
          li.appendChild(createDetailRow('Topping:', toppingNames, true));
          li.appendChild(createDetailRow('Mức đường:', item.sugar));
          li.appendChild(createDetailRow('Mức đá:', item.ice));
        }
        li.appendChild(createDetailRow('Số lượng:', item.quantity));
        li.appendChild(createDetailRow('Ghi chú:', item.note || 'Không có', true));
        li.appendChild(createDetailRow('Giá tiền:', ((item.price + item.toppingPrice) * item.quantity).toLocaleString('vi-VN') + ' VNĐ'));
      });

      elements.cartItems.appendChild(li);
    });

    if (pendingOrder && transactionTracker.state.transactionDetails[pendingOrder.orderId]) {
      const { transactionId, amount } = transactionTracker.state.transactionDetails[pendingOrder.orderId];
      const continueBtn = document.createElement('button');
      continueBtn.id = 'continue-transaction';
      continueBtn.textContent = 'Tiếp tục giao dịch';
      continueBtn.onclick = () => {
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
      elements.cartItems.appendChild(continueBtn);
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price + item.toppingPrice) * item.quantity, 0);
  elements.cartTotal.textContent = `Tổng cộng: ${total.toLocaleString('vi-VN')} VNĐ`;
  elements.cartPopup.style.display = 'flex';

  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
}

function createDetailRow(labelText, value, vertical = false) {
  const row = document.createElement('div');
  row.className = `detail-row${vertical ? ' vertical' : ''}`;
  row.innerHTML = `<label>${labelText}</label><span>${value}</span>`;
  return row;
}

function updateCartItem() {
  const quantity = Number(elements.quantityInput.value);
  const note = elements.noteInput.value;
  const isSimpleCategory = currentProduct.category === 'Món thêm' || currentProduct.category === 'Kem';

  if (quantity < 1) {
    showNotification('Số lượng phải lớn hơn 0!', 'error');
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

    if (!size) return showNotification('Vui lòng chọn size!', 'error');
    if (!sugar) return showNotification('Vui lòng chọn mức đường!', 'error');
    if (!ice) return showNotification('Vui lòng chọn mức đá!', 'error');

    currentProduct.size = size.value;
    currentProduct.toppings = Array.from(selectedToppings).map(topping => ({
      name: topping.value,
      price: Number(topping.dataset.price),
    }));
    currentProduct.sugar = sugar.value;
    currentProduct.ice = ice.value;
    currentProduct.toppingPrice = currentProduct.toppings.reduce((sum, t) => sum + t.price, 0);
    if (currentProduct.size === 'L') currentProduct.price += 5000;
  } else {
    currentProduct.size = 'N/A';
    currentProduct.toppings = [];
    currentProduct.sugar = 'N/A';
    currentProduct.ice = 'N/A';
    currentProduct.toppingPrice = 0;
  }

  currentProduct.quantity = quantity;
  currentProduct.note = note;
  cart.push({ ...currentProduct });
  updateCartCount();
  closePopup();
  viewCart();
  showNotification('Đã cập nhật sản phẩm trong giỏ hàng!', 'success');
}

function closeCart() {
  elements.cartPopup.style.display = 'none';
}

function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('active');
}

async function placeOrder() {
  if (cart.length === 0) {
    showNotification('Giỏ hàng trống. Vui lòng thêm sản phẩm!', 'error');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Vui lòng đăng nhập trước khi đặt hàng!', 'error');
    showLoginPopup(false);
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price + item.toppingPrice) * item.quantity, 0);
  pendingOrder = {
    cart: [...cart],
    status: 'pending',
    total,
    orderId: `TEMP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    deliveryAddress: null,
    distance: null,
    duration: null,
  };

  openDeliveryPopup();
  closeCart();
}

function confirmDelivery() {
  if (!pendingOrder.deliveryAddress) {
    showNotification('Vui lòng chọn địa chỉ giao hàng hợp lệ!', 'error');
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
    transactionTracker.cleanupTransaction(transactionId, transaction);
    showNotification('Đã hủy giao dịch!', 'error');
  }
}

async function viewOrderHistory() {
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Vui lòng đăng nhập để xem lịch sử đơn hàng!', 'error');
    showLoginPopup(false);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}?action=getOrders&token=${token}`);
    const data = await response.json();

    elements.historyItems.innerHTML = '';
    if (!data.orders || data.orders.length === 0) {
      elements.historyItems.innerHTML = '<li>Chưa có đơn hàng nào</li>';
      return;
    }

    data.orders.forEach(order => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>Đơn hàng #${order.orderId}</div>
        <div class="detail-row"><label>Trạng thái:</label><span>${order.status}</span></div>
        <div class="detail-row"><label>Tổng tiền:</label><span>${order.total.toLocaleString('vi-VN')} VNĐ</span></div>
        <button onclick="showOrderDetails('${order.orderId}')">Xem chi tiết</button>
      `;
      elements.historyItems.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    showNotification('Lỗi tải lịch sử đơn hàng. Vui lòng thử lại!', 'error');
  }
}

async function showOrderDetails(orderId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}?action=getOrderDetails&token=${token}&orderId=${orderId}`);
    const data = await response.json();

    if (data.order) {
      const order = data.order;
      elements.orderDetailsContent.innerHTML = `
        <div class="detail-row"><label>Đơn hàng #:</label><span>${order.orderId}</span></div>
        <div class="detail-row"><label>Trạng thái:</label><span>${order.status}</span></div>
        <div class="detail-row"><label>Tổng tiền:</label><span>${order.total.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><label>Địa chỉ:</label><span>${order.deliveryAddress || 'Không có'}</span></div>
        <div class="detail-row"><label>Khoảng cách:</label><span>${order.distance || 'Không có'}</span></div>
        <div class="detail-row"><label>Thời gian giao:</label><span>${order.duration || 'Không có'}</span></div>
        <h4>Sản phẩm:</h4>
      `;

      order.cart.forEach((item, index) => {
        const isSimpleCategory = item.category === 'Món thêm' || item.category === 'Kem';
        const itemDetails = document.createElement('div');
        itemDetails.innerHTML = `
          <div class="detail-row"><label>${index + 1}. ${item.name}</label></div>
          ${!isSimpleCategory ? `
            <div class="detail-row"><label>Size:</label><span>${item.size}</span></div>
            <div class="detail-row vertical"><label>Topping:</label><span>${item.toppings.map(t => t.name).join(', ') || 'Không'}</span></div>
            <div class="detail-row"><label>Mức đường:</label><span>${item.sugar}</span></div>
            <div class="detail-row"><label>Mức đá:</label><span>${item.ice}</span></div>
          ` : ''}
          <div class="detail-row"><label>Số lượng:</label><span>${item.quantity}</span></div>
          <div class="detail-row vertical"><label>Ghi chú:</label><span>${item.note || 'Không có'}</span></div>
          <div class="detail-row"><label>Giá tiền:</label><span>${((item.price + item.toppingPrice) * item.quantity).toLocaleString('vi-VN')} VNĐ</span></div>
        `;
        elements.orderDetailsContent.appendChild(itemDetails);
      });

      elements.orderDetailsPopup.style.display = 'flex';
    } else {
      showNotification('Không tìm thấy chi tiết đơn hàng!', 'error');
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
    showNotification('Lỗi tải chi tiết đơn hàng. Vui lòng thử lại!', 'error');
  }
}

function closeOrderDetailsPopup() {
  elements.orderDetailsPopup.style.display = 'none';
}

function showLoginPopup(registerMode) {
  isRegisterMode = registerMode;
  elements.authTitle.textContent = registerMode ? 'Đăng ký' : 'Đăng nhập';
  elements.userNameInput.style.display = registerMode ? 'block' : 'none';
  elements.authPopup.style.display = 'flex';
}

function hidePopup(event) {
  if (event.target === elements.authPopup) {
    elements.authPopup.style.display = 'none';
  }
}

async function submitAuth() {
  const nameInput = document.getElementById("user-name");
  const emailInput = document.getElementById("user-email");
  const passwordInput = document.getElementById("user-password");
  const submitButton = document.querySelector('#auth-popup button');

  // Lấy giá trị đầu vào
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Xác định chế độ đăng ký/đăng nhập
  const isRegisterMode = document.getElementById('auth-title').innerText === 'Đăng ký';

  // Kiểm tra đầu vào
  if (!email || !password || (isRegisterMode && !name)) {
    showNotification("Vui lòng điền đầy đủ thông tin!", "error");
    return;
  }

  // Kiểm tra định dạng email hoặc số điện thoại
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!emailRegex.test(email) && !phoneRegex.test(email)) {
    showNotification("Email hoặc số điện thoại không hợp lệ!", "error");
    return;
  }

  // Kiểm tra độ dài mật khẩu
  if (password.length < 6) {
    showNotification("Mật khẩu phải có ít nhất 6 ký tự!", "error");
    return;
  }

  // Vô hiệu hóa nút trong khi xử lý
  submitButton.disabled = true;
  submitButton.innerText = 'Đang xử lý...';

  try {
    const action = isRegisterMode ? "registerUser" : "loginUser";
    const body = isRegisterMode
      ? { name, email, password }
      : { email, password };

    const response = await fetch(`${API_BASE}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // Kiểm tra trạng thái HTTP
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('auth-popup').style.display = 'none';
      showNotification(
        isRegisterMode ? "Đăng ký thành công!" : "Đăng nhập thành công!",
        "success"
      );
      await checkUserSession();
    } else {
      showNotification(
        data.message ||
          (isRegisterMode ? "Đăng ký thất bại!" : "Đăng nhập thất bại!"),
        "error"
      );
    }
  } catch (error) {
    console.error('Lỗi:', error);
    let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại!";
    if (error.message.includes('HTTP error')) {
      errorMessage = "Lỗi server, vui lòng thử lại sau!";
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = "Lỗi kết nối mạng, vui lòng kiểm tra kết nối!";
    }
    showNotification(errorMessage, "error");
  } finally {
    // Khôi phục trạng thái nút
    submitButton.disabled = false;
    submitButton.innerText = 'Tiếp tục';
  }
}
function updateUserInfo(name, exp, rank) {
  elements.userInfo.style.display = 'flex';
  elements.userNameDisplay.textContent = name || 'Khách';
  elements.userPoints.textContent = `${exp || 0} Points`;

  const rankClass = rank === 'diamond' ? 'rank-diamond' : rank === 'gold' ? 'rank-gold' : rank === 'silver' ? 'rank-silver' : 'rank-bronze';
  elements.rankIcon.className = `rank-icon ${rankClass}`;
  elements.rankIcon.setAttribute('aria-label', `Hạng ${rank || 'bronze'}`);

  const expPercentage = Math.min((exp || 0) / 1000 * 100, 100);
  elements.expFill.style.width = `${expPercentage}%`;

  elements.loginButton.style.display = 'none';
  elements.registerButton.style.display = 'none';
  elements.logoutButton.style.display = 'block';
}

function logout() {
  localStorage.removeItem('token');
  elements.userInfo.style.display = 'none';
  elements.loginButton.style.display = 'block';
  elements.registerButton.style.display = 'block';
  elements.logoutButton.style.display = 'none';
  cart = [];
  updateCartCount();
  showNotification('Đã đăng xuất!', 'success');
}
async function checkUserSession() {
  const token = localStorage.getItem("token");
  const userInfoDiv = document.getElementById('user-info');
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const logoutButton = document.getElementById("logout-button");

  // Nếu không có token, đặt lại giao diện và thoát
  if (!token) {
    userInfoDiv.style.display = "none";
    loginButton.style.display = "block";
    registerButton.style.display = "block";
    logoutButton.style.display = "none";
    return;
  }

  try {
    const response = await fetch(`${apiBase}?action=User&token=${token}`);

    // Kiểm tra trạng thái HTTP
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.name) {
      // Cập nhật thông tin người dùng nếu thành công
      updateUserInfo(data.name, data.exp || 0, data.rank || 'Bronze');
    } else {
      throw new Error('Invalid session');
    }
  } catch (error) {
    console.error("Lỗi kiểm tra phiên:", error);
    // Xóa token và đặt lại giao diện
    localStorage.removeItem("token");
    userInfoDiv.style.display = "none";
    loginButton.style.display = "block";
    registerButton.style.display = "block";
    logoutButton.style.display = "none";

    // Phân loại lỗi và hiển thị thông báo phù hợp
    let errorMessage = "Phiên đăng nhập không hợp lệ!";
    if (error.message.includes('HTTP error')) {
      if (error.message.includes('401')) {
        errorMessage = "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!";
      } else {
        errorMessage = "Lỗi server, vui lòng thử lại sau!";
      }
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = "Lỗi kết nối mạng, vui lòng kiểm tra kết nối!";
    }
    showNotification(errorMessage, "error");
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  loadMenu();
  transactionTracker.restoreTransactions();
});
