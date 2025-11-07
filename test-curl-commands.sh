#!/bin/bash

# Test script for Cloudflare Worker Image Generation
# Run this with: bash test-curl-commands.sh

CLOUDFLARE_WORKER_URL="https://image-api.saman-khalid1053.workers.dev"
API_KEY="1234567890"

echo "🧪 Testing Cloudflare Worker with curl commands..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
curl -X GET "${CLOUDFLARE_WORKER_URL}/health" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

# Test 2: Status Check
echo "2️⃣ Testing status endpoint..."
curl -X GET "${CLOUDFLARE_WORKER_URL}/status" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

# Test 3: Image Generation
echo "3️⃣ Testing image generation..."
curl -X POST "${CLOUDFLARE_WORKER_URL}/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "numberOfImages": 2,
    "aspectRatio": "16:9"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

# Test 4: Test with different prompt
echo "4️⃣ Testing with different prompt..."
curl -X POST "${CLOUDFLARE_WORKER_URL}/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
    "prompt": "Luxury car advertisement",
    "numberOfImages": 1,
    "aspectRatio": "1:1"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

echo "✅ All tests completed!"
