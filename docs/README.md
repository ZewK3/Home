# Professional HR Management System

A modern, secure, and scalable human resources management system built with professional standards for enterprise use.

## 🚀 Features

### **Authentication & Security**
- **Modern Glassmorphism UI** with Vietnamese cultural integration
- **JWT-based authentication** with refresh tokens
- **Multi-factor authentication** support
- **Email verification** with professional templates
- **Rate limiting** and account lockout protection
- **Device tracking** and session management

### **User Management**
- **Role-based access control** (RBAC) with granular permissions
- **Multi-tenant organization** support
- **Comprehensive user profiles** with personal and employment information
- **Profile picture management** with R2 storage
- **Advanced search and filtering**
- **Bulk operations** and data export

### **Attendance & Leave Management**
- **Digital timesheet** system
- **Leave request workflow** with approval process
- **Overtime tracking** and management
- **Remote work requests**
- **Calendar integration** with schedule management
- **Automated notifications** and reminders

### **Dashboard & Analytics**
- **Real-time dashboard** with live statistics
- **Interactive charts** and data visualization
- **Performance metrics** and KPI tracking
- **Custom reports** generation
- **Data export** in multiple formats
- **Mobile-responsive** design

### **Technical Excellence**
- **Cloudflare Workers** backend for global edge deployment
- **D2 SQL Database** for reliable data storage
- **R2 Object Storage** for files and images
- **Progressive Web App** (PWA) capabilities
- **Offline functionality** with service workers
- **Real-time updates** with WebSocket support

## 🏗️ Architecture

### **Frontend Stack**
- **HTML5** with semantic markup
- **Modern CSS3** with CSS Grid and Flexbox
- **Vanilla JavaScript** (ES6+) for optimal performance
- **Service Workers** for offline functionality
- **Responsive Design** with mobile-first approach

### **Backend Infrastructure**
- **Cloudflare Workers** for serverless compute
- **D2 SQL Database** for structured data
- **R2 Object Storage** for files and media
- **KV Storage** for caching and sessions
- **SendGrid** for email services

### **Security Features**
- **HTTPS** everywhere with automatic SSL
- **Content Security Policy** (CSP) headers
- **CORS** protection
- **SQL injection** prevention
- **XSS protection** with input sanitization
- **Password hashing** with bcrypt
- **JWT tokens** with secure signing

## 📁 Project Structure

```
professional-hr-system/
├── api/
│   └── cloudflare-worker.js          # Main API worker
├── database/
│   └── schema.sql                    # Database schema
├── frontend/
│   ├── auth/
│   │   └── index.html               # Authentication page
│   ├── dashboard/
│   │   └── index.html               # Main dashboard
│   └── assets/
│       ├── css/
│       │   ├── auth.css             # Authentication styles
│       │   └── dashboard.css        # Dashboard styles
│       ├── js/
│       │   ├── auth.js              # Authentication logic
│       │   └── dashboard.js         # Dashboard functionality
│       └── images/                  # Static assets
└── docs/
    └── README.md                    # This file
```

## 🚀 Deployment

### **Cloudflare Workers Setup**

1. **Install Wrangler CLI**
```bash
npm install -g wrangler
```

2. **Authenticate with Cloudflare**
```bash
wrangler auth login
```

3. **Configure wrangler.toml**
```toml
name = "professional-hr-api"
main = "api/cloudflare-worker.js"
compatibility_date = "2024-01-01"

[[d2_databases]]
binding = "DB"
database_name = "hr-management"
database_id = "your-database-id"

[[r2_buckets]]
binding = "R2"
bucket_name = "hr-files"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

[env.production.vars]
JWT_SECRET = "your-jwt-secret"
SENDGRID_API_KEY = "your-sendgrid-key"
FROM_EMAIL = "noreply@yourcompany.com"
FROM_NAME = "HR Management System"
FRONTEND_URL = "https://your-domain.com"
```

4. **Deploy Database Schema**
```bash
wrangler d2 execute hr-management --file=database/schema.sql
```

5. **Deploy Worker**
```bash
wrangler deploy
```

### **Frontend Deployment**

