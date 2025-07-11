#!/bin/bash

# Test script for Interrail Journey Tracker API

echo "🚂 Testing Interrail Journey Tracker API"
echo "========================================"

# Check if server is running
echo "1. Checking server health..."
curl -s http://localhost:3001/health | jq .

echo -e "\n2. Fetching all positions..."
curl -s http://localhost:3001/api/positions | jq .

echo -e "\n3. Testing position creation (localhost only)..."
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"latitude": 41.9028, "longitude": 12.4964, "city": "Rome", "country": "Italy", "notes": "Colosseum visit!"}' \
  http://localhost:3001/api/positions | jq .

echo -e "\n4. Fetching updated positions list..."
curl -s http://localhost:3001/api/positions | jq .

echo -e "\n5. Testing client connection..."
if curl -s -I http://localhost:3000 | head -1 | grep -q "200 OK"; then
    echo "✅ Frontend is accessible at http://localhost:3000"
else
    echo "❌ Frontend is not accessible"
fi

echo -e "\n🎉 API Test Complete!"
echo "Open http://localhost:3000 in your browser to see the interactive map!" 