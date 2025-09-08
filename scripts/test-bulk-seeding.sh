#!/bin/bash

# Test script for bulk seeding endpoints
BASE_URL="https://user-lens-git-chore-jsonser-266655-guillermos-projects-cc2deb38.vercel.app"

echo "🚀 Testing Redis API endpoints on $BASE_URL"
echo "=================================================="

echo "1. Basic health check:"
curl -s "$BASE_URL/api/health" | jq '.status, .environment.node_version'
echo ""

echo "2. Full health check with Redis:"
curl -s "$BASE_URL/api/health?check=full" | jq '.redis.users_in_db // "Redis not connected"'
echo ""

echo "3. Seeding database with 10,000 users (this may take 30-60 seconds):"
echo "   Generating realistic users with faker.js..."
curl -s "$BASE_URL/api/seed?force=true&source=generate&count=10000" | jq '{message, user_count, data_source, faker_available}'
echo ""

echo "4. Verifying user count after seeding:"
curl -s "$BASE_URL/api/health?check=full" | jq '.redis.users_in_db'
echo ""

echo "5. Testing users endpoint with pagination:"
curl -s "$BASE_URL/api/users?_page=1&_limit=5" | jq 'length'
echo " ^^ Should show 5 users"

echo ""
echo "6. Testing search functionality:"
curl -s "$BASE_URL/api/users?q=john&_limit=3" | jq 'length'
echo " ^^ Should show users matching 'john'"

echo ""
echo "✅ Bulk seeding test complete!"
echo ""
echo "Available endpoints (5 total - under Vercel limit):"
echo "- /api/users                      # CRUD operations"
echo "- /api/users/[id]                 # Individual user operations"
echo "- /api/notifications              # Notifications"
echo "- /api/seed                       # Unified seeding (file/generate/fallback)"
echo "- /api/health                     # Health check & diagnostics"
echo ""
echo "Seed parameters:"
echo "- ?force=true                     # Force re-seed"
echo "- ?source=generate&count=10000    # Generate 10K users"
echo "- ?source=file                    # Try to load from db.json"
echo "- ?seed=12345                     # Reproducible data"
