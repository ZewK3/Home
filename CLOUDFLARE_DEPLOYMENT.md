# Cloudflare Pages Deployment Guide

This project is configured for deployment on Cloudflare Pages with the following setup:

## Build Configuration

- **Build Command**: `npm run build:cloudflare`
- **Output Directory**: `dist`
- **Node.js Version**: 20

## Deployment Steps

### 1. Connect Repository to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to `Pages` section
3. Click "Create a project"
4. Connect your GitHub repository `ZewK3/Home`
5. Configure build settings:
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `dist`
   - **Node.js version**: `20`

### 2. Environment Variables

If your application requires environment variables, add them in the Cloudflare Pages settings:
- Go to your project in Cloudflare Pages
- Navigate to Settings > Environment variables
- Add any required variables

### 3. Custom Domain (Optional)

To use a custom domain:
1. Go to your project settings
2. Navigate to "Custom domains"
3. Add your domain and follow the DNS configuration steps

## Features Configured

### ✅ Single Page Application (SPA) Routing
- `_redirects` file ensures all routes redirect to `index.html`
- React Router handles client-side routing

### ✅ Security Headers
- `_headers` file includes security and performance headers:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin

### ✅ Performance Optimization
- Static assets cached for 1 year
- HTML files cached for 1 hour
- Optimized Vite build with asset hashing

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:cloudflare

# Preview production build
npm run preview
```

## Deployment URL

Once deployed, your application will be available at:
- `https://your-project-name.pages.dev`
- Or your custom domain if configured

## Migration from GitHub Pages

This project was migrated from GitHub Pages with the following changes:
- Updated `vite.config.js` base path from `/Home/` to `/`
- Updated React Router basename from `/Home` to `/`
- Added `_redirects` file for Cloudflare Pages SPA routing
- Added `_headers` file for security and performance
- Removed GitHub Actions workflow (backed up as `deploy-github.yml.backup`)
- Removed `gh-pages` dependency