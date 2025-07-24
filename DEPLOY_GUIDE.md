# 🚀 Hướng dẫn Deploy HR Management System lên Cloudflare

## 📋 Chuẩn bị

### 1. Yêu cầu hệ thống
- Node.js v16+ đã cài đặt
- Tài khoản Cloudflare (miễn phí)
- Terminal/Command Prompt

### 2. Cài đặt Wrangler CLI
```bash
npm install -g wrangler
```

## 🛠️ Thiết lập dự án

### 1. Xác thực với Cloudflare
```bash
wrangler auth login
```
*Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào Cloudflare*

### 2. Tạo D1 Database
```bash
wrangler d1 create hr-database
```
*Sao chép Database ID từ output và cập nhật vào wrangler.toml*

### 3. Tạo KV Namespace
```bash
# Tạo KV namespace cho production
wrangler kv:namespace create "KV_STORE"

# Tạo KV namespace cho preview
wrangler kv:namespace create "KV_STORE" --preview
```
*Sao chép các ID từ output và cập nhật vào wrangler.toml*

### 4. Cập nhật cấu hình wrangler.toml
Mở file `wrangler.toml` và thay thế:
- `YOUR_D1_DATABASE_ID` với Database ID từ bước 2
- `YOUR_KV_NAMESPACE_ID` với KV namespace ID từ bước 3
- `YOUR_PREVIEW_KV_NAMESPACE_ID` với preview KV namespace ID

### 5. Thiết lập Database Schema
```bash
wrangler d1 execute hr-database --file=./schema.sql
```

### 6. Cài đặt SendGrid API Key (tùy chọn - cho email verification)
```bash
wrangler kv:key put SENDGRID_API_KEY "your-sendgrid-api-key" --binding KV_STORE
```

## 🌐 Deploy lên Cloudflare

### Cách 1: Sử dụng script tự động
```bash
./deploy.sh
```

### Cách 2: Deploy thủ công
```bash
# Cài đặt dependencies
npm install

# Deploy
wrangler deploy
```

## ✅ Kiểm tra deployment

Sau khi deploy thành công, bạn sẽ thấy URL của ứng dụng:
```
https://hr-management-system.your-subdomain.workers.dev/
```

## 🔧 Cấu hình bổ sung

### 1. Tạo tài khoản Admin đầu tiên
Truy cập vào ứng dụng và đăng ký với:
- Email: admin@yourcompany.com
- Position: AD (Administrator)

### 2. Cập nhật Custom Domain (tùy chọn)
```bash
wrangler custom domains add your-domain.com
```

### 3. Thiết lập Environment Variables
```bash
# Thiết lập các biến môi trường cần thiết
wrangler secret put SENDGRID_API_KEY
wrangler secret put ADMIN_EMAIL
```

## 📊 Monitoring và Logs

### Xem logs realtime
```bash
wrangler tail
```

### Xem metrics
```bash
wrangler metrics
```

## 🔒 Bảo mật

### 1. Thiết lập CORS origins
Cập nhật `ALLOWED_ORIGIN` trong worker.js:
```javascript
const ALLOWED_ORIGIN = "https://your-domain.com";
```

### 2. Thiết lập Rate Limiting
Cloudflare tự động cung cấp DDoS protection và rate limiting.

## 🐛 Troubleshooting

### Lỗi Database Connection
```bash
# Kiểm tra D1 database
wrangler d1 info hr-database
```

### Lỗi KV Storage
```bash
# Kiểm tra KV namespace
wrangler kv:namespace list
```

### Lỗi Authentication
```bash
# Kiểm tra authentication status
wrangler whoami
```

## 📱 Các tính năng chính

✅ **Interface chuyên nghiệp**: Corporate glass morphism design  
✅ **Hệ thống phân quyền**: 4 levels (AD, QL, AM, NV)  
✅ **Mobile responsive**: Tối ưu cho mọi thiết bị  
✅ **Dark mode**: Hỗ trợ chế độ tối  
✅ **Email verification**: Xác thực email với SendGrid  
✅ **Registration approval**: Hệ thống duyệt đăng ký  
✅ **Dashboard analytics**: Thống kê và báo cáo  
✅ **Session management**: Quản lý phiên đăng nhập  

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình deploy:
1. Kiểm tra logs: `wrangler tail`
2. Xem documentation: https://developers.cloudflare.com/workers/
3. Kiểm tra GitHub repository để cập nhật mới nhất

---
*Developed with ❤️ for professional HR management*