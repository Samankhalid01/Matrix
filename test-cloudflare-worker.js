/**
 * Test script for Cloudflare Worker Image Generation
 * Run this with: node test-cloudflare-worker.js
 */

const CLOUDFLARE_WORKER_URL = 'https://image-api.saman-khalid1053.workers.dev';
const API_KEY = '1234567890';

async function testCloudflareWorker() {
  console.log('🧪 Testing Cloudflare Worker Image Generation...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${CLOUDFLARE_WORKER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test 2: Status Check
    console.log('2️⃣ Testing status endpoint...');
    const statusResponse = await fetch(`${CLOUDFLARE_WORKER_URL}/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status check:', statusData);
    console.log('');

    // Test 3: Image Generation
    console.log('3️⃣ Testing image generation...');
    const generateResponse = await fetch(`${CLOUDFLARE_WORKER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        numberOfImages: 2,
        aspectRatio: '16:9'
      })
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Image generation successful!');
      console.log('📊 Response data:', {
        success: generateData.success,
        numberOfImages: generateData.data?.numberOfImages,
        aspectRatio: generateData.data?.aspectRatio,
        note: generateData.data?.note
      });
    } else {
      console.log('❌ Image generation failed:', generateResponse.status);
      const errorText = await generateResponse.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCloudflareWorker();
