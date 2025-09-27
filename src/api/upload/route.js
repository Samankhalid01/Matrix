import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '../lib/cloudinary';

export async function POST(request) {
  try {
    const data = await request.formData();
    const files = data.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No files uploaded' 
      }, { status: 400 });
    }

    if (files.length > 4) {
      return NextResponse.json({ 
        success: false, 
        error: 'Maximum 4 images allowed' 
      }, { status: 400 });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          success: false, 
          error: `Invalid file type for ${file.name}. Only JPEG, PNG, GIF, and WebP are allowed.` 
        }, { status: 400 });
      }
      
      if (file.size > maxSize) {
        return NextResponse.json({ 
          success: false, 
          error: `File ${file.name} is too large. Maximum 5MB allowed.` 
        }, { status: 400 });
      }
    }
    
    const uploadedImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Cloudinary
      const publicId = `matrix/products/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`;
      const result = await uploadToCloudinary(buffer, { 
        public_id: publicId,
        folder: 'matrix/products'
      });
      
      uploadedImages.push({
        url: result.secure_url,
        alt: file.name,
        isPrimary: i === 0,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      images: uploadedImages 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}