# 🚀 Hướng Dẫn Triển Khai - ZewK HRM System

## 📋 Yêu Cầu Hệ Thống

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **Node.js**: v16.x hoặc cao hơn
- **npm**: v8.x hoặc cao hơn
- **SQLite**: v3.x
- **RAM**: Tối thiểu 2GB
- **Storage**: Tối thiểu 10GB
- **Port**: 3000 (hoặc tùy chỉnh)

### Client Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android 8+
- **Internet**: Tối thiểu 2Mbps

---

## 📦 Cài Đặt Development

### 1. Clone Repository
```bash
git clone https://github.com/ZewK3/Home.git
cd Home
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Cấu Hình Database
```bash
# Tạo database từ schema
sqlite3 data/hrm_system.db < data/Tabbel-v2-optimized.sql

# Kiểm tra database đã tạo
sqlite3 data/hrm_system.db "SELECT COUNT(*) FROM employees;"
```

### 4. Cấu Hình Environment Variables
Tạo file `.env` trong thư mục gốc:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Database
DB_PATH=./data/hrm_system.db

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@your-domain.com

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_SECRET=your_super_secret_session_key_change_in_production
SESSION_MAX_AGE=86400000
```

### 5. Start Development Server
```bash
# Chạy server
npm start

# Hoặc với nodemon (auto-reload)
npm run dev
```

Mở browser: `http://localhost:3000`

---

## 🌐 Triển Khai Production

### Option 1: Traditional Server (Ubuntu/CentOS)

#### 1.1. Chuẩn Bị Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install nginx (Web Server)
sudo apt install -y nginx

# Install certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 1.2. Upload Code
```bash
# Clone vào server
cd /var/www
sudo git clone https://github.com/ZewK3/Home.git hrm-system
cd hrm-system

# Install dependencies (production only)
npm install --production

# Tạo database
sqlite3 data/hrm_system.db < data/Tabbel-v2-optimized.sql
```

#### 1.3. Cấu Hình Production Environment
```bash
# Tạo .env file
sudo nano .env
```

Nội dung `.env` cho production:
```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECURE_STRING_MIN_32_CHARS
DB_PATH=./data/hrm_system.db
SENDGRID_API_KEY=your_actual_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=CHANGE_THIS_TO_RANDOM_SECURE_STRING_MIN_32_CHARS
SESSION_MAX_AGE=86400000
```

#### 1.4. Start with PM2
```bash
# Start application
pm2 start api/worker-service.js --name hrm-system

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs hrm-system
```

#### 1.5. Configure Nginx
```bash
# Tạo nginx config
sudo nano /etc/nginx/sites-available/hrm-system
```

Nội dung config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory
    root /var/www/hrm-system;
    index index.html;

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/hrm-system_access.log;
    error_log /var/log/nginx/hrm-system_error.log;
}
```

Enable site và reload nginx:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hrm-system /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 1.6. Setup SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### 1.7. Setup Firewall
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

### Option 2: Docker Deployment

#### 2.1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "api/worker-service.js"]
```

#### 2.2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  hrm-system:
    build: .
    container_name: hrm-system
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    networks:
      - hrm-network

  nginx:
    image: nginx:alpine
    container_name: hrm-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./pages:/usr/share/nginx/html:ro
      - ./assets:/usr/share/nginx/html/assets:ro
    depends_on:
      - hrm-system
    networks:
      - hrm-network

networks:
  hrm-network:
    driver: bridge

volumes:
  hrm-data:
```

#### 2.3. Deploy with Docker
```bash
# Build và start containers
docker-compose up -d

# Check logs
docker-compose logs -f hrm-system

# Stop containers
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## 🔒 Bảo Mật Production

### 1. Change Default Secrets
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Permissions
```bash
# Chỉ cho phép Node.js process đọc/ghi database
sudo chown -R www-data:www-data /var/www/hrm-system/data
sudo chmod 600 /var/www/hrm-system/data/hrm_system.db
```

### 3. Setup Backups
```bash
# Tạo backup script
sudo nano /opt/hrm-backup.sh
```

Nội dung script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/hrm-system"
DB_PATH="/var/www/hrm-system/data/hrm_system.db"

mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_PATH ".backup $BACKUP_DIR/hrm_db_$DATE.db"

# Compress
gzip $BACKUP_DIR/hrm_db_$DATE.db

# Delete old backups (keep 30 days)
find $BACKUP_DIR -name "hrm_db_*.db.gz" -mtime +30 -delete

echo "Backup completed: hrm_db_$DATE.db.gz"
```

Cron job (chạy mỗi ngày lúc 2AM):
```bash
sudo chmod +x /opt/hrm-backup.sh
sudo crontab -e
# Add line:
0 2 * * * /opt/hrm-backup.sh >> /var/log/hrm-backup.log 2>&1
```

### 4. Setup Monitoring
```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 📊 Performance Optimization

### 1. Enable Gzip Compression (Nginx)
Already included in nginx config above.

### 2. Setup Caching
```bash
# Add to nginx server block
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. PM2 Cluster Mode
```bash
# Start với cluster mode (sử dụng tất cả CPU cores)
pm2 start api/worker-service.js -i max --name hrm-system
```

---

## 🔍 Monitoring & Logs

### View Logs
```bash
# PM2 logs
pm2 logs hrm-system

# Nginx logs
sudo tail -f /var/log/nginx/hrm-system_access.log
sudo tail -f /var/log/nginx/hrm-system_error.log

# System logs
sudo journalctl -u nginx -f
```

### Monitoring Dashboard
```bash
# PM2 web monitoring
pm2 web

# Access at: http://your-server-ip:9615
```

---

## 🆘 Troubleshooting

### Server không start
```bash
# Check PM2 logs
pm2 logs hrm-system --lines 100

# Check port conflict
sudo lsof -i :3000

# Restart PM2
pm2 restart hrm-system
```

### Database errors
```bash
# Check database file permissions
ls -la /var/www/hrm-system/data/

# Verify database integrity
sqlite3 data/hrm_system.db "PRAGMA integrity_check;"
```

### Nginx 502 Bad Gateway
```bash
# Check if Node.js is running
pm2 status

# Check nginx error log
sudo tail -f /var/log/nginx/hrm-system_error.log

# Restart nginx
sudo systemctl restart nginx
```

---

## 📱 Mobile App Deployment (PWA)

Hệ thống đã hỗ trợ PWA. Để enable:

1. Đảm bảo HTTPS đã được cấu hình
2. Service worker sẽ tự động đăng ký
3. Users có thể "Add to Home Screen" trên mobile

---

## 🔄 Update & Maintenance

### Update Code
```bash
cd /var/www/hrm-system
sudo git pull origin main
npm install --production
pm2 restart hrm-system
```

### Database Migration
```bash
# Backup trước khi migrate
sqlite3 data/hrm_system.db ".backup data/hrm_system_backup.db"

# Chạy migration SQL
sqlite3 data/hrm_system.db < migrations/migration_v2.sql
```

### Maintenance Mode
```javascript
// Trong assets/js/config.js
CONFIG.MAINTENANCE_MODE = true;  // Enable
CONFIG.MAINTENANCE_MODE = false; // Disable
```

---

© 2024 ZewK Management System. All rights reserved.
