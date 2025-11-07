/**
 * Deployment helper for Cloudflare Worker
 * This script helps verify the worker deployment
 */

const CLOUDFLARE_WORKER_URL = 'https://image-api.saman-khalid1053.workers.dev';
const API_KEY = '1234567890';

async function verifyDeployment() {
  console.log('🚀 Verifying Cloudflare Worker Deployment...\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${CLOUDFLARE_WORKER_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Status Check', 
      url: `${CLOUDFLARE_WORKER_URL}/status`,
      method: 'GET'
    },
    {
      name: 'Image Generation Test',
      url: `${CLOUDFLARE_WORKER_URL}/generate`,
      method: 'POST',
      body: {
        prompt: 'Test image generation',
        numberOfImages: 1,
        aspectRatio: '1:1'
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          ...test.headers
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 Deployment verification complete!');
  console.log('\n📋 Next steps:');
  console.log('1. If all tests pass, your worker is ready');
  console.log('2. Test your Next.js app: npm run dev');
  console.log('3. Visit: http://localhost:3000/admin/image-generation');
  console.log('4. Try generating images with different prompts');
}

// Run verification
verifyDeployment();