1. **Build and optimize assets**
```bash
# Minify CSS and JavaScript
npm install -g clean-css-cli uglify-js
cleancss -o frontend/assets/css/auth.min.css frontend/assets/css/auth.css
cleancss -o frontend/assets/css/dashboard.min.css frontend/assets/css/dashboard.css
uglifyjs frontend/assets/js/auth.js -o frontend/assets/js/auth.min.js
uglifyjs frontend/assets/js/dashboard.js -o frontend/assets/js/dashboard.min.js
```

2. **Deploy to Cloudflare Pages**
```bash
wrangler pages deploy frontend
```

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes |
| `FROM_EMAIL` | Sender email address | Yes |
| `FROM_NAME` | Sender name for emails | Yes |
| `FRONTEND_URL` | Frontend domain URL | Yes |

### **Database Configuration**

The system uses Cloudflare D2 SQL database with the following tables:
- `organizations` - Multi-tenant organization data
- `users` - User accounts and profiles
- `roles` - Role definitions and permissions
- `user_roles` - User-role assignments
- `user_sessions` - Active user sessions
- `attendance_requests` - Leave and attendance requests
- `file_attachments` - File metadata for R2 storage
- `security_logs` - Audit trail and security events

### **Email Templates**

Professional HTML email templates are included for:
- Email verification
- Password reset
- Welcome messages
- Request notifications
- System alerts

## 🎨 Design System

### **Color Palette**
- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #7C3AED (Purple)
- **Success**: #059669 (Emerald)
- **Warning**: #D97706 (Amber)
- **Error**: #DC2626 (Red)
- **Info**: #0284C7 (Sky)

### **Typography**
- **Font Family**: Segoe UI, system-ui, sans-serif
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Font Sizes**: Responsive scaling with clamp() functions

### **Glassmorphism Effects**
- **Background**: Semi-transparent white overlays
- **Backdrop Filter**: blur(20px) for depth
- **Borders**: Subtle white borders with opacity
- **Shadows**: Multi-layered drop shadows

## 🔐 Security

### **Authentication Flow**
1. User submits credentials
2. Server validates and checks rate limits
3. JWT tokens generated (access + refresh)
4. Tokens stored securely in localStorage
5. API requests include Authorization header
6. Tokens validated on each request

### **Permission System**
- **Hierarchical roles**: AD > Manager > HR > NV
- **Granular permissions**: Specific actions per resource
- **Dynamic UI**: Interface adapts to user permissions
- **API enforcement**: Backend validates all operations

### **Data Protection**
- **Encryption at rest**: Database and file storage
- **Encryption in transit**: HTTPS/TLS everywhere
- **Input validation**: Server-side sanitization
- **Output encoding**: XSS prevention
- **Audit logging**: All actions tracked

## 📱 Mobile Experience

### **Responsive Design**
- **Mobile-first** CSS architecture
- **Touch-friendly** interface elements
- **Optimized performance** for mobile devices
- **Offline capabilities** with service workers

### **Progressive Web App**
- **App manifest** for home screen installation
- **Service worker** for offline functionality
- **Push notifications** for important updates
- **Background sync** for data synchronization

## 🧪 Testing

### **Frontend Testing**
```bash
# Unit tests with Jest
npm test

# E2E tests with Playwright
npx playwright test

# Performance testing
npm run lighthouse
```

### **Backend Testing**
```bash
# Worker testing with Miniflare
npm run test:worker

# Load testing
npm run test:load
```

## 📊 Performance

### **Core Web Vitals**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### **Optimization Techniques**
- **Asset minification** and compression
- **Image optimization** with WebP format
- **Lazy loading** for non-critical resources
- **Edge caching** with Cloudflare CDN
- **Service worker caching** strategies

## 🌍 Internationalization

### **Supported Languages**
- **Vietnamese** (primary)
- **English** (secondary)

### **Implementation**
- Language switching in header
- Stored preference in localStorage
- Dynamic content translation
- Date/time localization

## 🤝 Contributing

### **Development Setup**
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up local environment variables
4. Run development server: `npm run dev`
5. Make changes and test locally
6. Submit pull request

### **Code Standards**
- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **JSDoc** for documentation
- **Semantic versioning** for releases

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- **Email**: support@yourcompany.com
- **Documentation**: https://docs.yourcompany.com
- **Issue Tracker**: GitHub Issues

---

© 2024 Professional HR Management System. All rights reserved.