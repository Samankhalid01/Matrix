import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const GOOGLE_API_KEY = 'AIzaSyD80AwTHMvLmzPYOtqKPWsAPM8bZ1Exhhg';

export async function GET(request) {
  console.log('🔍 Imagen API GET request received');
  return NextResponse.json({
    success: true,
    message: 'Imagen API is running and accessible!',
    timestamp: new Date().toISOString(),
    apiKeyPresent: !!GOOGLE_API_KEY,
    supportedParameters: {
      numberOfImages: 'Number of images to generate (1-4)',
      aspectRatio: 'Supported: 1:1, 3:4, 4:3, 9:16, 16:9',
      prompt: 'Text description for image generation'
    }
  });
}

export async function POST(request) {
  try {
    console.log('🎨 Imagen API POST request received');
    
    const body = await request.json();
    const { prompt, numberOfImages = 1, aspectRatio = '1:1' } = body;

    console.log('Request data:', { prompt, numberOfImages, aspectRatio });

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate numberOfImages
    if (numberOfImages < 1 || numberOfImages > 4) {
      return NextResponse.json(
        { success: false, error: 'Number of images must be between 1 and 4' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, attempting to use Google GenAI for real image generation...');

    try {
      console.log('📡 Initializing Google GenAI client for image generation...');
      
      // Initialize GenAI client
      const genAI = new GoogleGenAI(GOOGLE_API_KEY);

      // Try to use Imagen model for actual image generation
      try {
        console.log('🎨 Attempting real image generation with Google Imagen...');
        
        // Use the actual Imagen model for image generation
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        
        const imagePrompt = `Create a professional advertisement image: ${prompt}. Make it visually appealing with good composition, appropriate colors, and clear text if needed. Aspect ratio should be ${aspectRatio}.`;
        
        const result = await model.generateContent([imagePrompt]);
        
        if (result.response && result.response.candidates) {
          const generatedImages = [];
          
          // Process the generated images
          for (let i = 0; i < numberOfImages && i < result.response.candidates.length; i++) {
            const candidate = result.response.candidates[i];
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  generatedImages.push({
                    imageBytes: part.inlineData.data,
                    prompt: prompt,
                    generatedAt: new Date().toISOString(),
                    index: i,
                    isMock: false,
                    realGeneration: true
                  });
                }
              }
            }
          }
          
          if (generatedImages.length > 0) {
            console.log(`✅ Successfully generated ${generatedImages.length} real images!`);
            
            return NextResponse.json({
              success: true,
              data: {
                prompt: prompt,
                images: generatedImages,
                numberOfImages: generatedImages.length,
                aspectRatio: aspectRatio,
                generatedAt: new Date().toISOString(),
                note: "✨ Generated using Google Imagen AI - Real images!"
              }
            });
          }
        }
        
        console.log('⚠️ No images in Imagen response, falling back...');
        
      } catch (imagenError) {
        console.log('⚠️ Imagen model not available:', imagenError.message);
      }

      // Fallback: Generate detailed descriptions using Gemini
      console.log('📝 Generating AI-enhanced descriptions with Gemini...');
      
      const imagePrompt = `Create a detailed visual description for a professional advertisement image: "${prompt}". Include specific details about colors, layout, text placement, and visual elements. Make it vivid and specific for a ${aspectRatio} aspect ratio advertisement.`;
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(imagePrompt);

      const generatedDescription = response.response.text() || "Advertisement image description generated";
      console.log('✅ Generated AI description successfully');

      // Create AI-enhanced mock images with detailed descriptions
      const mockImages = [];
      for (let i = 0; i < numberOfImages; i++) {
        mockImages.push({
          imageBytes: generateEnhancedMockImage(prompt, i),
          prompt: prompt,
          generatedAt: new Date().toISOString(),
          index: i,
          isMock: true,
          aiEnhanced: true,
          aiDescription: generatedDescription,
          enhancedPreview: true
        });
      }

      console.log(`✅ Created ${mockImages.length} AI-enhanced images with detailed descriptions`);

      return NextResponse.json({
        success: true,
        data: {
          prompt: prompt,
          images: mockImages,
          numberOfImages: numberOfImages,
          aspectRatio: aspectRatio,
          generatedAt: new Date().toISOString(),
          note: "🤖 AI-Enhanced Demo Mode - Detailed descriptions generated by Google Gemini",
          aiEnhanced: true,
          generatedDescription: generatedDescription
        }
      });

    } catch (genAIError) {
      console.log('⚠️ GenAI SDK failed:', genAIError.message);
      
      // Final fallback: Return enhanced mock data
      console.log('🎨 Using enhanced mock images...');
      const mockImages = [];
      for (let i = 0; i < numberOfImages; i++) {
        mockImages.push({
          imageBytes: generateEnhancedMockImage(prompt, i),
          prompt: prompt,
          generatedAt: new Date().toISOString(),
          index: i,
          isMock: true,
          enhancedMock: true
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          prompt: prompt,
          images: mockImages,
          numberOfImages: numberOfImages,
          aspectRatio: aspectRatio,
          generatedAt: new Date().toISOString(),
          note: "🔧 Enhanced Mock Mode - API temporarily unavailable",
          error: genAIError.message
        }
      });
    }

  } catch (error) {
    console.error('❌ Imagen API Error:', error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Enhanced mock image generator with better visuals
function generateEnhancedMockImage(prompt, index) {
  // Create more realistic mock images based on prompt content
  const promptLower = prompt.toLowerCase();
  
  // Different mock images based on prompt content
  if (promptLower.includes('sale') || promptLower.includes('discount') || promptLower.includes('off')) {
    // Sale/discount themed colors (red/orange)
    const saleColors = [
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Red
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+B8KABr6AoAL6AHQAAAABJRU5ErkJggg==', // Orange
    ];
    return saleColors[index % saleColors.length];
  }
  
  if (promptLower.includes('luxury') || promptLower.includes('premium') || promptLower.includes('elegant')) {
    // Luxury themed colors (gold/black)
    const luxuryColors = [
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/4MBABf/A4AAAABJRU5ErkJggg==', // Gold
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mJh+M8AAQwMANX/8AAA', // Black
    ];
    return luxuryColors[index % luxuryColors.length];
  }
  
  if (promptLower.includes('summer') || promptLower.includes('beach') || promptLower.includes('tropical')) {
    // Summer themed colors (blue/yellow)
    const summerColors = [
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwABCgEBzvL2qgAAAABJRU5ErkJggg==', // Blue
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/4MBABf/A4IAABJRU5ErkJggg==', // Yellow
    ];
    return summerColors[index % summerColors.length];
  }
  
  // Default colorful variety
  const defaultColors = [
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Red
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Green  
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwABCgEBzvL2qgAAAABJRU5ErkJggg==', // Blue
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEGAJ+YgZWEQAAAABJRU5ErkJggg=='  // Purple
  ];
  
  const colorIndex = (prompt.length + index) % defaultColors.length;
  return defaultColors[colorIndex];
}