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
   - **Framework preset**: `None` (or `Vite`)
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty or use root)
   - **Node.js version**: `20`

⚠️ **Important**: Make sure the "Build output directory" is set to `dist` and NOT the root directory. This ensures Cloudflare Pages serves the built files with proper asset references, not the development source files.

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
  - Proper MIME types for JavaScript modules

### ✅ Performance Optimization
- Static assets cached for 1 year
- HTML files cached for 1 hour
- Optimized Vite build with asset hashing
- Proper Content-Type headers for JS modules

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

## Troubleshooting

### MIME Type Error: "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of text/jsx"

This error typically occurs when Cloudflare Pages is serving the development source files instead of the built files. To fix this:

1. **Check Build Output Directory**: Ensure the "Build output directory" in Cloudflare Pages settings is set to `dist`, not `/` or empty.

2. **Verify Build Command**: Make sure the build command is `npm run build:cloudflare` which includes copying the `_headers` file.

3. **Check Deployment Logs**: In Cloudflare Pages dashboard, check the deployment logs to ensure the build completed successfully and the `dist` directory was created.

4. **Force Redeploy**: Try triggering a new deployment by pushing a small change or using the "Retry deployment" button in Cloudflare Pages.

5. **Clear Cache**: Clear your browser cache and try accessing the site in an incognito window.

### Development vs Production Files

- **Development**: `index.html` in root → loads `/src/main.jsx` directly
- **Production**: `dist/index.html` → loads `/assets/index-[hash].js` (built file)

The error indicates the development `index.html` is being served. Ensure Cloudflare Pages is configured to serve from the `dist` directory only.