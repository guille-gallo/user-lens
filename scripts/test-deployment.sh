#!/bin/bash

# Post-deployment test script for Vercel Redis endpoints
# Run this after deploying to Vercel to test the API endpoints

BASE_URL="https://user-lens.vercel.app"

echo "🚀 Testing Redis API endpoints on $BASE_URL"
echo "=================================================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq .
echo ""

# Test Redis connection
echo "2. Testing Redis connection..."
curl -s "$BASE_URL/api/test-redis" | jq .
echo ""

# Test seed endpoint
echo "3. Testing seed endpoint..."
curl -s "$BASE_URL/api/seed" | jq .
echo ""

# Test users endpoint
echo "4. Testing users endpoint..."
curl -s "$BASE_URL/api/users" | jq .
echo ""

# Test specific user
echo "5. Testing specific user endpoint..."
curl -s "$BASE_URL/api/users/1" | jq .
echo ""

echo "✅ API testing complete!"
echo ""
echo "If any endpoints failed, check:"
echo "1. Redis URL is configured in Vercel environment variables"
echo "2. Redis database is accessible from Vercel"
echo "3. Run the seed endpoint if users data is empty"
