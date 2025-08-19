#!/bin/bash
# HR Management System API Test Commands
# Test the RESTful API endpoints

BASE_URL="http://localhost:8787/Home/api"
# For production: BASE_URL="https://your-worker.your-subdomain.workers.dev/Home/api"

echo "🧪 Testing HR Management System RESTful API"
echo "============================================="

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: CORS Preflight
echo "2. Testing CORS Preflight..."
curl -X OPTIONS "$BASE_URL/auth/login" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -w "Status: %{http_code}\n\n"

# Test 3: Get Stores (no auth required)
echo "3. Testing Get Stores..."
curl -X GET "$BASE_URL/stores" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: Register (Step 1 - Send Email)
echo "4. Testing Registration (Send Email)..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "TEST001",
    "fullName": "Test User",
    "storeName": "Test Store",
    "password": "testpassword123",
    "phone": "0123456789",
    "email": "test@example.com",
    "position": "NV"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 5: Verify Email (Step 2 - Complete Registration)
echo "5. Testing Email Verification..."
echo "Enter verification code from email (or press Enter to skip):"
read -r VERIFICATION_CODE
if [ -n "$VERIFICATION_CODE" ]; then
  curl -X POST "$BASE_URL/auth/register/verify" \
    -H "Content-Type: application/json" \
    -d "{
      \"employeeId\": \"TEST001\",
      \"verificationCode\": \"$VERIFICATION_CODE\"
    }" \
    -w "\nStatus: %{http_code}\n\n"
fi

# Test 6: Login
echo "6. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "loginEmployeeId": "TEST001",
    "loginPassword": "testpassword123"
  }')

echo "$LOGIN_RESPONSE"

# Extract token from response (requires jq)
if command -v jq &> /dev/null; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
  if [ -n "$TOKEN" ]; then
    echo "🔑 Token extracted: ${TOKEN:0:20}..."
    
    # Test 7: Get User Info (requires auth)
    echo -e "\n7. Testing Get User Info (authenticated)..."
    curl -X GET "$BASE_URL/auth/me" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n\n"
    
    # Test 8: Get Dashboard Stats (requires auth)
    echo "8. Testing Dashboard Stats..."
    curl -X GET "$BASE_URL/dashboard/stats" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n\n"
    
    # Test 9: Get Users List (requires auth)
    echo "9. Testing Users List..."
    curl -X GET "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n\n"
    
    # Test 10: Logout
    echo "10. Testing Logout..."
    curl -X POST "$BASE_URL/auth/logout" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n\n"
  else
    echo "❌ Could not extract token from login response"
  fi
else
  echo "ℹ️  Install 'jq' to automatically test authenticated endpoints"
fi

echo "✅ API Testing Complete!"
echo ""
echo "📋 Quick Test Summary:"
echo "- Health check: Should return 200 with healthy status"
echo "- CORS: Should return 204 with proper headers"
echo "- Stores: Should return 200 with stores array"
echo "- Register: Should return 200 and send verification email"
echo "- Login: Should return 200 with token after email verification"
echo "- Authenticated endpoints: Should work with Bearer token"
echo ""
echo "🚀 Next Steps:"
echo "1. Set up environment variables in wrangler.toml"
echo "2. Configure D1 database with schema.sql"
echo "3. Add SendGrid API key to KV storage"
echo "4. Update ALLOWED_ORIGINS for production"