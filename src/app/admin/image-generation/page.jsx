'use client';
import { useState } from 'react';

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  // Test API connectivity
  const testApiConnection = async () => {
    try {
      console.log('Testing Cloudflare Worker API connection...');
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'test connection'
        })
      });
      
      console.log('API Test - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApiStatus(`✅ Cloudflare API Connected: ${data.message}`);
        } else {
          setApiStatus(`⚠️ Cloudflare API Response: ${data.message || 'Unknown response'}`);
        }
      } else {
        const errorText = await response.text();
        setApiStatus(`❌ Cloudflare API Error: ${response.status} - ${errorText.substring(0, 100)}...`);
      }
    } catch (err) {
      setApiStatus(`❌ Connection Failed: ${err.message}`);
    }
  };



  const handleGenerateImages = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim()
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Response error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.imageUrl) {
        // Validate the image data
        const imageUrl = data.imageUrl;
        console.log('Received imageUrl type:', imageUrl.startsWith('data:image/'));
        
        // Check if it's a valid data URL
        if (imageUrl.startsWith('data:image/')) {
          setGeneratedImages([{
            imageBytes: imageUrl.includes('base64,') ? imageUrl.split(',')[1] : null,
            fullImageUrl: imageUrl, // Store the full data URL
            isMock: data.isPlaceholder || false,
            isPlaceholder: data.isPlaceholder || false,
            aiEnhanced: !data.isPlaceholder,
            aiDescription: data.isPlaceholder 
              ? `Placeholder image - Fix Cloudflare Worker for AI generation` 
              : `Generated with Cloudflare AI: ${prompt.trim()}`
          }]);
          
          if (data.isPlaceholder) {
            setError('Cloudflare Worker is not working. Showing placeholder image. Please check your Worker configuration.');
          }
        } else {
          throw new Error('Invalid image format received');
        }
      } else if (data.message) {
        // Handle text responses from worker
        setError(`Worker Response: ${data.message}. Please update your Worker code to generate images.`);
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to generate images');
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageData, index) => {
    try {
      // Convert base64 to blob and download
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-ad-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Advertisement Images</h1>
        <p className="text-gray-600 mb-4">
          Create stunning advertisement images using Cloudflare AI. Perfect for discount promotions, product showcases, and marketing campaigns.
        </p>
        
        {/* API Test Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Cloudflare AI Status</h3>
              <p className="text-sm text-blue-700">{apiStatus || 'Click test to check Cloudflare Worker connection'}</p>
            </div>
            <button
              onClick={testApiConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              🔍 Test Cloudflare API
            </button>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Advertisement Prompt *
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A vibrant discount sale poster with 50% OFF text, modern retail store background, bright colors, professional marketing design"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {prompt.length}/2000 characters
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateImages}
            disabled={loading || !prompt.trim()}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              loading || !prompt.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Images...
              </span>
            ) : (
              '🎨 Generate with Cloudflare AI'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {generatedImages.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="relative group">
                  {image.isMock || image.isPlaceholder ? (
                    // Placeholder or mock image
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      {image.fullImageUrl ? (
                        <img
                          src={image.fullImageUrl}
                          alt={`Generated placeholder ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Placeholder image failed to load:', e);
                            // Fallback to simple colored div
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center" style={{display: 'none'}}>
                        <div className="text-center text-white">
                          <div className="text-4xl mb-2">🎨</div>
                          <p className="text-sm font-medium">Generated Image {index + 1}</p>
                          <p className="text-xs opacity-75 mt-1">Worker Configuration Needed</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Real generated image
                    <img
                      src={image.fullImageUrl || `data:image/png;base64,${image.imageBytes}`}
                      alt={`Generated advertisement ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to display generated image. The image data may be corrupted.');
                      }}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                  )}
                  
                  {/* Download button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(image.imageBytes, index)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-opacity duration-200 hover:bg-gray-100"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Image {index + 1}</span>
                    <span>Cloudflare AI</span>
                  </div>
                  {image.isPlaceholder && (
                    <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      ⚠️ Placeholder Image - Cloudflare Worker needs configuration
                    </div>
                  )}
                  {image.isMock && !image.isPlaceholder && (
                    <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      {image.aiEnhanced ? 'AI-Enhanced Demo Mode' : 'Demo Mode - Connect to Cloudflare API for real generation'}
                    </div>
                  )}
                  {image.aiEnhanced && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✨ Enhanced with Google Gemini AI
                    </div>
                  )}
                  {image.aiDescription && (
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                          View AI Description
                        </summary>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800 max-h-24 overflow-y-auto">
                          {image.aiDescription}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Regenerate Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateImages}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Generate New Variations
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Prompt Writing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">For Discount Ads:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Include specific discount percentage</li>
              <li>• Mention &quot;sale&quot;, &quot;discount&quot;, &quot;offer&quot;</li>
              <li>• Add &quot;bright colors&quot;, &quot;eye-catching&quot;</li>
              <li>• Specify store type (retail, fashion, electronics)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Style Keywords:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• &quot;professional marketing design&quot;</li>
              <li>• &quot;modern advertisement poster&quot;</li>
              <li>• &quot;vibrant promotional banner&quot;</li>
              <li>• &quot;high-quality commercial style&quot;</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}