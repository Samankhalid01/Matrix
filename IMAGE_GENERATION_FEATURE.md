# Image Generation Feature - FE-3

## Overview
This feature adds AI-powered image generation capabilities to the Matrix admin dashboard using Google's Imagen API. Administrators can generate high-quality advertisement images from text prompts.

## Features
- 🎨 Text-to-image generation using Google Imagen AI
- 📱 Responsive design with mobile support
- 🖼️ Multiple aspect ratio options (1:1, 3:4, 4:3, 9:16, 16:9)
- 🔢 Generate 1-4 images per request
- 📥 Download generated images as PNG files
- 🎯 Optimized for advertisement and promotional content
- 🔄 Regenerate variations with same prompt

## Implementation Details

### API Endpoint: `/api/imagen`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "prompt": "string (required, max 2000 chars)",
    "numberOfImages": "number (1-4, default: 1)",
    "aspectRatio": "string (1:1|3:4|4:3|9:16|16:9, default: 1:1)",
    "imageSize": "string (1K|2K, default: 1K)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "prompt": "string",
      "images": [
        {
          "imageBytes": "base64 string",
          "prompt": "string",
          "generatedAt": "ISO date string",
          "index": "number",
          "isMock": "boolean (for development mode)"
        }
      ],
      "numberOfImages": "number",
      "aspectRatio": "string",
      "generatedAt": "ISO date string"
    }
  }
  ```

### Page Location: `/admin/image-generation`
- Added to admin navigation menu as "Generate Ad Images"
- Full-featured UI with form controls and image gallery
- Real-time validation and error handling
- Loading states and progress indicators

## Configuration

### Google Imagen API
- **API Key**: Configured in `/src/api/imagen/route.js`
- **Model**: `imagen-3.0-generate-001`
- **Safety**: Configured with adult content filtering
- **Fallback**: Mock image generation for development

### Environment Variables (Optional)
For production deployment, consider moving the API key to environment variables:
```env
GOOGLE_IMAGEN_API_KEY=your_api_key_here
```

## Usage

### For Administrators:
1. Navigate to Admin Dashboard → "Generate Ad Images"
2. Enter a descriptive prompt for your advertisement
3. Select number of images (1-4)
4. Choose aspect ratio based on where you'll use the image
5. Click "Generate Advertisement Images"
6. Download generated images using the download button

### Prompt Writing Tips:
- **Be specific**: Include details about colors, style, text content
- **For discounts**: Mention percentage, sale terms, urgency
- **Style keywords**: "professional", "modern", "vibrant", "eye-catching"
- **Context**: Specify store type, product category, target audience

### Example Prompts:
```
"A vibrant 50% OFF sale banner for electronics store, modern design with bright blue and red colors, professional marketing style"

"Black Friday discount poster with 70% OFF text, luxury fashion boutique style, elegant gold and black design"

"Summer clearance sale advertisement, beach theme with palm trees, bright colors, family-friendly retail store"
```

## Technical Architecture

### Frontend (`/src/app/admin/image-generation/page.jsx`)
- React functional component with hooks
- Form validation and state management
- Image display grid with download functionality
- Responsive Tailwind CSS styling
- Error handling and loading states

### Backend (`/src/api/imagen/route.js`)
- Next.js API route handler
- Google Imagen API integration
- Request validation and error handling
- Base64 image data processing
- Mock data fallback for development

### Navigation (`/src/components/admin/DashboardLayout.jsx`)
- Added "Generate Ad Images" menu item
- Integrated with existing admin navigation

## Development Mode
The feature includes a mock mode that returns placeholder images when the Google API is unavailable. This allows for:
- Local development without API costs
- UI testing and validation
- Demonstration of the complete workflow

## Testing

### Manual Testing:
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin/image-generation`
3. Test form validation, image generation, and download functionality
4. Try different prompts and configurations

### API Testing:
Use the included test script (`test-imagen-api.js`) to verify API functionality:
```javascript
// In browser console
testImageGeneration();
```

## Files Created/Modified

### New Files:
- `/src/api/imagen/route.js` - Imagen API endpoint
- `/src/app/admin/image-generation/page.jsx` - Image generation page
- `test-imagen-api.js` - API testing script
- `IMAGE_GENERATION_FEATURE.md` - This documentation

### Modified Files:
- `/src/components/admin/DashboardLayout.jsx` - Added navigation menu item

## Future Enhancements

### Potential Improvements:
- **Image History**: Save and manage previously generated images
- **Templates**: Pre-defined prompt templates for common ad types
- **Batch Processing**: Generate multiple variations automatically
- **Integration**: Direct upload to product catalog or social media
- **Analytics**: Track usage and popular prompts
- **Advanced Options**: Fine-tune generation parameters

### API Enhancements:
- Environment variable configuration
- Rate limiting and usage tracking
- Image caching and storage integration
- Error logging and monitoring

## Security Considerations
- API key is currently hardcoded (move to environment variables for production)
- Input validation prevents prompt injection
- Generated images include Google's SynthID watermark
- Content filtering enabled for appropriate business use

## Cost Considerations
- Google Imagen API charges per image generation
- Consider implementing usage limits or quotas
- Monitor API usage for cost control
- Use mock mode during development to reduce costs

## Support
For issues or questions about this feature:
1. Check the browser console for error messages
2. Verify API connectivity and authentication
3. Review prompt guidelines and character limits
4. Test with simpler prompts if generation fails

---

**Feature Status**: ✅ Complete and Ready for Testing
**Version**: 1.0
**Last Updated**: September 27, 2025