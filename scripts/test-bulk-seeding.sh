#!/bin/bash

# Test script for bulk seeding endpoints
BASE_URL="https://user-lens-git-chore-jsonser-266655-guillermos-projects-cc2deb38.vercel.app"

echo "🚀 Testing bulk seeding endpoints on $BASE_URL"
echo "=================================================="

echo "1. Current user count in database:"
curl -s "$BASE_URL/api/test-redis" | jq '.users_in_db'
echo ""

echo "2. Testing seed-faker endpoint (this may take 30-60 seconds for 10K users):"
echo "   Generating 10,000 realistic users with faker.js..."
curl -s "$BASE_URL/api/seed-faker?force=true" | jq .
echo ""

echo "3. Verifying user count after seeding:"
curl -s "$BASE_URL/api/test-redis" | jq '.users_in_db'
echo ""

echo "4. Testing users endpoint with pagination:"
curl -s "$BASE_URL/api/users?_page=1&_limit=5" | jq 'length'
echo " ^^ Should show 5 users"

echo ""
echo "5. Testing search functionality:"
curl -s "$BASE_URL/api/users?q=john&_limit=3" | jq 'length'
echo " ^^ Should show users matching 'john'"

echo ""
echo "✅ Bulk seeding test complete!"
echo ""
echo "Available endpoints:"
echo "- /api/seed-faker?force=true&count=1000  # Generate N users with faker"
echo "- /api/seed-bulk?force=true&count=5000   # Generate N users (simple)"
echo "- /api/seed?force=true                   # Try to load from db.json or fallback"
