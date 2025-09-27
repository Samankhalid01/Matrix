// Test script for the Imagen API
// This can be run to test the API endpoint functionality

const testImageGeneration = async () => {
  const testData = {
    prompt: "A vibrant discount sale poster with 50% OFF text, modern retail store background, bright colors, professional marketing design",
    numberOfImages: 2,
    aspectRatio: "1:1"
  };

  try {
    console.log('Testing Imagen API with prompt:', testData.prompt);
    
    // This would be the actual API call in a browser environment
    const response = await fetch('/api/imagen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API Test Successful!');
      console.log(`Generated ${result.data.images.length} images`);
      console.log('Aspect Ratio:', result.data.aspectRatio);
      console.log('Generated At:', result.data.generatedAt);
      
      result.data.images.forEach((image, index) => {
        console.log(`Image ${index + 1}:`, {
          hasImageData: !!image.imageBytes,
          isMock: image.isMock,
          prompt: image.prompt
        });
      });
    } else {
      console.error('❌ API Test Failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
};

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testImageGeneration;
}

// For browser testing
if (typeof window !== 'undefined') {
  window.testImageGeneration = testImageGeneration;
}

console.log('Image Generation API Test Script Ready');
console.log('To test: run testImageGeneration() function');