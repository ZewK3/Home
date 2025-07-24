# Cloudflare HR Management System Deployment Guide

## Prerequisites
1. Install [Node.js](https://nodejs.org/) (v16 or later)
2. Install Wrangler CLI globally: `npm install -g wrangler`
3. Authenticate with Cloudflare: `wrangler auth login`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create D1 Database
```bash
# Create a new D1 database
wrangler d1 create hr-database

# Update wrangler.toml with the database ID from the command output
```

### 3. Create KV Namespace
```bash
# Create KV namespace for storing API keys and session data
wrangler kv:namespace create "KV_STORE"
wrangler kv:namespace create "KV_STORE" --preview

# Update wrangler.toml with the namespace IDs from the command output
```

### 4. Setup Database Schema
```bash
# Execute the database schema (create your tables)
wrangler d1 execute hr-database --file=./schema.sql
```

### 5. Configure Environment Variables
Update `wrangler.toml` with your actual IDs:
- Replace `YOUR_KV_NAMESPACE_ID` with your KV namespace ID
- Replace `YOUR_PREVIEW_KV_NAMESPACE_ID` with your preview KV namespace ID  
- Replace `YOUR_D1_DATABASE_ID` with your D1 database ID

### 6. Deploy to Cloudflare
```bash
# Deploy to development
npm run deploy

# Deploy to production
npm run deploy:production
```

## Available Scripts
- `npm run dev` - Start local development server
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run preview` - Preview locally with local bindings

## Features
- ✅ Professional HR Management Interface
- ✅ Role-based Access Control (AD, QL, AM, NV)
- ✅ Registration Approval System
- ✅ Mobile-Responsive Design
- ✅ Dark Mode Support
- ✅ Corporate Glass Morphism UI
- ✅ D1 Database Integration
- ✅ Email Verification with SendGrid
- ✅ Session Management

## Production URL
After deployment, your application will be available at:
`https://zewk.tocotoco.workers.dev/`

## Support
For issues and questions, please check the repository documentation.