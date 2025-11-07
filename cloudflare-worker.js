/**
 * Cloudflare Worker for Image Generation
 * This worker handles image generation requests and can integrate with various AI services
 */

// Your API key - replace with your actual key
const API_KEY = '1234567890';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check endpoint
      if (path === '/health' || path === '/') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Cloudflare Image Generation Worker is running!',
          timestamp: new Date().toISOString(),
          apiKeyPresent: !!API_KEY,
          endpoints: {
            health: '/health',
            generate: '/generate',
            status: '/status'
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Image generation endpoint
      if (path === '/generate' && request.method === 'POST') {
        return await handleImageGeneration(request);
      }

      // Status endpoint
      if (path === '/status') {
        return new Response(JSON.stringify({
          status: 'active',
          apiKey: API_KEY ? 'configured' : 'missing',
          timestamp: new Date().toISOString(),
          worker: 'image-generation-worker'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Endpoint not found',
        availableEndpoints: ['/health', '/generate', '/status']
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};

async function handleImageGeneration(request) {
  try {
    const body = await request.json();
    const { prompt, numberOfImages = 1, aspectRatio = '1:1' } = body;

    console.log('Image generation request:', { prompt, numberOfImages, aspectRatio });

    // Validate input
    if (!prompt) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Prompt is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (numberOfImages < 1 || numberOfImages > 4) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Number of images must be between 1 and 4'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // For now, we'll create mock images since we need to integrate with an actual AI service
    // You can replace this with calls to OpenAI DALL-E, Stability AI, or other services
    const generatedImages = [];
    
    for (let i = 0; i < numberOfImages; i++) {
      generatedImages.push({
        imageBytes: generateMockImage(prompt, i, aspectRatio),
        prompt: prompt,
        generatedAt: new Date().toISOString(),
        index: i,
        isMock: true,
        aspectRatio: aspectRatio
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        prompt: prompt,
        images: generatedImages,
        numberOfImages: numberOfImages,
        aspectRatio: aspectRatio,
        generatedAt: new Date().toISOString(),
        note: "Generated using Cloudflare Worker - Mock images for testing"
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate images',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

function generateMockImage(prompt, index, aspectRatio) {
  // Create different mock images based on prompt content
  const promptLower = prompt.toLowerCase();
  
  // Different color schemes based on prompt content
  let colorScheme;
  if (promptLower.includes('sale') || promptLower.includes('discount')) {
    colorScheme = ['#FF4444', '#FF6666', '#FF8888']; // Red tones
  } else if (promptLower.includes('luxury') || promptLower.includes('premium')) {
    colorScheme = ['#FFD700', '#FFA500', '#FF8C00']; // Gold tones
  } else if (promptLower.includes('nature') || promptLower.includes('green')) {
    colorScheme = ['#00AA00', '#00CC00', '#00EE00']; // Green tones
  } else if (promptLower.includes('ocean') || promptLower.includes('blue')) {
    colorScheme = ['#0066CC', '#0088EE', '#00AAFF']; // Blue tones
  } else {
    colorScheme = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']; // Rainbow
  }
  
  const color = colorScheme[index % colorScheme.length];
  
  // Create a simple colored rectangle as mock image
  // In a real implementation, you would call an AI service here
  const mockImageData = createColoredRectangle(color, aspectRatio);
  
  return mockImageData;
}

function createColoredRectangle(color, aspectRatio) {
  // This is a simplified mock - in reality you'd generate actual images
  // For now, return a base64 encoded 1x1 pixel of the specified color
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  
  // Convert to base64 (simplified)
  return btoa(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`);
}
