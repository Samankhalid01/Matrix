'use client';
import { useState } from 'react';
import { 
  FiImage, 
  FiDownload, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiZap,
  FiLayers,
  FiTrendingUp
} from 'react-icons/fi';

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
    <div className="p-6 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
            <FiImage className="text-purple-400" />
            AI Advertisement Generator
          </h1>
          <p className="text-gray-300 mt-3">
            Create stunning advertisement images using Cloudflare AI
          </p>
        </div>
      </div>

      {/* API Status Card */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2 mb-2">
              <FiZap className="text-purple-400" />
              Cloudflare AI Status
            </h3>
            <p className="text-gray-300 text-sm">
              {apiStatus || 'Click test to check Cloudflare Worker connection'}
            </p>
          </div>
          <button
            onClick={testApiConnection}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105"
          >
            <FiCheckCircle className="w-5 h-5" />
            Test API Connection
          </button>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiLayers className="text-purple-400" />
          Create Your Advertisement
        </h2>
        
        <div className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4" />
              Advertisement Prompt *
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A vibrant discount sale poster with 50% OFF text, modern retail store background, bright colors, professional marketing design"
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-400 mt-2">
              {prompt.length}/2000 characters
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateImages}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 px-6 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading || !prompt.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-purple-500/50 hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Images...
              </>
            ) : (
              <>
                <FiImage className="w-5 h-5" />
                Generate with Cloudflare AI
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiImage className="text-purple-400" />
            Generated Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((image, index) => (
              <div key={index} className="bg-gray-700/30 rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="relative group">
                  {image.isMock || image.isPlaceholder ? (
                    <div className="w-full h-64 rounded-xl overflow-hidden">
                      {image.fullImageUrl ? (
                        <img
                          src={image.fullImageUrl}
                          alt={`Generated placeholder ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Placeholder image failed to load:', e);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center" style={{display: 'none'}}>
                        <div className="text-center text-white">
                          <FiImage className="w-16 h-16 mx-auto mb-3" />
                          <p className="text-sm font-medium">Generated Image {index + 1}</p>
                          <p className="text-xs opacity-75 mt-1">Worker Configuration Needed</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={image.fullImageUrl || `data:image/png;base64,${image.imageBytes}`}
                      alt={`Generated advertisement ${index + 1}`}
                      className="w-full h-64 object-cover rounded-xl"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to display generated image. The image data may be corrupted.');
                      }}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(image.imageBytes, index)}
                      className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-105"
                    >
                      <FiDownload className="w-5 h-5" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span className="font-semibold">Image {index + 1}</span>
                    <span className="text-purple-400">Cloudflare AI</span>
                  </div>
                  {image.isPlaceholder && (
                    <div className="text-xs text-orange-300 bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-500/30 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      Placeholder Image - Cloudflare Worker needs configuration
                    </div>
                  )}
                  {image.isMock && !image.isPlaceholder && (
                    <div className="text-xs text-orange-300 bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-500/30">
                      {image.aiEnhanced ? 'AI-Enhanced Demo Mode' : 'Demo Mode - Connect to Cloudflare API for real generation'}
                    </div>
                  )}
                  {image.aiEnhanced && (
                    <div className="text-xs text-green-300 bg-green-900/20 px-3 py-2 rounded-lg border border-green-500/30 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4" />
                      Enhanced with Google Gemini AI
                    </div>
                  )}
                  {image.aiDescription && (
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-purple-400 hover:text-purple-300 font-medium">
                          View AI Description
                        </summary>
                        <div className="mt-2 p-3 bg-purple-900/20 rounded-lg text-purple-300 max-h-24 overflow-y-auto border border-purple-500/20">
                          {image.aiDescription}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateImages}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-500/50 flex items-center gap-2 mx-auto hover:scale-105"
            >
              <FiRefreshCw className="w-5 h-5" />
              Generate New Variations
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiZap className="text-purple-400" />
          Prompt Writing Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-purple-500/20">
            <h4 className="font-bold text-purple-400 mb-3">For Discount Ads:</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Include specific discount percentage
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Mention &quot;sale&quot;, &quot;discount&quot;, &quot;offer&quot;
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Add &quot;bright colors&quot;, &quot;eye-catching&quot;
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Specify store type (retail, fashion, electronics)
              </li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-purple-500/20">
            <h4 className="font-bold text-purple-400 mb-3">Style Keywords:</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                &quot;professional marketing design&quot;
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                &quot;modern advertisement poster&quot;
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                &quot;vibrant promotional banner&quot;
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                &quot;high-quality commercial style&quot;
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}