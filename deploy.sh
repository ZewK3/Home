#!/bin/bash

# HR Management System Deployment Script
echo "🚀 Starting HR Management System deployment to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is authenticated
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not authenticated with Cloudflare. Please run:"
    echo "   wrangler auth login"
    exit 1
fi

echo "✅ Authentication verified"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if D1 database exists
echo "🗄️ Checking D1 database configuration..."
if [ ! -f "schema.sql" ]; then
    echo "⚠️ No schema.sql found. Creating basic employee table schema..."
    cat > schema.sql << EOF
CREATE TABLE IF NOT EXISTS employees (
    employeeId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phoneNumber TEXT,
    position TEXT DEFAULT 'NV',
    store TEXT,
    status TEXT DEFAULT 'Chờ duyệt',
    verificationCode TEXT,
    isVerified BOOLEAN DEFAULT 0,
    isApproved BOOLEAN DEFAULT 0,
    registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedBy TEXT,
    approvalDate DATETIME
);

CREATE INDEX idx_email ON employees(email);
CREATE INDEX idx_position ON employees(position);
CREATE INDEX idx_status ON employees(status);
EOF
fi

# Deploy to Cloudflare
echo "🌐 Deploying to Cloudflare Workers..."
wrangler deploy

echo "✅ Deployment completed!"
echo "🎉 Your HR Management System is now live!"
echo "📱 Access your application at: https://zewk.tocotoco.workers.dev/"

echo ""
echo "📋 Next steps:"
echo "1. Set up your D1 database schema: wrangler d1 execute hr-database --file=./schema.sql"
echo "2. Configure your KV namespace for storing API keys"
echo "3. Add your SendGrid API key to KV storage"
echo "4. Test the registration and login functionality"