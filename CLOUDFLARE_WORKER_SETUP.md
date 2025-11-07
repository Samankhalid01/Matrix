# Cloudflare Worker Image Generation Setup

## Overview
This guide helps you set up image generation using Cloudflare Workers with your API key `1234567890`.

## Files Created/Modified

### 1. Cloudflare Worker (`cloudflare-worker.js`)
- Main worker script for image generation
- Handles CORS, health checks, and image generation
- Uses your API key: `1234567890`

### 2. Modified Next.js API (`src/app/api/imagen/route.js`)
- Updated to use Cloudflare Worker instead of Google Imagen
- Includes fallback to local mock images
- Uses your worker URL: `https://image-api.saman-khalid1053.workers.dev`

### 3. Test Scripts
- `test-cloudflare-worker.js` - Node.js test script
- `test-curl-commands.sh` - Bash curl test script

## Setup Instructions

### Step 1: Deploy Cloudflare Worker

1. **Copy the worker code:**
   ```bash
   # Copy the content from cloudflare-worker.js
   ```

2. **In Cloudflare Workers dashboard:**
   - Go to your worker: `image-api.saman-khalid1053.workers.dev`
   - Replace the existing code with the content from `cloudflare-worker.js`
   - Click "Save and Deploy"

### Step 2: Test the Worker

#### Option A: Using Node.js test script
```bash
node test-cloudflare-worker.js
```

#### Option B: Using curl commands
```bash
# Make the script executable
chmod +x test-curl-commands.sh

# Run the tests
bash test-curl-commands.sh
```

#### Option C: Manual curl tests

**Health Check:**
```bash
curl -X GET "https://image-api.saman-khalid1053.workers.dev/health"
```

**Status Check:**
```bash
curl -X GET "https://image-api.saman-khalid1053.workers.dev/status"
```

**Image Generation:**
```bash
curl -X POST "https://image-api.saman-khalid1053.workers.dev/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1234567890" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "numberOfImages": 2,
    "aspectRatio": "16:9"
  }'
```

### Step 3: Test Your Next.js Application

1. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoint:**
   ```bash
   # Health check
   curl -X GET "http://localhost:3000/api/imagen"
   
   # Image generation
   curl -X POST "http://localhost:3000/api/imagen" \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Luxury car advertisement",
       "numberOfImages": 1,
       "aspectRatio": "1:1"
     }'
   ```

3. **Test in browser:**
   - Go to `http://localhost:3000/admin/image-generation`
   - Try generating images with different prompts

## Expected Responses

### Health Check Response:
```json
{
  "success": true,
  "message": "Cloudflare Image Generation Worker is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "apiKeyPresent": true,
  "endpoints": {
    "health": "/health",
    "generate": "/generate",
    "status": "/status"
  }
}
```

### Image Generation Response:
```json
{
  "success": true,
  "data": {
    "prompt": "A beautiful sunset over mountains",
    "images": [
      {
        "imageBytes": "base64_encoded_image_data",
        "prompt": "A beautiful sunset over mountains",
        "generatedAt": "2024-01-01T00:00:00.000Z",
        "index": 0,
        "isMock": true,
        "aspectRatio": "16:9"
      }
    ],
    "numberOfImages": 2,
    "aspectRatio": "16:9",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "note": "Generated using Cloudflare Worker - Mock images for testing"
  }
}
```

## Troubleshooting

### Common Issues:

1. **Worker not accessible:**
   - Check if the worker is deployed
   - Verify the URL is correct
   - Check Cloudflare dashboard for errors

2. **CORS errors:**
   - The worker includes CORS headers
   - Check browser console for specific errors

3. **API key issues:**
   - Verify the API key `1234567890` is correct
   - Check if the worker is using the key properly

4. **Image generation fails:**
   - The worker currently generates mock images
   - To use real AI services, modify the `generateMockImage` function
   - Integrate with OpenAI DALL-E, Stability AI, or other services

## Next Steps

1. **Deploy the worker** with the provided code
2. **Test with curl commands** to verify it's working
3. **Update your Next.js app** and test the integration
4. **Replace mock images** with real AI service integration if needed

## Integration with Real AI Services

To use real image generation instead of mock images, modify the `generateMockImage` function in the Cloudflare Worker to call:

- **OpenAI DALL-E API**
- **Stability AI API**
- **Midjourney API**
- **Other AI image generation services**

The worker is designed to be easily extensible for real AI services.
